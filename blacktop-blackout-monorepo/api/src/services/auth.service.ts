import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { AuthApi, User, Logger } from '@blacktop-blackout-monorepo/shared-types';
import { DatabaseService } from './database.service';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  roles?: string[];
  permissions?: string[];
}

export interface TokenPayload {
  userId: string;
  username: string;
  email: string;
  roles: string[];
  permissions: string[];
  iat?: number;
  exp?: number;
}

export class AuthService implements AuthApi {
  private logger: Logger;
  private database: DatabaseService;
  private jwtSecret: string;
  private jwtExpiresIn: string;
  private currentUser: User | null = null;

  constructor(logger: Logger, database?: DatabaseService) {
    this.logger = logger;
    this.database = database!;
    this.jwtSecret = process.env.JWT_SECRET || 'blacktop-blackout-secret-key-change-in-production';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
  }

  setDatabase(database: DatabaseService): void {
    this.database = database;
  }

  /**
   * Register a new user
   */
  async register(userData: RegisterData): Promise<User> {
    try {
      this.logger.info(`Registering new user: ${userData.username}`);

      // Check if user already exists
      const existingUsers = await this.database.findWhere<User>('users', {
        username: userData.username
      });

      if (existingUsers.length > 0) {
        throw new Error('Username already exists');
      }

      const existingEmails = await this.database.findWhere<User>('users', {
        email: userData.email
      });

      if (existingEmails.length > 0) {
        throw new Error('Email already exists');
      }

      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(userData.password, saltRounds);

      // Create user record
      const newUser = await this.database.insert<User>('users', {
        username: userData.username,
        email: userData.email,
        first_name: userData.firstName,
        last_name: userData.lastName,
        password_hash: passwordHash,
        roles: userData.roles || ['user'],
        permissions: userData.permissions || [],
        created_at: new Date(),
        updated_at: new Date()
      });

      // Remove password hash from response
      const { password_hash, ...userWithoutPassword } = newUser as any;

      this.logger.info(`User registered successfully: ${userData.username}`);
      return userWithoutPassword;
    } catch (error) {
      this.logger.error(`Registration failed for ${userData.username}: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Authenticate user and return JWT token
   */
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    try {
      this.logger.info(`Login attempt for user: ${credentials.username}`);

      // Find user by username
      const users = await this.database.findWhere<any>('users', {
        username: credentials.username
      });

      if (users.length === 0) {
        throw new Error('Invalid credentials');
      }

      const user = users[0];

      // Verify password
      const isPasswordValid = await bcrypt.compare(credentials.password, user.password_hash);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      // Update last login
      await this.database.update('users', user.id, {
        last_login: new Date()
      });

      // Generate JWT token
      const tokenPayload: TokenPayload = {
        userId: user.id,
        username: user.username,
        email: user.email,
        roles: user.roles,
        permissions: user.permissions
      };

      const token = jwt.sign(tokenPayload, this.jwtSecret, {
        expiresIn: this.jwtExpiresIn
      });

      // Remove password hash from response
      const { password_hash, ...userWithoutPassword } = user;
      const userResponse: User = {
        ...userWithoutPassword,
        lastLogin: new Date(),
        createdAt: user.created_at,
        updatedAt: user.updated_at
      };

      this.currentUser = userResponse;

      this.logger.info(`Login successful for user: ${credentials.username}`);
      return { user: userResponse, token };
    } catch (error) {
      this.logger.error(`Login failed for ${credentials.username}: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Verify JWT token and return user data
   */
  async verifyToken(token: string): Promise<TokenPayload> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as TokenPayload;
      
      // Check if user still exists and is active
      const user = await this.database.findById<User>('users', decoded.userId);
      if (!user) {
        throw new Error('User not found');
      }

      return decoded;
    } catch (error) {
      this.logger.error(`Token verification failed: ${error.message}`);
      throw new Error('Invalid token');
    }
  }

  /**
   * Create a JWT token
   */
  async createToken(payload: TokenPayload): Promise<string> {
    try {
      return jwt.sign(payload, this.jwtSecret, {
        expiresIn: this.jwtExpiresIn
      });
    } catch (error) {
      this.logger.error(`Token creation failed: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    return this.currentUser;
  }

  /**
   * Set current user (used by middleware)
   */
  setCurrentUser(user: User): void {
    this.currentUser = user;
  }

  /**
   * Check if current user has specific permission
   */
  async hasPermission(permission: string): Promise<boolean> {
    if (!this.currentUser) {
      return false;
    }

    // Admin role has all permissions
    if (this.currentUser.roles.includes('admin')) {
      return true;
    }

    // Check direct permission
    if (this.currentUser.permissions.includes(permission)) {
      return true;
    }

    // Check role-based permissions
    return await this.checkRolePermissions(this.currentUser.roles, permission);
  }

  /**
   * Check if user has specific role
   */
  async hasRole(role: string): Promise<boolean> {
    if (!this.currentUser) {
      return false;
    }

    return this.currentUser.roles.includes(role);
  }

  /**
   * Update user password
   */
  async updatePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      this.logger.info(`Password update attempt for user: ${userId}`);

      // Get user with password hash
      const user = await this.database.findById<any>('users', userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const saltRounds = 12;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await this.database.update('users', userId, {
        password_hash: newPasswordHash,
        updated_at: new Date()
      });

      this.logger.info(`Password updated successfully for user: ${userId}`);
    } catch (error) {
      this.logger.error(`Password update failed for user: ${userId}`, error);
      throw error;
    }
  }

  /**
   * Update user permissions
   */
  async updateUserPermissions(userId: string, permissions: string[]): Promise<User> {
    try {
      this.logger.info(`Updating permissions for user: ${userId}`);

      const updatedUser = await this.database.update<User>('users', userId, {
        permissions,
        updated_at: new Date()
      });

      this.logger.info(`Permissions updated for user: ${userId}`);
      return updatedUser;
    } catch (error) {
      this.logger.error(`Failed to update permissions for user: ${userId}`, error);
      throw error;
    }
  }

  /**
   * Update user roles
   */
  async updateUserRoles(userId: string, roles: string[]): Promise<User> {
    try {
      this.logger.info(`Updating roles for user: ${userId}`);

      const updatedUser = await this.database.update<User>('users', userId, {
        roles,
        updated_at: new Date()
      });

      this.logger.info(`Roles updated for user: ${userId}`);
      return updatedUser;
    } catch (error) {
      this.logger.error(`Failed to update roles for user: ${userId}`, error);
      throw error;
    }
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers(): Promise<User[]> {
    try {
      if (!await this.hasRole('admin')) {
        throw new Error('Insufficient permissions');
      }

      const users = await this.database.query<any>('SELECT id, username, email, first_name, last_name, roles, permissions, last_login, created_at, updated_at FROM users ORDER BY created_at DESC');
      
      return users.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        roles: user.roles,
        permissions: user.permissions,
        lastLogin: user.last_login,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      }));
    } catch (error) {
      this.logger.error('Failed to get all users', error);
      throw error;
    }
  }

  /**
   * Delete user (admin only)
   */
  async deleteUser(userId: string): Promise<boolean> {
    try {
      if (!await this.hasRole('admin')) {
        throw new Error('Insufficient permissions');
      }

      const success = await this.database.delete('users', userId);
      
      if (success) {
        this.logger.info(`User deleted: ${userId}`);
      }

      return success;
    } catch (error) {
      this.logger.error(`Failed to delete user: ${userId}`, error);
      throw error;
    }
  }

  /**
   * Logout current user
   */
  logout(): void {
    this.currentUser = null;
    this.logger.info('User logged out');
  }

  /**
   * Check role-based permissions (to be extended)
   */
  private async checkRolePermissions(roles: string[], permission: string): Promise<boolean> {
    // Define role-based permissions
    const rolePermissions: Record<string, string[]> = {
      admin: ['*'], // Admin has all permissions
      manager: [
        'employees:read',
        'employees:write',
        'vehicles:read',
        'vehicles:write',
        'overwatch:read',
        'plugins:read'
      ],
      operator: [
        'employees:read',
        'vehicles:read',
        'overwatch:read'
      ],
      user: [
        'overwatch:read'
      ]
    };

    for (const role of roles) {
      const permissions = rolePermissions[role] || [];
      if (permissions.includes('*') || permissions.includes(permission)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Generate password reset token
   */
  async generatePasswordResetToken(email: string): Promise<string> {
    try {
      const users = await this.database.findWhere<User>('users', { email });
      if (users.length === 0) {
        throw new Error('User not found');
      }

      const user = users[0];
      const resetToken = jwt.sign(
        { userId: user.id, type: 'password-reset' },
        this.jwtSecret,
        { expiresIn: '1h' }
      );

      this.logger.info(`Password reset token generated for user: ${email}`);
      return resetToken;
    } catch (error) {
      this.logger.error(`Failed to generate password reset token for: ${email}`, error);
      throw error;
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as any;
      
      if (decoded.type !== 'password-reset') {
        throw new Error('Invalid token type');
      }

      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(newPassword, saltRounds);

      await this.database.update('users', decoded.userId, {
        password_hash: passwordHash,
        updated_at: new Date()
      });

      this.logger.info(`Password reset completed for user: ${decoded.userId}`);
    } catch (error) {
      this.logger.error('Password reset failed', error);
      throw new Error('Invalid or expired reset token');
    }
  }
}
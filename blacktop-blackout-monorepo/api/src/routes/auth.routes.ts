import { Router } from 'express';
import { AuthService, LoginCredentials, RegisterData } from '../services/auth.service';
import { ApiResponse } from '@blacktop-blackout-monorepo/shared-types';

const router = Router();

// This will be injected by the main app
let authService: AuthService;

export function setAuthService(service: AuthService) {
  authService = service;
}

/**
 * Register a new user
 */
router.post('/register', async (req, res) => {
  try {
    const userData: RegisterData = req.body;
    
    // Basic validation
    if (!userData.username || !userData.email || !userData.password) {
      return res.status(400).json({
        success: false,
        error: 'Username, email, and password are required',
        timestamp: new Date()
      } as ApiResponse);
    }

    const user = await authService.register(userData);
    
    res.status(201).json({
      success: true,
      data: user,
      message: 'User registered successfully',
      timestamp: new Date()
    } as ApiResponse);
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
      timestamp: new Date()
    } as ApiResponse);
  }
});

/**
 * Login user
 */
router.post('/login', async (req, res) => {
  try {
    const credentials: LoginCredentials = req.body;
    
    if (!credentials.username || !credentials.password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required',
        timestamp: new Date()
      } as ApiResponse);
    }

    const result = await authService.login(credentials);
    
    res.json({
      success: true,
      data: result,
      message: 'Login successful',
      timestamp: new Date()
    } as ApiResponse);
  } catch (error) {
    res.status(401).json({
      success: false,
      error: error.message,
      timestamp: new Date()
    } as ApiResponse);
  }
});

/**
 * Get current user
 */
router.get('/me', async (req, res) => {
  try {
    const user = await authService.getCurrentUser();
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
        timestamp: new Date()
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: user,
      timestamp: new Date()
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date()
    } as ApiResponse);
  }
});

/**
 * Logout user
 */
router.post('/logout', (req, res) => {
  authService.logout();
  res.json({
    success: true,
    message: 'Logged out successfully',
    timestamp: new Date()
  } as ApiResponse);
});

/**
 * Update password
 */
router.put('/password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await authService.getCurrentUser();
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
        timestamp: new Date()
      } as ApiResponse);
    }

    await authService.updatePassword(user.id, currentPassword, newPassword);
    
    res.json({
      success: true,
      message: 'Password updated successfully',
      timestamp: new Date()
    } as ApiResponse);
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
      timestamp: new Date()
    } as ApiResponse);
  }
});

/**
 * Request password reset
 */
router.post('/password-reset', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required',
        timestamp: new Date()
      } as ApiResponse);
    }

    const token = await authService.generatePasswordResetToken(email);
    
    // In production, send email with reset link
    // For now, return the token (NOT SECURE FOR PRODUCTION)
    res.json({
      success: true,
      data: { resetToken: token },
      message: 'Password reset token generated',
      timestamp: new Date()
    } as ApiResponse);
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
      timestamp: new Date()
    } as ApiResponse);
  }
});

/**
 * Reset password with token
 */
router.post('/password-reset/confirm', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Token and new password are required',
        timestamp: new Date()
      } as ApiResponse);
    }

    await authService.resetPassword(token, newPassword);
    
    res.json({
      success: true,
      message: 'Password reset successful',
      timestamp: new Date()
    } as ApiResponse);
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
      timestamp: new Date()
    } as ApiResponse);
  }
});

export default router;
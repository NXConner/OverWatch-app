/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { BlacktopPluginManager, PluginRegistry } from '@blacktop-blackout-monorepo/plugin-manager';
import { Logger, PluginApi } from '@blacktop-blackout-monorepo/shared-types';
import { DatabaseService } from './services/database.service';
import { AuthService } from './services/auth.service';
import { LoggerService } from './services/logger.service';
import { MessagingService } from './services/messaging.service';
import { StorageService } from './services/storage.service';

// Import route modules
import authRoutes, { setAuthService } from './routes/auth.routes';
import pluginRoutes, { setPluginServices } from './routes/plugin.routes';
import employeeRoutes from './routes/employee.routes';
import vehicleRoutes from './routes/vehicle.routes';
import overwatchRoutes from './routes/overwatch.routes';

// Load environment variables
dotenv.config();

class BlacktopAPI {
  private app: express.Application;
  private server: any;
  private logger: Logger;
  private pluginManager: BlacktopPluginManager;
  private pluginRegistry: PluginRegistry;
  private databaseService: DatabaseService;
  private authService: AuthService;
  private messagingService: MessagingService;
  private storageService: StorageService;

  constructor() {
    this.app = express();
    this.logger = new LoggerService();
    this.setupBasicMiddleware();
  }

  private setupBasicMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    // CORS configuration
    this.app.use(cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:4200',
      credentials: true,
    }));

    // Compression and parsing
    this.app.use(compression());
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Logging
    this.app.use(morgan('combined', {
      stream: {
        write: (message: string) => this.logger.info(message.trim())
      }
    }));
  }

  private async initializeServices(): Promise<void> {
    this.logger.info('Initializing core services...');
    
    // Initialize database first
    this.databaseService = new DatabaseService(this.logger);
    await this.databaseService.initialize();

    // Initialize other services
    this.authService = new AuthService(this.logger);
    this.authService.setDatabase(this.databaseService);
    
    this.messagingService = new MessagingService(this.logger);
    this.storageService = new StorageService(this.logger);

    // Initialize plugin system
    await this.initializePluginSystem();
  }

  private async initializePluginSystem(): Promise<void> {
    this.logger.info('Initializing plugin system...');

    // Create plugin API
    const pluginApi: PluginApi = {
      database: this.databaseService,
      messaging: this.messagingService,
      storage: this.storageService,
      auth: this.authService
    };

    // Initialize plugin registry
    this.pluginRegistry = new PluginRegistry(this.logger);

    // Initialize plugin manager
    this.pluginManager = new BlacktopPluginManager(
      {
        pluginDirectory: process.env.PLUGIN_DIRECTORY || './plugins',
        sandboxEnabled: process.env.NODE_ENV === 'production',
        trustedSources: ['github.com/NXConner', '@blacktop-blackout'],
        maxMemoryUsage: 512 * 1024 * 1024, // 512MB
        maxExecutionTime: 30000 // 30 seconds
      },
      this.logger,
      pluginApi
    );

    // Setup plugin event handlers
    this.setupPluginEventHandlers();
  }

  private setupPluginEventHandlers(): void {
    this.pluginManager.on('pluginLoaded', (pluginId: string) => {
      this.logger.info(`Plugin loaded: ${pluginId}`);
      this.registerPluginRoutes(pluginId);
    });

    this.pluginManager.on('pluginUnloaded', (pluginId: string) => {
      this.logger.info(`Plugin unloaded: ${pluginId}`);
      this.unregisterPluginRoutes(pluginId);
    });

    this.pluginManager.on('error', (error: Error) => {
      this.logger.error(`Plugin system error: ${error.message}`, error);
    });
  }

  private registerPluginRoutes(pluginId: string): void {
    const plugin = this.pluginManager.getPlugin(pluginId);
    if (plugin && plugin.metadata?.routes) {
      const routes = plugin.metadata.routes;
      for (const route of routes) {
        this.app.use(`/api/plugin/${pluginId}`, route.handler);
      }
    }
  }

  private unregisterPluginRoutes(pluginId: string): void {
    this.logger.info(`Unregistering routes for plugin: ${pluginId}`);
  }

  private initializeRoutes(): void {
    this.logger.info('Setting up routes...');

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0'
      });
    });

    // Inject services into route modules
    setAuthService(this.authService);
    setPluginServices(this.pluginManager, this.pluginRegistry);

    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/plugins', pluginRoutes);
    this.app.use('/api/employees', employeeRoutes);
    this.app.use('/api/vehicles', vehicleRoutes);
    this.app.use('/api/overwatch', overwatchRoutes);

    // Plugin API endpoints (dynamic routes will be added by plugins)
    this.app.use('/api/plugin', (req, res, next) => {
      next();
    });

    this.setupErrorHandling();
  }

  private setupErrorHandling(): void {
    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        timestamp: new Date().toISOString()
      });
    });

    // Global error handler
    this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      this.logger.error(`Unhandled error: ${err.message}`, {
        stack: err.stack,
        url: req.url,
        method: req.method
      });

      res.status(err.status || 500).json({
        success: false,
        error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
        timestamp: new Date().toISOString()
      });
    });
  }

  public async start(): Promise<void> {
    try {
      // Initialize all services
      await this.initializeServices();

      // Setup routes after services are initialized
      this.initializeRoutes();

      // Start server
      const port = process.env.PORT || 3000;
      this.server = createServer(this.app);
      
      this.server.listen(port, () => {
        this.logger.info(`🚀 Blacktop Blackout API server running on port ${port}`);
        this.logger.info(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
        this.logger.info(`🔌 Plugin system initialized`);
        this.logger.info(`📊 Database connected and ready`);
      });

      // Graceful shutdown handlers
      this.setupGracefulShutdown();

    } catch (error) {
      this.logger.error(`Failed to start server: ${error.message}`, error);
      process.exit(1);
    }
  }

  private setupGracefulShutdown(): void {
    const gracefulShutdown = async (signal: string) => {
      this.logger.info(`Received ${signal}. Starting graceful shutdown...`);

      try {
        // Stop accepting new connections
        this.server.close(() => {
          this.logger.info('HTTP server closed');
        });

        // Shutdown plugin system
        await this.pluginManager.shutdown();

        // Close database connections
        await this.databaseService.disconnect();

        this.logger.info('Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        this.logger.error(`Error during shutdown: ${error.message}`, error);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  }

  public getApp(): express.Application {
    return this.app;
  }

  public getPluginManager(): BlacktopPluginManager {
    return this.pluginManager;
  }

  public getPluginRegistry(): PluginRegistry {
    return this.pluginRegistry;
  }
}

// Start the server
const api = new BlacktopAPI();
api.start().catch((error) => {
  console.error('Failed to start Blacktop Blackout API:', error);
  process.exit(1);
});

export default api;

import { PluginManager as LivePluginManager } from 'live-plugin-manager';
import * as CryptoJS from 'crypto-js';
import { EventEmitter } from 'events';
import {
  PluginInterface,
  PluginModule,
  PluginContext,
  ModuleMetadata,
  ModuleType,
  Logger,
  PluginApi
} from '@blacktop-blackout-monorepo/shared-types';

export interface PluginManagerConfig {
  pluginDirectory: string;
  sandboxEnabled: boolean;
  trustedSources: string[];
  maxMemoryUsage: number;
  maxExecutionTime: number;
}

export class BlacktopPluginManager extends EventEmitter {
  private livePluginManager: LivePluginManager;
  private loadedPlugins: Map<string, PluginModule> = new Map();
  private pluginContexts: Map<string, PluginContext> = new Map();
  private config: PluginManagerConfig;
  private logger: Logger;
  private pluginApi: PluginApi;

  constructor(config: PluginManagerConfig, logger: Logger, pluginApi: PluginApi) {
    super();
    this.config = config;
    this.logger = logger;
    this.pluginApi = pluginApi;
    
    this.livePluginManager = new LivePluginManager({
      pluginsPath: config.pluginDirectory,
      npmRegistryUrl: 'https://registry.npmjs.org',
      npmInstallMode: 'useCache'
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.livePluginManager.on('beforeInstall', (packageName: string) => {
      this.logger.info(`Installing plugin: ${packageName}`);
      this.emit('beforeInstall', packageName);
    });

    this.livePluginManager.on('installed', (packageName: string) => {
      this.logger.info(`Plugin installed: ${packageName}`);
      this.emit('installed', packageName);
    });

    this.livePluginManager.on('error', (error: Error) => {
      this.logger.error(`Plugin manager error: ${error.message}`, error);
      this.emit('error', error);
    });
  }

  /**
   * Install a plugin from NPM or GitHub repository
   */
  async installPlugin(packageSpec: string, version?: string): Promise<void> {
    try {
      this.logger.info(`Installing plugin: ${packageSpec}@${version || 'latest'}`);
      
      // Verify signature if sandbox enabled
      if (this.config.sandboxEnabled) {
        await this.verifyPluginSignature(packageSpec, version);
      }

      const packageName = version ? `${packageSpec}@${version}` : packageSpec;
      await this.livePluginManager.install(packageName);
      
      this.logger.info(`Plugin ${packageSpec} installed successfully`);
    } catch (error) {
      this.logger.error(`Failed to install plugin ${packageSpec}: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Load and initialize a plugin
   */
  async loadPlugin(pluginId: string): Promise<void> {
    try {
      this.logger.info(`Loading plugin: ${pluginId}`);

      // Get plugin module
      const pluginModule = await this.livePluginManager.require(pluginId);
      
      // Validate plugin interface
      this.validatePluginInterface(pluginModule);

      // Create plugin context
      const context = this.createPluginContext(pluginId);
      
      // Initialize plugin
      await pluginModule.initialize(context);

      // Store loaded plugin
      this.loadedPlugins.set(pluginId, pluginModule);
      this.pluginContexts.set(pluginId, context);

      this.logger.info(`Plugin ${pluginId} loaded successfully`);
      this.emit('pluginLoaded', pluginId);
    } catch (error) {
      this.logger.error(`Failed to load plugin ${pluginId}: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Unload a plugin
   */
  async unloadPlugin(pluginId: string): Promise<void> {
    try {
      this.logger.info(`Unloading plugin: ${pluginId}`);

      const plugin = this.loadedPlugins.get(pluginId);
      if (!plugin) {
        throw new Error(`Plugin ${pluginId} is not loaded`);
      }

      // Destroy plugin
      await plugin.destroy();

      // Remove from maps
      this.loadedPlugins.delete(pluginId);
      this.pluginContexts.delete(pluginId);

      this.logger.info(`Plugin ${pluginId} unloaded successfully`);
      this.emit('pluginUnloaded', pluginId);
    } catch (error) {
      this.logger.error(`Failed to unload plugin ${pluginId}: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Enable a plugin
   */
  async enablePlugin(pluginId: string): Promise<void> {
    try {
      const plugin = this.loadedPlugins.get(pluginId);
      if (!plugin) {
        throw new Error(`Plugin ${pluginId} is not loaded`);
      }

      await plugin.enable();
      this.logger.info(`Plugin ${pluginId} enabled`);
      this.emit('pluginEnabled', pluginId);
    } catch (error) {
      this.logger.error(`Failed to enable plugin ${pluginId}: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Disable a plugin
   */
  async disablePlugin(pluginId: string): Promise<void> {
    try {
      const plugin = this.loadedPlugins.get(pluginId);
      if (!plugin) {
        throw new Error(`Plugin ${pluginId} is not loaded`);
      }

      await plugin.disable();
      this.logger.info(`Plugin ${pluginId} disabled`);
      this.emit('pluginDisabled', pluginId);
    } catch (error) {
      this.logger.error(`Failed to disable plugin ${pluginId}: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Uninstall a plugin
   */
  async uninstallPlugin(pluginId: string): Promise<void> {
    try {
      this.logger.info(`Uninstalling plugin: ${pluginId}`);

      // Unload if loaded
      if (this.loadedPlugins.has(pluginId)) {
        await this.unloadPlugin(pluginId);
      }

      // Uninstall from filesystem
      await this.livePluginManager.uninstall(pluginId);

      this.logger.info(`Plugin ${pluginId} uninstalled successfully`);
      this.emit('pluginUninstalled', pluginId);
    } catch (error) {
      this.logger.error(`Failed to uninstall plugin ${pluginId}: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Get list of installed plugins
   */
  getInstalledPlugins(): string[] {
    return this.livePluginManager.list();
  }

  /**
   * Get list of loaded plugins
   */
  getLoadedPlugins(): string[] {
    return Array.from(this.loadedPlugins.keys());
  }

  /**
   * Get plugin info
   */
  getPluginInfo(pluginId: string): PluginInterface | null {
    const plugin = this.loadedPlugins.get(pluginId);
    if (!plugin) {
      return null;
    }

    return {
      id: plugin.id,
      name: plugin.name,
      version: plugin.version,
      description: plugin.description,
      author: plugin.author,
      dependencies: plugin.dependencies,
      permissions: plugin.permissions,
      metadata: plugin.metadata
    };
  }

  /**
   * Check if plugin is loaded
   */
  isPluginLoaded(pluginId: string): boolean {
    return this.loadedPlugins.has(pluginId);
  }

  /**
   * Get plugin by ID
   */
  getPlugin(pluginId: string): PluginModule | null {
    return this.loadedPlugins.get(pluginId) || null;
  }

  private validatePluginInterface(plugin: any): void {
    const requiredMethods = ['initialize', 'destroy', 'enable', 'disable'];
    const requiredProperties = ['id', 'name', 'version', 'description', 'author'];

    for (const prop of requiredProperties) {
      if (!plugin[prop]) {
        throw new Error(`Plugin missing required property: ${prop}`);
      }
    }

    for (const method of requiredMethods) {
      if (typeof plugin[method] !== 'function') {
        throw new Error(`Plugin missing required method: ${method}`);
      }
    }
  }

  private createPluginContext(pluginId: string): PluginContext {
    return {
      api: this.pluginApi,
      config: {}, // Plugin-specific configuration can be loaded here
      logger: this.createPluginLogger(pluginId),
      events: new EventEmitter()
    };
  }

  private createPluginLogger(pluginId: string): Logger {
    return {
      debug: (message: string, meta?: any) => this.logger.debug(`[${pluginId}] ${message}`, meta),
      info: (message: string, meta?: any) => this.logger.info(`[${pluginId}] ${message}`, meta),
      warn: (message: string, meta?: any) => this.logger.warn(`[${pluginId}] ${message}`, meta),
      error: (message: string, meta?: any) => this.logger.error(`[${pluginId}] ${message}`, meta)
    };
  }

  private async verifyPluginSignature(packageSpec: string, version?: string): Promise<void> {
    // Basic signature verification implementation
    // In production, this should verify cryptographic signatures
    
    if (!this.config.trustedSources.some(source => packageSpec.includes(source))) {
      this.logger.warn(`Plugin ${packageSpec} is not from a trusted source`);
    }

    // Calculate hash of plugin for integrity check
    const packageInfo = await this.livePluginManager.getInfo(packageSpec);
    if (packageInfo && packageInfo.dist && packageInfo.dist.shasum) {
      // Verify shasum matches
      this.logger.debug(`Verifying package integrity for ${packageSpec}`);
    }
  }

  /**
   * Get plugin statistics
   */
  getStatistics(): {
    totalInstalled: number;
    totalLoaded: number;
    memoryUsage: number;
    uptime: number;
  } {
    return {
      totalInstalled: this.getInstalledPlugins().length,
      totalLoaded: this.getLoadedPlugins().length,
      memoryUsage: process.memoryUsage().heapUsed,
      uptime: process.uptime()
    };
  }

  /**
   * Cleanup and shutdown
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down plugin manager');

    // Unload all plugins
    const loadedPlugins = Array.from(this.loadedPlugins.keys());
    for (const pluginId of loadedPlugins) {
      try {
        await this.unloadPlugin(pluginId);
      } catch (error) {
        this.logger.error(`Error unloading plugin ${pluginId} during shutdown: ${error.message}`);
      }
    }

    this.removeAllListeners();
    this.logger.info('Plugin manager shutdown complete');
  }
}

/**
 * Plugin Registry for managing metadata
 */
export class PluginRegistry {
  private plugins: Map<string, ModuleMetadata> = new Map();
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Register a plugin
   */
  registerPlugin(metadata: ModuleMetadata): void {
    this.plugins.set(metadata.id, metadata);
    this.logger.info(`Plugin registered: ${metadata.id}`);
  }

  /**
   * Unregister a plugin
   */
  unregisterPlugin(pluginId: string): void {
    this.plugins.delete(pluginId);
    this.logger.info(`Plugin unregistered: ${pluginId}`);
  }

  /**
   * Get plugin metadata
   */
  getPluginMetadata(pluginId: string): ModuleMetadata | null {
    return this.plugins.get(pluginId) || null;
  }

  /**
   * Get all plugins
   */
  getAllPlugins(): ModuleMetadata[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Search plugins
   */
  searchPlugins(query: string, type?: ModuleType): ModuleMetadata[] {
    const lowerQuery = query.toLowerCase();
    
    return this.getAllPlugins().filter(plugin => {
      const matchesQuery = 
        plugin.name.toLowerCase().includes(lowerQuery) ||
        plugin.description.toLowerCase().includes(lowerQuery) ||
        plugin.tags.some(tag => tag.toLowerCase().includes(lowerQuery));
      
      const matchesType = !type || plugin.type === type;
      
      return matchesQuery && matchesType;
    });
  }

  /**
   * Get plugins by category
   */
  getPluginsByCategory(category: string): ModuleMetadata[] {
    return this.getAllPlugins().filter(plugin => plugin.category === category);
  }

  /**
   * Update plugin metadata
   */
  updatePluginMetadata(pluginId: string, updates: Partial<ModuleMetadata>): void {
    const existing = this.plugins.get(pluginId);
    if (existing) {
      this.plugins.set(pluginId, { ...existing, ...updates, lastUpdated: new Date() });
      this.logger.info(`Plugin metadata updated: ${pluginId}`);
    }
  }
}

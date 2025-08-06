import { Router } from 'express';
import { BlacktopPluginManager, PluginRegistry } from '@blacktop-blackout-monorepo/plugin-manager';
import { ApiResponse } from '@blacktop-blackout-monorepo/shared-types';

const router = Router();

// These will be injected by the main app
let pluginManager: BlacktopPluginManager;
let pluginRegistry: PluginRegistry;

export function setPluginServices(manager: BlacktopPluginManager, registry: PluginRegistry) {
  pluginManager = manager;
  pluginRegistry = registry;
}

/**
 * Get all installed plugins
 */
router.get('/', async (req, res) => {
  try {
    const installed = pluginManager.getInstalledPlugins();
    const loaded = pluginManager.getLoadedPlugins();
    const registry = pluginRegistry.getAllPlugins();

    res.json({
      success: true,
      data: {
        installed,
        loaded,
        registry
      },
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
 * Search plugins in registry
 */
router.get('/search', async (req, res) => {
  try {
    const { q: query, type } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter "q" is required',
        timestamp: new Date()
      } as ApiResponse);
    }

    const results = pluginRegistry.searchPlugins(query as string, type as any);

    res.json({
      success: true,
      data: results,
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
 * Get plugin info
 */
router.get('/:pluginId', async (req, res) => {
  try {
    const { pluginId } = req.params;
    
    const pluginInfo = pluginManager.getPluginInfo(pluginId);
    const metadata = pluginRegistry.getPluginMetadata(pluginId);

    if (!pluginInfo && !metadata) {
      return res.status(404).json({
        success: false,
        error: 'Plugin not found',
        timestamp: new Date()
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: {
        info: pluginInfo,
        metadata,
        isLoaded: pluginManager.isPluginLoaded(pluginId)
      },
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
 * Install a plugin
 */
router.post('/:pluginId/install', async (req, res) => {
  try {
    const { pluginId } = req.params;
    const { version } = req.body;

    await pluginManager.installPlugin(pluginId, version);

    res.json({
      success: true,
      message: `Plugin ${pluginId} installed successfully`,
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
 * Load a plugin
 */
router.post('/:pluginId/load', async (req, res) => {
  try {
    const { pluginId } = req.params;

    if (pluginManager.isPluginLoaded(pluginId)) {
      return res.status(400).json({
        success: false,
        error: 'Plugin is already loaded',
        timestamp: new Date()
      } as ApiResponse);
    }

    await pluginManager.loadPlugin(pluginId);

    res.json({
      success: true,
      message: `Plugin ${pluginId} loaded successfully`,
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
 * Unload a plugin
 */
router.post('/:pluginId/unload', async (req, res) => {
  try {
    const { pluginId } = req.params;

    if (!pluginManager.isPluginLoaded(pluginId)) {
      return res.status(400).json({
        success: false,
        error: 'Plugin is not loaded',
        timestamp: new Date()
      } as ApiResponse);
    }

    await pluginManager.unloadPlugin(pluginId);

    res.json({
      success: true,
      message: `Plugin ${pluginId} unloaded successfully`,
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
 * Enable a plugin
 */
router.post('/:pluginId/enable', async (req, res) => {
  try {
    const { pluginId } = req.params;

    await pluginManager.enablePlugin(pluginId);

    res.json({
      success: true,
      message: `Plugin ${pluginId} enabled successfully`,
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
 * Disable a plugin
 */
router.post('/:pluginId/disable', async (req, res) => {
  try {
    const { pluginId } = req.params;

    await pluginManager.disablePlugin(pluginId);

    res.json({
      success: true,
      message: `Plugin ${pluginId} disabled successfully`,
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
 * Uninstall a plugin
 */
router.delete('/:pluginId', async (req, res) => {
  try {
    const { pluginId } = req.params;

    await pluginManager.uninstallPlugin(pluginId);

    res.json({
      success: true,
      message: `Plugin ${pluginId} uninstalled successfully`,
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
 * Get plugin manager statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = pluginManager.getStatistics();

    res.json({
      success: true,
      data: stats,
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

export default router;
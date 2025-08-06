import { create } from 'zustand';
import { ModuleMetadata, ModuleType, TerminologyMode } from '@blacktop-blackout-monorepo/shared-types';

export interface LoadedModule {
  metadata: ModuleMetadata;
  component?: React.ComponentType<any>;
  routes?: any[];
  isLoading: boolean;
  loadError?: string;
  lastLoaded?: Date;
}

export interface ModuleStore {
  // Module management
  availableModules: ModuleMetadata[];
  loadedModules: Map<string, LoadedModule>;
  
  // UI state
  isMarketplaceOpen: boolean;
  terminologyMode: TerminologyMode;
  
  // Actions
  setAvailableModules: (modules: ModuleMetadata[]) => void;
  loadModule: (moduleId: string) => Promise<void>;
  unloadModule: (moduleId: string) => void;
  enableModule: (moduleId: string) => Promise<void>;
  disableModule: (moduleId: string) => void;
  
  // UI actions
  toggleMarketplace: () => void;
  setTerminologyMode: (mode: TerminologyMode) => void;
  
  // Getters
  getLoadedModule: (moduleId: string) => LoadedModule | undefined;
  isModuleLoaded: (moduleId: string) => boolean;
  getModulesByType: (type: ModuleType) => ModuleMetadata[];
}

export const useModuleStore = create<ModuleStore>((set, get) => ({
  // Initial state
  availableModules: [],
  loadedModules: new Map(),
  isMarketplaceOpen: false,
  terminologyMode: TerminologyMode.CIVILIAN,

  // Actions
  setAvailableModules: (modules) => set({ availableModules: modules }),

  loadModule: async (moduleId: string) => {
    const { availableModules, loadedModules } = get();
    const moduleMetadata = availableModules.find(m => m.id === moduleId);
    
    if (!moduleMetadata) {
      console.error(`Module ${moduleId} not found in available modules`);
      return;
    }

    // Set loading state
    const newLoadedModules = new Map(loadedModules);
    newLoadedModules.set(moduleId, {
      metadata: moduleMetadata,
      isLoading: true,
      lastLoaded: new Date()
    });
    set({ loadedModules: newLoadedModules });

    try {
      let component: React.ComponentType<any> | undefined;
      let routes: any[] | undefined;

      // Load module based on type
      if (moduleMetadata.type === ModuleType.FRONTEND_REACT) {
        // Dynamic import of React module
        const moduleUrl = moduleMetadata.repository || `/modules/${moduleId}/index.js`;
        
        try {
          // Load remote module using Module Federation
          const remoteModule = await loadRemoteModule(moduleUrl, moduleId);
          component = remoteModule.default || remoteModule.Component;
          routes = remoteModule.routes;
        } catch (error) {
          console.warn(`Failed to load remote module ${moduleId}, trying local fallback`);
          // Fallback to local module if available
          try {
            const localModule = await import(`../modules/${moduleId}/index.tsx`);
            component = localModule.default || localModule.Component;
            routes = localModule.routes;
          } catch (localError) {
            throw new Error(`Failed to load module ${moduleId}: ${error.message}`);
          }
        }
      }

      // Update loaded modules
      const updatedLoadedModules = new Map(get().loadedModules);
      updatedLoadedModules.set(moduleId, {
        metadata: moduleMetadata,
        component,
        routes,
        isLoading: false,
        lastLoaded: new Date()
      });
      
      set({ loadedModules: updatedLoadedModules });
      
      console.log(`Module ${moduleId} loaded successfully`);
    } catch (error) {
      // Update with error state
      const errorLoadedModules = new Map(get().loadedModules);
      errorLoadedModules.set(moduleId, {
        metadata: moduleMetadata,
        isLoading: false,
        loadError: error.message,
        lastLoaded: new Date()
      });
      
      set({ loadedModules: errorLoadedModules });
      console.error(`Failed to load module ${moduleId}:`, error);
    }
  },

  unloadModule: (moduleId: string) => {
    const { loadedModules } = get();
    const newLoadedModules = new Map(loadedModules);
    newLoadedModules.delete(moduleId);
    set({ loadedModules: newLoadedModules });
    console.log(`Module ${moduleId} unloaded`);
  },

  enableModule: async (moduleId: string) => {
    try {
      // Call API to enable module
      await fetch(`/api/plugins/${moduleId}/enable`, { method: 'POST' });
      
      // Reload module if it was already loaded
      if (get().isModuleLoaded(moduleId)) {
        await get().loadModule(moduleId);
      }
    } catch (error) {
      console.error(`Failed to enable module ${moduleId}:`, error);
    }
  },

  disableModule: (moduleId: string) => {
    // Unload module and call API to disable
    get().unloadModule(moduleId);
    
    fetch(`/api/plugins/${moduleId}/disable`, { method: 'POST' })
      .catch(error => console.error(`Failed to disable module ${moduleId}:`, error));
  },

  // UI actions
  toggleMarketplace: () => set(state => ({ isMarketplaceOpen: !state.isMarketplaceOpen })),
  
  setTerminologyMode: (mode: TerminologyMode) => {
    set({ terminologyMode: mode });
    // Persist to localStorage
    localStorage.setItem('blacktop-terminology-mode', mode);
  },

  // Getters
  getLoadedModule: (moduleId: string) => get().loadedModules.get(moduleId),
  
  isModuleLoaded: (moduleId: string) => get().loadedModules.has(moduleId),
  
  getModulesByType: (type: ModuleType) => 
    get().availableModules.filter(module => module.type === type)
}));

// Helper function to load remote modules
async function loadRemoteModule(url: string, moduleName: string): Promise<any> {
  // Create script element for loading remote module
  const script = document.createElement('script');
  script.type = 'module';
  script.src = url;
  
  return new Promise((resolve, reject) => {
    script.onload = async () => {
      try {
        // Access the module from window object or global scope
        const module = (window as any)[moduleName] || (window as any)[`${moduleName}Module`];
        if (module) {
          resolve(module);
        } else {
          // Try dynamic import
          const dynamicModule = await import(url);
          resolve(dynamicModule);
        }
      } catch (error) {
        reject(error);
      }
    };
    
    script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
    document.head.appendChild(script);
  });
}

// Initialize terminology mode from localStorage
const savedMode = localStorage.getItem('blacktop-terminology-mode') as TerminologyMode;
if (savedMode && Object.values(TerminologyMode).includes(savedMode)) {
  useModuleStore.getState().setTerminologyMode(savedMode);
}
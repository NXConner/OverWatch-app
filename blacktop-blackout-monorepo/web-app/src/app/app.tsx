import React, { useEffect, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Core components
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { ModuleLoader } from './components/ModuleLoader';
import { TerminologyProvider } from './components/TerminologyProvider';
import { Marketplace } from './modules/marketplace/Marketplace';
import { useModuleStore } from '../stores/module.store';
import { getAllModuleMetadata } from './modules';

// Styles
import './app.css';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

export function App() {
  const { setAvailableModules, loadModule } = useModuleStore();

  useEffect(() => {
    // Load available modules from local registry
    const loadAvailableModules = async () => {
      try {
        // Get modules from local registry
        const modules = getAllModuleMetadata();
        setAvailableModules(modules);
        
        // Auto-load core modules
        const coreModules = ['overwatch', 'employee-management'];
        for (const moduleId of coreModules) {
          try {
            await loadModule(moduleId);
          } catch (error) {
            console.warn(`Failed to auto-load core module ${moduleId}:`, error);
          }
        }
        
        console.log(`Loaded ${modules.length} available modules`);
      } catch (error) {
        console.error('Failed to load available modules:', error);
      }
    };

    loadAvailableModules();
  }, [setAvailableModules, loadModule]);

  return (
    <QueryClientProvider client={queryClient}>
      <TerminologyProvider>
        <div className="app blacktop-theme">
          <Layout>
            <Suspense fallback={<div className="loading">Loading...</div>}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/modules/*" element={<ModuleLoader />} />
                
                {/* Core module routes will be dynamically added here */}
                <Route path="/overwatch/*" element={<ModuleLoader moduleId="overwatch" />} />
                <Route path="/marketplace" element={<ModuleLoader moduleId="marketplace" />} />
                <Route path="/employees/*" element={<ModuleLoader moduleId="employee-management" />} />
                <Route path="/vehicles/*" element={<ModuleLoader moduleId="vehicle-management" />} />
                <Route path="/materials/*" element={<ModuleLoader moduleId="materials-management" />} />
                <Route path="/accounting/*" element={<ModuleLoader moduleId="accounting" />} />
                
                {/* Fallback route */}
                <Route path="*" element={<div className="error-404">Module not found</div>} />
              </Routes>
            </Suspense>
          </Layout>
          
          {/* Global Marketplace Modal */}
          <Marketplace />
        </div>
      </TerminologyProvider>
    </QueryClientProvider>
  );
}

export default App;

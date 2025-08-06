import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useModuleStore } from '../../stores/module.store';
import { LoadedModule } from '../../stores/module.store';

interface ModuleLoaderProps {
  moduleId?: string;
}

export const ModuleLoader: React.FC<ModuleLoaderProps> = ({ moduleId: propModuleId }) => {
  const { moduleId: paramModuleId } = useParams<{ moduleId: string }>();
  const moduleId = propModuleId || paramModuleId;
  const [error, setError] = useState<string | null>(null);
  
  const { 
    getLoadedModule, 
    loadModule, 
    isModuleLoaded, 
    availableModules 
  } = useModuleStore();

  const loadedModule = moduleId ? getLoadedModule(moduleId) : null;

  useEffect(() => {
    if (!moduleId) {
      setError('No module ID provided');
      return;
    }

    const tryLoadModule = async () => {
      if (!isModuleLoaded(moduleId)) {
        // Check if module exists in available modules
        const moduleExists = availableModules.find(m => m.id === moduleId);
        if (!moduleExists) {
          setError(`Module '${moduleId}' not found in available modules`);
          return;
        }

        try {
          await loadModule(moduleId);
          setError(null);
        } catch (err) {
          setError(`Failed to load module '${moduleId}': ${err.message}`);
        }
      }
    };

    tryLoadModule();
  }, [moduleId, isModuleLoaded, loadModule, availableModules]);

  if (!moduleId) {
    return <ModuleNotFound message="No module specified" />;
  }

  if (error) {
    return <ModuleError error={error} moduleId={moduleId} />;
  }

  if (!loadedModule) {
    return <ModuleLoading moduleId={moduleId} />;
  }

  if (loadedModule.isLoading) {
    return <ModuleLoading moduleId={moduleId} />;
  }

  if (loadedModule.loadError) {
    return <ModuleError error={loadedModule.loadError} moduleId={moduleId} />;
  }

  if (!loadedModule.component) {
    return <ModuleError error="Module component not available" moduleId={moduleId} />;
  }

  // Render the loaded module component
  const ModuleComponent = loadedModule.component;
  
  return (
    <div className="module-container">
      <div className="module-header">
        <div className="module-title">
          <h2>{loadedModule.metadata.name}</h2>
          <span className="module-version">v{loadedModule.metadata.version}</span>
        </div>
        <div className="module-status">
          <span className="status-indicator active"></span>
          <span className="status-text">Active</span>
        </div>
      </div>
      
      <div className="module-content">
        <ModuleComponent moduleMetadata={loadedModule.metadata} />
      </div>

      <style jsx>{`
        .module-container {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .module-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 0 24px 0;
          border-bottom: 1px solid var(--bb-border-primary);
          margin-bottom: 24px;
        }

        .module-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .module-title h2 {
          margin: 0;
          color: var(--bb-text-primary);
          font-size: 24px;
          font-weight: 600;
        }

        .module-version {
          font-size: 12px;
          color: var(--bb-text-muted);
          background: var(--bb-bg-tertiary);
          padding: 4px 8px;
          border-radius: var(--bb-border-radius-sm);
        }

        .module-status {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--bb-accent-success);
          box-shadow: 0 0 4px rgba(0, 255, 136, 0.4);
        }

        .status-text {
          font-size: 12px;
          color: var(--bb-text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .module-content {
          flex: 1;
          overflow: auto;
        }
      `}</style>
    </div>
  );
};

const ModuleLoading: React.FC<{ moduleId: string }> = ({ moduleId }) => (
  <div className="module-state">
    <div className="state-icon loading">⟳</div>
    <h3>Loading Module</h3>
    <p>Initializing {moduleId}...</p>
    
    <style jsx>{`
      .module-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 400px;
        text-align: center;
        color: var(--bb-text-secondary);
      }

      .state-icon {
        font-size: 48px;
        margin-bottom: 16px;
      }

      .state-icon.loading {
        animation: bb-spin 1s linear infinite;
        color: var(--bb-accent-primary);
      }

      h3 {
        margin: 0 0 8px 0;
        color: var(--bb-text-primary);
        font-size: 20px;
      }

      p {
        margin: 0;
        font-size: 14px;
      }
    `}</style>
  </div>
);

const ModuleError: React.FC<{ error: string; moduleId: string }> = ({ error, moduleId }) => {
  const { loadModule } = useModuleStore();

  const handleRetry = async () => {
    try {
      await loadModule(moduleId);
    } catch (err) {
      console.error('Retry failed:', err);
    }
  };

  return (
    <div className="module-state">
      <div className="state-icon error">⚠️</div>
      <h3>Module Error</h3>
      <p>{error}</p>
      <button className="bb-button primary" onClick={handleRetry}>
        Retry Loading
      </button>
      
      <style jsx>{`
        .module-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          text-align: center;
          color: var(--bb-text-secondary);
        }

        .state-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .state-icon.error {
          color: var(--bb-accent-error);
        }

        h3 {
          margin: 0 0 8px 0;
          color: var(--bb-text-primary);
          font-size: 20px;
        }

        p {
          margin: 0 0 24px 0;
          font-size: 14px;
          max-width: 500px;
        }
      `}</style>
    </div>
  );
};

const ModuleNotFound: React.FC<{ message: string }> = ({ message }) => (
  <div className="module-state">
    <div className="state-icon">📦</div>
    <h3>Module Not Found</h3>
    <p>{message}</p>
    
    <style jsx>{`
      .module-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 400px;
        text-align: center;
        color: var(--bb-text-secondary);
      }

      .state-icon {
        font-size: 48px;
        margin-bottom: 16px;
        color: var(--bb-text-muted);
      }

      h3 {
        margin: 0 0 8px 0;
        color: var(--bb-text-primary);
        font-size: 20px;
      }

      p {
        margin: 0;
        font-size: 14px;
      }
    `}</style>
  </div>
);
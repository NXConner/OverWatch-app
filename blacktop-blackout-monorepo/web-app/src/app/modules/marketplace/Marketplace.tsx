import React, { useState, useEffect } from 'react';
import { ModuleMetadata, ModuleType } from '@blacktop-blackout-monorepo/shared-types';
import { useModuleStore } from '../../../stores/module.store';
import { useTranslate } from '../../components/TerminologyProvider';

interface MarketplaceProps {
  moduleMetadata?: ModuleMetadata;
}

export const Marketplace: React.FC<MarketplaceProps> = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<ModuleType | 'all'>('all');
  const [isInstalling, setIsInstalling] = useState<Set<string>>(new Set());
  
  const {
    availableModules,
    loadedModules,
    isMarketplaceOpen,
    toggleMarketplace,
    loadModule,
    enableModule,
    disableModule,
    unloadModule
  } = useModuleStore();
  
  const translate = useTranslate();

  const categories = [
    { id: 'all', name: translate('All Categories', 'All Modules'), count: availableModules.length },
    { id: 'business', name: translate('Business Management', 'Operations'), count: 0 },
    { id: 'monitoring', name: translate('Monitoring', 'Surveillance'), count: 0 },
    { id: 'analytics', name: translate('Analytics', 'Intelligence'), count: 0 },
    { id: 'integration', name: translate('Integration', 'Tactical Modules'), count: 0 },
    { id: 'utilities', name: translate('Utilities', 'Support Tools'), count: 0 }
  ];

  const moduleTypes = [
    { id: 'all', name: translate('All Types', 'All Components') },
    { id: ModuleType.FRONTEND_REACT, name: 'Frontend' },
    { id: ModuleType.BACKEND, name: 'Backend' },
    { id: ModuleType.CORE, name: 'Core System' }
  ];

  // Sample marketplace modules
  const [marketplaceModules] = useState<ModuleMetadata[]>([
    {
      id: 'overwatch-system',
      name: 'OverWatch System',
      type: ModuleType.FRONTEND_REACT,
      version: '1.0.0',
      description: 'Unified command and control center with real-time monitoring, cost tracking, and environmental intelligence.',
      author: 'Blacktop Systems',
      category: 'monitoring',
      tags: ['core', 'monitoring', 'real-time', 'geospatial'],
      enabled: false,
      installed: false,
      size: 2500000,
      repository: 'https://github.com/NXConner/overwatch-system',
      homepage: 'https://blacktop.systems/overwatch',
      license: 'MIT',
      screenshots: ['/screenshots/overwatch-1.png', '/screenshots/overwatch-2.png'],
      pricing: { type: 'free' }
    },
    {
      id: 'pavement-scan-pro',
      name: 'PavementScan Pro',
      type: ModuleType.FRONTEND_REACT,
      version: '2.1.0',
      description: 'Advanced 3D scanning and AI defect detection for asphalt surfaces with automated reporting.',
      author: 'Blacktop Systems',
      category: 'analytics',
      tags: ['3d-scanning', 'ai', 'defect-detection', 'reporting'],
      enabled: false,
      installed: false,
      size: 15000000,
      repository: 'https://github.com/NXConner/pavement-scan-pro',
      homepage: 'https://blacktop.systems/pavement-scan',
      license: 'Commercial',
      screenshots: ['/screenshots/pavement-scan-1.png'],
      pricing: { type: 'paid', price: 299, currency: 'USD', billingPeriod: 'one-time' }
    },
    {
      id: 'employee-management',
      name: translate('Employee Management', 'Personnel Command'),
      type: ModuleType.FRONTEND_REACT,
      version: '1.5.0',
      description: 'Comprehensive personnel management with performance tracking, compliance, and scheduling.',
      author: 'Blacktop Systems',
      category: 'business',
      tags: ['hr', 'scheduling', 'compliance', 'performance'],
      enabled: false,
      installed: false,
      size: 3200000,
      license: 'MIT',
      pricing: { type: 'free' }
    },
    {
      id: 'ai-estimator',
      name: 'AI Cost Estimator',
      type: ModuleType.BACKEND,
      version: '1.2.0',
      description: 'Intelligent cost estimation using machine learning and historical project data.',
      author: 'Blacktop AI',
      category: 'analytics',
      tags: ['ai', 'machine-learning', 'cost-estimation', 'analytics'],
      enabled: false,
      installed: false,
      size: 8500000,
      license: 'Commercial',
      pricing: { type: 'subscription', price: 49, currency: 'USD', billingPeriod: 'monthly' }
    },
    {
      id: 'weather-integration',
      name: 'Weather Intelligence',
      type: ModuleType.BACKEND,
      version: '1.1.0',
      description: 'Real-time weather data integration with intelligent scheduling recommendations.',
      author: 'WeatherWise',
      category: 'integration',
      tags: ['weather', 'scheduling', 'automation', 'alerts'],
      enabled: false,
      installed: false,
      size: 1800000,
      license: 'MIT',
      pricing: { type: 'free' }
    }
  ]);

  const filteredModules = marketplaceModules.filter(module => {
    const matchesSearch = module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         module.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || module.category === selectedCategory;
    const matchesType = selectedType === 'all' || module.type === selectedType;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const handleInstallModule = async (moduleId: string) => {
    setIsInstalling(prev => new Set(prev).add(moduleId));
    
    try {
      // Simulate installation
      await new Promise(resolve => setTimeout(resolve, 2000));
      await loadModule(moduleId);
    } catch (error) {
      console.error(`Failed to install module ${moduleId}:`, error);
    } finally {
      setIsInstalling(prev => {
        const newSet = new Set(prev);
        newSet.delete(moduleId);
        return newSet;
      });
    }
  };

  if (!isMarketplaceOpen) {
    return null;
  }

  return (
    <div className="marketplace-overlay">
      <div className="marketplace-modal">
        <div className="marketplace-header">
          <div className="header-left">
            <h2>{translate('Module Marketplace', 'Tactical Module Depot')}</h2>
            <p>{translate('Discover and install system modules', 'Deploy tactical components')}</p>
          </div>
          <button className="close-button bb-button" onClick={toggleMarketplace}>
            ✕
          </button>
        </div>

        <div className="marketplace-filters">
          <div className="search-bar">
            <input
              type="text"
              className="bb-input"
              placeholder={translate('Search modules...', 'Search components...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>{translate('Category', 'Module Type')}</label>
            <select 
              className="bb-input"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name} ({category.count})
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>{translate('Type', 'Component Type')}</label>
            <select
              className="bb-input"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as ModuleType | 'all')}
            >
              {moduleTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="marketplace-content">
          <div className="modules-grid">
            {filteredModules.map(module => (
              <ModuleCard
                key={module.id}
                module={module}
                isInstalled={loadedModules.has(module.id)}
                isInstalling={isInstalling.has(module.id)}
                onInstall={() => handleInstallModule(module.id)}
                onEnable={() => enableModule(module.id)}
                onDisable={() => disableModule(module.id)}
                translate={translate}
              />
            ))}
          </div>
          
          {filteredModules.length === 0 && (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <h3>{translate('No modules found', 'No components found')}</h3>
              <p>{translate('Try adjusting your search or filters', 'Modify search parameters')}</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .marketplace-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .marketplace-modal {
          background: var(--bb-bg-secondary);
          border: 1px solid var(--bb-border-primary);
          border-radius: var(--bb-border-radius-lg);
          box-shadow: var(--bb-shadow-lg);
          width: 100%;
          max-width: 1200px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .marketplace-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px;
          border-bottom: 1px solid var(--bb-border-primary);
        }

        .header-left h2 {
          margin: 0 0 4px 0;
          font-size: 24px;
          font-weight: 600;
          color: var(--bb-text-primary);
        }

        .header-left p {
          margin: 0;
          font-size: 14px;
          color: var(--bb-text-secondary);
        }

        .close-button {
          width: 40px;
          height: 40px;
          padding: 0;
          font-size: 16px;
        }

        .marketplace-filters {
          display: grid;
          grid-template-columns: 1fr auto auto;
          gap: 16px;
          align-items: end;
          padding: 24px;
          border-bottom: 1px solid var(--bb-border-primary);
        }

        .search-bar {
          min-width: 300px;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-width: 150px;
        }

        .filter-group label {
          font-size: 12px;
          color: var(--bb-text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 500;
        }

        .marketplace-content {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }

        .modules-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 24px;
        }

        .no-results {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 300px;
          text-align: center;
          color: var(--bb-text-secondary);
        }

        .no-results-icon {
          font-size: 48px;
          margin-bottom: 16px;
          opacity: 0.5;
        }

        .no-results h3 {
          margin: 0 0 8px 0;
          color: var(--bb-text-primary);
        }

        .no-results p {
          margin: 0;
          font-size: 14px;
        }

        @media (max-width: 768px) {
          .marketplace-filters {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .modules-grid {
            grid-template-columns: 1fr;
          }

          .marketplace-modal {
            max-height: 95vh;
            margin: 10px;
          }
        }
      `}</style>
    </div>
  );
};

interface ModuleCardProps {
  module: ModuleMetadata;
  isInstalled: boolean;
  isInstalling: boolean;
  onInstall: () => void;
  onEnable: () => void;
  onDisable: () => void;
  translate: (civilian: string, military?: string) => string;
}

const ModuleCard: React.FC<ModuleCardProps> = ({
  module,
  isInstalled,
  isInstalling,
  onInstall,
  onEnable,
  onDisable,
  translate
}) => {
  const formatSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const getPriceDisplay = () => {
    if (!module.pricing) return translate('Free', 'No Cost');
    
    switch (module.pricing.type) {
      case 'free':
        return translate('Free', 'No Cost');
      case 'paid':
        return `$${module.pricing.price}`;
      case 'subscription':
        return `$${module.pricing.price}/${module.pricing.billingPeriod}`;
      default:
        return translate('Unknown', 'TBD');
    }
  };

  return (
    <div className="module-card bb-card">
      <div className="module-header">
        <div className="module-info">
          <h3>{module.name}</h3>
          <div className="module-meta">
            <span className="version">v{module.version}</span>
            <span className="author">{module.author}</span>
          </div>
        </div>
        <div className="module-price">
          {getPriceDisplay()}
        </div>
      </div>

      <div className="module-description">
        <p>{module.description}</p>
      </div>

      <div className="module-tags">
        {module.tags.slice(0, 3).map(tag => (
          <span key={tag} className="tag">
            {tag}
          </span>
        ))}
        {module.tags.length > 3 && (
          <span className="tag-more">+{module.tags.length - 3}</span>
        )}
      </div>

      <div className="module-details">
        <div className="detail">
          <span className="detail-label">{translate('Type', 'Component')}:</span>
          <span className="detail-value">{module.type}</span>
        </div>
        <div className="detail">
          <span className="detail-label">{translate('Size', 'Footprint')}:</span>
          <span className="detail-value">{formatSize(module.size)}</span>
        </div>
        <div className="detail">
          <span className="detail-label">{translate('License', 'Authorization')}:</span>
          <span className="detail-value">{module.license}</span>
        </div>
      </div>

      <div className="module-actions">
        {isInstalling ? (
          <button className="bb-button primary" disabled>
            <span className="loading-spinner">⟳</span>
            {translate('Installing...', 'Deploying...')}
          </button>
        ) : isInstalled ? (
          <div className="installed-actions">
            <span className="installed-status">
              ✓ {translate('Installed', 'Deployed')}
            </span>
            <button className="bb-button" onClick={onDisable}>
              {translate('Disable', 'Deactivate')}
            </button>
          </div>
        ) : (
          <button className="bb-button primary" onClick={onInstall}>
            {translate('Install', 'Deploy')}
          </button>
        )}
      </div>

      <style jsx>{`
        .module-card {
          display: flex;
          flex-direction: column;
          height: 100%;
          transition: all var(--bb-transition-normal);
        }

        .module-card:hover {
          transform: translateY(-2px);
          border-color: var(--bb-accent-primary);
          box-shadow: var(--bb-glow-primary);
        }

        .module-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .module-info h3 {
          margin: 0 0 8px 0;
          font-size: 18px;
          font-weight: 600;
          color: var(--bb-text-primary);
        }

        .module-meta {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .version {
          font-size: 11px;
          color: var(--bb-text-muted);
          background: var(--bb-bg-tertiary);
          padding: 2px 6px;
          border-radius: var(--bb-border-radius-sm);
        }

        .author {
          font-size: 11px;
          color: var(--bb-text-muted);
        }

        .module-price {
          font-size: 14px;
          font-weight: 600;
          color: var(--bb-accent-primary);
        }

        .module-description {
          flex: 1;
          margin-bottom: 16px;
        }

        .module-description p {
          margin: 0;
          font-size: 14px;
          color: var(--bb-text-secondary);
          line-height: 1.5;
        }

        .module-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 16px;
        }

        .tag {
          font-size: 10px;
          background: var(--bb-bg-tertiary);
          color: var(--bb-text-secondary);
          padding: 3px 8px;
          border-radius: var(--bb-border-radius-sm);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .tag-more {
          font-size: 10px;
          color: var(--bb-text-muted);
          font-style: italic;
        }

        .module-details {
          margin-bottom: 20px;
        }

        .detail {
          display: flex;
          justify-content: space-between;
          margin-bottom: 6px;
        }

        .detail-label {
          font-size: 11px;
          color: var(--bb-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .detail-value {
          font-size: 11px;
          color: var(--bb-text-secondary);
          font-weight: 500;
        }

        .module-actions {
          margin-top: auto;
        }

        .installed-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .installed-status {
          font-size: 12px;
          color: var(--bb-accent-success);
          font-weight: 500;
        }

        .loading-spinner {
          animation: bb-spin 1s linear infinite;
          margin-right: 8px;
        }

        .bb-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};
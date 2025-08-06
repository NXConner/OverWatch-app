import React from 'react';
import { ModuleMetadata, ModuleType } from '@blacktop-blackout-monorepo/shared-types';

// Import all available modules
import { EmployeeManagement } from './employee-management/EmployeeManagement';
import { OverWatch } from './overwatch/OverWatch';
import { Marketplace } from './marketplace/Marketplace';

// Module registry interface
export interface RegisteredModule {
  component: React.ComponentType<any>;
  metadata: ModuleMetadata;
}

// Registry of all available modules
export const moduleRegistry: Record<string, RegisteredModule> = {
  'employee-management': {
    component: EmployeeManagement,
    metadata: {
      id: 'employee-management',
      name: 'Employee Management',
      type: ModuleType.FRONTEND_REACT,
      version: '1.0.0',
      description: 'Comprehensive personnel management with performance tracking, compliance, and scheduling.',
      author: 'Blacktop Systems',
      category: 'business',
      tags: ['hr', 'scheduling', 'compliance', 'performance'],
      enabled: true,
      installed: true,
      license: 'MIT',
      pricing: { type: 'free' }
    }
  },
  
  'overwatch': {
    component: OverWatch,
    metadata: {
      id: 'overwatch',
      name: 'OverWatch System',
      type: ModuleType.FRONTEND_REACT,
      version: '1.0.0',
      description: 'Unified command and control center with real-time monitoring, cost tracking, and environmental intelligence.',
      author: 'Blacktop Systems',
      category: 'monitoring',
      tags: ['core', 'monitoring', 'real-time', 'geospatial'],
      enabled: true,
      installed: true,
      size: 2500000,
      repository: 'https://github.com/NXConner/overwatch-system',
      homepage: 'https://blacktop.systems/overwatch',
      license: 'MIT',
      screenshots: ['/screenshots/overwatch-1.png', '/screenshots/overwatch-2.png'],
      pricing: { type: 'free' }
    }
  },
  
  'marketplace': {
    component: Marketplace,
    metadata: {
      id: 'marketplace',
      name: 'Module Marketplace',
      type: ModuleType.CORE,
      version: '1.0.0',
      description: 'Browse, install, and manage dynamic system modules.',
      author: 'Blacktop Systems',
      category: 'utilities',
      tags: ['core', 'marketplace', 'modules', 'management'],
      enabled: true,
      installed: true,
      license: 'MIT',
      pricing: { type: 'free' }
    }
  },
  
  'vehicle-management': {
    component: React.lazy(() => Promise.resolve({ 
      default: () => (
        <div className="bb-card">
          <h3>Vehicle & Equipment Management</h3>
          <p>Comprehensive fleet and equipment tracking module coming soon...</p>
        </div>
      )
    })),
    metadata: {
      id: 'vehicle-management',
      name: 'Vehicle & Equipment Management',
      type: ModuleType.FRONTEND_REACT,
      version: '1.0.0',
      description: 'Fleet management, maintenance tracking, and equipment monitoring.',
      author: 'Blacktop Systems',
      category: 'business',
      tags: ['fleet', 'maintenance', 'equipment', 'tracking'],
      enabled: false,
      installed: false,
      license: 'MIT',
      pricing: { type: 'free' }
    }
  },
  
  'materials-management': {
    component: React.lazy(() => Promise.resolve({ 
      default: () => (
        <div className="bb-card">
          <h3>Materials & Supplies Management</h3>
          <p>Inventory management and materials tracking module coming soon...</p>
        </div>
      )
    })),
    metadata: {
      id: 'materials-management',
      name: 'Materials & Supplies Management',
      type: ModuleType.FRONTEND_REACT,
      version: '1.0.0',
      description: 'Inventory tracking, material specifications, and supply chain management.',
      author: 'Blacktop Systems',
      category: 'business',
      tags: ['inventory', 'materials', 'supply-chain', 'specs'],
      enabled: false,
      installed: false,
      license: 'MIT',
      pricing: { type: 'free' }
    }
  },
  
  'accounting': {
    component: React.lazy(() => Promise.resolve({ 
      default: () => (
        <div className="bb-card">
          <h3>Core Accounting System</h3>
          <p>Comprehensive accounting and financial management module coming soon...</p>
        </div>
      )
    })),
    metadata: {
      id: 'accounting',
      name: 'Core Accounting System',
      type: ModuleType.FRONTEND_REACT,
      version: '1.0.0',
      description: 'Double-entry bookkeeping, AR/AP, financial reporting, and business intelligence.',
      author: 'Blacktop Systems',
      category: 'business',
      tags: ['accounting', 'finance', 'reporting', 'business-intelligence'],
      enabled: false,
      installed: false,
      license: 'MIT',
      pricing: { type: 'free' }
    }
  }
};

// Helper function to get a module by ID
export const getModuleById = (id: string): RegisteredModule | undefined => {
  return moduleRegistry[id];
};

// Helper function to get all module metadata
export const getAllModuleMetadata = (): ModuleMetadata[] => {
  return Object.values(moduleRegistry).map(module => module.metadata);
};

// Helper function to get modules by type
export const getModulesByType = (type: ModuleType): RegisteredModule[] => {
  return Object.values(moduleRegistry).filter(module => module.metadata.type === type);
};

// Helper function to get modules by category
export const getModulesByCategory = (category: string): RegisteredModule[] => {
  return Object.values(moduleRegistry).filter(module => module.metadata.category === category);
};

// Helper function to simulate module loading
export const loadModuleComponent = async (id: string): Promise<React.ComponentType<any> | null> => {
  const module = getModuleById(id);
  if (!module) {
    throw new Error(`Module '${id}' not found in registry`);
  }
  
  // Simulate loading delay for external modules
  if (!module.metadata.installed) {
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return module.component;
};
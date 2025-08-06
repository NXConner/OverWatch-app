import React, { createContext, useContext, ReactNode } from 'react';
import { TerminologyMode, TerminologyEntry } from '@blacktop-blackout-monorepo/shared-types';
import { useModuleStore } from '../../stores/module.store';

interface TerminologyContextType {
  translate: (civilian: string, military?: string) => string;
  mode: TerminologyMode;
}

const TerminologyContext = createContext<TerminologyContextType | undefined>(undefined);

// Comprehensive terminology dictionary
const terminologyDictionary: TerminologyEntry[] = [
  // Personnel Terms
  { id: 'personnel', civilian: 'Personnel', military: 'Personnel', category: 'management' },
  { id: 'employees', civilian: 'Employees', military: 'Operatives', category: 'management' },
  { id: 'manager', civilian: 'Manager', military: 'Command Officer', category: 'management' },
  { id: 'supervisor', civilian: 'Supervisor', military: 'Squad Leader', category: 'management' },
  { id: 'operator', civilian: 'Operator', military: 'Field Agent', category: 'management' },
  { id: 'team', civilian: 'Team', military: 'Unit', category: 'management' },
  { id: 'shift', civilian: 'Shift', military: 'Tour of Duty', category: 'management' },
  
  // Equipment Terms
  { id: 'vehicles', civilian: 'Vehicles', military: 'Mobile Assets', category: 'equipment' },
  { id: 'truck', civilian: 'Truck', military: 'Transport Unit', category: 'equipment' },
  { id: 'equipment', civilian: 'Equipment', military: 'Tactical Gear', category: 'equipment' },
  { id: 'tools', civilian: 'Tools', military: 'Instruments', category: 'equipment' },
  { id: 'maintenance', civilian: 'Maintenance', military: 'Service Ops', category: 'equipment' },
  
  // Operational Terms
  { id: 'project', civilian: 'Project', military: 'Mission', category: 'operations' },
  { id: 'job-site', civilian: 'Job Site', military: 'Area of Operations', category: 'operations' },
  { id: 'schedule', civilian: 'Schedule', military: 'Operations Plan', category: 'operations' },
  { id: 'assignment', civilian: 'Assignment', military: 'Directive', category: 'operations' },
  { id: 'status', civilian: 'Status', military: 'SITREP', category: 'operations' },
  { id: 'alert', civilian: 'Alert', military: 'Warning Order', category: 'operations' },
  { id: 'report', civilian: 'Report', military: 'Intel Brief', category: 'operations' },
  
  // OverWatch Terms
  { id: 'monitoring', civilian: 'Monitoring', military: 'Surveillance', category: 'overwatch' },
  { id: 'tracking', civilian: 'Tracking', military: 'Reconnaissance', category: 'overwatch' },
  { id: 'location', civilian: 'Location', military: 'Coordinates', category: 'overwatch' },
  { id: 'activity', civilian: 'Activity', military: 'Movement', category: 'overwatch' },
  { id: 'perimeter', civilian: 'Area Boundary', military: 'Perimeter', category: 'overwatch' },
  { id: 'sector', civilian: 'Zone', military: 'Sector', category: 'overwatch' },
  
  // Cost/Financial Terms
  { id: 'costs', civilian: 'Costs', military: 'Resource Expenditure', category: 'financial' },
  { id: 'budget', civilian: 'Budget', military: 'Resource Allocation', category: 'financial' },
  { id: 'expenses', civilian: 'Expenses', military: 'Operational Costs', category: 'financial' },
  { id: 'materials', civilian: 'Materials', military: 'Supplies', category: 'financial' },
  
  // Communication Terms
  { id: 'notification', civilian: 'Notification', military: 'Transmission', category: 'communication' },
  { id: 'message', civilian: 'Message', military: 'Communication', category: 'communication' },
  { id: 'update', civilian: 'Update', military: 'Status Report', category: 'communication' },
  
  // System Terms
  { id: 'dashboard', civilian: 'Dashboard', military: 'Command Center', category: 'system' },
  { id: 'control-panel', civilian: 'Control Panel', military: 'Operations Console', category: 'system' },
  { id: 'module', civilian: 'Module', military: 'System Component', category: 'system' },
  { id: 'plugin', civilian: 'Add-on', military: 'Tactical Module', category: 'system' }
];

interface TerminologyProviderProps {
  children: ReactNode;
}

export const TerminologyProvider: React.FC<TerminologyProviderProps> = ({ children }) => {
  const { terminologyMode } = useModuleStore();

  const translate = (civilian: string, military?: string): string => {
    // Find exact match first
    const exactMatch = terminologyDictionary.find(
      entry => entry.civilian.toLowerCase() === civilian.toLowerCase()
    );

    if (exactMatch) {
      switch (terminologyMode) {
        case TerminologyMode.MILITARY:
          return exactMatch.military;
        case TerminologyMode.BOTH:
          return `${exactMatch.civilian} (${exactMatch.military})`;
        case TerminologyMode.CIVILIAN:
        default:
          return exactMatch.civilian;
      }
    }

    // If military override is provided, use it
    if (military) {
      switch (terminologyMode) {
        case TerminologyMode.MILITARY:
          return military;
        case TerminologyMode.BOTH:
          return `${civilian} (${military})`;
        case TerminologyMode.CIVILIAN:
        default:
          return civilian;
      }
    }

    // Fallback to original term
    return civilian;
  };

  const contextValue: TerminologyContextType = {
    translate,
    mode: terminologyMode
  };

  return (
    <TerminologyContext.Provider value={contextValue}>
      {children}
    </TerminologyContext.Provider>
  );
};

export const useTerminology = (): TerminologyContextType => {
  const context = useContext(TerminologyContext);
  if (!context) {
    throw new Error('useTerminology must be used within a TerminologyProvider');
  }
  return context;
};

// Helper hook for easy translation
export const useTranslate = () => {
  const { translate } = useTerminology();
  return translate;
};

// HOC for components that need terminology
export const withTerminology = <P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> => {
  return (props: P) => {
    const terminology = useTerminology();
    return <Component {...props} terminology={terminology} />;
  };
};
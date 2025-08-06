import React, { useState, useEffect } from 'react';
import { Employee, ModuleMetadata } from '@blacktop-blackout-monorepo/shared-types';
import { useTranslate } from '../../components/TerminologyProvider';

interface EmployeeManagementProps {
  moduleMetadata?: ModuleMetadata;
}

interface EmployeeWithStats extends Employee {
  todayHours: number;
  weeklyHours: number;
  monthlyHours: number;
  performanceScore: number;
  complianceStatus: 'compliant' | 'warning' | 'violation';
  lastActivity: Date;
  currentProject?: string;
}

export const EmployeeManagement: React.FC<EmployeeManagementProps> = ({ moduleMetadata }) => {
  const [employees, setEmployees] = useState<EmployeeWithStats[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeWithStats | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  
  const translate = useTranslate();

  // Sample employee data
  useEffect(() => {
    const sampleEmployees: EmployeeWithStats[] = [
      {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@blacktop.com',
        phone: '(555) 123-4567',
        position: translate('Crew Lead', 'Squad Leader'),
        department: translate('Operations', 'Field Operations'),
        hourlyRate: 28.50,
        hireDate: new Date('2022-03-15'),
        status: 'active',
        permissions: ['equipment:operate', 'crew:lead'],
        location: {
          latitude: 40.7128,
          longitude: -74.0060,
          timestamp: new Date(),
          address: 'Site A - Main Street'
        },
        todayHours: 7.5,
        weeklyHours: 42.5,
        monthlyHours: 168.5,
        performanceScore: 92,
        complianceStatus: 'compliant',
        lastActivity: new Date(),
        currentProject: 'Main Street Repaving'
      },
      {
        id: '2',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@blacktop.com',
        phone: '(555) 234-5678',
        position: translate('Equipment Operator', 'Equipment Specialist'),
        department: translate('Operations', 'Field Operations'),
        hourlyRate: 26.00,
        hireDate: new Date('2021-08-20'),
        status: 'active',
        permissions: ['equipment:operate'],
        location: {
          latitude: 40.7489,
          longitude: -73.9857,
          timestamp: new Date(),
          address: 'Site B - Oak Avenue'
        },
        todayHours: 8.0,
        weeklyHours: 40.0,
        monthlyHours: 160.0,
        performanceScore: 88,
        complianceStatus: 'compliant',
        lastActivity: new Date(),
        currentProject: 'Oak Avenue Sealcoating'
      },
      {
        id: '3',
        firstName: 'Mike',
        lastName: 'Chen',
        email: 'mike.chen@blacktop.com',
        phone: '(555) 345-6789',
        position: translate('Laborer', 'Field Agent'),
        department: translate('Operations', 'Field Operations'),
        hourlyRate: 22.00,
        hireDate: new Date('2023-01-10'),
        status: 'active',
        permissions: ['basic:access'],
        todayHours: 6.0,
        weeklyHours: 35.0,
        monthlyHours: 140.0,
        performanceScore: 76,
        complianceStatus: 'warning',
        lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        currentProject: 'Training Program'
      }
    ];
    
    setEmployees(sampleEmployees);
  }, [translate]);

  const filteredEmployees = employees.filter(emp => {
    if (filterStatus === 'all') return true;
    return emp.status === filterStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'var(--bb-accent-success)';
      case 'inactive': return 'var(--bb-text-muted)';
      default: return 'var(--bb-text-secondary)';
    }
  };

  const getComplianceColor = (compliance: string) => {
    switch (compliance) {
      case 'compliant': return 'var(--bb-accent-success)';
      case 'warning': return 'var(--bb-accent-warning)';
      case 'violation': return 'var(--bb-accent-error)';
      default: return 'var(--bb-text-muted)';
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'var(--bb-accent-success)';
    if (score >= 75) return 'var(--bb-accent-warning)';
    return 'var(--bb-accent-error)';
  };

  return (
    <div className="employee-management">
      <div className="module-header">
        <div className="header-content">
          <h1>{translate('Employee Management', 'Personnel Command')}</h1>
          <p>{translate('Manage team members and track performance', 'Command personnel and monitor operations')}</p>
        </div>
        
        <div className="header-actions">
          <div className="view-toggle">
            <button 
              className={`bb-button ${viewMode === 'grid' ? 'primary' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              ⊞
            </button>
            <button 
              className={`bb-button ${viewMode === 'list' ? 'primary' : ''}`}
              onClick={() => setViewMode('list')}
            >
              ☰
            </button>
            <button 
              className={`bb-button ${viewMode === 'map' ? 'primary' : ''}`}
              onClick={() => setViewMode('map')}
            >
              🗺️
            </button>
          </div>
          
          <select 
            className="bb-input"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
          >
            <option value="all">{translate('All Personnel', 'All Operatives')}</option>
            <option value="active">{translate('Active', 'Active')}</option>
            <option value="inactive">{translate('Inactive', 'Inactive')}</option>
          </select>
          
          <button 
            className="bb-button primary"
            onClick={() => setIsAddingEmployee(true)}
          >
            + {translate('Add Employee', 'Add Operative')}
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="stats-grid bb-grid bb-grid-4">
        <div className="bb-card">
          <div className="stat-item">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>{employees.length}</h3>
              <p>{translate('Total Personnel', 'Total Operatives')}</p>
            </div>
          </div>
        </div>
        
        <div className="bb-card">
          <div className="stat-item">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>{employees.filter(e => e.status === 'active').length}</h3>
              <p>{translate('Active Today', 'Deployed Today')}</p>
            </div>
          </div>
        </div>
        
        <div className="bb-card">
          <div className="stat-item">
            <div className="stat-icon">⏱️</div>
            <div className="stat-content">
              <h3>{employees.reduce((sum, e) => sum + e.todayHours, 0).toFixed(1)}</h3>
              <p>{translate('Total Hours Today', 'Total Operational Hours')}</p>
            </div>
          </div>
        </div>
        
        <div className="bb-card">
          <div className="stat-item">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>{(employees.reduce((sum, e) => sum + e.performanceScore, 0) / employees.length).toFixed(0)}%</h3>
              <p>{translate('Avg Performance', 'Avg Efficiency')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Employee List/Grid */}
      <div className="employee-content">
        {viewMode === 'grid' && (
          <div className="employee-grid">
            {filteredEmployees.map(employee => (
              <EmployeeCard 
                key={employee.id}
                employee={employee}
                onClick={() => setSelectedEmployee(employee)}
                translate={translate}
                getStatusColor={getStatusColor}
                getComplianceColor={getComplianceColor}
                getPerformanceColor={getPerformanceColor}
              />
            ))}
          </div>
        )}

        {viewMode === 'list' && (
          <div className="bb-card">
            <EmployeeTable 
              employees={filteredEmployees}
              onSelectEmployee={setSelectedEmployee}
              translate={translate}
              getStatusColor={getStatusColor}
              getComplianceColor={getComplianceColor}
              getPerformanceColor={getPerformanceColor}
            />
          </div>
        )}

        {viewMode === 'map' && (
          <div className="bb-card">
            <EmployeeMap 
              employees={filteredEmployees}
              onSelectEmployee={setSelectedEmployee}
              translate={translate}
            />
          </div>
        )}
      </div>

      {/* Employee Detail Modal */}
      {selectedEmployee && (
        <EmployeeDetailModal
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
          translate={translate}
          getStatusColor={getStatusColor}
          getComplianceColor={getComplianceColor}
          getPerformanceColor={getPerformanceColor}
        />
      )}

      <style jsx>{`
        .employee-management {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .module-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 24px;
        }

        .header-content h1 {
          margin: 0 0 8px 0;
          color: var(--bb-text-primary);
          font-size: 28px;
          font-weight: 600;
        }

        .header-content p {
          margin: 0;
          color: var(--bb-text-secondary);
          font-size: 14px;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .view-toggle {
          display: flex;
          gap: 4px;
          background: var(--bb-bg-tertiary);
          border-radius: var(--bb-border-radius);
          padding: 4px;
        }

        .view-toggle button {
          padding: 8px 12px;
          min-width: 40px;
        }

        .stats-grid {
          margin-bottom: 8px;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .stat-icon {
          font-size: 24px;
          opacity: 0.8;
        }

        .stat-content h3 {
          margin: 0 0 4px 0;
          font-size: 24px;
          font-weight: 700;
          color: var(--bb-text-primary);
        }

        .stat-content p {
          margin: 0;
          font-size: 11px;
          color: var(--bb-text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .employee-content {
          flex: 1;
        }

        .employee-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }

        @media (max-width: 768px) {
          .module-header {
            flex-direction: column;
            align-items: stretch;
          }

          .header-actions {
            justify-content: space-between;
          }

          .employee-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

// Employee Card Component
interface EmployeeCardProps {
  employee: EmployeeWithStats;
  onClick: () => void;
  translate: (civilian: string, military?: string) => string;
  getStatusColor: (status: string) => string;
  getComplianceColor: (compliance: string) => string;
  getPerformanceColor: (score: number) => string;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({ 
  employee, 
  onClick, 
  translate,
  getStatusColor,
  getComplianceColor,
  getPerformanceColor
}) => (
  <div className="bb-card employee-card" onClick={onClick}>
    <div className="employee-header">
      <div className="employee-avatar">
        {employee.firstName[0]}{employee.lastName[0]}
      </div>
      <div className="employee-info">
        <h3>{employee.firstName} {employee.lastName}</h3>
        <p>{employee.position}</p>
      </div>
      <div className="employee-status" style={{ color: getStatusColor(employee.status) }}>
        ●
      </div>
    </div>

    <div className="employee-metrics">
      <div className="metric">
        <span className="metric-label">{translate('Today', 'Current Tour')}</span>
        <span className="metric-value">{employee.todayHours}h</span>
      </div>
      <div className="metric">
        <span className="metric-label">{translate('Performance', 'Efficiency')}</span>
        <span className="metric-value" style={{ color: getPerformanceColor(employee.performanceScore) }}>
          {employee.performanceScore}%
        </span>
      </div>
      <div className="metric">
        <span className="metric-label">{translate('Compliance', 'Status')}</span>
        <span className="metric-value" style={{ color: getComplianceColor(employee.complianceStatus) }}>
          {employee.complianceStatus.toUpperCase()}
        </span>
      </div>
    </div>

    {employee.currentProject && (
      <div className="current-project">
        <span className="project-label">{translate('Current Project', 'Current Mission')}:</span>
        <span className="project-name">{employee.currentProject}</span>
      </div>
    )}

    {employee.location && (
      <div className="employee-location">
        📍 {employee.location.address}
      </div>
    )}

    <style jsx>{`
      .employee-card {
        cursor: pointer;
        transition: all var(--bb-transition-normal);
      }

      .employee-card:hover {
        transform: translateY(-2px);
        border-color: var(--bb-accent-primary);
        box-shadow: var(--bb-glow-primary);
      }

      .employee-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
      }

      .employee-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: var(--bb-accent-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        color: var(--bb-bg-primary);
        font-size: 14px;
      }

      .employee-info {
        flex: 1;
      }

      .employee-info h3 {
        margin: 0 0 4px 0;
        color: var(--bb-text-primary);
        font-size: 16px;
        font-weight: 600;
      }

      .employee-info p {
        margin: 0;
        color: var(--bb-text-secondary);
        font-size: 12px;
      }

      .employee-status {
        font-size: 20px;
      }

      .employee-metrics {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 12px;
        margin-bottom: 16px;
      }

      .metric {
        text-align: center;
      }

      .metric-label {
        display: block;
        font-size: 10px;
        color: var(--bb-text-muted);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 4px;
      }

      .metric-value {
        font-size: 14px;
        font-weight: 600;
        color: var(--bb-text-primary);
      }

      .current-project {
        margin-bottom: 12px;
        padding: 8px;
        background: var(--bb-bg-tertiary);
        border-radius: var(--bb-border-radius-sm);
      }

      .project-label {
        font-size: 10px;
        color: var(--bb-text-muted);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        display: block;
        margin-bottom: 2px;
      }

      .project-name {
        font-size: 12px;
        color: var(--bb-text-primary);
        font-weight: 500;
      }

      .employee-location {
        font-size: 11px;
        color: var(--bb-text-secondary);
        font-style: italic;
      }
    `}</style>
  </div>
);

// Employee Table Component (placeholder)
const EmployeeTable: React.FC<any> = ({ employees, onSelectEmployee, translate }) => (
  <div className="employee-table">
    <h3>{translate('List View', 'Personnel Roster')}</h3>
    <p>{translate('Detailed table view coming soon...', 'Detailed roster view pending...')}</p>
  </div>
);

// Employee Map Component (placeholder)
const EmployeeMap: React.FC<any> = ({ employees, translate }) => (
  <div className="employee-map">
    <h3>{translate('Location Map', 'Tactical Map')}</h3>
    <p>{translate('Real-time location tracking coming soon...', 'Live position tracking pending...')}</p>
  </div>
);

// Employee Detail Modal (placeholder)
const EmployeeDetailModal: React.FC<any> = ({ employee, onClose, translate }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-content bb-card" onClick={e => e.stopPropagation()}>
      <div className="modal-header">
        <h2>{employee.firstName} {employee.lastName}</h2>
        <button className="bb-button" onClick={onClose}>✕</button>
      </div>
      <p>{translate('Detailed employee view coming soon...', 'Personnel details pending...')}</p>
    </div>
    
    <style jsx>{`
      .modal-overlay {
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
      }

      .modal-content {
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }

      .modal-header h2 {
        margin: 0;
        color: var(--bb-text-primary);
      }
    `}</style>
  </div>
);
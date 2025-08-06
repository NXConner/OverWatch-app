import React from 'react';
import { Link } from 'react-router-dom';
import { useModuleStore } from '../../stores/module.store';
import { useTranslate } from '../components/TerminologyProvider';

export const Dashboard: React.FC = () => {
  const { loadedModules, availableModules, loadModule, enableModule } = useModuleStore();
  const translate = useTranslate();

  const systemStats = {
    totalEmployees: 3,
    activeVehicles: 4,
    runningCosts: 2847.50,
    activeProjects: 2
  };

  const recentActivity = [
    { id: 1, type: 'employee', action: 'clocked in', entity: 'John Doe', time: '08:15 AM' },
    { id: 2, type: 'vehicle', action: 'departed', entity: 'Truck #1', time: '08:30 AM' },
    { id: 3, type: 'cost', action: 'expense logged', entity: '$45.60 fuel', time: '09:15 AM' },
    { id: 4, type: 'alert', action: 'geofence alert', entity: 'Site A perimeter', time: '09:45 AM' }
  ];

  const quickActions = [
    { 
      title: translate('OverWatch', 'Command Center'), 
      description: 'Real-time operations monitoring',
      icon: '👁️', 
      path: '/overwatch',
      color: 'accent'
    },
    { 
      title: translate('Personnel', 'Operatives'), 
      description: 'Manage team members and assignments',
      icon: '👥', 
      path: '/employees',
      color: 'secondary'
    },
    { 
      title: translate('Vehicles', 'Mobile Assets'), 
      description: 'Fleet management and tracking',
      icon: '🚛', 
      path: '/vehicles',
      color: 'secondary'
    },
    { 
      title: translate('Marketplace', 'Module Depot'), 
      description: 'Install and manage system modules',
      icon: '🏪', 
      path: '/marketplace',
      color: 'primary'
    }
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="bb-text-3xl bb-font-bold">
            {translate('Dashboard', 'Command Center')}
          </h1>
          <p className="bb-text-secondary">
            {translate('System Overview', 'Operational Status')} - {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* System Status Cards */}
      <div className="status-grid bb-grid bb-grid-4">
        <div className="bb-card accent">
          <div className="status-card">
            <div className="status-icon">👥</div>
            <div className="status-content">
              <h3>{systemStats.totalEmployees}</h3>
              <p>{translate('Active Personnel', 'Active Operatives')}</p>
            </div>
          </div>
        </div>

        <div className="bb-card">
          <div className="status-card">
            <div className="status-icon">🚛</div>
            <div className="status-content">
              <h3>{systemStats.activeVehicles}</h3>
              <p>{translate('Vehicles', 'Mobile Assets')}</p>
            </div>
          </div>
        </div>

        <div className="bb-card">
          <div className="status-card">
            <div className="status-icon">💰</div>
            <div className="status-content">
              <h3>${systemStats.runningCosts.toFixed(2)}</h3>
              <p>{translate('Today\'s Costs', 'Daily Expenditure')}</p>
            </div>
          </div>
        </div>

        <div className="bb-card">
          <div className="status-card">
            <div className="status-icon">📋</div>
            <div className="status-content">
              <h3>{systemStats.activeProjects}</h3>
              <p>{translate('Active Projects', 'Active Missions')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Quick Actions */}
        <div className="dashboard-section">
          <h2 className="section-title">
            {translate('Quick Actions', 'Rapid Deployment')}
          </h2>
          <div className="action-grid bb-grid bb-grid-2">
            {quickActions.map((action, index) => (
              <Link 
                key={index} 
                to={action.path} 
                className={`action-card bb-card ${action.color === 'accent' ? 'accent' : ''}`}
              >
                <div className="action-icon">{action.icon}</div>
                <div className="action-content">
                  <h3>{action.title}</h3>
                  <p>{action.description}</p>
                </div>
                <div className="action-arrow">→</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dashboard-section">
          <h2 className="section-title">
            {translate('Recent Activity', 'Recent Operations')}
          </h2>
          <div className="bb-card">
            <div className="activity-list">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-type">
                    {activity.type === 'employee' && '👤'}
                    {activity.type === 'vehicle' && '🚛'}
                    {activity.type === 'cost' && '💰'}
                    {activity.type === 'alert' && '⚠️'}
                  </div>
                  <div className="activity-content">
                    <p className="activity-text">
                      <strong>{activity.entity}</strong> {activity.action}
                    </p>
                    <span className="activity-time">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Module Status */}
        <div className="dashboard-section full-width">
          <h2 className="section-title">
            {translate('System Modules', 'System Components')}
          </h2>
          <div className="bb-card">
            <div className="module-status">
              <div className="module-stats">
                <div className="stat">
                  <span className="stat-number">{loadedModules.size}</span>
                  <span className="stat-label">
                    {translate('Loaded', 'Active')}
                  </span>
                </div>
                <div className="stat">
                  <span className="stat-number">{availableModules.length}</span>
                  <span className="stat-label">
                    {translate('Available', 'Ready')}
                  </span>
                </div>
              </div>
              
              <div className="loaded-modules">
                {Array.from(loadedModules.values()).map((module) => (
                  <div key={module.metadata.id} className="module-item">
                    <div className="module-info">
                      <span className="module-name">{module.metadata.name}</span>
                      <span className="module-version">v{module.metadata.version}</span>
                    </div>
                    <div className="module-status-indicator">
                      {module.isLoading && <span className="loading">⟳</span>}
                      {module.loadError && <span className="error">⚠️</span>}
                      {!module.isLoading && !module.loadError && <span className="success">✓</span>}
                    </div>
                  </div>
                ))}
                
                {loadedModules.size === 0 && (
                  <p className="no-modules bb-text-muted">
                    {translate('No modules loaded', 'No components active')}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .dashboard {
          max-width: 1400px;
          margin: 0 auto;
        }

        .dashboard-header {
          margin-bottom: 32px;
        }

        .header-content h1 {
          margin-bottom: 8px;
          color: var(--bb-text-primary);
        }

        .status-grid {
          margin-bottom: 32px;
        }

        .status-card {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .status-icon {
          font-size: 32px;
          opacity: 0.8;
        }

        .status-content h3 {
          margin: 0 0 4px 0;
          font-size: 24px;
          font-weight: 700;
          color: var(--bb-text-primary);
        }

        .status-content p {
          margin: 0;
          font-size: 12px;
          color: var(--bb-text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
        }

        .dashboard-section {
          display: flex;
          flex-direction: column;
        }

        .dashboard-section.full-width {
          grid-column: 1 / -1;
        }

        .section-title {
          margin: 0 0 16px 0;
          font-size: 18px;
          font-weight: 600;
          color: var(--bb-text-primary);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .action-grid {
          gap: 16px;
        }

        .action-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          text-decoration: none;
          color: inherit;
          transition: all var(--bb-transition-normal);
          cursor: pointer;
        }

        .action-card:hover {
          transform: translateY(-2px);
        }

        .action-icon {
          font-size: 24px;
          opacity: 0.8;
        }

        .action-content {
          flex: 1;
        }

        .action-content h3 {
          margin: 0 0 4px 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--bb-text-primary);
        }

        .action-content p {
          margin: 0;
          font-size: 12px;
          color: var(--bb-text-secondary);
        }

        .action-arrow {
          font-size: 20px;
          color: var(--bb-accent-primary);
          opacity: 0.6;
          transition: all var(--bb-transition-fast);
        }

        .action-card:hover .action-arrow {
          opacity: 1;
          transform: translateX(4px);
        }

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .activity-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid var(--bb-border-primary);
        }

        .activity-item:last-child {
          border-bottom: none;
        }

        .activity-type {
          font-size: 16px;
          width: 24px;
          text-align: center;
        }

        .activity-content {
          flex: 1;
        }

        .activity-text {
          margin: 0 0 4px 0;
          font-size: 14px;
          color: var(--bb-text-primary);
        }

        .activity-time {
          font-size: 11px;
          color: var(--bb-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .module-status {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .module-stats {
          display: flex;
          gap: 32px;
        }

        .stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .stat-number {
          font-size: 32px;
          font-weight: 700;
          color: var(--bb-accent-primary);
          line-height: 1;
        }

        .stat-label {
          font-size: 11px;
          color: var(--bb-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-top: 4px;
        }

        .loaded-modules {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .module-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: var(--bb-bg-tertiary);
          border-radius: var(--bb-border-radius);
          border: 1px solid var(--bb-border-primary);
        }

        .module-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .module-name {
          font-size: 14px;
          font-weight: 500;
          color: var(--bb-text-primary);
        }

        .module-version {
          font-size: 11px;
          color: var(--bb-text-muted);
          background: var(--bb-bg-primary);
          padding: 2px 6px;
          border-radius: var(--bb-border-radius-sm);
        }

        .module-status-indicator .success {
          color: var(--bb-accent-success);
        }

        .module-status-indicator .error {
          color: var(--bb-accent-error);
        }

        .module-status-indicator .loading {
          color: var(--bb-accent-warning);
          animation: bb-spin 1s linear infinite;
        }

        .no-modules {
          text-align: center;
          padding: 32px;
          font-style: italic;
        }

        @media (max-width: 768px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }

          .action-grid {
            grid-template-columns: 1fr;
          }

          .module-stats {
            gap: 16px;
          }

          .stat-number {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
};
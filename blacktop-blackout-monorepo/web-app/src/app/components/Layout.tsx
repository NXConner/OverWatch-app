import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useModuleStore } from '../../stores/module.store';
import { TerminologyToggle } from './TerminologyToggle';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const { loadedModules, toggleMarketplace } = useModuleStore();

  const navigationItems = [
    { path: '/', label: 'Dashboard', icon: '🏠' },
    { path: '/overwatch', label: 'OverWatch', icon: '👁️' },
    { path: '/employees', label: 'Personnel', icon: '👥' },
    { path: '/vehicles', label: 'Vehicles', icon: '🚛' },
    { path: '/materials', label: 'Materials', icon: '🧱' },
    { path: '/accounting', label: 'Accounting', icon: '💰' },
  ];

  return (
    <div className="layout">
      {/* Header */}
      <header className="layout-header">
        <div className="header-left">
          <button
            className="sidebar-toggle bb-button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          <div className="logo">
            <span className="logo-text">BLACKTOP</span>
            <span className="logo-accent">BLACKOUT</span>
          </div>
        </div>
        
        <div className="header-center">
          <div className="breadcrumb">
            {location.pathname === '/' ? 'Dashboard' : location.pathname.split('/')[1]?.toUpperCase()}
          </div>
        </div>

        <div className="header-right">
          <TerminologyToggle />
          <button 
            className="marketplace-button bb-button primary"
            onClick={toggleMarketplace}
          >
            🏪 Marketplace
          </button>
          <div className="user-menu">
            <button className="bb-button">👤 Admin</button>
          </div>
        </div>
      </header>

      <div className="layout-body">
        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <nav className="sidebar-nav">
            <div className="nav-section">
              <h3 className="nav-section-title">CORE SYSTEMS</h3>
              <ul className="nav-list">
                {navigationItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                    >
                      <span className="nav-icon">{item.icon}</span>
                      <span className="nav-label">{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Dynamic modules section */}
            {loadedModules.size > 0 && (
              <div className="nav-section">
                <h3 className="nav-section-title">LOADED MODULES</h3>
                <ul className="nav-list">
                  {Array.from(loadedModules.values()).map((module) => (
                    <li key={module.metadata.id}>
                      <Link
                        to={`/modules/${module.metadata.id}`}
                        className={`nav-link ${location.pathname.includes(module.metadata.id) ? 'active' : ''}`}
                      >
                        <span className="nav-icon">🔌</span>
                        <span className="nav-label">{module.metadata.name}</span>
                        {module.isLoading && <span className="nav-status loading">⟳</span>}
                        {module.loadError && <span className="nav-status error">⚠️</span>}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* System status */}
            <div className="sidebar-footer">
              <div className="system-status">
                <div className="status-item">
                  <span className="status-indicator online"></span>
                  <span className="status-text">System Online</span>
                </div>
                <div className="status-item">
                  <span className="status-indicator"></span>
                  <span className="status-text">{loadedModules.size} Modules Loaded</span>
                </div>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main content */}
        <main className="main-content">
          <div className="content-wrapper">
            {children}
          </div>
        </main>
      </div>

      <style jsx>{`
        .layout {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: var(--bb-bg-primary);
        }

        .layout-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: var(--bb-header-height);
          padding: 0 24px;
          background: var(--bb-bg-secondary);
          border-bottom: 1px solid var(--bb-border-primary);
          box-shadow: var(--bb-shadow-sm);
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .sidebar-toggle {
          width: 40px;
          height: 40px;
          padding: 0;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 20px;
          font-weight: 700;
        }

        .logo-text {
          color: var(--bb-text-primary);
        }

        .logo-accent {
          color: var(--bb-accent-primary);
          text-shadow: var(--bb-glow-primary);
        }

        .header-center {
          flex: 1;
          display: flex;
          justify-content: center;
        }

        .breadcrumb {
          color: var(--bb-text-secondary);
          font-size: 14px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .marketplace-button {
          font-size: 12px;
          padding: 6px 12px;
        }

        .layout-body {
          display: flex;
          flex: 1;
          overflow: hidden;
        }

        .sidebar {
          width: var(--bb-sidebar-width);
          background: var(--bb-bg-secondary);
          border-right: 1px solid var(--bb-border-primary);
          transition: all var(--bb-transition-normal);
          overflow-y: auto;
        }

        .sidebar.closed {
          width: 60px;
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          height: 100%;
          padding: 24px 0;
        }

        .nav-section {
          margin-bottom: 32px;
        }

        .nav-section-title {
          padding: 0 24px 12px;
          font-size: 11px;
          font-weight: 600;
          color: var(--bb-text-muted);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .sidebar.closed .nav-section-title {
          display: none;
        }

        .nav-list {
          list-style: none;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 24px;
          color: var(--bb-text-secondary);
          text-decoration: none;
          transition: all var(--bb-transition-fast);
          border-left: 3px solid transparent;
        }

        .nav-link:hover {
          background: var(--bb-bg-tertiary);
          color: var(--bb-text-primary);
        }

        .nav-link.active {
          background: var(--bb-bg-tertiary);
          color: var(--bb-accent-primary);
          border-left-color: var(--bb-accent-primary);
          box-shadow: inset 0 0 0 1px rgba(0, 212, 255, 0.1);
        }

        .nav-icon {
          font-size: 16px;
          min-width: 20px;
          text-align: center;
        }

        .nav-label {
          font-size: 14px;
          font-weight: 500;
        }

        .sidebar.closed .nav-label {
          display: none;
        }

        .nav-status {
          margin-left: auto;
          font-size: 12px;
        }

        .nav-status.loading {
          color: var(--bb-accent-warning);
          animation: bb-spin 1s linear infinite;
        }

        .nav-status.error {
          color: var(--bb-accent-error);
        }

        .sidebar-footer {
          margin-top: auto;
          padding: 0 24px;
        }

        .system-status {
          border-top: 1px solid var(--bb-border-primary);
          padding-top: 16px;
        }

        .status-item {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--bb-border-primary);
        }

        .status-indicator.online {
          background: var(--bb-accent-success);
          box-shadow: 0 0 4px rgba(0, 255, 136, 0.4);
        }

        .status-text {
          font-size: 11px;
          color: var(--bb-text-muted);
        }

        .sidebar.closed .system-status {
          display: none;
        }

        .main-content {
          flex: 1;
          overflow-y: auto;
          background: var(--bb-bg-primary);
        }

        .content-wrapper {
          padding: 24px;
          max-width: 1400px;
          margin: 0 auto;
        }

        @media (max-width: 768px) {
          .sidebar {
            position: fixed;
            left: 0;
            top: var(--bb-header-height);
            height: calc(100vh - var(--bb-header-height));
            z-index: 1000;
            transform: translateX(-100%);
          }

          .sidebar.open {
            transform: translateX(0);
          }

          .main-content {
            width: 100%;
          }

          .header-center {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};
import React from 'react';
import { TerminologyMode } from '@blacktop-blackout-monorepo/shared-types';
import { useModuleStore } from '../../stores/module.store';

export const TerminologyToggle: React.FC = () => {
  const { terminologyMode, setTerminologyMode } = useModuleStore();

  const modes = [
    { value: TerminologyMode.CIVILIAN, label: 'CIV', icon: '👔' },
    { value: TerminologyMode.MILITARY, label: 'MIL', icon: '🎖️' },
    { value: TerminologyMode.BOTH, label: 'BOTH', icon: '🔄' }
  ];

  return (
    <div className="terminology-toggle">
      <div className="toggle-label">
        <span className="label-text">TERMS</span>
      </div>
      <div className="toggle-buttons">
        {modes.map((mode) => (
          <button
            key={mode.value}
            className={`toggle-button ${terminologyMode === mode.value ? 'active' : ''}`}
            onClick={() => setTerminologyMode(mode.value)}
            title={`Switch to ${mode.label.toLowerCase()} terminology`}
          >
            <span className="button-icon">{mode.icon}</span>
            <span className="button-label">{mode.label}</span>
          </button>
        ))}
      </div>

      <style jsx>{`
        .terminology-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .toggle-label {
          font-size: 10px;
          color: var(--bb-text-muted);
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 600;
        }

        .toggle-buttons {
          display: flex;
          background: var(--bb-bg-primary);
          border: 1px solid var(--bb-border-primary);
          border-radius: var(--bb-border-radius);
          overflow: hidden;
        }

        .toggle-button {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 8px;
          background: transparent;
          border: none;
          color: var(--bb-text-secondary);
          font-size: 10px;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--bb-transition-fast);
          min-width: 50px;
          justify-content: center;
        }

        .toggle-button:hover {
          background: var(--bb-bg-tertiary);
          color: var(--bb-text-primary);
        }

        .toggle-button.active {
          background: var(--bb-accent-primary);
          color: var(--bb-bg-primary);
          box-shadow: var(--bb-glow-primary);
        }

        .button-icon {
          font-size: 12px;
        }

        .button-label {
          font-size: 9px;
          letter-spacing: 0.5px;
        }

        @media (max-width: 768px) {
          .toggle-label {
            display: none;
          }
          
          .button-label {
            display: none;
          }
          
          .toggle-button {
            min-width: 32px;
            padding: 6px;
          }
        }
      `}</style>
    </div>
  );
};
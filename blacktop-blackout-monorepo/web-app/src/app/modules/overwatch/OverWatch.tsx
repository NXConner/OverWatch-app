import React, { useState, useEffect } from 'react';
import { ModuleMetadata, OverWatchData, GeolocationData } from '@blacktop-blackout-monorepo/shared-types';
import { useTranslate } from '../../components/TerminologyProvider';

interface OverWatchProps {
  moduleMetadata?: ModuleMetadata;
}

interface LiveAsset {
  id: string;
  name: string;
  type: 'employee' | 'vehicle' | 'equipment';
  status: 'active' | 'idle' | 'maintenance' | 'offline';
  location: GeolocationData;
  speed?: number;
  activity: 'driving' | 'walking' | 'working' | 'stationary' | 'phone-usage';
  lastUpdate: Date;
  project?: string;
}

interface CostBreakdown {
  category: string;
  amount: number;
  percentage: number;
  items: { name: string; cost: number; time?: string }[];
}

export const OverWatch: React.FC<OverWatchProps> = ({ moduleMetadata }) => {
  const [currentView, setCurrentView] = useState<'overview' | 'map' | 'costs' | 'weather' | 'playback'>('overview');
  const [liveAssets, setLiveAssets] = useState<LiveAsset[]>([]);
  const [dailyCosts, setDailyCosts] = useState<CostBreakdown[]>([]);
  const [totalDailyCost, setTotalDailyCost] = useState(0);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [selectedMapService, setSelectedMapService] = useState('google');
  
  const translate = useTranslate();

  // Initialize live data
  useEffect(() => {
    // Sample live assets
    const assets: LiveAsset[] = [
      {
        id: 'emp-1',
        name: 'John Doe',
        type: 'employee',
        status: 'active',
        location: {
          latitude: 40.7128,
          longitude: -74.0060,
          timestamp: new Date(),
          address: 'Site A - Main Street'
        },
        activity: 'working',
        lastUpdate: new Date(),
        project: 'Main Street Repaving'
      },
      {
        id: 'emp-2',
        name: 'Sarah Johnson',
        type: 'employee',
        status: 'active',
        location: {
          latitude: 40.7489,
          longitude: -73.9857,
          timestamp: new Date(),
          address: 'Site B - Oak Avenue'
        },
        activity: 'phone-usage',
        lastUpdate: new Date(),
        project: 'Oak Avenue Sealcoating'
      },
      {
        id: 'veh-1',
        name: 'Truck #1',
        type: 'vehicle',
        status: 'active',
        location: {
          latitude: 40.7356,
          longitude: -74.0034,
          timestamp: new Date(),
          address: 'En route to Site C'
        },
        speed: 35,
        activity: 'driving',
        lastUpdate: new Date()
      },
      {
        id: 'eq-1',
        name: 'Paver Unit A',
        type: 'equipment',
        status: 'active',
        location: {
          latitude: 40.7128,
          longitude: -74.0060,
          timestamp: new Date(),
          address: 'Site A - Main Street'
        },
        activity: 'working',
        lastUpdate: new Date(),
        project: 'Main Street Repaving'
      }
    ];
    
    setLiveAssets(assets);

    // Sample cost data
    const costs: CostBreakdown[] = [
      {
        category: translate('Labor', 'Personnel'),
        amount: 1680.00,
        percentage: 59,
        items: [
          { name: 'John Doe (7.5h)', cost: 213.75, time: '08:00 AM' },
          { name: 'Sarah Johnson (8.0h)', cost: 208.00, time: '08:15 AM' },
          { name: 'Mike Chen (6.0h)', cost: 132.00, time: '09:00 AM' },
          { name: 'Overtime Premium', cost: 126.25, time: '05:30 PM' }
        ]
      },
      {
        category: translate('Materials', 'Supplies'),
        amount: 845.60,
        percentage: 30,
        items: [
          { name: 'Asphalt Mix (8 tons)', cost: 480.00, time: '07:30 AM' },
          { name: 'Crack Filler (2 boxes)', cost: 89.90, time: '10:15 AM' },
          { name: 'Sealant (5 gallons)', cost: 189.50, time: '02:30 PM' },
          { name: 'Aggregate (3 tons)', cost: 86.20, time: '03:45 PM' }
        ]
      },
      {
        category: translate('Fuel & Equipment', 'Operational Assets'),
        amount: 321.90,
        percentage: 11,
        items: [
          { name: 'Diesel Fuel (45 gal)', cost: 180.00, time: '06:45 AM' },
          { name: 'Equipment Rental', cost: 125.00, time: '08:00 AM' },
          { name: 'Propane (2 tanks)', cost: 16.90, time: '11:30 AM' }
        ]
      }
    ];
    
    setDailyCosts(costs);
    setTotalDailyCost(costs.reduce((sum, cost) => sum + cost.amount, 0));

    // Sample weather data
    setWeatherData({
      current: {
        temperature: 72,
        feelsLike: 75,
        humidity: 68,
        windSpeed: 8,
        conditions: 'Partly Cloudy',
        uvIndex: 6,
        visibility: 10
      },
      forecast: {
        rainProbability: 15,
        nextRain: '6+ hours',
        recommendation: 'Optimal conditions for sealcoating'
      }
    });

    // Sample alerts
    setAlerts([
      {
        id: 1,
        type: 'phone-usage',
        severity: 'warning',
        message: 'Sarah Johnson - Non-work phone usage detected',
        timestamp: new Date(),
        location: 'Site B'
      },
      {
        id: 2,
        type: 'geofence',
        severity: 'info',
        message: 'Truck #1 entering project zone',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        location: 'Site C perimeter'
      }
    ]);
  }, [translate]);

  const mapServices = [
    { id: 'google', name: 'Google Maps' },
    { id: 'qgis', name: 'QGIS' },
    { id: 'openstreet', name: 'OpenStreetMap' },
    { id: 'arcgis', name: 'ArcGIS' },
    { id: 'mapbox', name: 'Mapbox' }
  ];

  const getAssetStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'var(--bb-accent-success)';
      case 'idle': return 'var(--bb-accent-warning)';
      case 'maintenance': return 'var(--bb-accent-error)';
      case 'offline': return 'var(--bb-text-muted)';
      default: return 'var(--bb-text-secondary)';
    }
  };

  const getActivityIcon = (activity: string) => {
    switch (activity) {
      case 'driving': return '🚗';
      case 'walking': return '🚶';
      case 'working': return '🔧';
      case 'stationary': return '⏸️';
      case 'phone-usage': return '📱';
      default: return '❓';
    }
  };

  const getAssetTypeIcon = (type: string) => {
    switch (type) {
      case 'employee': return '👤';
      case 'vehicle': return '🚛';
      case 'equipment': return '⚙️';
      default: return '📍';
    }
  };

  return (
    <div className="overwatch-system">
      {/* Header */}
      <div className="overwatch-header">
        <div className="header-left">
          <h1 className="overwatch-title">
            {translate('OverWatch Command Center', 'TACTICAL OPERATIONS CENTER')}
          </h1>
          <div className="system-status">
            <span className="status-indicator online"></span>
            <span className="status-text">
              {translate('System Online', 'All Systems Operational')}
            </span>
          </div>
        </div>
        
        <div className="header-right">
          <div className="datetime">
            <div className="date">{new Date().toLocaleDateString()}</div>
            <div className="time">{new Date().toLocaleTimeString()}</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="overwatch-nav">
        <button
          className={`nav-button ${currentView === 'overview' ? 'active' : ''}`}
          onClick={() => setCurrentView('overview')}
        >
          <span className="nav-icon">📊</span>
          <span className="nav-label">{translate('Overview', 'SITREP')}</span>
        </button>
        <button
          className={`nav-button ${currentView === 'map' ? 'active' : ''}`}
          onClick={() => setCurrentView('map')}
        >
          <span className="nav-icon">🗺️</span>
          <span className="nav-label">{translate('Live Map', 'Tactical Map')}</span>
        </button>
        <button
          className={`nav-button ${currentView === 'costs' ? 'active' : ''}`}
          onClick={() => setCurrentView('costs')}
        >
          <span className="nav-icon">💰</span>
          <span className="nav-label">{translate('Cost Center', 'Resource Tracking')}</span>
        </button>
        <button
          className={`nav-button ${currentView === 'weather' ? 'active' : ''}`}
          onClick={() => setCurrentView('weather')}
        >
          <span className="nav-icon">🌤️</span>
          <span className="nav-label">{translate('Weather Intel', 'Environmental Data')}</span>
        </button>
        <button
          className={`nav-button ${currentView === 'playback' ? 'active' : ''}`}
          onClick={() => setCurrentView('playback')}
        >
          <span className="nav-icon">⏯️</span>
          <span className="nav-label">{translate('Day Playback', 'Mission Replay')}</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="overwatch-content">
        {currentView === 'overview' && (
          <OverviewPanel
            liveAssets={liveAssets}
            dailyCosts={dailyCosts}
            totalDailyCost={totalDailyCost}
            weatherData={weatherData}
            alerts={alerts}
            translate={translate}
            getAssetStatusColor={getAssetStatusColor}
            getActivityIcon={getActivityIcon}
            getAssetTypeIcon={getAssetTypeIcon}
          />
        )}

        {currentView === 'map' && (
          <MapPanel
            liveAssets={liveAssets}
            selectedMapService={selectedMapService}
            mapServices={mapServices}
            onMapServiceChange={setSelectedMapService}
            translate={translate}
            getAssetStatusColor={getAssetStatusColor}
            getAssetTypeIcon={getAssetTypeIcon}
          />
        )}

        {currentView === 'costs' && (
          <CostPanel
            dailyCosts={dailyCosts}
            totalDailyCost={totalDailyCost}
            translate={translate}
          />
        )}

        {currentView === 'weather' && (
          <WeatherPanel
            weatherData={weatherData}
            translate={translate}
          />
        )}

        {currentView === 'playback' && (
          <PlaybackPanel
            translate={translate}
          />
        )}
      </div>

      <style jsx>{`
        .overwatch-system {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: var(--bb-bg-primary);
          color: var(--bb-text-primary);
        }

        .overwatch-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          background: var(--bb-bg-secondary);
          border-bottom: 2px solid var(--bb-accent-primary);
          box-shadow: var(--bb-glow-primary);
        }

        .overwatch-title {
          margin: 0 0 8px 0;
          font-size: 28px;
          font-weight: 700;
          color: var(--bb-accent-primary);
          text-transform: uppercase;
          letter-spacing: 2px;
          text-shadow: var(--bb-glow-primary);
        }

        .system-status {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .status-indicator {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--bb-accent-success);
          box-shadow: 0 0 6px rgba(0, 255, 136, 0.6);
          animation: pulse 2s infinite;
        }

        .status-text {
          font-size: 12px;
          color: var(--bb-text-secondary);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .datetime {
          text-align: right;
        }

        .date {
          font-size: 14px;
          color: var(--bb-text-primary);
          font-weight: 600;
        }

        .time {
          font-size: 12px;
          color: var(--bb-text-secondary);
          font-family: var(--bb-font-mono);
        }

        .overwatch-nav {
          display: flex;
          background: var(--bb-bg-tertiary);
          border-bottom: 1px solid var(--bb-border-primary);
          overflow-x: auto;
        }

        .nav-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 16px 20px;
          background: transparent;
          border: none;
          color: var(--bb-text-secondary);
          cursor: pointer;
          transition: all var(--bb-transition-fast);
          white-space: nowrap;
          border-bottom: 3px solid transparent;
        }

        .nav-button:hover {
          background: var(--bb-bg-secondary);
          color: var(--bb-text-primary);
        }

        .nav-button.active {
          background: var(--bb-bg-secondary);
          color: var(--bb-accent-primary);
          border-bottom-color: var(--bb-accent-primary);
          box-shadow: inset 0 0 10px rgba(0, 212, 255, 0.1);
        }

        .nav-icon {
          font-size: 16px;
        }

        .nav-label {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .overwatch-content {
          flex: 1;
          overflow: auto;
          padding: 24px;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }

        @media (max-width: 768px) {
          .overwatch-header {
            flex-direction: column;
            align-items: stretch;
            gap: 16px;
          }

          .nav-button {
            padding: 12px 16px;
          }

          .nav-label {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

// Overview Panel Component
const OverviewPanel: React.FC<any> = ({ 
  liveAssets, 
  dailyCosts, 
  totalDailyCost, 
  weatherData, 
  alerts, 
  translate,
  getAssetStatusColor,
  getActivityIcon,
  getAssetTypeIcon 
}) => (
  <div className="overview-panel">
    <div className="panel-grid">
      {/* Live Cost Center */}
      <div className="bb-card accent cost-center-card">
        <div className="card-header">
          <h3>{translate('Live Cost Center', 'Resource Expenditure')}</h3>
          <div className="last-update">Updated 2 min ago</div>
        </div>
        <div className="cost-display">
          <div className="total-cost">${totalDailyCost.toFixed(2)}</div>
          <div className="cost-period">{translate('Today\'s Total', 'Daily Expenditure')}</div>
        </div>
        <div className="cost-breakdown">
          {dailyCosts.map((cost, index) => (
            <div key={index} className="cost-item">
              <div className="cost-info">
                <span className="cost-category">{cost.category}</span>
                <span className="cost-amount">${cost.amount.toFixed(2)}</span>
              </div>
              <div className="cost-bar">
                <div 
                  className="cost-fill" 
                  style={{ width: `${cost.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Assets */}
      <div className="bb-card live-assets-card">
        <div className="card-header">
          <h3>{translate('Live Assets', 'Active Resources')}</h3>
          <div className="asset-count">{liveAssets.length} {translate('Active', 'Deployed')}</div>
        </div>
        <div className="assets-list">
          {liveAssets.map(asset => (
            <div key={asset.id} className="asset-item">
              <div className="asset-icon">
                {getAssetTypeIcon(asset.type)}
              </div>
              <div className="asset-info">
                <div className="asset-name">{asset.name}</div>
                <div className="asset-location">{asset.location.address}</div>
              </div>
              <div className="asset-status">
                <div className="activity-icon">{getActivityIcon(asset.activity)}</div>
                <div 
                  className="status-dot" 
                  style={{ backgroundColor: getAssetStatusColor(asset.status) }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weather Intelligence */}
      <div className="bb-card weather-card">
        <div className="card-header">
          <h3>{translate('Weather Intelligence', 'Environmental Data')}</h3>
        </div>
        {weatherData && (
          <div className="weather-content">
            <div className="current-weather">
              <div className="temperature">{weatherData.current.temperature}°F</div>
              <div className="conditions">{weatherData.current.conditions}</div>
            </div>
            <div className="weather-details">
              <div className="detail">
                <span>💧 {weatherData.current.humidity}%</span>
              </div>
              <div className="detail">
                <span>💨 {weatherData.current.windSpeed} mph</span>
              </div>
              <div className="detail">
                <span>☀️ UV {weatherData.current.uvIndex}</span>
              </div>
            </div>
            <div className="recommendation">
              <strong>{translate('Recommendation', 'Advisory')}:</strong><br/>
              {weatherData.forecast.recommendation}
            </div>
          </div>
        )}
      </div>

      {/* Active Alerts */}
      <div className="bb-card alerts-card">
        <div className="card-header">
          <h3>{translate('Active Alerts', 'Current Alerts')}</h3>
          <div className="alert-count">{alerts.length}</div>
        </div>
        <div className="alerts-list">
          {alerts.map(alert => (
            <div key={alert.id} className="alert-item">
              <div className={`alert-severity ${alert.severity}`}>
                {alert.severity === 'warning' ? '⚠️' : 'ℹ️'}
              </div>
              <div className="alert-content">
                <div className="alert-message">{alert.message}</div>
                <div className="alert-meta">
                  {alert.location} • {alert.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    <style jsx>{`
      .overview-panel {
        height: 100%;
      }

      .panel-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
        height: 100%;
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }

      .card-header h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: var(--bb-text-primary);
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      .last-update, .asset-count, .alert-count {
        font-size: 11px;
        color: var(--bb-text-muted);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      /* Cost Center Styles */
      .cost-center-card {
        grid-row: span 2;
      }

      .cost-display {
        text-align: center;
        margin-bottom: 24px;
      }

      .total-cost {
        font-size: 48px;
        font-weight: 700;
        color: var(--bb-accent-primary);
        line-height: 1;
        font-family: var(--bb-font-mono);
        text-shadow: var(--bb-glow-primary);
      }

      .cost-period {
        font-size: 12px;
        color: var(--bb-text-secondary);
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-top: 4px;
      }

      .cost-breakdown {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .cost-item {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .cost-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .cost-category {
        font-size: 13px;
        color: var(--bb-text-primary);
        font-weight: 500;
      }

      .cost-amount {
        font-size: 14px;
        color: var(--bb-accent-primary);
        font-weight: 600;
        font-family: var(--bb-font-mono);
      }

      .cost-bar {
        height: 6px;
        background: var(--bb-bg-primary);
        border-radius: 3px;
        overflow: hidden;
      }

      .cost-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--bb-accent-primary), var(--bb-accent-secondary));
        border-radius: 3px;
        transition: width var(--bb-transition-normal);
      }

      /* Live Assets Styles */
      .assets-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .asset-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        background: var(--bb-bg-tertiary);
        border-radius: var(--bb-border-radius);
        border: 1px solid var(--bb-border-primary);
      }

      .asset-icon {
        font-size: 20px;
        width: 32px;
        text-align: center;
      }

      .asset-info {
        flex: 1;
      }

      .asset-name {
        font-size: 14px;
        color: var(--bb-text-primary);
        font-weight: 500;
        margin-bottom: 2px;
      }

      .asset-location {
        font-size: 11px;
        color: var(--bb-text-secondary);
      }

      .asset-status {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .activity-icon {
        font-size: 16px;
      }

      .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        box-shadow: 0 0 4px currentColor;
      }

      /* Weather Styles */
      .weather-content {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .current-weather {
        text-align: center;
      }

      .temperature {
        font-size: 36px;
        font-weight: 700;
        color: var(--bb-accent-primary);
        line-height: 1;
      }

      .conditions {
        font-size: 14px;
        color: var(--bb-text-secondary);
        margin-top: 4px;
      }

      .weather-details {
        display: flex;
        justify-content: space-around;
        padding: 12px 0;
        border-top: 1px solid var(--bb-border-primary);
        border-bottom: 1px solid var(--bb-border-primary);
      }

      .detail {
        font-size: 12px;
        color: var(--bb-text-secondary);
      }

      .recommendation {
        font-size: 12px;
        color: var(--bb-text-primary);
        background: var(--bb-bg-tertiary);
        padding: 12px;
        border-radius: var(--bb-border-radius);
        border-left: 3px solid var(--bb-accent-success);
      }

      /* Alerts Styles */
      .alerts-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .alert-item {
        display: flex;
        gap: 12px;
        padding: 12px;
        background: var(--bb-bg-tertiary);
        border-radius: var(--bb-border-radius);
        border: 1px solid var(--bb-border-primary);
      }

      .alert-severity {
        font-size: 16px;
        width: 24px;
        text-align: center;
      }

      .alert-severity.warning {
        color: var(--bb-accent-warning);
      }

      .alert-severity.info {
        color: var(--bb-accent-primary);
      }

      .alert-content {
        flex: 1;
      }

      .alert-message {
        font-size: 13px;
        color: var(--bb-text-primary);
        margin-bottom: 4px;
      }

      .alert-meta {
        font-size: 10px;
        color: var(--bb-text-muted);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      @media (max-width: 768px) {
        .panel-grid {
          grid-template-columns: 1fr;
          gap: 16px;
        }

        .cost-center-card {
          grid-row: auto;
        }

        .total-cost {
          font-size: 36px;
        }
      }
    `}</style>
  </div>
);

// Map Panel Component (placeholder for now)
const MapPanel: React.FC<any> = ({ liveAssets, selectedMapService, mapServices, onMapServiceChange, translate }) => (
  <div className="map-panel bb-card">
    <div className="map-header">
      <h3>{translate('Live Tactical Map', 'Real-time Asset Tracking')}</h3>
      <select 
        className="bb-input"
        value={selectedMapService}
        onChange={(e) => onMapServiceChange(e.target.value)}
      >
        {mapServices.map(service => (
          <option key={service.id} value={service.id}>
            {service.name}
          </option>
        ))}
      </select>
    </div>
    <div className="map-placeholder">
      <div className="map-icon">🗺️</div>
      <h4>{translate('Interactive Map Coming Soon', 'Tactical Display Pending')}</h4>
      <p>{translate('Real-time asset tracking with', 'Live position monitoring via')} {mapServices.find(s => s.id === selectedMapService)?.name}</p>
      <div className="asset-summary">
        <strong>{liveAssets.length} {translate('assets tracked', 'resources monitored')}</strong>
      </div>
    </div>
    
    <style jsx>{`
      .map-panel {
        height: 600px;
        display: flex;
        flex-direction: column;
      }

      .map-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }

      .map-header h3 {
        margin: 0;
        color: var(--bb-text-primary);
      }

      .map-placeholder {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        color: var(--bb-text-secondary);
        border: 2px dashed var(--bb-border-primary);
        border-radius: var(--bb-border-radius);
      }

      .map-icon {
        font-size: 48px;
        margin-bottom: 16px;
        opacity: 0.6;
      }

      .map-placeholder h4 {
        margin: 0 0 8px 0;
        color: var(--bb-text-primary);
      }

      .asset-summary {
        margin-top: 16px;
        color: var(--bb-accent-primary);
      }
    `}</style>
  </div>
);

// Cost Panel Component (placeholder)
const CostPanel: React.FC<any> = ({ dailyCosts, totalDailyCost, translate }) => (
  <div className="cost-panel bb-card">
    <h3>{translate('Detailed Cost Analysis', 'Resource Expenditure Analysis')}</h3>
    <p>{translate('Comprehensive cost breakdown and analysis coming soon...', 'Detailed financial analysis pending...')}</p>
  </div>
);

// Weather Panel Component (placeholder)
const WeatherPanel: React.FC<any> = ({ weatherData, translate }) => (
  <div className="weather-panel bb-card">
    <h3>{translate('Environmental Intelligence Center', 'Weather Operations Command')}</h3>
    <p>{translate('Advanced weather analysis and recommendations coming soon...', 'Enhanced environmental data pending...')}</p>
  </div>
);

// Playback Panel Component (placeholder)
const PlaybackPanel: React.FC<any> = ({ translate }) => (
  <div className="playback-panel bb-card">
    <h3>{translate('Day in Review Playback', 'Mission Replay System')}</h3>
    <p>{translate('Animated replay of daily operations coming soon...', 'Temporal mission analysis pending...')}</p>
  </div>
);
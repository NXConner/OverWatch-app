// Core Plugin System Types
export interface PluginInterface {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  dependencies?: string[];
  permissions?: string[];
  metadata?: Record<string, any>;
}

export interface PluginModule extends PluginInterface {
  initialize(context: PluginContext): Promise<void>;
  destroy(): Promise<void>;
  enable(): Promise<void>;
  disable(): Promise<void>;
}

export interface PluginContext {
  api: PluginApi;
  config: Record<string, any>;
  logger: Logger;
  events: EventEmitter;
}

export interface PluginApi {
  database: DatabaseApi;
  messaging: MessagingApi;
  storage: StorageApi;
  auth: AuthApi;
}

// Module Types
export enum ModuleType {
  BACKEND = 'backend',
  FRONTEND_REACT = 'frontend-react',
  FRONTEND_FLUTTER = 'frontend-flutter',
  CORE = 'core'
}

export interface ModuleMetadata {
  id: string;
  name: string;
  type: ModuleType;
  version: string;
  description: string;
  author: string;
  category: string;
  tags: string[];
  enabled: boolean;
  installed: boolean;
  installDate?: Date;
  lastUpdated?: Date;
  size: number;
  repository?: string;
  homepage?: string;
  license: string;
  screenshots?: string[];
  pricing?: ModulePricing;
}

export interface ModulePricing {
  type: 'free' | 'paid' | 'subscription';
  price?: number;
  currency?: string;
  billingPeriod?: 'monthly' | 'yearly' | 'one-time';
}

// Terminology System
export enum TerminologyMode {
  MILITARY = 'military',
  CIVILIAN = 'civilian',
  BOTH = 'both'
}

export interface TerminologyEntry {
  id: string;
  civilian: string;
  military: string;
  category: string;
  context?: string;
}

// Core Business Entities
export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  hourlyRate: number;
  hireDate: Date;
  status: 'active' | 'inactive' | 'terminated';
  location?: GeolocationData;
  permissions: string[];
  metadata?: Record<string, any>;
}

export interface Vehicle {
  id: string;
  name: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  licensePlate: string;
  type: 'truck' | 'trailer' | 'equipment';
  gvwr?: number;
  currentWeight?: number;
  fuelType: 'gasoline' | 'diesel' | 'electric';
  fuelCapacity: number;
  currentFuelLevel?: number;
  mileage: number;
  lastMaintenance?: Date;
  nextMaintenance?: Date;
  registrationExpiry: Date;
  insuranceExpiry: Date;
  location?: GeolocationData;
  status: 'active' | 'maintenance' | 'out-of-service';
  metadata?: Record<string, any>;
}

export interface Equipment {
  id: string;
  name: string;
  type: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  purchaseDate: Date;
  warrantyExpiry?: Date;
  operatingHours: number;
  lastMaintenance?: Date;
  nextMaintenance?: Date;
  status: 'active' | 'maintenance' | 'out-of-service';
  location?: GeolocationData;
  specifications?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface Material {
  id: string;
  name: string;
  category: string;
  supplier: string;
  unitType: string;
  costPerUnit: number;
  currentStock: number;
  minStockLevel: number;
  maxStockLevel: number;
  specifications?: Record<string, any>;
  msdsDocument?: string;
  lastRestocked?: Date;
  expiryDate?: Date;
  metadata?: Record<string, any>;
}

// Geospatial Types
export interface GeolocationData {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  timestamp: Date;
  address?: string;
  geofenceId?: string;
}

export interface Geofence {
  id: string;
  name: string;
  type: 'circle' | 'polygon';
  coordinates: number[][];
  radius?: number;
  metadata?: Record<string, any>;
}

// OverWatch System Types
export interface OverWatchData {
  realTimeLocations: Map<string, GeolocationData>;
  dailyCosts: DailyCostSummary;
  weather: WeatherData;
  activities: ActivityLog[];
  alerts: Alert[];
}

export interface DailyCostSummary {
  date: Date;
  totalCosts: number;
  laborCosts: number;
  materialCosts: number;
  fuelCosts: number;
  equipmentCosts: number;
  otherCosts: number;
  breakdown: CostBreakdown[];
}

export interface CostBreakdown {
  category: string;
  amount: number;
  description: string;
  timestamp: Date;
  associatedId?: string;
}

export interface WeatherData {
  current: CurrentWeather;
  hourlyForecast: HourlyWeather[];
  radarData?: RadarData;
  alerts: WeatherAlert[];
}

export interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  visibility: number;
  uvIndex: number;
  airQualityIndex: number;
  conditions: string;
  timestamp: Date;
}

export interface HourlyWeather {
  timestamp: Date;
  temperature: number;
  precipitation: number;
  precipitationProbability: number;
  windSpeed: number;
  conditions: string;
}

export interface RadarData {
  imageUrl: string;
  timestamp: Date;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

export interface WeatherAlert {
  id: string;
  type: 'rain' | 'storm' | 'high-wind' | 'temperature';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  startTime: Date;
  endTime?: Date;
  affectedArea: Geofence;
}

export interface ActivityLog {
  id: string;
  employeeId: string;
  vehicleId?: string;
  activity: 'driving' | 'passenger' | 'walking' | 'stationary' | 'phone-usage';
  location: GeolocationData;
  duration: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface Alert {
  id: string;
  type: 'geofence' | 'cost' | 'weather' | 'maintenance' | 'compliance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  relatedEntityId?: string;
  metadata?: Record<string, any>;
}

// PavementScan Pro Types
export interface ScanData {
  id: string;
  projectId: string;
  location: GeolocationData;
  scanDate: Date;
  scannedBy: string;
  surfaceType: 'asphalt' | 'concrete' | 'gravel' | 'other';
  totalArea: number;
  perimeter: number;
  model3dUrl?: string;
  defects: SurfaceDefect[];
  metadata?: Record<string, any>;
}

export interface SurfaceDefect {
  id: string;
  type: 'crack' | 'pothole' | 'alligator' | 'broken-area' | 'water-pooling' | 'subsurface';
  severity: 'low' | 'medium' | 'high' | 'critical';
  coordinates: number[][];
  measurements: DefectMeasurements;
  confidence: number;
  detectedBy: 'ai' | 'manual';
  description?: string;
  repairRecommendation?: string;
  estimatedCost?: number;
}

export interface DefectMeasurements {
  length?: number;
  width?: number;
  area?: number;
  depth?: number;
  volume?: number;
  perimeter?: number;
}

// Event System
export interface EventEmitter {
  on(event: string, listener: (...args: any[]) => void): void;
  off(event: string, listener: (...args: any[]) => void): void;
  emit(event: string, ...args: any[]): void;
}

// API Interfaces
export interface DatabaseApi {
  query<T>(sql: string, params?: any[]): Promise<T[]>;
  insert<T>(table: string, data: Partial<T>): Promise<T>;
  update<T>(table: string, id: string, data: Partial<T>): Promise<T>;
  delete(table: string, id: string): Promise<boolean>;
}

export interface MessagingApi {
  publish(topic: string, message: any): Promise<void>;
  subscribe(topic: string, callback: (message: any) => void): Promise<void>;
  unsubscribe(topic: string): Promise<void>;
}

export interface StorageApi {
  upload(key: string, data: Buffer | string): Promise<string>;
  download(key: string): Promise<Buffer>;
  delete(key: string): Promise<boolean>;
  exists(key: string): Promise<boolean>;
}

export interface AuthApi {
  getCurrentUser(): Promise<User | null>;
  hasPermission(permission: string): Promise<boolean>;
  createToken(payload: any): Promise<string>;
  verifyToken(token: string): Promise<any>;
}

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  permissions: string[];
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

// Logger Interface
export interface Logger {
  debug(message: string, meta?: any): void;
  info(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  error(message: string, meta?: any): void;
}

// Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

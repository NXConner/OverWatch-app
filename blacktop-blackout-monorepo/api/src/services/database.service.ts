import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { migrate } from 'drizzle-kit/migrator';
import { DatabaseApi, Logger } from '@blacktop-blackout-monorepo/shared-types';

export class DatabaseService implements DatabaseApi {
  private pool: Pool;
  private db: any;
  private logger: Logger;
  private isInitialized: boolean = false;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing database connection...');

      // Create connection pool
      this.pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'blacktop_blackout',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        max: parseInt(process.env.DB_MAX_CONNECTIONS || '20'),
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });

      // Initialize Drizzle
      this.db = drizzle(this.pool);

      // Test connection
      await this.testConnection();

      // Enable PostGIS extensions
      await this.enablePostGISExtensions();

      // Run migrations
      await this.runMigrations();

      this.isInitialized = true;
      this.logger.info('Database initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize database', error);
      throw error;
    }
  }

  private async testConnection(): Promise<void> {
    try {
      const client = await this.pool.connect();
      const result = await client.query('SELECT NOW()');
      client.release();
      this.logger.info('Database connection test successful', { timestamp: result.rows[0].now });
    } catch (error) {
      this.logger.error('Database connection test failed', error);
      throw error;
    }
  }

  private async enablePostGISExtensions(): Promise<void> {
    try {
      this.logger.info('Enabling PostGIS extensions...');
      
      const extensions = [
        'postgis',
        'postgis_raster',
        'postgis_sfcgal',
        'postgis_topology',
        'pgrouting'
      ];

      for (const extension of extensions) {
        try {
          await this.pool.query(`CREATE EXTENSION IF NOT EXISTS ${extension}`);
          this.logger.debug(`Enabled extension: ${extension}`);
        } catch (error) {
          this.logger.warn(`Failed to enable extension ${extension}: ${error.message}`);
        }
      }

      this.logger.info('PostGIS extensions setup completed');
    } catch (error) {
      this.logger.error('Failed to enable PostGIS extensions', error);
      throw error;
    }
  }

  private async runMigrations(): Promise<void> {
    try {
      this.logger.info('Running database migrations...');
      
      // In a real implementation, you would run Drizzle migrations here
      // await migrate(this.db, { migrationsFolder: './migrations' });
      
      // For now, we'll create the basic schema manually
      await this.createInitialSchema();
      
      this.logger.info('Database migrations completed');
    } catch (error) {
      this.logger.error('Database migration failed', error);
      throw error;
    }
  }

  private async createInitialSchema(): Promise<void> {
    const schemas = [
      // Users table
      `CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        roles TEXT[] DEFAULT ARRAY['user'],
        permissions TEXT[] DEFAULT ARRAY[],
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        metadata JSONB DEFAULT '{}'
      )`,

      // Modules/Plugins registry
      `CREATE TABLE IF NOT EXISTS modules (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        version VARCHAR(50) NOT NULL,
        description TEXT,
        author VARCHAR(255),
        category VARCHAR(100),
        tags TEXT[] DEFAULT ARRAY[],
        enabled BOOLEAN DEFAULT false,
        installed BOOLEAN DEFAULT false,
        install_date TIMESTAMP,
        last_updated TIMESTAMP DEFAULT NOW(),
        size BIGINT DEFAULT 0,
        repository VARCHAR(500),
        homepage VARCHAR(500),
        license VARCHAR(100),
        screenshots TEXT[] DEFAULT ARRAY[],
        pricing JSONB DEFAULT '{}',
        metadata JSONB DEFAULT '{}'
      )`,

      // Employees
      `CREATE TABLE IF NOT EXISTS employees (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(50),
        position VARCHAR(255),
        department VARCHAR(255),
        hourly_rate DECIMAL(10,2),
        hire_date DATE,
        status VARCHAR(50) DEFAULT 'active',
        location GEOGRAPHY(POINT),
        permissions TEXT[] DEFAULT ARRAY[],
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        metadata JSONB DEFAULT '{}'
      )`,

      // Vehicles
      `CREATE TABLE IF NOT EXISTS vehicles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        make VARCHAR(255),
        model VARCHAR(255),
        year INTEGER,
        vin VARCHAR(17) UNIQUE,
        license_plate VARCHAR(50),
        type VARCHAR(50),
        gvwr INTEGER,
        current_weight INTEGER,
        fuel_type VARCHAR(50),
        fuel_capacity DECIMAL(10,2),
        current_fuel_level DECIMAL(5,2),
        mileage INTEGER DEFAULT 0,
        last_maintenance DATE,
        next_maintenance DATE,
        registration_expiry DATE,
        insurance_expiry DATE,
        location GEOGRAPHY(POINT),
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        metadata JSONB DEFAULT '{}'
      )`,

      // Equipment
      `CREATE TABLE IF NOT EXISTS equipment (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        type VARCHAR(255),
        manufacturer VARCHAR(255),
        model VARCHAR(255),
        serial_number VARCHAR(255) UNIQUE,
        purchase_date DATE,
        warranty_expiry DATE,
        operating_hours INTEGER DEFAULT 0,
        last_maintenance DATE,
        next_maintenance DATE,
        status VARCHAR(50) DEFAULT 'active',
        location GEOGRAPHY(POINT),
        specifications JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        metadata JSONB DEFAULT '{}'
      )`,

      // Materials
      `CREATE TABLE IF NOT EXISTS materials (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        category VARCHAR(255),
        supplier VARCHAR(255),
        unit_type VARCHAR(50),
        cost_per_unit DECIMAL(10,2),
        current_stock DECIMAL(10,2) DEFAULT 0,
        min_stock_level DECIMAL(10,2) DEFAULT 0,
        max_stock_level DECIMAL(10,2) DEFAULT 0,
        specifications JSONB DEFAULT '{}',
        msds_document VARCHAR(500),
        last_restocked DATE,
        expiry_date DATE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        metadata JSONB DEFAULT '{}'
      )`,

      // Geofences
      `CREATE TABLE IF NOT EXISTS geofences (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        coordinates GEOGRAPHY(POLYGON),
        radius DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        metadata JSONB DEFAULT '{}'
      )`,

      // Activity logs
      `CREATE TABLE IF NOT EXISTS activity_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id UUID REFERENCES employees(id),
        vehicle_id UUID REFERENCES vehicles(id),
        activity VARCHAR(50) NOT NULL,
        location GEOGRAPHY(POINT),
        duration INTEGER,
        timestamp TIMESTAMP DEFAULT NOW(),
        metadata JSONB DEFAULT '{}'
      )`,

      // Scan data (PavementScan Pro)
      `CREATE TABLE IF NOT EXISTS scan_data (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id VARCHAR(255),
        location GEOGRAPHY(POINT),
        scan_date TIMESTAMP DEFAULT NOW(),
        scanned_by UUID REFERENCES employees(id),
        surface_type VARCHAR(50),
        total_area DECIMAL(12,2),
        perimeter DECIMAL(12,2),
        model_3d_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        metadata JSONB DEFAULT '{}'
      )`,

      // Surface defects
      `CREATE TABLE IF NOT EXISTS surface_defects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        scan_id UUID REFERENCES scan_data(id),
        type VARCHAR(50) NOT NULL,
        severity VARCHAR(50) NOT NULL,
        coordinates GEOGRAPHY(POLYGON),
        measurements JSONB DEFAULT '{}',
        confidence DECIMAL(5,4),
        detected_by VARCHAR(50),
        description TEXT,
        repair_recommendation TEXT,
        estimated_cost DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT NOW(),
        metadata JSONB DEFAULT '{}'
      )`,

      // Alerts
      `CREATE TABLE IF NOT EXISTS alerts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        type VARCHAR(50) NOT NULL,
        severity VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT,
        timestamp TIMESTAMP DEFAULT NOW(),
        acknowledged BOOLEAN DEFAULT false,
        acknowledged_by UUID REFERENCES users(id),
        acknowledged_at TIMESTAMP,
        related_entity_id UUID,
        metadata JSONB DEFAULT '{}'
      )`,

      // Create indexes for better performance
      `CREATE INDEX IF NOT EXISTS idx_employees_location ON employees USING GIST(location)`,
      `CREATE INDEX IF NOT EXISTS idx_vehicles_location ON vehicles USING GIST(location)`,
      `CREATE INDEX IF NOT EXISTS idx_equipment_location ON equipment USING GIST(location)`,
      `CREATE INDEX IF NOT EXISTS idx_activity_logs_employee ON activity_logs(employee_id)`,
      `CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON activity_logs(timestamp)`,
      `CREATE INDEX IF NOT EXISTS idx_scan_data_location ON scan_data USING GIST(location)`,
      `CREATE INDEX IF NOT EXISTS idx_surface_defects_scan ON surface_defects(scan_id)`,
      `CREATE INDEX IF NOT EXISTS idx_alerts_timestamp ON alerts(timestamp)`,
      `CREATE INDEX IF NOT EXISTS idx_alerts_acknowledged ON alerts(acknowledged)`
    ];

    for (const schema of schemas) {
      try {
        await this.pool.query(schema);
      } catch (error) {
        this.logger.error(`Failed to create schema: ${schema.substring(0, 100)}...`, error);
        throw error;
      }
    }

    this.logger.info('Initial database schema created successfully');
  }

  // DatabaseApi implementation
  async query<T>(sql: string, params?: any[]): Promise<T[]> {
    if (!this.isInitialized) {
      throw new Error('Database not initialized');
    }

    try {
      const result = await this.pool.query(sql, params);
      return result.rows;
    } catch (error) {
      this.logger.error(`Database query failed: ${sql}`, { error, params });
      throw error;
    }
  }

  async insert<T>(table: string, data: Partial<T>): Promise<T> {
    if (!this.isInitialized) {
      throw new Error('Database not initialized');
    }

    try {
      const keys = Object.keys(data);
      const values = Object.values(data);
      const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
      const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`;
      
      const result = await this.pool.query(sql, values);
      return result.rows[0];
    } catch (error) {
      this.logger.error(`Database insert failed: ${table}`, { error, data });
      throw error;
    }
  }

  async update<T>(table: string, id: string, data: Partial<T>): Promise<T> {
    if (!this.isInitialized) {
      throw new Error('Database not initialized');
    }

    try {
      const keys = Object.keys(data);
      const values = Object.values(data);
      const setClause = keys.map((key, index) => `${key} = $${index + 2}`).join(', ');
      const sql = `UPDATE ${table} SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`;
      
      const result = await this.pool.query(sql, [id, ...values]);
      return result.rows[0];
    } catch (error) {
      this.logger.error(`Database update failed: ${table}`, { error, id, data });
      throw error;
    }
  }

  async delete(table: string, id: string): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error('Database not initialized');
    }

    try {
      const sql = `DELETE FROM ${table} WHERE id = $1`;
      const result = await this.pool.query(sql, [id]);
      return result.rowCount > 0;
    } catch (error) {
      this.logger.error(`Database delete failed: ${table}`, { error, id });
      throw error;
    }
  }

  // Additional utility methods
  async findById<T>(table: string, id: string): Promise<T | null> {
    const result = await this.query<T>(`SELECT * FROM ${table} WHERE id = $1`, [id]);
    return result.length > 0 ? result[0] : null;
  }

  async findWhere<T>(table: string, conditions: Record<string, any>): Promise<T[]> {
    const keys = Object.keys(conditions);
    const values = Object.values(conditions);
    const whereClause = keys.map((key, index) => `${key} = $${index + 1}`).join(' AND ');
    const sql = `SELECT * FROM ${table} WHERE ${whereClause}`;
    
    return this.query<T>(sql, values);
  }

  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.logger.info('Database connection closed');
    }
  }

  getDB() {
    return this.db;
  }

  getPool() {
    return this.pool;
  }

  isConnected(): boolean {
    return this.isInitialized && !this.pool.ended;
  }
}
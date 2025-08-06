import * as fs from 'fs/promises';
import * as path from 'path';
import { StorageApi, Logger } from '@blacktop-blackout-monorepo/shared-types';

export interface StorageConfig {
  type: 'local' | 's3' | 'azure' | 'gcp';
  basePath?: string;
  bucketName?: string;
  region?: string;
  accessKey?: string;
  secretKey?: string;
  maxFileSize?: number;
  allowedExtensions?: string[];
}

export interface FileMetadata {
  key: string;
  size: number;
  contentType?: string;
  lastModified: Date;
  etag?: string;
  metadata?: Record<string, string>;
}

export class StorageService implements StorageApi {
  private logger: Logger;
  private config: StorageConfig;
  private basePath: string;

  constructor(logger: Logger, config?: StorageConfig) {
    this.logger = logger;
    this.config = config || {
      type: 'local',
      basePath: process.env.STORAGE_PATH || './storage',
      maxFileSize: 100 * 1024 * 1024, // 100MB
      allowedExtensions: ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.csv', '.json', '.xml']
    };
    
    this.basePath = this.config.basePath || './storage';
    this.initializeStorage();
  }

  private async initializeStorage(): Promise<void> {
    try {
      if (this.config.type === 'local') {
        // Ensure base directory exists
        await this.ensureDirectoryExists(this.basePath);
        
        // Create subdirectories
        const subdirs = ['uploads', 'documents', 'images', '3d-models', 'reports', 'temp'];
        for (const subdir of subdirs) {
          await this.ensureDirectoryExists(path.join(this.basePath, subdir));
        }
        
        this.logger.info(`Local storage initialized at: ${this.basePath}`);
      } else {
        // Initialize cloud storage (to be implemented)
        this.logger.info(`Cloud storage (${this.config.type}) initialization not yet implemented`);
      }
    } catch (error) {
      this.logger.error('Failed to initialize storage service', error);
      throw error;
    }
  }

  /**
   * Upload a file or data
   */
  async upload(key: string, data: Buffer | string): Promise<string> {
    try {
      this.logger.debug(`Uploading file: ${key}`);

      // Validate file
      await this.validateFile(key, data);

      if (this.config.type === 'local') {
        return await this.uploadLocal(key, data);
      } else {
        // Cloud upload implementation
        throw new Error(`Cloud storage upload not yet implemented for ${this.config.type}`);
      }
    } catch (error) {
      this.logger.error(`Failed to upload file ${key}:`, error);
      throw error;
    }
  }

  /**
   * Download a file
   */
  async download(key: string): Promise<Buffer> {
    try {
      this.logger.debug(`Downloading file: ${key}`);

      if (this.config.type === 'local') {
        return await this.downloadLocal(key);
      } else {
        // Cloud download implementation
        throw new Error(`Cloud storage download not yet implemented for ${this.config.type}`);
      }
    } catch (error) {
      this.logger.error(`Failed to download file ${key}:`, error);
      throw error;
    }
  }

  /**
   * Delete a file
   */
  async delete(key: string): Promise<boolean> {
    try {
      this.logger.debug(`Deleting file: ${key}`);

      if (this.config.type === 'local') {
        return await this.deleteLocal(key);
      } else {
        // Cloud delete implementation
        throw new Error(`Cloud storage delete not yet implemented for ${this.config.type}`);
      }
    } catch (error) {
      this.logger.error(`Failed to delete file ${key}:`, error);
      throw error;
    }
  }

  /**
   * Check if file exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      if (this.config.type === 'local') {
        return await this.existsLocal(key);
      } else {
        // Cloud exists implementation
        throw new Error(`Cloud storage exists check not yet implemented for ${this.config.type}`);
      }
    } catch (error) {
      this.logger.error(`Failed to check existence of file ${key}:`, error);
      return false;
    }
  }

  /**
   * Get file metadata
   */
  async getMetadata(key: string): Promise<FileMetadata | null> {
    try {
      if (this.config.type === 'local') {
        return await this.getMetadataLocal(key);
      } else {
        // Cloud metadata implementation
        throw new Error(`Cloud storage metadata not yet implemented for ${this.config.type}`);
      }
    } catch (error) {
      this.logger.error(`Failed to get metadata for file ${key}:`, error);
      return null;
    }
  }

  /**
   * List files in a directory/prefix
   */
  async listFiles(prefix?: string, limit?: number): Promise<string[]> {
    try {
      if (this.config.type === 'local') {
        return await this.listFilesLocal(prefix, limit);
      } else {
        // Cloud list implementation
        throw new Error(`Cloud storage list not yet implemented for ${this.config.type}`);
      }
    } catch (error) {
      this.logger.error(`Failed to list files with prefix ${prefix}:`, error);
      return [];
    }
  }

  /**
   * Copy a file
   */
  async copy(sourceKey: string, destinationKey: string): Promise<string> {
    try {
      this.logger.debug(`Copying file from ${sourceKey} to ${destinationKey}`);

      const data = await this.download(sourceKey);
      return await this.upload(destinationKey, data);
    } catch (error) {
      this.logger.error(`Failed to copy file from ${sourceKey} to ${destinationKey}:`, error);
      throw error;
    }
  }

  /**
   * Move a file
   */
  async move(sourceKey: string, destinationKey: string): Promise<string> {
    try {
      this.logger.debug(`Moving file from ${sourceKey} to ${destinationKey}`);

      const url = await this.copy(sourceKey, destinationKey);
      await this.delete(sourceKey);
      
      return url;
    } catch (error) {
      this.logger.error(`Failed to move file from ${sourceKey} to ${destinationKey}:`, error);
      throw error;
    }
  }

  /**
   * Generate a signed URL for file access (for cloud storage)
   */
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    if (this.config.type === 'local') {
      // For local storage, return a direct path
      return path.join('/api/storage', key);
    } else {
      // Cloud signed URL implementation
      throw new Error(`Signed URLs not yet implemented for ${this.config.type}`);
    }
  }

  /**
   * Upload multiple files
   */
  async uploadMultiple(files: Array<{ key: string; data: Buffer | string }>): Promise<string[]> {
    const uploadPromises = files.map(file => this.upload(file.key, file.data));
    return await Promise.all(uploadPromises);
  }

  /**
   * Clean up temporary files
   */
  async cleanupTempFiles(olderThanHours: number = 24): Promise<number> {
    try {
      if (this.config.type !== 'local') {
        this.logger.warn('Temp file cleanup only supported for local storage');
        return 0;
      }

      const tempDir = path.join(this.basePath, 'temp');
      const cutoffTime = new Date(Date.now() - (olderThanHours * 60 * 60 * 1000));
      
      const files = await this.listFilesLocal('temp/');
      let deletedCount = 0;

      for (const file of files) {
        const metadata = await this.getMetadataLocal(file);
        if (metadata && metadata.lastModified < cutoffTime) {
          await this.delete(file);
          deletedCount++;
        }
      }

      this.logger.info(`Cleaned up ${deletedCount} temporary files older than ${olderThanHours} hours`);
      return deletedCount;
    } catch (error) {
      this.logger.error('Failed to cleanup temporary files:', error);
      return 0;
    }
  }

  // Local storage implementations
  private async uploadLocal(key: string, data: Buffer | string): Promise<string> {
    const filePath = path.join(this.basePath, key);
    const directory = path.dirname(filePath);
    
    // Ensure directory exists
    await this.ensureDirectoryExists(directory);
    
    // Write file
    const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
    await fs.writeFile(filePath, buffer);
    
    this.logger.debug(`File uploaded successfully: ${filePath}`);
    return `/api/storage/${key}`;
  }

  private async downloadLocal(key: string): Promise<Buffer> {
    const filePath = path.join(this.basePath, key);
    
    if (!await this.existsLocal(key)) {
      throw new Error(`File not found: ${key}`);
    }
    
    return await fs.readFile(filePath);
  }

  private async deleteLocal(key: string): Promise<boolean> {
    const filePath = path.join(this.basePath, key);
    
    try {
      await fs.unlink(filePath);
      this.logger.debug(`File deleted successfully: ${filePath}`);
      return true;
    } catch (error) {
      if (error.code === 'ENOENT') {
        this.logger.debug(`File not found for deletion: ${filePath}`);
        return false;
      }
      throw error;
    }
  }

  private async existsLocal(key: string): Promise<boolean> {
    const filePath = path.join(this.basePath, key);
    
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  private async getMetadataLocal(key: string): Promise<FileMetadata | null> {
    const filePath = path.join(this.basePath, key);
    
    try {
      const stats = await fs.stat(filePath);
      return {
        key,
        size: stats.size,
        lastModified: stats.mtime,
        contentType: this.getContentType(key)
      };
    } catch {
      return null;
    }
  }

  private async listFilesLocal(prefix?: string, limit?: number): Promise<string[]> {
    const searchPath = prefix ? path.join(this.basePath, prefix) : this.basePath;
    
    try {
      const files = await this.getAllFilesRecursive(searchPath);
      const relativeFiles = files.map(file => path.relative(this.basePath, file));
      
      // Filter by prefix if specified
      let filteredFiles = prefix 
        ? relativeFiles.filter(file => file.startsWith(prefix))
        : relativeFiles;
      
      // Apply limit if specified
      if (limit && limit > 0) {
        filteredFiles = filteredFiles.slice(0, limit);
      }
      
      return filteredFiles;
    } catch (error) {
      this.logger.error(`Failed to list files in ${searchPath}:`, error);
      return [];
    }
  }

  private async getAllFilesRecursive(dir: string): Promise<string[]> {
    const files: string[] = [];
    
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          const subFiles = await this.getAllFilesRecursive(fullPath);
          files.push(...subFiles);
        } else {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Directory might not exist or be accessible
      this.logger.debug(`Could not read directory ${dir}: ${error.message}`);
    }
    
    return files;
  }

  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
    }
  }

  private async validateFile(key: string, data: Buffer | string): Promise<void> {
    // Check file size
    const size = Buffer.isBuffer(data) ? data.length : Buffer.byteLength(data);
    const maxSize = this.config.maxFileSize || (100 * 1024 * 1024); // 100MB default
    
    if (size > maxSize) {
      throw new Error(`File size (${size} bytes) exceeds maximum allowed size (${maxSize} bytes)`);
    }

    // Check file extension
    if (this.config.allowedExtensions && this.config.allowedExtensions.length > 0) {
      const ext = path.extname(key).toLowerCase();
      if (!this.config.allowedExtensions.includes(ext)) {
        throw new Error(`File extension ${ext} is not allowed`);
      }
    }

    // Check for directory traversal
    if (key.includes('..') || key.includes('/..') || key.includes('..\\')) {
      throw new Error('Invalid file path: directory traversal not allowed');
    }
  }

  private getContentType(fileName: string): string {
    const ext = path.extname(fileName).toLowerCase();
    const contentTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.txt': 'text/plain',
      '.csv': 'text/csv',
      '.json': 'application/json',
      '.xml': 'application/xml'
    };
    
    return contentTypes[ext] || 'application/octet-stream';
  }

  /**
   * Get storage statistics
   */
  async getStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    storageType: string;
    basePath?: string;
  }> {
    try {
      if (this.config.type === 'local') {
        const files = await this.listFilesLocal();
        let totalSize = 0;
        
        for (const file of files) {
          const metadata = await this.getMetadataLocal(file);
          if (metadata) {
            totalSize += metadata.size;
          }
        }
        
        return {
          totalFiles: files.length,
          totalSize,
          storageType: this.config.type,
          basePath: this.basePath
        };
      } else {
        return {
          totalFiles: 0,
          totalSize: 0,
          storageType: this.config.type
        };
      }
    } catch (error) {
      this.logger.error('Failed to get storage stats:', error);
      return {
        totalFiles: 0,
        totalSize: 0,
        storageType: this.config.type
      };
    }
  }
}
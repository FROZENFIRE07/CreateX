/**
 * Image Storage Service
 * Handles uploading, storing, and retrieving AI-generated images
 * 
 * Supports multiple cloud storage providers:
 * - AWS S3 (primary)
 * - Cloudinary (fallback)
 * - Local filesystem (development)
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class ImageStorageService {
    constructor() {
        this.provider = process.env.IMAGE_STORAGE_PROVIDER || 'local';
        this.initialized = false;

        // Local storage path for development
        this.localStoragePath = path.join(__dirname, '../../uploads/images');
    }

    /**
     * Initialize storage provider
     */
    async initialize() {
        if (this.initialized) return;

        console.log(`[ImageStorage] Provider: ${this.provider}`);

        if (this.provider === 'local') {
            // Ensure local directory exists
            try {
                await fs.mkdir(this.localStoragePath, { recursive: true });
                console.log('✅ Local image storage initialized');
            } catch (error) {
                console.error('Failed to create local storage directory:', error.message);
            }
        } else if (this.provider === 's3') {
            // TODO: Initialize AWS S3 client
            console.log('⚠️ S3 storage not yet implemented, falling back to local');
            this.provider = 'local';
            await this.initialize();
            return;
        } else if (this.provider === 'cloudinary') {
            // Initialize Cloudinary client
            if (!process.env.CLOUDINARY_URL) {
                console.log('⚠️ CLOUDINARY_URL not set, falling back to local');
                this.provider = 'local';
                await this.initialize();
                return;
            }
            try {
                const cloudinary = require('cloudinary').v2;
                cloudinary.config({ cloudinary_url: process.env.CLOUDINARY_URL });
                console.log('✅ Cloudinary storage initialized');
            } catch (error) {
                console.error('Cloudinary initialization failed:', error.message);
                console.log('⚠️ Falling back to local storage');
                this.provider = 'local';
                await this.initialize();
                return;
            }
        }

        this.initialized = true;
    }

    /**
     * Upload image from buffer or URL
     * @param {Buffer|string} imageData - Image buffer or URL
     * @param {object} metadata - Image metadata
     * @returns {object} { url, path, size }
     */
    async upload(imageData, metadata = {}) {
        await this.initialize();

        let buffer;

        // If imageData is a URL, download it first
        if (typeof imageData === 'string' && imageData.startsWith('http')) {
            buffer = await this.downloadImage(imageData);
        } else if (Buffer.isBuffer(imageData)) {
            buffer = imageData;
        } else if (typeof imageData === 'string' && imageData.startsWith('data:')) {
            // Handle base64 data URLs
            const base64Data = imageData.split(',')[1];
            buffer = Buffer.from(base64Data, 'base64');
        } else {
            throw new Error('Invalid image data format');
        }

        // Generate unique filename
        const filename = this.generateFilename(metadata);

        if (this.provider === 'local') {
            return await this.uploadLocal(buffer, filename, metadata);
        } else if (this.provider === 's3') {
            return await this.uploadS3(buffer, filename, metadata);
        } else if (this.provider === 'cloudinary') {
            return await this.uploadCloudinary(buffer, filename, metadata);
        }

        throw new Error(`Unsupported storage provider: ${this.provider}`);
    }

    /**
     * Upload to local filesystem
     */
    async uploadLocal(buffer, filename, metadata) {
        const filepath = path.join(this.localStoragePath, filename);

        await fs.writeFile(filepath, buffer);

        // In production, this would be a CDN URL
        // For now, return a relative path that the API can serve
        const url = `/api/images/${filename}`;

        return {
            url,
            path: filepath,
            size: buffer.length,
            provider: 'local'
        };
    }

    /**
     * Upload to AWS S3
     * TODO: Implement when S3 credentials are available
     */
    async uploadS3(buffer, filename, metadata) {
        // const s3 = new AWS.S3();
        // const params = {
        //     Bucket: process.env.S3_BUCKET,
        //     Key: filename,
        //     Body: buffer,
        //     ContentType: metadata.format || 'image/png',
        //     ACL: 'public-read'
        // };
        // const result = await s3.upload(params).promise();
        // return {
        //     url: result.Location,
        //     path: result.Key,
        //     size: buffer.length,
        //     provider: 's3'
        // };

        throw new Error('S3 upload not yet implemented');
    }

    /**
     * Upload to Cloudinary
     */
    async uploadCloudinary(buffer, filename, metadata) {
        const cloudinary = require('cloudinary').v2;
        
        try {
            const result = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    { 
                        folder: 'createx',
                        public_id: filename.replace(/\.[^.]+$/, ''),
                        resource_type: 'image',
                        format: metadata.format || 'png'
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                ).end(buffer);
            });
            
            console.log('[Cloudinary] Upload successful:', result.public_id);
            
            return {
                url: result.secure_url,
                path: result.public_id,
                size: buffer.length,
                provider: 'cloudinary'
            };
        } catch (error) {
            console.error('[Cloudinary] Upload failed:', error.message);
            throw error;
        }
    }

    /**
     * Download image from URL
     */
    async downloadImage(url) {
        try {
            const response = await axios.get(url, {
                responseType: 'arraybuffer',
                timeout: 30000
            });
            return Buffer.from(response.data);
        } catch (error) {
            throw new Error(`Failed to download image from ${url}: ${error.message}`);
        }
    }

    /**
     * Generate unique filename
     */
    generateFilename(metadata = {}) {
        const timestamp = Date.now();
        const random = crypto.randomBytes(8).toString('hex');
        const platform = metadata.platform || 'generic';
        const format = metadata.format || 'png';

        return `${platform}_${timestamp}_${random}.${format}`;
    }

    /**
     * Delete image
     */
    async delete(url) {
        await this.initialize();

        if (this.provider === 'local') {
            // Extract filename from URL
            const filename = path.basename(url);
            const filepath = path.join(this.localStoragePath, filename);

            try {
                await fs.unlink(filepath);
                return true;
            } catch (error) {
                console.error('Failed to delete local image:', error.message);
                return false;
            }
        }

        // TODO: Implement S3 and Cloudinary deletion
        return false;
    }

    /**
     * Get image info
     */
    async getInfo(url) {
        await this.initialize();

        if (this.provider === 'local') {
            const filename = path.basename(url);
            const filepath = path.join(this.localStoragePath, filename);

            try {
                const stats = await fs.stat(filepath);
                return {
                    exists: true,
                    size: stats.size,
                    modified: stats.mtime
                };
            } catch (error) {
                return { exists: false };
            }
        }

        return { exists: false };
    }

    /**
     * Optimize image (compress, resize)
     * TODO: Implement with sharp or similar library
     */
    async optimize(buffer, options = {}) {
        // const sharp = require('sharp');
        // return await sharp(buffer)
        //     .resize(options.width, options.height, { fit: 'inside' })
        //     .jpeg({ quality: options.quality || 85 })
        //     .toBuffer();

        // For now, return as-is
        return buffer;
    }
}

// Singleton instance
module.exports = new ImageStorageService();

const { createClient } = require('redis');
const logger = require('../utils/logger');

class CacheService {
    constructor() {
        this.client = null;
        this.isConnected = false;
        this.defaultTTL = parseInt(process.env.CACHE_TTL_SECONDS) || 300; // 5 minutes default
    }

    async initialize() {
        try {
            this.client = createClient({
                url: process.env.REDIS_URL || 'redis://localhost:6379',
                password: process.env.REDIS_PASSWORD || undefined,
                socket: {
                    reconnectStrategy: (retries) => {
                        if (retries > 20) {
                            logger.error('Redis connection failed after 20 retries');
                            return new Error('Redis connection failed');
                        }
                        return Math.min(retries * 50, 1000);
                    }
                }
            });

            this.client.on('error', (err) => {
                logger.error('Redis Client Error:', err);
                this.isConnected = false;
            });

            this.client.on('connect', () => {
                logger.info('Redis client connected');
                this.isConnected = true;
            });

            this.client.on('ready', () => {
                logger.info('Redis client ready');
                this.isConnected = true;
            });

            this.client.on('end', () => {
                logger.info('Redis client disconnected');
                this.isConnected = false;
            });

            await this.client.connect();
            logger.info('Redis cache service initialized successfully');

        } catch (error) {
            logger.error('Failed to initialize Redis cache service:', error);
            this.isConnected = false;
            // Don't throw error - bot should work without cache
        }
    }

    async get(key) {
        if (!this.isConnected || !this.client) {
            return null;
        }

        try {
            const value = await this.client.get(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            logger.error(`Error getting cache key ${key}:`, error);
            return null;
        }
    }

    async set(key, value, ttl = this.defaultTTL) {
        if (!this.isConnected || !this.client) {
            return false;
        }

        try {
            const serializedValue = JSON.stringify(value);
            await this.client.setEx(key, ttl, serializedValue);
            return true;
        } catch (error) {
            logger.error(`Error setting cache key ${key}:`, error);
            return false;
        }
    }

    async del(key) {
        if (!this.isConnected || !this.client) {
            return false;
        }

        try {
            await this.client.del(key);
            return true;
        } catch (error) {
            logger.error(`Error deleting cache key ${key}:`, error);
            return false;
        }
    }

    async exists(key) {
        if (!this.isConnected || !this.client) {
            return false;
        }

        try {
            const result = await this.client.exists(key);
            return result === 1;
        } catch (error) {
            logger.error(`Error checking cache key existence ${key}:`, error);
            return false;
        }
    }

    async expire(key, ttl) {
        if (!this.isConnected || !this.client) {
            return false;
        }

        try {
            await this.client.expire(key, ttl);
            return true;
        } catch (error) {
            logger.error(`Error setting expiration for cache key ${key}:`, error);
            return false;
        }
    }

    async flush() {
        if (!this.isConnected || !this.client) {
            return false;
        }

        try {
            await this.client.flushAll();
            logger.info('Redis cache flushed');
            return true;
        } catch (error) {
            logger.error('Error flushing Redis cache:', error);
            return false;
        }
    }

    // Server status caching
    async getServerStatus(serverId) {
        return await this.get(`server:status:${serverId}`);
    }

    async setServerStatus(serverId, status, ttl = 60) {
        return await this.set(`server:status:${serverId}`, status, ttl);
    }

    async invalidateServerStatus(serverId) {
        return await this.del(`server:status:${serverId}`);
    }

    // User level caching
    async getUserLevel(userId, guildId) {
        return await this.get(`user:level:${guildId}:${userId}`);
    }

    async setUserLevel(userId, guildId, levelData, ttl = 300) {
        return await this.set(`user:level:${guildId}:${userId}`, levelData, ttl);
    }

    async invalidateUserLevel(userId, guildId) {
        return await this.del(`user:level:${guildId}:${userId}`);
    }

    // Leaderboard caching
    async getLeaderboard(guildId) {
        return await this.get(`leaderboard:${guildId}`);
    }

    async setLeaderboard(guildId, leaderboard, ttl = 600) {
        return await this.set(`leaderboard:${guildId}`, leaderboard, ttl);
    }

    async invalidateLeaderboard(guildId) {
        return await this.del(`leaderboard:${guildId}`);
    }

    // Guild settings caching
    async getGuildSettings(guildId) {
        return await this.get(`guild:settings:${guildId}`);
    }

    async setGuildSettings(guildId, settings, ttl = 1800) {
        return await this.set(`guild:settings:${guildId}`, settings, ttl);
    }

    async invalidateGuildSettings(guildId) {
        return await this.del(`guild:settings:${guildId}`);
    }

    // Monitored servers caching
    async getMonitoredServers(guildId) {
        return await this.get(`servers:monitored:${guildId}`);
    }

    async setMonitoredServers(guildId, servers, ttl = 600) {
        return await this.set(`servers:monitored:${guildId}`, servers, ttl);
    }

    async invalidateMonitoredServers(guildId) {
        return await this.del(`servers:monitored:${guildId}`);
    }

    // Rate limiting
    async checkRateLimit(key, limit, window) {
        if (!this.isConnected || !this.client) {
            return { allowed: true, remaining: limit };
        }

        try {
            const current = await this.client.incr(key);
            if (current === 1) {
                await this.client.expire(key, window);
            }
            
            return {
                allowed: current <= limit,
                remaining: Math.max(0, limit - current)
            };
        } catch (error) {
            logger.error(`Error checking rate limit for ${key}:`, error);
            return { allowed: true, remaining: limit };
        }
    }

    async close() {
        try {
            if (this.client && this.isConnected) {
                await this.client.quit();
                logger.info('Redis cache service closed');
            }
        } catch (error) {
            logger.error('Error closing Redis cache service:', error);
        }
    }
}

module.exports = CacheService;

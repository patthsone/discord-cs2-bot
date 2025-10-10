const mysql = require('mysql2/promise');
const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

class Database {
    constructor() {
        this.pool = null;
        this.prisma = null;
    }

    async initialize() {
        try {
            // Initialize MySQL connection pool
            this.pool = mysql.createPool({
                host: process.env.DB_HOST || 'localhost',
                port: process.env.DB_PORT || 3306,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
                waitForConnections: true,
                connectionLimit: parseInt(process.env.CONNECTION_POOL_SIZE) || 10,
                queueLimit: 0,
                acquireTimeout: 60000,
                timeout: 60000,
                reconnect: true,
                charset: 'utf8mb4'
            });

            // Test connection
            const connection = await this.pool.getConnection();
            await connection.ping();
            connection.release();

            // Initialize Prisma client
            this.prisma = new PrismaClient({
                log: ['query', 'info', 'warn', 'error'],
                datasources: {
                    db: {
                        url: process.env.DATABASE_URL
                    }
                }
            });

            logger.info('MySQL database initialized successfully');
            logger.info('Prisma client initialized successfully');

        } catch (error) {
            logger.error('Failed to initialize database:', error);
            throw error;
        }
    }

    // Raw MySQL query methods for complex operations
    async query(sql, params = []) {
        try {
            const [rows] = await this.pool.execute(sql, params);
            return rows;
        } catch (error) {
            logger.error('Database query error:', error);
            throw error;
        }
    }

    async get(sql, params = []) {
        try {
            const [rows] = await this.pool.execute(sql, params);
            return rows[0] || null;
        } catch (error) {
            logger.error('Database get error:', error);
            throw error;
        }
    }

    async all(sql, params = []) {
        try {
            const [rows] = await this.pool.execute(sql, params);
            return rows;
        } catch (error) {
            logger.error('Database all error:', error);
            throw error;
        }
    }

    async run(sql, params = []) {
        try {
            const [result] = await this.pool.execute(sql, params);
            return {
                id: result.insertId,
                changes: result.affectedRows
            };
        } catch (error) {
            logger.error('Database run error:', error);
            throw error;
        }
    }

    // Transaction support
    async transaction(callback) {
        const connection = await this.pool.getConnection();
        try {
            await connection.beginTransaction();
            const result = await callback(connection);
            await connection.commit();
            return result;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Prisma methods for type-safe operations
    get prisma() {
        return this.prisma;
    }

    // Guild operations
    async createGuild(guildId, locale = 'en') {
        try {
            return await this.prisma.guild.create({
                data: {
                    id: guildId,
                    locale: locale
                }
            });
        } catch (error) {
            logger.error('Error creating guild:', error);
            throw error;
        }
    }

    async getGuild(guildId) {
        try {
            return await this.prisma.guild.findUnique({
                where: { id: guildId },
                include: {
                    monitoredServers: true,
                    userLevels: true,
                    levelRewards: true,
                    greetingSettings: true
                }
            });
        } catch (error) {
            logger.error('Error getting guild:', error);
            return null;
        }
    }

    // Monitored server operations
    async createMonitoredServer(data) {
        try {
            return await this.prisma.monitoredServer.create({
                data: {
                    guildId: data.guildId,
                    serverIp: data.serverIp,
                    serverPort: data.serverPort,
                    customName: data.customName,
                    channelId: data.channelId,
                    messageId: data.messageId,
                    checkInterval: data.checkInterval || 10
                }
            });
        } catch (error) {
            logger.error('Error creating monitored server:', error);
            throw error;
        }
    }

    async getMonitoredServers(guildId) {
        try {
            return await this.prisma.monitoredServer.findMany({
                where: {
                    guildId: guildId,
                    isActive: true
                }
            });
        } catch (error) {
            logger.error('Error getting monitored servers:', error);
            return [];
        }
    }

    async updateServerStatus(serverId, statusData) {
        try {
            return await this.prisma.monitoredServer.update({
                where: { id: serverId },
                data: {
                    lastStatus: statusData.online,
                    lastPlayers: statusData.playersOnline,
                    lastMap: statusData.mapName
                }
            });
        } catch (error) {
            logger.error('Error updating server status:', error);
            throw error;
        }
    }

    async addServerHistory(serverId, historyData) {
        try {
            return await this.prisma.serverHistory.create({
                data: {
                    serverId: serverId,
                    online: historyData.online,
                    playersOnline: historyData.playersOnline,
                    mapName: historyData.mapName,
                    ping: historyData.ping
                }
            });
        } catch (error) {
            logger.error('Error adding server history:', error);
            throw error;
        }
    }

    // User level operations
    async getUserLevel(userId, guildId) {
        try {
            return await this.prisma.userLevel.findUnique({
                where: {
                    unique_user_guild: {
                        guildId: guildId,
                        userId: userId
                    }
                }
            });
        } catch (error) {
            logger.error('Error getting user level:', error);
            return null;
        }
    }

    async createUserLevel(userId, guildId) {
        try {
            return await this.prisma.userLevel.create({
                data: {
                    guildId: guildId,
                    userId: userId,
                    xp: 0,
                    level: 0,
                    messagesCount: 0,
                    voiceMinutes: 0
                }
            });
        } catch (error) {
            logger.error('Error creating user level:', error);
            throw error;
        }
    }

    async updateUserXP(userId, guildId, xpToAdd, messageCount = 0) {
        try {
            return await this.prisma.userLevel.upsert({
                where: {
                    unique_user_guild: {
                        guildId: guildId,
                        userId: userId
                    }
                },
                update: {
                    xp: {
                        increment: xpToAdd
                    },
                    messagesCount: {
                        increment: messageCount
                    },
                    lastMessage: new Date()
                },
                create: {
                    guildId: guildId,
                    userId: userId,
                    xp: xpToAdd,
                    level: 0,
                    messagesCount: messageCount,
                    lastMessage: new Date()
                }
            });
        } catch (error) {
            logger.error('Error updating user XP:', error);
            throw error;
        }
    }

    async updateUserLevel(userId, guildId, level) {
        try {
            return await this.prisma.userLevel.update({
                where: {
                    unique_user_guild: {
                        guildId: guildId,
                        userId: userId
                    }
                },
                data: {
                    level: level
                }
            });
        } catch (error) {
            logger.error('Error updating user level:', error);
            throw error;
        }
    }

    async getLeaderboard(guildId, limit = 10) {
        try {
            return await this.prisma.userLevel.findMany({
                where: { guildId: guildId },
                orderBy: { xp: 'desc' },
                take: limit
            });
        } catch (error) {
            logger.error('Error getting leaderboard:', error);
            return [];
        }
    }

    // Level rewards operations
    async createLevelReward(guildId, level, roleId) {
        try {
            return await this.prisma.levelReward.create({
                data: {
                    guildId: guildId,
                    level: level,
                    roleId: roleId
                }
            });
        } catch (error) {
            logger.error('Error creating level reward:', error);
            throw error;
        }
    }

    async getLevelRewards(guildId) {
        try {
            return await this.prisma.levelReward.findMany({
                where: { guildId: guildId },
                orderBy: { level: 'asc' }
            });
        } catch (error) {
            logger.error('Error getting level rewards:', error);
            return [];
        }
    }

    // Greeting settings operations
    async setGreetingSettings(guildId, settings) {
        try {
            return await this.prisma.greetingSetting.upsert({
                where: { guildId: guildId },
                update: {
                    welcomeChannelId: settings.welcomeChannelId,
                    welcomeMessage: settings.welcomeMessage,
                    autoRoleId: settings.autoRoleId,
                    isActive: settings.isActive !== false
                },
                create: {
                    guildId: guildId,
                    welcomeChannelId: settings.welcomeChannelId,
                    welcomeMessage: settings.welcomeMessage,
                    autoRoleId: settings.autoRoleId,
                    isActive: settings.isActive !== false
                }
            });
        } catch (error) {
            logger.error('Error setting greeting settings:', error);
            throw error;
        }
    }

    async getGreetingSettings(guildId) {
        try {
            return await this.prisma.greetingSetting.findUnique({
                where: { guildId: guildId }
            });
        } catch (error) {
            logger.error('Error getting greeting settings:', error);
            return null;
        }
    }

    // Log operations
    async logEntry(level, message, metadata = null) {
        try {
            return await this.prisma.logEntry.create({
                data: {
                    level: level,
                    message: message,
                    metadata: metadata ? JSON.stringify(metadata) : null
                }
            });
        } catch (error) {
            logger.error('Error logging entry:', error);
            // Don't throw error for logging failures
        }
    }

    // Cleanup operations
    async cleanupOldHistory(daysToKeep = 30) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

            const result = await this.prisma.serverHistory.deleteMany({
                where: {
                    createdAt: {
                        lt: cutoffDate
                    }
                }
            });

            logger.info(`Cleaned up ${result.count} old server history entries`);
            return result.count;
        } catch (error) {
            logger.error('Error cleaning up old history:', error);
            return 0;
        }
    }

    async cleanupOldLogs(daysToKeep = 7) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

            const result = await this.prisma.logEntry.deleteMany({
                where: {
                    timestamp: {
                        lt: cutoffDate
                    }
                }
            });

            logger.info(`Cleaned up ${result.count} old log entries`);
            return result.count;
        } catch (error) {
            logger.error('Error cleaning up old logs:', error);
            return 0;
        }
    }

    async close() {
        try {
            if (this.pool) {
                await this.pool.end();
                logger.info('MySQL connection pool closed');
            }
            if (this.prisma) {
                await this.prisma.$disconnect();
                logger.info('Prisma client disconnected');
            }
        } catch (error) {
            logger.error('Error closing database connections:', error);
        }
    }
}

module.exports = Database;

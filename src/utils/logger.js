const winston = require('winston');
const pino = require('pino');
const path = require('path');
const fs = require('fs');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Winston logger for general application logging
const winstonLogger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: { service: 'discord-cs2-bot' },
    transports: [
        // Write all logs with importance level of `error` or less to `error.log`
        new winston.transports.File({
            filename: path.join(logsDir, 'error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            tailable: true
        }),
        // Write all logs with importance level of `info` or less to `combined.log`
        new winston.transports.File({
            filename: path.join(logsDir, 'combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            tailable: true
        })
    ]
});

// Add console transport for development (only important messages)
if (process.env.NODE_ENV !== 'production') {
    winstonLogger.add(new winston.transports.Console({
        level: 'warn', // Only show warnings and errors in console
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }));
}

// Pino logger for high-performance logging (file only, no console output)
const pinoLogger = pino({
    level: process.env.LOG_LEVEL || 'info',
    transport: undefined // Disable console output for Pino
}, pino.destination(path.join(logsDir, 'pino.log')));

class Logger {
    constructor() {
        this.winston = winstonLogger;
        this.pino = pinoLogger;
        this.database = null; // Will be set by the bot
    }

    setDatabase(database) {
        this.database = database;
    }

    // Winston methods
    info(message, meta = {}) {
        this.winston.info(message, meta);
        this.logToDatabase('info', message, meta);
    }

    warn(message, meta = {}) {
        this.winston.warn(message, meta);
        this.logToDatabase('warn', message, meta);
    }

    error(message, meta = {}) {
        this.winston.error(message, meta);
        this.logToDatabase('error', message, meta);
    }

    debug(message, meta = {}) {
        this.winston.debug(message, meta);
        this.logToDatabase('debug', message, meta);
    }

    // Pino methods for high-performance logging
    pinoInfo(message, meta = {}) {
        this.pino.info(meta, message);
    }

    pinoWarn(message, meta = {}) {
        this.pino.warn(meta, message);
    }

    pinoError(message, meta = {}) {
        this.pino.error(meta, message);
    }

    pinoDebug(message, meta = {}) {
        this.pino.debug(meta, message);
    }

    // Database logging for critical events
    async logToDatabase(level, message, metadata = null) {
        if (!this.database || !['error', 'warn'].includes(level)) {
            return; // Only log errors and warnings to database
        }

        try {
            await this.database.logEntry(level, message, metadata);
        } catch (error) {
            // Don't log database logging errors to avoid infinite loops
            console.error('Failed to log to database:', error.message);
        }
    }

    // Specialized logging methods
    async logServerEvent(serverId, event, data) {
        const meta = {
            type: 'server_event',
            serverId,
            event,
            data
        };
        this.info(`Server Event: ${event}`, meta);
    }

    async logUserEvent(userId, guildId, event, data) {
        const meta = {
            type: 'user_event',
            userId,
            guildId,
            event,
            data
        };
        this.info(`User Event: ${event}`, meta);
    }

    async logCommand(commandName, userId, guildId, success, error = null) {
        const meta = {
            type: 'command',
            commandName,
            userId,
            guildId,
            success,
            error: error ? error.message : null
        };
        
        if (success) {
            this.info(`Command executed: ${commandName}`, meta);
        } else {
            this.error(`Command failed: ${commandName}`, meta);
        }
    }

    async logDatabaseOperation(operation, table, duration, success, error = null) {
        const meta = {
            type: 'database_operation',
            operation,
            table,
            duration,
            success,
            error: error ? error.message : null
        };
        
        if (success) {
            this.debug(`Database operation: ${operation} on ${table}`, meta);
        } else {
            this.error(`Database operation failed: ${operation} on ${table}`, meta);
        }
    }

    async logCacheOperation(operation, key, hit, duration) {
        const meta = {
            type: 'cache_operation',
            operation,
            key,
            hit,
            duration
        };
        this.debug(`Cache operation: ${operation}`, meta);
    }

    async logPerformance(operation, duration, metadata = {}) {
        const meta = {
            type: 'performance',
            operation,
            duration,
            ...metadata
        };
        
        if (duration > 1000) { // Log slow operations as warnings
            this.warn(`Slow operation: ${operation}`, meta);
        } else {
            this.debug(`Performance: ${operation}`, meta);
        }
    }

    // Security logging
    async logSecurityEvent(event, userId, guildId, details) {
        const meta = {
            type: 'security',
            event,
            userId,
            guildId,
            details
        };
        this.warn(`Security Event: ${event}`, meta);
    }

    // Bot lifecycle logging
    async logBotStart() {
        this.info('Discord CS2 Bot started', {
            type: 'bot_lifecycle',
            event: 'start',
            timestamp: new Date().toISOString(),
            version: process.env.npm_package_version || '1.0.0'
        });
    }

    async logBotStop() {
        this.info('Discord CS2 Bot stopped', {
            type: 'bot_lifecycle',
            event: 'stop',
            timestamp: new Date().toISOString()
        });
    }

    // Error tracking with stack traces
    async logError(error, context = {}) {
        const meta = {
            type: 'error',
            message: error.message,
            stack: error.stack,
            name: error.name,
            ...context
        };
        this.error(`Error occurred: ${error.message}`, meta);
    }

    // Request/Response logging for external APIs
    async logApiRequest(method, url, statusCode, duration, responseSize) {
        const meta = {
            type: 'api_request',
            method,
            url,
            statusCode,
            duration,
            responseSize
        };
        
        if (statusCode >= 400) {
            this.warn(`API Request failed: ${method} ${url}`, meta);
        } else {
            this.debug(`API Request: ${method} ${url}`, meta);
        }
    }

    // Cleanup old logs
    async cleanupOldLogs(daysToKeep = 7) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

            const result = await this.database.query(
                'DELETE FROM log_entries WHERE timestamp < ?',
                [cutoffDate]
            );

            this.info(`Cleaned up ${result.affectedRows} old log entries`);
            return result.affectedRows;
        } catch (error) {
            this.error('Error cleaning up old logs:', error);
            return 0;
        }
    }

    // Get log statistics
    async getLogStats(hours = 24) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setHours(cutoffDate.getHours() - hours);

            const stats = await this.database.query(
                `SELECT level, COUNT(*) as count 
                 FROM log_entries 
                 WHERE timestamp > ? 
                 GROUP BY level`,
                [cutoffDate]
            );

            return stats.reduce((acc, stat) => {
                acc[stat.level] = stat.count;
                return acc;
            }, {});
        } catch (error) {
            this.error('Error getting log stats:', error);
            return {};
        }
    }
}

// Create singleton instance
const logger = new Logger();

module.exports = logger;
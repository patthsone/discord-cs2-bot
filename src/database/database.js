const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const logger = require('../utils/logger');

class Database {
    constructor() {
        this.db = null;
    }

    async initialize() {
        return new Promise((resolve, reject) => {
            const dbPath = path.join(__dirname, '../../data/bot.db');
            
            this.db = new sqlite3.Database(dbPath, (err) => {
                if (err) {
                    logger.error('Error opening database:', err);
                    reject(err);
                } else {
                    logger.info('Connected to SQLite database');
                    this.createTables().then(resolve).catch(reject);
                }
            });
        });
    }

    async createTables() {
        const tables = [
            // Servers table for multi-server support
            `CREATE TABLE IF NOT EXISTS servers (
                server_id TEXT PRIMARY KEY,
                guild_id TEXT NOT NULL,
                server_name TEXT NOT NULL,
                server_ip TEXT NOT NULL,
                server_port INTEGER NOT NULL,
                server_password TEXT,
                monitoring_channel_id TEXT,
                is_active BOOLEAN DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,
            
            // Users table for leveling system (already guild-specific)
            `CREATE TABLE IF NOT EXISTS users (
                user_id TEXT PRIMARY KEY,
                guild_id TEXT NOT NULL,
                xp INTEGER DEFAULT 0,
                level INTEGER DEFAULT 1,
                total_messages INTEGER DEFAULT 0,
                voice_time INTEGER DEFAULT 0,
                last_message_time INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,
            
            // Server monitoring table (updated for multi-server)
            `CREATE TABLE IF NOT EXISTS server_status (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                server_id TEXT NOT NULL,
                guild_id TEXT NOT NULL,
                server_ip TEXT NOT NULL,
                server_port INTEGER NOT NULL,
                status TEXT NOT NULL,
                player_count INTEGER DEFAULT 0,
                max_players INTEGER DEFAULT 0,
                map_name TEXT,
                server_name TEXT,
                last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (server_id) REFERENCES servers(server_id)
            )`,
            
            // Greeting messages table (already guild-specific)
            `CREATE TABLE IF NOT EXISTS greeting_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                guild_id TEXT NOT NULL,
                message TEXT NOT NULL,
                is_active BOOLEAN DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,
            
            // Server management roles table
            `CREATE TABLE IF NOT EXISTS server_management_roles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                guild_id TEXT NOT NULL,
                role_id TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(guild_id, role_id)
            )`,
            
            // User preferences table for language settings
            `CREATE TABLE IF NOT EXISTS user_preferences (
                user_id TEXT NOT NULL,
                guild_id TEXT NOT NULL,
                language TEXT DEFAULT 'en',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (user_id, guild_id)
            )`
        ];

        for (const table of tables) {
            await this.run(table);
        }
        
        logger.info('Database tables created successfully');
    }

    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) {
                    logger.error('Database run error:', err);
                    reject(err);
                } else {
                    resolve({ id: this.lastID, changes: this.changes });
                }
            });
        });
    }

    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) {
                    logger.error('Database get error:', err);
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    logger.error('Database all error:', err);
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    close() {
        return new Promise((resolve) => {
            if (this.db) {
                this.db.close((err) => {
                    if (err) {
                        logger.error('Error closing database:', err);
                    } else {
                        logger.info('Database connection closed');
                    }
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }
}

module.exports = Database;

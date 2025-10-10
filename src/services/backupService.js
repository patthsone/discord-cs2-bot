const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

class BackupService {
    constructor(database) {
        this.database = database;
        this.backupDir = path.join(__dirname, '../../backups');
        this.ensureBackupDirectory();
    }

    ensureBackupDirectory() {
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
            logger.info('Created backup directory');
        }
    }

    async createBackup(backupName = null) {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupFileName = backupName || `backup-${timestamp}.sql`;
            const backupPath = path.join(this.backupDir, backupFileName);

            const dbConfig = {
                host: process.env.DB_HOST || 'localhost',
                port: process.env.DB_PORT || 3306,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME
            };

            const mysqldumpCommand = `mysqldump -h ${dbConfig.host} -P ${dbConfig.port} -u ${dbConfig.user} -p${dbConfig.password} ${dbConfig.database} > "${backupPath}"`;

            return new Promise((resolve, reject) => {
                exec(mysqldumpCommand, (error, stdout, stderr) => {
                    if (error) {
                        logger.error('Backup creation failed:', error);
                        reject(error);
                        return;
                    }

                    if (stderr && !stderr.includes('Warning')) {
                        logger.warn('Backup warnings:', stderr);
                    }

                    logger.info(`Backup created successfully: ${backupFileName}`);
                    resolve({
                        fileName: backupFileName,
                        path: backupPath,
                        size: this.getFileSize(backupPath),
                        timestamp: new Date()
                    });
                });
            });

        } catch (error) {
            logger.error('Error creating backup:', error);
            throw error;
        }
    }

    async restoreBackup(backupFileName) {
        try {
            const backupPath = path.join(this.backupDir, backupFileName);
            
            if (!fs.existsSync(backupPath)) {
                throw new Error(`Backup file not found: ${backupFileName}`);
            }

            const dbConfig = {
                host: process.env.DB_HOST || 'localhost',
                port: process.env.DB_PORT || 3306,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME
            };

            const mysqlCommand = `mysql -h ${dbConfig.host} -P ${dbConfig.port} -u ${dbConfig.user} -p${dbConfig.password} ${dbConfig.database} < "${backupPath}"`;

            return new Promise((resolve, reject) => {
                exec(mysqlCommand, (error, stdout, stderr) => {
                    if (error) {
                        logger.error('Backup restoration failed:', error);
                        reject(error);
                        return;
                    }

                    if (stderr && !stderr.includes('Warning')) {
                        logger.warn('Restore warnings:', stderr);
                    }

                    logger.info(`Backup restored successfully: ${backupFileName}`);
                    resolve({
                        fileName: backupFileName,
                        timestamp: new Date()
                    });
                });
            });

        } catch (error) {
            logger.error('Error restoring backup:', error);
            throw error;
        }
    }

    async createGuildBackup(guildId, backupName = null) {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupFileName = backupName || `guild-${guildId}-${timestamp}.sql`;
            const backupPath = path.join(this.backupDir, backupFileName);

            const dbConfig = {
                host: process.env.DB_HOST || 'localhost',
                port: process.env.DB_PORT || 3306,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME
            };

            // Create a custom SQL dump for specific guild
            const guildData = await this.exportGuildData(guildId);
            
            fs.writeFileSync(backupPath, guildData);

            logger.info(`Guild backup created successfully: ${backupFileName}`);
            return {
                fileName: backupFileName,
                path: backupPath,
                size: this.getFileSize(backupPath),
                timestamp: new Date(),
                guildId: guildId
            };

        } catch (error) {
            logger.error('Error creating guild backup:', error);
            throw error;
        }
    }

    async exportGuildData(guildId) {
        try {
            let sql = `-- Guild backup for ${guildId}\n-- Generated on ${new Date().toISOString()}\n\n`;

            // Export guild settings
            const guild = await this.database.getGuild(guildId);
            if (guild) {
                sql += `-- Guild settings\n`;
                sql += `INSERT INTO guilds (id, locale, created_at) VALUES ('${guild.id}', '${guild.locale}', '${guild.createdAt}');\n\n`;
            }

            // Export monitored servers
            const servers = await this.database.getMonitoredServers(guildId);
            if (servers.length > 0) {
                sql += `-- Monitored servers\n`;
                for (const server of servers) {
                    sql += `INSERT INTO monitored_servers (guild_id, server_ip, server_port, custom_name, channel_id, message_id, is_active, check_interval, last_status, last_players, last_map, created_at) VALUES ('${server.guildId}', '${server.serverIp}', ${server.serverPort}, ${server.customName ? `'${server.customName}'` : 'NULL'}, '${server.channelId}', ${server.messageId ? `'${server.messageId}'` : 'NULL'}, ${server.isActive}, ${server.checkInterval}, ${server.lastStatus}, ${server.lastPlayers}, ${server.lastMap ? `'${server.lastMap}'` : 'NULL'}, '${server.createdAt}');\n`;
                }
                sql += `\n`;
            }

            // Export user levels
            const userLevels = await this.database.query(
                'SELECT * FROM user_levels WHERE guild_id = ?',
                [guildId]
            );
            if (userLevels.length > 0) {
                sql += `-- User levels\n`;
                for (const user of userLevels) {
                    sql += `INSERT INTO user_levels (guild_id, user_id, xp, level, messages_count, voice_minutes, last_message, last_voice_update) VALUES ('${user.guild_id}', '${user.user_id}', ${user.xp}, ${user.level}, ${user.messages_count}, ${user.voice_minutes}, ${user.last_message ? `'${user.last_message}'` : 'NULL'}, ${user.last_voice_update ? `'${user.last_voice_update}'` : 'NULL'});\n`;
                }
                sql += `\n`;
            }

            // Export level rewards
            const levelRewards = await this.database.getLevelRewards(guildId);
            if (levelRewards.length > 0) {
                sql += `-- Level rewards\n`;
                for (const reward of levelRewards) {
                    sql += `INSERT INTO level_rewards (guild_id, level, role_id) VALUES ('${reward.guildId}', ${reward.level}, '${reward.roleId}');\n`;
                }
                sql += `\n`;
            }

            // Export greeting settings
            const greetingSettings = await this.database.getGreetingSettings(guildId);
            if (greetingSettings) {
                sql += `-- Greeting settings\n`;
                sql += `INSERT INTO greeting_settings (guild_id, welcome_channel_id, welcome_message, auto_role_id, is_active) VALUES ('${greetingSettings.guildId}', ${greetingSettings.welcomeChannelId ? `'${greetingSettings.welcomeChannelId}'` : 'NULL'}, ${greetingSettings.welcomeMessage ? `'${greetingSettings.welcomeMessage.replace(/'/g, "''")}'` : 'NULL'}, ${greetingSettings.autoRoleId ? `'${greetingSettings.autoRoleId}'` : 'NULL'}, ${greetingSettings.isActive});\n\n`;
            }

            return sql;

        } catch (error) {
            logger.error('Error exporting guild data:', error);
            throw error;
        }
    }

    async listBackups() {
        try {
            const files = fs.readdirSync(this.backupDir);
            const backups = [];

            for (const file of files) {
                if (file.endsWith('.sql')) {
                    const filePath = path.join(this.backupDir, file);
                    const stats = fs.statSync(filePath);
                    
                    backups.push({
                        fileName: file,
                        size: this.getFileSize(filePath),
                        created: stats.birthtime,
                        modified: stats.mtime
                    });
                }
            }

            return backups.sort((a, b) => b.created - a.created);

        } catch (error) {
            logger.error('Error listing backups:', error);
            return [];
        }
    }

    async deleteBackup(backupFileName) {
        try {
            const backupPath = path.join(this.backupDir, backupFileName);
            
            if (!fs.existsSync(backupPath)) {
                throw new Error(`Backup file not found: ${backupFileName}`);
            }

            fs.unlinkSync(backupPath);
            logger.info(`Backup deleted: ${backupFileName}`);

        } catch (error) {
            logger.error('Error deleting backup:', error);
            throw error;
        }
    }

    getFileSize(filePath) {
        try {
            const stats = fs.statSync(filePath);
            const bytes = stats.size;
            
            if (bytes === 0) return '0 Bytes';
            
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        } catch (error) {
            return 'Unknown';
        }
    }

    async scheduleAutomaticBackups() {
        // Daily backup at 2 AM
        const cron = require('node-cron');
        
        cron.schedule('0 2 * * *', async () => {
            try {
                logger.info('Starting scheduled backup...');
                const backup = await this.createBackup();
                logger.info(`Scheduled backup completed: ${backup.fileName}`);
                
                // Keep only last 7 daily backups
                await this.cleanupOldBackups(7);
                
            } catch (error) {
                logger.error('Scheduled backup failed:', error);
            }
        }, {
            timezone: 'UTC'
        });

        logger.info('Automatic backup schedule started (daily at 2 AM UTC)');
    }

    async cleanupOldBackups(keepCount = 7) {
        try {
            const backups = await this.listBackups();
            
            if (backups.length > keepCount) {
                const toDelete = backups.slice(keepCount);
                
                for (const backup of toDelete) {
                    await this.deleteBackup(backup.fileName);
                }
                
                logger.info(`Cleaned up ${toDelete.length} old backups`);
            }
        } catch (error) {
            logger.error('Error cleaning up old backups:', error);
        }
    }

    async getBackupStats() {
        try {
            const backups = await this.listBackups();
            const totalSize = backups.reduce((sum, backup) => {
                const sizeStr = backup.size;
                const size = parseFloat(sizeStr);
                const unit = sizeStr.split(' ')[1];
                
                let multiplier = 1;
                switch (unit) {
                    case 'KB': multiplier = 1024; break;
                    case 'MB': multiplier = 1024 * 1024; break;
                    case 'GB': multiplier = 1024 * 1024 * 1024; break;
                }
                
                return sum + (size * multiplier);
            }, 0);

            return {
                totalBackups: backups.length,
                totalSize: this.formatBytes(totalSize),
                oldestBackup: backups.length > 0 ? backups[backups.length - 1].created : null,
                newestBackup: backups.length > 0 ? backups[0].created : null
            };
        } catch (error) {
            logger.error('Error getting backup stats:', error);
            return null;
        }
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

module.exports = BackupService;

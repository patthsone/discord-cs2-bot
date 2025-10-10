const GameDig = require('gamedig');
const cron = require('node-cron');
const { EmbedBuilder } = require('discord.js');
const logger = require('../utils/logger');
const ConfigManager = require('../utils/config');

class CS2Monitor {
    constructor(bot) {
        this.bot = bot;
        this.config = new ConfigManager();
        this.monitoringMessages = new Map(); // Store last message for each server
        this.isMonitoring = false;
        this.cronJob = null;
        this.queryTimeout = parseInt(process.env.SERVER_QUERY_TIMEOUT) || 5000;
    }

    startMonitoring() {
        if (this.isMonitoring) {
            logger.warn('CS2 monitoring is already running');
            return;
        }

        this.isMonitoring = true;
        const updateInterval = this.config.get('cs2.updateInterval') || 10;
        
        // Schedule monitoring task
        this.cronJob = cron.schedule(`*/${updateInterval} * * * *`, async () => {
            await this.updateAllServers();
        }, {
            scheduled: false
        });

        this.cronJob.start();
        logger.info(`CS2 monitoring started - updating every ${updateInterval} minutes`);
        
        // Initial status check
        setTimeout(() => this.updateAllServers(), 5000);
    }

    stopMonitoring() {
        if (this.cronJob) {
            this.cronJob.stop();
            this.cronJob = null;
        }
        this.isMonitoring = false;
        logger.info('CS2 monitoring stopped');
    }

    async updateAllServers() {
        try {
            // Get all active servers from database
            const servers = await this.bot.database.getMonitoredServers();

            if (servers.length === 0) {
                logger.debug('No active servers to monitor');
                return;
            }

            logger.info(`Updating ${servers.length} servers in parallel`);

            // Update all servers in parallel using Promise.allSettled
            const updatePromises = servers.map(server => this.updateServerStatus(server));
            const results = await Promise.allSettled(updatePromises);

            // Log results
            const successful = results.filter(result => result.status === 'fulfilled').length;
            const failed = results.filter(result => result.status === 'rejected').length;
            
            logger.info(`Server update completed: ${successful} successful, ${failed} failed`);

            // Log any failures
            results.forEach((result, index) => {
                if (result.status === 'rejected') {
                    logger.error(`Failed to update server ${servers[index].customName || servers[index].serverIp}:`, result.reason);
                }
            });

        } catch (error) {
            logger.error('Error updating all servers:', error);
        }
    }

    async updateServerStatus(server) {
        try {
            // Check cache first
            const cachedStatus = await this.bot.cache.getServerStatus(server.id);
            if (cachedStatus && this.isCacheValid(cachedStatus)) {
                logger.debug(`Using cached status for server ${server.customName || server.serverIp}`);
                await this.sendStatusUpdate(server, cachedStatus);
                return;
            }

            // Query server using gamedig
            const serverData = await this.queryServerWithGamedig(server);
            
            // Cache the result
            await this.bot.cache.setServerStatus(server.id, serverData, 60);
            
            // Send status update
            await this.sendStatusUpdate(server, serverData);
            
            // Save to database
            await this.saveServerStatus(server, serverData);
            
            // Add to history
            await this.addServerHistory(server, serverData);

        } catch (error) {
            logger.error(`Error updating server ${server.customName || server.serverIp}:`, error);
            await this.sendErrorUpdate(server, error.message);
        }
    }

    async queryServerWithGamedig(server) {
        try {
            const options = {
                type: 'cs2',
                host: server.serverIp,
                port: server.serverPort,
                timeout: this.queryTimeout,
                socketTimeout: this.queryTimeout,
                attemptTimeout: this.queryTimeout,
                maxAttempts: 2
            };

            logger.debug(`Querying server ${server.serverIp}:${server.serverPort} with gamedig`);

            const state = await GameDig.query(options);
            
            return {
                status: 'online',
                name: state.name || server.customName || `${server.serverIp}:${server.serverPort}`,
                map: state.map || 'Unknown Map',
                players: state.players ? state.players.length : 0,
                maxPlayers: state.maxplayers || 0,
                game: state.game || 'Counter-Strike 2',
                version: state.version || 'Unknown',
                ping: state.ping || 0,
                lastSeen: new Date().toISOString(),
                raw: state // Store raw data for debugging
            };

        } catch (error) {
            logger.warn(`Gamedig query failed for ${server.serverIp}:${server.serverPort}:`, error.message);
            
            // Return offline status
            return {
                status: 'offline',
                name: server.customName || `${server.serverIp}:${server.serverPort}`,
                map: 'N/A',
                players: 0,
                maxPlayers: 0,
                game: 'Counter-Strike 2',
                version: 'N/A',
                ping: 0,
                lastSeen: new Date().toISOString(),
                error: error.message
            };
        }
    }

    isCacheValid(cachedData) {
        if (!cachedData || !cachedData.lastSeen) {
            return false;
        }
        
        const cacheAge = Date.now() - new Date(cachedData.lastSeen).getTime();
        const maxCacheAge = 60000; // 1 minute
        
        return cacheAge < maxCacheAge;
    }

    async sendStatusUpdate(server, serverData) {
        const channelId = server.channelId;
        if (!channelId) {
            logger.warn(`No monitoring channel configured for server ${server.customName || server.serverIp}`);
            return;
        }

        try {
            const channel = this.bot.client.channels.cache.get(channelId);
            if (!channel) {
                logger.warn(`Monitoring channel not found: ${channelId}`);
                return;
            }

            const embed = this.createServerStatusEmbed(server, serverData);
            const messageKey = `${server.id}`;
            
            if (this.monitoringMessages.has(messageKey)) {
                try {
                    const lastMessage = this.monitoringMessages.get(messageKey);
                    await lastMessage.edit({ embeds: [embed] });
                } catch (error) {
                    // If edit fails, send a new message
                    const newMessage = await channel.send({ embeds: [embed] });
                    this.monitoringMessages.set(messageKey, newMessage);
                }
            } else {
                const newMessage = await channel.send({ embeds: [embed] });
                this.monitoringMessages.set(messageKey, newMessage);
            }

        } catch (error) {
            logger.error(`Error sending status update for ${server.customName || server.serverIp}:`, error);
        }
    }

    async sendErrorUpdate(server, errorMessage) {
        const channelId = server.channelId;
        if (!channelId) return;

        try {
            const channel = this.bot.client.channels.cache.get(channelId);
            if (!channel) return;

            const embed = new EmbedBuilder()
                .setTitle(`🚨 CS2 Server Monitoring Error - ${server.customName || server.serverIp}`)
                .setDescription(`Failed to get server status: ${errorMessage}`)
                .setColor(0xff0000)
                .setTimestamp();

            const messageKey = `${server.id}`;
            
            if (this.monitoringMessages.has(messageKey)) {
                try {
                    const lastMessage = this.monitoringMessages.get(messageKey);
                    await lastMessage.edit({ embeds: [embed] });
                } catch (error) {
                    const newMessage = await channel.send({ embeds: [embed] });
                    this.monitoringMessages.set(messageKey, newMessage);
                }
            } else {
                const newMessage = await channel.send({ embeds: [embed] });
                this.monitoringMessages.set(messageKey, newMessage);
            }

        } catch (error) {
            logger.error(`Error sending error update for ${server.customName || server.serverIp}:`, error);
        }
    }

    createServerStatusEmbed(server, serverData) {
        const statusColor = serverData.status === 'online' ? 0x00ff00 : 0xff0000;
        const statusEmoji = serverData.status === 'online' ? '🟢' : '🔴';
        
        const embed = new EmbedBuilder()
            .setTitle(`${statusEmoji} CS2 Server Status - ${server.customName || server.serverIp}`)
            .setColor(statusColor)
            .addFields(
                {
                    name: '🖥️ Server Name',
                    value: serverData.name,
                    inline: true
                },
                {
                    name: '🗺️ Current Map',
                    value: serverData.map,
                    inline: true
                },
                {
                    name: '👥 Players',
                    value: `${serverData.players}/${serverData.maxPlayers}`,
                    inline: true
                },
                {
                    name: '🎮 Game',
                    value: serverData.game,
                    inline: true
                },
                {
                    name: '📊 Status',
                    value: serverData.status.toUpperCase(),
                    inline: true
                },
                {
                    name: '⏱️ Last Updated',
                    value: `<t:${Math.floor(Date.now() / 1000)}:R>`,
                    inline: true
                }
            )
            .setTimestamp()
            .setFooter({ text: `Server: ${server.serverIp}:${server.serverPort}` });

        if (serverData.status === 'online' && serverData.ping > 0) {
            embed.addFields({
                name: '📡 Ping',
                value: `${serverData.ping}ms`,
                inline: true
            });
        }

        if (serverData.error) {
            embed.addFields({
                name: '❌ Error',
                value: serverData.error,
                inline: false
            });
        }

        return embed;
    }

    async saveServerStatus(server, serverData) {
        try {
            await this.bot.database.updateServerStatus(server.id, {
                online: serverData.status === 'online',
                playersOnline: serverData.players,
                mapName: serverData.map
            });
        } catch (error) {
            logger.error(`Error saving server status for ${server.customName || server.serverIp}:`, error);
        }
    }

    async addServerHistory(server, serverData) {
        try {
            await this.bot.database.addServerHistory(server.id, {
                online: serverData.status === 'online',
                playersOnline: serverData.players,
                mapName: serverData.map,
                ping: serverData.ping
            });
        } catch (error) {
            logger.error(`Error adding server history for ${server.customName || server.serverIp}:`, error);
        }
    }

    async getServerHistory(serverId, limit = 10) {
        try {
            return await this.bot.database.query(
                `SELECT * FROM server_history 
                WHERE server_id = ?
                ORDER BY created_at DESC 
                LIMIT ?`,
                [serverId, limit]
            );
        } catch (error) {
            logger.error('Error getting server history:', error);
            return [];
        }
    }

    async cleanupOldHistory() {
        try {
            const cleanedCount = await this.bot.database.cleanupOldHistory(30);
            logger.info(`Cleaned up ${cleanedCount} old server history entries`);
        } catch (error) {
            logger.error('Error cleaning up old server history:', error);
        }
    }

    // Manual server query for testing
    async queryServer(serverIp, serverPort) {
        try {
            const options = {
                type: 'cs2',
                host: serverIp,
                port: serverPort,
                timeout: this.queryTimeout,
                socketTimeout: this.queryTimeout,
                attemptTimeout: this.queryTimeout,
                maxAttempts: 2
            };

            const state = await GameDig.query(options);
            return {
                success: true,
                data: state
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = CS2Monitor;
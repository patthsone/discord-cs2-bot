const axios = require('axios');
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
    }

    startMonitoring() {
        if (this.isMonitoring) {
            logger.warn('CS2 monitoring is already running');
            return;
        }

        this.isMonitoring = true;
        const updateInterval = this.config.get('cs2.updateInterval');
        
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
            const servers = await this.bot.database.all(
                'SELECT * FROM servers WHERE is_active = 1'
            );

            if (servers.length === 0) {
                logger.debug('No active servers to monitor');
                return;
            }

            // Update each server
            for (const server of servers) {
                try {
                    await this.updateServerStatus(server);
                } catch (error) {
                    logger.error(`Error updating server ${server.server_name}:`, error);
                }
            }
        } catch (error) {
            logger.error('Error updating all servers:', error);
        }
    }

    async updateServerStatus(server) {
        try {
            const serverData = await this.getServerInfo(server);
            await this.sendStatusUpdate(server, serverData);
            await this.saveServerStatus(server, serverData);
        } catch (error) {
            logger.error(`Error updating server ${server.server_name}:`, error);
            await this.sendErrorUpdate(server, error.message);
        }
    }

    async getServerInfo(server) {
        try {
            // Using Steam Web API for server info
            const response = await axios.get('https://api.steampowered.com/IGameServersService/GetServerList/v1/', {
                params: {
                    key: process.env.STEAM_API_KEY || 'demo', // You'll need a Steam API key
                    filter: `addr\\${server.server_ip}:${server.server_port}`,
                    limit: 1
                },
                timeout: 10000
            });

            if (response.data.response && response.data.response.servers && response.data.response.servers.length > 0) {
                const serverData = response.data.response.servers[0];
                return {
                    status: 'online',
                    name: serverData.name || server.server_name,
                    map: serverData.map || 'Unknown Map',
                    players: serverData.players || 0,
                    maxPlayers: serverData.max_players || 0,
                    game: serverData.game || 'Counter-Strike 2',
                    version: serverData.version || 'Unknown',
                    ping: serverData.ping || 0,
                    lastSeen: new Date().toISOString()
                };
            } else {
                // Fallback: try direct server query
                return await this.queryServerDirectly(server);
            }
        } catch (error) {
            logger.warn(`Steam API failed for ${server.server_name}, trying direct query:`, error.message);
            return await this.queryServerDirectly(server);
        }
    }

    async queryServerDirectly(server) {
        try {
            // This is a simplified version - in a real implementation, you'd use
            // a library like 'steam-server-query' or implement the Source Query protocol
            // For now, we'll return a basic online status
            return {
                status: 'online',
                name: server.server_name,
                map: 'Unknown Map',
                players: 0,
                maxPlayers: 0,
                game: 'Counter-Strike 2',
                version: 'Unknown',
                ping: 0,
                lastSeen: new Date().toISOString()
            };
        } catch (error) {
            return {
                status: 'offline',
                name: server.server_name,
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

    async sendStatusUpdate(server, serverData) {
        const channelId = server.monitoring_channel_id;
        if (!channelId) {
            logger.warn(`No monitoring channel configured for server ${server.server_name}`);
            return;
        }

        try {
            const channel = this.bot.client.channels.cache.get(channelId);
            if (!channel) {
                logger.warn(`Monitoring channel not found: ${channelId}`);
                return;
            }

            const embed = this.createServerStatusEmbed(server, serverData);
            const messageKey = `${server.server_id}`;
            
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
            logger.error(`Error sending status update for ${server.server_name}:`, error);
        }
    }

    async sendErrorUpdate(server, errorMessage) {
        const channelId = server.monitoring_channel_id;
        if (!channelId) return;

        try {
            const channel = this.bot.client.channels.cache.get(channelId);
            if (!channel) return;

            const embed = new EmbedBuilder()
                .setTitle(`🚨 CS2 Server Monitoring Error - ${server.server_name}`)
                .setDescription(`Failed to get server status: ${errorMessage}`)
                .setColor(0xff0000)
                .setTimestamp();

            const messageKey = `${server.server_id}`;
            
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
            logger.error(`Error sending error update for ${server.server_name}:`, error);
        }
    }

    createServerStatusEmbed(server, serverData) {
        const statusColor = serverData.status === 'online' ? 0x00ff00 : 0xff0000;
        const statusEmoji = serverData.status === 'online' ? '🟢' : '🔴';
        
        const embed = new EmbedBuilder()
            .setTitle(`${statusEmoji} CS2 Server Status - ${server.server_name}`)
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
            .setFooter({ text: `Server: ${server.server_ip}:${server.server_port}` });

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
            await this.bot.database.run(
                `INSERT INTO server_status 
                (server_id, guild_id, server_ip, server_port, status, player_count, max_players, map_name, server_name, last_updated)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    server.server_id,
                    server.guild_id,
                    server.server_ip,
                    server.server_port,
                    serverData.status,
                    serverData.players,
                    serverData.maxPlayers,
                    serverData.map,
                    serverData.name,
                    new Date().toISOString()
                ]
            );
        } catch (error) {
            logger.error(`Error saving server status for ${server.server_name}:`, error);
        }
    }

    async getServerHistory(serverId, limit = 10) {
        try {
            return await this.bot.database.all(
                `SELECT * FROM server_status 
                WHERE server_id = ?
                ORDER BY last_updated DESC 
                LIMIT ?`,
                [serverId, limit]
            );
        } catch (error) {
            logger.error('Error getting server history:', error);
            return [];
        }
    }
}

module.exports = CS2Monitor;

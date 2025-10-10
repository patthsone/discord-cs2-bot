const { EmbedBuilder } = require('discord.js');
const logger = require('../utils/logger');

class ServerManagementService {
    constructor(bot) {
        this.bot = bot;
    }

    async addServer(guildId, serverName, serverIp, serverPort, serverPassword = null, monitoringChannelId = null) {
        try {
            const serverId = `${guildId}-${serverName}-${Date.now()}`;
            
            await this.bot.database.run(
                `INSERT INTO servers (server_id, guild_id, server_name, server_ip, server_port, server_password, monitoring_channel_id)
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [serverId, guildId, serverName, serverIp, serverPort, serverPassword, monitoringChannelId]
            );

            logger.info(`Added server ${serverName} (${serverIp}:${serverPort}) for guild ${guildId}`);
            return serverId;
        } catch (error) {
            logger.error('Error adding server:', error);
            throw error;
        }
    }

    async removeServer(guildId, serverId) {
        try {
            const result = await this.bot.database.run(
                'UPDATE servers SET is_active = 0 WHERE server_id = ? AND guild_id = ?',
                [serverId, guildId]
            );

            if (result.changes === 0) {
                throw new Error('Server not found or already removed');
            }

            logger.info(`Removed server ${serverId} for guild ${guildId}`);
            return true;
        } catch (error) {
            logger.error('Error removing server:', error);
            throw error;
        }
    }

    async getServers(guildId) {
        try {
            return await this.bot.database.all(
                'SELECT * FROM servers WHERE guild_id = ? AND is_active = 1 ORDER BY created_at DESC',
                [guildId]
            );
        } catch (error) {
            logger.error('Error getting servers:', error);
            return [];
        }
    }

    async getServer(serverId) {
        try {
            return await this.bot.database.get(
                'SELECT * FROM servers WHERE server_id = ? AND is_active = 1',
                [serverId]
            );
        } catch (error) {
            logger.error('Error getting server:', error);
            return null;
        }
    }

    async updateServerMonitoringChannel(serverId, channelId) {
        try {
            await this.bot.database.run(
                'UPDATE servers SET monitoring_channel_id = ?, updated_at = CURRENT_TIMESTAMP WHERE server_id = ?',
                [channelId, serverId]
            );

            logger.info(`Updated monitoring channel for server ${serverId}`);
            return true;
        } catch (error) {
            logger.error('Error updating server monitoring channel:', error);
            throw error;
        }
    }

    async addManagementRole(guildId, roleId) {
        try {
            await this.bot.database.run(
                'INSERT OR IGNORE INTO server_management_roles (guild_id, role_id) VALUES (?, ?)',
                [guildId, roleId]
            );

            logger.info(`Added management role ${roleId} for guild ${guildId}`);
            return true;
        } catch (error) {
            logger.error('Error adding management role:', error);
            throw error;
        }
    }

    async removeManagementRole(guildId, roleId) {
        try {
            const result = await this.bot.database.run(
                'DELETE FROM server_management_roles WHERE guild_id = ? AND role_id = ?',
                [guildId, roleId]
            );

            logger.info(`Removed management role ${roleId} for guild ${guildId}`);
            return result.changes > 0;
        } catch (error) {
            logger.error('Error removing management role:', error);
            throw error;
        }
    }

    async getManagementRoles(guildId) {
        try {
            const roles = await this.bot.database.all(
                'SELECT role_id FROM server_management_roles WHERE guild_id = ?',
                [guildId]
            );
            return roles.map(role => role.role_id);
        } catch (error) {
            logger.error('Error getting management roles:', error);
            return [];
        }
    }

    async hasManagementPermission(member) {
        try {
            const managementRoles = await this.getManagementRoles(member.guild.id);
            
            // Check if user has any of the management roles
            return managementRoles.some(roleId => member.roles.cache.has(roleId)) ||
                   member.permissions.has('Administrator');
        } catch (error) {
            logger.error('Error checking management permission:', error);
            return false;
        }
    }

    createServerListEmbed(servers, guild) {
        const embed = new EmbedBuilder()
            .setTitle('🎮 CS2 Servers')
            .setDescription(`Servers configured for ${guild.name}`)
            .setColor(0x00ff00)
            .setTimestamp();

        if (servers.length === 0) {
            embed.setDescription('No servers configured. Use `/addserver` to add one!');
            embed.setColor(0xff0000);
            return embed;
        }

        servers.forEach((server, index) => {
            const status = server.is_active ? '🟢 Active' : '🔴 Inactive';
            const channel = server.monitoring_channel_id ? 
                `<#${server.monitoring_channel_id}>` : 'Not set';
            
            embed.addFields({
                name: `${index + 1}. ${server.server_name}`,
                value: `**IP:** ${server.server_ip}:${server.server_port}\n**Status:** ${status}\n**Monitoring:** ${channel}\n**ID:** \`${server.server_id}\``,
                inline: false
            });
        });

        return embed;
    }

    createServerAddedEmbed(server) {
        return new EmbedBuilder()
            .setTitle('✅ Server Added Successfully')
            .setDescription(`CS2 server has been added to monitoring`)
            .setColor(0x00ff00)
            .addFields(
                {
                    name: '🖥️ Server Name',
                    value: server.server_name,
                    inline: true
                },
                {
                    name: '🌐 Address',
                    value: `${server.server_ip}:${server.server_port}`,
                    inline: true
                },
                {
                    name: '🆔 Server ID',
                    value: `\`${server.server_id}\``,
                    inline: true
                }
            )
            .setTimestamp();
    }

    createServerRemovedEmbed(serverName) {
        return new EmbedBuilder()
            .setTitle('🗑️ Server Removed')
            .setDescription(`CS2 server "${serverName}" has been removed from monitoring`)
            .setColor(0xff9900)
            .setTimestamp();
    }
}

module.exports = ServerManagementService;

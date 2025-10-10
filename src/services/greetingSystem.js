const { EmbedBuilder } = require('discord.js');
const logger = require('../utils/logger');
const ConfigManager = require('../utils/config');

class GreetingSystem {
    constructor(bot) {
        this.bot = bot;
        this.config = new ConfigManager();
        this.greetingMessages = [
            "Welcome to our server, {user}! 🎮",
            "Hey {user}, glad to have you here! 🚀",
            "Welcome aboard, {user}! Ready for some CS2 action? 🔫",
            "Hello {user}! Make yourself at home! 🏠",
            "Welcome {user}! Don't forget to check out our rules! 📋"
        ];
    }

    async handleNewMember(member) {
        try {
            // Get guild settings
            const settings = await this.getGreetingSettings(member.guild.id);
            
            if (!settings || !settings.isActive) {
                logger.debug(`Greeting system disabled for guild ${member.guild.id}`);
                return;
            }
            
            // Assign default role if configured
            if (settings.autoRoleId) {
                await this.assignDefaultRole(member, settings.autoRoleId);
            }
            
            // Send greeting message
            await this.sendGreetingMessage(member, settings);
            
            logger.info(`Greeted new member: ${member.user.tag}`);
        } catch (error) {
            logger.error('Error handling new member:', error);
        }
    }

    async assignDefaultRole(member, roleId) {
        try {
            const role = member.guild.roles.cache.get(roleId);
            if (!role) {
                logger.warn(`Default role not found: ${roleId}`);
                return;
            }

            await member.roles.add(role);
            logger.info(`Assigned default role to ${member.user.tag}`);
        } catch (error) {
            logger.error('Error assigning default role:', error);
        }
    }

    async sendGreetingMessage(member, settings) {
        const greetingChannelId = settings.welcomeChannelId;
        
        if (!greetingChannelId) {
            logger.warn('No greeting channel configured');
            return;
        }

        try {
            const channel = member.guild.channels.cache.get(greetingChannelId);
            if (!channel) {
                logger.warn(`Greeting channel not found: ${greetingChannelId}`);
                return;
            }

            // Use custom message if available, otherwise use random default
            let message;
            if (settings.welcomeMessage) {
                message = settings.welcomeMessage.replace('{user}', member.user.toString());
            } else {
                const randomMessage = this.greetingMessages[
                    Math.floor(Math.random() * this.greetingMessages.length)
                ].replace('{user}', member.user.toString());
                message = randomMessage;
            }

            // Create welcome embed
            const welcomeEmbed = this.createWelcomeEmbed(member, message);
            
            await channel.send({ 
                content: message,
                embeds: [welcomeEmbed]
            });

        } catch (error) {
            logger.error('Error sending greeting message:', error);
        }
    }

    createWelcomeEmbed(member, message) {
        const embed = new EmbedBuilder()
            .setTitle('🎉 Welcome!')
            .setDescription(message)
            .setColor(0x00ff00)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .addFields(
                {
                    name: '👤 User',
                    value: member.user.tag,
                    inline: true
                },
                {
                    name: '📅 Account Created',
                    value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`,
                    inline: true
                },
                {
                    name: '👥 Member Count',
                    value: member.guild.memberCount.toString(),
                    inline: true
                }
            )
            .setTimestamp()
            .setFooter({ 
                text: `Welcome to ${member.guild.name}!`,
                iconURL: member.guild.iconURL() || undefined
            });

        return embed;
    }

    async setGreetingSettings(guildId, settings) {
        try {
            const result = await this.bot.database.setGreetingSettings(guildId, {
                welcomeChannelId: settings.welcomeChannelId,
                welcomeMessage: settings.welcomeMessage,
                autoRoleId: settings.autoRoleId,
                isActive: settings.isActive !== false
            });
            
            // Invalidate cache
            await this.bot.cache.invalidateGuildSettings(guildId);
            
            logger.info(`Set greeting settings for guild ${guildId}`);
            return result;
        } catch (error) {
            logger.error('Error setting greeting settings:', error);
            throw error;
        }
    }

    async getGreetingSettings(guildId) {
        try {
            // Check cache first
            let settings = await this.bot.cache.getGuildSettings(guildId);
            
            if (!settings || !settings.greetingSettings) {
                // Get from database
                settings = await this.bot.database.getGreetingSettings(guildId);
                
                if (settings) {
                    // Cache the result
                    await this.bot.cache.setGuildSettings(guildId, { greetingSettings: settings });
                }
            } else {
                settings = settings.greetingSettings;
            }
            
            return settings;
        } catch (error) {
            logger.error('Error getting greeting settings:', error);
            return null;
        }
    }

    async removeGreetingSettings(guildId) {
        try {
            await this.bot.database.query(
                'DELETE FROM greeting_settings WHERE guild_id = ?',
                [guildId]
            );
            
            // Invalidate cache
            await this.bot.cache.invalidateGuildSettings(guildId);
            
            logger.info(`Removed greeting settings for guild ${guildId}`);
        } catch (error) {
            logger.error('Error removing greeting settings:', error);
            throw error;
        }
    }

    async toggleGreetingSystem(guildId, isActive) {
        try {
            await this.bot.database.query(
                'UPDATE greeting_settings SET is_active = ? WHERE guild_id = ?',
                [isActive, guildId]
            );
            
            // Invalidate cache
            await this.bot.cache.invalidateGuildSettings(guildId);
            
            logger.info(`Toggled greeting system for guild ${guildId}: ${isActive ? 'enabled' : 'disabled'}`);
        } catch (error) {
            logger.error('Error toggling greeting system:', error);
            throw error;
        }
    }

    async updateWelcomeChannel(guildId, channelId) {
        try {
            await this.bot.database.query(
                `INSERT INTO greeting_settings (guild_id, welcome_channel_id, is_active)
                 VALUES (?, ?, 1)
                 ON DUPLICATE KEY UPDATE welcome_channel_id = VALUES(welcome_channel_id)`,
                [guildId, channelId]
            );
            
            // Invalidate cache
            await this.bot.cache.invalidateGuildSettings(guildId);
            
            logger.info(`Updated welcome channel for guild ${guildId}: ${channelId}`);
        } catch (error) {
            logger.error('Error updating welcome channel:', error);
            throw error;
        }
    }

    async updateWelcomeMessage(guildId, message) {
        try {
            await this.bot.database.query(
                `INSERT INTO greeting_settings (guild_id, welcome_message, is_active)
                 VALUES (?, ?, 1)
                 ON DUPLICATE KEY UPDATE welcome_message = VALUES(welcome_message)`,
                [guildId, message]
            );
            
            // Invalidate cache
            await this.bot.cache.invalidateGuildSettings(guildId);
            
            logger.info(`Updated welcome message for guild ${guildId}`);
        } catch (error) {
            logger.error('Error updating welcome message:', error);
            throw error;
        }
    }

    async updateAutoRole(guildId, roleId) {
        try {
            await this.bot.database.query(
                `INSERT INTO greeting_settings (guild_id, auto_role_id, is_active)
                 VALUES (?, ?, 1)
                 ON DUPLICATE KEY UPDATE auto_role_id = VALUES(auto_role_id)`,
                [guildId, roleId]
            );
            
            // Invalidate cache
            await this.bot.cache.invalidateGuildSettings(guildId);
            
            logger.info(`Updated auto role for guild ${guildId}: ${roleId}`);
        } catch (error) {
            logger.error('Error updating auto role:', error);
            throw error;
        }
    }

    // Test greeting message
    async testGreeting(member, settings) {
        try {
            const channel = member.guild.channels.cache.get(settings.welcomeChannelId);
            if (!channel) {
                throw new Error('Welcome channel not found');
            }

            let message;
            if (settings.welcomeMessage) {
                message = settings.welcomeMessage.replace('{user}', member.user.toString());
            } else {
                const randomMessage = this.greetingMessages[
                    Math.floor(Math.random() * this.greetingMessages.length)
                ].replace('{user}', member.user.toString());
                message = randomMessage;
            }

            const welcomeEmbed = this.createWelcomeEmbed(member, message);
            
            await channel.send({ 
                content: `🧪 **Test Greeting**\n${message}`,
                embeds: [welcomeEmbed]
            });

            return true;
        } catch (error) {
            logger.error('Error testing greeting:', error);
            throw error;
        }
    }
}

module.exports = GreetingSystem;
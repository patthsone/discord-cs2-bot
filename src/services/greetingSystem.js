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
            // Assign default role if configured
            await this.assignDefaultRole(member);
            
            // Send greeting message
            await this.sendGreetingMessage(member);
            
            logger.info(`Greeted new member: ${member.user.tag}`);
        } catch (error) {
            logger.error('Error handling new member:', error);
        }
    }

    async assignDefaultRole(member) {
        const defaultRoleId = this.config.get('roles.default');
        
        if (!defaultRoleId) {
            logger.warn('No default role configured');
            return;
        }

        try {
            const role = member.guild.roles.cache.get(defaultRoleId);
            if (!role) {
                logger.warn(`Default role not found: ${defaultRoleId}`);
                return;
            }

            await member.roles.add(role);
            logger.info(`Assigned default role to ${member.user.tag}`);
        } catch (error) {
            logger.error('Error assigning default role:', error);
        }
    }

    async sendGreetingMessage(member) {
        const greetingChannelId = this.config.get('channels.greeting');
        
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

            // Get a random greeting message
            const randomMessage = this.greetingMessages[
                Math.floor(Math.random() * this.greetingMessages.length)
            ].replace('{user}', member.user.toString());

            // Create welcome embed
            const welcomeEmbed = this.createWelcomeEmbed(member, randomMessage);
            
            await channel.send({ 
                content: randomMessage,
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

    async setCustomGreetingMessage(guildId, message) {
        try {
            await this.bot.database.run(
                'INSERT OR REPLACE INTO greeting_messages (guild_id, message, is_active) VALUES (?, ?, 1)',
                [guildId, message]
            );
            logger.info(`Set custom greeting message for guild ${guildId}`);
        } catch (error) {
            logger.error('Error setting custom greeting message:', error);
            throw error;
        }
    }

    async getCustomGreetingMessage(guildId) {
        try {
            const result = await this.bot.database.get(
                'SELECT message FROM greeting_messages WHERE guild_id = ? AND is_active = 1',
                [guildId]
            );
            return result ? result.message : null;
        } catch (error) {
            logger.error('Error getting custom greeting message:', error);
            return null;
        }
    }

    async removeCustomGreetingMessage(guildId) {
        try {
            await this.bot.database.run(
                'UPDATE greeting_messages SET is_active = 0 WHERE guild_id = ?',
                [guildId]
            );
            logger.info(`Removed custom greeting message for guild ${guildId}`);
        } catch (error) {
            logger.error('Error removing custom greeting message:', error);
            throw error;
        }
    }
}

module.exports = GreetingSystem;

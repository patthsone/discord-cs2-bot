const { EmbedBuilder } = require('discord.js');
const logger = require('../utils/logger');

class ConfigManager {
    constructor() {
        this.config = {
            // Discord Configuration
            discord: {
                token: process.env.DISCORD_TOKEN,
                clientId: process.env.CLIENT_ID,
                guildId: process.env.GUILD_ID,
                commandPrefix: process.env.COMMAND_PREFIX || '!'
            },
            
            // Channel Configuration
            channels: {
                greeting: process.env.GREETING_CHANNEL_ID,
                cs2Monitoring: process.env.CS2_MONITORING_CHANNEL_ID,
                leveling: process.env.LEVELING_CHANNEL_ID
            },
            
            // Role Configuration
            roles: {
                default: process.env.DEFAULT_ROLE_ID,
                levelRoles: this.parseLevelRoles(process.env.LEVEL_ROLES)
            },
            
            // CS2 Server Configuration (now handled per-server in database)
            cs2: {
                updateInterval: parseInt(process.env.UPDATE_INTERVAL_MINUTES) || 10
            },
            
            // Leveling Configuration
            leveling: {
                xpPerMessage: parseInt(process.env.XP_PER_MESSAGE) || 15,
                xpPerVoiceMinute: parseInt(process.env.XP_PER_VOICE_MINUTE) || 5,
                levelMultiplier: parseFloat(process.env.LEVEL_MULTIPLIER) || 1.2,
                maxLevel: parseInt(process.env.MAX_LEVEL) || 100
            }
        };
        
        this.validateConfig();
    }

    parseLevelRoles(levelRolesString) {
        try {
            if (!levelRolesString) return {};
            return JSON.parse(levelRolesString);
        } catch (error) {
            logger.warn('Invalid LEVEL_ROLES format, using empty object');
            return {};
        }
    }

    validateConfig() {
        const required = [
            'discord.token',
            'discord.clientId',
            'discord.guildId'
        ];

        const missing = required.filter(key => {
            const value = this.get(key);
            return !value || value === 'your_discord_bot_token_here' || 
                   value === 'your_bot_client_id_here' || 
                   value === 'your_server_guild_id_here';
        });

        if (missing.length > 0) {
            logger.error(`Missing required configuration: ${missing.join(', ')}`);
            throw new Error(`Missing required configuration: ${missing.join(', ')}`);
        }

        logger.info('Configuration validated successfully');
    }

    get(path) {
        return path.split('.').reduce((obj, key) => obj && obj[key], this.config);
    }

    set(path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((obj, key) => {
            if (!obj[key]) obj[key] = {};
            return obj[key];
        }, this.config);
        target[lastKey] = value;
    }

    getAll() {
        return this.config;
    }

    // Helper method to create embeds with consistent styling
    createEmbed(title, description, color = 0x00ff00) {
        return new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor(color)
            .setTimestamp()
            .setFooter({ text: 'Discord CS2 Bot', iconURL: 'https://cdn.discordapp.com/embed/avatars/0.png' });
    }

    // Helper method to create error embeds
    createErrorEmbed(title, description) {
        return this.createEmbed(title, description, 0xff0000);
    }

    // Helper method to create success embeds
    createSuccessEmbed(title, description) {
        return this.createEmbed(title, description, 0x00ff00);
    }

    // Helper method to create info embeds
    createInfoEmbed(title, description) {
        return this.createEmbed(title, description, 0x0099ff);
    }
}

module.exports = ConfigManager;

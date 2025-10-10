const { Events, ActivityType } = require('discord.js');
const logger = require('../../utils/logger');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client, bot) {
        logger.info(`Bot is ready! Logged in as ${client.user.tag}`);
        
        // Set bot activity
        client.user.setActivity('CS2 Server & Leveling', { type: ActivityType.Watching });
        
        // Initialize services
        try {
            logger.info('Bot initialization completed successfully');
        } catch (error) {
            logger.error('Error during bot initialization:', error);
        }
    },
};

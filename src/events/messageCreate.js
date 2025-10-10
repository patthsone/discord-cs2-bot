const { Events } = require('discord.js');
const logger = require('../../utils/logger');

module.exports = {
    name: Events.MessageCreate,
    async execute(message, bot) {
        // Handle leveling system
        try {
            await bot.levelingSystem.handleMessage(message);
        } catch (error) {
            logger.error('Error handling message for leveling:', error);
        }
    },
};

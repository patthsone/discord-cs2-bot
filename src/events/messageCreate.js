const { Events } = require('discord.js');
const logger = require('../../utils/logger');

module.exports = {
    name: Events.MessageCreate,
    async execute(message, bot) {
        // Handle leveling system
        try {
            await bot.levelingSystem.handleMessage(message);
        } catch (error) {
            // Only log leveling errors as warnings to reduce noise
            logger.warn('Error handling message for leveling:', {
                error: error.message,
                user: message.author.tag,
                guild: message.guild?.name || 'DM'
            });
        }
    },
};

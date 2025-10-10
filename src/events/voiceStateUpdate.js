const { Events } = require('discord.js');
const logger = require('../../utils/logger');

module.exports = {
    name: Events.VoiceStateUpdate,
    async execute(oldState, newState, bot) {
        try {
            await bot.levelingSystem.handleVoiceStateUpdate(oldState, newState);
        } catch (error) {
            logger.error('Error handling voice state update:', error);
        }
    },
};

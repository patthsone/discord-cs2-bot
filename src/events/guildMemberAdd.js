const { Events } = require('discord.js');
const logger = require('../../utils/logger');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member, bot) {
        logger.info(`New member joined: ${member.user.tag}`);
        
        try {
            await bot.greetingSystem.handleNewMember(member);
        } catch (error) {
            logger.error('Error handling new member:', error);
        }
    },
};

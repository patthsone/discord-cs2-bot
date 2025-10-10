const { Events, EmbedBuilder } = require('discord.js');
const logger = require('../../utils/logger');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction, bot) {
        if (!interaction.isChatInputCommand()) return;
        
        const command = bot.commands.get(interaction.commandName);
        
        if (!command) {
            logger.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }
        
        try {
            await command.execute(interaction, bot);
            logger.info(`${interaction.user.tag} executed /${interaction.commandName}`);
        } catch (error) {
            logger.error(`Error executing ${interaction.commandName}:`, error);
            
            const errorMessage = {
                content: '❌ There was an error while executing this command!',
                ephemeral: true
            };
            
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(errorMessage);
            } else {
                await interaction.reply(errorMessage);
            }
        }
    },
};
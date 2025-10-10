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
            // Only log successful commands in debug mode
            if (process.env.LOG_LEVEL === 'debug') {
                logger.info(`${interaction.user.tag} executed /${interaction.commandName}`);
            }
        } catch (error) {
            // Log error with context but don't spam console
            logger.error(`Error executing ${interaction.commandName}:`, {
                error: error.message,
                user: interaction.user.tag,
                guild: interaction.guild?.name || 'DM'
            });
            
            const errorMessage = {
                content: '❌ There was an error while executing this command!',
                ephemeral: true
            };
            
            try {
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp(errorMessage);
                } else {
                    await interaction.reply(errorMessage);
                }
            } catch (replyError) {
                // Silent fail for reply errors to avoid spam
                logger.warn(`Failed to send error reply for ${interaction.commandName}`);
            }
        }
    },
};
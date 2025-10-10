const { Events, EmbedBuilder } = require('discord.js');
const logger = require('../../utils/logger');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction, bot) {
        if (!interaction.isStringSelectMenu()) return;
        
        try {
            if (interaction.customId === 'language_select') {
                const selectedLanguage = interaction.values[0];
                const i18n = bot.i18n;
                
                // Validate language
                const availableLanguages = i18n.getAvailableLanguages();
                if (!availableLanguages.find(lang => lang.code === selectedLanguage)) {
                    const embed = new EmbedBuilder()
                        .setTitle(i18n.t('commands.language.invalidLanguage', 'en'))
                        .setDescription(i18n.t('commands.language.invalidLanguageDesc', 'en'))
                        .setColor(0xff0000);
                    
                    return await interaction.reply({ embeds: [embed], ephemeral: true });
                }
                
                // Set user language
                await i18n.setUserLanguage(interaction.user.id, interaction.guild.id, selectedLanguage);
                
                const languageInfo = i18n.getLanguageInfo(selectedLanguage);
                const embed = new EmbedBuilder()
                    .setTitle(i18n.t('commands.language.setSuccess', selectedLanguage))
                    .setDescription(i18n.t('commands.language.setSuccessDesc', selectedLanguage, { 
                        language: `${languageInfo.flag} ${languageInfo.name}` 
                    }))
                    .setColor(0x00ff00)
                    .setTimestamp();
                
                await interaction.reply({ embeds: [embed], ephemeral: true });
                
                logger.info(`User ${interaction.user.tag} set language to ${selectedLanguage}`);
            }
        } catch (error) {
            logger.error('Error handling select menu interaction:', error);
            
            const embed = new EmbedBuilder()
                .setTitle('❌ Error')
                .setDescription('An error occurred while processing your selection.')
                .setColor(0xff0000);
            
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ embeds: [embed], ephemeral: true });
            } else {
                await interaction.reply({ embeds: [embed], ephemeral: true });
            }
        }
    },
};

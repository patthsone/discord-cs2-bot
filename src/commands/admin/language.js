const { SlashCommandBuilder, EmbedBuilder, StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
const logger = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('language')
        .setDescription('Set your preferred language for the bot'),
    
    async execute(interaction, bot) {
        try {
            const i18n = bot.i18n;
            const userLanguage = await i18n.getUserLanguage(interaction.user.id, interaction.guild.id);
            const availableLanguages = i18n.getAvailableLanguages();
            
            const embed = new EmbedBuilder()
                .setTitle(i18n.t('commands.language.title', userLanguage))
                .setColor(0x0099ff)
                .addFields(
                    {
                        name: i18n.t('commands.language.current', userLanguage),
                        value: `${i18n.getLanguageInfo(userLanguage)?.flag} ${i18n.getLanguageInfo(userLanguage)?.name}`,
                        inline: true
                    },
                    {
                        name: i18n.t('commands.language.available', userLanguage),
                        value: availableLanguages.map(lang => `${lang.flag} ${lang.name}`).join('\n'),
                        inline: true
                    }
                )
                .setTimestamp();
            
            // Create language selection menu
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('language_select')
                .setPlaceholder(i18n.t('commands.language.available', userLanguage))
                .addOptions(
                    availableLanguages.map(lang => ({
                        label: lang.name,
                        value: lang.code,
                        emoji: lang.flag,
                        default: lang.code === userLanguage
                    }))
                );
            
            const row = new ActionRowBuilder().addComponents(selectMenu);
            
            await interaction.reply({ 
                embeds: [embed], 
                components: [row],
                ephemeral: true 
            });
            
        } catch (error) {
            logger.error('Error executing language command:', error);
            
            const embed = new EmbedBuilder()
                .setTitle('❌ Error')
                .setDescription('An error occurred while loading language settings.')
                .setColor(0xff0000);
            
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
};

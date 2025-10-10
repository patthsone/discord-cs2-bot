const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const logger = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('level')
        .setDescription('Check your current level and XP')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to check the level of')
                .setRequired(false)
        ),
    
    async execute(interaction, bot) {
        try {
            const targetUser = interaction.options.getUser('user') || interaction.user;
            const guildId = interaction.guild.id;
            const userLanguage = await bot.i18n.getUserLanguage(interaction.user.id, guildId);
            
            const user = await bot.levelingSystem.getUser(targetUser.id, guildId);
            
            if (!user) {
                const embed = new EmbedBuilder()
                    .setTitle(bot.i18n.t('commands.level.userNotFound', userLanguage))
                    .setDescription(bot.i18n.t('commands.level.noXp', userLanguage, { user: targetUser.toString() }))
                    .setColor(0xff0000);
                
                return await interaction.reply({ embeds: [embed] });
            }
            
            const rank = await bot.levelingSystem.getUserRank(targetUser.id, guildId);
            const nextLevelXP = bot.levelingSystem.calculateXPForLevel(user.level + 1);
            const currentLevelXP = bot.levelingSystem.calculateXPForLevel(user.level);
            const progressXP = user.xp - currentLevelXP;
            const neededXP = nextLevelXP - currentLevelXP;
            const progressBar = this.createProgressBar(progressXP, neededXP);
            
            const embed = new EmbedBuilder()
                .setTitle(bot.i18n.t('commands.level.title', userLanguage, { username: targetUser.username }))
                .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
                .setColor(0x00ff00)
                .addFields(
                    {
                        name: bot.i18n.t('commands.level.level', userLanguage),
                        value: user.level.toString(),
                        inline: true
                    },
                    {
                        name: bot.i18n.t('commands.level.xp', userLanguage),
                        value: user.xp.toString(),
                        inline: true
                    },
                    {
                        name: bot.i18n.t('commands.level.rank', userLanguage),
                        value: `#${rank}`,
                        inline: true
                    },
                    {
                        name: bot.i18n.t('commands.level.progress', userLanguage),
                        value: `${progressBar} ${progressXP}/${neededXP} XP`,
                        inline: false
                    },
                    {
                        name: bot.i18n.t('commands.level.messages', userLanguage),
                        value: user.total_messages.toString(),
                        inline: true
                    },
                    {
                        name: bot.i18n.t('commands.level.voiceTime', userLanguage),
                        value: `${user.voice_time} minutes`,
                        inline: true
                    }
                )
                .setTimestamp();
            
            await interaction.reply({ embeds: [embed] });
            
        } catch (error) {
            logger.error('Error executing level command:', error);
            await interaction.reply({ content: '❌ An error occurred while checking the level.', ephemeral: true });
        }
    },
    
    createProgressBar(current, max, length = 10) {
        const filled = Math.round((current / max) * length);
        const empty = length - filled;
        return '█'.repeat(filled) + '░'.repeat(empty);
    }
};

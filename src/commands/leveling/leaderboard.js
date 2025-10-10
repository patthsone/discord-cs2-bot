const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const logger = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Show the server leaderboard')
        .addIntegerOption(option =>
            option.setName('limit')
                .setDescription('Number of users to show (max 25)')
                .setMinValue(1)
                .setMaxValue(25)
                .setRequired(false)
        ),
    
    async execute(interaction, bot) {
        try {
            const limit = interaction.options.getInteger('limit') || 10;
            const guildId = interaction.guild.id;
            
            const leaderboard = await bot.levelingSystem.getLeaderboard(guildId, limit);
            
            if (leaderboard.length === 0) {
                const embed = new EmbedBuilder()
                    .setTitle('📊 Leaderboard')
                    .setDescription('No users found on the leaderboard yet!')
                    .setColor(0xff0000);
                
                return await interaction.reply({ embeds: [embed] });
            }
            
            const embed = new EmbedBuilder()
                .setTitle('🏆 Server Leaderboard')
                .setColor(0xffd700)
                .setTimestamp();
            
            let description = '';
            for (let i = 0; i < leaderboard.length; i++) {
                const user = leaderboard[i];
                const member = interaction.guild.members.cache.get(user.user_id);
                const username = member ? member.user.username : 'Unknown User';
                
                const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
                description += `${medal} **${username}** - Level ${user.level} (${user.xp} XP)\n`;
            }
            
            embed.setDescription(description);
            
            await interaction.reply({ embeds: [embed] });
            
        } catch (error) {
            logger.error('Error executing leaderboard command:', error);
            await interaction.reply({ content: '❌ An error occurred while fetching the leaderboard.', ephemeral: true });
        }
    },
};

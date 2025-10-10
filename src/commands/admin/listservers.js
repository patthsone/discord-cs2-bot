const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const logger = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('listservers')
        .setDescription('List all CS2 servers configured for this guild'),
    
    async execute(interaction, bot) {
        try {
            const servers = await bot.serverManagementService.getServers(interaction.guild.id);
            const embed = bot.serverManagementService.createServerListEmbed(servers, interaction.guild);
            
            await interaction.reply({ embeds: [embed] });
            
        } catch (error) {
            logger.error('Error executing listservers command:', error);
            
            const embed = new EmbedBuilder()
                .setTitle('❌ Error')
                .setDescription('An error occurred while fetching servers. Please try again.')
                .setColor(0xff0000);
            
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
};

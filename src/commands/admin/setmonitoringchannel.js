const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const logger = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setmonitoringchannel')
        .setDescription('Set the monitoring channel for a CS2 server')
        .addStringOption(option =>
            option.setName('server_id')
                .setDescription('Server ID to update')
                .setRequired(true)
        )
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Channel for monitoring updates')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    
    async execute(interaction, bot) {
        try {
            // Check if user has management permission
            if (!await bot.serverManagementService.hasManagementPermission(interaction.member)) {
                const embed = new EmbedBuilder()
                    .setTitle('❌ Permission Denied')
                    .setDescription('You don\'t have permission to manage servers. Contact an administrator.')
                    .setColor(0xff0000);
                
                return await interaction.reply({ embeds: [embed], ephemeral: true });
            }

            const serverId = interaction.options.getString('server_id');
            const channel = interaction.options.getChannel('channel');
            
            // Get server info
            const server = await bot.serverManagementService.getServer(serverId);
            if (!server) {
                const embed = new EmbedBuilder()
                    .setTitle('❌ Server Not Found')
                    .setDescription('Server not found.')
                    .setColor(0xff0000);
                
                return await interaction.reply({ embeds: [embed], ephemeral: true });
            }

            // Check if server belongs to this guild
            if (server.guild_id !== interaction.guild.id) {
                const embed = new EmbedBuilder()
                    .setTitle('❌ Permission Denied')
                    .setDescription('You can only modify servers from your own guild.')
                    .setColor(0xff0000);
                
                return await interaction.reply({ embeds: [embed], ephemeral: true });
            }

            // Update monitoring channel
            await bot.serverManagementService.updateServerMonitoringChannel(serverId, channel.id);
            
            const embed = new EmbedBuilder()
                .setTitle('✅ Monitoring Channel Updated')
                .setDescription(`Monitoring channel for **${server.server_name}** has been set to ${channel}`)
                .setColor(0x00ff00)
                .setTimestamp();
            
            await interaction.reply({ embeds: [embed] });
            
        } catch (error) {
            logger.error('Error executing setmonitoringchannel command:', error);
            
            const embed = new EmbedBuilder()
                .setTitle('❌ Error')
                .setDescription('An error occurred while updating the monitoring channel. Please try again.')
                .setColor(0xff0000);
            
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
};

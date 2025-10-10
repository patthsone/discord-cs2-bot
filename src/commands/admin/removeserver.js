const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const logger = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removeserver')
        .setDescription('Remove a CS2 server from monitoring')
        .addStringOption(option =>
            option.setName('server_id')
                .setDescription('Server ID to remove (use /listservers to find it)')
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
            
            // Get server info before removing
            const server = await bot.serverManagementService.getServer(serverId);
            if (!server) {
                const embed = new EmbedBuilder()
                    .setTitle('❌ Server Not Found')
                    .setDescription('Server not found or already removed.')
                    .setColor(0xff0000);
                
                return await interaction.reply({ embeds: [embed], ephemeral: true });
            }

            // Check if server belongs to this guild
            if (server.guild_id !== interaction.guild.id) {
                const embed = new EmbedBuilder()
                    .setTitle('❌ Permission Denied')
                    .setDescription('You can only remove servers from your own guild.')
                    .setColor(0xff0000);
                
                return await interaction.reply({ embeds: [embed], ephemeral: true });
            }

            // Remove server
            await bot.serverManagementService.removeServer(interaction.guild.id, serverId);
            
            const embed = bot.serverManagementService.createServerRemovedEmbed(server.server_name);
            await interaction.reply({ embeds: [embed] });
            
        } catch (error) {
            logger.error('Error executing removeserver command:', error);
            
            const embed = new EmbedBuilder()
                .setTitle('❌ Error')
                .setDescription('An error occurred while removing the server. Please try again.')
                .setColor(0xff0000);
            
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
};

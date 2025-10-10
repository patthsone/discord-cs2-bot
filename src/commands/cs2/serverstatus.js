const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const logger = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverstatus')
        .setDescription('Check the current CS2 server status')
        .addStringOption(option =>
            option.setName('server_id')
                .setDescription('Server ID to check (use /listservers to find it)')
                .setRequired(false)
        ),
    
    async execute(interaction, bot) {
        try {
            await interaction.deferReply();
            
            const serverId = interaction.options.getString('server_id');
            
            if (serverId) {
                // Check specific server
                const server = await bot.serverManagementService.getServer(serverId);
                if (!server) {
                    const embed = new EmbedBuilder()
                        .setTitle('❌ Server Not Found')
                        .setDescription('Server not found.')
                        .setColor(0xff0000);
                    
                    return await interaction.editReply({ embeds: [embed] });
                }
                
                // Check if server belongs to this guild
                if (server.guild_id !== interaction.guild.id) {
                    const embed = new EmbedBuilder()
                        .setTitle('❌ Permission Denied')
                        .setDescription('You can only check servers from your own guild.')
                        .setColor(0xff0000);
                    
                    return await interaction.editReply({ embeds: [embed] });
                }
                
                const serverData = await bot.cs2Monitor.getServerInfo(server);
                const embed = bot.cs2Monitor.createServerStatusEmbed(server, serverData);
                
                await interaction.editReply({ embeds: [embed] });
            } else {
                // List all servers for this guild
                const servers = await bot.serverManagementService.getServers(interaction.guild.id);
                
                if (servers.length === 0) {
                    const embed = new EmbedBuilder()
                        .setTitle('❌ No Servers Configured')
                        .setDescription('No CS2 servers are configured for this guild. Use `/addserver` to add one!')
                        .setColor(0xff0000);
                    
                    return await interaction.editReply({ embeds: [embed] });
                }
                
                // Get status for all servers
                const embeds = [];
                for (const server of servers) {
                    try {
                        const serverData = await bot.cs2Monitor.getServerInfo(server);
                        const embed = bot.cs2Monitor.createServerStatusEmbed(server, serverData);
                        embeds.push(embed);
                    } catch (error) {
                        logger.error(`Error getting status for server ${server.server_name}:`, error);
                    }
                }
                
                if (embeds.length === 0) {
                    const embed = new EmbedBuilder()
                        .setTitle('❌ Error')
                        .setDescription('Failed to get status for any servers.')
                        .setColor(0xff0000);
                    
                    return await interaction.editReply({ embeds: [embed] });
                }
                
                // Discord has a limit of 10 embeds per message
                const chunks = [];
                for (let i = 0; i < embeds.length; i += 10) {
                    chunks.push(embeds.slice(i, i + 10));
                }
                
                for (let i = 0; i < chunks.length; i++) {
                    if (i === 0) {
                        await interaction.editReply({ embeds: chunks[i] });
                    } else {
                        await interaction.followUp({ embeds: chunks[i] });
                    }
                }
            }
            
        } catch (error) {
            logger.error('Error executing serverstatus command:', error);
            await interaction.editReply({ content: '❌ An error occurred while checking server status.' });
        }
    },
};

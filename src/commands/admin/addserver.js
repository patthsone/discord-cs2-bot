const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const logger = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addserver')
        .setDescription('Add a CS2 server to monitoring')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Name for the server')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('ip')
                .setDescription('Server IP address')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('port')
                .setDescription('Server port (default: 27015)')
                .setRequired(false)
                .setMinValue(1)
                .setMaxValue(65535)
        )
        .addStringOption(option =>
            option.setName('password')
                .setDescription('Server password (optional)')
                .setRequired(false)
        )
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Channel for monitoring updates')
                .setRequired(false)
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

            const serverName = interaction.options.getString('name');
            const serverIp = interaction.options.getString('ip');
            const serverPort = interaction.options.getInteger('port') || 27015;
            const serverPassword = interaction.options.getString('password');
            const monitoringChannel = interaction.options.getChannel('channel') || interaction.channel;

            // Validate IP format (basic validation)
            const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
            if (!ipRegex.test(serverIp)) {
                const embed = new EmbedBuilder()
                    .setTitle('❌ Invalid IP Address')
                    .setDescription('Please provide a valid IPv4 address.')
                    .setColor(0xff0000);
                
                return await interaction.reply({ embeds: [embed], ephemeral: true });
            }

            // Add server to database
            const serverId = await bot.serverManagementService.addServer(
                interaction.guild.id,
                serverName,
                serverIp,
                serverPort,
                serverPassword,
                monitoringChannel.id
            );

            const server = await bot.serverManagementService.getServer(serverId);
            const embed = bot.serverManagementService.createServerAddedEmbed(server);

            await interaction.reply({ embeds: [embed] });
            
        } catch (error) {
            logger.error('Error executing addserver command:', error);
            
            const embed = new EmbedBuilder()
                .setTitle('❌ Error')
                .setDescription('An error occurred while adding the server. Please try again.')
                .setColor(0xff0000);
            
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
};

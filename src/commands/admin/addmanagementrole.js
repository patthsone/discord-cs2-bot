const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const logger = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addmanagementrole')
        .setDescription('Add a role that can manage CS2 servers')
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('Role to add management permissions to')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    async execute(interaction, bot) {
        try {
            const role = interaction.options.getRole('role');
            
            await bot.serverManagementService.addManagementRole(interaction.guild.id, role.id);
            
            const embed = new EmbedBuilder()
                .setTitle('✅ Management Role Added')
                .setDescription(`Role ${role} can now manage CS2 servers.`)
                .setColor(0x00ff00)
                .setTimestamp();
            
            await interaction.reply({ embeds: [embed] });
            
        } catch (error) {
            logger.error('Error executing addmanagementrole command:', error);
            
            const embed = new EmbedBuilder()
                .setTitle('❌ Error')
                .setDescription('An error occurred while adding the management role. Please try again.')
                .setColor(0xff0000);
            
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
};

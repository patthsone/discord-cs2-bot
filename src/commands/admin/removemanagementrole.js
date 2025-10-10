const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const logger = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removemanagementrole')
        .setDescription('Remove a role from CS2 server management permissions')
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('Role to remove management permissions from')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    async execute(interaction, bot) {
        try {
            const role = interaction.options.getRole('role');
            
            const removed = await bot.serverManagementService.removeManagementRole(interaction.guild.id, role.id);
            
            if (removed) {
                const embed = new EmbedBuilder()
                    .setTitle('✅ Management Role Removed')
                    .setDescription(`Role ${role} can no longer manage CS2 servers.`)
                    .setColor(0x00ff00)
                    .setTimestamp();
                
                await interaction.reply({ embeds: [embed] });
            } else {
                const embed = new EmbedBuilder()
                    .setTitle('❌ Role Not Found')
                    .setDescription(`Role ${role} was not in the management roles list.`)
                    .setColor(0xff9900)
                    .setTimestamp();
                
                await interaction.reply({ embeds: [embed] });
            }
            
        } catch (error) {
            logger.error('Error executing removemanagementrole command:', error);
            
            const embed = new EmbedBuilder()
                .setTitle('❌ Error')
                .setDescription('An error occurred while removing the management role. Please try again.')
                .setColor(0xff0000);
            
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
};

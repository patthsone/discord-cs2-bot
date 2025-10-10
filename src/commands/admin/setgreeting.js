const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const logger = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setgreeting')
        .setDescription('Set a custom greeting message for new members')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The greeting message (use {user} for user mention)')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    
    async execute(interaction, bot) {
        try {
            const message = interaction.options.getString('message');
            
            await bot.greetingSystem.setCustomGreetingMessage(interaction.guild.id, message);
            
            const embed = new EmbedBuilder()
                .setTitle('✅ Greeting Message Set')
                .setDescription(`Custom greeting message has been set:\n\n${message}`)
                .setColor(0x00ff00)
                .setTimestamp();
            
            await interaction.reply({ embeds: [embed] });
            
        } catch (error) {
            logger.error('Error executing setgreeting command:', error);
            await interaction.reply({ content: '❌ An error occurred while setting the greeting message.', ephemeral: true });
        }
    },
};

require('dotenv').config();
const { Client, GatewayIntentBits, Collection, EmbedBuilder, REST, Routes } = require('discord.js');
const logger = require('./utils/logger');
const Database = require('./database/database');
const CS2Monitor = require('./services/cs2Monitor');
const LevelingSystem = require('./services/levelingSystem');
const GreetingSystem = require('./services/greetingSystem');
const ServerManagementService = require('./services/serverManagementService');
const Internationalization = require('./utils/i18n');
const CommandHandler = require('./handlers/commandHandler');
const EventHandler = require('./handlers/eventHandler');

class DiscordBot {
    constructor() {
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildVoiceStates
            ]
        });

        this.commands = new Collection();
        this.database = new Database();
        this.cs2Monitor = new CS2Monitor(this);
        this.levelingSystem = new LevelingSystem(this);
        this.greetingSystem = new GreetingSystem(this);
        this.serverManagementService = new ServerManagementService(this);
        this.i18n = new Internationalization();
        
        this.initializeBot();
    }

    async initializeBot() {
        try {
            // Initialize database
            await this.database.initialize();
            logger.info('Database initialized successfully');

            // Load commands and events
            await CommandHandler.loadCommands(this);
            await EventHandler.loadEvents(this);
            logger.info('Commands and events loaded successfully');

            // Register slash commands
            await this.registerSlashCommands();
            logger.info('Slash commands registered successfully');

            // Start CS2 monitoring
            this.cs2Monitor.startMonitoring();
            logger.info('CS2 monitoring started');

            // Login to Discord
            await this.client.login(process.env.DISCORD_TOKEN);
            
        } catch (error) {
            logger.error('Failed to initialize bot:', error);
            process.exit(1);
        }
    }

    async registerSlashCommands() {
        const rest = new REST().setToken(process.env.DISCORD_TOKEN);
        const commands = [];

        // Collect all command data
        for (const command of this.commands.values()) {
            commands.push(command.data.toJSON());
        }

        try {
            logger.info(`Started refreshing ${commands.length} application (/) commands.`);

            // Register commands globally
            const data = await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: commands },
            );

            logger.info(`Successfully reloaded ${data.length} application (/) commands.`);
        } catch (error) {
            logger.error('Error registering slash commands:', error);
            throw error;
        }
    }

    async shutdown() {
        logger.info('Shutting down bot...');
        this.cs2Monitor.stopMonitoring();
        await this.database.close();
        this.client.destroy();
    }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
    if (global.bot) {
        await global.bot.shutdown();
    }
    process.exit(0);
});

process.on('SIGTERM', async () => {
    if (global.bot) {
        await global.bot.shutdown();
    }
    process.exit(0);
});

// Start the bot
global.bot = new DiscordBot();

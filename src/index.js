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
const StatusServer = require('./services/statusServer');

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
        
        // Статус-сервер только для публичной статистики
        if (process.env.STATUS_ENABLED === 'true') {
            this.statusServer = new StatusServer();
        }
        
        this.stats = {
            servers: 0,
            users: 0,
            cs2Servers: 0,
            commandsUsed: 0,
            features: {
                leveling: 0,
                greetings: 0,
                cs2Monitoring: 0
            }
        };
        
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

            // Start status server only if enabled
            if (this.statusServer) {
                this.statusServer.start();
                logger.info('Status server started');
            } else {
                logger.info('Status server disabled (STATUS_ENABLED=false)');
            }

            // Login to Discord
            await this.client.login(process.env.DISCORD_TOKEN);
            
            // Initialize stats after login
            this.initializeStats();
            
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

    async initializeStats() {
        try {
            // Подсчитываем количество серверов
            this.stats.servers = this.client.guilds.cache.size;
            
            // Подсчитываем общее количество пользователей
            this.stats.users = this.client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
            
            // Получаем количество CS2 серверов из базы данных
            const cs2Servers = await this.database.getAllServers();
            this.stats.cs2Servers = cs2Servers.length;
            
            // Обновляем статистику в статус-сервере
            await this.updateStatusStats();
            
            logger.info('Stats initialized successfully');
        } catch (error) {
            logger.error('Error initializing stats:', error);
        }
    }

    async updateStatusStats() {
        // Обновляем статистику только если статус-сервер включен
        if (!this.statusServer) {
            return;
        }
        
        try {
            const response = await fetch(`http://localhost:${process.env.STATUS_PORT || 3000}/api/update-stats`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.stats)
            });
            
            if (!response.ok) {
                logger.warn('Failed to update status stats');
            }
        } catch (error) {
            logger.warn('Error updating status stats:', error);
        }
    }

    incrementCommandUsage() {
        this.stats.commandsUsed++;
        this.updateStatusStats();
    }

    incrementFeatureUsage(feature) {
        if (this.stats.features[feature] !== undefined) {
            this.stats.features[feature]++;
            this.updateStatusStats();
        }
    }

    async updateServerStats() {
        this.stats.servers = this.client.guilds.cache.size;
        this.stats.users = this.client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
        
        const cs2Servers = await this.database.getAllServers();
        this.stats.cs2Servers = cs2Servers.length;
        
        await this.updateStatusStats();
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

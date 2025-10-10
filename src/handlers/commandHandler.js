const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

class CommandHandler {
    static async loadCommands(bot) {
        const commandsPath = path.join(__dirname, '../commands');
        
        if (!fs.existsSync(commandsPath)) {
            logger.warn('Commands directory not found, creating it...');
            fs.mkdirSync(commandsPath, { recursive: true });
            return;
        }
        
        const commandFolders = fs.readdirSync(commandsPath);
        
        for (const folder of commandFolders) {
            const folderPath = path.join(commandsPath, folder);
            
            if (!fs.statSync(folderPath).isDirectory()) continue;
            
            const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
            
            for (const file of commandFiles) {
                const filePath = path.join(folderPath, file);
                const command = require(filePath);
                
                if ('data' in command && 'execute' in command) {
                    bot.commands.set(command.data.name, command);
                    logger.info(`Loaded command: ${command.data.name}`);
                } else {
                    logger.warn(`Command ${file} is missing required "data" or "execute" property`);
                }
            }
        }
    }
}

module.exports = CommandHandler;

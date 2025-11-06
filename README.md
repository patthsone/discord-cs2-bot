# Discord CS2 Bot - Universal Gaming Community Manager

A high-performance Discord bot for managing gaming communities with CS2 server monitoring, player leveling system, and automated greetings. Built with MySQL, Redis caching, and modern Node.js technologies.

## 🌍 Documentation

This documentation is available in multiple languages:
- **English**: [README.md](README.md)
- **Русский**: [README.ru.md](README.ru.md)
- **Українська**: [README.uk.md](README.uk.md)

## 🚀 Features

### Core Functionality
- **Multi-Guild Support**: Manage multiple Discord servers from a single bot instance
- **CS2 Server Monitoring**: Real-time server status monitoring with gamedig integration
- **Player Leveling System**: XP-based leveling with voice and text activity tracking
- **Automated Greetings**: Welcome new members with customizable messages and auto-roles
- **Internationalization**: Multi-language support (English, Russian, Ukrainian)

### Performance & Scalability
- **MySQL Database**: Reliable data storage with connection pooling
- **Redis Caching**: High-performance caching for server status and user data
- **Prisma ORM**: Type-safe database operations
- **PM2 Process Management**: Production-ready process management
- **Batch Operations**: Parallel server monitoring and efficient database updates

### Monitoring & Analytics
- **Server History**: Track server uptime and player statistics
- **Performance Logging**: Winston/Pino logging with MySQL log storage
- **Health Monitoring**: Built-in health checks and monitoring
- **Backup System**: Automatic database backups and restore functionality

## 📋 Requirements

- **Node.js**: 16.0.0 or higher (LTS recommended)
- **MySQL**: 8.0 or higher
- **Redis**: 6.0 or higher
- **Discord Bot Token**: From Discord Developer Portal
- **PM2**: For production deployment (optional)

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/discord-cs2-bot.git
cd discord-cs2-bot
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Setup

#### Option A: Automated Setup (Recommended)
```bash
chmod +x scripts/setup-mysql-redis.sh
./scripts/setup-mysql-redis.sh
```

#### Option B: Manual Setup
1. **Install MySQL and Redis**:
   ```bash
   # Ubuntu/Debian
   sudo apt-get install mysql-server redis-server
   
   # CentOS/RHEL
   sudo yum install mysql-server redis
   
   # macOS
   brew install mysql redis
   ```

2. **Create Database**:
   ```sql
   CREATE DATABASE discord_cs2_bot CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'discord_bot'@'localhost' IDENTIFIED BY 'your_password';
   GRANT ALL PRIVILEGES ON discord_cs2_bot.* TO 'discord_bot'@'localhost';
   FLUSH PRIVILEGES;
   ```

3. **Run Migrations**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

### 4. Environment Configuration
Copy the example environment file and configure it:
```bash
cp env.example .env
```

Update `.env` with your configuration:
```env
# Discord Bot Configuration
DISCORD_TOKEN=your_discord_bot_token_here
CLIENT_ID=your_bot_client_id_here

# Database Configuration
DATABASE_URL="mysql://username:password@host:port/database_name"
DB_HOST=localhost
DB_PORT=3306
DB_USER=discord_bot
DB_PASSWORD=your_password
DB_NAME=discord_cs2_bot

# Redis Configuration
REDIS_URL="redis://localhost:6379"
REDIS_HOST=localhost
REDIS_PORT=6379

# Bot Settings
LOG_LEVEL=info
CONNECTION_POOL_SIZE=10
CACHE_TTL_SECONDS=300
```

### 5. Start the Bot

#### Development Mode
```bash
npm run dev
```

#### Production Mode
```bash
# Using PM2
pm2 start ecosystem.config.js --env production

# Or directly
npm start
```

## 📊 Database Schema

The bot uses a comprehensive MySQL schema with the following main tables:

- **guilds**: Server (guild) settings and configuration
- **monitored_servers**: CS2 servers to monitor
- **server_history**: Historical server data for analytics
- **user_levels**: Player XP and leveling data
- **level_rewards**: Role rewards for specific levels
- **greeting_settings**: Welcome message configuration
- **user_languages**: User language preferences
- **log_entries**: Critical application logs

## 🎮 Commands

### Admin Commands
- `/addserver` - Add a CS2 server to monitor
- `/removeserver` - Remove a monitored server
- `/listservers` - List all monitored servers
- `/setgreeting` - Configure welcome messages
- `/setmonitoringchannel` - Set monitoring channel
- `/language` - Set server language

### CS2 Commands
- `/serverstatus` - Check server status
- `/serverhistory` - View server history

### Leveling Commands
- `/level` - Check your level and XP
- `/leaderboard` - View server leaderboard

## 🔧 Configuration

### Server Monitoring
Configure CS2 servers through Discord commands or directly in the database:
```sql
INSERT INTO monitored_servers (guild_id, server_ip, server_port, custom_name, channel_id, is_active) 
VALUES ('guild_id', 'server_ip', port, 'Server Name', 'channel_id', true);
```

### Leveling System
Configure XP rates and level rewards:
```env
XP_PER_MESSAGE=15
XP_PER_VOICE_MINUTE=5
LEVEL_MULTIPLIER=1.2
MAX_LEVEL=100
```

### Greeting System
Set up automated welcome messages:
```sql
INSERT INTO greeting_settings (guild_id, welcome_channel_id, welcome_message, auto_role_id, is_active) 
VALUES ('guild_id', 'channel_id', 'Welcome {user}!', 'role_id', true);
```

## 📈 Performance Optimization

### Database Optimization
- Connection pooling with configurable pool size
- Indexed queries for fast lookups
- Batch operations for bulk updates
- Automatic cleanup of old data

### Caching Strategy
- Redis caching for frequently accessed data
- Configurable TTL for different data types
- Cache invalidation on data updates
- Fallback to database when cache is unavailable

### Monitoring Performance
- Performance logging for slow operations
- Memory usage monitoring
- Database query performance tracking
- Cache hit/miss ratio monitoring

## 🔄 Backup & Restore

### Automatic Backups
The bot includes an automatic backup system:
- Daily backups at 2 AM UTC
- Configurable retention period
- Guild-specific backups
- Backup verification

### Manual Backup
```bash
# Full database backup
npm run backup

# Guild-specific backup
npm run backup:guild <guild_id>

# List available backups
npm run backup:list
```

### Restore from Backup
```bash
# Restore full backup
npm run restore <backup_file>

# Restore guild-specific backup
npm run restore:guild <backup_file>
```

## 🚀 Production Deployment

### PM2 Configuration
The bot includes a comprehensive PM2 configuration:
- Automatic restarts on crashes
- Memory limit monitoring
- Log rotation
- Health checks
- Graceful shutdowns

### Docker Deployment (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables
Ensure all required environment variables are set:
- Database connection details
- Redis connection details
- Discord bot credentials
- Logging configuration
- Performance settings

## 📝 Logging

The bot uses a comprehensive logging system:
- **Winston**: General application logging
- **Pino**: High-performance logging
- **MySQL Storage**: Critical logs stored in database
- **File Rotation**: Automatic log file rotation
- **Structured Logging**: JSON format for easy parsing

### Log Levels
- `error`: Critical errors requiring attention
- `warn`: Warnings and non-critical issues
- `info`: General information and events
- `debug`: Detailed debugging information

## 🔒 Security

### Database Security
- Parameterized queries to prevent SQL injection
- Connection pooling with limits
- Regular security updates
- Backup encryption (optional)

### Bot Security
- Rate limiting for commands
- Permission checks for admin commands
- Input validation and sanitization
- Secure environment variable handling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Development Setup
```bash
# Install development dependencies
npm install

# Run in development mode
npm run dev

# Run tests
npm test

# Run linting
npm run lint
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Common Issues

**Database Connection Failed**
- Check MySQL service is running
- Verify database credentials
- Ensure database exists

**Redis Connection Failed**
- Check Redis service is running
- Verify Redis configuration
- Check network connectivity

**Bot Not Responding**
- Check Discord bot token
- Verify bot permissions
- Check log files for errors

### Getting Help
- Check the [Issues](https://github.com/your-username/discord-cs2-bot/issues) page
- Join our Discord server
- Read the documentation

## 🎯 Roadmap

- [ ] Web dashboard for bot management
- [ ] Advanced analytics and reporting
- [ ] Plugin system for custom features
- [ ] Multi-game support (beyond CS2)
- [ ] API endpoints for external integrations
- [ ] Mobile app for bot management

## 🙏 Acknowledgments

- Discord.js community for the excellent library
- Prisma team for the amazing ORM
- Redis team for the high-performance caching
- MySQL team for the reliable database
- All contributors and users

---

**Made with ❤️ for the gaming community**
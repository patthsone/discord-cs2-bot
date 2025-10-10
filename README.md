# Discord CS2 Bot / Дискорд CS2 Бот / Дискорд CS2 Бот

A comprehensive Discord bot featuring multi-language support (English, Russian, Ukrainian), CS2 server monitoring, player greeting system, and leveling system.

Комплексный Discord бот с поддержкой нескольких языков (английский, русский, украинский), мониторингом CS2 серверов, системой приветствия игроков и системой уровней.

Комплексний Discord бот з підтримкою кількох мов (англійська, російська, українська), моніторингом CS2 серверів, системою привітання гравців та системою рівнів.

## 🌍 Multi-Language Support / Поддержка нескольких языков / Підтримка кількох мов

This bot supports three languages:
- 🇺🇸 **English** (en) - Default
- 🇷🇺 **Русский** (ru) - Russian
- 🇺🇦 **Українська** (uk) - Ukrainian

Users can change their language using the `/language` command.

Этот бот поддерживает три языка:
- 🇺🇸 **English** (en) - По умолчанию
- 🇷🇺 **Русский** (ru) - Русский
- 🇺🇦 **Українська** (uk) - Украинский

Пользователи могут изменить язык с помощью команды `/language`.

Цей бот підтримує три мови:
- 🇺🇸 **English** (en) - За замовчуванням
- 🇷🇺 **Русский** (ru) - Російська
- 🇺🇦 **Українська** (uk) - Українська

Користувачі можуть змінити мову за допомогою команди `/language`.

### 🌐 Status Page / Статус-страница / Статус-сторінка

**⚠️ Important / Важно / Важливо:** The status page is **optional** and designed for **public bot statistics**. For private deployments, set `STATUS_ENABLED=false` in your `.env` file.

**⚠️ Важно:** Статус-страница **опциональна** и предназначена для **публичной статистики бота**. Для приватных развертываний установите `STATUS_ENABLED=false` в файле `.env`.

**⚠️ Важливо:** Статус-сторінка **опціональна** та призначена для **публічної статистики бота**. Для приватних розгортань встановіть `STATUS_ENABLED=false` у файлі `.env`.

The bot includes an optional status page that shows real-time statistics about bot usage, server count, and feature utilization. This is useful for public bots to show their popularity and usage statistics.

Бот включает опциональную статус-страницу, которая показывает статистику использования бота в реальном времени, количество серверов и использование функций. Это полезно для публичных ботов, чтобы показать их популярность и статистику использования.

Бот включає опціональну статус-сторінку, яка показує статистику використання бота в реальному часі, кількість серверів та використання функцій. Це корисно для публічних ботів, щоб показати їхню популярність та статистику використання.

**Features / Возможности / Можливості:**
- 📊 **Real-time statistics** - Live server count, user count, and command usage
- 🎮 **CS2 server monitoring** - Active CS2 servers being monitored
- 📈 **Feature usage tracking** - Leveling system, greetings, and monitoring stats
- 🟢 **Health monitoring** - Bot uptime and status indicators
- 📱 **Responsive design** - Works on desktop and mobile devices

- **Статистика в реальном времени** - Живое количество серверов, пользователей и использование команд
- **Мониторинг CS2 серверов** - Активные CS2 серверы под мониторингом
- **Отслеживание использования функций** - Статистика системы уровней, приветствий и мониторинга
- **Мониторинг здоровья** - Время работы бота и индикаторы статуса
- **Адаптивный дизайн** - Работает на настольных и мобильных устройствах

- **Статистика в реальному часі** - Жива кількість серверів, користувачів та використання команд
- **Моніторинг CS2 серверів** - Активні CS2 сервери під моніторингом
- **Відстеження використання функцій** - Статистика системи рівнів, привітань та моніторингу
- **Моніторинг здоров'я** - Час роботи бота та індикатори статусу
- **Адаптивний дизайн** - Працює на настільних та мобільних пристроях

**Configuration / Конфигурация / Конфігурація:**

```env
# Enable/disable status page (set to false for private deployments)
STATUS_ENABLED=false
STATUS_PORT=3000
```

**Access / Доступ / Доступ:**
- **Local development:** `http://localhost:3000` (when STATUS_ENABLED=true)
- **Production:** `https://starladder-project.ru/` (Custom Domain - only for public bots)

- **Локальная разработка:** `http://localhost:3000` (когда STATUS_ENABLED=true)
- **Продакшн:** `https://starladder-project.ru/` (Кастомный домен - только для публичных ботов)

- **Локальна розробка:** `http://localhost:3000` (коли STATUS_ENABLED=true)
- **Продакшн:** `https://starladder-project.ru/` (Кастомний домен - тільки для публічних ботів)

## ✨ Features / Возможности / Можливості

### 🎮 CS2 Server Monitoring / Мониторинг CS2 серверов / Моніторинг CS2 серверів
- **Multi-server support** - Monitor unlimited CS2 servers simultaneously
- **Per-server monitoring channels** - Each server can have its own monitoring channel
- **Real-time updates** - Server status updates every 10 minutes
- **Role-based management** - Only authorized roles can add/remove servers
- Server online/offline status, current map, player count, server name and version, ping information
- **Server history** - Track server status over time

- **Поддержка нескольких серверов** - Мониторинг неограниченного количества CS2 серверов одновременно
- **Отдельные каналы мониторинга** - Каждый сервер может иметь свой канал мониторинга
- **Обновления в реальном времени** - Обновления статуса сервера каждые 10 минут
- **Управление на основе ролей** - Только авторизованные роли могут добавлять/удалять серверы
- Статус онлайн/оффлайн сервера, текущая карта, количество игроков, название и версия сервера, информация о пинге
- **История сервера** - Отслеживание статуса сервера во времени

- **Підтримка кількох серверів** - Моніторинг необмеженої кількості CS2 серверів одночасно
- **Окремі канали моніторингу** - Кожен сервер може мати свій канал моніторингу
- **Оновлення в реальному часі** - Оновлення статусу сервера кожні 10 хвилин
- **Управління на основі ролей** - Тільки авторизовані ролі можуть додавати/видаляти сервери
- Статус онлайн/офлайн сервера, поточна карта, кількість гравців, назва та версія сервера, інформація про пінг
- **Історія сервера** - Відстеження статусу сервера в часі

### 👋 Player Greeting System / Система приветствия игроков / Система привітання гравців
- Welcome new members with custom messages in their preferred language
- Automatic role assignment based on configuration
- Dedicated greeting channel support
- Customizable greeting messages with placeholders

- Приветствие новых участников с пользовательскими сообщениями на их предпочитаемом языке
- Автоматическое назначение ролей на основе конфигурации
- Поддержка выделенного канала приветствия
- Настраиваемые приветственные сообщения с заполнителями

- Привітання нових учасників з користувацькими повідомленнями на їхній бажаній мові
- Автоматичне призначення ролей на основі конфігурації
- Підтримка виділеного каналу привітання
- Налаштовувані привітальні повідомлення з заповнювачами

### 📈 Leveling System / Система уровней / Система рівнів
- XP tracking for messages and voice activity
- Level-based role rewards
- Leaderboard functionality
- Customizable XP rates and rewards
- Progress tracking with visual progress bars
- **Multi-language support** for all leveling messages

- Отслеживание опыта за сообщения и голосовую активность
- Награды ролями на основе уровня
- Функциональность таблицы лидеров
- Настраиваемые ставки опыта и награды
- Отслеживание прогресса с визуальными полосами прогресса
- **Поддержка нескольких языков** для всех сообщений системы уровней

- Відстеження досвіду за повідомлення та голосову активність
- Нагороди ролями на основі рівня
- Функціональність таблиці лідерів
- Налаштовувані ставки досвіду та нагороди
- Відстеження прогресу з візуальними смугами прогресу
- **Підтримка кількох мов** для всіх повідомлень системи рівнів

### 🌍 Internationalization / Интернационализация / Інтернаціоналізація
- Complete translation system for all bot features
- User-specific language preferences
- Easy language switching via commands
- Fallback to English for missing translations

- Полная система переводов для всех функций бота
- Пользовательские языковые предпочтения
- Легкое переключение языка через команды
- Возврат к английскому языку для отсутствующих переводов

- Повна система перекладів для всіх функцій бота
- Користувацькі мовні уподобання
- Легке перемикання мови через команди
- Повернення до англійської мови для відсутніх перекладів

## 🚀 Quick Start / Быстрый старт / Швидкий старт

### Prerequisites / Предварительные требования / Попередні вимоги
- Node.js 16.0.0 or higher
- A Discord application/bot token
- A Discord server where you have administrator permissions

- Node.js 16.0.0 или выше
- Токен Discord приложения/бота
- Discord сервер, где у вас есть права администратора

- Node.js 16.0.0 або вище
- Токен Discord додатку/бота
- Discord сервер, де у вас є права адміністратора

### Installation / Установка / Встановлення

1. **Clone the repository / Клонируйте репозиторий / Клонуйте репозиторій**
   ```bash
   git clone https://github.com/patthsone/discord-cs2-bot.git
   cd discord-cs2-bot
   ```

2. **Install dependencies / Установите зависимости / Встановіть залежності**
   ```bash
   npm install
   ```

3. **Configure environment variables / Настройте переменные окружения / Налаштуйте змінні середовища**
   - Copy `env.example` to `.env`
   - Fill in your Discord bot token and other settings
   
   - Скопируйте `env.example` в `.env`
   - Заполните токен вашего Discord бота и другие настройки
   
   - Скопіюйте `env.example` в `.env`
   - Заповніть токен вашого Discord бота та інші налаштування

4. **Set up Discord Bot / Настройте Discord бота / Налаштуйте Discord бота**
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Create a new application and bot
   - Copy the bot token to your `.env` file
   - Enable necessary bot permissions
   
   - Перейдите в [Discord Developer Portal](https://discord.com/developers/applications)
   - Создайте новое приложение и бота
   - Скопируйте токен бота в ваш файл `.env`
   - Включите необходимые разрешения бота
   
   - Перейдіть до [Discord Developer Portal](https://discord.com/developers/applications)
   - Створіть новий додаток та бота
   - Скопіюйте токен бота у ваш файл `.env`
   - Увімкніть необхідні дозволи бота

5. **Run the bot / Запустите бота / Запустіть бота**
   ```bash
   npm start
   ```

## 🖥️ VDS Deployment / Развертывание на VDS / Розгортання на VDS

### Prerequisites for VDS / Предварительные требования для VDS / Попередні вимоги для VDS

- Ubuntu 20.04+ or CentOS 8+ server
- Root or sudo access
- At least 1GB RAM and 10GB storage
- Public IP address
- Domain name (optional but recommended)

- Сервер Ubuntu 20.04+ или CentOS 8+
- Доступ root или sudo
- Минимум 1GB RAM и 10GB хранилища
- Публичный IP адрес
- Доменное имя (опционально, но рекомендуется)

- Сервер Ubuntu 20.04+ або CentOS 8+
- Доступ root або sudo
- Мінімум 1GB RAM та 10GB сховища
- Публічна IP адреса
- Доменне ім'я (опціонально, але рекомендовано)

### Step 1: Server Setup / Настройка сервера / Налаштування сервера

#### Update system packages / Обновление системных пакетов / Оновлення системних пакетів
```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS/RHEL
sudo yum update -y
```

#### Install Node.js / Установка Node.js / Встановлення Node.js
```bash
# Using NodeSource repository (recommended)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Or using snap
sudo snap install node --classic

# Verify installation
node --version
npm --version
```

#### Install additional tools / Установка дополнительных инструментов / Встановлення додаткових інструментів
```bash
# Install Git, curl, and other essentials
sudo apt install -y git curl wget unzip

# Install PM2 for process management
sudo npm install -g pm2

# Install UFW firewall (optional)
sudo apt install -y ufw
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 22
```

### Step 2: Bot Deployment / Развертывание бота / Розгортання бота

#### Clone and setup / Клонирование и настройка / Клонування та налаштування
```bash
# Create application directory
sudo mkdir -p /opt/discord-bot
sudo chown $USER:$USER /opt/discord-bot
cd /opt/discord-bot

# Clone repository
git clone https://github.com/patthsone/discord-cs2-bot.git .

# Install dependencies
npm install --production
```

#### Configure environment / Настройка окружения / Налаштування середовища
```bash
# Copy environment template
cp env.example .env

# Edit environment file
nano .env
```

**Required environment variables / Обязательные переменные окружения / Обов'язкові змінні середовища:**
```env
# Discord Configuration
DISCORD_TOKEN=your_discord_bot_token_here
CLIENT_ID=your_bot_client_id_here
GUILD_ID=your_server_guild_id_here

# Server Configuration
NODE_ENV=production
LOG_LEVEL=info
UPDATE_INTERVAL_MINUTES=10

# Optional: Database and logging paths
DATABASE_PATH=/opt/discord-bot/data/bot.db
LOG_PATH=/opt/discord-bot/logs

# Optional: Status page (set to false for private deployments)
STATUS_ENABLED=false
STATUS_PORT=3000
```

### Step 3: Process Management / Управление процессами / Управління процесами

#### Create PM2 ecosystem file / Создание файла экосистемы PM2 / Створення файлу екосистеми PM2
```bash
# Create ecosystem file
nano ecosystem.config.js
```

**ecosystem.config.js content / Содержимое ecosystem.config.js / Вміст ecosystem.config.js:**
```javascript
module.exports = {
  apps: [{
    name: 'discord-cs2-bot',
    script: 'start.js',
    cwd: '/opt/discord-bot',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    },
    error_file: '/opt/discord-bot/logs/err.log',
    out_file: '/opt/discord-bot/logs/out.log',
    log_file: '/opt/discord-bot/logs/combined.log',
    time: true
  }]
};
```

#### Start bot with PM2 / Запуск бота с PM2 / Запуск бота з PM2
```bash
# Start the bot
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME
```

### Step 3.5: Ensuring Bot Persistence / Обеспечение постоянной работы бота / Забезпечення постійної роботи бота

#### Auto-restart Configuration / Конфигурация автоматического перезапуска / Конфігурація автоматичного перезапуску

**Enhanced ecosystem.config.js / Улучшенный ecosystem.config.js / Покращений ecosystem.config.js:**
```javascript
module.exports = {
  apps: [{
    name: 'discord-cs2-bot',
    script: 'start.js',
    cwd: '/opt/discord-bot',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000,
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000,
    env: {
      NODE_ENV: 'production'
    },
    error_file: '/opt/discord-bot/logs/err.log',
    out_file: '/opt/discord-bot/logs/out.log',
    log_file: '/opt/discord-bot/logs/combined.log',
    time: true,
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
```

#### Systemd Service (Alternative to PM2) / Системный сервис (альтернатива PM2) / Системний сервіс (альтернатива PM2)

**Create systemd service / Создание системного сервиса / Створення системного сервісу:**
```bash
# Create systemd service file
sudo nano /etc/systemd/system/discord-cs2-bot.service
```

**Service file content / Содержимое файла сервиса / Вміст файлу сервісу:**
```ini
[Unit]
Description=Discord CS2 Bot
After=network.target

[Service]
Type=simple
User=discord-bot
WorkingDirectory=/opt/discord-bot
ExecStart=/usr/bin/node start.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=discord-cs2-bot
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

**Enable and start service / Включение и запуск сервиса / Увімкнення та запуск сервісу:**
```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable service to start on boot
sudo systemctl enable discord-cs2-bot

# Start service
sudo systemctl start discord-cs2-bot

# Check status
sudo systemctl status discord-cs2-bot

# View logs
sudo journalctl -u discord-cs2-bot -f
```

#### Health Check Script / Скрипт проверки здоровья / Скрипт перевірки здоров'я

**Create health check script / Создание скрипта проверки / Створення скрипта перевірки:**
```bash
# Create health check script
nano /opt/discord-bot/scripts/health-check.sh
```

**Health check script content / Содержимое скрипта проверки / Вміст скрипта перевірки:**
```bash
#!/bin/bash

# Discord CS2 Bot Health Check Script
BOT_NAME="discord-cs2-bot"
LOG_FILE="/opt/discord-bot/logs/health-check.log"
MAX_RESTART_ATTEMPTS=5
RESTART_COUNT_FILE="/opt/discord-bot/data/restart_count.txt"

# Function to log messages
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> $LOG_FILE
}

# Check if bot is running
if ! pm2 list | grep -q "$BOT_NAME.*online"; then
    log_message "WARNING: Bot is not running, attempting to restart..."
    
    # Read restart count
    if [ -f "$RESTART_COUNT_FILE" ]; then
        RESTART_COUNT=$(cat $RESTART_COUNT_FILE)
    else
        RESTART_COUNT=0
    fi
    
    # Check if we've exceeded max restart attempts
    if [ $RESTART_COUNT -ge $MAX_RESTART_ATTEMPTS ]; then
        log_message "ERROR: Maximum restart attempts ($MAX_RESTART_ATTEMPTS) exceeded. Manual intervention required."
        exit 1
    fi
    
    # Increment restart count
    RESTART_COUNT=$((RESTART_COUNT + 1))
    echo $RESTART_COUNT > $RESTART_COUNT_FILE
    
    # Attempt to restart bot
    pm2 restart $BOT_NAME
    
    # Wait a moment and check if restart was successful
    sleep 10
    if pm2 list | grep -q "$BOT_NAME.*online"; then
        log_message "SUCCESS: Bot restarted successfully (attempt $RESTART_COUNT)"
        # Reset restart count on successful restart
        echo 0 > $RESTART_COUNT_FILE
    else
        log_message "ERROR: Failed to restart bot (attempt $RESTART_COUNT)"
    fi
else
    log_message "INFO: Bot is running normally"
    # Reset restart count when bot is healthy
    echo 0 > $RESTART_COUNT_FILE
fi

# Check memory usage
MEMORY_USAGE=$(pm2 jlist | jq -r ".[] | select(.name==\"$BOT_NAME\") | .monit.memory")
if [ "$MEMORY_USAGE" != "null" ] && [ "$MEMORY_USAGE" -gt 800000000 ]; then
    log_message "WARNING: High memory usage detected: ${MEMORY_USAGE} bytes"
fi

# Check uptime
UPTIME=$(pm2 jlist | jq -r ".[] | select(.name==\"$BOT_NAME\") | .pm2_env.status")
if [ "$UPTIME" = "errored" ]; then
    log_message "ERROR: Bot status is errored, attempting restart..."
    pm2 restart $BOT_NAME
fi
```

```bash
# Make health check script executable
chmod +x /opt/discord-bot/scripts/health-check.sh

# Setup health check cron job (every 5 minutes)
crontab -e
# Add this line:
*/5 * * * * /opt/discord-bot/scripts/health-check.sh
```

#### Network Resilience / Сетевая устойчивость / Мережева стійкість

**Create network monitoring script / Создание скрипта мониторинга сети / Створення скрипта моніторингу мережі:**
```bash
# Create network monitoring script
nano /opt/discord-bot/scripts/network-monitor.sh
```

**Network monitoring script content / Содержимое скрипта мониторинга сети / Вміст скрипта моніторингу мережі:**
```bash
#!/bin/bash

# Network connectivity monitoring for Discord CS2 Bot
LOG_FILE="/opt/discord-bot/logs/network-monitor.log"
BOT_NAME="discord-cs2-bot"

# Function to log messages
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> $LOG_FILE
}

# Check internet connectivity
if ! ping -c 1 8.8.8.8 > /dev/null 2>&1; then
    log_message "WARNING: No internet connectivity detected"
    exit 1
fi

# Check Discord API connectivity
if ! curl -s --max-time 10 https://discord.com/api/v10/gateway > /dev/null; then
    log_message "WARNING: Cannot reach Discord API"
    # Restart bot if Discord API is unreachable
    pm2 restart $BOT_NAME
    exit 1
fi

# Check if bot process is responding
if ! pm2 list | grep -q "$BOT_NAME.*online"; then
    log_message "WARNING: Bot process is not online"
    pm2 restart $BOT_NAME
fi

log_message "INFO: Network connectivity check passed"
```

```bash
# Make network monitoring script executable
chmod +x /opt/discord-bot/scripts/network-monitor.sh

# Setup network monitoring cron job (every 2 minutes)
crontab -e
# Add this line:
*/2 * * * * /opt/discord-bot/scripts/network-monitor.sh
```

#### Database Backup and Recovery / Резервное копирование и восстановление базы данных / Резервне копіювання та відновлення бази даних

**Enhanced backup script / Улучшенный скрипт резервного копирования / Покращений скрипт резервного копіювання:**
```bash
# Create enhanced backup script
nano /opt/discord-bot/scripts/enhanced-backup.sh
```

**Enhanced backup script content / Содержимое улучшенного скрипта резервного копирования / Вміст покращеного скрипта резервного копіювання:**
```bash
#!/bin/bash

# Enhanced backup script for Discord CS2 Bot
BACKUP_DIR="/opt/backups/discord-bot"
DATE=$(date +%Y%m%d_%H%M%S)
BOT_DIR="/opt/discord-bot"
LOG_FILE="/opt/discord-bot/logs/backup.log"

# Function to log messages
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> $LOG_FILE
}

log_message "Starting backup process..."

# Create backup directory
mkdir -p $BACKUP_DIR

# Stop bot temporarily for consistent backup
pm2 stop discord-cs2-bot
sleep 5

# Backup bot files
tar -czf $BACKUP_DIR/bot_files_$DATE.tar.gz -C /opt discord-bot

# Backup database with integrity check
if [ -f $BOT_DIR/data/bot.db ]; then
    # Create database backup
    cp $BOT_DIR/data/bot.db $BACKUP_DIR/bot_db_$DATE.db
    
    # Verify database integrity
    sqlite3 $BACKUP_DIR/bot_db_$DATE.db "PRAGMA integrity_check;" > /dev/null
    if [ $? -eq 0 ]; then
        log_message "Database backup verified successfully"
    else
        log_message "WARNING: Database backup integrity check failed"
    fi
fi

# Backup configuration files
cp $BOT_DIR/.env $BACKUP_DIR/env_$DATE.backup 2>/dev/null || true
cp $BOT_DIR/ecosystem.config.js $BACKUP_DIR/ecosystem_$DATE.backup 2>/dev/null || true

# Restart bot
pm2 start discord-cs2-bot

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "*.db" -mtime +7 -delete
find $BACKUP_DIR -name "*.backup" -mtime +7 -delete

log_message "Backup completed successfully: $DATE"

# Create backup verification script
cat > $BACKUP_DIR/verify_backup.sh << 'EOF'
#!/bin/bash
BACKUP_FILE=$1
if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file.tar.gz>"
    exit 1
fi

echo "Verifying backup: $BACKUP_FILE"
tar -tzf "$BACKUP_FILE" > /dev/null
if [ $? -eq 0 ]; then
    echo "Backup verification successful"
else
    echo "Backup verification failed"
    exit 1
fi
EOF

chmod +x $BACKUP_DIR/verify_backup.sh
```

```bash
# Make enhanced backup script executable
chmod +x /opt/discord-bot/scripts/enhanced-backup.sh

# Setup enhanced backup cron job (every 6 hours)
crontab -e
# Add this line:
0 */6 * * * /opt/discord-bot/scripts/enhanced-backup.sh
```

#### Recovery Script / Скрипт восстановления / Скрипт відновлення

**Create recovery script / Создание скрипта восстановления / Створення скрипта відновлення:**
```bash
# Create recovery script
nano /opt/discord-bot/scripts/recovery.sh
```

**Recovery script content / Содержимое скрипта восстановления / Вміст скрипта відновлення:**
```bash
#!/bin/bash

# Recovery script for Discord CS2 Bot
BACKUP_DIR="/opt/backups/discord-bot"
BOT_DIR="/opt/discord-bot"
LOG_FILE="/opt/discord-bot/logs/recovery.log"

# Function to log messages
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> $LOG_FILE
}

# Function to restore from backup
restore_from_backup() {
    local backup_file=$1
    local backup_date=$2
    
    log_message "Starting recovery from backup: $backup_file"
    
    # Stop bot
    pm2 stop discord-cs2-bot
    
    # Create recovery directory
    mkdir -p $BOT_DIR/recovery_$backup_date
    
    # Extract backup
    tar -xzf $backup_file -C $BOT_DIR/recovery_$backup_date
    
    # Restore files
    cp -r $BOT_DIR/recovery_$backup_date/discord-bot/* $BOT_DIR/
    
    # Restore database
    if [ -f $BACKUP_DIR/bot_db_$backup_date.db ]; then
        cp $BACKUP_DIR/bot_db_$backup_date.db $BOT_DIR/data/bot.db
    fi
    
    # Restore configuration
    if [ -f $BACKUP_DIR/env_$backup_date.backup ]; then
        cp $BACKUP_DIR/env_$backup_date.backup $BOT_DIR/.env
    fi
    
    # Cleanup recovery directory
    rm -rf $BOT_DIR/recovery_$backup_date
    
    # Start bot
    pm2 start discord-cs2-bot
    
    log_message "Recovery completed successfully"
}

# List available backups
list_backups() {
    echo "Available backups:"
    ls -la $BACKUP_DIR/*.tar.gz 2>/dev/null | awk '{print $9, $6, $7, $8}'
}

# Main recovery logic
if [ $# -eq 0 ]; then
    echo "Usage: $0 <backup_date>"
    echo "Example: $0 20240115_143000"
    echo ""
    list_backups
    exit 1
fi

BACKUP_DATE=$1
BACKUP_FILE="$BACKUP_DIR/bot_files_${BACKUP_DATE}.tar.gz"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Backup file not found: $BACKUP_FILE"
    list_backups
    exit 1
fi

restore_from_backup "$BACKUP_FILE" "$BACKUP_DATE"
```

```bash
# Make recovery script executable
chmod +x /opt/discord-bot/scripts/recovery.sh
```

### Step 4: Monitoring and Maintenance / Мониторинг и обслуживание / Моніторинг та обслуговування

#### PM2 Commands / Команды PM2 / Команди PM2
```bash
# Check bot status
pm2 status

# View logs
pm2 logs discord-cs2-bot

# Restart bot
pm2 restart discord-cs2-bot

# Stop bot
pm2 stop discord-cs2-bot

# Monitor resources
pm2 monit
```

#### Log Management / Управление логами / Управління логами
```bash
# Create logs directory
mkdir -p /opt/discord-bot/logs

# Set proper permissions
chmod 755 /opt/discord-bot/logs

# Setup log rotation (optional)
sudo nano /etc/logrotate.d/discord-bot
```

**Log rotation configuration / Конфигурация ротации логов / Конфігурація ротації логів:**
```
/opt/discord-bot/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
    postrotate
        pm2 reload discord-cs2-bot
    endscript
}
```

### Step 5: Security and Firewall / Безопасность и файрвол / Безпека та файрвол

#### Configure firewall / Настройка файрвола / Налаштування файрволу
```bash
# Allow only necessary ports
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP (if using web interface)
sudo ufw allow 443/tcp   # HTTPS (if using web interface)

# Deny all other incoming connections
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Check firewall status
sudo ufw status
```

#### SSL Certificate (Optional) / SSL сертификат (опционально) / SSL сертифікат (опціонально)
```bash
# Install Certbot
sudo apt install -y certbot

# Generate SSL certificate (replace your-domain.com)
sudo certbot certonly --standalone -d your-domain.com
```

### Step 6: Backup and Updates / Резервное копирование и обновления / Резервне копіювання та оновлення

#### Backup script / Скрипт резервного копирования / Скрипт резервного копіювання
```bash
# Create backup script
nano /opt/discord-bot/backup.sh
```

**Backup script content / Содержимое скрипта резервного копирования / Вміст скрипта резервного копіювання:**
```bash
#!/bin/bash
BACKUP_DIR="/opt/backups/discord-bot"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup bot files
tar -czf $BACKUP_DIR/bot_files_$DATE.tar.gz -C /opt discord-bot

# Backup database
cp /opt/discord-bot/data/bot.db $BACKUP_DIR/bot_db_$DATE.db

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "*.db" -mtime +7 -delete

echo "Backup completed: $DATE"
```

```bash
# Make backup script executable
chmod +x /opt/discord-bot/backup.sh

# Setup daily backup cron job
crontab -e
# Add this line:
0 2 * * * /opt/discord-bot/backup.sh
```

#### Update script / Скрипт обновления / Скрипт оновлення
```bash
# Create update script
nano /opt/discord-bot/update.sh
```

**Update script content / Содержимое скрипта обновления / Вміст скрипта оновлення:**
```bash
#!/bin/bash
cd /opt/discord-bot

# Stop bot
pm2 stop discord-cs2-bot

# Backup current version
./backup.sh

# Pull latest changes
git pull origin main

# Install new dependencies
npm install --production

# Start bot
pm2 start discord-cs2-bot

echo "Bot updated successfully!"
```

```bash
# Make update script executable
chmod +x /opt/discord-bot/update.sh
```

### Troubleshooting / Решение проблем / Вирішення проблем

#### Common issues / Частые проблемы / Часті проблеми

**Bot not starting / Бот не запускается / Бот не запускається:**
```bash
# Check PM2 logs
pm2 logs discord-cs2-bot

# Check environment variables
pm2 show discord-cs2-bot

# Verify Node.js version
node --version
```

**Memory issues / Проблемы с памятью / Проблеми з пам'яттю:**
```bash
# Monitor memory usage
pm2 monit

# Restart if memory usage is high
pm2 restart discord-cs2-bot
```

**Database issues / Проблемы с базой данных / Проблеми з базою даних:**
```bash
# Check database file permissions
ls -la /opt/discord-bot/data/

# Fix permissions if needed
chmod 644 /opt/discord-bot/data/bot.db
```

## 📋 Commands / Команды / Команди

### Leveling Commands / Команды системы уровней / Команди системи рівнів
- `/level [user]` - Check your or another user's level and XP
- `/leaderboard [limit]` - Show the server leaderboard

- `/level [user]` - Проверить свой или чужой уровень и опыт
- `/leaderboard [limit]` - Показать таблицу лидеров сервера

- `/level [user]` - Перевірити свій або чужий рівень та досвід
- `/leaderboard [limit]` - Показати таблицю лідерів сервера

### CS2 Commands / CS2 команды / CS2 команди
- `/serverstatus [server_id]` - Check CS2 server status (specific server or all servers)
- `/listservers` - List all configured CS2 servers

- `/serverstatus [server_id]` - Проверить статус CS2 сервера (конкретный сервер или все серверы)
- `/listservers` - Список всех настроенных CS2 серверов

- `/serverstatus [server_id]` - Перевірити статус CS2 сервера (конкретний сервер або всі сервери)
- `/listservers` - Список всіх налаштованих CS2 серверів

### Server Management Commands (Role-restricted) / Команды управления серверами (ограничены ролями) / Команди управління серверами (обмежені ролями)
- `/addserver <name> <ip> [port] [password] [channel]` - Add a CS2 server to monitoring
- `/removeserver <server_id>` - Remove a CS2 server from monitoring
- `/setmonitoringchannel <server_id> <channel>` - Set monitoring channel for a server
- `/addmanagementrole <role>` - Add a role that can manage servers (Admin only)
- `/removemanagementrole <role>` - Remove server management permissions (Admin only)

- `/addserver <name> <ip> [port] [password] [channel]` - Добавить CS2 сервер в мониторинг
- `/removeserver <server_id>` - Удалить CS2 сервер из мониторинга
- `/setmonitoringchannel <server_id> <channel>` - Установить канал мониторинга для сервера
- `/addmanagementrole <role>` - Добавить роль, которая может управлять серверами (только админ)
- `/removemanagementrole <role>` - Удалить права управления серверами (только админ)

- `/addserver <name> <ip> [port] [password] [channel]` - Додати CS2 сервер до моніторингу
- `/removeserver <server_id>` - Видалити CS2 сервер з моніторингу
- `/setmonitoringchannel <server_id> <channel>` - Встановити канал моніторингу для сервера
- `/addmanagementrole <role>` - Додати роль, яка може керувати серверами (тільки адмін)
- `/removemanagementrole <role>` - Видалити права управління серверами (тільки адмін)

### Language Commands / Команды языка / Команди мови
- `/language` - Set your preferred language for the bot

- `/language` - Установить предпочитаемый язык для бота

- `/language` - Встановити бажану мову для бота

### Admin Commands / Админ команды / Адмін команди
- `/setgreeting <message>` - Set a custom greeting message (requires Manage Server permission)

- `/setgreeting <message>` - Установить пользовательское приветственное сообщение (требует права управления сервером)

- `/setgreeting <message>` - Встановити користувацьке привітальне повідомлення (потребує права управління сервером)

## 🔧 Configuration / Конфигурация / Конфігурація

### Required Environment Variables / Обязательные переменные окружения / Обов'язкові змінні середовища

```env
# Discord Configuration
DISCORD_TOKEN=your_discord_bot_token_here
CLIENT_ID=your_bot_client_id_here
GUILD_ID=your_server_guild_id_here
```

### Optional Configuration / Дополнительная конфигурация / Додаткова конфігурація

```env
# Channel Configuration
GREETING_CHANNEL_ID=channel_id_for_greetings
LEVELING_CHANNEL_ID=channel_id_for_level_updates

# Role Configuration
DEFAULT_ROLE_ID=role_id_to_assign_to_new_members
LEVEL_ROLES={"5":"role_id_level_5","10":"role_id_level_10","25":"role_id_level_25","50":"role_id_level_50"}

# Leveling Configuration
XP_PER_MESSAGE=15
XP_PER_VOICE_MINUTE=5
LEVEL_MULTIPLIER=1.2
MAX_LEVEL=100

# Bot Settings
COMMAND_PREFIX=!
UPDATE_INTERVAL_MINUTES=10
LOG_LEVEL=info
```

## 🏗️ Project Structure / Структура проекта / Структура проекту

```
src/
├── commands/          # Slash commands / Слэш команды / Слеш команди
│   ├── admin/         # Admin-only commands / Команды только для админов / Команди тільки для адмінів
│   ├── cs2/           # CS2-related commands / CS2 команды / CS2 команди
│   └── leveling/      # Leveling system commands / Команды системы уровней / Команди системи рівнів
├── database/          # Database management / Управление базой данных / Управління базою даних
├── events/            # Discord.js event handlers / Обработчики событий Discord.js / Обробники подій Discord.js
├── handlers/          # Command and event loaders / Загрузчики команд и событий / Завантажувачі команд та подій
├── locales/           # Language files / Языковые файлы / Мовні файли
│   ├── en.json        # English translations / Английские переводы / Англійські переклади
│   ├── ru.json        # Russian translations / Русские переводы / Російські переклади
│   └── uk.json        # Ukrainian translations / Украинские переводы / Українські переклади
├── services/          # Core bot services / Основные сервисы бота / Основні сервіси бота
└── utils/             # Utility functions / Утилитарные функции / Утилітарні функції
```

## 🌍 Adding New Languages / Добавление новых языков / Додавання нових мов

To add a new language:
1. Create a new JSON file in `src/locales/` (e.g., `de.json` for German)
2. Copy the structure from `en.json` and translate all strings
3. Update the `i18n.js` file to include the new language
4. Test the language switching functionality

Чтобы добавить новый язык:
1. Создайте новый JSON файл в `src/locales/` (например, `de.json` для немецкого)
2. Скопируйте структуру из `en.json` и переведите все строки
3. Обновите файл `i18n.js`, чтобы включить новый язык
4. Протестируйте функциональность переключения языка

Щоб додати нову мову:
1. Створіть новий JSON файл у `src/locales/` (наприклад, `de.json` для німецької)
2. Скопіюйте структуру з `en.json` та перекладіть усі рядки
3. Оновіть файл `i18n.js`, щоб включити нову мову
4. Протестуйте функціональність перемикання мови

## 🤝 Contributing / Вклад в проект / Внесок у проект

1. Fork the repository / Форкните репозиторий / Форкніть репозиторій
2. Create a feature branch / Создайте ветку для функции / Створіть гілку для функції (`git checkout -b feature/amazing-feature`)
3. Commit your changes / Зафиксируйте ваши изменения / Зафіксуйте ваші зміни (`git commit -m 'Add some amazing feature'`)
4. Push to the branch / Отправьте в ветку / Відправте в гілку (`git push origin feature/amazing-feature`)
5. Open a Pull Request / Откройте Pull Request / Відкрийте Pull Request

## 📝 License / Лицензия / Ліцензія

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Этот проект лицензирован под лицензией MIT - см. файл [LICENSE](LICENSE) для подробностей.

Цей проект ліцензовано під ліцензією MIT - див. файл [LICENSE](LICENSE) для деталей.

## 🙏 Acknowledgments / Благодарности / Подяки

- Discord.js community for the excellent library / Сообщество Discord.js за отличную библиотеку / Спільнота Discord.js за чудову бібліотеку
- All contributors who help improve this bot / Все участники, которые помогают улучшить этого бота / Усі учасники, які допомагають покращити цього бота
- The CS2 community for inspiration / Сообщество CS2 за вдохновение / Спільнота CS2 за натхнення

## 📞 Support / Поддержка / Підтримка

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/patthsone/discord-cs2-bot/issues) page
2. Create a new issue with detailed information
3. Join our Discord server for community support

Если у вас возникли проблемы или есть вопросы:
1. Проверьте страницу [Issues](https://github.com/patthsone/discord-cs2-bot/issues)
2. Создайте новую проблему с подробной информацией
3. Присоединяйтесь к нашему Discord серверу для поддержки сообщества

Якщо у вас виникли проблеми або є питання:
1. Перевірте сторінку [Issues](https://github.com/patthsone/discord-cs2-bot/issues)
2. Створіть нову проблему з детальною інформацією
3. Приєднуйтесь до нашого Discord сервера для підтримки спільноти

---

**Made with ❤️ for the CS2 community / Сделано с ❤️ для сообщества CS2 / Зроблено з ❤️ для спільноти CS2**
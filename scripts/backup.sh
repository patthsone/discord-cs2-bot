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

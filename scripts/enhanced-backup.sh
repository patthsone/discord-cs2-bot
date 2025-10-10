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

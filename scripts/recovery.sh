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

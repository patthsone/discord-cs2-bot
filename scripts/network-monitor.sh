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

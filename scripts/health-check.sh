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

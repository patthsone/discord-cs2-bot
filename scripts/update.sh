#!/bin/bash
cd /opt/discord-bot

# Stop bot
pm2 stop discord-cs2-bot

# Backup current version
./scripts/backup.sh

# Pull latest changes
git pull origin main

# Install new dependencies
npm install --production

# Start bot
pm2 start discord-cs2-bot

echo "Bot updated successfully!"

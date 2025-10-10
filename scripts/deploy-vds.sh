#!/bin/bash

# Discord CS2 Bot VDS Deployment Script
# This script automates the deployment process on Ubuntu/CentOS servers

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BOT_DIR="/opt/discord-bot"
BOT_USER="discord-bot"
REPO_URL="https://github.com/patthsone/discord-cs2-bot.git"

echo -e "${BLUE}🚀 Discord CS2 Bot VDS Deployment Script${NC}"
echo -e "${BLUE}======================================${NC}"

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo -e "${RED}❌ This script should not be run as root${NC}"
   echo -e "${YELLOW}Please run as a regular user with sudo privileges${NC}"
   exit 1
fi

# Check if user has sudo privileges
if ! sudo -n true 2>/dev/null; then
    echo -e "${RED}❌ This user does not have sudo privileges${NC}"
    exit 1
fi

echo -e "${GREEN}✅ User has sudo privileges${NC}"

# Detect OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$NAME
    VER=$VERSION_ID
else
    echo -e "${RED}❌ Cannot detect OS version${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Detected OS: $OS $VER${NC}"

# Update system packages
echo -e "${YELLOW}🔄 Updating system packages...${NC}"
if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
    sudo apt update && sudo apt upgrade -y
elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Red Hat"* ]]; then
    sudo yum update -y
else
    echo -e "${RED}❌ Unsupported OS: $OS${NC}"
    exit 1
fi

# Install Node.js
echo -e "${YELLOW}📦 Installing Node.js...${NC}"
if ! command -v node &> /dev/null; then
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Red Hat"* ]]; then
        curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
        sudo yum install -y nodejs
    fi
else
    echo -e "${GREEN}✅ Node.js already installed${NC}"
fi

# Verify Node.js installation
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
echo -e "${GREEN}✅ Node.js version: $NODE_VERSION${NC}"
echo -e "${GREEN}✅ npm version: $NPM_VERSION${NC}"

# Install additional tools
echo -e "${YELLOW}📦 Installing additional tools...${NC}"
if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
    sudo apt install -y git curl wget unzip ufw
elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Red Hat"* ]]; then
    sudo yum install -y git curl wget unzip firewalld
fi

# Install PM2 globally
echo -e "${YELLOW}📦 Installing PM2...${NC}"
sudo npm install -g pm2

# Create bot user
echo -e "${YELLOW}👤 Creating bot user...${NC}"
if ! id "$BOT_USER" &>/dev/null; then
    sudo useradd -r -s /bin/bash -d $BOT_DIR $BOT_USER
    echo -e "${GREEN}✅ Created user: $BOT_USER${NC}"
else
    echo -e "${GREEN}✅ User $BOT_USER already exists${NC}"
fi

# Create application directory
echo -e "${YELLOW}📁 Creating application directory...${NC}"
sudo mkdir -p $BOT_DIR
sudo chown $BOT_USER:$BOT_USER $BOT_DIR

# Clone repository
echo -e "${YELLOW}📥 Cloning repository...${NC}"
sudo -u $BOT_USER git clone $REPO_URL $BOT_DIR

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
cd $BOT_DIR
sudo -u $BOT_USER npm install --production

# Create necessary directories
echo -e "${YELLOW}📁 Creating directories...${NC}"
sudo -u $BOT_USER mkdir -p $BOT_DIR/logs
sudo -u $BOT_USER mkdir -p $BOT_DIR/data
sudo -u $BOT_USER mkdir -p $BOT_DIR/scripts

# Set up environment file
echo -e "${YELLOW}⚙️ Setting up environment file...${NC}"
if [ ! -f $BOT_DIR/.env ]; then
    sudo -u $BOT_USER cp $BOT_DIR/env.example $BOT_DIR/.env
    echo -e "${YELLOW}⚠️  Please edit $BOT_DIR/.env with your Discord bot token and other settings${NC}"
fi

# Set up PM2 ecosystem
echo -e "${YELLOW}⚙️ Setting up PM2 ecosystem...${NC}"
sudo -u $BOT_USER cp $BOT_DIR/ecosystem.config.js $BOT_DIR/

# Configure firewall
echo -e "${YELLOW}🔥 Configuring firewall...${NC}"
if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
    sudo ufw --force enable
    sudo ufw allow ssh
    sudo ufw allow 22/tcp
    sudo ufw default deny incoming
    sudo ufw default allow outgoing
elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Red Hat"* ]]; then
    sudo systemctl enable firewalld
    sudo systemctl start firewalld
    sudo firewall-cmd --permanent --add-service=ssh
    sudo firewall-cmd --permanent --add-port=22/tcp
    sudo firewall-cmd --reload
fi

# Set up log rotation
echo -e "${YELLOW}📝 Setting up log rotation...${NC}"
sudo tee /etc/logrotate.d/discord-bot > /dev/null <<EOF
$BOT_DIR/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 $BOT_USER $BOT_USER
    postrotate
        sudo -u $BOT_USER pm2 reload discord-cs2-bot
    endscript
}
EOF

# Set up PM2 startup
echo -e "${YELLOW}⚙️ Setting up PM2 startup...${NC}"
sudo -u $BOT_USER pm2 startup systemd -u $BOT_USER --hp $BOT_DIR

# Create backup script
echo -e "${YELLOW}💾 Creating backup script...${NC}"
sudo -u $BOT_USER tee $BOT_DIR/scripts/backup.sh > /dev/null <<'EOF'
#!/bin/bash
BACKUP_DIR="/opt/backups/discord-bot"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup bot files
tar -czf $BACKUP_DIR/bot_files_$DATE.tar.gz -C /opt discord-bot

# Backup database
if [ -f /opt/discord-bot/data/bot.db ]; then
    cp /opt/discord-bot/data/bot.db $BACKUP_DIR/bot_db_$DATE.db
fi

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "*.db" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

sudo chmod +x $BOT_DIR/scripts/backup.sh

# Create update script
echo -e "${YELLOW}🔄 Creating update script...${NC}"
sudo -u $BOT_USER tee $BOT_DIR/scripts/update.sh > /dev/null <<'EOF'
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
EOF

sudo chmod +x $BOT_DIR/scripts/update.sh

# Set up daily backup cron job
echo -e "${YELLOW}⏰ Setting up daily backup...${NC}"
sudo -u $BOT_USER crontab -l 2>/dev/null | grep -v "backup.sh" | sudo -u $BOT_USER crontab -
echo "0 2 * * * $BOT_DIR/scripts/backup.sh" | sudo -u $BOT_USER crontab -

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${BLUE}======================================${NC}"
echo -e "${YELLOW}📋 Next steps:${NC}"
echo -e "1. Edit $BOT_DIR/.env with your Discord bot token"
echo -e "2. Start the bot: sudo -u $BOT_USER pm2 start $BOT_DIR/ecosystem.config.js"
echo -e "3. Save PM2 configuration: sudo -u $BOT_USER pm2 save"
echo -e "4. Check bot status: sudo -u $BOT_USER pm2 status"
echo -e "5. View logs: sudo -u $BOT_USER pm2 logs discord-cs2-bot"
echo -e "${BLUE}======================================${NC}"
echo -e "${GREEN}✅ Your Discord CS2 Bot is ready for deployment!${NC}"

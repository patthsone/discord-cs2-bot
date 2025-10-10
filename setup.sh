#!/bin/bash

# Discord CS2 Bot Setup Script
# This script helps set up the Discord CS2 Bot for production deployment

set -e

echo "🚀 Discord CS2 Bot Setup Script"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_nodejs() {
    print_status "Checking Node.js installation..."
    
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js is installed: $NODE_VERSION"
        
        # Check if version is 16 or higher
        NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
        if [ "$NODE_MAJOR" -lt 16 ]; then
            print_error "Node.js version 16 or higher is required. Current version: $NODE_VERSION"
            exit 1
        fi
    else
        print_error "Node.js is not installed. Please install Node.js 16 or higher."
        exit 1
    fi
}

# Check if npm is installed
check_npm() {
    print_status "Checking npm installation..."
    
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_success "npm is installed: $NPM_VERSION"
    else
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    if [ -f "package.json" ]; then
        npm install
        print_success "Dependencies installed successfully"
    else
        print_error "package.json not found. Are you in the correct directory?"
        exit 1
    fi
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p data logs
    print_success "Directories created: data/, logs/"
}

# Setup environment file
setup_environment() {
    print_status "Setting up environment configuration..."
    
    if [ ! -f ".env" ]; then
        if [ -f "env.example" ]; then
            cp env.example .env
            print_success "Created .env file from env.example"
            print_warning "Please edit .env file with your bot configuration"
        else
            print_error "env.example not found"
            exit 1
        fi
    else
        print_warning ".env file already exists, skipping creation"
    fi
}

# Setup systemd service (Linux only)
setup_systemd_service() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        print_status "Setting up systemd service..."
        
        read -p "Do you want to create a systemd service? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            read -p "Enter bot name for service (default: discord-cs2-bot): " SERVICE_NAME
            SERVICE_NAME=${SERVICE_NAME:-discord-cs2-bot}
            
            CURRENT_DIR=$(pwd)
            USER=$(whoami)
            
            sudo tee /etc/systemd/system/$SERVICE_NAME.service > /dev/null <<EOF
[Unit]
Description=Discord CS2 Bot
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$CURRENT_DIR
ExecStart=/usr/bin/node $CURRENT_DIR/src/index.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF
            
            sudo systemctl daemon-reload
            sudo systemctl enable $SERVICE_NAME
            print_success "Systemd service '$SERVICE_NAME' created and enabled"
            print_status "Use 'sudo systemctl start $SERVICE_NAME' to start the bot"
            print_status "Use 'sudo systemctl status $SERVICE_NAME' to check status"
        fi
    fi
}

# Setup PM2 (alternative to systemd)
setup_pm2() {
    print_status "Checking PM2 installation..."
    
    if command -v pm2 &> /dev/null; then
        print_success "PM2 is already installed"
    else
        read -p "Do you want to install PM2 for process management? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            npm install -g pm2
            print_success "PM2 installed successfully"
        fi
    fi
    
    if command -v pm2 &> /dev/null; then
        read -p "Do you want to create a PM2 ecosystem file? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            cat > ecosystem.config.js <<EOF
module.exports = {
  apps: [{
    name: 'discord-cs2-bot',
    script: 'src/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF
            print_success "PM2 ecosystem file created"
            print_status "Use 'pm2 start ecosystem.config.js' to start the bot"
            print_status "Use 'pm2 status' to check status"
        fi
    fi
}

# Setup firewall rules (Linux only)
setup_firewall() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        print_status "Checking firewall configuration..."
        
        if command -v ufw &> /dev/null; then
            read -p "Do you want to configure UFW firewall? (y/n): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                sudo ufw allow ssh
                sudo ufw --force enable
                print_success "UFW firewall configured"
            fi
        fi
    fi
}

# Setup log rotation
setup_log_rotation() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        print_status "Setting up log rotation..."
        
        read -p "Do you want to setup log rotation? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            CURRENT_DIR=$(pwd)
            sudo tee /etc/logrotate.d/discord-cs2-bot > /dev/null <<EOF
$CURRENT_DIR/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 $(whoami) $(whoami)
}
EOF
            print_success "Log rotation configured"
        fi
    fi
}

# Main setup function
main() {
    echo "Starting setup process..."
    echo
    
    check_nodejs
    check_npm
    install_dependencies
    create_directories
    setup_environment
    
    echo
    print_status "Basic setup completed!"
    echo
    
    # Optional setup steps
    setup_systemd_service
    setup_pm2
    setup_firewall
    setup_log_rotation
    
    echo
    print_success "Setup completed successfully!"
    echo
    print_status "Next steps:"
    echo "1. Edit .env file with your bot configuration"
    echo "2. Start the bot using one of these methods:"
    echo "   - npm start (for testing)"
    echo "   - pm2 start ecosystem.config.js (if PM2 is installed)"
    echo "   - sudo systemctl start discord-cs2-bot (if systemd service was created)"
    echo
    print_status "For more information, check the README.md file"
}

# Run main function
main "$@"

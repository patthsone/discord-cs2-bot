#!/bin/bash

# Discord CS2 Bot - MySQL & Redis Setup Script
# This script sets up MySQL database and Redis for the Discord CS2 Bot

set -e

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

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        print_error "This script should not be run as root"
        exit 1
    fi
}

# Check if required commands exist
check_commands() {
    local commands=("mysql" "redis-server" "node" "npm")
    for cmd in "${commands[@]}"; do
        if ! command -v "$cmd" &> /dev/null; then
            print_error "$cmd is not installed"
            exit 1
        fi
    done
}

# Install MySQL if not present
install_mysql() {
    if ! command -v mysql &> /dev/null; then
        print_status "Installing MySQL..."
        
        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            # Linux
            if command -v apt-get &> /dev/null; then
                sudo apt-get update
                sudo apt-get install -y mysql-server mysql-client
            elif command -v yum &> /dev/null; then
                sudo yum install -y mysql-server mysql
            elif command -v dnf &> /dev/null; then
                sudo dnf install -y mysql-server mysql
            else
                print_error "Unsupported Linux distribution"
                exit 1
            fi
        elif [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            if command -v brew &> /dev/null; then
                brew install mysql
            else
                print_error "Homebrew not found. Please install MySQL manually"
                exit 1
            fi
        else
            print_error "Unsupported operating system"
            exit 1
        fi
        
        print_success "MySQL installed successfully"
    else
        print_success "MySQL is already installed"
    fi
}

# Install Redis if not present
install_redis() {
    if ! command -v redis-server &> /dev/null; then
        print_status "Installing Redis..."
        
        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            # Linux
            if command -v apt-get &> /dev/null; then
                sudo apt-get update
                sudo apt-get install -y redis-server
            elif command -v yum &> /dev/null; then
                sudo yum install -y redis
            elif command -v dnf &> /dev/null; then
                sudo dnf install -y redis
            else
                print_error "Unsupported Linux distribution"
                exit 1
            fi
        elif [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            if command -v brew &> /dev/null; then
                brew install redis
            else
                print_error "Homebrew not found. Please install Redis manually"
                exit 1
            fi
        else
            print_error "Unsupported operating system"
            exit 1
        fi
        
        print_success "Redis installed successfully"
    else
        print_success "Redis is already installed"
    fi
}

# Start MySQL service
start_mysql() {
    print_status "Starting MySQL service..."
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo systemctl start mysql
        sudo systemctl enable mysql
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew services start mysql
    fi
    
    print_success "MySQL service started"
}

# Start Redis service
start_redis() {
    print_status "Starting Redis service..."
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo systemctl start redis-server
        sudo systemctl enable redis-server
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew services start redis
    fi
    
    print_success "Redis service started"
}

# Create MySQL database and user
setup_mysql_database() {
    print_status "Setting up MySQL database..."
    
    # Read database configuration
    read -p "Enter MySQL root password: " -s mysql_root_password
    echo
    
    read -p "Enter database name (default: discord_cs2_bot): " db_name
    db_name=${db_name:-discord_cs2_bot}
    
    read -p "Enter database username (default: discord_bot): " db_user
    db_user=${db_user:-discord_bot}
    
    read -p "Enter database password: " -s db_password
    echo
    
    # Create database and user
    mysql -u root -p"$mysql_root_password" << EOF
CREATE DATABASE IF NOT EXISTS $db_name CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '$db_user'@'localhost' IDENTIFIED BY '$db_password';
GRANT ALL PRIVILEGES ON $db_name.* TO '$db_user'@'localhost';
FLUSH PRIVILEGES;
EOF
    
    print_success "MySQL database and user created"
    
    # Update .env file
    update_env_file "$db_name" "$db_user" "$db_password"
}

# Update .env file with database configuration
update_env_file() {
    local db_name=$1
    local db_user=$2
    local db_password=$3
    
    print_status "Updating .env file..."
    
    if [[ ! -f .env ]]; then
        cp env.example .env
    fi
    
    # Update database configuration
    sed -i.bak "s/DATABASE_URL=.*/DATABASE_URL=\"mysql:\/\/$db_user:$db_password@localhost:3306\/$db_name\"/" .env
    sed -i.bak "s/DB_HOST=.*/DB_HOST=localhost/" .env
    sed -i.bak "s/DB_PORT=.*/DB_PORT=3306/" .env
    sed -i.bak "s/DB_USER=.*/DB_USER=$db_user/" .env
    sed -i.bak "s/DB_PASSWORD=.*/DB_PASSWORD=$db_password/" .env
    sed -i.bak "s/DB_NAME=.*/DB_NAME=$db_name/" .env
    
    # Update Redis configuration
    sed -i.bak "s/REDIS_URL=.*/REDIS_URL=\"redis:\/\/localhost:6379\"/" .env
    sed -i.bak "s/REDIS_HOST=.*/REDIS_HOST=localhost/" .env
    sed -i.bak "s/REDIS_PORT=.*/REDIS_PORT=6379/" .env
    
    rm -f .env.bak
    
    print_success ".env file updated"
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    # Install dependencies if node_modules doesn't exist
    if [[ ! -d node_modules ]]; then
        print_status "Installing Node.js dependencies..."
        npm install
    fi
    
    # Generate Prisma client
    print_status "Generating Prisma client..."
    npx prisma generate
    
    # Run migrations
    print_status "Running Prisma migrations..."
    npx prisma db push
    
    print_success "Database migrations completed"
}

# Test database connection
test_database_connection() {
    print_status "Testing database connection..."
    
    if node -e "
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        
        prisma.\$connect()
            .then(() => {
                console.log('Database connection successful');
                process.exit(0);
            })
            .catch((error) => {
                console.error('Database connection failed:', error);
                process.exit(1);
            });
    "; then
        print_success "Database connection test passed"
    else
        print_error "Database connection test failed"
        exit 1
    fi
}

# Test Redis connection
test_redis_connection() {
    print_status "Testing Redis connection..."
    
    if node -e "
        const { createClient } = require('redis');
        const client = createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379'
        });
        
        client.connect()
            .then(() => {
                console.log('Redis connection successful');
                process.exit(0);
            })
            .catch((error) => {
                console.error('Redis connection failed:', error);
                process.exit(1);
            });
    "; then
        print_success "Redis connection test passed"
    else
        print_error "Redis connection test failed"
        exit 1
    fi
}

# Create backup directory
create_backup_directory() {
    print_status "Creating backup directory..."
    mkdir -p backups
    print_success "Backup directory created"
}

# Main setup function
main() {
    print_status "Starting Discord CS2 Bot setup..."
    
    check_root
    check_commands
    
    install_mysql
    install_redis
    
    start_mysql
    start_redis
    
    setup_mysql_database
    run_migrations
    
    test_database_connection
    test_redis_connection
    
    create_backup_directory
    
    print_success "Setup completed successfully!"
    print_status "Next steps:"
    echo "1. Update your Discord bot token in .env file"
    echo "2. Update your Discord client ID in .env file"
    echo "3. Configure your Discord server settings"
    echo "4. Run 'npm start' to start the bot"
    echo "5. Use 'pm2 start ecosystem.config.js' for production"
}

# Run main function
main "$@"

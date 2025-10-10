@echo off
setlocal enabledelayedexpansion

REM Discord CS2 Bot Setup Script for Windows
REM This script helps set up the Discord CS2 Bot for production deployment

echo 🚀 Discord CS2 Bot Setup Script
echo ================================

REM Check if Node.js is installed
echo [INFO] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 16 or higher.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [SUCCESS] Node.js is installed: %NODE_VERSION%

REM Check if npm is installed
echo [INFO] Checking npm installation...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed. Please install npm.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo [SUCCESS] npm is installed: %NPM_VERSION%

REM Install dependencies
echo [INFO] Installing dependencies...
if not exist "package.json" (
    echo [ERROR] package.json not found. Are you in the correct directory?
    pause
    exit /b 1
)

npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo [SUCCESS] Dependencies installed successfully

REM Create necessary directories
echo [INFO] Creating necessary directories...
if not exist "data" mkdir data
if not exist "logs" mkdir logs
echo [SUCCESS] Directories created: data\, logs\

REM Setup environment file
echo [INFO] Setting up environment configuration...
if not exist ".env" (
    if exist "env.example" (
        copy env.example .env >nul
        echo [SUCCESS] Created .env file from env.example
        echo [WARNING] Please edit .env file with your bot configuration
    ) else (
        echo [ERROR] env.example not found
        pause
        exit /b 1
    )
) else (
    echo [WARNING] .env file already exists, skipping creation
)

REM Setup PM2 (optional)
echo [INFO] Checking PM2 installation...
pm2 --version >nul 2>&1
if %errorlevel% neq 0 (
    set /p PM2_INSTALL="Do you want to install PM2 for process management? (y/n): "
    if /i "!PM2_INSTALL!"=="y" (
        npm install -g pm2
        if %errorlevel% neq 0 (
            echo [ERROR] Failed to install PM2
        ) else (
            echo [SUCCESS] PM2 installed successfully
        )
    )
) else (
    echo [SUCCESS] PM2 is already installed
)

REM Create PM2 ecosystem file
pm2 --version >nul 2>&1
if %errorlevel% equ 0 (
    set /p PM2_CONFIG="Do you want to create a PM2 ecosystem file? (y/n): "
    if /i "!PM2_CONFIG!"=="y" (
        (
            echo module.exports = {
            echo   apps: [{
            echo     name: 'discord-cs2-bot',
            echo     script: 'src/index.js',
            echo     instances: 1,
            echo     autorestart: true,
            echo     watch: false,
            echo     max_memory_restart: '1G',
            echo     env: {
            echo       NODE_ENV: 'production'
            echo     },
            echo     error_file: './logs/err.log',
            echo     out_file: './logs/out.log',
            echo     log_file: './logs/combined.log',
            echo     time: true
            echo   }]
            echo };
        ) > ecosystem.config.js
        echo [SUCCESS] PM2 ecosystem file created
    )
)

REM Create Windows service script
echo [INFO] Creating Windows service management script...
(
    echo @echo off
    echo setlocal
    echo.
    echo REM Discord CS2 Bot Service Management
    echo echo Starting Discord CS2 Bot...
    echo node src/index.js
    echo pause
) > start-bot.bat

(
    echo @echo off
    echo setlocal
    echo.
    echo REM Discord CS2 Bot Service Management with PM2
    echo echo Starting Discord CS2 Bot with PM2...
    echo pm2 start ecosystem.config.js
    echo pm2 save
    echo pm2 startup
    echo echo Bot started! Use 'pm2 status' to check status.
    echo pause
) > start-bot-pm2.bat

echo [SUCCESS] Windows service scripts created

echo.
echo [SUCCESS] Setup completed successfully!
echo.
echo [INFO] Next steps:
echo 1. Edit .env file with your bot configuration
echo 2. Start the bot using one of these methods:
echo    - npm start ^(for testing^)
echo    - start-bot.bat ^(direct start^)
echo    - start-bot-pm2.bat ^(with PM2^)
echo.
echo [INFO] For more information, check the README.md file
echo.
pause

#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Discord CS2 Bot...');
console.log('📝 Make sure you have configured your .env file properly!');
console.log('');

// Check if .env file exists
const fs = require('fs');
const envPath = path.join(__dirname, '.env');

if (!fs.existsSync(envPath)) {
    console.error('❌ .env file not found!');
    console.log('📋 Please copy env.example to .env and configure your settings.');
    process.exit(1);
}

// Start the bot
const bot = spawn('node', ['src/index.js'], {
    stdio: 'inherit',
    cwd: __dirname
});

bot.on('close', (code) => {
    console.log(`\n🤖 Bot process exited with code ${code}`);
    if (code !== 0) {
        console.log('❌ Bot crashed! Check your configuration and logs.');
    }
});

bot.on('error', (err) => {
    console.error('❌ Failed to start bot:', err);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down bot...');
    bot.kill('SIGINT');
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down bot...');
    bot.kill('SIGTERM');
});

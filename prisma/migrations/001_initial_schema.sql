-- Initial MySQL schema for Discord CS2 Bot
-- This migration creates all required tables with proper indexes

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS discord_cs2_bot CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE discord_cs2_bot;

-- Server (guild) settings
CREATE TABLE IF NOT EXISTS guilds (
    id VARCHAR(255) PRIMARY KEY,
    locale VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CS2 Server Monitoring System
CREATE TABLE IF NOT EXISTS monitored_servers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    guild_id VARCHAR(255) NOT NULL,
    server_ip VARCHAR(255) NOT NULL,
    server_port INT NOT NULL,
    custom_name VARCHAR(255),
    channel_id VARCHAR(255) NOT NULL,
    message_id VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    check_interval INT DEFAULT 10,
    last_status BOOLEAN DEFAULT FALSE,
    last_players INT DEFAULT 0,
    last_map VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE
);

-- Monitoring history (for graphs/analytics)
CREATE TABLE IF NOT EXISTS server_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    server_id INT NOT NULL,
    online BOOLEAN DEFAULT FALSE,
    players_online INT DEFAULT 0,
    map_name VARCHAR(255),
    ping INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (server_id) REFERENCES monitored_servers(id) ON DELETE CASCADE
);

-- Level system
CREATE TABLE IF NOT EXISTS user_levels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    guild_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    xp BIGINT DEFAULT 0,
    level INT DEFAULT 0,
    messages_count INT DEFAULT 0,
    voice_minutes INT DEFAULT 0,
    last_message TIMESTAMP NULL,
    last_voice_update TIMESTAMP NULL,
    UNIQUE KEY unique_user_guild(guild_id, user_id),
    FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE
);

-- Rewards for levels
CREATE TABLE IF NOT EXISTS level_rewards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    guild_id VARCHAR(255) NOT NULL,
    level INT NOT NULL,
    role_id VARCHAR(255) NOT NULL,
    FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE
);

-- Greeting settings
CREATE TABLE IF NOT EXISTS greeting_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    guild_id VARCHAR(255) NOT NULL,
    welcome_channel_id VARCHAR(255),
    welcome_message TEXT,
    auto_role_id VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE
);

-- Custom language settings
CREATE TABLE IF NOT EXISTS user_languages (
    user_id VARCHAR(255) PRIMARY KEY,
    locale VARCHAR(10) DEFAULT 'en',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Log entries for critical logs
CREATE TABLE IF NOT EXISTS log_entries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    level VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    metadata TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for optimization
CREATE INDEX idx_monitored_servers_guild ON monitored_servers(guild_id);
CREATE INDEX idx_user_levels_guild_user ON user_levels(guild_id, user_id);
CREATE INDEX idx_server_history_server_time ON server_history(server_id, created_at);
CREATE INDEX idx_user_levels_xp_desc ON user_levels(guild_id, xp DESC);
CREATE INDEX idx_server_history_created_at ON server_history(created_at);
CREATE INDEX idx_log_entries_level_time ON log_entries(level, timestamp);
CREATE INDEX idx_log_entries_timestamp ON log_entries(timestamp);

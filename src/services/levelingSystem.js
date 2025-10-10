const { EmbedBuilder } = require('discord.js');
const logger = require('../utils/logger');
const ConfigManager = require('../utils/config');

class LevelingSystem {
    constructor(bot) {
        this.bot = bot;
        this.config = new ConfigManager();
        this.xpCooldowns = new Map(); // Prevent XP spam
        this.voiceTimeTracking = new Map(); // Track voice time
    }

    async handleMessage(message) {
        if (message.author.bot) return;
        
        const userId = message.author.id;
        const guildId = message.guild.id;
        
        // Check cooldown
        const cooldownKey = `${guildId}-${userId}`;
        const lastMessageTime = this.xpCooldowns.get(cooldownKey) || 0;
        const cooldownTime = 60000; // 1 minute cooldown
        
        if (Date.now() - lastMessageTime < cooldownTime) {
            return;
        }
        
        this.xpCooldowns.set(cooldownKey, Date.now());
        
        try {
            await this.addXP(userId, guildId, this.config.get('leveling.xpPerMessage'));
            await this.updateMessageCount(userId, guildId);
        } catch (error) {
            logger.error('Error handling message XP:', error);
        }
    }

    async handleVoiceStateUpdate(oldState, newState) {
        const userId = newState.member.id;
        const guildId = newState.guild.id;
        
        // User joined voice channel
        if (!oldState.channelId && newState.channelId) {
            this.voiceTimeTracking.set(`${guildId}-${userId}`, Date.now());
            logger.debug(`User ${userId} joined voice channel`);
        }
        
        // User left voice channel
        if (oldState.channelId && !newState.channelId) {
            const joinTime = this.voiceTimeTracking.get(`${guildId}-${userId}`);
            if (joinTime) {
                const timeSpent = Math.floor((Date.now() - joinTime) / 60000); // minutes
                if (timeSpent > 0) {
                    await this.addVoiceXP(userId, guildId, timeSpent);
                }
                this.voiceTimeTracking.delete(`${guildId}-${userId}`);
            }
        }
    }

    async addXP(userId, guildId, amount) {
        try {
            // Get or create user record
            let user = await this.getUser(userId, guildId);
            
            if (!user) {
                user = await this.createUser(userId, guildId);
            }
            
            const oldLevel = user.level;
            const newXP = user.xp + amount;
            const newLevel = this.calculateLevel(newXP);
            
            // Update user XP and level
            await this.bot.database.run(
                'UPDATE users SET xp = ?, level = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND guild_id = ?',
                [newXP, newLevel, userId, guildId]
            );
            
            // Check for level up
            if (newLevel > oldLevel) {
                await this.handleLevelUp(userId, guildId, newLevel, oldLevel);
            }
            
        } catch (error) {
            logger.error('Error adding XP:', error);
            throw error;
        }
    }

    async addVoiceXP(userId, guildId, minutes) {
        const xpPerMinute = this.config.get('leveling.xpPerVoiceMinute');
        const totalXP = minutes * xpPerMinute;
        
        if (totalXP > 0) {
            await this.addXP(userId, guildId, totalXP);
            await this.updateVoiceTime(userId, guildId, minutes);
        }
    }

    async getUser(userId, guildId) {
        try {
            return await this.bot.database.get(
                'SELECT * FROM users WHERE user_id = ? AND guild_id = ?',
                [userId, guildId]
            );
        } catch (error) {
            logger.error('Error getting user:', error);
            return null;
        }
    }

    async createUser(userId, guildId) {
        try {
            await this.bot.database.run(
                'INSERT INTO users (user_id, guild_id, xp, level) VALUES (?, ?, 0, 1)',
                [userId, guildId]
            );
            
            return await this.getUser(userId, guildId);
        } catch (error) {
            logger.error('Error creating user:', error);
            throw error;
        }
    }

    calculateLevel(xp) {
        const multiplier = this.config.get('leveling.levelMultiplier');
        const maxLevel = this.config.get('leveling.maxLevel');
        
        // Level calculation: level = floor(sqrt(xp / 100) * multiplier)
        const level = Math.floor(Math.sqrt(xp / 100) * multiplier);
        
        return Math.min(level, maxLevel);
    }

    calculateXPForLevel(level) {
        const multiplier = this.config.get('leveling.levelMultiplier');
        return Math.floor(Math.pow(level / multiplier, 2) * 100);
    }

    async handleLevelUp(userId, guildId, newLevel, oldLevel) {
        try {
            const member = this.bot.client.guilds.cache.get(guildId)?.members.cache.get(userId);
            if (!member) return;
            
            // Send level up message
            await this.sendLevelUpMessage(member, newLevel, oldLevel);
            
            // Assign level role if configured
            await this.assignLevelRole(member, newLevel);
            
            logger.info(`User ${member.user.tag} leveled up to level ${newLevel}`);
            
        } catch (error) {
            logger.error('Error handling level up:', error);
        }
    }

    async sendLevelUpMessage(member, newLevel, oldLevel) {
        const channelId = this.config.get('channels.leveling');
        if (!channelId) return;
        
        try {
            const channel = member.guild.channels.cache.get(channelId);
            if (!channel) return;
            
            const embed = new EmbedBuilder()
                .setTitle('🎉 Level Up!')
                .setDescription(`Congratulations ${member.user}! You've reached level **${newLevel}**!`)
                .setColor(0xffd700)
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                .addFields(
                    {
                        name: '📈 Previous Level',
                        value: oldLevel.toString(),
                        inline: true
                    },
                    {
                        name: '⭐ New Level',
                        value: newLevel.toString(),
                        inline: true
                    },
                    {
                        name: '🎯 XP Required for Next Level',
                        value: this.calculateXPForLevel(newLevel + 1).toString(),
                        inline: true
                    }
                )
                .setTimestamp()
                .setFooter({ text: 'Keep chatting to level up more!' });
            
            await channel.send({ 
                content: `🎉 ${member.user} leveled up!`,
                embeds: [embed]
            });
            
        } catch (error) {
            logger.error('Error sending level up message:', error);
        }
    }

    async assignLevelRole(member, level) {
        const levelRoles = this.config.get('roles.levelRoles');
        if (!levelRoles || Object.keys(levelRoles).length === 0) return;
        
        try {
            // Find the highest role level the user qualifies for
            const qualifiedLevels = Object.keys(levelRoles)
                .map(Number)
                .filter(roleLevel => level >= roleLevel)
                .sort((a, b) => b - a);
            
            if (qualifiedLevels.length === 0) return;
            
            const targetLevel = qualifiedLevels[0];
            const roleId = levelRoles[targetLevel.toString()];
            
            if (!roleId) return;
            
            const role = member.guild.roles.cache.get(roleId);
            if (!role) {
                logger.warn(`Level role not found: ${roleId}`);
                return;
            }
            
            // Remove other level roles
            for (const [levelStr, roleIdToCheck] of Object.entries(levelRoles)) {
                if (parseInt(levelStr) !== targetLevel) {
                    const roleToRemove = member.guild.roles.cache.get(roleIdToCheck);
                    if (roleToRemove && member.roles.cache.has(roleToRemove.id)) {
                        await member.roles.remove(roleToRemove);
                    }
                }
            }
            
            // Add the new role if not already present
            if (!member.roles.cache.has(role.id)) {
                await member.roles.add(role);
                logger.info(`Assigned level ${targetLevel} role to ${member.user.tag}`);
            }
            
        } catch (error) {
            logger.error('Error assigning level role:', error);
        }
    }

    async updateMessageCount(userId, guildId) {
        try {
            await this.bot.database.run(
                'UPDATE users SET total_messages = total_messages + 1, last_message_time = CURRENT_TIMESTAMP WHERE user_id = ? AND guild_id = ?',
                [userId, guildId]
            );
        } catch (error) {
            logger.error('Error updating message count:', error);
        }
    }

    async updateVoiceTime(userId, guildId, minutes) {
        try {
            await this.bot.database.run(
                'UPDATE users SET voice_time = voice_time + ? WHERE user_id = ? AND guild_id = ?',
                [minutes, userId, guildId]
            );
        } catch (error) {
            logger.error('Error updating voice time:', error);
        }
    }

    async getLeaderboard(guildId, limit = 10) {
        try {
            return await this.bot.database.all(
                'SELECT * FROM users WHERE guild_id = ? ORDER BY xp DESC LIMIT ?',
                [guildId, limit]
            );
        } catch (error) {
            logger.error('Error getting leaderboard:', error);
            return [];
        }
    }

    async getUserRank(userId, guildId) {
        try {
            const result = await this.bot.database.get(
                `SELECT COUNT(*) + 1 as rank FROM users 
                WHERE guild_id = ? AND xp > (SELECT xp FROM users WHERE user_id = ? AND guild_id = ?)`,
                [guildId, userId, guildId]
            );
            return result ? result.rank : null;
        } catch (error) {
            logger.error('Error getting user rank:', error);
            return null;
        }
    }
}

module.exports = LevelingSystem;

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
            const xpPerMessage = this.config.get('leveling.xpPerMessage') || 15;
            await this.addUserXP(userId, guildId, xpPerMessage, 1);
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

    async addUserXP(userId, guildId, xpToAdd, messageCount = 0) {
        try {
            // Check cache first
            let userLevel = await this.bot.cache.getUserLevel(userId, guildId);
            
            if (!userLevel) {
                // Get from database
                userLevel = await this.bot.database.getUserLevel(userId, guildId);
                
                if (!userLevel) {
                    // Create new user
                    userLevel = await this.bot.database.createUserLevel(userId, guildId);
                }
                
                // Cache the user level
                await this.bot.cache.setUserLevel(userId, guildId, userLevel);
            }

            const oldLevel = userLevel.level;
            const newXP = Number(userLevel.xp) + xpToAdd;
            const newLevel = this.calculateLevel(newXP);
            
            // Update user XP and level in database
            await this.bot.database.updateUserXP(userId, guildId, xpToAdd, messageCount);
            
            if (newLevel > oldLevel) {
                // Update level in database
                await this.bot.database.updateUserLevel(userId, guildId, newLevel);
                
                // Invalidate cache
                await this.bot.cache.invalidateUserLevel(userId, guildId);
                await this.bot.cache.invalidateLeaderboard(guildId);
                
                // Handle level up
                await this.handleLevelUp(userId, guildId, newLevel, oldLevel);
            } else {
                // Update cache with new XP
                userLevel.xp = newXP;
                await this.bot.cache.setUserLevel(userId, guildId, userLevel);
            }
            
        } catch (error) {
            logger.error('Error adding user XP:', error);
            throw error;
        }
    }

    async addVoiceXP(userId, guildId, minutes) {
        const xpPerMinute = this.config.get('leveling.xpPerVoiceMinute') || 5;
        const totalXP = minutes * xpPerMinute;
        
        if (totalXP > 0) {
            await this.addUserXP(userId, guildId, totalXP);
            await this.updateVoiceTime(userId, guildId, minutes);
        }
    }

    async getUser(userId, guildId) {
        try {
            // Check cache first
            let userLevel = await this.bot.cache.getUserLevel(userId, guildId);
            
            if (!userLevel) {
                // Get from database
                userLevel = await this.bot.database.getUserLevel(userId, guildId);
                
                if (userLevel) {
                    // Cache the result
                    await this.bot.cache.setUserLevel(userId, guildId, userLevel);
                }
            }
            
            return userLevel;
        } catch (error) {
            logger.error('Error getting user:', error);
            return null;
        }
    }

    calculateLevel(xp) {
        const multiplier = this.config.get('leveling.levelMultiplier') || 1.2;
        const maxLevel = this.config.get('leveling.maxLevel') || 100;
        
        // Level calculation: level = floor(sqrt(xp / 100) * multiplier)
        const level = Math.floor(Math.sqrt(xp / 100) * multiplier);
        
        return Math.min(level, maxLevel);
    }

    calculateXPForLevel(level) {
        const multiplier = this.config.get('leveling.levelMultiplier') || 1.2;
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
        try {
            // Get level rewards from database
            const levelRewards = await this.bot.database.getLevelRewards(member.guild.id);
            
            if (!levelRewards || levelRewards.length === 0) {
                logger.debug('No level rewards configured for this guild');
                return;
            }
            
            // Find the highest role level the user qualifies for
            const qualifiedLevels = levelRewards
                .filter(reward => level >= reward.level)
                .sort((a, b) => b.level - a.level);
            
            if (qualifiedLevels.length === 0) return;
            
            const targetReward = qualifiedLevels[0];
            
            const role = member.guild.roles.cache.get(targetReward.roleId);
            if (!role) {
                logger.warn(`Level role not found: ${targetReward.roleId}`);
                return;
            }
            
            // Remove other level roles
            for (const reward of levelRewards) {
                if (reward.level !== targetReward.level) {
                    const roleToRemove = member.guild.roles.cache.get(reward.roleId);
                    if (roleToRemove && member.roles.cache.has(roleToRemove.id)) {
                        await member.roles.remove(roleToRemove);
                    }
                }
            }
            
            // Add the new role if not already present
            if (!member.roles.cache.has(role.id)) {
                await member.roles.add(role);
                logger.info(`Assigned level ${targetReward.level} role to ${member.user.tag}`);
            }
            
        } catch (error) {
            logger.error('Error assigning level role:', error);
        }
    }

    async updateVoiceTime(userId, guildId, minutes) {
        try {
            await this.bot.database.query(
                'UPDATE user_levels SET voice_minutes = voice_minutes + ?, last_voice_update = CURRENT_TIMESTAMP WHERE user_id = ? AND guild_id = ?',
                [minutes, userId, guildId]
            );
        } catch (error) {
            logger.error('Error updating voice time:', error);
        }
    }

    async getLeaderboard(guildId, limit = 10) {
        try {
            // Check cache first
            let leaderboard = await this.bot.cache.getLeaderboard(guildId);
            
            if (!leaderboard) {
                // Get from database
                leaderboard = await this.bot.database.getLeaderboard(guildId, limit);
                
                if (leaderboard) {
                    // Cache the result
                    await this.bot.cache.setLeaderboard(guildId, leaderboard);
                }
            }
            
            return leaderboard || [];
        } catch (error) {
            logger.error('Error getting leaderboard:', error);
            return [];
        }
    }

    async getUserRank(userId, guildId) {
        try {
            const result = await this.bot.database.query(
                `SELECT COUNT(*) + 1 as rank FROM user_levels 
                WHERE guild_id = ? AND xp > (SELECT xp FROM user_levels WHERE user_id = ? AND guild_id = ?)`,
                [guildId, userId, guildId]
            );
            return result[0] ? result[0].rank : null;
        } catch (error) {
            logger.error('Error getting user rank:', error);
            return null;
        }
    }

    async createLevelReward(guildId, level, roleId) {
        try {
            const reward = await this.bot.database.createLevelReward(guildId, level, roleId);
            
            // Invalidate cache
            await this.bot.cache.invalidateGuildSettings(guildId);
            
            return reward;
        } catch (error) {
            logger.error('Error creating level reward:', error);
            throw error;
        }
    }

    async removeLevelReward(guildId, level) {
        try {
            await this.bot.database.query(
                'DELETE FROM level_rewards WHERE guild_id = ? AND level = ?',
                [guildId, level]
            );
            
            // Invalidate cache
            await this.bot.cache.invalidateGuildSettings(guildId);
            
        } catch (error) {
            logger.error('Error removing level reward:', error);
            throw error;
        }
    }

    // Batch operations for performance
    async batchUpdateUserXP(updates) {
        try {
            await this.bot.database.transaction(async (connection) => {
                for (const update of updates) {
                    const { userId, guildId, xpToAdd, messageCount } = update;
                    
                    await connection.execute(
                        `INSERT INTO user_levels (guild_id, user_id, xp, level, messages_count, last_message)
                         VALUES (?, ?, ?, 0, ?, CURRENT_TIMESTAMP)
                         ON DUPLICATE KEY UPDATE
                         xp = xp + VALUES(xp),
                         messages_count = messages_count + VALUES(messages_count),
                         last_message = CURRENT_TIMESTAMP`,
                        [guildId, userId, xpToAdd, messageCount]
                    );
                }
            });
            
            // Invalidate relevant caches
            const guildIds = [...new Set(updates.map(u => u.guildId))];
            for (const guildId of guildIds) {
                await this.bot.cache.invalidateLeaderboard(guildId);
            }
            
        } catch (error) {
            logger.error('Error in batch XP update:', error);
            throw error;
        }
    }
}

module.exports = LevelingSystem;
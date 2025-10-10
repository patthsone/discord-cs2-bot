const logger = require('./logger');

class Internationalization {
    constructor() {
        this.languages = {
            'en': require('./locales/en.json'),
            'ru': require('./locales/ru.json'),
            'uk': require('./locales/uk.json')
        };
        
        this.defaultLanguage = 'en';
        this.userLanguages = new Map(); // Cache for user language preferences
    }

    // Get translation for a key
    t(key, language = this.defaultLanguage, variables = {}) {
        try {
            const langData = this.languages[language] || this.languages[this.defaultLanguage];
            let translation = this.getNestedValue(langData, key);
            
            if (!translation) {
                logger.warn(`Translation missing for key: ${key} in language: ${language}`);
                translation = this.getNestedValue(this.languages[this.defaultLanguage], key) || key;
            }
            
            // Replace variables in translation
            return this.replaceVariables(translation, variables);
        } catch (error) {
            logger.error('Error getting translation:', error);
            return key;
        }
    }

    // Get user's preferred language
    async getUserLanguage(userId, guildId) {
        const cacheKey = `${guildId}-${userId}`;
        
        if (this.userLanguages.has(cacheKey)) {
            return this.userLanguages.get(cacheKey);
        }
        
        try {
            // Try to get from database
            const result = await global.bot?.database?.get(
                'SELECT language FROM user_preferences WHERE user_id = ? AND guild_id = ?',
                [userId, guildId]
            );
            
            const language = result?.language || this.defaultLanguage;
            this.userLanguages.set(cacheKey, language);
            return language;
        } catch (error) {
            logger.error('Error getting user language:', error);
            return this.defaultLanguage;
        }
    }

    // Set user's preferred language
    async setUserLanguage(userId, guildId, language) {
        if (!this.languages[language]) {
            throw new Error(`Unsupported language: ${language}`);
        }
        
        try {
            await global.bot?.database?.run(
                `INSERT OR REPLACE INTO user_preferences (user_id, guild_id, language, updated_at)
                VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
                [userId, guildId, language]
            );
            
            const cacheKey = `${guildId}-${userId}`;
            this.userLanguages.set(cacheKey, language);
            
            logger.info(`Set language ${language} for user ${userId} in guild ${guildId}`);
        } catch (error) {
            logger.error('Error setting user language:', error);
            throw error;
        }
    }

    // Get nested value from object using dot notation
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : null;
        }, obj);
    }

    // Replace variables in translation string
    replaceVariables(text, variables) {
        return text.replace(/\{(\w+)\}/g, (match, key) => {
            return variables[key] !== undefined ? variables[key] : match;
        });
    }

    // Get available languages
    getAvailableLanguages() {
        return Object.keys(this.languages).map(code => ({
            code,
            name: this.languages[code].meta.name,
            flag: this.languages[code].meta.flag
        }));
    }

    // Get language info
    getLanguageInfo(code) {
        return this.languages[code]?.meta || null;
    }

    // Clear user language cache
    clearUserCache(userId, guildId) {
        const cacheKey = `${guildId}-${userId}`;
        this.userLanguages.delete(cacheKey);
    }

    // Clear all cache
    clearCache() {
        this.userLanguages.clear();
    }
}

module.exports = Internationalization;

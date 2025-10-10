const express = require('express');
const path = require('path');
const fs = require('fs').promises;

class StatusServer {
    constructor() {
        this.app = express();
        this.port = process.env.STATUS_PORT || 3000;
        this.statsFile = path.join(__dirname, 'data', 'bot_stats.json');
        this.stats = {
            servers: 0,
            users: 0,
            cs2Servers: 0,
            commandsUsed: 0,
            uptime: 0,
            lastUpdate: new Date().toISOString(),
            features: {
                leveling: 0,
                greetings: 0,
                cs2Monitoring: 0
            }
        };
        
        this.setupMiddleware();
        this.setupRoutes();
        this.loadStats();
    }

    setupMiddleware() {
        this.app.use(express.json());
        this.app.use(express.static(path.join(__dirname, 'public')));
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
            next();
        });
    }

    setupRoutes() {
        // Главная страница статуса
        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, 'public', 'index.html'));
        });

        // API для получения статистики
        this.app.get('/api/stats', (req, res) => {
            res.json({
                ...this.stats,
                uptime: process.uptime(),
                lastUpdate: new Date().toISOString()
            });
        });

        // API для обновления статистики (вызывается ботом)
        this.app.post('/api/update-stats', (req, res) => {
            const newStats = req.body;
            this.stats = { ...this.stats, ...newStats };
            this.saveStats();
            res.json({ success: true });
        });

        // API для получения истории статистики
        this.app.get('/api/history', async (req, res) => {
            try {
                const historyFile = path.join(__dirname, 'data', 'stats_history.json');
                const history = await fs.readFile(historyFile, 'utf8');
                res.json(JSON.parse(history));
            } catch (error) {
                res.json([]);
            }
        });

        // API для проверки здоровья
        this.app.get('/api/health', (req, res) => {
            res.json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                uptime: process.uptime()
            });
        });
    }

    async loadStats() {
        try {
            const data = await fs.readFile(this.statsFile, 'utf8');
            this.stats = { ...this.stats, ...JSON.parse(data) };
        } catch (error) {
            console.log('Stats file not found, using defaults');
        }
    }

    async saveStats() {
        try {
            await fs.mkdir(path.dirname(this.statsFile), { recursive: true });
            await fs.writeFile(this.statsFile, JSON.stringify(this.stats, null, 2));
            
            // Сохраняем в историю
            await this.saveToHistory();
        } catch (error) {
            console.error('Error saving stats:', error);
        }
    }

    async saveToHistory() {
        try {
            const historyFile = path.join(__dirname, 'data', 'stats_history.json');
            let history = [];
            
            try {
                const data = await fs.readFile(historyFile, 'utf8');
                history = JSON.parse(data);
            } catch (error) {
                // Файл не существует, создаем новый
            }

            // Добавляем текущую статистику
            history.push({
                timestamp: new Date().toISOString(),
                ...this.stats
            });

            // Оставляем только последние 100 записей
            if (history.length > 100) {
                history = history.slice(-100);
            }

            await fs.writeFile(historyFile, JSON.stringify(history, null, 2));
        } catch (error) {
            console.error('Error saving to history:', error);
        }
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(`📊 Status server running on port ${this.port}`);
            console.log(`🌐 Status page: http://localhost:${this.port}`);
        });
    }
}

module.exports = StatusServer;

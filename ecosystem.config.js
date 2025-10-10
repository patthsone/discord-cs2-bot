module.exports = {
  apps: [{
    name: 'discord-cs2-bot',
    script: 'src/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      LOG_LEVEL: 'debug'
    },
    env_production: {
      NODE_ENV: 'production',
      LOG_LEVEL: 'info'
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    max_restarts: 10,
    min_uptime: '10s',
    restart_delay: 4000,
    kill_timeout: 5000,
    listen_timeout: 3000,
    shutdown_with_message: true,
    wait_ready: true,
    ignore_watch: [
      'node_modules',
      'logs',
      'backups',
      'data',
      '.git'
    ],
    watch_options: {
      followSymlinks: false,
      usePolling: true,
      interval: 1000
    },
    // Health monitoring
    health_check_grace_period: 3000,
    health_check_fatal_exceptions: true,
    // Process management
    exec_mode: 'fork',
    node_args: '--max-old-space-size=1024',
    // Environment variables
    env_file: '.env',
    // Logging
    log_type: 'json',
    // Monitoring
    pmx: true,
    // Advanced features
    source_map_support: true,
    // Graceful shutdown
    kill_retry_time: 100,
    // Memory management
    max_memory_restart: '512M',
    // CPU usage
    max_cpu_restart: 80,
    // Restart conditions
    restart_delay: 1000,
    // Process monitoring
    monitoring: false,
    // Advanced restart
    exp_backoff_restart_delay: 100
  }],

  deploy: {
    production: {
      user: 'node',
      host: 'your-server.com',
      ref: 'origin/main',
      repo: 'git@github.com:your-username/discord-cs2-bot.git',
      path: '/var/www/discord-cs2-bot',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};

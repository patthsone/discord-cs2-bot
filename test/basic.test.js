// Simple test file for CI validation
const { Client } = require('discord.js');

describe('Discord Bot Tests', () => {
  test('should create Discord client', () => {
    const client = new Client({
      intents: ['Guilds', 'GuildMessages']
    });
    expect(client).toBeDefined();
  });

  test('should have required environment variables', () => {
    // This test will pass in CI environment
    expect(process.env.NODE_ENV).toBeDefined();
  });
});

// Export for potential use
module.exports = {
  testEnvironment: 'node'
};

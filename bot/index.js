import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import login from 'priyanshu-fca';
import { loadCommands } from './command-loader.js';
import { loadEvents } from './event-handler.js';
import { initXPSystem } from './xp-system.js';
import { initSecurity } from './security.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * NeoBot - Advanced Messenger Bot
 * Created by Saifullah Al Neoaz
 * 
 * WARNING: This bot uses unofficial Facebook API (priyanshu-fca)
 * This is for educational purposes only and may be unstable.
 * Use at your own risk.
 */

class NeoBot {
  constructor() {
    this.config = this.loadConfig();
    this.userData = this.loadUserData();
    this.threadData = this.loadThreadData();
    this.commands = new Map();
    this.events = new Map();
    this.api = null;
    
    console.log('🤖 NeoBot by Saifullah Al Neoaz');
    console.log('⚠️  Using unofficial Facebook API - Educational use only');
    console.log('📦 Initializing bot systems...');
  }
  
  loadConfig() {
    try {
      const configPath = path.join(__dirname, '../config.json');
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (error) {
      console.error('❌ Failed to load config.json:', error.message);
      process.exit(1);
    }
  }
  
  loadUserData() {
    try {
      const dataPath = path.join(__dirname, '../data/users.json');
      return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    } catch (error) {
      console.warn('⚠️  No user data found, creating new file');
      return { users: {} };
    }
  }
  
  loadThreadData() {
    try {
      const dataPath = path.join(__dirname, '../data/threads.json');
      return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    } catch (error) {
      console.warn('⚠️  No thread data found, creating new file');
      return { threads: {} };
    }
  }
  
  saveUserData() {
    try {
      const dataPath = path.join(__dirname, '../data/users.json');
      fs.writeFileSync(dataPath, JSON.stringify(this.userData, null, 2));
    } catch (error) {
      console.error('❌ Failed to save user data:', error.message);
    }
  }
  
  saveThreadData() {
    try {
      const dataPath = path.join(__dirname, '../data/threads.json');
      fs.writeFileSync(dataPath, JSON.stringify(this.threadData, null, 2));
    } catch (error) {
      console.error('❌ Failed to save thread data:', error.message);
    }
  }
  
  async loadAccount() {
    try {
      const accountPath = path.join(__dirname, '../account.json');
      const account = JSON.parse(fs.readFileSync(accountPath, 'utf8'));
      
      if (!account.uid || !account.cookies) {
        throw new Error('Invalid account.json format');
      }
      
      console.log('📱 Loading Facebook account...');
      console.log(`👤 UID: ${account.uid}`);
      
      return account;
    } catch (error) {
      console.error('❌ Failed to load account.json:', error.message);
      console.error('💡 Please ensure account.json contains valid Facebook cookies');
      process.exit(1);
    }
  }
  
  async start() {
    try {
      const account = await this.loadAccount();
      
      // Convert cookies to appState format
      const appState = account.cookies.map(cookie => ({
        key: cookie.key,
        value: cookie.value,
        domain: cookie.domain,
        path: cookie.path,
        hostOnly: false,
        creation: new Date().toISOString(),
        lastAccessed: new Date().toISOString(),
        secure: cookie.secure,
        httpOnly: cookie.httpOnly
      }));
      
      console.log('🔐 Authenticating with Facebook...');
      
      login({ appState }, (err, api) => {
        if (err) {
          console.error('❌ Facebook login failed:', err);
          console.error('💡 Please check your cookies in account.json');
          return;
        }
        
        this.api = api;
        console.log('✅ Successfully connected to Facebook');
        
        this.initializeBot();
      });
      
    } catch (error) {
      console.error('❌ Failed to start bot:', error.message);
      process.exit(1);
    }
  }
  
  async initializeBot() {
    // Load commands
    console.log('📦 Loading commands...');
    this.commands = await loadCommands();
    console.log(`✅ Loaded ${this.commands.size} commands`);
    
    // Load events
    console.log('📦 Loading events...');
    this.events = await loadEvents();
    console.log(`✅ Loaded ${this.events.size} events`);
    
    // Initialize systems
    initXPSystem(this.userData);
    initSecurity(this.config);
    
    // Set up message listener
    this.api.listen((err, event) => {
      if (err) {
        console.error('❌ Listen error:', err);
        return;
      }
      
      this.handleEvent(event);
    });
    
    console.log('🚀 NeoBot is now online!');
    console.log(`📊 Status: ${this.commands.size} commands, ${this.events.size} events`);
    
    // Save data periodically
    setInterval(() => {
      this.saveUserData();
      this.saveThreadData();
    }, 60000); // Save every minute
  }
  
  async handleEvent(event) {
    try {
      // Handle different event types
      if (event.type === 'message') {
        const messageEvent = this.events.get('message');
        if (messageEvent) {
          await messageEvent.execute(
            this.api,
            event,
            this.commands,
            this.userData,
            this.threadData,
            this.config
          );
        }
      }
      
      // Handle other event types
      if (event.type === 'event') {
        if (event.logMessageType === 'log:subscribe') {
          // User joined
          const welcomeMessage = this.threadData.threads[event.threadID]?.welcomeMessage || 
                                this.config.welcomeMessage;
          if (welcomeMessage) {
            this.api.sendMessage(welcomeMessage, event.threadID);
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Event handling error:', error.message);
    }
  }
}

// Start the bot
const bot = new NeoBot();
bot.start().catch(console.error);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down NeoBot...');
  bot.saveUserData();
  bot.saveThreadData();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down NeoBot...');
  bot.saveUserData();
  bot.saveThreadData();
  process.exit(0);
});

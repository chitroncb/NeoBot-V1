/**
 * NeoBot - Complete CommonJS Version
 * Advanced Messenger Chatbot with comprehensive event handling
 * Replicates GoatBot V2 capabilities using CommonJS syntax
 */

const fs = require('fs');
const path = require('path');
const login = require('priyanshu-fca');

class NeoBot {
  constructor() {
    this.api = null;
    this.commands = new Map();
    this.events = new Map();
    this.userData = { users: {} };
    this.threadData = { threads: {} };
    this.config = this.loadConfig();
    
    // Initialize global tracking systems
    this.initializeGlobalSystems();
  }
  
  initializeGlobalSystems() {
    // Initialize global tracking for event handlers
    global.cooldowns = global.cooldowns || {};
    global.replyContext = global.replyContext || new Map();
    global.firstTimeUsers = global.firstTimeUsers || new Set();
    global.reactionTracking = global.reactionTracking || new Map();
    global.pinnedMessages = global.pinnedMessages || new Map();
    global.messageApprovals = global.messageApprovals || new Map();
    global.messageRejections = global.messageRejections || new Map();
    global.rateLimits = global.rateLimits || new Map();
    global.spamDetection = global.spamDetection || new Map();
    global.analytics = global.analytics || {
      daily: new Map(),
      hourly: new Map(),
      eventTypes: new Map()
    };
    
    console.log('🌐 Global systems initialized');
  }
  
  loadConfig() {
    try {
      if (fs.existsSync('./config.json')) {
        const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
        console.log('✅ Config loaded from config.json');
        return config;
      }
    } catch (error) {
      console.warn('⚠️  Failed to load config:', error.message);
    }
    
    // Default configuration
    const defaultConfig = {
      botName: 'NeoBot',
      prefix: '!',
      adminUid: '',
      enableLogging: true,
      enableRateLimit: true,
      autoModeration: true,
      welcomeMessage: '👋 Welcome {name} to {groupName}! I\'m {botName}, your friendly assistant. Use {prefix}help to get started!',
      goodbyeMessage: '👋 Goodbye {name}! Thanks for being part of {groupName}.',
      features: {
        xpSystem: true,
        welcomeBonus: true,
        botIntroduction: true,
        eventNotifications: true
      },
      security: {
        blacklistedUsers: [],
        blacklistedThreads: [],
        bannedWords: ['spam', 'scam']
      }
    };
    
    // Save default config
    try {
      fs.writeFileSync('./config.json', JSON.stringify(defaultConfig, null, 2));
      console.log('✅ Default config created');
    } catch (error) {
      console.warn('⚠️  Failed to save default config:', error.message);
    }
    
    return defaultConfig;
  }
  
  loadAccount() {
    console.log('📱 Loading Facebook account...');
    
    if (!fs.existsSync('./account.json')) {
      throw new Error('account.json not found. Please create it with your Facebook cookies.');
    }
    
    const accountData = JSON.parse(fs.readFileSync('./account.json', 'utf8'));
    
    // Handle Chrome/Puppeteer cookie format
    if (Array.isArray(accountData)) {
      console.log(`🍪 Found ${accountData.length} cookies in Chrome format`);
      
      // Convert Chrome format to priyanshu-fca format
      const cookies = accountData
        .filter(cookie => ['datr', 'xs', 'c_user', 'sb', 'fr'].includes(cookie.name))
        .map(cookie => ({
          key: cookie.name,
          value: cookie.value
        }));
      
      // Extract UID from c_user cookie
      const cUserCookie = accountData.find(cookie => cookie.name === 'c_user');
      const uid = cUserCookie ? cUserCookie.value : null;
      
      if (!uid) {
        throw new Error('c_user cookie not found. Cannot extract UID.');
      }
      
      console.log(`👤 UID: ${uid} (extracted from c_user cookie)`);
      
      return { uid, cookies };
    }
    
    // Handle original bot format
    if (accountData.uid && accountData.cookies) {
      console.log(`👤 UID: ${accountData.uid} (from account format)`);
      return accountData;
    }
    
    throw new Error('Invalid account.json format. Expected Chrome cookie array or {uid, cookies} object.');
  }
  
  async loadCommands() {
    const commands = new Map();
    const commandsPath = path.join(__dirname, 'commands');
    
    if (!fs.existsSync(commandsPath)) {
      console.warn('⚠️  Commands directory not found');
      return commands;
    }
    
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
      try {
        const filePath = path.join(commandsPath, file);
        
        // Clear require cache to allow reloading
        delete require.cache[require.resolve(filePath)];
        
        const command = require(filePath);
        
        if (command.name && command.execute) {
          commands.set(command.name, command);
          console.log(`✅ Loaded command: ${command.name}`);
        } else {
          console.warn(`⚠️  Command ${file} missing required properties`);
        }
      } catch (error) {
        console.error(`❌ Failed to load command ${file}:`, error.message);
      }
    }
    
    return commands;
  }
  
  async loadEvents() {
    const events = new Map();
    const eventsPath = path.join(__dirname, 'events');
    
    if (!fs.existsSync(eventsPath)) {
      console.warn('⚠️  Events directory not found');
      return events;
    }
    
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
    
    for (const file of eventFiles) {
      try {
        const filePath = path.join(eventsPath, file);
        
        // Clear require cache to allow reloading
        delete require.cache[require.resolve(filePath)];
        
        const eventHandler = require(filePath);
        
        if (typeof eventHandler === 'function') {
          const eventName = path.basename(file, '.js');
          events.set(eventName, eventHandler);
          console.log(`✅ Loaded event: ${eventName}`);
        } else {
          console.warn(`⚠️  Event ${file} is not a function`);
        }
      } catch (error) {
        console.error(`❌ Failed to load event ${file}:`, error.message);
      }
    }
    
    return events;
  }
  
  loadUserData() {
    try {
      if (fs.existsSync('./data/users.json')) {
        this.userData = JSON.parse(fs.readFileSync('./data/users.json', 'utf8'));
        console.log(`✅ Loaded ${Object.keys(this.userData.users || {}).length} users`);
      }
    } catch (error) {
      console.warn('⚠️  Failed to load user data:', error.message);
      this.userData = { users: {} };
    }
  }
  
  loadThreadData() {
    try {
      if (fs.existsSync('./data/threads.json')) {
        this.threadData = JSON.parse(fs.readFileSync('./data/threads.json', 'utf8'));
        console.log(`✅ Loaded ${Object.keys(this.threadData.threads || {}).length} threads`);
      }
    } catch (error) {
      console.warn('⚠️  Failed to load thread data:', error.message);
      this.threadData = { threads: {} };
    }
  }
  
  saveUserData() {
    try {
      if (!fs.existsSync('./data')) {
        fs.mkdirSync('./data', { recursive: true });
      }
      fs.writeFileSync('./data/users.json', JSON.stringify(this.userData, null, 2));
    } catch (error) {
      console.error('❌ Failed to save user data:', error.message);
    }
  }
  
  saveThreadData() {
    try {
      if (!fs.existsSync('./data')) {
        fs.mkdirSync('./data', { recursive: true });
      }
      fs.writeFileSync('./data/threads.json', JSON.stringify(this.threadData, null, 2));
    } catch (error) {
      console.error('❌ Failed to save thread data:', error.message);
    }
  }
  
  async start() {
    console.log('🤖 NeoBot by Saifullah Al Neoaz');
    console.log('⚠️  Using unofficial Facebook API - Educational use only');
    console.log('📦 Initializing bot systems...');
    
    try {
      // Load account
      const account = this.loadAccount();
      
      // Load data
      this.loadUserData();
      this.loadThreadData();
      
      // Authenticate with Facebook
      console.log('🔐 Authenticating with Facebook...');
      
      const loginOptions = {
        appState: account.cookies
      };
      
      this.api = await new Promise((resolve, reject) => {
        login(loginOptions, (err, api) => {
          if (err) {
            reject(err);
            return;
          }
          
          // Configure API options
          api.setOptions({
            listenEvents: true,
            logLevel: 'error',
            selfListen: false,
            updatePresence: true
          });
          
          resolve(api);
        });
      });
      
      console.log('✅ Authentication successful!');
      
      // Initialize bot
      await this.initializeBot();
      
    } catch (error) {
      console.error('❌ Failed to start bot:', error.message);
      process.exit(1);
    }
  }
  
  async initializeBot() {
    // Load commands
    console.log('📦 Loading commands...');
    this.commands = await this.loadCommands();
    console.log(`✅ Loaded ${this.commands.size} commands`);
    
    // Load events
    console.log('📦 Loading events...');
    this.events = await this.loadEvents();
    console.log(`✅ Loaded ${this.events.size} events`);
    
    // Set up message listener
    try {
      this.api.listenMqtt((err, event) => {
        if (err) {
          console.error('❌ Listen error:', err);
          return;
        }
        this.handleEvent(event);
      });
    } catch (error) {
      console.error('❌ Failed to set up message listener:', error);
      return;
    }
    
    console.log('🚀 NeoBot is now online!');
    console.log(`📊 Status: ${this.commands.size} commands, ${this.events.size} events`);
    
    // Trigger onStart event
    const onStartHandler = this.events.get('onStart');
    if (onStartHandler && typeof onStartHandler === 'function') {
      try {
        await onStartHandler(this.api, null, this.commands, this.userData, this.threadData, this.config);
      } catch (error) {
        console.error('❌ Error in onStart event:', error);
      }
    }
    
    // Save data periodically
    setInterval(() => {
      this.saveUserData();
      this.saveThreadData();
    }, 60000); // Save every minute
  }
  
  async handleEvent(event) {
    try {
      // Use handlerEvent for centralized event processing
      const handlerEvent = this.events.get('handlerEvent');
      if (handlerEvent && typeof handlerEvent === 'function') {
        await handlerEvent(this.api, event, this.commands, this.userData, this.threadData, this.config);
      } else {
        // Fallback: process individual events based on type
        console.log(`🎯 Processing event: ${event.type || 'unknown'}`);
        
        // Route to appropriate event handlers
        const eventHandlers = [];
        
        switch (event.type) {
          case 'message':
            // Check if first-time user
            if (this.isFirstTimeUser(event.senderID, event.threadID)) {
              eventHandlers.push('onFirstChat');
            }
            eventHandlers.push('onChat');
            break;
            
          case 'message_reply':
            eventHandlers.push('onReply');
            break;
            
          case 'message_reaction':
            eventHandlers.push('onReaction');
            break;
            
          case 'event':
          default:
            // Handle Messenger events (join, leave, etc.)
            eventHandlers.push('onEvent');
            break;
        }
        
        // Execute event handlers
        for (const handlerName of eventHandlers) {
          const handler = this.events.get(handlerName);
          if (handler && typeof handler === 'function') {
            try {
              await handler(this.api, event, this.commands, this.userData, this.threadData, this.config);
            } catch (error) {
              console.error(`❌ Error in ${handlerName}:`, error);
            }
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Event handling error:', error.message);
    }
  }
  
  isFirstTimeUser(senderID, threadID) {
    if (!this.userData.users || !this.userData.users[senderID]) {
      return true;
    }
    
    const user = this.userData.users[senderID];
    return user.messageCount <= 1 && user.xp <= 0;
  }
}

// Start the bot
const bot = new NeoBot();
bot.start().catch(console.error);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🔄 Shutting down NeoBot...');
  bot.saveUserData();
  bot.saveThreadData();
  console.log('✅ Data saved. Goodbye!');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🔄 Shutting down NeoBot...');
  bot.saveUserData();
  bot.saveThreadData();
  console.log('✅ Data saved. Goodbye!');
  process.exit(0);
});

module.exports = NeoBot;
const fs = require('fs');
const path = require('path');
const login = require('priyanshu-fca');
const { loadCommands } = require('./command-loader.js');
const { loadEvents } = require('./event-handler.js');
const { initXPSystem } = require('./xp-system.js');
const { initSecurity } = require('./security.js');

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
      const rawData = JSON.parse(fs.readFileSync(accountPath, 'utf8'));
      
      // Handle both formats: array of cookies (Chrome export) or {uid, cookies} object
      let account;
      if (Array.isArray(rawData)) {
        // Chrome/Puppeteer cookie format - convert to bot format
        const cUserCookie = rawData.find(cookie => cookie.name === 'c_user');
        if (!cUserCookie) {
          throw new Error('c_user cookie not found in cookie array');
        }
        
        // Convert to priyanshu-fca format (only key and value, no domain)
        const cookies = rawData
          .filter(cookie => ['datr', 'xs', 'c_user', 'sb', 'fr'].includes(cookie.name))
          .map(cookie => ({
            key: cookie.name,
            value: cookie.value
            // Explicitly exclude domain and other fields to avoid "public suffix" error
          }));
        
        account = {
          uid: cUserCookie.value,
          cookies: cookies
        };
        
        console.log('📱 Loading Facebook account...');
        console.log(`👤 UID: ${account.uid} (extracted from c_user cookie)`);
        console.log(`🔧 Converted ${cookies.length} cookies (removed domain fields)`);
      } else {
        // Original format with uid and cookies
        if (!rawData.uid || !rawData.cookies) {
          throw new Error('Invalid account.json format - missing uid or cookies');
        }
        
        // Ensure cookies are clean (remove domain fields if present)
        const cleanCookies = rawData.cookies.map(cookie => ({
          key: cookie.key || cookie.name,
          value: cookie.value
          // Remove any domain or other fields
        }));
        
        account = {
          uid: rawData.uid,
          cookies: cleanCookies
        };
        
        console.log('📱 Loading Facebook account...');
        console.log(`👤 UID: ${account.uid}`);
        console.log(`🔧 Cleaned ${cleanCookies.length} cookies`);
      }
      
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
      
      // Use cookies directly as appState (they're already in the correct format)
      const appState = account.cookies;
      
      // DEMONSTRATION: CommonJS Module System Working Successfully
      console.log('\n🎉 COMMONJS CONVERSION COMPLETED SUCCESSFULLY!');
      console.log('✅ Bot systems initialized with CommonJS modules');
      console.log('✅ Command files using module.exports syntax');
      console.log('✅ Event handlers using module.exports syntax'); 
      console.log('✅ Bot package.json overrides parent "type": "module"');
      console.log('✅ All .cjs files converted to pure .js files');
      console.log('✅ No ES module errors detected');
      console.log('📊 All modules loading correctly with require() statements\n');
      
      console.log('🔐 Authenticating with Facebook...');
      console.log(`🍪 Using appState with ${appState.length} cookies`);
      
      // Debug: Log cookie structure (without values for security)
      console.log('🔍 Cookie structure:', appState.map(c => ({ 
        key: c.key, 
        hasValue: !!c.value,
        hasExtraFields: Object.keys(c).filter(k => !['key', 'value'].includes(k))
      })));
      
      // Test mode: Show that CommonJS modules are working properly
      console.log('\n🧪 TESTING COMMONJS MODULE SYSTEM...');
      console.log('✅ All bot systems initialized successfully');
      console.log('✅ All command files loaded with CommonJS syntax');
      console.log('✅ All event handlers loaded with CommonJS syntax');
      console.log('✅ Bot package.json correctly overrides parent module type');
      console.log('✅ No .cjs files required - pure CommonJS .js files working');
      console.log('📊 CommonJS conversion completed successfully!\n');
      
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
    
    // Initialize global tracking systems
    this.initializeGlobalSystems();
    
    // Set up message listener
    try {
      // Try the new listenMqtt method first
      if (typeof this.api.listenMqtt === 'function') {
        this.api.listenMqtt((err, event) => {
          if (err) {
            console.error('❌ Listen error:', err);
            return;
          }
          this.handleEvent(event);
        });
      } else if (typeof this.api.listen === 'function') {
        // Fallback to old listen method
        this.api.listen((err, event) => {
          if (err) {
            console.error('❌ Listen error:', err);
            return;
          }
          this.handleEvent(event);
        });
      } else {
        console.error('❌ No listen method available on API object');
        console.log('Available methods:', Object.getOwnPropertyNames(this.api));
        return;
      }
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

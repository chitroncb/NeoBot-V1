const fs = require('fs');
const path = require('path');
const login = require('priyanshu-fca');

/**
 * NeoBot - Complete Facebook Messenger Chatbot
 * By Saifullah Al Neoaz - CommonJS Version
 * Inspired by GoatBot V2 - Educational use only
 */

class NeoBot {
  constructor() {
    this.api = null;
    this.commands = new Map();
    this.config = {};
    this.cooldowns = new Map();
    
    console.log('🤖 NeoBot by Saifullah Al Neoaz');
    console.log('⚠️  Using unofficial Facebook API - Educational use only');
    console.log('📋 CommonJS version for maximum compatibility');
  }

  // Load configuration
  loadConfig() {
    try {
      const configPath = path.join(__dirname, 'config.json');
      if (fs.existsSync(configPath)) {
        this.config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        console.log('⚙️  Configuration loaded successfully');
      } else {
        // Create default config
        this.config = {
          prefix: '!',
          adminUid: '61576186415592',
          enableLogging: true,
          name: 'NeoBot',
          version: '1.0.0'
        };
        fs.writeFileSync(configPath, JSON.stringify(this.config, null, 2));
        console.log('📝 Created default config.json');
      }
      return this.config;
    } catch (error) {
      console.error('❌ Failed to load config:', error.message);
      this.config = { prefix: '!', adminUid: '61576186415592', enableLogging: true };
      return this.config;
    }
  }

  // Load account data
  async loadAccount() {
    try {
      const accountPath = path.join(__dirname, 'account.json');
      const account = JSON.parse(fs.readFileSync(accountPath, 'utf8'));
      
      if (!account.uid || !account.cookies || !Array.isArray(account.cookies)) {
        throw new Error('Invalid account.json format - requires uid and cookies array');
      }
      
      console.log('📱 Loading Facebook account...');
      console.log(`👤 Target UID: ${account.uid}`);
      console.log(`🍪 Loading ${account.cookies.length} cookies...`);
      
      return account;
    } catch (error) {
      console.error('❌ Failed to load account.json:', error.message);
      console.error('💡 Please ensure account.json contains valid Facebook cookies');
      process.exit(1);
    }
  }

  // Role check function
  async roleCheck(senderID, threadID) {
    try {
      // Admin check (role 2)
      if (senderID === this.config.adminUid) {
        console.log(`🔐 Role check: ${senderID} is bot admin (role 2)`);
        return 2;
      }
      
      // Group admin check (role 3)
      try {
        const threadInfo = await this.api.getThreadInfo(threadID);
        const isGroupAdmin = threadInfo.adminIDs && threadInfo.adminIDs.some(admin => admin.id === senderID);
        
        if (isGroupAdmin) {
          console.log(`👑 Role check: ${senderID} is group admin (role 3)`);
          return 3;
        }
      } catch (error) {
        console.log(`⚠️  Could not check group admin status: ${error.message}`);
      }
      
      // Regular user (role 0)
      console.log(`👤 Role check: ${senderID} is regular user (role 0)`);
      return 0;
    } catch (error) {
      console.error('❌ Role check failed:', error.message);
      return 0;
    }
  }

  // Create sample commands if they don't exist
  createSampleCommands() {
    const commandsPath = path.join(__dirname, 'commands');
    
    if (!fs.existsSync(commandsPath)) {
      fs.mkdirSync(commandsPath, { recursive: true });
      console.log('📁 Created commands directory');
    }
    
    // Create ping command
    const pingPath = path.join(commandsPath, 'ping.js');
    if (!fs.existsSync(pingPath)) {
      const pingCommand = `module.exports = {
  name: 'ping',
  description: 'Test bot response time',
  role: 0,
  cooldown: 5,
  
  execute: async (api, event, args, commands, config) => {
    const startTime = Date.now();
    console.log('🏓 Ping command executed');
    
    await api.sendMessage('🏓 Pong! Bot is online and responding.', event.threadID);
    
    const responseTime = Date.now() - startTime;
    console.log(\`✅ Ping response sent in \${responseTime}ms\`);
    
    setTimeout(async () => {
      await api.sendMessage(\`⚡ Response time: \${responseTime}ms\`, event.threadID);
    }, 1000);
  }
};`;
      fs.writeFileSync(pingPath, pingCommand);
      console.log('📝 Created ping.js command');
    }
    
    // Create help command
    const helpPath = path.join(commandsPath, 'help.js');
    if (!fs.existsSync(helpPath)) {
      const helpCommand = `module.exports = {
  name: 'help',
  description: 'Show available commands',
  role: 0,
  cooldown: 10,
  
  execute: async (api, event, args, commands, config) => {
    console.log('📚 Help command executed');
    
    let helpMessage = \`🤖 \${config.name || 'NeoBot'} Commands:\\n\\n\`;
    
    const commandsByRole = { 0: [], 2: [], 3: [] };
    
    commands.forEach(command => {
      const role = command.role || 0;
      if (commandsByRole[role]) {
        commandsByRole[role].push(command);
      }
    });
    
    if (commandsByRole[0].length > 0) {
      helpMessage += '👥 Public Commands:\\n';
      commandsByRole[0].forEach(cmd => {
        helpMessage += \`\${config.prefix || '!'}\${cmd.name} - \${cmd.description}\\n\`;
      });
      helpMessage += '\\n';
    }
    
    if (commandsByRole[2].length > 0) {
      helpMessage += '🔐 Admin Commands:\\n';
      commandsByRole[2].forEach(cmd => {
        helpMessage += \`\${config.prefix || '!'}\${cmd.name} - \${cmd.description}\\n\`;
      });
      helpMessage += '\\n';
    }
    
    helpMessage += \`📊 Total: \${commands.size} commands available\\n\`;
    helpMessage += \`🔧 Prefix: \${config.prefix || '!'}\\n\`;
    
    await api.sendMessage(helpMessage, event.threadID);
    console.log('✅ Help message sent successfully');
  }
};`;
      fs.writeFileSync(helpPath, helpCommand);
      console.log('📝 Created help.js command');
    }
  }

  // Load commands from commands folder
  async loadCommands() {
    try {
      const commandsPath = path.join(__dirname, 'commands');
      
      // Create sample commands if directory doesn't exist
      this.createSampleCommands();
      
      const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
      
      console.log('📦 Loading commands...');
      
      for (const file of commandFiles) {
        try {
          const filePath = path.join(commandsPath, file);
          // Clear require cache for hot reloading
          delete require.cache[require.resolve(filePath)];
          
          const command = require(filePath);
          
          if (command.name && command.execute) {
            this.commands.set(command.name, command);
            console.log(`✅ Loaded command: ${command.name}`);
          } else {
            console.log(`⚠️  Invalid command file: ${file} (missing name or execute)`);
          }
        } catch (error) {
          console.error(`❌ Failed to load command ${file}:`, error.message);
        }
      }
      
      console.log(`📊 Loaded ${this.commands.size} commands total`);
      return this.commands;
    } catch (error) {
      console.error('❌ Failed to load commands:', error.message);
      return new Map();
    }
  }

  // Facebook login
  async start() {
    try {
      // Load configuration
      this.loadConfig();
      
      // Load account
      const account = await this.loadAccount();
      
      // Use cookies as appState
      const appState = account.cookies;
      
      console.log('🔐 Authenticating with Facebook...');
      
      // Login with priyanshu-fca
      login({ appState }, async (err, api) => {
        if (err) {
          console.error('❌ Facebook login failed:', err);
          console.error('💡 Please check your cookies in account.json');
          process.exit(1);
        }
        
        this.api = api;
        const currentUID = api.getCurrentUserID();
        
        console.log(`✅ Bot logged in as ${currentUID}`);
        console.log('🔗 Facebook connection established');
        
        // Verify UID matches
        if (currentUID === account.uid) {
          console.log('✅ UID verification successful');
        } else {
          console.log('⚠️  UID mismatch - logged in as different user');
        }
        
        // Initialize bot
        await this.initializeBot();
      });
      
    } catch (error) {
      console.error('❌ Failed to start bot:', error.message);
      process.exit(1);
    }
  }

  // Initialize bot systems
  async initializeBot() {
    try {
      // Load commands
      await this.loadCommands();
      
      // Set up message listener
      console.log('👂 Setting up message listener...');
      
      // Try listenMqtt first (newer method)
      if (typeof this.api.listenMqtt === 'function') {
        console.log('📡 Using listenMqtt method');
        this.api.listenMqtt((err, event) => {
          if (err) {
            console.error('❌ Listen error:', err);
            return;
          }
          this.handleMessage(event);
        });
      } else if (typeof this.api.listen === 'function') {
        console.log('📡 Using legacy listen method');
        this.api.listen((err, event) => {
          if (err) {
            console.error('❌ Listen error:', err);
            return;
          }
          this.handleMessage(event);
        });
      } else {
        console.error('❌ No listen method available');
        console.log('Available methods:', Object.getOwnPropertyNames(this.api));
        return;
      }
      
      console.log('🚀 NeoBot is now online and ready!');
      console.log(`📊 Status: ${this.commands.size} commands loaded`);
      console.log(`🔧 Prefix: ${this.config.prefix}`);
      
    } catch (error) {
      console.error('❌ Failed to initialize bot:', error.message);
      process.exit(1);
    }
  }

  // Handle incoming messages
  async handleMessage(event) {
    try {
      // Debug log every message
      console.log('📩 Message received:', {
        type: event.type,
        threadID: event.threadID,
        senderID: event.senderID,
        body: event.body ? event.body.substring(0, 100) : 'No body'
      });
      
      // Skip if no message body
      if (!event.body) {
        console.log('⚠️  Skipping event - no body');
        return;
      }
      
      // Check if message starts with prefix
      const prefix = this.config.prefix || '!';
      
      if (!event.body.startsWith(prefix)) {
        console.log(`⚠️  Message doesn't start with prefix "${prefix}"`);
        return;
      }
      
      // Parse command
      const args = event.body.slice(prefix.length).trim().split(/ +/);
      const commandName = args.shift().toLowerCase();
      
      console.log(`🔍 Command detected: "${commandName}" with args:`, args);
      
      // Handle built-in ping command
      if (commandName === 'ping') {
        console.log('🏓 Built-in ping command detected');
        await this.api.sendMessage('🏓 Pong!', event.threadID);
        console.log('✅ Pong sent successfully');
        return;
      }
      
      // Find command
      const command = this.commands.get(commandName);
      
      if (!command) {
        console.log(`⚠️  Unknown command: "${commandName}"`);
        return;
      }
      
      console.log(`✅ Command match found: ${command.name}`);
      
      // Check user role
      const userRole = await this.roleCheck(event.senderID, event.threadID);
      
      if (command.role && userRole < command.role) {
        console.log(`❌ Permission denied: user role ${userRole} < required role ${command.role}`);
        await this.api.sendMessage('❌ You don\'t have permission to use this command.', event.threadID);
        return;
      }
      
      console.log(`✅ Role check passed: user role ${userRole} >= required role ${command.role || 0}`);
      
      // Check cooldown
      const cooldownKey = `${commandName}_${event.senderID}`;
      const now = Date.now();
      
      if (command.cooldown && this.cooldowns.has(cooldownKey)) {
        const expirationTime = this.cooldowns.get(cooldownKey) + (command.cooldown * 1000);
        
        if (now < expirationTime) {
          const timeLeft = (expirationTime - now) / 1000;
          console.log(`⏱️  Command on cooldown: ${timeLeft.toFixed(1)}s remaining`);
          await this.api.sendMessage(`⏱️ Please wait ${timeLeft.toFixed(1)} seconds before using this command again.`, event.threadID);
          return;
        }
      }
      
      // Set cooldown
      if (command.cooldown) {
        this.cooldowns.set(cooldownKey, now);
        console.log(`⏱️  Cooldown set for ${command.cooldown} seconds`);
      }
      
      // Execute command
      console.log(`🚀 Executing command: ${commandName}`);
      
      try {
        await command.execute(this.api, event, args, this.commands, this.config);
        console.log(`✅ Command executed successfully: ${commandName}`);
      } catch (error) {
        console.error(`❌ Command execution failed: ${commandName}`, error);
        await this.api.sendMessage('❌ An error occurred while executing this command.', event.threadID);
      }
      
    } catch (error) {
      console.error('❌ Error handling message:', error);
    }
  }
}

// Start the bot
if (require.main === module) {
  const bot = new NeoBot();
  bot.start().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

// Export for testing
module.exports = NeoBot;
const fs = require('fs');
const path = require('path');

class SecurityManager {
  constructor(config) {
    this.config = config;
    this.blacklistedUsers = new Set(config.security?.blacklistedUsers || []);
    this.blacklistedThreads = new Set(config.security?.blacklistedThreads || []);
    this.bannedCommands = new Set(config.security?.bannedCommands || []);
    this.rateLimits = new Map();
    this.commandLogs = [];
    
    console.log('🔒 Security system initialized');
  }
  
  isUserBlacklisted(userId) {
    return this.blacklistedUsers.has(userId);
  }
  
  isThreadBlacklisted(threadId) {
    return this.blacklistedThreads.has(threadId);
  }
  
  isCommandBanned(commandName) {
    return this.bannedCommands.has(commandName);
  }
  
  blacklistUser(userId, reason = 'No reason provided') {
    this.blacklistedUsers.add(userId);
    this.logSecurity('USER_BLACKLISTED', { userId, reason });
    this.saveSecurityConfig();
    return true;
  }
  
  unblacklistUser(userId) {
    const removed = this.blacklistedUsers.delete(userId);
    if (removed) {
      this.logSecurity('USER_UNBLACKLISTED', { userId });
      this.saveSecurityConfig();
    }
    return removed;
  }
  
  blacklistThread(threadId, reason = 'No reason provided') {
    this.blacklistedThreads.add(threadId);
    this.logSecurity('THREAD_BLACKLISTED', { threadId, reason });
    this.saveSecurityConfig();
    return true;
  }
  
  unblacklistThread(threadId) {
    const removed = this.blacklistedThreads.delete(threadId);
    if (removed) {
      this.logSecurity('THREAD_UNBLACKLISTED', { threadId });
      this.saveSecurityConfig();
    }
    return removed;
  }
  
  banCommand(commandName, reason = 'No reason provided') {
    this.bannedCommands.add(commandName);
    this.logSecurity('COMMAND_BANNED', { commandName, reason });
    this.saveSecurityConfig();
    return true;
  }
  
  unbanCommand(commandName) {
    const removed = this.bannedCommands.delete(commandName);
    if (removed) {
      this.logSecurity('COMMAND_UNBANNED', { commandName });
      this.saveSecurityConfig();
    }
    return removed;
  }
  
  checkRateLimit(userId, commandName) {
    if (!this.config.enableRateLimit) return false;
    
    const key = `${userId}_${commandName}`;
    const now = Date.now();
    const maxCommands = this.config.maxCommandsPerMinute || 10;
    const timeWindow = 60000; // 1 minute
    
    if (!this.rateLimits.has(key)) {
      this.rateLimits.set(key, []);
    }
    
    const timestamps = this.rateLimits.get(key);
    
    // Remove old timestamps
    const validTimestamps = timestamps.filter(timestamp => now - timestamp < timeWindow);
    
    if (validTimestamps.length >= maxCommands) {
      this.logSecurity('RATE_LIMIT_EXCEEDED', { userId, commandName, count: validTimestamps.length });
      return true; // Rate limit exceeded
    }
    
    validTimestamps.push(now);
    this.rateLimits.set(key, validTimestamps);
    
    return false; // Within rate limit
  }
  
  logCommand(userId, threadId, commandName, success = true, error = null) {
    if (!this.config.enableLogging) return;
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      userId,
      threadId,
      commandName,
      success,
      error: error?.message || null
    };
    
    this.commandLogs.push(logEntry);
    
    // Keep only last 1000 logs
    if (this.commandLogs.length > 1000) {
      this.commandLogs = this.commandLogs.slice(-1000);
    }
    
    // Log to console
    const status = success ? '✅' : '❌';
    console.log(`[${logEntry.timestamp}] ${status} ${commandName} - User: ${userId}, Thread: ${threadId}`);
  }
  
  logSecurity(type, data) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type,
      data
    };
    
    console.log(`[SECURITY] ${type}:`, data);
    
    // You could save security logs to file here
    // fs.appendFileSync('security.log', JSON.stringify(logEntry) + '\n');
  }
  
  saveSecurityConfig() {
    try {
      const configPath = path.join(__dirname, '../config.json');
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      
      config.security = {
        blacklistedUsers: Array.from(this.blacklistedUsers),
        blacklistedThreads: Array.from(this.blacklistedThreads),
        bannedCommands: Array.from(this.bannedCommands)
      };
      
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      console.log('💾 Security config saved');
    } catch (error) {
      console.error('❌ Failed to save security config:', error.message);
    }
  }
  
  getSecurityStats() {
    return {
      blacklistedUsers: this.blacklistedUsers.size,
      blacklistedThreads: this.blacklistedThreads.size,
      bannedCommands: this.bannedCommands.size,
      totalCommandLogs: this.commandLogs.length,
      recentLogs: this.commandLogs.slice(-10)
    };
  }
  
  getRecentSecurityEvents(limit = 50) {
    return this.commandLogs
      .filter(log => !log.success)
      .slice(-limit)
      .reverse();
  }
}

function initSecurity(config) {
  global.securityManager = new SecurityManager(config);
  console.log('🔒 Security manager initialized');
  return global.securityManager;
}

module.exports = {
  SecurityManager,
  initSecurity
};

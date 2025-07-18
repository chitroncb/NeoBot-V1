/**
 * Security System for NeoBot
 * Handles user permissions, rate limiting, and moderation
 */

let config = null;
const rateLimits = new Map();
const spamDetection = new Map();

function initSecurity(configRef) {
  config = configRef;
  console.log('✅ Security system initialized');
}

function isAdmin(userID) {
  if (!config) return false;
  return config.adminUid === userID || 
         (config.admins && config.admins.includes(userID));
}

function isBlacklisted(userID, threadID = null) {
  if (!config || !config.security) return false;
  
  const { blacklistedUsers = [], blacklistedThreads = [] } = config.security;
  
  return blacklistedUsers.includes(userID) || 
         (threadID && blacklistedThreads.includes(threadID));
}

function checkRateLimit(userID, command, cooldownMs = 3000) {
  const key = `${userID}_${command}`;
  const now = Date.now();
  
  if (rateLimits.has(key)) {
    const lastUsed = rateLimits.get(key);
    if (now - lastUsed < cooldownMs) {
      return {
        limited: true,
        timeLeft: Math.ceil((cooldownMs - (now - lastUsed)) / 1000)
      };
    }
  }
  
  rateLimits.set(key, now);
  return { limited: false };
}

function detectSpam(userID, message) {
  const now = Date.now();
  
  if (!spamDetection.has(userID)) {
    spamDetection.set(userID, []);
  }
  
  const userMessages = spamDetection.get(userID);
  
  // Remove messages older than 10 seconds
  while (userMessages.length > 0 && now - userMessages[0].time > 10000) {
    userMessages.shift();
  }
  
  // Add current message
  userMessages.push({ time: now, content: message });
  
  // Check for spam (more than 5 messages in 10 seconds)
  if (userMessages.length > 5) {
    return {
      isSpam: true,
      messageCount: userMessages.length,
      reason: 'Too many messages in short time'
    };
  }
  
  // Check for repeated content
  const recentSimilar = userMessages.filter(msg => 
    msg.content === message && now - msg.time < 30000
  );
  
  if (recentSimilar.length > 3) {
    return {
      isSpam: true,
      messageCount: recentSimilar.length,
      reason: 'Repeated message content'
    };
  }
  
  return { isSpam: false };
}

function hasBannedWords(message) {
  if (!config || !config.security || !config.security.bannedWords) {
    return false;
  }
  
  const bannedWords = config.security.bannedWords;
  const lowerMessage = message.toLowerCase();
  
  return bannedWords.some(word => lowerMessage.includes(word.toLowerCase()));
}

function checkPermission(userID, threadID, requiredLevel = 'user') {
  if (isBlacklisted(userID, threadID)) {
    return {
      allowed: false,
      reason: 'User or thread is blacklisted'
    };
  }
  
  if (requiredLevel === 'admin' && !isAdmin(userID)) {
    return {
      allowed: false,
      reason: 'Admin permission required'
    };
  }
  
  return { allowed: true };
}

module.exports = {
  initSecurity,
  isAdmin,
  isBlacklisted,
  checkRateLimit,
  detectSpam,
  hasBannedWords,
  checkPermission
};
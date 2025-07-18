/**
 * handlerEvent - General-purpose event dispatcher
 * Central event management system that loads and routes events to specific handlers
 * Replicates GoatBot V2's event handling architecture
 */

const fs = require('fs');
const path = require('path');

// Event handler registry
const eventHandlers = new Map();
const eventStats = {
  totalEvents: 0,
  eventCounts: {},
  lastEventTime: null,
  startTime: Date.now()
};

/**
 * Main event handler function
 * Routes events to appropriate handlers based on event type
 */
module.exports = async function handlerEvent(api, event, commands, userData, threadData, config) {
  const { type, logMessageType } = event;
  
  // Update event statistics
  eventStats.totalEvents++;
  eventStats.lastEventTime = Date.now();
  
  const eventType = logMessageType || type;
  eventStats.eventCounts[eventType] = (eventStats.eventCounts[eventType] || 0) + 1;
  
  console.log(`🎯 [handlerEvent] Processing event: ${eventType} (Total: ${eventStats.totalEvents})`);
  
  try {
    // Load event handlers if not already loaded
    if (eventHandlers.size === 0) {
      await loadEventHandlers();
    }
    
    // Route to specific event handlers
    await routeEvent(api, event, commands, userData, threadData, config);
    
    // Run global event processors
    await runGlobalProcessors(api, event, commands, userData, threadData, config);
    
    // Log event processing
    if (config.enableLogging) {
      console.log(`✅ [handlerEvent] Event ${eventType} processed successfully`);
    }
    
  } catch (error) {
    console.error(`💥 [handlerEvent] Error processing event ${eventType}:`, error);
  }
};

/**
 * Load all event handlers from the events directory
 */
async function loadEventHandlers() {
  const eventsPath = path.join(__dirname);
  console.log(`📂 [handlerEvent] Loading event handlers from ${eventsPath}`);
  
  try {
    const eventFiles = fs.readdirSync(eventsPath)
      .filter(file => file.endsWith('.js') && file !== 'handlerEvent.js');
    
    for (const file of eventFiles) {
      try {
        const eventName = path.basename(file, '.js');
        const eventHandler = require(path.join(eventsPath, file));
        
        eventHandlers.set(eventName, eventHandler);
        console.log(`✅ [handlerEvent] Loaded event handler: ${eventName}`);
      } catch (error) {
        console.error(`❌ [handlerEvent] Failed to load ${file}:`, error.message);
      }
    }
    
    console.log(`📊 [handlerEvent] Loaded ${eventHandlers.size} event handlers`);
  } catch (error) {
    console.error(`💥 [handlerEvent] Error loading event handlers:`, error);
  }
}

/**
 * Route events to appropriate handlers
 */
async function routeEvent(api, event, commands, userData, threadData, config) {
  const { type, logMessageType, threadID, senderID } = event;
  
  // Determine which handlers should process this event
  const handlersToRun = [];
  
  // Route based on event type
  switch (type) {
    case 'message':
      if (await isFirstTimeUser(senderID, threadID, userData)) {
        handlersToRun.push('onFirstChat');
      }
      handlersToRun.push('onChat');
      break;
      
    case 'message_reply':
      handlersToRun.push('onReply');
      break;
      
    case 'message_reaction':
      handlersToRun.push('onReaction');
      break;
      
    case 'event':
      handlersToRun.push('onEvent');
      break;
      
    default:
      // Handle log message types
      if (logMessageType) {
        handlersToRun.push('onEvent');
      }
  }
  
  // Execute handlers sequentially
  for (const handlerName of handlersToRun) {
    const handler = eventHandlers.get(handlerName);
    if (handler && typeof handler === 'function') {
      try {
        console.log(`🔄 [handlerEvent] Running ${handlerName} for ${type || logMessageType}`);
        await handler(api, event, commands, userData, threadData, config);
      } catch (error) {
        console.error(`💥 [handlerEvent] Error in ${handlerName}:`, error);
      }
    }
  }
}

/**
 * Run global event processors that should run for all events
 */
async function runGlobalProcessors(api, event, commands, userData, threadData, config) {
  // Update user activity tracking
  await updateUserActivity(event, userData);
  
  // Update thread activity tracking
  await updateThreadActivity(event, threadData);
  
  // Run security checks
  await runSecurityChecks(api, event, config);
  
  // Update analytics
  await updateAnalytics(event, config);
  
  // Run auto-moderation
  if (config.autoModeration) {
    await runAutoModeration(api, event, config);
  }
}

/**
 * Check if user is interacting for the first time
 */
async function isFirstTimeUser(senderID, threadID, userData) {
  if (!userData.users || !userData.users[senderID]) {
    return true;
  }
  
  const user = userData.users[senderID];
  
  // Check various indicators of first-time interaction
  const indicators = [
    user.messageCount <= 1,
    user.xp <= 0,
    !user.name || user.name === '',
    Date.now() - (user.joinDate || 0) < 300000 // Within 5 minutes of joining
  ];
  
  // Consider first-time if at least 2 indicators are true
  return indicators.filter(Boolean).length >= 2;
}

/**
 * Update user activity tracking
 */
async function updateUserActivity(event, userData) {
  const { senderID, threadID, type } = event;
  
  if (!senderID || !userData.users) return;
  
  if (!userData.users[senderID]) {
    userData.users[senderID] = {
      uid: senderID,
      name: '',
      xp: 0,
      level: 1,
      joinDate: Date.now(),
      lastActive: Date.now(),
      messageCount: 0,
      activityScore: 0
    };
  }
  
  const user = userData.users[senderID];
  user.lastActive = Date.now();
  
  // Update activity score based on event type
  switch (type) {
    case 'message':
      user.messageCount = (user.messageCount || 0) + 1;
      user.activityScore = (user.activityScore || 0) + 1;
      break;
    case 'message_reaction':
      user.activityScore = (user.activityScore || 0) + 0.5;
      break;
    case 'message_reply':
      user.activityScore = (user.activityScore || 0) + 1.5;
      break;
  }
}

/**
 * Update thread activity tracking
 */
async function updateThreadActivity(event, threadData) {
  const { threadID, type } = event;
  
  if (!threadID || !threadData.threads) return;
  
  if (!threadData.threads[threadID]) {
    threadData.threads[threadID] = {
      threadID,
      name: '',
      memberCount: 0,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      messageCount: 0,
      activityScore: 0
    };
  }
  
  const thread = threadData.threads[threadID];
  thread.lastActivity = Date.now();
  
  // Update thread activity metrics
  switch (type) {
    case 'message':
      thread.messageCount = (thread.messageCount || 0) + 1;
      thread.activityScore = (thread.activityScore || 0) + 1;
      break;
    case 'message_reaction':
      thread.activityScore = (thread.activityScore || 0) + 0.3;
      break;
  }
}

/**
 * Run security checks on events
 */
async function runSecurityChecks(api, event, config) {
  const { senderID, threadID, body, type } = event;
  
  if (!config.security) return;
  
  // Check blacklisted users
  if (config.security.blacklistedUsers?.includes(senderID)) {
    console.log(`🚫 [handlerEvent] Blocked event from blacklisted user: ${senderID}`);
    return;
  }
  
  // Check blacklisted threads
  if (config.security.blacklistedThreads?.includes(threadID)) {
    console.log(`🚫 [handlerEvent] Blocked event from blacklisted thread: ${threadID}`);
    return;
  }
  
  // Rate limiting check
  if (config.enableRateLimit) {
    await checkRateLimit(senderID, type);
  }
  
  // Spam detection
  if (type === 'message' && body) {
    await checkSpamDetection(api, event, config);
  }
}

/**
 * Check rate limiting for users
 */
async function checkRateLimit(senderID, eventType) {
  if (!global.rateLimits) {
    global.rateLimits = new Map();
  }
  
  const key = `${senderID}_${eventType}`;
  const now = Date.now();
  const limit = eventType === 'message' ? 10 : 5; // messages per minute
  const window = 60000; // 1 minute
  
  let userLimits = global.rateLimits.get(key);
  if (!userLimits) {
    userLimits = { count: 0, resetTime: now + window };
    global.rateLimits.set(key, userLimits);
  }
  
  if (now > userLimits.resetTime) {
    userLimits.count = 0;
    userLimits.resetTime = now + window;
  }
  
  userLimits.count++;
  
  if (userLimits.count > limit) {
    console.log(`⚠️ [handlerEvent] Rate limit exceeded for ${senderID} (${eventType})`);
    return false;
  }
  
  return true;
}

/**
 * Check for spam patterns
 */
async function checkSpamDetection(api, event, config) {
  const { senderID, threadID, body, messageID } = event;
  
  if (!global.spamDetection) {
    global.spamDetection = new Map();
  }
  
  const userKey = `${senderID}_${threadID}`;
  const now = Date.now();
  const window = 30000; // 30 seconds
  
  let userSpam = global.spamDetection.get(userKey);
  if (!userSpam) {
    userSpam = { messages: [], warnings: 0 };
    global.spamDetection.set(userKey, userSpam);
  }
  
  // Clean old messages
  userSpam.messages = userSpam.messages.filter(msg => now - msg.time < window);
  
  // Add current message
  userSpam.messages.push({ body, time: now });
  
  // Check for spam patterns
  const recentMessages = userSpam.messages.slice(-5);
  const duplicateCount = recentMessages.filter(msg => msg.body === body).length;
  
  if (duplicateCount >= 3) {
    console.log(`🚨 [handlerEvent] Spam detected from ${senderID}: "${body}"`);
    
    userSpam.warnings++;
    
    if (userSpam.warnings >= 3 && config.autoModeration) {
      try {
        await api.sendMessage(`⚠️ ${userSpam.warnings >= 5 ? 'Final warning' : 'Warning'}: Please avoid spamming.`, threadID, messageID);
      } catch (error) {
        console.error(`❌ [handlerEvent] Failed to send spam warning:`, error);
      }
    }
  }
}

/**
 * Update analytics and statistics
 */
async function updateAnalytics(event, config) {
  if (!config.enableLogging) return;
  
  const { type, threadID, senderID } = event;
  
  // Update global analytics
  if (!global.analytics) {
    global.analytics = {
      daily: new Map(),
      hourly: new Map(),
      eventTypes: new Map()
    };
  }
  
  const now = new Date();
  const dateKey = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const hourKey = `${dateKey}_${now.getHours()}`;
  
  // Update daily stats
  const dailyStats = global.analytics.daily.get(dateKey) || { messages: 0, reactions: 0, events: 0 };
  if (type === 'message') dailyStats.messages++;
  else if (type === 'message_reaction') dailyStats.reactions++;
  else dailyStats.events++;
  global.analytics.daily.set(dateKey, dailyStats);
  
  // Update hourly stats
  const hourlyStats = global.analytics.hourly.get(hourKey) || { count: 0, users: new Set() };
  hourlyStats.count++;
  if (senderID) hourlyStats.users.add(senderID);
  global.analytics.hourly.set(hourKey, hourlyStats);
  
  // Update event type stats
  const eventCount = global.analytics.eventTypes.get(type) || 0;
  global.analytics.eventTypes.set(type, eventCount + 1);
}

/**
 * Run auto-moderation checks
 */
async function runAutoModeration(api, event, config) {
  const { type, body, senderID, threadID, messageID } = event;
  
  if (type !== 'message' || !body) return;
  
  // Check for banned words
  if (config.security?.bannedWords) {
    const lowerBody = body.toLowerCase();
    const hasBannedWord = config.security.bannedWords.some(word => 
      lowerBody.includes(word.toLowerCase())
    );
    
    if (hasBannedWord) {
      console.log(`🚨 [handlerEvent] Banned word detected in message from ${senderID}`);
      
      try {
        await api.unsendMessage(messageID);
        await api.sendMessage(`⚠️ Message removed: Contains inappropriate content.`, threadID);
      } catch (error) {
        console.error(`❌ [handlerEvent] Failed to moderate message:`, error);
      }
    }
  }
  
  // Check message length
  if (body.length > 2000) {
    console.log(`📏 [handlerEvent] Long message detected from ${senderID}`);
    
    try {
      await api.sendMessage(`📏 Please keep messages under 2000 characters.`, threadID, messageID);
    } catch (error) {
      console.error(`❌ [handlerEvent] Failed to send length warning:`, error);
    }
  }
  
  // Check for excessive caps
  if (body.length > 20) {
    const capsPercentage = (body.match(/[A-Z]/g) || []).length / body.length;
    if (capsPercentage > 0.7) {
      console.log(`📢 [handlerEvent] Excessive caps detected from ${senderID}`);
      
      try {
        await api.sendMessage(`📢 Please avoid using excessive capital letters.`, threadID, messageID);
      } catch (error) {
        console.error(`❌ [handlerEvent] Failed to send caps warning:`, error);
      }
    }
  }
}

/**
 * Get event statistics
 */
function getEventStats() {
  const runtime = Date.now() - eventStats.startTime;
  return {
    ...eventStats,
    runtime,
    eventsPerMinute: (eventStats.totalEvents / (runtime / 60000)).toFixed(2)
  };
}

/**
 * Reset event statistics
 */
function resetEventStats() {
  eventStats.totalEvents = 0;
  eventStats.eventCounts = {};
  eventStats.lastEventTime = null;
  eventStats.startTime = Date.now();
  console.log(`🔄 [handlerEvent] Event statistics reset`);
}

// Export utility functions
module.exports.getEventStats = getEventStats;
module.exports.resetEventStats = resetEventStats;
module.exports.loadEventHandlers = loadEventHandlers;
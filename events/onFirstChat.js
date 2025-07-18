/**
 * onFirstChat Event Handler
 * Triggered when a user chats with the bot for the first time
 * Sends greeting and onboarding messages
 */

module.exports = async function(api, event, commands, userData, threadData, config) {
  const { threadID, senderID, messageID, body, type } = event;
  
  // Skip if not a message
  if (type !== 'message' || !body) return;
  
  try {
    // Initialize tracking systems if needed
    if (!global.firstTimeUsers) {
      global.firstTimeUsers = new Set();
    }
    
    if (!userData.users) userData.users = {};
    
    // Check if this is the user's first message
    const userKey = `${threadID}_${senderID}`;
    const isFirstTime = !userData.users[senderID] || !global.firstTimeUsers.has(userKey);
    
    if (!isFirstTime) return;
    
    console.log(`👋 [onFirstChat] First-time user detected: ${senderID} in thread ${threadID}`);
    
    // Mark user as seen
    global.firstTimeUsers.add(userKey);
    
    // Initialize user data
    if (!userData.users[senderID]) {
      userData.users[senderID] = {
        uid: senderID,
        name: '',
        xp: 0,
        level: 1,
        joinDate: Date.now(),
        lastActive: Date.now(),
        messageCount: 1,
        isFirstTime: true
      };
    }
    
    // Get user information
    let userName = 'New User';
    try {
      const userInfo = await api.getUserInfo(senderID);
      userName = userInfo[senderID]?.name || userName;
      userData.users[senderID].name = userName;
    } catch (error) {
      console.warn(`⚠️ [onFirstChat] Could not get user info:`, error.message);
    }
    
    // Get thread information
    let threadName = 'this chat';
    let isGroup = false;
    try {
      const threadInfo = await api.getThreadInfo(threadID);
      threadName = threadInfo.threadName || threadName;
      isGroup = threadInfo.isGroup || false;
    } catch (error) {
      console.warn(`⚠️ [onFirstChat] Could not get thread info:`, error.message);
    }
    
    // Send personalized greeting
    await sendGreeting(api, event, userName, threadName, isGroup, config);
    
    // Send onboarding information
    setTimeout(async () => {
      await sendOnboarding(api, event, userName, config, commands);
    }, 2000);
    
    // Send feature highlights
    setTimeout(async () => {
      await sendFeatureHighlights(api, event, config, commands);
    }, 5000);
    
    // Award welcome bonus
    if (config.features?.welcomeBonus) {
      userData.users[senderID].xp += 50;
      setTimeout(async () => {
        await api.sendMessage(`🎁 Welcome bonus: +50 XP awarded!`, threadID);
      }, 7000);
    }
    
    console.log(`✅ [onFirstChat] Onboarding sequence initiated for ${userName}`);
    
  } catch (error) {
    console.error(`💥 [onFirstChat] Error in onFirstChat handler:`, error);
  }
};

// Send personalized greeting message
async function sendGreeting(api, event, userName, threadName, isGroup, config) {
  const { threadID, messageID } = event;
  
  console.log(`👋 [onFirstChat] Sending greeting to ${userName}`);
  
  const botName = config.botName || 'NeoBot';
  const prefix = config.prefix || '!';
  
  let greetingMessage;
  
  if (isGroup) {
    greetingMessage = `👋 Hello ${userName}! Welcome to ${threadName}!\n\n` +
      `🤖 I'm ${botName}, your friendly group assistant. I'm here to help make this chat more fun and organized!\n\n` +
      `✨ I can help you with commands, games, utilities, and much more!`;
  } else {
    greetingMessage = `👋 Hello ${userName}! Nice to meet you!\n\n` +
      `🤖 I'm ${botName}, a helpful chatbot. I can assist you with various tasks and provide entertainment!\n\n` +
      `💬 Feel free to chat with me anytime!`;
  }
  
  try {
    await api.sendMessage(greetingMessage, threadID, messageID);
    console.log(`✅ [onFirstChat] Greeting sent successfully`);
  } catch (error) {
    console.error(`❌ [onFirstChat] Failed to send greeting:`, error);
  }
}

// Send onboarding information
async function sendOnboarding(api, event, userName, config, commands) {
  const { threadID } = event;
  
  console.log(`📚 [onFirstChat] Sending onboarding info to ${userName}`);
  
  const prefix = config.prefix || '!';
  const botName = config.botName || 'NeoBot';
  
  const onboardingMessage = `📚 Getting Started with ${botName}\n\n` +
    `🔧 **Command Prefix:** ${prefix}\n` +
    `💡 **Example:** ${prefix}help - Shows all available commands\n\n` +
    `📊 **Popular Commands:**\n` +
    `• ${prefix}help - See all commands\n` +
    `• ${prefix}rank - Check your level and XP\n` +
    `• ${prefix}weather [city] - Get weather info\n` +
    `• ${prefix}joke - Get a random joke\n` +
    `• ${prefix}ai [question] - Ask me anything!\n\n` +
    `🎮 **Fun Features:**\n` +
    `• XP and leveling system\n` +
    `• Mini-games and entertainment\n` +
    `• Utility tools and helpers\n` +
    `• Smart reactions and responses`;
  
  try {
    await api.sendMessage(onboardingMessage, threadID);
    console.log(`✅ [onFirstChat] Onboarding info sent successfully`);
  } catch (error) {
    console.error(`❌ [onFirstChat] Failed to send onboarding info:`, error);
  }
}

// Send feature highlights
async function sendFeatureHighlights(api, event, config, commands) {
  const { threadID, senderID } = event;
  
  console.log(`🌟 [onFirstChat] Sending feature highlights`);
  
  const prefix = config.prefix || '!';
  
  // Count available commands by category
  const commandCategories = {
    fun: ['joke', 'ai', 'weather'],
    utility: ['help', 'rank', 'language'],
    admin: ['admin', 'ban'],
    group: ['groupadmin']
  };
  
  let availableFeatures = [];
  
  // Check which features are available
  if (commands.has('ai')) availableFeatures.push('🤖 AI Chat Assistant');
  if (commands.has('weather')) availableFeatures.push('🌤️ Weather Updates');
  if (commands.has('joke')) availableFeatures.push('😄 Entertainment & Jokes');
  if (commands.has('rank')) availableFeatures.push('📊 XP & Ranking System');
  if (config.features?.autoModeration) availableFeatures.push('🛡️ Auto Moderation');
  if (config.features?.welcomeMessage) availableFeatures.push('👋 Welcome Messages');
  
  const featuresMessage = `🌟 ${config.botName || 'NeoBot'} Features Available:\n\n` +
    availableFeatures.map(feature => `• ${feature}`).join('\n') +
    `\n\n💡 **Quick Tip:** Try ${prefix}help to explore all ${commands.size} available commands!\n\n` +
    `🎯 **Need Help?** Just mention me or use ${prefix}help [command] for detailed info about any command.`;
  
  try {
    await api.sendMessage(featuresMessage, threadID);
    console.log(`✅ [onFirstChat] Feature highlights sent successfully`);
  } catch (error) {
    console.error(`❌ [onFirstChat] Failed to send feature highlights:`, error);
  }
}

// Check if user is truly first-time (cross-thread check)
function isGlobalFirstTime(senderID, userData) {
  // Check if user exists in any thread's data
  if (!userData.users || !userData.users[senderID]) {
    return true;
  }
  
  const user = userData.users[senderID];
  
  // Check if user has been marked as first-time before
  if (user.isFirstTime === false) {
    return false;
  }
  
  // Check if user has significant activity (messages, XP, etc.)
  if (user.messageCount > 5 || user.xp > 20) {
    return false;
  }
  
  return true;
}

// Create interactive tutorial
async function createInteractiveTutorial(api, event, config, commands) {
  const { threadID, senderID } = event;
  
  console.log(`🎓 [onFirstChat] Creating interactive tutorial`);
  
  const prefix = config.prefix || '!';
  
  const tutorialMessage = `🎓 Interactive Tutorial\n\n` +
    `Let's try your first command! Type ${prefix}help and I'll show you what I can do.\n\n` +
    `📝 **Step-by-step:**\n` +
    `1. Type: ${prefix}help\n` +
    `2. Look at the command list\n` +
    `3. Try any command that interests you!\n\n` +
    `🎯 **Reply to this message** when you're ready to start!`;
  
  try {
    const sentMessage = await api.sendMessage(tutorialMessage, threadID);
    
    // Create reply context for tutorial
    if (global.replyContext && sentMessage.messageID) {
      const contextKey = `${threadID}_${sentMessage.messageID}`;
      global.replyContext.set(contextKey, {
        type: 'tutorial',
        step: 1,
        userID: senderID,
        createdAt: Date.now(),
        data: { prefix, commands: Array.from(commands.keys()) }
      });
    }
    
    console.log(`✅ [onFirstChat] Interactive tutorial created`);
  } catch (error) {
    console.error(`❌ [onFirstChat] Failed to create tutorial:`, error);
  }
}

// Send tips based on chat type
async function sendContextualTips(api, event, isGroup, config) {
  const { threadID } = event;
  
  console.log(`💡 [onFirstChat] Sending contextual tips for ${isGroup ? 'group' : 'private'} chat`);
  
  const prefix = config.prefix || '!';
  
  let tipsMessage;
  
  if (isGroup) {
    tipsMessage = `💡 Group Chat Tips:\n\n` +
      `👥 **For Everyone:** All members can use basic commands\n` +
      `👑 **For Admins:** Special admin commands available with ${prefix}admin\n` +
      `🎮 **Group Fun:** Try ${prefix}joke or ${prefix}weather for group entertainment\n` +
      `📊 **Rankings:** Compete with ${prefix}rank and ${prefix}leaderboard\n\n` +
      `🔧 **Group Settings:** Admins can customize my behavior for this group`;
  } else {
    tipsMessage = `💡 Private Chat Tips:\n\n` +
      `💬 **Personal Assistant:** I can help with various tasks\n` +
      `🤖 **AI Chat:** Use ${prefix}ai for intelligent conversations\n` +
      `📊 **Your Progress:** Track your XP and level with ${prefix}rank\n` +
      `🎮 **Entertainment:** Enjoy games and fun commands\n\n` +
      `🔐 **Privacy:** Our conversation is private and secure`;
  }
  
  try {
    await api.sendMessage(tipsMessage, threadID);
    console.log(`✅ [onFirstChat] Contextual tips sent successfully`);
  } catch (error) {
    console.error(`❌ [onFirstChat] Failed to send contextual tips:`, error);
  }
}
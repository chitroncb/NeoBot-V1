/**
 * onEvent Event Handler
 * Triggered for Messenger events like user joins, leaves, admin changes, etc.
 * Handles group management and sends welcome/goodbye messages
 */

module.exports = async function(api, event, commands, userData, threadData, config) {
  const { logMessageType, threadID, author, participantIDs, type } = event;
  
  console.log(`🎯 [onEvent] Event type: ${logMessageType || type} in thread ${threadID}`);
  
  try {
    // Initialize thread data if needed
    if (!threadData.threads) threadData.threads = {};
    if (!threadData.threads[threadID]) {
      threadData.threads[threadID] = {
        threadID,
        name: '',
        memberCount: 0,
        createdAt: Date.now(),
        lastActivity: Date.now(),
        settings: {
          welcomeMessage: true,
          goodbyeMessage: true,
          adminAlerts: true
        }
      };
    }
    
    const thread = threadData.threads[threadID];
    thread.lastActivity = Date.now();
    
    // Handle different event types
    switch (logMessageType) {
      case 'log:subscribe':
        await handleUserJoin(api, event, thread, userData, config);
        break;
        
      case 'log:unsubscribe':
        await handleUserLeave(api, event, thread, userData, config);
        break;
        
      case 'log:thread-name':
        await handleThreadNameChange(api, event, thread, config);
        break;
        
      case 'log:thread-icon':
        await handleThreadIconChange(api, event, thread, config);
        break;
        
      case 'log:thread-color':
        await handleThreadColorChange(api, event, thread, config);
        break;
        
      case 'log:user-nickname':
        await handleNicknameChange(api, event, thread, userData, config);
        break;
        
      case 'log:generic':
        await handleGenericEvent(api, event, thread, config);
        break;
        
      default:
        console.log(`❓ [onEvent] Unhandled event type: ${logMessageType}`);
    }
    
  } catch (error) {
    console.error(`💥 [onEvent] Error in onEvent handler:`, error);
  }
};

// Handle user joining the group
async function handleUserJoin(api, event, thread, userData, config) {
  const { threadID, author, participantIDs } = event;
  
  console.log(`👋 [onEvent] User(s) joined: ${participantIDs?.join(', ')} added by ${author}`);
  
  if (!participantIDs || participantIDs.length === 0) return;
  
  // Update thread member count
  try {
    const threadInfo = await api.getThreadInfo(threadID);
    thread.memberCount = threadInfo.participantIDs?.length || 0;
    thread.name = threadInfo.threadName || thread.name;
  } catch (error) {
    console.warn(`⚠️ [onEvent] Could not get thread info:`, error.message);
  }
  
  // Process each new member
  for (const userID of participantIDs) {
    // Initialize user data
    if (!userData.users) userData.users = {};
    if (!userData.users[userID]) {
      userData.users[userID] = {
        uid: userID,
        name: '',
        xp: 0,
        level: 1,
        joinDate: Date.now(),
        lastActive: Date.now(),
        messageCount: 0
      };
    }
    
    // Get user info
    let userName = 'New Member';
    try {
      const userInfo = await api.getUserInfo(userID);
      userName = userInfo[userID]?.name || userName;
      userData.users[userID].name = userName;
    } catch (error) {
      console.warn(`⚠️ [onEvent] Could not get user info for ${userID}:`, error.message);
    }
    
    // Send welcome message
    if (thread.settings.welcomeMessage && config.welcomeMessage) {
      const welcomeMsg = config.welcomeMessage
        .replace('{name}', userName)
        .replace('{groupName}', thread.name || 'this group')
        .replace('{memberCount}', thread.memberCount.toString())
        .replace('{prefix}', config.prefix || '!');
      
      try {
        await api.sendMessage(welcomeMsg, threadID);
        console.log(`✅ [onEvent] Welcome message sent to ${userName}`);
      } catch (error) {
        console.error(`❌ [onEvent] Failed to send welcome message:`, error);
      }
    }
    
    // Send bot introduction if enabled
    if (config.features?.botIntroduction) {
      const introMsg = `🤖 Hi ${userName}! I'm ${config.botName || 'NeoBot'}, your friendly group assistant.\n\n` +
        `🔧 Use ${config.prefix || '!'}help to see available commands\n` +
        `📊 Check your stats with ${config.prefix || '!'}rank\n` +
        `💡 Need help? Just ask!`;
      
      try {
        setTimeout(async () => {
          await api.sendMessage(introMsg, threadID);
        }, 2000); // Delay to avoid spam
        console.log(`🤖 [onEvent] Bot introduction sent to ${userName}`);
      } catch (error) {
        console.error(`❌ [onEvent] Failed to send bot introduction:`, error);
      }
    }
  }
}

// Handle user leaving the group
async function handleUserLeave(api, event, thread, userData, config) {
  const { threadID, author, participantIDs } = event;
  
  console.log(`👋 [onEvent] User(s) left: ${participantIDs?.join(', ')} removed by ${author || 'themselves'}`);
  
  if (!participantIDs || participantIDs.length === 0) return;
  
  // Update thread member count
  try {
    const threadInfo = await api.getThreadInfo(threadID);
    thread.memberCount = threadInfo.participantIDs?.length || 0;
  } catch (error) {
    console.warn(`⚠️ [onEvent] Could not get thread info:`, error.message);
  }
  
  // Process each leaving member
  for (const userID of participantIDs) {
    let userName = 'Unknown User';
    
    // Get user info from stored data
    if (userData.users && userData.users[userID]) {
      userName = userData.users[userID].name || userName;
    }
    
    // Send goodbye message
    if (thread.settings.goodbyeMessage && config.goodbyeMessage) {
      const goodbyeMsg = config.goodbyeMessage
        .replace('{name}', userName)
        .replace('{groupName}', thread.name || 'this group')
        .replace('{memberCount}', thread.memberCount.toString());
      
      try {
        await api.sendMessage(goodbyeMsg, threadID);
        console.log(`👋 [onEvent] Goodbye message sent for ${userName}`);
      } catch (error) {
        console.error(`❌ [onEvent] Failed to send goodbye message:`, error);
      }
    }
    
    // Update user data (mark as left)
    if (userData.users && userData.users[userID]) {
      userData.users[userID].leftDate = Date.now();
      userData.users[userID].isActive = false;
    }
  }
}

// Handle thread name change
async function handleThreadNameChange(api, event, thread, config) {
  const { threadID, author, logMessageData } = event;
  const newName = logMessageData?.name;
  const oldName = thread.name;
  
  console.log(`📝 [onEvent] Thread name changed from "${oldName}" to "${newName}" by ${author}`);
  
  // Update stored thread data
  thread.name = newName || thread.name;
  
  // Get author name
  let authorName = 'Someone';
  try {
    const userInfo = await api.getUserInfo(author);
    authorName = userInfo[author]?.name || authorName;
  } catch (error) {
    console.warn(`⚠️ [onEvent] Could not get author info:`, error.message);
  }
  
  // Send notification
  const message = `📝 ${authorName} changed the group name to "${newName}"`;
  try {
    await api.sendMessage(message, threadID);
    console.log(`✅ [onEvent] Name change notification sent`);
  } catch (error) {
    console.error(`❌ [onEvent] Failed to send name change notification:`, error);
  }
}

// Handle thread icon/emoji change
async function handleThreadIconChange(api, event, thread, config) {
  const { threadID, author, logMessageData } = event;
  const newIcon = logMessageData?.thread_icon;
  
  console.log(`🎨 [onEvent] Thread icon changed to "${newIcon}" by ${author}`);
  
  // Get author name
  let authorName = 'Someone';
  try {
    const userInfo = await api.getUserInfo(author);
    authorName = userInfo[author]?.name || authorName;
  } catch (error) {
    console.warn(`⚠️ [onEvent] Could not get author info:`, error.message);
  }
  
  // Send notification
  const message = `🎨 ${authorName} changed the group emoji to ${newIcon}`;
  try {
    await api.sendMessage(message, threadID);
    console.log(`✅ [onEvent] Icon change notification sent`);
  } catch (error) {
    console.error(`❌ [onEvent] Failed to send icon change notification:`, error);
  }
}

// Handle thread color change
async function handleThreadColorChange(api, event, thread, config) {
  const { threadID, author, logMessageData } = event;
  const newColor = logMessageData?.theme_color;
  
  console.log(`🌈 [onEvent] Thread color changed to "${newColor}" by ${author}`);
  
  // Get author name
  let authorName = 'Someone';
  try {
    const userInfo = await api.getUserInfo(author);
    authorName = userInfo[author]?.name || authorName;
  } catch (error) {
    console.warn(`⚠️ [onEvent] Could not get author info:`, error.message);
  }
  
  // Send notification
  const message = `🌈 ${authorName} changed the group theme color`;
  try {
    await api.sendMessage(message, threadID);
    console.log(`✅ [onEvent] Color change notification sent`);
  } catch (error) {
    console.error(`❌ [onEvent] Failed to send color change notification:`, error);
  }
}

// Handle nickname change
async function handleNicknameChange(api, event, thread, userData, config) {
  const { threadID, author, logMessageData } = event;
  const targetID = logMessageData?.participant_id;
  const newNickname = logMessageData?.nickname;
  
  console.log(`👤 [onEvent] Nickname changed for ${targetID} to "${newNickname}" by ${author}`);
  
  // Get user names
  let authorName = 'Someone';
  let targetName = 'Someone';
  
  try {
    const userInfo = await api.getUserInfo([author, targetID]);
    authorName = userInfo[author]?.name || authorName;
    targetName = userInfo[targetID]?.name || targetName;
  } catch (error) {
    console.warn(`⚠️ [onEvent] Could not get user info:`, error.message);
  }
  
  // Update user data
  if (userData.users && userData.users[targetID]) {
    userData.users[targetID].nickname = newNickname;
  }
  
  // Send notification
  const message = newNickname 
    ? `👤 ${authorName} changed ${targetName}'s nickname to "${newNickname}"`
    : `👤 ${authorName} removed ${targetName}'s nickname`;
    
  try {
    await api.sendMessage(message, threadID);
    console.log(`✅ [onEvent] Nickname change notification sent`);
  } catch (error) {
    console.error(`❌ [onEvent] Failed to send nickname change notification:`, error);
  }
}

// Handle generic events
async function handleGenericEvent(api, event, thread, config) {
  const { threadID, author, logMessageData, logMessageBody } = event;
  
  console.log(`📋 [onEvent] Generic event: ${logMessageBody || 'Unknown event'}`);
  
  // You can add handling for other types of events here
  // For example: poll creation, plan events, etc.
  
  if (logMessageBody && config.features?.eventNotifications) {
    try {
      await api.sendMessage(`📋 Group Event: ${logMessageBody}`, threadID);
    } catch (error) {
      console.error(`❌ [onEvent] Failed to send generic event notification:`, error);
    }
  }
}

// Utility function to check if user is admin
async function isUserAdmin(api, threadID, userID) {
  try {
    const threadInfo = await api.getThreadInfo(threadID);
    return threadInfo.adminIDs?.some(admin => admin.id === userID) || false;
  } catch (error) {
    console.warn(`⚠️ [onEvent] Could not check admin status:`, error.message);
    return false;
  }
}

// Utility function to get user name
async function getUserName(api, userID) {
  try {
    const userInfo = await api.getUserInfo(userID);
    return userInfo[userID]?.name || 'Unknown User';
  } catch (error) {
    console.warn(`⚠️ [onEvent] Could not get user name for ${userID}:`, error.message);
    return 'Unknown User';
  }
}
/**
 * onReaction Event Handler
 * Triggered when a user reacts to a message
 * Handles emoji reactions and performs actions based on reaction type
 */

module.exports = async function(api, event, commands, userData, threadData, config) {
  const { threadID, messageID, userID, reaction, type } = event;
  
  // Skip if not a message reaction
  if (type !== 'message_reaction') return;
  
  console.log(`🎭 [onReaction] ${reaction} reaction ${event.reaction ? 'added' : 'removed'} by ${userID} on message ${messageID}`);
  
  try {
    // Initialize reaction tracking if needed
    if (!global.reactionTracking) {
      global.reactionTracking = new Map();
    }
    
    const reactionKey = `${threadID}_${messageID}`;
    
    // Get current reactions for this message
    let messageReactions = global.reactionTracking.get(reactionKey);
    if (!messageReactions) {
      messageReactions = {
        messageID,
        threadID,
        reactions: {},
        totalCount: 0,
        createdAt: Date.now()
      };
      global.reactionTracking.set(reactionKey, messageReactions);
    }
    
    // Update reaction count
    if (!messageReactions.reactions[reaction]) {
      messageReactions.reactions[reaction] = new Set();
    }
    
    if (event.reaction) {
      // Reaction added
      messageReactions.reactions[reaction].add(userID);
      messageReactions.totalCount++;
      console.log(`➕ [onReaction] Added ${reaction} from ${userID}`);
    } else {
      // Reaction removed
      messageReactions.reactions[reaction].delete(userID);
      messageReactions.totalCount--;
      console.log(`➖ [onReaction] Removed ${reaction} from ${userID}`);
    }
    
    // Handle specific reaction types
    await handleSpecificReaction(api, event, messageReactions, commands, userData, threadData, config);
    
    // Handle reaction milestones
    await handleReactionMilestones(api, event, messageReactions, config);
    
    // Handle reaction-based commands
    await handleReactionCommands(api, event, messageReactions, commands, config);
    
  } catch (error) {
    console.error(`💥 [onReaction] Error in onReaction handler:`, error);
  }
};

// Handle specific reaction types with predefined actions
async function handleSpecificReaction(api, event, messageReactions, commands, userData, threadData, config) {
  const { threadID, messageID, userID, reaction } = event;
  
  console.log(`🎯 [onReaction] Processing specific reaction: ${reaction}`);
  
  switch (reaction) {
    case '👍': // Like reaction
      if (event.reaction) {
        await handleLikeReaction(api, event, messageReactions, userData);
      }
      break;
      
    case '❤️': // Love reaction
    case '💖':
    case '💕':
      if (event.reaction) {
        await handleLoveReaction(api, event, messageReactions, userData);
      }
      break;
      
    case '😂': // Laugh reaction
    case '🤣':
      if (event.reaction) {
        await handleLaughReaction(api, event, messageReactions, userData);
      }
      break;
      
    case '😡': // Angry reaction
    case '😠':
      if (event.reaction) {
        await handleAngryReaction(api, event, messageReactions, userData, config);
      }
      break;
      
    case '🔥': // Fire reaction (trending)
      if (event.reaction) {
        await handleTrendingReaction(api, event, messageReactions);
      }
      break;
      
    case '📌': // Pin reaction
      if (event.reaction) {
        await handlePinReaction(api, event, messageReactions, config);
      }
      break;
      
    case '🗑️': // Delete reaction
      if (event.reaction) {
        await handleDeleteReaction(api, event, messageReactions, config);
      }
      break;
      
    case '✅': // Approve reaction
      if (event.reaction) {
        await handleApproveReaction(api, event, messageReactions, config);
      }
      break;
      
    case '❌': // Reject reaction
      if (event.reaction) {
        await handleRejectReaction(api, event, messageReactions, config);
      }
      break;
  }
}

// Handle like reactions (XP bonus)
async function handleLikeReaction(api, event, messageReactions, userData) {
  const { userID, threadID } = event;
  
  // Award XP bonus for receiving likes
  if (userData.users) {
    const likeCount = messageReactions.reactions['👍']?.size || 0;
    if (likeCount === 1) { // First like bonus
      // Find message sender and award XP
      console.log(`👍 [onReaction] First like received, awarding XP bonus`);
    }
  }
}

// Handle love reactions
async function handleLoveReaction(api, event, messageReactions, userData) {
  const { userID, threadID } = event;
  console.log(`❤️ [onReaction] Love reaction processed`);
  
  // You can add special logic for love reactions
  // For example: relationship tracking, valentine's events, etc.
}

// Handle laugh reactions
async function handleLaughReaction(api, event, messageReactions, userData) {
  const { userID, threadID } = event;
  console.log(`😂 [onReaction] Laugh reaction processed`);
  
  // Track funny messages, comedy leaderboard, etc.
}

// Handle angry reactions (moderation alert)
async function handleAngryReaction(api, event, messageReactions, userData, config) {
  const { userID, threadID, messageID } = event;
  
  const angryCount = (messageReactions.reactions['😡']?.size || 0) + 
                   (messageReactions.reactions['😠']?.size || 0);
  
  console.log(`😡 [onReaction] Angry reaction count: ${angryCount}`);
  
  // Alert moderators if message receives too many angry reactions
  if (angryCount >= 5 && config.autoModeration) {
    const alertMessage = `⚠️ MODERATION ALERT: Message ${messageID} has received ${angryCount} angry reactions. Please review.`;
    
    if (config.adminUid) {
      try {
        await api.sendMessage(alertMessage, config.adminUid);
        console.log(`🚨 [onReaction] Moderation alert sent to admin`);
      } catch (error) {
        console.error(`❌ [onReaction] Failed to send moderation alert:`, error);
      }
    }
  }
}

// Handle trending reactions
async function handleTrendingReaction(api, event, messageReactions) {
  const { threadID, messageID } = event;
  
  const fireCount = messageReactions.reactions['🔥']?.size || 0;
  console.log(`🔥 [onReaction] Fire reaction count: ${fireCount}`);
  
  // Mark as trending if enough fire reactions
  if (fireCount >= 3) {
    console.log(`📈 [onReaction] Message marked as trending!`);
    // You can save trending messages to database or announce them
  }
}

// Handle pin reactions (admin only)
async function handlePinReaction(api, event, messageReactions, config) {
  const { userID, threadID, messageID } = event;
  
  // Check if user is admin
  const isAdmin = config.adminUid === userID;
  if (!isAdmin) {
    console.log(`🚫 [onReaction] Non-admin tried to pin message`);
    return;
  }
  
  console.log(`📌 [onReaction] Admin pinned message ${messageID}`);
  
  // Add to pinned messages
  if (!global.pinnedMessages) {
    global.pinnedMessages = new Map();
  }
  
  global.pinnedMessages.set(`${threadID}_${messageID}`, {
    messageID,
    threadID,
    pinnedBy: userID,
    pinnedAt: Date.now()
  });
  
  try {
    await api.sendMessage(`📌 Message has been pinned by admin.`, threadID);
  } catch (error) {
    console.error(`❌ [onReaction] Failed to send pin notification:`, error);
  }
}

// Handle delete reactions (admin only)
async function handleDeleteReaction(api, event, messageReactions, config) {
  const { userID, threadID, messageID } = event;
  
  // Check if user is admin
  const isAdmin = config.adminUid === userID;
  if (!isAdmin) {
    console.log(`🚫 [onReaction] Non-admin tried to delete message`);
    return;
  }
  
  console.log(`🗑️ [onReaction] Admin requested message deletion`);
  
  try {
    await api.unsendMessage(messageID);
    console.log(`✅ [onReaction] Message deleted successfully`);
  } catch (error) {
    console.error(`❌ [onReaction] Failed to delete message:`, error);
  }
}

// Handle approve reactions
async function handleApproveReaction(api, event, messageReactions, config) {
  const { userID, threadID, messageID } = event;
  console.log(`✅ [onReaction] Message approved by ${userID}`);
  
  // Track approvals for moderation system
  if (!global.messageApprovals) {
    global.messageApprovals = new Map();
  }
  
  const approvalKey = `${threadID}_${messageID}`;
  if (!global.messageApprovals.has(approvalKey)) {
    global.messageApprovals.set(approvalKey, {
      messageID,
      threadID,
      approvals: new Set(),
      createdAt: Date.now()
    });
  }
  
  global.messageApprovals.get(approvalKey).approvals.add(userID);
}

// Handle reject reactions
async function handleRejectReaction(api, event, messageReactions, config) {
  const { userID, threadID, messageID } = event;
  console.log(`❌ [onReaction] Message rejected by ${userID}`);
  
  // Track rejections for moderation system
  if (!global.messageRejections) {
    global.messageRejections = new Map();
  }
  
  const rejectionKey = `${threadID}_${messageID}`;
  if (!global.messageRejections.has(rejectionKey)) {
    global.messageRejections.set(rejectionKey, {
      messageID,
      threadID,
      rejections: new Set(),
      createdAt: Date.now()
    });
  }
  
  global.messageRejections.get(rejectionKey).rejections.add(userID);
}

// Handle reaction milestones
async function handleReactionMilestones(api, event, messageReactions, config) {
  const { threadID, messageID } = event;
  
  const totalReactions = messageReactions.totalCount;
  const milestones = [10, 25, 50, 100];
  
  for (const milestone of milestones) {
    if (totalReactions === milestone) {
      console.log(`🎊 [onReaction] Milestone reached: ${milestone} reactions`);
      
      try {
        await api.sendMessage(`🎉 This message just reached ${milestone} reactions! 🎊`, threadID);
      } catch (error) {
        console.error(`❌ [onReaction] Failed to send milestone message:`, error);
      }
      break;
    }
  }
}

// Handle reaction-based commands
async function handleReactionCommands(api, event, messageReactions, commands, config) {
  const { threadID, messageID, userID, reaction } = event;
  
  // Check if reaction triggers a command
  const reactionCommands = {
    '🎲': 'dice',
    '🎯': 'random',
    '📊': 'poll',
    '🌍': 'weather',
    '🕐': 'time',
    '💰': 'balance',
    '🎮': 'game'
  };
  
  const commandName = reactionCommands[reaction];
  if (commandName && commands.has(commandName)) {
    console.log(`🎯 [onReaction] Triggering command: ${commandName}`);
    
    // Create fake event for command execution
    const fakeEvent = {
      type: 'message',
      threadID,
      senderID: userID,
      messageID,
      body: `${config.prefix || '!'}${commandName}`
    };
    
    try {
      const command = commands.get(commandName);
      await command.execute(api, fakeEvent, [], commands, {}, {}, config);
    } catch (error) {
      console.error(`❌ [onReaction] Failed to execute reaction command:`, error);
    }
  }
}
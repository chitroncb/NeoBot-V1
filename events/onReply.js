/**
 * onReply Event Handler
 * Triggered when a user replies to a bot message
 * Handles reply context and continued conversations
 */

module.exports = async function(api, event, commands, userData, threadData, config) {
  const { body, threadID, senderID, messageID, messageReply, type } = event;
  
  // Skip if not a message reply
  if (type !== 'message_reply' && !messageReply) return;
  
  console.log(`↩️ [onReply] Reply from ${senderID} in ${threadID}: "${body?.substring(0, 50) || 'No text'}"`);
  
  try {
    // Initialize reply context if needed
    if (!global.replyContext) {
      global.replyContext = new Map();
    }
    
    // Get the message being replied to
    const repliedToMessageID = messageReply?.messageID;
    const repliedToBody = messageReply?.body;
    
    if (!repliedToMessageID) {
      console.log(`⚠️ [onReply] No message ID found for reply`);
      return;
    }
    
    console.log(`🔗 [onReply] Reply to message: ${repliedToMessageID} ("${repliedToBody?.substring(0, 30) || 'No text'}")`);
    
    // Check if there's a reply context for this message
    const contextKey = `${threadID}_${repliedToMessageID}`;
    const replyContext = global.replyContext.get(contextKey);
    
    if (replyContext) {
      console.log(`📋 [onReply] Found reply context: ${replyContext.type}`);
      
      // Handle different types of reply contexts
      switch (replyContext.type) {
        case 'question':
          await handleQuestionReply(api, event, replyContext);
          break;
          
        case 'confirmation':
          await handleConfirmationReply(api, event, replyContext);
          break;
          
        case 'input_request':
          await handleInputReply(api, event, replyContext);
          break;
          
        case 'poll':
          await handlePollReply(api, event, replyContext);
          break;
          
        default:
          console.log(`❓ [onReply] Unknown reply context type: ${replyContext.type}`);
      }
      
      // Clean up context if it's a one-time reply
      if (replyContext.oneTime) {
        global.replyContext.delete(contextKey);
        console.log(`🗑️ [onReply] Cleaned up one-time context for ${contextKey}`);
      }
      
    } else {
      // No specific context, handle as general reply
      await handleGeneralReply(api, event, commands, userData, threadData, config);
    }
    
  } catch (error) {
    console.error(`💥 [onReply] Error in onReply handler:`, error);
  }
};

// Handle replies to questions
async function handleQuestionReply(api, event, context) {
  const { body, threadID, senderID, messageID } = event;
  
  console.log(`❓ [onReply] Processing question reply: ${context.question}`);
  
  if (context.callback && typeof context.callback === 'function') {
    try {
      await context.callback(api, event, body, context.data);
    } catch (error) {
      console.error(`💥 [onReply] Error in question callback:`, error);
    }
  } else {
    // Default question response
    await api.sendMessage(`📝 Your response: "${body}" has been recorded.`, threadID, messageID);
  }
}

// Handle confirmation replies (yes/no)
async function handleConfirmationReply(api, event, context) {
  const { body, threadID, senderID, messageID } = event;
  const response = body.toLowerCase().trim();
  
  console.log(`✅ [onReply] Processing confirmation: ${response}`);
  
  const isYes = ['yes', 'y', 'confirm', 'ok', 'sure', 'yeah', 'yep', '✅'].includes(response);
  const isNo = ['no', 'n', 'cancel', 'nope', 'nah', '❌'].includes(response);
  
  if (isYes && context.onConfirm) {
    try {
      await context.onConfirm(api, event, context.data);
    } catch (error) {
      console.error(`💥 [onReply] Error in confirmation callback:`, error);
    }
  } else if (isNo && context.onCancel) {
    try {
      await context.onCancel(api, event, context.data);
    } catch (error) {
      console.error(`💥 [onReply] Error in cancellation callback:`, error);
    }
  } else {
    await api.sendMessage(`❓ Please respond with "yes" or "no" to confirm.`, threadID, messageID);
  }
}

// Handle input request replies
async function handleInputReply(api, event, context) {
  const { body, threadID, senderID, messageID } = event;
  
  console.log(`📝 [onReply] Processing input request: ${context.prompt}`);
  
  // Validate input if validator provided
  if (context.validator) {
    const isValid = context.validator(body);
    if (!isValid) {
      await api.sendMessage(`❌ Invalid input. ${context.errorMessage || 'Please try again.'}`, threadID, messageID);
      return;
    }
  }
  
  if (context.callback) {
    try {
      await context.callback(api, event, body, context.data);
    } catch (error) {
      console.error(`💥 [onReply] Error in input callback:`, error);
    }
  }
}

// Handle poll replies
async function handlePollReply(api, event, context) {
  const { body, threadID, senderID, messageID } = event;
  const vote = parseInt(body.trim());
  
  console.log(`📊 [onReply] Processing poll vote: ${vote}`);
  
  if (isNaN(vote) || vote < 1 || vote > context.options.length) {
    await api.sendMessage(`❌ Please vote with a number between 1 and ${context.options.length}`, threadID, messageID);
    return;
  }
  
  // Record vote
  if (!context.votes) context.votes = {};
  context.votes[senderID] = vote;
  
  await api.sendMessage(`✅ Your vote for "${context.options[vote - 1]}" has been recorded!`, threadID, messageID);
}

// Handle general replies (no specific context)
async function handleGeneralReply(api, event, commands, userData, threadData, config) {
  const { body, threadID, senderID, messageID, messageReply } = event;
  
  console.log(`💬 [onReply] General reply processing`);
  
  // You can add general reply logic here
  // For example, AI chat responses, context-aware conversations, etc.
  
  // Check if this is a reply to a bot message
  const botUID = api.getCurrentUserID();
  if (messageReply?.senderID === botUID) {
    console.log(`🤖 [onReply] Reply to bot message detected`);
    
    // Add general bot reply logic here
    // For example: AI chat, help system, etc.
  }
}

// Utility function to create reply context
function createReplyContext(messageID, threadID, type, data = {}, options = {}) {
  const contextKey = `${threadID}_${messageID}`;
  const context = {
    type,
    data,
    createdAt: Date.now(),
    oneTime: options.oneTime !== false, // Default to one-time
    ...options
  };
  
  if (!global.replyContext) {
    global.replyContext = new Map();
  }
  
  global.replyContext.set(contextKey, context);
  console.log(`📝 [onReply] Created reply context: ${type} for ${contextKey}`);
  
  return contextKey;
}

// Export utility function for other modules to use
module.exports.createReplyContext = createReplyContext;
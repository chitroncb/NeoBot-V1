export default {
  name: "ban",
  description: "Ban a user from using the bot",
  usage: "/ban <user> [reason]",
  cooldown: 0,
  role: 2,
  category: "moderation",
  
  execute: async (api, event, args, commands, userData, threadData, config) => {
    const { threadID, messageID, senderID } = event;
    
    if (args.length === 0 && (!event.mentions || Object.keys(event.mentions).length === 0)) {
      return api.sendMessage("❌ Please mention a user to ban. Usage: /ban <user> [reason]", threadID, messageID);
    }
    
    let targetUserId;
    let reason = "No reason provided";
    
    // Get target user from mentions
    if (event.mentions && Object.keys(event.mentions).length > 0) {
      targetUserId = Object.keys(event.mentions)[0];
      // Get reason from remaining args after removing mention
      const mentionName = Object.values(event.mentions)[0];
      const fullMessage = args.join(' ');
      reason = fullMessage.replace(mentionName, '').trim() || reason;
    } else {
      // Try to get user ID from args
      targetUserId = args[0];
      reason = args.slice(1).join(' ') || reason;
    }
    
    // Prevent self-ban
    if (targetUserId === senderID) {
      return api.sendMessage("❌ You cannot ban yourself.", threadID, messageID);
    }
    
    // Prevent banning admin
    if (targetUserId === config.adminUid) {
      return api.sendMessage("❌ You cannot ban the bot admin.", threadID, messageID);
    }
    
    // Initialize user if not exists
    if (!userData.users[targetUserId]) {
      userData.users[targetUserId] = {
        name: 'Unknown User',
        xp: 0,
        level: 1,
        avatar: '',
        birthday: '',
        relationship: '',
        verified: false,
        banned: false,
        language: 'en',
        joinDate: new Date().toISOString()
      };
    }
    
    // Check if already banned
    if (userData.users[targetUserId].banned) {
      return api.sendMessage("❌ User is already banned.", threadID, messageID);
    }
    
    // Ban the user
    userData.users[targetUserId].banned = true;
    userData.users[targetUserId].banReason = reason;
    userData.users[targetUserId].bannedBy = senderID;
    userData.users[targetUserId].banDate = new Date().toISOString();
    
    // Add to security blacklist
    if (global.securityManager) {
      global.securityManager.blacklistUser(targetUserId, reason);
    }
    
    let message = `🔨 **User Banned**\n\n`;
    message += `👤 **User:** ${userData.users[targetUserId].name}\n`;
    message += `📋 **Reason:** ${reason}\n`;
    message += `👮 **Banned By:** Admin\n`;
    message += `⏰ **Date:** ${new Date().toLocaleString()}`;
    
    return api.sendMessage(message, threadID, messageID);
  }
};

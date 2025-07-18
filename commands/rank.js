import { getUserRank } from '../bot/xp-system.js';

export default {
  name: "rank",
  description: "Check your rank and XP",
  usage: "/rank [user]",
  cooldown: 5,
  role: 0,
  category: "general",
  
  execute: async (api, event, args, commands, userData, threadData, config) => {
    const { threadID, messageID, senderID } = event;
    
    let targetUserId = senderID;
    
    // If mentions exist, get first mentioned user
    if (event.mentions && Object.keys(event.mentions).length > 0) {
      targetUserId = Object.keys(event.mentions)[0];
    }
    
    // Check if user exists in data
    if (!userData.users[targetUserId]) {
      return api.sendMessage("❌ User not found in database.", threadID, messageID);
    }
    
    const user = userData.users[targetUserId];
    const rank = getUserRank(userData, targetUserId);
    
    // Calculate XP needed for next level
    const currentLevel = user.level;
    const xpForNextLevel = (currentLevel * 100) - user.xp;
    
    let message = `📊 **Rank Information**\n\n`;
    message += `👤 **User:** ${user.name || 'Unknown'}\n`;
    message += `🏆 **Rank:** #${rank}\n`;
    message += `⭐ **Level:** ${user.level}\n`;
    message += `💎 **XP:** ${user.xp}\n`;
    message += `🎯 **XP to Next Level:** ${xpForNextLevel}\n`;
    
    if (user.verified) {
      message += `✅ **Verified User**\n`;
    }
    
    if (user.birthday) {
      message += `🎂 **Birthday:** ${user.birthday}\n`;
    }
    
    if (user.relationship) {
      message += `💕 **Relationship:** ${user.relationship}\n`;
    }
    
    message += `📅 **Join Date:** ${new Date(user.joinDate).toLocaleDateString()}`;
    
    return api.sendMessage(message, threadID, messageID);
  }
};

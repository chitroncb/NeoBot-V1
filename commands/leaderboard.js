const { getLeaderboard } = require('../bot/xp-system.js');

module.exports = {
  name: "leaderboard",
  description: "Show the XP leaderboard",
  usage: "/leaderboard [limit]",
  cooldown: 10,
  role: 0,
  category: "general",
  
  execute: async (api, event, args, commands, userData, threadData, config) => {
    const { threadID, messageID } = event;
    
    const limit = parseInt(args[0]) || 10;
    
    if (limit < 1 || limit > 20) {
      return api.sendMessage("❌ Limit must be between 1 and 20.", threadID, messageID);
    }
    
    const leaderboard = getLeaderboard(userData, limit);
    
    if (leaderboard.length === 0) {
      return api.sendMessage("📊 No users found in the leaderboard.", threadID, messageID);
    }
    
    let message = `🏆 **XP Leaderboard** (Top ${limit})\n\n`;
    
    leaderboard.forEach((user, index) => {
      const rank = index + 1;
      const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "🏅";
      
      message += `${medal} **#${rank}** - ${user.name || 'Unknown'}\n`;
      message += `   ⭐ Level ${user.level} | 💎 ${user.xp} XP\n`;
      
      if (user.verified) {
        message += `   ✅ Verified\n`;
      }
      
      message += `\n`;
    });
    
    message += `📈 Keep chatting to earn more XP and climb the ranks!`;
    
    return api.sendMessage(message, threadID, messageID);
  }
};

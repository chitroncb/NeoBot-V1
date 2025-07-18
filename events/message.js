module.exports = {
  name: "message",
  description: "Handle incoming messages",
  
  execute: async (api, event, commands, userData, threadData, config) => {
    const { body, threadID, senderID, messageID } = event;
    
    // Skip if no message body
    if (!body) return;
    
    // XP System
    if (userData[senderID]) {
      const user = userData[senderID];
      const xpGain = Math.floor(Math.random() * 5) + 1;
      user.xp += xpGain;
      
      // Check for level up
      const newLevel = Math.floor(user.xp / 100) + 1;
      if (newLevel > user.level) {
        user.level = newLevel;
        api.sendMessage(`🎉 Congratulations! You've reached level ${newLevel}!`, threadID, messageID);
      }
    }
    
    // Check if message starts with prefix
    const prefix = config.prefix || "/";
    if (!body.startsWith(prefix)) return;
    
    const args = body.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    
    const command = commands.get(commandName);
    if (!command) return;
    
    // Check permissions
    if (command.role > 0) {
      const isAdmin = config.adminUid === senderID;
      const threadInfo = await api.getThreadInfo(threadID);
      const isGroupAdmin = threadInfo.adminIDs.some(admin => admin.id === senderID);
      
      if (command.role === 2 && !isAdmin) {
        return api.sendMessage("❌ This command requires bot admin permissions.", threadID, messageID);
      }
      
      if (command.role === 3 && !isGroupAdmin && !isAdmin) {
        return api.sendMessage("❌ This command requires group admin permissions.", threadID, messageID);
      }
    }
    
    // Check cooldown
    const cooldownKey = `${commandName}_${senderID}`;
    const now = Date.now();
    const cooldownTime = (command.cooldown || 0) * 1000;
    
    if (global.cooldowns && global.cooldowns[cooldownKey]) {
      const expirationTime = global.cooldowns[cooldownKey] + cooldownTime;
      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000;
        return api.sendMessage(`⏱️ Please wait ${timeLeft.toFixed(1)} seconds before using this command again.`, threadID, messageID);
      }
    }
    
    // Set cooldown
    if (!global.cooldowns) global.cooldowns = {};
    global.cooldowns[cooldownKey] = now;
    
    // Execute command
    try {
      await command.execute(api, event, args, commands, userData, threadData, config);
      
      // Log command usage
      if (config.enableLogging) {
        console.log(`[${new Date().toISOString()}] Command "${commandName}" used by ${senderID} in thread ${threadID}`);
      }
      
    } catch (error) {
      console.error(`Error executing command ${commandName}:`, error);
      api.sendMessage("❌ An error occurred while executing this command.", threadID, messageID);
    }
  }
};

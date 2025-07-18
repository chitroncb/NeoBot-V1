/**
 * onChat Event Handler
 * Triggered when a user sends a message
 * Handles command parsing and execution
 */

module.exports = async function(api, event, commands, userData, threadData, config) {
  const { body, threadID, senderID, messageID, type } = event;
  
  // Skip if not a message or no body
  if (type !== 'message' || !body) return;
  
  console.log(`💬 [onChat] Message from ${senderID} in ${threadID}: "${body.substring(0, 50)}${body.length > 50 ? '...' : ''}"`);
  
  try {
    // Initialize user data if first time
    if (!userData.users) userData.users = {};
    if (!userData.users[senderID]) {
      userData.users[senderID] = {
        uid: senderID,
        name: '',
        xp: 0,
        level: 1,
        joinDate: Date.now(),
        lastActive: Date.now(),
        messageCount: 0
      };
      console.log(`👤 [onChat] New user registered: ${senderID}`);
    }
    
    // Update user activity
    const user = userData.users[senderID];
    user.lastActive = Date.now();
    user.messageCount = (user.messageCount || 0) + 1;
    
    // XP System - award XP for messages
    if (config.features?.xpSystem !== false) {
      const xpGain = Math.floor(Math.random() * 5) + 1;
      user.xp += xpGain;
      
      // Check for level up
      const newLevel = Math.floor(user.xp / 100) + 1;
      if (newLevel > user.level) {
        user.level = newLevel;
        await api.sendMessage(`🎉 Congratulations! ${user.name || 'User'} reached level ${newLevel}!`, threadID, messageID);
        console.log(`🆙 [onChat] User ${senderID} leveled up to ${newLevel}`);
      }
    }
    
    // Check if message starts with prefix (command)
    const prefix = config.prefix || '!';
    if (!body.startsWith(prefix)) return;
    
    console.log(`⚡ [onChat] Command detected with prefix: ${prefix}`);
    
    // Parse command
    const args = body.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    
    const command = commands.get(commandName);
    if (!command) {
      console.log(`❌ [onChat] Unknown command: ${commandName}`);
      return;
    }
    
    console.log(`🔍 [onChat] Executing command: ${commandName}`);
    
    // Check permissions
    if (command.role > 0) {
      const isAdmin = config.adminUid === senderID;
      let isGroupAdmin = false;
      
      try {
        const threadInfo = await api.getThreadInfo(threadID);
        isGroupAdmin = threadInfo.adminIDs?.some(admin => admin.id === senderID) || false;
      } catch (error) {
        console.warn(`⚠️ [onChat] Could not check admin status: ${error.message}`);
      }
      
      if (command.role === 2 && !isAdmin) {
        await api.sendMessage("❌ This command requires bot admin permissions.", threadID, messageID);
        console.log(`🚫 [onChat] Permission denied - bot admin required for ${commandName}`);
        return;
      }
      
      if (command.role === 3 && !isGroupAdmin && !isAdmin) {
        await api.sendMessage("❌ This command requires group admin permissions.", threadID, messageID);
        console.log(`🚫 [onChat] Permission denied - group admin required for ${commandName}`);
        return;
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
        await api.sendMessage(`⏱️ Please wait ${timeLeft.toFixed(1)} seconds before using this command again.`, threadID, messageID);
        console.log(`⏰ [onChat] Cooldown active for ${commandName} (${timeLeft.toFixed(1)}s remaining)`);
        return;
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
        console.log(`✅ [onChat] Command "${commandName}" executed successfully by ${senderID}`);
      }
      
    } catch (error) {
      console.error(`💥 [onChat] Error executing command ${commandName}:`, error);
      await api.sendMessage("❌ An error occurred while executing this command.", threadID, messageID);
    }
    
  } catch (error) {
    console.error(`💥 [onChat] Error in onChat handler:`, error);
  }
};
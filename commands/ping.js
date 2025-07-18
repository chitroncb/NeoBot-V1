module.exports = {
  name: 'ping',
  description: 'Test bot response time',
  role: 0, // Available to all users
  cooldown: 5, // 5 second cooldown
  
  execute: async (api, event, args, commands, config) => {
    const startTime = Date.now();
    
    try {
      console.log('🏓 Ping command executed');
      
      // Send response
      await api.sendMessage('🏓 Pong! Bot is online and responding.', event.threadID);
      
      const responseTime = Date.now() - startTime;
      console.log(`✅ Ping response sent in ${responseTime}ms`);
      
      // Send response time
      setTimeout(async () => {
        await api.sendMessage(`⚡ Response time: ${responseTime}ms`, event.threadID);
      }, 1000);
      
    } catch (error) {
      console.error('❌ Ping command failed:', error);
      throw error;
    }
  }
};
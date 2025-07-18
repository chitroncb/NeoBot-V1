export default {
  name: 'groupadmin',
  description: 'Group admin test command',
  role: 3, // Group admin only
  cooldown: 5,
  
  execute: async (api, event, args, commands, config) => {
    try {
      console.log('👑 Group admin command executed');
      
      const message = `👑 Group Admin Panel\n\n` +
        `📝 Thread ID: ${event.threadID}\n` +
        `👤 Your UID: ${event.senderID}\n` +
        `⚙️ You have group admin privileges\n\n` +
        `✅ Group admin access confirmed`;
      
      await api.sendMessage(message, event.threadID);
      console.log('✅ Group admin command response sent');
      
    } catch (error) {
      console.error('❌ Group admin command failed:', error);
      throw error;
    }
  }
};
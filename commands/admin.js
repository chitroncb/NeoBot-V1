export default {
  name: 'admin',
  description: 'Admin-only test command',
  role: 2, // Bot admin only
  cooldown: 5,
  
  execute: async (api, event, args, commands, config) => {
    try {
      console.log('🔐 Admin command executed');
      
      const adminMessage = `🔐 Admin Panel - NeoBot\n\n` +
        `👤 Your UID: ${event.senderID}\n` +
        `📝 Thread ID: ${event.threadID}\n` +
        `⚙️ Bot Version: ${config.version || '1.0.0'}\n` +
        `📊 Commands Loaded: ${commands.size}\n` +
        `🔧 Prefix: ${config.prefix || '!'}\n\n` +
        `✅ Admin access confirmed`;
      
      await api.sendMessage(adminMessage, event.threadID);
      console.log('✅ Admin command response sent');
      
    } catch (error) {
      console.error('❌ Admin command failed:', error);
      throw error;
    }
  }
};
/**
 * onStart Event Handler
 * Triggered when the bot starts up
 */

module.exports = function(api, event, commands, userData, threadData, config) {
  console.log('🚀 NeoBot is now running');
  console.log(`📊 Bot Status:`);
  console.log(`   👤 Bot UID: ${api.getCurrentUserID()}`);
  console.log(`   📝 Commands loaded: ${commands.size}`);
  console.log(`   👥 Users in database: ${Object.keys(userData.users || {}).length}`);
  console.log(`   💬 Threads tracked: ${Object.keys(threadData.threads || {}).length}`);
  console.log(`   🔧 Prefix: ${config.prefix || '!'}`);
  console.log(`   🎯 Bot Name: ${config.botName || 'NeoBot'}`);
  console.log('✅ All systems operational');
  
  // Initialize global variables if needed
  if (!global.cooldowns) {
    global.cooldowns = {};
    console.log('🕒 Cooldown system initialized');
  }
  
  if (!global.replyContext) {
    global.replyContext = new Map();
    console.log('💬 Reply context system initialized');
  }
  
  if (!global.firstTimeUsers) {
    global.firstTimeUsers = new Set();
    console.log('👋 First-time user tracking initialized');
  }
};
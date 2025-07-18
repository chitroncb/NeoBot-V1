module.exports = {
  name: "language",
  description: "Change your language preference",
  usage: "/language <en|bn|vi>",
  cooldown: 5,
  role: 0,
  category: "general",
  
  execute: async (api, event, args, commands, userData, threadData, config) => {
    const { threadID, messageID, senderID } = event;
    
    const supportedLanguages = {
      'en': 'English',
      'bn': 'বাংলা (Bangla)',
      'vi': 'Tiếng Việt (Vietnamese)'
    };
    
    if (args.length === 0) {
      let message = `🌐 **Language Settings**\n\n`;
      message += `**Current Language:** ${supportedLanguages[userData.users[senderID]?.language || 'en']}\n\n`;
      message += `**Available Languages:**\n`;
      Object.entries(supportedLanguages).forEach(([code, name]) => {
        message += `• \`${code}\` - ${name}\n`;
      });
      message += `\n**Usage:** /language <language_code>`;
      
      return api.sendMessage(message, threadID, messageID);
    }
    
    const newLanguage = args[0].toLowerCase();
    
    if (!supportedLanguages[newLanguage]) {
      return api.sendMessage("❌ Unsupported language. Use: en, bn, or vi", threadID, messageID);
    }
    
    // Initialize user if not exists
    if (!userData.users[senderID]) {
      userData.users[senderID] = {
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
    
    // Update language
    userData.users[senderID].language = newLanguage;
    
    const responses = {
      'en': `✅ **Language Changed**\n\nYour language has been set to English.`,
      'bn': `✅ **ভাষা পরিবর্তিত হয়েছে**\n\nআপনার ভাষা বাংলায় সেট করা হয়েছে।`,
      'vi': `✅ **Đã Thay Đổi Ngôn Ngữ**\n\nNgôn ngữ của bạn đã được đặt thành Tiếng Việt.`
    };
    
    return api.sendMessage(responses[newLanguage], threadID, messageID);
  }
};

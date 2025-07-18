const axios = require('axios');

module.exports = {
  name: "ai",
  description: "Chat with AI assistant",
  usage: "/ai <message>",
  cooldown: 15,
  role: 0,
  category: "utility",
  
  execute: async (api, event, args) => {
    const { threadID, messageID, senderID } = event;
    
    if (args.length === 0) {
      return api.sendMessage("❌ Please provide a message. Usage: /ai <message>", threadID, messageID);
    }
    
    const message = args.join(' ');
    const API_KEY = process.env.OPENAI_API_KEY || process.env.GPT_API_KEY || "your_api_key";
    
    if (API_KEY === "your_api_key") {
      return api.sendMessage("❌ OpenAI API key not configured. Please contact the bot admin.", threadID, messageID);
    }
    
    try {
      // Send typing indicator
      api.sendTypingIndicator(threadID);
      
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are NeoBot, a helpful assistant created by Saifullah Al Neoaz. Keep responses concise and friendly."
          },
          {
            role: "user",
            content: message
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      }, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      const aiResponse = response.data.choices[0].message.content;
      
      return api.sendMessage(`🤖 **NeoBot AI:**\n\n${aiResponse}`, threadID, messageID);
      
    } catch (error) {
      console.error('OpenAI API error:', error.message);
      
      if (error.response?.status === 401) {
        return api.sendMessage("❌ Invalid API key. Please contact the bot admin.", threadID, messageID);
      }
      
      if (error.response?.status === 429) {
        return api.sendMessage("❌ Too many requests. Please try again later.", threadID, messageID);
      }
      
      return api.sendMessage("❌ Failed to get AI response. Please try again later.", threadID, messageID);
    }
  }
};

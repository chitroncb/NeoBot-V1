const axios = require('axios');

module.exports = {
  name: "joke",
  description: "Get a random joke",
  usage: "/joke",
  cooldown: 5,
  role: 0,
  category: "fun",
  
  execute: async (api, event, args) => {
    const { threadID, messageID } = event;
    
    try {
      const response = await axios.get('https://official-joke-api.appspot.com/random_joke');
      const joke = response.data;
      
      const message = `😄 **Random Joke:**\n\n${joke.setup}\n\n${joke.punchline}`;
      
      return api.sendMessage(message, threadID, messageID);
      
    } catch (error) {
      console.error('Joke API error:', error.message);
      
      // Fallback jokes
      const fallbackJokes = [
        {
          setup: "Why don't scientists trust atoms?",
          punchline: "Because they make up everything!"
        },
        {
          setup: "What do you call a fake noodle?",
          punchline: "An impasta!"
        },
        {
          setup: "Why did the scarecrow win an award?",
          punchline: "He was outstanding in his field!"
        },
        {
          setup: "What do you call a bear with no teeth?",
          punchline: "A gummy bear!"
        },
        {
          setup: "Why don't eggs tell jokes?",
          punchline: "They'd crack each other up!"
        }
      ];
      
      const randomJoke = fallbackJokes[Math.floor(Math.random() * fallbackJokes.length)];
      const message = `😄 **Random Joke:**\n\n${randomJoke.setup}\n\n${randomJoke.punchline}`;
      
      return api.sendMessage(message, threadID, messageID);
    }
  }
};

const axios = require('axios');

module.exports = {
  name: "weather",
  description: "Get weather information for a location",
  usage: "/weather <location>",
  cooldown: 10,
  role: 0,
  category: "utility",
  
  execute: async (api, event, args) => {
    const { threadID, messageID } = event;
    
    if (args.length === 0) {
      return api.sendMessage("❌ Please provide a location. Usage: /weather <location>", threadID, messageID);
    }
    
    const location = args.join(' ');
    const API_KEY = process.env.WEATHER_API_KEY || process.env.OPENWEATHER_API_KEY || "your_api_key";
    
    if (API_KEY === "your_api_key") {
      return api.sendMessage("❌ Weather API key not configured. Please contact the bot admin.", threadID, messageID);
    }
    
    try {
      const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
        params: {
          q: location,
          appid: API_KEY,
          units: 'metric'
        }
      });
      
      const weather = response.data;
      
      let message = `🌤️ **Weather for ${weather.name}, ${weather.sys.country}:**\n\n`;
      message += `**Temperature:** ${weather.main.temp}°C (feels like ${weather.main.feels_like}°C)\n`;
      message += `**Description:** ${weather.weather[0].description}\n`;
      message += `**Humidity:** ${weather.main.humidity}%\n`;
      message += `**Wind Speed:** ${weather.wind.speed} m/s\n`;
      message += `**Pressure:** ${weather.main.pressure} hPa\n`;
      message += `**Visibility:** ${weather.visibility / 1000} km`;
      
      return api.sendMessage(message, threadID, messageID);
      
    } catch (error) {
      console.error('Weather API error:', error.message);
      
      if (error.response?.status === 404) {
        return api.sendMessage(`❌ Location "${location}" not found. Please check the spelling and try again.`, threadID, messageID);
      }
      
      return api.sendMessage("❌ Failed to fetch weather data. Please try again later.", threadID, messageID);
    }
  }
};

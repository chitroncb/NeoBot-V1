# 🤖 NeoBot - Advanced Messenger Bot Framework

[![Made with Node.js](https://img.shields.io/badge/Made%20with-Node.js-green.svg)](https://nodejs.org/)
[![License: Educational](https://img.shields.io/badge/License-Educational-blue.svg)](#license)
[![Created by Saifullah Al Neoaz](https://img.shields.io/badge/Created%20by-Saifullah%20Al%20Neoaz-purple.svg)](#author)

> A powerful, modular Messenger chatbot framework with advanced features, web dashboard, and multi-language support.

## ⚠️ Important Disclaimer

**This bot uses the unofficial Facebook API (priyanshu-fca) and is intended for educational purposes only.**

- This is NOT an official Facebook product
- The unofficial API may be unstable and could break at any time
- Use at your own risk
- Facebook may restrict accounts that use unofficial APIs
- This project is for learning and personal use only

## 🌟 Features

### 🎯 Core Features
- **Modular Architecture**: Easy to extend with new commands and events
- **Role-based Permissions**: Admin, group admin, and user levels
- **XP & Ranking System**: Gamification with levels and leaderboards
- **Multi-language Support**: English, Bangla, Vietnamese
- **Web Dashboard**: Beautiful React-based control panel
- **Real-time Statistics**: Monitor bot performance and usage

### 🛡️ Security Features
- **User Blacklisting**: Ban problematic users
- **Thread Management**: Control which groups can use the bot
- **Rate Limiting**: Prevent command spam
- **Command Logging**: Track all bot interactions
- **Auto Moderation**: Built-in spam protection

### 🎮 Built-in Commands
- `/help` - Show available commands
- `/weather <location>` - Get weather information
- `/joke` - Random jokes
- `/ai <message>` - AI chat assistant
- `/rank [user]` - Check XP and rank
- `/leaderboard` - Top users by XP
- `/language <code>` - Change language
- `/ban <user>` - Ban users (admin only)

### 🌐 Dashboard Features
- **Real-time Analytics**: User activity, command usage, uptime
- **Thread Management**: Control active conversations
- **Command Administration**: Enable/disable commands
- **User Management**: View profiles, XP, and bans
- **Security Monitoring**: Track security events
- **Settings Panel**: Configure bot behavior

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- Facebook account with valid cookies
- API keys for external services (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd neobot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure the bot**
   
   Edit `config.json`:
   ```json
   {
     "botName": "NeoBot",
     "prefix": "/",
     "adminUid": "YOUR_FACEBOOK_UID",
     "language": "en",
     "apiKeys": {
       "weather": "YOUR_WEATHER_API_KEY",
       "openai": "YOUR_OPENAI_API_KEY"
     }
   }
   ```

4. **Set up Facebook authentication**
   
   Create `account.json` with your Facebook cookies:
   ```json
   {
     "uid": "YOUR_FACEBOOK_UID",
     "cookies": [
       {
         "key": "datr",
         "value": "your_datr_value",
         "domain": ".facebook.com",
         "path": "/",
         "secure": true,
         "httpOnly": true
       }
     ]
   }
   
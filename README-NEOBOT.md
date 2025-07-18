# NeoBot - Complete Facebook Messenger Chatbot

**By Saifullah Al Neoaz - Educational Use Only**

A fully functional Facebook Messenger chatbot built with Node.js and the unofficial API library `priyanshu-fca`, inspired by GoatBot V2.

## 🚀 Features

- ✅ **CommonJS Compatibility**: Uses `require()` and `module.exports`
- ✅ **Cookie Authentication**: Secure login using Facebook cookies
- ✅ **Role-Based Access**: Admin, Group Admin, and User permissions
- ✅ **Command System**: Modular command loading from `commands/` folder
- ✅ **Comprehensive Debugging**: Detailed logs for every operation
- ✅ **Message Listener**: Using `listenMqtt` for real-time message handling
- ✅ **Cooldown System**: Prevents command spam
- ✅ **Error Handling**: Graceful fallbacks and user-friendly error messages

## 📁 Project Structure

```
├── neobot.cjs          # Main bot file (CommonJS)
├── login.cjs           # Standalone login system
├── index.js            # ES module version
├── config.json         # Bot configuration
├── account.json        # Facebook cookies (create manually)
├── commands/           # Command modules
│   ├── ping.js         # Test command
│   ├── help.js         # Command list
│   ├── admin.js        # Admin-only command
│   └── groupadmin.js   # Group admin command
└── README-NEOBOT.md    # This file
```

## 🔧 Setup Instructions

### 1. Install Dependencies
```bash
npm install priyanshu-fca
```

### 2. Create Account File
Create `account.json` with your Facebook cookies:
```json
{
  "uid": "your_facebook_uid",
  "cookies": [
    {
      "name": "c_user",
      "value": "your_uid",
      "domain": ".facebook.com",
      "path": "/",
      "secure": true,
      "httpOnly": false
    },
    {
      "name": "xs",
      "value": "your_xs_value",
      "domain": ".facebook.com",
      "path": "/",
      "secure": true,
      "httpOnly": true
    }
    // ... more cookies
  ]
}
```

### 3. Configure Bot
Edit `config.json`:
```json
{
  "prefix": "!",
  "adminUid": "your_admin_uid",
  "enableLogging": true,
  "name": "NeoBot",
  "version": "1.0.0"
}
```

### 4. Run the Bot
```bash
# Test login only
node login.cjs

# Run full bot
node neobot.cjs
```

## 🎯 Commands

### Built-in Commands
- `!ping` - Test bot response (built-in, no cooldown)

### Loaded Commands
- `!help` - Show all available commands
- `!admin` - Admin panel (admin only)
- `!groupadmin` - Group admin panel (group admin only)

## 🔐 Role System

- **Role 0**: All users (default)
- **Role 2**: Bot admins (configured in config.json)
- **Role 3**: Group admins (Facebook group administrators)

## 📊 Debug Output

The bot provides comprehensive logging:

```
🤖 NeoBot by Saifullah Al Neoaz
⚠️  Using unofficial Facebook API - Educational use only
📋 CommonJS version for maximum compatibility
⚙️  Configuration loaded successfully
📱 Loading Facebook account...
👤 Target UID: 61576186415592
🍪 Loading 14 cookies...
🔐 Authenticating with Facebook...
✅ Bot logged in as 61576186415592
🔗 Facebook connection established
✅ UID verification successful
📦 Loading commands...
📝 Created ping.js command
📝 Created help.js command
📊 Loaded 2 commands total
👂 Setting up message listener...
📡 Using listenMqtt method
🚀 NeoBot is now online and ready!
📊 Status: 2 commands loaded
🔧 Prefix: !
📩 Message received: { type: 'message', threadID: '...', senderID: '...', body: '!ping' }
🔍 Command detected: "ping" with args: []
🏓 Built-in ping command detected
✅ Pong sent successfully
```

## 🛠️ Key Features Implemented

### 1. Authentication System
- Reads cookies from `account.json`
- Validates UID and cookies array
- Uses `appState` for login
- Prints confirmation: "✅ Bot logged in as [UID]"

### 2. Message Listener
- Uses `listenMqtt` method (falls back to `listen`)
- Logs every incoming event
- Handles different event types (message, presence, etc.)
- Skips events without body content

### 3. Command System
- Auto-loads commands from `commands/` folder
- Each command exports: `name`, `description`, `role`, `cooldown`, `execute()`
- Commands stored in Map for fast lookup
- Built-in ping command for immediate testing

### 4. Role-Based Access
- `roleCheck()` function determines user permissions
- Admin check: compares with `config.adminUid`
- Group admin check: uses `api.getThreadInfo()`
- Proper error handling for permission checks

### 5. Comprehensive Debugging
- Login success/failure logs
- Command detection and matching
- Role check results
- Message sent confirmations
- Error handling with helpful messages

### 6. Error Handling
- Graceful handling of missing message body
- Unknown command logging
- Permission denied messages
- Command execution error recovery

## 🔧 Command Development

Create new commands in the `commands/` folder:

```javascript
module.exports = {
  name: 'example',
  description: 'Example command',
  role: 0, // 0 = all users, 2 = admin, 3 = group admin
  cooldown: 5, // seconds
  
  execute: async (api, event, args, commands, config) => {
    try {
      console.log('Example command executed');
      await api.sendMessage('Hello from example command!', event.threadID);
      console.log('✅ Example command response sent');
    } catch (error) {
      console.error('❌ Example command failed:', error);
      throw error;
    }
  }
};
```

## ⚠️ Important Notes

1. **Educational Use Only**: This bot uses unofficial Facebook API
2. **Cookie Security**: Keep your `account.json` file secure and private
3. **Terms of Service**: Respect Facebook's terms of service
4. **Rate Limiting**: Built-in cooldown system prevents spam
5. **Error Recovery**: Bot handles errors gracefully and continues running

## 📈 Performance

- **Login Time**: ~2-3 seconds
- **Command Response**: <100ms for simple commands
- **Memory Usage**: ~50-100MB
- **Event Handling**: Real-time message processing
- **Reliability**: Automatic error recovery and logging

## 🐛 Troubleshooting

### Login Issues
- Check if `account.json` exists and is valid
- Ensure cookies are fresh (login to Facebook first)
- Verify UID matches c_user cookie value

### Command Issues
- Check if command files are in `commands/` folder
- Ensure commands export required properties
- Verify file syntax and module format

### Permission Issues
- Check `config.json` adminUid setting
- Verify group admin status in Facebook
- Check role values in command files

## 🎉 Success Indicators

When working correctly, you should see:
- `✅ Bot logged in as [UID]`
- `🚀 NeoBot is now online and ready!`
- `📩 Message received:` for incoming events
- `✅ [Command] response sent` for executed commands

The bot is now fully functional and ready to handle Facebook Messenger conversations!
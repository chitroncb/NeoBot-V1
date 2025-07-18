export default {
  name: 'help',
  description: 'Show available commands',
  role: 0, // Available to all users
  cooldown: 10, // 10 second cooldown
  
  execute: async (api, event, args, commands, config) => {
    try {
      console.log('📚 Help command executed');
      
      let helpMessage = `🤖 ${config.name || 'NeoBot'} Commands:\n\n`;
      
      // Group commands by role
      const commandsByRole = {
        0: [],
        2: [],
        3: []
      };
      
      commands.forEach(command => {
        const role = command.role || 0;
        if (commandsByRole[role]) {
          commandsByRole[role].push(command);
        }
      });
      
      // Add public commands
      if (commandsByRole[0].length > 0) {
        helpMessage += '👥 Public Commands:\n';
        commandsByRole[0].forEach(cmd => {
          helpMessage += `${config.prefix || '!'}${cmd.name} - ${cmd.description}\n`;
        });
        helpMessage += '\n';
      }
      
      // Add admin commands
      if (commandsByRole[2].length > 0) {
        helpMessage += '🔐 Admin Commands:\n';
        commandsByRole[2].forEach(cmd => {
          helpMessage += `${config.prefix || '!'}${cmd.name} - ${cmd.description}\n`;
        });
        helpMessage += '\n';
      }
      
      // Add group admin commands
      if (commandsByRole[3].length > 0) {
        helpMessage += '👑 Group Admin Commands:\n';
        commandsByRole[3].forEach(cmd => {
          helpMessage += `${config.prefix || '!'}${cmd.name} - ${cmd.description}\n`;
        });
        helpMessage += '\n';
      }
      
      helpMessage += `📊 Total: ${commands.size} commands available\n`;
      helpMessage += `🔧 Prefix: ${config.prefix || '!'}\n`;
      helpMessage += `📚 For more info: ${config.prefix || '!'}help [command]`;
      
      await api.sendMessage(helpMessage, event.threadID);
      console.log('✅ Help message sent successfully');
      
    } catch (error) {
      console.error('❌ Help command failed:', error);
      throw error;
    }
  }
};
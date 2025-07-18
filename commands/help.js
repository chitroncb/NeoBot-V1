module.exports = {
  name: "help",
  description: "Show available commands or get help for a specific command",
  usage: "/help [command]",
  cooldown: 5,
  role: 0,
  category: "general",
  
  execute: async (api, event, args, commands) => {
    const { threadID, messageID } = event;
    
    if (args.length === 0) {
      // Show all commands
      const commandList = Array.from(commands.values())
        .filter(cmd => !cmd.hidden)
        .sort((a, b) => a.name.localeCompare(b.name));
      
      let message = "📚 **Available Commands:**\n\n";
      
      const categories = {};
      commandList.forEach(cmd => {
        const category = cmd.category || 'general';
        if (!categories[category]) categories[category] = [];
        categories[category].push(cmd);
      });
      
      Object.keys(categories).forEach(category => {
        message += `**${category.toUpperCase()}:**\n`;
        categories[category].forEach(cmd => {
          message += `• /${cmd.name} - ${cmd.description}\n`;
        });
        message += "\n";
      });
      
      message += "Use `/help <command>` for detailed information about a specific command.";
      
      return api.sendMessage(message, threadID, messageID);
    }
    
    // Show specific command help
    const commandName = args[0].toLowerCase();
    const command = commands.get(commandName);
    
    if (!command) {
      return api.sendMessage(`❌ Command "${commandName}" not found.`, threadID, messageID);
    }
    
    let message = `📖 **Help for /${command.name}:**\n\n`;
    message += `**Description:** ${command.description}\n`;
    message += `**Usage:** ${command.usage}\n`;
    message += `**Category:** ${command.category || 'general'}\n`;
    message += `**Cooldown:** ${command.cooldown}s\n`;
    message += `**Role Required:** ${command.role === 0 ? 'All Users' : command.role === 2 ? 'Bot Admin' : 'Group Admin'}`;
    
    return api.sendMessage(message, threadID, messageID);
  }
};

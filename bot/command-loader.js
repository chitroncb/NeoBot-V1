const fs = require('fs');
const path = require('path');

function loadCommands() {
  const commands = new Map();
  const commandsPath = path.join(__dirname, '../commands');
  
  if (!fs.existsSync(commandsPath)) {
    console.warn('⚠️  Commands directory not found');
    return commands;
  }
  
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  
  for (const file of commandFiles) {
    try {
      const filePath = path.join(commandsPath, file);
      
      // Clear require cache to allow reloading
      delete require.cache[require.resolve(filePath)];
      
      const command = require(filePath);
      
      if (command.name && command.execute) {
        commands.set(command.name, command);
        console.log(`✅ Loaded command: ${command.name}`);
      } else {
        console.warn(`⚠️  Command ${file} missing required properties`);
      }
    } catch (error) {
      console.error(`❌ Failed to load command ${file}:`, error.message);
    }
  }
  
  console.log(`📊 Total commands loaded: ${commands.size}`);
  return commands;
}

module.exports = { loadCommands };
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function loadCommands() {
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
      const module = await import(filePath);
      
      const command = module.default;
      
      if (command && command.name && command.execute) {
        commands.set(command.name, command);
        console.log(`✅ Loaded command: ${command.name}`);
      } else {
        console.warn(`⚠️  Command ${file} missing required properties`);
      }
    } catch (error) {
      console.error(`❌ Failed to load command ${file}:`, error.message);
    }
  }
  
  return commands;
}

export { loadCommands };

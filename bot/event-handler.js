import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function loadEvents() {
  const events = new Map();
  const eventsPath = path.join(__dirname, '../events');
  
  if (!fs.existsSync(eventsPath)) {
    console.warn('⚠️  Events directory not found');
    return events;
  }
  
  const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
  
  for (const file of eventFiles) {
    try {
      const filePath = path.join(eventsPath, file);
      const module = await import(filePath);
      const event = module.default;
      
      if (event && event.name && event.execute) {
        events.set(event.name, event);
        console.log(`✅ Loaded event: ${event.name}`);
      } else {
        console.warn(`⚠️  Event ${file} missing required properties`);
      }
    } catch (error) {
      console.error(`❌ Failed to load event ${file}:`, error.message);
    }
  }
  
  return events;
}

export { loadEvents };

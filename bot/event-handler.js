const fs = require('fs');
const path = require('path');

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
      const event = require(filePath);
      
      if (event.name && event.execute) {
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

module.exports = { loadEvents };

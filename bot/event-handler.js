const fs = require('fs');
const path = require('path');

function loadEvents() {
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
      
      // Clear require cache to allow reloading
      delete require.cache[require.resolve(filePath)];
      
      const eventHandler = require(filePath);
      
      if (typeof eventHandler === 'function') {
        const eventName = path.basename(file, '.js');
        events.set(eventName, eventHandler);
        console.log(`✅ Loaded event: ${eventName}`);
      } else {
        console.warn(`⚠️  Event ${file} is not a function`);
      }
    } catch (error) {
      console.error(`❌ Failed to load event ${file}:`, error.message);
    }
  }
  
  console.log(`📊 Total events loaded: ${events.size}`);
  return events;
}

module.exports = { loadEvents };
const fs = require('fs');
const path = require('path');
const login = require('priyanshu-fca');

/**
 * NeoBot Login System - CommonJS Version
 * Facebook Messenger Bot Authentication
 * By Saifullah Al Neoaz
 */

async function authenticateBot() {
  try {
    console.log('🔐 Starting Facebook authentication...');
    
    // Read account.json
    const accountPath = path.join(__dirname, 'account.json');
    
    if (!fs.existsSync(accountPath)) {
      throw new Error('account.json file not found');
    }
    
    const accountData = JSON.parse(fs.readFileSync(accountPath, 'utf8'));
    
    // Validate account structure
    if (!accountData.uid || !accountData.cookies || !Array.isArray(accountData.cookies)) {
      throw new Error('Invalid account.json format. Required: uid and cookies array');
    }
    
    console.log(`👤 Target UID: ${accountData.uid}`);
    console.log(`🍪 Loading ${accountData.cookies.length} cookies...`);
    
    // Use cookies as appState
    const appState = accountData.cookies;
    
    // Authenticate with Facebook
    const api = await new Promise((resolve, reject) => {
      login({ appState }, (err, api) => {
        if (err) {
          console.error('❌ Facebook login failed:', err);
          reject(err);
        } else {
          resolve(api);
        }
      });
    });
    
    // Get current user ID
    const currentUID = api.getCurrentUserID();
    
    console.log(`✅ Bot logged in as ${currentUID}`);
    
    // Verify UID
    if (currentUID === accountData.uid) {
      console.log('✅ UID verification successful');
    } else {
      console.log('⚠️  UID mismatch - logged in as different user');
    }
    
    return api;
    
  } catch (error) {
    console.error('❌ Authentication failed:', error.message);
    
    // Provide helpful error messages
    if (error.message.includes('Invalid account.json format')) {
      console.log('💡 Please ensure account.json contains:');
      console.log('   - uid: Your Facebook user ID');
      console.log('   - cookies: Array of cookie objects');
    } else if (error.message.includes('Error retrieving userID')) {
      console.log('💡 Cookie authentication failed. Please:');
      console.log('   - Get fresh cookies from your browser');
      console.log('   - Ensure cookies are from facebook.com');
    }
    
    throw error;
  }
}

// Export for use in other modules
module.exports = { authenticateBot };

// Test login if run directly
if (require.main === module) {
  authenticateBot()
    .then(() => {
      console.log('🎉 Login test completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Login test failed:', error.message);
      process.exit(1);
    });
}
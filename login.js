const fs = require('fs');
const path = require('path');
const login = require('priyanshu-fca');

/**
 * NeoBot Login Script
 * Converts Chrome/Puppeteer cookie format to priyanshu-fca format and logs in
 */

async function loginToFacebook() {
  try {
    console.log('🔐 Starting Facebook login process...');
    
    // Read account.json file
    const accountPath = path.join(__dirname, 'account.json');
    
    if (!fs.existsSync(accountPath)) {
      throw new Error('account.json file not found. Please create it with your Facebook cookies.');
    }
    
    console.log('📁 Reading account.json...');
    const rawCookies = JSON.parse(fs.readFileSync(accountPath, 'utf8'));
    
    // Validate that it's an array
    if (!Array.isArray(rawCookies)) {
      throw new Error('account.json must contain an array of cookie objects');
    }
    
    if (rawCookies.length === 0) {
      throw new Error('account.json contains no cookies');
    }
    
    console.log(`📝 Found ${rawCookies.length} cookies in account.json`);
    
    // Convert Chrome/Puppeteer format to priyanshu-fca format
    // From: { name: "cookie_name", value: "cookie_value", domain: "...", ... }
    // To: { key: "cookie_name", value: "cookie_value" }
    
    // Filter essential cookies and convert format
    const essentialCookieNames = ['datr', 'xs', 'c_user', 'sb', 'fr'];
    const filteredCookies = rawCookies.filter(cookie => 
      essentialCookieNames.includes(cookie.name) && 
      cookie.value && 
      cookie.value.length > 0
    );
    
    const appState = filteredCookies.map(cookie => ({
      key: cookie.name,
      value: cookie.value
    }));
    
    console.log('🔄 Converted cookies to priyanshu-fca format');
    
    // Find the c_user cookie to get the UID
    const cUserCookie = rawCookies.find(cookie => cookie.name === 'c_user');
    if (!cUserCookie) {
      console.warn('⚠️  c_user cookie not found - login may fail');
    } else {
      console.log(`👤 Expected UID: ${cUserCookie.value}`);
    }
    
    // Verify essential cookies are present
    const essentialCookies = ['datr', 'xs', 'c_user', 'sb'];
    const presentCookies = rawCookies.map(c => c.name);
    const missingCookies = essentialCookies.filter(name => !presentCookies.includes(name));
    
    if (missingCookies.length > 0) {
      console.warn(`⚠️  Missing essential cookies: ${missingCookies.join(', ')}`);
      console.warn('Login may fail. Please ensure you have all required Facebook cookies.');
    }
    
    console.log('🔐 Attempting Facebook login...');
    
    // Try different login options for priyanshu-fca
    console.log(`📊 Using ${appState.length} cookies for login`);
    
    const loginOptions = {
      listenEvents: false,
      logLevel: "silent",
      updatePresence: false,
      forceLogin: true,
      autoMarkDelivery: false,
      autoMarkRead: false,
      online: false
    };
    
    const api = await new Promise((resolve, reject) => {
      try {
        login({ appState }, loginOptions, (err, api) => {
          if (err) {
            reject(err);
          } else {
            resolve(api);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
    
    // Success! Get the logged-in UID
    const loggedInUID = api.getCurrentUserID();
    
    console.log('✅ Bot logged in successfully');
    console.log(`🔐 Logged-in UID: ${loggedInUID}`);
    
    // Verify UID matches expected
    if (cUserCookie && cUserCookie.value !== loggedInUID) {
      console.warn(`⚠️  UID mismatch: expected ${cUserCookie.value}, got ${loggedInUID}`);
    }
    
    // Log some basic account info
    console.log('📊 Login Details:');
    console.log(`   👤 User ID: ${loggedInUID}`);
    console.log(`   🍪 Cookies used: ${appState.length}`);
    console.log(`   📱 API ready: Yes`);
    
    return api;
    
  } catch (error) {
    console.error('❌ Facebook login failed:');
    
    if (error.message) {
      console.error(`   Error: ${error.message}`);
    }
    
    // Provide helpful error messages for common issues
    if (error.message?.includes('ENOENT') || error.message?.includes('account.json')) {
      console.error('💡 Solution: Create account.json with your Facebook cookies');
      console.error('   Export cookies from Chrome or use a cookie extension');
    } else if (error.message?.includes('Cookie has domain set to a public suffix')) {
      console.error('💡 Solution: This is a known issue with priyanshu-fca 3.0.1');
      console.error('   The library has restrictions on Facebook cookie domains');
      console.error('   Workarounds:');
      console.error('   1. Try using a different version of priyanshu-fca');
      console.error('   2. Use an alternative Facebook API library');
      console.error('   3. The bot framework supports this format - check bot logs');
    } else if (error.message?.includes('appState') || error.message?.includes('login')) {
      console.error('💡 Solution: Your Facebook cookies may be expired');
      console.error('   1. Log into Facebook in your browser');
      console.error('   2. Export fresh cookies to account.json');
      console.error('   3. Try running the script again');
    } else if (error.message?.includes('JSON')) {
      console.error('💡 Solution: Check account.json format');
      console.error('   Ensure it contains a valid JSON array of cookie objects');
    }
    
    process.exit(1);
  }
}

// Run the login process if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  loginToFacebook()
    .then((api) => {
      console.log('🚀 Login completed successfully!');
      console.log('🔗 API object ready for use');
      
      // Gracefully close the connection after a brief pause
      setTimeout(() => {
        console.log('👋 Closing connection...');
        process.exit(0);
      }, 2000);
    })
    .catch((error) => {
      console.error('💥 Login process failed:', error.message);
      process.exit(1);
    });
}

export default loginToFacebook;
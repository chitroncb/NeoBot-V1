import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import login from 'priyanshu-fca';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Facebook Messenger Bot Login System
 * Uses priyanshu-fca library with cookie-based authentication
 */

async function loginWithCookies() {
  try {
    console.log('🔐 Starting Facebook login process...');
    
    // Read account.json file
    const accountPath = path.join(__dirname, 'account.json');
    
    if (!fs.existsSync(accountPath)) {
      throw new Error('account.json file not found');
    }
    
    const accountData = JSON.parse(fs.readFileSync(accountPath, 'utf8'));
    
    // Validate account data structure
    if (!accountData.uid || !accountData.cookies || !Array.isArray(accountData.cookies)) {
      throw new Error('Invalid account.json format. Required: uid and cookies array');
    }
    
    console.log(`👤 Target UID: ${accountData.uid}`);
    console.log(`🍪 Loading ${accountData.cookies.length} cookies...`);
    
    // Use cookies as appState for login
    const appState = accountData.cookies;
    
    // Attempt login with cookies
    const api = await new Promise((resolve, reject) => {
      login({ appState }, (err, api) => {
        if (err) {
          reject(err);
        } else {
          resolve(api);
        }
      });
    });
    
    // Get logged-in user info
    const currentUID = api.getCurrentUserID();
    
    console.log('✅ Bot logged in successfully!');
    console.log(`👤 Logged-in UID: ${currentUID}`);
    
    // Verify UID matches expected
    if (currentUID === accountData.uid) {
      console.log('✅ UID verification successful');
    } else {
      console.log('⚠️  UID mismatch - logged in as different user');
    }
    
    return api;
    
  } catch (error) {
    console.error('❌ Facebook login failed:', error.message);
    
    // Provide helpful error messages
    if (error.message.includes('Invalid account.json format')) {
      console.log('💡 Please ensure account.json contains:');
      console.log('   - uid: Your Facebook user ID');
      console.log('   - cookies: Array of cookie objects with c_user, xs, sb, datr, etc.');
    } else if (error.message.includes('Error retrieving userID')) {
      console.log('💡 Cookie authentication failed. Please:');
      console.log('   - Get fresh cookies from your browser');
      console.log('   - Ensure cookies are from facebook.com');
      console.log('   - Try logging in with browser first');
    }
    
    throw error;
  }
}

// Example account.json structure for reference
const exampleAccountStructure = {
  uid: "100000000000000",
  cookies: [
    {
      key: "c_user",
      value: "100000000000000",
      domain: ".facebook.com",
      path: "/",
      secure: true,
      httpOnly: false
    },
    {
      key: "xs",
      value: "your_xs_value_here",
      domain: ".facebook.com", 
      path: "/",
      secure: true,
      httpOnly: true
    },
    {
      key: "sb",
      value: "your_sb_value_here",
      domain: ".facebook.com",
      path: "/",
      secure: true,
      httpOnly: true
    },
    {
      key: "datr",
      value: "your_datr_value_here",
      domain: ".facebook.com",
      path: "/",
      secure: true,
      httpOnly: true
    }
  ]
};

// Export the login function
export { loginWithCookies };

// Run login if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  loginWithCookies()
    .then(() => {
      console.log('🎉 Login test completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Login test failed:', error.message);
      process.exit(1);
    });
}
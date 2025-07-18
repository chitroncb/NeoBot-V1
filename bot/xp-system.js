/**
 * XP System for NeoBot
 * Handles user experience points, levels, and rankings
 */

let userData = null;

function initXPSystem(userDataRef) {
  userData = userDataRef;
  console.log('✅ XP System initialized');
}

function addXP(userID, amount = 1) {
  if (!userData || !userData.users) {
    userData = { users: {} };
  }
  
  if (!userData.users[userID]) {
    userData.users[userID] = {
      name: '',
      xp: 0,
      level: 1,
      messageCount: 0,
      joinedAt: Date.now(),
      lastActive: Date.now()
    };
  }
  
  userData.users[userID].xp += amount;
  userData.users[userID].lastActive = Date.now();
  
  // Calculate level (10 XP per level)
  const newLevel = Math.floor(userData.users[userID].xp / 10) + 1;
  const oldLevel = userData.users[userID].level;
  
  userData.users[userID].level = newLevel;
  
  // Return level up status
  return {
    leveledUp: newLevel > oldLevel,
    oldLevel,
    newLevel,
    currentXP: userData.users[userID].xp
  };
}

function getUserLevel(userID) {
  if (!userData || !userData.users || !userData.users[userID]) {
    return { level: 1, xp: 0 };
  }
  
  return {
    level: userData.users[userID].level,
    xp: userData.users[userID].xp
  };
}

function getLeaderboard(limit = 10) {
  if (!userData || !userData.users) {
    return [];
  }
  
  return Object.entries(userData.users)
    .sort(([, a], [, b]) => b.xp - a.xp)
    .slice(0, limit)
    .map(([userID, user], index) => ({
      rank: index + 1,
      userID,
      name: user.name || 'Unknown',
      xp: user.xp,
      level: user.level
    }));
}

module.exports = {
  initXPSystem,
  addXP,
  getUserLevel,
  getLeaderboard
};
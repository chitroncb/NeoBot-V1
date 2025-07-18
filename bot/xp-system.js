function initXPSystem(userData) {
  console.log('📈 Initializing XP system...');
  
  // Initialize user data if not exists
  if (!userData.users) {
    userData.users = {};
  }
  
  console.log('✅ XP system initialized');
}

function addXP(userData, userId, amount = 1) {
  if (!userData.users[userId]) {
    userData.users[userId] = {
      name: '',
      xp: 0,
      level: 1,
      avatar: '',
      birthday: '',
      relationship: '',
      verified: false,
      banned: false,
      language: 'en',
      joinDate: new Date().toISOString()
    };
  }
  
  userData.users[userId].xp += amount;
  
  // Check for level up
  const newLevel = Math.floor(userData.users[userId].xp / 100) + 1;
  if (newLevel > userData.users[userId].level) {
    userData.users[userId].level = newLevel;
    return { levelUp: true, newLevel };
  }
  
  return { levelUp: false };
}

function getUserRank(userData, userId) {
  const users = Object.entries(userData.users)
    .map(([id, user]) => ({ id, ...user }))
    .sort((a, b) => b.xp - a.xp);
  
  const rank = users.findIndex(user => user.id === userId) + 1;
  return rank || 0;
}

function getLeaderboard(userData, limit = 10) {
  return Object.entries(userData.users)
    .map(([id, user]) => ({ id, ...user }))
    .sort((a, b) => b.xp - a.xp)
    .slice(0, limit);
}

module.exports = {
  initXPSystem,
  addXP,
  getUserRank,
  getLeaderboard
};

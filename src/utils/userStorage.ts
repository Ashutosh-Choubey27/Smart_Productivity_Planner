// Utility for managing local user identification without authentication

const USER_ID_KEY = 'lovable_user_id';

// Generate a unique user ID for local storage
export const generateUserId = (): string => {
  return 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
};

// Get or create a local user ID
export const getLocalUserId = (): string => {
  let userId = localStorage.getItem(USER_ID_KEY);
  
  if (!userId) {
    userId = generateUserId();
    localStorage.setItem(USER_ID_KEY, userId);
  }
  
  return userId;
};

// Clear local user ID (for testing purposes)
export const clearLocalUserId = (): void => {
  localStorage.removeItem(USER_ID_KEY);
};
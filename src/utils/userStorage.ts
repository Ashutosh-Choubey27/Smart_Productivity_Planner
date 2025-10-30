// Utility for managing local user identification without authentication

const USER_ID_KEY = 'lovable_user_id';

// Generate a unique user ID for local storage (valid UUID format)
export const generateUserId = (): string => {
  return crypto.randomUUID();
};

// Get or create a local user ID with automatic migration
export const getLocalUserId = (): string => {
  let userId = localStorage.getItem(USER_ID_KEY);
  
  // Migration: Check if the userId is in old format (not a valid UUID)
  if (userId && !isValidUUID(userId)) {
    console.log('Migrating old user ID to UUID format');
    userId = generateUserId();
    localStorage.setItem(USER_ID_KEY, userId);
  }
  
  if (!userId) {
    userId = generateUserId();
    localStorage.setItem(USER_ID_KEY, userId);
  }
  
  return userId;
};

// Validate UUID format
const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

// Clear local user ID (for testing purposes)
export const clearLocalUserId = (): void => {
  localStorage.removeItem(USER_ID_KEY);
};
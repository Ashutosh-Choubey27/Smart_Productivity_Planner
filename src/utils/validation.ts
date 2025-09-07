// Task validation utility with strict rules for meaningful task names

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// Single-word whitelist for commonly acceptable task names
const WHITELISTED_SINGLE_WORDS = new Set([
  'homework', 'laundry', 'workout', 'exercise', 'shopping', 'cooking', 
  'cleaning', 'studying', 'reading', 'writing', 'research', 'planning',
  'debugging', 'testing', 'deployment', 'meeting', 'presentation',
  'interview', 'appointment', 'meditation', 'journaling'
]);

// Common task action verbs
const ACTION_VERBS = /(plan|write|read|review|fix|build|clean|study|prepare|update|email|call|design|implement|test|deploy|research|organize|schedule|draft|finish|complete|start|begin|create|make|develop|learn|practice|submit|upload|download|install|configure|setup|analyze|document|refactor|optimize|backup|restore|sync|merge|commit|push|pull|clone|fork)/i;

export const validateTaskTitle = (title: string): ValidationResult => {
  const trimmed = title.trim();
  
  // Basic length checks
  if (trimmed.length === 0) {
    return { isValid: false, error: 'Task title cannot be empty' };
  }
  
  if (trimmed.length < 2) {
    return { isValid: false, error: 'Task title must be at least 2 characters long' };
  }
  
  if (trimmed.length > 100) {
    return { isValid: false, error: 'Task title must be less than 100 characters' };
  }

  // Must contain at least one letter
  if (!/[A-Za-z]/.test(trimmed)) {
    return { isValid: false, error: 'Task title must contain at least one letter' };
  }

  // Check for obviously random/gibberish patterns
  
  // 1. Same character repeated 4+ times (e.g., "aaaa", "xxxx")
  if (/(.)\1{3,}/.test(trimmed)) {
    return { isValid: false, error: 'Please enter a meaningful task name (avoid repeated characters)' };
  }
  
  // 2. Random keyboard patterns (e.g., "qwerty", "asdf", "zxcv")
  const keyboardPatterns = [
    /qwerty|asdf|zxcv|hjkl|yuiop|fghj|vbnm/i,
    /123456|234567|345678|456789|567890/,
    /abcde|bcdef|cdefg|defgh|efghi|fghij/i
  ];
  
  if (keyboardPatterns.some(pattern => pattern.test(trimmed.replace(/\s/g, '')))) {
    return { isValid: false, error: 'Please enter a meaningful task name (avoid keyboard patterns)' };
  }
  
  // 3. Must contain at least one vowel (helps filter gibberish)
  if (!/[aeiouAEIOU]/.test(trimmed)) {
    return { isValid: false, error: 'Please enter a meaningful task name (should contain vowels)' };
  }
  
  // 4. Reject strings with excessive consonants (likely gibberish)
  const cleanWord = trimmed.replace(/[^A-Za-z]/g, '');
  if (/[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]{6,}/.test(cleanWord)) {
    return { isValid: false, error: 'Please enter a meaningful task name (avoid excessive consonants)' };
  }

  const words = trimmed.split(/\s+/);
  
  // Multi-word titles are generally acceptable
  if (words.length >= 2) {
    // Quick check for action verb at the beginning
    if (ACTION_VERBS.test(trimmed)) {
      return { isValid: true };
    }
    
    // Check if all words are too short (likely abbreviations or gibberish)
    const validWords = words.filter(word => word.length >= 2);
    if (validWords.length === 0) {
      return { isValid: false, error: 'Please enter a meaningful task name with proper words' };
    }
    
    return { isValid: true };
  }
  
  // Single-word validation (more strict)
  const singleWord = words[0].toLowerCase();
  
  // Check whitelist first
  if (WHITELISTED_SINGLE_WORDS.has(singleWord)) {
    return { isValid: true };
  }
  
  // Must be at least 4 characters for single words
  if (singleWord.length < 4) {
    return { isValid: false, error: 'Please use a more descriptive task name (e.g., "Study Chapter 3", "Finish homework")' };
  }
  
  // Reject very long single words (likely gibberish)
  if (singleWord.length > 15) {
    return { isValid: false, error: 'Please use a more descriptive task name with multiple words' };
  }
  
  // Check for triple repeated letters in single words
  if (/(.)\1{2,}/.test(singleWord)) {
    return { isValid: false, error: 'Please enter a meaningful task name' };
  }
  
  // Additional pattern checks for single words
  const vowelCount = (singleWord.match(/[aeiou]/gi) || []).length;
  const consonantCount = (singleWord.match(/[bcdfghjklmnpqrstvwxyz]/gi) || []).length;
  
  // Word should have a reasonable vowel-to-consonant ratio
  if (consonantCount > 0 && vowelCount / consonantCount < 0.2) {
    return { isValid: false, error: 'Please enter a meaningful task name (try adding more details)' };
  }
  
  return { isValid: true };
};

// Helper function that returns just the boolean for simpler usage
export const isValidTaskTitle = (title: string): boolean => {
  return validateTaskTitle(title).isValid;
};

// Get a friendly error message for invalid titles
export const getTaskTitleError = (title: string): string | null => {
  const result = validateTaskTitle(title);
  return result.isValid ? null : (result.error || 'Invalid task title');
};
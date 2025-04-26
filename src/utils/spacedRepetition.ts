
// Simple implementation of the SuperMemo SM-2 algorithm
// https://en.wikipedia.org/wiki/SuperMemo#Algorithm

/**
 * Calculate the next review date based on the spaced repetition algorithm
 * @param knowledgeLevel - User's self-reported knowledge level (1-5)
 * @param previousInterval - Previous interval in days (0 for first review)
 * @param consecutiveCorrect - Number of times card was rated 'good' in a row
 * @returns Object containing next interval in days and updated consecutive correct count
 */
export function calculateNextReview(
  knowledgeLevel: number, 
  previousInterval: number = 0, 
  consecutiveCorrect: number = 0
): { 
  nextInterval: number, 
  newConsecutiveCorrect: number 
} {
  // Adjust knowledge level to 0-5 scale if needed
  const level = Math.max(0, Math.min(5, knowledgeLevel));
  
  // If knowledge level is low (1-2), reset consecutive correct count
  if (level <= 2) {
    return {
      nextInterval: 1, // Review again tomorrow
      newConsecutiveCorrect: 0
    };
  }
  
  // Calculate ease factor based on knowledge level (3-5)
  const easeFactor = 1.3 + (level - 3) * 0.3; // 1.3 to 1.9
  
  // Update consecutive correct count
  const newConsecutiveCorrect = consecutiveCorrect + 1;
  
  // Calculate next interval based on SM-2 algorithm
  let nextInterval: number;
  
  if (newConsecutiveCorrect === 1) {
    nextInterval = 1; // First success: 1 day
  } else if (newConsecutiveCorrect === 2) {
    nextInterval = 3; // Second success: 3 days
  } else {
    // Apply the spaced repetition formula
    nextInterval = Math.round(previousInterval * easeFactor);
  }
  
  return {
    nextInterval,
    newConsecutiveCorrect
  };
}

/**
 * Get a date in the future based on an interval
 * @param intervalDays - Number of days to add
 * @returns Date object for the future date
 */
export function getNextReviewDate(intervalDays: number): Date {
  const now = new Date();
  return new Date(now.setDate(now.getDate() + intervalDays));
}

/**
 * Centralized list of error codes for the Snatch game rules.
 */
export const ErrorCodes = {
  WORD_TOO_SHORT: "WORD_TOO_SHORT",
  PLAYER_NOT_FOUND: "PLAYER_NOT_FOUND",
  INVALID_WORD: "INVALID_WORD",
  POOL_LETTERS_TAKEN: "POOL_LETTERS_TAKEN",
  WORD_NO_LONGER_AVAILABLE: "WORD_NO_LONGER_AVAILABLE",
  AFFIX_RULE_VIOLATION: "AFFIX_RULE_VIOLATION",
  NO_WORDS_TO_STEAL: "NO_WORDS_TO_STEAL",
  LETTERS_NOT_AVAILABLE: "LETTERS_NOT_AVAILABLE",
} as const;

/**
 * A type representing any valid error code key.
 */
export type SnatchErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

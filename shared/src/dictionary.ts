/**
 * Contract for a dictionary service used to validate words in the game.
 */
export interface Dictionary {
  /**
   * Checks if a word is valid. Implementation should be case-insensitive.
   */
  isValid(word: string): boolean;
}

/**
 * A fast, Set-backed dictionary implementation.
 */
export class SetDictionary implements Dictionary {
  private words: Set<string>;

  constructor(wordList: string[]) {
    // TODO: Store all words in a Set, converting them to uppercase for case-insensitivity
    this.words = new Set();
  }

  isValid(word: string): boolean {
    // TODO: Check if the word (converted to uppercase) exists in the Set
    return false;
  }
}

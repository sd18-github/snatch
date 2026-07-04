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
    this.words = new Set(wordList.map(w => w.toLowerCase()));
  }

  isValid(word: string): boolean {
    return this.words.has(word.toLowerCase());
  }
}

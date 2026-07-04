import { describe, it, expect } from "vitest";
import { initializeBag, shuffleBag, flipTile } from "./game.js";
import { SetDictionary } from "./dictionary.js";
import type { GameState } from "./types.js";

describe("initializeBag", () => {
  it("should initialize a bag of 100 tiles for scrabble", () => {
    // TODO: Call initializeBag() and expect the returned array length to be 100.
  });

  it("should contain the correct frequency of letters", () => {
    // TODO: Call initializeBag() and verify that the letter counts match the frequencies:
    // E.g., 'E' should have 12 occurrences, 'A' should have 9, 'Z' should have 1.
  });
});

describe("shuffleBag", () => {
  it("should shuffle the bag of tiles randomly", () => {
    // TODO:
    // 1. Initialize a bag.
    // 2. Shuffle it using shuffleBag().
    // 3. Verify that the shuffled bag has the same length.
    // 4. Verify that the letter order has changed (expect the mapped letters of original and shuffled not to equal).
  });
});

describe("SetDictionary", () => {
  it("should validate words case-insensitively", () => {
    // TODO:
    // 1. Instantiate SetDictionary with a list: ["Apple", "BANANA", "cherry"].
    // 2. Assert that isValid("apple"), isValid("banana"), and isValid("CHERRY") all return true.
    // 3. Assert that isValid("grape") returns false.
  });
});

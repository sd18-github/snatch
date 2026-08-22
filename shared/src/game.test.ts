import { describe, it, expect } from "vitest";
import { initializeBag, shuffleBag, flipTile, claimWord, isValidStealMorphology } from "./game.js";
import { SetDictionary } from "./dictionary.js";
import { ErrorCodes } from "./errorCodes.js";
import type { GameState } from "./types.js";
import type { SnatchError } from "./errors.js";

describe("initializeBag", () => {
  it("should initialize a bag of 100 tiles for scrabble", () => {
    const bag = initializeBag();
    expect(bag.length).toBe(98);
  });

  it("should contain the correct frequency of letters", () => {
    const bag = initializeBag();
    const eCount = bag.filter((tile) => tile.letter === "E").length;
    expect(eCount).toBe(12);

    const aCount = bag.filter((tile) => tile.letter === "A").length;
    expect(aCount).toBe(9);

    const zCount = bag.filter((tile) => tile.letter === "Z").length;
    expect(zCount).toBe(1);
  });
});

describe("shuffleBag", () => {
  it("should shuffle the bag of tiles randomly", () => {
    const bag = initializeBag();
    const shuffledBag = shuffleBag(bag);
    expect(shuffledBag.length).toBe(bag.length);
    const originalLetters = bag.map(t => t.letter);
    const shuffledLetters = shuffledBag.map(t => t.letter);
    expect(originalLetters).not.toEqual(shuffledLetters);
    expect(originalLetters.sort()).toEqual(shuffledLetters.sort());
  });
});

describe("SetDictionary", () => {
  it("should validate words case-insensitively", () => {
    const dict = new SetDictionary(["Armageddon", "BABYLON", "catharsis"]);
    expect(dict.isValid("armageddon")).toBe(true);
    expect(dict.isValid("babylon")).toBe(true);
    expect(dict.isValid("CATHARSIS")).toBe(true);
    expect(dict.isValid("halitosis")).toBe(false);
  });
});

describe("claimWord", () => {
  const dictionary = new SetDictionary(["KILN", "PLOW", "POOL", "POW"]);

  const createInitialState = (): GameState => ({
    status: "playing",
    players: [
      { id: "P1", name: "Keki", score: 5, words: [] },
      { id: "P2", name: "William", score: 0, words: [] },
    ],
    tileBag: [],
    tilePool: [
      { id: "1", letter: "P" },
      { id: "2", letter: "O" },
      { id: "3", letter: "O" },
      { id: "4", letter: "L" },
      { id: "5", letter: "X" },
      { id: "6", letter: "Y" },
    ],
    activePlayerId: "P1",
    flipTimer: 10,
    log: [],
  });

  it("should successfully claim a word from the pool", () => {
    const state = createInitialState();
    const result = claimWord(state, "P1", "POOL", dictionary);

    expect(result.players[0]?.score).toBe(9);
    expect(result.players[0]?.words[0]?.text).toBe("POOL");
    expect(result.tilePool.map(t => t.letter)).toEqual(["X", "Y"]);
  })

  it("should throw WORD_TOO_SHORT if word length < 4", () => {
    const state = createInitialState();
    expect(() => claimWord(state, "P1", "POW", dictionary)).toThrowError(
      expect.objectContaining({ code: ErrorCodes.WORD_TOO_SHORT })
    );
  });

  it("should throw INVALID_WORD and deduct 1 point if not in dictionary", () => {
    const state = createInitialState();

    try {
      claimWord(state, "P1", "PLOO", dictionary);
      expect.fail("Should have thrown SnatchError");
    } catch (err) {
      const error = err as SnatchError;
      expect(error.code).toBe(ErrorCodes.INVALID_WORD);
      expect(error.state?.players[0]?.score).toBe(4);
    }
  });

  it("should throw POOL_LETTERS_TAKEN if pool lacks letters", () => {
    const state = createInitialState();
    expect(() => claimWord(state, "P1", "PLOW", dictionary)).toThrowError(
      expect.objectContaining({ code: ErrorCodes.POOL_LETTERS_TAKEN })
    );
  });
})

describe("isValidStealMorphology", () => {
  it("should reject suffix-only extensions of a single source word", () => {
    expect(isValidStealMorphology(["TEAR"], "TEARS")).toBe(false);
  });

  it("should reject prefix-only extensions of a single source word", () => {
    expect(isValidStealMorphology(["BUILD"], "REBUILD")).toBe(false);
  });

  it("should reject combined prefix and suffix extensions", () => {
    expect(isValidStealMorphology(["BUILD"], "REBUILDING")).toBe(false);
  });

  it("should allow valid steals where letters are rearranged", () => {
    expect(isValidStealMorphology(["TEAR"], "STARE")).toBe(true);
  });

  it("should reject extensions of one of multiple source words", () => {
    expect(isValidStealMorphology(["RATE", "RANGE", "READ"], "REREADING")).toBe(false);
  });

  it("should not reject non-standard prefix extension", () => {
    expect(isValidStealMorphology(["RINK"], "BRINKS")).toBe(true);
  });

  it("should not reject non-standard suffix extension", () => {
    expect(isValidStealMorphology(["LIQUOR"], "LIQUORICE")).toBe(true);
  });
});

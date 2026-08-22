import crypto from "node:crypto";
import type { Dictionary } from "./dictionary.js";
import { SnatchError } from "./errors.js";
import { ErrorCodes } from "./errorCodes.js";
import type { GameState, Tile, Word } from "./types.js";

export type DistributionType = "scrabble" | "bananagrams" | "random";
export type TileCount = 100 | 144 | 200;

/**
 * Initializes a new bag of tiles with a customized or standard letter distribution.
 */
export function initializeBag(
  distribution: DistributionType = "scrabble",
  totalTiles: TileCount = 100
): Tile[] {
  const bag: Tile[] = []
  if (distribution === "scrabble") {
    const scrabbleTiles = [
      { letter: "A", count: 9, value: 1 },
      { letter: "B", count: 2, value: 3 },
      { letter: "C", count: 2, value: 3 },
      { letter: "D", count: 4, value: 2 },
      { letter: "E", count: 12, value: 1 },
      { letter: "F", count: 2, value: 4 },
      { letter: "G", count: 3, value: 2 },
      { letter: "H", count: 2, value: 4 },
      { letter: "I", count: 9, value: 1 },
      { letter: "J", count: 1, value: 8 },
      { letter: "K", count: 1, value: 5 },
      { letter: "L", count: 4, value: 1 },
      { letter: "M", count: 2, value: 3 },
      { letter: "N", count: 6, value: 1 },
      { letter: "O", count: 8, value: 1 },
      { letter: "P", count: 2, value: 3 },
      { letter: "Q", count: 1, value: 10 },
      { letter: "R", count: 6, value: 1 },
      { letter: "S", count: 4, value: 1 },
      { letter: "T", count: 6, value: 1 },
      { letter: "U", count: 4, value: 1 },
      { letter: "V", count: 2, value: 4 },
      { letter: "W", count: 2, value: 4 },
      { letter: "X", count: 1, value: 8 },
      { letter: "Y", count: 2, value: 4 },
      { letter: "Z", count: 1, value: 10 },
    ];
    for (const tile of scrabbleTiles) {
      for (let i = 0; i < tile.count; i++) {
        bag.push({
          id: crypto.randomUUID(),
          letter: tile.letter,
        });
      }
    }
    return bag;
  }
  throw new Error("Invalid distribution type");
}

/**
 * Shuffles an array of tiles using a random/uniform algorithm.
 */
export function shuffleBag(bag: Tile[]): Tile[] {
  const shuffledBag = [...bag];
  for (let i = shuffledBag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledBag[i], shuffledBag[j]] = [shuffledBag[j]!, shuffledBag[i]!];
  }
  return shuffledBag;
}

/**
 * Handles flipping a tile from the bag to the pool.
 * Returns a new, updated GameState without mutating the input state.
 */
export function flipTile(state: GameState): GameState {
  const nextState: GameState = {
    ...state,
    tileBag: [...state.tileBag], // copy the array
    tilePool: [...state.tilePool],
    players: [...state.players], // although we aren't modifying players, copying is safe
  };

  // 1. Check if there are tiles in the bag.
  if (nextState.tileBag.length === 0) {
    return nextState;
  }

  // 2. Take the top tile from the bag and move it to the pool.
  const tile = nextState.tileBag.pop();
  if (tile) {
    nextState.tilePool.push(tile);
  }

  // 3. Reset the flip timer for the turn.
  nextState.flipTimer = 10;

  // 4. Pass the flip right to the next player
  const currentPlayerIndex = state.players.findIndex((player) => player.id === state.activePlayerId);
  if (currentPlayerIndex === -1) {
    throw new Error("No active player found.");
  }
  nextState.activePlayerId = state.players[(currentPlayerIndex + 1) % state.players.length]?.id ?? null;

  return nextState;
}

/**
 * Validates and executes a player's claim of a new word from the face-up pool.
 * Returns the new GameState if successful.
 * Throws a SnatchError if any rules are violated.
 */
export function claimWord(
  state: GameState,
  playerId: string,
  wordText: string,
  dictionary: Dictionary
): GameState {
  
  // 1. Verify word length is >= 4.
  if (wordText.length < 4) {
    throw new SnatchError(ErrorCodes.WORD_TOO_SHORT, "Word must be at least 4 letters long.");
  }

  // 2. Validate word against the dictionary. (If invalid, deduct 1 point and return new state).
  const playerIndex = state.players.findIndex((p) => p.id === playerId);
  if (playerIndex === -1) {
    throw new SnatchError(ErrorCodes.PLAYER_NOT_FOUND, "Player not found.");
  }

  // 3. Verify all letters of the word are available in the face-up pool.
  if (!dictionary.isValid(wordText)) {
    const updatedState: GameState = {
      ...state,
      players: state.players.map((p, idx) =>
        idx === playerIndex ? { ...p, score: p.score - 1 } : p
      ),
    };
    throw new SnatchError(ErrorCodes.INVALID_WORD, "Word is not in the dictionary", updatedState);
  }

  // 4. Remove the consumed tiles from the pool.
  const consumedTiles: Tile[] = [];
  const remainingPool = [...state.tilePool];

  for (const letter of wordText.toUpperCase()) {
    const tileIndex = remainingPool.findIndex(
      (tile) => tile.letter.toUpperCase() === letter
    );

    if (tileIndex === -1) {
      throw new SnatchError(
        ErrorCodes.POOL_LETTERS_TAKEN,
        `The pool does not contain the letter "${letter}" required for this word.`
      );
    }

    // Remove the tile from out pool copy and save it for the word
    const [tile] = remainingPool.splice(tileIndex, 1);
    if (tile) {
      consumedTiles.push(tile);
    }
  }

  const newWord = {
    id: crypto.randomUUID(),
    text: wordText.toUpperCase(),
    tiles: consumedTiles,
  }

  // 5. Add the new word (with its tiles and text) to the player's held words; and
  // 6. Update player's score: +2 points per letter gained (which is all letters in this case).
  const updatedState: GameState = {
    ...state,
    tilePool: remainingPool,
    players: state.players.map((p, idx) =>
      idx === playerIndex ?
        {
          ...p,
          score: p.score + consumedTiles.length,
          words: [...p.words, newWord],
        }
        : p
    ),
  };

  // 7. Return the updated GameState.
  return updatedState;
}

/**
 * Heuristic helper to check if a steal violates morphology / affix rules.
 * 
 * MVP Rules:
 * 1. Disallow a fixed list of productive prefixes (e.g., "RE-", "UN-", "DE-", "PRE-", "DIS-", "IN-", "MIS-", "ANTI-", "NON-", "POST-").
 * 2. Disallow suffix-only extensions of a single source word WITHOUT rearrangement of that word's letters
 *    (e.g., TEAR -> TEARS, PEEL -> PEELED, JUMP -> JUMPING).
 * 3. For multi-source merges, reject when a whole source word appears in order as a contiguous substring
 *    of the target word AND the remainder looks like a blocked affix/inflection.
 */
export function isValidStealMorphology(
  sourceWords: string[],
  targetWordText: string
): boolean {
  const BLOCKED_PREFIXES = ["RE", "UN", "DE", "PRE", "DIS", "IN", "MIS", "ANTI", "NON", "POST"].concat([""]);
  const BLOCKED_SUFFIXES = ["S", "ES", "ED", "ING", "ER", "EST", "LY", "Y", "MENT", "ABLE", "IBLE", "ION", "TION", "ITY", "NESS"].concat([""]);

  const ucSourceWords = sourceWords.map(w => w.toUpperCase());
  const ucTargetWord = targetWordText.toUpperCase();

  for(const ucSourceWord of ucSourceWords) {
    for(const prefix of BLOCKED_PREFIXES) {
      for(const suffix of BLOCKED_SUFFIXES) {
        if((prefix + ucSourceWord + suffix) === ucTargetWord) {
          return false;
        }
      }
    }
  }

  return true;
}

/**
 * Helper to search the board (face-up pool and active words) to find matching tiles for a target word.
 * Returns the source Word objects and the pool Tile objects needed to form the target word.
 * Returns null if the target word cannot be spelled using the available tiles on the board.
 * 
 * Priority Rules:
 * 1. Claim (pool only).
 * 2. Single-Source Steal (one held word + pool tiles, pool usage > 0).
 * 3. Multi-Source Steal (2+ held words + pool tiles, pool usage >= 0).
 */
export function findTilesForWord(
  state: GameState,
  targetWordText: string
): { sources: Word[]; poolTiles: Tile[] } | null {
  // TODO: Implement the search algorithm.
  // 1. Normalize the target word text to uppercase.
  // 2. Try to spell using only face-up pool tiles (Claim).
  // 3. Try to spell using exactly one active word on the board + at least one pool tile (Single-Source Steal).
  // 4. Try to spell using two or more active words + zero or more pool tiles (Multi-Source Steal).
  // Return null if no combination works.
  return null;
}

/**
 * Validates and executes a player's submission of a new word (either a claim or a steal).
 * Always returns the new, updated GameState (even for invalid or impossible attempts, so that they are logged).
 * Throws a SnatchError on invalid or impossible attempts so the server can handle the response.
 */
export function submitWord(
  state: GameState,
  playerId: string,
  wordText: string,
  dictionary: Dictionary
): GameState {
  // TODO: Implement the unified word submission state machine:
  // 
  // 1. Normalize & check length:
  //    - Normalize wordText to uppercase.
  //    - If wordText.length < 4, it is impossible. Append an "impossible" log entry to the state and throw a SnatchError with LETTERS_NOT_AVAILABLE.
  //
  // 2. Find player name:
  //    - Locate the player by playerId. If not found, throw a SnatchError with PLAYER_NOT_FOUND.
  //
  // 3. Search for matching tiles on the board:
  //    - Call findTilesForWord. If it returns null, the move is impossible.
  //      Append an "impossible" log entry to state.log and throw a SnatchError with LETTERS_NOT_AVAILABLE.
  //
  // 4. Validate dictionary:
  //    - If !dictionary.isValid(wordText):
  //      * Deduct 1 point from the player.
  //      * Append an "invalid_word" log entry to state.log.
  //      * Throw SnatchError with INVALID_WORD (passing the updated state).
  //
  // 5. Validate morphology (affix rules):
  //    - If sources.length > 0 (it is a steal) and !isValidStealMorphology(sources, targetWordText):
  //      * Append an "impossible" log entry to state.log.
  //      * Throw SnatchError with AFFIX_RULE_VIOLATION (passing the updated state).
  //
  // 6. Execute state transitions:
  //    - Construct log entry ("valid_claim" or "valid_steal").
  //    - Remove source words from owners.
  //    - Remove tiles from pool.
  //    - Add new word to player's words.
  //    - Calculate score updates (+1 point per letter gained on player's side, -1 point per letter lost from opponent's side).
  //    - Append log entry to state and return the updated GameState.

  return state;
}


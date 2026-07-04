import crypto from "node:crypto";
import type { Dictionary } from "./dictionary.js";
import { SnatchError } from "./errors.js";
import type { GameState, Tile } from "./types.js";

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
  // TODO: Implement the claim logic:
  // 1. Verify word length is >= 4.
  // 2. Validate word against the dictionary. (If invalid, deduct 1 point and return new state).
  // 3. Verify all letters of the word are available in the face-up pool.
  // 4. Remove the consumed tiles from the pool.
  // 5. Add the new word (with its tiles and text) to the player's held words.
  // 6. Update player's score: +2 points per letter gained (which is all letters in this case).
  // 7. Return the updated GameState.

  if (wordText.length < 4) {
    throw new SnatchError("WORD_TOO_SHORT", "Word must be at least 4 letters long.");
  }

  const playerIndex = state.players.findIndex((p) => p.id === playerId);
  if (playerIndex === -1) {
    throw new SnatchError("PLAYER_NOT_FOUND", "Player not found.");
  }

  if (!dictionary.isValid(wordText)) {
    const updatedState: GameState = {
      ...state,
      players: state.players.map((p, idx) =>
        idx === playerIndex ? { ...p, score: p.score - 1 } : p
      ),
    };
    throw new SnatchError("INVALID_WORD", "Word is not in the dictionary", updatedState);
  }

  const consumedTiles: Tile[] = [];
  const remainingPool = [...state.tilePool];

  for (const letter of wordText.toUpperCase()) {
    const tileIndex = remainingPool.findIndex(
      (tile) => tile.letter.toUpperCase() === letter
    );

    if (tileIndex === -1) {
      throw new SnatchError(
        "POOL_LETTERS_TAKEN",
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

  return updatedState;
}

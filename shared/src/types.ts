// Define player, tile, word, turn, and game state structures here.

/**
 * Represents a single tile (e.g., a letter tile from the bag or pool).
 */
export interface Tile {
  id: string;
  letter: string;
}

/**
 * Represents a word held by a player.
 */
export interface Word {
  id: string;
  text: string;
  tiles: Tile[];
}

/**
 * Represents a player in the game.
 */
export interface Player {
  id: string;
  name: string;
  score: number;
  words: Word[];
}

/**
 * The possible statuses of a game room.
 */
export type GameStatus = "waiting" | "playing" | "gameover";

/**
 * Represents the complete state of a game room at a point in time.
 */
export interface GameState {
  status: GameStatus;
  players: Player[];
  tileBag: Tile[];
  tilePool: Tile[];
  activePlayerId: string | null;
  flipTimer: number;
}

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
 * The types of events that can be recorded in the running game log.
 */
export type LogEntryType = "valid_claim" | "valid_steal" | "invalid_word" | "impossible";

/**
 * Represents a single action/attempt recorded in the running game log.
 */
export interface LogEntry {
  id: string;
  timestamp: number;
  playerId: string;
  playerName: string;
  word: string;
  type: LogEntryType;
  sourceWords?: string[]; // The text of any words that were stolen
}

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
  log: LogEntry[];
}


/**
 * Socket.IO events sent from the client to the server.
 */
export interface ClientToServerEvents {
  joinRoom: (name: string, roomCode: string) => void;
  flipTile: () => void;
  submitWord: (word: string) => void;
}

/**
 * Socket.IO events sent from the server to the client.
 */
export interface ServerToClientEvents {
  gameStateUpdate: (state: GameState) => void;
  gameError: (payload: { message: string, code?: string}) => void;
}


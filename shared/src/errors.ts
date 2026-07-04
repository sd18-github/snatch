import type { GameState } from "./types.js";

/**
 * Custom error class for Snatch rule violations and game actions.
 */
export class SnatchError extends Error {
    constructor(
        public code: string,
        message: string,
        public state?: GameState
    ) {
        super(message);
        this.name = "SnatchError";
    }
}

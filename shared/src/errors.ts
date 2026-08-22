import type { GameState } from "./types.js";
import type { SnatchErrorCode } from "./errorCodes.js";

/**
 * Custom error class for Snatch rule violations and game actions.
 */
export class SnatchError extends Error {
    constructor(
        public code: SnatchErrorCode,
        message: string,
        public state?: GameState
    ) {
        super(message);
        this.name = "SnatchError";
    }
}

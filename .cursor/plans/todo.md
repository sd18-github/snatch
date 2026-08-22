# Snatch Implementation Plan

This is the master todo list for the Snatch game implementation, tracked per the instructions in [instructions.md](file:///c:/Users/shiva/OneDrive/Documents/Coding/Coding%20Projects/snatch-2/instructions.md).

## Phase 1: Shared Data Structures and Core Types
- [x] Define player, tile, and word structures in `[shared/src/types.ts](file:///c:/Users/shiva/OneDrive/Documents/Coding/Coding%20Projects/snatch-2/shared/src/types.ts)`
- [x] Define game state structure (tile pool, player states, scores, turn state)
- [x] Define Socket.IO event payload contracts

## Phase 2: Core Game Logic Engine
- [x] Implement tile bag initialization and flipping logic in `[shared/src/game.ts](file:///c:/Users/shiva/OneDrive/Documents/Coding/Coding%20Projects/snatch-2/shared/src/game.ts)`
- [x] Implement word validation (dictionary lookup interface)
- [x] Implement claim rules (letters from pool, length >= 4)
- [ ] Implement steal rules (single source requiring pool letter, multi-source, self-steals, affix/root heuristic check)
- [ ] Implement scoring logic (+1 per letter gained, -1 per letter lost, -1 for invalid dictionary shout)
- [ ] Write unit tests in Vitest to verify all rule variants from `[rules.md](file:///c:/Users/shiva/OneDrive/Documents/Coding/Coding%20Projects/snatch-2/rules.md)`

## Phase 3: Server Room & Connection Manager
- [ ] Implement room state management (players joining, active status, turn order)
- [ ] Implement round-robin turn timer (10s flip countdown with automatic pass on timeout)
- [ ] Implement simultaneous message handling (first request to arrive wins, conflicts rejected with explicit errors)
- [ ] Connect Socket.IO events to core game engine logic

## Phase 4: Frontend UI
- [ ] Synchronize game state from server to client with reactive updates
- [ ] Implement game header with turn indicator and flip timer
- [ ] Render face-up tile pool and active flip button
- [ ] Render players' lists of held words and current scores
- [ ] Implement word submission controls for claims and steals (selecting pool tiles and held words to form new ones)

# Snatch — house rules (online)

This document is the **authoritative ruleset** for this implementation. Other refinements can be added later by agreement.

Unless a room config says otherwise, **minimum word length** (`minWordLength`) is **4** for any word that is **claimed** or that **remains / results** on the table as a held word after a steal.

---

## Turns (flip)

- **Order:** Round-robin among seated players.
- **Timer:** The active player has **10 seconds** to flip one tile from the face-down bag to the face-up pool.
- **Timeout:** If they do not flip before time expires, **flip rights pass immediately** to the **next** player in order (the timer resets for that player).
- **UI (client):**
  - A **header** above the game shows **whose turn** it is to flip and **time remaining** (countdown).
  - The **active player’s name** is visually **highlighted** whenever it is their turn to flip.

---

## Claims (word from the pool only)

- **Minimum length:** **4 letters** (no 3-letter words).
- **Dictionary:** The word must be **valid according to the room’s chosen dictionary** (same check the server uses for all moves).
- **Letters:** The word may use **only** letters available in the **face-up pool** (multiset: you cannot use a letter more times than it appears face-up).
- **No steal:** A claim does not take letters from any player’s held words—pool only.

---

## Steals (take / reshape held word(s))

Steals may use words **you hold** and/or words **opponents hold** (subject to whatever the UI exposes—typically you only rearrange words on the table you can “reach,” which online is all opponents’ words).

### Single source (one held word)

- **Composition:** The new word uses **every letter** of exactly **one** chosen held word (yours or someone else’s), plus **at least one** letter taken **only** from the **face-up pool**.
- **Pool usage:** Letters removed from the pool equal the multiset difference between the new word and that source word.

### Multiple sources (merge two or more held words)

- **Composition:** The new word uses **every letter** of **each** of **two or more** chosen held words—i.e. the multiset of the new word is exactly the **union** of the multisets of those source words, **plus** any **additional** letters taken **only** from the face-up pool **if necessary**.
- So: if the new word can be spelled using **only** the letters from the combined source words (no extra letters), **no pool letters** are required for that merge. If the new word needs extra letters beyond those sources, those extras must come from the pool.
- **Dictionary:** The new word must be **valid** under the room’s chosen dictionary.
- **Removing sources:** Each source word used is removed from whoever held it; the new word is credited to the player making the steal.

### Own words only, no pool letters (reform / merge)

- A player may **combine only their own** held word(s) into a new word using **no** letters from the face-up pool, as long as all other steal rules hold (multiset, dictionary, affix rules, etc.).
- **Scoring:** These moves **do not change anyone’s score** (no letters cross the “edge” of the table to or from the pool or another player’s area). They are **layout-only** for that player.

### Rules common to all steals

- **Own words:** Steals **from your own** held word(s) are **explicitly allowed** (single- or multi-source, same constraints).
- **Dictionary:** The new word must be **valid** under the room’s chosen dictionary.
- All other steal rules below (affix / morphology, validation order online, etc.) apply to **every** steal, including self-steals and multi-source steals.

### Affixes, morphology, and “same root”

Players cannot abuse steals that only **inflect** or lightly **extend** a source word (or the obvious combined “base”) without a meaningful lexical change. Examples of disallowed patterns include:

- Simple **suffix-only** extensions: e.g. `TEAR` → `TEARS`, `PEEL` → `PEELED`, `WED` → `WEDDED`, `JUMP` → `JUMPING`, `SEX` → `SEXES`, `DUST` → `DUSTY`, …
- More **aggressive** morphology where the stolen string still acts as the clear base: e.g. `SAYS` → `SAYINGS`, `FUND` → `DEFUNDING`, `NUDE` → `DENUDING`, …

**Multi-source merges** are still subject to these affix / root rules: a merge must not be a disguised way to do the same kind of inflection-only stretch using more than one source word.

**Ideal (target) rule:** The **stem/root** of the new word should **not** be the same as that of the (combined) source material in a linguistic sense (e.g. `MUST` → `MUSTY` should be **allowed** when `MUST` is the sole source word). For **multi-source** steals, how “same root” is judged may need a defined policy (e.g. compare against each source, or against the longest source)—refine in implementation notes when you add NLP.  

**Reality:** Detecting “same root” accurately is an **NLP / lemmatization** problem. There is no single off-the-shelf answer that is perfect for all dictionaries and edge cases.

**MVP / fallback (if NLP is too heavy or unreliable):**

- Disallow a fixed list of **productive prefixes** (e.g. `RE-`, `UN-`, `DE-`, … — to be enumerated in code/config).
- Disallow steals that are **suffix-only** extensions of a **single** source word **without rearrangement** of that word’s letters (and optionally block common suffix patterns like plural `S`, `ING`, `ED`, … as configured).
- For **multi-source** merges, extend MVP checks so a result is **not** automatically legal just because letters balance—for example, reject when a whole source word appears **in order as a contiguous substring** of the result **and** the remainder looks like a blocked affix / inflection of that base. Tighten over time; until NLP exists, prefer **false negatives** over abusive **false positives** if you must choose.

The implementation may **start** with this fallback and **upgrade** to lemma/stem checks (e.g. dictionary-specific or library-assisted) when a maintainable approach is chosen.

---

## Simultaneous shouts (online)

In a physical game, two players might shout at once. **Online behavior:**

- The **server** is the single authority. It processes **move requests in the order they are received** (per connection / message ordering as implemented).
- The **first legally valid** claim or steal (after validation against state, dictionary, timer, and rules above) **wins** and updates state.
- **Later** requests that conflict with the new state (e.g. same pool letters already consumed, a source word no longer held by anyone) are **rejected** with a **clear, specific error** (e.g. `POOL_LETTERS_TAKEN`, `WORD_NO_LONGER_AVAILABLE`, `INVALID_WORD`, `AFFIX_RULE_VIOLATION`, …).

**Player expectation:** Everyone accepts that **network latency** and **message order** decide ties; this is documented here so it is not ambiguous.

---

## Scoring

Scores are tracked in **points** (integer; implementation may allow negative totals).

### Letter gains and losses

After each **successful** claim or steal (any move that changes which letters sit in front of which player or leaves the pool), update scores as follows:

- **+2 points** for each letter **gained** by a player on their side of the table (letters that were **not** in front of that player before the move, but are after—typically from the pool or from an opponent’s word(s) taken into their new word).
- **−2 points** for each letter **lost** by a player from their side (letters that were in front of them before, but are not after—because a word was stolen, merged away, or broken up by another player’s move).

**Pool:** Letters in the face-up pool belong to **no** player. Moving letters **from the pool** to your words counts as **you gaining** those letters. Moving letters **from your words** to the pool (if any rule allows that) would count as **you losing** them.

**Netting:** If a single move both removes and adds letters for one player, apply **gains** and **losses** separately (count each letter once in the appropriate bucket).

### Own-only reform / merge (no pool, no opponent words)

- As under **Steals → “Own words only, no pool letters”** above: **no score change** for any player.

### Invalid word (not in the dictionary)

- If a player submits a **claim or steal** that is **rejected** because the word is **not valid** in the room’s dictionary (or fails dictionary lookup), that **same player** loses **1 point**.
- The **board state is unchanged** by that attempt (the move does not apply).

---

## Challenges *(optional — design TBD)*

> **Status:** Not required for the first implementation. Turn on when you have UX + server time for it.

Idea: after a player successfully places a word, **another player may “challenge”** them to justify that word.

- **Process (sketch):** The challenged player must **explain the meaning** of the word to the table’s satisfaction.
- **Resolution:** **All players except** the challenged player and the challenger vote on whether the explanation is satisfactory. If the vote is **tied**, the **challenger’s vote** is the **tiebreaker** (challenger’s side wins the tie).
- **If the challenge succeeds** (explanation not satisfactory): **tiles involved in that word return** to the board (implementation: e.g. return letters to the **face-up pool** in a defined order, or as house rule prefers). The **challenged player loses the points** they had gained for that word (undo that move’s **scoring effect** only for that word). **No extra penalty** beyond that reversal (unless you add a house rule later).
- **If the challenge fails** (word / explanation upheld): define in a later revision whether the **challenger** pays a small penalty, cooldown, etc. *(Not specified here.)*

---

## Summary table

| Topic | Rule |
|--------|------|
| Flip order | Round-robin |
| Flip timer | 10 s; else next player flips |
| Claim min length | 4 letters |
| Claim letters | Face-up pool only |
| Steal | Own and others’ words; 1 source → all its letters + **≥1** from pool; 2+ sources → **all** letters from **each** source + pool **if needed**; dictionary + affix rules apply |
| Same-root / affix | Ideal: NLP/stem; MVP: blocked prefixes + suffix heuristics |
| Ties | Server receive order; first valid wins; others get explicit errors |
| Scoring | +2 per letter **gained** on your side; −2 per letter **lost** from your side; own-only no-pool reform/merge → **0**; invalid dictionary attempt → **−1** to submitter, no board change |
| Challenges | **Optional** — vote among others, challenger breaks tie; on success revert tiles + challenged loses points for that word; details TBD |

---

## Changelog

- **Initial:** Turns, claims (4+), steals + affix philosophy, simultaneous resolution as above.
- **Update:** Steals allowed **from your own** words; steals may merge **two or more** held words using **all** letters from each, with pool letters **only if needed** (single-source steals still require **≥1** pool letter).
- **Update:** Own-only, no-pool **reform/merge** is **score-neutral**; **scoring** (+2/−2 per letter gained/lost, −1 for invalid dictionary attempt); **optional challenges** sketched (vote, challenger tiebreak, revert + point undo).
- **Update:** Multi-source steals subject to same affix/root intent; MVP heuristic for multi-source merges (substring + affix remainder).

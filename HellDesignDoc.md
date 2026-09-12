# ♥ Infinite Heart — Hell Mode Design Tracker

> This document is filled in one hell at a time during design sessions.
> Status: 🔴 Not discussed | 🟡 In progress | 🟢 Locked in

---

## Standard Merged Pool

| # | Hell | Heart Color | Status |
|---|------|-------------|--------|
| 1 | **Dodge Hell** | 🔴 Red | 🔴 |
| 2 | **Shield Hell** | ❓ TBD | 🔴 |
| 3 | **String Hell** | ❓ TBD | 🔴 |
| 4 | **Gravity Hell** | 🔵 Dark Blue | 🔴 |
| 5 | **Laser Hell** | ❓ TBD | 🔴 |
| 6 | **Projectile Hell** | ❓ TBD | 🔴 |
| 7 | **Fruit Ninja Hell** | ❓ TBD | 🔴 |
| 8 | **Shooter Hell** | 🟡 Yellow | 🔴 |

## Breakout Modes

| # | Hell | Heart Color | Status |
|---|------|-------------|--------|
| 9  | **Kamikaze Hell** | ❓ TBD | 🔴 |
| 10 | **Dark Maze Hell** | ❓ TBD | 🔴 |
| 11 | **Hole in the Wall Hell** | ❓ TBD | 🔴 |
| 12 | **Typing Test Hell** | ❓ TBD | 🔴 |
| 13 | **Music Hell (Boss)** | ❓ TBD | 🔴 |

---

## Design Template (filled per hell)

```
HELL NAME
─────────────────────────────────────────────────────────
Heart Color       :
Boundary          :
─────────────────────────────────────────────────────────
ATTACKS
  Patterns        :
  Projectile Types:
  Indicators      :
─────────────────────────────────────────────────────────
TIMER ECONOMY
  Near Miss +time :
  Hit −time       :
  Special rules   :
─────────────────────────────────────────────────────────
NOTES / SPECIAL MECHANICS
```

---

## 1. Dodge Hell 🟡 *(attack patterns TBD)*
*Reference: Undertale red heart — pure 8-way movement, no restrictions*

```
Heart Color       : ❤️  Classic Red
Boundary          : Largest possible square centered on screen (no visible walls,
                    just a movement limit — uses full screen real estate)
─────────────────────────────────────────────────────────
ATTACKS
  Patterns        : 🔴 TBD — discuss at end of all hells
  Projectile Types: 🔴 TBD
  Indicators      : ❗ Flash at spawn position + exclamation mark + brief flicker
                    before projectile appears (warn BEFORE they spawn in)
─────────────────────────────────────────────────────────
TIMER ECONOMY
  Near Miss +time : +1s
  Hit −time       : −6s
  Special rules   : • One projectile can only HIT the player once (no re-hit)
                    • One projectile can only trigger near-miss ONCE
                    • Both flags are per-bullet lifetime
─────────────────────────────────────────────────────────
NOTES / SPECIAL MECHANICS
  Purest form — no gimmicks, just movement skill.
  The baseline all other hells are measured against.
```

---

## 2. Shield Hell 🟢 *(indicators TBD — core design LOCKED)*
*Reference: Undyne from Undertale — directional shield orbiting heart*

```
Heart Color       : 💚 Green (Undertale green heart)
Shield            : Light Blue curved arc — 4 directional (Up/Down/Left/Right)
Boundary          : TWO zones:
                    • OUTER zone: Full large square (same as Dodge Hell) — arrows
                      SPAWN from the edges of this boundary
                    • INNER zone: Small box at screen CENTER — heart is LOCKED
                      here, cannot leave. Player only controls shield direction.
─────────────────────────────────────────────────────────
ATTACKS
  Projectile Types:
    [CYAN ARROW]   Normal. Points toward heart. Straight-line path directly
                   into the inner box. Block with correct shield side.

    [YELLOW ARROW] Deceptive. Faces the OPPOSITE direction of travel (looks
                   like it's going away). Spawns from one side but MID-FLIGHT
                   snaps/curves to attack from the OPPOSITE side.
                   e.g. Spawns LEFT side → switches → hits from RIGHT.
                   Player must read the fake-out and flip their shield.

  Indicators      : 🔴 TBD — discuss at end of all hells
─────────────────────────────────────────────────────────
TIMER ECONOMY
  Timer Behavior  : ⏸ PAUSED — clock does NOT tick down during Shield Hell
  Near Miss +time : N/A (timer paused, no graze mechanic)
  Hit −time       : −1s per arrow that hits the heart
  Block +time     : ✅ NONE — Shield Hell is a pure penalty phase. You cannot
                    gain time here under any circumstance. Only lose.
  Special rules   : • Each arrow can only register one hit
                    • Yellow arrow path-switch is the core skill expression
─────────────────────────────────────────────────────────
NOTES / SPECIAL MECHANICS
  Paused timer reframes this as a PENALTY phase — can't gain time, only
  protect what you already have. Punishes careless blocking.
  Yellow arrow is the bluff — punishes pure muscle memory.
```

---

## 3. String Hell 🟢 *(indicators TBD — core design LOCKED)*
*Reference: Muffet from Undertale — Y-axis locked to strings, free X movement*

```
Heart Color       : 💜 Purple
Boundary          : Horizontal rectangle at screen center
                    • SHORT vertically (breadth), LONG horizontally
                    • Breadth GROWS as more strings are added to fit new lanes
─────────────────────────────────────────────────────────
STRING LAYOUT (progression)
  Phase 1         : 3 strings (start)
  Phase 2         : 5 strings (1 added top + 1 added bottom, boundary expands)
  Special Attack  : 8–9 strings — all scrolling DOWNWARD continuously.
                    Player must keep climbing UP to avoid falling off.
                    A MONSTER waits at the bottom — touching it = ❓ (see below)
─────────────────────────────────────────────────────────
ATTACKS
  [SPIDER]        : Travels horizontally across a specific string lane.
                    Player must snap to a different string to dodge.

  [BOUNCING BALL] : Moves diagonally, bounces off top and bottom walls of
                    the boundary. Crosses multiple string lanes — timing-based.

  [BOOMERANG]     : Travels along a single string, reaches the far wall,
                    and returns on the same string. Must dodge twice.

  [LARGE BOMB]    : Only spawns at 5-string phase. Covers 3 adjacent strings
                    simultaneously. One bomb at a time. Has a long visible
                    detonation countdown before exploding. Player must vacate
                    all 3 covered strings before detonation.

  Indicators      : 🔴 TBD — discuss at end of all hells
─────────────────────────────────────────────────────────
TIMER ECONOMY
  Near Miss +time : +2s
  Hit −time       : −6s
  Special rules   : • One projectile hits once, near-miss triggers once
                    • Bomb = single hit (−6s), not multi-hit ✅
─────────────────────────────────────────────────────────
NOTES / SPECIAL MECHANICS
  CLIMBING SUB-PHASE: Triggers as the FINAL attack before String Hell ends and
    transitions to the next hell. Plays for a fixed duration then exits.
    • 8–9 strings rendered, all scrolling DOWNWARD continuously
    • Monster sits stationary at the BOTTOM — it has a PULLING animation,
      visually dragging the strings downward (strings move, monster doesn't)
    • Contact with monster = normal hit (−6s), it is a soft floor, not a wall
    • Player must keep snapping UP to stay alive as strings scroll down beneath them

  GLOBAL RULE (confirmed): No attack in any hell ever counts as multiple hits.
    One attack instance = one hit maximum, always.
```

---

## 4. Gravity Hell 🟢 *(attack patterns TBD — core design LOCKED)*
*Reference: Sans dark blue heart — platformer physics, gravity + jump*

```
Heart Color       : 🔵 Dark Blue
Boundary          : Rectangle at screen center with SOLID floor and ceiling
                    (visible walls — heart cannot pass through top or bottom)
─────────────────────────────────────────────────────────
MOVEMENT SYSTEM
  Left / Right    : A / D keys — free horizontal movement
  Jump            : W or Space — VARIABLE HEIGHT based on hold duration
                    Short press = small hop | Hold = full height jump
                    Maximum height cap enforced
  Single jump     : No double jump — one jump per airborne phase
─────────────────────────────────────────────────────────
ATTACKS
  Projectile Types: Arrow-type spikes
  Platforms       : YES — appear in certain attacks as landing surfaces
  Gravity Flip    : YES — gravity reverses in certain attacks
                    (floor becomes ceiling, heart rotates to reflect direction)
  Patterns        : 🔴 TBD — discuss at end of all hells
  Indicators      : 🔴 TBD — discuss at end of all hells
─────────────────────────────────────────────────────────
TIMER ECONOMY
  Near Miss +time : +2s
  Hit −time       : −5s
  Special rules   : • Invincibility frames active after each hit ✅
                    • One projectile = one hit maximum (global rule) ✅
─────────────────────────────────────────────────────────
NOTES / SPECIAL MECHANICS
  Variable jump height adds a skill ceiling — players can precision-hop
  under low spikes or full-jump over tall barriers.
  Gravity flip attacks force the player to mentally remap controls
  (new floor = new frame of reference for jumping).
```

---

## 5. Laser Hell 🟢 *(patterns TBD — core design LOCKED)*
*Reference: No Humanity — telegraphed beams, spatial awareness over reaction*

```
Heart Color       : ❤️  Classic Red (same as Dodge Hell)
Boundary          : ENTIRE SCREEN — no box, full play area
─────────────────────────────────────────────────────────
ATTACKS
  Projectile Types: Lasers — multiple firing SIMULTANEOUSLY
                    Designed to overwhelm the screen in a balanced way
  Directions      : TBD — discuss at end of all hells
  Patterns        : TBD — discuss at end of all hells
─────────────────────────────────────────────────────────
TELEGRAPH SYSTEM
  Phase 1 (warn)  : Faint line appears at laser position
                    Line GLOWS BRIGHTER as the countdown progresses
                    (visual pressure builds — player reads the room and moves)
  Phase 2 (fire)  : Laser expands into a full lethal beam — 0.5s active
  Safe gaps       : NOT guaranteed — some patterns are intentionally brutal.
                    Player may NEED to reposition DURING the telegraph window
                    to find safety before the beam fires.
─────────────────────────────────────────────────────────
TIMER ECONOMY
  Near Miss +time : +1s (same as Dodge Hell)
  Hit −time       : −6s (same as Dodge Hell)
  Graze rule      : Near miss ONLY triggers AFTER the laser has FIRED.
                    Grazing a telegraph line does NOT count.
                    Must thread the edge of a live, active beam.
  Special rules   : • One laser = one hit maximum (global rule) ✅
                    • Graze flag per laser per fire cycle
─────────────────────────────────────────────────────────
NOTES / SPECIAL MECHANICS
  The "graze only on a live beam" rule raises the skill ceiling significantly —
  you earn +time by threading the edge of a beam that could instantly kill you.
  The overwhelm-by-design philosophy: multiple simultaneous lasers means
  the screen is never quiet. Players must read 2–4+ telegraphs at once
  and plan their path before any of them fire.
```

---

## 6. Projectile Hell 🟢 *(patterns TBD — core design LOCKED)*
*Reference: Touhou/Danmaku — dense math-driven patterns. Treat as a sub-mode of Dodge Hell.*

```
Heart Color       : ❤️  Classic Red (identical to Dodge Hell)
Boundary          : Largest possible square centered on screen (identical to Dodge Hell)
─────────────────────────────────────────────────────────
ATTACKS
  Projectile Types: Knives, Bombs, Orbs (Normal projectiles — linear velocity)
                    Dense patterns: spirals, sine waves, shotgun bursts
  Patterns        : 🔴 TBD — discuss at end of all hells
  Indicators      : ❗ Flash at spawn position + exclamation mark + brief flicker
                    (identical to Dodge Hell indicator system)
─────────────────────────────────────────────────────────
TIMER ECONOMY
  Near Miss +time : +1s (identical to Dodge Hell)
  Hit −time       : −6s (identical to Dodge Hell)
  Special rules   : • One projectile hits once, near-miss triggers once (global rule) ✅
─────────────────────────────────────────────────────────
NOTES / SPECIAL MECHANICS
  Functionally a sub-mode of Dodge Hell — same rules, same feel.
  Only difference is projectile variety and pattern density (Touhou/Danmaku style).
  Can be merged with Dodge Hell by the Director or run in isolation.
```

---

## 7. Fruit Ninja Hell 🟢 *(core design LOCKED)*
*Parallel override — runs on top of ALL other hells simultaneously*

```
Heart Color       : Inherits active hell's color — no override
Boundary          : ENTIRE SCREEN — always, independent of active hell's boundary
─────────────────────────────────────────────────────────
CORE CONCEPT
  This hell has NO penalties of any kind. It is a pure BONUS / FREEBIE layer.
  It runs independently and in parallel with whatever hell is currently active.
  The player can choose to engage with it for extra time or ignore it entirely.
  RARITY: Only triggers AFTER a certain score milestone is reached.
           Very rare occurrence — a genuine reward moment, not a constant distraction.
─────────────────────────────────────────────────────────
ENTITIES — POCKET WATCHES WITH WINGS
  Visual          : Pocket watches with animated wings, time bonus written on face
  Movement        : Fly from one side of screen to other, fluttering up/down randomly
  Count on screen : 1 at a time — only one watch ever flies at once
  On slice        : Watch destroyed — player gains bonus time printed on face
  On miss         : Watch flies off screen — NO penalty, just lost opportunity
  Bonus range     : +8s to +15s (random within range per watch)
─────────────────────────────────────────────────────────
SLICING INPUT
  Mechanic        : Cursor swipe — directional drag gesture, NO click required
  Cursor trail    : White slashing trail ALWAYS visible when mouse moves (not just fast swipes)
  Slice detection : Swipe must intersect the watch hitbox to register
  One slice only  : Each watch can only be sliced once
─────────────────────────────────────────────────────────
TIMER ECONOMY
  Watch sliced    : +8s to +15s (value shown on watch face)
  Watch missed    : +0s — no penalty, ever
  Bullet dodging  : Inherits near-miss and hit values of the currently active hell
─────────────────────────────────────────────────────────
NOTES / SPECIAL MECHANICS
  Pocket watch visual reinforces the time loop theme — catching time mid-flight.
  Score-gated rarity makes each appearance feel like a meaningful event.
  Always-on cursor trail adds a satisfying feel to mouse movement even between slices.
```

---

## 8. Shooter Hell 🟢 *(attack patterns TBD — core design LOCKED)*
*Reference: Mettaton Pacifist Fight — yellow heart, offensive gameplay*

```
Heart Color       : ★  Yellow — UPSIDE DOWN heart sprite
Boundary          : Square box at center of screen
─────────────────────────────────────────────────────────
MOVEMENT
  Standard WASD   : Full movement within the square box
─────────────────────────────────────────────────────────
SHOOTING MECHANIC
  Input           : Spacebar — fires a yellow orb with a trail
  Direction       : Strictly UPWARD only — no directional aim
  Cooldown        : ~0.33s between Space presses (short but not spammable)
  Damage          : Single orb destroys any enemy or block instantly
─────────────────────────────────────────────────────────
ENEMIES & BLOCKS
  Spawn location  : Top of the ENTIRE screen, CENTER zone only
                    (within the horizontally shootable range for the player)
  Behavior phase 1: Drop downward from the top toward the player
  Behavior phase 2: At 1/4 box height from top — enemy slides LEFT or RIGHT
                    to the SIDE of the box (now outside the shootable zone)
  Behavior phase 3: Enemy fires ONE shot aimed at the heart, then exits screen
  Kill condition  : 1 orb = instant destroy (enemy or block)
─────────────────────────────────────────────────────────
ENEMY SHOT BEHAVIOR
  Direction       : Aimed directly at the heart's current position
  Approach effect : As the shot nears the box boundary —
                    • Grows 50% larger in size
                    • Slows down noticeably
                    This acts as a natural visual telegraph — player has a
                    clear window to react before it enters the arena.
─────────────────────────────────────────────────────────
TIMER ECONOMY
  Near Miss +time : +1s (same as Dodge Hell)
  Hit −time       : −6s (same as Dodge Hell)
  Destroy block   : +0s — killing enemies/blocks gives NO time bonus
  Special rules   : • Global one-hit rule applies ✅
                    • Invincibility frames after hit ✅
─────────────────────────────────────────────────────────
NOTES / SPECIAL MECHANICS
  Attack patterns : TBD — Pacifist Mettaton fight as reference
  The side-slide creates a hard skill gap: shoot early = neutralize cleanly.
  Miss = deal with a slow, looming retaliation shot that telegraphs itself
  by growing large near the box edge. Fair but punishing.
```

---

## 9. Kamikaze Hell 🟢 *(patterns TBD — core design LOCKED)*
*Auto-scrolling side-scroller — planes, gravity, dash*

```
Heart Color       : 🔵 Dark Blue (gravity is active in this mode)
Boundary          : ENTIRE SCREEN
                    • Floor at bottom — hard boundary, heart cannot go below
                    • No ceiling boundary — top is open
                    • Camera auto-scrolls RIGHT continuously
─────────────────────────────────────────────────────────
MOVEMENT SYSTEM (gravity-based, same physics as Gravity Hell)
  A / D           : Left / Right movement
  W               : Jump only
  Space           : Dash — single tap in current A/D walking direction ✅
                    Jump direction does NOT count for dash direction
                    Dash grants i-frames for its duration
─────────────────────────────────────────────────────────
PLANES (enemies)
  Spawn locations : Top-right half of screen + right side of screen
  Travel direction: Diagonal — SOUTHWEST (down + left)
  Size variation  : TBD — discuss at end of all hells
  Patterns        : TBD — discuss at end of all hells
  Indicators      : TBD — discuss at end of all hells
─────────────────────────────────────────────────────────
TIMER ECONOMY
  Near Miss +time : +1s (same as Dodge Hell) — grazing a plane wing counts ✅
  Hit −time       : −6s (same as Dodge Hell)
  Special rules   : • Invincibility frames active after each hit ✅
                    • Global one-hit rule applies ✅
─────────────────────────────────────────────────────────
NOTES / SPECIAL MECHANICS
  Planes fall diagonally SW — player must predict crossing paths while
  also managing the forced rightward camera scroll.
  Dash direction locked to A/D walking axis — cannot dash vertically.
  Dark blue heart confirms gravity physics carry over from Gravity Hell.
```

---

## 10. Dark Maze Hell 🔴
*Global darkness, small light radius around heart, navigate to exit*

```
Heart Color       : ❓
Boundary          : ❓ (maze walls = boundary)
─────────────────────────────────────────────────────────
ATTACKS
  Patterns        : Static + moving wall geometry
  Projectile Types: Wall collision
  Indicators      : ❓
─────────────────────────────────────────────────────────
TIMER ECONOMY
  Near Miss +time : ❓
  Hit −time       : ❓
  Special rules   : Time limit to find exit?
─────────────────────────────────────────────────────────
NOTES / SPECIAL MECHANICS
  Reference: Jevil/Jackenstein from Deltarune
```

---

## 11. Hole in the Wall Hell 🟢 *(patterns TBD — core design LOCKED)*
*Giant walls with one gap — align heart or take damage*

```
Heart Color       : ❤️  Classic Red
Boundary          : Side walls only (left + right screen edges)
                    Top and bottom are OPEN — that's where walls come from
─────────────────────────────────────────────────────────
WALL BEHAVIOR
  Phase 1         : Walls approach from the TOP only
  Phase 2         : After a time threshold — walls alternate TOP and BOTTOM
                    (can have a top wall and bottom wall both on screen)
  Gap             : Single gap per wall — PURE ABSENCE of wall, no highlight
                    Gap size stays FIXED — only speed increases over time
  Simultaneous    : Multiple walls on screen at once — shorter intervals
                    between spawns as difficulty increases
  Speed scaling   : Logarithmic increase over 30s–1min runtime
─────────────────────────────────────────────────────────
TIMER ECONOMY
  Thread gap      : +1s — threading through the gap (near miss style)
  Hit −time       : −5s
  Special rules   : • Invincibility frames active after each hit ✅
                    • Wall collision is NOT instant fail — just time penalty
                    • Global one-hit rule applies ✅
─────────────────────────────────────────────────────────
NOTES / SPECIAL MECHANICS
  Patterns        : TBD — discuss at end of all hells
  Indicators      : TBD — discuss at end of all hells
  The pure absence gap keeps it visually clean — no hand-holding.
  Phase 2 alternating top+bottom walls forces the player to track
  two approach directions simultaneously.
```

---

## 12. Typing Test Hell 🟢 *(core design LOCKED)*
*30-character WASD string — hidden correct counter, +3s rewards, -1s on mistake*

```
Heart Color       : Inherits previous hell's color — heart CENTERS on screen
                    No color change. No movement during typing phase.
─────────────────────────────────────────────────────────
WARNING INDICATOR
  Trigger         : Random red flicker from TOP of screen
  Text            : "BE READY" flashes before the string appears
  Feel            : Sudden, disorienting — not a slow buildup
─────────────────────────────────────────────────────────
STRING RULES
  Length          : Exactly 30 characters
  Characters      : W, A, S, D only + single spaces
  Space rules     : No adjacent spaces allowed
                    Multiple spaces can appear throughout the string
  Time limit      : 5 seconds — then hell ends and next hell begins regardless
─────────────────────────────────────────────────────────
CORRECT COUNTER (HIDDEN from player)
  Mechanic        : Internal counter tracking consecutive correct keypresses
  Reward          : Every 8 consecutive correct characters → +3s
                    Counter resets to 0 after each reward trigger
  On wrong key    : −1s immediately + counter resets to 0
  Visibility      : Counter is NEVER shown to player — purely felt through timing
─────────────────────────────────────────────────────────
TIMER ECONOMY
  8 correct streak  : +3s (hidden milestone)
  Wrong character   : −1s + correct counter reset
  Main clock        : ⏸ PAUSED — the 5-second window IS the phase timer
─────────────────────────────────────────────────────────
NOTES / SPECIAL MECHANICS
  Bullets          : NOT flying — action completely freezes during typing phase
  The hidden counter creates natural risk/reward — panicking after a mistake
  and mashing costs more time than staying calm and rebuilding streak.
  "BE READY" flicker gives just enough warning to shift mental focus
  from dodging to typing without being generous about it.
```
```

---

## 13. Music Hell (Boss Mode) 🟡 *(projectile reference TBD — core design LOCKED)*
*Full-screen boss fight — synced to music, most intense phase*

```
Heart Color       : ❤️  Classic Red
Boundary          : ENTIRE SCREEN — every single pixel used, no box
─────────────────────────────────────────────────────────
MOVEMENT
  WASD            : Full 2D free movement across entire screen
  Space           : Dash — available in this phase ✅
─────────────────────────────────────────────────────────
MUSIC & PROJECTILES
  Music track     : Audio from https://youtu.be/Qskm9MTz2V4
  Projectiles     : Synced to the video above — patterns TBD pending video ID
                    Reference: TBD (user to confirm video title/source)
  Patterns        : TBD — discuss at end of all hells
  Indicators      : TBD — discuss at end of all hells
─────────────────────────────────────────────────────────
TIMER ECONOMY
  Near Miss +time : NONE — no graze/near miss mechanic in this phase
  Hit −time       : −3s (more lenient — some hits are unavoidable by design)
  Fruit Ninja     : Pocket watches spawn MORE FREQUENTLY during Music Hell
                    All Fruit Ninja rules still apply (+8s to +15s per watch)
─────────────────────────────────────────────────────────
NOTES / SPECIAL MECHANICS
  This is the FINAL phase / boss mode — most visually intense.
  Leniency in hit penalty is intentional: the density of patterns
  means unavoidable hits are a design reality, not a failure.
  Frequent pocket watches act as a compensation mechanic —
  skilled players can offset the unavoidable damage by catching watches.
  No near-miss system keeps the focus purely on survival + watch collection.
```

---

*Last updated: Session 1 — Design discussion started*

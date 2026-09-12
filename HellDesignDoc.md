# Infinite Heart — Hell Mode Design Document
### Team: Cant Hack It | Track 1 — Game | CYHI Hackathon

---

## STATUS OVERVIEW

| # | Hell Mode | Heart Color | Status |
|---|-----------|-------------|--------|
| 1 | Dodge Hell | Red | Core locked, patterns TBD |
| 2 | Shield Hell | Green | Locked (indicators TBD) |
| 3 | String Hell | Purple | Locked (indicators TBD) |
| 4 | Gravity Hell | Dark Blue | Locked (patterns + indicators TBD) |
| 5 | Laser Hell | Red | Locked (patterns TBD) |
| 6 | Projectile Hell | Red | Locked (patterns TBD, identical to Dodge Hell) |
| 7 | Fruit Ninja Hell | Inherits active hell | Mostly locked (watch count + range TBD) |
| 8 | Shooter Hell | Yellow | Not discussed |
| 9 | Kamikaze Hell | TBD | Not discussed |
| 10 | Dark Maze Hell | TBD | Not discussed |
| 11 | Hole in the Wall Hell | TBD | Not discussed |
| 12 | Typing Test Hell | TBD | Not discussed |
| 13 | Music Hell (Boss) | TBD | Not discussed |

---

## GLOBAL RULES

- One hit per projectile - a single projectile can only damage the player once
- One near-miss per projectile - time bonus triggers once per projectile lifetime
- No multi-hit attacks - no attack counts as more than one hit instance
- Invincibility frames - active after every hit
- Input constraints (Track 1) - only WASD, Shift, Space, and cursor swipe allowed

---

## STANDARD MERGED POOL

---

### 1. DODGE HELL
Reference: Undertale red heart - purest form of movement

Heart Color: Classic Red
Boundary: Largest possible square centered on screen, no visible walls

Attack Indicators: Flash at spawn position + exclamation mark + brief flicker BEFORE projectile spawns
Attack Patterns: TBD
Projectile Types: TBD

Timer Economy:
- Near miss (graze): +1s
- Hit: -6s

Notes: Baseline hell - no mechanic restrictions, pure movement skill. Both hit and near-miss flags are per-bullet lifetime.

---

### 2. SHIELD HELL
Reference: Undyne from Undertale

Heart Color: Green
Shield: Light blue curved arc, snaps to Up/Down/Left/Right

Boundary - TWO ZONES:
- Outer Zone: Full large square - arrows spawn from edges
- Inner Zone: Small box at screen center - heart LOCKED here, player only controls shield direction

Projectile Types:
- Cyan Arrow: Normal, points toward heart, straight-line. Block with correct shield side.
- Yellow Arrow: Deceptive. Faces OPPOSITE direction of travel. Spawns one side, mid-flight snaps to attack from OPPOSITE side. Player must read fake-out and flip shield.

Attack Indicators: TBD

Timer Economy:
- Timer: FROZEN - clock does not tick during Shield Hell
- Correct block: No reward, zero time gain
- Hit: -1s per arrow
- Near miss: N/A (timer paused)

Special Rules: Pure penalty phase - cannot gain time. Yellow arrow path-switch is the core skill test. One hit per arrow.

---

### 3. STRING HELL
Reference: Muffet from Undertale

Heart Color: Purple
Boundary: Horizontal rectangle at center - short vertically, long horizontally. Height grows as strings are added.

String Layout:
- Phase 1: 3 strings
- Phase 2: 5 strings (1 top, 1 bottom added, boundary expands)
- Climbing Sub-Phase: 8-9 strings (final attack before hell ends)

Movement: Free X-axis. Y-axis locked - Up/Down snaps to adjacent string instantly.

Projectile Types:
- Spider: Horizontal across one string lane. Snap to different string to dodge.
- Bouncing Ball: Diagonal, bounces off top and bottom walls, crosses multiple lanes.
- Boomerang: Along one string to far wall, reverses, returns. Dodge twice.
- Large Bomb: 5-string phase only. Covers 3 adjacent strings. Long countdown. Single hit (-6s).

Attack Indicators: TBD

Timer Economy:
- Near miss: +2s
- Hit: -6s

Climbing Sub-Phase (final attack):
- 8-9 strings scrolling DOWNWARD continuously
- Monster at bottom has pulling animation - strings move, monster stays still
- Contact with monster = normal hit (-6s), soft floor not a wall
- Player must keep snapping UP to survive

---

### 4. GRAVITY HELL
Reference: Sans dark blue heart - platformer physics

Heart Color: Dark Blue
Boundary: Rectangle at center with solid floor and ceiling (visible walls)

Movement:
- A/D: Left/Right
- W or Space (tap): Small hop
- W or Space (hold): Full jump - height scales with hold duration up to a cap
- Single jump only, no double jump

Projectile Types: Arrow-type spikes

Special Attack Modifiers:
- Platforms: Appear as landing surfaces in certain attacks
- Gravity Flip: Gravity reverses in certain attacks, heart rotates, floor becomes ceiling

Attack Patterns: TBD
Attack Indicators: TBD

Timer Economy:
- Near miss: +2s
- Hit: -5s

Special Rules: Invincibility frames after each hit. One projectile = one hit max.

---

### 5. LASER HELL
Reference: No Humanity - telegraphed beams

Heart Color: Classic Red (same as Dodge Hell)
Boundary: ENTIRE SCREEN - no box, full play area

Lasers: Multiple fire SIMULTANEOUSLY - overwhelm the screen in a balanced way. Players must read 2-4+ telegraphs at once.

Telegraph System:
- Warning (1.5s): Faint line at laser position glows BRIGHTER as countdown progresses
- Fire (0.5s): Laser expands into full lethal beam

Safe Gaps: NOT always guaranteed. Some patterns intentionally brutal - player must reposition DURING telegraph window to reach safety.

Laser Directions: TBD
Attack Patterns: TBD

Timer Economy:
- Near miss (graze): +1s (same as Dodge Hell)
- Hit: -6s (same as Dodge Hell)

Graze Rule: Near miss ONLY counts AFTER laser has FIRED. Telegraph line does NOT give time. Must thread edge of live, active beam.

---

### 6. PROJECTILE HELL
Reference: Touhou/Danmaku - treat as direct sub-mode of Dodge Hell

Heart Color: Classic Red (identical to Dodge Hell)
Boundary: Largest possible square (identical to Dodge Hell)
Attack Indicators: Flash + exclamation mark + flicker (identical to Dodge Hell)

Projectile Types: Knives, Bombs, Orbs - dense Danmaku-style patterns
Attack Patterns: TBD

Timer Economy:
- Near miss: +1s (identical to Dodge Hell)
- Hit: -6s (identical to Dodge Hell)

Notes: Every aspect mirrors Dodge Hell. Only differentiator is projectile variety and density. Can be merged with Dodge Hell by the Director.

---

### 7. FRUIT NINJA HELL (Pocket Watch Overlay)
Parallel override - runs on top of ALL other hells simultaneously

Heart Color: Inherits active hell's color, no override
Boundary: ENTIRE SCREEN always, independent of active hell

Core Concept: NO penalties whatsoever. Pure bonus/freebie layer. Player can engage for extra time or ignore entirely.

Entities - Pocket Watches With Wings:
- Visual: Pocket watches with animated flapping wings, time bonus printed on face (+10, +15 etc.)
- Movement: Fly from one side to other with random fluttering up/down path
- On slice: Watch destroyed, player gains printed bonus time
- On miss: Flies off screen, no penalty
- Bonus range: Up to +15s max (exact range TBD)
- Count on screen: TBD

Slicing Input:
- Mechanic: Cursor swipe/drag gesture, NO click required
- Cursor trail: White slashing trail follows cursor (behavior TBD - always visible or only on fast swipe)
- Slice detection: Swipe must intersect watch hitbox
- One slice per watch

Timer Economy:
- Watch sliced: Gain bonus time on face
- Watch missed: +0s, no penalty
- Bullet dodging: Inherits values of currently active hell

Notes: Pocket watch visual reinforces time loop theme - literally catching time mid-flight.

---

### 8. SHOOTER HELL
Reference: Mettaton from Undertale - yellow heart, offensive gameplay

Heart Color: Yellow
Boundary: TBD
Projectile Types: Destructible blocks/enemy waves
Attack Patterns: TBD
Timer Economy: TBD

---

## BREAKOUT MODES

---

### 9. KAMIKAZE HELL
Heart Color: TBD | Boundary: Infinite auto-scroll right
Mechanics: Planes drop from top. Dash (Space/Shift) gives i-frames forward.
Timer Economy: TBD

---

### 10. DARK MAZE HELL
Reference: Jackenstein from Deltarune
Heart Color: TBD | Boundary: Maze walls
Mechanics: Global darkness. Radial light follows heart. Static and moving walls. Navigate to exit.
Timer Economy: TBD

---

### 11. HOLE IN THE WALL HELL
Heart Color: TBD | Boundary: TBD
Mechanics: Screen-spanning walls with one random gap approach rapidly. Align heart with gap. Speed increases logarithmically over 30s-1min.
Timer Economy: TBD

---

### 12. TYPING TEST HELL
Heart Color: TBD
Mechanics: Screen locks. Type WASD-only words (WAS, SAD, DAD, SAW, WAD...). Input: W, A, S, D, Space only.
Timer Economy: TBD

---

### 13. MUSIC HELL (BOSS MODE)
Heart Color: TBD | Boundary: TBD
Mechanics: Piano keyboard at bottom. Note blocks fall synced to high-tempo music (Rush E, Isaac Newton Theme). Dense rhythm-synced barrage.
Timer Economy: TBD

---

Document version: Session 1 - Hells 1-7 in progress | Last updated by: Antigravity AI
Team Cant Hack It - CYHI Track 1

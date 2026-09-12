# Infinite Heart â€” Hell Mode Design Document
### Team: Cant Hack It | Track 1 â€” Game | CYHI Hackathon

---

## STATUS OVERVIEW

| # | Hell Mode | Heart Color | Status |
|---|-----------|-------------|--------|
| 1 | Dodge Hell | â¤ï¸ Red | ðŸŸ¡ Core locked, patterns TBD |
| 2 | Shield Hell | ðŸ’š Green | ðŸŸ¢ Locked (indicators TBD) |
| 3 | String Hell | ðŸ’œ Purple | ðŸŸ¢ Locked (indicators TBD) |
| 4 | Gravity Hell | ðŸ”µ Dark Blue | ðŸŸ¢ Locked (patterns + indicators TBD) |
| 5 | Laser Hell | â“ TBD | ðŸ”´ Not discussed |
| 6 | Projectile Hell | â“ TBD | ðŸ”´ Not discussed |
| 7 | Fruit Ninja Hell | â“ TBD | ðŸ”´ Not discussed |
| 8 | Shooter Hell | ðŸŸ¡ Yellow | ðŸ”´ Not discussed |
| 9 | Kamikaze Hell | â“ TBD | ðŸ”´ Not discussed |
| 10 | Dark Maze Hell | â“ TBD | ðŸ”´ Not discussed |
| 11 | Hole in the Wall Hell | â“ TBD | ðŸ”´ Not discussed |
| 12 | Typing Test Hell | â“ TBD | ðŸ”´ Not discussed |
| 13 | Music Hell (Boss) | â“ TBD | ðŸ”´ Not discussed |

---

## GLOBAL RULES (apply to ALL hells)

- **One hit per projectile** â€” a single projectile can only damage the player once, ever
- **One near-miss per projectile** â€” a single projectile can only trigger the time bonus once, ever
- **No multi-hit attacks** â€” no attack in any hell counts as more than one hit instance
- **Invincibility frames** â€” active after every hit (duration varies per hell)
- **Input constraints (Track 1)** â€” only WASD, Shift, Space, and cursor swipe are allowed. No mouse clicks.

---

## STANDARD MERGED POOL

---

### 1. DODGE HELL
> *Reference: Undertale red heart â€” purest form of movement, no gimmicks*

**Heart Color:** â¤ï¸ Classic Red

**Boundary:** Largest possible square centered on the screen. No visible walls â€” just a movement limit using the full screen real estate.

**Attack Indicators:** Flash at the spawn position + exclamation mark (â—) + brief flicker before the projectile appears. All warnings happen BEFORE the projectile spawns.

**Attack Patterns:** TBD (to be discussed at end of all hells)

**Projectile Types:** TBD

**Timer Economy**
| Event | Time Change |
|-------|-------------|
| Near miss (graze) | +1s |
| Hit | âˆ’6s |

**Special Rules:**
- This is the baseline hell â€” no mechanic restrictions, pure movement skill
- Both the hit flag and near-miss flag are per-bullet lifetime

---

### 2. SHIELD HELL
> *Reference: Undyne from Undertale â€” directional shield, block or take damage*

**Heart Color:** ðŸ’š Green

**Shield:** Light blue curved arc, snaps instantly to one of 4 directions (Up / Down / Left / Right) using arrow keys or WASD

**Boundary â€” TWO ZONES:**
- **Outer Zone:** Full large square (same size as Dodge Hell) â€” this is where arrows spawn from the edges
- **Inner Zone:** Small box at screen center â€” heart is LOCKED here and cannot leave. Player only controls shield direction.

**Projectile Types**

| Projectile | Behavior |
|------------|----------|
| ðŸ”µ Cyan Arrow | Normal. Points toward heart. Straight-line path. Block with the correct shield side. |
| ðŸŸ¡ Yellow Arrow | Deceptive. Faces the OPPOSITE direction of travel (looks like it's going away). Spawns from one side but mid-flight snaps to attack from the OPPOSITE side. Player must react to the fake-out and flip shield. |

**Attack Indicators:** TBD

**Timer Economy**
| Event | Time Change |
|-------|-------------|
| Timer | â¸ FROZEN â€” clock does not tick during Shield Hell |
| Correct block | No reward â€” zero time gain |
| Hit | âˆ’1s per arrow |
| Near miss | N/A (timer is paused) |

**Special Rules:**
- Shield Hell is a **pure penalty phase** â€” you cannot gain time here under any circumstance
- The yellow arrow's mid-flight path switch is the core skill test
- Each arrow registers one hit maximum

---

### 3. STRING HELL
> *Reference: Muffet from Undertale â€” Y-axis locked to horizontal strings*

**Heart Color:** ðŸ’œ Purple

**Boundary:** Horizontal rectangle at screen center
- Short vertically, long horizontally
- Height (breadth) **grows** as more strings are added

**String Layout â€” Progression**
| Phase | Strings | Notes |
|-------|---------|-------|
| Phase 1 | 3 strings | Starting configuration |
| Phase 2 | 5 strings | 1 added top, 1 added bottom â€” boundary expands |
| Climbing Sub-Phase | 8â€“9 strings | See special mechanics below |

**Movement:** Free X-axis movement. Y-axis locked â€” Up/Down instantly snaps heart to the adjacent string.

**Projectile Types**

| Projectile | Behavior |
|------------|----------|
| ðŸ•·ï¸ Spider | Travels horizontally across a specific string lane. Snap to a different string to dodge. |
| ðŸŽ± Bouncing Ball | Moves diagonally, bounces off top and bottom boundary walls. Crosses multiple lanes â€” timing-based. |
| ðŸªƒ Boomerang | Travels along one string to the far wall, reverses, returns on the same string. Must be dodged twice. |
| ðŸ’£ Large Bomb | 5-string phase only. Covers 3 adjacent strings. One at a time. Long visible countdown before detonation. Player must vacate all 3 covered strings before it blows. |

**Attack Indicators:** TBD

**Timer Economy**
| Event | Time Change |
|-------|-------------|
| Near miss (graze) | +2s |
| Hit | âˆ’6s |

**Special Mechanics â€” Climbing Sub-Phase:**
- Triggers as the **final attack** before String Hell ends, plays for a fixed duration
- 8â€“9 strings rendered, all scrolling **downward** continuously
- Monster sits stationary at the bottom with a **pulling animation** â€” it is visually dragging the strings down (monster doesn't move, strings move)
- Contact with monster = normal hit (âˆ’6s) â€” it is a soft floor, not an instant kill
- Player must keep snapping **upward** to stay alive as strings scroll beneath them

---

### 4. GRAVITY HELL
> *Reference: Sans dark blue heart â€” platformer physics*

**Heart Color:** ðŸ”µ Dark Blue

**Boundary:** Rectangle at screen center with a **solid floor and ceiling** (visible walls â€” heart physically cannot pass through)

**Movement System**
| Input | Action |
|-------|--------|
| A / D | Left / Right movement |
| W or Space (tap) | Small hop |
| W or Space (hold) | Full height jump â€” height scales with hold duration up to a maximum cap |
| Jump count | Single jump only â€” no double jump |

**Projectile Types:** Arrow-type spikes

**Special Attack Modifiers:**
- **Platforms** â€” appear as landing surfaces in certain attack patterns
- **Gravity Flip** â€” gravity reverses in certain attacks; heart rotates to reflect new direction; floor becomes ceiling

**Attack Patterns:** TBD

**Attack Indicators:** TBD

**Timer Economy**
| Event | Time Change |
|-------|-------------|
| Near miss (graze) | +2s |
| Hit | âˆ’5s |

**Special Rules:**
- Invincibility frames active after each hit
- One projectile = one hit maximum (global rule)
- During gravity flip, all controls remap to the new frame of reference

---

## BREAKOUT MODES

---

### 5. LASER HELL
> *Reference: No Humanity â€” telegraphed beams, spatial awareness over reaction*

**Heart Color:** TBD

**Boundary:** TBD

**Projectile Types:** Lasers (full-screen or directional beams)

**Indicators:** Faint telegraph lines â†’ expand into lethal beams after 1.5s warning â†’ beam fires for 0.5s

**Attack Patterns:** TBD

**Timer Economy:** TBD

---

### 6. PROJECTILE HELL
> *Reference: Touhou / Danmaku â€” dense patterns*

**Heart Color:** TBD

**Boundary:** TBD

**Projectile Types:** Knives, Bombs, Orbs

**Attack Patterns:** Spirals, sine waves, shotgun bursts (math-driven emitters using sin/cos)

**Timer Economy:** TBD

---

### 7. FRUIT NINJA HELL
> *Parallel override â€” slicing + dodging simultaneously*
> âš ï¸ Note: Track 1 constraint means slicing must use cursor SWIPE, not mouse clicks

**Heart Color:** TBD

**Boundary:** TBD

**Projectile Types:** Fruits (parabolic trajectory) + standard projectiles

**Timer Economy:** TBD â€” does missing a fruit cost time? Does slicing give time?

---

### 8. SHOOTER HELL
> *Reference: Mettaton from Undertale â€” yellow heart, offensive gameplay*

**Heart Color:** ðŸŸ¡ Yellow

**Boundary:** TBD

**Projectile Types:** Destructible blocks / enemy waves dropping from above

**Timer Economy:** TBD â€” does destroying blocks give +time?

---

### 9. KAMIKAZE HELL
> *Auto-scrolling breakout â€” planes, dashing*

**Heart Color:** TBD

**Boundary:** TBD â€” infinite auto-scroll to the right

**Mechanics:** Camera auto-scrolls. Planes drop vertically from top. Dash mechanic (Space/Shift) gives brief i-frames forward.

**Timer Economy:** TBD

---

### 10. DARK MAZE HELL
> *Reference: Jackenstein from Deltarune â€” navigate blind*

**Heart Color:** TBD

**Boundary:** Maze walls act as boundary

**Mechanics:** Global darkness. Small radial light follows heart. Static and moving wall geometry. Navigate to exit within time limit.

**Timer Economy:** TBD

---

### 11. HOLE IN THE WALL HELL
> *Giant walls, one gap, align and pass through*

**Heart Color:** TBD

**Boundary:** TBD

**Mechanics:** Screen-spanning walls approach rapidly. One randomized transparent gap per wall. Must align heart with the gap. Walls speed up logarithmically over 30sâ€“1min runtime.

**Timer Economy:** TBD â€” does threading the gap closely give +time?

---

### 12. TYPING TEST HELL
> *Type WASD-only words before time runs out*

**Heart Color:** TBD

**Mechanics:** Screen locks. Words composed only of W, A, S, D, Space appear (e.g. WAS, SAD, DAD, SAW, WAD). Player must type them accurately. Input restricted to those keys only.

**Timer Economy:** TBD â€” does a mistake cost time? Does perfect sequence give +time?

---

### 13. MUSIC HELL (BOSS MODE)
> *Piano keyboard bottom, falling note blocks synced to music â€” most intense phase*

**Heart Color:** TBD

**Boundary:** TBD

**Mechanics:** Piano keyboard displayed at bottom of screen. Note blocks fall from the top synced to high-tempo tracks (Rush E, Isaac Newton Theme, etc.). Heart must dodge the dense, rhythm-synced barrage.

**Attack Indicators:** Keys may light up slightly before their note drops

**Timer Economy:** TBD

---

*Document version: Session 1 | Last updated by: Antigravity AI*
*Team Cant Hack It â€” CYHI Track 1*


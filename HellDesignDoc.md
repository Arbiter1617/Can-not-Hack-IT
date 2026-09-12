# Infinite Heart — Hell Mode Design Document
### Team: Cant Hack It | Track 1 — Game | CYHI Hackathon

---

## STATUS OVERVIEW

| # | Hell Mode | Heart Color | Status |
|---|-----------|-------------|--------|
| 1 | Dodge Hell | ❤️ Red | 🟡 Core locked, patterns TBD |
| 2 | Shield Hell | 💚 Green | 🟢 Locked (indicators TBD) |
| 3 | String Hell | 💜 Purple | 🟢 Locked (indicators TBD) |
| 4 | Gravity Hell | 🔵 Dark Blue | 🟢 Locked (patterns + indicators TBD) |
| 5 | Laser Hell | ❤️ Red | 🟢 Locked (patterns TBD) |
| 6 | Projectile Hell | ❓ TBD | 🔴 Not discussed |
| 7 | Fruit Ninja Hell | ❓ TBD | 🔴 Not discussed |
| 8 | Shooter Hell | 🟡 Yellow | 🔴 Not discussed |
| 9 | Kamikaze Hell | ❓ TBD | 🔴 Not discussed |
| 10 | Dark Maze Hell | ❓ TBD | 🔴 Not discussed |
| 11 | Hole in the Wall Hell | ❓ TBD | 🔴 Not discussed |
| 12 | Typing Test Hell | ❓ TBD | 🔴 Not discussed |
| 13 | Music Hell (Boss) | ❓ TBD | 🔴 Not discussed |

---

## GLOBAL RULES (apply to ALL hells)

- **One hit per projectile** — a single projectile can only damage the player once, ever
- **One near-miss per projectile** — a single projectile can only trigger the time bonus once, ever
- **No multi-hit attacks** — no attack in any hell counts as more than one hit instance
- **Invincibility frames** — active after every hit (duration varies per hell)
- **Input constraints (Track 1)** — only WASD, Shift, Space, and cursor swipe are allowed. No mouse clicks.

---

## STANDARD MERGED POOL

---

### 1. DODGE HELL
> *Reference: Undertale red heart — purest form of movement, no gimmicks*

**Heart Color:** ❤️ Classic Red

**Boundary:** Largest possible square centered on the screen. No visible walls — just a movement limit using the full screen real estate.

**Attack Indicators:** Flash at the spawn position + exclamation mark (!) + brief flicker before the projectile appears. All warnings happen BEFORE the projectile spawns.

**Attack Patterns:** TBD

**Projectile Types:** TBD

**Timer Economy**
| Event | Time Change |
|-------|-------------|
| Near miss (graze) | +1s |
| Hit | -6s |

**Special Rules:**
- This is the baseline hell — no mechanic restrictions, pure movement skill
- Both the hit flag and near-miss flag are per-bullet lifetime

---

### 2. SHIELD HELL
> *Reference: Undyne from Undertale — directional shield, block or take damage*

**Heart Color:** 💚 Green

**Shield:** Light blue curved arc, snaps instantly to one of 4 directions (Up / Down / Left / Right)

**Boundary — TWO ZONES:**
- **Outer Zone:** Full large square (same size as Dodge Hell) — arrows spawn from the edges
- **Inner Zone:** Small box at screen center — heart is LOCKED here. Player only controls shield direction.

**Projectile Types**

| Projectile | Behavior |
|------------|----------|
| Cyan Arrow | Normal. Points toward heart. Straight-line path. Block with the correct shield side. |
| Yellow Arrow | Deceptive. Faces OPPOSITE direction of travel. Spawns from one side but mid-flight snaps to attack from the OPPOSITE side. Player must react and flip shield. |

**Attack Indicators:** TBD

**Timer Economy**
| Event | Time Change |
|-------|-------------|
| Timer | FROZEN — clock does not tick during Shield Hell |
| Correct block | No reward — zero time gain |
| Hit | -1s per arrow |
| Near miss | N/A (timer is paused) |

**Special Rules:**
- Shield Hell is a **pure penalty phase** — cannot gain time under any circumstance
- Yellow arrow mid-flight path switch is the core skill test
- Each arrow registers one hit maximum

---

### 3. STRING HELL
> *Reference: Muffet from Undertale — Y-axis locked to horizontal strings*

**Heart Color:** 💜 Purple

**Boundary:** Horizontal rectangle at screen center — short vertically, long horizontally. Height grows as more strings are added.

**String Layout**
| Phase | Strings | Notes |
|-------|---------|-------|
| Phase 1 | 3 strings | Starting configuration |
| Phase 2 | 5 strings | 1 added top, 1 bottom — boundary expands |
| Climbing Sub-Phase | 8-9 strings | Final attack before hell ends |

**Movement:** Free X-axis. Y-axis locked — Up/Down snaps to adjacent string instantly.

**Projectile Types**

| Projectile | Behavior |
|------------|----------|
| Spider | Travels horizontally across a string lane. Snap to different string to dodge. |
| Bouncing Ball | Moves diagonally, bounces off top and bottom walls. Crosses multiple lanes. |
| Boomerang | Along one string to far wall, reverses, returns. Must dodge twice. |
| Large Bomb | 5-string phase only. Covers 3 adjacent strings. Long detonation countdown. Vacate all 3 before explosion. Single hit. |

**Timer Economy**
| Event | Time Change |
|-------|-------------|
| Near miss (graze) | +2s |
| Hit | -6s |

**Climbing Sub-Phase (final attack):**
- 8-9 strings all scrolling DOWNWARD continuously
- Monster at bottom has pulling animation — strings move, monster stays still
- Contact with monster = normal hit (-6s), soft floor not a wall
- Player must keep snapping UP to survive

---

### 4. GRAVITY HELL
> *Reference: Sans dark blue heart — platformer physics*

**Heart Color:** 🔵 Dark Blue

**Boundary:** Rectangle at screen center with solid floor and ceiling (visible walls — heart cannot pass through)

**Movement**
| Input | Action |
|-------|--------|
| A / D | Left / Right |
| W or Space (tap) | Small hop |
| W or Space (hold) | Taller jump — height scales with hold duration, up to a cap |
| Jump count | Single jump only, no double jump |

**Projectile Types:** Arrow-type spikes

**Special Modifiers:**
- **Platforms** — appear as landing surfaces in certain attacks
- **Gravity Flip** — gravity reverses in certain attacks; heart rotates; floor becomes ceiling

**Attack Patterns:** TBD

**Timer Economy**
| Event | Time Change |
|-------|-------------|
| Near miss (graze) | +2s |
| Hit | -5s |

**Special Rules:** Invincibility frames active after each hit. One projectile = one hit max.

---

### 5. LASER HELL
> *Reference: No Humanity — telegraphed beams, spatial awareness over reaction*

**Heart Color:** ❤️ Classic Red (same as Dodge Hell)

**Boundary:** ENTIRE SCREEN — no box, full play area

**Lasers:** Multiple fire SIMULTANEOUSLY — designed to overwhelm the screen in a balanced way. Players must read 2-4+ telegraphs at once and plan a path before any fire.

**Telegraph System**
| Phase | What Happens |
|-------|-------------|
| Warning (1.5s) | Faint line appears at laser position. Glows BRIGHTER as countdown progresses — visual pressure builds. |
| Fire (0.5s) | Laser expands into full lethal beam. |

**Safe Gaps:** NOT always guaranteed. Some patterns are intentionally brutal — player must reposition DURING the telegraph window to find safety.

**Laser Directions:** TBD

**Attack Patterns:** TBD

**Timer Economy**
| Event | Time Change |
|-------|-------------|
| Near miss (graze) | +1s (same as Dodge Hell) |
| Hit | -6s (same as Dodge Hell) |

**Graze Rule:** Near miss ONLY counts AFTER the laser has fired. Grazing a telegraph line does NOT give time. Must thread the edge of a live, active beam.

---

### 6. PROJECTILE HELL
> *Reference: Touhou / Danmaku — dense patterns*

**Heart Color:** TBD

**Boundary:** TBD

**Projectile Types:** Knives, Bombs, Orbs

**Attack Patterns:** Spirals, sine waves, shotgun bursts

**Timer Economy:** TBD

---

### 7. FRUIT NINJA HELL
> *Parallel override — slicing + dodging simultaneously*
> Note: Track 1 constraint — slicing must use cursor SWIPE, not mouse clicks

**Heart Color:** TBD

**Boundary:** TBD

**Projectile Types:** Fruits (parabolic) + standard projectiles

**Timer Economy:** TBD

---

### 8. SHOOTER HELL
> *Reference: Mettaton — yellow heart, offensive gameplay*

**Heart Color:** 🟡 Yellow

**Boundary:** TBD

**Projectile Types:** Destructible blocks / enemy waves

**Timer Economy:** TBD

---

## BREAKOUT MODES

---

### 9. KAMIKAZE HELL

**Heart Color:** TBD | **Boundary:** TBD

Infinite auto-scroll right. Planes drop from top. Dash (Space/Shift) gives i-frames forward.

**Timer Economy:** TBD

---

### 10. DARK MAZE HELL
> *Reference: Jackenstein from Deltarune*

**Heart Color:** TBD | **Boundary:** Maze walls

Global darkness. Small radial light follows heart. Static and moving walls. Navigate to exit.

**Timer Economy:** TBD

---

### 11. HOLE IN THE WALL HELL

**Heart Color:** TBD | **Boundary:** TBD

Screen-spanning walls with one random gap approach rapidly. Align heart with gap. Walls speed up logarithmically over 30s-1min.

**Timer Economy:** TBD

---

### 12. TYPING TEST HELL

**Heart Color:** TBD

Screen locks. Type WASD-only words (WAS, SAD, DAD, SAW, WAD...). Input restricted to W, A, S, D, Space only.

**Timer Economy:** TBD

---

### 13. MUSIC HELL (BOSS MODE)

**Heart Color:** TBD | **Boundary:** TBD

Piano keyboard at bottom. Note blocks fall synced to high-tempo music (Rush E, Isaac Newton Theme). Dense rhythm-synced barrage.

**Timer Economy:** TBD

---

*Document version: Session 1 — Hells 1-5 locked | Last updated by: Antigravity AI*
*Team Cant Hack It — CYHI Track 1*

# Infinite Heart — Menu Layout Recap

## Main Menu
- Full-viewport pure black background with electric-blue neon line-art stopwatch centered and sized as large as practical.
- Stopwatch face is the entire menu; no buttons.
- Clock hand is the cursor.
- `W` / `S`: move between snap positions. `Space` / `Enter` / left-click: confirm.
- Snap order: `12 → PLAY → EXIT → Credits → Music → Settings → Mode → How to Play → 12`.
- Start at 12 o'clock (neutral). 12 o'clock is decorative/neutral and does nothing.
- PLAY is at 3 o'clock. EXIT, Credits, Music, Settings, Mode, and How to Play occupy the left-side arc.
- Active node expands/glows; other left-side nodes redistribute along the circle and return when the hand moves away.
- Hand movement is smooth with a small overshoot/snap. `Selected Option.mp3` plays on every snap.
- Stopwatch contains centered title: **Infinite Heart**.
- Background bullet-hell ambience runs continuously behind the UI, with a circular no-spawn zone around the stopwatch.
- Radial explosions and vectorised knives remain sparse and purely visual.
- Subpages: stopwatch fades out, subpage fades in. Background continues.

## Universal Subpage Layout
- Full-screen black background with the same neon-blue theme and bullet-hell ambience.
- Centered menu/list layout.
- Each page has its menu name as a visible title/header.
- Back button is always in the top-left; `Escape` also goes back.
- List items use the same focus expansion, neighbour push-away, and tick sound.
- `Space` / left-click confirms focused items.
- Pages remain open until the user navigates back.

## How to Play
- Full-screen live mini-demo viewport.
- Hell/demo logic will be wired later.
- Back button top-left; `Escape` returns to the clock.

## Mode
- Centered list containing all 13 hells.
- All hells are always selectable/clickable.
- Selecting a hell enters practice mode: no timer, runs until `Escape` or Back.
- Back from a hell returns to Mode; Back from Mode returns to the clock.
- Hells: Dodge, Shield, String, Gravity, Laser, Projectile, Fruit Ninja, Shooter, Kamikaze, Dark Maze, Hole in the Wall, Typing Test, Music.

## Settings
- Centered keybind list.
- **Everything is rebindable**, including menu navigation.
- Selecting an action silently captures the next keypress and assigns it.
- `Reset to Default` at the bottom.
- Defaults are WASD + Shift + Space, with exact action mapping wired later.
- `Total Time Played` is a non-editable display below the keybinds.

## Music
- Centered stack of three horizontal sliders:
  1. Master Volume — multiplier over VFX + BGM.
  2. VFX Volume — raw VFX level.
  3. BGM Volume — raw BGM level.
- Thin neon track, neon handle, numeric percentage beside each.
- Sliders can be dragged with the mouse or nudged with `A` / `D` when focused.

## Credits
- Centered credits page using the same subpage layout.
- Content will be added later.

## Exit
- Selecting EXIT immediately calls `window.close()`.

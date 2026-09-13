# Known / Unsolved Bugs:
- **EXIT NOT WORKING:** The exit mechanism or flow needs to be implemented.
- **Total time tracker:** Should track time of PLAY mode, not the entire site.

# Solved Bugs:
- **Clock Interface Alignment:** Fixed overlapping issues by moving the title "HEART OF GENESIS" to the top of the screen outside the clock and swapping the central pivot to the red heart sprite.
- **Hour Hand Logic:** Added the decorative hour hand. Corrected the rotation math to exactly `1/12` the speed of the minute hand (matching a real clock) and snapped it to exact hour marks at 12 o'clock.
- **Menu BGM:** Added seamless background music across the Start Page and submenus. Wrote custom `sessionStorage` logic to prevent the music from stopping when switching HTML pages.
- **BGM Restart Jank:** Fixed a severe bug where the BGM would reset to 0:00 on every page load by properly waiting for the `loadedmetadata` event before restoring the `currentTime`.
- **Menu List Overflow:** The Mode menu list was too long and clipped outside the box. Fixed by adding `max-height: 60vh`, `overflow-y: auto`, and custom neon scrollbars to `.menu-list`.
- **Back Button / Escape Key:** Fixed a `window.InfiniteHeartSubpage` reference error that broke the Escape key in the Music menu, and restored left-click functionality for the UI Back button.
- **Missing Audio Feedback:** Added missing mechanical keyboard SFX (key1/key2) to the Typing Speed Hell.

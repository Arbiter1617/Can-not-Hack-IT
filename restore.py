import os
import re

root = r"z:\Bullet Hell Game\Can-not-Hack-IT"

def replace_file(path, old, new):
    full = os.path.join(root, path)
    with open(full, 'r', encoding='utf-8') as f:
        content = f.read()
    content = content.replace(old, new)
    with open(full, 'w', encoding='utf-8') as f:
        f.write(content)

# mode.js
old_hells = """  const HELLS = [
    'Dodge', 'Shield', 'String', 'Gravity', 'Laser', 'Projectile',
    'Fruit Ninja', 'Shooter', 'Kamikaze', 'Dark Maze', 'Hole in the Wall',
    'Typing Test', 'Music'
  ];"""
new_hells = """  const HELLS = [
    'Dodge', 'Shield', 'String', 'Gravity', 'Laser', 'Projectile',
    'Fruit Ninja', 'Shooter', 'Kamikaze', 'Hole in the Wall',
    'Typing Test', 'Music'
  ];"""
replace_file("Start Page/mode.js", old_hells, new_hells)

old_routes = """  const PRACTICE_ROUTES = {
    0: 'dodge',
    1: 'shield',
    2: 'string',
    3: 'fruitninja',
    4: 'typing',
  };"""
new_routes = """  const PRACTICE_ROUTES = {
    0: 'dodge',
    1: 'shield',
    2: 'string',
    4: 'laser',
    5: 'projectile',
    6: 'fruitninja',
    10: 'typing',
  };"""
replace_file("Start Page/mode.js", old_routes, new_routes)

# html hints
replace_file("Start Page/mode.html", '<div class="hint">W / S to move &nbsp;·&nbsp; Space / Click to enter practice</div>', '<div class="hint">W / S to move &nbsp;·&nbsp; Enter to select &nbsp;·&nbsp; Esc to go back</div>')
replace_file("Start Page/settings.html", '<div class="hint">W / S to move &nbsp;·&nbsp; Space / Click to rebind</div>', '<div class="hint">W / S to move &nbsp;·&nbsp; Enter to toggle &nbsp;·&nbsp; Esc to go back</div>')
replace_file("Start Page/music.html", '<div class="hint">W / S to move &nbsp;·&nbsp; A / D or drag to adjust</div>', '<div class="hint">W / S to move &nbsp;·&nbsp; A / D / drag to adjust &nbsp;·&nbsp; Esc to go back</div>')

# style.css
old_menu_list = """.menu-list{
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.1rem;
  z-index: 2;
}"""
new_menu_list = """.menu-list{
  list-style: none;
  margin: 0;
  padding: 3rem 4rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.1rem;
  z-index: 2;
  max-height: 60vh;
  overflow-y: auto;
  width: 100%;
  max-width: 600px;
}

/* Custom scrollbar for menu list */
.menu-list::-webkit-scrollbar {
  width: 6px;
}
.menu-list::-webkit-scrollbar-track {
  background: rgba(41, 226, 255, 0.05);
  border-radius: 4px;
}
.menu-list::-webkit-scrollbar-thumb {
  background: rgba(41, 226, 255, 0.3);
  border-radius: 4px;
}
.menu-list::-webkit-scrollbar-thumb:hover {
  background: var(--neon);
}"""
replace_file("Start Page/style.css", old_menu_list, new_menu_list)

old_music_css = """  .slider-handle:active{ cursor: grabbing; }
</style>"""
new_music_css = """  .slider-handle:active{ cursor: grabbing; }

  .toggle-switch {
    position: relative;
    width: 44px;
    height: 22px;
    background: rgba(41, 226, 255, 0.15);
    border-radius: 999px;
    cursor: pointer;
    transition: background 0.2s ease, box-shadow 0.2s ease;
  }
  .toggle-switch.on {
    background: rgba(41, 226, 255, 0.4);
    box-shadow: var(--glow-sm);
  }
  .toggle-knob {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 16px;
    height: 16px;
    background: var(--neon);
    border-radius: 50%;
    transition: transform 0.25s cubic-bezier(0.4, 0.0, 0.2, 1);
  }
  .toggle-switch.on .toggle-knob {
    transform: translateX(22px);
    background: #fff;
    box-shadow: var(--glow-sm);
  }
  .slider-row.active .toggle-knob {
    box-shadow: var(--glow-lg);
  }
</style>"""
replace_file("Start Page/music.html", old_music_css, new_music_css)

# subpage.js
old_backBtn = """    const backBtn = document.querySelector('.back-button');
    if (backBtn) {
      backBtn.addEventListener('click', () => handler());
    }"""
new_backBtn = """    const backBtn = document.querySelector('.back-button');
    if (backBtn) {
      backBtn.addEventListener('click', (e) => {
        if (e.button === 0) handler(); // left click only
      });
    }"""
replace_file("Start Page/subpage.js", old_backBtn, new_backBtn)

old_render = """    function render() {
      items.forEach((el, i) => {
        el.classList.toggle('active', i === current);
      });
    }"""
new_render = """    function render() {
      items.forEach((el, i) => {
        const isActive = (i === current);
        el.classList.toggle('active', isActive);
        if (isActive && el.scrollIntoView) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    }"""
replace_file("Start Page/subpage.js", old_render, new_render)

old_mouseEvents = """    items.forEach((el, i) => {
      el.addEventListener('mouseenter', () => {
        if (isDisabled(i)) return;
        if (i !== current) {
          current = i;
          render();
          if (window.InfiniteHeartAudio) window.InfiniteHeartAudio.playTick();
        }
      });
      el.addEventListener('click', () => {
        if (isDisabled(i)) return;
        current = i;
        render();
        onConfirm(current);
      });
    });"""
new_mouseEvents = "    // Only keyboard navigation is allowed now."
replace_file("Start Page/subpage.js", old_mouseEvents, new_mouseEvents)

# Actually for audio.js and music.js I will just overwrite them completely.

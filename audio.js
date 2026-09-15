/* ==========================================================================
   Infinite Heart — shared audio helper
   Handles VFX, volume settings, and continuous seamless BGM via sessionStorage.
   ========================================================================== */

const InfiniteHeartAudio = (function () {
  const MENU_TRACKS = [
    'Atmosphere- Calm.ogg',
    'Elevator_Music.mp3',
    'luvbird-parting_words(trimmed).mp3',
    'Pokémon_Christmas_Medley_2011.mp3'
  ];
  
  const GAME_TRACKS = [
    'Battle- Dramatic.ogg', 'Battle- Gym.ogg', 'Battle- Legendary.ogg',
    'Battle- Meteor Admin.ogg', 'Battle- Trainer2.ogg', 'Battle- Wild2.ogg',
    'Battle- Wild3.ogg', 'Carpenter_Brut-Turbo_Killer.mp3', 'DANGER-4h30.mp3',
    'Fallen_Down_UNDERTALE-Toby_Fox.mp3', 'His_Theme_UNDERTALE-Toby_Fox.mp3',
    'MOON-Crystals_Metal_Cover_Hotline_Miami_Goes_Metal.mp3', 'Nitro_Fun-New_Game.mp3',
    'Owlboy-Solus_Battle_Phase_1.mp3', 'Shadow_Fight_2_Burning_Town.mp3',
    'Shadow_Fight_2_Titan_Epic_Fight.mp3', 'To Greater Heights.ogg'
  ];

  let volumes = { master: 1, vfx: 1, bgm: 1, specialMusic: true };
  let bgmAudio = null;
  let currentList = [];
  let currentIndex = 0;

  function loadVolumes() {
    try {
      const saved = JSON.parse(localStorage.getItem('ih_volumes') || 'null');
      if (saved) Object.assign(volumes, saved);
    } catch (e) { /* ignore */ }
  }
  loadVolumes();

  function playSelectSound() {
    try {
      const audio = new Audio('./Audio/VFX/clock-tick.mp3');
      audio.volume = Math.max(0, Math.min(1, volumes.master * volumes.vfx));
      audio.play().catch(() => {});
    } catch (e) { /* ignore */ }
  }

  function playGameOver() {
    try {
      const file = volumes.specialMusic ? 'faah-reverb.mp3' : 'arcade-game-over.mp3';
      const audio = new Audio('./Audio/VFX/' + file);
      audio.volume = Math.max(0, Math.min(1, volumes.master * volumes.vfx));
      audio.play().catch(() => {});
    } catch (e) { /* ignore */ }
  }

  function playTypeSound() {
    try {
      const file = Math.random() < 0.5 ? 'key1.mp3' : 'key2.wav';
      const audio = new Audio('./Audio/VFX/' + file);
      audio.volume = Math.max(0, Math.min(1, volumes.master * volumes.vfx));
      audio.play().catch(() => {});
    } catch (e) { /* ignore */ }
  }

  function playLaserSound() {
    try {
      const audio = new Audio('./Audio/VFX/laserChargeAndBoom.mp3');
      // Laser sound is inherently very loud, scale it down to 35% of normal VFX volume
      audio.volume = Math.max(0, Math.min(1, volumes.master * volumes.vfx * 0.35));
      audio.play().catch(() => {});
    } catch (e) { /* ignore */ }
  }

  // --- BGM Seamless Playback Logic ---
  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  function switchToPlaylist(targetPlaylistName) {
    const isGame = (targetPlaylistName === 'GAME');
    currentList = isGame ? [...GAME_TRACKS] : [...MENU_TRACKS];

    const stateStr = sessionStorage.getItem('ih_bgm_state');
    let state = null;
    if (stateStr) {
      try { state = JSON.parse(stateStr); } catch (e) {}
    }

    if (state && state.playlistName === targetPlaylistName) {
      currentList = state.list;
      currentIndex = state.index;
      playTrack(currentList[currentIndex], state.time);
    } else {
      shuffle(currentList);
      currentIndex = 0;
      playTrack(currentList[currentIndex], 0);
    }
  }

  function initBGM() {
    // Determine context (Menu vs Game). Mode submenu counts as game context.
    const path = window.location.pathname.toLowerCase();
    const isGameContext = path.includes('game/index.html') || path.includes('mode.html');
    const targetPlaylistName = isGameContext ? 'GAME' : 'MENU';
    switchToPlaylist(targetPlaylistName);
  }

  let currentStartTime = 0;

  function playTrack(filename, startTime) {
    if (bgmAudio) {
      bgmAudio.pause();
      bgmAudio.src = '';
    }
    currentStartTime = startTime || 0;
    bgmAudio = new Audio('./Audio/BGM/' + filename);
    bgmAudio.volume = Math.max(0, Math.min(1, volumes.master * volumes.bgm));
    
    if (currentStartTime > 0) {
      bgmAudio.addEventListener('loadedmetadata', () => {
        bgmAudio.currentTime = currentStartTime;
      }, { once: true });
    }
    
    bgmAudio.addEventListener('ended', () => {
      currentIndex = (currentIndex + 1) % currentList.length;
      playTrack(currentList[currentIndex], 0);
    });

    // Try to play; if autoplay blocked, user interaction will trigger it later
    const playPromise = bgmAudio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        const unblock = () => {
          bgmAudio.play();
          document.removeEventListener('click', unblock);
          document.removeEventListener('keydown', unblock);
        };
        document.addEventListener('click', unblock);
        document.addEventListener('keydown', unblock);
      });
    }
  }

  function saveBgmState() {
    if (!bgmAudio) return;
    const path = window.location.pathname.toLowerCase();
    const isGameContext = path.includes('game/index.html') || path.includes('mode.html');
    const targetPlaylistName = isGameContext ? 'GAME' : 'MENU';

    // Prevent saving 0 if we navigate away before metadata loads
    const timeToSave = bgmAudio.readyState >= 1 ? bgmAudio.currentTime : currentStartTime;

    const state = {
      playlistName: targetPlaylistName,
      list: currentList,
      index: currentIndex,
      time: timeToSave
    };
    sessionStorage.setItem('ih_bgm_state', JSON.stringify(state));
  }

  // Save state before unloading the page
  window.addEventListener('beforeunload', saveBgmState);

  function refreshVolumes() {
    loadVolumes();
    if (bgmAudio) {
      bgmAudio.volume = Math.max(0, Math.min(1, volumes.master * volumes.bgm));
    }
  }

  // Kick off BGM
  initBGM();

  return { playSelectSound, playGameOver, playTypeSound, playLaserSound, refreshVolumes, stopBgm: () => { if (bgmAudio) bgmAudio.pause(); }, resumeBgm: () => { if (bgmAudio) bgmAudio.play(); }, switchToPlaylist };
})();

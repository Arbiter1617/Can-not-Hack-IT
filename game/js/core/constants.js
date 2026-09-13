'use strict';
// ─── Constants ───────────────────────────────────────────────────────
const HEART_R         = 10;    // lethal hitbox radius (px)
const GRAZE_R         = 27;    // near-miss graze ring (px)
const BASE_SPEED      = 250;   // heart movement px/s
const FOCUS_MULT      = 0.45;  // Shift slow multiplier
const HELL_SCORE_STEP = 3000;  // score between hell transitions
const SCORE_PER_SEC   = 100;   // passive score gain per second
const TWO_PI          = Math.PI * 2;

// ─── URL / Launch Config ─────────────────────────────────────────────
// ?practice=dodge  →  lock the game to DodgeHell with infinite timer
const _params       = new URLSearchParams(location.search);
const PRACTICE_HELL = _params.get('practice') || null; // 'dodge' | null

// Map practice param → hell index in director.hells[]
// fruitninja/projectile map to 0 (Dodge) — their hells aren't wired in yet
const PRACTICE_HELL_IDX = { dodge: 0, shield: 1, string: 2, typing: 3, laser: 4, gravity: 5, projectile: 0, fruitninja: 0, credits: 99 };

// score is declared here so every file can read / write it as a global
let score = 0;

// ─── Utility ─────────────────────────────────────────────────────────
const rnd   = (a, b) => a + Math.random() * (b - a);
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

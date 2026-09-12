'use strict';
// ─── Constants ───────────────────────────────────────────────────────
const HEART_R         = 8;     // lethal hitbox radius (px)
const GRAZE_R         = 22;    // near-miss graze ring (px)
const BASE_SPEED      = 250;   // heart movement px/s
const FOCUS_MULT      = 0.45;  // Shift slow multiplier
const HELL_SCORE_STEP = 3000;  // score between hell transitions
const SCORE_PER_SEC   = 100;   // passive score gain per second
const TWO_PI          = Math.PI * 2;

// ─── Mutable game state ──────────────────────────────────────────────
// score is declared here so every file can read / write it as a global
let score = 0;

// ─── Utility ─────────────────────────────────────────────────────────
const rnd   = (a, b) => a + Math.random() * (b - a);
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

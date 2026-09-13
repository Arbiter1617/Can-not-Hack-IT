'use strict';
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// HELL 5 â€” LASER HELL
// Red heart Â· Entire screen boundary Â· X-pattern laser beams
// Timer economy: graze +1s Â· hit âˆ’6s
// Graze ONLY triggers AFTER laser has FIRED (must thread active beam)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
class LaserHell extends HellBase {
  constructor(dir) {
    super(dir);
    this.lasers = [];
    this.fireTimer = 0;
    this.nextFireTime = 1.0;
  }

  // â”€â”€ Hell identity â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  get heartColor() { return '#ff3333'; } // Red heart
  get name()       { return 'LASER HELL'; }
  get cfg()        { return { grazeGain: 1, hitPenalty: 4 }; }
  
  // Boundary: ENTIRE SCREEN â€” no box, full play area
  get boundary()   { return null; }

  // â”€â”€ Lifecycle â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  enter() {
    this.lasers = [];
    this.fireTimer = 0;
    this.nextFireTime = 1.0;
  }

  exit() {
    super.exit();
    this.lasers = [];
  }

  // â”€â”€ Update â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  update(dt) {
    this.fireTimer += dt;
    
    // Spawn new X-laser pair at randomized intervals
    if (this.fireTimer >= this.nextFireTime) {
      this.fireTimer = 0;
      // Rate at which they appear can be high, low, anything at random
      this.nextFireTime = 0.3 + Math.random() * 1.4;
      // Speed up faster with score
      if (typeof score !== 'undefined') {
        this.nextFireTime -= Math.min(score / 20000, 1) * 0.5;
      }
      this.nextFireTime = Math.max(0.2, this.nextFireTime);
      this._spawnX();
    }

    const hx = this.dir.hx;
    const hy = this.dir.hy;

    for (let i = this.lasers.length - 1; i >= 0; i--) {
      const l = this.lasers[i];
      l.age += dt;

      if (l.phase === 'warn') {
        if (l.age >= l.warnDuration) {
          l.phase = 'fire';
          l.age = 0;
        }
      } else if (l.phase === 'fire') {
        if (l.age >= l.fireDuration) {
          this.lasers.splice(i, 1);
          continue;
        }

        // Collision logic only active during 'fire' phase
        if (this.dir.iframes <= 0) {
          const dist = this._distToSegment(hx, hy, l.x1, l.y1, l.x2, l.y2);
          const lethalDist = HEART_R + l.thickness / 2;
          const grazeDist  = GRAZE_R + l.thickness / 2;

          // Near-miss graze — once per laser beam (must thread active beam)
          if (!l.grazed && dist < grazeDist && dist >= lethalDist) {
            l.grazed = true;
            if (this.cfg.grazeGain > 0) {
              this.dir.clock.add(this.cfg.grazeGain, hx, hy - 24);
            }
            // Near-miss visual: bright blue ring flash + spark burst
            this.dir.particles.burst(hx, hy, '#4499ff', 7, 120);
            this.dir.flashAlpha = Math.max(this.dir.flashAlpha, 0.18);
          }

          // Hit — one laser = one hit maximum
          if (!l.hit && dist < lethalDist) {
            l.hit = true;
            this.dir.iframes    = this.dir.IFRAME_DUR;
            this.dir.flashAlpha = 0.55;
            this.dir.particles.burst(hx, hy, this.heartColor, 16, 220);
            this.dir.clock.subtract(this.cfg.hitPenalty, hx, hy - 24);
          }
        }
      }
    }
  }

  // â”€â”€ Draw â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  draw(ctx) {
    for (const l of this.lasers) {
      if (l.phase === 'warn') {
        const progress = l.age / l.warnDuration;
        // Faint line appears at laser position, glows brighter as countdown progresses
        ctx.strokeStyle = `rgba(255, 51, 51, ${0.15 + progress * 0.5})`;
        ctx.lineWidth = 2; 
        ctx.beginPath();
        ctx.moveTo(l.x1, l.y1);
        ctx.lineTo(l.x2, l.y2);
        ctx.stroke();
      } else if (l.phase === 'fire') {
        const progress = l.age / l.fireDuration;
        // Fade out towards the very end of the beam's life
        const alpha = progress < 0.8 ? 1 : 1 - (progress - 0.8) * 5;
        
        ctx.strokeStyle = `rgba(255, 51, 51, ${alpha})`;
        ctx.lineWidth = l.thickness;
        ctx.shadowBlur = 15 * alpha;
        ctx.shadowColor = '#ff3333';
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(l.x1, l.y1);
        ctx.lineTo(l.x2, l.y2);
        ctx.stroke();
        
        ctx.shadowBlur = 0;
        
        // Inner white/bright core for the active laser beam
        ctx.strokeStyle = `rgba(255, 220, 220, ${alpha})`;
        ctx.lineWidth = l.thickness * 0.4;
        ctx.beginPath();
        ctx.moveTo(l.x1, l.y1);
        ctx.lineTo(l.x2, l.y2);
        ctx.stroke();
      }
    }
  }

  // â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  
  // Spawns 2 laser pairs forming an 'X' (connecting different edges)
  _spawnX() {
    const W = (typeof canvas !== 'undefined') ? canvas.width : window.innerWidth;
    const H = (typeof canvas !== 'undefined') ? canvas.height : window.innerHeight;
    
    // Laser 1: Top edge to Bottom edge
    const l1x1 = Math.random() * W;
    const l1y1 = -20; // Slightly off-screen
    const l1x2 = Math.random() * W;
    const l1y2 = H + 20;

    // Laser 2: Left edge to Right edge
    const l2x1 = -20;
    const l2y1 = Math.random() * H;
    const l2x2 = W + 20;
    const l2y2 = Math.random() * H;

    const warnDuration = 0.7 + Math.random() * 0.6; // shorter warning = less time to dodge
    const fireDuration = 0.65; // beam active longer (was 0.5s)
    const thickness = 18;

    this.lasers.push({
      x1: l1x1, y1: l1y1, x2: l1x2, y2: l1y2,
      phase: 'warn', age: 0, warnDuration, fireDuration,
      hit: false, grazed: false, thickness
    });

    this.lasers.push({
      x1: l2x1, y1: l2y1, x2: l2x2, y2: l2y2,
      phase: 'warn', age: 0, warnDuration, fireDuration,
      hit: false, grazed: false, thickness
    });
  }

  _distToSegment(px, py, x1, y1, x2, y2) {
    const l2 = (x2 - x1)**2 + (y2 - y1)**2;
    if (l2 === 0) return Math.hypot(px - x1, py - y1);
    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
  }
}

// -------------------------------------------------------------------
// HELL 6 — PROJECTILE HELL
// Red heart · Full screen boundary
// Timer economy: graze +1s · hit -6s
// Uses Kunai (straight), Bombs (shrapnel on floor), Missiles (homing 3s)
// -------------------------------------------------------------------
const imgKunai = new Image(); imgKunai.src = '../images/projectiles/Kunai.png';
const imgBomb = new Image(); imgBomb.src = '../images/projectiles/bomb.png';
const imgMissile = new Image(); imgMissile.src = '../images/projectiles/Missile.png';

class ProjectileHell extends HellBase {
  constructor(dir) {
    super(dir);
    this.projectiles = [];
    this.fireTimer = 0;
  }
  
  get heartColor() { return '#ff3333'; }
  get name()       { return 'PROJECTILE HELL'; }
  get cfg()        { return { grazeGain: 1, hitPenalty: 4 }; }
  get boundary()   { return null; }
  
  get _fireRate() { return 0.55 - Math.min((typeof score !== 'undefined' ? score : 0) / 22000, 1) * 0.35; }

  enter() {
    this.projectiles = [];
    this.fireTimer = 0;
  }

  exit() {
    super.exit();
    this.projectiles = [];
  }
  
  update(dt) {
    this.fireTimer += dt;
    if (this.fireTimer >= this._fireRate) {
      this.fireTimer = 0;
      this._spawnRandom();
    }
    
    const hx = this.dir.hx, hy = this.dir.hy;
    const W = (typeof canvas !== 'undefined') ? canvas.width : window.innerWidth;
    const H = (typeof canvas !== 'undefined') ? canvas.height : window.innerHeight;

    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.age += dt;
      
      if (p.type === 'kunai') {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.x < -150 || p.x > W + 150 || p.y < -150 || p.y > H + 150) {
          this.projectiles.splice(i, 1);
          continue;
        }
      } 
      else if (p.type === 'bomb') {
        p.y += p.vy * dt;
        if (p.y >= H - 15) { // Hit the floor
          this._spawnShrapnel(p.x, p.y);
          this.projectiles.splice(i, 1);
          continue;
        }
      }
      else if (p.type === 'missile') {
        const speed = 250;
        if (p.age < 3.0) {
          const targetAng = Math.atan2(hy - p.y, hx - p.x);
          let angDiff = targetAng - p.ang;
          angDiff = (angDiff + Math.PI*3) % (Math.PI*2) - Math.PI;
          const turnSpeed = 2.5; // rad/sec
          p.ang += Math.sign(angDiff) * Math.min(Math.abs(angDiff), turnSpeed * dt);
          p.vx = Math.cos(p.ang) * speed;
          p.vy = Math.sin(p.ang) * speed;
        }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        
        if (p.x < -150 || p.x > W + 150 || p.y < -150 || p.y > H + 150) {
          this.projectiles.splice(i, 1);
          continue;
        }
      }
      else if (p.type === 'shrapnel') {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.x < -100 || p.x > W + 100 || p.y < -100 || p.y > H + 100) {
          this.projectiles.splice(i, 1);
          continue;
        }
      }

      // Collision
      if (this.dir.iframes <= 0) {
        const dist = Math.hypot(p.x - hx, p.y - hy);
        const lethalDist = HEART_R + p.r;
        const grazeDist  = GRAZE_R + p.r;

        if (!p.grazed && dist < grazeDist && dist >= lethalDist) {
          p.grazed = true;
          if (this.cfg.grazeGain > 0) this.dir.clock.add(this.cfg.grazeGain, hx, hy - 24);
        }

        if (!p.hit && dist < lethalDist) {
          p.hit = true;
          this.dir.iframes    = this.dir.IFRAME_DUR;
          this.dir.flashAlpha = 0.55;
          this.dir.particles.burst(hx, hy, this.heartColor, 16, 220);
          this.dir.clock.subtract(this.cfg.hitPenalty, hx, hy - 24);
        }
      }
    }
  }

  draw(ctx) {
    for (const p of this.projectiles) {
      if (p.type === 'shrapnel') {
        ctx.fillStyle = '#ffaa00';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#ff5500';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      } else {
        ctx.save();
        ctx.translate(p.x, p.y);
        
        let img = null;
        let targetSize = 40;
        
        if (p.type === 'kunai') {
          img = imgKunai;
          ctx.rotate(p.ang + Math.PI/2); 
          targetSize = 45;
        } else if (p.type === 'missile') {
          img = imgMissile;
          ctx.rotate(p.ang + Math.PI/2);
          targetSize = 55;
        } else if (p.type === 'bomb') {
          img = imgBomb;
          ctx.rotate(p.age * 2.5); // Spin visually as it falls
          targetSize = 45;
        }

        if (img && img.complete && img.naturalWidth > 0) {
          const w = img.naturalWidth;
          const h = img.naturalHeight;
          const scale = targetSize / Math.max(w, h);
          const drawW = w * scale;
          const drawH = h * scale;
          ctx.drawImage(img, -drawW/2, -drawH/2, drawW, drawH);
        } else {
          ctx.fillStyle = (p.type==='bomb') ? '#555' : '#fff';
          ctx.beginPath();
          ctx.arc(0, 0, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
        
        ctx.restore();
      }
    }
  }
  
  _spawnRandom() {
    const W = (typeof canvas !== 'undefined') ? canvas.width : window.innerWidth;
    const H = (typeof canvas !== 'undefined') ? canvas.height : window.innerHeight;
    const r = Math.random();
    const hx = this.dir.hx, hy = this.dir.hy;

    if (r < 0.45) {
      // Kunai - spawn from edge, aim near heart
      const side = Math.floor(Math.random() * 4);
      let x, y;
      if (side===0) { x = Math.random()*W; y = -40; }
      if (side===1) { x = Math.random()*W; y = H+40; }
      if (side===2) { x = -40; y = Math.random()*H; }
      if (side===3) { x = W+40; y = Math.random()*H; }
      
      const ang = Math.atan2(hy - y + (Math.random()*100-50), hx - x + (Math.random()*100-50));
      const spd = 350 + Math.random()*100;
      this.projectiles.push({
        type: 'kunai', x, y, vx: Math.cos(ang)*spd, vy: Math.sin(ang)*spd, ang,
        r: 10, age: 0, hit: false, grazed: false
      });
    } else if (r < 0.7) {
      // Bomb - falls from top anywhere
      const x = Math.random() * W;
      this.projectiles.push({
        type: 'bomb', x, y: -40, vx: 0, vy: 160 + Math.random()*120, 
        r: 16, age: 0, hit: false, grazed: false
      });
    } else {
      // Missile - homing for 3s
      const side = Math.floor(Math.random() * 4);
      let x, y;
      if (side===0) { x = Math.random()*W; y = -50; }
      if (side===1) { x = Math.random()*W; y = H+50; }
      if (side===2) { x = -50; y = Math.random()*H; }
      if (side===3) { x = W+50; y = Math.random()*H; }
      
      const ang = Math.atan2(H/2 - y, W/2 - x);
      this.projectiles.push({
        type: 'missile', x, y, vx: 0, vy: 0, ang,
        r: 14, age: 0, hit: false, grazed: false
      });
    }
  }

  _spawnShrapnel(x, y) {
    const count = 20 + Math.floor(Math.random() * 11); // 20 to 30
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 200 + Math.random() * 200;
      this.projectiles.push({
        type: 'shrapnel', x, y, vx: Math.cos(ang)*spd, vy: Math.sin(ang)*spd,
        r: 4, age: 0, hit: false, grazed: false
      });
    }
  }
}

// ═══════════════════════════════════════════════════════════════════
// COMBINED — LASER + PROJECTILE HELL (runs both simultaneously)
// LaserHell and ProjectileHell are designed to run together:
// X-pattern laser beams + kunai/bomb/missile projectiles at once.
// ═══════════════════════════════════════════════════════════════════
class LaserProjectileHell extends HellBase {
  constructor(dir) {
    super(dir);
    this._laser = new LaserHell(dir);
    this._proj  = new ProjectileHell(dir);
  }

  get heartColor() { return '#ff3333'; }
  get name()       { return 'LASER HELL'; }
  get cfg()        { return { grazeGain: 1, hitPenalty: 6 }; }
  get boundary()   { return null; }

  enter() {
    this._laser.enter();
    this._proj.enter();
  }

  exit() {
    this._laser.exit();
    this._proj.exit();
  }

  update(dt) {
    this._laser.update(dt);
    this._proj.update(dt);
  }

  draw(ctx) {
    this._laser.draw(ctx);
    this._proj.draw(ctx);
  }
}

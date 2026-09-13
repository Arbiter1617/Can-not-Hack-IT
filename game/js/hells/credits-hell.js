/* ==========================================================================
   Credits Hell (Trap!)
   Triggers a fake Game Over / Win screen, then scrolling credits become hazards.
   ========================================================================== */

const _creditsTempCanvas = document.createElement('canvas');
const _creditsTempCtx = _creditsTempCanvas.getContext('2d');

class CreditsHell extends HellBase {
  constructor(dir) {
    super(dir);
    this.lines = [
      "HEART OF GENESIS",
      "Project Core",
      "Game Modules — Ajinkya",
      "UI and Art — Atharv",
      "Music Finder — Aryan",
      "Music Credits",
      "Toby Fox for Undertale",
      "GlitchCity for Pokemon sound tracks",
      "Featured Artists",
      "Chilled Cheese",
      "Alex Yarmak",
      "Ekler",
      "Monsercat Uncaged",
      "Carpentar Brut",
      "Murasaki",
      "MasStream",
      "And many more YouTube Artists",
      "Thank You For Playing"
    ];
    this.activeTexts = [];
    this.spawnTimer = 0;
    this.lineIndex = 0;
    this.phase = 'fakeout'; // 'fakeout' -> 'scrolling'
    this.phaseTimer = 0;
    this.scrollSpeed = 160;
  }

  get heartColor() { return '#ffffff'; }
  get name()       { return 'GAME OVER?'; }
  get cfg()        { return { grazeGain: 0.5, hitPenalty: 10 }; }
  get boundary()   { return null; }

  enter() {
    this.activeTexts = [];
    this.spawnTimer = 0;
    this.lineIndex = 0;
    this.phase = 'fakeout';
    this.phaseTimer = 0;
    
    // Play fake out sound (faah-reverb usually implies death)
    if (typeof InfiniteHeartAudio !== 'undefined') {
      InfiniteHeartAudio.playGameOver();
    }
  }

  exit() {
    this.activeTexts = [];
  }

  update(dt) {
    const W = (typeof canvas !== 'undefined') ? canvas.width : window.innerWidth;
    const H = (typeof canvas !== 'undefined') ? canvas.height : window.innerHeight;

    if (this.phase === 'fakeout') {
      this.phaseTimer += dt;
      if (this.phaseTimer > 3.0) {
        this.phase = 'scrolling';
      }
      return; // No hazards during fakeout
    }

    // Phase: Scrolling
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0 && this.lineIndex < this.lines.length) {
      
      const txt = this.lines[this.lineIndex];
      this.lineIndex++;
      
      let fontSize = 28;
      let gap = 1.0;

      if (["HEART OF GENESIS", "Thank You For Playing"].includes(txt)) {
        fontSize = 54;
        gap = 2.0;
      } else if (["Project Core", "Music Credits", "Featured Artists"].includes(txt)) {
        fontSize = 38;
        gap = 1.2;
      }

      this.spawnTimer = gap;
      
      _creditsTempCtx.font = `bold ${fontSize}px "Courier New", monospace`;
      const w = _creditsTempCtx.measureText(txt).width;

      this.activeTexts.push({
        text: txt,
        x: W / 2, 
        y: H + 60,
        w: w,
        h: fontSize,
        fontSize: fontSize,
        hit: false
      });
    }

    const hx = this.dir.hx, hy = this.dir.hy;
    let allDone = (this.lineIndex >= this.lines.length);

    for (let i = this.activeTexts.length - 1; i >= 0; i--) {
      let t = this.activeTexts[i];
      t.y -= this.scrollSpeed * dt;
      
      if (t.y > -100) allDone = false; // still on screen

      // Hitbox is roughly the text rect. textBaseline is 'bottom'.
      // So rect is from (t.x - t.w/2) to (t.x + t.w/2) horizontally
      // and from (t.y - t.h*0.8) to t.y vertically.
      const left = t.x - t.w / 2 - 8;
      const right = t.x + t.w / 2 + 8;
      const top = t.y - t.h * 0.85;
      const bottom = t.y + 5;

      if (!t.hit && hx > left && hx < right && hy > top && hy < bottom) {
        if (this.dir.takeDamage(this.cfg.hitPenalty)) {
          t.hit = true;
        }
      }

      // Check grazing (rough outer box)
      const gLeft = left - 25, gRight = right + 25;
      const gTop = top - 25, gBottom = bottom + 25;
      if (!t.hit && hx > gLeft && hx < gRight && hy > gTop && hy < gBottom) {
        if (hx < left || hx > right || hy < top || hy > bottom) { // not actually hit
           this.dir.graze(this.cfg.grazeGain);
        }
      }

      if (t.y < -100) {
        this.activeTexts.splice(i, 1);
      }
    }

    if (allDone) {
      this.forceTransition = true;
    }
  }

  draw(ctx) {
    const W = (typeof canvas !== 'undefined') ? canvas.width : window.innerWidth;
    const H = (typeof canvas !== 'undefined') ? canvas.height : window.innerHeight;

    if (this.phase === 'fakeout') {
      ctx.fillStyle = '#ff1a40';
      ctx.font = 'bold 72px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText("GAME OVER!", W/2, H/2 - 50);
      
      ctx.fillStyle = '#29e2ff';
      ctx.font = 'bold 56px "Courier New", monospace';
      ctx.fillText("YOU WIN!", W/2, H/2 + 50);
      return;
    }

    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    
    for (let t of this.activeTexts) {
      ctx.font = `bold ${t.fontSize}px "Courier New", monospace`;
      
      if (["HEART OF GENESIS", "Thank You For Playing"].includes(t.text)) {
        ctx.fillStyle = '#ff1a40';
      } else if (["Project Core", "Music Credits", "Featured Artists"].includes(t.text)) {
        ctx.fillStyle = '#29e2ff';
      } else if (t.text.includes("—")) {
        ctx.fillStyle = '#d9f9ff';
      } else {
        ctx.fillStyle = '#ffffff';
      }

      if (t.hit) ctx.fillStyle = '#ff3333'; // flash red if hit
      
      ctx.fillText(t.text, t.x, t.y);
    }
  }
}

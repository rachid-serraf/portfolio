class ParticleHover {
  constructor() {
    this.canvas = document.getElementById('contact-canvas');
    this.context = this.canvas.getContext('2d');
    this.stage = document.getElementById('contact');
    this.columns = Array.from(this.stage.querySelectorAll('.col'));
    this.particleCount = 1000;
    this.noiseCount = 1500;
    this.width = 0; this.height = 0; this.mode = -1;
    this.particles = [];
    this.locations = [[], []];
    this.speck = '20,20,20';
    this.blue = '51,85,255';
    this.reduceMotion = matchMedia('(prefers-reduced-motion:reduce)').matches;
    this.modeTime = 0; this.lastFrame = 0; this.visible = true;

    this.createLocations();
    this.createParticles();
    this.bindEvents();
    this.layout();
    requestAnimationFrame(this.frame.bind(this));
  }

  random(a, b) { return a + Math.random() * (b - a); }

  pointsAlong(points, count) {
    const lengths = []; let total = 0;
    for (let i = 0; i < points.length - 1; i++) {
      const l = Math.hypot(points[i + 1][0] - points[i][0], points[i + 1][1] - points[i][1]);
      lengths.push(l); total += l;
    }
    const out = [];
    for (let i = 0; i < count; i++) {
      let d = Math.random() * total, s = 0;
      while (s < lengths.length - 1 && d > lengths[s]) { d -= lengths[s]; s++; }
      const p = d / lengths[s];
      out.push([
        points[s][0] + (points[s + 1][0] - points[s][0]) * p + this.random(-4, 4),
        points[s][1] + (points[s + 1][1] - points[s][1]) * p + this.random(-4, 4)
      ]);
    }
    return out;
  }

  createLocations() {
    const bracket = [[290,80],[290,40],[155,40],[145,70],[145,230],[80,235],[80,315],[145,320],[145,470],[155,505],[290,505],[290,465]].map(p => [p[0] - 380, p[1] - 272]);
    const left = this.pointsAlong(bracket, this.particleCount / 2);
    const right = this.pointsAlong(bracket, this.particleCount / 2).map(p => [-p[0], p[1]]);
    this.locations[0] = left.concat(right);
    const ring = [[-5,-252],[190,-110],[195,120],[-5,243],[-197,116],[-202,-120]];
    for (let i = 0; i < this.particleCount; i++) {
      const c = ring[i % 6], a = Math.random() * 6.283;
      const r = 85 * (Math.random() < .82 ? 1 : Math.sqrt(Math.random()));
      this.locations[1].push([c[0] + Math.cos(a) * r + this.random(-2, 2), c[1] + Math.sin(a) * r + this.random(-2, 2)]);
    }
  }

  createParticles() {
    for (let i = 0; i < this.particleCount + this.noiseCount; i++) {
      const k = this.random(.6, 1.3);
      this.particles.push({ nx: Math.random(), ny: Math.random(), x: 0, y: 0, ax: this.random(15, 45), ay: this.random(15, 45), w2: this.random(.12, .35), ph2: this.random(0, 6.283), k: k, d: this.random(0, 1.4), ph: this.random(0, 6.283), w: this.random(.12, .35), t: [[0, 0], [0, 0]], first: true, b: 0, r: k });
    }
  }

  setMode(m) { if (this.mode !== m) { this.mode = m; this.modeTime = performance.now(); } }

  updateColors() {
    const s = getComputedStyle(document.documentElement);
    this.speck = s.getPropertyValue('--speck').trim() || this.speck;
    this.blue = s.getPropertyValue('--blue').trim() || this.blue;
    const a = this.speck.split(',').map(Number), b = this.blue.split(',').map(Number);
    this.palette = [];
    for (let i = 0; i <= 16; i++) {
      const t = i / 16;
      this.palette.push(`rgba(${Math.round(a[0] + (b[0] - a[0]) * t)},${Math.round(a[1] + (b[1] - a[1]) * t)},${Math.round(a[2] + (b[2] - a[2]) * t)},${(.55 + .4 * t).toFixed(3)})`);
    }
  }

  layout() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = this.stage.getBoundingClientRect();
    const ow = this.width, oh = this.height;
    this.width = rect.width; this.height = rect.height;
    this.canvas.width = this.width * dpr; this.canvas.height = this.height * dpr;
    this.context.setTransform(dpr, 0, 0, dpr, 0, 0);
    const stacked = this.width <= 760;
    const scale = stacked ? Math.min(this.width / 700, (this.height / 2) / 560) : Math.min(1, this.width / 1366, this.height / 700);
    const centers = this.columns.map(c => { const b = c.getBoundingClientRect(); return [b.left - rect.left + b.width / 2, b.top - rect.top + b.height / 2]; });
    this.particles.forEach((p, i) => {
      if (p.first) { p.x = p.nx * this.width; p.y = p.ny * this.height; p.first = false; }
      else if (ow) { p.x *= this.width / ow; p.y *= this.height / oh; }
      if (i < this.particleCount) for (let m = 0; m < 2; m++) p.t[m] = [centers[m][0] + this.locations[m][i][0] * scale, centers[m][1] + this.locations[m][i][1] * scale];
    });
    this.updateColors();
  }

  bindEvents() {
    new ResizeObserver(() => this.layout()).observe(this.stage);
    new IntersectionObserver(e => { this.visible = e[0].isIntersecting; }).observe(this.stage);
    this.columns.forEach((col, i) => {
      col.addEventListener('pointerenter', () => this.setMode(i));
      col.addEventListener('pointerleave', e => { if (e.pointerType !== 'touch' && this.mode === i) this.setMode(-1); });
      col.addEventListener('focusin', () => this.setMode(i));
      col.addEventListener('focusout', () => { if (this.mode === i) this.setMode(-1); });
    });
  }

  frame(time) {
    const dt = Math.min((time - this.lastFrame) / 1000 || 0, .05);
    const sec = time / 1000;
    this.lastFrame = time;
    if (!this.visible) { requestAnimationFrame(this.frame.bind(this)); return; }
    const ctx = this.context;
    ctx.clearRect(0, 0, this.width, this.height);
    const am = this.reduceMotion ? 0 : 1;
    ctx.fillStyle = this.palette[0];
    for (let i = this.particleCount; i < this.particles.length; i++) {
      const p = this.particles[i];
      ctx.fillRect(p.nx * this.width + Math.sin(sec * p.w + p.ph) * p.ax * am, p.ny * this.height + Math.cos(sec * p.w2 + p.ph2) * p.ay * am, 1.4, 1.4);
    }
    const elapsed = (time - this.modeTime) / 1000;
    const colorEase = 1 - Math.exp(-5 * dt);
    const rateEase = 1 - Math.exp(-4 * dt);
    for (let i = 0; i < this.particleCount; i++) {
      const p = this.particles[i];
      let tx = p.nx * this.width + Math.sin(sec * p.w + p.ph) * p.ax * am;
      let ty = p.ny * this.height + Math.cos(sec * p.w2 + p.ph2) * p.ay * am;
      let jitter = 0, goal = 0, want;
      if (this.mode >= 0) {
        const sm = this.reduceMotion ? 0 : 3.2;
        tx = p.t[this.mode][0] + Math.sin(sec * p.w * 3 + p.ph) * sm;
        ty = p.t[this.mode][1] + Math.cos(sec * p.w2 * 3 + p.ph2) * sm;
        jitter = this.reduceMotion ? 0 : 1.2;
        // turn blue only when the particle is almost on its spot in the shape
        const near = Math.min(1, Math.max(0, (Math.hypot(tx - p.x, ty - p.y) - 18) / 70));
        goal = 1 - near * near * (3 - 2 * near);
        const pe = elapsed - p.d;
        let ramp = pe <= 0 ? 0 : Math.min(1, pe / 1.2);
        ramp = ramp * ramp * (3 - 2 * ramp);
        want = p.k * (.25 + .75 * ramp);
      } else {
        // leaving: head home right away, no waiting
        want = p.k * 2;
      }
      p.b += (goal - p.b) * colorEase;
      p.r += (want - p.r) * rateEase;       // pull strength changes smoothly, never snaps to zero
      const force = this.reduceMotion ? 1 : 1 - Math.exp(-p.r * dt);
      p.x += (tx - p.x) * force;
      p.y += (ty - p.y) * force;
      const size = 1.4 + .5 * p.b;
      ctx.fillStyle = this.palette[Math.round(p.b * 16)];
      ctx.fillRect(p.x + Math.sin(sec * p.w * 4 + p.ph) * jitter, p.y + Math.cos(sec * p.w * 3 + p.ph) * jitter, size, size);
    }
    requestAnimationFrame(this.frame.bind(this));
  }
}
new ParticleHover();
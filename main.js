(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1. Background particles with mouse repulsion */
  const bg = document.getElementById('antigravity-hero-canvas');
  const bctx = bg.getContext('2d');
  let W = (bg.width = innerWidth), H = (bg.height = innerHeight);
  const mouse = { x: W / 2, y: H / 2, radius: 180 };
  let wide = false;
  const parts = [];
  class P {
    constructor() {
      this.ox = Math.random() * W; this.oy = Math.random() * H;
      this.x = this.ox; this.y = this.oy;
      this.vx = (Math.random() - .5) * .4; this.vy = (Math.random() - .5) * .4;
      this.s = Math.random() * 2 + 1; this.a = Math.random() * .25 + .1;
      this.c = Math.random() > .85 ? '#1a73e8' : '#64748b';
    }
    update() {
      this.ox += this.vx; this.oy += this.vy;
      if (this.ox < 0) this.ox = W; if (this.ox > W) this.ox = 0;
      if (this.oy < 0) this.oy = H; if (this.oy > H) this.oy = 0;
      const dx = mouse.x - this.x, dy = mouse.y - this.y, d = Math.hypot(dx, dy);
      if (d < mouse.radius) {
        const f = (1 - d / mouse.radius) * 12, a = Math.atan2(dy, dx);
        this.x -= Math.cos(a) * f; this.y -= Math.sin(a) * f;
      } else { this.x += (this.ox - this.x) * .05; this.y += (this.oy - this.y) * .05; }
    }
    draw() {
      bctx.beginPath(); bctx.arc(this.x, this.y, this.s, 0, 6.2832);
      bctx.fillStyle = this.c; bctx.globalAlpha = this.a; bctx.fill();
    }
  }
  function init() {
    parts.length = 0;
    const n = Math.min(140, Math.floor(W * H / 9000));
    for (let i = 0; i < n; i++) parts.push(new P());
  }
  init();
  addEventListener('resize', () => { W = bg.width = innerWidth; H = bg.height = innerHeight; init(); });
  addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  const gBtn = document.getElementById('zero-gravity-trigger'), gLbl = document.getElementById('gravity-status-label');
  gBtn.addEventListener('click', () => {
    wide = !wide; mouse.radius = wide ? 260 : 180;
    gLbl.textContent = wide ? 'Mouse field: wide' : 'Widen the mouse field';
  });
  function renderBg() {
    bctx.clearRect(0, 0, W, H);
    bctx.strokeStyle = 'rgba(0,0,0,0.04)'; bctx.lineWidth = .8;
    for (let i = 0; i < parts.length; i++) {
      parts[i].update(); parts[i].draw();
      for (let j = i + 1; j < parts.length; j++) {
        const d = Math.hypot(parts[i].x - parts[j].x, parts[i].y - parts[j].y);
        if (d < 90) {
          bctx.beginPath(); bctx.moveTo(parts[i].x, parts[i].y); bctx.lineTo(parts[j].x, parts[j].y);
          bctx.globalAlpha = (1 - d / 90) * .15; bctx.stroke();
        }
      }
    }
    if (!reduce) requestAnimationFrame(renderBg);
  }
  renderBg();

  /* 2. Glowing wave stream */
  const sc = document.getElementById('cinematic-stream-canvas'), sctx = sc.getContext('2d');
  let sw = 0, sh = 0, t = 0;
  const sm = { x: 0, y: 0, tx: 0, ty: 0 };
  function resizeS() {
    const r = sc.getBoundingClientRect();
    sw = sc.width = r.width || 800; sh = sc.height = r.height || 480;
    sm.x = sm.tx = sw / 2; sm.y = sm.ty = sh / 2;
  }
  resizeS(); addEventListener('resize', resizeS);
  sc.parentElement.addEventListener('mousemove', e => {
    const r = sc.getBoundingClientRect(); sm.tx = e.clientX - r.left; sm.ty = e.clientY - r.top;
  });
  const L = [
    ['26,115,232', .95, 46, .0048, 0, -12], ['36,210,181', 1.25, 52, .0054, .75, -6],
    ['6,182,212', 1.1, 40, .0062, 1.45, 4], ['99,102,241', 1.35, 58, .0051, 2.15, -8],
    ['124,58,237', 1.45, 62, .0068, 2.9, 0], ['168,85,247', 1.15, 48, .0058, 3.65, 8],
    ['236,72,153', 1.05, 44, .0064, 4.4, -4], ['245,158,11', .85, 38, .0042, 5.15, 6],
    ['251,191,36', 1.2, 50, .0046, 5.9, -2]
  ];
  const dust = ['#1a73e8', '#24D2B5', '#06b6d4', '#7c3aed', '#ec4899', '#f59e0b'];
  function renderS() {
    t += .02;
    sm.x += (sm.tx - sm.x) * .08; sm.y += (sm.ty - sm.y) * .08;
    sctx.clearRect(0, 0, sw, sh);
    L.forEach(([rgb, sp, amp, fr, ph, yo]) => {
      sctx.beginPath();
      const cy = sh / 2 + yo; sctx.moveTo(0, cy);
      for (let x = 0; x <= sw; x += 6) {
        let y = Math.sin(x * fr + t * sp + ph) * amp;
        y += Math.cos(x * fr * 2.1 - t * .75 + ph * .5) * amp * .32;
        y += Math.sin(x * .015 + t * 1.5) * 4;
        const d = Math.hypot(x - sm.x, cy + y - sm.y);
        if (d < 220) y -= Math.sin(d * .028) * (220 - d) * .28;
        sctx.lineTo(x, cy + y);
      }
      sctx.strokeStyle = `rgba(${rgb},0.88)`; sctx.lineWidth = .9; sctx.lineCap = 'round';
      sctx.shadowBlur = 10; sctx.shadowColor = `rgba(${rgb},0.5)`; sctx.globalAlpha = 1; sctx.stroke();
    });
    for (let i = 0; i < 32; i++) {
      const px = (i * 107 + t * 55) % sw, py = sh / 2 + Math.sin(px * .0055 + t * .9 + i) * 58;
      sctx.beginPath(); sctx.arc(px, py, (i % 3) * .5 + .9, 0, 6.2832);
      sctx.fillStyle = dust[i % 6]; sctx.shadowBlur = 8; sctx.shadowColor = sctx.fillStyle;
      sctx.globalAlpha = .65; sctx.fill();
    }
    if (!reduce) requestAnimationFrame(renderS);
  }
  renderS();

  /* 3. Terminal: auto-cycling commands with typing effect */
  const out = document.getElementById('cli-out');
  const cliCard = document.getElementById('cli-card');
  const cmdBox = document.getElementById('cli-cmds');
  const cmdBtns = [...cmdBox.querySelectorAll('.cmd')];
  const themes = { emerald: ['text-emerald-400', 'border-emerald-500/50'], cyan: ['text-cyan-400', 'border-cyan-500/50'], amber: ['text-amber-400', 'border-amber-500/50'] };
  let theme = 'emerald', cmd = 'whoami', typeTok = 0;
  const data = {
    whoami: ['name: Rachid Serraf', 'role: Full Stack Developer', 'school: Zone01 Oujda', 'location: Morocco', 'motto: always learning'],
    work: ['company: HPS, Casablanca', 'team: Acquirer, Software Factory', 'type: 2-month internship'],
    learn: ['frontend: React, Angular, Next.js', 'backend: Java/Spring Boot, Go, Rust, Node', 'data: PostgreSQL, SQLite, Redis', 'ops: Docker, Git, Gitea']
  };
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  function showCmd(name, animate) {
    cmd = name; const tok = ++typeTok; const [c, b] = themes[theme];
    cmdBtns.forEach(x => x.classList.toggle('active', x.dataset.cmd === name));
    const prompt = `<div class="flex items-center gap-2"><span class="${c} font-semibold">➜</span><span class="text-neutral-500">~</span><span class="text-neutral-500">$</span><span class="text-white font-medium" id="cli-typed"></span><span class="caret"></span></div>`;
    const body = `<div class="pl-4 border-l-2 ${b} bg-white/5 rounded-r px-2 py-1 space-y-1 text-neutral-300 rise">${data[name].map(l => `<div>${esc(l)}</div>`).join('')}</div>`;
    out.innerHTML = prompt;
    const typed = document.getElementById('cli-typed');
    if (!animate || reduce) { typed.textContent = name; out.insertAdjacentHTML('beforeend', body); return; }
    let i = 0;
    (function step() {
      if (tok !== typeTok) return;
      typed.textContent = name.slice(0, ++i);
      if (i < name.length) setTimeout(step, 60);
      else setTimeout(() => { if (tok === typeTok) out.insertAdjacentHTML('beforeend', body); }, 180);
    })();
  }

  /* Auto-advance: the progress bar under the active button ends, then the next one opens.
     Hover/focus/off-screen pauses it. A click by the visitor stops autoplay for that group. */
  function autoGroup(box, btns, key, onSelect) {
    const stop = () => btns.forEach(b => b.classList.remove('auto'));
    btns.forEach(b => b.addEventListener('click', () => { stop(); onSelect(b.dataset[key], true); }));
    box.addEventListener('animationend', e => {
      if (e.animationName !== 'fill') return;
      const i = btns.findIndex(b => b.classList.contains('active'));
      const nb = btns[(i + 1) % btns.length];
      onSelect(nb.dataset[key], true);
      nb.classList.add('auto');
    });
  }
  autoGroup(cmdBox, cmdBtns, 'cmd', (n, a) => showCmd(n, a));

  document.querySelectorAll('#cli-theme-swatches button').forEach((b, _, all) => b.addEventListener('click', () => {
    theme = b.dataset.theme;
    all.forEach(x => { x.classList.toggle('ring-2', x === b); x.classList.toggle('ring-white', x === b); });
    showCmd(cmd, false);
  }));
  showCmd('whoami', false);

  /* 4. Workbench tabs, auto-cycling */
  const workCard = document.getElementById('work');
  const tabBar = document.getElementById('tab-bar');
  const tabs = [...tabBar.querySelectorAll('.tab-btn')];
  function showTab(name) {
    tabs.forEach(x => x.classList.toggle('active', x.dataset.tab === name));
    document.querySelectorAll('.panel').forEach(p => { p.hidden = p.id !== 'tab-' + name; if (!p.hidden && !reduce) { p.classList.remove('rise'); void p.offsetWidth; p.classList.add('rise'); } });
  }
  autoGroup(tabBar, tabs, 'tab', showTab);

  /* Pause while hovered, focused, or off-screen; no autoplay if reduced motion */
  if (reduce) {
    document.querySelectorAll('.auto').forEach(b => b.classList.remove('auto'));
  } else {
    [cliCard, workCard].forEach(card => {
      const s = { over: false, focus: false, vis: false };
      const apply = () => card.classList.toggle('paused', s.over || s.focus || !s.vis);
      card.addEventListener('pointerenter', () => { s.over = true; apply(); });
      card.addEventListener('pointerleave', () => { s.over = false; apply(); });
      card.addEventListener('focusin', () => { s.focus = true; apply(); });
      card.addEventListener('focusout', () => { s.focus = false; apply(); });
      new IntersectionObserver(e => { s.vis = e[0].isIntersecting; apply(); }, { threshold: .4 }).observe(card);
      apply();
    });
  }
})();
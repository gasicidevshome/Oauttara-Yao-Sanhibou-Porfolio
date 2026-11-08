// Fond animé : mêmes bulles et mêmes couleurs que le portfolio (index.html), sans dépendance externe.
(function () {
  const html = document.documentElement;
  let saved = null;
  try { saved = localStorage.getItem("gm-theme"); } catch (e) {}
  const dark0 = saved ? saved === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  html.setAttribute("data-theme", dark0 ? "dark" : "light");

  const canvas = document.getElementById("blobCanvas"), ctx = canvas.getContext("2d");
  let W, H;
  const resize = () => { W = canvas.width = innerWidth; H = canvas.height = innerHeight; };
  resize(); addEventListener("resize", resize);

  const colors = () => html.getAttribute("data-theme") === "dark"
    ? { b1: "55,105,195", b2: "125,38,105", b3: "0,185,100", b4: "145,105,18", b5: "95,38,175" }
    : { b1: "180,220,255", b2: "255,179,209", b3: "76,255,160", b4: "255,229,102", b5: "196,126,255" };

  class Blob {
    constructor(ox, oy, rx, ry, c1, c2, c3, spd) {
      Object.assign(this, { ox, oy, rx, ry, c1, c2, c3, spd });
      this.x = ox * innerWidth; this.y = oy * innerHeight;
      this.ph = Math.random() * Math.PI * 2; this.mp = Math.random() * Math.PI * 2;
    }
    update(t) {
      const tx = this.ox * W + Math.sin(t * this.spd + this.ph) * 28;
      const ty = this.oy * H + Math.cos(t * this.spd * 0.7 + this.ph) * 18;
      this.x += (tx - this.x) * 0.045; this.y += (ty - this.y) * 0.045; this.mp += 0.011;
    }
    draw(c) {
      c.save(); c.translate(this.x, this.y);
      const mp = this.mp, mrx = this.rx * (1 + Math.sin(mp) * 0.17), mry = this.ry * (1 + Math.cos(mp * 0.8) * 0.17);
      c.rotate(Math.sin(mp * 0.5) * 0.28);
      const g = c.createRadialGradient(mrx * 0.2, -mry * 0.2, 0, 0, 0, Math.max(mrx, mry));
      g.addColorStop(0, `rgba(${this.c1},.9)`); g.addColorStop(0.5, `rgba(${this.c2},.75)`); g.addColorStop(1, `rgba(${this.c3},.5)`);
      c.beginPath();
      for (let i = 0; i <= 48; i++) {
        const a = (i / 48) * Math.PI * 2, n = 1 + Math.sin(a * 2.1 + mp) * 0.12 + Math.cos(a * 3.3 + mp * 0.6) * 0.09 + Math.sin(a * 1.7 + mp * 1.3) * 0.07;
        i === 0 ? c.moveTo(Math.cos(a) * mrx * n, Math.sin(a) * mry * n) : c.lineTo(Math.cos(a) * mrx * n, Math.sin(a) * mry * n);
      }
      c.closePath(); c.fillStyle = g; c.fill(); c.restore();
    }
  }
  let blobs = [];
  function build() {
    const C = colors();
    blobs = [new Blob(.1, .18, 255, 195, C.b1, C.b2, C.b5, .58), new Blob(.82, .12, 235, 188, C.b4, C.b2, C.b5, .5),
      new Blob(.78, .82, 215, 215, C.b3, C.b1, C.b1, .68), new Blob(.08, .85, 198, 172, C.b2, C.b5, C.b1, .54),
      new Blob(.45, .1, 148, 148, C.b1, C.b1, C.b5, .8), new Blob(.6, .78, 168, 140, C.b4, C.b3, C.b1, .63)];
  }
  build();

  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let t = 0;
  (function loop() {
    t += 0.01; ctx.clearRect(0, 0, W, H);
    blobs.forEach(b => { b.update(t); b.draw(ctx); });
    if (!still) requestAnimationFrame(loop);
  })();
  if (still) for (let i = 0; i < 120; i++) { t += 0.01; blobs.forEach(b => b.update(t)); }

  window.GMTheme = {
    toggle() {
      const d = html.getAttribute("data-theme") !== "dark";
      html.setAttribute("data-theme", d ? "dark" : "light");
      try { localStorage.setItem("gm-theme", d ? "dark" : "light"); } catch (e) {}
      build(); if (still) { ctx.clearRect(0, 0, W, H); blobs.forEach(b => b.draw(ctx)); }
    },
  };
})();

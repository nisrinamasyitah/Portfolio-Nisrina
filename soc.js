// Always start at the top of the page on refresh
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
if (location.hash) history.replaceState(null, '', location.pathname + location.search);
window.scrollTo(0, 0);

(function () {
    'use strict';
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ─── mobile menu ─────────────────────────────
    var nav = document.getElementById('nav');
    document.getElementById('burger').addEventListener('click', function () { nav.classList.toggle('open'); });
    nav.addEventListener('click', function (e) { if (e.target.tagName === 'A') nav.classList.remove('open'); });

    // ─── clock (Malaysia time) ───────────────────
    var clock = document.getElementById('clock');
    function tick() {
        clock.textContent = new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Kuala_Lumpur', hour12: false }) + ' MYT';
    }
    tick(); setInterval(tick, 1000);

    // ─── ticker: duplicate items for a seamless loop
    var tk = document.getElementById('ticker');
    tk.innerHTML += tk.innerHTML;

    // ─── role typing ─────────────────────────────
    var roles = ['Cybersecurity Undergraduate', 'Full-Stack Developer', 'Security Enthusiast', 'Web Developer', 'Software Engineer'];
    var roleEl = document.getElementById('role-type');
    if (!reduce) {
        var r = 0, i = roles[0].length, del = true;
        setTimeout(function step() {
            var w = roles[r];
            roleEl.textContent = w.slice(0, i);
            if (del) {
                if (i > 0) { i--; setTimeout(step, 35); }
                else { del = false; r = (r + 1) % roles.length; setTimeout(step, 250); }
            } else {
                if (i < roles[r].length) { i++; setTimeout(step, 65); }
                else { del = true; setTimeout(step, 1800); }
            }
        }, 2200);
    }

    // ─── radar ───────────────────────────────────
    var cv = document.getElementById('radar');
    var ctx = cv.getContext('2d');
    var blips = [
        { a: 0.6,  d: 0.62, label: 'GovCare+' },
        { a: 1.9,  d: 0.78, label: 'NelMora' },
        { a: 2.9,  d: 0.55, label: 'Rumah Kucing' },
        { a: 3.9,  d: 0.82, label: 'MY Hack 2025' },
        { a: 4.8,  d: 0.66, label: 'ICTF 2026' },
        { a: 5.6,  d: 0.84, label: 'Kali Linux' }
    ];
    var angle = 0, W = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    function size() {
        W = cv.clientWidth;
        cv.width = W * dpr; cv.height = W * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    size(); window.addEventListener('resize', size);

    function draw() {
        var c = W / 2, R = W / 2 - 14;
        ctx.clearRect(0, 0, W, W);
        // rings + crosshair
        ctx.strokeStyle = 'rgba(74,246,38,0.18)'; ctx.lineWidth = 1;
        for (var k = 1; k <= 4; k++) { ctx.beginPath(); ctx.arc(c, c, R * k / 4, 0, Math.PI * 2); ctx.stroke(); }
        ctx.beginPath(); ctx.moveTo(c - R, c); ctx.lineTo(c + R, c); ctx.moveTo(c, c - R); ctx.lineTo(c, c + R); ctx.stroke();
        // ticks
        ctx.strokeStyle = 'rgba(74,246,38,0.35)';
        for (var t = 0; t < 72; t++) {
            var ta = t * Math.PI / 36, len = t % 6 === 0 ? 8 : 4;
            ctx.beginPath();
            ctx.moveTo(c + Math.cos(ta) * R, c + Math.sin(ta) * R);
            ctx.lineTo(c + Math.cos(ta) * (R - len), c + Math.sin(ta) * (R - len));
            ctx.stroke();
        }
        // sweep
        if (ctx.createConicGradient) {
            var g = ctx.createConicGradient(angle - 1.1, c, c);
            g.addColorStop(0, 'rgba(74,246,38,0)');
            g.addColorStop(0.175, 'rgba(74,246,38,0.28)');
            g.addColorStop(0.176, 'rgba(74,246,38,0)');
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.moveTo(c, c); ctx.arc(c, c, R, angle - 1.1, angle); ctx.closePath(); ctx.fill();
        }
        ctx.strokeStyle = 'rgba(74,246,38,0.9)'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(c, c); ctx.lineTo(c + Math.cos(angle) * R, c + Math.sin(angle) * R); ctx.stroke();
        // blips: brightest right after the sweep passes
        ctx.font = '600 ' + Math.max(9, W / 38) + 'px JetBrains Mono, monospace';
        blips.forEach(function (b) {
            var diff = (angle - b.a) % (Math.PI * 2); if (diff < 0) diff += Math.PI * 2;
            var life = Math.max(0.25, 1 - diff / (Math.PI * 1.6));
            var x = c + Math.cos(b.a) * R * b.d, y = c + Math.sin(b.a) * R * b.d;
            ctx.fillStyle = 'rgba(74,246,38,' + life + ')';
            ctx.shadowColor = '#4af626'; ctx.shadowBlur = 10 * life;
            ctx.beginPath(); ctx.arc(x, y, 3.5, 0, Math.PI * 2); ctx.fill();
            ctx.shadowBlur = 0;
            ctx.strokeStyle = 'rgba(74,246,38,' + life * 0.5 + ')';
            ctx.beginPath(); ctx.arc(x, y, 3.5 + (1 - life) * 14, 0, Math.PI * 2); ctx.stroke();
            ctx.fillStyle = 'rgba(226,236,228,' + (0.35 + life * 0.6) + ')';
            ctx.textAlign = x > c ? 'left' : 'right';
            ctx.fillText(b.label, x + (x > c ? 9 : -9), y + 4);
        });
    }
    var running = true;
    function loop() {
        if (running) { angle = (angle + 0.018) % (Math.PI * 2); draw(); }
        requestAnimationFrame(loop);
    }
    if (reduce) { angle = 1; draw(); } else loop();
    if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (e) { running = e[0].isIntersecting; }).observe(cv);
    }

    // ─── reveal + gauges + bars + counters on scroll
    var targets = document.querySelectorAll('.panel, .kpi, .sec-head');
    targets.forEach(function (el) { el.classList.add('reveal'); });

    function activate(el) {
        el.classList.add('in');
        el.querySelectorAll('.gauge').forEach(function (g) {
            g.querySelector('.g-fg').style.strokeDashoffset = 213.6 * (1 - g.dataset.v / 100);
        });
        el.querySelectorAll('.bar').forEach(function (b) { b.querySelector('s').style.width = b.dataset.v + '%'; });
        var n = el.querySelector('[data-count]');
        if (n) {
            var end = +n.dataset.count, cur = 0;
            if (reduce) { n.textContent = end; return; }
            var iv = setInterval(function () { cur++; n.textContent = cur; if (cur >= end) clearInterval(iv); }, Math.max(30, 600 / end));
        }
    }

    if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) { if (e.isIntersecting) { activate(e.target); io.unobserve(e.target); } });
        }, { threshold: 0.15 });
        targets.forEach(function (el) { io.observe(el); });
    } else targets.forEach(activate);

    // ─── active nav link + back-to-top ───────────
    var links = Array.prototype.slice.call(nav.querySelectorAll('a'));
    var secs = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });
    var toTop = document.getElementById('to-top');
    window.addEventListener('scroll', function () {
        var y = window.scrollY + 140, on = -1;
        secs.forEach(function (s, i) { if (s && s.offsetTop <= y) on = i; });
        links.forEach(function (a, i) { a.classList.toggle('on', i === on); });
        toTop.classList.toggle('show', window.scrollY > 600);
    }, { passive: true });
})();

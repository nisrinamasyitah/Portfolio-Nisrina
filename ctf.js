// Always start at the top on refresh
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
if (location.hash) history.replaceState(null, '', location.pathname + location.search);
window.scrollTo(0, 0);

(function () {
    'use strict';
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ─── intro breach sequence ────────────────────
    var intro = document.getElementById('intro');
    var log = document.getElementById('intro-log');
    var title = document.getElementById('intro-title');
    var lines = [
        '<span class="w">$</span> ssh guest@nisrina.dev',
        'connecting to nisrina.dev (port 22) ...',
        '<span class="y">[*]</span> scanning ports ........ 22/open  443/open  1337/open',
        '<span class="y">[*]</span> bypassing firewall .... <span class="g">done</span>',
        '<span class="y">[*]</span> cracking password ..... ********',
        '<span class="y">[*]</span> escalating privileges . <span class="g">root</span>',
        '<span class="g">[+] ACCESS GRANTED</span>'
    ];
    var done = false;

    function finish() {
        if (done) return;
        done = true;
        intro.classList.add('gone');
        document.body.classList.remove('lock');
        startRole();
    }

    function showTitle() {
        log.style.opacity = '.25';
        title.classList.add('on');
        var g = title.querySelector('.glitch');
        g.classList.add('run');
        setTimeout(function () { g.classList.remove('run'); }, 500);
        setTimeout(finish, 2200);
    }

    if (reduce) {
        intro.style.display = 'none';
        done = true;
        startRole();
    } else {
        document.body.classList.add('lock');
        var li = 0;
        (function typeLine() {
            if (done) return;
            if (li >= lines.length) { setTimeout(showTitle, 250); return; }
            var div = document.createElement('div');
            log.appendChild(div);
            var html = lines[li++];
            var plain = html.replace(/<[^>]+>/g, '');
            var ci = 0;
            (function typeChar() {
                if (done) return;
                ci += 3;
                if (ci >= plain.length) { div.innerHTML = html; setTimeout(typeLine, 130); }
                else { div.textContent = plain.slice(0, ci); setTimeout(typeChar, 12); }
            })();
        })();
        document.getElementById('skip').addEventListener('click', finish);
        intro.addEventListener('click', function (e) { if (title.classList.contains('on') || e.target.id === 'skip') finish(); });
        document.addEventListener('keydown', function (e) { if (!done && (e.key === 'Enter' || e.key === 'Escape' || e.key === ' ')) finish(); });
    }

    // ─── role typing ──────────────────────────────
    var roleStarted = false;
    function startRole() {
        if (roleStarted) return;
        roleStarted = true;
        var roles = ['Cybersecurity Undergraduate', 'Full-Stack Developer', 'Security Enthusiast', 'Web Developer', 'Software Engineer'];
        var el = document.getElementById('role');
        if (reduce) { el.textContent = roles[0]; return; }
        var r = 0, i = 0, del = false;
        (function t() {
            var w = roles[r];
            el.textContent = w.slice(0, i);
            if (!del && i < w.length) { i++; setTimeout(t, 65); }
            else if (!del) { del = true; setTimeout(t, 1600); }
            else if (i > 0) { i--; setTimeout(t, 32); }
            else { del = false; r = (r + 1) % roles.length; setTimeout(t, 250); }
        })();
        var g = document.querySelector('.hero-name .glitch');
        if (!reduce) setInterval(function () { g.classList.add('run'); setTimeout(function () { g.classList.remove('run'); }, 280); }, 5000);
    }

    // ─── matrix rain in hero ──────────────────────
    var cv = document.getElementById('rain');
    if (cv && !reduce) {
        var ctx = cv.getContext('2d'), size = 16, drops = [], on = true, last = 0;
        var chars = '01NM{}<>/$#アイウエオカキクケコ'.split('');
        function rs() {
            cv.width = cv.offsetWidth; cv.height = cv.offsetHeight;
            drops = []; for (var i = 0; i < Math.ceil(cv.width / size); i++) drops[i] = Math.random() * -40;
        }
        rs(); window.addEventListener('resize', rs);
        (function draw(t) {
            if (on && t - last > 55) {
                last = t;
                ctx.fillStyle = 'rgba(3,5,4,.13)'; ctx.fillRect(0, 0, cv.width, cv.height);
                ctx.font = size + 'px JetBrains Mono, monospace'; ctx.fillStyle = '#4af626';
                for (var i = 0; i < drops.length; i++) {
                    ctx.fillText(chars[(Math.random() * chars.length) | 0], i * size, drops[i] * size);
                    if (drops[i] * size > cv.height && Math.random() > .975) drops[i] = 0;
                    drops[i]++;
                }
            }
            requestAnimationFrame(draw);
        })(0);
        if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { on = e[0].isIntersecting; }).observe(cv);
    }

    // ─── unlock levels as they scroll in ──────────
    var glyphs = '!<>-_\\/[]{}=+*^?#$%01';
    function decrypt(el) {
        var final = el.textContent, f = 0, total = 20;
        if (reduce) return;
        var iv = setInterval(function () {
            var out = '';
            for (var i = 0; i < final.length; i++) out += i < (f / total) * final.length ? final[i] : glyphs[(Math.random() * glyphs.length) | 0];
            el.textContent = out;
            if (++f > total) { clearInterval(iv); el.textContent = final; }
        }, 40);
    }
    function unlock(level) {
        level.classList.add('open');
        var st = level.querySelector('.lvl-state');
        st.innerHTML = '<i class="fas fa-lock-open"></i> <em>ACCESS GRANTED</em>';
        var h = level.querySelector('[data-decrypt]'); if (h) decrypt(h);
        level.querySelectorAll('.sk').forEach(function (s) { s.querySelector('s').style.width = s.dataset.v + '%'; });
    }
    var levels = document.querySelectorAll('.level');
    if ('IntersectionObserver' in window && !reduce) {
        var io = new IntersectionObserver(function (es) {
            es.forEach(function (e) { if (e.isIntersecting) { unlock(e.target); io.unobserve(e.target); } });
        }, { threshold: 0.12, rootMargin: '0px 0px -10% 0px' });
        levels.forEach(function (l) { io.observe(l); });
    } else levels.forEach(unlock);

    // ─── scroll progress ──────────────────────────
    var bar = document.getElementById('progress');
    window.addEventListener('scroll', function () {
        var h = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
    }, { passive: true });

    // ─── mobile nav ───────────────────────────────
    var nav = document.getElementById('nav');
    document.getElementById('burger').addEventListener('click', function () { nav.classList.toggle('open'); });
    nav.addEventListener('click', function (e) { if (e.target.tagName === 'A') nav.classList.remove('open'); });

})();

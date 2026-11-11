(function () {
    'use strict';

    var desktop = document.getElementById('desktop');
    var tasksEl = document.getElementById('tasks');
    var activeAppEl = document.getElementById('active-app');
    var startBtn = document.getElementById('start-btn');
    var startMenu = document.getElementById('start-menu');
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var isMobile = function () { return window.innerWidth <= 760; };

    // default window placement (fractions of desktop) and size (px)
    var layout = {
        welcome:    { x: .20, y: .07, w: 700, h: 470 },
        about:      { x: .24, y: .05, w: 780, h: 540 },
        academics:  { x: .28, y: .12, w: 720, h: 360 },
        experience: { x: .30, y: .05, w: 640, h: 560 },
        skills:     { x: .26, y: .06, w: 700, h: 540 },
        projects:   { x: .22, y: .05, w: 820, h: 560 },
        contact:    { x: .30, y: .06, w: 760, h: 540 },
        terminal:   { x: .52, y: .38, w: 600, h: 360 }
    };

    var wins = {};
    var zTop = 20;
    var openCount = 0;

    // ─── build window chrome + taskbar items ──────────────
    document.querySelectorAll('.win').forEach(function (win) {
        var app = win.dataset.app;
        var bar = document.createElement('header');
        bar.className = 'win-bar';
        bar.innerHTML =
            '<div class="win-btns">' +
                '<button class="wb close" aria-label="Close"></button>' +
                '<button class="wb min" aria-label="Minimize"></button>' +
                '<button class="wb max" aria-label="Maximize"></button>' +
            '</div>' +
            '<span class="win-title"><i class="fas ' + win.dataset.icon + '"></i>' + win.dataset.title + '</span>';
        win.prepend(bar);

        bar.querySelector('.close').addEventListener('click', function (e) { e.stopPropagation(); closeWin(app); });
        bar.querySelector('.min').addEventListener('click', function (e) { e.stopPropagation(); minimizeWin(app); });
        bar.querySelector('.max').addEventListener('click', function (e) { e.stopPropagation(); win.classList.toggle('max'); });
        bar.addEventListener('dblclick', function (e) { if (!e.target.closest('.wb')) win.classList.toggle('max'); });
        win.addEventListener('pointerdown', function () { focusWin(app); });
        makeDraggable(win, bar);

        wins[app] = { el: win, task: null, placed: false };
    });

    function placeWin(app) {
        var w = wins[app], el = w.el, L = layout[app] || { x: .25, y: .08, w: 680, h: 480 };
        var dw = desktop.clientWidth, dh = desktop.clientHeight;
        var width = Math.min(L.w, dw - 140), height = Math.min(L.h, dh - 30);
        var offset = (openCount % 5) * 22;
        var left = Math.max(120, Math.min(dw * L.x + offset, dw - width - 10));
        var top = Math.max(10, Math.min(dh * L.y + offset, dh - height - 10));
        el.style.width = width + 'px';
        el.style.height = height + 'px';
        el.style.left = left + 'px';
        el.style.top = top + 'px';
        w.placed = true;
    }

    function openWin(app) {
        var w = wins[app];
        if (!w) return;
        closeStart();
        if (w.el.hidden) {
            if (!w.placed) placeWin(app);
            w.el.hidden = false;
            openCount++;
            if (!w.task) addTask(app);
            onOpen(app);
        }
        w.task && w.task.classList.remove('minimized');
        focusWin(app);
    }

    function closeWin(app) {
        var w = wins[app];
        w.el.hidden = true;
        w.el.classList.remove('max', 'focused');
        w.placed = false;
        if (w.task) { w.task.remove(); w.task = null; }
        refreshActive();
    }

    function minimizeWin(app) {
        var w = wins[app];
        w.el.hidden = true;
        w.el.classList.remove('focused');
        w.task && w.task.classList.add('minimized');
        refreshActive();
    }

    function focusWin(app) {
        Object.keys(wins).forEach(function (k) {
            wins[k].el.classList.toggle('focused', k === app);
            wins[k].task && wins[k].task.classList.toggle('active', k === app);
        });
        wins[app].el.style.zIndex = ++zTop;
        activeAppEl.textContent = wins[app].el.dataset.title;
        if (app === 'terminal' && !isMobile()) setTimeout(function () { termIn.focus(); }, 0);
    }

    function refreshActive() {
        var best = null, bz = -1;
        Object.keys(wins).forEach(function (k) {
            var el = wins[k].el;
            if (!el.hidden && +el.style.zIndex > bz) { bz = +el.style.zIndex; best = k; }
        });
        if (best) focusWin(best);
        else {
            activeAppEl.textContent = 'desktop';
            Object.keys(wins).forEach(function (k) { wins[k].task && wins[k].task.classList.remove('active'); });
        }
    }

    function addTask(app) {
        var el = wins[app].el;
        var t = document.createElement('button');
        t.className = 'task';
        t.innerHTML = '<i class="fas ' + el.dataset.icon + '"></i><span>' + el.dataset.title + '</span>';
        t.addEventListener('click', function () {
            if (el.hidden) openWin(app);
            else if (el.classList.contains('focused')) minimizeWin(app);
            else focusWin(app);
        });
        tasksEl.appendChild(t);
        wins[app].task = t;
    }

    // ─── dragging ──────────────────────────────────────────
    function makeDraggable(win, handle) {
        var sx, sy, ox, oy, dragging = false;
        handle.addEventListener('pointerdown', function (e) {
            if (isMobile() || win.classList.contains('max') || e.target.closest('.wb')) return;
            dragging = true;
            sx = e.clientX; sy = e.clientY;
            ox = win.offsetLeft; oy = win.offsetTop;
            handle.setPointerCapture(e.pointerId);
        });
        handle.addEventListener('pointermove', function (e) {
            if (!dragging) return;
            var nx = ox + e.clientX - sx, ny = oy + e.clientY - sy;
            var maxX = desktop.clientWidth - 80, maxY = desktop.clientHeight - 36;
            win.style.left = Math.max(-win.offsetWidth + 80, Math.min(nx, maxX)) + 'px';
            win.style.top = Math.max(0, Math.min(ny, maxY)) + 'px';
        });
        ['pointerup', 'pointercancel'].forEach(function (ev) {
            handle.addEventListener(ev, function () { dragging = false; });
        });
    }

    // ─── openers ───────────────────────────────────────────
    document.addEventListener('click', function (e) {
        var opener = e.target.closest('[data-open]');
        if (opener) { e.preventDefault(); openWin(opener.dataset.open); return; }
        if (!startMenu.hidden && !e.target.closest('#start-menu') && !e.target.closest('#start-btn')) closeStart();
    });

    startBtn.addEventListener('click', function () {
        startMenu.hidden = !startMenu.hidden;
        startBtn.classList.toggle('on', !startMenu.hidden);
    });
    function closeStart() { startMenu.hidden = true; startBtn.classList.remove('on'); }

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeStart();
    });

    // ─── per-app behaviour on open ─────────────────────────
    var skillsBody = document.querySelector('.win-body.skills');
    function onOpen(app) {
        if (app === 'skills') {
            skillsBody.classList.remove('go');
            void skillsBody.offsetWidth;
            requestAnimationFrame(function () { skillsBody.classList.add('go'); });
        }
        if (app === 'welcome') startRoleTyping();
    }

    // ─── role typing on welcome ────────────────────────────
    var roles = ['Cybersecurity Undergraduate', 'Full-Stack Developer', 'Security Enthusiast', 'Web Developer', 'Software Engineer'];
    var roleEl = document.getElementById('role-type');
    var typingStarted = false;
    function startRoleTyping() {
        if (typingStarted) return;
        typingStarted = true;
        if (reduceMotion) { roleEl.textContent = roles[0]; return; }
        var r = 0, i = 0, del = false;
        (function tick() {
            var word = roles[r];
            roleEl.textContent = word.slice(0, i);
            if (!del && i < word.length) { i++; setTimeout(tick, 65); }
            else if (!del) { del = true; setTimeout(tick, 1500); }
            else if (i > 0) { i--; setTimeout(tick, 35); }
            else { del = false; r = (r + 1) % roles.length; setTimeout(tick, 300); }
        })();
    }

    // ─── clock ─────────────────────────────────────────────
    var clockEl = document.getElementById('clock');
    function tickClock() {
        var d = new Date();
        var day = d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
        var time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        clockEl.textContent = (isMobile() ? '' : day + '  ') + time;
    }
    tickClock();
    setInterval(tickClock, 15000);

    // ─── terminal ──────────────────────────────────────────
    var termOut = document.getElementById('term-out');
    var termIn = document.getElementById('term-in');
    var termBody = document.getElementById('term');
    var history = [], hIdx = 0;

    function esc(s) { return s.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
    function print(html) {
        var div = document.createElement('div');
        div.innerHTML = html;
        termOut.appendChild(div);
        termBody.scrollTop = termBody.scrollHeight;
    }

    var apps = ['welcome', 'about', 'academics', 'experience', 'skills', 'projects', 'contact', 'terminal'];
    var aliases = { 'about_me.txt': 'about', 'about_me': 'about', 'academics/': 'academics', 'education': 'academics',
        'experience.log': 'experience', 'exp': 'experience', 'skills.sh': 'skills', 'projects/': 'projects',
        'contact.sh': 'contact', 'welcome.sh': 'welcome', 'home': 'welcome' };
    function resolveApp(name) { name = (name || '').toLowerCase(); return apps.indexOf(name) > -1 ? name : aliases[name]; }

    var commands = {
        help: function () {
            return [
                '<span class="w">available commands</span>',
                '  <span class="g">whoami</span>        who is behind this machine',
                '  <span class="g">neofetch</span>      system info',
                '  <span class="g">ls</span>            list files',
                '  <span class="g">open</span> &lt;app&gt;    open a window (e.g. open projects)',
                '  <span class="g">skills</span>        top skills',
                '  <span class="g">projects</span>      list projects',
                '  <span class="g">experience</span>    work &amp; activities',
                '  <span class="g">education</span>     academics',
                '  <span class="g">contact</span>       how to reach me',
                '  <span class="g">socials</span>       links',
                '  <span class="g">cv</span>            download my CV',
                '  <span class="g">date</span> · <span class="g">clear</span> · <span class="g">exit</span>'
            ].join('\n');
        },
        whoami: function () {
            return '<span class="w">Nisrina Masyitah Mohd Nor Zaidi</span>\nCybersecurity undergraduate @ Multimedia University.\nFull-stack developer · CTF player · founder of Nelmora Group Empire.';
        },
        neofetch: function () {
            return [
                '<span class="g">   ███╗   ██╗███╗   ███╗</span>   <span class="w">guest@nisrina-os</span>',
                '<span class="g">   ████╗  ██║████╗ ████║</span>   ----------------',
                '<span class="g">   ██╔██╗ ██║██╔████╔██║</span>   <span class="g">OS</span>: nisrina-os v2.0',
                '<span class="g">   ██║╚██╗██║██║╚██╔╝██║</span>   <span class="g">Host</span>: Multimedia University',
                '<span class="g">   ██║ ╚████║██║ ╚═╝ ██║</span>   <span class="g">Degree</span>: BCS (Hons) Cybersecurity',
                '<span class="g">   ╚═╝  ╚═══╝╚═╝     ╚═╝</span>   <span class="g">Location</span>: Cyberjaya, MY',
                '                            <span class="g">Shell</span>: zsh + kali-linux',
                '                            <span class="g">Stack</span>: React, Next.js, Node, PHP, Python',
                '                            <span class="g">Tools</span>: Wireshark, OWASP ZAP, Docker',
                '                            <span class="g">Status</span>: <span class="y">open_to_work</span>'
            ].join('\n');
        },
        ls: function () {
            return '<span class="g">academics/</span>  <span class="g">projects/</span>  about_me.txt  experience.log  skills.sh  contact.sh  welcome.sh  cv.pdf';
        },
        open: function (args) {
            if (args[0] && args[0].toLowerCase() === 'cv.pdf') return commands.cv();
            var app = resolveApp(args[0]);
            if (!app) return '<span class="r">open: no such app.</span> try: ' + apps.join(', ');
            openWin(app);
            return '<span class="g">[+]</span> opening ' + wins[app].el.dataset.title + ' ...';
        },
        cat: function (args) { return commands.open(args); },
        skills: function () {
            return [
                '<span class="w">languages</span>  HTML · CSS · JavaScript · Python · PHP · C++',
                '<span class="w">frameworks</span> React / Next.js · Node.js / Express · Bootstrap · Flutter',
                '<span class="w">databases</span>  MySQL · PostgreSQL · Firebase',
                '<span class="w">security</span>   Kali Linux · Wireshark · OWASP ZAP',
                '<span class="w">devops</span>     Docker · VirtualBox / GNS3 · XAMPP · VS Code',
                'run <span class="g">open skills</span> for the full meter.'
            ].join('\n');
        },
        projects: function () {
            return [
                '<span class="g">GovCare+</span>         NLP (BERT) multilingual complaint routing · React, Firebase, Python',
                '<span class="g">NelMora Parfums</span>  e-commerce w/ Stripe + Billplz · Next.js, Node.js, PostgreSQL',
                '<span class="g">Rumah Kucing</span>     cat hotel mgmt, RBAC + secure sessions · PHP, MySQL',
                'run <span class="g">open projects</span> to see them.'
            ].join('\n');
        },
        experience: function () {
            return [
                '<span class="g">[ACTIVE]</span> Founder · Nelmora Group Empire           2025 – Present',
                '<span class="w">[DONE]</span>   IT Intern · Consurv Technic Sdn Bhd      Jul 2026 – Oct 2026',
                '<span class="y">[CTF]</span>    ICTF 2026 Prep Workshop                  2026',
                '<span class="y">[CTF]</span>    MY Hack 2025                             2025',
                '<span class="w">[DEV]</span>    Zero to App Flutter Workshop             2025'
            ].join('\n');
        },
        education: function () {
            return [
                '<span class="g">Multimedia University</span>  BCS (Hons) Cybersecurity          2024 – 2027',
                '<span class="g">Multimedia University</span>  Foundation in IT                  2022 – 2023',
                '<span class="g">SMKA Kuala Lipis</span>       SPM                               2017 – 2021'
            ].join('\n');
        },
        contact: function () {
            return 'email    <a href="https://mail.google.com/mail/?view=cm&to=nisrinamasyitah@gmail.com" target="_blank">nisrinamasyitah@gmail.com</a>\nphone    +601125618247\nlocation Cyberjaya, Malaysia\nrun <span class="g">open contact</span> to send a message.';
        },
        socials: function () {
            return 'github    <a href="https://github.com/nisrinamasyitah" target="_blank">github.com/nisrinamasyitah</a>\nlinkedin  <a href="https://www.linkedin.com/in/nisrina-masyitah-bbb125269" target="_blank">linkedin.com/in/nisrina-masyitah</a>\ninstagram <a href="https://www.instagram.com/theonlymeci" target="_blank">@theonlymeci</a>';
        },
        cv: function () {
            window.open('cvNM.pdf', '_blank');
            return '<span class="g">[+]</span> downloading cv.pdf ...';
        },
        date: function () { return new Date().toString(); },
        echo: function (args) { return esc(args.join(' ')); },
        pwd: function () { return '/home/guest'; },
        clear: function () { termOut.innerHTML = ''; return null; },
        exit: function () { closeWin('terminal'); return null; },
        sudo: function () { return '<span class="r">guest is not in the sudoers file. This incident will be reported.</span> 😉'; },
        rm: function () { return '<span class="r">permission denied:</span> nice try.'; }
    };
    commands.about = function () { return commands.open(['about']); };
    commands.hire = function () { return commands.open(['contact']); };

    function run(line) {
        print('<span class="in"><span class="ps">guest@nisrina-os:~$</span>' + esc(line) + '</span>');
        var parts = line.trim().split(/\s+/);
        var cmd = (parts.shift() || '').toLowerCase();
        if (!cmd) return;
        var fn = commands[cmd];
        if (!fn) { print('<span class="r">command not found:</span> ' + esc(cmd) + ' — type <span class="g">help</span>'); return; }
        var out = fn(parts);
        if (out) print(out);
    }

    termIn.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            var v = termIn.value;
            if (v.trim()) { history.push(v); hIdx = history.length; }
            termIn.value = '';
            run(v);
        } else if (e.key === 'ArrowUp') {
            if (hIdx > 0) { hIdx--; termIn.value = history[hIdx]; }
            e.preventDefault();
        } else if (e.key === 'ArrowDown') {
            if (hIdx < history.length - 1) { hIdx++; termIn.value = history[hIdx]; }
            else { hIdx = history.length; termIn.value = ''; }
            e.preventDefault();
        } else if (e.key === 'Tab') {
            e.preventDefault();
            var v2 = termIn.value.toLowerCase();
            var match = Object.keys(commands).filter(function (c) { return c.indexOf(v2) === 0; });
            if (match.length === 1) termIn.value = match[0] + ' ';
        }
    });
    termBody.addEventListener('click', function () { if (!window.getSelection().toString()) termIn.focus(); });

    print('nisrina-os v2.0 — type <span class="g">help</span> to see what I can do.\n');

    // ─── boot sequence ─────────────────────────────────────
    var boot = document.getElementById('boot');
    var bootLog = document.getElementById('boot-log');
    var bootLines = [
        '<span class="w">nisrina-os</span> v2.0 (tty1)',
        '',
        '<span class="dim">[    0.000]</span> initializing kernel ...',
        '<span class="dim">[    0.112]</span> loading modules: <span class="w">appsec</span> <span class="w">fullstack</span> <span class="w">ctf</span>',
        '<span class="dim">[    0.248]</span> mounting /home/nisrina ............ <span class="ok">[ OK ]</span>',
        '<span class="dim">[    0.391]</span> starting firewall ................. <span class="ok">[ OK ]</span>',
        '<span class="dim">[    0.502]</span> verifying ssl certificates ........ <span class="ok">[ OK ]</span>',
        '<span class="dim">[    0.644]</span> loading projects (3) .............. <span class="ok">[ OK ]</span>',
        '<span class="dim">[    0.790]</span> starting display manager .......... <span class="ok">[ OK ]</span>',
        '',
        'nisrina-os login: <span class="w">guest</span>',
        'access granted. welcome.'
    ];
    var bootDone = false;
    function finishBoot() {
        if (bootDone) return;
        bootDone = true;
        boot.classList.add('done');
        setTimeout(function () { boot.style.display = 'none'; }, 550);
        openWin('welcome');
        if (!isMobile()) { openWin('terminal'); focusWin('welcome'); }
        try { sessionStorage.setItem('nm-booted', '1'); } catch (e) {}
    }
    function runBoot() {
        bootDone = false;
        boot.style.display = '';
        boot.classList.remove('done');
        bootLog.innerHTML = '';
        if (reduceMotion) { bootLog.innerHTML = bootLines.join('\n'); setTimeout(finishBoot, 600); return; }
        var i = 0;
        (function next() {
            if (bootDone) return;
            if (i < bootLines.length) {
                bootLog.innerHTML += bootLines[i++] + '\n';
                setTimeout(next, 110 + Math.random() * 90);
            } else setTimeout(finishBoot, 500);
        })();
    }
    ['keydown', 'pointerdown'].forEach(function (ev) {
        boot.addEventListener(ev, finishBoot);
        document.addEventListener(ev, function () { if (!bootDone && boot.style.display !== 'none') finishBoot(); });
    });

    var seen = false;
    try { seen = sessionStorage.getItem('nm-booted') === '1'; } catch (e) {}
    if (seen) { boot.style.display = 'none'; finishBoot(); }
    else runBoot();

    document.getElementById('reboot').addEventListener('click', function () {
        closeStart();
        Object.keys(wins).forEach(function (k) { if (!wins[k].el.hidden || wins[k].task) closeWin(k); });
        try { sessionStorage.removeItem('nm-booted'); } catch (e) {}
        runBoot();
    });
})();

// On refresh, always start at the top of the home page
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
if (location.hash) history.replaceState(null, '', location.pathname + location.search);
window.scrollTo(0, 0);
window.addEventListener('load', function(){ window.scrollTo(0, 0); });

$(document).ready(function(){
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    $(window).scroll(function(){
        // sticky navbar on scroll script
        if(this.scrollY > 20){
            $('.navbar').addClass("sticky");
        }else{
            $('.navbar').removeClass("sticky");
        }

        // scroll-up button show/hide script
        if(this.scrollY > 500){
            $('.scroll-up-btn').addClass("show");
        }else{
            $('.scroll-up-btn').removeClass("show");
        }
    });

    // slide-up script
    $('.scroll-up-btn').click(function(){
        $('html').animate({scrollTop: 0});
        // removing smooth scroll on slide-up button click
        $('html').css("scrollBehavior", "auto");
    });

    $('.navbar .menu li a').click(function(){
        // applying again smooth scroll on menu items click
        $('html').css("scrollBehavior", "smooth");
    });

    // toggle menu/navbar script
    $('.menu-btn').click(function(){
        $('.navbar .menu').toggleClass("active");
        $('.menu-btn i').toggleClass("active");
    });

    // typing text animation script
    var roles = ["Cybersecurity Undergraduate", "Full-Stack Developer", "Security Enthusiast", "Web Developer", "Software Engineer"];
    new Typed(".typing", { strings: roles, typeSpeed: 70, backSpeed: 40, backDelay: 1400, loop: true });
    new Typed(".typing-2", { strings: roles, typeSpeed: 70, backSpeed: 40, backDelay: 1400, loop: true });

    // owl carousel script
    $('.carousel').owlCarousel({
        margin: 20,
        loop: false,
        autoplay: false,
        autoplayTimeOut: 2000,
        autoplayHoverPause: true,
        responsive: {
            0:{ items: 1, nav: false },
            600:{ items: 2, nav: false },
            1000:{ items: 3, nav: false }
        }
    });

    // ─── matrix rain in the hero ───────────────────────
    var canvas = document.getElementById('matrix');
    if (canvas && !reduceMotion) {
        var ctx = canvas.getContext('2d');
        var chars = '01アイウエオカキクケコ<>/{}[]$#&*ABCDEF0123456789'.split('');
        var size = 16, drops = [], running = true;

        function resize() {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            var cols = Math.ceil(canvas.width / size);
            drops = [];
            for (var i = 0; i < cols; i++) drops[i] = Math.random() * -50;
        }
        resize();
        $(window).on('resize', resize);

        var last = 0;
        function draw(t) {
            if (running && t - last > 55) {
                last = t;
                ctx.fillStyle = 'rgba(7, 9, 12, 0.12)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.font = size + 'px JetBrains Mono, monospace';
                for (var i = 0; i < drops.length; i++) {
                    var ch = chars[Math.floor(Math.random() * chars.length)];
                    ctx.fillStyle = Math.random() > 0.97 ? '#9dff8a' : '#4af626';
                    ctx.fillText(ch, i * size, drops[i] * size);
                    if (drops[i] * size > canvas.height && Math.random() > 0.975) drops[i] = 0;
                    drops[i]++;
                }
            }
            requestAnimationFrame(draw);
        }
        requestAnimationFrame(draw);

        // pause when hero is off-screen
        if ('IntersectionObserver' in window) {
            new IntersectionObserver(function(entries){
                running = entries[0].isIntersecting;
            }).observe(document.getElementById('home'));
        }
    }

    // ─── scramble section titles when they scroll in ───
    var glyphs = '!<>-_\\/[]{}=+*^?#$%01';
    function scramble(el) {
        var final = el.getAttribute('data-final') || el.textContent;
        el.setAttribute('data-final', final);
        var frame = 0, total = 22;
        var iv = setInterval(function(){
            var out = '';
            for (var i = 0; i < final.length; i++) {
                if (i < (frame / total) * final.length || final[i] === ' ') out += final[i];
                else out += glyphs[Math.floor(Math.random() * glyphs.length)];
            }
            el.textContent = out;
            if (++frame > total) { clearInterval(iv); el.textContent = final; }
        }, 35);
    }

    if ('IntersectionObserver' in window) {
        var titleObs = new IntersectionObserver(function(entries){
            entries.forEach(function(e){
                if (e.isIntersecting) {
                    if (!reduceMotion) scramble(e.target);
                    titleObs.unobserve(e.target);
                }
            });
        }, { threshold: 0.6 });
        document.querySelectorAll('[data-scramble]').forEach(function(el){ titleObs.observe(el); });

        // fill skill bars when the skills section is visible
        var skillObs = new IntersectionObserver(function(entries){
            if (entries[0].isIntersecting) {
                entries[0].target.classList.add('in-view');
                skillObs.disconnect();
            }
        }, { threshold: 0.15 });
        skillObs.observe(document.getElementById('skills'));
    } else {
        $('#skills').addClass('in-view');
    }

    // ─── occasional glitch flash on the hero name ──────
    var glitchEl = document.querySelector('.glitch');
    if (glitchEl && !reduceMotion) {
        setInterval(function(){
            glitchEl.classList.add('run');
            setTimeout(function(){ glitchEl.classList.remove('run'); }, 300);
        }, 4200);
    }
});

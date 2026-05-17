/* =========================================
   THEME TOGGLE LOGIC (Blink-Free)
   ========================================= */
const themeBtn = document.getElementById('theme-toggle');
const sunIcon = document.querySelector('.sun-icon');
const moonIcon = document.querySelector('.moon-icon');
const htmlElement = document.documentElement;

// 1. Determine Initial Theme
const savedTheme = localStorage.getItem('theme');
const systemPref = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
const initialTheme = savedTheme || systemPref;

// 2. Apply Immediately
htmlElement.setAttribute('data-theme', initialTheme);
updateIcons(initialTheme);

// 3. Icon Update Helper
function updateIcons(theme) {
    if (theme === 'dark') {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    } else {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
    }
}

// 4. Click Handler with Animation
themeBtn.addEventListener('click', (event) => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    // Check support
    if (!document.startViewTransition) {
        applyTheme(newTheme);
        return;
    }

    // Get click coordinates (Center of circle)
    const x = event.clientX;
    const y = event.clientY;

    // Calculate radius to fill screen
    const endRadius = Math.hypot(
        Math.max(x, innerWidth - x),
        Math.max(y, innerHeight - y)
    );

    // Start transition
    const transition = document.startViewTransition(() => {
        applyTheme(newTheme);
    });

    // Run Animation: Always EXPAND the new theme
    transition.ready.then(() => {
        document.documentElement.animate(
            {
                clipPath: [
                    `circle(0px at ${x}px ${y}px)`,
                    `circle(${endRadius}px at ${x}px ${y}px)`
                ]
            },
            {
                duration: 500,
                easing: 'ease-in',
                pseudoElement: '::view-transition-new(root)',
            }
        );
    });
});

// Helper function
function applyTheme(theme) {
    htmlElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    updateIcons(theme);
}


/* =========================================
   MOBILE MENU LOGIC
   ========================================= */
const menuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');
const links = document.querySelectorAll('.nav-link');

menuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

links.forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
    });
});


/* =========================================
   ADVANCED TYPEWRITER EFFECT (Smart Erase)
   ========================================= */
function initTypewriter(options) {
    const {
        target,
        phrases = [],
        typeSpeed = 65,
        eraseSpeed = 35,
        holdAfterType = 1500, // Normal typing ke baad ka wait
        holdAfterErase = 400,
        initialDelay = 2500 // 🔥 NAYA: Page load hone ke baad kitni der rukk kar delete karna hai (milliseconds me)
    } = options;

    const textEl = document.querySelector(target);
    if (!textEl || !phrases.length) return;

    // Reduced motion accessiblity check
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
        if (!textEl.textContent.trim()) {
            textEl.textContent = phrases[0];
        }
        return;
    }

    const STATE = {
        TYPING: "typing",
        HOLD_AFTER_TYPE: "hold_after_type",
        DELETING: "deleting",
        HOLD_AFTER_DELETE: "hold_after_delete"
    };

    let state;
    let phraseIndex;
    let charIndex;
    let current;
    let next;

    const initialText = textEl.textContent.trim(); // Trim for safety

    if (initialText.length > 0) {
        current = initialText;
        next = phrases[0]; 
        charIndex = initialText.length;
        state = STATE.HOLD_AFTER_TYPE; 
        phraseIndex = -1; 
    } else {
        current = phrases[0];
        next = phrases[1 % phrases.length];
        charIndex = 0;
        state = STATE.TYPING;
        textEl.textContent = "";
    }

    let timeoutId = null;
    let pauseRequested = false;

    function clearTimer() {
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
    }

    function schedule(fn, delay) {
        clearTimer();
        timeoutId = setTimeout(fn, delay);
    }

    // Finds common prefix so it doesn't delete the whole word if not needed
    function commonPrefixLength(a, b) {
        let i = 0;
        while (i < a.length && i < b.length && a[i] === b[i]) i++;
        return i;
    }

    function run() {
        switch (state) {
            case STATE.TYPING: {
                textEl.textContent = current.slice(0, charIndex + 1);
                charIndex++;

                if (charIndex === current.length) {
                    state = STATE.HOLD_AFTER_TYPE;
                    schedule(run, holdAfterType);
                } else {
                    schedule(run, typeSpeed);
                }
                break;
            }

            case STATE.HOLD_AFTER_TYPE:
                if (pauseRequested) return;
                state = STATE.DELETING;
                run();
                break;

            case STATE.DELETING: {
                const common = commonPrefixLength(current, next);

                if (charIndex > common) {
                    charIndex--;
                    textEl.textContent = current.slice(0, charIndex);
                    schedule(run, eraseSpeed);
                } else {
                    state = STATE.HOLD_AFTER_DELETE;
                    schedule(run, holdAfterErase);
                }
                break;
            }

            case STATE.HOLD_AFTER_DELETE:
                phraseIndex = (phraseIndex + 1) % phrases.length;
                current = phrases[phraseIndex];
                next = phrases[(phraseIndex + 1) % phrases.length];
                state = STATE.TYPING;
                run();
                break;
        }
    }

    function setPause(val) {
        pauseRequested = val;
        if (!val && state === STATE.HOLD_AFTER_TYPE) {
            run();
        }
    }

    // Interactive Pausing
    const container = textEl.parentElement;
    if (container) {
        container.addEventListener("mouseenter", () => setPause(true));
        container.addEventListener("mouseleave", () => setPause(false));
        container.addEventListener("focusin", () => setPause(true));
        container.addEventListener("focusout", () => setPause(false));
    }

    document.addEventListener("touchstart", () => setPause(true), { passive: true });
    document.addEventListener("touchend", () => setPause(false));
    
    if (initialText.length > 0) {
        schedule(run, initialDelay);
    } else {
        run();
    }
}


/* =========================================
   ABOUT IMAGE GLOW EFFECT (Mouse Tracking)
   ========================================= */
const aboutImage = document.querySelector('.about-image');

if (aboutImage) {
    let rafId = null;

    aboutImage.addEventListener('mousemove', (e) => {
        if (rafId) return;

        rafId = requestAnimationFrame(() => {
            const rect = aboutImage.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;

            aboutImage.style.setProperty('--x', x + '%');
            aboutImage.style.setProperty('--y', y + '%');

            rafId = null;
        });
    });
}

/* =========================================
   SMART NAVIGATION (Clean URL & Smooth Scroll)
   ========================================= */
document.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (!href) return;
        
        if (href.includes('/') && !href.startsWith('#') && href !== '/') {
            return; 
        }

        const currentPath = window.location.pathname;
        const isHomePage = currentPath === '/' || currentPath.endsWith('index.html');

        if (href === '/' && isHomePage) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            history.pushState(null, null, currentPath); 
            highlightActiveLink();
        }
        else if (href === '#') {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            history.pushState(null, null, currentPath); 
            highlightActiveLink();
        }
    });
});

/* =========================================
   SCROLL ANIMATIONS (Intersection Observer)
   ========================================= */
const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
            obs.unobserve(entry.target); 
        }
    });
}, {
    threshold: 0.2,
    rootMargin: "0px 0px -50px 0px" 
});

document.querySelectorAll('[data-animate]').forEach(el => {
    observer.observe(el);
});

/* =========================================
   ACTIVE NAV LINK HIGHLIGHTER (Path + Hash)
   ========================================= */
function highlightActiveLink() {
    const navLinks = document.querySelectorAll('.nav-links .nav-link');
    const currentPath = window.location.pathname;
    const currentHash = window.location.hash;

    navLinks.forEach(link => link.classList.remove('active'));

    let matched = false;

    if (currentHash) {
        navLinks.forEach(link => {
            if (link.getAttribute('href') === currentHash) {
                link.classList.add('active');
                matched = true;
            }
        });
    }

    if (!matched) {
        navLinks.forEach(link => {
            const linkHref = link.getAttribute('href');
            if (linkHref.startsWith('#')) return;

            const linkUrl = new URL(link.href, window.location.origin);
            const linkPath = linkUrl.pathname;

            if (currentPath === linkPath || (currentPath === '/' && linkPath.endsWith('index.html'))) {
                link.classList.add('active');
            }
        });
    }
}

/* =========================================
   SCROLL SPY (Active Nav on Manual Scroll)
   ========================================= */
function initScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.getAttribute('id');
                const navLink = document.querySelector(`.nav-links a[href="#${sectionId}"]`);
                const homeLink = document.querySelector('.nav-links a[href="/"]');

                if (sectionId === 'hero' && (window.location.pathname === '/' || window.location.pathname.endsWith('index.html'))) {
                    document.querySelectorAll('.nav-links .nav-link').forEach(l => l.classList.remove('active'));
                    if (homeLink) homeLink.classList.add('active');
                } 
                else if (navLink) {
                    document.querySelectorAll('.nav-links .nav-link').forEach(l => l.classList.remove('active'));
                    navLink.classList.add('active');
                }
            }
        });
    }, {
        rootMargin: "-30% 0px -60% 0px"
    });

    sections.forEach(section => {
        scrollObserver.observe(section);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. Highlight Correct Link
    highlightActiveLink();
    
    // 2. Initialize Scroll Spy
    initScrollSpy();

    // 3. Initialize Advanced Typewriter
    initTypewriter({
        target: '.typing-text',
        phrases: [
            "Android apps with Kotlin.",
            "Android apps with Compose.",
            "cross-platform apps with KMP.",
            "cross-platform apps with CMP.",
            "fluid UIs with Native Canvas.",
            "scalable apps with Firebase.",
            "clean systems with MVVM.",
            "robust apps with Clean Architecture."   
        ],
        typeSpeed: 55,
        eraseSpeed: 30,
        holdAfterType: 1800 
    });
});

window.addEventListener('hashchange', highlightActiveLink);
window.addEventListener('popstate', highlightActiveLink);
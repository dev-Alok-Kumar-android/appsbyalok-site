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
   TYPING EFFECT
   ========================================= */
const typingText = document.querySelector('.typing-text');
const words = ["Jetpack Compose.", "Kotlin.", "Modern Android.", "System Design.", "UX Design."];
let wordIndex = 0;
let charIndex = 0;
let isDeleting = false;

function type() {
    if (!typingText) return; 
    
    const currentWord = words[wordIndex];
    
    if (isDeleting) {
        typingText.textContent = currentWord.substring(0, charIndex - 1);
        charIndex--;
    } else {
        typingText.textContent = currentWord.substring(0, charIndex + 1);
        charIndex++;
    }

    if (!isDeleting && charIndex === currentWord.length) {
        isDeleting = true;
        setTimeout(type, 2000); 
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        setTimeout(type, 500); 
    } else {
        setTimeout(type, isDeleting ? 100 : 150); 
    }
}

document.addEventListener('DOMContentLoaded', type);

/* =========================================
   ABOUT IMAGE GLOW EFFECT (Mouse Tracking)
   ========================================= */
const aboutImage = document.querySelector('.about-image');

// Check if aboutImage exists on the current page before adding listener
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
        
        // If it's a link to another page (like projects/wallpaper.html), let it behave normally
        if (href.includes('/') && !href.startsWith('#') && href !== '/') {
            return; 
        }

        const currentPath = window.location.pathname;
        const isHomePage = currentPath === '/' || currentPath.endsWith('index.html');

        // Navigating to Home '/'
        if (href === '/' && isHomePage) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            history.pushState(null, null, '/');
            highlightActiveLink();
        }
        
        // Navigating to Top '#'
        else if (href === '#') {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            history.pushState(null, null, currentPath); 
            highlightActiveLink();
        }
    });
});

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

            // Path match logic
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
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.getAttribute('id');
                
                const navLink = document.querySelector(`.nav-links a[href="#${sectionId}"]`);
                const homeLink = document.querySelector('.nav-links a[href="/"]');

                if (sectionId === 'hero' && window.location.pathname === '/') {
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
        observer.observe(section);
    });
}

// Listeners
document.addEventListener('DOMContentLoaded', highlightActiveLink);
window.addEventListener('hashchange', highlightActiveLink);
document.addEventListener('DOMContentLoaded', initScrollSpy);

window.addEventListener('popstate', highlightActiveLink);
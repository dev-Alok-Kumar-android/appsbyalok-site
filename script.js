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
                // Always animate the NEW view entering
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
const words = ["Jetpack Compose.", "Kotlin.", "Modern Android."];
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
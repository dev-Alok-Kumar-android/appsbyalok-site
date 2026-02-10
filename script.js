/* =========================================
   THEME TOGGLE LOGIC
   ========================================= */
const themeBtn = document.getElementById('theme-toggle');
const sunIcon = document.querySelector('.sun-icon');
const moonIcon = document.querySelector('.moon-icon');
const htmlElement = document.documentElement;

// 1. Determine Initial Theme (Saved or System Pref)
const savedTheme = localStorage.getItem('theme');
const systemPref = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
const initialTheme = savedTheme || systemPref;

// 2. Apply Immediately
htmlElement.setAttribute('data-theme', initialTheme);
updateIcons(initialTheme);

// 3. Icon Update Helper
function updateIcons(theme) {
    if (theme === 'dark') {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
    } else {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    }
}

// 4. Click Handler
themeBtn.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateIcons(newTheme);
});

/* =========================================
   MOBILE MENU LOGIC
   ========================================= */
const menuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');
const links = document.querySelectorAll('.nav-link');

menuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// Close menu when a link is clicked
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
        setTimeout(type, 2000); // Pause at end of word
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        setTimeout(type, 500); // Pause before next word
    } else {
        setTimeout(type, isDeleting ? 100 : 150); // Typing speed
    }
}

document.addEventListener('DOMContentLoaded', type);
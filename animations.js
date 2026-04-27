/**
 * animations.js
 * Handles interactive background animations.
 */

// Global variable to keep track of the current animation frame
let currentAnimFrame;

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    const animationType = canvas.getAttribute('data-animation');

    if (animationType === 'snow') {
        initSnowfall();
    } else {
        initParticles();
    }
});

// --- NEW FUNCTION: To switch backgrounds dynamically ---
window.changeBg = function(type) {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    // 1. Stop the currently running animation
    if (currentAnimFrame) {
        cancelAnimationFrame(currentAnimFrame);
    }
    
    // 2. Clear the canvas completely
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 3. Start the requested animation
    if (type === 'snow') {
        initSnowfall();
    } else if (type === 'lines') {
        initParticles();
    } else if (type === 'clear') {
        // Do nothing else, leaving the canvas cleared for "Background Studio" effect
    }
    // Future additions go here:
    // else if (type === 'fluid') { initFluid(); }
    // else if (type === 'hex') { initHex(); }
}


/* =========================================
   1. PARTICLES ANIMATION (Tech / Node Style)
   ========================================= */
function initParticles() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particlesArray = [];
    let mouse = { x: undefined, y: undefined, radius: 120 };

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        const heroSection = canvas.parentElement;
        canvas.height = heroSection ? heroSection.offsetHeight : window.innerHeight;
    }

    // Use named functions for events if you plan to remove them later, 
    // but for simple switching, keeping them is usually fine.
    window.addEventListener('mousemove', (event) => {
        let rect = canvas.getBoundingClientRect();
        mouse.x = event.clientX - rect.left;
        mouse.y = event.clientY - rect.top;
    });

    window.addEventListener('touchmove', (event) => {
        let rect = canvas.getBoundingClientRect();
        mouse.x = event.touches[0].clientX - rect.left;
        mouse.y = event.touches[0].clientY - rect.top;
    });

    window.addEventListener('mouseout', () => { mouse.x = undefined; mouse.y = undefined; });
    window.addEventListener('touchend', () => { mouse.x = undefined; mouse.y = undefined; });

    class Particle {
        constructor(x, y, directionX, directionY, size, color) {
            this.x = x; this.y = y; this.directionX = directionX; this.directionY = directionY;
            this.size = size; this.color = color;
        }
        draw() {
            ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            ctx.fillStyle = this.color; ctx.fill();
        }
        update() {
            if (this.x > canvas.width || this.x < 0) this.directionX = -this.directionX;
            if (this.y > canvas.height || this.y < 0) this.directionY = -this.directionY;

            let dx = mouse.x - this.x; let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (mouse.x != undefined && distance < mouse.radius) {
                const forceDirectionX = dx / distance; const forceDirectionY = dy / distance;
                const force = (mouse.radius - distance) / mouse.radius;
                this.x -= forceDirectionX * force * 5; this.y -= forceDirectionY * force * 5;
            } else {
                this.x -= this.directionX; this.y -= this.directionY;
            }
            this.draw();
        }
    }

    function init() {
        particlesArray = [];
        let density = window.innerWidth < 768 ? 15000 : 10000;
        let numberOfParticles = Math.min((canvas.height * canvas.width) / density, 120);
        const particleColor = 'rgba(61, 220, 132, 0.7)'; // Accent Green

        for (let i = 0; i < numberOfParticles; i++) {
            let size = (Math.random() * 2) + 1;
            let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
            let y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
            let directionX = (Math.random() * 1.5) - 0.75;
            let directionY = (Math.random() * 1.5) - 0.75;
            particlesArray.push(new Particle(x, y, directionX, directionY, size, particleColor));
        }
    }

    function connect() {
        for (let a = 0; a < particlesArray.length; a++) {
            for (let b = a; b < particlesArray.length; b++) {
                let distance = ((particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x))
                    + ((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y));
                if (distance < (canvas.width / 7) * (canvas.height / 7)) {
                    let opacityValue = 1 - (distance / 20000);
                    ctx.strokeStyle = `rgba(61, 220, 132, ${opacityValue})`;
                    ctx.lineWidth = 1; ctx.beginPath();
                    ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                    ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particlesArray.length; i++) particlesArray[i].update();
        connect();
        // IMPORTANT: Save the frame ID so we can cancel it later
        currentAnimFrame = requestAnimationFrame(animate);
    }

    window.addEventListener('resize', () => { resizeCanvas(); init(); });
    resizeCanvas(); init(); animate();
}

/* =========================================
   2. SNOWFALL ANIMATION (Frost / Star Style)
   ========================================= */
function initSnowfall() {
    const canvas = document.getElementById('hero-canvas'); 
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let snowflakes = [];

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        const heroSection = canvas.parentElement;
        canvas.height = heroSection ? heroSection.offsetHeight : window.innerHeight;
    }

    class Snowflake {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.layer = Math.random() * 3 + 1; 
            this.size = (Math.random() * 2 + 1) * this.layer; 
            this.speedY = (Math.random() * 0.5 + 0.3) * this.layer; 
            this.speedX = Math.random() * 0.5 - 0.25;
            this.opacity = (Math.random() * 0.4 + 0.2);
            this.swingAmount = Math.random() * 0.02; 
            this.swingStep = Math.random() * 1000;
        }

        update() {
            this.swingStep += this.swingAmount;
            this.y += this.speedY;
            this.x += Math.sin(this.swingStep) * 0.5 + this.speedX;

            if (this.y > canvas.height) {
                this.y = -20;
                this.x = Math.random() * canvas.width;
            }
        }

        draw() {
            ctx.save();
            ctx.beginPath();
            ctx.translate(this.x, this.y);
            
            const isLightMode = document.documentElement.getAttribute('data-theme') === 'light';
            const r = isLightMode ? 14 : 255;
            const g = isLightMode ? 165 : 255;
            const b = isLightMode ? 233 : 255;

            ctx.shadowBlur = this.layer * 2;
            ctx.shadowColor = isLightMode ? `rgba(14, 165, 233, 0.5)` : 'white';
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${this.opacity})`;
            ctx.lineWidth = this.layer * 0.5;

            for (let i = 0; i < 6; i++) {
                ctx.moveTo(0, 0);
                ctx.lineTo(0, this.size);
                
                ctx.moveTo(0, this.size * 0.5);
                ctx.lineTo(this.size * 0.3, this.size * 0.8);
                ctx.moveTo(0, this.size * 0.5);
                ctx.lineTo(-this.size * 0.3, this.size * 0.8);

                ctx.rotate(Math.PI / 3);
            }

            ctx.stroke();
            ctx.restore();
        }
    }

    function init() {
        snowflakes = [];
        let count = window.innerWidth < 768 ? 40 : 100;
        for (let i = 0; i < count; i++) {
            snowflakes.push(new Snowflake());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        snowflakes.forEach(flake => {
            flake.update();
            flake.draw();
        });
        // IMPORTANT: Save the frame ID so we can cancel it later
        currentAnimFrame = requestAnimationFrame(animate);
    }

    window.addEventListener('resize', () => { resizeCanvas(); init(); });
    resizeCanvas(); init(); animate();
}
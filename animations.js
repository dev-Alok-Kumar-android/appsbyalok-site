/**
 * animations.js
 * Handles interactive background animations.
 * 1. Particles Network (id="hero-canvas")
 */

document.addEventListener('DOMContentLoaded', () => {
    // Check and initialize whichever canvas is present on the page
    initParticles();
});

/* =========================================
   1. PARTICLES ANIMATION (Tech / Node Style)
   ========================================= */
function initParticles() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return; // Agar canvas nahi hai to yahin ruk jao

    const ctx = canvas.getContext('2d');
    let particlesArray = [];
    let mouse = { x: undefined, y: undefined, radius: 120 };

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        const heroSection = canvas.parentElement;
        canvas.height = heroSection ? heroSection.offsetHeight : window.innerHeight;
    }

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
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particlesArray.length; i++) particlesArray[i].update();
        connect();
    }

    window.addEventListener('resize', () => { resizeCanvas(); init(); });
    resizeCanvas(); init(); animate();
}
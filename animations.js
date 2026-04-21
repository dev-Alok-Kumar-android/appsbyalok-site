/**
 * animations.js
 * Handles multiple interactive background animations.
 * 1. Particles Network (id="hero-canvas")
 * 2. Premium Multi-Gradient Fluid (id="fluid-canvas")
 */

document.addEventListener('DOMContentLoaded', () => {
    // Check and initialize whichever canvas is present on the page
    initParticles();
    initFluid();
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


/* =========================================
   2. PREMIUM MULTI-GRADIENT FLUID ANIMATION
   ========================================= */
function initFluid() {
    const canvas = document.getElementById('fluid-canvas');
    if (!canvas) return; // Agar fluid canvas nahi hai to yahin ruk jao

    const ctx = canvas.getContext('2d');
    let blobs = [];
    let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let isHovering = false;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        const section = canvas.parentElement;
        canvas.height = section ? section.offsetHeight : window.innerHeight;
    }

    // Smooth interaction tracking
    window.addEventListener('mousemove', (event) => {
        let rect = canvas.getBoundingClientRect();
        mouse.x = event.clientX - rect.left;
        mouse.y = event.clientY - rect.top;
        isHovering = true;
    });

    window.addEventListener('mouseout', () => { isHovering = false; });

    window.addEventListener('touchmove', (event) => {
        let rect = canvas.getBoundingClientRect();
        mouse.x = event.touches[0].clientX - rect.left;
        mouse.y = event.touches[0].clientY - rect.top;
        isHovering = true;
    });
    window.addEventListener('touchend', () => { isHovering = false; });

    class PremiumBlob {
        constructor(color, radius, originX, originY, speed) {
            this.color = color;
            this.radius = radius;
            // Original anchor points
            this.originX = originX;
            this.originY = originY;
            // Harmonic motion angles
            this.angleX = Math.random() * Math.PI * 2;
            this.angleY = Math.random() * Math.PI * 2;
            this.speed = speed;
            // Current position
            this.x = originX;
            this.y = originY;
        }

        update() {
            // Increment angles for organic sine/cosine movement (Lissajous curves)
            this.angleX += this.speed;
            this.angleY += this.speed * 0.8; // Different speed for non-circular, organic path

            // Calculate target position based on harmonic motion
            let targetX = this.originX + Math.sin(this.angleX) * (canvas.width * 0.25);
            let targetY = this.originY + Math.cos(this.angleY) * (canvas.height * 0.25);

            // Subtle mouse repulsion effect (Premium touch)
            if (isHovering) {
                let dx = mouse.x - targetX;
                let dy = mouse.y - targetY;
                let distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < canvas.width * 0.4) {
                    targetX -= dx * 0.15;
                    targetY -= dy * 0.15;
                }
            }

            // Lerp (Linear Interpolation) for buttery smooth movement
            this.x += (targetX - this.x) * 0.03;
            this.y += (targetY - this.y) * 0.03;
        }

        draw() {
            ctx.beginPath();
            // Ultra-soft radial gradient
            let gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
            gradient.addColorStop(0, this.color);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)'); // Fades completely into background

            ctx.fillStyle = gradient;
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function init() {
        blobs = [];
        // Much larger radii to create a "mesh" effect instead of individual balls
        const baseRadius = Math.max(canvas.width, canvas.height) * 0.6; 

        // Rich, vibrant color palette for a premium dark mode feel
        const colors = [
            'rgba(61, 220, 132, 0.45)', // Android Green
            'rgba(16, 185, 129, 0.35)', // Emerald/Teal
            'rgba(30, 64, 175, 0.35)',  // Deep Indigo/Blue (Adds contrast)
            'rgba(61, 220, 132, 0.25)'  // Softer Android Green
        ];

        // Spread origins across the 4 corners/quadrants
        const origins = [
            { x: canvas.width * 0.2, y: canvas.height * 0.2 },
            { x: canvas.width * 0.8, y: canvas.height * 0.8 },
            { x: canvas.width * 0.8, y: canvas.height * 0.2 },
            { x: canvas.width * 0.2, y: canvas.height * 0.8 }
        ];

        colors.forEach((color, i) => {
            blobs.push(new PremiumBlob(
                color, 
                baseRadius + Math.random() * 200, 
                origins[i].x, 
                origins[i].y, 
                0.003 + Math.random() * 0.002 // Very slow, ambient speed
            ));
        });
    }

    function animate() {
        requestAnimationFrame(animate);
        
        // Clear frame completely
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 'screen' or 'lighter' blend mode makes overlapping gradients look like glowing light
        ctx.globalCompositeOperation = 'screen';

        blobs.forEach(blob => {
            blob.update();
            blob.draw();
        });

        // Reset composite operation
        ctx.globalCompositeOperation = 'source-over';
    }

    window.addEventListener('resize', () => { resizeCanvas(); init(); });
    resizeCanvas(); init(); animate();
}
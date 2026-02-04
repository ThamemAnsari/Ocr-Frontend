import { useEffect, useRef } from "react";

export default function NeuralBackground({
    className = "",
    color = "#818cf8", // Indigo-400
    trailOpacity = 0.1,
    particleCount = 600,
    speed = 0.8,
}) {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // --- CONFIGURATION ---
        let width = container.clientWidth;
        let height = container.clientHeight;
        let particles = [];
        let animationFrameId;
        let mouse = { x: -1000, y: -1000 }; // Start off-screen

        // --- PARTICLE CLASS ---
        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = 0;
                this.vy = 0;
                this.age = 0;
                // Random lifespan to create natural recycling
                this.life = Math.random() * 200 + 100;
            }

            update() {
                // 1. Flow Field Math (Simplex-ish noise)
                // We calculate an angle based on position to create the "flow"
                const angle =
                    (Math.cos(this.x * 0.005) + Math.sin(this.y * 0.005)) * Math.PI;

                // 2. Add force from flow field
                this.vx += Math.cos(angle) * 0.2 * speed;
                this.vy += Math.sin(angle) * 0.2 * speed;

                // 3. Mouse Repulsion/Attraction
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const interactionRadius = 150;

                if (distance < interactionRadius) {
                    const force = (interactionRadius - distance) / interactionRadius;
                    // Push away
                    this.vx -= dx * force * 0.05;
                    this.vy -= dy * force * 0.05;
                }

                // 4. Apply Velocity & Friction
                this.x += this.vx;
                this.y += this.vy;
                this.vx *= 0.95; // Friction to stop infinite acceleration
                this.vy *= 0.95;

                // 5. Aging
                this.age++;
                if (this.age > this.life) {
                    this.reset();
                }

                // 6. Wrap around screen
                if (this.x < 0) this.x = width;
                if (this.x > width) this.x = 0;
                if (this.y < 0) this.y = height;
                if (this.y > height) this.y = 0;
            }

            reset() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = 0;
                this.vy = 0;
                this.age = 0;
                this.life = Math.random() * 200 + 100;
            }

            draw(context) {
                context.fillStyle = color;
                // Fade in and out based on age
                const alpha = 1 - Math.abs(this.age / this.life - 0.5) * 2;
                context.globalAlpha = alpha;
                context.fillRect(this.x, this.y, 1.5, 1.5); // Tiny dots are faster than arcs
            }
        }

        // --- INITIALIZATION ---
        const init = () => {
            // Handle High-DPI screens (Retina)
            const dpr = window.devicePixelRatio || 1;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.scale(dpr, dpr);
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;

            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        };

        // --- ANIMATION LOOP ---
        const animate = () => {
            // "Fade" effect: Instead of clearing the canvas, we draw a semi-transparent rect
            // This creates the "Trails" look.
            ctx.fillStyle = `rgba(0, 0, 0, ${trailOpacity})`;
            ctx.fillRect(0, 0, width, height);

            particles.forEach((p) => {
                p.update();
                p.draw(ctx);
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        // --- EVENT LISTENERS ---
        const handleResize = () => {
            width = container.clientWidth;
            height = container.clientHeight;
            init();
        };

        const handleMouseMove = (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        };

        const handleMouseLeave = () => {
            mouse.x = -1000;
            mouse.y = -1000;
        };

        // Start
        init();
        animate();

        window.addEventListener("resize", handleResize);
        container.addEventListener("mousemove", handleMouseMove);
        container.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            window.removeEventListener("resize", handleResize);
            container.removeEventListener("mousemove", handleMouseMove);
            container.removeEventListener("mouseleave", handleMouseLeave);
            cancelAnimationFrame(animationFrameId);
        };
    }, [color, trailOpacity, particleCount, speed]);

    return (
        <div
            ref={containerRef}
            style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                margin: 0,
                padding: 0,
                backgroundColor: '#000000',
                overflow: 'hidden'
            }}
            className={className}
        >
            <canvas
                ref={canvasRef}
                style={{
                    display: 'block',
                    width: '100%',
                    height: '100%',
                    margin: 0,
                    padding: 0
                }}
            />
        </div>
    );
}

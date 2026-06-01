import { useEffect, useRef } from "react";

/**
 * Performant animated starfield using a 2D canvas.
 * Renders sparse, tiny pinpoint stars — subtle and clean.
 */
export default function StarfieldBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrameId: number;
    let stars: Star[] = [];

    interface Star {
      x: number;
      y: number;
      radius: number;
      speed: number;
      opacity: number;
      twinkleSpeed: number;
      twinklePhase: number;
    }

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
      initStars();
    }

    function initStars() {
      // Very sparse — like the reference design
      const count = Math.min(
        Math.floor((canvas!.width * canvas!.height) / 18000),
        80
      );
      stars = [];
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * canvas!.width,
          y: Math.random() * canvas!.height,
          radius: Math.random() * 0.8 + 0.3,   // tiny: 0.3 – 1.1px
          speed: Math.random() * 0.05 + 0.01,   // very slow drift
          opacity: Math.random() * 0.4 + 0.15,  // dim: 0.15 – 0.55
          twinkleSpeed: Math.random() * 0.015 + 0.003,
          twinklePhase: Math.random() * Math.PI * 2,
        });
      }
    }

    let time = 0;

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 1;

      for (const star of stars) {
        star.y -= star.speed;
        if (star.y < -2) {
          star.y = canvas.height + 2;
          star.x = Math.random() * canvas.width;
        }

        const twinkle =
          Math.sin(time * star.twinkleSpeed + star.twinklePhase) * 0.3 + 0.7;
        const alpha = star.opacity * twinkle;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220, 215, 200, ${alpha})`;
        ctx.fill();
      }

      animFrameId = requestAnimationFrame(animate);
    }

    resize();
    animate();

    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}

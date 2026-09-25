import React, { useEffect, useRef } from "react";

interface InteractiveBackgroundProps {
  dotColor?: string;
  lineColor?: string;
  gridGap?: number;
  interactionRadius?: number;
}

export const InteractiveBackground: React.FC<InteractiveBackgroundProps> = ({
  dotColor = "rgba(24, 24, 27, 0.22)", // subtle charcoal on white
  lineColor = "rgba(24, 24, 27, 0.08)",
  gridGap = 34,
  interactionRadius = 140,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse coordinates with smooth lerping
    const mouse = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      radius: interactionRadius,
    };

    // Click pulse waves
    interface Wave {
      x: number;
      y: number;
      radius: number;
      maxRadius: number;
      opacity: number;
    }
    const waves: Wave[] = [];

    // Grid point structure
    interface Point {
      baseX: number;
      baseY: number;
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
    }

    let points: Point[] = [];

    const initGrid = () => {
      points = [];
      const cols = Math.ceil(width / gridGap) + 1;
      const rows = Math.ceil(height / gridGap) + 1;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * gridGap;
          const y = j * gridGap;
          points.push({
            baseX: x,
            baseY: y,
            x: x,
            y: y,
            vx: 0,
            vy: 0,
            size: 1.5,
          });
        }
      }
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initGrid();
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.targetX = -1000;
      mouse.targetY = -1000;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        mouse.targetX = touch.clientX - rect.left;
        mouse.targetY = touch.clientY - rect.top;
      }
    };

    const handleTouchEnd = () => {
      mouse.targetX = -1000;
      mouse.targetY = -1000;
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      waves.push({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        radius: 10,
        maxRadius: 220,
        opacity: 0.25,
      });
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("click", handleClick);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    initGrid();

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.12;
      mouse.y += (mouse.targetY - mouse.y) * 0.12;

      // Update waves
      for (let i = waves.length - 1; i >= 0; i--) {
        const w = waves[i];
        w.radius += 4.5;
        w.opacity *= 0.94;
        if (w.opacity < 0.01 || w.radius > w.maxRadius) {
          waves.splice(i, 1);
        }
      }

      // Draw subtle grid points and calculate displacement
      for (let i = 0; i < points.length; i++) {
        const p = points[i];

        // Vector from mouse to point
        const dx = mouse.x - p.baseX;
        const dy = mouse.y - p.baseY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let targetX = p.baseX;
        let targetY = p.baseY;
        let activeScale = 1;

        // Mouse magnetic / displacement field
        if (dist < mouse.radius) {
          const force = (1 - dist / mouse.radius);
          // Soft radial push away to create smooth magnetic contour
          const angle = Math.atan2(dy, dx);
          const push = force * 24;
          targetX = p.baseX - Math.cos(angle) * push;
          targetY = p.baseY - Math.sin(angle) * push;
          activeScale = 1 + force * 1.8;
        }

        // Ripple from clicks
        for (let j = 0; j < waves.length; j++) {
          const w = waves[j];
          const wdx = p.x - w.x;
          const wdy = p.y - w.y;
          const wdist = Math.sqrt(wdx * wdx + wdy * wdy);
          const diff = Math.abs(wdist - w.radius);
          if (diff < 35) {
            const waveForce = (1 - diff / 35) * w.opacity * 16;
            const angle = Math.atan2(wdy, wdx);
            targetX += Math.cos(angle) * waveForce;
            targetY += Math.sin(angle) * waveForce;
          }
        }

        // Spring physics to return to target
        p.vx = (p.vx + (targetX - p.x) * 0.16) * 0.76;
        p.vy = (p.vy + (targetY - p.y) * 0.16) * 0.76;
        p.x += p.vx;
        p.y += p.vy;

        // Draw Dot
        const isNearMouse = dist < mouse.radius;
        const currentOpacity = isNearMouse
          ? 0.65 + (1 - dist / mouse.radius) * 0.35
          : 0.28;

        ctx.fillStyle = `rgba(15, 23, 42, ${currentOpacity})`;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * activeScale, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("click", handleClick);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [dotColor, lineColor, gridGap, interactionRadius]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-zinc-50/50">
      {/* Subtle organic ambient gradient orbs to give glass elements structure and color to refract */}
      <div 
        className="absolute -top-32 right-1/4 w-[500px] h-[500px] rounded-full opacity-60 pointer-events-none blur-[100px]"
        style={{
          background: "radial-gradient(circle, rgba(226, 232, 240, 0.8) 0%, rgba(241, 245, 249, 0.4) 50%, transparent 70%)"
        }} 
      />
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/3 w-[720px] h-[480px] rounded-full opacity-70 pointer-events-none blur-[110px]"
        style={{
          background: "radial-gradient(circle, rgba(228, 228, 231, 0.7) 0%, rgba(244, 244, 245, 0.3) 60%, transparent 80%)"
        }} 
      />
      <div 
        className="absolute bottom-[-10%] right-[15%] w-[450px] h-[450px] rounded-full opacity-50 pointer-events-none blur-[90px]"
        style={{
          background: "radial-gradient(circle, rgba(226, 232, 240, 0.75) 0%, rgba(241, 245, 249, 0.2) 60%, transparent 80%)"
        }} 
      />

      <canvas
        ref={canvasRef}
        className="w-full h-full block relative z-0 pointer-events-none md:pointer-events-auto"
        style={{ touchAction: "pan-y" }}
      />
    </div>
  );
};

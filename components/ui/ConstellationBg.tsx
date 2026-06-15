"use client";

import { useEffect, useRef } from "react";

interface ConstellationBgProps {
  /** Number of nodes in the grid */
  nodeCount?: number;
  /** Whether to show the gradient mesh overlay */
  showMesh?: boolean;
  /** Intensity: 'subtle' for inner pages, 'full' for hero */
  intensity?: "subtle" | "full";
}

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  hue: number; // 0 = indigo, 1 = purple
}

export default function ConstellationBg({
  nodeCount = 60,
  showMesh = true,
  intensity = "full",
}: ConstellationBgProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const animRef = useRef<number>(0);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Initialize nodes
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;

    nodesRef.current = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.2,
      hue: Math.random() > 0.5 ? 0 : 1,
    }));

    const connectionDistance = intensity === "full" ? 150 : 120;
    const mouseRadius = 200;
    const alphaMultiplier = intensity === "full" ? 1 : 0.5;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    let time = 0;

    const draw = () => {
      const cw = canvas.offsetWidth;
      const ch = canvas.offsetHeight;
      ctx.clearRect(0, 0, cw, ch);

      const nodes = nodesRef.current;
      const mouse = mouseRef.current;
      time += 0.005;

      // Update positions
      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off edges
        if (node.x < 0 || node.x > cw) node.vx *= -1;
        if (node.y < 0 || node.y > ch) node.vy *= -1;

        // Gentle sine wave motion
        node.x += Math.sin(time + node.y * 0.01) * 0.15;
        node.y += Math.cos(time + node.x * 0.01) * 0.15;

        // Mouse repulsion
        const dx = node.x - mouse.x;
        const dy = node.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouseRadius && dist > 0) {
          const force = (mouseRadius - dist) / mouseRadius;
          node.x += (dx / dist) * force * 2;
          node.y += (dy / dist) * force * 2;
        }

        // Keep in bounds
        node.x = Math.max(0, Math.min(cw, node.x));
        node.y = Math.max(0, Math.min(ch, node.y));
      }

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            const alpha = (1 - dist / connectionDistance) * 0.15 * alphaMultiplier;

            // Check if connection is near mouse for highlighting
            const midX = (nodes[i].x + nodes[j].x) / 2;
            const midY = (nodes[i].y + nodes[j].y) / 2;
            const mouseDist = Math.sqrt(
              (midX - mouse.x) ** 2 + (midY - mouse.y) ** 2
            );
            const highlight = mouseDist < mouseRadius ? 2 : 1;

            const gradient = ctx.createLinearGradient(
              nodes[i].x, nodes[i].y,
              nodes[j].x, nodes[j].y
            );
            gradient.addColorStop(0, `rgba(99, 102, 241, ${alpha * highlight})`);
            gradient.addColorStop(1, `rgba(168, 85, 247, ${alpha * highlight})`);

            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = highlight > 1 ? 1.5 : 0.8;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (const node of nodes) {
        // Mouse proximity glow
        const dx = node.x - mouse.x;
        const dy = node.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const mouseProximity = dist < mouseRadius ? (mouseRadius - dist) / mouseRadius : 0;

        const glowRadius = node.radius + mouseProximity * 8;
        const color = node.hue === 0
          ? `rgba(99, 102, 241, ${(node.opacity + mouseProximity * 0.5) * alphaMultiplier})`
          : `rgba(168, 85, 247, ${(node.opacity + mouseProximity * 0.5) * alphaMultiplier})`;

        // Outer glow
        if (mouseProximity > 0.1) {
          const glowGradient = ctx.createRadialGradient(
            node.x, node.y, 0,
            node.x, node.y, glowRadius * 3
          );
          glowGradient.addColorStop(0, color);
          glowGradient.addColorStop(1, "transparent");
          ctx.beginPath();
          ctx.arc(node.x, node.y, glowRadius * 3, 0, Math.PI * 2);
          ctx.fillStyle = glowGradient;
          ctx.fill();
        }

        // Core dot
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + mouseProximity * 2, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      }

      // Draw mouse glow
      if (mouse.x > 0 && mouse.y > 0 && intensity === "full") {
        const mouseGlow = ctx.createRadialGradient(
          mouse.x, mouse.y, 0,
          mouse.x, mouse.y, 120
        );
        mouseGlow.addColorStop(0, "rgba(99, 102, 241, 0.03)");
        mouseGlow.addColorStop(0.5, "rgba(168, 85, 247, 0.015)");
        mouseGlow.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 120, 0, Math.PI * 2);
        ctx.fillStyle = mouseGlow;
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resizeCanvas);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [nodeCount, intensity]);

  return (
    <div className="absolute inset-0 pointer-events-auto overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: intensity === "full" ? 1 : 0.7 }}
      />

      {/* Gradient mesh overlay */}
      {showMesh && (
        <>
          <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-zinc-950 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none" />
          <div className="absolute top-0 left-0 w-64 h-full bg-gradient-to-r from-zinc-950 to-transparent pointer-events-none" />
          <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-zinc-950 to-transparent pointer-events-none" />
        </>
      )}

      {/* Subtle radial gradient center glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none animate-pulse-glow"
        style={{
          background: "radial-gradient(circle, rgba(99,102,241,0.04) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}

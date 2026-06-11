import { useMemo, useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useTheme } from "@/hooks/useTheme";

interface Particle {
  id: number;
  emoji: string;
  left: number;
  duration: number;
  delay: number;
  size: number;
  opacity: number;
  drift: number;
  rotation: number;
}

const PARTICLE_CONFIGS: Record<string, { emojis: string[]; count: number; baseSize: number; driftRange: number }> = {
  confetti: {
    emojis: ["🔴", "🟡", "🟢", "🔵", "🟣", "🎪", "🎭", "✨"],
    count: 16,
    baseSize: 16,
    driftRange: 30,
  },
  ghosts: {
    emojis: ["👻", "🦇", "💀", "🕷️", "🎃", "☠️"],
    count: 12,
    baseSize: 20,
    driftRange: 40,
  },
  snow: {
    emojis: ["❄️", "❅", "❆", "✧", "·"],
    count: 20,
    baseSize: 14,
    driftRange: 25,
  },
  bubbles: {
    emojis: ["🫧", "○", "◯", "◌", "💧"],
    count: 14,
    baseSize: 18,
    driftRange: 35,
  },
  stars: {
    emojis: ["⭐", "✨", "💫", "🌟", "✦"],
    count: 12,
    baseSize: 16,
    driftRange: 50,
  },
};

function generateParticles(type: string): Particle[] {
  const config = PARTICLE_CONFIGS[type];
  if (!config) return [];

  return Array.from({ length: config.count }, (_, i) => ({
    id: i,
    emoji: config.emojis[i % config.emojis.length],
    left: Math.random() * 100,
    duration: 8 + Math.random() * 12,
    delay: Math.random() * 5,
    size: config.baseSize + Math.random() * 12,
    opacity: 0.15 + Math.random() * 0.25,
    drift: (Math.random() - 0.5) * config.driftRange * 2,
    rotation: (Math.random() - 0.5) * 360,
  }));
}

export default function ThemeParticles() {
  const { decorations } = useTheme();
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  const particleType = decorations?.particleType || "none";
  const config = PARTICLE_CONFIGS[particleType];

  const particles = useMemo(() => {
    if (!config) return [];
    return generateParticles(particleType);
  }, [particleType, config]);

  // Restart animations when theme changes
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.animation = "none";
      containerRef.current.offsetHeight; // trigger reflow
      containerRef.current.style.animation = "";
    }
  }, [particleType]);

  if (!config || particles.length === 0) return null;

  const particleVariants = {
    initial: { y: 100, opacity: 0, rotate: 0 },
    animate: (p: Particle) => ({
      y: -120,
      opacity: [0, p.opacity, p.opacity, 0],
      rotate: p.rotation,
      x: [0, p.drift * 0.3, p.drift * 0.6, p.drift],
    }),
    exit: { opacity: 0 },
  };

  const transition = (p: Particle) => ({
    duration: shouldReduceMotion ? 0.01 : p.duration,
    delay: shouldReduceMotion ? 0 : p.delay,
    ease: "linear",
    repeat: Infinity,
    repeatDelay: 0,
  });

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-10 overflow-hidden"
      aria-hidden="true"
      data-testid="theme-particles"
      style={{ willChange: "transform" }}
    >
      {particles.map((p) => (
        <motion.span
          key={p.id}
          initial="initial"
          animate="animate"
          variants={particleVariants}
          custom={p}
          style={{
            position: "absolute",
            left: `${p.left}%`,
            fontSize: `${p.size}px`,
            top: "100vh",
            willChange: "transform, opacity",
          }}
          transition={transition(p)}
        >
          {p.emoji}
        </motion.span>
      ))}
      {/* Subtle ambient glow particles */}
      {!shouldReduceMotion && Array.from({ length: 8 }, (_, i) => (
        <motion.div
          key={`glow-${i}`}
          style={{
            position: "absolute",
            left: `${10 + i * 11}%`,
            top: `${20 + (i * 7) % 60}%`,
            width: "4px",
            height: "4px",
            borderRadius: "50%",
            background: "rgba(var(--theme-glow), 0.3)",
            filter: "blur(8px)",
            willChange: "opacity, transform",
          }}
          animate={{
            opacity: [0.1, 0.4, 0.1],
            scale: [0.5, 1.5, 0.5],
          }}
          transition={{
            duration: 4 + i * 0.5,
            delay: i * 0.3,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        />
      ))}
    </div>
  );
}

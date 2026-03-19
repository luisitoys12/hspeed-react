import { useMemo } from "react";
import { useTheme } from "@/hooks/useTheme";

interface Particle {
  id: number;
  emoji: string;
  left: string;
  animationDuration: string;
  animationDelay: string;
  fontSize: string;
  opacity: number;
}

const PARTICLE_CONFIGS: Record<string, { emojis: string[]; className: string; count: number }> = {
  confetti: {
    emojis: ["🔴", "🟡", "🟢", "🔵", "🟣", "🎪", "🎭", "✨"],
    className: "particle-confetti",
    count: 12,
  },
  ghosts: {
    emojis: ["👻", "🦇", "💀", "🕷️", "🎃", "☠️"],
    className: "particle-float",
    count: 10,
  },
  snow: {
    emojis: ["❄️", "❅", "❆", "✧", "·"],
    className: "particle-confetti",
    count: 15,
  },
  bubbles: {
    emojis: ["🫧", "○", "◯", "◌", "💧"],
    className: "particle-float",
    count: 10,
  },
  stars: {
    emojis: ["⭐", "✨", "💫", "🌟", "✦"],
    className: "particle-float",
    count: 10,
  },
};

function generateParticles(type: string): Particle[] {
  const config = PARTICLE_CONFIGS[type];
  if (!config) return [];

  return Array.from({ length: config.count }, (_, i) => ({
    id: i,
    emoji: config.emojis[i % config.emojis.length],
    left: `${(i * 7.7 + 2) % 98}%`,
    animationDuration: `${8 + (i % 5) * 3}s`,
    animationDelay: `${(i * 1.3) % 8}s`,
    fontSize: `${10 + (i % 3) * 4}px`,
    opacity: 0.15 + (i % 4) * 0.05,
  }));
}

export default function ThemeParticles() {
  const { decorations } = useTheme();

  const particleType = decorations?.particleType || "none";
  const config = PARTICLE_CONFIGS[particleType];

  const particles = useMemo(() => {
    if (!config) return [];
    return generateParticles(particleType);
  }, [particleType, config]);

  if (!config || particles.length === 0) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-10 overflow-hidden"
      aria-hidden="true"
      data-testid="theme-particles"
    >
      {particles.map((p) => (
        <span
          key={p.id}
          className={config.className}
          style={{
            position: "absolute",
            left: p.left,
            fontSize: p.fontSize,
            opacity: p.opacity,
            animationDuration: p.animationDuration,
            animationDelay: p.animationDelay,
            willChange: "transform, opacity",
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}

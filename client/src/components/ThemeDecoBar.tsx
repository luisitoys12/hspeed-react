import { useTheme } from "@/hooks/useTheme";

export default function ThemeDecoBar() {
  const { decorations, isLoading } = useTheme();

  const emojis = decorations?.accentEmojis || [];
  const pattern = decorations?.pattern || "";
  const isStripes = pattern === "bg-pattern-stripes";

  if (isLoading) {
    return (
      <div
        className="h-[2px] w-full bg-theme-gradient"
        data-testid="theme-deco-bar"
      />
    );
  }

  return (
    <div
      className="relative w-full h-[2px] bg-theme-gradient overflow-hidden flex-shrink-0"
      data-testid="theme-deco-bar"
    >
      {/* Optional animated stripe overlay for circus theme */}
      {isStripes && (
        <div
          className="absolute inset-0 animate-stripes opacity-20"
          style={{
            backgroundImage:
              "repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(255,255,255,0.15) 10px, rgba(255,255,255,0.15) 20px)",
            backgroundSize: "28px 28px",
          }}
        />
      )}

      {/* Emoji strip removed to keep the template cleaner */}
    </div>
  );
}

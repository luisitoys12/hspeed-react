import { useTheme } from "@/hooks/useTheme";

export default function ThemeDecoBar() {
  const { decorations, isLoading } = useTheme();

  const emojis = decorations?.accentEmojis || [];
  const pattern = decorations?.pattern || "";
  const isStripes = pattern === "bg-pattern-stripes";

  if (isLoading) {
    return (
      <div
        className="h-[3px] w-full bg-theme-gradient"
        data-testid="theme-deco-bar"
      />
    );
  }

  return (
    <div
      className="relative w-full h-7 bg-theme-gradient overflow-hidden flex-shrink-0"
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

      {/* Scrolling emojis */}
      {emojis.length > 0 && (
        <div className="absolute inset-0 flex items-center overflow-hidden">
          <div className="animate-marquee whitespace-nowrap flex items-center gap-8">
            {/* Duplicate for seamless loop */}
            {[...emojis, ...emojis, ...emojis, ...emojis, ...emojis, ...emojis].map(
              (emoji, i) => (
                <span
                  key={i}
                  className="text-sm opacity-30 select-none"
                  aria-hidden="true"
                >
                  {emoji}
                </span>
              )
            )}
          </div>
        </div>
      )}

      {/* Subtle shimmer overlay */}
      <div className="absolute inset-0 shimmer-bg" />
    </div>
  );
}

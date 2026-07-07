/**
 * Journey progress dots, laid in rows of 7 so a 21-day journey reads as
 * three weeks. Filled = days completed (advance-only, never reset).
 */
export function JourneyDots({
  total,
  completed,
  className,
  onCover = false,
}: {
  total: number;
  completed: number;
  className?: string;
  /** White dots for use on gradient card covers. */
  onCover?: boolean;
}) {
  const rows: number[][] = [];
  for (let i = 0; i < total; i += 7) {
    rows.push(Array.from({ length: Math.min(7, total - i) }, (_, j) => i + j));
  }
  return (
    <div
      className={`flex flex-col items-center gap-1.5 ${className ?? ""}`}
      role="img"
      aria-label={`${completed} of ${total} days completed`}
    >
      {rows.map((row) => (
        <div key={row[0]} className="flex gap-1.5">
          {row.map((i) => (
            <span
              key={i}
              className={`size-2 rounded-full transition-colors ${
                i < completed
                  ? onCover
                    ? "bg-white"
                    : "bg-mode-2"
                  : onCover
                    ? "bg-white/30"
                    : "bg-foreground/15"
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

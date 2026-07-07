/**
 * Hand-drawn outline illustrations (stroke = currentColor, so they tint to
 * any mode accent and both themes). One per category plus the science-page
 * steps. Registry at the bottom maps category names → art; richer generated
 * imagery can replace individual entries later (the "layered" plan).
 */

function Art({
  children,
  className,
  label,
}: {
  children: React.ReactNode;
  className?: string;
  label?: string;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {children}
    </svg>
  );
}

export function FlagArt({ className }: { className?: string }) {
  return (
    <Art className={className}>
      <path d="M22 12v42" />
      <path d="M22 12c7-4 13 4 22 0v14c-9 4-15-4-22 0" />
      <path d="M14 54h24" />
    </Art>
  );
}

export function HomeHeartArt({ className }: { className?: string }) {
  return (
    <Art className={className}>
      <path d="M14 30 32 14l18 16v20a2 2 0 0 1-2 2H16a2 2 0 0 1-2-2Z" />
      <path d="M32 44.5 26 38.4a4.3 4.3 0 1 1 6-6.1 4.3 4.3 0 1 1 6 6.1Z" />
    </Art>
  );
}

export function AppleArt({ className }: { className?: string }) {
  return (
    <Art className={className}>
      <path d="M32 26c-9-4-16 2-16 11 0 8 6 16 16 16s16-8 16-16c0-9-7-15-16-11Z" />
      <path d="M32 26c0-5 2-8 5-10" />
      <path d="M37 16c6-4 11-1 9 3s-9 4-9-3Z" transform="translate(0 2)" />
    </Art>
  );
}

export function LightbulbArt({ className }: { className?: string }) {
  return (
    <Art className={className}>
      <path d="M32 14a13 13 0 0 1 7 24c-2 1.4-2 3-2 5H27c0-2 0-3.6-2-5a13 13 0 0 1 7-24Z" />
      <path d="M27 49h10M29 54h6" />
      <path d="M32 6v3M14 27h-3M53 27h-3M18 13l2 2M46 13l-2 2" />
    </Art>
  );
}

export function SpiralArt({ className }: { className?: string }) {
  return (
    <Art className={className}>
      <path d="M34.5 32a2.5 2.5 0 1 0-2.5 2.5c4.5 0 8-3.7 8-8.2C40 20 34.6 16 29 16c-8 0-14.5 6.5-14.5 14.5C14.5 41 23 49 33 49c5.5 0 10-2 13.5-5.5" />
      <path d="M42 40.5l5 3-2 5.5" />
    </Art>
  );
}

export function PhoneOffArt({ className }: { className?: string }) {
  return (
    <Art className={className}>
      <rect x="22" y="10" width="20" height="44" rx="4" />
      <path d="M30 15h4" />
      <path d="M14 52 50 12" />
    </Art>
  );
}

export function KindBubbleArt({ className }: { className?: string }) {
  return (
    <Art className={className}>
      <path d="M14 12h36a4 4 0 0 1 4 4v22a4 4 0 0 1-4 4H30l-9 10v-10h-7a4 4 0 0 1-4-4V16a4 4 0 0 1 4-4Z" />
      <path d="M32 34.5 26.5 29a4 4 0 1 1 5.5-5.6A4 4 0 1 1 37.5 29Z" />
    </Art>
  );
}

export function PresentationArt({ className }: { className?: string }) {
  return (
    <Art className={className}>
      <rect x="14" y="12" width="36" height="26" rx="3" />
      <path d="M32 38v8M32 42l-8 10M32 42l8 10" />
      <path d="M20 32l7-8 5 4 10-11" />
    </Art>
  );
}

export function SunriseArt({ className }: { className?: string }) {
  return (
    <Art className={className}>
      <path d="M10 46h44" />
      <path d="M20 46a12 12 0 0 1 24 0" />
      <path d="M32 22v-6M15 34l-4-4M49 34l4-4M18 54h28" />
    </Art>
  );
}

export function MoonStarsArt({ className }: { className?: string }) {
  return (
    <Art className={className}>
      <path d="M40 10a19 19 0 1 0 11 32A16 16 0 0 1 40 10Z" />
      <path d="M17 18v7M13.5 21.5h7" />
      <path d="M12 40v5M9.5 42.5h5" />
    </Art>
  );
}

export function FlipArrowArt({ className }: { className?: string }) {
  return (
    <Art className={className}>
      <path d="M21 14v20a11 11 0 0 0 22 0V20" />
      <path d="M37 25l6-6 6 6" />
      <path d="M16 19l5-5 5 5" />
    </Art>
  );
}

export function MountainFlagArt({ className }: { className?: string }) {
  return (
    <Art className={className}>
      <path d="M8 52 26 24l9 13 8-11 13 26Z" />
      <path d="M26 24V10" />
      <path d="M26 10h11l-3.5 4.5L37 19H26" />
    </Art>
  );
}

export function GiftStarArt({ className }: { className?: string }) {
  return (
    <Art className={className}>
      <rect x="16" y="32" width="32" height="20" rx="2" />
      <path d="M13 26h38v6H13Z" />
      <path d="M32 26v26" />
      <path d="M32 6l2.2 4.6 5 .7-3.6 3.6.9 5.1-4.5-2.4-4.5 2.4.9-5.1L24.8 11.3l5-.7Z" />
    </Art>
  );
}

export function WaterGlassArt({ className }: { className?: string }) {
  return (
    <Art className={className}>
      <path d="M20 10h24l-3.5 44h-17Z" />
      <path d="M23 26c3 2 6-2 9 0s6-2 9 0" />
    </Art>
  );
}

export function ChooseArt({ className }: { className?: string }) {
  return (
    <Art className={className}>
      <rect x="22" y="12" width="26" height="34" rx="4" />
      <rect x="14" y="20" width="26" height="34" rx="4" />
      <path d="M20 38l5 5 9-11" />
    </Art>
  );
}

export function SpeakArt({ className }: { className?: string }) {
  return (
    <Art className={className}>
      <rect x="26" y="8" width="12" height="24" rx="6" />
      <path d="M20 26a12 12 0 0 0 24 0" />
      <path d="M32 40v8M24 48h16" />
      <path d="M14 18c-3 3.5-3 8.5 0 12M50 18c3 3.5 3 8.5 0 12" />
    </Art>
  );
}

export function LockInArt({ className }: { className?: string }) {
  return (
    <Art className={className}>
      <path d="M24 28v-8a8 8 0 0 1 16 0v8" />
      <rect x="17" y="28" width="30" height="24" rx="5" />
      <circle cx="32" cy="38" r="3" />
      <path d="M32 41v6" />
      <path d="M54 12v7M50.5 15.5h7" />
    </Art>
  );
}

export function SparkArt({ className }: { className?: string }) {
  return (
    <Art className={className}>
      <path d="M32 10c2 10 4 12 14 14-10 2-12 4-14 14-2-10-4-12-14-14 10-2 12-4 14-14Z" />
      <path d="M50 40v8M46 44h8" />
    </Art>
  );
}

const CATEGORY_ART: Record<string, (props: { className?: string }) => React.ReactNode> = {
  "A Decisive Leader": FlagArt,
  "A Calm Parent": HomeHeartArt,
  "My Healthiest Self": AppleArt,
  "A Creative Powerhouse": LightbulbArt,
  "Overthinking & Analysis Paralysis": SpiralArt,
  "Mindless Scrolling": PhoneOffArt,
  "Negative Self-Talk": KindBubbleArt,
  "Before a Big Meeting": PresentationArt,
  "Starting the Workday": SunriseArt,
  "Winding Down for Sleep": MoonStarsArt,
  "Flip 'I'm Not Good Enough'": FlipArrowArt,
  "Flip 'I'm Afraid to Fail'": MountainFlagArt,
  "Flip 'I Don't Deserve It'": GiftStarArt,
};

export function CategoryArt({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Illustration = CATEGORY_ART[name] ?? SparkArt;
  return <Illustration className={className} />;
}

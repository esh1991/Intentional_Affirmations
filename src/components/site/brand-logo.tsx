/**
 * The logo PNG is white-on-transparent, so it's rendered via CSS mask:
 * the alpha channel shapes a fill that is white in dark mode and the brand
 * indigo→blue gradient (from the color logo variant) in light mode.
 * Styles live in globals.css (.brand-logo).
 */
export function BrandLogo({ className }: { className?: string }) {
  return (
    <span
      role="img"
      aria-label="Say This With Me"
      className={`brand-logo block aspect-[179/100] ${className ?? ""}`}
    />
  );
}

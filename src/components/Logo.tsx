/**
 * The DecentralAmerica mark — the CentralAmerica glyph, the same one that sits
 * beside the DecentralAmerica entry in the DecentralChain site's ecosystem menu.
 *
 * Rebuilt as geometry rather than shipped as the raster. The site's copy of that
 * asset is white-on-alpha, which is correct on DecentralChain's near-black ground
 * and invisible on this one; and the mark is wanted here at sizes a 300px bitmap
 * cannot serve. Drawing it means one glyph that inherits `currentColor`, stays
 * crisp at 16px and at 900px, and costs nothing to ship.
 *
 * Measured off `DecentralChain Branding Kit/CentralAmerica Coin Logo.png`
 * (300×300, disc #0583B9, glyph #fafafa): three arms 24u wide reaching 84.5u from
 * centre at 0°/120°/240°, flat caps with no taper; three dots r=16u in the gaps.
 *
 * The dots do not hold true three-fold symmetry: they measure 65.8u, 65.8u and
 * 75.0u from centre at 61.9°, 180.0° and 298.1°. Regularising them to 60/180/300
 * at one radius pulls the lower dot visibly up out of the fork of the two lower
 * arms, and side by side the original reads better balanced. So the measured
 * geometry is what ships. `regularized` draws the symmetric version instead.
 */

const C = 150; // centre of the 300-unit box
const ARM_HALF_WIDTH = 12;
const ARM_REACH = 84.5;
/** Past centre, so the three arms fuse into a solid hub instead of seaming. */
const ARM_OVERRUN = 16;
const DOT_R = 16;
/** As measured, clockwise from the upper-right dot. */
const DOTS = [
  { angle: 61.9, dist: 65.8 },
  { angle: 180.0, dist: 75.0 },
  { angle: 298.1, dist: 65.8 },
] as const;
const DOT_DIST_REGULAR = 69;

function dotAt(angleDeg: number, dist: number) {
  const rad = (angleDeg * Math.PI) / 180;
  // 0° is up, angles run clockwise, and SVG y grows downward.
  return { cx: C + dist * Math.sin(rad), cy: C - dist * Math.cos(rad) };
}

/**
 * Note for callers: fade the mark with `opacity` on the element, never with a
 * translucent `currentColor`. The arms are three separate shapes overlapping at
 * the hub, and a fill carrying its own alpha compounds there into a visibly
 * darker patch. `public/brand/decentralamerica-mark.svg` avoids this a second
 * way, by unioning every shape into one nonzero path.
 */
export type MarkProps = {
  className?: string;
  /** Knocks the glyph out of a filled disc instead of drawing it bare. */
  disc?: boolean;
  /** Forces true three-fold symmetry rather than the original's measured drift. */
  regularized?: boolean;
  title?: string;
};

export function Mark({ className = '', disc = false, regularized = false, title }: MarkProps) {
  const dots = regularized
    ? [60, 180, 300].map((angle) => dotAt(angle, DOT_DIST_REGULAR))
    : DOTS.map((d) => dotAt(d.angle, d.dist));

  // Knockout is one path with two subpaths and evenodd, so the disc shows
  // through the glyph. A white glyph painted on top would smear on any ground
  // that is not exactly the disc colour.
  const glyph = (
    <>
      {[0, 120, 240].map((deg) => (
        <rect
          key={deg}
          height={ARM_REACH + ARM_OVERRUN}
          rx={2}
          transform={`rotate(${deg} ${C} ${C})`}
          width={ARM_HALF_WIDTH * 2}
          x={C - ARM_HALF_WIDTH}
          y={C - ARM_REACH}
        />
      ))}
      {dots.map((d) => (
        <circle cx={d.cx} cy={d.cy} key={`${d.cx}-${d.cy}`} r={DOT_R} />
      ))}
    </>
  );

  const body = disc ? (
    <>
      <circle cx={C} cy={C} r={C} />
      {/* Knocked out of the disc rather than painted over it, so the mark keeps
          its shape on any ground instead of carrying a pale halo. */}
      <g fill="var(--color-ground)">{glyph}</g>
    </>
  ) : (
    glyph
  );

  // Two explicit branches rather than one with conditional ARIA: the mark is
  // decorative wherever a wordmark already names the organisation, and a linter
  // cannot tell that from a ternary on `title`.
  if (title) {
    return (
      <svg
        className={className}
        fill="currentColor"
        role="img"
        viewBox="0 0 300 300"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>{title}</title>
        {body}
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="currentColor"
      viewBox="0 0 300 300"
      xmlns="http://www.w3.org/2000/svg"
    >
      {body}
    </svg>
  );
}

/**
 * Mark plus name. `DecentralAmerica` is one word and set as one word — the
 * DecentralChain family splits its lockups ("Decentral Exchange"), but the domain
 * and the association's name do not carry that space.
 */
export function Logo({
  className = '',
  markClassName = 'h-7 w-7',
  disc = false,
}: {
  className?: string;
  markClassName?: string;
  disc?: boolean;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Mark className={markClassName} disc={disc} />
      <span className="font-medium tracking-[-0.03em]">DecentralAmerica</span>
    </span>
  );
}

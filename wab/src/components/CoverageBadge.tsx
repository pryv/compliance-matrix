import type { Coverage, EffortSaved, FacilitationMode } from '../db';

const COVERAGE_LABELS: Record<Coverage, string> = {
  implemented: 'Implemented',
  configurable: 'Configurable',
  facilitated: 'Facilitated',
  documented: 'Documented',
  'out-of-scope': 'Out of scope'
};

const EFFORT_LABELS_SHORT: Record<EffortSaved, string> = {
  high: 'High',
  medium: 'Med',
  low: 'Low'
};

const EFFORT_LABELS_FULL: Record<EffortSaved, string> = {
  high: 'Engineering + operational effort: Pryv carries most (legal / editorial / process work not counted; see docs/effort-axis.md)',
  medium: 'Engineering + operational effort: roughly shared between Pryv and implementer',
  low: 'Engineering + operational effort: implementer carries most; Pryv contributes a small technical substrate'
};

const MODE_LABELS: Record<FacilitationMode, string> = {
  primitive: 'Primitive',
  evidence: 'Evidence',
  storage: 'Storage',
  infrastructure: 'Infrastructure',
  awareness: 'Awareness'
};

const MODE_LABELS_FULL: Record<FacilitationMode, string> = {
  primitive: 'Pryv\'s access/permissions enforce the obligation',
  evidence: 'Pryv\'s audit log feeds the implementer\'s artefact',
  storage: 'Pryv stores text/records the implementer creates',
  infrastructure: 'Pryv runs the technical layer (TLS, HA, encryption)',
  awareness: 'Framing row; Pryv contributes minimally'
};

/**
 * Combined single-pill badge that summarises a requirement row:
 *   Facilitated rows:  [F: <Mode>][<Effort>]
 *   Other tiers:       [<Coverage>][<Effort>]
 *   Out of scope:      [Out of scope]    (no effort tail)
 *
 * The pill is split into two coloured segments:
 *   - left: coverage-tier color (cov-*)
 *   - right: effort color (effort-pill-*) -- emerald/amber/rose for
 *     high/medium/low. Visually conveys "how much effort Pryv saves"
 *     at a glance.
 */
export function RequirementBadge ({
  coverage,
  mode,
  effort
}: {
  coverage: Coverage;
  mode: FacilitationMode | null;
  effort: EffortSaved | null;
}) {
  const leftLabel = (coverage === 'facilitated' && mode)
    ? `F: ${MODE_LABELS[mode]}`
    : COVERAGE_LABELS[coverage];

  const titleParts: string[] = [COVERAGE_LABELS[coverage]];
  if (mode) titleParts.push(`${MODE_LABELS[mode]} — ${MODE_LABELS_FULL[mode]}`);
  if (effort) titleParts.push(EFFORT_LABELS_FULL[effort]);
  const title = titleParts.join(' · ');

  // No effort tail (out-of-scope rows) -> single-segment pill.
  if (!effort) {
    return (
      <span
        className={`cov-${coverage} inline-block px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap`}
        title={title}
      >
        {leftLabel}
      </span>
    );
  }

  // Two-segment pill: coverage color on the left, effort color on the right.
  return (
    <span className='inline-flex rounded overflow-hidden text-xs font-medium whitespace-nowrap' title={title}>
      <span className={`cov-${coverage} px-2 py-0.5`}>{leftLabel}</span>
      <span className={`effort-pill-${effort} px-2 py-0.5`}>{EFFORT_LABELS_SHORT[effort]}</span>
    </span>
  );
}

/** Coverage-only badge (used by the scope-page histogram). */
export function CoverageBadge ({ coverage }: { coverage: Coverage }) {
  return (
    <span className={`cov-${coverage} inline-block px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap`}>
      {COVERAGE_LABELS[coverage]}
    </span>
  );
}

export function DraftBadge () {
  return <span className='draft-badge ml-2'>draft</span>;
}

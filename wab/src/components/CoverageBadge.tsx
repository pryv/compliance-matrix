import type { Coverage, EffortSaved, FacilitationMode, PlannedChange, PlannedKind } from '../db';

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

const PLANNED_KIND_LABELS: Record<PlannedKind, string> = {
  bug: 'BUG',
  feature: 'PLANNED',
  enhancement: 'ENH'
};

/**
 * Compact chip that flags a row as depending on planned work.
 *   - bug   → red       (a known defect; today's claim is partially incorrect)
 *   - feature → indigo  (backlog feature whose shipping would tighten the claim)
 *   - enhancement → grey (smaller refinement)
 *
 * `impact` controls intensity (high = filled bold, low = outlined). Tooltip
 * surfaces the summary + impact + proposal/backlog references.
 */
export function PlannedBadge ({ change }: { change: PlannedChange }) {
  const labelKind = PLANNED_KIND_LABELS[change.kind];
  const impact = change.impact ?? 'medium';
  const titleParts = [
    `${labelKind} (${impact} impact): ${change.summary}`,
    `Proposal: ${change.proposal}`
  ];
  if (change.backlog) titleParts.push(`Backlog: ${change.backlog}`);
  if (change.eta_release) titleParts.push(`ETA: ${change.eta_release}`);
  if (change.tracking_url) titleParts.push(`Tracker: ${change.tracking_url}`);

  const className = `planned-${change.kind} planned-impact-${impact} inline-block px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap`;
  const content = (
    <>
      {labelKind}
      {change.impact && <span className='ml-1 opacity-80'>· {change.impact}</span>}
    </>
  );

  // When `tracking_url` is populated (GitHub issue / project link), render
  // as a clickable anchor so the operator can jump straight to the tracker.
  // Otherwise render the static span as before.
  if (change.tracking_url) {
    return (
      <a
        href={change.tracking_url}
        target='_blank'
        rel='noopener noreferrer'
        className={`${className} hover:opacity-90 hover:underline`}
        title={titleParts.join('\n')}
      >
        {content}
      </a>
    );
  }

  return (
    <span
      className={className}
      title={titleParts.join('\n')}
    >
      {content}
    </span>
  );
}

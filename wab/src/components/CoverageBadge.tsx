import type { Coverage, EffortSaved, FacilitationMode } from '../db';

const COVERAGE_LABELS: Record<Coverage, string> = {
  implemented: 'Implemented',
  configurable: 'Configurable',
  facilitated: 'Facilitated',
  documented: 'Documented',
  'out-of-scope': 'Out of scope'
};

const EFFORT_LABELS: Record<EffortSaved, string> = {
  high: 'Pryv carries most',
  medium: 'Shared effort',
  low: 'Implementer carries most'
};

const MODE_LABELS: Record<FacilitationMode, string> = {
  primitive: 'primitive',
  evidence: 'evidence',
  storage: 'storage',
  infrastructure: 'infrastructure',
  awareness: 'awareness'
};

export function CoverageBadge ({ coverage }: { coverage: Coverage }) {
  return (
    <span className={`cov-${coverage} inline-block px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap`}>
      {COVERAGE_LABELS[coverage]}
    </span>
  );
}

export function EffortBadge ({ effort }: { effort: EffortSaved }) {
  return (
    <span
      className={`effort-${effort} inline-block px-2 py-0.5 rounded text-xs whitespace-nowrap`}
      title={EFFORT_LABELS[effort]}
    >
      {effort}
    </span>
  );
}

export function FacilitationModeBadge ({ mode }: { mode: FacilitationMode }) {
  return (
    <span
      className={`fac-${mode} inline-block px-2 py-0.5 rounded text-xs whitespace-nowrap`}
      title={`Facilitation mode: ${MODE_LABELS[mode]}`}
    >
      {MODE_LABELS[mode]}
    </span>
  );
}

export function DraftBadge () {
  return <span className='draft-badge ml-2'>draft</span>;
}

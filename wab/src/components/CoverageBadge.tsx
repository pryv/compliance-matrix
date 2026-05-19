import type { Coverage } from '../db';

const LABELS: Record<Coverage, string> = {
  implemented: 'Implemented',
  configurable: 'Configurable',
  facilitated: 'Facilitated',
  documented: 'Documented',
  'out-of-scope': 'Out of scope'
};

export function CoverageBadge ({ coverage }: { coverage: Coverage }) {
  return (
    <span className={`cov-${coverage} inline-block px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap`}>
      {LABELS[coverage]}
    </span>
  );
}

export function DraftBadge () {
  return <span className='draft-badge ml-2'>draft</span>;
}

import { NavLink, Routes, Route, Link } from 'react-router-dom';
import { ScopeList } from './components/ScopeList';
import { ScopeDetail } from './components/ScopeDetail';
import { PrimitiveList } from './components/PrimitiveList';
import { PrimitiveDetail } from './components/PrimitiveDetail';
import { BacklogList } from './components/BacklogList';
import { BacklogDetail } from './components/BacklogDetail';
import { ModeList } from './components/ModeList';
import { ModeDetail } from './components/ModeDetail';
import { GlobalCoverage } from './components/GlobalCoverage';
import { ContextNoteList } from './components/ContextNoteList';
import { ContextNoteDetail } from './components/ContextNoteDetail';
import { Generate } from './components/Generate';
import pryvLogo from './assets/pryv-logo.svg';

const PRYV_WEBSITE = 'https://pryv.github.io/www/';
const PRYV_DOCS = 'https://pryv.github.io/';

const EXTERNAL_LINKS = [
  { href: PRYV_DOCS, label: 'Docs' },
  { href: './llms.txt', label: 'For agents' },
  { href: 'https://github.com/pryv/compliance-matrix', label: 'Source' }
];

const NAV_TABS = [
  { to: '/', label: 'Regulations', end: true },
  { to: '/primitives', label: 'Primitives', end: false },
  { to: '/coverage', label: 'Coverage', end: false },
  { to: '/modes', label: 'Modes', end: false },
  { to: '/backlogs', label: 'Roadmap', end: false },
  { to: '/context-notes', label: 'Context', end: false },
  { to: '/generate', label: 'Generate', end: false }
];

export default function App () {
  return (
    <div className='min-h-screen bg-slate-50'>
      <header className='border-b border-slate-200 bg-white'>
        <div className='max-w-6xl mx-auto px-6 py-3 flex items-center justify-between flex-wrap gap-2'>
          <div className='flex items-center gap-3'>
            <a href={PRYV_WEBSITE} title='Pryv website' className='shrink-0'>
              <img src={pryvLogo} alt='Pryv' className='h-7 w-auto' />
            </a>
            <Link to='/' className='text-base font-semibold text-slate-800 hover:text-pryv-red'>
              Compliance Matrix
            </Link>
          </div>
          <nav className='flex items-center gap-0.5 flex-wrap'>
            {NAV_TABS.map((t) => (
              <NavLink
                key={t.to}
                to={t.to}
                end={t.end}
                className={({ isActive }) =>
                  `px-2.5 py-1 rounded text-sm transition-colors ${
                    isActive
                      ? 'bg-red-50 text-pryv-red font-medium'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                {t.label}
              </NavLink>
            ))}
            <span className='mx-1 h-4 w-px bg-slate-200' aria-hidden='true' />
            {EXTERNAL_LINKS.map((l) => (
              <a
                key={l.label}
                className='px-2.5 py-1 text-sm text-slate-500 hover:text-pryv-red'
                href={l.href}
                target='_blank'
                rel='noreferrer'
              >
                {l.label} ↗
              </a>
            ))}
          </nav>
        </div>
        <div className='bg-amber-50 border-t border-amber-200 text-xs text-amber-900'>
          <div className='max-w-6xl mx-auto px-6 py-1.5'>
            <span className='font-medium'>Work in progress</span>, calibrated against the pre-V2 release of{' '}
            <a
              className='underline hover:no-underline'
              href='https://github.com/pryv/open-pryv.io'
              target='_blank'
              rel='noreferrer'
            >
              open-pryv.io
            </a>
            . Source:{' '}
            <a
              className='underline hover:no-underline'
              href='https://github.com/pryv/compliance-matrix'
              target='_blank'
              rel='noreferrer'
            >
              pryv/compliance-matrix
            </a>.
          </div>
        </div>
      </header>

      <main>
        <Routes>
          <Route path='/' element={<ScopeList />} />
          <Route path='/scope/:id' element={<ScopeDetail />} />
          <Route path='/primitives' element={<PrimitiveList />} />
          <Route path='/primitive/:id' element={<PrimitiveDetail />} />
          <Route path='/backlogs' element={<BacklogList />} />
          <Route path='/backlog/:slug' element={<BacklogDetail />} />
          <Route path='/modes' element={<ModeList />} />
          <Route path='/mode/:mode' element={<ModeDetail />} />
          <Route path='/coverage' element={<GlobalCoverage />} />
          <Route path='/context-notes' element={<ContextNoteList />} />
          <Route path='/context-note/:id' element={<ContextNoteDetail />} />
          <Route path='/generate' element={<Generate />} />
        </Routes>
      </main>

      <footer className='border-t border-slate-200 mt-12 py-6'>
        <div className='max-w-6xl mx-auto px-6 text-xs text-slate-500'>
          Coverage claims are evidence-backed (tests, docs, config keys). Items marked{' '}
          <span className='draft-badge'>draft</span> are authored but not yet reviewed. This matrix describes
          the software's contribution to compliance; implementer organizations remain responsible
          for their own GDPR / HIPAA / ISO / MDR / HDS posture.
          <div className='mt-3 flex flex-wrap gap-x-4 gap-y-1'>
            <a className='hover:text-pryv-red' href={PRYV_WEBSITE}>Pryv website</a>
            <a className='hover:text-pryv-red' href={PRYV_DOCS}>Developer documentation</a>
            <a className='hover:text-pryv-red' href='./llms.txt'>llms.txt</a>
            <a className='hover:text-pryv-red' href='./llms-full.txt'>Full text</a>
            <a className='hover:text-pryv-red' href='./compliance.json'>JSON</a>
            <a className='hover:text-pryv-red' href='https://github.com/pryv/compliance-matrix'>Source (BSD-3-Clause)</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

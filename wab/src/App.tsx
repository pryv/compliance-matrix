import { NavLink, Routes, Route, Link } from 'react-router-dom';
import { ScopeList } from './components/ScopeList';
import { ScopeDetail } from './components/ScopeDetail';
import { PrimitiveList } from './components/PrimitiveList';
import { PrimitiveDetail } from './components/PrimitiveDetail';

const NAV_TABS = [
  { to: '/', label: 'Regulations', end: true },
  { to: '/primitives', label: 'Pryv primitives', end: false }
];

export default function App () {
  return (
    <div className='min-h-screen bg-slate-50'>
      <header className='border-b border-slate-200 bg-white'>
        <div className='max-w-6xl mx-auto px-6 py-3 flex items-center justify-between'>
          <Link to='/' className='text-base font-semibold text-slate-800'>
            open-pryv.io · Compliance Matrix
          </Link>
          <nav className='flex items-center gap-1'>
            {NAV_TABS.map((t) => (
              <NavLink
                key={t.to}
                to={t.to}
                end={t.end}
                className={({ isActive }) =>
                  `px-3 py-1 rounded text-sm transition-colors ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 font-medium'
                      : 'text-slate-500 hover:text-slate-700'
                  }`
                }
              >
                {t.label}
              </NavLink>
            ))}
            <a
              className='px-3 py-1 text-sm text-slate-500 hover:text-slate-700'
              href='https://github.com/pryv/compliance-matrix'
              target='_blank'
              rel='noreferrer'
            >
              source
            </a>
          </nav>
        </div>
      </header>

      <main>
        <Routes>
          <Route path='/' element={<ScopeList />} />
          <Route path='/scope/:id' element={<ScopeDetail />} />
          <Route path='/primitives' element={<PrimitiveList />} />
          <Route path='/primitive/:id' element={<PrimitiveDetail />} />
        </Routes>
      </main>

      <footer className='border-t border-slate-200 mt-12 py-6'>
        <div className='max-w-6xl mx-auto px-6 text-xs text-slate-500'>
          Coverage claims are evidence-backed (tests, docs, config keys). Items marked{' '}
          <span className='draft-badge'>draft</span> are authored but not yet reviewed. This matrix describes
          the software's contribution to compliance; implementer organizations remain responsible
          for their own GDPR / HIPAA / ISO / MDR / HDS posture.
        </div>
      </footer>
    </div>
  );
}

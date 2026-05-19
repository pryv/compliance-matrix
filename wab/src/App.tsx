import { Routes, Route, Link } from 'react-router-dom';
import { ScopeList } from './components/ScopeList';
import { ScopeDetail } from './components/ScopeDetail';

export default function App () {
  return (
    <div className='min-h-screen bg-slate-50'>
      <header className='border-b border-slate-200 bg-white'>
        <div className='max-w-6xl mx-auto px-6 py-3 flex items-center justify-between'>
          <Link to='/' className='text-base font-semibold text-slate-800'>
            open-pryv.io · Compliance Matrix
          </Link>
          <nav className='text-sm text-slate-500'>
            <a
              className='hover:text-slate-700'
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

import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

const App = lazy(() => import('./App.tsx'));
const Cms = lazy(() => import('./Cms.tsx'));

const isCmsPath = window.location.pathname.startsWith('/cms');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans">
        <div className="w-12 h-12 rounded-full border-4 border-[#5d821a]/20 border-t-[#5d821a] animate-spin mb-4"></div>
        <p className="text-sm font-semibold text-slate-500">Đang tải...</p>
      </div>
    }>
      {isCmsPath ? <Cms /> : <App />}
    </Suspense>
  </StrictMode>,
);

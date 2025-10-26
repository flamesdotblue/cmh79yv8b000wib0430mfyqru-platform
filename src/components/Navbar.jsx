import { useEffect, useState } from 'react';
import { Home, User, LogIn, LogOut, Moon, Sun, Settings, LayoutGrid, Star } from 'lucide-react';
import { useTheme } from './ThemeContext';

export default function Navbar({ activeTab, onTabChange }) {
  const { theme, setTheme, primary, setPrimary, accent, setAccent } = useTheme();
  const [openSettings, setOpenSettings] = useState(false);
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('demoUser');
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    function onEsc(e) { if (e.key === 'Escape') setOpenSettings(false); }
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, []);

  function login() {
    const demo = { id: 'demo', name: 'Guest', avatar: '', plan: 'Free' };
    localStorage.setItem('demoUser', JSON.stringify(demo));
    setUser(demo);
  }
  function logout() {
    localStorage.removeItem('demoUser');
    setUser(null);
  }

  return (
    <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/70 supports-[backdrop-filter]:dark:bg-neutral-950/70 border-b border-neutral-200/60 dark:border-neutral-800/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-[var(--primary)]" />
          <span className="font-semibold tracking-tight">PDF Studio</span>
        </div>
        <nav className="flex items-center gap-1">
          <button onClick={() => onTabChange('workspace')} className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${activeTab==='workspace' ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}>
            <LayoutGrid size={18} /> Workspace
          </button>
          <button onClick={() => onTabChange('dashboard')} className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${activeTab==='dashboard' ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}>
            <Home size={18} /> Dashboard
          </button>
        </nav>
        <div className="flex items-center gap-2">
          <button onClick={() => setOpenSettings(v=>!v)} className="p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800" aria-label="Customize theme">
            <Settings size={18} />
          </button>
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800" aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {user ? (
            <button onClick={logout} className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800">
              <LogOut size={18} /> Logout
            </button>
          ) : (
            <button onClick={login} className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800">
              <LogIn size={18} /> Login
            </button>
          )}
        </div>
      </div>

      {openSettings && (
        <div className="border-t border-neutral-200/60 dark:border-neutral-800/60">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm mb-2">Primary color</label>
              <input type="color" value={primary} onChange={(e)=>setPrimary(e.target.value)} className="w-full h-10 cursor-pointer bg-transparent" />
            </div>
            <div>
              <label className="block text-sm mb-2">Accent color</label>
              <input type="color" value={accent} onChange={(e)=>setAccent(e.target.value)} className="w-full h-10 cursor-pointer bg-transparent" />
            </div>
            <div className="flex items-end justify-end">
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm bg-[var(--primary)] text-white">
                <Star size={16} /> Live Preview
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

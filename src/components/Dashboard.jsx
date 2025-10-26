import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Clock, Folder, ExternalLink } from 'lucide-react';

function useLocal(key, initial) {
  const [value, setValue] = useState(() => {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : initial;
  });
  useEffect(() => { localStorage.setItem(key, JSON.stringify(value)); }, [key, value]);
  return [value, setValue];
}

export default function Dashboard({ onGoToWorkspace }) {
  const [docs] = useLocal('pdfstudio_docs', []);
  const [favorites] = useLocal('pdfstudio_favs', []);
  const [recent] = useLocal('pdfstudio_recent', []);

  const recentDocs = useMemo(() => recent.map(id => docs.find(d => d.id === id)).filter(Boolean), [recent, docs]);
  const favoriteDocs = useMemo(() => favorites.map(id => docs.find(d => d.id === id)).filter(Boolean), [favorites, docs]);

  const categories = useMemo(() => {
    const map = new Map();
    docs.forEach(d => map.set(d.category, (map.get(d.category) || 0) + 1));
    return Array.from(map.entries());
  }, [docs]);

  return (
    <section id="dashboard" className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Your Dashboard</h2>
          <p className="text-sm text-neutral-500">Overview of favorites, recent items, and categories.</p>
        </div>
        <button onClick={onGoToWorkspace} className="px-4 py-2 rounded-md text-white" style={{ background: 'var(--primary)' }}>Open Workspace</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium inline-flex items-center gap-2"><Star size={16} className="text-yellow-500" /> Favorites</span>
            <span className="text-xs text-neutral-500">{favoriteDocs.length}</span>
          </div>
          <ul className="space-y-2 max-h-64 overflow-y-auto">
            {favoriteDocs.length === 0 && <li className="text-sm text-neutral-500">No favorites yet</li>}
            {favoriteDocs.map(d => (
              <li key={d.id} className="text-sm flex items-center justify-between">
                <span className="truncate">{d.name}</span>
                <a href="#workspace" onClick={onGoToWorkspace} className="inline-flex items-center gap-1 text-[var(--accent)] hover:underline"><ExternalLink size={14} /> Open</a>
              </li>
            ))}
          </ul>
        </div>
        <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium inline-flex items-center gap-2"><Clock size={16} /> Recently viewed</span>
            <span className="text-xs text-neutral-500">{recentDocs.length}</span>
          </div>
          <ul className="space-y-2 max-h-64 overflow-y-auto">
            {recentDocs.length === 0 && <li className="text-sm text-neutral-500">No recent items</li>}
            {recentDocs.map(d => (
              <li key={d.id} className="text-sm flex items-center justify-between">
                <span className="truncate">{d.name}</span>
                <a href="#workspace" onClick={onGoToWorkspace} className="inline-flex items-center gap-1 text-[var(--accent)] hover:underline"><ExternalLink size={14} /> Open</a>
              </li>
            ))}
          </ul>
        </div>
        <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium inline-flex items-center gap-2"><Folder size={16} /> Categories</span>
            <span className="text-xs text-neutral-500">{categories.length}</span>
          </div>
          <ul className="space-y-2 max-h-64 overflow-y-auto">
            {categories.length === 0 && <li className="text-sm text-neutral-500">No documents added</li>}
            {categories.map(([cat, count]) => (
              <li key={cat} className="text-sm flex items-center justify-between">
                <span className="capitalize">{cat}</span>
                <span className="text-neutral-500">{count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-6">
        <h3 className="font-medium">Share with animation</h3>
        <p className="text-sm text-neutral-500 mt-1">Create unique links that open documents with your customized theme and motion settings. Upload a file in the workspace, then use the Share action from the list.</p>
      </motion.div>
    </section>
  );
}

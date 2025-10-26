import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FolderOpen, Search, Star, Trash2, Download, Share2, Edit3, Plus } from 'lucide-react';

function useLocalStore(key, initial) {
  const [value, setValue] = useState(() => {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : initial;
  });
  useEffect(() => { localStorage.setItem(key, JSON.stringify(value)); }, [key, value]);
  return [value, setValue];
}

export default function PDFWorkspace() {
  const [docs, setDocs] = useLocalStore('pdfstudio_docs', []);
  const [search, setSearch] = useLocalStore('pdfstudio_search', '');
  const [categoryFilter, setCategoryFilter] = useLocalStore('pdfstudio_cat', 'all');
  const [activeId, setActiveId] = useLocalStore('pdfstudio_active', null);
  const [recent, setRecent] = useLocalStore('pdfstudio_recent', []);
  const [favorites, setFavorites] = useLocalStore('pdfstudio_favs', []);
  const [annotationText, setAnnotationText] = useState('');
  const inputRef = useRef(null);

  const categories = ['education', 'projects', 'notes', 'work', 'personal'];

  const filtered = useMemo(() => {
    return docs.filter(d => {
      const matchesSearch = !search || d.name.toLowerCase().includes(search.toLowerCase());
      const matchesCat = categoryFilter === 'all' || d.category === categoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [docs, search, categoryFilter]);

  const activeDoc = useMemo(() => docs.find(d => d.id === activeId) || filtered[0] || null, [docs, activeId, filtered]);

  useEffect(() => {
    if (activeDoc) {
      setActiveId(activeDoc.id);
      setRecent(prev => {
        const next = [activeDoc.id, ...prev.filter(id => id !== activeDoc.id)].slice(0, 10);
        return next;
      });
    }
  }, [activeDoc]);

  function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const id = `${Date.now()}_${file.name}`;
    const doc = { id, name: file.name, url, category: 'projects', annotations: [], createdAt: Date.now() };
    setDocs(prev => [doc, ...prev]);
    setActiveId(id);
    e.target.value = '';
  }

  function importFromUrl() {
    const url = window.prompt('Enter direct URL to a PDF (https://...)');
    if (!url) return;
    const name = url.split('/').pop() || 'document.pdf';
    const id = `${Date.now()}_${name}`;
    const doc = { id, name, url, category: 'projects', annotations: [], createdAt: Date.now() };
    setDocs(prev => [doc, ...prev]);
    setActiveId(id);
  }

  function onDragStart(e, id) { e.dataTransfer.setData('text/plain', id); }
  function onDrop(e, destId) {
    const id = e.dataTransfer.getData('text/plain');
    if (!id || id === destId) return;
    const fromIndex = docs.findIndex(d => d.id === id);
    const toIndex = docs.findIndex(d => d.id === destId);
    if (fromIndex < 0 || toIndex < 0) return;
    const next = [...docs];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    setDocs(next);
  }

  function onDragOver(e) { e.preventDefault(); }

  function toggleFavorite(id) {
    setFavorites(prev => prev.includes(id) ? prev.filter(x => x !== id) : [id, ...prev]);
  }

  function removeDoc(id) {
    if (!window.confirm('Remove this PDF from your workspace?')) return;
    setDocs(prev => prev.filter(d => d.id !== id));
    setFavorites(prev => prev.filter(x => x !== id));
    if (activeId === id) setActiveId(null);
  }

  function updateCategory(id, category) {
    setDocs(prev => prev.map(d => d.id === id ? { ...d, category } : d));
  }

  function addAnnotation() {
    if (!annotationText.trim() || !activeDoc) return;
    const note = { id: `${Date.now()}`, text: annotationText.trim(), createdAt: Date.now() };
    setDocs(prev => prev.map(d => d.id === activeDoc.id ? { ...d, annotations: [note, ...d.annotations] } : d));
    setAnnotationText('');
  }

  function removeAnnotation(docId, noteId) {
    setDocs(prev => prev.map(d => d.id === docId ? { ...d, annotations: d.annotations.filter(n => n.id !== noteId) } : d));
  }

  function buildShareLink(doc) {
    const payload = { id: doc.id, name: doc.name };
    const encoded = btoa(encodeURIComponent(JSON.stringify(payload)));
    const url = `${window.location.origin}${window.location.pathname}?doc=${encoded}`;
    navigator.clipboard.writeText(url).then(() => {
      alert('Share link copied to clipboard! Note: local files require your device to access.');
    }).catch(()=>{
      window.prompt('Copy link:', url);
    });
  }

  // If a share link is opened, try to focus that doc if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('doc');
    if (encoded) {
      try {
        const payload = JSON.parse(decodeURIComponent(atob(encoded)));
        const exists = docs.find(d => d.id === payload.id || d.name === payload.name);
        if (exists) setActiveId(exists.id);
      } catch {}
    }
  }, []);

  return (
    <section id="workspace" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
            <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search PDFs" className="w-full pl-9 pr-3 py-2 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900" />
          </div>
          <button onClick={() => inputRef.current?.click()} className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-white" style={{ background: 'var(--primary)' }}>
            <Upload size={18} /> Upload
          </button>
          <input ref={inputRef} type="file" accept="application/pdf" onChange={handleUpload} className="hidden" />
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={categoryFilter} onChange={(e)=>setCategoryFilter(e.target.value)} className="px-3 py-2 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
            <option value="all">All categories</option>
            {['education','projects','notes','work','personal'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button onClick={importFromUrl} className="px-3 py-2 rounded-md border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 inline-flex items-center gap-2">
            <FolderOpen size={18} /> Import URL
          </button>
          <button onClick={()=>alert('Connect Google Drive via backend OAuth and Picker SDK.')} className="px-3 py-2 rounded-md border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900">Google Drive</button>
          <button onClick={()=>alert('Connect Dropbox via backend OAuth and Chooser SDK.')} className="px-3 py-2 rounded-md border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900">Dropbox</button>
        </div>

        <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 flex items-center justify-between">
            <span className="text-sm font-medium">Your PDFs</span>
            <span className="text-xs text-neutral-500">{filtered.length} shown</span>
          </div>
          <ul className="max-h-[50vh] overflow-y-auto divide-y divide-neutral-200 dark:divide-neutral-800">
            <AnimatePresence initial={false}>
              {filtered.map(doc => (
                <motion.li key={doc.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} draggable onDragStart={(e)=>onDragStart(e, doc.id)} onDragOver={onDragOver} onDrop={(e)=>onDrop(e, doc.id)} className={`p-3 flex items-center gap-3 cursor-pointer ${activeDoc?.id === doc.id ? 'bg-neutral-100 dark:bg-neutral-900' : 'hover:bg-neutral-50 dark:hover:bg-neutral-900/50'}`} onClick={()=>setActiveId(doc.id)}>
                  <div className="h-9 w-7 rounded bg-gradient-to-br from-[var(--primary)] to-[var(--accent)]" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{doc.name}</p>
                    <div className="text-xs text-neutral-500 flex items-center gap-3 mt-0.5">
                      <span className="capitalize">{doc.category}</span>
                      {favorites.includes(doc.id) && <span className="inline-flex items-center gap-1"><Star size={12} className="text-yellow-500" /> Favorite</span>}
                    </div>
                  </div>
                  <button onClick={(e)=>{e.stopPropagation(); toggleFavorite(doc.id);}} className="p-2 rounded-md hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60" aria-label="Favorite">
                    <Star size={16} className={favorites.includes(doc.id) ? 'text-yellow-500 fill-yellow-500' : ''} />
                  </button>
                  <button onClick={(e)=>{e.stopPropagation(); buildShareLink(doc);}} className="p-2 rounded-md hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60" aria-label="Share">
                    <Share2 size={16} />
                  </button>
                  <button onClick={(e)=>{e.stopPropagation(); removeDoc(doc.id);}} className="p-2 rounded-md hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60 text-red-500" aria-label="Delete">
                    <Trash2 size={16} />
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>

        {activeDoc && (
          <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Details</span>
              <a download={activeDoc.name} href={activeDoc.url} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-sm">
                <Download size={16} /> Download
              </a>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-neutral-500">Name</span>
                <p className="truncate">{activeDoc.name}</p>
              </div>
              <div>
                <span className="text-neutral-500">Category</span>
                <select value={activeDoc.category} onChange={(e)=>updateCategory(activeDoc.id, e.target.value)} className="w-full mt-1 px-2 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                  {['education','projects','notes','work','personal'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <span className="text-sm font-medium">Annotations</span>
              <div className="mt-2 flex gap-2">
                <input value={annotationText} onChange={(e)=>setAnnotationText(e.target.value)} placeholder="Add a note, summary, or highlight tag" className="flex-1 px-3 py-2 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900" />
                <button onClick={addAnnotation} className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-white" style={{ background: 'var(--accent)' }}>
                  <Plus size={16} /> Add
                </button>
              </div>
              <ul className="mt-3 space-y-2 max-h-40 overflow-y-auto">
                {activeDoc.annotations.map(n => (
                  <li key={n.id} className="text-sm px-3 py-2 rounded-md border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Edit3 size={14} className="text-neutral-500" />
                      <span>{n.text}</span>
                    </div>
                    <button onClick={()=>removeAnnotation(activeDoc.id, n.id)} className="text-red-500 hover:underline text-xs">Remove</button>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-neutral-500">Tip: Searching within the PDF uses your browser viewer. Use the search box below to auto-open search in the preview.</p>
            </div>
          </div>
        )}
      </div>

      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Preview</h3>
          {activeDoc && (
            <div className="flex items-center gap-2">
              <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Find in document" className="px-3 py-2 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900" />
              <button onClick={()=>window.alert('Use Cmd/Ctrl+F to find; the preview URL includes a #search parameter for supported viewers.')} className="px-3 py-2 rounded-md border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-sm">Help</button>
            </div>
          )}
        </div>
        <div className="relative rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
          <AnimatePresence mode="wait">
            {activeDoc ? (
              <motion.div key={activeDoc.id + search} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="h-[65vh]">
                <iframe title={activeDoc.name} src={`${activeDoc.url}${search ? `#search=${encodeURIComponent(search)}` : ''}`} className="w-full h-full" />
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[65vh] grid place-items-center">
                <div className="text-center">
                  <div className="mx-auto h-14 w-14 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] mb-3" />
                  <p className="text-sm text-neutral-500">Upload or import a PDF to start.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

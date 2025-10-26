import { useState } from 'react';
import { ThemeProvider } from './components/ThemeContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import PDFWorkspace from './components/PDFWorkspace';
import Dashboard from './components/Dashboard';

function App() {
  const [activeTab, setActiveTab] = useState('workspace');

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 transition-colors duration-300">
        <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="w-full">
          <Hero />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            {activeTab === 'workspace' ? (
              <PDFWorkspace />)
              : (
              <Dashboard onGoToWorkspace={() => setActiveTab('workspace')} />
            )}
          </div>
        </main>
        <footer className="border-t border-neutral-200/60 dark:border-neutral-800/60 py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-sm text-neutral-500 flex items-center justify-between">
            <p>© {new Date().getFullYear()} PDF Studio — Modern, animated PDF platform</p>
            <p className="hidden sm:block">Built with React, Tailwind, Framer Motion, and Spline</p>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
}

export default App;

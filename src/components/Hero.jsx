import Spline from '@splinetool/react-spline';
import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <section className="relative w-full h-[52vh] sm:h-[60vh] lg:h-[66vh] overflow-hidden">
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/zhZFnwyOYLgqlLWk/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/0 to-white dark:from-neutral-950/10 dark:via-neutral-950/0 dark:to-neutral-950 pointer-events-none" />
      <div className="relative z-10 h-full flex items-center">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">A modern, animated PDF experience</h1>
            <p className="mt-4 text-neutral-600 dark:text-neutral-300">Upload, organize, annotate, and share PDFs. Customize your layout and theme in real-time with smooth motion and an interactive cover.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#workspace" className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-white" style={{ background: 'var(--primary)' }}>
                Get started
              </a>
              <a href="#dashboard" className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900">
                Explore dashboard
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

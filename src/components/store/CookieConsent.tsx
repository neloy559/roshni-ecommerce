'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';

const STORAGE_KEY = 'roshni-cookies-accepted';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const addToast = useAppStore((s) => s.addToast);

  useEffect(() => {
    const accepted = localStorage.getItem(STORAGE_KEY);
    if (!accepted) {
      // Small delay so it doesn't flash on initial load
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setVisible(false);
  };

  const handleCustomize = () => {
    addToast('Cookie settings coming soon!', 'info');
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-0 left-0 right-0 z-[70] p-3 sm:p-4"
        >
          <div className="mx-auto max-w-2xl rounded-2xl border bg-background/80 backdrop-blur-xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10 px-5 py-4 sm:px-6 sm:py-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Icon + Text */}
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Cookie className="h-4.5 w-4.5 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We use cookies to enhance your shopping experience. By continuing, you agree to our{' '}
                  <span className="text-foreground font-medium underline underline-offset-2 decoration-primary/30 cursor-pointer hover:decoration-primary transition-colors">
                    Cookie Policy
                  </span>
                  .
                </p>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCustomize}
                  className="text-muted-foreground hover:text-foreground rounded-full px-4 h-9 text-sm"
                >
                  Customize
                </Button>
                <Button
                  size="sm"
                  onClick={handleAccept}
                  className="rounded-full px-5 h-9 text-sm font-semibold"
                >
                  Accept All
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion, type Spring } from 'framer-motion';
import { ArrowUp, CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Header } from '@/components/store/Header';
import { Footer } from '@/components/store/Footer';
import { CartDrawer } from '@/components/store/CartDrawer';
import { CookieConsent } from '@/components/store/CookieConsent';
import { HomePage } from '@/components/store/HomePage';
import { ProductsPage } from '@/components/store/ProductsPage';
import { ProductDetailPage } from '@/components/store/ProductDetailPage';
import { CartPage } from '@/components/store/CartPage';
import { CheckoutPage } from '@/components/store/CheckoutPage';
import { OrderSuccessPage } from '@/components/store/OrderSuccessPage';
import { LoginPage, RegisterPage } from '@/components/store/AuthPages';
import { AccountPage } from '@/components/store/AccountPage';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { WishlistPage } from '@/components/store/WishlistPage';
import { WhatsAppButton } from '@/components/store/WhatsAppButton';

function PageLoader() {
  const currentPage = useAppStore((s) => s.currentPage);
  const barRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    bar.style.width = '20%';
    bar.style.opacity = '1';

    timersRef.current = [
      setTimeout(() => { if (bar) bar.style.width = '60%'; }, 80),
      setTimeout(() => { if (bar) bar.style.width = '90%'; }, 250),
      setTimeout(() => {
        if (bar) bar.style.width = '100%';
        setTimeout(() => {
          if (bar) { bar.style.opacity = '0'; bar.style.width = '0%'; }
        }, 300);
      }, 450),
    ];
    return () => { timersRef.current.forEach(clearTimeout); };
  }, [currentPage]);

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-[3px]">
      <div
        ref={barRef}
        className="h-full bg-gradient-to-r from-primary via-pink-400 to-primary transition-all duration-200 ease-out"
        style={{ width: 0, opacity: 0 }}
      />
    </div>
  );
}

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

const SPRING_CONFIG: Spring = { type: 'spring', stiffness: 350, damping: 25 };
const SVG_SIZE = 44;
const STROKE_WIDTH = 2.5;
const RADIUS = (SVG_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function BackToTop() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);

  const handleScroll = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    rafRef.current = requestAnimationFrame(() => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;

      if (scrollY > 400) {
        setVisible(true);
        const pct = docHeight > 0 ? Math.min(scrollY / docHeight, 1) : 0;
        setProgress(pct);
      } else {
        setVisible(false);
      }
    });
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [handleScroll]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const offset = CIRCUMFERENCE - progress * CIRCUMFERENCE;

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          transition={SPRING_CONFIG}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-label="Back to top"
          style={{ width: SVG_SIZE, height: SVG_SIZE }}
        >
          {/* Circular progress ring */}
          <svg
            className="absolute inset-0 -rotate-90"
            width={SVG_SIZE}
            height={SVG_SIZE}
            viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
          >
            {/* Track */}
            <circle
              cx={SVG_SIZE / 2}
              cy={SVG_SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke="currentColor"
              strokeWidth={STROKE_WIDTH}
              className="opacity-20"
            />
            {/* Progress */}
            <circle
              cx={SVG_SIZE / 2}
              cy={SVG_SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke="currentColor"
              strokeWidth={STROKE_WIDTH}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={offset}
              className="opacity-60 transition-[stroke-dashoffset] duration-150 ease-out"
            />
          </svg>
          <ArrowUp className="h-5 w-5 relative z-10" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

function ToastContainer() {
  const toasts = useAppStore((s) => s.toasts);
  const removeToast = useAppStore((s) => s.removeToast);

  const iconMap = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />,
    error: <XCircle className="h-5 w-5 text-red-500 shrink-0" />,
    info: <Info className="h-5 w-5 text-blue-500 shrink-0" />,
  };

  return (
    <div className="fixed bottom-20 right-6 z-[60] flex flex-col gap-2 max-w-sm">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-3 rounded-lg border bg-background px-4 py-3 shadow-lg"
          >
            {iconMap[toast.type]}
            <p className="text-sm text-foreground flex-1">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default function Home() {
  const { currentPage } = useAppStore();
  const isAdmin = currentPage.startsWith('admin');

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <HomePage />;
      case 'products': return <ProductsPage />;
      case 'product': return <ProductDetailPage />;
      case 'cart': return <CartPage />;
      case 'checkout': return <CheckoutPage />;
      case 'order-success': return <OrderSuccessPage />;
      case 'login': return <LoginPage />;
      case 'register': return <RegisterPage />;
      case 'account': return <AccountPage />;
      case 'wishlist': return <WishlistPage />;
      case 'admin': return <AdminDashboard />;
      default: return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <PageLoader />
      {!isAdmin && <Header />}
      <AnimatePresence mode="wait">
        <motion.main
          key={currentPage}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.2 }}
          className="flex-1"
        >
          {renderPage()}
        </motion.main>
      </AnimatePresence>
      {!isAdmin && <Footer />}
      {!isAdmin && <CartDrawer />}
      {!isAdmin && <CookieConsent />}
      {!isAdmin && <WhatsAppButton />}
      <BackToTop />
      <ToastContainer />
    </div>
  );
}
'use client';

import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp, CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Header } from '@/components/store/Header';
import { Footer } from '@/components/store/Footer';
import { CartDrawer } from '@/components/store/CartDrawer';
import { HomePage } from '@/components/store/HomePage';
import { ProductsPage } from '@/components/store/ProductsPage';
import { ProductDetailPage } from '@/components/store/ProductDetailPage';
import { CartPage } from '@/components/store/CartPage';
import { CheckoutPage } from '@/components/store/CheckoutPage';
import { OrderSuccessPage } from '@/components/store/OrderSuccessPage';
import { LoginPage, RegisterPage } from '@/components/store/AuthPages';
import { AccountPage } from '@/components/store/AccountPage';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

function BackToTop() {
  const [visible, setVisible] = useState(false);

  const handleScroll = useCallback(() => {
    setVisible(window.scrollY > 400);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-label="Back to top"
        >
          <ArrowUp className="h-5 w-5" />
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
      case 'admin': return <AdminDashboard />;
      default: return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
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
      <BackToTop />
      <ToastContainer />
    </div>
  );
}
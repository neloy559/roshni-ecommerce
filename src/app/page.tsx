'use client';

import { AnimatePresence, motion } from 'framer-motion';
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
    </div>
  );
}
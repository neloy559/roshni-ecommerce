'use client';

import { useAppStore } from '@/lib/store';
import { useEffect, useState, useCallback, useRef } from 'react';
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  Heart,
  ChevronDown,
  TrendingUp,
  Clock,
  Sparkles,
  Tag,
  Package,
  HelpCircle,
  LogIn,
  UserCircle,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface Category {
  id: string;
  name: string;
  slug: string;
  children?: Array<{ name: string; slug: string }>;
}

const TRENDING_SEARCHES = ['Heels', 'Tote Bag', 'Jewelry Set', 'Wedding Shoes'];

function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('roshni-recent-searches');
    return raw ? JSON.parse(raw) as string[] : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(query: string) {
  if (!query.trim()) return;
  const recent = getRecentSearches().filter((s) => s !== query.trim());
  recent.unshift(query.trim());
  if (recent.length > 5) recent.length = 5;
  localStorage.setItem('roshni-recent-searches', JSON.stringify(recent));
}

function isAnnouncementDismissed(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem('roshni-announcement-dismissed') === 'true';
}

export function Header() {
  const {
    currentPage,
    navigate,
    cartCount,
    user,
    isAdmin,
    searchOpen,
    setSearchOpen,
    mobileMenuOpen,
    setMobileMenuOpen,
    setCartDrawerOpen,
    wishlistItems,
    addToast,
    pageParams,
  } = useAppStore();

  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [announcementVisible, setAnnouncementVisible] = useState(() => !isAnnouncementDismissed());
  const dropdownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch categories
  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data: Category[]) => setCategories(data))
      .catch(() => {});
  }, []);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check if a category is currently active
  const isCategoryActive = useCallback(
    (slug: string) => currentPage === 'products' && pageParams.category === slug,
    [currentPage, pageParams.category]
  );

  // Don't show header on admin pages
  if (currentPage.startsWith('admin')) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      saveRecentSearch(searchQuery);
      useAppStore.getState().navigate('products', { search: searchQuery.trim() });
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleSearchSuggestion = (query: string) => {
    saveRecentSearch(query);
    useAppStore.getState().navigate('products', { search: query });
    setSearchOpen(false);
    setSearchQuery('');
  };

  const handleDismissAnnouncement = () => {
    sessionStorage.setItem('roshni-announcement-dismissed', 'true');
    setAnnouncementVisible(false);
  };

  const handleDropdownEnter = (slug: string) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    setActiveDropdown(slug);
  };

  const handleDropdownLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  const handleDropdownContentEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
  };

  const handleDropdownContentLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  const clearRecentSearches = () => {
    localStorage.removeItem('roshni-recent-searches');
  };

  const handleWishlistClick = () => {
    useAppStore.getState().navigate('products', { wishlist: 'true' });
  };

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 w-full transition-all duration-300',
          scrolled ? 'bg-white/95 backdrop-blur-md' : 'bg-white'
        )}
      >
        {/* Announcement Bar */}
        <AnimatePresence>
          {announcementVisible && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="relative bg-gradient-to-r from-primary via-primary/90 to-primary text-primary-foreground text-center py-2 px-8 text-xs sm:text-sm tracking-wide font-medium flex items-center justify-center gap-2">
                <Sparkles className="h-3.5 w-3.5 shrink-0" />
                <span>Free shipping on orders over ৳5,000 — Use code WELCOME10 for 10% off</span>
                <button
                  onClick={handleDismissAnnouncement}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/20 transition-colors"
                  aria-label="Dismiss announcement"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main header bar */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Logo */}
            <button
              onClick={() => navigate('home')}
              className="flex items-center gap-2.5 group"
              aria-label="Roshni Home"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: -5 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              >
                <Heart className="h-7 w-7 text-primary fill-primary" />
              </motion.div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-foreground leading-tight">
                  Roshni
                </span>
                <span className="text-[10px] text-muted-foreground tracking-[0.2em] uppercase leading-tight hidden sm:block">
                  Elegance Redefined
                </span>
              </div>
            </button>

            {/* Desktop navigation with dropdowns */}
            <nav className="hidden md:flex items-center gap-0.5">
              {/* Home */}
              <button
                onClick={() => navigate('home')}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-full transition-colors',
                  currentPage === 'home'
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                Home
              </button>

              {/* Category links with dropdowns */}
              {categories.map((cat) => (
                <div
                  key={cat.slug}
                  className="relative"
                  onMouseEnter={() => handleDropdownEnter(cat.slug)}
                  onMouseLeave={handleDropdownLeave}
                >
                  <button
                    onClick={() => navigate('products', { category: cat.slug })}
                    className={cn(
                      'flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-full transition-colors',
                      isCategoryActive(cat.slug)
                        ? 'text-primary bg-primary/10'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    )}
                  >
                    {cat.name}
                    {cat.children && cat.children.length > 0 && (
                      <motion.span
                        animate={{ rotate: activeDropdown === cat.slug ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                      </motion.span>
                    )}
                  </button>

                  {/* Dropdown */}
                  <AnimatePresence>
                    {activeDropdown === cat.slug && cat.children && cat.children.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        onMouseEnter={handleDropdownContentEnter}
                        onMouseLeave={handleDropdownContentLeave}
                        className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-[55]"
                      >
                        <div className="bg-white rounded-xl shadow-lg shadow-black/[0.08] border border-border/60 py-2 min-w-[200px] overflow-hidden">
                          {/* "All [Category]" link */}
                          <button
                            onClick={() => {
                              navigate('products', { category: cat.slug });
                              setActiveDropdown(null);
                            }}
                            className={cn(
                              'w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-primary/5',
                              isCategoryActive(cat.slug) && !pageParams.subcategory
                                ? 'text-primary'
                                : 'text-foreground'
                            )}
                          >
                            All {cat.name}
                          </button>
                          <Separator className="mx-3 w-auto" />
                          {/* Subcategory links */}
                          {cat.children.map((sub) => (
                            <button
                              key={sub.slug}
                              onClick={() => {
                                navigate('products', {
                                  category: cat.slug,
                                  subcategory: sub.slug,
                                });
                                setActiveDropdown(null);
                              }}
                              className={cn(
                                'w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-primary/5',
                                isCategoryActive(cat.slug) && pageParams.subcategory === sub.slug
                                  ? 'text-primary font-medium'
                                  : 'text-muted-foreground hover:text-foreground'
                              )}
                            >
                              {sub.name}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}

              {/* New Arrivals */}
              <button
                onClick={() => navigate('products', { sort: 'newest' })}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-full transition-colors',
                  currentPage === 'products' && pageParams.sort === 'newest'
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                New Arrivals
              </button>

              {/* Sale */}
              <button
                onClick={() => navigate('products', { sale: 'true' })}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full transition-colors',
                  currentPage === 'products' && pageParams.sale === 'true'
                    ? 'text-red-600 bg-red-50'
                    : 'text-red-500 hover:text-red-600 hover:bg-red-50'
                )}
              >
                Sale
                <span className="inline-flex items-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 leading-none">
                  %
                </span>
              </button>
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-0.5 sm:gap-1">
              {/* Search button (desktop) */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(true)}
                className="hidden sm:flex"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* Search button (mobile) - show as icon in header */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(true)}
                className="sm:hidden"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* User */}
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => (user ? navigate('account') : navigate('login'))}
                aria-label={user ? 'My Account' : 'Login'}
              >
                <User className="h-5 w-5" />
                {user && (
                  <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 bg-primary rounded-full ring-2 ring-white" />
                )}
              </Button>

              {/* Wishlist */}
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={handleWishlistClick}
                aria-label="Wishlist"
              >
                <Heart className="h-5 w-5" />
                {wishlistItems.length > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-pink-500 px-1 text-[10px] font-bold text-white ring-2 ring-white"
                  >
                    {wishlistItems.length > 9 ? '9+' : wishlistItems.length}
                  </motion.span>
                )}
              </Button>

              {/* Cart */}
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setCartDrawerOpen(true)}
                aria-label="Cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0.5 }}
                    animate={{ scale: [0.5, 1.25, 1] }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground ring-2 ring-white"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Gradient line on scroll */}
        <AnimatePresence>
          {scrolled && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent"
            />
          )}
        </AnimatePresence>
      </header>

      {/* Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="bg-white w-full shadow-xl shadow-black/10 rounded-b-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="max-w-2xl mx-auto px-4 pt-4 pb-6">
                {/* Search input */}
                <form onSubmit={handleSearch} className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      autoFocus
                      placeholder="Search for shoes, bags, accessories..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-12 text-base rounded-xl border-primary/20 focus-visible:ring-primary/30 pl-11 pr-4"
                    />
                  </div>
                  <Button type="submit" className="rounded-xl px-6 h-12">
                    Search
                  </Button>
                </form>

                {/* Suggestions area */}
                {!searchQuery && (
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Recent Searches */}
                    {getRecentSearches().length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            Recent Searches
                          </h3>
                          <button
                            onClick={clearRecentSearches}
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                          >
                            Clear
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {getRecentSearches().map((term) => (
                            <button
                              key={term}
                              onClick={() => handleSearchSuggestion(term)}
                              className="px-3 py-1.5 text-sm bg-accent/60 hover:bg-accent text-foreground rounded-lg transition-colors"
                            >
                              {term}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Trending Searches */}
                    <div>
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-3">
                        <TrendingUp className="h-3.5 w-3.5" />
                        Trending Now
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {TRENDING_SEARCHES.map((term) => (
                          <button
                            key={term}
                            onClick={() => handleSearchSuggestion(term)}
                            className="px-3 py-1.5 text-sm bg-primary/5 hover:bg-primary/10 text-primary rounded-lg transition-colors flex items-center gap-1"
                          >
                            <Sparkles className="h-3 w-3 opacity-50" />
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-80 p-0 overflow-y-auto">
          {/* Decorative brand header */}
          <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-transparent px-6 pt-6 pb-5">
            <SheetHeader className="p-0 space-y-0">
              <SheetTitle className="flex items-center gap-2.5">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Heart className="h-6 w-6 text-primary fill-primary" />
                </motion.div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold tracking-tight text-foreground leading-tight">
                    Roshni
                  </span>
                  <span className="text-[10px] text-muted-foreground tracking-[0.2em] uppercase leading-tight">
                    Elegance Redefined
                  </span>
                </div>
              </SheetTitle>
            </SheetHeader>
          </div>

          {/* Mobile nav content */}
          <nav className="p-4 space-y-1">
            {/* Home */}
            <button
              onClick={() => {
                navigate('home');
                setMobileMenuOpen(false);
              }}
              className={cn(
                'w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-3',
                currentPage === 'home'
                  ? 'bg-primary/10 text-primary'
                  : 'hover:bg-accent text-foreground'
              )}
            >
              <Package className="h-4 w-4 shrink-0" />
              Home
            </button>

            <Separator className="my-2" />

            {/* SHOP section */}
            <p className="px-4 pt-2 pb-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
              Shop
            </p>

            {categories.map((cat) => (
              <div key={cat.slug}>
                <button
                  onClick={() => {
                    navigate('products', { category: cat.slug });
                    setMobileMenuOpen(false);
                  }}
                  className={cn(
                    'w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-between',
                    isCategoryActive(cat.slug) && !pageParams.subcategory
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-accent text-foreground'
                  )}
                >
                  <span>{cat.name}</span>
                  {cat.children && cat.children.length > 0 && (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
                {/* Subcategories indented */}
                {cat.children &&
                  cat.children.length > 0 &&
                  isCategoryActive(cat.slug) && (
                    <div className="ml-4 space-y-0.5 mt-0.5">
                      {cat.children.map((sub) => (
                        <button
                          key={sub.slug}
                          onClick={() => {
                            navigate('products', {
                              category: cat.slug,
                              subcategory: sub.slug,
                            });
                            setMobileMenuOpen(false);
                          }}
                          className={cn(
                            'w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors',
                            pageParams.subcategory === sub.slug
                              ? 'text-primary font-medium bg-primary/5'
                              : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                          )}
                        >
                          {sub.name}
                        </button>
                      ))}
                    </div>
                  )}
              </div>
            ))}

            {/* New Arrivals */}
            <button
              onClick={() => {
                navigate('products', { sort: 'newest' });
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-3 hover:bg-accent text-foreground"
            >
              <Sparkles className="h-4 w-4 shrink-0 text-primary" />
              New Arrivals
            </button>

            {/* Sale */}
            <button
              onClick={() => {
                navigate('products', { sale: 'true' });
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-3 hover:bg-red-50 text-red-500"
            >
              <Tag className="h-4 w-4 shrink-0" />
              Sale
            </button>

            <Separator className="my-2" />

            {/* MY ACCOUNT section */}
            <p className="px-4 pt-2 pb-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              My Account
              {wishlistItems.length > 0 && (
                <span className="inline-flex items-center justify-center h-4 min-w-[16px] rounded-full bg-pink-500 text-white text-[9px] font-bold px-1">
                  {wishlistItems.length}
                </span>
              )}
            </p>

            <button
              onClick={() => {
                if (user) {
                  navigate('account');
                } else {
                  navigate('login');
                }
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-3 hover:bg-accent text-foreground"
            >
              {user ? (
                <UserCircle className="h-4 w-4 shrink-0" />
              ) : (
                <LogIn className="h-4 w-4 shrink-0" />
              )}
              {user ? 'My Account' : 'Login / Register'}
            </button>

            <button
              onClick={() => {
                handleWishlistClick();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-3 hover:bg-accent text-foreground"
            >
              <Heart className="h-4 w-4 shrink-0 text-pink-500" />
              Wishlist
              {wishlistItems.length > 0 && (
                <span className="ml-auto text-xs text-muted-foreground">
                  {wishlistItems.length} items
                </span>
              )}
            </button>

            {user && isAdmin() && (
              <button
                onClick={() => {
                  navigate('admin');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-3 hover:bg-accent text-primary"
              >
                <ShieldCheck className="h-4 w-4 shrink-0" />
                Admin Dashboard
              </button>
            )}

            <Separator className="my-2" />

            {/* HELP section */}
            <p className="px-4 pt-2 pb-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
              Help
            </p>

            <button
              onClick={() => {
                addToast('Contact us at support@roshni.com', 'info');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-3 hover:bg-accent text-foreground"
            >
              <HelpCircle className="h-4 w-4 shrink-0" />
              Contact Us
            </button>
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
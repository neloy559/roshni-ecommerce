'use client';

import { useAppStore } from '@/lib/store';
import { useEffect, useState } from 'react';
import { Search, ShoppingCart, User, Menu, X, Heart, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

export function Header() {
  const { currentPage, navigate, cartCount, user, isAdmin, searchOpen, setSearchOpen, mobileMenuOpen, setMobileMenuOpen, setCartDrawerOpen } = useAppStore();
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Array<{ name: string; slug: string; children?: Array<{ name: string; slug: string }> }>>([]);

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('products', { search: searchQuery.trim() });
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  if (currentPage.startsWith('admin')) return null;

  const navLinks = [
    { label: 'Home', page: 'home' },
    ...categories.map(c => ({ label: c.name, page: 'products', params: { category: c.slug } })),
  ];

  return (
    <>
      <header className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-white'
      )}>
        {/* Top bar */}
        <div className="bg-primary text-primary-foreground text-center py-1.5 text-xs tracking-wide font-medium">
          Free shipping on orders over ৳5,000 ✨ Use code WELCOME10 for 10% off
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            {/* Mobile menu button */}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>

            {/* Logo */}
            <button onClick={() => navigate('home')} className="flex items-center gap-2 group">
              <Heart className="h-6 w-6 text-primary fill-primary transition-transform group-hover:scale-110" />
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-foreground leading-tight">Roshni</span>
                <span className="text-[10px] text-muted-foreground tracking-widest uppercase leading-tight hidden sm:block">Elegance Redefined</span>
              </div>
            </button>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.page + (link.params?.category || '')}
                  onClick={() => navigate(link.page, link.params)}
                  className={cn(
                    'px-4 py-2 text-sm font-medium rounded-full transition-colors',
                    (currentPage === link.page && !link.params) || (link.params?.category && useAppStore.getState().pageParams.category === link.params.category)
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                >
                  {link.label}
                </button>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)} className="hidden sm:flex">
                <Search className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost" size="icon"
                className="relative"
                onClick={() => user ? navigate('account') : navigate('login')}
              >
                <User className="h-5 w-5" />
                {user && <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 bg-primary rounded-full" />}
              </Button>
              <Button variant="ghost" size="icon" className="relative" onClick={() => setCartDrawerOpen(true)}>
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-primary text-primary-foreground border-0 rounded-full">
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm" onClick={() => setSearchOpen(false)}>
          <div className="bg-white w-full p-4 shadow-lg" onClick={e => e.stopPropagation()}>
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex gap-2">
              <Input
                autoFocus
                placeholder="Search for shoes, bags, accessories..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="h-12 text-base rounded-full border-primary/20 focus-visible:ring-primary/30"
              />
              <Button type="submit" className="rounded-full px-6">Search</Button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-80 p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary fill-primary" />
              Roshni
            </SheetTitle>
          </SheetHeader>
          <nav className="p-4 space-y-1">
            <button
              onClick={() => { navigate('home'); setMobileMenuOpen(false); }}
              className={cn('w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors', currentPage === 'home' ? 'bg-primary/10 text-primary' : 'hover:bg-accent')}
            >
              Home
            </button>
            {categories.map(c => (
              <div key={c.slug}>
                <button
                  onClick={() => { navigate('products', { category: c.slug }); setMobileMenuOpen(false); }}
                  className={cn('w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-between', pageMatch(c.slug) ? 'bg-primary/10 text-primary' : 'hover:bg-accent')}
                >
                  {c.name} <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            ))}
            <div className="border-t my-3" />
            <button onClick={() => { navigate('login'); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium hover:bg-accent">
              {user ? 'My Account' : 'Login / Register'}
            </button>
            {user && isAdmin() && (
              <button onClick={() => { navigate('admin'); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium hover:bg-accent text-primary">
                Admin Dashboard
              </button>
            )}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}

function pageMatch(slug: string): boolean {
  const { currentPage, pageParams } = useAppStore.getState();
  return currentPage === 'products' && pageParams.category === slug;
}
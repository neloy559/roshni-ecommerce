'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import { ProductCard } from './HomePage';
import {
  SlidersHorizontal, X, Clock, TrendingUp, Flame, ChevronDown,
  ChevronRight, Home, Grid2X2, Grid3X3, LayoutGrid, Tag,
  PackageOpen, ArrowLeft, Check, SearchX, Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import type { Product } from './HomePage';
import { getApiUrl } from '@/lib/api-config';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Category {
  id: string; name: string; slug: string;
  children: Array<{ id: string; name: string; slug: string }>;
  productCount?: number;
}

type GridCols = 2 | 3 | 4;
type SortOption = 'newest' | 'popular' | 'price-asc' | 'price-desc';

// ─── FilterSidebar (separate named component) ────────────────────────────────
function FilterSidebar({
  categories, category, setCategory, sale, setSale,
  priceRange, setPriceRange, sort, setSort,
  hasFilters, clearFilters, totalProducts,
}: {
  categories: Category[];
  category: string;
  setCategory: (c: string) => void;
  sale: boolean;
  setSale: (s: boolean) => void;
  priceRange: [number, number];
  setPriceRange: (r: [number, number]) => void;
  sort: SortOption;
  setSort: (s: SortOption) => void;
  hasFilters: boolean;
  clearFilters: () => void;
  totalProducts: number;
}) {
  const [localRange, setLocalRange] = useState<[number, number]>(priceRange);
  const [priceDirty, setPriceDirty] = useState(false);

  useEffect(() => { setLocalRange(priceRange); }, [priceRange]);

  const applyPrice = () => {
    setPriceRange(localRange);
    setPriceDirty(false);
  };

  return (
    <div className="space-y-6">
      {/* Sort By */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <h4 className="text-sm font-semibold">Sort By</h4>
        </div>
        <div className="space-y-1">
          {([
            { value: 'newest' as SortOption, label: 'Newest', icon: Clock },
            { value: 'popular' as SortOption, label: 'Popular', icon: Flame },
            { value: 'price-asc' as SortOption, label: 'Price: Low → High', icon: TrendingUp },
            { value: 'price-desc' as SortOption, label: 'Price: High → Low', icon: TrendingUp },
          ] as const).map(opt => (
            <button
              key={opt.value}
              onClick={() => setSort(opt.value)}
              className={cn(
                'w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center gap-2.5',
                sort === opt.value
                  ? 'bg-primary/10 text-primary font-medium shadow-sm'
                  : 'hover:bg-accent text-muted-foreground hover:text-foreground',
              )}
            >
              <opt.icon className={cn('h-3.5 w-3.5', sort === opt.value ? 'text-primary' : 'text-muted-foreground/60')} />
              <span className="flex-1">{opt.label}</span>
              {sort === opt.value && <Check className="h-3.5 w-3.5 text-primary" />}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Categories */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Grid3X3 className="h-4 w-4 text-muted-foreground" />
          <h4 className="text-sm font-semibold">Categories</h4>
        </div>
        <div className="space-y-1">
          <button
            onClick={() => setCategory('')}
            className={cn(
              'w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center justify-between group',
              !category ? 'bg-primary/10 text-primary font-medium shadow-sm' : 'hover:bg-accent text-muted-foreground hover:text-foreground',
            )}
          >
            <span>All Products</span>
            {totalProducts > 0 && (
              <span className={cn('text-xs px-2 py-0.5 rounded-full', !category ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground')}>
                {totalProducts}
              </span>
            )}
          </button>
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setCategory(c.slug)}
              className={cn(
                'w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center justify-between group',
                category === c.slug ? 'bg-primary/10 text-primary font-medium shadow-sm' : 'hover:bg-accent text-muted-foreground hover:text-foreground',
              )}
            >
              <span>{c.name}</span>
              {c.productCount !== undefined && (
                <span className={cn('text-xs px-2 py-0.5 rounded-full', category === c.slug ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground')}>
                  {c.productCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Price Range */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Tag className="h-4 w-4 text-muted-foreground" />
          <h4 className="text-sm font-semibold">Price Range</h4>
        </div>
        <Slider
          min={0} max={10000} step={500}
          value={localRange}
          onValueChange={(v) => { setLocalRange(v as [number, number]); setPriceDirty(true); }}
          className="mb-3"
        />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-muted text-foreground">
            ৳{localRange[0].toLocaleString()}
          </span>
          <span className="text-muted-foreground text-xs">—</span>
          <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-muted text-foreground">
            ৳{localRange[1].toLocaleString()}
          </span>
        </div>
        {priceDirty && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
            <Button size="sm" className="w-full rounded-lg" onClick={applyPrice}>
              Apply Price Range
            </Button>
          </motion.div>
        )}
      </div>

      <Separator />

      {/* On Sale Toggle */}
      <div>
        <button
          onClick={() => setSale(!sale)}
          className="flex items-center gap-3 w-full text-sm group"
        >
          <div className={cn(
            'h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0',
            sale
              ? 'bg-primary border-primary text-primary-foreground shadow-sm'
              : 'border-muted-foreground/30 group-hover:border-primary/50',
          )}>
            {sale && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 20 }}>
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
            )}
          </div>
          <span className={cn('transition-colors', sale ? 'text-primary font-medium' : 'text-foreground')}>
            On Sale
          </span>
          {sale && (
            <Badge variant="secondary" className="ml-auto text-xs bg-primary/10 text-primary border-0">
              Sale
            </Badge>
          )}
        </button>
      </div>

      {/* Clear All Filters */}
      <AnimatePresence>
        {hasFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              variant="outline"
              size="sm"
              className="w-full rounded-full border-dashed hover:border-solid hover:bg-destructive/5 hover:text-destructive hover:border-destructive/30 transition-all"
              onClick={clearFilters}
            >
              <X className="h-3.5 w-3.5 mr-1.5" />
              Clear All Filters
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── SortDropdown (custom button + absolute positioned menu) ──────────────────
function SortDropdown({ sort, setSort }: { sort: SortOption; setSort: (s: SortOption) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const options: { value: SortOption; label: string; icon: React.ElementType }[] = [
    { value: 'newest', label: 'Newest', icon: Clock },
    { value: 'popular', label: 'Popular', icon: Flame },
    { value: 'price-asc', label: 'Price: Low → High', icon: TrendingUp },
    { value: 'price-desc', label: 'Price: High → Low', icon: TrendingUp },
  ];

  const current = options.find(o => o.value === sort) || options[0];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm hover:bg-accent transition-colors bg-background"
      >
        <current.icon className="h-4 w-4 text-muted-foreground" />
        <span className="hidden sm:inline">{current.label}</span>
        <span className="sm:hidden">Sort</span>
        {sort === 'popular' && <Flame className="h-3.5 w-3.5 text-orange-500" />}
        <ChevronDown className={cn('h-3.5 w-3.5 text-muted-foreground transition-transform duration-200', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-1 w-52 bg-popover border rounded-xl shadow-lg z-50 overflow-hidden"
          >
            {options.map(opt => (
              <button
                key={opt.value}
                onClick={() => { setSort(opt.value); setOpen(false); }}
                className={cn(
                  'w-full text-left px-3.5 py-2.5 text-sm flex items-center gap-2.5 transition-colors',
                  sort === opt.value
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'hover:bg-accent text-foreground',
                )}
              >
                <opt.icon className={cn('h-4 w-4', sort === opt.value ? 'text-primary' : 'text-muted-foreground')} />
                <span className="flex-1">{opt.label}</span>
                {sort === opt.value && <Check className="h-3.5 w-3.5 text-primary" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Grid View Toggle ─────────────────────────────────────────────────────────
function GridViewToggle({ cols, setCols }: { cols: GridCols; setCols: (c: GridCols) => void }) {
  const options: { value: GridCols; icon: React.ElementType; label: string }[] = [
    { value: 2, icon: Grid2X2, label: '2 cols' },
    { value: 3, icon: Grid3X3, label: '3 cols' },
    { value: 4, icon: LayoutGrid, label: '4 cols' },
  ];

  return (
    <div className="hidden md:flex items-center gap-0.5 rounded-lg border p-0.5 bg-background">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => setCols(opt.value)}
          title={opt.label}
          className={cn(
            'p-1.5 rounded-md transition-all duration-200',
            cols === opt.value
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent',
          )}
        >
          <opt.icon className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  );
}

// ─── Active Filter Chips ──────────────────────────────────────────────────────
function ActiveFilterChips({
  category, categories, setCategory, sale, setSale,
  priceRange, setPriceRange, search, setSearch,
}: {
  category: string;
  categories: Category[];
  setCategory: (c: string) => void;
  sale: boolean;
  setSale: (s: boolean) => void;
  priceRange: [number, number];
  setPriceRange: (r: [number, number]) => void;
  search: string;
  setSearch: (s: string) => void;
}) {
  const categoryName = category ? categories.find(c => c.slug === category)?.name || category : '';
  const priceCustom = priceRange[0] > 0 || priceRange[1] < 10000;

  if (!category && !sale && !priceCustom && !search) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-wrap gap-2 mb-4"
      >
        {search && (
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <Badge
              variant="secondary"
              className="rounded-full gap-1.5 pl-3 pr-2 py-1 cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors text-xs font-normal"
              onClick={() => setSearch('')}
            >
              <SearchX className="h-3 w-3 mr-0.5" />
              &quot;{search}&quot;
              <button className="ml-0.5 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          </motion.span>
        )}
        {categoryName && (
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <Badge
              variant="secondary"
              className="rounded-full gap-1.5 pl-3 pr-2 py-1 cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors text-xs font-normal"
              onClick={() => setCategory('')}
            >
              <Grid3X3 className="h-3 w-3 mr-0.5" />
              {categoryName}
              <button className="ml-0.5 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          </motion.span>
        )}
        {priceCustom && (
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <Badge
              variant="secondary"
              className="rounded-full gap-1.5 pl-3 pr-2 py-1 cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors text-xs font-normal"
              onClick={() => setPriceRange([0, 10000])}
            >
              <Tag className="h-3 w-3 mr-0.5" />
              ৳{priceRange[0].toLocaleString()} – ৳{priceRange[1].toLocaleString()}
              <button className="ml-0.5 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          </motion.span>
        )}
        {sale && (
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <Badge
              variant="secondary"
              className="rounded-full gap-1.5 pl-3 pr-2 py-1 cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors text-xs font-normal"
              onClick={() => setSale(false)}
            >
              <Sparkles className="h-3 w-3 mr-0.5" />
              On Sale
              <button className="ml-0.5 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          </motion.span>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Enhanced Empty State ─────────────────────────────────────────────────────
function EmptyState({ clearFilters, browseAll }: { clearFilters: () => void; browseAll: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-16 sm:py-24 px-4"
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Icon */}
      <div className="relative mb-6">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-muted flex items-center justify-center">
          <PackageOpen className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/50" />
        </div>
        <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <SearchX className="h-4 w-4 text-primary/60" />
        </div>
      </div>

      <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">No products found</h3>
      <p className="text-sm sm:text-base text-muted-foreground text-center max-w-sm mb-2">
        We couldn&apos;t find any products matching your current filters.
      </p>
      <p className="text-xs text-muted-foreground/70 text-center max-w-xs mb-8">
        Try removing some filters, adjusting the price range, or searching with different keywords.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="outline"
          className="rounded-full px-6 gap-2"
          onClick={clearFilters}
        >
          <X className="h-4 w-4" />
          Clear Filters
        </Button>
        <Button
          className="rounded-full px-6 gap-2"
          onClick={browseAll}
        >
          <Sparkles className="h-4 w-4" />
          Browse All Products
        </Button>
      </div>
    </motion.div>
  );
}

// ─── Enhanced Skeleton Row ────────────────────────────────────────────────────
function EnhancedSkeletonGrid({ cols }: { cols: GridCols }) {
  const colClass = {
    2: 'grid-cols-2',
    3: 'md:grid-cols-3 grid-cols-2',
    4: 'md:grid-cols-4 grid-cols-2',
  }[cols];

  return (
    <div className={cn('grid gap-3 sm:gap-4', colClass)}>
      {Array.from({ length: cols === 4 ? 8 : 6 }).map((_, i) => (
        <div key={i} className="space-y-2.5">
          <Skeleton className="aspect-[3/4] w-full rounded-xl" />
          <Skeleton className="h-3.5 w-4/5 rounded" />
          <Skeleton className="h-3.5 w-1/3 rounded" />
          <Skeleton className="h-3 w-1/2 rounded" />
        </div>
      ))}
    </div>
  );
}

// ─── Main ProductsPage ───────────────────────────────────────────────────────
export function ProductsPage() {
  const { pageParams, navigate } = useAppStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [gridCols, setGridCols] = useState<GridCols>(4);

  const [search, setSearch] = useState(pageParams.search || '');
  const [category, setCategory] = useState(pageParams.category || '');
  const [sort, setSort] = useState<SortOption>((pageParams.sort || 'newest') as SortOption);
  const [sale, setSale] = useState(pageParams.sale === 'true');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);

  // Fetch products
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function load() {
      if (cancelled) return;
      setLoading(true);
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      if (search) params.set('search', search);
      if (sort) params.set('sort', sort);
      if (sale) params.set('sale', 'true');
      if (priceRange[0] > 0) params.set('minPrice', String(priceRange[0]));
      if (priceRange[1] < 10000) params.set('maxPrice', String(priceRange[1]));
      params.set('limit', '50');

      try {
        const res = await fetch(getApiUrl(`/api/products?${params}`), { signal: controller.signal });
        const data = await res.json();
        if (!cancelled) {
          setProducts(data.products || []);
          setTotal(data.total || 0);
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; controller.abort(); };
  }, [category, search, sort, sale, priceRange]);

  // Fetch categories
  useEffect(() => {
    let cancelled = false;
    fetch(getApiUrl('/api/categories'))
      .then(r => r.json())
      .then(d => { if (!cancelled) setCategories(d); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const [filterResetKey, setFilterResetKey] = useState(0);

  const clearFilters = useCallback(() => {
    setCategory('');
    setSearch('');
    setSort('newest');
    setSale(false);
    setPriceRange([0, 10000]);
    setFilterResetKey(k => k + 1);
  }, []);

  const browseAll = useCallback(() => {
    clearFilters();
  }, [clearFilters]);

  const hasFilters = !!(category || search || sale || priceRange[0] > 0 || priceRange[1] < 10000);
  const categoryName = category ? categories.find(c => c.slug === category)?.name || '' : '';

  const filterProps = {
    categories, category, setCategory, sale, setSale,
    priceRange, setPriceRange, sort, setSort,
    hasFilters, clearFilters, totalProducts: total,
  };

  const gridColClass = {
    2: 'grid-cols-2 sm:grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  }[gridCols];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* ─── Page Header ────────────────────────────────────────────────── */}
      <div className="relative mb-6 sm:mb-8">
        {/* Decorative gradient background for category pages */}
        {categoryName && (
          <div
            className="absolute inset-0 -m-4 sm:-m-6 rounded-2xl opacity-[0.04] -z-10"
            style={{
              background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary) 40%, transparent 60%, var(--color-primary) 100%)',
            }}
          />
        )}

        {/* Breadcrumb */}
        {categoryName && (
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3" aria-label="Breadcrumb">
            <button
              onClick={() => navigate('home')}
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <Home className="h-3 w-3" />
              Home
            </button>
            <ChevronRight className="h-3 w-3" />
            <button
              onClick={() => { setCategory(''); }}
              className="hover:text-foreground transition-colors"
            >
              Products
            </button>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">{categoryName}</span>
          </nav>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {categoryName || 'All Products'}
            </h1>
            {total > 0 && (
              <Badge
                variant="secondary"
                className="rounded-full text-xs font-normal px-2.5 py-0.5 bg-primary/10 text-primary border-0"
              >
                {total} {total === 1 ? 'item' : 'items'}
              </Badge>
            )}
          </div>

          {categoryName && (
            <button
              onClick={() => setCategory('')}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors group"
            >
              <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
              Back to All Products
            </button>
          )}
        </div>
      </div>

      {/* ─── Main Layout ───────────────────────────────────────────────── */}
      <div className="flex gap-6 lg:gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-60 shrink-0">
          <div className="sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                Filters
              </h3>
            </div>
            <FilterSidebar key={filterResetKey} {...filterProps} />
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Top Bar: Search + Sort + Grid Toggle + Mobile Filter */}
          <div className="flex items-center gap-2 sm:gap-3 mb-5">
            <div className="relative flex-1 max-w-sm">
              <Input
                placeholder="Search products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="rounded-full pr-8 h-9"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 hover:bg-accent transition-colors"
                >
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              )}
            </div>

            {/* Mobile filter button */}
            <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden gap-2 rounded-full h-9">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {hasFilters && (
                    <span className="h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">
                      !
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-2 mb-4">
                  <p className="text-xs text-muted-foreground">
                    Showing <span className="font-medium text-foreground">{total}</span> products
                  </p>
                </div>
                <FilterSidebar key={filterResetKey} {...filterProps} />
                <div className="mt-6 pt-4 border-t">
                  <Button
                    className="w-full rounded-full"
                    onClick={() => setMobileFiltersOpen(false)}
                  >
                    Show {total} {total === 1 ? 'Product' : 'Products'}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            {/* Sort dropdown */}
            <SortDropdown sort={sort} setSort={setSort} />

            {/* Grid toggle */}
            <GridViewToggle cols={gridCols} setCols={setGridCols} />
          </div>

          {/* Showing X of Y */}
          {!loading && products.length > 0 && (
            <p className="text-xs text-muted-foreground mb-4">
              Showing <span className="font-medium text-foreground">{products.length}</span> of{' '}
              <span className="font-medium text-foreground">{total}</span> products
            </p>
          )}

          {/* Active Filter Chips */}
          {!loading && (
            <ActiveFilterChips
              category={category}
              categories={categories}
              setCategory={setCategory}
              sale={sale}
              setSale={setSale}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              search={search}
              setSearch={setSearch}
            />
          )}

          {/* Content Area */}
          {loading ? (
            <EnhancedSkeletonGrid cols={gridCols} />
          ) : products.length === 0 ? (
            <div className="relative rounded-2xl border bg-muted/30">
              <EmptyState clearFilters={clearFilters} browseAll={browseAll} />
            </div>
          ) : (
            <div className={cn('grid gap-3 sm:gap-4', gridColClass)}>
              <AnimatePresence mode="popLayout">
                {products.map(p => (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ProductCard product={p} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
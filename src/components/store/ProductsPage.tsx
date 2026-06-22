'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { ProductCard, ProductCardSkeleton } from './HomePage';
import { SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { Product } from './HomePage';

interface Category { id: string; name: string; slug: string; children: Array<{ id: string; name: string; slug: string }>; }

function FilterSidebar({ categories, category, setCategory, sale, setSale, priceRange, setPriceRange, hasFilters, clearFilters }: {
  categories: Category[];
  category: string;
  setCategory: (c: string) => void;
  sale: boolean;
  setSale: (s: boolean) => void;
  priceRange: [number, number];
  setPriceRange: (r: [number, number]) => void;
  hasFilters: boolean;
  clearFilters: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-semibold mb-3">Categories</h4>
        <div className="space-y-1">
          <button onClick={() => setCategory('')} className={cn('w-full text-left px-3 py-2 rounded-lg text-sm transition-colors', !category ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-accent')}>
            All Products
          </button>
          {categories.map(c => (
            <button key={c.id} onClick={() => setCategory(c.slug)} className={cn('w-full text-left px-3 py-2 rounded-lg text-sm transition-colors', category === c.slug ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-accent')}>
              {c.name}
            </button>
          ))}
        </div>
      </div>
      <Separator />
      <div>
        <h4 className="text-sm font-semibold mb-3">Price Range</h4>
        <Slider min={0} max={10000} step={500} value={priceRange} onValueChange={(v) => setPriceRange(v as [number, number])} className="mb-2" />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>৳{priceRange[0].toLocaleString()}</span>
          <span>৳{priceRange[1].toLocaleString()}</span>
        </div>
      </div>
      <Separator />
      <div>
        <button onClick={() => setSale(!sale)} className="flex items-center gap-2 text-sm">
          <div className={cn('h-5 w-5 rounded border-2 flex items-center justify-center transition-colors', sale ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground/30')}>
            {sale && <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
          </div>
          On Sale
        </button>
      </div>
      {hasFilters && (
        <Button variant="outline" size="sm" className="w-full rounded-full" onClick={clearFilters}>Clear All Filters</Button>
      )}
    </div>
  );
}

export function ProductsPage() {
  const { pageParams, navigate } = useAppStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [search, setSearch] = useState(pageParams.search || '');
  const [category, setCategory] = useState(pageParams.category || '');
  const [sort, setSort] = useState(pageParams.sort || 'newest');
  const [sale, setSale] = useState(pageParams.sale === 'true');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function load() {
      if (cancelled) return;
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      if (search) params.set('search', search);
      if (sort) params.set('sort', sort);
      if (sale) params.set('sale', 'true');
      if (priceRange[0] > 0) params.set('minPrice', String(priceRange[0]));
      if (priceRange[1] < 10000) params.set('maxPrice', String(priceRange[1]));
      params.set('limit', '50');

      try {
        const res = await fetch(`/api/products?${params}`, { signal: controller.signal });
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

  useEffect(() => {
    let cancelled = false;
    fetch('/api/categories').then(r => r.json()).then(d => { if (!cancelled) setCategories(d); }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const clearFilters = () => { setCategory(''); setSearch(''); setSort('newest'); setSale(false); setPriceRange([0, 10000]); };
  const hasFilters = category || search || sale || priceRange[0] > 0 || priceRange[1] < 10000;

  const filterProps = { categories, category, setCategory, sale, setSale, priceRange, setPriceRange, hasFilters, clearFilters };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-1">
          {category ? categories.find(c => c.slug === category)?.name || 'Products' : 'All Products'}
        </h1>
        <p className="text-sm text-muted-foreground">{total} products found</p>
      </div>

      <div className="flex gap-6">
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-24">
            <h3 className="text-sm font-semibold mb-4">Filters</h3>
            <FilterSidebar {...filterProps} />
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="rounded-full pr-8" />
              {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="h-4 w-4 text-muted-foreground" /></button>}
            </div>
            <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden gap-2 rounded-full">
                  <SlidersHorizontal className="h-4 w-4" /> Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
                <div className="mt-4"><FilterSidebar {...filterProps} /></div>
              </SheetContent>
            </Sheet>
            <div className="hidden sm:flex items-center gap-2 ml-auto">
              <span className="text-xs text-muted-foreground">Sort by:</span>
              <select value={sort} onChange={e => setSort(e.target.value)} className="text-sm bg-transparent border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary">
                <option value="newest">Newest</option>
                <option value="popular">Popular</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
              </select>
            </div>
          </div>

          {hasFilters && (
            <div className="flex flex-wrap gap-2 mb-4">
              {category && <Badge variant="secondary" className="rounded-full gap-1 cursor-pointer" onClick={() => setCategory('')}>{category} <X className="h-3 w-3" /></Badge>}
              {sale && <Badge variant="secondary" className="rounded-full gap-1 cursor-pointer" onClick={() => setSale(false)}>On Sale <X className="h-3 w-3" /></Badge>}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-lg font-medium text-muted-foreground mb-2">No products found</p>
              <p className="text-sm text-muted-foreground mb-4">Try adjusting your filters or search</p>
              <Button variant="outline" className="rounded-full" onClick={clearFilters}>Clear Filters</Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
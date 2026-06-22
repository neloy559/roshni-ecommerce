'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, TrendingUp, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface Banner { id: string; image: string; title: string; subtitle: string; linkTarget: string; }
interface Category { id: string; name: string; slug: string; image: string; productCount: number; children: Category[]; }
interface Product { id: string; name: string; slug: string; price: number; discountPrice: number | null; images: string[]; effectivePrice: number; hasDiscount: boolean; discountPercent: number; }

function ProductCard({ product }: { product: Product }) {
  const { navigate, addToCart } = useAppStore();
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Card className="group border-0 shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden cursor-pointer" onClick={() => navigate('product', { slug: product.slug })}>
        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
          {product.hasDiscount && (
            <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground rounded-full px-2.5 py-0.5 text-xs font-semibold">
              -{product.discountPercent}%
            </Badge>
          )}
          <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <Button
              size="sm"
              className="w-full rounded-full bg-white/95 text-foreground hover:bg-white shadow-lg backdrop-blur-sm"
              onClick={(e) => { e.stopPropagation(); addToCart({ id: `cart-${Date.now()}`, productId: product.id, variantId: null, quantity: 1, name: product.name, slug: product.slug, image: product.images[0], price: product.effectivePrice, originalPrice: product.price, hasDiscount: product.hasDiscount, variant: null, stock: 99 }); }}
            >
              Add to Bag
            </Button>
          </div>
        </div>
        <CardContent className="p-3 sm:p-4">
          <h3 className="text-sm font-medium truncate mb-1.5">{product.name}</h3>
          <div className="flex items-center gap-2">
            {product.hasDiscount ? (
              <>
                <span className="text-sm font-bold text-primary">৳{product.effectivePrice.toLocaleString()}</span>
                <span className="text-xs text-muted-foreground line-through">৳{product.price.toLocaleString()}</span>
              </>
            ) : (
              <span className="text-sm font-bold">৳{product.price.toLocaleString()}</span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ProductCardSkeleton() {
  return (
    <Card className="border-0 shadow-sm overflow-hidden">
      <Skeleton className="aspect-[3/4] w-full" />
      <CardContent className="p-3 sm:p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
      </CardContent>
    </Card>
  );
}

function SectionHeader({ icon: Icon, title, actionLabel, onAction }: { icon: React.ElementType; title: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-primary" />
        <h2 className="text-xl sm:text-2xl font-bold">{title}</h2>
      </div>
      {actionLabel && onAction && (
        <Button variant="ghost" className="text-primary hover:text-primary/80 gap-1 group" onClick={onAction}>
          {actionLabel} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      )}
    </div>
  );
}

export function HomePage() {
  const { navigate } = useAppStore();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [trending, setTrending] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [bannerIdx, setBannerIdx] = useState(0);

  useEffect(() => {
    Promise.all([
      fetch('/api/banners').then(r => r.json()),
      fetch('/api/categories').then(r => r.json()),
      fetch('/api/products?sort=popular&limit=8').then(r => r.json()),
      fetch('/api/products?new=true&limit=8').then(r => r.json()),
    ]).then(([b, c, t, n]) => {
      setBanners(b);
      setCategories(c);
      setTrending(t.products || []);
      setNewArrivals(n.products || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => setBannerIdx(i => (i + 1) % banners.length), 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  return (
    <div className="space-y-12 sm:space-y-16 pb-8">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-2xl mx-0 sm:mx-4 sm:rounded-3xl aspect-[16/9] sm:aspect-[21/9] bg-muted">
        {banners.length > 0 ? (
          <div className="relative w-full h-full">
            <img src={banners[bannerIdx]?.image} alt="" className="w-full h-full object-cover transition-all duration-700" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
            <div className="absolute inset-0 flex items-center p-6 sm:p-12 lg:p-16">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-3">{banners[bannerIdx]?.title}</h1>
                <p className="text-sm sm:text-lg text-white/80 mb-4 sm:mb-6 max-w-md">{banners[bannerIdx]?.subtitle}</p>
                <Button size="lg" className="rounded-full bg-white text-black hover:bg-white/90 shadow-lg" onClick={() => navigate('products')}>
                  Shop Now
                </Button>
              </motion.div>
            </div>
            {banners.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {banners.map((_, i) => (
                  <button key={i} onClick={() => setBannerIdx(i)} className={cn('h-2 rounded-full transition-all', i === bannerIdx ? 'w-6 bg-white' : 'w-2 bg-white/50')} />
                ))}
              </div>
            )}
            {banners.length > 1 && (
              <>
                <button onClick={() => setBannerIdx(i => (i - 1 + banners.length) % banners.length)} className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/40 transition-colors">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button onClick={() => setBannerIdx(i => (i + 1) % banners.length)} className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/40 transition-colors">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        ) : (
          <Skeleton className="w-full h-full rounded-2xl" />
        )}
      </section>

      {/* Category Grid */}
      <section className="px-4 sm:px-6">
        <SectionHeader icon={Sparkles} title="Shop by Category" />
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {loading ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="aspect-[4/3] rounded-2xl" />) :
            categories.map((cat) => (
              <motion.button
                key={cat.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => navigate('products', { category: cat.slug })}
                className="relative aspect-[4/3] rounded-2xl overflow-hidden group"
              >
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 inset-x-0 p-3 sm:p-4 text-left">
                  <h3 className="text-sm sm:text-lg font-bold text-white">{cat.name}</h3>
                  <p className="text-xs text-white/70">{cat.productCount} items</p>
                </div>
              </motion.button>
            ))
          }
        </div>
      </section>

      {/* Trending */}
      <section className="px-4 sm:px-6">
        <SectionHeader icon={TrendingUp} title="Trending Now" actionLabel="View All" onAction={() => navigate('products', { sort: 'popular' })} />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {loading ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />) :
            trending.map(p => <ProductCard key={p.id} product={p} />)
          }
        </div>
      </section>

      {/* New Arrivals */}
      <section className="px-4 sm:px-6">
        <SectionHeader icon={Clock} title="New Arrivals" actionLabel="View All" onAction={() => navigate('products', { sort: 'newest' })} />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {loading ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />) :
            newArrivals.map(p => <ProductCard key={p.id} product={p} />)
          }
        </div>
      </section>

      {/* Promo Banner */}
      <section className="mx-4 sm:mx-6">
        <div className="bg-primary text-primary-foreground rounded-2xl p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/30 -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/20 translate-y-1/2 -translate-x-1/2" />
          </div>
          <div className="relative">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">Get 10% Off Your First Order</h2>
            <p className="text-sm sm:text-base opacity-90 mb-6">Use code <span className="font-bold bg-white/20 px-2 py-1 rounded">WELCOME10</span> at checkout</p>
            <Button variant="secondary" size="lg" className="rounded-full" onClick={() => navigate('products')}>
              Shop Now
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

export { ProductCard, ProductCardSkeleton };
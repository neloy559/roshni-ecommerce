'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import { getApiUrl } from '@/lib/api-config';
import {
  ArrowRight, ChevronLeft, ChevronRight, Sparkles, TrendingUp, Clock,
  Heart, Star, Truck, Shield, RefreshCw, CheckCircle, Quote, ShoppingBag,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Banner { id: string; image: string; title: string; subtitle: string; linkTarget: string; }
interface Category { id: string; name: string; slug: string; image: string; productCount: number; children: Category[]; }
interface Product {
  id: string; name: string; slug: string; price: number;
  discountPrice: number | null; images: string[]; effectivePrice: number;
  hasDiscount: boolean; discountPercent: number; isNew?: boolean;
}

// ─── ProductCard ─────────────────────────────────────────────────────────────
function ProductCard({ product }: { product: Product }) {
  const { navigate, addToCart, toggleWishlist, isWishlisted, addRecentlyViewed, addToast } = useAppStore();
  const wishlisted = isWishlisted(product.id);

  const handleCardClick = () => {
    addRecentlyViewed(product.slug);
    navigate('product', { slug: product.slug });
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      id: `cart-${Date.now()}`, productId: product.id, variantId: null, quantity: 1,
      name: product.name, slug: product.slug, image: product.images[0],
      price: product.effectivePrice, originalPrice: product.price,
      hasDiscount: product.hasDiscount, variant: null, stock: 99,
    });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
    addToast(wishlisted ? 'Removed from wishlist' : 'Added to wishlist', 'success');
  };

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.25 }} className="flex-shrink-0 w-[calc(50%-6px)] sm:w-auto sm:flex-shrink">
      <Card
        className="group border-0 shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden cursor-pointer bg-card"
        onClick={handleCardClick}
      >
        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
          {/* Shimmer overlay on hover */}
          <div className="absolute inset-0 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
          </div>

          <img
            src={product.images[0]} alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20">
            {product.isNew && (
              <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-2.5 py-0.5 text-[11px] font-semibold">
                New
              </Badge>
            )}
            {product.hasDiscount && (
              <Badge className="bg-primary text-primary-foreground rounded-full px-2.5 py-0.5 text-[11px] font-semibold">
                -{product.discountPercent}%
              </Badge>
            )}
          </div>

          {/* Wishlist button */}
          <button
            onClick={handleWishlist}
            className={cn(
              'absolute top-3 right-3 z-20 h-9 w-9 rounded-full flex items-center justify-center transition-all duration-200 shadow-md',
              wishlisted
                ? 'bg-primary text-white scale-100'
                : 'bg-card/90 text-muted-foreground hover:bg-card hover:text-primary scale-90 group-hover:scale-100',
            )}
          >
            <Heart className={cn('h-4 w-4', wishlisted && 'fill-current')} />
          </button>

          {/* Add to Bag slide-up with gradient */}
          <div className="absolute inset-x-0 bottom-0 z-20">
            <div className="h-28 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 rounded-full bg-white/95 dark:bg-card/95 text-foreground hover:bg-white dark:hover:bg-card shadow-lg backdrop-blur-sm font-medium gap-1.5 h-9"
                  onClick={handleAddToCart}
                >
                  <ShoppingBag className="h-3.5 w-3.5" />
                  Add to Bag
                </Button>
                <Button
                  size="icon"
                  className="h-9 w-9 rounded-full bg-white/95 dark:bg-card/95 hover:bg-white dark:hover:bg-card shadow-lg backdrop-blur-sm shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('product', { slug: product.slug });
                  }}
                >
                  <Eye className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <CardContent className="p-3 sm:p-4">
          <h3 className="text-[13px] font-medium truncate mb-1.5 text-foreground/90">{product.name}</h3>
          <div className="flex items-center gap-2">
            {product.hasDiscount ? (
              <>
                <span className="text-sm font-semibold text-primary">৳{product.effectivePrice.toLocaleString()}</span>
                <span className="text-xs text-muted-foreground line-through">৳{product.price.toLocaleString()}</span>
              </>
            ) : (
              <span className="text-sm font-semibold">৳{product.price.toLocaleString()}</span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── ProductCardSkeleton ─────────────────────────────────────────────────────
function ProductCardSkeleton() {
  return (
    <Card className="border-0 shadow-sm overflow-hidden flex-shrink-0 w-[calc(50%-6px)] sm:w-auto sm:flex-shrink animate-pulse">
      <div className="relative aspect-[3/4] w-full skeleton-shimmer">
        <Skeleton className="absolute inset-0 w-full h-full" />
      </div>
      <CardContent className="p-3 sm:p-4 space-y-2.5">
        <Skeleton className="h-4 w-3/4 rounded" />
        <Skeleton className="h-4 w-1/3 rounded" />
      </CardContent>
    </Card>
  );
}

// ─── Section Header with Decorative Underline ────────────────────────────────
function SectionHeader({ icon: Icon, title, actionLabel, onAction }: {
  icon: React.ElementType; title: string; actionLabel?: string; onAction?: () => void;
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2.5">
        <div className="relative">
          <Icon className="h-5 w-5 text-primary" />
          <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-amber-400 fill-amber-400" />
        </div>
        <div className="relative">
          <h2 className="text-xl sm:text-2xl font-bold">{title}</h2>
          <span className="absolute -bottom-1.5 left-0 h-[3px] w-12 rounded-full bg-gradient-to-r from-primary/60 to-transparent" />
        </div>
      </div>
      {actionLabel && onAction && (
        <Button variant="ghost" className="text-primary hover:text-primary/80 gap-1 group" onClick={onAction}>
          {actionLabel} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      )}
    </div>
  );
}

// ─── Trust Badges Data ───────────────────────────────────────────────────────
const trustBadges = [
  { icon: Truck, label: 'Free Shipping', desc: 'On orders over ৳5,000' },
  { icon: Shield, label: 'Secure Payment', desc: 'bKash, Nagad & more' },
  { icon: RefreshCw, label: 'Easy Returns', desc: '7-day return policy' },
  { icon: CheckCircle, label: '100% Authentic', desc: 'Genuine products only' },
];

// ─── Testimonials Data ───────────────────────────────────────────────────────
const testimonials = [
  {
    name: 'Farhana Akter',
    location: 'Dhaka',
    initials: 'FA',
    color: 'bg-rose-400',
    rating: 5,
    text: 'Roshni has the most beautiful handbags I\'ve found in Bangladesh! The quality is amazing and delivery was super fast. I\'m now a regular customer.',
  },
  {
    name: 'Nusrat Jahan',
    location: 'Chittagong',
    initials: 'NJ',
    color: 'bg-amber-400',
    rating: 5,
    text: 'I ordered heels for my sister\'s wedding and they were perfect! The customer service team helped me pick the right size. Highly recommend!',
  },
  {
    name: 'Taslima Begum',
    location: 'Sylhet',
    initials: 'TB',
    color: 'bg-emerald-400',
    rating: 4,
    text: 'Great collection of accessories at reasonable prices. The jewelry set I bought looks even better in person. Will definitely order again!',
  },
];

// ─── Brand Logos ─────────────────────────────────────────────────────────────
const brandNames = ['Aarong', 'Kay Kraft', 'Bibi Russell', 'Sadakalo', 'Rong'];

// ─── HomePage ────────────────────────────────────────────────────────────────
export function HomePage() {
  const { navigate } = useAppStore();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [trending, setTrending] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [bannerIdx, setBannerIdx] = useState(0);
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const trendingScrollRef = useRef<HTMLDivElement>(null);
  const newArrivalsScrollRef = useRef<HTMLDivElement>(null);

  // Fetch data
  useEffect(() => {
    Promise.all([
      fetch(getApiUrl('/api/banners')).then(r => r.json()),
      fetch(getApiUrl('/api/categories')).then(r => r.json()),
      fetch(getApiUrl('/api/products?sort=popular&limit=8')).then(r => r.json()),
      fetch(getApiUrl('/api/products?new=true&limit=8')).then(r => r.json()),
    ]).then(([b, c, t, n]) => {
      setBanners(b);
      setCategories(c);
      setTrending(t.products || []);
      setNewArrivals(n.products || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Auto-rotate banners
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => setBannerIdx(i => (i + 1) % banners.length), 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  // Auto-rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => setTestimonialIdx(i => (i + 1) % testimonials.length), 6000);
    return () => clearInterval(timer);
  }, []);

  const scroll = useCallback((ref: React.RefObject<HTMLDivElement | null>, dir: 'left' | 'right') => {
    if (!ref.current) return;
    const amount = dir === 'left' ? -240 : 240;
    ref.current.scrollBy({ left: amount, behavior: 'smooth' });
  }, []);

  const categoryIcons: Record<string, React.ElementType> = {
    shoes: ShoppingBag,
    handbags: Heart,
    accessories: Sparkles,
  };

  return (
    <div className="space-y-12 sm:space-y-16 pb-8">
      {/* ═══ 1. Hero Banner ═══ */}
      <section className="relative overflow-hidden rounded-2xl mx-0 sm:mx-4 sm:rounded-3xl aspect-[16/9] sm:aspect-[21/9] bg-muted">
        {banners.length > 0 ? (
          <div className="relative w-full h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={bannerIdx}
                initial={{ scale: 1.08, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="absolute inset-0"
              >
                <img
                  src={banners[bannerIdx]?.image}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </AnimatePresence>

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

            {/* Floating decorative shapes */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <motion.div
                className="absolute top-[15%] right-[10%] w-3 h-3 rounded-full bg-white/20"
                animate={{ y: [0, -12, 0], opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute top-[35%] right-[20%] w-2 h-2 rounded-full bg-white/30"
                animate={{ y: [0, -8, 0], opacity: [0.2, 0.6, 0.2] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              />
              <motion.div
                className="absolute bottom-[30%] right-[8%] w-4 h-4 rounded-full border border-white/20"
                animate={{ y: [0, -10, 0], rotate: [0, 180, 360] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div
                className="absolute top-[20%] right-[35%] w-1.5 h-1.5 rounded bg-white/25 rotate-45"
                animate={{ y: [0, -15, 0], opacity: [0.15, 0.5, 0.15] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              />
              <motion.div
                className="absolute bottom-[25%] right-[30%] w-2 h-2 rounded-full bg-primary/30"
                animate={{ y: [0, -10, 0], scale: [1, 1.3, 1] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
              />
            </div>

            {/* Text content */}
            <div className="absolute inset-0 flex items-center p-6 sm:p-12 lg:p-16">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="relative z-10"
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-3 leading-tight">
                    {banners[bannerIdx]?.title}
                  </h1>
                </motion.div>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="text-sm sm:text-lg text-white/80 mb-4 sm:mb-6 max-w-md"
                >
                  {banners[bannerIdx]?.subtitle}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                >
                  <Button
                    size="lg"
                    className="rounded-full bg-white text-black hover:bg-white/90 shadow-lg gap-2 text-sm sm:text-base px-6 sm:px-8"
                    onClick={() => navigate('products')}
                  >
                    Shop Now <ArrowRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              </motion.div>
            </div>

            {/* Banner dots */}
            {banners.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {banners.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setBannerIdx(i)}
                    className={cn('h-2 rounded-full transition-all duration-300', i === bannerIdx ? 'w-6 bg-white' : 'w-2 bg-white/50')}
                  />
                ))}
              </div>
            )}

            {/* Banner nav arrows */}
            {banners.length > 1 && (
              <>
                <button
                  onClick={() => setBannerIdx(i => (i - 1 + banners.length) % banners.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/40 transition-colors z-10"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setBannerIdx(i => (i + 1) % banners.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/40 transition-colors z-10"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        ) : (
          <Skeleton className="w-full h-full rounded-2xl" />
        )}
      </section>

      {/* ═══ 2. Category Grid ═══ */}
      <section className="px-4 sm:px-6">
        <SectionHeader icon={Sparkles} title="Shop by Category" />
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="aspect-[4/3] rounded-2xl" />)
            : categories.map((cat) => {
                const CatIcon = categoryIcons[cat.slug] || Sparkles;
                return (
                  <motion.button
                    key={cat.id}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate('products', { category: cat.slug })}
                    className="relative aspect-[4/3] rounded-2xl overflow-hidden group"
                  >
                    <img
                      src={cat.image} alt={cat.name}
                      className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                    />
                    {/* Overlay with pattern texture */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-all duration-300 group-hover:from-black/80" />
                    {/* Subtle pattern overlay */}
                    <div
                      className="absolute inset-0 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-300"
                      style={{
                        backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                        backgroundSize: '8px 8px',
                      }}
                    />
                    <div className="absolute bottom-0 inset-x-0 p-3 sm:p-4 text-left relative z-10">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <CatIcon className="h-3.5 w-3.5 text-white/90" />
                        <h3 className="text-sm sm:text-lg font-bold text-white">{cat.name}</h3>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/20 backdrop-blur-sm px-2 py-0.5 text-[11px] text-white/90 font-medium">
                        {cat.productCount} items
                      </span>
                    </div>
                  </motion.button>
                );
              })}
        </div>
      </section>

      {/* ═══ 3. Trust Badges ═══ */}
      <section className="px-4 sm:px-6">
        <div className="bg-muted/50 rounded-2xl p-6 sm:p-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {trustBadges.map((badge) => (
              <div key={badge.label} className="flex flex-col items-center text-center gap-2">
                <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center">
                  <badge.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{badge.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{badge.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 4. Trending Now ═══ */}
      <section className="px-4 sm:px-6">
        <SectionHeader
          icon={TrendingUp}
          title="Trending Now"
          actionLabel="View All"
          onAction={() => navigate('products', { sort: 'popular' })}
        />
        <div className="relative">
          {/* Mobile: horizontal scroll */}
          <div
            ref={trendingScrollRef}
            className="flex gap-3 sm:gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2 sm:hidden"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : trending.map(p => <ProductCard key={p.id} product={{ ...p, isNew: false }} />)}
          </div>
          {/* Mobile scroll arrows */}
          {!loading && trending.length > 2 && (
            <div className="flex gap-2 sm:hidden mt-3 justify-center">
              <button onClick={() => scroll(trendingScrollRef, 'left')} className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={() => scroll(trendingScrollRef, 'right')} className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
          {/* Desktop: grid */}
          <div className="hidden sm:grid sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : trending.map(p => <ProductCard key={p.id} product={{ ...p, isNew: false }} />)}
          </div>
        </div>
      </section>

      {/* ═══ 5. New Arrivals ═══ */}
      <section className="px-4 sm:px-6">
        <SectionHeader
          icon={Clock}
          title="New Arrivals"
          actionLabel="View All"
          onAction={() => navigate('products', { sort: 'newest' })}
        />
        <div className="relative">
          {/* Mobile: horizontal scroll */}
          <div
            ref={newArrivalsScrollRef}
            className="flex gap-3 sm:gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2 sm:hidden"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : newArrivals.map(p => <ProductCard key={p.id} product={{ ...p, isNew: true }} />)}
          </div>
          {!loading && newArrivals.length > 2 && (
            <div className="flex gap-2 sm:hidden mt-3 justify-center">
              <button onClick={() => scroll(newArrivalsScrollRef, 'left')} className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={() => scroll(newArrivalsScrollRef, 'right')} className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
          {/* Desktop: grid */}
          <div className="hidden sm:grid sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : newArrivals.map(p => <ProductCard key={p.id} product={{ ...p, isNew: true }} />)}
          </div>
        </div>
      </section>

      {/* ═══ 6. Testimonials ═══ */}
      <section className="px-4 sm:px-6">
        <SectionHeader icon={Star} title="What Our Customers Say" />
        <div className="relative max-w-2xl mx-auto">
          <Card className="border border-border/50 shadow-sm overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={testimonialIdx}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.4 }}
                >
                  {/* Quote icon */}
                  <Quote className="h-8 w-8 text-primary/20 mb-4" />

                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          'h-4 w-4',
                          i < (testimonials[testimonialIdx]?.rating ?? 5)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-gray-200',
                        )}
                      />
                    ))}
                  </div>

                  {/* Review text */}
                  <p className="text-sm sm:text-base text-foreground/80 leading-relaxed mb-6">
                    &ldquo;{testimonials[testimonialIdx]?.text}&rdquo;
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-bold',
                        testimonials[testimonialIdx]?.color,
                      )}
                    >
                      {testimonials[testimonialIdx]?.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{testimonials[testimonialIdx]?.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonials[testimonialIdx]?.location}</p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Dot indicators */}
          <div className="flex justify-center gap-2 mt-4">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setTestimonialIdx(i)}
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  i === testimonialIdx ? 'w-6 bg-primary' : 'w-2 bg-primary/25',
                )}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 7. Promo Banner ═══ */}
      <section className="mx-4 sm:mx-6">
        <div className="relative bg-primary text-primary-foreground rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center overflow-hidden">
          {/* SVG Pattern background */}
          <div className="absolute inset-0 opacity-[0.07]">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="promo-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <circle cx="20" cy="20" r="1.5" fill="white" />
                  <path d="M0 40L40 0M-10 10L10 -10M30 50L50 30" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#promo-pattern)" />
            </svg>
          </div>

          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent" />
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full bg-white/10 translate-y-1/2 -translate-x-1/2 blur-2xl" />

          <div className="relative z-10">
            <h2 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-3">Get 10% Off Your First Order</h2>
            <p className="text-sm sm:text-lg opacity-90 mb-6 sm:mb-8">
              Use code{' '}
              <span className="font-bold bg-white/20 px-3 py-1 rounded-lg text-sm sm:text-base">
                WELCOME10
              </span>{' '}
              at checkout
            </p>
            <motion.div
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="inline-block"
            >
              <Button
                variant="secondary"
                size="lg"
                className="rounded-full text-sm sm:text-base px-8 shadow-xl"
                onClick={() => navigate('products')}
              >
                Shop Now <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ 8. Brand Logos Strip ═══ */}
      <section className="px-4 sm:px-6">
        <p className="text-center text-xs text-muted-foreground uppercase tracking-widest mb-6 font-medium">
          Trusted By
        </p>
        <div
          className="flex gap-8 sm:gap-12 overflow-x-auto pb-2 justify-start sm:justify-center"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {brandNames.map((name) => (
            <span
              key={name}
              className="text-lg sm:text-xl font-bold text-muted-foreground/40 whitespace-nowrap select-none hover:text-muted-foreground/60 transition-colors duration-300"
            >
              {name}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}

export { ProductCard, ProductCardSkeleton };
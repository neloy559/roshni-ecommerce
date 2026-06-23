'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import { ProductCard } from './HomePage';
import {
  Heart, ShoppingBag, Minus, Plus, Check, Truck, RefreshCw, Shield,
  ChevronRight, Home, Ruler, Share2, ArrowRight, Package, Clock,
  Bell, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { getApiUrl } from '@/lib/api-config';

interface Product {
  id: string; name: string; slug: string; description: string;
  price: number; discountPrice: number | null; images: string[];
  effectivePrice: number; hasDiscount: boolean; discountPercent: number;
  stock: number; tags: string[];
  category: { name: string; slug: string };
  variants: Array<{ id: string; size: string; color: string; stock: number; sku: string; price: number | null }>;
}
type ProductType = Product;

/* ─── Size Guide Content ─────────────────────────────────── */
function SizeGuideContent({ isShoes }: { isShoes: boolean }) {
  if (isShoes) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-3 font-semibold">US</th>
              <th className="text-left py-2 px-3 font-semibold">EU</th>
              <th className="text-left py-2 px-3 font-semibold">UK</th>
              <th className="text-left py-2 px-3 font-semibold">BD</th>
              <th className="text-left py-2 px-3 font-semibold">Foot Length (cm)</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            {[
              ['5', '35', '2.5', '3', '21.5'],
              ['6', '36', '3.5', '4', '22.5'],
              ['7', '37', '4.5', '5', '23.5'],
              ['8', '38', '5.5', '6', '24.5'],
              ['9', '39', '6.5', '7', '25.5'],
              ['10', '40', '7.5', '8', '26.0'],
            ].map((row) => (
              <tr key={row[0]} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                {row.map((cell) => (
                  <td key={cell} className="py-2 px-3">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2 px-3 font-semibold">Size</th>
            <th className="text-left py-2 px-3 font-semibold">Bust (in)</th>
            <th className="text-left py-2 px-3 font-semibold">Waist (in)</th>
            <th className="text-left py-2 px-3 font-semibold">Hip (in)</th>
          </tr>
        </thead>
        <tbody className="text-muted-foreground">
          {[
            ['S', '32-34', '24-26', '34-36'],
            ['M', '34-36', '26-28', '36-38'],
            ['L', '36-38', '28-30', '38-40'],
            ['XL', '38-40', '30-32', '40-42'],
          ].map((row) => (
            <tr key={row[0]} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
              {row.map((cell) => (
                <td key={cell} className="py-2 px-3">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Confetti Particle ──────────────────────────────────── */
function ConfettiParticle({ index }: { index: number }) {
  const colors = ['#f43f5e', '#fb923c', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa'];
  const color = colors[index % colors.length];
  const startX = 50 + (Math.sin(index * 1.7) * 40);
  const endX = startX + (Math.cos(index * 2.3) * 60);
  const rotation = index * 137;

  return (
    <motion.div
      className="absolute w-1.5 h-1.5 rounded-full pointer-events-none"
      style={{ backgroundColor: color, left: `${startX}%`, top: '50%' }}
      initial={{ opacity: 1, y: 0, x: 0, scale: 1, rotate: 0 }}
      animate={{
        opacity: 0,
        y: [0, -30, -80, -120],
        x: [0, (endX - startX) * 0.3, (endX - startX) * 0.7, (endX - startX)],
        scale: [1, 1.5, 0.8, 0],
        rotate: [0, rotation, rotation * 2, rotation * 3],
      }}
      transition={{ duration: 0.8, ease: 'easeOut', delay: index * 0.02 }}
    />
  );
}

/* ─── Main Component ─────────────────────────────────────── */
export function ProductDetailPage() {
  const {
    pageParams, navigate, addToCart, user,
    toggleWishlist, isWishlisted, addRecentlyViewed, addToast,
  } = useAppStore();

  const [product, setProduct] = useState<ProductType | null>(null);
  const [related, setRelated] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'details' | 'shipping'>('description');
  const [previousPrice, setPreviousPrice] = useState<number | null>(null);
  const [priceAnimating, setPriceAnimating] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState('center center');
  const [isZooming, setIsZooming] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  const mainImageRef = useRef<HTMLDivElement>(null);
  const prevPriceRef = useRef<number | null>(null);

  // Fetch product data
  useEffect(() => {
    let cancelled = false;
    const slug = pageParams.slug;
    if (!slug) { navigate('products'); return; }

    fetch(getApiUrl(`/api/products/${slug}`).then(r => r.json()).then(data => {
      if (cancelled) return;
      setProduct(data.product);
      setRelated(data.related || []);
      if (data.product?.variants?.length > 0) {
        setSelectedVariant(data.product.variants[0].id);
      }
      setLoading(false);
    }).catch(() => { if (!cancelled) { navigate('products'); } });

    return () => { cancelled = true; };
  }, [pageParams.slug]);

  // Track recently viewed
  useEffect(() => {
    if (product?.slug) {
      addRecentlyViewed(product.slug);
    }
  }, [product?.slug]);

  // Handle variant price change animation
  const handleVariantSelect = useCallback((variantId: string) => {
    if (!product) return;
    const newVariant = product.variants.find(v => v.id === variantId);
    const currentPrice = selectedVariant
      ? (product.variants.find(v => v.id === selectedVariant)?.price || product.effectivePrice)
      : product.effectivePrice;
    const newPrice = newVariant?.price || product.effectivePrice;

    if (currentPrice !== newPrice) {
      setPreviousPrice(currentPrice);
      setPriceAnimating(true);
      setTimeout(() => setPriceAnimating(false), 500);
    }

    setSelectedVariant(variantId);
  }, [product, selectedVariant]);

  // Zoom handler
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!mainImageRef.current) return;
    const rect = mainImageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomOrigin(`${x}% ${y}%`);
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (window.innerWidth >= 768) setIsZooming(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsZooming(false);
  }, []);

  // Add to cart with confetti
  const handleAddToCart = useCallback(() => {
    if (!product) return;
    const variant = selectedVariant ? product.variants.find(v => v.id === selectedVariant) : null;
    addToCart({
      id: `cart-${Date.now()}`,
      productId: product.id,
      variantId: selectedVariant,
      quantity,
      name: product.name,
      slug: product.slug,
      image: product.images[selectedImage],
      price: variant?.price || product.effectivePrice,
      originalPrice: product.price,
      hasDiscount: product.hasDiscount,
      variant: variant ? { id: variant.id, size: variant.size, color: variant.color, stock: variant.stock } : null,
      stock: product.stock,
    });
    setAdded(true);
    setShowConfetti(true);
    setTimeout(() => setAdded(false), 2000);
    setTimeout(() => setShowConfetti(false), 1000);
  }, [product, selectedVariant, quantity, selectedImage, addToCart]);

  const handleBuyNow = useCallback(() => {
    handleAddToCart();
    setTimeout(() => navigate('checkout'), 300);
  }, [handleAddToCart, navigate]);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
    } else {
      const ta = document.createElement('textarea');
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    addToast('Link copied to clipboard!', 'success');
  }, [addToast]);

  const handleNotifyMe = useCallback(() => {
    addToast("We'll notify you when this product is available!", 'info');
  }, [addToast]);

  // Update prevPriceRef when product changes
  useEffect(() => {
    if (product) {
      prevPriceRef.current = product.effectivePrice;
    }
  }, [product]);

  // Loading skeleton
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="aspect-square rounded-2xl bg-muted animate-pulse" />
          <div className="space-y-4">
            <div className="h-4 w-48 bg-muted rounded animate-pulse" />
            <div className="h-8 w-3/4 bg-muted rounded animate-pulse" />
            <div className="h-6 w-1/3 bg-muted rounded animate-pulse" />
            <div className="h-4 w-full bg-muted rounded animate-pulse" />
            <div className="h-4 w-full bg-muted rounded animate-pulse" />
            <div className="h-12 w-full bg-muted rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const hasSizes = product.variants.some(v => v.size);
  const hasColors = product.variants.some(v => v.color);
  const selectedVariantObj = selectedVariant ? product.variants.find(v => v.id === selectedVariant) : null;
  const currentStock = selectedVariantObj?.stock || product.stock;
  const currentPrice = selectedVariantObj?.price || product.effectivePrice;
  const wishlisted = isWishlisted(product.id);
  const uniqueSizes = [...new Set(product.variants.filter(v => v.size).map(v => v.size))];
  const uniqueColors = [...new Set(product.variants.filter(v => v.color).map(v => v.color))];
  const isShoesCategory = product.category.name.toLowerCase().includes('shoe') || product.category.slug.toLowerCase().includes('shoe');
  const stockPercent = product.stock > 0 ? Math.min(100, (currentStock / Math.max(product.stock, 20)) * 100) : 0;

  const tabs: Array<{ key: 'description' | 'details' | 'shipping'; label: string }> = [
    { key: 'description', label: 'Description' },
    { key: 'details', label: 'Details' },
    { key: 'shipping', label: 'Shipping' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* ─── Breadcrumb ─────────────────────────────────── */}
      <nav className="flex items-center gap-1.5 text-sm mb-6" aria-label="Breadcrumb">
        <button
          onClick={() => navigate('home')}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Home className="h-3.5 w-3.5" />
          <span>Home</span>
        </button>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
        <button
          onClick={() => navigate('products', { category: product.category.slug })}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          {product.category.name}
        </button>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
        <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-none">
          {product.name}
        </span>
      </nav>

      <div className="grid md:grid-cols-2 gap-6 lg:gap-12">
        {/* ─── Image Gallery ────────────────────────────── */}
        <div className="space-y-3">
          {/* Main image with zoom */}
          <div
            ref={mainImageRef}
            className="relative aspect-square rounded-2xl overflow-hidden bg-muted cursor-zoom-in"
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <motion.img
              src={product.images[selectedImage]}
              alt={product.name}
              className="w-full h-full object-cover select-none"
              animate={{
                transformOrigin: zoomOrigin,
                scale: isZooming ? 2 : 1,
              }}
              transition={{ type: 'tween', duration: 0.15 }}
              drag={window.innerWidth < 768 ? 'x' : false}
              dragConstraints={mainImageRef}
              onDragEnd={(_e, info) => {
                if (info.offset.x < -50 && selectedImage < product.images.length - 1) {
                  setSelectedImage(i => i + 1);
                } else if (info.offset.x > 50 && selectedImage > 0) {
                  setSelectedImage(i => i - 1);
                }
              }}
            />
            {product.hasDiscount && (
              <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground rounded-full px-3 py-1 text-sm font-semibold shadow-lg">
                -{product.discountPercent}%
              </Badge>
            )}
            {product.images.length > 1 && (
              <>
                {selectedImage > 0 && (
                  <button
                    onClick={() => setSelectedImage(i => i - 1)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-md opacity-0 md:opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity sm:hidden"
                    aria-label="Previous image"
                  >
                    <ChevronRight className="h-4 w-4 rotate-180" />
                  </button>
                )}
                {selectedImage < product.images.length - 1 && (
                  <button
                    onClick={() => setSelectedImage(i => i + 1)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-md opacity-0 md:opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity sm:hidden"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </>
            )}
          </div>

          {/* Thumbnail strip */}
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={cn(
                    'w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all duration-200',
                    i === selectedImage
                      ? 'border-primary ring-2 ring-primary/30 shadow-md'
                      : 'border-transparent opacity-60 hover:opacity-100 hover:border-border'
                  )}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ─── Product Info ─────────────────────────────── */}
        <div className="flex flex-col">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <Badge variant="secondary" className="mb-3 rounded-full text-xs">
                {product.category.name}
              </Badge>
              <h1 className="text-2xl sm:text-3xl font-bold leading-tight">{product.name}</h1>
            </div>

            {/* Wishlist Button */}
            <motion.button
              onClick={() => toggleWishlist(product.id)}
              className={cn(
                'shrink-0 h-11 w-11 rounded-full border-2 flex items-center justify-center transition-colors mt-1',
                wishlisted
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/50 hover:text-primary'
              )}
              whileTap={{ scale: 0.85 }}
              aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <motion.div
                animate={wishlisted ? { scale: [1, 1.3, 1], rotate: [0, -10, 0] } : { scale: 1, rotate: 0 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
              >
                <Heart
                  className="h-5 w-5"
                  fill={wishlisted ? 'currentColor' : 'none'}
                  strokeWidth={wishlisted ? 0 : 2}
                />
              </motion.div>
            </motion.button>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mt-3 mb-4">
            <AnimatePresence mode="wait">
              <motion.span
                key={currentPrice}
                className="text-2xl sm:text-3xl font-bold text-primary"
                initial={priceAnimating ? { y: 10, opacity: 0 } : false}
                animate={{ y: 0, opacity: 1 }}
                exit={priceAnimating ? { y: -10, opacity: 0 } : false}
                transition={{ duration: 0.25 }}
              >
                ৳{currentPrice.toLocaleString()}
              </motion.span>
            </AnimatePresence>
            {product.hasDiscount && (
              <span className="text-lg text-muted-foreground line-through">
                ৳{product.price.toLocaleString()}
              </span>
            )}
            {product.hasDiscount && (
              <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs rounded-full">
                Save ৳{(product.price - product.effectivePrice).toLocaleString()}
              </Badge>
            )}
          </div>

          {/* Stock Status with progress bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {currentStock > 0 ? (
                  <>
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                    </span>
                    <span className="text-sm font-medium text-emerald-600">In Stock</span>
                    {currentStock < 10 && (
                      <span className="text-xs text-amber-600">— Order now, limited availability</span>
                    )}
                  </>
                ) : (
                  <>
                    <span className="h-2.5 w-2.5 rounded-full bg-destructive" />
                    <span className="text-sm font-medium text-destructive">Out of Stock</span>
                    <button
                      onClick={handleNotifyMe}
                      className="ml-2 text-xs font-medium text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
                    >
                      Notify Me
                    </button>
                  </>
                )}
              </div>
              {currentStock > 0 && currentStock <= 20 && (
                <span className="text-xs text-muted-foreground">{currentStock} left</span>
              )}
            </div>
            {currentStock > 0 && (
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <motion.div
                  className={cn(
                    'h-full rounded-full',
                    currentStock < 5 ? 'bg-red-400' : currentStock < 10 ? 'bg-amber-400' : 'bg-emerald-400'
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${stockPercent}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                />
              </div>
            )}
          </div>

          <Separator className="mb-6" />

          {/* ─── Size Selection ──────────────────────────── */}
          {hasSizes && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-sm font-semibold">Size</h3>
                {selectedVariantObj?.size && (
                  <span className="text-sm text-muted-foreground">
                    : {selectedVariantObj.size}
                  </span>
                )}
                <Dialog open={sizeGuideOpen} onOpenChange={setSizeGuideOpen}>
                  <DialogTrigger asChild>
                    <button className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors ml-auto">
                      <Ruler className="h-3.5 w-3.5" />
                      Size Guide
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Ruler className="h-5 w-5 text-primary" />
                        Size Guide — {isShoesCategory ? 'Shoes' : 'Bags'}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground mb-4">
                        {isShoesCategory
                          ? 'Measure your foot length in cm and find your corresponding size below.'
                          : 'Use the measurements below to find your perfect bag size.'}
                      </p>
                      <SizeGuideContent isShoes={isShoesCategory} />
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="flex flex-wrap gap-2">
                {uniqueSizes.map(size => {
                  const sizeVariants = product.variants.filter(v => v.size === size);
                  const isActive = selectedVariantObj?.size === size;
                  const allOutOfStock = sizeVariants.every(v => v.stock === 0);
                  return (
                    <button
                      key={size}
                      onClick={() => { if (!allOutOfStock) { const v = product.variants.find(vr => vr.size === size && vr.stock > 0); if (v) handleVariantSelect(v.id); } }}
                      disabled={allOutOfStock}
                      className={cn(
                        'h-11 px-5 rounded-full border-2 text-sm font-medium transition-all duration-200 relative',
                        isActive
                          ? 'border-primary bg-primary/10 text-primary shadow-sm'
                          : 'border-border hover:border-primary/50 text-foreground',
                        allOutOfStock && 'opacity-40 cursor-not-allowed line-through text-muted-foreground'
                      )}
                    >
                      {size}
                      {allOutOfStock && (
                        <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-muted-foreground text-[9px] text-background flex items-center justify-center">
                          ✕
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─── Color Selection ─────────────────────────── */}
          {hasColors && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-3">
                Color
                {selectedVariantObj?.color && (
                  <span className="font-normal text-muted-foreground">: {selectedVariantObj.color}</span>
                )}
              </h3>
              <div className="flex flex-wrap gap-2">
                {uniqueColors.map(color => {
                  const isActive = selectedVariantObj?.color === color;
                  const colorVariant = product.variants.find(v => v.color === color && v.stock > 0);
                  const isOutOfStock = !product.variants.some(v => v.color === color && v.stock > 0);
                  return (
                    <button
                      key={color}
                      onClick={() => { if (colorVariant) handleVariantSelect(colorVariant.id); }}
                      disabled={isOutOfStock}
                      className={cn(
                        'h-11 px-4 rounded-full border-2 text-sm font-medium transition-all duration-200 flex items-center gap-2',
                        isActive
                          ? 'border-primary bg-primary/10 text-primary shadow-sm'
                          : 'border-border hover:border-primary/50 text-foreground',
                        isOutOfStock && 'opacity-40 cursor-not-allowed line-through text-muted-foreground'
                      )}
                    >
                      <ColorSwatch colorName={color} />
                      {color}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─── Quantity ────────────────────────────────── */}
          {currentStock > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-3">Quantity</h3>
              <div className="inline-flex items-center border rounded-full">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="h-10 w-10 flex items-center justify-center hover:bg-accent rounded-l-full transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="h-10 w-12 flex items-center justify-center text-sm font-medium border-x tabular-nums">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                  className="h-10 w-10 flex items-center justify-center hover:bg-accent rounded-r-full transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* ─── CTA Buttons ────────────────────────────── */}
          <div className="space-y-3 mb-6">
            <div className="flex gap-3 relative">
              {/* Confetti overlay */}
              <AnimatePresence>
                {showConfetti && (
                  <>
                    {Array.from({ length: 12 }).map((_, i) => (
                      <ConfettiParticle key={i} index={i} />
                    ))}
                  </>
                )}
              </AnimatePresence>

              <Button
                size="lg"
                className="flex-1 rounded-full h-13 text-base font-semibold relative overflow-hidden"
                onClick={handleAddToCart}
                disabled={currentStock === 0}
              >
                <AnimatePresence mode="wait">
                  {added ? (
                    <motion.span
                      key="done"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center gap-2"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
                      >
                        <Check className="h-5 w-5" />
                      </motion.div>
                      Added to Bag!
                    </motion.span>
                  ) : (
                    <motion.span
                      key="add"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <ShoppingBag className="h-5 w-5" />
                      Add to Bag
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="rounded-full h-13 px-6 text-base font-semibold gap-2"
                onClick={handleBuyNow}
                disabled={currentStock === 0}
              >
                Buy Now
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Delivery estimate + share */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>Estimated delivery: 3-5 business days</span>
              </div>
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <Share2 className="h-3.5 w-3.5" />
                Share
              </button>
            </div>
          </div>

          <Separator className="mb-6" />

          {/* ─── Tabbed Product Info ────────────────────── */}
          <div className="mb-6">
            <div className="flex gap-0 border-b border-border" role="tablist">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  role="tab"
                  aria-selected={activeTab === tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'relative px-4 py-2.5 text-sm font-medium transition-colors',
                    activeTab === tab.key ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/80'
                  )}
                >
                  {tab.label}
                  {activeTab === tab.key && (
                    <motion.div
                      layoutId="product-tab-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="pt-4"
              >
                {activeTab === 'description' && (
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                )}

                {activeTab === 'details' && (
                  <div className="rounded-lg border overflow-hidden">
                    <table className="w-full text-sm">
                      <tbody>
                        <tr className="border-b border-border/50">
                          <td className="py-2.5 px-4 font-medium text-muted-foreground bg-muted/30 w-1/3">Category</td>
                          <td className="py-2.5 px-4">{product.category.name}</td>
                        </tr>
                        <tr className="border-b border-border/50">
                          <td className="py-2.5 px-4 font-medium text-muted-foreground bg-muted/30">Tags</td>
                          <td className="py-2.5 px-4">
                            <div className="flex flex-wrap gap-1.5">
                              {product.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs rounded-full">{tag}</Badge>
                              ))}
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-4 font-medium text-muted-foreground bg-muted/30">SKU</td>
                          <td className="py-2.5 px-4 font-mono text-xs">{product.variants[0]?.sku || 'N/A'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {activeTab === 'shipping' && (
                  <div className="space-y-4">
                    <div className="flex gap-3 p-3 rounded-lg bg-muted/30">
                      <Truck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Free Shipping</p>
                        <p className="text-xs text-muted-foreground">On all orders over ৳5,000</p>
                      </div>
                    </div>
                    <div className="flex gap-3 p-3 rounded-lg bg-muted/30">
                      <Package className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Inside Dhaka</p>
                        <p className="text-xs text-muted-foreground">3-5 business days delivery</p>
                      </div>
                    </div>
                    <div className="flex gap-3 p-3 rounded-lg bg-muted/30">
                      <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Outside Dhaka</p>
                        <p className="text-xs text-muted-foreground">5-7 business days delivery</p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <Separator className="mb-6" />

          {/* ─── Trust Features Bar ─────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-muted/40 rounded-xl border border-border/50">
            {[
              { icon: Truck, label: 'Free Delivery', desc: 'Orders over ৳5,000' },
              { icon: RefreshCw, label: 'Easy Returns', desc: '7-day return policy' },
              { icon: Shield, label: 'Authentic', desc: '100% genuine products' },
              { icon: Sparkles, label: 'Premium Quality', desc: 'Curated collection' },
            ].map(f => (
              <div key={f.label} className="flex items-start gap-2.5 sm:flex-col sm:items-center sm:text-center">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <f.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold leading-tight">{f.label}</p>
                  <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Related Products ──────────────────────────── */}
      {related.length > 0 && (
        <section className="mt-12 sm:mt-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 bg-border" />
            <h2 className="text-xl sm:text-2xl font-bold text-center whitespace-nowrap flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              You May Also Like
              <Sparkles className="h-5 w-5 text-primary" />
            </h2>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-none sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible">
            {related.map(p => (
              <div key={p.id} className="shrink-0 w-[calc(50%-6px)] sm:w-auto sm:shrink sm:grow">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* ─── Color Swatch Helper ─────────────────────────────── */
const COLOR_MAP: Record<string, string> = {
  'black': '#000000',
  'white': '#ffffff',
  'red': '#ef4444',
  'blue': '#3b82f6',
  'green': '#22c55e',
  'pink': '#ec4899',
  'purple': '#a855f7',
  'brown': '#92400e',
  'beige': '#d4b896',
  'cream': '#fffdd0',
  'nude': '#e8c4a0',
  'tan': '#d2b48c',
  'gold': '#d4a017',
  'silver': '#c0c0c0',
  'grey': '#6b7280',
  'gray': '#6b7280',
  'navy': '#1e3a5f',
  'burgundy': '#800020',
  'maroon': '#800000',
  'olive': '#808000',
  'teal': '#008080',
  'coral': '#ff7f50',
  'peach': '#ffcba4',
  'ivory': '#fffff0',
  'champagne': '#f7e7ce',
  'rose gold': '#b76e79',
};

function ColorSwatch({ colorName }: { colorName: string }) {
  const hex = COLOR_MAP[colorName.toLowerCase()] || '#94a3b8';
  const isLight = ['#ffffff', '#fffdd0', '#fffff0', '#ffcba4', '#f7e7ce', '#d4b896', '#e8c4a0', '#d2b48c'].includes(hex);

  return (
    <span
      className="h-4 w-4 rounded-full border border-border/50 shrink-0"
      style={{ backgroundColor: hex, boxShadow: isLight ? 'inset 0 0 0 1px rgba(0,0,0,0.1)' : undefined }}
    />
  );
}
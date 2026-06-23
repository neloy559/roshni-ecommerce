'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import {
  Heart, Trash2, ShoppingBag, ArrowRight, Eye, X, Sparkles,
  Clock, Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { getApiUrl } from '@/lib/api-config';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Product {
  id: string; name: string; slug: string; price: number;
  discountPrice: number | null; images: string[]; effectivePrice: number;
  hasDiscount: boolean; discountPercent: number; description?: string;
  stock?: number; isTrending?: boolean; isNewArrival?: boolean;
  category?: { name: string; slug: string };
  variants?: Array<{ id: string; size?: string; color?: string; stock: number; price?: number }>;
}

// ─── Quick View Modal ─────────────────────────────────────────────────────────
function QuickViewModal({ product, open, onClose }: {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}) {
  const { addToCart, navigate, toggleWishlist, isWishlisted, addToast } = useAppStore();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const wishlisted = isWishlisted(product.id);

  const handleAddToCart = () => {
    addToCart({
      id: crypto.randomUUID(), productId: product.id, variantId: null, quantity,
      name: product.name, slug: product.slug, image: product.images[0],
      price: product.effectivePrice, originalPrice: product.price,
      hasDiscount: product.hasDiscount, variant: null, stock: product.stock ?? 99,
    });
    addToast(`${product.name} added to bag!`, 'success');
    onClose();
  };

  const handleViewFull = () => {
    onClose();
    navigate('product', { slug: product.slug });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden gap-0 [&>button]:hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>{product.name}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image side */}
          <div className="relative aspect-[3/4] md:aspect-auto bg-muted overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.img
                key={selectedImage}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </AnimatePresence>
            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {product.images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={cn(
                      'h-2 w-2 rounded-full transition-all duration-200',
                      i === selectedImage ? 'bg-white w-5' : 'bg-white/50 hover:bg-white/75',
                    )}
                  />
                ))}
              </div>
            )}
            {/* Discount badge */}
            {product.hasDiscount && (
              <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground rounded-full text-[11px] font-semibold">
                -{product.discountPercent}%
              </Badge>
            )}
          </div>

          {/* Info side */}
          <div className="p-6 md:p-8 flex flex-col">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 h-8 w-8 rounded-full bg-muted flex items-center justify-center hover:bg-accent transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Category */}
            {product.category && (
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-medium">
                {product.category.name}
              </p>
            )}

            {/* Name */}
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3">{product.name}</h2>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-2xl font-bold text-primary">৳{product.effectivePrice.toLocaleString()}</span>
              {product.hasDiscount && (
                <span className="text-base text-muted-foreground line-through">৳{product.price.toLocaleString()}</span>
              )}
              {product.hasDiscount && (
                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 text-[11px] font-semibold">
                  Save ৳{(product.price - product.effectivePrice).toLocaleString()}
                </Badge>
              )}
            </div>

            {/* Description excerpt */}
            {product.description && (
              <p className="text-sm text-muted-foreground leading-relaxed mb-6 line-clamp-3">
                {product.description}
              </p>
            )}

            <Separator className="mb-6" />

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-medium text-foreground">Quantity</span>
              <div className="flex items-center border rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="h-9 w-9 flex items-center justify-center hover:bg-muted transition-colors text-sm"
                >
                  −
                </button>
                <span className="h-9 w-10 flex items-center justify-center text-sm font-medium border-x">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock ?? 99, quantity + 1))}
                  className="h-9 w-9 flex items-center justify-center hover:bg-muted transition-colors text-sm"
                >
                  +
                </button>
              </div>
              <span className="text-xs text-muted-foreground">
                {product.stock ?? 99} in stock
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 mb-4">
              <Button className="flex-1 rounded-full h-11 gap-2" onClick={handleAddToCart}>
                <ShoppingBag className="h-4 w-4" />
                Add to Bag
              </Button>
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  'h-11 w-11 rounded-full shrink-0',
                  wishlisted && 'bg-pink-50 border-pink-200 text-pink-600',
                )}
                onClick={() => {
                  toggleWishlist(product.id);
                  addToast(wishlisted ? 'Removed from wishlist' : 'Added to wishlist', 'success');
                }}
              >
                <Heart className={cn('h-4 w-4', wishlisted && 'fill-current')} />
              </Button>
            </div>

            <Button
              variant="ghost"
              className="w-full gap-2 text-muted-foreground hover:text-foreground"
              onClick={handleViewFull}
            >
              View Full Details <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── WishlistPage ─────────────────────────────────────────────────────────────
export function WishlistPage() {
  const { wishlistItems, navigate, toggleWishlist, addToCart, addToast, recentlyViewed } = useAppStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [recentlyViewedProducts, setRecentlyViewedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Fetch wishlist products
  useEffect(() => {
    if (wishlistItems.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    const fetchWishlist = async () => {
      try {
        const res = await fetch(getApiUrl('/api/products?limit=100'));
        const data = await res.json();
        const allProducts: Product[] = (data.products || []).map((p: Record<string, unknown>) => {
          const dp = p.discountPrice as number | null | undefined;
          return {
            ...p,
            effectivePrice: dp ?? (p.price as number),
            hasDiscount: dp != null && dp < (p.price as number),
            discountPercent: dp ? Math.round(((p.price as number) - dp) / (p.price as number) * 100) : 0,
          } as Product;
        });
        const filtered = allProducts.filter((p) => wishlistItems.includes(p.id));
        setProducts(filtered);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, [wishlistItems]);

  // Fetch recently viewed products
  useEffect(() => {
    if (recentlyViewed.length === 0) return;
    const fetchRecent = async () => {
      try {
        const res = await fetch(getApiUrl('/api/products?limit=100'));
        const data = await res.json();
        const allProducts: Product[] = (data.products || []).map((p: Record<string, unknown>) => {
          const dp = p.discountPrice as number | null | undefined;
          return {
            ...p,
            effectivePrice: dp ?? (p.price as number),
            hasDiscount: dp != null && dp < (p.price as number),
            discountPercent: dp ? Math.round(((p.price as number) - dp) / (p.price as number) * 100) : 0,
          } as Product;
        });
        const filtered = allProducts.filter((p) => recentlyViewed.includes(p.slug));
        setRecentlyViewedProducts(filtered);
      } catch {
        // silent
      }
    };
    fetchRecent();
  }, [recentlyViewed]);

  const handleRemoveFromWishlist = useCallback((productId: string) => {
    toggleWishlist(productId);
    addToast('Removed from wishlist', 'info');
  }, [toggleWishlist, addToast]);

  const handleMoveToCart = useCallback((product: Product) => {
    addToCart({
      id: crypto.randomUUID(), productId: product.id, variantId: null, quantity: 1,
      name: product.name, slug: product.slug, image: product.images[0],
      price: product.effectivePrice, originalPrice: product.price,
      hasDiscount: product.hasDiscount, variant: null, stock: product.stock ?? 99,
    });
    toggleWishlist(product.id);
    addToast(`${product.name} moved to bag!`, 'success');
  }, [addToCart, toggleWishlist, addToast]);

  const handleClearAll = useCallback(() => {
    wishlistItems.forEach((id) => toggleWishlist(id));
    addToast('Wishlist cleared', 'info');
  }, [wishlistItems, toggleWishlist, addToast]);

  return (
    <div className="min-h-[60vh]">
      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        open={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

      {/* Page Header */}
      <div className="bg-gradient-to-b from-primary/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <button onClick={() => navigate('home')} className="hover:text-foreground transition-colors">Home</button>
              <span>/</span>
              <span className="text-foreground font-medium">Wishlist</span>
            </nav>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center">
                  <Heart className="h-5 w-5 text-pink-500" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground">My Wishlist</h1>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {products.length} {products.length === 1 ? 'item' : 'items'} saved
                  </p>
                </div>
              </div>
              {products.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive gap-1.5"
                  onClick={handleClearAll}
                >
                  <Trash2 className="h-4 w-4" />
                  Clear All
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        {/* Wishlist Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="border-0 shadow-sm overflow-hidden">
                <Skeleton className="aspect-[3/4]" />
                <div className="p-3 sm:p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              </Card>
            ))}
          </div>
        ) : products.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16 sm:py-24"
          >
            <div className="relative inline-block mb-6">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Heart className="h-20 w-20 text-muted-foreground/30 mx-auto" />
              </motion.div>
              <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-3 w-3 text-primary" />
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-8 text-sm sm:text-base">
              Save your favorite items here so you can easily find them later.
              Start exploring our beautiful collection!
            </p>
            <Button
              size="lg"
              className="rounded-full gap-2 px-8"
              onClick={() => navigate('products')}
            >
              <ShoppingBag className="h-4 w-4" />
              Start Shopping
            </Button>
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
          >
            <AnimatePresence>
              {products.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="group border-0 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden bg-card">
                    <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />

                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20">
                        {product.hasDiscount && (
                          <Badge className="bg-primary text-primary-foreground rounded-full px-2.5 py-0.5 text-[11px] font-semibold">
                            -{product.discountPercent}%
                          </Badge>
                        )}
                      </div>

                      {/* Action buttons overlay */}
                      <div className="absolute inset-x-0 bottom-0 z-20">
                        <div className="h-20 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                        <div className="absolute inset-x-0 bottom-0 p-2.5 flex gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
                          <Button
                            size="sm"
                            className="flex-1 rounded-full bg-card/95 text-foreground hover:bg-card shadow-lg backdrop-blur-sm font-medium gap-1.5 text-[12px] h-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveToCart(product);
                            }}
                          >
                            <ShoppingBag className="h-3 w-3" />
                            Move to Bag
                          </Button>
                          <Button
                            size="icon"
                            className="h-8 w-8 rounded-full bg-card/95 hover:bg-card shadow-lg backdrop-blur-sm shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              setQuickViewProduct(product);
                            }}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* Remove button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFromWishlist(product.id);
                        }}
                        className="absolute top-3 right-3 z-20 h-8 w-8 rounded-full bg-card/90 flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-950/50 hover:text-red-500 transition-all duration-200 shadow-sm group/remove"
                        aria-label="Remove from wishlist"
                      >
                        <X className="h-3.5 w-3.5 group-hover/remove:rotate-90 transition-transform duration-200" />
                      </button>
                    </div>

                    <CardContent
                      className="p-3 sm:p-4 cursor-pointer"
                      onClick={() => navigate('product', { slug: product.slug })}
                    >
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
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Recently Viewed Section */}
        {recentlyViewedProducts.length > 0 && (
          <div className="mt-16">
            <Separator className="mb-10" />
            <div className="flex items-center gap-2.5 mb-6">
              <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                <Clock className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-foreground">Recently Viewed</h2>
                <p className="text-xs text-muted-foreground">Products you&apos;ve been browsing</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {recentlyViewedProducts.map((product) => (
                <Card
                  key={product.id}
                  className="group border-0 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer bg-card"
                  onClick={() => navigate('product', { slug: product.slug })}
                >
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    {product.hasDiscount && (
                      <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-[10px] font-semibold">
                        -{product.discountPercent}%
                      </Badge>
                    )}
                  </div>
                  <div className="p-2.5">
                    <h4 className="text-xs font-medium truncate text-foreground/90 mb-1">{product.name}</h4>
                    <span className="text-xs font-semibold text-primary">৳{product.effectivePrice.toLocaleString()}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Continue Shopping CTA */}
        {products.length > 0 && (
          <div className="mt-12 text-center">
            <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-muted/50 rounded-2xl p-6 sm:p-8">
              <Package className="h-8 w-8 text-primary shrink-0" />
              <div className="text-center sm:text-left">
                <p className="font-semibold text-foreground mb-1">Looking for more?</p>
                <p className="text-sm text-muted-foreground">Discover our latest collections and trending items.</p>
              </div>
              <Button
                className="rounded-full gap-2 mt-2 sm:mt-0"
                onClick={() => navigate('products')}
              >
                Browse All Products <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
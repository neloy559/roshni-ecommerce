'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { ProductCard } from './HomePage';
import { ChevronLeft, Heart, ShoppingBag, Minus, Plus, Check, Truck, RefreshCw, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface Product { id: string; name: string; slug: string; description: string; price: number; discountPrice: number | null; images: string[]; effectivePrice: number; hasDiscount: boolean; discountPercent: number; stock: number; tags: string[]; category: { name: string; slug: string }; variants: Array<{ id: string; size: string; color: string; stock: number; sku: string; price: number | null }>; }
type ProductType = Product;

export function ProductDetailPage() {
  const { pageParams, navigate, addToCart, user, setUser } = useAppStore();
  const [product, setProduct] = useState<ProductType | null>(null);
  const [related, setRelated] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const slug = pageParams.slug;
    if (!slug) { navigate('products'); return; }

    fetch(`/api/products/${slug}`).then(r => r.json()).then(data => {
      if (cancelled) return;
      setProduct(data.product);
      setRelated(data.related || []);
      if (data.product?.variants?.length > 0) setSelectedVariant(data.product.variants[0].id);
      setLoading(false);
    }).catch(() => { if (!cancelled) { navigate('products'); } });

    return () => { cancelled = true; };
  }, [pageParams.slug]);

  const handleAddToCart = () => {
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
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    setTimeout(() => navigate('checkout'), 300);
  };

  if (loading) return <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8"><div className="grid md:grid-cols-2 gap-8"><div className="aspect-square rounded-2xl bg-muted animate-pulse" /><div className="space-y-4"><div className="h-8 w-3/4 bg-muted rounded animate-pulse" /><div className="h-6 w-1/3 bg-muted rounded animate-pulse" /><div className="h-4 w-full bg-muted rounded animate-pulse" /><div className="h-4 w-full bg-muted rounded animate-pulse" /></div></div></div>;
  if (!product) return null;

  const hasSizes = product.variants.some(v => v.size);
  const hasColors = product.variants.some(v => v.color);
  const selectedVariantObj = selectedVariant ? product.variants.find(v => v.id === selectedVariant) : null;
  const currentStock = selectedVariantObj?.stock || product.stock;
  const currentPrice = selectedVariantObj?.price || product.effectivePrice;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Breadcrumb */}
      <button onClick={() => navigate('products', { category: product.category.slug })} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 group">
        <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back to {product.category.name}
      </button>

      <div className="grid md:grid-cols-2 gap-6 lg:gap-12">
        {/* Image Gallery */}
        <div className="space-y-3">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted">
            <img src={product.images[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
            {product.hasDiscount && (
              <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground rounded-full px-3 py-1 text-sm font-semibold">
                -{product.discountPercent}%
              </Badge>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(i)} className={cn('w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-colors', i === selectedImage ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100')}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <Badge variant="secondary" className="w-fit mb-3 rounded-full text-xs">{product.category.name}</Badge>
          <h1 className="text-2xl sm:text-3xl font-bold mb-3">{product.name}</h1>

          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-2xl sm:text-3xl font-bold text-primary">৳{currentPrice.toLocaleString()}</span>
            {product.hasDiscount && (
              <span className="text-lg text-muted-foreground line-through">৳{product.price.toLocaleString()}</span>
            )}
          </div>

          {/* Stock status */}
          <div className="flex items-center gap-2 mb-6">
            {currentStock > 5 ? (
              <span className="flex items-center gap-1 text-sm text-emerald-600"><span className="h-2 w-2 rounded-full bg-emerald-500" /> In Stock</span>
            ) : currentStock > 0 ? (
              <span className="flex items-center gap-1 text-sm text-amber-600"><span className="h-2 w-2 rounded-full bg-amber-500" /> Only {currentStock} left</span>
            ) : (
              <span className="flex items-center gap-1 text-sm text-destructive"><span className="h-2 w-2 rounded-full bg-destructive" /> Out of Stock</span>
            )}
          </div>

          <Separator className="mb-6" />

          {/* Variant Selection - Sizes */}
          {hasSizes && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-3">Size</h3>
              <div className="flex flex-wrap gap-2">
                {[...new Set(product.variants.filter(v => v.size).map(v => v.size))].map(size => {
                  const variant = product.variants.find(v => v.size === size && v.id === selectedVariant);
                  return (
                    <button
                      key={size}
                      onClick={() => { const v = product.variants.find(vr => vr.size === size); if (v) setSelectedVariant(v.id); }}
                      className={cn('h-10 px-4 rounded-full border-2 text-sm font-medium transition-all', variant ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/50')}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Variant Selection - Colors */}
          {hasColors && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-3">Color</h3>
              <div className="flex flex-wrap gap-2">
                {[...new Set(product.variants.filter(v => v.color).map(v => v.color))].map(color => {
                  const variant = product.variants.find(v => v.color === color && v.id === selectedVariant);
                  return (
                    <button
                      key={color}
                      onClick={() => { const v = product.variants.find(vr => vr.color === color); if (v) setSelectedVariant(v.id); }}
                      className={cn('h-10 px-4 rounded-full border-2 text-sm font-medium transition-all', variant ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/50')}
                    >
                      {color}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-3">Quantity</h3>
            <div className="inline-flex items-center border rounded-full">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="h-10 w-10 flex items-center justify-center hover:bg-accent rounded-l-full"><Minus className="h-4 w-4" /></button>
              <span className="h-10 w-12 flex items-center justify-center text-sm font-medium border-x">{quantity}</span>
              <button onClick={() => setQuantity(Math.min(currentStock, quantity + 1))} className="h-10 w-10 flex items-center justify-center hover:bg-accent rounded-r-full"><Plus className="h-4 w-4" /></button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <Button size="lg" className="flex-1 rounded-full h-12" onClick={handleAddToCart} disabled={currentStock === 0}>
              <AnimatePresence mode="wait">
                {added ? <motion.span key="done" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2"><Check className="h-4 w-4" /> Added!</motion.span> :
                <motion.span key="add" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2"><ShoppingBag className="h-4 w-4" /> Add to Bag</motion.span>}
              </AnimatePresence>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full h-12 px-6" onClick={handleBuyNow} disabled={currentStock === 0}>
              Buy Now
            </Button>
          </div>

          <Separator className="mb-6" />

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-2">Description</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-accent/50 rounded-xl">
            {[
              { icon: Truck, label: 'Free Delivery', desc: 'Over ৳5,000' },
              { icon: RefreshCw, label: 'Easy Returns', desc: '7 days' },
              { icon: Shield, label: 'Authentic', desc: '100% genuine' },
            ].map(f => (
              <div key={f.label} className="text-center">
                <f.icon className="h-5 w-5 mx-auto mb-1 text-primary" />
                <p className="text-xs font-medium">{f.label}</p>
                <p className="text-[10px] text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="mt-12 sm:mt-16">
          <h2 className="text-xl font-bold mb-6">You May Also Like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
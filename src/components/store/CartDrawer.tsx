'use client';

import { useRef } from 'react';
import { useAppStore } from '@/lib/store';
import { X, Minus, Plus, ShoppingBag, Gift, Truck, Package, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const FREE_SHIPPING_THRESHOLD = 5000;
const SHIPPING_COST = 120;

const PLACEHOLDER_PRODUCTS = [
  { id: 'rec-1', name: 'Rose Gold Chain Necklace', price: 850, image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=200&h=200&fit=crop' },
  { id: 'rec-2', name: 'Beige Crossbody Bag', price: 1650, image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=200&h=200&fit=crop' },
];

export function CartDrawer() {
  const { cartItems, cartCount, cartSubtotal, updateCartQuantity, removeFromCart, cartDrawerOpen, setCartDrawerOpen, navigate, addToast } = useAppStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  const shippingProgress = Math.min((cartSubtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const remainingForFree = FREE_SHIPPING_THRESHOLD - cartSubtotal;
  const hasFreeShipping = cartSubtotal >= FREE_SHIPPING_THRESHOLD;

  return (
    <Sheet open={cartDrawerOpen} onOpenChange={setCartDrawerOpen}>
      <SheetContent side="right" className="w-full sm:w-[420px] p-0 flex flex-col bg-background">
        {/* Header */}
        <SheetHeader className="px-5 pt-5 pb-4 border-b flex-shrink-0 bg-background">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2.5">
              <div className="relative">
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </div>
              <span className="text-base font-semibold">Shopping Bag</span>
              {cartCount > 0 && (
                <span className="text-xs text-muted-foreground font-normal">({cartCount} {cartCount === 1 ? 'item' : 'items'})</span>
              )}
            </SheetTitle>
          </div>
        </SheetHeader>

        {cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="relative mb-6">
              <div className="h-28 w-28 rounded-full bg-muted flex items-center justify-center">
                <ShoppingBag className="h-12 w-12 text-muted-foreground/30" />
              </div>
              <div className="absolute -bottom-1 -right-1 h-10 w-10 rounded-full bg-accent flex items-center justify-center">
                <Heart className="h-5 w-5 text-muted-foreground/40" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-1.5">Your bag is empty</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-[200px]">
              Discover our latest collections and add your favorites
            </p>
            <Button
              onClick={() => { setCartDrawerOpen(false); navigate('products'); }}
              className="rounded-full px-6"
            >
              Start Shopping
            </Button>
          </div>
        ) : (
          <>
            {/* Free Shipping Progress */}
            <div className="px-5 py-3 bg-accent/30 border-b flex-shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <Truck className={cn('h-3.5 w-3.5', hasFreeShipping ? 'text-emerald-600' : 'text-muted-foreground')} />
                {hasFreeShipping ? (
                  <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                    🎉 You&apos;ve earned free shipping!
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Add <span className="font-semibold text-foreground">৳{remainingForFree.toLocaleString()}</span> more for free shipping!
                  </span>
                )}
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${shippingProgress}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className={cn(
                    'h-full rounded-full',
                    hasFreeShipping
                      ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                      : 'bg-gradient-to-r from-rose-400 via-pink-400 to-emerald-400'
                  )}
                />
              </div>
            </div>

            {/* Cart Items */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              <AnimatePresence initial={false}>
                {cartItems.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: 30, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -60, scale: 0.9, transition: { duration: 0.25 } }}
                    transition={{ duration: 0.3 }}
                    className="group relative flex gap-3.5 bg-card border rounded-2xl p-3 hover:shadow-sm transition-shadow"
                  >
                    <div
                      className="relative w-[72px] h-[88px] rounded-xl overflow-hidden bg-muted shrink-0 cursor-pointer"
                      onClick={() => { setCartDrawerOpen(false); navigate('product', { slug: item.slug }); }}
                    >
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                      {item.hasDiscount && (
                        <div className="absolute top-1 left-1 bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                          -{Math.round((1 - item.price / item.originalPrice) * 100)}%
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="text-sm font-medium truncate leading-snug">{item.name}</h4>
                          <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5">
                            {item.variant?.size && <p className="text-[11px] text-muted-foreground">Size: {item.variant.size}</p>}
                            {item.variant?.color && <p className="text-[11px] text-muted-foreground">Color: {item.variant.color}</p>}
                          </div>
                        </div>
                        <motion.button
                          whileTap={{ scale: 0.85 }}
                          onClick={() => removeFromCart(item.id)}
                          className="text-muted-foreground hover:text-destructive shrink-0 p-0.5 rounded-full hover:bg-destructive/10 transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                        </motion.button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center border rounded-full overflow-hidden">
                          <button
                            onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                            className="h-7 w-7 flex items-center justify-center hover:bg-accent transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="h-7 w-8 flex items-center justify-center text-xs font-semibold border-x">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                            className="h-7 w-7 flex items-center justify-center hover:bg-accent transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="text-right">
                          {item.hasDiscount && (
                            <span className="text-[11px] text-muted-foreground line-through block">৳{item.originalPrice.toLocaleString()}</span>
                          )}
                          <p className="text-sm font-bold">৳{(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* You Might Also Like */}
              <div className="mt-6 pt-4 border-t">
                <div className="flex items-center gap-1.5 mb-3">
                  <Gift className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">You might also like</span>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory" style={{ scrollbarWidth: 'none' }}>
                  {PLACEHOLDER_PRODUCTS.map((p) => (
                    <motion.button
                      key={p.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { setCartDrawerOpen(false); navigate('products'); }}
                      className="shrink-0 w-40 snap-start rounded-xl border bg-card overflow-hidden text-left group"
                    >
                      <div className="aspect-square overflow-hidden bg-muted">
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      </div>
                      <div className="p-2.5">
                        <p className="text-xs font-medium truncate">{p.name}</p>
                        <p className="text-xs font-bold text-primary mt-0.5">৳{p.price.toLocaleString()}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t p-5 flex-shrink-0 space-y-3 bg-background">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Subtotal</span>
                  <span className="text-base font-bold">৳{cartSubtotal.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Truck className="h-3 w-3" />
                    Shipping
                  </span>
                  <span className={cn('text-xs font-medium', hasFreeShipping ? 'text-emerald-600' : 'text-muted-foreground')}>
                    {hasFreeShipping ? 'Free' : `৳${SHIPPING_COST}`}
                  </span>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Estimated Total</span>
                <span className="text-lg font-bold">
                  ৳{(cartSubtotal + (hasFreeShipping ? 0 : SHIPPING_COST)).toLocaleString()}
                </span>
              </div>
              <Button
                onClick={() => { setCartDrawerOpen(false); navigate('cart'); }}
                className="w-full rounded-full h-11 font-semibold"
              >
                <Package className="h-4 w-4 mr-2" />
                View Bag & Checkout
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
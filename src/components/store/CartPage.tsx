'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Trash2, ShoppingBag, Tag, ArrowRight, ArrowLeft, Minus, Plus, ShieldCheck, ChevronDown, ChevronUp, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getApiUrl } from '@/lib/api-config';

export function CartPage() {
  const { cartItems, cartSubtotal, updateCartQuantity, removeFromCart, clearCart, navigate } = useAppStore();
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoOpen, setPromoOpen] = useState(false);

  const shippingCost = cartSubtotal >= 5000 ? 0 : 120;
  const total = cartSubtotal - promoDiscount + shippingCost;

  // Calculate total savings from discounted items
  const totalSavings = cartItems.reduce((sum, item) => {
    if (item.hasDiscount) {
      return sum + (item.originalPrice - item.price) * item.quantity;
    }
    return sum;
  }, 0);

  const applyPromo = async () => {
    setPromoLoading(true);
    setPromoError('');
    try {
      const res = await fetch(getApiUrl('/api/promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode, subtotal: cartSubtotal }),
      });
      const data = await res.json();
      if (data.valid) {
        setPromoDiscount(data.discount);
      } else {
        setPromoError(data.error || 'Invalid code');
      }
    } catch { setPromoError('Failed to apply'); }
    setPromoLoading(false);
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="relative inline-block mb-6">
          <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mx-auto">
            <ShoppingBag className="h-10 w-10 text-muted-foreground/25" />
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-2">Your bag is empty</h1>
        <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
          Looks like you haven&apos;t added anything yet. Explore our collection to find something you love!
        </p>
        <Button className="rounded-full px-8 h-11" onClick={() => navigate('products')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Page Title */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <ShoppingBag className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Shopping Bag</h1>
          <p className="text-sm text-muted-foreground">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}</p>
        </div>
      </div>

      {/* Savings Banner */}
      {totalSavings > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-3"
        >
          <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0">
            <Tag className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
            You&apos;re saving <span className="font-bold">৳{totalSavings.toLocaleString()}</span> on this order!
          </p>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence>
            {cartItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0, transition: { duration: 0.25 } }}
                className="group flex gap-4 sm:gap-5 p-4 bg-card border rounded-2xl hover:shadow-md transition-shadow"
              >
                <div
                  className="relative w-24 h-28 sm:w-28 sm:h-32 rounded-xl overflow-hidden bg-muted shrink-0 cursor-pointer"
                  onClick={() => navigate('product', { slug: item.slug })}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  {item.hasDiscount && (
                    <div className="absolute top-1.5 left-1.5 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                      -{Math.round((1 - item.price / item.originalPrice) * 100)}%
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3
                          className="font-medium cursor-pointer hover:text-primary transition-colors line-clamp-2"
                          onClick={() => navigate('product', { slug: item.slug })}
                        >
                          {item.name}
                        </h3>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                          {item.variant?.size && (
                            <span className="text-xs text-muted-foreground bg-accent/70 px-2 py-0.5 rounded-md">Size: {item.variant.size}</span>
                          )}
                          {item.variant?.color && (
                            <span className="text-xs text-muted-foreground bg-accent/70 px-2 py-0.5 rounded-md">Color: {item.variant.color}</span>
                          )}
                        </div>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeFromCart(item.id)}
                        className="text-muted-foreground hover:text-destructive p-1.5 rounded-lg hover:bg-destructive/10 transition-colors shrink-0"
                        title="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </div>

                  <div className="flex items-end justify-between mt-2">
                    <div className="flex items-center border rounded-full overflow-hidden shadow-sm">
                      <button
                        onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                        className="h-9 w-9 flex items-center justify-center hover:bg-accent transition-colors"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="h-9 w-12 flex items-center justify-center text-sm font-semibold border-x bg-accent/30">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                        className="h-9 w-9 flex items-center justify-center hover:bg-accent transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="text-right">
                      {item.hasDiscount && (
                        <p className="text-xs text-muted-foreground line-through mb-0.5">৳{item.originalPrice.toLocaleString()}</p>
                      )}
                      <p className="font-bold text-lg">৳{(item.price * item.quantity).toLocaleString()}</p>
                      {item.hasDiscount && item.quantity > 1 && (
                        <p className="text-[11px] text-emerald-600 font-medium">
                          Save ৳{((item.originalPrice - item.price) * item.quantity).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Continue Shopping */}
          <button
            onClick={() => navigate('products')}
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mt-2 group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Continue Shopping
          </button>
        </div>

        {/* Order Summary - Desktop: Sidebar, Mobile: Below items */}
        <div className="lg:col-span-1">
          <Card className="lg:sticky lg:top-28 rounded-2xl border-2 overflow-hidden">
            <CardHeader className="bg-accent/30 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Tag className="h-3.5 w-3.5 text-primary" />
                </div>
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              {/* Item Breakdown */}
              <div className="space-y-2.5 max-h-40 overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-2.5">
                    <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-muted shrink-0">
                      <img src={item.image} alt="" className="w-full h-full object-cover" />
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[9px] font-bold text-primary-foreground flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate flex-1">{item.name}</p>
                    <p className="text-xs font-semibold shrink-0">৳{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal ({cartItems.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span className="font-medium">৳{cartSubtotal.toLocaleString()}</span>
                </div>
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      Discount
                    </span>
                    <span className="font-medium">-৳{promoDiscount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Truck className="h-3 w-3" />
                    Shipping
                  </span>
                  {shippingCost === 0 ? (
                    <span className="text-emerald-600 font-semibold">Free</span>
                  ) : (
                    <span className="font-medium">৳{shippingCost}</span>
                  )}
                </div>
              </div>

              <Separator />

              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>৳{total.toLocaleString()}</span>
              </div>

              {/* Promo Code Toggle */}
              <div>
                <button
                  type="button"
                  onClick={() => setPromoOpen(!promoOpen)}
                  className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-full"
                >
                  {promoOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  {promoDiscount > 0 ? 'Promo code applied ✓' : 'Have a promo code?'}
                </button>
                <AnimatePresence>
                  {promoOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="flex gap-2 pt-2">
                        <div className="relative flex-1">
                          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Enter promo code"
                            value={promoCode}
                            onChange={e => { setPromoCode(e.target.value); setPromoError(''); }}
                            className="pl-9 rounded-xl h-10 border-2"
                            disabled={promoDiscount > 0}
                          />
                        </div>
                        <Button
                          variant="outline"
                          className="rounded-xl px-4 h-10"
                          onClick={applyPromo}
                          disabled={promoLoading || !promoCode || promoDiscount > 0}
                        >
                          Apply
                        </Button>
                      </div>
                      {promoError && <p className="text-xs text-destructive mt-1.5">{promoError}</p>}
                      {promoDiscount > 0 && (
                        <p className="text-xs text-emerald-600 mt-1.5 font-medium">
                          🎉 Code applied! You save ৳{promoDiscount.toLocaleString()}
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Secure Checkout Badge */}
              <div className="flex items-center justify-center gap-1.5 py-1">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-medium text-muted-foreground">Secure Checkout</span>
              </div>

              <Button
                className="w-full rounded-full h-12 text-sm font-bold"
                size="lg"
                onClick={() => navigate('checkout')}
              >
                Proceed to Checkout
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
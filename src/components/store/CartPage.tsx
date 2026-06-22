'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Trash2, ShoppingBag, Tag, ArrowRight, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';

export function CartPage() {
  const { cartItems, cartSubtotal, updateCartQuantity, removeFromCart, clearCart, navigate } = useAppStore();
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);

  const shippingCost = cartSubtotal >= 5000 ? 0 : 120;
  const total = cartSubtotal - promoDiscount + shippingCost;

  const applyPromo = async () => {
    setPromoLoading(true);
    setPromoError('');
    try {
      const res = await fetch('/api/promo', {
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
        <ShoppingBag className="h-20 w-20 text-muted-foreground/20 mx-auto mb-6" />
        <h1 className="text-2xl font-bold mb-2">Your bag is empty</h1>
        <p className="text-muted-foreground mb-6">Looks like you haven&apos;t added anything yet</p>
        <Button className="rounded-full px-8" onClick={() => navigate('products')}>Continue Shopping</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Shopping Bag ({cartItems.length} items)</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence>
            {cartItems.map((item) => (
              <motion.div key={item.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0 }} className="flex gap-4 p-4 bg-card border rounded-xl">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden bg-muted shrink-0 cursor-pointer" onClick={() => navigate('product', { slug: item.slug })}>
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-medium cursor-pointer hover:text-primary" onClick={() => navigate('product', { slug: item.slug })}>{item.name}</h3>
                      {item.variant?.size && <p className="text-xs text-muted-foreground mt-0.5">Size: {item.variant.size}</p>}
                      {item.variant?.color && <p className="text-xs text-muted-foreground mt-0.5">Color: {item.variant.color}</p>}
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-muted-foreground hover:text-destructive p-1"><Trash2 className="h-4 w-4" /></button>
                  </div>
                  <div className="flex items-end justify-between mt-3">
                    <div className="flex items-center border rounded-full">
                      <button onClick={() => updateCartQuantity(item.id, item.quantity - 1)} className="h-8 w-8 flex items-center justify-center hover:bg-accent rounded-l-full"><Minus className="h-3 w-3" /></button>
                      <span className="h-8 w-10 flex items-center justify-center text-sm font-medium border-x">{item.quantity}</span>
                      <button onClick={() => updateCartQuantity(item.id, item.quantity + 1)} className="h-8 w-8 flex items-center justify-center hover:bg-accent rounded-r-full"><Plus className="h-3 w-3" /></button>
                    </div>
                    <div className="text-right">
                      {item.hasDiscount && <p className="text-xs text-muted-foreground line-through">৳{item.originalPrice.toLocaleString()}</p>}
                      <p className="font-bold">৳{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-28">
            <CardHeader><CardTitle className="text-lg">Order Summary</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>৳{cartSubtotal.toLocaleString()}</span></div>
              {promoDiscount > 0 && (
                <div className="flex justify-between text-sm text-emerald-600"><span>Discount</span><span>-৳{promoDiscount.toLocaleString()}</span></div>
              )}
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Shipping</span><span>{shippingCost === 0 ? <span className="text-emerald-600 font-medium">Free</span> : `৳${shippingCost}`}</span></div>
              <Separator />
              <div className="flex justify-between font-bold text-lg"><span>Total</span><span>৳{total.toLocaleString()}</span></div>

              {/* Promo Code */}
              <div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Promo code" value={promoCode} onChange={e => { setPromoCode(e.target.value); setPromoError(''); }} className="pl-9 rounded-full" />
                  </div>
                  <Button variant="outline" className="rounded-full px-4" onClick={applyPromo} disabled={promoLoading || !promoCode}>Apply</Button>
                </div>
                {promoError && <p className="text-xs text-destructive mt-1">{promoError}</p>}
                {promoDiscount > 0 && <p className="text-xs text-emerald-600 mt-1">Code applied! You save ৳{promoDiscount.toLocaleString()}</p>}
              </div>

              <Button className="w-full rounded-full h-11" size="lg" onClick={() => navigate('checkout')}>
                Proceed to Checkout <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button variant="ghost" className="w-full text-sm text-muted-foreground" onClick={() => navigate('products')}>
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
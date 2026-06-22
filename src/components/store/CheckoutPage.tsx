'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { CreditCard, Truck, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export function CheckoutPage() {
  const { cartItems, cartSubtotal, clearCart, user, navigate, setLastOrderNumber } = useAppStore();
  const [step, setStep] = useState<'address' | 'payment' | 'review' | 'processing'>('address');
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad'>('bkash');
  const [loading, setLoading] = useState(false);
  const [shippingCost] = useState(cartSubtotal >= 5000 ? 0 : 120);
  const [promoDiscount, setPromoDiscount] = useState(0);

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: user?.addresses?.[0]?.address || '',
    city: user?.addresses?.[0]?.city || '',
    district: user?.addresses?.[0]?.district || 'Dhaka',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const total = cartSubtotal - promoDiscount + shippingCost;

  useEffect(() => {
    if (cartItems.length === 0 && step !== 'processing') navigate('cart');
  }, [cartItems.length]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.phone.trim() || form.phone.length < 11) e.phone = 'Valid phone required';
    if (!form.address.trim()) e.address = 'Required';
    if (!form.city.trim()) e.city = 'Required';
    if (!form.district.trim()) e.district = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const items = cartItems.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        variant: [item.variant?.size, item.variant?.color].filter(Boolean).join(', '),
        image: item.image,
      }));

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          shippingAddress: { name: form.name, phone: form.phone, email: form.email, address: form.address, city: form.city, district: form.district },
          userId: user?.id || null,
          total,
          subtotal: cartSubtotal,
          shippingCost,
          discountAmount: promoDiscount,
          paymentProvider: paymentMethod,
        }),
      });
      const data = await res.json();
      if (data.orderNumber) {
        setLastOrderNumber(data.orderNumber);
        clearCart();
        navigate('order-success', { orderNumber: data.orderNumber });
      }
    } catch { setErrors({ _form: 'Failed to place order. Please try again.' }); }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Steps indicator */}
      <div className="flex items-center justify-center mb-8">
        {['Address', 'Payment', 'Review'].map((label, i) => {
          const steps = ['address', 'payment', 'review'];
          const isActive = steps[i] === step;
          const isDone = steps.indexOf(step as string) > i;
          return (
            <div key={label} className="flex items-center">
              <div className="flex items-center gap-2">
                <div className={cn('h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors', isActive ? 'bg-primary text-primary-foreground' : isDone ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground')}>
                  {isDone ? <CheckCircle className="h-4 w-4" /> : i + 1}
                </div>
                <span className={cn('text-sm hidden sm:block', isActive ? 'font-medium' : 'text-muted-foreground')}>{label}</span>
              </div>
              {i < 2 && <div className={cn('w-12 sm:w-20 h-0.5 mx-2 sm:mx-4', isDone ? 'bg-primary' : 'bg-muted')} />}
            </div>
          );
        })}
      </div>

      <div className="grid md:grid-cols-5 gap-8">
        <div className="md:col-span-3">
          {/* Address Step */}
          {step === 'address' && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <Card>
                <CardHeader><CardTitle><Truck className="h-5 w-5 inline mr-2" />Shipping Address</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div><Label>Full Name *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="mt-1 rounded-lg" /><p className="text-xs text-destructive mt-1">{errors.name}</p></div>
                    <div><Label>Phone Number *</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="01XXXXXXXXX" className="mt-1 rounded-lg" /><p className="text-xs text-destructive mt-1">{errors.phone}</p></div>
                  </div>
                  <div><Label>Email (optional)</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="mt-1 rounded-lg" /></div>
                  <div><Label>Address *</Label><Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="House, Road, Area" className="mt-1 rounded-lg" /><p className="text-xs text-destructive mt-1">{errors.address}</p></div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div><Label>City *</Label><Input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="mt-1 rounded-lg" /><p className="text-xs text-destructive mt-1">{errors.city}</p></div>
                    <div><Label>District *</Label><Input value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} className="mt-1 rounded-lg" /><p className="text-xs text-destructive mt-1">{errors.district}</p></div>
                  </div>
                  <Button className="w-full rounded-full mt-2" onClick={() => { if (validate()) setStep('payment'); }}>Continue to Payment</Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Payment Step */}
          {step === 'payment' && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <Card>
                <CardHeader><CardTitle><CreditCard className="h-5 w-5 inline mr-2" />Payment Method</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { id: 'bkash' as const, name: 'bKash', color: '#E2136E', desc: 'Pay with bKash mobile banking' },
                    { id: 'nagad' as const, name: 'Nagad', color: '#F6921E', desc: 'Pay with Nagad mobile financial service' },
                  ].map(p => (
                    <button key={p.id} onClick={() => setPaymentMethod(p.id)} className={cn('w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left', paymentMethod === p.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30')}>
                      <div className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: p.color }}>
                        {p.name[0]}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.desc}</p>
                      </div>
                      <div className={cn('h-5 w-5 rounded-full border-2 flex items-center justify-center', paymentMethod === p.id ? 'border-primary' : 'border-muted-foreground/30')}>
                        {paymentMethod === p.id && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                      </div>
                    </button>
                  ))}
                  <div className="flex gap-3 mt-4">
                    <Button variant="outline" className="flex-1 rounded-full" onClick={() => setStep('address')}>Back</Button>
                    <Button className="flex-1 rounded-full" onClick={() => setStep('review')}>Review Order</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Review Step */}
          {step === 'review' && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <Card>
                <CardHeader><CardTitle>Review Your Order</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {/* Items */}
                  <div className="space-y-3">
                    {cartItems.map(item => (
                      <div key={item.id} className="flex gap-3">
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted shrink-0">
                          <img src={item.image} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity} {item.variant?.size && `· Size: ${item.variant.size}`} {item.variant?.color && `· ${item.variant.color}`}</p>
                        </div>
                        <p className="text-sm font-medium">৳{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                  <Separator />
                  {/* Address */}
                  <div>
                    <p className="text-sm font-medium mb-1">Shipping to</p>
                    <p className="text-sm text-muted-foreground">{form.name}, {form.phone}<br />{form.address}, {form.city}, {form.district}</p>
                  </div>
                  <Separator />
                  {/* Payment */}
                  <div>
                    <p className="text-sm font-medium mb-1">Payment via</p>
                    <p className="text-sm text-muted-foreground capitalize">{paymentMethod}</p>
                  </div>
                  {errors._form && <p className="text-sm text-destructive">{errors._form}</p>}
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1 rounded-full" onClick={() => setStep('payment')}>Back</Button>
                    <Button className="flex-1 rounded-full" onClick={handlePlaceOrder} disabled={loading}>
                      {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Processing...</> : `Pay ৳${total.toLocaleString()}`}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="md:col-span-2">
          <Card className="sticky top-28">
            <CardHeader><CardTitle className="text-base">Order Summary</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Items ({cartItems.reduce((s, i) => s + i.quantity, 0)})</span><span>৳{cartSubtotal.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shippingCost === 0 ? <span className="text-emerald-600">Free</span> : `৳${shippingCost}`}</span></div>
              <Separator />
              <div className="flex justify-between font-bold text-base"><span>Total</span><span>৳{total.toLocaleString()}</span></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
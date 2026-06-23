'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { CreditCard, Truck, CheckCircle, Loader2, MapPin, ShieldCheck, ChevronRight, Package, Calendar, ExternalLink, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { getApiUrl } from '@/lib/api-config';

const STEP_CONFIG = [
  { key: 'address', label: 'Address', icon: MapPin },
  { key: 'payment', label: 'Payment', icon: CreditCard },
  { key: 'review', label: 'Review', icon: Package },
] as const;

function StepIndicator({ currentStep }: { currentStep: string }) {
  const currentIndex = STEP_CONFIG.findIndex(s => s.key === currentStep);

  return (
    <div className="flex items-center justify-center mb-8 sm:mb-10">
      {STEP_CONFIG.map((step, i) => {
        const isDone = i < currentIndex;
        const isActive = i === currentIndex;
        const Icon = step.icon;

        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <motion.div
                animate={{
                  scale: isActive ? 1.1 : 1,
                  backgroundColor: isActive ? 'var(--primary)' : isDone ? 'var(--primary)' : 'var(--muted)',
                }}
                className={cn(
                  'h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300',
                  isActive && 'ring-4 ring-primary/20',
                  isDone && 'bg-primary text-primary-foreground',
                  !isDone && !isActive && 'bg-muted text-muted-foreground'
                )}
              >
                {isDone ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </motion.div>
              <span className={cn(
                'text-xs font-medium hidden sm:block transition-colors',
                isActive ? 'text-primary' : isDone ? 'text-foreground' : 'text-muted-foreground'
              )}>
                {step.label}
              </span>
            </div>
            {i < STEP_CONFIG.length - 1 && (
              <div className="relative mx-3 sm:mx-5 w-12 sm:w-20 h-0.5 bg-muted">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: isDone ? '100%' : '0%' }}
                  transition={{ duration: 0.4 }}
                  className="absolute left-0 top-0 h-full bg-primary rounded-full"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function PaymentCardMockup({ method }: { method: 'bkash' | 'nagad' }) {
  const config = method === 'bkash'
    ? { name: 'bKash', color: 'from-pink-600 via-rose-600 to-pink-700', logo: '#E2136E', desc: 'Pay with bKash mobile banking' }
    : { name: 'Nagad', color: 'from-orange-500 via-amber-500 to-orange-600', logo: '#F6921E', desc: 'Pay with Nagad mobile financial service' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="relative overflow-hidden rounded-2xl p-5 text-white shadow-lg"
      style={{
        background: method === 'bkash'
          ? 'linear-gradient(135deg, #E2136E 0%, #C9175B 50%, #E2136E 100%)'
          : 'linear-gradient(135deg, #F6921E 0%, #E8850F 50%, #F6921E 100%)',
      }}
    >
      {/* Decorative circles */}
      <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-white/10" />
      <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-white/5" />
      <div className="absolute top-4 right-20 h-8 w-8 rounded-full bg-white/10" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <span className="text-lg font-bold tracking-wider">{config.name}</span>
          <div className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <CreditCard className="h-4 w-4" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-8 w-40 bg-white/15 rounded-lg" />
          <div className="flex justify-between text-sm">
            <span className="text-white/60">Mobile Banking</span>
            <span className="font-medium">Payment</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ProcessingOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-center"
      >
        <div className="relative mx-auto mb-8 h-20 w-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-full border-4 border-muted border-t-primary"
          />
          <div className="absolute inset-2 rounded-full bg-primary/10 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        </div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-xl font-bold"
        >
          Placing your order...
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-sm text-muted-foreground mt-2"
        >
          Please wait while we process your payment
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex items-center justify-center gap-1.5 mt-4"
        >
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span className="text-xs text-muted-foreground">Secure & Encrypted</span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export function CheckoutPage() {
  const { cartItems, cartSubtotal, clearCart, user, navigate, setLastOrderNumber } = useAppStore();
  const [step, setStep] = useState<'address' | 'payment' | 'review' | 'processing'>('address');
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad'>('bkash');
  const [loading, setLoading] = useState(false);
  const [shippingCost] = useState(cartSubtotal >= 5000 ? 0 : 120);
  const [promoDiscount] = useState(0);
  const [saveAddress, setSaveAddress] = useState(true);
  const [selectedAddressIdx, setSelectedAddressIdx] = useState(-1);

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

  // Estimated delivery: 3-6 business days from now
  const getEstimatedDelivery = () => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() + 3);
    const end = new Date(now);
    end.setDate(end.getDate() + 6);
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[start.getMonth()]} ${start.getDate()}-${end.getDate()}, ${end.getFullYear()}`;
  };

  useEffect(() => {
    if (cartItems.length === 0 && step !== 'processing') navigate('cart');
  }, [cartItems.length]);

  const selectSavedAddress = (idx: number) => {
    const addr = user?.addresses?.[idx];
    if (addr) {
      setForm({
        name: addr.name,
        phone: addr.phone,
        email: form.email,
        address: addr.address,
        city: addr.city,
        district: addr.district,
      });
      setSelectedAddressIdx(idx);
      setErrors({});
    }
  };

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
    setStep('processing');
    try {
      const items = cartItems.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        variant: [item.variant?.size, item.variant?.color].filter(Boolean).join(', '),
        image: item.image,
      }));

      const res = await fetch(getApiUrl('/api/orders', {
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
        // Brief delay before redirect for UX
        setTimeout(() => {
          setLastOrderNumber(data.orderNumber);
          clearCart();
          navigate('order-success', { orderNumber: data.orderNumber });
        }, 1200);
        return;
      }
    } catch {
      setErrors({ _form: 'Failed to place order. Please try again.' });
      setStep('review');
    }
    setLoading(false);
  };

  const inputClass = (field: string) => cn(
    'mt-1.5 rounded-xl h-11 border-2 transition-all',
    errors[field]
      ? 'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20'
      : 'focus-visible:border-primary focus-visible:ring-primary/10'
  );

  return (
    <>
      {step === 'processing' && <ProcessingOverlay />}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <StepIndicator currentStep={step} />

        <div className="grid md:grid-cols-5 gap-8">
          <div className="md:col-span-3">
            {/* Address Step */}
            <AnimatePresence mode="wait">
              {step === 'address' && (
                <motion.div key="address" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.25 }}>
                  <Card className="rounded-2xl border-2 overflow-hidden">
                    <CardHeader className="bg-accent/30 border-b">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Truck className="h-4 w-4 text-primary" />
                        </div>
                        Shipping Address
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 space-y-4">
                      {/* Saved Address Selector */}
                      {user?.addresses && user.addresses.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Saved Addresses</Label>
                          <div className="grid sm:grid-cols-2 gap-2">
                            {user.addresses.map((addr, idx) => (
                              <button
                                key={addr.id}
                                type="button"
                                onClick={() => selectSavedAddress(idx)}
                                className={cn(
                                  'text-left p-3 rounded-xl border-2 transition-all',
                                  selectedAddressIdx === idx
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover:border-primary/30'
                                )}
                              >
                                <p className="text-sm font-medium truncate">{addr.name}</p>
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{addr.address}, {addr.city}, {addr.district}</p>
                                {addr.isDefault && (
                                  <span className="inline-block text-[10px] font-semibold text-primary bg-primary/10 rounded px-1.5 py-0.5 mt-1">Default</span>
                                )}
                              </button>
                            ))}
                          </div>
                          <Separator />
                        </div>
                      )}

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-sm font-medium">Full Name *</Label>
                          <Input value={form.name} onChange={e => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: '' }); }} className={inputClass('name')} />
                          {errors.name && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-destructive mt-1">{errors.name}</motion.p>}
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-sm font-medium">Phone Number *</Label>
                          <Input value={form.phone} onChange={e => { setForm({ ...form, phone: e.target.value }); setErrors({ ...errors, phone: '' }); }} placeholder="01XXXXXXXXX" className={inputClass('phone')} />
                          {errors.phone && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-destructive mt-1">{errors.phone}</motion.p>}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium">Email (optional)</Label>
                        <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={inputClass('email')} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium">Address *</Label>
                        <Input value={form.address} onChange={e => { setForm({ ...form, address: e.target.value }); setErrors({ ...errors, address: '' }); }} placeholder="House, Road, Area" className={inputClass('address')} />
                        {errors.address && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-destructive mt-1">{errors.address}</motion.p>}
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-sm font-medium">City *</Label>
                          <Input value={form.city} onChange={e => { setForm({ ...form, city: e.target.value }); setErrors({ ...errors, city: '' }); }} className={inputClass('city')} />
                          {errors.city && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-destructive mt-1">{errors.city}</motion.p>}
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-sm font-medium">District *</Label>
                          <Input value={form.district} onChange={e => { setForm({ ...form, district: e.target.value }); setErrors({ ...errors, district: '' }); }} className={inputClass('district')} />
                          {errors.district && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-destructive mt-1">{errors.district}</motion.p>}
                        </div>
                      </div>

                      {/* Save Address Checkbox */}
                      {user && (
                        <div className="flex items-center gap-2 pt-1">
                          <Checkbox
                            id="save-address"
                            checked={saveAddress}
                            onCheckedChange={(checked) => setSaveAddress(checked === true)}
                          />
                          <Label htmlFor="save-address" className="text-sm text-muted-foreground cursor-pointer">
                            Save this address for future orders
                          </Label>
                        </div>
                      )}

                      <Button className="w-full rounded-full mt-2 h-11 font-semibold" onClick={() => { if (validate()) setStep('payment'); }}>
                        Continue to Payment
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Payment Step */}
              {step === 'payment' && (
                <motion.div key="payment" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.25 }}>
                  <Card className="rounded-2xl border-2 overflow-hidden">
                    <CardHeader className="bg-accent/30 border-b">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <CreditCard className="h-4 w-4 text-primary" />
                        </div>
                        Payment Method
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 space-y-4">
                      {/* Payment Options */}
                      <div className="space-y-3">
                        {([
                          { id: 'bkash' as const, name: 'bKash', desc: 'Pay with bKash mobile banking', iconText: 'b' },
                          { id: 'nagad' as const, name: 'Nagad', desc: 'Pay with Nagad mobile financial service', iconText: 'N' },
                        ]).map(p => (
                          <button
                            key={p.id}
                            onClick={() => setPaymentMethod(p.id)}
                            className={cn(
                              'w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left',
                              paymentMethod === p.id
                                ? 'border-primary bg-primary/5 shadow-sm'
                                : 'border-border hover:border-primary/30'
                            )}
                          >
                            <div
                              className="h-11 w-11 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-sm"
                              style={{ backgroundColor: p.id === 'bkash' ? '#E2136E' : '#F6921E' }}
                            >
                              {p.iconText}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold">{p.name}</p>
                              <p className="text-xs text-muted-foreground">{p.desc}</p>
                            </div>
                            <div className={cn(
                              'h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
                              paymentMethod === p.id ? 'border-primary' : 'border-muted-foreground/30'
                            )}>
                              {paymentMethod === p.id && (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="h-2.5 w-2.5 rounded-full bg-primary" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>

                      {/* Card Mockup */}
                      <PaymentCardMockup method={paymentMethod} />

                      {/* Redirect notice */}
                      <div className="flex items-start gap-2.5 bg-accent/50 rounded-xl p-3.5">
                        <ExternalLink className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          You will be redirected to <span className="font-semibold text-foreground capitalize">{paymentMethod}</span> to complete your payment securely.
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <Button variant="outline" className="flex-1 rounded-full h-11" onClick={() => setStep('address')}>Back</Button>
                        <Button className="flex-1 rounded-full h-11 font-semibold" onClick={() => setStep('review')}>
                          Review Order
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Review Step */}
              {step === 'review' && (
                <motion.div key="review" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.25 }}>
                  <Card className="rounded-2xl border-2 overflow-hidden">
                    <CardHeader className="bg-accent/30 border-b">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Package className="h-4 w-4 text-primary" />
                        </div>
                        Review Your Order
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 space-y-5">
                      {/* Items with images */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Items ({cartItems.length})</h4>
                        {cartItems.map(item => (
                          <div key={item.id} className="flex gap-3 p-2.5 rounded-xl bg-accent/30 hover:bg-accent/50 transition-colors">
                            <div className="h-16 w-14 rounded-lg overflow-hidden bg-muted shrink-0">
                              <img src={item.image} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{item.name}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Qty: {item.quantity}
                                {item.variant?.size && ` · Size: ${item.variant.size}`}
                                {item.variant?.color && ` · ${item.variant.color}`}
                              </p>
                            </div>
                            <p className="text-sm font-semibold shrink-0 self-center">৳{(item.price * item.quantity).toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                      <Separator />

                      {/* Estimated Delivery */}
                      <div className="flex items-center gap-2.5 bg-blue-50 dark:bg-blue-950/30 rounded-xl p-3.5 border border-blue-200 dark:border-blue-800">
                        <Calendar className="h-4 w-4 text-blue-600 shrink-0" />
                        <p className="text-sm text-blue-700 dark:text-blue-400">
                          Estimated delivery: <span className="font-semibold">{getEstimatedDelivery()}</span>
                        </p>
                      </div>

                      {/* Address */}
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Shipping to</h4>
                        <div className="flex gap-2.5 p-3 rounded-xl bg-accent/30">
                          <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            <span className="font-medium text-foreground">{form.name}</span>, {form.phone}<br />
                            {form.email && <>{form.email}<br /></>}
                            {form.address}, {form.city}, {form.district}
                          </p>
                        </div>
                      </div>

                      {/* Payment */}
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Payment via</h4>
                        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-accent/30">
                          <div
                            className="h-6 w-6 rounded flex items-center justify-center text-white text-xs font-bold shrink-0"
                            style={{ backgroundColor: paymentMethod === 'bkash' ? '#E2136E' : '#F6921E' }}
                          >
                            {paymentMethod === 'bkash' ? 'b' : 'N'}
                          </div>
                          <p className="text-sm font-medium capitalize">{paymentMethod}</p>
                        </div>
                      </div>

                      {errors._form && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2">
                          {errors._form}
                        </motion.p>
                      )}

                      <div className="flex gap-3">
                        <Button variant="outline" className="flex-1 rounded-full h-11" onClick={() => setStep('payment')}>Back</Button>
                        <Button className="flex-1 rounded-full h-11 font-bold" onClick={handlePlaceOrder} disabled={loading}>
                          {loading ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Processing...
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              <ShieldCheck className="h-4 w-4" />
                              Pay ৳{total.toLocaleString()}
                            </span>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order Summary Sidebar */}
          <div className="md:col-span-2 order-first md:order-last">
            <Card className="md:sticky md:top-28 rounded-2xl border-2 overflow-hidden">
              <CardHeader className="bg-accent/30 border-b">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center">
                    <Package className="h-3 w-3 text-primary" />
                  </div>
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4 text-sm">
                {/* Item thumbnails */}
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {cartItems.map(item => (
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

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Items ({cartItems.reduce((s, i) => s + i.quantity, 0)})</span>
                  <span>৳{cartSubtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Truck className="h-3 w-3" />
                    Shipping
                  </span>
                  {shippingCost === 0 ? (
                    <span className="text-emerald-600 font-semibold">Free</span>
                  ) : (
                    <span>৳{shippingCost}</span>
                  )}
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span>৳{total.toLocaleString()}</span>
                </div>

                {/* Secure badge */}
                <div className="flex items-center justify-center gap-1.5 pt-1">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs text-muted-foreground font-medium">Secure & Encrypted Checkout</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
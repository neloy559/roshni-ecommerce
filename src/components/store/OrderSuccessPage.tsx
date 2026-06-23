'use client';

import { useAppStore } from '@/lib/store';
import {
  CheckCircle,
  Package,
  ArrowRight,
  Truck,
  ShoppingBag,
  Share2,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  Copy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

/* ---------- tiny confetti particles ---------- */
function ConfettiParticles() {
  const particles = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 260,
    y: -(Math.random() * 120 + 40),
    rotate: Math.random() * 360,
    scale: Math.random() * 0.6 + 0.4,
    delay: Math.random() * 0.6,
    duration: Math.random() * 1.2 + 1.8,
    colors: [
      'bg-rose-400',
      'bg-pink-400',
      'bg-fuchsia-400',
      'bg-amber-400',
      'bg-emerald-400',
      'bg-purple-400',
      'bg-sky-400',
    ][Math.floor(Math.random() * 7)],
    shape: Math.random() > 0.5 ? 'rounded-full' : 'rounded-sm',
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className={cn('absolute', p.colors, p.shape)}
          style={{
            width: 8 * p.scale,
            height: 8 * p.scale,
            left: '50%',
            top: '50%',
          }}
          initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
          animate={{
            x: p.x,
            y: [0, p.y, p.y + 80],
            rotate: p.rotate,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}

import { cn } from '@/lib/utils';

const nextSteps = [
  {
    icon: Truck,
    title: 'Track Your Order',
    description: 'Monitor your package in real-time',
    action: 'account' as const,
    actionLabel: 'View Orders',
    gradient: 'from-rose-500 to-pink-500',
    iconBg: 'bg-rose-50',
    iconColor: 'text-rose-500',
  },
  {
    icon: ShoppingBag,
    title: 'Continue Shopping',
    description: 'Explore our latest collection',
    action: 'products' as const,
    actionLabel: 'Browse Products',
    gradient: 'from-fuchsia-500 to-purple-500',
    iconBg: 'bg-fuchsia-50',
    iconColor: 'text-fuchsia-500',
  },
  {
    icon: Share2,
    title: 'Share with Friends',
    description: 'Let your friends know about us',
    action: 'share' as const,
    actionLabel: 'Copy Link',
    gradient: 'from-amber-500 to-orange-500',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-500',
  },
];

export function OrderSuccessPage() {
  const { pageParams, lastOrderNumber, navigate, addToast } = useAppStore();
  const orderNumber = pageParams.orderNumber || lastOrderNumber;

  const handleCopyLink = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.origin).then(() => {
        addToast('Link copied to clipboard!', 'success');
      });
    } else {
      addToast('Link copied!', 'success');
    }
  };

  const handleStepAction = (action: string) => {
    if (action === 'share') {
      handleCopyLink();
    } else {
      navigate(action);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      {/* Success Icon with Confetti */}
      <div className="relative flex justify-center mb-8">
        <ConfettiParticles />
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
        >
          <div className="relative">
            {/* Outer ring pulse */}
            <motion.div
              className="absolute -inset-4 rounded-full bg-emerald-100"
              initial={{ scale: 0.8, opacity: 0.6 }}
              animate={{ scale: [0.8, 1.15, 0.8], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* Main circle */}
            <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center shadow-2xl shadow-emerald-200/60">
              <motion.div
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.3 }}
              >
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="sm:w-14 sm:h-14">
                  <motion.path
                    d="M12 25 L20 33 L36 16"
                    stroke="white"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 0.5, ease: 'easeOut' }}
                  />
                </svg>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Order Placed Successfully!</h1>
        <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto">
          Thank you for shopping with Roshni. We&apos;re preparing your order with care.
        </p>
      </motion.div>

      {/* Order Number Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.4 }}
        className="mb-8"
      >
        <Card className="overflow-hidden border-2 border-emerald-100 bg-gradient-to-r from-emerald-50/50 to-teal-50/50">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                  Order Number
                </p>
                <p className="text-xl sm:text-2xl font-bold font-mono tracking-wide">
                  {orderNumber || 'N/A'}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <Package className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Delivery & Payment Summary */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65, duration: 0.4 }}
        className="grid sm:grid-cols-2 gap-3 mb-10"
      >
        <Card className="overflow-hidden">
          <CardContent className="p-4 flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-semibold">Estimated Delivery</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                3–5 business days across Bangladesh
              </p>
              <div className="flex items-center gap-1 mt-2">
                <div className="h-1.5 flex-1 rounded-full bg-muted">
                  <div className="h-1.5 w-1/4 rounded-full bg-amber-500" />
                </div>
                <span className="text-[10px] text-muted-foreground">Processing</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardContent className="p-4 flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-semibold">Payment Confirmed</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your payment has been received and verified.
              </p>
              <p className="text-[10px] text-emerald-600 font-medium mt-2 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Secured by Roshni
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* What's Next Section */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.4 }}
        className="mb-10"
      >
        <h2 className="text-lg font-bold text-center mb-5">What&apos;s Next?</h2>
        <div className="grid gap-3">
          {nextSteps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: i % 2 === 0 ? -12 : 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 + i * 0.1, duration: 0.35 }}
            >
              <Card className="group overflow-hidden transition-all hover:shadow-md cursor-pointer border-border/80"
                onClick={() => handleStepAction(step.action)}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div
                    className={cn(
                      'h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105',
                      step.iconBg
                    )}
                  >
                    <step.icon className={cn('h-5 w-5', step.iconColor)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{step.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                  </div>
                  <div
                    className={cn(
                      'h-8 px-3 rounded-full bg-gradient-to-r text-white text-xs font-medium flex items-center gap-1 flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity',
                      step.gradient
                    )}
                  >
                    {step.action === 'share' ? (
                      <Copy className="h-3 w-3" />
                    ) : (
                      <ArrowRight className="h-3 w-3" />
                    )}
                    {step.actionLabel}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Need Help Section */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.4 }}
      >
        <Card className="overflow-hidden bg-muted/30 border-dashed">
          <CardContent className="p-5 sm:p-6">
            <div className="text-center">
              <h3 className="text-sm font-semibold mb-1">Need Help?</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Our support team is here to assist you with any questions about your order.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4 text-rose-400" />
                  <span>+880 1XXX-XXXXXX</span>
                </div>
                <div className="hidden sm:block h-4 w-px bg-border" />
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 text-rose-400" />
                  <span>support@roshni.com</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
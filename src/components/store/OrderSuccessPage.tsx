'use client';

import { useAppStore } from '@/lib/store';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

export function OrderSuccessPage() {
  const { pageParams, lastOrderNumber, navigate } = useAppStore();
  const orderNumber = pageParams.orderNumber || lastOrderNumber;

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-16 text-center">
      <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', duration: 0.6 }}>
        <CheckCircle className="h-20 w-20 text-emerald-500 mx-auto mb-6" />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Order Placed!</h1>
        <p className="text-muted-foreground mb-1">Thank you for your purchase</p>
        <p className="text-sm text-muted-foreground mb-6">Order number: <span className="font-mono font-semibold text-foreground">{orderNumber || 'N/A'}</span></p>

        <Card className="text-left mb-8">
          <CardContent className="p-4 space-y-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Package className="h-4 w-4" />
              <span>Estimated delivery: 3-5 business days</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle className="h-4 w-4" />
              <span>Payment confirmed</span>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" className="rounded-full" onClick={() => navigate('account')}>View Orders</Button>
          <Button className="rounded-full" onClick={() => navigate('products')}>
            Continue Shopping <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
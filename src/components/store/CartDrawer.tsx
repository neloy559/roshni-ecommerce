'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore, CartItemType } from '@/lib/store';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function CartDrawer() {
  const { cartItems, cartCount, cartSubtotal, updateCartQuantity, removeFromCart, cartDrawerOpen, setCartDrawerOpen, navigate } = useAppStore();

  return (
    <Sheet open={cartDrawerOpen} onOpenChange={setCartDrawerOpen}>
      <SheetContent side="right" className="w-full sm:w-96 p-0 flex flex-col">
        <SheetHeader className="p-4 border-b flex-shrink-0">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Shopping Bag ({cartCount})
          </SheetTitle>
        </SheetHeader>

        {cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <p className="font-medium text-muted-foreground mb-2">Your bag is empty</p>
            <p className="text-sm text-muted-foreground mb-6">Discover our latest collections</p>
            <Button onClick={() => { setCartDrawerOpen(false); navigate('products'); }} className="rounded-full">
              Start Shopping
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <AnimatePresence>
                {cartItems.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex gap-3 bg-accent/50 rounded-xl p-3"
                  >
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-medium truncate">{item.name}</h4>
                          {item.variant?.size && <p className="text-xs text-muted-foreground">Size: {item.variant.size}</p>}
                          {item.variant?.color && <p className="text-xs text-muted-foreground">Color: {item.variant.color}</p>}
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="text-muted-foreground hover:text-destructive shrink-0">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border rounded-full">
                          <button onClick={() => updateCartQuantity(item.id, item.quantity - 1)} className="h-7 w-7 flex items-center justify-center hover:bg-accent rounded-l-full">
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="h-7 w-8 flex items-center justify-center text-xs font-medium">{item.quantity}</span>
                          <button onClick={() => updateCartQuantity(item.id, item.quantity + 1)} className="h-7 w-7 flex items-center justify-center hover:bg-accent rounded-r-full">
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="text-right">
                          {item.hasDiscount && (
                            <span className="text-xs text-muted-foreground line-through">৳{item.originalPrice.toLocaleString()}</span>
                          )}
                          <p className="text-sm font-semibold">৳{(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <div className="border-t p-4 flex-shrink-0 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="text-lg font-bold">৳{cartSubtotal.toLocaleString()}</span>
              </div>
              <p className="text-xs text-muted-foreground">Shipping calculated at checkout</p>
              <Button onClick={() => { setCartDrawerOpen(false); navigate('cart'); }} className="w-full rounded-full h-11">
                View Cart & Checkout
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
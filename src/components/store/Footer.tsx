'use client';

import { useAppStore } from '@/lib/store';
import { Heart, Facebook, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export function Footer() {
  const { currentPage, navigate, isAdmin } = useAppStore();
  if (currentPage.startsWith('admin')) return null;

  return (
    <footer className="bg-neutral-950 text-neutral-300 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Heart className="h-5 w-5 text-primary fill-primary" />
              <span className="text-lg font-bold text-white">Roshni</span>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              Discover curated collections of shoes, bags, and accessories for the modern woman. Elegance redefined.
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-neutral-400 hover:text-white hover:bg-white/10">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-neutral-400 hover:text-white hover:bg-white/10">
                <Instagram className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Quick Links</h3>
            <ul className="space-y-2.5">
              {[
                { label: 'Shoes', params: { category: 'shoes' } },
                { label: 'Handbags', params: { category: 'handbags' } },
                { label: 'Accessories', params: { category: 'accessories' } },
                { label: 'New Arrivals', params: { sort: 'newest' } },
                { label: 'Sale', params: { sale: 'true' } },
              ].map(link => (
                <li key={link.label}>
                  <button onClick={() => navigate('products', link.params)} className="text-sm hover:text-primary transition-colors">
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Customer Service</h3>
            <ul className="space-y-2.5">
              {['Contact Us', 'Shipping & Delivery', 'Returns & Exchange', 'Size Guide', 'FAQ'].map(item => (
                <li key={item}>
                  <span className="text-sm hover:text-primary transition-colors cursor-pointer">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Get in Touch</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <span>+880 1XXX-XXXXXX</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <span>hello@roshni.com.bd</span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>Dhanmondi, Dhaka 1205, Bangladesh</span>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-neutral-800" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>© 2026 Roshni. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-neutral-300 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-neutral-300 cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
'use client';

import { useState, type FormEvent } from 'react';
import { useAppStore } from '@/lib/store';
import {
  Heart,
  Facebook,
  Instagram,
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CreditCard,
  Banknote,
  Smartphone,
  CircleDot,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

export function Footer() {
  const { currentPage, navigate, isAdmin, addToast } = useAppStore();
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  if (currentPage.startsWith('admin')) return null;

  const handleSubscribe = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribing(true);
    // Simulate network delay
    setTimeout(() => {
      addToast('Welcome to Roshni! 🎉 Check your inbox for 10% off.', 'success');
      setEmail('');
      setSubscribing(false);
    }, 600);
  };

  return (
    <footer className="mt-auto">
      {/* Decorative top gradient border */}
      <div className="h-1 w-full bg-gradient-to-r from-rose-300 via-pink-400 to-rose-300" />

      {/* ===== Newsletter Section ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-pink-50 via-rose-100 to-pink-50">
        {/* Decorative dot pattern */}
        <div className="absolute inset-0 opacity-[0.15]" aria-hidden="true">
          <div className="absolute top-4 left-[10%] h-3 w-3 rounded-full bg-rose-400" />
          <div className="absolute top-12 left-[25%] h-2 w-2 rounded-full bg-pink-500" />
          <div className="absolute bottom-8 left-[15%] h-4 w-4 rounded-full bg-rose-300" />
          <div className="absolute top-6 right-[20%] h-2.5 w-2.5 rounded-full bg-pink-400" />
          <div className="absolute bottom-6 right-[12%] h-3 w-3 rounded-full bg-rose-500" />
          <div className="absolute top-10 right-[35%] h-2 w-2 rounded-full bg-pink-300" />
          <div className="absolute bottom-12 left-[45%] h-3.5 w-3.5 rounded-full bg-rose-400" />
          <div className="absolute top-4 left-[60%] h-2 w-2 rounded-full bg-pink-500" />
          <div className="absolute top-14 right-[8%] h-1.5 w-1.5 rounded-full bg-rose-300" />
          <div className="absolute bottom-4 left-[70%] h-2 w-2 rounded-full bg-pink-400" />
          <div className="absolute top-8 left-[80%] h-3 w-3 rounded-full bg-rose-200" />
          <div className="absolute bottom-10 right-[50%] h-2.5 w-2.5 rounded-full bg-pink-300" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-14 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">
            Join the Roshni Family
          </h2>
          <p className="text-neutral-600 text-sm sm:text-base mb-6 max-w-lg mx-auto">
            Subscribe for exclusive offers, new arrivals, and style inspiration
          </p>

          <form
            onSubmit={handleSubscribe}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto"
          >
            <Input
              type="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 rounded-full bg-card border-pink-200 dark:border-pink-800 focus-visible:ring-pink-400 text-sm px-5"
            />
            <Button
              type="submit"
              disabled={subscribing}
              className="h-11 rounded-full px-6 bg-rose-600 hover:bg-rose-700 text-white shrink-0"
            >
              {subscribing ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Subscribing…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Subscribe
                  <Send className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          <p className="text-xs text-neutral-400 mt-4">
            By subscribing, you agree to our{' '}
            <span className="underline cursor-pointer hover:text-neutral-600 transition-colors">
              Privacy Policy
            </span>
          </p>
        </div>
      </section>

      {/* ===== Main Footer ===== */}
      <div className="bg-neutral-950 text-neutral-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Column 1 — Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Heart className="h-6 w-6 text-primary fill-primary" />
                <span className="text-xl font-bold text-white tracking-tight">Roshni</span>
              </div>
              <p className="text-sm leading-relaxed mb-5 text-neutral-400">
                Discover curated collections of shoes, bags, and accessories for the modern
                woman. Elegance redefined, made in Bangladesh.
              </p>

              {/* Social Links */}
              <div className="flex gap-2.5 mb-6">
                <a
                  href="#"
                  aria-label="Facebook"
                  className="h-10 w-10 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 hover:bg-[#1877F2] hover:text-white transition-all duration-200"
                >
                  <Facebook className="h-[18px] w-[18px]" />
                </a>
                <a
                  href="#"
                  aria-label="Instagram"
                  className="h-10 w-10 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 hover:bg-gradient-to-tr hover:from-[#f9ce34] hover:via-[#ee2a7b] hover:to-[#6228d7] hover:text-white transition-all duration-200"
                >
                  <Instagram className="h-[18px] w-[18px]" />
                </a>
                <a
                  href="#"
                  aria-label="TikTok"
                  className="h-10 w-10 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 hover:bg-black hover:text-white border border-neutral-700 hover:border-black transition-all duration-200"
                >
                  <CircleDot className="h-[18px] w-[18px]" />
                </a>
                <a
                  href="#"
                  aria-label="Pinterest"
                  className="h-10 w-10 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 hover:bg-[#E60023] hover:text-white transition-all duration-200"
                >
                  <CircleDot className="h-[18px] w-[18px]" />
                </a>
              </div>

              {/* App Download Badges */}
              <div className="flex gap-2">
                <button className="flex items-center gap-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 px-3 py-2 transition-colors">
                  <Smartphone className="h-4 w-4 text-neutral-400" />
                  <div className="text-left">
                    <p className="text-[9px] leading-tight text-neutral-500 uppercase tracking-wider">
                      Download on
                    </p>
                    <p className="text-xs font-medium text-neutral-200">App Store</p>
                  </div>
                </button>
                <button className="flex items-center gap-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 px-3 py-2 transition-colors">
                  <Smartphone className="h-4 w-4 text-neutral-400" />
                  <div className="text-left">
                    <p className="text-[9px] leading-tight text-neutral-500 uppercase tracking-wider">
                      Get it on
                    </p>
                    <p className="text-xs font-medium text-neutral-200">Google Play</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Column 2 — Shop */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                Shop
              </h3>
              <ul className="space-y-2.5">
                {[
                  { label: 'Shoes', params: { category: 'shoes' } },
                  { label: 'Handbags', params: { category: 'handbags' } },
                  { label: 'Accessories', params: { category: 'accessories' } },
                  { label: 'New Arrivals', params: { sort: 'newest' } },
                  { label: 'Best Sellers', params: { sort: 'popular' } },
                  { label: 'Sale', params: { sale: 'true' } },
                ].map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => navigate('products', link.params)}
                      className="group text-sm text-neutral-400 hover:text-primary transition-all duration-200 inline-flex items-center"
                    >
                      <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
                        {link.label}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3 — Help */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                Help
              </h3>
              <ul className="space-y-2.5">
                {[
                  'Contact Us',
                  'Shipping & Delivery',
                  'Returns & Exchange',
                  'Size Guide',
                  'FAQ',
                  'Track Order',
                ].map((item) => (
                  <li key={item}>
                    <span className="group text-sm text-neutral-400 hover:text-primary transition-all duration-200 cursor-pointer inline-flex items-center">
                      <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
                        {item}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4 — Contact */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                Get in Touch
              </h3>
              <ul className="space-y-3.5">
                <li className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-neutral-400">+880 1XXX-XXXXXX</span>
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-neutral-400">hello@roshni.com.bd</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-neutral-400">Dhanmondi, Dhaka 1205, Bangladesh</span>
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <Clock className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-neutral-400">Sat–Thu: 10AM – 8PM</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Mobile dividers between columns */}
          <div className="sm:hidden">
            <Separator className="my-6 bg-neutral-800" />
          </div>

          {/* ===== Payment Methods Strip ===== */}
          <Separator className="my-8 bg-neutral-800" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-neutral-500 uppercase tracking-wider font-medium">
              We Accept
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {[
                { label: 'bKash', Icon: Smartphone },
                { label: 'Nagad', Icon: CreditCard },
                { label: 'Cash on Delivery', Icon: Banknote },
                { label: 'Visa / Mastercard', Icon: CreditCard },
              ].map(({ label, Icon }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-md border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-400"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* ===== Bottom Bar ===== */}
          <Separator className="my-8 bg-neutral-800" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
            <p>&copy; {new Date().getFullYear()} Roshni. All rights reserved.</p>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1">
              <span className="hover:text-neutral-300 cursor-pointer transition-colors">
                Privacy Policy
              </span>
              <span className="hover:text-neutral-300 cursor-pointer transition-colors">
                Terms of Service
              </span>
              <span className="hover:text-neutral-300 cursor-pointer transition-colors">
                Refund Policy
              </span>
            </div>
            <p className="text-neutral-600">Made with <span className="text-primary">❤️</span> in Bangladesh</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
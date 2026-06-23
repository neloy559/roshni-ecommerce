'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Mail, Phone, Eye, EyeOff, ArrowRight, Check, Loader2, Sparkles, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getApiUrl } from '@/lib/api-config';

function SuccessCheckmark() {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      className="flex items-center justify-center py-8"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        className="h-16 w-16 rounded-full bg-emerald-500 flex items-center justify-center"
      >
        <motion.div
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <Check className="h-8 w-8 text-white" strokeWidth={3} />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function PasswordStrengthBar({ password }: { password: string }) {
  const getStrength = () => {
    if (!password) return { level: 0, label: '', color: '' };
    const len = password.length;
    const hasUpper = /[A-Z]/.test(password);
    const hasNum = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    const score = (hasUpper ? 1 : 0) + (hasNum ? 1 : 0) + (hasSpecial ? 1 : 0) + (len >= 8 ? 1 : 0);
    if (score <= 1 || len < 6) return { level: 1, label: 'Weak', color: 'bg-red-400' };
    if (score <= 2) return { level: 2, label: 'Medium', color: 'bg-amber-400' };
    return { level: 3, label: 'Strong', color: 'bg-emerald-500' };
  };
  const { level, label, color } = getStrength();

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1.5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-all duration-300',
              i <= level ? color : 'bg-muted'
            )}
          />
        ))}
      </div>
      {label && (
        <p className={cn(
          'text-xs font-medium',
          level === 1 ? 'text-red-500' : level === 2 ? 'text-amber-500' : 'text-emerald-600'
        )}>
          {label}
        </p>
      )}
    </div>
  );
}

function DecorativePanel({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="relative overflow-hidden rounded-b-2xl bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-600 px-6 py-8 text-center text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-2 left-4 h-20 w-20 rounded-full border-2 border-white/40" />
          <div className="absolute bottom-2 right-6 h-32 w-32 rounded-full border border-white/30" />
          <div className="absolute top-6 right-12 h-8 w-8 rounded-full bg-white/20" />
        </div>
        <div className="relative z-10">
          <h2 className="text-2xl font-bold tracking-wide">ROSHNI</h2>
          <p className="mt-1 text-sm text-white/80">Where Style Meets Elegance</p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-300" />
            <span className="text-xs text-white/70">Curated Fashion for Women</span>
            <Sparkles className="h-4 w-4 text-amber-300" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative hidden lg:flex lg:w-1/2 items-center justify-center overflow-hidden bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-600 p-12 text-white">
      {/* Decorative circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-12 -left-12 h-64 w-64 rounded-full border-2 border-white/10" />
        <div className="absolute top-20 right-8 h-40 w-40 rounded-full border border-white/10" />
        <div className="absolute bottom-16 left-16 h-24 w-24 rounded-full bg-white/5" />
        <div className="absolute -bottom-8 right-24 h-48 w-48 rounded-full border border-white/8" />
        <div className="absolute top-1/3 left-1/4 h-3 w-3 rounded-full bg-amber-300/40" />
        <div className="absolute bottom-1/3 right-1/3 h-2 w-2 rounded-full bg-white/30" />
        <div className="absolute top-1/2 right-1/4 h-4 w-4 rounded-full bg-white/15" />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />
      </div>
      <div className="relative z-10 max-w-sm text-center">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
          <Sparkles className="h-8 w-8 text-amber-200" />
        </div>
        <h1 className="text-4xl font-bold tracking-wider">ROSHNI</h1>
        <div className="mx-auto mt-4 h-px w-16 bg-white/30" />
        <p className="mt-4 text-lg font-light text-white/90">Where Style Meets Elegance</p>
        <p className="mt-3 text-sm text-white/60 leading-relaxed">
          Discover our curated collection of women&apos;s fashion — from elegant shoes to stunning accessories.
        </p>
        <div className="mt-8 flex items-center justify-center gap-6 text-sm text-white/70">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">500+</p>
            <p className="text-xs text-white/50">Products</p>
          </div>
          <div className="h-8 w-px bg-white/20" />
          <div className="text-center">
            <p className="text-2xl font-bold text-white">10K+</p>
            <p className="text-xs text-white/50">Happy Customers</p>
          </div>
          <div className="h-8 w-px bg-white/20" />
          <div className="text-center">
            <p className="text-2xl font-bold text-white">4.8</p>
            <p className="text-xs text-white/50">Rating</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SocialLoginButtons() {
  const { addToast } = useAppStore();
  return (
    <div className="space-y-2.5">
      <div className="relative flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground uppercase tracking-wider">or continue with</span>
        <div className="h-px flex-1 bg-border" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => addToast('Google sign-in coming soon!', 'info')}
          className="flex items-center justify-center gap-2 rounded-xl border-2 border-border bg-background px-4 py-2.5 text-sm font-medium transition-all hover:border-primary/30 hover:bg-accent/50"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google
        </button>
        <button
          type="button"
          onClick={() => addToast('Facebook sign-in coming soon!', 'info')}
          className="flex items-center justify-center gap-2 rounded-xl border-2 border-border bg-background px-4 py-2.5 text-sm font-medium transition-all hover:border-primary/30 hover:bg-accent/50"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="#1877F2">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          Facebook
        </button>
      </div>
    </div>
  );
}

export function LoginPage() {
  const { navigate, setUser, addToast } = useAppStore();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(getApiUrl('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, phone, password }),
      });
      const data = await res.json();
      if (data.id) {
        setSuccess(true);
        setTimeout(() => {
          setUser(data);
          if (data.role === 'admin') navigate('admin');
          else navigate('account');
        }, 800);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch { setError('Something went wrong'); }
    setLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex">
      {/* Decorative Left Panel */}
      <DecorativePanel />

      {/* Mobile Decorative Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-10">
        <DecorativePanel compact />
      </div>

      {/* Form Side */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 lg:py-12 lg:pt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Mobile-only: space for decorative header */}
          <div className="lg:hidden h-36" />

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold tracking-tight">Welcome Back</h1>
            <p className="text-sm text-muted-foreground mt-1.5">Sign in to your Roshni account</p>
          </div>

          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <SuccessCheckmark />
                <p className="text-lg font-semibold text-emerald-600">Welcome back!</p>
                <p className="text-sm text-muted-foreground mt-1">Redirecting you...</p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleLogin}
                className="space-y-5"
              >
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="pl-10 h-11 rounded-xl border-2 transition-colors focus-visible:border-primary focus-visible:ring-0"
                    />
                  </div>
                </div>

                <div className="relative flex items-center gap-3">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted-foreground">or</span>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="pl-10 h-11 rounded-xl border-2 transition-colors focus-visible:border-primary focus-visible:ring-0"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Password</Label>
                    <button
                      type="button"
                      onClick={() => addToast('Password reset link sent to your email', 'info')}
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10 pr-10 h-11 rounded-xl border-2 transition-colors focus-visible:border-primary focus-visible:ring-0"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2"
                  >
                    {error}
                  </motion.p>
                )}

                <Button
                  type="submit"
                  className="w-full h-11 rounded-xl font-semibold text-sm"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Sign In
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>

                <SocialLoginButtons />

                <p className="text-center text-sm text-muted-foreground pt-2">
                  Don&apos;t have an account?{' '}
                  <button
                    onClick={() => navigate('register')}
                    className="text-primary font-semibold hover:underline"
                  >
                    Create one
                  </button>
                </p>

                <div className="p-3.5 bg-accent/50 rounded-xl border border-border/50">
                  <p className="font-semibold text-sm mb-1.5 flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5" /> Demo Accounts
                  </p>
                  <div className="space-y-0.5 text-xs text-muted-foreground">
                    <p><span className="font-medium text-foreground">Admin:</span> admin@roshni.com / admin123</p>
                    <p><span className="font-medium text-foreground">Customer:</span> nusrat@example.com / customer123</p>
                  </div>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

export function RegisterPage() {
  const { navigate, setUser, addToast } = useAppStore();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(getApiUrl('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', name, phone, email, password }),
      });
      const data = await res.json();
      if (data.id) {
        setSuccess(true);
        setTimeout(() => {
          setUser(data);
          navigate('home');
        }, 800);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch { setError('Something went wrong'); }
    setLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex">
      {/* Decorative Left Panel */}
      <DecorativePanel />

      {/* Mobile Decorative Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-10">
        <DecorativePanel compact />
      </div>

      {/* Form Side */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 lg:py-12 lg:pt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Mobile-only: space for decorative header */}
          <div className="lg:hidden h-36" />

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold tracking-tight">Create Account</h1>
            <p className="text-sm text-muted-foreground mt-1.5">Join Roshni for exclusive offers</p>
          </div>

          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <SuccessCheckmark />
                <p className="text-lg font-semibold text-emerald-600">Account created!</p>
                <p className="text-sm text-muted-foreground mt-1">Welcome to Roshni...</p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleRegister}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Full Name *</Label>
                  <Input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your name"
                    className="h-11 rounded-xl border-2 transition-colors focus-visible:border-primary focus-visible:ring-0"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="01XXXXXXXXX"
                        className="pl-10 h-11 rounded-xl border-2 transition-colors focus-visible:border-primary focus-visible:ring-0"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Email (optional)</Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="pl-10 h-11 rounded-xl border-2 transition-colors focus-visible:border-primary focus-visible:ring-0"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="pl-10 h-11 rounded-xl border-2 transition-colors focus-visible:border-primary focus-visible:ring-0"
                    />
                  </div>
                  <PasswordStrengthBar password={password} />
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2"
                  >
                    {error}
                  </motion.p>
                )}

                <Button
                  type="submit"
                  className="w-full h-11 rounded-xl font-semibold text-sm"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating Account...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Create Account
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>

                <SocialLoginButtons />

                <p className="text-center text-sm text-muted-foreground pt-2">
                  Already have an account?{' '}
                  <button
                    onClick={() => navigate('login')}
                    className="text-primary font-semibold hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
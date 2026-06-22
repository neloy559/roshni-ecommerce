'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Mail, Phone, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export function LoginPage() {
  const { navigate, setUser } = useAppStore();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, phone, password }),
      });
      const data = await res.json();
      if (data.id) {
        setUser(data);
        if (data.role === 'admin') navigate('admin');
        else navigate('account');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch { setError('Something went wrong'); }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">Welcome Back</h1>
        <p className="text-sm text-muted-foreground mt-1">Sign in to your Roshni account</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div><Label>Email</Label><div className="relative mt-1"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="pl-9 rounded-lg" /></div></div>
            <div className="text-center text-xs text-muted-foreground">— or —</div>
            <div><Label>Phone Number</Label><div className="relative mt-1"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="01XXXXXXXXX" className="pl-9 rounded-lg" /></div></div>
            <div>
              <Label>Password</Label>
              <div className="relative mt-1">
                <Input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="pr-9 rounded-lg" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full rounded-full h-11" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <button onClick={() => navigate('register')} className="text-primary font-medium hover:underline">Create one</button>
          </div>
          <div className="mt-6 p-3 bg-accent/50 rounded-lg text-xs text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Demo Accounts:</p>
            <p>Admin: admin@roshni.com / admin123</p>
            <p>Customer: nusrat@example.com / customer123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function RegisterPage() {
  const { navigate, setUser } = useAppStore();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', name, phone, email, password }),
      });
      const data = await res.json();
      if (data.id) { setUser(data); navigate('home'); }
      else { setError(data.error || 'Registration failed'); }
    } catch { setError('Something went wrong'); }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">Create Account</h1>
        <p className="text-sm text-muted-foreground mt-1">Join Roshni for exclusive offers</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleRegister} className="space-y-4">
            <div><Label>Full Name *</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className="mt-1 rounded-lg" /></div>
            <div><Label>Phone Number *</Label><Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="01XXXXXXXXX" className="mt-1 rounded-lg" /></div>
            <div><Label>Email (optional)</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="mt-1 rounded-lg" /></div>
            <div><Label>Password *</Label><Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" className="mt-1 rounded-lg" /></div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full rounded-full h-11" disabled={loading}>
              {loading ? 'Creating...' : 'Create Account'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <button onClick={() => navigate('login')} className="text-primary font-medium hover:underline">Sign in</button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Package, User, MapPin, LogOut, ChevronRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export function AccountPage() {
  const { user, setUser, navigate } = useAppStore();
  const [tab, setTab] = useState<'orders' | 'profile'>('orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile form
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saving, setSaving] = useState(false);

  // Address form
  const [addrName, setAddrName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrAddress, setAddrAddress] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrDistrict, setAddrDistrict] = useState('Dhaka');

  useEffect(() => {
    if (!user) { navigate('login'); return; }
    if (user.id) {
      fetch(`/api/orders?userId=${user.id}`).then(r => r.json()).then(d => { setOrders(d.orders || []); setLoading(false); });
    }
  }, [user]);

  if (!user) return null;

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, name, phone, email }),
      });
      const data = await res.json();
      if (data.id) setUser(data);
    } catch {}
    setSaving(false);
  };

  const handleAddAddress = () => {
    if (!addrName || !addrPhone || !addrAddress || !addrCity) return;
    const newAddr = { id: `addr-${Date.now()}`, name: addrName, phone: addrPhone, address: addrAddress, city: addrCity, district: addrDistrict, isDefault: !user.addresses.length };
    const updated = [...user.addresses, newAddr];
    fetch('/api/auth', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, addresses: updated }),
    }).then(r => r.json()).then(data => { if (data.id) setUser(data); });
    setAddrName(''); setAddrPhone(''); setAddrAddress(''); setAddrCity('');
  };

  const handleDeleteAddress = (addrId: string) => {
    const updated = user.addresses.filter(a => a.id !== addrId);
    fetch('/api/auth', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, addresses: updated }),
    }).then(r => r.json()).then(data => { if (data.id) setUser(data); });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Account Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
            {user.name[0]}
          </div>
          <div>
            <h1 className="text-xl font-bold">{user.name}</h1>
            <p className="text-sm text-muted-foreground">{user.phone} · {user.email}</p>
          </div>
        </div>
        {user.role === 'admin' && (
          <Button variant="outline" className="rounded-full text-xs" onClick={() => navigate('admin')}>Admin Panel</Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-xl mb-6">
        {[
          { id: 'orders' as const, label: 'Orders', icon: Package },
          { id: 'profile' as const, label: 'Profile', icon: User },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={cn('flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors', tab === t.id ? 'bg-white shadow-sm' : 'text-muted-foreground')}>
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* Orders Tab */}
      {tab === 'orders' && (
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <Card key={i}><CardContent className="p-4"><div className="h-20 bg-muted rounded animate-pulse" /></CardContent></Card>)
          ) : orders.length === 0 ? (
            <div className="text-center py-16">
              <Package className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No orders yet</p>
              <Button className="rounded-full" onClick={() => navigate('products')}>Start Shopping</Button>
            </div>
          ) : (
            orders.map((order: any) => (
              <Card key={order.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-mono text-sm font-medium">{order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium capitalize', statusColors[order.status] || 'bg-gray-100 text-gray-800')}>
                        {order.status}
                      </span>
                      <span className="text-sm font-bold">৳{order.total.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 overflow-x-auto">
                    {order.items.map((item: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 bg-muted rounded-lg p-2 shrink-0">
                        <div className="w-10 h-10 rounded overflow-hidden bg-muted-foreground/10 shrink-0">
                          {item.image && <img src={item.image} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate max-w-[120px]">{item.name}</p>
                          <p className="text-[10px] text-muted-foreground">x{item.quantity} · ৳{item.price.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Profile Tab */}
      {tab === 'profile' && (
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-lg">Personal Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div><Label>Name</Label><Input value={name} onChange={e => setName(e.target.value)} className="mt-1 rounded-lg" /></div>
                <div><Label>Phone</Label><Input value={phone} onChange={e => setPhone(e.target.value)} className="mt-1 rounded-lg" /></div>
              </div>
              <div><Label>Email</Label><Input value={email} onChange={e => setEmail(e.target.value)} className="mt-1 rounded-lg" /></div>
              <Button className="rounded-full" onClick={handleSaveProfile} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><MapPin className="h-5 w-5" /> Saved Addresses</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {user.addresses.map((addr: any) => (
                <div key={addr.id} className="flex items-start justify-between p-3 bg-accent/50 rounded-xl">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{addr.name} {addr.isDefault && <Badge variant="secondary" className="ml-1 text-[10px]">Default</Badge>}</p>
                    <p className="text-xs text-muted-foreground">{addr.phone}<br />{addr.address}, {addr.city}, {addr.district}</p>
                  </div>
                  <button onClick={() => handleDeleteAddress(addr.id)} className="text-xs text-destructive hover:underline">Remove</button>
                </div>
              ))}
              <Separator />
              <p className="text-sm font-medium">Add New Address</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <Input placeholder="Full Name" value={addrName} onChange={e => setAddrName(e.target.value)} className="rounded-lg" />
                <Input placeholder="Phone" value={addrPhone} onChange={e => setAddrPhone(e.target.value)} className="rounded-lg" />
              </div>
              <Input placeholder="Address (House, Road, Area)" value={addrAddress} onChange={e => setAddrAddress(e.target.value)} className="rounded-lg" />
              <div className="grid sm:grid-cols-2 gap-3">
                <Input placeholder="City" value={addrCity} onChange={e => setAddrCity(e.target.value)} className="rounded-lg" />
                <Input placeholder="District" value={addrDistrict} onChange={e => setAddrDistrict(e.target.value)} className="rounded-lg" />
              </div>
              <Button variant="outline" className="rounded-full" onClick={handleAddAddress}>+ Add Address</Button>
            </CardContent>
          </Card>

          <Button variant="outline" className="rounded-full text-destructive" onClick={() => { setUser(null); navigate('home'); }}>
            <LogOut className="h-4 w-4 mr-2" /> Sign Out
          </Button>
        </div>
      )}
    </div>
  );
}
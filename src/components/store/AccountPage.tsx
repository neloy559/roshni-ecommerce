'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import {
  Package,
  User,
  MapPin,
  LogOut,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  Phone,
  Mail,
  Calendar,
  Star,
  Plus,
  Trash2,
  Pencil,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getApiUrl } from '@/lib/api-config';

const statusConfig: Record<string, { color: string; bg: string; dot: string; label: string }> = {
  pending: { color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', dot: 'bg-amber-500', label: 'Pending' },
  processing: { color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', dot: 'bg-blue-500', label: 'Processing' },
  shipped: { color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200', dot: 'bg-purple-500', label: 'Shipped' },
  delivered: { color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500', label: 'Delivered' },
  cancelled: { color: 'text-red-700', bg: 'bg-red-50 border-red-200', dot: 'bg-red-500', label: 'Cancelled' },
};

const tabList = [
  { id: 'orders' as const, label: 'Orders', icon: Package },
  { id: 'profile' as const, label: 'Profile', icon: User },
  { id: 'addresses' as const, label: 'Addresses', icon: MapPin },
];

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarGradient(name: string): string {
  const gradients = [
    'from-rose-400 to-pink-500',
    'from-fuchsia-400 to-purple-500',
    'from-amber-400 to-orange-500',
    'from-emerald-400 to-teal-500',
    'from-sky-400 to-cyan-500',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return gradients[Math.abs(hash) % gradients.length];
}

export function AccountPage() {
  const { user, setUser, navigate, addToast } = useAppStore();
  const [tab, setTab] = useState<'orders' | 'profile' | 'addresses'>('orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(!!user?.id);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // Profile form
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saving, setSaving] = useState(false);

  // Address form
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [editingAddrId, setEditingAddrId] = useState<string | null>(null);
  const [addrName, setAddrName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrAddress, setAddrAddress] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrDistrict, setAddrDistrict] = useState('Dhaka');

  useEffect(() => {
    if (!user) {
      navigate('login');
      return;
    }
    if (user.id) {
      fetch(getApiUrl(`/api/orders?userId=${user.id}`)
        .then((r) => r.json())
        .then((d) => {
          setOrders(d.orders || []);
        })
        .finally(() => setLoading(false));
    }
  }, [user, navigate]);

  if (!user) return null;

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch(getApiUrl('/api/auth', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, name, phone, email }),
      });
      const data = await res.json();
      if (data.id) {
        setUser(data);
        addToast('Profile updated successfully!');
      }
    } catch {
      addToast('Failed to update profile', 'error');
    }
    setSaving(false);
  };

  const resetAddrForm = () => {
    setAddrName('');
    setAddrPhone('');
    setAddrAddress('');
    setAddrCity('');
    setAddrDistrict('Dhaka');
    setShowAddrForm(false);
    setEditingAddrId(null);
  };

  const handleSaveAddress = () => {
    if (!addrName || !addrPhone || !addrAddress || !addrCity) {
      addToast('Please fill in all required fields', 'error');
      return;
    }

    let updated;
    if (editingAddrId) {
      updated = user.addresses.map((a) =>
        a.id === editingAddrId
          ? { ...a, name: addrName, phone: addrPhone, address: addrAddress, city: addrCity, district: addrDistrict }
          : a
      );
    } else {
      const newAddr = {
        id: `addr-${Date.now()}`,
        name: addrName,
        phone: addrPhone,
        address: addrAddress,
        city: addrCity,
        district: addrDistrict,
        isDefault: !user.addresses.length,
      };
      updated = [...user.addresses, newAddr];
    }

    fetch(getApiUrl('/api/auth', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, addresses: updated }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.id) {
          setUser(data);
          addToast(editingAddrId ? 'Address updated!' : 'Address added!');
          resetAddrForm();
        }
      });
  };

  const handleDeleteAddress = (addrId: string) => {
    const updated = user.addresses.filter((a) => a.id !== addrId);
    fetch(getApiUrl('/api/auth', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, addresses: updated }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.id) {
          setUser(data);
          addToast('Address removed');
        }
      });
  };

  const handleSetDefault = (addrId: string) => {
    const updated = user.addresses.map((a) => ({
      ...a,
      isDefault: a.id === addrId,
    }));
    fetch(getApiUrl('/api/auth', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, addresses: updated }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.id) {
          setUser(data);
          addToast('Default address updated');
        }
      });
  };

  const handleEditAddress = (addr: any) => {
    setEditingAddrId(addr.id);
    setAddrName(addr.name);
    setAddrPhone(addr.phone);
    setAddrAddress(addr.address);
    setAddrCity(addr.city);
    setAddrDistrict(addr.district);
    setShowAddrForm(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 border border-rose-100 p-6 sm:p-8 mb-8 overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-rose-200/30 to-transparent rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-fuchsia-200/20 to-transparent rounded-full translate-y-1/2 -translate-x-1/3" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div
            className={cn(
              'h-20 w-20 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-rose-200/50 flex-shrink-0',
              getAvatarGradient(user.name)
            )}
          >
            {getInitials(user.name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-1">
              <h1 className="text-2xl font-bold text-foreground truncate">{user.name}</h1>
              {user.role === 'admin' && (
                <Badge className="bg-gradient-to-r from-amber-400 to-orange-400 text-white border-0 gap-1">
                  <ShieldCheck className="h-3 w-3" /> Admin
                </Badge>
              )}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" /> {user.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" /> {user.phone}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
              <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
              <span>Member of Roshni</span>
            </div>
          </div>
          {user.role === 'admin' && (
            <Button
              variant="outline"
              className="rounded-full text-xs border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 flex-shrink-0"
              onClick={() => navigate('admin')}
            >
              Open Admin Panel
            </Button>
          )}
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <div className="relative mb-8">
        <div className="flex border-b border-border">
          {tabList.map((t) => {
            const isActive = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  'relative flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium transition-colors',
                  isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/70'
                )}
              >
                <t.icon className="h-4 w-4" />
                <span>{t.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="account-tab-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Tab */}
      <AnimatePresence mode="wait">
        {tab === 'orders' && (
          <motion.div
            key="orders"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="space-y-2">
                          <div className="h-4 w-28 bg-muted rounded animate-pulse" />
                          <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                        </div>
                        <div className="h-6 w-20 bg-muted rounded-full animate-pulse" />
                      </div>
                      <div className="h-16 bg-muted rounded-lg animate-pulse" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-20 px-4"
              >
                <div className="relative mb-6">
                  <div className="h-28 w-28 rounded-full bg-rose-50 flex items-center justify-center">
                    <ShoppingBag className="h-14 w-14 text-rose-300" strokeWidth={1.5} />
                  </div>
                  <div className="absolute -top-1 -right-1 h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                    <Package className="h-4 w-4 text-amber-500" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
                <p className="text-muted-foreground text-sm text-center max-w-xs mb-6">
                  Your order history will appear here once you make your first purchase.
                </p>
                <Button
                  className="rounded-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-lg shadow-rose-200/50"
                  onClick={() => navigate('products')}
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Start Shopping
                </Button>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {orders.map((order: any) => {
                  const status = statusConfig[order.status] || statusConfig.pending;
                  const isExpanded = expandedOrder === order.id;
                  return (
                    <Collapsible
                      key={order.id}
                      open={isExpanded}
                      onOpenChange={(open) => setExpandedOrder(open ? order.id : null)}
                    >
                      <Card className="overflow-hidden transition-shadow hover:shadow-md">
                        <CollapsibleTrigger className="w-full text-left">
                          <CardContent className="p-4 sm:p-5">
                            <div className="flex items-start sm:items-center justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-mono text-sm font-semibold tracking-wide">
                                    #{order.orderNumber}
                                  </p>
                                </div>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(order.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                  })}
                                </p>
                              </div>
                              <div className="flex items-center gap-3 flex-shrink-0">
                                <div className="text-right">
                                  <p className="text-base font-bold">৳{order.total.toLocaleString()}</p>
                                  <p className="text-[11px] text-muted-foreground">
                                    {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}
                                  </p>
                                </div>
                                <span
                                  className={cn(
                                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border',
                                    status.bg,
                                    status.color
                                  )}
                                >
                                  <span className={cn('h-1.5 w-1.5 rounded-full', status.dot)} />
                                  {status.label}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center justify-end mt-2">
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                {isExpanded ? 'Hide details' : 'View details'}
                                {isExpanded ? (
                                  <ChevronUp className="h-3.5 w-3.5" />
                                ) : (
                                  <ChevronDown className="h-3.5 w-3.5" />
                                )}
                              </span>
                            </div>
                          </CardContent>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="border-t border-border">
                            <div className="p-4 sm:p-5 space-y-3 bg-muted/20">
                              {order.items?.map((item: any, i: number) => (
                                <div
                                  key={i}
                                  className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border/50"
                                >
                                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                    {item.image ? (
                                      <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <ShoppingBag className="h-5 w-5 text-muted-foreground/40" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{item.name}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      {item.variant?.size && (
                                        <span className="text-xs text-muted-foreground">
                                          Size: {item.variant.size}
                                        </span>
                                      )}
                                      {item.variant?.color && (
                                        <span className="text-xs text-muted-foreground">
                                          Color: {item.variant.color}
                                        </span>
                                      )}
                                      <span className="text-xs text-muted-foreground">
                                        Qty: {item.quantity}
                                      </span>
                                    </div>
                                  </div>
                                  <p className="text-sm font-semibold flex-shrink-0">
                                    ৳{(item.price * item.quantity).toLocaleString()}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Card>
                    </Collapsible>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* Profile Tab */}
        {tab === 'profile' && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <Card className="overflow-hidden">
              <CardHeader className="bg-muted/30 border-b border-border">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-rose-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-rose-600" />
                  </div>
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 sm:p-6 space-y-5">
                <p className="text-sm text-muted-foreground -mt-1">
                  Update your personal details here. This information will be used for your orders and account.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="profile-name" className="text-sm font-medium">
                      Full Name
                    </Label>
                    <Input
                      id="profile-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="rounded-xl h-11"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-phone" className="text-sm font-medium">
                      Phone Number
                    </Label>
                    <Input
                      id="profile-phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="rounded-xl h-11"
                      placeholder="01XXXXXXXXX"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="profile-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-xl h-11"
                    placeholder="your@email.com"
                  />
                </div>
                <div className="pt-2">
                  <Button
                    className="rounded-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-md shadow-rose-200/50"
                    onClick={handleSaveProfile}
                    disabled={saving}
                  >
                    {saving ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saving...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Check className="h-4 w-4" />
                        Save Changes
                      </span>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive/20">
              <CardContent className="p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-destructive">Sign Out</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      You will need to log in again to access your account.
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="rounded-full text-destructive border-destructive/30 hover:bg-destructive/5 hover:text-destructive">
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-2xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Sign out of your account?</AlertDialogTitle>
                        <AlertDialogDescription>
                          You will be signed out and redirected to the home page. Any unsaved changes will be lost.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="rounded-full bg-destructive text-white hover:bg-destructive/90"
                          onClick={() => {
                            setUser(null);
                            navigate('home');
                          }}
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign Out
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Addresses Tab */}
        {tab === 'addresses' && (
          <motion.div
            key="addresses"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Saved Addresses</h2>
                <p className="text-sm text-muted-foreground">
                  Manage your delivery addresses for faster checkout.
                </p>
              </div>
              {!showAddrForm && (
                <Button
                  className="rounded-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-md shadow-rose-200/50"
                  onClick={() => {
                    resetAddrForm();
                    setShowAddrForm(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Add New
                </Button>
              )}
            </div>

            {/* Address Form */}
            <AnimatePresence>
              {showAddrForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <Card className="border-rose-200 border-dashed overflow-hidden">
                    <CardHeader className="bg-rose-50/50 border-b border-rose-100 py-4">
                      <CardTitle className="text-base flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-rose-500" />
                          {editingAddrId ? 'Edit Address' : 'New Address'}
                        </span>
                        <button
                          onClick={resetAddrForm}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          ✕
                        </button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium text-muted-foreground">Full Name *</Label>
                          <Input
                            placeholder="Recipient name"
                            value={addrName}
                            onChange={(e) => setAddrName(e.target.value)}
                            className="rounded-xl h-10"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium text-muted-foreground">Phone *</Label>
                          <Input
                            placeholder="01XXXXXXXXX"
                            value={addrPhone}
                            onChange={(e) => setAddrPhone(e.target.value)}
                            className="rounded-xl h-10"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground">Full Address *</Label>
                        <Input
                          placeholder="House, Road, Area"
                          value={addrAddress}
                          onChange={(e) => setAddrAddress(e.target.value)}
                          className="rounded-xl h-10"
                        />
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium text-muted-foreground">City *</Label>
                          <Input
                            placeholder="City name"
                            value={addrCity}
                            onChange={(e) => setAddrCity(e.target.value)}
                            className="rounded-xl h-10"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium text-muted-foreground">District</Label>
                          <Input
                            placeholder="District"
                            value={addrDistrict}
                            onChange={(e) => setAddrDistrict(e.target.value)}
                            className="rounded-xl h-10"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-3 pt-2">
                        <Button
                          className="rounded-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white"
                          onClick={handleSaveAddress}
                        >
                          {editingAddrId ? 'Update Address' : 'Save Address'}
                        </Button>
                        <Button variant="ghost" className="rounded-full" onClick={resetAddrForm}>
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Address List */}
            {user.addresses.length === 0 && !showAddrForm ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
                  <MapPin className="h-10 w-10 text-muted-foreground/40" />
                </div>
                <h3 className="font-semibold mb-1">No saved addresses</h3>
                <p className="text-sm text-muted-foreground mb-4">Add an address for faster checkout.</p>
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => setShowAddrForm(true)}
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Add Your First Address
                </Button>
              </motion.div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {user.addresses.map((addr) => (
                  <motion.div
                    key={addr.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      'relative group rounded-xl border p-4 transition-all hover:shadow-md',
                      addr.isDefault
                        ? 'border-rose-200 bg-rose-50/30 ring-1 ring-rose-100'
                        : 'border-border bg-card'
                    )}
                  >
                    {addr.isDefault && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-rose-500 text-white border-0 text-[10px] px-2 py-0.5 gap-1">
                          <Check className="h-2.5 w-2.5" />
                          Default
                        </Badge>
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold">{addr.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{addr.phone}</p>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          {addr.address}, {addr.city}, {addr.district}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/50">
                      {!addr.isDefault && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs rounded-full hover:text-rose-600"
                          onClick={() => handleSetDefault(addr.id)}
                        >
                          <Star className="h-3 w-3 mr-1" />
                          Set as Default
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs rounded-full"
                        onClick={() => handleEditAddress(addr)}
                      >
                        <Pencil className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs rounded-full text-destructive hover:text-destructive"
                        onClick={() => handleDeleteAddress(addr.id)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
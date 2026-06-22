'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { 
  LayoutDashboard, Package, FolderTree, ClipboardList, Image, Settings, ArrowLeft, LogOut, Plus, Trash2, Edit, Eye, Search, DollarSign, Users, TrendingUp, AlertTriangle, X, Save, ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type AdminTab = 'overview' | 'products' | 'categories' | 'orders' | 'banners' | 'settings';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export function AdminDashboard() {
  const { user, isAdmin, navigate, setUser } = useAppStore();
  const [tab, setTab] = useState<AdminTab>('overview');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !isAdmin()) { navigate('login'); return; }
    fetch('/api/admin/stats').then(r => r.json()).then(s => { setStats(s); setLoading(false); });
  }, []);

  if (!user || !isAdmin()) return null;

  const tabs: { id: AdminTab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'categories', label: 'Categories', icon: FolderTree },
    { id: 'orders', label: 'Orders', icon: ClipboardList },
    { id: 'banners', label: 'Banners', icon: Image },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-[calc(100vh-44px)] overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden md:flex w-56 flex-col border-r bg-card">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">{user.name[0]}</div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-[10px] text-muted-foreground">Administrator</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={cn('w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors', tab === t.id ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-accent')}>
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t space-y-1">
          <button onClick={() => navigate('home')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-accent">
            <ArrowLeft className="h-4 w-4" /> Back to Store
          </button>
          <button onClick={() => { setUser(null); navigate('home'); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-destructive hover:bg-destructive/10">
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Tab Bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-card border-t flex overflow-x-auto">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={cn('flex-1 min-w-0 flex flex-col items-center gap-1 py-2 text-[10px]', tab === t.id ? 'text-primary' : 'text-muted-foreground')}>
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-20 md:pb-6">
        {loading && tab === 'overview' ? <OverviewSkeleton /> : null}
        {tab === 'overview' && stats && <OverviewTab stats={stats} />}
        {tab === 'products' && <ProductsTab />}
        {tab === 'categories' && <CategoriesTab />}
        {tab === 'orders' && <OrdersTab />}
        {tab === 'banners' && <BannersTab />}
        {tab === 'settings' && <SettingsTab />}
      </main>
    </div>
  );
}

function OverviewSkeleton() {
  return <div className="space-y-6">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>;
}

function OverviewTab({ stats }: { stats: any }) {
  const cards = [
    { label: 'Total Revenue', value: `৳${(stats.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Total Orders', value: stats.totalOrders || 0, icon: ClipboardList, color: 'text-blue-600 bg-blue-50' },
    { label: 'Products', value: stats.totalProducts || 0, icon: Package, color: 'text-purple-600 bg-purple-50' },
    { label: 'Customers', value: stats.totalUsers || 0, icon: Users, color: 'text-orange-600 bg-orange-50' },
    { label: 'Pending Orders', value: stats.pendingOrders || 0, icon: TrendingUp, color: 'text-yellow-600 bg-yellow-50' },
    { label: 'Low Stock', value: stats.lowStock || 0, icon: AlertTriangle, color: 'text-red-600 bg-red-50' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard Overview</h2>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(c => (
          <Card key={c.label}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className={cn('h-12 w-12 rounded-xl flex items-center justify-center shrink-0', c.color)}><c.icon className="h-6 w-6" /></div>
              <div><p className="text-xs text-muted-foreground">{c.label}</p><p className="text-xl font-bold">{c.value}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Recent Orders</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Order #</TableHead><TableHead>Status</TableHead><TableHead>Payment</TableHead><TableHead className="text-right">Total</TableHead></TableRow></TableHeader>
              <TableBody>
                {(stats.recentOrders || []).map((o: any) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono text-xs">{o.orderNumber}</TableCell>
                    <TableCell><span className={cn('px-2 py-0.5 rounded-full text-xs font-medium capitalize', statusColors[o.status])}>{o.status}</span></TableCell>
                    <TableCell className="capitalize text-xs">{o.paymentStatus}</TableCell>
                    <TableCell className="text-right font-medium">৳{o.total.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
                {(!stats.recentOrders || stats.recentOrders.length === 0) && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No orders yet</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProductsTab() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', slug: '', description: '', price: '', discountPrice: '', stock: '', images: '', categoryId: '', status: 'active', tags: '', isTrending: false, isNewArrival: true });

  const fetchProducts = () => { fetch('/api/admin/products').then(r => r.json()).then(d => { setProducts(d); setLoading(false); }); };
  useEffect(() => { fetchProducts(); fetch('/api/categories').then(r => r.json()).then(setCategories); }, []);

  const filtered = products.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()));

  const handleSave = async () => {
    const body = { ...form, price: parseFloat(form.price), discountPrice: form.discountPrice ? parseFloat(form.discountPrice) : null, stock: parseInt(form.stock), images: form.images.split('\n').filter(Boolean), categoryId: form.categoryId, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };
    if (editId) {
      await fetch('/api/admin/products', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editId, ...body }) });
    } else {
      await fetch('/api/admin/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    }
    setDialogOpen(false); setEditId(null); resetForm(); fetchProducts();
  };

  const handleDelete = async (id: string) => { if (confirm('Delete this product?')) { await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' }); fetchProducts(); } };
  const handleEdit = (p: any) => { setEditId(p.id); setForm({ name: p.name, slug: p.slug, description: p.description, price: String(p.price), discountPrice: p.discountPrice ? String(p.discountPrice) : '', stock: String(p.stock), images: (p.images || []).join('\n'), categoryId: p.categoryId, status: p.status, tags: (p.tags || []).join(', '), isTrending: p.isTrending, isNewArrival: p.isNewArrival }); setDialogOpen(true); };
  const resetForm = () => setForm({ name: '', slug: '', description: '', price: '', discountPrice: '', stock: '', images: '', categoryId: '', status: 'active', tags: '', isTrending: false, isNewArrival: true });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Products ({filtered.length})</h2>
        <Dialog open={dialogOpen} onOpenChange={o => { setDialogOpen(o); if (!o) { setEditId(null); resetForm(); } }}>
          <DialogTrigger asChild><Button className="rounded-full gap-2"><Plus className="h-4 w-4" /> Add Product</Button></DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editId ? 'Edit' : 'New'} Product</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') })} className="mt-1" /></div>
                <div><Label>Slug</Label><Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="mt-1" /></div>
              </div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="mt-1" rows={3} /></div>
              <div className="grid grid-cols-3 gap-4">
                <div><Label>Price *</Label><Input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="mt-1" /></div>
                <div><Label>Discount Price</Label><Input type="number" value={form.discountPrice} onChange={e => setForm({ ...form, discountPrice: e.target.value })} className="mt-1" /></div>
                <div><Label>Stock *</Label><Input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} className="mt-1" /></div>
              </div>
              <div><Label>Category</Label><Select value={form.categoryId} onValueChange={v => setForm({ ...form, categoryId: v })}><SelectTrigger className="mt-1"><SelectValue placeholder="Select..." /></SelectTrigger><SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Image URLs (one per line)</Label><Textarea value={form.images} onChange={e => setForm({ ...form, images: e.target.value })} className="mt-1" rows={3} /></div>
              <div><Label>Tags (comma separated)</Label><Input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} className="mt-1" /></div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isTrending} onChange={e => setForm({ ...form, isTrending: e.target.checked })} /> Trending</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isNewArrival} onChange={e => setForm({ ...form, isNewArrival: e.target.checked })} /> New Arrival</label>
              </div>
              <Button onClick={handleSave} className="w-full rounded-full">{editId ? 'Update' : 'Create'} Product</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="relative max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 rounded-full" /></div>
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead>Product</TableHead><TableHead className="hidden sm:table-cell">Category</TableHead><TableHead>Price</TableHead><TableHead>Stock</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.map(p => (
                <TableRow key={p.id}>
                  <TableCell><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg overflow-hidden bg-muted shrink-0">{p.images[0] && <img src={p.images[0]} alt="" className="w-full h-full object-cover" />}</div><span className="text-sm font-medium truncate max-w-[150px]">{p.name}</span></div></TableCell>
                  <TableCell className="hidden sm:table-cell text-sm">{p.category?.name}</TableCell>
                  <TableCell><span className="text-sm font-medium">৳{p.price.toLocaleString()}</span>{p.discountPrice && <span className="text-xs text-muted-foreground ml-1 line-through">৳{p.discountPrice.toLocaleString()}</span>}</TableCell>
                  <TableCell><span className={cn('text-sm', p.stock <= 5 ? 'text-destructive font-medium' : '')}>{p.stock}</span></TableCell>
                  <TableCell><Badge variant="secondary" className="text-xs">{p.status}</Badge></TableCell>
                  <TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => handleEdit(p)}><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No products found</TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

function CategoriesTab() {
  const [categories, setCategories] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', image: '', parentId: '', order: '0' });

  const fetchCats = () => { fetch('/api/admin/categories').then(r => r.json()).then(setCategories); };
  useEffect(fetchCats, []);

  const handleSave = async () => {
    await fetch('/api/admin/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, order: parseInt(form.order) }) });
    setDialogOpen(false); setForm({ name: '', slug: '', image: '', parentId: '', order: '0' }); fetchCats();
  };

  const handleDelete = async (id: string) => { if (confirm('Delete?')) { await fetch(`/api/admin/categories?id=${id}`, { method: 'DELETE' }); fetchCats(); } };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Categories</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button className="rounded-full gap-2"><Plus className="h-4 w-4" /> Add</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Category</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} className="mt-1" /></div>
              <div><Label>Image URL</Label><Input value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} className="mt-1" /></div>
              <div><Label>Display Order</Label><Input type="number" value={form.order} onChange={e => setForm({ ...form, order: e.target.value })} className="mt-1" /></div>
              <Button onClick={handleSave} className="w-full rounded-full">Create Category</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.filter(c => !c.parentId).map(cat => (
          <Card key={cat.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted shrink-0">{cat.image && <img src={cat.image} alt="" className="w-full h-full object-cover" />}</div>
                  <div><p className="font-medium">{cat.name}</p><p className="text-xs text-muted-foreground">{cat.productCount} products</p></div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(cat.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
              {categories.filter(c => c.parentId === cat.id).length > 0 && (
                <div className="mt-3 pt-3 border-t space-y-2">
                  {categories.filter(c => c.parentId === cat.id).map(sub => (
                    <div key={sub.id} className="flex items-center justify-between text-sm">
                      <span>{sub.name} <span className="text-muted-foreground">({sub.productCount})</span></span>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(sub.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function OrdersTab() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/admin/orders').then(r => r.json()).then(d => { setOrders(d); setLoading(false); });
  }, []);

  const filtered = orders.filter((o: any) => !search || o.orderNumber.toLowerCase().includes(search.toLowerCase()));

  const updateStatus = async (orderId: string, status: string) => {
    await fetch('/api/admin/orders', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId, status }) });
    setOrders(orders.map((o: any) => o.id === orderId ? { ...o, status } : o));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Orders ({filtered.length})</h2>
      <div className="relative max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search order #..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 rounded-full" /></div>
      <div className="space-y-3">
        {filtered.map((o: any) => (
          <Card key={o.id}>
            <CardContent className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <p className="font-mono text-sm font-medium">{o.orderNumber}</p>
                  <p className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleString()}</p>
                  {o.user && <p className="text-xs text-muted-foreground">{o.user.name} · {o.user.phone}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <Select value={o.status} onValueChange={v => updateStatus(o.id, v)}>
                    <SelectTrigger className="w-32 h-8 text-xs rounded-full"><SelectValue /></SelectTrigger>
                    <SelectContent>{['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
                  </Select>
                  <span className="text-sm font-bold">৳{o.total.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {(o.items || []).map((item: any, i: number) => (
                  <span key={i} className="text-xs bg-muted px-2 py-1 rounded-full">{item.name} ×{item.quantity}</span>
                ))}
              </div>
              <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                <span>Payment: <span className={o.paymentStatus === 'completed' ? 'text-emerald-600 font-medium' : ''}>{o.paymentStatus}</span></span>
                <span>Method: {o.paymentProvider || 'N/A'}</span>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">No orders found</p>}
      </div>
    </div>
  );
}

function BannersTab() {
  const [banners, setBanners] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ image: '', title: '', subtitle: '', linkTarget: '', order: '0', isActive: true });

  const fetchBanners = () => { fetch('/api/admin/banners').then(r => r.json()).then(setBanners); };
  useEffect(fetchBanners, []);

  const handleSave = async () => {
    await fetch('/api/admin/banners', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, order: parseInt(form.order) }) });
    setDialogOpen(false); setForm({ image: '', title: '', subtitle: '', linkTarget: '', order: '0', isActive: true }); fetchBanners();
  };

  const handleDelete = async (id: string) => { if (confirm('Delete?')) { await fetch(`/api/admin/banners?id=${id}`, { method: 'DELETE' }); fetchBanners(); } };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Banners</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button className="rounded-full gap-2"><Plus className="h-4 w-4" /> Add Banner</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Banner</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div><Label>Image URL *</Label><Input value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} className="mt-1" /></div>
              {form.image && <div className="h-40 rounded-xl overflow-hidden bg-muted"><img src={form.image} alt="" className="w-full h-full object-cover" /></div>}
              <div><Label>Title</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="mt-1" /></div>
              <div><Label>Subtitle</Label><Input value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} className="mt-1" /></div>
              <div><Label>Link Target</Label><Input value={form.linkTarget} onChange={e => setForm({ ...form, linkTarget: e.target.value })} className="mt-1" /></div>
              <div><Label>Order</Label><Input type="number" value={form.order} onChange={e => setForm({ ...form, order: e.target.value })} className="mt-1" /></div>
              <Button onClick={handleSave} className="w-full rounded-full">Create Banner</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {banners.map(b => (
          <Card key={b.id} className="overflow-hidden">
            <div className="aspect-video bg-muted relative">
              <img src={b.image} alt="" className="w-full h-full object-cover" />
              {!b.isActive && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Badge variant="secondary">Inactive</Badge></div>}
            </div>
            <CardContent className="p-3">
              <p className="text-sm font-medium">{b.title || 'Untitled'}</p>
              <p className="text-xs text-muted-foreground">{b.subtitle}</p>
              <div className="flex justify-end mt-2"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(b.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function SettingsTab() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetch('/api/admin/settings').then(r => r.json()).then(setSettings); }, []);

  const handleSave = async () => {
    setSaving(true);
    await fetch('/api/admin/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) });
    setSaving(false);
  };

  const fields = [
    { key: 'storeName', label: 'Store Name' },
    { key: 'storeTagline', label: 'Tagline' },
    { key: 'contactEmail', label: 'Contact Email' },
    { key: 'contactPhone', label: 'Contact Phone' },
    { key: 'shippingCost', label: 'Shipping Cost (৳)' },
    { key: 'freeShippingThreshold', label: 'Free Shipping Over (৳)' },
    { key: 'facebookUrl', label: 'Facebook URL' },
    { key: 'instagramUrl', label: 'Instagram URL' },
  ];

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-2xl font-bold">Store Settings</h2>
      <Card>
        <CardContent className="pt-6 space-y-4">
          {fields.map(f => (
            <div key={f.key}><Label>{f.label}</Label><Input value={settings[f.key] || ''} onChange={e => setSettings({ ...settings, [f.key]: e.target.value })} className="mt-1" /></div>
          ))}
          <Button onClick={handleSave} disabled={saving} className="rounded-full gap-2"><Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save Settings'}</Button>
        </CardContent>
      </Card>
    </div>
  );
}
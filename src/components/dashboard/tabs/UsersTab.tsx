'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Users,
  Loader2,
  Bell,
  BellOff,
} from 'lucide-react';

/* ── Types ── */

interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: string;
  notifications: boolean;
  createdAt: string;
}

/* ── Helpers ── */

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('zalsports_admin_token');
}

function roleBadge(role: string) {
  switch (role) {
    case 'admin':
      return <Badge className="bg-primary/15 text-primary border-primary/30 hover:bg-primary/20">Admin</Badge>;
    case 'manager':
      return <Badge className="bg-blue-500/15 text-blue-600 border-blue-500/30 hover:bg-blue-500/20">Manager</Badge>;
    default:
      return <Badge variant="secondary">Utilisateur</Badge>;
  }
}

/* ── Component ── */

export default function UsersTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', role: 'user' });
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch('/api/admin/users', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const json = await res.json();
        setUsers(json.data || json || []);
      }
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filtered = users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.phone.includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  const openAddDialog = () => {
    setEditUser(null);
    setForm({ name: '', phone: '', email: '', role: 'user' });
    setDialogOpen(true);
  };

  const openEditDialog = (user: User) => {
    setEditUser(user);
    setForm({ name: user.name, phone: user.phone, email: user.email, role: user.role });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.phone) return;
    setSubmitting(true);
    try {
      const token = getToken();
      const url = editUser ? `/api/admin/users/${editUser.id}` : '/api/admin/users';
      const method = editUser ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setDialogOpen(false);
        fetchUsers();
      }
    } catch { /* silent */ } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = getToken();
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchUsers();
    } catch { /* silent */ }
  };

  const toggleNotifications = async (user: User) => {
    try {
      const token = getToken();
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...user, notifications: !user.notifications }),
      });
      if (res.ok) fetchUsers();
    } catch { /* silent */ }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="users-content"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.35 }}
        className="p-6 space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Utilisateurs</h1>
            <p className="text-muted-foreground mt-1 text-sm">Gérez les comptes utilisateurs</p>
          </div>
          <Button onClick={openAddDialog}>
            <Plus className="w-4 h-4 mr-1.5" /> Ajouter
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un utilisateur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Table */}
        <Card className="bg-card border-border">
          <CardContent className="p-0">
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto custom-scrollbar">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead className="text-xs">Nom</TableHead>
                    <TableHead className="text-xs">Tél</TableHead>
                    <TableHead className="text-xs">Email</TableHead>
                    <TableHead className="text-xs">Rôle</TableHead>
                    <TableHead className="text-xs">Notifications</TableHead>
                    <TableHead className="text-xs text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10">
                        <Loader2 className="w-5 h-5 animate-spin mx-auto text-primary" />
                      </TableCell>
                    </TableRow>
                  ) : filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-muted-foreground text-sm">
                        <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        Aucun utilisateur trouvé.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((u) => (
                      <TableRow key={u.id} className="border-border/30">
                        <TableCell className="text-sm font-medium">{u.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{u.phone}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{u.email || '—'}</TableCell>
                        <TableCell>{roleBadge(u.role)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost" size="sm" className="h-7 w-7 p-0"
                            onClick={() => toggleNotifications(u)}
                            title={u.notifications ? 'Désactiver les notifications' : 'Activer les notifications'}
                          >
                            {u.notifications ? (
                              <Bell className="w-3.5 h-3.5 text-primary" />
                            ) : (
                              <BellOff className="w-3.5 h-3.5 text-muted-foreground" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-0.5">
                            <Button
                              variant="ghost" size="sm" className="h-7 w-7 p-0"
                              onClick={() => openEditDialog(u)} title="Modifier"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                              onClick={() => handleDelete(u.id)} title="Supprimer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Nom</Label>
                <Input
                  placeholder="Nom complet"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Téléphone</Label>
                <Input
                  placeholder="+221 XX XXX XXXX"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="email@exemple.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Rôle</Label>
                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Utilisateur</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
              <Button onClick={handleSubmit} disabled={submitting || !form.name || !form.phone}>
                {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {editUser ? 'Enregistrer' : 'Ajouter'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </AnimatePresence>
  );
}

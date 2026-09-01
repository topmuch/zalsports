'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { UserPlus, Trash2, Shield, Loader2, Users } from 'lucide-react';
import { toast } from 'sonner';

interface AdminAccount {
  username: string;
  role: string;
  createdAt: string;
}

export default function UsersTab() {
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Form state
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('admin');
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchAdmins = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/admin-accounts');
      if (res.ok) {
        const json = await res.json();
        setAdmins(json.data || []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const handleCreate = async () => {
    if (!newUsername.trim() || !newPassword.trim()) {
      toast.error("Le nom d'utilisateur et le mot de passe sont requis.");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch('/api/admin/admin-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newUsername.trim(),
          password: newPassword,
          role: newRole,
        }),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success(`Admin "${newUsername.trim()}" créé avec succès.`);
        setNewUsername('');
        setNewPassword('');
        setNewRole('admin');
        setDialogOpen(false);
        fetchAdmins();
      } else {
        toast.error(json.error || 'Erreur lors de la création.');
      }
    } catch {
      toast.error('Erreur serveur.');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (username: string) => {
    const defaultAdmin = 'admin';
    if (username === defaultAdmin) {
      toast.error('Impossible de supprimer le compte admin principal.');
      return;
    }
    setDeleting(username);
    try {
      const res = await fetch(`/api/admin/admin-accounts?username=${encodeURIComponent(username)}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (res.ok) {
        toast.success(`Admin "${username}" supprimé.`);
        fetchAdmins();
      } else {
        toast.error(json.error || 'Erreur lors de la suppression.');
      }
    } catch {
      toast.error('Erreur serveur.');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-700" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Comptes Admin</h2>
            <p className="text-sm text-muted-foreground">Gérer les accès administrateur</p>
          </div>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
              <UserPlus className="w-4 h-4" />
              Créer un admin
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Nouveau compte admin
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="admin-username">Nom d&apos;utilisateur</Label>
                <Input
                  id="admin-username"
                  placeholder="admin2"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-password">Mot de passe</Label>
                <Input
                  id="admin-password"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label>Rôle</Label>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="superadmin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <DialogClose asChild>
                <Button variant="outline" className="bg-transparent">Annuler</Button>
              </DialogClose>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleCreate}
                disabled={creating}
              >
                {creating ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Création...</>
                ) : (
                  'Créer'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Admin Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="max-h-[500px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="font-bold">Utilisateur</TableHead>
                <TableHead className="font-bold">Rôle</TableHead>
                <TableHead className="font-bold">Créé le</TableHead>
                <TableHead className="font-bold text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : admins.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    Aucun compte admin trouvé.
                  </TableCell>
                </TableRow>
              ) : (
                admins.map((admin) => (
                  <TableRow key={admin.username}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-700">
                            {admin.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        {admin.username}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        admin.role === 'superadmin'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        <Shield className="w-3 h-3" />
                        {admin.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {admin.createdAt
                        ? new Date(admin.createdAt).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      {admin.username === 'admin' ? (
                        <span className="text-xs text-muted-foreground italic">Principal</span>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent h-8 px-2"
                          onClick={() => handleDelete(admin.username)}
                          disabled={deleting === admin.username}
                        >
                          {deleting === admin.username ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

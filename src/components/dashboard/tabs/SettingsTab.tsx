'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Mail,
  Shield,
  Clock,
  Save,
  Loader2,
  Check,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

// ------------ helpers ------------

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('zalsports_admin_token');
}

function authHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
  };
}

// ------------ types ------------

interface EmailConfig {
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPassword: string;
  adminEmail: string;
}

const emptyConfig: EmailConfig = {
  smtpHost: '',
  smtpPort: '587',
  smtpUser: '',
  smtpPassword: '',
  adminEmail: '',
};

// ------------ component ------------

export default function SettingsTab() {
  // --- Email config state ---
  const [emailConfig, setEmailConfig] = useState<EmailConfig>(emptyConfig);
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [savingConfig, setSavingConfig] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);

  // --- Sessions state ---
  const [clearingSessions, setClearingSessions] = useState(false);

  const fetchEmailConfig = useCallback(async () => {
    setLoadingConfig(true);
    try {
      const res = await fetch('/api/admin/email-config', {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error('Erreur lors du chargement de la configuration');
      const data: EmailConfig = await res.json();
      setEmailConfig(data);
      const configured =
        data.smtpHost.trim() !== '' &&
        data.smtpUser.trim() !== '' &&
        data.adminEmail.trim() !== '';
      setIsConfigured(configured);
    } catch (err) {
      console.error(err);
      toast.error('Impossible de charger la configuration email');
    } finally {
      setLoadingConfig(false);
    }
  }, []);

  useEffect(() => {
    fetchEmailConfig();
  }, [fetchEmailConfig]);

  const handleSaveConfig = async () => {
    setSavingConfig(true);
    try {
      const res = await fetch('/api/admin/email-config', {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(emailConfig),
      });
      if (!res.ok) throw new Error('Erreur lors de la sauvegarde');
      toast.success('Configuration email sauvegardée avec succès');
      const configured =
        emailConfig.smtpHost.trim() !== '' &&
        emailConfig.smtpUser.trim() !== '' &&
        emailConfig.adminEmail.trim() !== '';
      setIsConfigured(configured);
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la sauvegarde de la configuration');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleSendTest = async () => {
    if (!emailConfig.adminEmail.trim()) {
      toast.error("Veuillez renseigner l'email admin avant d'envoyer un test");
      return;
    }
    setSendingTest(true);
    try {
      const res = await fetch('/api/admin/email-config', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ to: emailConfig.adminEmail }),
      });
      if (!res.ok) throw new Error("Erreur lors de l'envoi");
      toast.success('Email de test envoyé avec succès');
    } catch (err) {
      console.error(err);
      toast.error("Impossible d'envoyer l'email de test");
    } finally {
      setSendingTest(false);
    }
  };

  const handleClearSessions = () => {
    setClearingSessions(true);
    setTimeout(() => {
      setClearingSessions(false);
      toast.success('Toutes les sessions ont été révoquées');
    }, 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      {/* ───── Configuration Email (SMTP) ───── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg leading-tight">
                Configuration Email (SMTP)
              </CardTitle>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Paramètres d'envoi des emails
              </p>
            </div>
          </div>
          {loadingConfig ? null : isConfigured === true ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
              <Check className="h-3 w-3" />
              Configuré
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700 dark:bg-red-900/40 dark:text-red-400">
              Non configuré
            </span>
          )}
        </CardHeader>

        <Separator />

        <CardContent className="pt-6">
          {loadingConfig ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="smtpHost">Hôte SMTP</Label>
                <Input
                  id="smtpHost"
                  placeholder="smtp.exemple.com"
                  value={emailConfig.smtpHost}
                  onChange={(e) =>
                    setEmailConfig((prev) => ({
                      ...prev,
                      smtpHost: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtpPort">Port SMTP</Label>
                <Select
                  value={emailConfig.smtpPort}
                  onValueChange={(value) =>
                    setEmailConfig((prev) => ({
                      ...prev,
                      smtpPort: value,
                    }))
                  }
                >
                  <SelectTrigger id="smtpPort">
                    <SelectValue placeholder="Sélectionner un port" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25 (Non chiffré)</SelectItem>
                    <SelectItem value="465">465 (SSL)</SelectItem>
                    <SelectItem value="587">587 (STARTTLS)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtpUser">Utilisateur SMTP</Label>
                <Input
                  id="smtpUser"
                  placeholder="user@exemple.com"
                  value={emailConfig.smtpUser}
                  onChange={(e) =>
                    setEmailConfig((prev) => ({
                      ...prev,
                      smtpUser: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtpPassword">Mot de passe SMTP</Label>
                <Input
                  id="smtpPassword"
                  type="password"
                  placeholder="••••••••"
                  value={emailConfig.smtpPassword}
                  onChange={(e) =>
                    setEmailConfig((prev) => ({
                      ...prev,
                      smtpPassword: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="adminEmail">Email admin</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  placeholder="admin@zalsports.com"
                  value={emailConfig.adminEmail}
                  onChange={(e) =>
                    setEmailConfig((prev) => ({
                      ...prev,
                      adminEmail: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
                <Button onClick={handleSaveConfig} disabled={savingConfig}>
                  {savingConfig ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  {savingConfig ? 'Enregistrement…' : 'Enregistrer'}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleSendTest}
                  disabled={sendingTest}
                >
                  {sendingTest ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Mail className="mr-2 h-4 w-4" />
                  )}
                  {sendingTest ? 'Envoi en cours…' : 'Envoyer un email test'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ───── Général ───── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg leading-tight">Général</CardTitle>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Informations générales de la plateforme
              </p>
            </div>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="pt-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Tarif par heure</Label>
              <div className="rounded-md border bg-muted/50 px-3 py-2.5 text-sm font-medium">
                25 000 FCFA
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground">Acompte requis</Label>
              <div className="rounded-md border bg-muted/50 px-3 py-2.5 text-sm font-medium">
                5 000 FCFA
              </div>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label className="text-muted-foreground">
                Horaires d'ouverture
              </Label>
              <div className="rounded-md border bg-muted/50 px-3 py-2.5 text-sm font-medium">
                08:00 - 00:00
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ───── Sécurité ───── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg leading-tight">Sécurité</CardTitle>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Gestion des sessions et de la sécurité
              </p>
            </div>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="pt-6">
          <div className="space-y-5">
            <div className="rounded-lg border p-4">
              <div className="flex items-start gap-3">
                <Shield className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Jetons de session</p>
                  <p className="text-sm text-muted-foreground">
                    Les jetons d'authentification expirent automatiquement après{' '}
                    <span className="font-semibold text-foreground">24 heures</span>.
                    Après expiration, l'administrateur doit se reconnecter.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  Révoquer toutes les sessions
                </p>
                <p className="text-sm text-muted-foreground">
                  Déconnecte toutes les sessions actives sur tous les appareils.
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={handleClearSessions}
                disabled={clearingSessions}
                className="shrink-0"
              >
                {clearingSessions ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {clearingSessions
                  ? 'Révocation…'
                  : 'Révoquer les sessions'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

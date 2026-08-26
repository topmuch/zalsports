'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, ShieldCheck, ArrowLeft, Lock } from 'lucide-react';
import Sidebar, { type TabId } from '@/components/dashboard/sidebar';
import StatsTab from '@/components/dashboard/tabs/StatsTab';
import BookingsTab from '@/components/dashboard/tabs/BookingsTab';
import CalendarTab from '@/components/dashboard/tabs/CalendarTab';
import UsersTab from '@/components/dashboard/tabs/UsersTab';
import SubscriptionsTab from '@/components/dashboard/tabs/SubscriptionsTab';
import PaymentsTab from '@/components/dashboard/tabs/PaymentsTab';
import SettingsTab from '@/components/dashboard/tabs/SettingsTab';

/* ═══════════════════════════════════════════
   Login Screen
   ═══════════════════════════════════════════ */

function LoginScreen({
  onLogin,
  onBack,
}: {
  onLogin: (token: string) => void;
  onBack: () => void;
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        const { token } = await res.json();
        localStorage.setItem('zalsports_admin_token', token);
        onLogin(token);
      } else {
        const data = await res.json();
        setError(data.error || 'Identifiants incorrects.');
      }
    } catch {
      setError('Erreur de connexion au serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm space-y-8"
      >
        {/* Logo & Title */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              <span className="text-primary">Zal</span>Foot
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Accès administration</p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-muted-foreground">
                  Identifiant
                </label>
                <Input
                  id="username"
                  type="text"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoFocus
                  className="bg-background border-border"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-muted-foreground">
                  Mot de passe
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-background border-border"
                />
              </div>
              {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
              )}
              <Button
                type="submit"
                className="w-full"
                disabled={loading || !username || !password}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Lock className="w-4 h-4 mr-2" />
                )}
                {loading ? 'Connexion...' : 'Se connecter'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Retour au site
        </Button>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Dashboard
   ═══════════════════════════════════════════ */

export default function Dashboard({ onBack }: { onBack: () => void }) {
  const [token, setToken] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('stats');

  // Check for existing token on mount
  useEffect(() => {
    const stored = localStorage.getItem('zalsports_admin_token');
    const markChecked = () => {
      setAuthChecked(true);
    };
    if (stored) {
      fetch('/api/auth/verify', {
        headers: { Authorization: `Bearer ${stored}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.valid) {
            setToken(stored);
          } else {
            localStorage.removeItem('zalsports_admin_token');
          }
        })
        .catch(() => {
          localStorage.removeItem('zalsports_admin_token');
        })
        .finally(markChecked);
    } else {
      queueMicrotask(markChecked);
    }
  }, []);

  const handleLogin = useCallback((t: string) => {
    setToken(t);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('zalsports_admin_token');
    setToken(null);
  }, []);

  // Show loading while checking auth
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  // Show login if not authenticated
  if (!token) {
    return <LoginScreen onLogin={handleLogin} onBack={onBack} />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
        onBack={onBack}
      />
      <main className="flex-1 overflow-y-auto custom-scrollbar bg-background">
        {activeTab === 'stats' && <StatsTab />}
        {activeTab === 'bookings' && <BookingsTab />}
        {activeTab === 'calendar' && <CalendarTab />}
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'subscriptions' && <SubscriptionsTab />}
        {activeTab === 'payments' && <PaymentsTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </main>
    </div>
  );
}

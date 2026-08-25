'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  LayoutDashboard,
  CalendarDays,
  Calendar,
  Users,
  CreditCard,
  Wallet,
  Settings,
  LogOut,
  ArrowLeft,
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
} from 'lucide-react';

type TabId =
  | 'stats'
  | 'bookings'
  | 'calendar'
  | 'users'
  | 'subscriptions'
  | 'payments'
  | 'settings';

interface SidebarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  onLogout: () => void;
  onBack: () => void;
}

const navItems: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'stats', label: 'Tableau de bord', icon: LayoutDashboard },
  { id: 'bookings', label: 'Réservations', icon: CalendarDays },
  { id: 'calendar', label: 'Calendrier', icon: Calendar },
  { id: 'users', label: 'Utilisateurs', icon: Users },
  { id: 'subscriptions', label: 'Abonnements', icon: CreditCard },
  { id: 'payments', label: 'Paiements', icon: Wallet },
  { id: 'settings', label: 'Paramètres', icon: Settings },
];

export type { TabId };

export default function Sidebar({ activeTab, onTabChange, onLogout, onBack }: SidebarProps) {
  const { theme, setTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleTabClick = (tab: TabId) => {
    onTabChange(tab);
    setMobileOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          <Image src="/logo.png" alt="ZF" width={20} height={20} className="rounded" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="text-base font-bold whitespace-nowrap overflow-hidden"
            >
              <span className="text-primary">Zal</span>Foot Admin
            </motion.span>
          )}
        </AnimatePresence>
        {/* Mobile close button */}
        <button
          className="md:hidden ml-auto p-1 rounded-md hover:bg-accent text-muted-foreground"
          onClick={() => setMobileOpen(false)}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <Separator className="opacity-50" />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar py-3 px-2 space-y-0.5">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          const button = (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group
                ${isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
            >
              <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? '' : 'group-hover:text-primary'}`} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="whitespace-nowrap overflow-hidden"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.id} delayDuration={0}>
                <TooltipTrigger asChild>{button}</TooltipTrigger>
                <TooltipContent side="right" className="text-xs font-medium">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          }
          return button;
        })}
      </nav>

      <Separator className="opacity-50" />

      {/* Footer */}
      <div className="shrink-0 p-2 space-y-0.5">
        {/* Theme toggle */}
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <button
              onClick={toggleTheme}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-150"
            >
              {theme === 'dark' ? (
                <Sun className="w-4.5 h-4.5 shrink-0" />
              ) : (
                <Moon className="w-4.5 h-4.5 shrink-0" />
              )}
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="whitespace-nowrap overflow-hidden"
                  >
                    {theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </TooltipTrigger>
          {collapsed && (
            <TooltipContent side="right" className="text-xs font-medium">
              {theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
            </TooltipContent>
          )}
        </Tooltip>

        {/* Logout */}
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-150"
            >
              <LogOut className="w-4.5 h-4.5 shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="whitespace-nowrap overflow-hidden"
                  >
                    Déconnexion
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </TooltipTrigger>
          {collapsed && (
            <TooltipContent side="right" className="text-xs font-medium">
              Déconnexion
            </TooltipContent>
          )}
        </Tooltip>

        {/* Back to site */}
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <button
              onClick={onBack}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-150"
            >
              <ArrowLeft className="w-4.5 h-4.5 shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="whitespace-nowrap overflow-hidden"
                  >
                    Retour au site
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </TooltipTrigger>
          {collapsed && (
            <TooltipContent side="right" className="text-xs font-medium">
              Retour au site
            </TooltipContent>
          )}
        </Tooltip>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <div className="md:hidden fixed top-3 left-3 z-50">
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 bg-background/90 backdrop-blur border-border shadow-sm"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="w-5 h-5" />
        </Button>
      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 bg-black/40 z-40"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="md:hidden fixed left-0 top-0 bottom-0 w-[250px] bg-sidebar border-r border-sidebar-border z-50 shadow-xl"
          >
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex flex-col shrink-0 border-r border-border bg-sidebar transition-all duration-200 ${collapsed ? 'w-[68px]' : 'w-[250px]'}`}
      >
        {sidebarContent}
        {/* Collapse toggle (desktop only) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex absolute top-20 right-0 translate-x-1/2 w-6 h-6 rounded-full bg-background border border-border items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent shadow-sm z-10 transition-colors"
        >
          {collapsed ? <PanelLeftOpen className="w-3 h-3" /> : <PanelLeftClose className="w-3 h-3" />}
        </button>
      </aside>
    </>
  );
}

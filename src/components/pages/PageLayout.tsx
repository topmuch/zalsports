'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

/* ═══════════════════════════════════════════
   Shared layout for all sub-pages
   ═══════════════════════════════════════════ */

export default function PageLayout({
  title,
  subtitle,
 children,
  onBack,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onBack: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* ─── Header ─── */}
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Retour
            </Button>
            <div className="h-5 w-px bg-border" />
            <div className="flex items-center gap-2">
              <Image src="/logo.png" alt="ZalFoot" width={28} height={28} className="rounded-md" />
              <span className="text-lg font-bold">
                <span className="text-primary">Zal</span>Foot
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Content ─── */}
      <main className="flex-1">
        {/* Hero Banner */}
        <div className="bg-secondary/40 border-b border-border">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl sm:text-4xl font-bold">{title}</h1>
              {subtitle && (
                <p className="mt-3 text-muted-foreground text-base sm:text-lg max-w-2xl">{subtitle}</p>
              )}
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          {children}
        </motion.div>
      </main>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border py-6 mt-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="ZalFoot" width={20} height={20} className="rounded" />
            <span className="text-sm font-semibold"><span className="text-primary">Zal</span>Foot</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} ZalFoot — Réservation de terrains, Sénégal
          </p>
        </div>
      </footer>
    </div>
  );
}

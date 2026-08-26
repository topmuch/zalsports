import { prisma } from '@/lib/prisma';

export async function seedDefaults() {
  // Site Settings
  const settingsData = [
    { key: 'site_name', value: 'ZalSports' },
    { key: 'site_address', value: 'Dakar, Sénégal' },
    { key: 'site_phone', value: '+221 77 000 00 00' },
    { key: 'site_email', value: 'contact@zalsports.sn' },
    { key: 'site_description', value: 'Réservez votre terrain de sport en quelques clics.' },
    { key: 'seo_title', value: 'ZalSports — Réservation de terrains de sport' },
    { key: 'seo_description', value: 'ZalSports vous permet de réserver facilement des terrains de sport à Dakar.' },
  ];

  for (const s of settingsData) {
    await prisma.siteSettings.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }

  // Payment Methods
  const paymentMethods = [
    { name: 'wave', label: 'Wave', active: true, phone: '' },
    { name: 'orange_money', label: 'Orange Money', active: true, phone: '' },
    { name: 'cash', label: 'Cash', active: true, phone: '' },
  ];

  for (const pm of paymentMethods) {
    await prisma.paymentMethod.upsert({
      where: { name: pm.name },
      update: { label: pm.label, active: pm.active, phone: pm.phone },
      create: pm,
    });
  }

  // Subscription Plans
  const plans = [
    {
      name: 'Heure unique',
      description: 'Réservation d\'une heure de terrain',
      price: 25000,
      duration: '1 hour',
      features: JSON.stringify(['1 heure de terrain', 'Équipement de base inclus']),
      active: true,
    },
    {
      name: 'Forfait Mensuel',
      description: 'Accès illimité pendant un mois',
      price: 150000,
      duration: '1 month',
      features: JSON.stringify([
        'Accès illimité pendant 30 jours',
        'Réservation prioritaire',
        'Équipement complet inclus',
        'Support dédié',
      ]),
      active: true,
    },
  ];

  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { name: plan.name },
      update: {
        description: plan.description,
        price: plan.price,
        duration: plan.duration,
        features: plan.features,
        active: plan.active,
      },
      create: plan,
    });
  }

  return { seeded: true, settings: settingsData.length, paymentMethods: paymentMethods.length, plans: plans.length };
}

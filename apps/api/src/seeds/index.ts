import { db } from '@specialist/database';
import {
  users,
  customerProfiles,
  partnerProfiles,
  serviceCategories,
  services,
  partnerSkills,
  systemSettings,
} from '@specialist/database';
import { hashPassword } from '../lib/auth.ts';

async function seed() {
  console.log('🌱 Seeding database...');

  const adminPassword = await hashPassword('password123');
  const partnerPassword = await hashPassword('password123');
  const customerPassword = await hashPassword('password123');

  await db.insert(users).values({
    email: 'admin@spesialis.id',
    phone: '6281234567890',
    passwordHash: adminPassword,
    role: 'super_admin',
    status: 'active',
  });

  const [partnerUser] = await db
    .insert(users)
    .values({
      email: 'partner@spesialis.id',
      phone: '6281234567891',
      passwordHash: partnerPassword,
      role: 'partner',
      status: 'active',
    })
    .returning({ id: users.id });

  const [customerUser] = await db
    .insert(users)
    .values({
      email: 'customer@spesialis.id',
      phone: '6281234567892',
      passwordHash: customerPassword,
      role: 'customer',
      status: 'active',
    })
    .returning({ id: users.id });

  await db.insert(customerProfiles).values({
    userId: customerUser!.id,
    fullName: 'Budi Customer',
  });

  const [partnerProfile] = await db
    .insert(partnerProfiles)
    .values({
      userId: partnerUser!.id,
      fullName: 'Ahmad Teknisi',
      phone: '6281234567891',
      ktpNumber: '1234567890123456',
      experienceYear: 5,
      bio: 'Teknisi AC dan listrik berpengalaman.',
      availability: 'Available',
      verificationStatus: 'Approved',
    })
    .returning({ id: partnerProfiles.id });

  const [acCat] = await db
    .insert(serviceCategories)
    .values({
      name: 'Service AC',
      slug: 'ac',
      description: 'Perbaikan, pembersihan, dan instalasi AC',
      icon: 'snowflake',
      displayOrder: 1,
    })
    .returning({ id: serviceCategories.id });

  const [plumbingCat] = await db
    .insert(serviceCategories)
    .values({
      name: 'Pipa & Plumbing',
      slug: 'plumbing',
      description: 'Atasi kebocoran, mampet, dan instalasi pipa',
      icon: 'droplet',
      displayOrder: 2,
    })
    .returning({ id: serviceCategories.id });

  const [electricalCat] = await db
    .insert(serviceCategories)
    .values({
      name: 'Listrik',
      slug: 'electrical',
      description: 'Perbaikan instalasi listrik dan perangkat elektronik',
      icon: 'zap',
      displayOrder: 3,
    })
    .returning({ id: serviceCategories.id });

  const [cleaningCat] = await db
    .insert(serviceCategories)
    .values({
      name: 'Cleaning Service',
      slug: 'cleaning',
      description: 'Jasa kebersihan rumah dan kantor',
      icon: 'sparkles',
      displayOrder: 4,
    })
    .returning({ id: serviceCategories.id });

  await db.insert(services).values([
    {
      categoryId: acCat!.id,
      name: 'Cuci AC Standar',
      slug: 'cuci-ac-standar',
      shortDescription: 'Pembersihan AC standar untuk rumah',
      basePrice: '150000',
      estimatedDuration: 60,
      isFeatured: true,
      displayOrder: 1,
    },
    {
      categoryId: acCat!.id,
      name: 'Cuci AC Medium',
      slug: 'cuci-ac-medium',
      shortDescription: 'Pembersihan AC untuk kantor kecil',
      basePrice: '200000',
      estimatedDuration: 90,
      displayOrder: 2,
    },
    {
      categoryId: acCat!.id,
      name: 'Isi Freon AC',
      slug: 'isi-freon-ac',
      shortDescription: 'Isi ulang freon AC',
      basePrice: '250000',
      estimatedDuration: 45,
      displayOrder: 3,
    },
    {
      categoryId: acCat!.id,
      name: 'Bongkar Pasang AC',
      slug: 'bongkar-pasang-ac',
      shortDescription: 'Jasa bongkar pasang AC',
      basePrice: '350000',
      estimatedDuration: 120,
      isFeatured: true,
      displayOrder: 4,
    },
    {
      categoryId: plumbingCat!.id,
      name: 'Bocor Pipa Air',
      slug: 'bocor-pipa-air',
      shortDescription: 'Perbaikan pipa air bocor',
      basePrice: '150000',
      estimatedDuration: 60,
      isFeatured: true,
      displayOrder: 1,
    },
    {
      categoryId: plumbingCat!.id,
      name: 'Saluran Mampet',
      slug: 'saluran-mampet',
      shortDescription: 'Pengurasan saluran air mampet',
      basePrice: '200000',
      estimatedDuration: 90,
      displayOrder: 2,
    },
    {
      categoryId: plumbingCat!.id,
      name: 'Pasang Water Heater',
      slug: 'pasang-water-heater',
      shortDescription: 'Instalasi pemanas air',
      basePrice: '300000',
      estimatedDuration: 120,
      displayOrder: 3,
    },
    {
      categoryId: electricalCat!.id,
      name: 'Perbaikan Listrik',
      slug: 'perbaikan-listrik',
      shortDescription: 'Perbaikan instalasi listrik rumah',
      basePrice: '100000',
      estimatedDuration: 45,
      isFeatured: true,
      displayOrder: 1,
    },
    {
      categoryId: electricalCat!.id,
      name: 'Pasang Lampu',
      slug: 'pasang-lampu',
      shortDescription: 'Pemasangan lampu dan fitting',
      basePrice: '75000',
      estimatedDuration: 30,
      displayOrder: 2,
    },
    {
      categoryId: electricalCat!.id,
      name: 'Panel Listrik',
      slug: 'panel-listrik',
      shortDescription: 'Perbaikan dan upgrade panel listrik',
      basePrice: '250000',
      estimatedDuration: 120,
      displayOrder: 3,
    },
    {
      categoryId: cleaningCat!.id,
      name: 'Bersih Rumah Standar',
      slug: 'bersih-rumah-standar',
      shortDescription: 'Pembersihan rumah tipe 36-45',
      basePrice: '200000',
      estimatedDuration: 120,
      isFeatured: true,
      displayOrder: 1,
    },
    {
      categoryId: cleaningCat!.id,
      name: 'Bersih Rumah Besar',
      slug: 'bersih-rumah-besar',
      shortDescription: 'Pembersihan rumah tipe 60+',
      basePrice: '350000',
      estimatedDuration: 180,
      displayOrder: 2,
    },
  ]);

  await db.insert(partnerSkills).values([
    { partnerId: partnerProfile!.id, categoryId: acCat!.id, proficiency: 'Expert' },
    { partnerId: partnerProfile!.id, categoryId: electricalCat!.id, proficiency: 'Advanced' },
  ]);

  await db.insert(systemSettings).values([
    { category: 'general', key: 'site_name', value: 'Spesialis' },
    {
      category: 'general',
      key: 'site_description',
      value: 'Platform layanan jasa profesional on-demand',
    },
    { category: 'booking', key: 'cancellation_window_hours', value: '24' },
    { category: 'commission', key: 'platform_fee_percent', value: '10' },
  ]);

  console.log('✅ Seed complete!');
  console.log('   admin@spesialis.id / password123 (super_admin)');
  console.log('   partner@spesialis.id / password123 (partner)');
  console.log('   customer@spesialis.id / password123 (customer)');
  console.log('   4 categories, 12 services, partner with skills');
}

seed().catch((e) => {
  console.error('Seed failed:', e);
  process.exit(1);
});

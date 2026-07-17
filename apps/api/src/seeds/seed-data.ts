#!/usr/bin/env tsx
/**
 * Seed Data (No Users)
 *
 * Mengisi data platform: service categories, services, SEO metadata,
 * article categories, articles, FAQ, dan system settings.
 *
 * Tidak menyentuh tabel users, profiles, orders, payments, dll.
 *
 * Cara pakai:
 *   pnpm --filter @ahlipanggilan/api db:seed-data
 *
 * Atau via Docker:
 *   docker compose -f docker-compose.prod.yml --env-file .env.prod run --rm api \
 *     pnpm --filter @ahlipanggilan/api db:seed-data
 */

import { sql } from 'drizzle-orm';
import { db } from '@ahlipanggilan/database';
import {
  serviceCategories,
  services,
  seoMetadata,
  systemSettings,
  articleCategories,
  articles,
  faq,
} from '@ahlipanggilan/database';

async function seedData() {
  console.log('🌱 Seeding data (DATA ONLY — no users/orders)...\n');

  console.log('  🧹 Clearing service data...');
  await db.execute(sql`
    TRUNCATE TABLE
      partner_skills, seo_metadata, system_settings,
      services, service_categories,
      article_categories, articles, faq
    RESTART IDENTITY CASCADE
  `);
  console.log('  ✓ Done\n');

  // ─── Service Categories (17) ──────────────────────────────────────
  const cat = {} as Record<string, { id: string }>;

  const categoryDefs = [
    {
      key: 'emergency',
      name: 'Layanan Darurat',
      slug: 'emergency',
      icon: 'alert-triangle',
      shortDescription:
        'Bantuan darurat 24 jam: mobil mogok, listrik konslet, pipa bocor, dan lainnya',
      order: 1,
    },
    {
      key: 'montir',
      name: 'Montir Panggilan',
      slug: 'montir',
      icon: 'truck',
      shortDescription: 'Montir profesional siap datang ke lokasi untuk perbaikan kendaraan',
      order: 2,
    },
    {
      key: 'electronics',
      name: 'Servis Elektronik Rumah',
      slug: 'electronics',
      icon: 'monitor',
      shortDescription: 'Perbaikan AC, kulkas, mesin cuci, TV, dan elektronik rumah tangga lainnya',
      order: 3,
    },
    {
      key: 'plumbing',
      name: 'Plumbing & Pipa',
      slug: 'plumbing',
      icon: 'droplet',
      shortDescription: 'Atasi kebocoran, saluran mampet, instalasi air, dan pompa air',
      order: 4,
    },
    {
      key: 'electrical',
      name: 'Kelistrikan',
      slug: 'electrical',
      icon: 'zap',
      shortDescription: 'Perbaikan dan instalasi listrik rumah, panel, lampu, dan grounding',
      order: 5,
    },
    {
      key: 'cleaning',
      name: 'Cleaning Service',
      slug: 'cleaning',
      icon: 'sparkles',
      shortDescription: 'Jasa kebersihan rumah, kantor, dan cuci sofa, kasur, karpet',
      order: 6,
    },
    {
      key: 'construction',
      name: 'Tukang Bangunan',
      slug: 'construction',
      icon: 'hammer',
      shortDescription: 'Renovasi rumah, pengecatan, keramik, plafon, dan waterproofing',
      order: 7,
    },
    {
      key: 'welding',
      name: 'Tukang Las Panggilan',
      slug: 'welding',
      icon: 'wrench',
      shortDescription: 'Jasa las pagar, kanopi, teralis, tangga, dan pintu besi',
      order: 8,
    },
    {
      key: 'paving',
      name: 'Jasa Pengaspalan',
      slug: 'paving',
      icon: 'road',
      shortDescription: 'Pengaspalan jalan, parkiran, perumahan, dan kawasan industri',
      order: 9,
    },
    {
      key: 'septic',
      name: 'Jasa Sedot WC',
      slug: 'septic',
      icon: 'trash-2',
      shortDescription: 'Sedot WC, septic tank, saluran mampet, dan perawatan limbah',
      order: 10,
    },
    {
      key: 'pest-control',
      name: 'Pest Control',
      slug: 'pest-control',
      icon: 'bug',
      shortDescription: 'Basmi hama: rayap, tikus, kecoa, semut, nyamuk, dan ular',
      order: 11,
    },
    {
      key: 'garden',
      name: 'Taman & Outdoor',
      slug: 'garden',
      icon: 'tree',
      shortDescription: 'Tukang kebun, potong rumput, perawatan dan pembuatan taman',
      order: 12,
    },
    {
      key: 'security',
      name: 'Bodyguard & Security',
      slug: 'security',
      icon: 'shield',
      shortDescription: 'Bodyguard pribadi, security event, perumahan, dan pengawalan VIP',
      order: 13,
    },
    {
      key: 'driver',
      name: 'Supir Panggilan',
      slug: 'driver',
      icon: 'car',
      shortDescription: 'Supir harian, bulanan, pribadi, luar kota, dan event',
      order: 14,
    },
    {
      key: 'household',
      name: 'Jasa Rumah Tangga',
      slug: 'household',
      icon: 'users',
      shortDescription: 'ART, babysitter, perawatan lansia, juru masak, dan office boy',
      order: 15,
    },
    {
      key: 'investigation',
      name: 'Jasa Investigasi',
      slug: 'investigation',
      icon: 'search',
      shortDescription: 'Investigasi perselingkuhan, karyawan, verifikasi alamat dan usaha',
      order: 16,
    },
    {
      key: 'lainnya',
      name: 'Layanan Lainnya',
      slug: 'lainnya',
      icon: 'more-horizontal',
      shortDescription: 'Ceritakan kebutuhan Anda, kami siap membantu',
      order: 17,
    },
  ];

  for (const def of categoryDefs) {
    const [row] = await db
      .insert(serviceCategories)
      .values({
        name: def.name,
        slug: def.slug,
        description: def.shortDescription,
        icon: def.icon,
        displayOrder: def.order,
      })
      .returning({ id: serviceCategories.id });
    cat[def.key] = { id: row!.id };
  }

  console.log('  ✓ 17 service categories created');

  // ─── Services (~104) ───────────────────────────────────────────────
  const svcs: Array<{
    categoryId: string;
    name: string;
    slug: string;
    shortDescription: string;
    basePrice: string;
    estimatedDuration: number;
    isFeatured?: boolean;
    showInHero?: boolean;
    displayOrder: number;
  }> = [];

  // 1. Layanan Darurat (14)
  const emergencySvcs = [
    {
      name: 'Mobil Mogok',
      slug: 'mobil-mogok',
      shortDescription: 'Bantuan mobil mogok di jalan',
      basePrice: 'call',
      estimatedDuration: 60,
      isFeatured: true,
    },
    {
      name: 'Motor Mogok',
      slug: 'motor-mogok',
      shortDescription: 'Bantuan motor mogok di jalan',
      basePrice: 'call',
      estimatedDuration: 45,
      isFeatured: true,
    },
    {
      name: 'Mobil Terkunci dari Dalam',
      slug: 'mobil-terkunci',
      shortDescription: 'Bantuan membuka kunci mobil',
      basePrice: 'call',
      estimatedDuration: 30,
    },
    {
      name: 'Listrik Konslet',
      slug: 'listrik-konslet',
      shortDescription: 'Penanganan darurat listrik konslet',
      basePrice: 'call',
      estimatedDuration: 60,
      isFeatured: true,
    },
    {
      name: 'Pipa Bocor Darurat',
      slug: 'pipa-bocor-darurat',
      shortDescription: 'Perbaikan darurat pipa bocor',
      basePrice: 'call',
      estimatedDuration: 60,
      isFeatured: true,
    },
    {
      name: 'Pipa Mampet Darurat',
      slug: 'pipa-mampet-darurat',
      shortDescription: 'Pengurasan darurat pipa mampet',
      basePrice: 'call',
      estimatedDuration: 60,
    },
    {
      name: 'WC Mampet',
      slug: 'wc-mampet',
      shortDescription: 'Pengurasan WC mampet darurat',
      basePrice: 'call',
      estimatedDuration: 45,
    },
    {
      name: 'Rumah Terkunci',
      slug: 'rumah-terkunci',
      shortDescription: 'Bantuan membuka kunci rumah',
      basePrice: 'call',
      estimatedDuration: 30,
    },
    {
      name: 'Jumper Aki',
      slug: 'jumper-aki',
      shortDescription: 'Jumper aki mobil/motor',
      basePrice: 'call',
      estimatedDuration: 15,
      isFeatured: true,
    },
    {
      name: 'Ban Bocor',
      slug: 'ban-bocor',
      shortDescription: 'Tambal ban darurat di lokasi',
      basePrice: 'call',
      estimatedDuration: 30,
    },
    {
      name: 'Derek Kendaraan',
      slug: 'derek-kendaraan',
      shortDescription: 'Derek mobil dan motor',
      basePrice: 'call',
      estimatedDuration: 120,
    },
    {
      name: 'Pompa Air Mati',
      slug: 'pompa-air-mati',
      shortDescription: 'Perbaikan darurat pompa air',
      basePrice: 'call',
      estimatedDuration: 60,
    },
    {
      name: 'AC Mati Mendadak',
      slug: 'ac-mati-mendadak',
      shortDescription: 'Perbaikan darurat AC',
      basePrice: 'call',
      estimatedDuration: 60,
      isFeatured: true,
    },
    {
      name: 'Atap Bocor',
      slug: 'atap-bocor',
      shortDescription: 'Perbaikan darurat atap bocor',
      basePrice: 'call',
      estimatedDuration: 120,
    },
  ];
  emergencySvcs.forEach((s, i) =>
    svcs.push({ categoryId: cat.emergency!.id, ...s, displayOrder: i + 1 }),
  );

  // 2. Montir Panggilan (3)
  const montirSvcs = [
    {
      name: 'Mobil Mogok',
      slug: 'mobil-mogok-montir',
      shortDescription: 'Perbaikan mobil mogok di lokasi',
      basePrice: 'call',
      estimatedDuration: 60,
      isFeatured: true,
    },
    {
      name: 'Motor Mogok',
      slug: 'motor-mogok-montir',
      shortDescription: 'Perbaikan motor mogok di lokasi',
      basePrice: 'call',
      estimatedDuration: 45,
      isFeatured: true,
    },
    {
      name: 'Inspeksi Mobil Bekas',
      slug: 'inspeksi-mobil-bekas',
      shortDescription: 'Inspeksi menyeluruh mobil bekas sebelum dibeli',
      basePrice: 'call',
      estimatedDuration: 120,
    },
  ];
  montirSvcs.forEach((s, i) =>
    svcs.push({ categoryId: cat.montir!.id, ...s, displayOrder: i + 1 }),
  );

  // 3. Servis Elektronik Rumah (10)
  const electronicsSvcs = [
    {
      name: 'Service AC',
      slug: 'service-ac',
      shortDescription: 'Perbaikan dan perawatan AC',
      basePrice: 'call',
      estimatedDuration: 60,
      isFeatured: true,
    },
    {
      name: 'Service Kulkas',
      slug: 'service-kulkas',
      shortDescription: 'Perbaikan kulkas tidak dingin, bocor',
      basePrice: 'call',
      estimatedDuration: 60,
      isFeatured: true,
    },
    {
      name: 'Service Mesin Cuci',
      slug: 'service-mesin-cuci',
      shortDescription: 'Perbaikan mesin cuci mati, bocor',
      basePrice: 'call',
      estimatedDuration: 60,
    },
    {
      name: 'Service TV',
      slug: 'service-tv',
      shortDescription: 'Perbaikan TV mati, gambar rusak',
      basePrice: 'call',
      estimatedDuration: 60,
    },
    {
      name: 'Service Dispenser',
      slug: 'service-dispenser',
      shortDescription: 'Perbaikan dispenser tidak panas/dingin',
      basePrice: 'call',
      estimatedDuration: 45,
    },
    {
      name: 'Service Microwave',
      slug: 'service-microwave',
      shortDescription: 'Perbaikan microwave tidak panas',
      basePrice: 'call',
      estimatedDuration: 45,
    },
    {
      name: 'Service Oven',
      slug: 'service-oven',
      shortDescription: 'Perbaikan oven listrik/gas',
      basePrice: 'call',
      estimatedDuration: 60,
    },
    {
      name: 'Service Water Heater',
      slug: 'service-water-heater',
      shortDescription: 'Perbaikan pemanas air',
      basePrice: 'call',
      estimatedDuration: 60,
    },
    {
      name: 'Service Kompor',
      slug: 'service-kompor',
      shortDescription: 'Perbaikan kompor gas/listrik',
      basePrice: 'call',
      estimatedDuration: 45,
    },
    {
      name: 'Service Vacuum Cleaner',
      slug: 'service-vacuum-cleaner',
      shortDescription: 'Perbaikan vacuum cleaner',
      basePrice: 'call',
      estimatedDuration: 45,
    },
  ];
  electronicsSvcs.forEach((s, i) =>
    svcs.push({ categoryId: cat.electronics!.id, ...s, displayOrder: i + 1 }),
  );

  // 4. Plumbing & Pipa (8)
  const plumbingSvcs = [
    {
      name: 'Perbaikan Pipa',
      slug: 'perbaikan-pipa',
      shortDescription: 'Perbaikan pipa bocor dan pecah',
      basePrice: 'call',
      estimatedDuration: 60,
      isFeatured: true,
    },
    {
      name: 'Saluran Mampet',
      slug: 'saluran-mampet',
      shortDescription: 'Pengurasan saluran air mampet',
      basePrice: 'call',
      estimatedDuration: 90,
      isFeatured: true,
    },
    {
      name: 'Service Pompa Air',
      slug: 'service-pompa-air',
      shortDescription: 'Perbaikan dan instalasi pompa air',
      basePrice: 'call',
      estimatedDuration: 60,
    },
    {
      name: 'Kuras & Cuci Toren Air',
      slug: 'kuras-toren-air',
      shortDescription: 'Pembersihan toren air',
      basePrice: 'call',
      estimatedDuration: 90,
    },
    {
      name: 'Keran & Wastafel',
      slug: 'keran-wastafel',
      shortDescription: 'Pasang dan perbaiki keran, wastafel',
      basePrice: 'call',
      estimatedDuration: 45,
    },
    {
      name: 'Closet & Toilet',
      slug: 'closet-toilet',
      shortDescription: 'Perbaikan closet dan toilet',
      basePrice: 'call',
      estimatedDuration: 60,
    },
    {
      name: 'Instalasi Air',
      slug: 'instalasi-air',
      shortDescription: 'Instalasi pipa air baru',
      basePrice: 'call',
      estimatedDuration: 180,
    },
    {
      name: 'Pasang Water Heater',
      slug: 'pasang-water-heater',
      shortDescription: 'Instalasi pemanas air',
      basePrice: 'call',
      estimatedDuration: 120,
    },
  ];
  plumbingSvcs.forEach((s, i) =>
    svcs.push({ categoryId: cat.plumbing!.id, ...s, displayOrder: i + 1 }),
  );

  // 5. Kelistrikan (5)
  const electricalSvcs = [
    {
      name: 'Perbaikan Listrik',
      slug: 'perbaikan-listrik',
      shortDescription: 'Perbaikan instalasi listrik rumah',
      basePrice: 'call',
      estimatedDuration: 45,
      isFeatured: true,
    },
    {
      name: 'Instalasi Listrik',
      slug: 'instalasi-listrik',
      shortDescription: 'Instalasi listrik baru rumah/kantor',
      basePrice: 'call',
      estimatedDuration: 180,
    },
    {
      name: 'Panel Listrik',
      slug: 'panel-listrik',
      shortDescription: 'Perbaikan dan upgrade panel listrik',
      basePrice: 'call',
      estimatedDuration: 120,
    },
    {
      name: 'Lampu & Stop Kontak',
      slug: 'lampu-stop-kontak',
      shortDescription: 'Pasang lampu, fitting, stop kontak',
      basePrice: 'call',
      estimatedDuration: 30,
    },
    {
      name: 'MCB & Grounding',
      slug: 'mcb-grounding',
      shortDescription: 'Pasang MCB dan grounding',
      basePrice: 'call',
      estimatedDuration: 90,
    },
  ];
  electricalSvcs.forEach((s, i) =>
    svcs.push({ categoryId: cat.electrical!.id, ...s, displayOrder: i + 1 }),
  );

  // 6. Cleaning Service (7)
  const cleaningSvcs = [
    {
      name: 'General Cleaning',
      slug: 'general-cleaning',
      shortDescription: 'Pembersihan rumah/kantor menyeluruh',
      basePrice: 'call',
      estimatedDuration: 120,
      isFeatured: true,
    },
    {
      name: 'Cuci Sofa',
      slug: 'cuci-sofa',
      shortDescription: 'Pencucian sofa 2-3 seater',
      basePrice: 'call',
      estimatedDuration: 60,
    },
    {
      name: 'Cuci Kasur',
      slug: 'cuci-kasur',
      shortDescription: 'Pencucian kasur spring bed',
      basePrice: 'call',
      estimatedDuration: 60,
    },
    {
      name: 'Cuci Karpet',
      slug: 'cuci-karpet',
      shortDescription: 'Pencucian karpet ruangan',
      basePrice: 'call',
      estimatedDuration: 90,
    },
    {
      name: 'Cuci Gorden',
      slug: 'cuci-gorden',
      shortDescription: 'Pencucian gorden jendela',
      basePrice: 'call',
      estimatedDuration: 60,
    },
    {
      name: 'Pembersihan Kaca',
      slug: 'pembersihan-kaca',
      shortDescription: 'Bersihkan kaca jendela dan pintu',
      basePrice: 'call',
      estimatedDuration: 45,
    },
    {
      name: 'Deep Cleaning',
      slug: 'deep-cleaning',
      shortDescription: 'Pembersihan menyeluruh + disinfectant',
      basePrice: 'call',
      estimatedDuration: 240,
      isFeatured: true,
    },
  ];
  cleaningSvcs.forEach((s, i) =>
    svcs.push({ categoryId: cat.cleaning!.id, ...s, displayOrder: i + 1 }),
  );

  // 7. Tukang Bangunan (8)
  const constructionSvcs = [
    {
      name: 'Renovasi Rumah',
      slug: 'renovasi-rumah',
      shortDescription: 'Renovasi rumah total atau sebagian',
      basePrice: 'call',
      estimatedDuration: 480,
      isFeatured: true,
    },
    {
      name: 'Tukang Harian',
      slug: 'tukang-harian',
      shortDescription: 'Tukang bangunan harian',
      basePrice: 'call',
      estimatedDuration: 480,
    },
    {
      name: 'Pengecatan',
      slug: 'pengecatan',
      shortDescription: 'Pengecatan dinding interior/eksterior',
      basePrice: 'call',
      estimatedDuration: 240,
      isFeatured: true,
    },
    {
      name: 'Pasang Keramik',
      slug: 'pasang-keramik',
      shortDescription: 'Pemasangan keramik lantai/dinding',
      basePrice: 'call',
      estimatedDuration: 360,
    },
    {
      name: 'Gypsum & Plafon',
      slug: 'gypsum-plafon',
      shortDescription: 'Pasang plafon gypsum',
      basePrice: 'call',
      estimatedDuration: 240,
    },
    {
      name: 'Waterproofing',
      slug: 'waterproofing',
      shortDescription: 'Pelapisan anti bocor atap/dinding',
      basePrice: 'call',
      estimatedDuration: 240,
    },
    {
      name: 'Baja Ringan',
      slug: 'baja-ringan',
      shortDescription: 'Konstruksi atap baja ringan',
      basePrice: 'call',
      estimatedDuration: 480,
    },
    {
      name: 'Inspeksi Rumah Bekas',
      slug: 'inspeksi-rumah-bekas',
      shortDescription: 'Inspeksi rumah bekas sebelum dibeli',
      basePrice: 'call',
      estimatedDuration: 180,
    },
  ];
  constructionSvcs.forEach((s, i) =>
    svcs.push({ categoryId: cat.construction!.id, ...s, displayOrder: i + 1 }),
  );

  // 8. Tukang Las Panggilan (8)
  const weldingSvcs = [
    {
      name: 'Las Pagar',
      slug: 'las-pagar',
      shortDescription: 'Pembuatan dan perbaikan pagar besi',
      basePrice: 'call',
      estimatedDuration: 240,
    },
    {
      name: 'Las Kanopi',
      slug: 'las-kanopi',
      shortDescription: 'Pembuatan kanopi besi',
      basePrice: 'call',
      estimatedDuration: 240,
      isFeatured: true,
    },
    {
      name: 'Las Teralis',
      slug: 'las-teralis',
      shortDescription: 'Pembuatan teralis jendela/pintu',
      basePrice: 'call',
      estimatedDuration: 180,
    },
    {
      name: 'Las Tangga',
      slug: 'las-tangga',
      shortDescription: 'Pembuatan tangga besi',
      basePrice: 'call',
      estimatedDuration: 360,
    },
    {
      name: 'Las Balkon',
      slug: 'las-balkon',
      shortDescription: 'Pembuatan railing balkon',
      basePrice: 'call',
      estimatedDuration: 240,
    },
    {
      name: 'Las Railing',
      slug: 'las-railing',
      shortDescription: 'Pembuatan railing tangga',
      basePrice: 'call',
      estimatedDuration: 240,
    },
    {
      name: 'Las Pintu Besi',
      slug: 'las-pintu-besi',
      shortDescription: 'Pembuatan pintu besi',
      basePrice: 'call',
      estimatedDuration: 360,
    },
    {
      name: 'Las Stainless',
      slug: 'las-stainless',
      shortDescription: 'Pengelasan stainless steel',
      basePrice: 'call',
      estimatedDuration: 180,
    },
  ];
  weldingSvcs.forEach((s, i) =>
    svcs.push({ categoryId: cat.welding!.id, ...s, displayOrder: i + 1 }),
  );

  // 9. Jasa Pengaspalan (5)
  const pavingSvcs = [
    {
      name: 'Aspal Jalan',
      slug: 'aspal-jalan',
      shortDescription: 'Pengaspalan jalan',
      basePrice: 'call',
      estimatedDuration: 480,
      isFeatured: true,
    },
    {
      name: 'Aspal Parkiran',
      slug: 'aspal-parkiran',
      shortDescription: 'Pengaspalan area parkir',
      basePrice: 'call',
      estimatedDuration: 360,
    },
    {
      name: 'Aspal Perumahan',
      slug: 'aspal-perumahan',
      shortDescription: 'Pengaspalan jalan perumahan',
      basePrice: 'call',
      estimatedDuration: 360,
    },
    {
      name: 'Aspal Kawasan Industri',
      slug: 'aspal-kawasan-industri',
      shortDescription: 'Pengaspalan kawasan industri',
      basePrice: 'call',
      estimatedDuration: 600,
    },
    {
      name: 'Marka Jalan',
      slug: 'marka-jalan',
      shortDescription: 'Pembuatan marka jalan',
      basePrice: 'call',
      estimatedDuration: 240,
    },
  ];
  pavingSvcs.forEach((s, i) =>
    svcs.push({ categoryId: cat.paving!.id, ...s, displayOrder: i + 1 }),
  );

  // 10. Jasa Sedot WC (5)
  const septicSvcs = [
    {
      name: 'Sedot WC',
      slug: 'sedot-wc',
      shortDescription: 'Penyedotan WC penuh',
      basePrice: 'call',
      estimatedDuration: 60,
      isFeatured: true,
    },
    {
      name: 'Sedot Septic Tank',
      slug: 'sedot-septic-tank',
      shortDescription: 'Penyedotan septic tank',
      basePrice: 'call',
      estimatedDuration: 90,
      isFeatured: true,
    },
    {
      name: 'Saluran Mampet',
      slug: 'saluran-mampet-septic',
      shortDescription: 'Pengurasan saluran mampet',
      basePrice: 'call',
      estimatedDuration: 60,
    },
    {
      name: 'Perawatan Septic Tank',
      slug: 'perawatan-septic-tank',
      shortDescription: 'Perawatan dan pembersihan septic tank',
      basePrice: 'call',
      estimatedDuration: 90,
    },
    {
      name: 'Limbah Cair',
      slug: 'limbah-cair',
      shortDescription: 'Pengelolaan limbah cair',
      basePrice: 'call',
      estimatedDuration: 120,
    },
  ];
  septicSvcs.forEach((s, i) =>
    svcs.push({ categoryId: cat.septic!.id, ...s, displayOrder: i + 1 }),
  );

  // 11. Pest Control (7)
  const pestSvcs = [
    {
      name: 'Basmi Rayap',
      slug: 'basmi-rayap',
      shortDescription: 'Pembasmian rayap tanah dan kayu',
      basePrice: 'call',
      estimatedDuration: 120,
      isFeatured: true,
    },
    {
      name: 'Basmi Tikus',
      slug: 'basmi-tikus',
      shortDescription: 'Pembasmian hama tikus',
      basePrice: 'call',
      estimatedDuration: 60,
    },
    {
      name: 'Basmi Kecoa',
      slug: 'basmi-kecoa',
      shortDescription: 'Pembasmian kecoa',
      basePrice: 'call',
      estimatedDuration: 60,
    },
    {
      name: 'Basmi Semut',
      slug: 'basmi-semut',
      shortDescription: 'Pembasmian semut',
      basePrice: 'call',
      estimatedDuration: 60,
    },
    {
      name: 'Basmi Nyamuk',
      slug: 'basmi-nyamuk',
      shortDescription: 'Fogging nyamuk DBD',
      basePrice: 'call',
      estimatedDuration: 60,
      isFeatured: true,
    },
    {
      name: 'Basmi Lebah',
      slug: 'basmi-lebah',
      shortDescription: 'Pengusiran/pemindahan sarang lebah',
      basePrice: 'call',
      estimatedDuration: 60,
    },
    {
      name: 'Basmi Ular',
      slug: 'basmi-ular',
      shortDescription: 'Penangkapan ular',
      basePrice: 'call',
      estimatedDuration: 60,
    },
  ];
  pestSvcs.forEach((s, i) =>
    svcs.push({ categoryId: cat['pest-control']!.id, ...s, displayOrder: i + 1 }),
  );

  // 12. Taman & Outdoor (5)
  const gardenSvcs = [
    {
      name: 'Tukang Kebun',
      slug: 'tukang-kebun',
      shortDescription: 'Perawatan kebun harian',
      basePrice: 'call',
      estimatedDuration: 240,
      isFeatured: true,
    },
    {
      name: 'Potong Rumput',
      slug: 'potong-rumput',
      shortDescription: 'Pemotongan rumput halaman',
      basePrice: 'call',
      estimatedDuration: 120,
    },
    {
      name: 'Perawatan Taman',
      slug: 'perawatan-taman',
      shortDescription: 'Perawatan taman menyeluruh',
      basePrice: 'call',
      estimatedDuration: 180,
    },
    {
      name: 'Pembuatan Taman',
      slug: 'pembuatan-taman',
      shortDescription: 'Pembuatan taman baru',
      basePrice: 'call',
      estimatedDuration: 360,
      isFeatured: true,
    },
    {
      name: 'Kolam Hias',
      slug: 'kolam-hias',
      shortDescription: 'Pembuatan dan perawatan kolam hias',
      basePrice: 'call',
      estimatedDuration: 360,
    },
  ];
  gardenSvcs.forEach((s, i) =>
    svcs.push({ categoryId: cat.garden!.id, ...s, displayOrder: i + 1 }),
  );

  // 13. Bodyguard & Security (5)
  const securitySvcs = [
    {
      name: 'Bodyguard Pribadi',
      slug: 'bodyguard-pribadi',
      shortDescription: 'Pengamanan pribadi',
      basePrice: 'call',
      estimatedDuration: 480,
      isFeatured: true,
    },
    {
      name: 'Security Event',
      slug: 'security-event',
      shortDescription: 'Pengamanan acara/event',
      basePrice: 'call',
      estimatedDuration: 480,
    },
    {
      name: 'Security Perusahaan',
      slug: 'security-perusahaan',
      shortDescription: 'Satpam perusahaan',
      basePrice: 'call',
      estimatedDuration: 1440,
    },
    {
      name: 'Security Perumahan',
      slug: 'security-perumahan',
      shortDescription: 'Satpam perumahan',
      basePrice: 'call',
      estimatedDuration: 1440,
    },
    {
      name: 'Pengawalan VIP',
      slug: 'pengawalan-vip',
      shortDescription: 'Pengawalan VVIP/VIP',
      basePrice: 'call',
      estimatedDuration: 480,
    },
  ];
  securitySvcs.forEach((s, i) =>
    svcs.push({ categoryId: cat.security!.id, ...s, displayOrder: i + 1 }),
  );

  // 14. Supir Panggilan (5)
  const driverSvcs = [
    {
      name: 'Supir Harian',
      slug: 'supir-harian',
      shortDescription: 'Supir harian dalam kota',
      basePrice: 'call',
      estimatedDuration: 480,
      isFeatured: true,
    },
    {
      name: 'Supir Bulanan',
      slug: 'supir-bulanan',
      shortDescription: 'Supir bulanan full time',
      basePrice: 'call',
      estimatedDuration: 1440,
    },
    {
      name: 'Supir Pribadi',
      slug: 'supir-pribadi',
      shortDescription: 'Supir pribadi harian',
      basePrice: 'call',
      estimatedDuration: 480,
    },
    {
      name: 'Driver Luar Kota',
      slug: 'driver-luar-kota',
      shortDescription: 'Supir perjalanan luar kota',
      basePrice: 'call',
      estimatedDuration: 600,
    },
    {
      name: 'Driver Event',
      slug: 'driver-event',
      shortDescription: 'Supir untuk acara',
      basePrice: 'call',
      estimatedDuration: 480,
    },
  ];
  driverSvcs.forEach((s, i) =>
    svcs.push({ categoryId: cat.driver!.id, ...s, displayOrder: i + 1 }),
  );

  // 15. Jasa Rumah Tangga (6)
  const householdSvcs = [
    {
      name: 'Asisten Rumah Tangga (ART)',
      slug: 'art',
      shortDescription: 'ART harian atau bulanan',
      basePrice: 'call',
      estimatedDuration: 1440,
      isFeatured: true,
    },
    {
      name: 'Babysitter',
      slug: 'babysitter',
      shortDescription: 'Pengasuh bayi dan balita',
      basePrice: 'call',
      estimatedDuration: 1440,
      isFeatured: true,
    },
    {
      name: 'Perawatan Lansia',
      slug: 'perawatan-lansia',
      shortDescription: 'Perawat lansia di rumah',
      basePrice: 'call',
      estimatedDuration: 1440,
    },
    {
      name: 'Infal ART',
      slug: 'infal-art',
      shortDescription: 'ART infal/harian',
      basePrice: 'call',
      estimatedDuration: 480,
    },
    {
      name: 'Juru Masak',
      slug: 'juru-masak',
      shortDescription: 'Juru masak harian',
      basePrice: 'call',
      estimatedDuration: 240,
    },
    {
      name: 'Office Boy / Office Girl',
      slug: 'office-boy',
      shortDescription: 'OB/OG harian',
      basePrice: 'call',
      estimatedDuration: 480,
    },
  ];
  householdSvcs.forEach((s, i) =>
    svcs.push({ categoryId: cat.household!.id, ...s, displayOrder: i + 1 }),
  );

  // 16. Jasa Investigasi (6)
  const investigationSvcs = [
    {
      name: 'Investigasi Perselingkuhan',
      slug: 'investigasi-perselingkuhan',
      shortDescription: 'Investigasi dugaan perselingkuhan',
      basePrice: 'call',
      estimatedDuration: 1440,
      isFeatured: true,
    },
    {
      name: 'Investigasi Karyawan',
      slug: 'investigasi-karyawan',
      shortDescription: 'Investigasi dugaan kecurangan karyawan',
      basePrice: 'call',
      estimatedDuration: 1440,
    },
    {
      name: 'Investigasi Internal Perusahaan',
      slug: 'investigasi-internal-perusahaan',
      shortDescription: 'Audit investigasi internal',
      basePrice: 'call',
      estimatedDuration: 1440,
    },
    {
      name: 'Verifikasi Alamat',
      slug: 'verifikasi-alamat',
      shortDescription: 'Verifikasi kebenaran alamat',
      basePrice: 'call',
      estimatedDuration: 120,
    },
    {
      name: 'Verifikasi Tempat Usaha',
      slug: 'verifikasi-tempat-usaha',
      shortDescription: 'Verifikasi tempat usaha',
      basePrice: 'call',
      estimatedDuration: 180,
    },
    {
      name: 'Audit Kepatuhan Lapangan',
      slug: 'audit-kepatuhan-lapangan',
      shortDescription: 'Audit kepatuhan di lapangan',
      basePrice: 'call',
      estimatedDuration: 1440,
    },
  ];
  investigationSvcs.forEach((s, i) =>
    svcs.push({ categoryId: cat.investigation!.id, ...s, displayOrder: i + 1 }),
  );

  // 17. Layanan Lainnya (1)
  svcs.push({
    categoryId: cat.lainnya!.id,
    name: 'Ceritakan Kebutuhan Anda',
    slug: 'ceritakan-kebutuhan',
    shortDescription:
      'Layanan yang tidak tercantum? Ceritakan kebutuhan Anda, kami akan carikan solusinya',
    basePrice: 'call',
    estimatedDuration: 60,
    displayOrder: 1,
  });

  await db.insert(services).values(svcs);
  console.log(`  ✓ ${svcs.length} services created`);

  // ─── SEO Metadata ────────────────────────────────────────────────
  const seoEntries = [
    {
      entityId: cat.emergency!.id,
      title: 'Layanan Darurat 24 Jam - Ahli Panggilan',
      shortDescription:
        'Bantuan darurat: mobil mogok, listrik konslet, pipa bocor, AC mati. Siap melayani 24 jam.',
    },
    {
      entityId: cat.montir!.id,
      title: 'Montir Panggilan - Ahli Panggilan',
      shortDescription:
        'Montir profesional siap datang ke lokasi. Perbaikan mobil dan motor mogok di tempat.',
    },
    {
      entityId: cat.electronics!.id,
      title: 'Servis Elektronik Rumah - Ahli Panggilan',
      shortDescription:
        'Service AC, kulkas, mesin cuci, TV, dan elektronik rumah lainnya. Teknisi berpengalaman.',
    },
    {
      entityId: cat.plumbing!.id,
      title: 'Plumbing & Pipa - Ahli Panggilan',
      shortDescription: 'Jasa perbaikan pipa bocor, saluran mampet, instalasi air, dan pompa air.',
    },
    {
      entityId: cat.electrical!.id,
      title: 'Jasa Kelistrikan - Ahli Panggilan',
      shortDescription: 'Perbaikan listrik rumah, instalasi, panel listrik, lampu, dan grounding.',
    },
    {
      entityId: cat.cleaning!.id,
      title: 'Cleaning Service - Ahli Panggilan',
      shortDescription: 'General cleaning, cuci sofa, cuci kasur, cuci karpet, dan deep cleaning.',
    },
    {
      entityId: cat.construction!.id,
      title: 'Tukang Bangunan - Ahli Panggilan',
      shortDescription:
        'Renovasi rumah, pengecatan, keramik, gypsum, waterproofing, dan baja ringan.',
    },
    {
      entityId: cat.welding!.id,
      title: 'Tukang Las Panggilan - Ahli Panggilan',
      shortDescription:
        'Las pagar, kanopi, teralis, tangga, railing, dan pintu besi. Datang ke lokasi.',
    },
    {
      entityId: cat.paving!.id,
      title: 'Jasa Pengaspalan - Ahli Panggilan',
      shortDescription:
        'Pengaspalan jalan, parkiran, perumahan, kawasan industri, dan marka jalan.',
    },
    {
      entityId: cat.septic!.id,
      title: 'Jasa Sedot WC - Ahli Panggilan',
      shortDescription: 'Sedot WC, septic tank, saluran mampet, dan perawatan limbah cair.',
    },
    {
      entityId: cat['pest-control']!.id,
      title: 'Pest Control - Ahli Panggilan',
      shortDescription:
        'Basmi rayap, tikus, kecoa, semut, nyamuk, lebah, dan ular. Profesional dan aman.',
    },
    {
      entityId: cat.garden!.id,
      title: 'Taman & Outdoor - Ahli Panggilan',
      shortDescription:
        'Tukang kebun, potong rumput, perawatan taman, pembuatan taman, dan kolam hias.',
    },
    {
      entityId: cat.security!.id,
      title: 'Bodyguard & Security - Ahli Panggilan',
      shortDescription:
        'Bodyguard pribadi, security event, security perumahan, dan pengawalan VIP.',
    },
    {
      entityId: cat.driver!.id,
      title: 'Supir Panggilan - Ahli Panggilan',
      shortDescription: 'Supir harian, bulanan, pribadi, luar kota, dan driver event.',
    },
    {
      entityId: cat.household!.id,
      title: 'Jasa Rumah Tangga - Ahli Panggilan',
      shortDescription: 'ART, babysitter, perawatan lansia, juru masak, dan office boy/girl.',
    },
    {
      entityId: cat.investigation!.id,
      title: 'Jasa Investigasi - Ahli Panggilan',
      shortDescription:
        'Investigasi perselingkuhan, karyawan, verifikasi alamat, dan audit kepatuhan.',
    },
    {
      entityId: cat.lainnya!.id,
      title: 'Layanan Lainnya - Ahli Panggilan',
      shortDescription: 'Butuh bantuan lain? Ceritakan kebutuhan Anda, kami siap membantu.',
    },
  ];

  const seoValues = seoEntries.map((e) => ({
    entityType: 'ServiceCategory' as const,
    entityId: e.entityId,
    metaTitle: e.title,
    metaDescription: e.shortDescription,
  }));

  await db.insert(seoMetadata).values(seoValues);
  console.log('  ✓ 17 SEO metadata entries created');

  // ─── Article Categories ──────────────────────────────────────────
  const [artCatHome] = await db
    .insert(articleCategories)
    .values({
      name: 'Tips Rumah',
      slug: 'tips-rumah',
      description: 'Tips perawatan dan perbaikan rumah',
      displayOrder: 1,
    })
    .returning({ id: articleCategories.id });

  const [artCatOtomotif] = await db
    .insert(articleCategories)
    .values({
      name: 'Otomotif',
      slug: 'otomotif',
      description: 'Tips perawatan kendaraan',
      displayOrder: 2,
    })
    .returning({ id: articleCategories.id });

  const [artCatElektronik] = await db
    .insert(articleCategories)
    .values({
      name: 'Elektronik',
      slug: 'elektronik',
      description: 'Tips perawatan elektronik rumah',
      displayOrder: 3,
    })
    .returning({ id: articleCategories.id });

  const [artCatKebersihan] = await db
    .insert(articleCategories)
    .values({
      name: 'Kebersihan',
      slug: 'kebersihan',
      description: 'Tips kebersihan rumah dan lingkungan',
      displayOrder: 4,
    })
    .returning({ id: articleCategories.id });

  console.log('  ✓ 4 article categories created');

  // ─── Articles ────────────────────────────────────────────────────
  await db.insert(articles).values([
    {
      categoryId: artCatHome!.id,
      title: 'Cara Mengatasi Pipa Bocor Sebelum Teknisi Datang',
      slug: 'mengatasi-pipa-bocor',
      summary:
        'Pipa bocor bisa merusak rumah. Pelajari cara mengatasinya sementara sebelum teknisi datang.',
      content:
        'Pipa bocor adalah masalah yang bisa muncul kapan saja.\\n\\n## 1. Matikan Sumber Air\\nSegera matikan keran utama untuk menghentikan aliran air.\\n\\n## 2. Lap dengan Kain\\nKeringkan area yang bocor dengan kain lap.\\n\\n## 3. Gunakaan Sealant Sementara\\nAnda bisa menggunakan lem pipa atau sealant sebagai solusi sementara.\\n\\n## 4. Hubungi Teknisi\\nSegera hubungi Ahli Panggilan untuk perbaikan permanen.',
      authorName: 'Tim Ahli Panggilan',
      status: 'Published',
      isFeatured: true,
      publishedAt: new Date(),
    },
    {
      categoryId: artCatOtomotif!.id,
      title: '5 Hal yang Harus Dilakukan Saat Mobil Mogok di Jalan',
      slug: 'saat-mobil-mogok',
      summary:
        'Mobil mogok di jalan? Jangan panik. Ikuti langkah-langkah ini untuk keselamatan Anda.',
      content:
        'Mobil mogok di tengah jalan bisa sangat mengkhawatirkan.\\n\\n## 1. Tetap Tenang\\nJangan panik. Nyalakan lampu hazard.\\n\\n## 2. Pinggirkan Kendaraan\\nJika memungkinkan, pinggirkan kendaraan ke bahu jalan.\\n\\n## 3. Pasang Segitiga Pengaman\\nPasang segitiga pengaman 50 meter di belakang mobil.\\n\\n## 4. Hubungi Layanan Darurat\\nHubungi Ahli Panggilan untuk bantuan derek atau montir.\\n\\n## 5. Jangan Terima Bantuan Sembarangan\\nTunggu bantuan resmi yang Anda hubungi.',
      authorName: 'Tim Ahli Panggilan',
      status: 'Published',
      isFeatured: true,
      publishedAt: new Date(),
    },
    {
      categoryId: artCatElektronik!.id,
      title: 'Panduan Merawat AC Agar Tetap Dingin dan Hemat Listrik',
      slug: 'merawat-ac-hemat-listrik',
      summary:
        'AC tidak sedingin dulu? Simak tips perawatan AC agar tetap optimal dan tagihan listrik tetap hemat.',
      content:
        'AC adalah investasi penting untuk kenyamanan rumah.\\n\\n## 1. Bersihkan Filter Secara Rutin\\nFilter AC yang kotor membuat kinerja AC berat dan tagihan listrik membengkak. Bersihkan setiap 2 minggu.\\n\\n## 2. Periksa Freon\\nFreon yang berkurang akan membuat AC tidak dingin. Segera hubungi teknisi.\\n\\n## 3. Servis Berkala\\nLakukan servis besar setiap 3-6 bulan oleh teknisi profesional.\\n\\n## 4. Atur Suhu Ideal\\nSuhu AC ideal 24-26°C. Setiap derajat lebih rendah meningkatkan konsumsi listrik hingga 6%.',
      authorName: 'Tim Ahli Panggilan',
      status: 'Published',
      isFeatured: false,
      publishedAt: new Date(),
    },
    {
      categoryId: artCatKebersihan!.id,
      title: 'Tips Membersihkan Sofa di Rumah dengan Mudah',
      slug: 'tips-membersihkan-sofa',
      summary: 'Sofa kotor? Pelajari cara membersihkan sofa berbahan kain dan kulit dengan benar.',
      content:
        'Sofa adalah perabot yang paling sering digunakan.\\n\\n## 1. Vakum Secara Teratur\\nVakum sofa setiap minggu untuk menghilangkan debu dan kotoran.\\n\\n## 2. Bersihkan Noda Segera\\nSegera bersihkan noda sebelum meresap ke dalam kain.\\n\\n## 3. Gunakan Pembersih Khusus\\nGunakan pembersih yang sesuai dengan bahan sofa.\\n\\n## 4. Panggil Profesional\\nUntuk hasil maksimal, panggil jasa cuci sofa profesional setiap 6-12 bulan.',
      authorName: 'Tim Ahli Panggilan',
      status: 'Published',
      isFeatured: false,
      publishedAt: new Date(),
    },
  ]);
  console.log('  ✓ 4 articles created');

  // ─── FAQ ─────────────────────────────────────────────────────────
  await db.insert(faq).values([
    {
      question: 'Bagaimana cara melakukan booking?',
      answer:
        'Anda dapat melakukan booking langsung melalui website tanpa perlu login. Pilih layanan yang diinginkan, isi form data diri dan alamat, lalu submit.',
      category: 'Booking',
      displayOrder: 1,
    },
    {
      question: 'Apakah saya perlu membuat akun untuk booking?',
      answer:
        'Tidak perlu. Anda bisa booking sebagai Guest. Namun, jika mendaftar akun, Anda bisa melacak histori order, menyimpan alamat, dan memberikan review.',
      category: 'Akun',
      displayOrder: 1,
    },
    {
      question: 'Bagaimana cara menentukan harga akhir?',
      answer:
        'Harga yang tertera adalah estimasi awal. Harga final ditentukan setelah admin melakukan pengecekan melalui komunikasi WhatsApp.',
      category: 'Pembayaran',
      displayOrder: 1,
    },
    {
      question: 'Metode pembayaran apa saja yang tersedia?',
      answer:
        'Saat ini pembayaran dilakukan secara manual melalui transfer bank. Admin akan memberikan informasi rekening setelah pekerjaan selesai.',
      category: 'Pembayaran',
      displayOrder: 2,
    },
    {
      question: 'Apa yang harus dilakukan dalam keadaan darurat?',
      answer:
        'Segera pilih kategori "Layanan Darurat" di halaman utama atau hubungi kami via WhatsApp. Tim kami akan merespon dalam waktu 15-30 menit.',
      category: 'Booking',
      displayOrder: 2,
    },
    {
      question: 'Apa saja area layanan Ahli Panggilan?',
      answer:
        'Saat ini kami melayani area Jabodetabek dan Bandung. Kami terus memperluas jangkauan ke kota-kota lainnya.',
      category: 'Layanan',
      displayOrder: 1,
    },
    {
      question: 'Berapa lama proses booking hingga pekerjaan selesai?',
      answer:
        'Proses tergantung jenis layanan dan ketersediaan teknisi. Umumnya booking dikonfirmasi dalam 1-2 jam.',
      category: 'Layanan',
      displayOrder: 2,
    },
    {
      question: 'Apakah ada garansi untuk layanan yang sudah dikerjakan?',
      answer:
        'Ya, setiap layanan memiliki garansi sesuai dengan jenis pekerjaan. Tim kami akan menjelaskan detail garansi saat konfirmasi.',
      category: 'Layanan',
      displayOrder: 3,
    },
    {
      question: 'Bagaimana cara bergabung menjadi mitra teknisi?',
      answer:
        'Kunjungi halaman Daftar Mitra, isi data diri lengkap dengan KTP dan foto profil. Tim kami akan melakukan verifikasi dan menghubungi Anda.',
      category: 'Mitra',
      displayOrder: 1,
    },
  ]);
  console.log('  ✓ 9 FAQ entries created');

  // ─── System Settings ─────────────────────────────────────────────
  // (Sama seperti sebelumnya — tidak berubah)
  await db.insert(systemSettings).values([
    {
      category: 'general',
      key: 'site_name',
      value: 'Ahli Panggilan',
      description: 'Nama perusahaan',
    },
    {
      category: 'general',
      key: 'site_description',
      value: 'Perusahaan penyedia layanan jasa profesional',
      description: 'Deskripsi perusahaan',
    },
    {
      category: 'booking',
      key: 'cancellation_window_hours',
      value: '24',
      description: 'Batas waktu cancel (jam sebelum jadwal)',
    },
    {
      category: 'booking',
      key: 'max_booking_per_customer',
      value: '5',
      description: 'Maks booking aktif per customer',
    },
    {
      category: 'booking',
      key: 'auto_confirm_hours',
      value: '2',
      description: 'Auto confirm jika tidak direspon admin',
    },
    {
      category: 'commission',
      key: 'platform_fee_percent',
      value: '10',
      description: 'Komisi perusahaan (%)',
    },
    {
      category: 'commission',
      key: 'partner_payout_days',
      value: '7',
      description: 'Jeda pencairan dana partner (hari)',
    },
    {
      category: 'partner',
      key: 'min_rating_to_keep',
      value: '3.0',
      description: 'Rating minimal partner',
    },
    {
      category: 'partner',
      key: 'max_rejections_before_suspend',
      value: '5',
      description: 'Maks penolakan assignment sebelum suspend',
    },
    {
      category: 'security',
      key: 'max_login_attempts',
      value: '5',
      description: 'Maks percobaan login',
    },
    {
      category: 'security',
      key: 'lockout_duration_minutes',
      value: '30',
      description: 'Durasi lockout (menit)',
    },
    {
      category: 'whatsapp',
      key: 'whatsapp_phone_number',
      value: '6281234567890',
      description: 'Nomor WhatsApp publik',
    },
    {
      category: 'sitemap',
      key: 'sitemap_static_pages_priority',
      value: '1.0',
      description: 'Prioritas halaman statis di sitemap',
    },
    {
      category: 'sitemap',
      key: 'sitemap_static_pages_changefreq',
      value: 'weekly',
      description: 'Frekuensi perubahan halaman statis',
    },
    {
      category: 'sitemap',
      key: 'sitemap_services_priority',
      value: '0.8',
      description: 'Prioritas halaman layanan',
    },
    {
      category: 'sitemap',
      key: 'sitemap_services_changefreq',
      value: 'weekly',
      description: 'Frekuensi perubahan halaman layanan',
    },
    {
      category: 'sitemap',
      key: 'sitemap_articles_priority',
      value: '0.7',
      description: 'Prioritas halaman artikel',
    },
    {
      category: 'sitemap',
      key: 'sitemap_articles_changefreq',
      value: 'weekly',
      description: 'Frekuensi perubahan halaman artikel',
    },
    {
      category: 'sitemap',
      key: 'sitemap_blog_listing_priority',
      value: '0.8',
      description: 'Prioritas halaman blog listing',
    },
    {
      category: 'sitemap',
      key: 'sitemap_blog_listing_changefreq',
      value: 'daily',
      description: 'Frekuensi perubahan halaman blog listing',
    },
    {
      category: 'sitemap',
      key: 'sitemap_cms_pages_priority',
      value: '0.6',
      description: 'Prioritas halaman CMS',
    },
    {
      category: 'sitemap',
      key: 'sitemap_cms_pages_changefreq',
      value: 'monthly',
      description: 'Frekuensi perubahan halaman CMS',
    },
    {
      category: 'sitemap',
      key: 'indexnow_key',
      value: '',
      description: 'Kunci IndexNow untuk ping otomatis',
    },
    {
      category: 'sitemap',
      key: 'indexnow_enabled',
      value: 'false',
      description: 'Aktifkan IndexNow auto-ping',
    },
    {
      category: 'seo_permissions',
      key: 'perm_seo_meta',
      value: 'admin,super_admin,content_manager',
      description: 'Izin mengelola SEO metadata',
    },
    {
      category: 'seo_permissions',
      key: 'perm_seo_bulk',
      value: 'admin,super_admin',
      description: 'Izin SEO bulk edit',
    },
    {
      category: 'seo_permissions',
      key: 'perm_seo_audit',
      value: 'admin,super_admin,content_manager',
      description: 'Izin mengakses SEO audit',
    },
    {
      category: 'seo_permissions',
      key: 'perm_seo_redirects',
      value: 'admin,super_admin',
      description: 'Izin mengelola redirects',
    },
    {
      category: 'seo_permissions',
      key: 'perm_seo_404_monitor',
      value: 'admin,super_admin,content_manager',
      description: 'Izin memantau 404 errors',
    },
    {
      category: 'seo_permissions',
      key: 'perm_seo_indexnow',
      value: 'admin,super_admin',
      description: 'Izin mengelola IndexNow',
    },
    {
      category: 'seo_permissions',
      key: 'perm_seo_schema',
      value: 'admin,super_admin,content_manager',
      description: 'Izin mengelola Schema Markup',
    },
    {
      category: 'seo_permissions',
      key: 'perm_seo_sitemap_settings',
      value: 'admin,super_admin',
      description: 'Izin mengatur sitemap',
    },
  ]);
  console.log('  ✓ 32 system settings created');

  console.log('\n═══════════════════════════════════════════');
  console.log('  ✅ Seed data complete!');
  console.log('═══════════════════════════════════════════');
  console.log(`    17 categories, ${svcs.length} services`);
  console.log('    17 SEO metadata entries');
  console.log('    4 categories, 4 articles, 9 FAQ entries');
  console.log('    32 system settings');
}

seedData()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  });

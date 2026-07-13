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

import { sql, eq } from 'drizzle-orm';
import { db } from '@ahlipanggilan/database';
import {
  serviceCategories,
  services,
  partnerSkills,
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

  // ─── Service Categories ─────────────────────────────────────────
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

  const [paintingCat] = await db
    .insert(serviceCategories)
    .values({
      name: 'Pengecatan',
      slug: 'painting',
      description: 'Jasa pengecatan interior dan eksterior',
      icon: 'palette',
      displayOrder: 5,
    })
    .returning({ id: serviceCategories.id });

  console.log('  ✓ 5 service categories created');

  // ─── Services ────────────────────────────────────────────────────
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
    {
      categoryId: paintingCat!.id,
      name: 'Cat Interior',
      slug: 'cat-interior',
      shortDescription: 'Pengecatan dinding interior rumah/kantor',
      basePrice: '500000',
      estimatedDuration: 240,
      isFeatured: true,
      displayOrder: 1,
    },
    {
      categoryId: paintingCat!.id,
      name: 'Cat Eksterior',
      slug: 'cat-eksterior',
      shortDescription: 'Pengecatan dinding eksterior',
      basePrice: '750000',
      estimatedDuration: 360,
      displayOrder: 2,
    },
  ]);
  console.log('  ✓ 14 services created');

  // ─── SEO Metadata ────────────────────────────────────────────────
  const seoEntries = [
    {
      entityType: 'ServiceCategory',
      entityId: acCat!.id,
      metaTitle: 'Service AC Profesional - Ahli Panggilan',
      metaDescription:
        'Layanan service AC: cuci, isi freon, bongkar pasang. Teknisi bersertifikat.',
    },
    {
      entityType: 'ServiceCategory',
      entityId: plumbingCat!.id,
      metaTitle: 'Service Plumbing - Ahli Panggilan',
      metaDescription: 'Jasa perbaikan pipa bocor, saluran mampet, dan instalasi water heater.',
    },
    {
      entityType: 'ServiceCategory',
      entityId: electricalCat!.id,
      metaTitle: 'Service Listrik - Ahli Panggilan',
      metaDescription: 'Perbaikan listrik rumah, pasang lampu, dan upgrade panel listrik.',
    },
    {
      entityType: 'ServiceCategory',
      entityId: cleaningCat!.id,
      metaTitle: 'Jasa Cleaning - Ahli Panggilan',
      metaDescription: 'Pembersihan rumah standar hingga besar. Hasil bersih dan memuaskan.',
    },
    {
      entityType: 'ServiceCategory',
      entityId: paintingCat!.id,
      metaTitle: 'Jasa Pengecatan - Ahli Panggilan',
      metaDescription: 'Pengecatan interior dan eksterior profesional. Cat berkualitas.',
    },
  ];

  const [svcCuciAC] = await db
    .select({ id: services.id })
    .from(services)
    .where(eq(services.slug, 'cuci-ac-standar'))
    .limit(1);
  const [svcCatInterior] = await db
    .select({ id: services.id })
    .from(services)
    .where(eq(services.slug, 'cat-interior'))
    .limit(1);

  await db
    .insert(seoMetadata)
    .values(
      [
        ...seoEntries,
        svcCuciAC && {
          entityType: 'Service',
          entityId: svcCuciAC.id,
          metaTitle: 'Cuci AC Standar - Ahli Panggilan',
          metaDescription:
            'Pembersihan AC standar untuk rumah. Teknisi berpengalaman, garansi layanan.',
        },
        svcCatInterior && {
          entityType: 'Service',
          entityId: svcCatInterior.id,
          metaTitle: 'Cat Interior Profesional - Ahli Panggilan',
          metaDescription:
            'Jasa pengecatan interior rumah dan kantor. Hasil rapi, cat berkualitas.',
        },
      ].filter(Boolean),
    );

  console.log('  ✓ 7 SEO metadata entries created');

  // ─── Article Categories ──────────────────────────────────────────
  const [catAc] = await db
    .insert(articleCategories)
    .values({
      name: 'AC & Pendingin',
      slug: 'ac-pendingin',
      description: 'Tips perawatan dan perbaikan AC dan pendingin ruangan',
      displayOrder: 1,
    })
    .returning({ id: articleCategories.id });

  const [catPlumbing] = await db
    .insert(articleCategories)
    .values({
      name: 'Plumbing',
      slug: 'plumbing',
      description: 'Informasi seputar pipa, saluran air, dan sanitasi',
      displayOrder: 2,
    })
    .returning({ id: articleCategories.id });

  const [catCleaning] = await db
    .insert(articleCategories)
    .values({
      name: 'Cleaning',
      slug: 'cleaning',
      description: 'Tips kebersihan rumah, kantor, dan area komersial',
      displayOrder: 3,
    })
    .returning({ id: articleCategories.id });

  const [catElektronik] = await db
    .insert(articleCategories)
    .values({
      name: 'Elektronik & Listrik',
      slug: 'elektronik-listrik',
      description: 'Panduan instalasi listrik dan perbaikan elektronik',
      displayOrder: 4,
    })
    .returning({ id: articleCategories.id });

  console.log('  ✓ 4 article categories created');

  // ─── Articles ────────────────────────────────────────────────────
  await db.insert(articles).values([
    {
      categoryId: catAc!.id,
      title: 'Cara Merawat AC agar Awet dan Dingin Maksimal',
      slug: 'cara-merawat-ac-awet',
      summary:
        'Pelajari cara merawat AC dengan benar agar tetap dingin, hemat listrik, dan awet digunakan bertahun-tahun.',
      content:
        'AC adalah investasi penting untuk kenyamanan rumah. Dengan perawatan rutin, AC dapat bertahan lebih lama dan tetap efisien.\n\n## 1. Bersihkan Filter Secara Rutin\nFilter AC yang kotor membuat kinerja AC berat dan tagihan listrik membengkak. Bersihkan filter setiap 2 minggu sekali.\n\n## 2. Periksa Freon\nFreon yang berkurang akan membuat AC tidak dingin. Segera hubungi teknisi jika AC mulai terasa kurang dingin.\n\n## 3. Servis Berkala\nLakukan servis besar setiap 3-6 bulan sekali oleh teknisi profesional.\n\n## 4. Atur Suhu Ideal\nSuhu AC yang ideal adalah 24-26°C. Setiap derajat lebih rendah meningkatkan konsumsi listrik hingga 6%.',
      authorName: 'Tim Ahli Panggilan',
      status: 'Published',
      isFeatured: true,
      publishedAt: new Date(),
    },
    {
      categoryId: catPlumbing!.id,
      title: 'Mengatasi Saluran Air Mampet Tanpa Bantuan Tukang',
      slug: 'mengatasi-saluran-air-mampet',
      summary:
        'Saluran air mampet? Coba 5 cara mudah ini sebelum memanggil teknisi plumbing profesional.',
      content:
        'Saluran air mampet adalah masalah rumah tangga yang paling umum.\n\n## 1. Gunakan Air Panas\nTuangkan air panas secara perlahan ke saluran yang tersumbat.\n\n## 2. Baking Soda dan Cuka\nCampurkan 1/2 cangkir baking soda dengan 1/2 cangkir cuka.\n\n## 3. Gunakan Plunger\nAlat sederhana ini sangat efektif untuk mengatasi sumbatan ringan.',
      authorName: 'Tim Ahli Panggilan',
      status: 'Published',
      isFeatured: true,
      publishedAt: new Date(),
    },
    {
      categoryId: catCleaning!.id,
      title: 'Tips Membersihkan Rumah Setelah Renovasi',
      slug: 'tips-membersihkan-rumah-setelah-renovasi',
      summary:
        'Renovasi selesai? Berikut panduan lengkap membersihkan debu dan kotoran pasca renovasi.',
      content:
        '<p>Setelah renovasi, rumah biasanya dipenuhi debu halus.</p>\n<h2>1. Bersihkan dari Atas ke Bawah</h2>\n<p>Mulai dari langit-langit, dinding, lalu lantai.</p>\n<h2>2. Gunakan Vacuum Cleaner HEPA</h2>\n<p>Debu konstruksi sangat halus. Vacuum HEPA mampu menangkap partikel hingga 0.3 mikron.</p>',
      authorName: 'Tim Ahli Panggilan',
      status: 'Published',
      isFeatured: false,
      publishedAt: new Date(),
    },
    {
      categoryId: catElektronik!.id,
      title: 'Panduan Instalasi Listrik Rumah yang Aman',
      slug: 'panduan-instalasi-listrik-rumah-aman',
      summary:
        'Instalasi listrik yang salah bisa berbahaya. Simak panduan keamanan instalasi listrik rumah tinggal.',
      content:
        '<p>Instalasi listrik yang baik adalah investasi keamanan jangka panjang.</p>\n<h2>1. Gunakan Kabel Berkualitas SNI</h2>\n<p>Jangan tergiur kabel murah.</p>\n<h2>2. Pasang MCB yang Sesuai</h2>\n<p>MCB harus disesuaikan dengan total daya yang terpakai.</p>',
      authorName: 'Tim Ahli Panggilan',
      status: 'Published',
      isFeatured: false,
      tags: ['listrik', 'instalasi', 'keamanan', 'rumah'],
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
        'Harga akhir ditentukan setelah admin melakukan pengecekan melalui komunikasi WhatsApp.',
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
      question: 'Bagaimana cara menjadi mitra?',
      answer:
        'Kunjungi halaman Daftar Mitra, isi data diri lengkap dengan KTP dan foto profil. Tim kami akan melakukan verifikasi.',
      category: 'Mitra',
      displayOrder: 1,
    },
    {
      question: 'Apa saja area layanan Ahli Panggilan?',
      answer:
        'Saat ini kami melayani area Jabodetabek dan Bandung. Kami terus memperluas jangkauan.',
      category: 'Layanan',
      displayOrder: 1,
    },
    {
      question: 'Berapa lama proses booking hingga pekerjaan selesai?',
      answer:
        'Proses tergantung jenis layanan dan ketersediaan mitra. Umumnya booking dikonfirmasi dalam 1-2 jam.',
      category: 'Layanan',
      displayOrder: 2,
    },
  ]);
  console.log('  ✓ 7 FAQ entries created');

  // ─── System Settings ─────────────────────────────────────────────
  await db.insert(systemSettings).values([
    {
      category: 'general',
      key: 'site_name',
      value: 'Ahli Panggilan',
      description: 'Nama platform',
    },
    {
      category: 'general',
      key: 'site_description',
      value: 'Platform layanan jasa profesional on-demand',
      description: 'Deskripsi platform',
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
      description: 'Komisi platform (%)',
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
  console.log('    5 categories, 14 services');
  console.log('    7 SEO metadata entries');
  console.log('    4 categories, 4 articles, 7 FAQ entries');
  console.log('    32 system settings');
}

seedData()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  });

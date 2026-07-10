import { sql } from 'drizzle-orm';
import { db } from '@specialist/database';
import {
  users,
  customerProfiles,
  partnerProfiles,
  companies,
  companyUsers,
  branches,
  serviceCategories,
  services,
  addresses,
  orders,
  orderItems,
  orderStatusHistory,
  assignments,
  payments,
  reviews,
  complaints,
  notifications,
  partnerSkills,
  seoMetadata,
  systemSettings,
  articleCategories,
  articles,
  faq,
} from '@specialist/database';
import { hashPassword } from '../lib/auth.ts';
import type { OrderStatus, PaymentMethod, PaymentStatus } from '@specialist/types';

async function seed() {
  console.log('🌱 Seeding database...\n');

  console.log('  🧹 Clearing existing data...');
  await db.execute(sql`
    TRUNCATE TABLE
      notifications, reviews, complaints, payments, assignments,
      order_status_history, order_items, orders, addresses,
      partner_skills, seo_metadata, system_settings,
      services, service_categories, partner_profiles,
      customer_profiles, company_users, branches, companies, users,
      article_categories, articles, faq
    RESTART IDENTITY CASCADE
  `);
  console.log('  ✓ Done\n');

  const adminPassword = await hashPassword('password123');
  const partnerPassword = await hashPassword('password123');
  const customerPassword = await hashPassword('password123');

  // ─── Users ───────────────────────────────────────────────────────
  const [superAdmin] = await db
    .insert(users)
    .values({
      email: 'admin@spesialis.id',
      phone: '6281234567890',
      passwordHash: adminPassword,
      role: 'super_admin',
      status: 'active',
    })
    .returning({ id: users.id });

  const [_admin] = await db
    .insert(users)
    .values({
      email: 'admin2@spesialis.id',
      phone: '6281234567893',
      passwordHash: adminPassword,
      role: 'admin',
      status: 'active',
    })
    .returning({ id: users.id });

  const [_dispatcher] = await db
    .insert(users)
    .values({
      email: 'dispatcher@spesialis.id',
      phone: '6281234567894',
      passwordHash: adminPassword,
      role: 'dispatcher',
      status: 'active',
    })
    .returning({ id: users.id });

  const [_finance] = await db
    .insert(users)
    .values({
      email: 'finance@spesialis.id',
      phone: '6281234567895',
      passwordHash: adminPassword,
      role: 'finance',
      status: 'active',
    })
    .returning({ id: users.id });

  const [_contentMgr] = await db
    .insert(users)
    .values({
      email: 'content@spesialis.id',
      phone: '6281234567896',
      passwordHash: adminPassword,
      role: 'content_manager',
      status: 'active',
    })
    .returning({ id: users.id });

  const [partnerUser1] = await db
    .insert(users)
    .values({
      email: 'partner@spesialis.id',
      phone: '6281234567891',
      passwordHash: partnerPassword,
      role: 'partner',
      status: 'active',
    })
    .returning({ id: users.id });

  const [partnerUser2] = await db
    .insert(users)
    .values({
      email: 'partner2@spesialis.id',
      phone: '6281234567897',
      passwordHash: partnerPassword,
      role: 'partner',
      status: 'active',
    })
    .returning({ id: users.id });

  const [customerUser1] = await db
    .insert(users)
    .values({
      email: 'customer@spesialis.id',
      phone: '6281234567892',
      passwordHash: customerPassword,
      role: 'customer',
      status: 'active',
    })
    .returning({ id: users.id });

  const [customerUser2] = await db
    .insert(users)
    .values({
      email: 'customer2@spesialis.id',
      phone: '6281234567898',
      passwordHash: customerPassword,
      role: 'customer',
      status: 'active',
    })
    .returning({ id: users.id });

  const [corporateUser] = await db
    .insert(users)
    .values({
      email: 'corporate@spesialis.id',
      phone: '6281234567899',
      passwordHash: customerPassword,
      role: 'corporate',
      status: 'active',
    })
    .returning({ id: users.id });

  console.log(
    '  ✓ 9 users created (super_admin, admin, dispatcher, finance, content_manager, 2 partners, 2 customers, corporate)',
  );

  // ─── Profiles ────────────────────────────────────────────────────
  const [customerProfile1] = await db
    .insert(customerProfiles)
    .values({
      userId: customerUser1!.id,
      fullName: 'Budi Santoso',
      birthDate: '1990-05-15',
      gender: 'male',
    })
    .returning({ id: customerProfiles.id });

  const [customerProfile2] = await db
    .insert(customerProfiles)
    .values({
      userId: customerUser2!.id,
      fullName: 'Siti Rahmawati',
      birthDate: '1995-11-20',
      gender: 'female',
    })
    .returning({ id: customerProfiles.id });

  const [partnerProfile1] = await db
    .insert(partnerProfiles)
    .values({
      userId: partnerUser1!.id,
      fullName: 'Ahmad Teknisi',
      phone: '6281234567891',
      ktpNumber: '1234567890123456',
      experienceYear: 5,
      bio: 'Teknisi AC dan listrik berpengalaman. Sudah menangani 500+ pelanggan.',
      availability: 'Available',
      verificationStatus: 'Approved',
      ratingAverage: '4.5',
      completedJobs: 120,
    })
    .returning({ id: partnerProfiles.id });

  const [partnerProfile2] = await db
    .insert(partnerProfiles)
    .values({
      userId: partnerUser2!.id,
      fullName: 'Dwi Plumbing',
      phone: '6281234567897',
      ktpNumber: '6543210987654321',
      experienceYear: 3,
      bio: 'Ahli perbaikan pipa, saluran air, dan water heater.',
      availability: 'Available',
      verificationStatus: 'Approved',
      ratingAverage: '4.2',
      completedJobs: 85,
    })
    .returning({ id: partnerProfiles.id });

  console.log('  ✓ 4 profiles created (2 customers, 2 partners)');

  // ─── Company ─────────────────────────────────────────────────────
  const [company] = await db
    .insert(companies)
    .values({
      companyName: 'PT Sejahtera Abadi',
      legalName: 'PT Sejahtera Abadi Bersama',
      taxNumber: '123456789012345',
      email: 'info@sejahteraabadi.co.id',
      phone: '6282112345678',
      website: 'https://sejahteraabadi.co.id',
      industry: 'Property & Real Estate',
      employeeCount: 250,
      status: 'Verified',
    })
    .returning({ id: companies.id });

  await db.insert(companyUsers).values({
    companyId: company!.id,
    userId: corporateUser!.id,
    role: 'admin',
  });

  await db.insert(branches).values([
    {
      companyId: company!.id,
      name: 'Kantor Pusat',
      address: 'Jl. Sudirman No. 123',
      city: 'Jakarta Pusat',
      phone: '6282112345678',
    },
    {
      companyId: company!.id,
      name: 'Cabang Bandung',
      address: 'Jl. Dago No. 45',
      city: 'Bandung',
      phone: '6282112345680',
    },
  ]);

  console.log('  ✓ 1 company + 1 corporate user + 2 branches created');

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
  const [svcCuciAC] = await db
    .insert(services)
    .values({
      categoryId: acCat!.id,
      name: 'Cuci AC Standar',
      slug: 'cuci-ac-standar',
      shortDescription: 'Pembersihan AC standar untuk rumah',
      basePrice: '150000',
      estimatedDuration: 60,
      isFeatured: true,
      displayOrder: 1,
    })
    .returning({ id: services.id });

  const [svcCuciACMedium] = await db
    .insert(services)
    .values({
      categoryId: acCat!.id,
      name: 'Cuci AC Medium',
      slug: 'cuci-ac-medium',
      shortDescription: 'Pembersihan AC untuk kantor kecil',
      basePrice: '200000',
      estimatedDuration: 90,
      displayOrder: 2,
    })
    .returning({ id: services.id });

  const [svcFreonAC] = await db
    .insert(services)
    .values({
      categoryId: acCat!.id,
      name: 'Isi Freon AC',
      slug: 'isi-freon-ac',
      shortDescription: 'Isi ulang freon AC',
      basePrice: '250000',
      estimatedDuration: 45,
      displayOrder: 3,
    })
    .returning({ id: services.id });

  const [svcBongkarAC] = await db
    .insert(services)
    .values({
      categoryId: acCat!.id,
      name: 'Bongkar Pasang AC',
      slug: 'bongkar-pasang-ac',
      shortDescription: 'Jasa bongkar pasang AC',
      basePrice: '350000',
      estimatedDuration: 120,
      isFeatured: true,
      displayOrder: 4,
    })
    .returning({ id: services.id });

  const [svcPipaBocor] = await db
    .insert(services)
    .values({
      categoryId: plumbingCat!.id,
      name: 'Bocor Pipa Air',
      slug: 'bocor-pipa-air',
      shortDescription: 'Perbaikan pipa air bocor',
      basePrice: '150000',
      estimatedDuration: 60,
      isFeatured: true,
      displayOrder: 1,
    })
    .returning({ id: services.id });

  const [svcSaluranMampet] = await db
    .insert(services)
    .values({
      categoryId: plumbingCat!.id,
      name: 'Saluran Mampet',
      slug: 'saluran-mampet',
      shortDescription: 'Pengurasan saluran air mampet',
      basePrice: '200000',
      estimatedDuration: 90,
      displayOrder: 2,
    })
    .returning({ id: services.id });

  const [_svcWaterHeater] = await db
    .insert(services)
    .values({
      categoryId: plumbingCat!.id,
      name: 'Pasang Water Heater',
      slug: 'pasang-water-heater',
      shortDescription: 'Instalasi pemanas air',
      basePrice: '300000',
      estimatedDuration: 120,
      displayOrder: 3,
    })
    .returning({ id: services.id });

  const [svcListrik] = await db
    .insert(services)
    .values({
      categoryId: electricalCat!.id,
      name: 'Perbaikan Listrik',
      slug: 'perbaikan-listrik',
      shortDescription: 'Perbaikan instalasi listrik rumah',
      basePrice: '100000',
      estimatedDuration: 45,
      isFeatured: true,
      displayOrder: 1,
    })
    .returning({ id: services.id });

  const [_svcLampu] = await db
    .insert(services)
    .values({
      categoryId: electricalCat!.id,
      name: 'Pasang Lampu',
      slug: 'pasang-lampu',
      shortDescription: 'Pemasangan lampu dan fitting',
      basePrice: '75000',
      estimatedDuration: 30,
      displayOrder: 2,
    })
    .returning({ id: services.id });

  const [_svcPanel] = await db
    .insert(services)
    .values({
      categoryId: electricalCat!.id,
      name: 'Panel Listrik',
      slug: 'panel-listrik',
      shortDescription: 'Perbaikan dan upgrade panel listrik',
      basePrice: '250000',
      estimatedDuration: 120,
      displayOrder: 3,
    })
    .returning({ id: services.id });

  const [svcCleaningStandar] = await db
    .insert(services)
    .values({
      categoryId: cleaningCat!.id,
      name: 'Bersih Rumah Standar',
      slug: 'bersih-rumah-standar',
      shortDescription: 'Pembersihan rumah tipe 36-45',
      basePrice: '200000',
      estimatedDuration: 120,
      isFeatured: true,
      displayOrder: 1,
    })
    .returning({ id: services.id });

  const [svcCleaningBesar] = await db
    .insert(services)
    .values({
      categoryId: cleaningCat!.id,
      name: 'Bersih Rumah Besar',
      slug: 'bersih-rumah-besar',
      shortDescription: 'Pembersihan rumah tipe 60+',
      basePrice: '350000',
      estimatedDuration: 180,
      displayOrder: 2,
    })
    .returning({ id: services.id });

  const [svcCatInterior] = await db
    .insert(services)
    .values({
      categoryId: paintingCat!.id,
      name: 'Cat Interior',
      slug: 'cat-interior',
      shortDescription: 'Pengecatan dinding interior rumah/kantor',
      basePrice: '500000',
      estimatedDuration: 240,
      isFeatured: true,
      displayOrder: 1,
    })
    .returning({ id: services.id });

  const [_svcCatEksterior] = await db
    .insert(services)
    .values({
      categoryId: paintingCat!.id,
      name: 'Cat Eksterior',
      slug: 'cat-eksterior',
      shortDescription: 'Pengecatan dinding eksterior',
      basePrice: '750000',
      estimatedDuration: 360,
      displayOrder: 2,
    })
    .returning({ id: services.id });

  console.log('  ✓ 14 services created');

  // ─── Partner Skills ──────────────────────────────────────────────
  await db.insert(partnerSkills).values([
    { partnerId: partnerProfile1!.id, categoryId: acCat!.id, proficiency: 'Expert' },
    { partnerId: partnerProfile1!.id, categoryId: electricalCat!.id, proficiency: 'Advanced' },
    { partnerId: partnerProfile2!.id, categoryId: plumbingCat!.id, proficiency: 'Expert' },
    { partnerId: partnerProfile2!.id, categoryId: cleaningCat!.id, proficiency: 'Intermediate' },
  ]);
  console.log('  ✓ 4 partner skills created');

  // ─── Addresses ───────────────────────────────────────────────────
  const [addrBudi1] = await db
    .insert(addresses)
    .values({
      customerId: customerProfile1!.id,
      label: 'Rumah',
      receiverName: 'Budi Santoso',
      receiverPhone: '6281234567892',
      province: 'DKI Jakarta',
      city: 'Jakarta Selatan',
      district: 'Kebayoran Baru',
      postalCode: '12120',
      address: 'Jl. Senopati No. 8, RT 05 RW 03',
      isDefault: true,
    })
    .returning({ id: addresses.id });

  const [addrBudi2] = await db
    .insert(addresses)
    .values({
      customerId: customerProfile1!.id,
      label: 'Kantor',
      receiverName: 'Budi Santoso',
      receiverPhone: '6281234567892',
      province: 'DKI Jakarta',
      city: 'Jakarta Selatan',
      district: 'Setiabudi',
      postalCode: '12950',
      address: 'Wisma XYZ Lt. 5, Jl. HR Rasuna Said',
      isDefault: false,
    })
    .returning({ id: addresses.id });

  const [addrSiti] = await db
    .insert(addresses)
    .values({
      customerId: customerProfile2!.id,
      label: 'Rumah',
      receiverName: 'Siti Rahmawati',
      receiverPhone: '6281234567898',
      province: 'Jawa Barat',
      city: 'Bandung',
      district: 'Coblong',
      postalCode: '40132',
      address: 'Jl. Dipatiukur No. 112',
      isDefault: true,
    })
    .returning({ id: addresses.id });

  console.log('  ✓ 3 addresses created');

  // ─── Orders ──────────────────────────────────────────────────────
  interface CreateSeedOrder {
    customerId: string;
    addressId: string;
    status: OrderStatus;
    bookingDate: string;
    bookingTime: string;
    notes?: string | null;
    finalPrice?: string;
    discountAmount?: string;
    partnerId?: string | null;
    completedAt?: Date;
    closedAt?: Date;
  }

  // Helper: create order with items and status history
  async function createOrder(
    overrides: CreateSeedOrder,
    items: { serviceId: string; serviceName: string; quantity: number; unitPrice: number }[],
    statusHistory: { from: OrderStatus | null; to: OrderStatus; note?: string }[],
    assignInfo?: { partnerId: string },
    paymentInfo?: { method: PaymentMethod; amount: number; status: PaymentStatus },
  ) {
    const orderId = crypto.randomUUID();
    const bookingNumber = `SP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`;
    const basePrice = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

    await db.insert(orders).values({
      id: orderId,
      bookingNumber,
      customerId: overrides.customerId,
      addressId: overrides.addressId,
      status: overrides.status,
      bookingDate: overrides.bookingDate,
      bookingTime: overrides.bookingTime,
      notes: overrides.notes ?? null,
      finalPrice: overrides.finalPrice ?? null,
      discountAmount: overrides.discountAmount ?? '0',
      partnerId: overrides.partnerId ?? null,
      completedAt: overrides.completedAt ?? null,
      closedAt: overrides.closedAt ?? null,
      basePrice: String(basePrice),
    });

    for (const item of items) {
      await db.insert(orderItems).values({
        orderId,
        serviceId: item.serviceId,
        serviceNameSnapshot: item.serviceName,
        quantity: item.quantity,
        unitPrice: String(item.unitPrice),
        subtotal: String(item.unitPrice * item.quantity),
      });
    }

    for (const sh of statusHistory) {
      await db.insert(orderStatusHistory).values({
        orderId,
        fromStatus: sh.from,
        toStatus: sh.to,
        changedBy: superAdmin!.id,
        note: sh.note ?? null,
      });
    }

    if (assignInfo) {
      await db.insert(assignments).values({
        orderId,
        partnerId: assignInfo.partnerId,
        status: statusHistory.some((s) => s.to === 'Partner Accepted') ? 'Accepted' : 'Assigned',
        assignedAt: new Date(Date.now() - 3600000),
        acceptedAt: statusHistory.some((s) => s.to === 'Partner Accepted')
          ? new Date(Date.now() - 1800000)
          : null,
      });
    }

    if (paymentInfo) {
      await db.insert(payments).values({
        orderId,
        method: paymentInfo.method,
        amount: String(paymentInfo.amount),
        status: paymentInfo.status,
        paymentDate:
          paymentInfo.status === 'Paid' || paymentInfo.status === 'Pending Verification'
            ? new Date()
            : null,
        verifiedBy:
          paymentInfo.status === 'Paid' || paymentInfo.status === 'Pending Verification'
            ? superAdmin!.id
            : null,
        verifiedAt: paymentInfo.status === 'Paid' ? new Date() : null,
      });
    }

    return orderId;
  }

  // Order 1: Pending Confirmation (Budi - Cuci AC)
  await createOrder(
    {
      customerId: customerProfile1!.id,
      addressId: addrBudi1!.id,
      status: 'Pending Confirmation',
      bookingDate: '2026-07-03',
      bookingTime: '10:00',
      notes: 'AC di ruang tamu, mohon dibawa tangga',
    },
    [{ serviceId: svcCuciAC!.id, serviceName: 'Cuci AC Standar', quantity: 2, unitPrice: 150000 }],
    [{ from: null, to: 'Pending Confirmation' }],
  );

  // Order 2: Confirmed (Budi - Saluran Mampet)
  await createOrder(
    {
      customerId: customerProfile1!.id,
      addressId: addrBudi2!.id,
      status: 'Confirmed',
      bookingDate: '2026-07-04',
      bookingTime: '14:00',
      finalPrice: '200000',
    },
    [
      {
        serviceId: svcSaluranMampet!.id,
        serviceName: 'Saluran Mampet',
        quantity: 1,
        unitPrice: 200000,
      },
    ],
    [
      { from: null, to: 'Pending Confirmation' },
      { from: 'Pending Confirmation', to: 'Confirmed', note: 'Harga disetujui' },
    ],
  );

  // Order 3: Waiting Assignment (Siti - Cleaning)
  await createOrder(
    {
      customerId: customerProfile2!.id,
      addressId: addrSiti!.id,
      status: 'Waiting Assignment',
      bookingDate: '2026-07-05',
      bookingTime: '09:00',
      finalPrice: '200000',
    },
    [
      {
        serviceId: svcCleaningStandar!.id,
        serviceName: 'Bersih Rumah Standar',
        quantity: 1,
        unitPrice: 200000,
      },
    ],
    [
      { from: null, to: 'Pending Confirmation' },
      { from: 'Pending Confirmation', to: 'Confirmed' },
      { from: 'Confirmed', to: 'Waiting Assignment' },
    ],
  );

  // Order 4: Partner Assigned (Siti - Isi Freon) → partner1 assigned
  await createOrder(
    {
      customerId: customerProfile2!.id,
      addressId: addrSiti!.id,
      status: 'Partner Assigned',
      bookingDate: '2026-07-06',
      bookingTime: '11:00',
      finalPrice: '250000',
    },
    [{ serviceId: svcFreonAC!.id, serviceName: 'Isi Freon AC', quantity: 1, unitPrice: 250000 }],
    [
      { from: null, to: 'Pending Confirmation' },
      { from: 'Pending Confirmation', to: 'Confirmed' },
      { from: 'Confirmed', to: 'Waiting Assignment' },
      { from: 'Waiting Assignment', to: 'Partner Assigned' },
    ],
    { partnerId: partnerProfile1!.id },
  );

  // Order 5: Partner Accepted (Budi - Perbaikan Listrik) → partner1 accepted
  await createOrder(
    {
      customerId: customerProfile1!.id,
      addressId: addrBudi1!.id,
      partnerId: partnerProfile1!.id,
      status: 'Partner Accepted',
      bookingDate: '2026-07-02',
      bookingTime: '13:00',
      finalPrice: '100000',
    },
    [
      {
        serviceId: svcListrik!.id,
        serviceName: 'Perbaikan Listrik',
        quantity: 1,
        unitPrice: 100000,
      },
    ],
    [
      { from: null, to: 'Pending Confirmation' },
      { from: 'Pending Confirmation', to: 'Confirmed' },
      { from: 'Confirmed', to: 'Waiting Assignment' },
      { from: 'Waiting Assignment', to: 'Partner Assigned' },
      { from: 'Partner Assigned', to: 'Partner Accepted' },
    ],
    { partnerId: partnerProfile1!.id },
  );

  // Order 6: Working (Budi - Bongkar Pasang AC) → partner1 working now
  await createOrder(
    {
      customerId: customerProfile1!.id,
      addressId: addrBudi1!.id,
      partnerId: partnerProfile1!.id,
      status: 'Working',
      bookingDate: '2026-07-01',
      bookingTime: '08:00',
      finalPrice: '350000',
    },
    [
      {
        serviceId: svcBongkarAC!.id,
        serviceName: 'Bongkar Pasang AC',
        quantity: 1,
        unitPrice: 350000,
      },
    ],
    [
      { from: null, to: 'Pending Confirmation' },
      { from: 'Pending Confirmation', to: 'Confirmed' },
      { from: 'Confirmed', to: 'Waiting Assignment' },
      { from: 'Waiting Assignment', to: 'Partner Assigned' },
      { from: 'Partner Assigned', to: 'Partner Accepted' },
      { from: 'Partner Accepted', to: 'Working' },
    ],
    { partnerId: partnerProfile1!.id },
  );

  // Order 7: Completed (Siti - Bocor Pipa) → partner2 completed
  const o7 = await createOrder(
    {
      customerId: customerProfile2!.id,
      addressId: addrSiti!.id,
      partnerId: partnerProfile2!.id,
      status: 'Completed',
      bookingDate: '2026-06-30',
      bookingTime: '10:00',
      finalPrice: '150000',
      completedAt: new Date('2026-06-30T12:30:00'),
    },
    [
      {
        serviceId: svcPipaBocor!.id,
        serviceName: 'Bocor Pipa Air',
        quantity: 1,
        unitPrice: 150000,
      },
    ],
    [
      { from: null, to: 'Pending Confirmation' },
      { from: 'Pending Confirmation', to: 'Confirmed' },
      { from: 'Confirmed', to: 'Waiting Assignment' },
      { from: 'Waiting Assignment', to: 'Partner Assigned' },
      { from: 'Partner Assigned', to: 'Partner Accepted' },
      { from: 'Partner Accepted', to: 'Working' },
      { from: 'Working', to: 'Completed' },
    ],
    { partnerId: partnerProfile2!.id },
  );

  // Order 8: Waiting Payment (Budi - Cleaning Besar) → completed, waiting payment
  const o8 = await createOrder(
    {
      customerId: customerProfile1!.id,
      addressId: addrBudi1!.id,
      partnerId: partnerProfile2!.id,
      status: 'Waiting Payment',
      bookingDate: '2026-06-29',
      bookingTime: '09:00',
      finalPrice: '350000',
      completedAt: new Date('2026-06-29T12:00:00'),
    },
    [
      {
        serviceId: svcCleaningBesar!.id,
        serviceName: 'Bersih Rumah Besar',
        quantity: 1,
        unitPrice: 350000,
      },
    ],
    [
      { from: null, to: 'Pending Confirmation' },
      { from: 'Pending Confirmation', to: 'Confirmed' },
      { from: 'Confirmed', to: 'Waiting Assignment' },
      { from: 'Waiting Assignment', to: 'Partner Assigned' },
      { from: 'Partner Assigned', to: 'Partner Accepted' },
      { from: 'Partner Accepted', to: 'Working' },
      { from: 'Working', to: 'Completed' },
      { from: 'Completed', to: 'Waiting Payment' },
    ],
    { partnerId: partnerProfile2!.id },
  );

  // Order 9: Paid (Siti - Cat Interior) → completed, paid (Transfer)
  const o9 = await createOrder(
    {
      customerId: customerProfile2!.id,
      addressId: addrSiti!.id,
      partnerId: partnerProfile1!.id,
      status: 'Paid',
      bookingDate: '2026-06-28',
      bookingTime: '10:00',
      finalPrice: '500000',
      completedAt: new Date('2026-06-28T15:00:00'),
    },
    [
      {
        serviceId: svcCatInterior!.id,
        serviceName: 'Cat Interior',
        quantity: 1,
        unitPrice: 500000,
      },
    ],
    [
      { from: null, to: 'Pending Confirmation' },
      { from: 'Pending Confirmation', to: 'Confirmed' },
      { from: 'Confirmed', to: 'Waiting Assignment' },
      { from: 'Waiting Assignment', to: 'Partner Assigned' },
      { from: 'Partner Assigned', to: 'Partner Accepted' },
      { from: 'Partner Accepted', to: 'Working' },
      { from: 'Working', to: 'Completed' },
      { from: 'Completed', to: 'Waiting Payment' },
      { from: 'Waiting Payment', to: 'Paid' },
    ],
    { partnerId: partnerProfile1!.id },
    { method: 'Transfer', amount: 500000, status: 'Paid' },
  );

  // Order 10: Closed (Budi - Cuci AC Medium) → full lifecycle complete
  const o10 = await createOrder(
    {
      customerId: customerProfile1!.id,
      addressId: addrBudi1!.id,
      partnerId: partnerProfile1!.id,
      status: 'Closed',
      bookingDate: '2026-06-25',
      bookingTime: '10:00',
      finalPrice: '200000',
      completedAt: new Date('2026-06-25T11:30:00'),
      closedAt: new Date('2026-06-26T09:00:00'),
    },
    [
      {
        serviceId: svcCuciACMedium!.id,
        serviceName: 'Cuci AC Medium',
        quantity: 1,
        unitPrice: 200000,
      },
    ],
    [
      { from: null, to: 'Pending Confirmation' },
      { from: 'Pending Confirmation', to: 'Confirmed' },
      { from: 'Confirmed', to: 'Waiting Assignment' },
      { from: 'Waiting Assignment', to: 'Partner Assigned' },
      { from: 'Partner Assigned', to: 'Partner Accepted' },
      { from: 'Partner Accepted', to: 'Working' },
      { from: 'Working', to: 'Completed' },
      { from: 'Completed', to: 'Waiting Payment' },
      { from: 'Waiting Payment', to: 'Paid' },
      { from: 'Paid', to: 'Closed' },
    ],
    { partnerId: partnerProfile1!.id },
    { method: 'QRIS', amount: 200000, status: 'Paid' },
  );

  console.log('  ✓ 10 orders with items, status history, assignments, payments created');

  // ─── Reviews ─────────────────────────────────────────────────────
  await db.insert(reviews).values([
    {
      orderId: o9,
      customerId: customerProfile2!.id,
      partnerId: partnerProfile1!.id,
      rating: '4.5',
      review: 'Pelayanan sangat baik, AC jadi dingin kembali. Teknisi ramah dan tepat waktu.',
    },
    {
      orderId: o10,
      customerId: customerProfile1!.id,
      partnerId: partnerProfile1!.id,
      rating: '5.0',
      review: 'Puas banget! AC bersih, harganya masuk akal. Next pasti pesan lagi.',
    },
  ]);
  console.log('  ✓ 2 reviews created');

  // ─── Complaints ──────────────────────────────────────────────────
  const [_comp1] = await db
    .insert(complaints)
    .values({
      orderId: o7,
      customerId: customerProfile2!.id,
      status: 'Resolved',
      title: 'Kebocoran masih ada setelah perbaikan',
      description: 'Setelah diperbaiki, masih ada tetesan air di sambungan pipa.',
      resolution: 'Teknisi kembali dan melakukan perbaikan ulang. Saat ini sudah tidak bocor.',
      resolvedBy: superAdmin!.id,
      resolvedAt: new Date('2026-07-01T10:00:00'),
    })
    .returning({ id: complaints.id });

  const [_comp2] = await db
    .insert(complaints)
    .values({
      orderId: o8,
      customerId: customerProfile1!.id,
      status: 'Investigating',
      title: 'Hasil cleaning kurang memuaskan',
      description: 'Beberapa area masih berdebu setelah cleaning.',
    })
    .returning({ id: complaints.id });

  console.log('  ✓ 2 complaints created');

  // ─── Notifications ───────────────────────────────────────────────
  await db.insert(notifications).values([
    {
      userId: customerUser1!.id,
      type: 'booking_confirmed',
      channel: 'In App',
      title: 'Booking Dikonfirmasi',
      message: 'Booking #SP-2026-XXXXX telah dikonfirmasi. Teknisi akan segera diassign.',
      isRead: false,
    },
    {
      userId: customerUser1!.id,
      type: 'booking_completed',
      channel: 'In App',
      title: 'Pekerjaan Selesai',
      message: 'Pekerjaan Bongkar Pasang AC telah selesai. Silakan lakukan pembayaran.',
      isRead: true,
      sentAt: new Date('2026-06-25T11:30:00'),
    },
    {
      userId: partnerUser1!.id,
      type: 'new_assignment',
      channel: 'In App',
      title: 'Assignment Baru',
      message: 'Anda diassign ke order Cuci AC Standar di Jl. Senopati No. 8.',
      isRead: false,
    },
    {
      userId: partnerUser1!.id,
      type: 'review_received',
      channel: 'In App',
      title: 'Review Baru',
      message: 'Budi Santoso memberi Anda rating 5.0!',
      isRead: true,
      sentAt: new Date('2026-06-26T10:00:00'),
    },
  ]);
  console.log('  ✓ 4 notifications created');

  // ─── SEO Metadata ────────────────────────────────────────────────
  await db.insert(seoMetadata).values([
    {
      entityType: 'Service',
      entityId: svcCuciAC!.id,
      metaTitle: 'Cuci AC Standar - Spesialis',
      metaDescription:
        'Pembersihan AC standar untuk rumah. Teknisi berpengalaman, garansi layanan.',
    },
    {
      entityType: 'Service',
      entityId: svcCatInterior!.id,
      metaTitle: 'Cat Interior Profesional - Spesialis',
      metaDescription: 'Jasa pengecatan interior rumah dan kantor. Hasil rapi, cat berkualitas.',
    },
    {
      entityType: 'ServiceCategory',
      entityId: acCat!.id,
      metaTitle: 'Service AC Profesional - Spesialis',
      metaDescription:
        'Layanan service AC: cuci, isi freon, bongkar pasang. Teknisi bersertifikat.',
    },
  ]);
  console.log('  ✓ 3 SEO metadata entries created');

  // ─── Article Categories ──────────────────────────────────────────
  const catAcId = crypto.randomUUID();
  const catPlumbingId = crypto.randomUUID();
  const catCleaningId = crypto.randomUUID();
  const catElektronikId = crypto.randomUUID();
  await db.insert(articleCategories).values([
    {
      id: catAcId,
      name: 'AC & Pendingin',
      slug: 'ac-pendingin',
      description: 'Tips perawatan dan perbaikan AC dan pendingin ruangan',
      displayOrder: 1,
    },
    {
      id: catPlumbingId,
      name: 'Plumbing',
      slug: 'plumbing',
      description: 'Informasi seputar pipa, saluran air, dan sanitasi',
      displayOrder: 2,
    },
    {
      id: catCleaningId,
      name: 'Cleaning',
      slug: 'cleaning',
      description: 'Tips kebersihan rumah, kantor, dan area komersial',
      displayOrder: 3,
    },
    {
      id: catElektronikId,
      name: 'Elektronik & Listrik',
      slug: 'elektronik-listrik',
      description: 'Panduan instalasi listrik dan perbaikan elektronik',
      displayOrder: 4,
    },
  ]);
  console.log('  ✓ 4 article categories created');

  // ─── Articles ────────────────────────────────────────────────────
  await db.insert(articles).values([
    {
      id: crypto.randomUUID(),
      categoryId: catAcId,
      title: 'Cara Merawat AC agar Awet dan Dingin Maksimal',
      slug: 'cara-merawat-ac-awet',
      summary:
        'Pelajari cara merawat AC dengan benar agar tetap dingin, hemat listrik, dan awet digunakan bertahun-tahun.',
      content:
        'AC adalah investasi penting untuk kenyamanan rumah. Dengan perawatan rutin, AC dapat bertahan lebih lama dan tetap efisien.\n\n## 1. Bersihkan Filter Secara Rutin\nFilter AC yang kotor membuat kinerja AC berat dan tagihan listrik membengkak. Bersihkan filter setiap 2 minggu sekali.\n\n## 2. Periksa Freon\nFreon yang berkurang akan membuat AC tidak dingin. Segera hubungi teknisi jika AC mulai terasa kurang dingin.\n\n## 3. Servis Berkala\nLakukan servis besar setiap 3-6 bulan sekali oleh teknisi profesional. Ini termasuk pembersihan evaporator, kondensor, dan pengecekan komponen lainnya.\n\n## 4. Atur Suhu Ideal\nSuhu AC yang ideal adalah 24-26°C. Setiap derajat lebih rendah meningkatkan konsumsi listrik hingga 6%.',
      authorName: 'Tim Spesialis',
      status: 'Published',
      isFeatured: true,
      publishedAt: new Date(),
    },
    {
      id: crypto.randomUUID(),
      categoryId: catPlumbingId,
      title: 'Mengatasi Saluran Air Mampet Tanpa Bantuan Tukang',
      slug: 'mengatasi-saluran-air-mampet',
      summary:
        'Saluran air mampet? Coba 5 cara mudah ini sebelum memanggil teknisi plumbing profesional.',
      content:
        'Saluran air mampet adalah masalah rumah tangga yang paling umum. Sebelum panik, coba langkah-langkah berikut:\n\n## 1. Gunakan Air Panas\nTuangkan air panas secara perlahan ke saluran yang tersumbat. Air panas dapat melarutkan lemak dan sabun yang menumpuk.\n\n## 2. Baking Soda dan Cuka\nCampurkan 1/2 cangkir baking soda dengan 1/2 cangkir cuka. Tuang ke saluran dan tunggu 15 menit, lalu siram dengan air panas.\n\n## 3. Gunakan Plunger\nAlat sederhana ini sangat efektif untuk mengatasi sumbatan ringan di wastafel atau kloset.\n\nJika semua cara di atas tidak berhasil, segera hubungi teknisi plumbing profesional Spesialis.',
      authorName: 'Tim Spesialis',
      status: 'Published',
      isFeatured: true,
      publishedAt: new Date(),
    },
    {
      id: crypto.randomUUID(),
      categoryId: catCleaningId,
      title: 'Tips Membersihkan Rumah Setelah Renovasi',
      slug: 'tips-membersihkan-rumah-setelah-renovasi',
      summary:
        'Renovasi selesai? Berikut panduan lengkap membersihkan debu dan kotoran pasca renovasi.',
      content:
        '<p>Setelah renovasi, rumah biasanya dipenuhi debu halus dan sisa material. Berikut cara membersihkannya secara efektif:</p>\n\n<h2>1. Bersihkan dari Atas ke Bawah</h2>\n<p>Mulai dari langit-langit, dinding, lalu lantai. Cara ini mencegah debu jatuh ke area yang sudah dibersihkan.</p>\n\n<h2>2. Gunakan Vacuum Cleaner HEPA</h2>\n<p>Debu konstruksi sangat halus dan sulit dibersihkan dengan sapu biasa. Vacuum dengan filter <strong>HEPA</strong> mampu menangkap partikel mikroskopis hingga 0.3 mikron.</p>\n\n<h2>3. Lap Semua Permukaan</h2>\n<p>Gunakan kain microfiber basah untuk mengelap semua permukaan — dinding, jendela, furnitur, dan lantai. Ganti air lap secara rutin agar tidak menyebarkan debu kembali.</p>\n\n<h2>4. Cuci Semua Tekstil</h2>\n<p>Cuci gorden, karpet, dan sarung bantal yang mungkin terpapar debu renovasi. Gunakan air hangat untuk hasil maksimal.</p>\n\n<p>Butuh bantuan? Pesan layanan <a href="/services/cleaning" target="_blank" rel="noopener noreferrer">cleaning profesional</a> dari Spesialis!</p>',
      authorName: 'Tim Spesialis',
      status: 'Published',
      isFeatured: false,
      publishedAt: new Date(),
    },
    {
      id: crypto.randomUUID(),
      categoryId: catElektronikId,
      title: 'Panduan Instalasi Listrik Rumah yang Aman',
      slug: 'panduan-instalasi-listrik-rumah-aman',
      summary:
        'Instalasi listrik yang salah bisa berbahaya. Simak panduan keamanan instalasi listrik rumah tinggal.',
      content:
        '<p>Instalasi listrik yang baik adalah investasi keamanan jangka panjang untuk rumah Anda. Berikut hal-hal penting yang perlu diperhatikan:</p>\n\n<h2>1. Gunakan Kabel Berkualitas SNI</h2>\n<p>Jangan tergiur kabel murah. Kabel berkualitas <strong>SNI</strong> menjamin keamanan dan ketahanan terhadap panas berlebih. Kabel bermutu rendah bisa menjadi penyebab <em>korsleting</em> dan kebakaran.</p>\n\n<h2>2. Pasang MCB yang Sesuai</h2>\n<p>MCB (<em>Miniature Circuit Breaker</em>) harus disesuaikan dengan total daya yang terpakai. Jangan menggunakan MCB dengan kapasitas terlalu besar karena risiko korsleting tidak terdeteksi.</p>\n\n<ul>\n  <li><p>MCB 6A untuk daya 1.300 VA</p></li>\n  <li><p>MCB 10A untuk daya 2.200 VA</p></li>\n  <li><p>MCB 16A untuk daya 3.500 VA</p></li>\n</ul>\n\n<h2>3. Pastikan Grounding yang Baik</h2>\n<p>Instalasi <em>grounding</em> harus terpasang dengan benar untuk mengalirkan kebocoran arus ke tanah. Tanpa grounding, risiko tersengat listrik sangat tinggi.</p>\n\n<h2>4. Hindari Sambungan Tersembunyi</h2>\n<p>Sambungan kabel sebaiknya berada di dalam <strong>kotak sambungan</strong> yang mudah diakses. Jangan menanam sambungan di dalam dinding tanpa pengaman.</p>\n\n<blockquote>\n  <p>⚠️ Selalu gunakan jasa teknisi listrik bersertifikat untuk instalasi listrik rumah Anda. Hubungi Spesialis untuk layanan perbaikan listrik profesional.</p>\n</blockquote>',
      authorName: 'Tim Spesialis',
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
        'Anda dapat melakukan booking langsung melalui website tanpa perlu login. Pilih layanan yang diinginkan, isi form data diri dan alamat, lalu submit. Tim kami akan menghubungi Anda melalui WhatsApp untuk konfirmasi.',
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
        'Harga akhir ditentukan setelah admin melakukan pengecekan melalui komunikasi WhatsApp. Harga dapat berbeda dari base price tergantung lokasi, tingkat kesulitan, material, dan kondisi lapangan.',
      category: 'Pembayaran',
      displayOrder: 1,
    },
    {
      question: 'Metode pembayaran apa saja yang tersedia?',
      answer:
        'Saat ini pembayaran dilakukan secara manual melalui transfer bank. Admin akan memberikan informasi rekening setelah pekerjaan selesai. Bukti transfer dapat diupload melalui dashboard.',
      category: 'Pembayaran',
      displayOrder: 2,
    },
    {
      question: 'Bagaimana cara menjadi mitra?',
      answer:
        'Kunjungi halaman Daftar Mitra, isi data diri lengkap dengan KTP dan foto profil. Tim kami akan melakukan verifikasi, dan setelah disetujui Anda dapat mulai menerima pekerjaan.',
      category: 'Mitra',
      displayOrder: 1,
    },
    {
      question: 'Apa saja area layanan Spesialis?',
      answer:
        'Saat ini kami melayani area Jabodetabek dan Bandung. Kami terus memperluas jangkauan ke kota-kota lainnya.',
      category: 'Layanan',
      displayOrder: 1,
    },
    {
      question: 'Berapa lama proses booking hingga pekerjaan selesai?',
      answer:
        'Proses tergantung pada jenis layanan dan ketersediaan mitra. Umumnya, booking dikonfirmasi dalam 1-2 jam, dan pekerjaan dapat dijadwalkan di hari yang sama atau sesuai kesepakatan.',
      category: 'Layanan',
      displayOrder: 2,
    },
  ]);
  console.log('  ✓ 7 FAQ entries created');

  // ─── System Settings ─────────────────────────────────────────────
  await db.insert(systemSettings).values([
    { category: 'general', key: 'site_name', value: 'Spesialis', description: 'Nama platform' },
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
  ]);
  await db.insert(systemSettings).values([
    {
      category: 'whatsapp',
      key: 'whatsapp_phone_number',
      value: '6281234567890',
      description: 'Nomor WhatsApp untuk tombol WA di halaman publik',
    },
  ]);

  // ─── Sitemap Settings ────────────────────────────────────────────
  await db.insert(systemSettings).values([
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
      description: 'Prioritas halaman layanan di sitemap',
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
      description: 'Prioritas halaman artikel di sitemap',
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
      description: 'Prioritas halaman blog listing di sitemap',
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
      description: 'Prioritas halaman CMS di sitemap',
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
  ]);

  // ─── SEO Permissions ─────────────────────────────────────────────
  await db.insert(systemSettings).values([
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
  console.log(
    '  ✓ 33 system settings created (12 existing + 12 sitemap + 8 seo_permissions + 1 whatsapp)',
  );

  console.log('\n═══════════════════════════════════════════');
  console.log('  ✅ Seed complete!');
  console.log('═══════════════════════════════════════════');
  console.log('\n  Accounts:');
  console.log('    admin@spesialis.id       / password123 (super_admin)');
  console.log('    admin2@spesialis.id      / password123 (admin)');
  console.log('    dispatcher@spesialis.id  / password123 (dispatcher)');
  console.log('    finance@spesialis.id     / password123 (finance)');
  console.log('    content@spesialis.id     / password123 (content_manager)');
  console.log('    partner@spesialis.id     / password123 (partner - AC & Listrik)');
  console.log('    partner2@spesialis.id    / password123 (partner - Plumbing & Cleaning)');
  console.log('    customer@spesialis.id    / password123 (customer)');
  console.log('    customer2@spesialis.id   / password123 (customer)');
  console.log('    corporate@spesialis.id   / password123 (corporate)');
  console.log('\n  Data:');
  console.log('    5 categories, 14 services');
  console.log('    10 orders across all lifecycle stages');
  console.log('    2 reviews, 2 complaints, 4 notifications');
  console.log('    4 categories, 4 articles, 7 FAQ entries');
  console.log('    3 SEO entries, 33 system settings');
}

seed()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  });

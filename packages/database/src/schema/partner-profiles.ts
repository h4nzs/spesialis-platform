import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
  integer,
  numeric,
  index,
} from 'drizzle-orm/pg-core';
import { users } from './users.ts';
import { type PartnerAvailability, type PartnerVerificationStatus } from '@ahlipanggilan/types';

export const partnerProfiles = pgTable(
  'partner_profiles',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .references(() => users.id)
      .notNull(),
    fullName: varchar('full_name', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 30 }).notNull(),
    avatar: text('avatar'),
    ktpNumber: varchar('ktp_number', { length: 30 }).notNull(),
    domicile: varchar('domicile', { length: 255 }),
    ktpMediaId: uuid('ktp_media_id'),
    profilePhotoId: uuid('profile_photo_id'),
    experienceYear: integer('experience_year'),
    bio: text('bio'),
    ratingAverage: numeric('rating_average', { precision: 2, scale: 1 }).notNull().default('0.0'),
    completedJobs: integer('completed_jobs').notNull().default(0),
    availability: varchar('availability', { length: 30 })
      .notNull()
      .$type<PartnerAvailability>()
      .default('Available'),
    verificationStatus: varchar('verification_status', { length: 30 })
      .notNull()
      .$type<PartnerVerificationStatus>()
      .default('Pending'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => ({
    userIdIdx: index('idx_partner_profiles_user_id').on(table.userId),
  }),
);

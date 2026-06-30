import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { partnerProfiles } from './partner-profiles.ts';
import { serviceCategories } from './service-categories.ts';

export const partnerSkills = pgTable('partner_skills', {
  id: uuid('id').defaultRandom().primaryKey(),
  partnerId: uuid('partner_id')
    .references(() => partnerProfiles.id)
    .notNull(),
  categoryId: uuid('category_id')
    .references(() => serviceCategories.id)
    .notNull(),
  proficiency: varchar('proficiency', { length: 30 }).notNull().default('Intermediate'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

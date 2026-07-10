import { relations } from 'drizzle-orm';
import { users } from './users.ts';
import { customerProfiles } from './customer-profiles.ts';
import { partnerProfiles } from './partner-profiles.ts';
import { companyUsers } from './company-users.ts';
import { auditLogs } from './audit-logs.ts';
import { addresses } from './addresses.ts';
import { orders } from './orders.ts';
import { reviews } from './reviews.ts';
import { complaints } from './complaints.ts';
import { assignments } from './assignments.ts';
import { notifications } from './notifications.ts';
import { services } from './services.ts';
import { serviceCategories } from './service-categories.ts';
import { orderItems } from './order-items.ts';
import { payments } from './payments.ts';
import { orderStatusHistory } from './order-status-history.ts';
import { companies } from './companies.ts';
import { branches } from './branches.ts';
import { refreshTokens } from './refresh-tokens.ts';
import { passwordResets } from './password-resets.ts';
import { partnerSkills } from './partner-skills.ts';
import { partnerDocuments } from './partner-documents.ts';
import { orderMedia } from './order-media.ts';
import { media } from './media.ts';
import { articleCategories } from './article-categories.ts';
import { articles } from './articles.ts';
import { contracts } from './contracts.ts';
import { invoices } from './invoices.ts';
import { partnerPenalties } from './partner-penalties.ts';
import { cmsPages } from './cms-pages.ts';
import { homepageSections } from './homepage-sections.ts';

export const usersRelations = relations(users, ({ one, many }) => ({
  customerProfile: one(customerProfiles),
  partnerProfile: one(partnerProfiles),
  companyUsers: many(companyUsers),
  auditLogs: many(auditLogs),
  notifications: many(notifications),
  refreshTokens: many(refreshTokens),
  passwordResets: many(passwordResets),
}));

export const customerProfilesRelations = relations(customerProfiles, ({ one, many }) => ({
  user: one(users, { fields: [customerProfiles.userId], references: [users.id] }),
  addresses: many(addresses),
  orders: many(orders),
  reviews: many(reviews),
  complaints: many(complaints),
}));

export const partnerProfilesRelations = relations(partnerProfiles, ({ one, many }) => ({
  user: one(users, { fields: [partnerProfiles.userId], references: [users.id] }),
  assignments: many(assignments),
  reviews: many(reviews),
  skills: many(partnerSkills),
  documents: many(partnerDocuments),
}));

export const partnerSkillsRelations = relations(partnerSkills, ({ one }) => ({
  partner: one(partnerProfiles, {
    fields: [partnerSkills.partnerId],
    references: [partnerProfiles.id],
  }),
  category: one(serviceCategories, {
    fields: [partnerSkills.categoryId],
    references: [serviceCategories.id],
  }),
}));

export const partnerDocumentsRelations = relations(partnerDocuments, ({ one }) => ({
  partner: one(partnerProfiles, {
    fields: [partnerDocuments.partnerId],
    references: [partnerProfiles.id],
  }),
}));

export const serviceCategoriesRelations = relations(serviceCategories, ({ many }) => ({
  services: many(services),
  partnerSkills: many(partnerSkills),
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
  category: one(serviceCategories, {
    fields: [services.categoryId],
    references: [serviceCategories.id],
  }),
  orderItems: many(orderItems),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(customerProfiles, {
    fields: [orders.customerId],
    references: [customerProfiles.id],
  }),
  company: one(companies, { fields: [orders.companyId], references: [companies.id] }),
  partner: one(partnerProfiles, { fields: [orders.partnerId], references: [partnerProfiles.id] }),
  address: one(addresses, { fields: [orders.addressId], references: [addresses.id] }),
  orderItems: many(orderItems),
  media: many(orderMedia),
  assignments: many(assignments),
  payments: many(payments),
  review: one(reviews),
  complaints: many(complaints),
  statusHistory: many(orderStatusHistory),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  service: one(services, { fields: [orderItems.serviceId], references: [services.id] }),
}));

export const assignmentsRelations = relations(assignments, ({ one }) => ({
  order: one(orders, { fields: [assignments.orderId], references: [orders.id] }),
  partner: one(partnerProfiles, {
    fields: [assignments.partnerId],
    references: [partnerProfiles.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, { fields: [payments.orderId], references: [orders.id] }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  order: one(orders, { fields: [reviews.orderId], references: [orders.id] }),
  customer: one(customerProfiles, {
    fields: [reviews.customerId],
    references: [customerProfiles.id],
  }),
  partner: one(partnerProfiles, { fields: [reviews.partnerId], references: [partnerProfiles.id] }),
}));

export const complaintsRelations = relations(complaints, ({ one }) => ({
  order: one(orders, { fields: [complaints.orderId], references: [orders.id] }),
  customer: one(customerProfiles, {
    fields: [complaints.customerId],
    references: [customerProfiles.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, { fields: [auditLogs.userId], references: [users.id] }),
}));

export const companiesRelations = relations(companies, ({ many }) => ({
  companyUsers: many(companyUsers),
  branches: many(branches),
  orders: many(orders),
}));

export const companyUsersRelations = relations(companyUsers, ({ one }) => ({
  company: one(companies, { fields: [companyUsers.companyId], references: [companies.id] }),
  user: one(users, { fields: [companyUsers.userId], references: [users.id] }),
}));

export const branchesRelations = relations(branches, ({ one }) => ({
  company: one(companies, { fields: [branches.companyId], references: [companies.id] }),
}));

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, { fields: [refreshTokens.userId], references: [users.id] }),
}));

export const passwordResetsRelations = relations(passwordResets, ({ one }) => ({
  user: one(users, { fields: [passwordResets.userId], references: [users.id] }),
}));

export const mediaRelations = relations(media, ({ one }) => ({
  uploader: one(users, { fields: [media.uploadedBy], references: [users.id] }),
}));

export const orderMediaRelations = relations(orderMedia, ({ one }) => ({
  order: one(orders, { fields: [orderMedia.orderId], references: [orders.id] }),
  media: one(media, { fields: [orderMedia.mediaId], references: [media.id] }),
}));

export const articleCategoriesRelations = relations(articleCategories, ({ many }) => ({
  articles: many(articles),
}));

export const articlesRelations = relations(articles, ({ one }) => ({
  category: one(articleCategories, {
    fields: [articles.categoryId],
    references: [articleCategories.id],
  }),
}));

export const contractsRelations = relations(contracts, ({ one }) => ({
  company: one(companies, { fields: [contracts.companyId], references: [companies.id] }),
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  company: one(companies, { fields: [invoices.companyId], references: [companies.id] }),
  order: one(orders, { fields: [invoices.orderId], references: [orders.id] }),
}));

export const partnerPenaltiesRelations = relations(partnerPenalties, ({ one }) => ({
  partner: one(partnerProfiles, {
    fields: [partnerPenalties.partnerId],
    references: [partnerProfiles.id],
  }),
  order: one(orders, { fields: [partnerPenalties.orderId], references: [orders.id] }),
  imposedByUser: one(users, {
    fields: [partnerPenalties.imposedBy],
    references: [users.id],
  }),
}));

export const cmsPagesRelations = relations(cmsPages, () => ({}));

export const homepageSectionsRelations = relations(homepageSections, () => ({}));

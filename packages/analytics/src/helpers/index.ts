// =============================================================================
// Analytics Platform — Domain-Specific Track Helpers
// =============================================================================
// Developer-friendly functions for tracking common domain events.
// These wrap track() with domain-specific parameter types.
// Components call these instead of track() directly for domain events.
// =============================================================================

import { track } from '../core/tracker.ts';

// ── Navigation ────────────────────────────────────────────────
export function trackNavigation(destination: string, label: string, section?: string): void {
  track('navigation_click', { destination, label, section });
}

export function trackCTA(section: string, cta: string, position: number, page: string): void {
  track('cta_click', { section, cta, position, page });
}

// ── Homepage ─────────────────────────────────────────────────
export function trackWhatsappClick(source: string, page: string): void {
  track('whatsapp_click', { source, page });
}

export function trackServiceView(serviceId: string, category: string, slug: string): void {
  track('service_view', { service_id: serviceId, category, slug });
}

// ── Search ───────────────────────────────────────────────────
export function trackSearch(query: string, resultCount: number): void {
  track('search_result', { query, result_count: resultCount, has_results: resultCount > 0 });
}

// ── Booking ──────────────────────────────────────────────────
export function trackBookingStart(serviceId: string, customerType: 'guest' | 'registered'): void {
  track('booking_start', { service_id: serviceId, customer_type: customerType });
}

export function trackBookingSubmit(
  serviceId: string,
  bookingId: string,
  customerType: 'guest' | 'registered',
): void {
  track('booking_submit', {
    service_id: serviceId,
    booking_id: bookingId,
    customer_type: customerType,
  });
}

export function trackBookingCancel(bookingId: string, reason?: string): void {
  track('booking_cancel', { booking_id: bookingId, reason });
}

// ── Payment ──────────────────────────────────────────────────
export function trackPaymentSuccess(
  bookingId: string,
  amount: number,
  method: string,
  paymentId: string,
): void {
  track('payment_success', { booking_id: bookingId, amount, method, payment_id: paymentId });
}

export function trackPaymentFailed(
  bookingId: string,
  amount: number,
  method: string,
  error?: string,
): void {
  track('payment_failed', { booking_id: bookingId, amount, method, error });
}

// ── Authentication ───────────────────────────────────────────
export function trackRegisterComplete(userId: string, role: string): void {
  track('register_complete', { user_id: userId, role });
}

export function trackLoginSuccess(userId: string, role: string): void {
  track('login_success', { user_id: userId, role });
}

// ── Partner ──────────────────────────────────────────────────
export function trackPartnerRegister(): void {
  track('partner_register_start', {});
}

export function trackPartnerRegisterComplete(partnerId: string): void {
  track('partner_register_complete', { partner_id: partnerId });
}

export function trackPartnerJobAccept(assignmentId: string, bookingId: string): void {
  track('partner_job_accept', { assignment_id: assignmentId, booking_id: bookingId });
}

export function trackPartnerJobReject(
  assignmentId: string,
  bookingId: string,
  reason: string,
): void {
  track('partner_job_reject', { assignment_id: assignmentId, booking_id: bookingId, reason });
}

// ── Corporate ────────────────────────────────────────────────
export function trackInquirySubmit(
  companyName: string,
  serviceInterest: string,
  opts?: { industry?: string; employees?: number },
): void {
  track('inquiry_submit', {
    company_name: companyName,
    service_interest: serviceInterest,
    industry: opts?.industry,
    employees: opts?.employees,
  });
}

// ── CMS ──────────────────────────────────────────────────────
export function trackArticleView(articleId: string, category: string, slug: string): void {
  track('article_view', { article_id: articleId, category, slug });
}

export function trackFAQOpen(faqId: string, question: string, category: string): void {
  track('faq_open', { faq_id: faqId, question, category });
}

// ── Dashboard ────────────────────────────────────────────────
export function trackDashboardView(role: string, section: string): void {
  track('dashboard_view', { role, section });
}

// ── Error ────────────────────────────────────────────────────
export function track404(path: string, referrer?: string): void {
  track('page_404', { path, referrer });
}

export function trackAPIError(endpoint: string, status: number, method: string): void {
  // TODO(spesialis-997): Use distinct keys (http_status vs booking_status)
  // instead of shared "status" key with conflicting types (number vs string)
  track('api_error', { endpoint, status: status as unknown as string, method });
}

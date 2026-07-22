// =============================================================================
// Analytics — Astro Component Helpers
// =============================================================================
// Thin re-exports so Astro <script> tags can use domain helpers via:
//
//   <script>
//     import { trackCTA, trackWhatsappClick } from '../analytics/astro-track.ts'
//     trackCTA('hero', 'click', 1, '/')
//   </script>
//
// Only helpers suitable for Astro inline scripts are re-exported here.
// React components should import from '@spesialis/analytics' directly.
// =============================================================================

import {
  trackCTA,
  trackWhatsappClick,
  trackNavigation,
  trackFAQOpen,
  trackServiceView,
  trackPartnerRegister,
  trackInquirySubmit,
  trackArticleView,
  trackBookingStart,
  trackBookingSubmit,
} from '@spesialis/analytics';

export {
  trackCTA,
  trackWhatsappClick,
  trackNavigation,
  trackFAQOpen,
  trackServiceView,
  trackPartnerRegister,
  trackInquirySubmit,
  trackArticleView,
  trackBookingStart,
  trackBookingSubmit,
};

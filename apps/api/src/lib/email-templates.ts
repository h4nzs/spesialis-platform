const APP_URL = process.env.APP_URL ?? 'http://localhost:4321';

function baseHtml(content: string): string {
  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Ahli Panggilan</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6">
    <tr>
      <td align="center" style="padding:32px 16px">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
          <tr>
            <td style="padding:0 0 24px;text-align:center">
              <a href="${APP_URL}" style="text-decoration:none">
                <span style="font-size:24px;font-weight:700;color:#2563eb;letter-spacing:-0.5px">Ahli Panggilan</span>
              </a>
            </td>
          </tr>
          <tr>
            <td style="background-color:#ffffff;border-radius:12px;padding:40px 32px;text-align:left">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding:24px 16px 0;text-align:center;font-size:12px;color:#9ca3af;line-height:1.6">
              <p style="margin:0 0 4px">Ahli Panggilan — Perusahaan Layanan Jasa Profesional</p>
              <p style="margin:0 0 4px">Email ini dikirim secara otomatis, harap tidak membalas langsung.</p>
              <p style="margin:0">${APP_URL}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buttonHtml(url: string, label: string): string {
  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0">
  <tr>
    <td align="center">
      <a href="${url}" style="display:inline-block;padding:14px 32px;background-color:#2563eb;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:8px;line-height:1">
        ${label}
      </a>
    </td>
  </tr>
</table>`;
}

export function passwordResetHtml(fullName: string, resetUrl: string): string {
  return baseHtml(`
<h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827">Reset Password</h1>
<p style="margin:0 0 16px;font-size:15px;color:#6b7280;line-height:1.6">Halo ${fullName},</p>
<p style="margin:0 0 16px;font-size:15px;color:#6b7280;line-height:1.6">
  Kami menerima permintaan reset password untuk akun Ahli Panggilan Anda.
  Klik tombol di bawah untuk mereset password Anda.
</p>
${buttonHtml(resetUrl, 'Reset Password')}
<p style="margin:0 0 0;font-size:13px;color:#9ca3af;line-height:1.5">
  Link ini berlaku selama 7 hari. Jika Anda tidak meminta reset password, abaikan email ini.
</p>
`);
}

export function bookingConfirmationHtml(
  fullName: string,
  bookingNumber: string,
  trackingUrl: string,
): string {
  return baseHtml(`
<h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827">Booking Dikonfirmasi</h1>
<p style="margin:0 0 16px;font-size:15px;color:#6b7280;line-height:1.6">Halo ${fullName},</p>
<p style="margin:0 0 8px;font-size:15px;color:#6b7280;line-height:1.6">
  Booking Anda dengan nomor <strong style="color:#111827">#${bookingNumber}</strong> telah dikonfirmasi.
</p>
<p style="margin:0 0 16px;font-size:15px;color:#6b7280;line-height:1.6">
  Tim kami akan segera menugaskan teknisi terbaik untuk membantu Anda.
</p>
${buttonHtml(trackingUrl, 'Lacak Status Booking')}
`);
}

export function partnerAssignedHtml(
  fullName: string,
  bookingNumber: string,
  dashboardUrl: string,
): string {
  return baseHtml(`
<h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827">Pekerjaan Baru</h1>
<p style="margin:0 0 16px;font-size:15px;color:#6b7280;line-height:1.6">Halo ${fullName},</p>
<p style="margin:0 0 8px;font-size:15px;color:#6b7280;line-height:1.6">
  Anda ditugaskan untuk pekerjaan baru dengan nomor booking <strong style="color:#111827">#${bookingNumber}</strong>.
</p>
<p style="margin:0 0 16px;font-size:15px;color:#6b7280;line-height:1.6">
  Silakan login ke dashboard untuk melihat detail dan mengonfirmasi.
</p>
${buttonHtml(dashboardUrl, 'Lihat Pekerjaan')}
`);
}

export function partnerVerifiedHtml(
  fullName: string,
  status: 'Approved' | 'Rejected',
  note: string | null,
): string {
  const isApproved = status === 'Approved';
  const heading = isApproved ? 'Verifikasi Disetujui' : 'Verifikasi Ditolak';
  const body = isApproved
    ? 'Selamat! Akun mitra Anda telah diverifikasi dan disetujui. Anda sekarang dapat mulai menerima pekerjaan.'
    : 'Mohon maaf, verifikasi akun mitra Anda ditolak.';

  return baseHtml(`
<h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827">${heading}</h1>
<p style="margin:0 0 16px;font-size:15px;color:#6b7280;line-height:1.6">Halo ${fullName},</p>
<p style="margin:0 0 16px;font-size:15px;color:#6b7280;line-height:1.6">${body}</p>
${note ? `<p style="margin:0 0 16px;font-size:14px;color:#6b7280;font-style:italic;line-height:1.5">Catatan: ${note}</p>` : ''}
${isApproved ? buttonHtml(`${APP_URL}/login`, 'Mulai Bekerja') : ''}
`);
}

export function verificationHtml(fullName: string, verifyUrl: string): string {
  return baseHtml(`
<h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827">Verifikasi Email</h1>
<p style="margin:0 0 16px;font-size:15px;color:#6b7280;line-height:1.6">Halo ${fullName},</p>
<p style="margin:0 0 16px;font-size:15px;color:#6b7280;line-height:1.6">
  Terima kasih telah mendaftar di Ahli Panggilan. Silakan verifikasi alamat email Anda dengan mengklik tombol di bawah.
</p>
${buttonHtml(verifyUrl, 'Verifikasi Email')}
<p style="margin:0 0 0;font-size:13px;color:#9ca3af;line-height:1.5">
  Link ini berlaku selama 7 hari.
</p>
`);
}

export function newBookingAdminHtml(
  bookingNumber: string,
  customerName: string,
  customerPhone: string,
  address: string,
  bookingDate: string,
  bookingTime: string,
  notes: string | null,
  items: { name: string; qty: number }[],
  adminUrl: string,
): string {
  const itemsRows = items
    .map(
      (i) =>
        `<tr><td style="padding:4px 0;font-size:14px;color:#6b7280">${i.name}</td><td style="padding:4px 0;font-size:14px;color:#111827;text-align:right">${i.qty}x</td></tr>`,
    )
    .join('');

  return baseHtml(`
<h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827">Booking Baru</h1>
<p style="margin:0 0 16px;font-size:15px;color:#6b7280;line-height:1.6">
  Booking baru telah dibuat dan menunggu konfirmasi.
</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;background-color:#f9fafb;border-radius:8px;padding:16px">
  <tr><td style="padding:4px 0;font-size:14px;color:#6b7280">Nomor Booking</td><td style="padding:4px 0;font-size:14px;color:#111827;font-weight:600;text-align:right">#${bookingNumber}</td></tr>
  <tr><td style="padding:4px 0;font-size:14px;color:#6b7280">Pelanggan</td><td style="padding:4px 0;font-size:14px;color:#111827;font-weight:600;text-align:right">${customerName}</td></tr>
  <tr><td style="padding:4px 0;font-size:14px;color:#6b7280">No. Telepon</td><td style="padding:4px 0;font-size:14px;color:#111827;font-weight:600;text-align:right">${customerPhone}</td></tr>
  <tr><td style="padding:4px 0;font-size:14px;color:#6b7280">Tanggal</td><td style="padding:4px 0;font-size:14px;color:#111827;font-weight:600;text-align:right">${bookingDate}</td></tr>
  <tr><td style="padding:4px 0;font-size:14px;color:#6b7280">Waktu</td><td style="padding:4px 0;font-size:14px;color:#111827;font-weight:600;text-align:right">${bookingTime}</td></tr>
  <tr><td style="padding:4px 0;font-size:14px;color:#6b7280">Alamat</td><td style="padding:4px 0;font-size:14px;color:#111827;font-weight:600;text-align:right">${address}</td></tr>
</table>
${
  items.length
    ? `
<p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#111827">Layanan:</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;background-color:#f9fafb;border-radius:8px;padding:16px">
  ${itemsRows}
</table>`
    : ''
}
${notes ? `<p style="margin:0 0 16px;font-size:14px;color:#6b7280;font-style:italic;line-height:1.5">Catatan: ${notes}</p>` : ''}
${buttonHtml(adminUrl, 'Lihat & Konfirmasi Booking')}
<p style="margin:0 0 0;font-size:13px;color:#9ca3af;line-height:1.5">Segera konfirmasi booking ini agar dapat diproses lebih lanjut.</p>
`);
}

export function notificationEmailHtml(fullName: string, title: string, message: string): string {
  return baseHtml(`
<h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827">${title}</h1>
<p style="margin:0 0 16px;font-size:15px;color:#6b7280;line-height:1.6">Halo ${fullName},</p>
<p style="margin:0 0 0;font-size:15px;color:#6b7280;line-height:1.6;white-space:pre-wrap">${message}</p>
`);
}

export function paymentVerifiedHtml(
  fullName: string,
  bookingNumber: string,
  amount: string,
  paymentMethod: string,
  status: 'Paid' | 'Failed',
  note: string | null,
): string {
  const isPaid = status === 'Paid';
  const heading = isPaid ? 'Pembayaran Dikonfirmasi' : 'Pembayaran Ditolak';

  return baseHtml(`
<h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827">${heading}</h1>
<p style="margin:0 0 16px;font-size:15px;color:#6b7280;line-height:1.6">Halo ${fullName},</p>
<p style="margin:0 0 16px;font-size:15px;color:#6b7280;line-height:1.6">
  ${isPaid ? 'Pembayaran Anda telah dikonfirmasi.' : 'Mohon maaf, pembayaran Anda tidak dapat diverifikasi.'}
</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;background-color:#f9fafb;border-radius:8px;padding:16px">
  <tr><td style="padding:4px 0;font-size:14px;color:#6b7280">Booking</td><td style="padding:4px 0;font-size:14px;color:#111827;font-weight:600;text-align:right">#${bookingNumber}</td></tr>
  <tr><td style="padding:4px 0;font-size:14px;color:#6b7280">Jumlah</td><td style="padding:4px 0;font-size:14px;color:#111827;font-weight:600;text-align:right">${amount}</td></tr>
  <tr><td style="padding:4px 0;font-size:14px;color:#6b7280">Metode</td><td style="padding:4px 0;font-size:14px;color:#111827;font-weight:600;text-align:right">${paymentMethod}</td></tr>
  <tr><td style="padding:4px 0;font-size:14px;color:#6b7280">Status</td><td style="padding:4px 0;font-size:14px;color:#111827;font-weight:600;text-align:right">${status === 'Paid' ? 'Lunas' : 'Gagal'}</td></tr>
</table>
${note ? `<p style="margin:0 0 16px;font-size:14px;color:#6b7280;font-style:italic;line-height:1.5">Catatan: ${note}</p>` : ''}
<p style="margin:0 0 0;font-size:14px;color:#6b7280;line-height:1.5">
  ${isPaid ? 'Terima kasih telah menggunakan layanan Ahli Panggilan.' : 'Silakan hubungi admin untuk informasi lebih lanjut.'}
</p>
`);
}

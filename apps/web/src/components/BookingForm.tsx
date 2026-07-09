import { useState, useEffect, useMemo } from 'react';
import { Button } from '@specialist/ui';
import { createBrowserClient, formatCurrency } from '@specialist/shared';
import { createGuestBookingSchema, createCustomerBookingSchema } from '@specialist/validation';

function getEl(id: string): HTMLElement | null {
  if (typeof document === 'undefined') return null;
  return document.getElementById(id);
}

interface ServiceInfo {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  shortDescription: string | null;
}

interface AddressItem {
  id: string;
  label: string | null;
  address: string;
  city: string;
  province: string;
  receiverName: string;
  receiverPhone: string;
}

interface InitialAuth {
  userId: string;
  userEmail: string;
  userRole: string;
}

interface FieldError {
  field: string;
  message: string;
}

interface BookingFormProps {
  serviceId: string | null;
  initialAuth?: InitialAuth | null;
}

function getFieldError(errors: FieldError[], field: string): string | undefined {
  return errors.find((e) => e.field === field)?.message;
}

function todayStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function BookingForm({ serviceId, initialAuth }: BookingFormProps) {
  const api = useMemo(() => createBrowserClient(), []);
  const isCustomer = initialAuth?.userRole === 'customer';

  const [service, setService] = useState<ServiceInfo | null>(null);
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [loadingService, setLoadingService] = useState(true);
  const [whatsappPhone, setWhatsappPhone] = useState('');

  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [addrLine, setAddrLine] = useState('');
  const [bookingDate, setBookingDate] = useState(todayStr());
  const [bookingTime, setBookingTime] = useState('09:00');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<FieldError[]>([]);
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [bookingResult, setBookingResult] = useState<{
    bookingNumber: string;
    id: string;
    trackingUrl: string;
  } | null>(null);

  useEffect(() => {
    if (!serviceId) {
      setLoadingService(false);
      return;
    }

    api
      .get<ServiceInfo>(`/api/v1/services/${serviceId}`)
      .then((svc) => {
        setService(svc);
        setLoadingService(false);
      })
      .catch(() => {
        setLoadingService(false);
      });
  }, [serviceId, api]);

  useEffect(() => {
    if (isCustomer) {
      api
        .get<AddressItem[]>('/api/v1/addresses')
        .then((list) => {
          setAddresses(list);
          if (list.length > 0) setSelectedAddressId(list[0]!.id);
        })
        .catch(() => {});
    }
  }, [isCustomer, api]);

  useEffect(() => {
    fetch('/api/v1/public/settings')
      .then((r) => (r.ok ? r.json() : null))
      .then((body) => {
        if (!body) return;
        const data = body.data ?? body;
        if (data.whatsapp_phone_number) setWhatsappPhone(data.whatsapp_phone_number);
      })
      .catch(() => {});
  }, []);

  function handleAddressSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    setSelectedAddressId(e.target.value);
    const addr = addresses.find((a) => a.id === e.target.value);
    if (addr) {
      setReceiverName(addr.receiverName);
      setReceiverPhone(addr.receiverPhone);
    }
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors([]);
    setGeneralError('');

    if (!serviceId) {
      setGeneralError('Layanan belum dipilih');
      return;
    }

    const items = [{ serviceId, quantity: 1 }];

    if (isCustomer) {
      const parsed = createCustomerBookingSchema.safeParse({
        addressId: selectedAddressId,
        bookingDate,
        bookingTime,
        notes: notes || undefined,
        items,
      });

      if (!parsed.success) {
        setErrors(
          parsed.error.issues.map((i) => ({
            field: i.path.join('.'),
            message: i.message,
          })),
        );
        return;
      }

      setLoading(true);
      try {
        const result = await api.post<{ bookingNumber: string; id: string; trackingUrl: string }>(
          '/api/v1/bookings',
          { body: parsed.data },
        );
        setBookingResult(result);
        setSubmitted(true);
      } catch (err: unknown) {
        if (err instanceof Error) setGeneralError(err.message);
        else setGeneralError('Terjadi kesalahan. Silakan coba lagi.');
      } finally {
        setLoading(false);
      }
    } else {
      const parsed = createGuestBookingSchema.safeParse({
        fullName,
        phone,
        address: {
          receiverName,
          receiverPhone: receiverPhone || phone,
          province,
          city,
          district,
          postalCode,
          address: addrLine,
        },
        bookingDate,
        bookingTime,
        notes: notes || undefined,
        items,
      });

      if (!parsed.success) {
        setErrors(
          parsed.error.issues.map((i) => ({
            field: i.path.join('.'),
            message: i.message,
          })),
        );
        return;
      }

      setLoading(true);
      try {
        const result = await api.post<{ bookingNumber: string; id: string; trackingUrl: string }>(
          '/api/v1/bookings',
          { body: parsed.data },
        );
        setBookingResult(result);
        setSubmitted(true);
      } catch (err: unknown) {
        if (err instanceof Error) setGeneralError(err.message);
        else setGeneralError('Terjadi kesalahan. Silakan coba lagi.');
      } finally {
        setLoading(false);
      }
    }
  }

  if (submitted && bookingResult) {
    return (
      <div className="rounded-xl border border-success-500/30 bg-success-500/5 px-6 py-10 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-500/10">
          <span className="text-3xl text-success-500">&#10003;</span>
        </div>
        <h2 className="mt-4 text-xl font-bold text-text-primary">Booking Berhasil!</h2>
        <p className="mt-2 text-sm text-text-secondary">
          Booking Anda telah tercatat dengan nomor:
        </p>
        <p className="mt-3 text-2xl font-bold tracking-wider text-primary">
          {bookingResult.bookingNumber}
        </p>
        <p className="mt-2 text-xs text-text-secondary">
          Admin akan menghubungi Anda melalui WhatsApp untuk konfirmasi dan informasi harga final.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <a
            href={`/tracking`}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
          >
            Lacak Booking
          </a>
          <a
            href="/services"
            className="inline-flex items-center gap-2 rounded-md border border-border-default bg-bg-surface px-6 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-bg-page"
          >
            Pesan Lagi
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {generalError && (
        <div className="rounded-md border border-danger-500/30 bg-danger-500/5 px-4 py-3 text-sm text-danger-500">
          {generalError}
        </div>
      )}

      {/* Service Info */}
      <div className="rounded-lg border border-border-default bg-bg-surface p-4">
        <label className="text-xs font-medium uppercase tracking-wide text-text-secondary">
          Layanan
        </label>
        {loadingService ? (
          <div className="mt-2 h-5 w-48 rounded bg-neutral-200 animate-pulse" />
        ) : service ? (
          <div className="mt-1 flex items-center justify-between">
            <span className="font-medium text-text-primary">{service.name}</span>
            <span className="text-sm font-medium text-primary">
              {formatCurrency(service.basePrice)}
            </span>
          </div>
        ) : (
          <p className="mt-1 text-sm text-danger-500">
            {serviceId ? 'Layanan tidak ditemukan' : 'Pilih layanan terlebih dahulu'}
          </p>
        )}
      </div>

      {/* WhatsApp CTA */}
      {(whatsappPhone || getEl('app-settings')?.dataset.whatsappPhone) && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="text-sm text-green-800">
            Tidak ingin ribet mengisi form?{' '}
            <a
              href={`https://wa.me/${whatsappPhone || getEl('app-settings')?.dataset.whatsappPhone}?text=${encodeURIComponent(
                `Halo Spesialis, saya ingin bertanya tentang ${service?.name ?? 'layanan'}`,
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-green-700 underline hover:text-green-600 transition-colors"
            >
              Hubungi kami langsung via WhatsApp
            </a>
          </p>
        </div>
      )}

      {/* Customer Info — only for guest */}
      {!isCustomer && (
        <>
          <div className="rounded-lg border border-border-default bg-bg-surface p-4 space-y-4">
            <span className="block text-xs font-medium uppercase tracking-wide text-text-secondary">
              Data Diri
            </span>
            <div>
              <label
                htmlFor="fullName"
                className="mb-1.5 block text-sm font-medium text-text-primary"
              >
                Nama Lengkap
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-md border border-border-default bg-bg-surface px-4 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-text-secondary"
                placeholder="Nama lengkap"
              />
              {getFieldError(errors, 'fullName') && (
                <p className="mt-1 text-xs text-danger-500">{getFieldError(errors, 'fullName')}</p>
              )}
            </div>
            <div>
              <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-text-primary">
                Nomor HP
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-md border border-border-default bg-bg-surface px-4 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-text-secondary"
                placeholder="08123456789"
              />
              {getFieldError(errors, 'phone') && (
                <p className="mt-1 text-xs text-danger-500">{getFieldError(errors, 'phone')}</p>
              )}
            </div>
          </div>

          {/* Address for guest */}
          <div className="rounded-lg border border-border-default bg-bg-surface p-4 space-y-4">
            <span className="block text-xs font-medium uppercase tracking-wide text-text-secondary">
              Alamat
            </span>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="receiverName"
                  className="mb-1.5 block text-sm font-medium text-text-primary"
                >
                  Nama Penerima
                </label>
                <input
                  id="receiverName"
                  type="text"
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  className="w-full rounded-md border border-border-default bg-bg-surface px-4 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-text-secondary"
                  placeholder="Nama penerima"
                />
                {getFieldError(errors, 'address.receiverName') && (
                  <p className="mt-1 text-xs text-danger-500">
                    {getFieldError(errors, 'address.receiverName')}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="receiverPhone"
                  className="mb-1.5 block text-sm font-medium text-text-primary"
                >
                  HP Penerima
                </label>
                <input
                  id="receiverPhone"
                  type="tel"
                  value={receiverPhone}
                  onChange={(e) => setReceiverPhone(e.target.value)}
                  className="w-full rounded-md border border-border-default bg-bg-surface px-4 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-text-secondary"
                  placeholder="08xxxx"
                />
                {getFieldError(errors, 'address.receiverPhone') && (
                  <p className="mt-1 text-xs text-danger-500">
                    {getFieldError(errors, 'address.receiverPhone')}
                  </p>
                )}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="province"
                  className="mb-1.5 block text-sm font-medium text-text-primary"
                >
                  Provinsi
                </label>
                <input
                  id="province"
                  type="text"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full rounded-md border border-border-default bg-bg-surface px-4 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-text-secondary"
                  placeholder="Jawa Barat"
                />
                {getFieldError(errors, 'address.province') && (
                  <p className="mt-1 text-xs text-danger-500">
                    {getFieldError(errors, 'address.province')}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="city"
                  className="mb-1.5 block text-sm font-medium text-text-primary"
                >
                  Kota
                </label>
                <input
                  id="city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-md border border-border-default bg-bg-surface px-4 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-text-secondary"
                  placeholder="Bandung"
                />
                {getFieldError(errors, 'address.city') && (
                  <p className="mt-1 text-xs text-danger-500">
                    {getFieldError(errors, 'address.city')}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="district"
                  className="mb-1.5 block text-sm font-medium text-text-primary"
                >
                  Kecamatan
                </label>
                <input
                  id="district"
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full rounded-md border border-border-default bg-bg-surface px-4 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-text-secondary"
                  placeholder="Coblong"
                />
                {getFieldError(errors, 'address.district') && (
                  <p className="mt-1 text-xs text-danger-500">
                    {getFieldError(errors, 'address.district')}
                  </p>
                )}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="postalCode"
                  className="mb-1.5 block text-sm font-medium text-text-primary"
                >
                  Kode Pos
                </label>
                <input
                  id="postalCode"
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full rounded-md border border-border-default bg-bg-surface px-4 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-text-secondary"
                  placeholder="40131"
                />
                {getFieldError(errors, 'address.postalCode') && (
                  <p className="mt-1 text-xs text-danger-500">
                    {getFieldError(errors, 'address.postalCode')}
                  </p>
                )}
              </div>
            </div>
            <div>
              <label
                htmlFor="address"
                className="mb-1.5 block text-sm font-medium text-text-primary"
              >
                Alamat Lengkap
              </label>
              <textarea
                id="address"
                value={addrLine}
                onChange={(e) => setAddrLine(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-border-default bg-bg-surface px-4 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-text-secondary resize-none"
                placeholder="Jl. Contoh No. 123, RT/RW 001/002"
              />
              {getFieldError(errors, 'address.address') && (
                <p className="mt-1 text-xs text-danger-500">
                  {getFieldError(errors, 'address.address')}
                </p>
              )}
            </div>
          </div>
        </>
      )}

      {/* Address selection for customer */}
      {isCustomer && (
        <div className="rounded-lg border border-border-default bg-bg-surface p-4 space-y-4">
          <span className="block text-xs font-medium uppercase tracking-wide text-text-secondary">
            Alamat
          </span>
          {addresses.length > 0 ? (
            <div>
              <label
                htmlFor="addressSelect"
                className="mb-1.5 block text-sm font-medium text-text-primary"
              >
                Pilih Alamat
              </label>
              <select
                id="addressSelect"
                value={selectedAddressId}
                onChange={handleAddressSelect}
                className="w-full rounded-md border border-border-default bg-bg-surface px-4 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              >
                {addresses.map((addr) => (
                  <option key={addr.id} value={addr.id}>
                    {addr.label ?? addr.address} — {addr.city}
                  </option>
                ))}
              </select>
              {getFieldError(errors, 'addressId') && (
                <p className="mt-1 text-xs text-danger-500">{getFieldError(errors, 'addressId')}</p>
              )}
            </div>
          ) : (
            <div className="rounded-md bg-bg-page px-4 py-3 text-sm text-text-secondary">
              Belum ada alamat tersimpan.{' '}
              <a
                href="/dashboard/customer/addresses"
                className="font-medium text-primary hover:text-primary-hover transition-colors"
              >
                Tambah alamat
              </a>
            </div>
          )}
          {!isCustomer && initialAuth && (
            <p className="text-xs text-text-muted">
              Guest checkout tidak dapat menggunakan alamat tersimpan.{' '}
              <a href="/register" className="text-primary hover:underline">
                Daftar akun
              </a>{' '}
              untuk menyimpan alamat.
            </p>
          )}
        </div>
      )}

      {/* Schedule */}
      <div className="rounded-lg border border-border-default bg-bg-surface p-4 space-y-4">
        <span className="block text-xs font-medium uppercase tracking-wide text-text-secondary">
          Jadwal
        </span>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="bookingDate"
              className="mb-1.5 block text-sm font-medium text-text-primary"
            >
              Tanggal
            </label>
            <input
              id="bookingDate"
              type="date"
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              min={todayStr()}
              className="w-full rounded-md border border-border-default bg-bg-surface px-4 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
            />
            {getFieldError(errors, 'bookingDate') && (
              <p className="mt-1 text-xs text-danger-500">{getFieldError(errors, 'bookingDate')}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="bookingTime"
              className="mb-1.5 block text-sm font-medium text-text-primary"
            >
              Jam
            </label>
            <input
              id="bookingTime"
              type="time"
              value={bookingTime}
              onChange={(e) => setBookingTime(e.target.value)}
              className="w-full rounded-md border border-border-default bg-bg-surface px-4 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
            />
            {getFieldError(errors, 'bookingTime') && (
              <p className="mt-1 text-xs text-danger-500">{getFieldError(errors, 'bookingTime')}</p>
            )}
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="rounded-lg border border-border-default bg-bg-surface p-4">
        <label htmlFor="notes" className="mb-1.5 block text-sm font-medium text-text-primary">
          Catatan <span className="text-text-secondary">(opsional)</span>
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-border-default bg-bg-surface px-4 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-text-secondary resize-none"
          placeholder="Jelaskan masalah yang ingin diperbaiki, minimal 10 karakter"
        />
        {getFieldError(errors, 'notes') && (
          <p className="mt-1 text-xs text-danger-500">{getFieldError(errors, 'notes')}</p>
        )}
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        disabled={loading || !serviceId}
      >
        {loading ? 'Memproses...' : 'Kirim Pesanan'}
      </Button>

      <p className="text-center text-xs text-text-secondary">
        Dengan mengirim pesanan, Anda menyetujui{' '}
        <a
          href="/syarat-ketentuan"
          className="font-medium text-primary hover:text-primary-hover transition-colors"
        >
          Syarat & Ketentuan
        </a>{' '}
        dan{' '}
        <a
          href="/kebijakan-privasi"
          className="font-medium text-primary hover:text-primary-hover transition-colors"
        >
          Kebijakan Privasi
        </a>{' '}
        kami.
      </p>
    </form>
  );
}

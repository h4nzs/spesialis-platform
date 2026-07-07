import { useState, useEffect, useMemo } from 'react';
import { Button } from '@specialist/ui';
import { createBrowserClient, formatCurrency } from '@specialist/shared';
import { createGuestBookingSchema, createCustomerBookingSchema } from '@specialist/validation';

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

interface FieldError {
  field: string;
  message: string;
}

interface BookingFormProps {
  serviceId: string | null;
}

function getFieldError(errors: FieldError[], field: string): string | undefined {
  return errors.find((e) => e.field === field)?.message;
}

function getToken(): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem('spesialis_access_token');
}

function todayStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function BookingForm({ serviceId }: BookingFormProps) {
  const api = useMemo(() => createBrowserClient(), []);

  const [token] = useState(getToken);
  const [isCustomer, setIsCustomer] = useState(false);

  const [service, setService] = useState<ServiceInfo | null>(null);
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [loadingService, setLoadingService] = useState(true);

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
    setIsCustomer(!!token);

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
  }, [serviceId, token, api]);

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

  function handleAddressSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    setSelectedAddressId(e.target.value);
    const addr = addresses.find((a) => a.id === e.target.value);
    if (addr) {
      setReceiverName(addr.receiverName);
      setReceiverPhone(addr.receiverPhone);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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
      <div className="rounded-xl border border-success/30 bg-success/5 px-6 py-10 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
          <span className="text-3xl text-success">&#10003;</span>
        </div>
        <h2 className="mt-4 text-xl font-bold text-text">Booking Berhasil!</h2>
        <p className="mt-2 text-sm text-text-muted">Booking Anda telah tercatat dengan nomor:</p>
        <p className="mt-3 text-2xl font-bold tracking-wider text-primary">
          {bookingResult.bookingNumber}
        </p>
        <p className="mt-2 text-xs text-text-muted">
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
            className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-6 py-2.5 text-sm font-medium text-text transition-colors hover:bg-background"
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
        <div className="rounded-md border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          {generalError}
        </div>
      )}

      {/* Service Info */}
      <div className="rounded-lg border border-border bg-surface p-4">
        <label className="text-xs font-medium uppercase tracking-wide text-text-muted">
          Layanan
        </label>
        {loadingService ? (
          <div className="mt-2 h-5 w-48 rounded bg-border animate-pulse" />
        ) : service ? (
          <div className="mt-1 flex items-center justify-between">
            <span className="font-medium text-text">{service.name}</span>
            <span className="text-sm font-medium text-primary">
              {formatCurrency(service.basePrice)}
            </span>
          </div>
        ) : (
          <p className="mt-1 text-sm text-danger">
            {serviceId ? 'Layanan tidak ditemukan' : 'Pilih layanan terlebih dahulu'}
          </p>
        )}
      </div>

      {/* Customer Info — only for guest */}
      {!isCustomer && (
        <>
          <div className="rounded-lg border border-border bg-surface p-4 space-y-4">
            <span className="block text-xs font-medium uppercase tracking-wide text-text-muted">
              Data Diri
            </span>
            <div>
              <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-text">
                Nama Lengkap
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-md border border-border bg-surface px-4 py-2.5 text-sm text-text outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-text-muted"
                placeholder="Nama lengkap"
              />
              {getFieldError(errors, 'fullName') && (
                <p className="mt-1 text-xs text-danger">{getFieldError(errors, 'fullName')}</p>
              )}
            </div>
            <div>
              <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-text">
                Nomor HP
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-md border border-border bg-surface px-4 py-2.5 text-sm text-text outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-text-muted"
                placeholder="08123456789"
              />
              {getFieldError(errors, 'phone') && (
                <p className="mt-1 text-xs text-danger">{getFieldError(errors, 'phone')}</p>
              )}
            </div>
          </div>

          {/* Address for guest */}
          <div className="rounded-lg border border-border bg-surface p-4 space-y-4">
            <span className="block text-xs font-medium uppercase tracking-wide text-text-muted">
              Alamat
            </span>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="receiverName"
                  className="mb-1.5 block text-sm font-medium text-text"
                >
                  Nama Penerima
                </label>
                <input
                  id="receiverName"
                  type="text"
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  className="w-full rounded-md border border-border bg-surface px-4 py-2.5 text-sm text-text outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-text-muted"
                  placeholder="Nama penerima"
                />
                {getFieldError(errors, 'address.receiverName') && (
                  <p className="mt-1 text-xs text-danger">
                    {getFieldError(errors, 'address.receiverName')}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="receiverPhone"
                  className="mb-1.5 block text-sm font-medium text-text"
                >
                  HP Penerima
                </label>
                <input
                  id="receiverPhone"
                  type="tel"
                  value={receiverPhone}
                  onChange={(e) => setReceiverPhone(e.target.value)}
                  className="w-full rounded-md border border-border bg-surface px-4 py-2.5 text-sm text-text outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-text-muted"
                  placeholder="08xxxx"
                />
                {getFieldError(errors, 'address.receiverPhone') && (
                  <p className="mt-1 text-xs text-danger">
                    {getFieldError(errors, 'address.receiverPhone')}
                  </p>
                )}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="province" className="mb-1.5 block text-sm font-medium text-text">
                  Provinsi
                </label>
                <input
                  id="province"
                  type="text"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full rounded-md border border-border bg-surface px-4 py-2.5 text-sm text-text outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-text-muted"
                  placeholder="Jawa Barat"
                />
                {getFieldError(errors, 'address.province') && (
                  <p className="mt-1 text-xs text-danger">
                    {getFieldError(errors, 'address.province')}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="city" className="mb-1.5 block text-sm font-medium text-text">
                  Kota
                </label>
                <input
                  id="city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-md border border-border bg-surface px-4 py-2.5 text-sm text-text outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-text-muted"
                  placeholder="Bandung"
                />
                {getFieldError(errors, 'address.city') && (
                  <p className="mt-1 text-xs text-danger">
                    {getFieldError(errors, 'address.city')}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="district" className="mb-1.5 block text-sm font-medium text-text">
                  Kecamatan
                </label>
                <input
                  id="district"
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full rounded-md border border-border bg-surface px-4 py-2.5 text-sm text-text outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-text-muted"
                  placeholder="Coblong"
                />
                {getFieldError(errors, 'address.district') && (
                  <p className="mt-1 text-xs text-danger">
                    {getFieldError(errors, 'address.district')}
                  </p>
                )}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="postalCode" className="mb-1.5 block text-sm font-medium text-text">
                  Kode Pos
                </label>
                <input
                  id="postalCode"
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full rounded-md border border-border bg-surface px-4 py-2.5 text-sm text-text outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-text-muted"
                  placeholder="40131"
                />
                {getFieldError(errors, 'address.postalCode') && (
                  <p className="mt-1 text-xs text-danger">
                    {getFieldError(errors, 'address.postalCode')}
                  </p>
                )}
              </div>
            </div>
            <div>
              <label htmlFor="address" className="mb-1.5 block text-sm font-medium text-text">
                Alamat Lengkap
              </label>
              <textarea
                id="address"
                value={addrLine}
                onChange={(e) => setAddrLine(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-border bg-surface px-4 py-2.5 text-sm text-text outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-text-muted resize-none"
                placeholder="Jl. Contoh No. 123, RT/RW 001/002"
              />
              {getFieldError(errors, 'address.address') && (
                <p className="mt-1 text-xs text-danger">
                  {getFieldError(errors, 'address.address')}
                </p>
              )}
            </div>
          </div>
        </>
      )}

      {/* Address selection for customer */}
      {isCustomer && (
        <div className="rounded-lg border border-border bg-surface p-4 space-y-4">
          <span className="block text-xs font-medium uppercase tracking-wide text-text-muted">
            Alamat
          </span>
          {addresses.length > 0 ? (
            <div>
              <label htmlFor="addressSelect" className="mb-1.5 block text-sm font-medium text-text">
                Pilih Alamat
              </label>
              <select
                id="addressSelect"
                value={selectedAddressId}
                onChange={handleAddressSelect}
                className="w-full rounded-md border border-border bg-surface px-4 py-2.5 text-sm text-text outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              >
                {addresses.map((addr) => (
                  <option key={addr.id} value={addr.id}>
                    {addr.label ?? addr.address} — {addr.city}
                  </option>
                ))}
              </select>
              {getFieldError(errors, 'addressId') && (
                <p className="mt-1 text-xs text-danger">{getFieldError(errors, 'addressId')}</p>
              )}
            </div>
          ) : (
            <div className="rounded-md bg-background px-4 py-3 text-sm text-text-muted">
              Belum ada alamat tersimpan.{' '}
              <a
                href="/dashboard/customer/addresses"
                className="font-medium text-primary hover:text-primary-hover transition-colors"
              >
                Tambah alamat
              </a>
            </div>
          )}
        </div>
      )}

      {/* Schedule */}
      <div className="rounded-lg border border-border bg-surface p-4 space-y-4">
        <span className="block text-xs font-medium uppercase tracking-wide text-text-muted">
          Jadwal
        </span>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="bookingDate" className="mb-1.5 block text-sm font-medium text-text">
              Tanggal
            </label>
            <input
              id="bookingDate"
              type="date"
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              min={todayStr()}
              className="w-full rounded-md border border-border bg-surface px-4 py-2.5 text-sm text-text outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
            />
            {getFieldError(errors, 'bookingDate') && (
              <p className="mt-1 text-xs text-danger">{getFieldError(errors, 'bookingDate')}</p>
            )}
          </div>
          <div>
            <label htmlFor="bookingTime" className="mb-1.5 block text-sm font-medium text-text">
              Jam
            </label>
            <input
              id="bookingTime"
              type="time"
              value={bookingTime}
              onChange={(e) => setBookingTime(e.target.value)}
              className="w-full rounded-md border border-border bg-surface px-4 py-2.5 text-sm text-text outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
            />
            {getFieldError(errors, 'bookingTime') && (
              <p className="mt-1 text-xs text-danger">{getFieldError(errors, 'bookingTime')}</p>
            )}
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="rounded-lg border border-border bg-surface p-4">
        <label htmlFor="notes" className="mb-1.5 block text-sm font-medium text-text">
          Catatan <span className="text-text-muted">(opsional)</span>
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-border bg-surface px-4 py-2.5 text-sm text-text outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-text-muted resize-none"
          placeholder="Jelaskan masalah yang ingin diperbaiki, minimal 10 karakter"
        />
        {getFieldError(errors, 'notes') && (
          <p className="mt-1 text-xs text-danger">{getFieldError(errors, 'notes')}</p>
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

      <p className="text-center text-xs text-text-muted">
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

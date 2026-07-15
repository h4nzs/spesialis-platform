/**
 * WA template helpers — category-specific fields for WhatsApp booking messages.
 *
 * Each service category has relevant questions/fields that get appended
 * to the WhatsApp message template so the customer can fill them in.
 */

/**
 * Infer category slug from a service name by keyword matching.
 * Used when the category slug isn't directly available (e.g. booking form, detail page).
 */
export function inferCategorySlug(serviceName: string | null | undefined): string | null {
  if (!serviceName) return null;
  const name = serviceName.toLowerCase();
  // Emergency
  if (
    name.includes('mobil mogok') ||
    name.includes('motor mogok') ||
    name.includes('terkunci') ||
    name.includes('konslet') ||
    name.includes('jumper') ||
    name.includes('aki') ||
    name.includes('ban bocor') ||
    name.includes('derek') ||
    name.includes('darurat') ||
    name.includes('ac mati mendadak') ||
    name.includes('atap bocor')
  )
    return 'emergency';
  // Montir
  if (
    name.includes('montir') ||
    name.includes('inspeksi mobil') ||
    (name.includes('mobil') && name.includes('mogok'))
  )
    return 'montir';
  // Electronics / Elektronik
  if (
    name.includes('ac ') ||
    name.startsWith('ac') ||
    name.includes('kulkas') ||
    name.includes('mesin cuci') ||
    name.includes('tv') ||
    name.includes('dispenser') ||
    name.includes('microwave') ||
    name.includes('oven') ||
    name.includes('kompor') ||
    name.includes('vacuum') ||
    name.includes('elektronik') ||
    name.includes('service ac') ||
    name.includes('service kulkas') ||
    name.includes('service water heater')
  )
    return 'electronics';
  // Plumbing
  if (
    name.includes('pipa') ||
    name.includes('bocor') ||
    name.includes('mampet') ||
    name.includes('water heater') ||
    name.includes('pompa air') ||
    name.includes('toren') ||
    name.includes('keran') ||
    name.includes('wastafel') ||
    name.includes('closet') ||
    name.includes('toilet') ||
    name.includes('instalasi air')
  )
    return 'plumbing';
  // Electrical
  if (
    name.includes('listrik') ||
    name.includes('lampu') ||
    name.includes('panel') ||
    name.includes('stop kontak') ||
    name.includes('mcb') ||
    name.includes('grounding')
  )
    return 'electrical';
  // Cleaning
  if (
    name.includes('cleaning') ||
    name.includes('bersih') ||
    name.includes('cuci sofa') ||
    name.includes('cuci kasur') ||
    name.includes('cuci karpet') ||
    name.includes('cuci gorden') ||
    name.includes('kaca') ||
    name.includes('deep cleaning')
  )
    return 'cleaning';
  // Construction / Bangunan
  if (
    name.includes('bangunan') ||
    name.includes('renovasi') ||
    name.includes('tukang') ||
    name.includes('cat ') ||
    name.includes('pengecatan') ||
    name.includes('keramik') ||
    name.includes('gypsum') ||
    name.includes('plafon') ||
    name.includes('waterproofing') ||
    name.includes('baja ringan') ||
    name.includes('inspeksi rumah')
  )
    return 'construction';
  // Welding / Las
  if (
    name.includes('las ') ||
    name.includes('pagar') ||
    name.includes('kanopi') ||
    name.includes('teralis') ||
    name.includes('tangga') ||
    name.includes('balkon') ||
    name.includes('railing') ||
    name.includes('pintu besi') ||
    name.includes('stainless')
  )
    return 'welding';
  // Paving / Aspal
  if (name.includes('aspal') || name.includes('pengaspalan') || name.includes('marka jalan'))
    return 'paving';
  // Septic / Sedot
  if (
    name.includes('sedot') ||
    name.includes('septic') ||
    name.includes('wc') ||
    name.includes('limbah')
  )
    return 'septic';
  // Pest Control
  if (
    name.includes('rayap') ||
    name.includes('tikus') ||
    name.includes('kecoa') ||
    name.includes('semut') ||
    name.includes('nyamuk') ||
    name.includes('lebah') ||
    name.includes('ular') ||
    name.includes('pest') ||
    name.includes('hama') ||
    name.includes('basmi')
  )
    return 'pest-control';
  // Garden / Taman
  if (
    name.includes('kebun') ||
    name.includes('rumput') ||
    name.includes('taman') ||
    name.includes('kolam hias') ||
    name.includes('garden')
  )
    return 'garden';
  // Security
  if (
    name.includes('bodyguard') ||
    name.includes('security') ||
    name.includes('satpam') ||
    name.includes('pengawalan') ||
    name.includes('vip')
  )
    return 'security';
  // Driver / Supir
  if (name.includes('supir') || name.includes('driver') || name.includes('sopir')) return 'driver';
  // Household / Rumah Tangga
  if (
    name.includes('art') ||
    name.includes('asisten rumah') ||
    name.includes('babysitter') ||
    name.includes('lansia') ||
    name.includes('juru masak') ||
    name.includes('office boy') ||
    name.includes('office girl') ||
    name.includes('rumah tangga')
  )
    return 'household';
  // Investigation
  if (
    name.includes('investigasi') ||
    name.includes('verifikasi') ||
    name.includes('audit') ||
    name.includes('perselingkuhan')
  )
    return 'investigation';
  return null;
}

/**
 * Returns category-specific fields for the WhatsApp message template
 * based on the service category slug.
 */
export function getCategorySpecificFields(catSlug: string | null): string {
  switch (catSlug) {
    case 'emergency':
      return 'Lokasi Kejadian: \nJenis Darurat: \nTingkat Keparahan: \nKeluhan: \nCatatan untuk Teknisi: ';
    case 'montir':
      return 'Tipe Kendaraan (Mobil/Motor): \nMerek & Tahun: \nGejala Kerusakan: \nLokasi Kendaraan: \nKeluhan: \nCatatan untuk Teknisi: ';
    case 'electronics':
      return 'Jenis Elektronik: \nMerek & Model: \nGejala Kerusakan: \nMasih Bergaransi: \nKeluhan: \nCatatan untuk Teknisi: ';
    case 'plumbing':
      return 'Jenis Pekerjaan (Bocor/Mampet/Pasang Baru): \nLokasi Masalah: \nTingkat Keparahan: \nKeluhan: \nCatatan untuk Teknisi: ';
    case 'electrical':
      return 'Jenis Pekerjaan (Perbaikan/Pasang Baru): \nDaya Listrik (VA): \nJumlah Titik: \nKeluhan: \nCatatan untuk Teknisi: ';
    case 'cleaning':
      return 'Tipe Properti (Rumah/Kantor/Ruko): \nLuas (m²): \nJumlah Ruangan: \nKeluhan: \nCatatan untuk Teknisi: ';
    case 'construction':
      return 'Jenis Pekerjaan: \nLuas Area (m²): \nLokasi Pekerjaan: \nEstimasi Budget: \nKeluhan: \nCatatan untuk Teknisi: ';
    case 'welding':
      return 'Jenis Las: \nUkuran (m): \nBahan (Besi/Stainless): \nLokasi Pemasangan: \nKeluhan: \nCatatan untuk Teknisi: ';
    case 'paving':
      return 'Luas Area (m²): \nJenis Aspal: \nLokasi Pekerjaan: \nAkses untuk Dump Truk: \nKeluhan: \nCatatan untuk Teknisi: ';
    case 'septic':
      return 'Jenis Pekerjaan (Sedot/Perawatan): \nKapasitas (m³): \nLokasi Tangki: \nAkses Mobil Sedot: \nKeluhan: \nCatatan untuk Teknisi: ';
    case 'pest-control':
      return 'Jenis Hama: \nTingkat Infestasi (Ringan/Sedang/Berat): \nLuas Area (m²): \nAda Anak/Balita di Rumah: \nKeluhan: \nCatatan untuk Teknisi: ';
    case 'garden':
      return 'Jenis Pekerjaan: \nLuas Area (m²): \nJenis Tanaman: \nKeluhan: \nCatatan untuk Teknisi: ';
    case 'security':
      return 'Jenis Layanan: \nLokasi Penempatan: \nJam Operasional: \nJumlah Personil: \nKeluhan: \nCatatan untuk Teknisi: ';
    case 'driver':
      return 'Jenis Layanan: \nDurasi (Hari/Bulan): \nJam Mulai: \nRute Perjalanan: \nTipe Mobil: \nKeluhan: \nCatatan untuk Teknisi: ';
    case 'household':
      return 'Jenis Pekerja: \nDurasi (Harian/Bulanan): \nJam Kerja: \nLokasi Rumah: \nKeluhan: \nCatatan untuk Teknisi: ';
    case 'investigation':
      return 'Jenis Investigasi: \nLokasi: \nDurasi (Hari): \nTingkat Kerahasiaan: \nKeluhan: \nCatatan untuk Teknisi: ';
    case 'lainnya':
      return 'Deskripsikan Kebutuhan Anda: \nLokasi: \nBudget: \nCatatan Tambahan: ';
    default:
      return 'Detail Pekerjaan: \nKeluhan: \nCatatan untuk Teknisi: ';
  }
}

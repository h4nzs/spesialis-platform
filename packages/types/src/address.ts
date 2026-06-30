export interface Address {
  id: string;
  customerId: string;
  label: string | null;
  receiverName: string;
  receiverPhone: string;
  province: string;
  city: string;
  district: string;
  postalCode: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  isDefault: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export type CreateAddressInput = {
  customerId: string;
  label?: string;
  receiverName: string;
  receiverPhone: string;
  province: string;
  city: string;
  district: string;
  postalCode: string;
  address: string;
  isDefault?: boolean;
};

export type UpdateAddressInput = Partial<
  Pick<Address, 'label' | 'receiverName' | 'receiverPhone' | 'address' | 'isDefault' | 'notes'>
>;

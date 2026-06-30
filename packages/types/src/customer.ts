export interface CustomerProfile {
  id: string;
  userId: string | null;
  fullName: string;
  avatar: string | null;
  birthDate: string | null;
  gender: string | null;
  defaultAddressId: string | null;
  guestPhone: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export type CreateCustomerInput = {
  userId?: string;
  fullName: string;
  guestPhone?: string;
};

export type UpdateCustomerInput = Partial<
  Pick<CustomerProfile, 'fullName' | 'avatar' | 'birthDate' | 'gender' | 'defaultAddressId'>
>;

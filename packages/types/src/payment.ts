export type PaymentMethod = 'Cash' | 'Transfer' | 'QRIS' | 'E-Wallet' | 'Other';

export type PaymentStatus = 'Waiting' | 'Pending Verification' | 'Paid' | 'Failed' | 'Refunded';

export interface Payment {
  id: string;
  orderId: string;
  method: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  paymentDate: string | null;
  proofMediaId: string | null;
  verifiedBy: string | null;
  verifiedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CreatePaymentInput = {
  orderId: string;
  method: PaymentMethod;
  amount: number;
  proofMediaId?: string;
};

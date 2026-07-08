export type OrderStatus =
  | 'Draft'
  | 'Pending Confirmation'
  | 'Confirmed'
  | 'Waiting Assignment'
  | 'Partner Assigned'
  | 'Partner Accepted'
  | 'On The Way'
  | 'Working'
  | 'Completed'
  | 'Waiting Payment'
  | 'Paid'
  | 'Closed'
  | 'Cancelled'
  | 'Rejected'
  | 'Expired';

export interface Order {
  id: string;
  bookingNumber: string;
  customerId: string;
  companyId: string | null;
  addressId: string;
  partnerId: string | null;
  status: OrderStatus;
  bookingDate: string;
  bookingTime: string;
  basePrice: number;
  finalPrice: number | null;
  discountPercent: number | null;
  discountAmount: number;
  notes: string | null;
  internalNotes: string | null;
  tags: string | null;
  completedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface OrderItem {
  id: string;
  orderId: string;
  serviceId: string;
  serviceNameSnapshot: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  changedBy: string;
  note: string | null;
  createdAt: string;
}

export type CreateOrderInput = {
  customerId: string;
  addressId: string;
  bookingDate: string;
  bookingTime: string;
  basePrice: number;
  notes?: string;
  items: Array<{
    serviceId: string;
    quantity: number;
    unitPrice: number;
  }>;
};

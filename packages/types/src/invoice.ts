export type InvoiceStatus = 'Draft' | 'Issued' | 'Paid' | 'Overdue' | 'Cancelled';

export interface Invoice {
  id: string;
  companyId: string;
  invoiceNumber: string;
  orderId: string | null;
  amount: string;
  status: InvoiceStatus;
  issuedAt: string | null;
  paidAt: string | null;
  dueDate: string;
  notes: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CreateInvoiceInput {
  companyId: string;
  orderId?: string | null;
  amount: number;
  dueDate: string;
  notes?: string | null;
}

export type ComplaintStatus = 'Open' | 'Investigating' | 'Resolved' | 'Closed';

export interface Complaint {
  id: string;
  orderId: string;
  customerId: string;
  status: ComplaintStatus;
  title: string;
  description: string;
  resolution: string | null;
  resolvedBy: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CreateComplaintInput = {
  orderId: string;
  customerId: string;
  title: string;
  description: string;
};

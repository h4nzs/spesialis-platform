export type AssignmentStatus = 'Assigned' | 'Accepted' | 'Rejected' | 'Completed' | 'Cancelled';

export interface Assignment {
  id: string;
  orderId: string;
  partnerId: string;
  status: AssignmentStatus;
  assignedAt: string;
  acceptedAt: string | null;
  rejectedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  rejectionReason: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CreateAssignmentInput = {
  orderId: string;
  partnerId: string;
};

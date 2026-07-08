export type PenaltyType = 'Late' | 'NoShow' | 'Cancellation' | 'Complaint' | 'Other';

export type PenaltyStatus = 'Pending' | 'Applied' | 'Waived' | 'Disputed';

export interface PartnerPenalty {
  id: string;
  partnerId: string;
  orderId: string | null;
  type: PenaltyType;
  amount: string;
  reason: string;
  status: PenaltyStatus;
  imposedBy: string;
  imposedAt: string;
  paidAt: string | null;
  resolvedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

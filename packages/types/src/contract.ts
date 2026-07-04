export type ContractStatus = 'Draft' | 'Active' | 'Expired' | 'Terminated';

export interface Contract {
  id: string;
  companyId: string;
  contractNumber: string;
  startDate: string;
  endDate: string;
  slaResponseHours: number | null;
  slaResolutionHours: number | null;
  discountPercent: string | null;
  discountAmount: string | null;
  status: ContractStatus;
  notes: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CreateContractInput {
  companyId: string;
  startDate: string;
  endDate: string;
  slaResponseHours?: number | null;
  slaResolutionHours?: number | null;
  discountPercent?: number | null;
  discountAmount?: number | null;
  notes?: string | null;
}

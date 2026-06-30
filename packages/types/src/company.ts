export type CompanyStatus = 'Pending' | 'Verified' | 'Rejected' | 'Suspended';

export interface Company {
  id: string;
  companyName: string;
  legalName: string;
  taxNumber: string | null;
  email: string;
  phone: string;
  website: string | null;
  industry: string | null;
  employeeCount: number | null;
  logoMediaId: string | null;
  status: CompanyStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export type CreateCompanyInput = {
  companyName: string;
  legalName: string;
  email: string;
  phone: string;
};

export type CompanyUser = {
  id: string;
  companyId: string;
  userId: string;
  role: string;
};

export type Branch = {
  id: string;
  companyId: string;
  name: string;
  address: string;
  city: string;
  phone: string | null;
};

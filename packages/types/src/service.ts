export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  basePrice: string;
  estimatedDuration: number | null;
  warrantyDays: number | null;
  thumbnail: string | null;
  isActive: boolean;
  isFeatured: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export type CreateServiceInput = {
  categoryId: string;
  name: string;
  slug: string;
  basePrice: string;
};

export type UpdateServiceInput = Partial<
  Pick<Service, 'name' | 'basePrice' | 'isActive' | 'isFeatured' | 'displayOrder'>
>;

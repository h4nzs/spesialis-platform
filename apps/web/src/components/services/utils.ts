export interface ServiceData {
  id: string;
  categoryId: string | null;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  basePrice: string;
  estimatedDuration: number | null;
  warrantyDays: number | null;
  thumbnail: string | null;
  isFeatured: boolean | null;
}

export interface ReviewItem {
  id: string;
  rating: string;
  review: string | null;
  createdAt: string;
}

export interface ReviewData {
  items: ReviewItem[];
  aggregate: {
    averageRating: number;
    totalReviews: number;
  };
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface RelatedServiceItem {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  basePrice: string;
  thumbnail: string | null;
}

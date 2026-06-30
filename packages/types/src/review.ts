export interface Review {
  id: string;
  orderId: string;
  customerId: string;
  partnerId: string;
  rating: number;
  review: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CreateReviewInput = {
  orderId: string;
  customerId: string;
  partnerId: string;
  rating: number;
  review?: string;
};

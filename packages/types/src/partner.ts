export type PartnerAvailability = 'Available' | 'Busy' | 'Vacation' | 'Offline';

export type PartnerVerificationStatus = 'Pending' | 'Approved' | 'Rejected' | 'Suspended';

export interface PartnerProfile {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  avatar: string | null;
  ktpNumber: string;
  ktpMediaId: string | null;
  profilePhotoId: string | null;
  experienceYear: number | null;
  bio: string | null;
  ratingAverage: number;
  completedJobs: number;
  availability: PartnerAvailability;
  verificationStatus: PartnerVerificationStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export type CreatePartnerInput = {
  userId: string;
  fullName: string;
  phone: string;
  ktpNumber: string;
};

export type UpdatePartnerInput = Partial<
  Pick<PartnerProfile, 'fullName' | 'phone' | 'avatar' | 'bio' | 'availability'>
>;

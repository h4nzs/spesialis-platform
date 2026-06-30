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

export interface PartnerSkill {
  id: string;
  partnerId: string;
  categoryId: string;
  categoryName?: string;
  proficiency: string;
  createdAt: string;
}

export type CreatePartnerSkillInput = {
  categoryId: string;
  proficiency?: string;
};

export interface PartnerDocument {
  id: string;
  partnerId: string;
  type: string;
  mediaId: string | null;
  fileName: string;
  status: string;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

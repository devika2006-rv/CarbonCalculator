export type UserRole = 'user' | 'admin';
export type UserCategory = 'Student' | 'NSS Volunteer' | 'Teacher' | 'General Public' | 'Other';
export type InstitutionType = 'School' | 'College' | 'Other';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  category: UserCategory;
  institution_name: string;
  institution_type: InstitutionType;
  district: string;
  created_at: string;
  last_login_at?: string;
}

export interface UserStats {
  totalPoints: number;
  calcCount: number;
  challengeCount: number;
  badgesCount: number;
  badges: Badge[];
  latestCalc: CalculationRecord | null;
}

export interface EmissionFactor {
  key: string;
  name: string;
  value: number;
  unit: string;
  category: string;
  source: string;
  assumptions: string;
}

export interface CalculationInputs {
  gridRegion: 'india' | 'kerala';
  electricityKwh: number | '';
  carPetrolKm: number | '';
  carDieselKm: number | '';
  twoWheelerPetrolKm: number | '';
  twoWheelerEvKm: number | '';
  carEvKm: number | '';
  busKm: number | '';
  trainKm: number | '';
  dietType: 'heavy_meat' | 'medium_nonveg' | 'vegetarian' | 'vegan';
  foodWasteFrequency: 'never' | 'rarely' | 'weekly' | 'daily';
  singleUsePlasticCount: number | '';
  onlineOrdersMonthly: number | '';
  usesReusableBags: boolean;
  wasteSegregation: 'full' | 'partial' | 'none';
  practicesComposting: boolean;
  practicesRecycling: boolean;
  lpgCylindersPerMonth: number | '';
  householdMembers: number | '';
  waterPumpHoursPerDay: number | '';
}

export interface EmissionCategory {
  name: string;
  key: string;
  co2_kg: number;
}

export interface Suggestion {
  category: string;
  title: string;
  tip: string;
}

export interface CalculationResult {
  daily_co2_kg: number;
  monthly_co2_kg: number;
  annual_co2_tonnes: number;
  categories: EmissionCategory[];
  suggestions: Suggestion[];
  breakdown: {
    electricity_co2_kg: number;
    transport_co2_kg: number;
    food_co2_kg: number;
    plastic_co2_kg: number;
    waste_co2_kg: number;
    lifestyle_co2_kg: number;
  };
}

export interface CalculationRecord {
  id: number;
  user_id: number;
  daily_co2_kg: number;
  monthly_co2_kg: number;
  annual_co2_tonnes: number;
  electricity_co2_kg: number;
  transport_co2_kg: number;
  food_co2_kg: number;
  plastic_co2_kg: number;
  waste_co2_kg: number;
  lifestyle_co2_kg: number;
  inputs: CalculationInputs;
  calculated_at: string;
}

export type SubmissionStatus = 'submitted' | 'verifying' | 'verified' | 'needs_review' | 'rejected' | 'failed';

export interface ChallengeSubmission {
  id: number;
  userId?: number;
  userName?: string;
  userEmail?: string;
  userCategory?: string;
  institutionName?: string;
  district?: string;
  challengeId: number;
  challengeTitle?: string;
  challengeCategory?: string;
  challengeDifficulty?: string;
  challengePoints?: number;
  evidenceGuidance?: string;
  acceptableEvidence?: string;
  status: SubmissionStatus;
  photos: string[];
  userNotes?: string;
  evidenceConfirmed?: boolean;
  aiStatus?: string;
  aiConfidence?: number | null;
  aiRelevance?: string;
  aiQuality?: string;
  aiReason?: string;
  reviewerId?: number;
  reviewerName?: string;
  reviewDecision?: string;
  reviewReason?: string;
  reviewedAt?: string;
  pointsAwarded: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Challenge {
  id: number;
  slug: string;
  title: string;
  description: string;
  environmental_benefit: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: 'daily' | 'weekly';
  points: number;
  action_steps: string;
  badge_award?: string;
  evidence_guidance?: string;
  acceptable_evidence?: string;
  recommended_photos?: number;
  privacy_guidance?: string;
  completedCurrentPeriod?: boolean;
  totalTimesCompleted?: number;
  latestSubmission?: {
    id: number;
    status: SubmissionStatus;
    createdAt: string;
    aiReason?: string;
    reviewReason?: string;
  } | null;
}

export interface Badge {
  id: string;
  badge_id: string;
  badge_name: string;
  badge_description: string;
  awarded_at: string;
}

export interface CommunityOverview {
  totalUsers: number;
  totalInstitutions: number;
  totalCalculations: number;
  totalChallengesCompleted: number;
  totalGreenPoints: number;
}

export interface InstitutionLeaderboardItem {
  institution_name: string;
  institution_type: string;
  district: string;
  participant_count: number;
  total_points: number;
  calculations_count: number;
}

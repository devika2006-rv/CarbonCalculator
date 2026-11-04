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
  completedCurrentPeriod?: boolean;
  totalTimesCompleted?: number;
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

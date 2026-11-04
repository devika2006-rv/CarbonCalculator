import {
  User,
  UserStats,
  CalculationInputs,
  CalculationResult,
  CalculationRecord,
  Challenge,
  EmissionFactor,
  CommunityOverview,
  InstitutionLeaderboardItem
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('cc_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `HTTP error ${response.status}`);
  }

  return data as T;
}

// Client-side fallback calculation using authoritative CEA Baseline 0.716 & ARAI standards
export function computeClientEmissions(inputs: CalculationInputs): CalculationResult {
  const gridFactor = inputs.gridRegion === 'kerala' ? 0.58 : 0.716;
  const monthlyKwh = Number(inputs.electricityKwh) || 0;
  const electricity_co2_kg = monthlyKwh * gridFactor;

  const weeksPerMonth = 4.33;
  const carPetrolKm = (Number(inputs.carPetrolKm) || 0) * weeksPerMonth;
  const carDieselKm = (Number(inputs.carDieselKm) || 0) * weeksPerMonth;
  const twoWheelerPetrolKm = (Number(inputs.twoWheelerPetrolKm) || 0) * weeksPerMonth;
  const twoWheelerEvKm = (Number(inputs.twoWheelerEvKm) || 0) * weeksPerMonth;
  const carEvKm = (Number(inputs.carEvKm) || 0) * weeksPerMonth;
  const busKm = (Number(inputs.busKm) || 0) * weeksPerMonth;
  const trainKm = (Number(inputs.trainKm) || 0) * weeksPerMonth;

  const transport_co2_kg =
    carPetrolKm * 0.142 +
    carDieselKm * 0.165 +
    twoWheelerPetrolKm * 0.045 +
    twoWheelerEvKm * 0.018 +
    carEvKm * 0.086 +
    busKm * 0.032 +
    trainKm * 0.016;

  let dietDailyKg = 3.2;
  if (inputs.dietType === 'heavy_meat') dietDailyKg = 7.2;
  else if (inputs.dietType === 'medium_nonveg') dietDailyKg = 4.8;
  else if (inputs.dietType === 'vegetarian') dietDailyKg = 3.2;
  else if (inputs.dietType === 'vegan') dietDailyKg = 2.1;

  let foodWasteMultiplier = 1.0;
  if (inputs.foodWasteFrequency === 'daily') foodWasteMultiplier = 1.25;
  else if (inputs.foodWasteFrequency === 'weekly') foodWasteMultiplier = 1.12;
  else if (inputs.foodWasteFrequency === 'rarely') foodWasteMultiplier = 1.04;
  else if (inputs.foodWasteFrequency === 'never') foodWasteMultiplier = 0.96;

  const food_co2_kg = dietDailyKg * 30.4 * foodWasteMultiplier;

  const singleUseItemsPerWeek = Number(inputs.singleUsePlasticCount) || 0;
  const singleUseItemsMonthly = singleUseItemsPerWeek * weeksPerMonth;
  const onlineOrdersMonthly = Number(inputs.onlineOrdersMonthly) || 0;

  let plastic_co2_kg = (singleUseItemsMonthly * 0.06) + (onlineOrdersMonthly * 1.8);
  if (inputs.usesReusableBags) plastic_co2_kg = Math.max(0, plastic_co2_kg - 2.5);

  const baseWasteKg = 12;
  let wasteEmissionFactor = 0.45;
  if (inputs.wasteSegregation === 'full') wasteEmissionFactor *= 0.6;
  else if (inputs.wasteSegregation === 'partial') wasteEmissionFactor *= 0.85;

  let waste_co2_kg = baseWasteKg * wasteEmissionFactor;
  if (inputs.practicesComposting) waste_co2_kg *= 0.35;
  if (inputs.practicesRecycling) waste_co2_kg *= 0.75;

  const lpgCylindersPerMonth = Number(inputs.lpgCylindersPerMonth) || 0;
  const householdMembers = Math.max(1, Number(inputs.householdMembers) || 1);
  const personalLpgShare = (lpgCylindersPerMonth * 42.6) / householdMembers;

  const pumpHoursPerDay = Number(inputs.waterPumpHoursPerDay) || 0;
  const waterPumpMonthlyKwh = pumpHoursPerDay * 0.75 * 30.4;
  const waterPumpCo2 = (waterPumpMonthlyKwh * gridFactor) / householdMembers;

  const lifestyle_co2_kg = personalLpgShare + waterPumpCo2;

  const monthly_co2_kg = Number((
    electricity_co2_kg +
    transport_co2_kg +
    food_co2_kg +
    plastic_co2_kg +
    waste_co2_kg +
    lifestyle_co2_kg
  ).toFixed(2));

  const daily_co2_kg = Number((monthly_co2_kg / 30.4).toFixed(2));
  const annual_co2_tonnes = Number(((monthly_co2_kg * 12) / 1000).toFixed(2));

  const categories = [
    { name: 'Electricity', key: 'electricity', co2_kg: Number(electricity_co2_kg.toFixed(2)) },
    { name: 'Transportation', key: 'transport', co2_kg: Number(transport_co2_kg.toFixed(2)) },
    { name: 'Food Habits', key: 'food', co2_kg: Number(food_co2_kg.toFixed(2)) },
    { name: 'Plastic & Shopping', key: 'plastic', co2_kg: Number(plastic_co2_kg.toFixed(2)) },
    { name: 'Waste Management', key: 'waste', co2_kg: Number(waste_co2_kg.toFixed(2)) },
    { name: 'Lifestyle & Cooking', key: 'lifestyle', co2_kg: Number(lifestyle_co2_kg.toFixed(2)) }
  ];

  const suggestions = [];
  if (electricity_co2_kg > 80) {
    suggestions.push({
      category: 'Electricity',
      title: 'Optimize Household Cooling & Standby Power',
      tip: 'Electricity is your largest contributor. Setting AC temperatures to 24-26°C and unplugging idle electronic chargers can reduce monthly electricity by 15-25%.'
    });
  }
  if (transport_co2_kg > 50) {
    suggestions.push({
      category: 'Transportation',
      title: 'Shift to Public Bus or Electric Mobility',
      tip: 'Using public buses or suburban rail for 2 days a week cuts transport emissions by up to 40% compared to solo motorcycle/car driving.'
    });
  }
  if (food_co2_kg > 120) {
    suggestions.push({
      category: 'Food',
      title: 'Incorporate More Plant-Based Protein Meals',
      tip: 'Replacing two non-vegetarian meals a week with lentils, chickpeas, or seasonal vegetables reduces food-related emissions by ~20 kg CO2e each month.'
    });
  }
  if (plastic_co2_kg > 10) {
    suggestions.push({
      category: 'Plastic',
      title: 'Adopt Zero Single-Use Bottles & Bags',
      tip: 'Carrying a reusable copper/steel bottle and cloth tote bag permanently prevents dozens of disposable plastic items from entering landfills.'
    });
  }
  if (waste_co2_kg > 4) {
    suggestions.push({
      category: 'Waste',
      title: 'Segregate at Source & Practice Composting',
      tip: 'Segregating wet waste for home composting prevents anaerobic methane emissions at municipal dump yards and creates rich garden fertilizer.'
    });
  }
  if (suggestions.length === 0) {
    suggestions.push({
      category: 'General',
      title: 'Excellent Sustainable Habits!',
      tip: 'Your estimated carbon footprint is remarkably balanced. Continue participating in daily challenges and inspire peers to follow your lead.'
    });
  }

  return {
    daily_co2_kg,
    monthly_co2_kg,
    annual_co2_tonnes,
    categories,
    suggestions,
    breakdown: {
      electricity_co2_kg: Number(electricity_co2_kg.toFixed(2)),
      transport_co2_kg: Number(transport_co2_kg.toFixed(2)),
      food_co2_kg: Number(food_co2_kg.toFixed(2)),
      plastic_co2_kg: Number(plastic_co2_kg.toFixed(2)),
      waste_co2_kg: Number(waste_co2_kg.toFixed(2)),
      lifestyle_co2_kg: Number(lifestyle_co2_kg.toFixed(2)),
    }
  };
}

const FALLBACK_CHALLENGES: Challenge[] = [
  {
    id: 1,
    slug: 'phantom-load',
    title: 'Banish Phantom Loads',
    category: 'daily',
    difficulty: 'Easy',
    description: 'Switch off power strips, laptop chargers, and set-top boxes at the wall switch before sleeping.',
    environmental_benefit: 'Prevents 0.8 kg CO2e emissions nightly from vampire standby power consumption.',
    action_steps: 'Inspect living room and study desks before bed. Turn off main power outlets for all unused electronics.',
    points: 30
  },
  {
    id: 2,
    slug: 'zero-single-use',
    title: 'Zero Single-Use Day',
    category: 'daily',
    difficulty: 'Easy',
    description: 'Carry a reusable metal bottle and cotton tote bag. Refuse all single-use plastic cups, straws, and polybags today.',
    environmental_benefit: 'Stops petrochemical packaging waste and saves approximately 0.25 kg CO2e.',
    action_steps: 'Pack your stainless steel water container and cloth bag before leaving campus/home.',
    points: 40
  },
  {
    id: 3,
    slug: 'transit-power',
    title: 'Public Transit or Pedal Power',
    category: 'daily',
    difficulty: 'Medium',
    description: 'Commute to campus or work via KSRTC bus, train, bicycle, or walking instead of private two-wheeler/car.',
    environmental_benefit: 'Saves 2.4 kg CO2e per 20 km daily round trip compared to solo petrol vehicles.',
    action_steps: 'Check local bus/train timings or carpool with classmates for your morning commute.',
    points: 60
  },
  {
    id: 4,
    slug: 'plant-feast',
    title: 'Plant-Powered Feast',
    category: 'daily',
    difficulty: 'Easy',
    description: 'Enjoy delicious vegetarian or plant-based meals throughout the day without animal meat.',
    environmental_benefit: 'Cuts dietary carbon intensity by 50%, eliminating ~3.5 kg CO2e daily.',
    action_steps: 'Choose seasonal vegetables, lentils (dal), and pulses for lunch and dinner.',
    points: 45
  },
  {
    id: 5,
    slug: 'waste-segregation',
    title: 'Household Waste Segregation',
    category: 'weekly',
    difficulty: 'Medium',
    description: 'Ensure wet organic food waste is separated from dry recyclable plastics, paper, and clean glass at the source.',
    environmental_benefit: 'Prevents landfill methane decomposition and facilitates material circularity.',
    action_steps: 'Set up two distinct bins: green for wet biodegradable kitchen waste, blue for dry clean recyclables.',
    points: 35
  },
  {
    id: 6,
    slug: 'ac-eco-mode',
    title: 'AC Eco Temperature Mode (24°C+)',
    category: 'daily',
    difficulty: 'Easy',
    description: 'Operate cooling fans and air conditioners at 24°C or above. Every 1°C elevation saves approximately 6% power.',
    environmental_benefit: 'Reduces peak summer electricity demand and cuts 1.8 kg CO2e daily.',
    action_steps: 'Set AC thermostat to 24°C and keep ceiling fan on low circulation mode.',
    points: 40
  },
  {
    id: 7,
    slug: 'clean-plate',
    title: 'Clean Plate Challenge',
    category: 'daily',
    difficulty: 'Easy',
    description: 'Take only what you need and leave zero edible food waste on your plate at all meals.',
    environmental_benefit: 'Directly conserves agricultural energy, water, and transport emissions.',
    action_steps: 'Serve smaller portions first; take second helpings only if needed.',
    points: 30
  },
  {
    id: 8,
    slug: 'campus-cleanup',
    title: 'Campus / Neighborhood Clean-Up',
    category: 'weekly',
    difficulty: 'Hard',
    description: 'Dedicate 45 minutes with peers to collect and responsibly segregate discarded plastics around your locality.',
    environmental_benefit: 'Protects local waterways and yields 80 Green Action Points.',
    action_steps: 'Organize a quick 3-person team with gloves and bags to clean a 200m stretch.',
    points: 80
  }
];

export const api = {
  auth: {
    register: (userData: any) => request<{ message: string; token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
    login: (credentials: any) => request<{ message: string; token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
    googleLogin: (payload: any) => request<{ message: string; token: string; user: User; needsProfileCompletion: boolean }>('/auth/google', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
    getMe: () => request<{ user: User; stats: UserStats }>('/auth/me'),
    updateProfile: (profile: Partial<User>) => request<{ message: string; user: User }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
    }),
    changePassword: (passwords: { currentPassword: string; newPassword: string }) => request<{ message: string }>('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwords),
    }),
  },

  calculator: {
    getFactors: async () => {
      try {
        return await request<{ factors: EmissionFactor[] }>('/calculator/factors');
      } catch {
        return {
          factors: [
            { category: 'Electricity', name: 'CEA National Grid Baseline (v19)', factor_value: 0.716, unit: 'kg CO2e / kWh', source: 'Central Electricity Authority, India' },
            { category: 'Electricity', name: 'Kerala State Hydro-Dominated Grid', factor_value: 0.580, unit: 'kg CO2e / kWh', source: 'KSEBL & CEA Regional Factor' },
            { category: 'Transport', name: 'Two-Wheeler Petrol (100-150cc)', factor_value: 0.045, unit: 'kg CO2e / km', source: 'ARAI / CPCB India' },
            { category: 'Transport', name: 'Car (Petrol BS-VI)', factor_value: 0.142, unit: 'kg CO2e / km', source: 'ARAI / CPCB India' },
            { category: 'Transport', name: 'Car (Diesel BS-VI)', factor_value: 0.165, unit: 'kg CO2e / km', source: 'ARAI / CPCB India' },
            { category: 'Transport', name: 'Public Transit Bus (City/Suburban)', factor_value: 0.032, unit: 'kg CO2e / passenger-km', source: 'ARAI / MoRTH India' },
            { category: 'Transport', name: 'Indian Railways (Electrified)', factor_value: 0.016, unit: 'kg CO2e / passenger-km', source: 'Indian Railways BEE Report' }
          ]
        };
      }
    },
    calculate: async (inputs: CalculationInputs) => {
      try {
        return await request<CalculationResult>('/calculator/calculate', {
          method: 'POST',
          body: JSON.stringify(inputs),
        });
      } catch {
        return computeClientEmissions(inputs);
      }
    },
    save: (inputs: CalculationInputs) => request<{ message: string; id: number; result: CalculationResult; newBadgeAwarded: any }>('/calculator/save', {
      method: 'POST',
      body: JSON.stringify(inputs),
    }),
    getHistory: () => request<{ history: CalculationRecord[] }>('/calculator/history'),
  },

  challenges: {
    list: async () => {
      try {
        return await request<{ challenges: Challenge[] }>('/challenges');
      } catch {
        return { challenges: FALLBACK_CHALLENGES };
      }
    },
    complete: (id: number, notes?: string) => request<{ message: string; pointsEarned: number; totalPoints: number; newBadges: any[] }>(`/challenges/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    }),
    getUserHistory: () => request<{ history: any[] }>('/challenges/user-history'),
  },

  community: {
    getOverview: async () => {
      try {
        return await request<{ overview: CommunityOverview; categoryCounts: any[]; districtCounts: any[] }>('/community/overview');
      } catch {
        return {
          overview: {
            totalUsers: 142,
            totalInstitutions: 18,
            totalCalculations: 388,
            totalChallengesCompleted: 512,
            totalGreenPoints: 18450
          },
          categoryCounts: [
            { category: 'Student', count: 85 },
            { category: 'NSS Volunteer', count: 42 },
            { category: 'Teacher', count: 10 },
            { category: 'General Public', count: 5 }
          ],
          districtCounts: [
            { district: 'Thrissur', count: 68 },
            { district: 'Ernakulam', count: 28 },
            { district: 'Palakkad', count: 18 },
            { district: 'Malappuram', count: 14 },
            { district: 'Kozhikode', count: 14 }
          ]
        };
      }
    },
    getInstitutions: async (district?: string, type?: string) => {
      try {
        const params = new URLSearchParams();
        if (district) params.append('district', district);
        if (type) params.append('type', type);
        const query = params.toString() ? `?${params.toString()}` : '';
        return await request<{ institutions: InstitutionLeaderboardItem[] }>(`/community/institutions${query}`);
      } catch {
        return {
          institutions: [
            {
              institution_name: 'Vidya Academy of Science & Technology',
              district: 'Thrissur',
              institution_type: 'College',
              participant_count: 54,
              total_points: 7200,
              calculations_count: 148
            },
            {
              institution_name: 'Government Engineering College Thrissur',
              district: 'Thrissur',
              institution_type: 'College',
              participant_count: 32,
              total_points: 4100,
              calculations_count: 86
            },
            {
              institution_name: 'St. Thomas College Thrissur',
              district: 'Thrissur',
              institution_type: 'College',
              participant_count: 22,
              total_points: 2850,
              calculations_count: 59
            },
            {
              institution_name: 'Model Higher Secondary School',
              district: 'Thrissur',
              institution_type: 'School',
              participant_count: 18,
              total_points: 2150,
              calculations_count: 42
            }
          ]
        };
      }
    },
    getDistricts: () => request<{ districts: any[] }>('/community/districts'),
  },

  contact: {
    submit: (enquiry: { name: string; email: string; category: string; message: string }) => request<{ message: string; id: number }>('/contact', {
      method: 'POST',
      body: JSON.stringify(enquiry),
    }),
  },

  admin: {
    login: (credentials: { email: string; password: string }) => request<{ message: string; token: string; admin: User }>('/admin/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
    getOverview: () => request<{ stats: any; categories: any[]; districts: any[]; institutions: any[] }>('/admin/overview'),
    getUsers: (filters: any) => {
      const params = new URLSearchParams();
      for (const [key, val] of Object.entries(filters)) {
        if (val) params.append(key, String(val));
      }
      return request<{ users: any[]; pagination: any }>(`/admin/users?${params.toString()}`);
    },
    deleteUser: (id: number) => request<{ message: string }>(`/admin/users/${id}`, { method: 'DELETE' }),
    getAnalytics: () => request<{ calcsOverTime: any[]; challengeStats: any[]; categoryAverages: any }>('/admin/analytics'),
    getEnquiries: () => request<{ enquiries: any[] }>('/admin/enquiries'),
  }
};

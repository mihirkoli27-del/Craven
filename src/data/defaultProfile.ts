import { UserProfileInput } from '../types';

export const INITIAL_USER_PROFILE: UserProfileInput = {
  // Step 1 — Basic Information
  age: 28,
  gender: 'Male',
  heightUnit: 'cm',
  heightCm: 175,
  heightFt: 5,
  heightIn: 9,
  weightUnit: 'kg',
  currentWeight: 74,
  targetWeight: 68,
  country: 'India',
  cityRegion: 'Mumbai, Maharashtra',

  // Step 2 — Goal
  goal: 'Fat loss',

  // Step 3 — Diet Type
  dietType: 'Vegetarian',
  customDietType: '',

  // Step 4 — Allergies & Restrictions
  allergies: [],
  customAllergies: '',
  foodsToAvoid: '',

  // Step 5 — Health Information
  medicalConditions: ['None'],
  customMedicalConditions: '',
  doctorRestrictions: '',
  digestiveIssues: ['None'],
  customDigestiveIssues: '',
  medications: 'None',

  // Step 6 — Activity & Exercise
  activityLevel: 'Moderate',
  dailySteps: '8,000 - 10,000 steps',
  occupation: 'Desk / Tech Job',
  hasExercise: true,
  workoutType: ['Strength training', 'Cardio / Running'],
  workoutDaysPerWeek: 4,
  workoutDuration: '45-60 min',
  workoutTime: 'Evening (5-8 PM)',

  // Step 7 — Daily Schedule
  wakeUpTime: '06:30 AM',
  sleepTime: '11:00 PM',
  breakfastTime: '08:30 AM',
  lunchTime: '01:30 PM',
  dinnerTime: '08:00 PM',
  snackTime: '05:00 PM',
  mealsPerDay: 4,
  intermittentFasting: false,
  fastingWindow: '16:8 (16 hrs Fast / 8 hrs Eat)',

  // Step 8 — Food Preferences
  favoriteFoods: '',
  dislikedFoods: '',
  preferredCuisines: ['North Indian', 'South Indian', 'Pan-Indian Healthy'],
  spiceLevel: 'Medium',
  foodCravings: ['Savory & Salty', 'Late night munchies'],
  preferredProteinSources: [
    'Paneer / Cottage Cheese',
    'Moong / Toor / Chana Dal',
    'Greek Yogurt / Curd',
    'Chickpeas & Sprouts',
    'Soya Chunks / Soya Beans',
    'Whey Protein',
  ],

  // Step 9 — Lifestyle & Cooking
  cookingPattern: 'Mostly home-cooked',
  availableCookingTime: '15-30 mins',
  kitchenEquipment: ['Gas Stove / Induction', 'Pressure Cooker', 'Mixer / Blender', 'Microwave'],
  mealPrepPreference: 'Cook fresh each meal',

  // Step 10 — Budget
  budgetPeriod: 'Day',
  enteredBudgetAmount: 350,
  dailyFoodBudget: 350,
  weeklyFoodBudget: 2450,
  currency: '₹',
  budgetTier: 'balanced',
  affordableFoodPreference: 'Balanced quality & value (Seasonal local staples)',

  // Step 11 — Drinks & Supplements
  skipHydrationStep: false,
  dailyWaterIntake: '2-3 Liters',
  teaConsumption: '1-2 cups (with milk & sugar)',
  coffeeConsumption: 'None',
  sugaryDrinks: 'Rarely (1-2 times/month)',
  currentSupplements: ['Multivitamin', 'Vitamin D3', 'Whey Protein'],
  customSupplements: '',
};

export const POPULAR_COUNTRIES = [
  'India',
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'United Arab Emirates',
  'Singapore',
  'Germany',
  'Other',
];

export const GOALS_LIST = [
  {
    id: 'Weight loss',
    title: 'Weight Loss',
    desc: 'Safe caloric deficit to steadily reduce overall body mass.',
    badge: '-400 kcal/day',
  },
  {
    id: 'Fat loss',
    title: 'Fat Loss',
    desc: 'Targeted fat reduction while preserving lean muscle mass.',
    badge: 'High Protein Deficit',
  },
  {
    id: 'Weight gain',
    title: 'Weight Gain',
    desc: 'Nutrient-dense caloric surplus to build healthy mass.',
    badge: '+400 kcal/day',
  },
  {
    id: 'Muscle gain',
    title: 'Muscle Gain (Hypertrophy)',
    desc: 'Optimized high-protein surplus to maximize muscle growth.',
    badge: '1.6-2.0g Protein/kg',
  },
  {
    id: 'Muscle gain + fat loss',
    title: 'Body Recomposition',
    desc: 'Simultaneous fat loss and muscle building at maintenance.',
    badge: 'Smart Protein Timing',
  },
  {
    id: 'Maintain weight',
    title: 'Maintain Weight',
    desc: 'Caloric balance with vital energy, health, and vitality.',
    badge: 'Energy Balance',
  },
  {
    id: 'General healthy eating',
    title: 'General Healthy Eating',
    desc: 'Focus on whole foods, fiber, gut health, and micronutrients.',
    badge: 'Gut & Heart Health',
  },
  {
    id: 'Sports/fitness performance',
    title: 'Sports / Athletic Performance',
    desc: 'Carb-fueling and recovery-focused nutrition for athletes.',
    badge: 'Pre/Post Workout Focus',
  },
] as const;

export const DIET_TYPES_LIST = [
  {
    id: 'Vegetarian',
    title: 'Vegetarian',
    desc: 'Plant-based with dairy (paneer, milk, curd, ghee). No meat, poultry, or fish.',
    icon: '🥦',
  },
  {
    id: 'Vegan',
    title: 'Vegan',
    desc: '100% plant-based. No dairy, eggs, meat, or animal-derived products.',
    icon: '🌱',
  },
  {
    id: 'Eggetarian',
    title: 'Eggetarian',
    desc: 'Vegetarian diet enriched with whole eggs and egg whites.',
    icon: '🥚',
  },
  {
    id: 'Non-vegetarian',
    title: 'Non-Vegetarian',
    desc: 'Includes chicken, mutton, fish, eggs, dairy, and plant foods.',
    icon: '🍗',
  },
  {
    id: 'Pescatarian',
    title: 'Pescatarian',
    desc: 'Vegetarian plus fish and seafood. No poultry or red meat.',
    icon: '🐟',
  },
  {
    id: 'Other',
    title: 'Custom / Other Diet',
    desc: 'Keto, Low Carb, Jain, Satvik, Gluten-Free, or personalized lifestyle.',
    icon: '✨',
  },
] as const;

export const ALLERGIES_LIST = [
  'Dairy (Lactose)',
  'Eggs',
  'Peanuts',
  'Tree nuts (Almonds, Cashews, Walnuts)',
  'Soy',
  'Gluten (Wheat, Barley, Rye)',
  'Fish',
  'Shellfish',
  'Mustard / Sesame',
  'None',
];

export const MEDICAL_CONDITIONS_LIST = [
  'None',
  'Diabetes / Prediabetes (Insulin Resistance)',
  'Hypertension (High Blood Pressure)',
  'Thyroid (Hypothyroid / Hyperthyroid)',
  'PCOS / PCOD',
  'High Cholesterol / Triglycerides',
  'Fatty Liver (Grade 1/2)',
  'High Uric Acid / Gout',
  'Other',
];

export const DIGESTIVE_ISSUES_LIST = [
  'None',
  'Frequent Bloating / Gas',
  'Acid Reflux / GERD / Heartburn',
  'IBS (Irritable Bowel Syndrome)',
  'Constipation / Sluggish Digestion',
  'Lactose Intolerance',
  'Other',
];

export const CUISINES_LIST = [
  'North Indian (Roti, Dal, Paneer, Sabzi)',
  'South Indian (Idli, Dosa, Sambar, Rasam)',
  'Maharashtrian / Gujarati (Bhakri, Thepla, Dal)',
  'Pan-Indian Balanced Homestyle',
  'Mediterranean (Olive oil, Greens, Grains)',
  'Asian / Stir Fry / Noodles & Rice',
  'Continental / Wraps & Salads',
  'Mexican / Burrito Bowls',
];

export const PROTEIN_SOURCES_LIST = [
  'Paneer / Cottage Cheese',
  'Tofu / Soy Slices',
  'Eggs / Egg Whites',
  'Chicken Breast / Lean Cuts',
  'Fish & Seafood',
  'Moong / Toor / Chana Dal',
  'Soya Chunks / Soya Flour',
  'Greek Yogurt / Hung Curd',
  'Chickpeas / Black Chana / Rajma',
  'Sprouted Moong & Beans',
  'Whey / Plant Protein Powder',
];

export const KITCHEN_EQUIPMENT_LIST = [
  'Gas Stove / Induction',
  'Pressure Cooker / Instant Pot',
  'Mixer / Blender / Grinder',
  'Microwave',
  'Air Fryer',
  'Oven / OTG',
  'Electric Kettle',
  'Toaster',
];

export const SUPPLEMENTS_LIST = [
  'None',
  'Multivitamin & Minerals',
  'Vitamin D3 (Weekly / Daily)',
  'Vitamin B12',
  'Whey Protein / Plant Protein',
  'Creatine Monohydrate',
  'Omega-3 Fish Oil / Algal Oil',
  'Iron / Calcium',
  'Probiotics',
  'Other',
];

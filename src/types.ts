export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type DrinkCategory =
  | 'Smoothie'
  | 'Hydration'
  | 'Pre-Workout'
  | 'Post-Workout'
  | 'Detox'
  | 'Digestive'
  | 'Bedtime Elixir';

export interface GoalDrink {
  id: string;
  name: string;
  category: DrinkCategory;
  timing: string; // e.g. 'Early Morning (Empty Stomach)', 'Post-Workout', 'Afternoon Refresher', 'Bedtime Elixir'
  goalBenefit: string; // Targeted benefit tailored to the user's specific health/fitness goal
  prepTimeMinutes: number;
  estimatedCost: number;
  pricePer100g?: number;
  macros: NutritionalMacros;
  ingredients: MealIngredient[];
  instructions: string[];
  recommendedGoal?: string;
  dietaryBadges?: string[];
}

export interface Recipe {
  id: string;
  name: string;
  category: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Dessert' | 'Beverage';
  cuisine: string;
  dietaryTags: string[];
  description: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  totalTimeMinutes?: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Advanced';
  estimatedCost: number;
  currency?: string;
  macros: NutritionalMacros;
  ingredients: MealIngredient[];
  instructions: string[];
  chefTips?: string[];
  healthBenefits?: string[];
  imageUrl?: string;
  sourceUrl?: string;
  spoonacularSourceUrl?: string;
}

export interface NutritionalMacros {
  calories: number;
  protein: number; // in grams
  carbs: number;   // in grams
  fat: number;     // in grams
  fiber?: number;  // in grams
  sugar?: number;  // in grams
  naturalSugar?: number; // in grams
  addedSugar?: number;   // in grams
  sodium?: number; // in mg
  vitaminsAndMinerals?: { [key: string]: string };
}

export interface MealIngredient {
  name: string;
  amount: string;
  isReusedInOtherMeals?: boolean;
  pantryStaple?: boolean;
  estimatedPrice?: number;
  pricePer100g?: number;
}

export interface Meal {
  id: string;
  name: string;
  type: MealType;
  description: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  estimatedCost: number;
  pricePer100g?: number;
  totalGrams?: number;
  macros: NutritionalMacros;
  ingredients: MealIngredient[];
  instructions: string[];
  wasteSavingTip?: string;
  dietaryBadges?: string[];
}

export interface DayPlan {
  dayNumber: number;
  dayName: string;
  meals: {
    breakfast: Meal;
    lunch: Meal;
    dinner: Meal;
    snack: Meal;
  };
  drinksAndSmoothies?: GoalDrink[];
  totalDayMacros: NutritionalMacros;
  dayEstimatedCost: number;
  dailyWasteSaverNote?: string;
}

export interface DietPlan {
  id: string;
  title: string;
  goal: string;
  dietType: string;
  budgetTier: 'thrifty' | 'balanced' | 'gourmet';
  targetCalories: number;
  householdSize: number;
  estimatedWeeklyCost: number;
  currency: string;
  days: DayPlan[];
  drinksAndSmoothiesStrategy?: string[];
  summary: string;
  zeroWasteStrategy: string[];
  bulkPrepTips: string[];
  createdAt: string;
}

export type GroceryCategory =
  | 'Produce'
  | 'Dairy & Eggs'
  | 'Proteins'
  | 'Pantry & Grains'
  | 'Bakery'
  | 'Frozen'
  | 'Spices & Oils'
  | 'Other';

export interface GroceryItem {
  id: string;
  name: string;
  category: GroceryCategory;
  quantity: string;
  estimatedPrice: number;
  usedInMeals: string[];
  isBought: boolean;
  isInPantry: boolean;
  shelfLifeDays?: number;
  zeroWasteTip?: string;
  substitutionTip?: string;
}

export interface GroceryList {
  id: string;
  planId: string;
  items: GroceryItem[];
  totalEstimatedCost: number;
  projectedSavingsFromZeroWaste: number;
}

export interface FoodScanResult {
  foodName: string;
  category?: string;
  healthScore: number;
  healthStatus: 'Healthy' | 'Moderate' | 'Unhealthy';
  naturalSugar: number;
  addedSugar: number;
  fat: number;
  saturatedFat?: number;
  protein: number;
  carbs: number;
  calories: number;
  fiber?: number;
  sodium?: number;
  glycemicIndex?: 'Low' | 'Medium' | 'High';
  servingSize: string;
  baseServingSize?: string;
  portionMultiplier?: number;
  reason: string;
  insights: string[];
  personalizedTips?: string;
  dietaryBadges?: string[];
  budgetAlternative?: {
    name: string;
    reason: string;
    estimatedSavings: string;
    alternativeMacros?: NutritionalMacros;
  };
  estimatedPrice?: number;
  pricePer100g?: number;
  vitaminsAndMinerals?: { [key: string]: string };
  extractedText?: string;
}

export interface UserProfileInput {
  // Step 1 — Basic Information
  age: number | string;
  gender: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  heightUnit: 'cm' | 'ft_in';
  heightCm: number | string;
  heightFt: number | string;
  heightIn: number | string;
  weightUnit: 'kg' | 'lb';
  currentWeight: number | string;
  targetWeight: number | string;
  country: string;
  cityRegion: string;

  // Step 2 — Goal
  goal:
    | 'Weight loss'
    | 'Fat loss'
    | 'Weight gain'
    | 'Muscle gain'
    | 'Muscle gain + fat loss'
    | 'Maintain weight'
    | 'General healthy eating'
    | 'Sports/fitness performance';

  // Step 3 — Diet Type
  dietType:
    | 'Vegetarian'
    | 'Vegan'
    | 'Eggetarian'
    | 'Non-vegetarian'
    | 'Pescatarian'
    | 'Other';
  customDietType?: string;

  // Step 4 — Allergies & Restrictions
  allergies: string[];
  customAllergies?: string;
  foodsToAvoid: string;

  // Step 5 — Health Information
  medicalConditions: string[];
  customMedicalConditions?: string;
  doctorRestrictions: string;
  digestiveIssues: string[];
  customDigestiveIssues?: string;
  medications: string;

  // Step 6 — Activity & Exercise
  activityLevel: 'Sedentary' | 'Light' | 'Moderate' | 'Very Active' | 'Extremely Active';
  dailySteps: string;
  occupation: string;
  hasExercise: boolean;
  workoutType: string[];
  workoutDaysPerWeek: number;
  workoutDuration: string;
  workoutTime: string;

  // Step 7 — Daily Schedule
  wakeUpTime: string;
  sleepTime: string;
  breakfastTime: string;
  lunchTime: string;
  dinnerTime: string;
  snackTime: string;
  mealsPerDay: 2 | 3 | 4 | 5 | 6;
  intermittentFasting: boolean;
  fastingWindow?: string;

  // Step 8 — Food Preferences
  favoriteFoods: string;
  dislikedFoods: string;
  preferredCuisines: string[];
  spiceLevel: 'Mild' | 'Medium' | 'Spicy' | 'Very Spicy';
  foodCravings: string[];
  preferredProteinSources: string[];

  // Step 9 — Lifestyle & Cooking
  cookingPattern: 'Mostly home-cooked' | 'Mostly outside' | 'Mixed';
  availableCookingTime: string;
  kitchenEquipment: string[];
  mealPrepPreference: string;

  // Step 10 — Budget
  budgetPeriod?: 'Day' | 'Week' | 'Month' | 'Year';
  enteredBudgetAmount?: string | number;
  dailyFoodBudget: string | number;
  weeklyFoodBudget: string | number;
  currency: string;
  budgetTier?: 'thrifty' | 'balanced' | 'gourmet';
  affordableFoodPreference: string;

  // Step 11 — Drinks & Supplements
  skipHydrationStep?: boolean;
  dailyWaterIntake: string;
  teaConsumption: string;
  coffeeConsumption: string;
  sugaryDrinks: string;
  currentSupplements: string[];
  customSupplements?: string;
}

export interface PlanGenerationConfig {
  goal: string;
  dietType: string;
  calorieTarget: number;
  budgetTier: 'thrifty' | 'balanced' | 'gourmet';
  householdSize: number;
  currency: string;
  dislikedFoods: string;
  pantryItems: string;
  cookingSkill: string;
  profile?: UserProfileInput;
}

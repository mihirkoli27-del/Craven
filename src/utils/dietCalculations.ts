import { UserProfileInput } from '../types';

export interface CalculatedDietMetrics {
  heightCm: number;
  weightKg: number;
  targetWeightKg: number;
  bmi: number;
  bmiCategory: string;
  bmr: number;
  tdee: number;
  targetCalories: number;
  macroTargets: {
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
    fiberGrams: number;
    proteinPct: number;
    carbsPct: number;
    fatPct: number;
  };
  recommendedWaterLiters: number;
  estimatedMealsBreakdown: {
    breakfastCal: number;
    lunchCal: number;
    dinnerCal: number;
    snackCal: number;
  };
}

export function calculateDietMetrics(profile: UserProfileInput): CalculatedDietMetrics {
  // 1. Height in cm
  let heightCm = 170;
  if (profile.heightUnit === 'cm') {
    heightCm = Number(profile.heightCm) || 170;
  } else {
    const ft = Number(profile.heightFt) || 5;
    const inch = Number(profile.heightIn) || 7;
    heightCm = Math.round(ft * 30.48 + inch * 2.54);
  }

  // 2. Weight in kg
  let weightKg = 70;
  if (profile.weightUnit === 'kg') {
    weightKg = Number(profile.currentWeight) || 70;
  } else {
    weightKg = Math.round((Number(profile.currentWeight) || 154) * 0.453592);
  }

  // 3. Target Weight in kg
  let targetWeightKg = weightKg;
  if (profile.weightUnit === 'kg') {
    targetWeightKg = Number(profile.targetWeight) || weightKg;
  } else {
    targetWeightKg = Math.round((Number(profile.targetWeight) || 150) * 0.453592);
  }

  const age = Number(profile.age) || 28;
  const isMale = profile.gender === 'Male';

  // 4. BMI calculation
  const heightMeters = heightCm / 100;
  const bmi = Math.round((weightKg / (heightMeters * heightMeters)) * 10) / 10;
  let bmiCategory = 'Normal';
  if (bmi < 18.5) bmiCategory = 'Underweight';
  else if (bmi < 24.9) bmiCategory = 'Healthy Weight';
  else if (bmi < 29.9) bmiCategory = 'Overweight';
  else bmiCategory = 'Obesity Range';

  // 5. BMR calculation (Mifflin-St Jeor)
  let bmr = Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + (isMale ? 5 : -161));
  if (bmr < 1100) bmr = 1200;

  // 6. Activity Factor
  let activityMultiplier = 1.2; // Sedentary
  switch (profile.activityLevel) {
    case 'Sedentary':
      activityMultiplier = 1.2;
      break;
    case 'Light':
      activityMultiplier = 1.375;
      break;
    case 'Moderate':
      activityMultiplier = 1.55;
      break;
    case 'Very Active':
      activityMultiplier = 1.725;
      break;
    case 'Extremely Active':
      activityMultiplier = 1.9;
      break;
    default:
      activityMultiplier = 1.4;
  }

  // If exercise is Yes, adjust slightly based on days
  if (profile.hasExercise && profile.workoutDaysPerWeek > 0) {
    activityMultiplier += (profile.workoutDaysPerWeek * 0.03);
  }

  const tdee = Math.round(bmr * activityMultiplier);

  // 7. Goal Calorie Adjustments
  let targetCalories = tdee;
  let proteinRatio = 0.22;
  let carbRatio = 0.50;
  let fatRatio = 0.28;

  switch (profile.goal) {
    case 'Weight loss':
      targetCalories = Math.max(1300, tdee - 450);
      proteinRatio = 0.25;
      carbRatio = 0.45;
      fatRatio = 0.30;
      break;
    case 'Fat loss':
      targetCalories = Math.max(1350, tdee - 400);
      proteinRatio = 0.28;
      carbRatio = 0.42;
      fatRatio = 0.30;
      break;
    case 'Weight gain':
      targetCalories = tdee + 400;
      proteinRatio = 0.20;
      carbRatio = 0.55;
      fatRatio = 0.25;
      break;
    case 'Muscle gain':
      targetCalories = tdee + 350;
      proteinRatio = 0.28;
      carbRatio = 0.48;
      fatRatio = 0.24;
      break;
    case 'Muscle gain + fat loss':
      targetCalories = Math.max(1400, tdee - 150);
      proteinRatio = 0.30;
      carbRatio = 0.42;
      fatRatio = 0.28;
      break;
    case 'Sports/fitness performance':
      targetCalories = tdee + 150;
      proteinRatio = 0.24;
      carbRatio = 0.54;
      fatRatio = 0.22;
      break;
    case 'Maintain weight':
    case 'General healthy eating':
    default:
      targetCalories = tdee;
      proteinRatio = 0.22;
      carbRatio = 0.50;
      fatRatio = 0.28;
      break;
  }

  // Calculate grams from caloric shares
  // Protein: 4 kcal/g, Carbs: 4 kcal/g, Fat: 9 kcal/g
  const proteinGrams = Math.round((targetCalories * proteinRatio) / 4);
  const carbsGrams = Math.round((targetCalories * carbRatio) / 4);
  const fatGrams = Math.round((targetCalories * fatRatio) / 9);
  const fiberGrams = Math.round((targetCalories / 1000) * 15); // ~14-16g fiber per 1000 kcal

  // Recommended Water Intake (approx 35ml per kg + exercise bonus)
  const recommendedWaterLiters = Math.round(((weightKg * 0.035) + (profile.hasExercise ? 0.6 : 0)) * 10) / 10;

  // Meal breakdown
  const breakfastCal = Math.round(targetCalories * 0.25);
  const lunchCal = Math.round(targetCalories * 0.35);
  const dinnerCal = Math.round(targetCalories * 0.30);
  const snackCal = Math.max(100, targetCalories - (breakfastCal + lunchCal + dinnerCal));

  return {
    heightCm,
    weightKg,
    targetWeightKg,
    bmi,
    bmiCategory,
    bmr,
    tdee,
    targetCalories,
    macroTargets: {
      proteinGrams,
      carbsGrams,
      fatGrams,
      fiberGrams,
      proteinPct: Math.round(proteinRatio * 100),
      carbsPct: Math.round(carbRatio * 100),
      fatPct: Math.round(fatRatio * 100),
    },
    recommendedWaterLiters,
    estimatedMealsBreakdown: {
      breakfastCal,
      lunchCal,
      dinnerCal,
      snackCal,
    },
  };
}

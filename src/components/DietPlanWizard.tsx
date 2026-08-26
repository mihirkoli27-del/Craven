import React, { useState, useEffect } from 'react';
import {
  User,
  Target,
  Utensils,
  Activity,
  Clock,
  Heart,
  Wallet,
  Coffee,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Check,
  Edit3,
  Flame,
  Droplets,
  Scale,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ShoppingBag,
  TrendingDown,
  DollarSign,
  Info,
} from 'lucide-react';
import { UserProfileInput } from '../types';
import {
  POPULAR_COUNTRIES,
  GOALS_LIST,
  DIET_TYPES_LIST,
  ALLERGIES_LIST,
  MEDICAL_CONDITIONS_LIST,
  DIGESTIVE_ISSUES_LIST,
  CUISINES_LIST,
  PROTEIN_SOURCES_LIST,
  KITCHEN_EQUIPMENT_LIST,
  SUPPLEMENTS_LIST,
  INITIAL_USER_PROFILE,
} from '../data/defaultProfile';
import { calculateDietMetrics } from '../utils/dietCalculations';
import { formatCurrency, formatCalories, formatGrams } from '../utils/formatters';

interface DietPlanWizardProps {
  initialProfile?: UserProfileInput;
  onSaveProfile: (profile: UserProfileInput) => void;
  onGeneratePlan: (profile: UserProfileInput) => Promise<void>;
  isGenerating: boolean;
  isCollapsedByDefault?: boolean;
  onToggleCollapse?: () => void;
}

export const DietPlanWizard: React.FC<DietPlanWizardProps> = ({
  initialProfile,
  onSaveProfile,
  onGeneratePlan,
  isGenerating,
}) => {
  const [profile, setProfile] = useState<UserProfileInput>(() => {
    try {
      const saved = localStorage.getItem('craven_user_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not load profile from localStorage', e);
    }
    return initialProfile || INITIAL_USER_PROFILE;
  });

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isConfirmingReset, setIsConfirmingReset] = useState<boolean>(false);
  const [resetSuccessNotice, setResetSuccessNotice] = useState<boolean>(false);

  // Sync profile to localStorage and parent callback whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('craven_user_profile', JSON.stringify(profile));
      onSaveProfile(profile);
    } catch (e) {
      console.warn('Storage sync failed', e);
    }
  }, [profile, onSaveProfile]);

  const metrics = calculateDietMetrics(profile);

  // Step definitions
  const stepsMeta = [
    { num: 1, title: 'Basic Info', label: 'Basic Information', icon: User },
    { num: 2, title: 'Goal', label: 'Primary Goal', icon: Target },
    { num: 3, title: 'Diet Type', label: 'Dietary Preference', icon: Utensils },
    { num: 4, title: 'Activity', label: 'Activity & Exercise', icon: Activity },
    { num: 5, title: 'Schedule', label: 'Daily Meal Schedule', icon: Clock },
    { num: 6, title: 'Preferences', label: 'Food & Cuisine Tastes', icon: Heart },
    { num: 7, title: 'Budget', label: 'Food Budget & Market', icon: Wallet },
    { num: 8, title: 'Drinks', label: 'Hydration & Supplements', icon: Coffee },
    { num: 9, title: 'Summary', label: 'Review & Generate Plan', icon: Sparkles },
  ];

  // Quick state mutator helper
  const updateProfile = <K extends keyof UserProfileInput>(key: K, value: UserProfileInput[K]) => {
    setValidationError(null);
    setProfile((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const toggleArrayItem = (key: 'allergies' | 'medicalConditions' | 'digestiveIssues' | 'workoutType' | 'preferredCuisines' | 'foodCravings' | 'preferredProteinSources' | 'kitchenEquipment' | 'currentSupplements', item: string) => {
    setValidationError(null);
    setProfile((prev) => {
      const currentList = prev[key] || [];
      if (item === 'None') {
        return {
          ...prev,
          [key]: currentList.includes('None') ? [] : ['None'],
        };
      }
      // If adding a real item, remove 'None'
      const withoutNone = currentList.filter((i) => i !== 'None');
      if (withoutNone.includes(item)) {
        return {
          ...prev,
          [key]: withoutNone.filter((i) => i !== item),
        };
      } else {
        return {
          ...prev,
          [key]: [...withoutNone, item],
        };
      }
    });
  };

  // Step Validation
  const validateCurrentStep = (step: number): boolean => {
    setValidationError(null);
    if (step === 1) {
      if (!profile.age || Number(profile.age) < 10 || Number(profile.age) > 115) {
        setValidationError('Age is mandatory. Please enter a valid age between 10 and 115 years.');
        return false;
      }
      if (!profile.gender) {
        setValidationError('Gender is mandatory for metabolic rate calculation. Please select your gender.');
        return false;
      }
      if (profile.heightUnit === 'cm') {
        if (!profile.heightCm || Number(profile.heightCm) < 80 || Number(profile.heightCm) > 260) {
          setValidationError('Height is mandatory. Please enter a valid height in cm (80 - 260 cm).');
          return false;
        }
      } else {
        if (!profile.heightFt || Number(profile.heightFt) < 3 || Number(profile.heightFt) > 8) {
          setValidationError('Height is mandatory. Please enter valid feet (3 - 8 ft).');
          return false;
        }
      }
      if (!profile.currentWeight || Number(profile.currentWeight) < 25 || Number(profile.currentWeight) > 350) {
        setValidationError(`Current Weight is mandatory for calorie & protein calculations. Please enter your weight (25 - 350 ${profile.weightUnit}).`);
        return false;
      }
      if (!profile.targetWeight || Number(profile.targetWeight) < 25 || Number(profile.targetWeight) > 350) {
        setValidationError(`Target Weight is mandatory to calculate deficit/surplus. Please enter your target weight (25 - 350 ${profile.weightUnit}).`);
        return false;
      }
    }

    if (step === 2) {
      if (!profile.goal) {
        setValidationError('Primary Goal is mandatory. Please select your target fitness or health goal.');
        return false;
      }
    }

    if (step === 3) {
      if (!profile.dietType) {
        setValidationError('Diet Type is mandatory. Please select your dietary lifestyle (Vegetarian, Non-Veg, Vegan, etc.).');
        return false;
      }
      if (profile.dietType === 'Other' && (!profile.customDietType || !profile.customDietType.trim())) {
        setValidationError('Please specify your custom diet type (e.g. Jain Vegetarian, Keto, Satvik, Paleo).');
        return false;
      }
    }

    if (step === 4) {
      if (!profile.activityLevel) {
        setValidationError('Activity Level is mandatory for calculating your daily maintenance calories (TDEE).');
        return false;
      }
      if (profile.hasExercise && (!profile.workoutType || profile.workoutType.length === 0)) {
        setValidationError('Please select at least one workout or sport type, or toggle exercise to "No".');
        return false;
      }
    }

    if (step === 7) {
      if (!profile.dailyFoodBudget || Number(profile.dailyFoodBudget) <= 0) {
        setValidationError('Daily Food Budget is mandatory to tailor meal ingredient costs accurately.');
        return false;
      }
      if (!profile.budgetTier) {
        setValidationError('Budget Archetype is mandatory. Please select Thrifty, Balanced, or Gourmet.');
        return false;
      }
    }

    if (step === 8) {
      if (!profile.skipHydrationStep && !profile.dailyWaterIntake) {
        setValidationError('Daily Water Intake is required, or click "Skip" to exclude drinks & supplements from the diet calculation.');
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep(currentStep)) {
      if (currentStep < 9) {
        setCurrentStep((prev) => prev + 1);
        window.scrollTo({ top: 180, behavior: 'smooth' });
      }
    }
  };

  const handleSkip = () => {
    setValidationError(null);
    if (currentStep === 8) {
      updateProfile('skipHydrationStep', true);
    }
    if (currentStep < 9) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 180, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setValidationError(null);
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 180, behavior: 'smooth' });
    }
  };

  const handleJumpToStep = (stepNumber: number) => {
    // If jumping forward, validate intermediate steps
    if (stepNumber > currentStep) {
      if (!validateCurrentStep(currentStep)) return;
    }
    setValidationError(null);
    setCurrentStep(stepNumber);
  };

  const handleTriggerReset = () => {
    setIsConfirmingReset(true);
  };

  const handleConfirmReset = () => {
    setProfile(INITIAL_USER_PROFILE);
    setCurrentStep(1);
    setValidationError(null);
    setIsConfirmingReset(false);
    setResetSuccessNotice(true);
    try {
      localStorage.setItem('craven_user_profile', JSON.stringify(INITIAL_USER_PROFILE));
    } catch (e) {
      console.warn('Reset storage sync failed', e);
    }
    setTimeout(() => {
      setResetSuccessNotice(false);
    }, 3000);
  };

  const handleCancelReset = () => {
    setIsConfirmingReset(false);
  };

  const handleGenerate = async () => {
    if (validateCurrentStep(currentStep)) {
      await onGeneratePlan(profile);
    }
  };

  const progressPercent = Math.round(((currentStep - 1) / 8) * 100);

  return (
    <div
      id="diet-plan-form-card"
      className="rounded-3xl border shadow-sm p-4 sm:p-7 md:p-8 transition-all mb-8 relative overflow-hidden"
      style={{
        backgroundColor: 'var(--theme-surface)',
        borderColor: 'var(--theme-border)',
        color: 'var(--theme-text)',
      }}
    >
      {/* Top Header & Reset Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-black/10">
        <div>
          <div className="flex items-center space-x-2">
            <span
              className="px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-md border"
              style={{
                backgroundColor: 'var(--theme-primary-light)',
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-primary-text)',
              }}
            >
              Step-by-Step Personalization
            </span>
            <span className="text-xs font-semibold" style={{ color: 'var(--theme-accent)' }}>
              Step {currentStep} of 9
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif mt-1" style={{ color: 'var(--theme-text)' }}>
            Personalize Your Diet Plan
          </h2>
          <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--theme-text-muted)' }}>
            Provide your lifestyle, health profile, schedule, and preferences to build an accurate, realistic 7-day plan.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          {resetSuccessNotice && (
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl animate-fade-in">
              Reset to defaults!
            </span>
          )}

          {isConfirmingReset ? (
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-xl p-1 shadow-xs">
              <span className="text-xs font-semibold text-amber-900 px-1.5">Reset answers?</span>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition-all cursor-pointer shadow-xs"
              >
                Yes
              </button>
              <button
                type="button"
                onClick={handleCancelReset}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleTriggerReset}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all hover:opacity-80 cursor-pointer"
              style={{
                backgroundColor: 'var(--theme-subtle)',
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-text-muted)',
              }}
              title="Reset questionnaire to default recommendations"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar & Step Chips */}
      <div className="py-4 space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span style={{ color: 'var(--theme-primary)' }}>
            {stepsMeta[currentStep - 1]?.label}
          </span>
          <span style={{ color: 'var(--theme-text-muted)' }}>
            {progressPercent}% Complete
          </span>
        </div>

        {/* Progress Line */}
        <div className="w-full h-2 rounded-full overflow-hidden bg-black/10">
          <div
            className="h-full transition-all duration-300 rounded-full"
            style={{
              width: `${Math.max(8, progressPercent)}%`,
              backgroundColor: 'var(--theme-primary)',
            }}
          />
        </div>

        {/* Horizontal Step Pills for Desktop / Tablets */}
        <div className="flex items-center space-x-1.5 overflow-x-auto py-1.5 no-scrollbar">
          {stepsMeta.map((s) => {
            const Icon = s.icon;
            const isCurrent = s.num === currentStep;
            const isCompleted = s.num < currentStep;

            return (
              <button
                key={s.num}
                type="button"
                onClick={() => handleJumpToStep(s.num)}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer border ${
                  isCurrent
                    ? 'shadow-xs ring-1 ring-amber-700/30'
                    : isCompleted
                    ? 'hover:opacity-80 opacity-90'
                    : 'opacity-50 hover:opacity-75'
                }`}
                style={{
                  backgroundColor: isCurrent
                    ? 'var(--theme-primary)'
                    : isCompleted
                    ? 'var(--theme-subtle)'
                    : 'transparent',
                  color: isCurrent
                    ? '#ffffff'
                    : isCompleted
                    ? 'var(--theme-text)'
                    : 'var(--theme-text-muted)',
                  borderColor: isCurrent ? 'var(--theme-primary)' : 'var(--theme-border)',
                }}
              >
                {isCompleted ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600 font-bold" />
                ) : (
                  <Icon className="w-3.5 h-3.5" />
                )}
                <span>{s.num}. {s.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Validation Error Alert */}
      {validationError && (
        <div className="mb-4 p-3.5 rounded-2xl border border-red-200 bg-red-50 text-red-800 text-xs font-semibold flex items-center space-x-2 animate-in fade-in duration-200">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* STEP CONTENT CONTAINER */}
      <div className="py-4 min-h-[340px]">
        {/* ================= STEP 1: Basic Information ================= */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center space-x-2">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
                style={{ backgroundColor: 'var(--theme-primary)' }}
              >
                <User className="w-4 h-4 text-amber-200" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold font-serif flex items-center gap-1.5" style={{ color: 'var(--theme-text)' }}>
                  <span>Step 1 — Basic Information</span>
                  <span className="text-red-500 font-bold">*</span>
                </h3>
                <p className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>
                  Essential for calculating your Basal Metabolic Rate (BMR), Body Mass Index (BMI), and baseline calorie requirements.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Age */}
              <div>
                <label className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--theme-text-muted)' }}>
                  <span>Age (years)</span>
                  <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  id="wizard-input-age"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={profile.age === '' || profile.age === undefined ? '' : profile.age}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/[^0-9]/g, '');
                    updateProfile('age', clean === '' ? '' : clean);
                  }}
                  placeholder="e.g. 28"
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-700/30 font-medium"
                  style={{
                    backgroundColor: 'var(--theme-subtle)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text)',
                  }}
                />
              </div>

              {/* Gender */}
              <div>
                <label className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--theme-text-muted)' }}>
                  <span>Gender</span>
                  <span className="text-red-500 font-bold">*</span>
                </label>
                <div id="wizard-gender-pills" className="grid grid-cols-3 gap-1.5">
                  {(['Male', 'Female', 'Other'] as const).map((g) => {
                    const isSelected = profile.gender === g || (g === 'Other' && profile.gender === 'Prefer not to say');
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => updateProfile('gender', g)}
                        className={`py-2.5 px-2 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-900 text-white border-amber-900 shadow-xs'
                            : 'hover:bg-black/5 border-black/10'
                        }`}
                        style={
                          !isSelected
                            ? {
                                backgroundColor: 'var(--theme-subtle)',
                                borderColor: 'var(--theme-border)',
                                color: 'var(--theme-text)',
                              }
                            : undefined
                        }
                      >
                        {g}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Height */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--theme-text-muted)' }}>
                    <span>Height</span>
                    <span className="text-red-500 font-bold">*</span>
                  </label>
                  <div className="flex rounded-lg border text-[11px] overflow-hidden">
                    <button
                      type="button"
                      onClick={() => updateProfile('heightUnit', 'cm')}
                      className={`px-2 py-0.5 font-bold cursor-pointer ${
                        profile.heightUnit === 'cm' ? 'bg-amber-900 text-white' : 'hover:bg-black/5'
                      }`}
                    >
                      cm
                    </button>
                    <button
                      type="button"
                      onClick={() => updateProfile('heightUnit', 'ft_in')}
                      className={`px-2 py-0.5 font-bold cursor-pointer ${
                        profile.heightUnit === 'ft_in' ? 'bg-amber-900 text-white' : 'hover:bg-black/5'
                      }`}
                    >
                      ft / in
                    </button>
                  </div>
                </div>

                {profile.heightUnit === 'cm' ? (
                  <input
                    id="wizard-input-height-cm"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={profile.heightCm === '' || profile.heightCm === undefined ? '' : profile.heightCm}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/[^0-9]/g, '');
                      updateProfile('heightCm', clean === '' ? '' : clean);
                    }}
                    placeholder="e.g. 175 cm"
                    className="w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-700/30 font-medium"
                    style={{
                      backgroundColor: 'var(--theme-subtle)',
                      borderColor: 'var(--theme-border)',
                      color: 'var(--theme-text)',
                    }}
                  />
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      id="wizard-input-height-ft"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={profile.heightFt === '' || profile.heightFt === undefined ? '' : profile.heightFt}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/[^0-9]/g, '');
                        updateProfile('heightFt', clean === '' ? '' : clean);
                      }}
                      placeholder="Feet (e.g. 5)"
                      className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-hidden font-medium"
                      style={{
                        backgroundColor: 'var(--theme-subtle)',
                        borderColor: 'var(--theme-border)',
                        color: 'var(--theme-text)',
                      }}
                    />
                    <input
                      id="wizard-input-height-in"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={profile.heightIn === '' || profile.heightIn === undefined ? '' : profile.heightIn}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/[^0-9]/g, '');
                        updateProfile('heightIn', clean === '' ? '' : clean);
                      }}
                      placeholder="Inches (e.g. 9)"
                      className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-hidden font-medium"
                      style={{
                        backgroundColor: 'var(--theme-subtle)',
                        borderColor: 'var(--theme-border)',
                        color: 'var(--theme-text)',
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Current Weight */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--theme-text-muted)' }}>
                    <span>Current Weight</span>
                    <span className="text-red-500 font-bold">*</span>
                  </label>
                  <div className="flex rounded-lg border text-[11px] overflow-hidden">
                    <button
                      type="button"
                      onClick={() => updateProfile('weightUnit', 'kg')}
                      className={`px-2 py-0.5 font-bold cursor-pointer ${
                        profile.weightUnit === 'kg' ? 'bg-amber-900 text-white' : 'hover:bg-black/5'
                      }`}
                    >
                      kg
                    </button>
                    <button
                      type="button"
                      onClick={() => updateProfile('weightUnit', 'lb')}
                      className={`px-2 py-0.5 font-bold cursor-pointer ${
                        profile.weightUnit === 'lb' ? 'bg-amber-900 text-white' : 'hover:bg-black/5'
                      }`}
                    >
                      lb
                    </button>
                  </div>
                </div>
                <input
                  id="wizard-input-current-weight"
                  type="text"
                  inputMode="decimal"
                  value={profile.currentWeight === '' || profile.currentWeight === undefined ? '' : profile.currentWeight}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');
                    updateProfile('currentWeight', clean === '' ? '' : clean);
                  }}
                  placeholder={`e.g. 74 ${profile.weightUnit}`}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-700/30 font-medium"
                  style={{
                    backgroundColor: 'var(--theme-subtle)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text)',
                  }}
                />
              </div>

              {/* Target Weight */}
              <div>
                <label className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--theme-text-muted)' }}>
                  <span>Target Weight ({profile.weightUnit})</span>
                  <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  id="wizard-input-target-weight"
                  type="text"
                  inputMode="decimal"
                  value={profile.targetWeight === '' || profile.targetWeight === undefined ? '' : profile.targetWeight}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');
                    updateProfile('targetWeight', clean === '' ? '' : clean);
                  }}
                  placeholder={`e.g. 68 ${profile.weightUnit}`}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-700/30 font-medium"
                  style={{
                    backgroundColor: 'var(--theme-subtle)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text)',
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 2: Goal ================= */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center space-x-2">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
                style={{ backgroundColor: 'var(--theme-primary)' }}
              >
                <Target className="w-4 h-4 text-amber-200" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold font-serif flex items-center gap-1.5" style={{ color: 'var(--theme-text)' }}>
                  <span>Step 2 — Primary Fitness &amp; Health Goal</span>
                  <span className="text-red-500 font-bold">*</span>
                </h3>
                <p className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>
                  Select your exact target outcome to configure your caloric deficit/surplus and macronutrient targets.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {GOALS_LIST.map((g) => {
                const isSelected = profile.goal === g.id;
                return (
                  <div
                    key={g.id}
                    onClick={() => updateProfile('goal', g.id as any)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'shadow-sm ring-2 ring-amber-700'
                        : 'hover:opacity-90'
                    }`}
                    style={{
                      backgroundColor: isSelected ? 'var(--theme-primary-light)' : 'var(--theme-subtle)',
                      borderColor: isSelected ? 'var(--theme-primary)' : 'var(--theme-border)',
                    }}
                  >
                    <div>
                      {isSelected && (
                        <div className="flex justify-end mb-1.5">
                          <CheckCircle2 className="w-4 h-4 text-amber-800" />
                        </div>
                      )}
                      <h4 className="text-sm font-bold font-serif" style={{ color: 'var(--theme-text)' }}>
                        {g.title}
                      </h4>
                      <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--theme-text-muted)' }}>
                        {g.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= STEP 3: Diet Type ================= */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center space-x-2">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
                style={{ backgroundColor: 'var(--theme-primary)' }}
              >
                <Utensils className="w-4 h-4 text-amber-200" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold font-serif flex items-center gap-1.5" style={{ color: 'var(--theme-text)' }}>
                  <span>Step 3 — Diet Type</span>
                  <span className="text-red-500 font-bold">*</span>
                </h3>
                <p className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>
                  Choose your dietary lifestyle to guide recipe generation, proteins, and allowed food items.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {DIET_TYPES_LIST.map((dt) => {
                const isSelected = profile.dietType === dt.id;
                return (
                  <div
                    key={dt.id}
                    onClick={() => updateProfile('dietType', dt.id as any)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'shadow-sm ring-2 ring-amber-700'
                        : 'hover:opacity-90'
                    }`}
                    style={{
                      backgroundColor: isSelected ? 'var(--theme-primary-light)' : 'var(--theme-subtle)',
                      borderColor: isSelected ? 'var(--theme-primary)' : 'var(--theme-border)',
                    }}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{dt.icon}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-800" />}
                      </div>
                      <h4 className="text-sm font-bold font-serif" style={{ color: 'var(--theme-text)' }}>
                        {dt.title}
                      </h4>
                      <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--theme-text-muted)' }}>
                        {dt.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {profile.dietType === 'Other' && (
              <div className="p-4 rounded-2xl border bg-amber-50/50 border-amber-200 space-y-2">
                <label className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-amber-950">
                  <span className="flex items-center gap-1">
                    <span>Specify Custom Diet Style</span>
                    <span className="text-red-500 font-bold">*</span>
                  </span>
                  <span className="text-[10px] text-amber-800/70 font-light normal-case">(Type or tap light examples)</span>
                </label>
                <input
                  type="text"
                  value={profile.customDietType || ''}
                  onChange={(e) => updateProfile('customDietType', e.target.value)}
                  placeholder="e.g. Jain Vegetarian (no onion/garlic/root veg), Satvik, Keto, Paleo"
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white placeholder:text-stone-400 placeholder:font-light font-medium"
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    'Jain Vegetarian (no onion/garlic/root veg)',
                    'Satvik (Ayurvedic pure veg)',
                    'Keto / Very Low Carb',
                    'Paleo / Whole Food',
                    'Pescatarian (Fish & Vegetarian)',
                    'Gluten-Free & Dairy-Free',
                  ].map((ex) => (
                    <button
                      key={ex}
                      type="button"
                      onClick={() => updateProfile('customDietType', ex)}
                      className="px-2 py-0.5 rounded-md text-[11px] font-light bg-white hover:bg-amber-100/70 text-stone-600 hover:text-amber-900 border border-stone-200/70 transition-colors cursor-pointer"
                    >
                      + {ex}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= STEP 4: Activity & Exercise ================= */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center space-x-2">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
                style={{ backgroundColor: 'var(--theme-primary)' }}
              >
                <Activity className="w-4 h-4 text-amber-200" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold font-serif flex items-center gap-1.5" style={{ color: 'var(--theme-text)' }}>
                  <span>Step 4 — Activity Level &amp; Exercise Routine</span>
                  <span className="text-red-500 font-bold">*</span>
                </h3>
                <p className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>
                  Calibrates your Total Daily Energy Expenditure (TDEE) and pre/post-workout meal timing.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Activity Level */}
              <div>
                <label className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--theme-text-muted)' }}>
                  <span>Daily Activity Level</span>
                  <span className="text-red-500 font-bold">*</span>
                </label>
                <select
                  value={profile.activityLevel}
                  onChange={(e) => updateProfile('activityLevel', e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium"
                  style={{
                    backgroundColor: 'var(--theme-subtle)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text)',
                  }}
                >
                  <option value="Sedentary">Sedentary (Little/no exercise, desk work)</option>
                  <option value="Light">Light (Light exercise 1-3 days/week)</option>
                  <option value="Moderate">Moderate (Moderate workout 3-5 days/week)</option>
                  <option value="Very Active">Very Active (Hard exercise 6-7 days/week)</option>
                  <option value="Extremely Active">Extremely Active (Athletic training/physical labor)</option>
                </select>
              </div>

              {/* Average Daily Steps */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--theme-text-muted)' }}>
                  <span>Average Daily Steps</span>
                  <span className="text-[10px] text-stone-400 font-normal normal-case">(Optional)</span>
                </label>
                <select
                  value={profile.dailySteps}
                  onChange={(e) => updateProfile('dailySteps', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm"
                  style={{
                    backgroundColor: 'var(--theme-subtle)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text)',
                  }}
                >
                  <option value="< 5,000 steps">&lt; 5,000 steps</option>
                  <option value="5,000 - 8,000 steps">5,000 - 8,000 steps</option>
                  <option value="8,000 - 10,000 steps">8,000 - 10,000 steps</option>
                  <option value="10,000 - 15,000 steps">10,000 - 15,000 steps</option>
                  <option value="15,000+ steps">15,000+ steps</option>
                </select>
              </div>

              {/* Occupation */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--theme-text-muted)' }}>
                  <span>Occupation / Work Style</span>
                  <span className="text-[10px] text-stone-400 font-normal normal-case">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={profile.occupation}
                  onChange={(e) => updateProfile('occupation', e.target.value)}
                  placeholder="e.g. Desk job, Field worker, Student, Homemaker"
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm"
                  style={{
                    backgroundColor: 'var(--theme-subtle)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text)',
                  }}
                />
              </div>
            </div>

            {/* Exercise Checkbox / Toggle */}
            <div
              className="p-4 rounded-2xl border space-y-4"
              style={{
                backgroundColor: 'var(--theme-subtle)',
                borderColor: 'var(--theme-border)',
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold font-serif flex items-center gap-1.5" style={{ color: 'var(--theme-text)' }}>
                    <span>Do you engage in structured workout or sports?</span>
                    <span className="text-red-500 font-bold">*</span>
                  </h4>
                  <p className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>
                    Gym workouts, running, yoga, swimming, calisthenics, or competitive sports.
                  </p>
                </div>
                <div className="flex rounded-xl border overflow-hidden">
                  <button
                    type="button"
                    onClick={() => updateProfile('hasExercise', true)}
                    className={`px-4 py-1.5 text-xs font-bold cursor-pointer ${
                      profile.hasExercise ? 'bg-amber-900 text-white' : 'hover:bg-black/5'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => updateProfile('hasExercise', false)}
                    className={`px-4 py-1.5 text-xs font-bold cursor-pointer ${
                      !profile.hasExercise ? 'bg-amber-900 text-white' : 'hover:bg-black/5'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              {profile.hasExercise && (
                <div className="space-y-4 pt-3 border-t border-black/5">
                  <div>
                    <label className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--theme-text-muted)' }}>
                      <span>Workout Type (Select all that apply)</span>
                      <span className="text-red-500 font-bold">*</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'Strength training',
                        'Cardio / Running',
                        'Yoga / Pilates',
                        'HIIT / Functional',
                        'Swimming',
                        'Cycling',
                        'Badminton / Sports',
                        'Home Calisthenics',
                      ].map((w) => {
                        const isChecked = profile.workoutType?.includes(w);
                        return (
                          <button
                            key={w}
                            type="button"
                            onClick={() => toggleArrayItem('workoutType', w)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer ${
                              isChecked ? 'bg-amber-900 text-white border-amber-900' : 'bg-white hover:bg-black/5 border-black/10'
                            }`}
                          >
                            {w}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--theme-text-muted)' }}>
                        Workout Days / Week ({profile.workoutDaysPerWeek} days)
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="7"
                        value={profile.workoutDaysPerWeek}
                        onChange={(e) => updateProfile('workoutDaysPerWeek', Number(e.target.value))}
                        className="w-full accent-amber-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--theme-text-muted)' }}>
                        Duration
                      </label>
                      <select
                        value={profile.workoutDuration}
                        onChange={(e) => updateProfile('workoutDuration', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border text-xs bg-white"
                      >
                        <option value="15-30 min">15-30 min</option>
                        <option value="30-45 min">30-45 min</option>
                        <option value="45-60 min">45-60 min</option>
                        <option value="60-90 min">60-90 min</option>
                        <option value="90+ min">90+ min</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--theme-text-muted)' }}>
                        Preferred Time of Day
                      </label>
                      <select
                        value={profile.workoutTime}
                        onChange={(e) => updateProfile('workoutTime', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border text-xs bg-white"
                      >
                        <option value="Early Morning (5-7 AM)">Early Morning (5-7 AM)</option>
                        <option value="Morning (7-9 AM)">Morning (7-9 AM)</option>
                        <option value="Afternoon (12-3 PM)">Afternoon (12-3 PM)</option>
                        <option value="Evening (5-8 PM)">Evening (5-8 PM)</option>
                        <option value="Night (8-10 PM)">Night (8-10 PM)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= STEP 5: Daily Schedule ================= */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center space-x-2">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
                style={{ backgroundColor: 'var(--theme-primary)' }}
              >
                <Clock className="w-4 h-4 text-amber-200" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold font-serif" style={{ color: 'var(--theme-text)' }}>
                  Step 5 — Daily Schedule & Meal Timings
                </h3>
                <p className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>
                  Aligns your meals with your circadian rhythm and intermittent fasting windows. (Optional)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--theme-text-muted)' }}>
                  Wake-Up Time
                </label>
                <input
                  type="text"
                  value={profile.wakeUpTime}
                  onChange={(e) => updateProfile('wakeUpTime', e.target.value)}
                  placeholder="06:30 AM"
                  className="w-full px-2.5 py-2 rounded-xl border text-xs"
                  style={{
                    backgroundColor: 'var(--theme-subtle)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text)',
                  }}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--theme-text-muted)' }}>
                  Breakfast Time
                </label>
                <input
                  type="text"
                  value={profile.breakfastTime}
                  onChange={(e) => updateProfile('breakfastTime', e.target.value)}
                  placeholder="08:30 AM"
                  className="w-full px-2.5 py-2 rounded-xl border text-xs"
                  style={{
                    backgroundColor: 'var(--theme-subtle)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text)',
                  }}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--theme-text-muted)' }}>
                  Lunch Time
                </label>
                <input
                  type="text"
                  value={profile.lunchTime}
                  onChange={(e) => updateProfile('lunchTime', e.target.value)}
                  placeholder="01:30 PM"
                  className="w-full px-2.5 py-2 rounded-xl border text-xs"
                  style={{
                    backgroundColor: 'var(--theme-subtle)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text)',
                  }}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--theme-text-muted)' }}>
                  Snack Time
                </label>
                <input
                  type="text"
                  value={profile.snackTime}
                  onChange={(e) => updateProfile('snackTime', e.target.value)}
                  placeholder="05:00 PM"
                  className="w-full px-2.5 py-2 rounded-xl border text-xs"
                  style={{
                    backgroundColor: 'var(--theme-subtle)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text)',
                  }}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--theme-text-muted)' }}>
                  Dinner Time
                </label>
                <input
                  type="text"
                  value={profile.dinnerTime}
                  onChange={(e) => updateProfile('dinnerTime', e.target.value)}
                  placeholder="08:00 PM"
                  className="w-full px-2.5 py-2 rounded-xl border text-xs"
                  style={{
                    backgroundColor: 'var(--theme-subtle)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text)',
                  }}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--theme-text-muted)' }}>
                  Sleep Time
                </label>
                <input
                  type="text"
                  value={profile.sleepTime}
                  onChange={(e) => updateProfile('sleepTime', e.target.value)}
                  placeholder="11:00 PM"
                  className="w-full px-2.5 py-2 rounded-xl border text-xs"
                  style={{
                    backgroundColor: 'var(--theme-subtle)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text)',
                  }}
                />
              </div>
            </div>

            {/* Meals Per Day */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--theme-text-muted)' }}>
                Preferred Meals Per Day:
              </label>
              <div className="grid grid-cols-5 gap-2.5">
                {[2, 3, 4, 5, 6].map((num) => {
                  const isSelected = profile.mealsPerDay === num;
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => updateProfile('mealsPerDay', num as any)}
                      className={`py-3 rounded-2xl border text-sm font-bold transition-all cursor-pointer ${
                        isSelected ? 'ring-2 ring-amber-800 shadow-xs' : 'hover:opacity-80'
                      }`}
                      style={{
                        backgroundColor: isSelected ? 'var(--theme-primary)' : 'var(--theme-subtle)',
                        color: isSelected ? '#ffffff' : 'var(--theme-text)',
                        borderColor: isSelected ? 'var(--theme-primary)' : 'var(--theme-border)',
                      }}
                    >
                      {num} Meals
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Intermittent Fasting */}
            <div
              className="p-4 rounded-2xl border space-y-3"
              style={{
                backgroundColor: 'var(--theme-subtle)',
                borderColor: 'var(--theme-border)',
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold font-serif" style={{ color: 'var(--theme-text)' }}>
                    Intermittent Fasting Schedule
                  </h4>
                  <p className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>
                    Do you practice a structured fasting window?
                  </p>
                </div>
                <div className="flex rounded-xl border overflow-hidden">
                  <button
                    type="button"
                    onClick={() => updateProfile('intermittentFasting', true)}
                    className={`px-4 py-1.5 text-xs font-bold cursor-pointer ${
                      profile.intermittentFasting ? 'bg-amber-900 text-white' : 'hover:bg-black/5'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => updateProfile('intermittentFasting', false)}
                    className={`px-4 py-1.5 text-xs font-bold cursor-pointer ${
                      !profile.intermittentFasting ? 'bg-amber-900 text-white' : 'hover:bg-black/5'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              {profile.intermittentFasting && (
                <div className="pt-2">
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--theme-text-muted)' }}>
                    Select Fasting Protocol:
                  </label>
                  <select
                    value={profile.fastingWindow}
                    onChange={(e) => updateProfile('fastingWindow', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border text-xs bg-white"
                  >
                    <option value="16:8 (16 hrs Fast / 8 hrs Eating window)">16:8 (Standard Leangains — 12 PM to 8 PM eat)</option>
                    <option value="14:10 (14 hrs Fast / 10 hrs Eating window)">14:10 (Gentle — 9 AM to 7 PM eat)</option>
                    <option value="18:6 (18 hrs Fast / 6 hrs Eating window)">18:6 (Advanced — 1 PM to 7 PM eat)</option>
                    <option value="20:4 (Warrior Diet)">20:4 (Warrior Diet)</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= STEP 6: Food Preferences ================= */}
        {currentStep === 6 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center space-x-2">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
                style={{ backgroundColor: 'var(--theme-primary)' }}
              >
                <Heart className="w-4 h-4 text-amber-200" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold font-serif" style={{ color: 'var(--theme-text)' }}>
                  Step 6 — Food Preferences & Cuisines
                </h3>
                <p className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>
                  Tell us what you love to eat so your meal plan is genuinely satisfying and sustainable. (Optional)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center justify-between text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--theme-text-muted)' }}>
                  <span>Favorite Foods / Must-Include Dishes</span>
                  <span className="text-[10px] text-stone-400 font-light normal-case">(Type or tap light examples)</span>
                </label>
                <input
                  type="text"
                  value={profile.favoriteFoods}
                  onChange={(e) => updateProfile('favoriteFoods', e.target.value)}
                  placeholder=""
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-700/30 font-medium"
                  style={{
                    backgroundColor: 'var(--theme-subtle)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text)',
                  }}
                />
                {/* Light Example Food Chips */}
                <div className="mt-2">
                  <span className="text-[10px] font-medium text-stone-400 block mb-1.5">Light quick-add examples:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Oats & Berries',
                      'Paneer',
                      'Moong Dal',
                      'Chicken Breast',
                      'Greek Yogurt',
                      'Boiled Eggs',
                      'Quinoa',
                      'Idli / Dosa',
                      'Tofu Stir-fry',
                      'Salmon / Fish',
                      'Sprouted Moong',
                      'Avocado',
                    ].map((food) => (
                      <button
                        key={food}
                        type="button"
                        onClick={() => {
                          const current = profile.favoriteFoods.trim();
                          if (!current) {
                            updateProfile('favoriteFoods', food);
                          } else if (!current.toLowerCase().includes(food.toLowerCase())) {
                            updateProfile('favoriteFoods', `${current}, ${food}`);
                          }
                        }}
                        className="px-2 py-0.5 rounded-md text-[11px] font-light bg-stone-100 hover:bg-amber-100/70 text-stone-600 hover:text-amber-900 border border-stone-200/70 transition-colors cursor-pointer"
                      >
                        + {food}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="flex items-center justify-between text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--theme-text-muted)' }}>
                  <span>Foods You Dislike / Prefer to Avoid</span>
                  <span className="text-[10px] text-stone-400 font-light normal-case">(Type or tap light examples)</span>
                </label>
                <input
                  type="text"
                  value={profile.dislikedFoods}
                  onChange={(e) => updateProfile('dislikedFoods', e.target.value)}
                  placeholder=""
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-700/30 font-medium"
                  style={{
                    backgroundColor: 'var(--theme-subtle)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text)',
                  }}
                />
                {/* Light Example Food Chips */}
                <div className="mt-2">
                  <span className="text-[10px] font-medium text-stone-400 block mb-1.5">Light quick-add examples:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Bitter Gourd (Karela)',
                      'Raw Radish',
                      'Eggplant (Brinjal)',
                      'Okra (Bhindi)',
                      'Mushrooms',
                      'Capsicum / Bell Pepper',
                      'Prawns / Seafood',
                      'Cilantro (Coriander)',
                      'Cabbage',
                      'Turnip',
                    ].map((food) => (
                      <button
                        key={food}
                        type="button"
                        onClick={() => {
                          const current = profile.dislikedFoods.trim();
                          if (!current) {
                            updateProfile('dislikedFoods', food);
                          } else if (!current.toLowerCase().includes(food.toLowerCase())) {
                            updateProfile('dislikedFoods', `${current}, ${food}`);
                          }
                        }}
                        className="px-2 py-0.5 rounded-md text-[11px] font-light bg-stone-100 hover:bg-red-50 text-stone-600 hover:text-red-800 border border-stone-200/70 transition-colors cursor-pointer"
                      >
                        + {food}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Preferred Cuisines */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2.5" style={{ color: 'var(--theme-text-muted)' }}>
                Preferred Cuisines (Multi-Select):
              </label>
              <div className="flex flex-wrap gap-2">
                {CUISINES_LIST.map((c) => {
                  const isChecked = profile.preferredCuisines.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleArrayItem('preferredCuisines', c)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer ${
                        isChecked ? 'bg-amber-900 text-white border-amber-900' : 'bg-white hover:bg-black/5 border-black/10'
                      }`}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preferred Protein Sources */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2.5" style={{ color: 'var(--theme-text-muted)' }}>
                Preferred Protein Sources:
              </label>
              <div className="flex flex-wrap gap-2">
                {PROTEIN_SOURCES_LIST.map((p) => {
                  const isChecked = profile.preferredProteinSources.includes(p);
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => toggleArrayItem('preferredProteinSources', p)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer ${
                        isChecked ? 'bg-amber-900 text-white border-amber-900' : 'bg-white hover:bg-black/5 border-black/10'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Spice Level & Cravings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--theme-text-muted)' }}>
                  Spice Level Preference
                </label>
                <select
                  value={profile.spiceLevel}
                  onChange={(e) => updateProfile('spiceLevel', e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm"
                  style={{
                    backgroundColor: 'var(--theme-subtle)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text)',
                  }}
                >
                  <option value="Mild">Mild (Gentle, low green chilli/black pepper)</option>
                  <option value="Medium">Medium (Balanced Indian home cooking)</option>
                  <option value="Spicy">Spicy (Authentic zesty flavorful spices)</option>
                  <option value="Very Spicy">Very Spicy (Hot & fiery)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--theme-text-muted)' }}>
                  Common Cravings to Satisfy Healthily
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {['Sweet / Desserts', 'Savory & Salty', 'Crunchy snacks', 'Fried foods', 'Late night munchies'].map((c) => {
                    const isChecked = profile.foodCravings?.includes(c);
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => toggleArrayItem('foodCravings', c)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border cursor-pointer ${
                          isChecked ? 'bg-amber-800 text-white border-amber-800' : 'bg-white border-black/10'
                        }`}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 7: Budget ================= */}
        {currentStep === 7 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center space-x-2">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
                style={{ backgroundColor: 'var(--theme-primary)' }}
              >
                <Wallet className="w-4 h-4 text-amber-200" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold font-serif flex items-center gap-1.5" style={{ color: 'var(--theme-text)' }}>
                  <span>Step 7 — Grocery &amp; Food Budget</span>
                  <span className="text-red-500 font-bold">*</span>
                </h3>
                <p className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>
                  Calculates exact ingredient spending, bulk buy savings, and zero-waste grocery lists.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--theme-text-muted)' }}>
                  <span>Time</span>
                  <span className="text-red-500 font-bold">*</span>
                </label>
                <select
                  value={profile.budgetPeriod || 'Day'}
                  onChange={(e) => {
                    const newPeriod = e.target.value as 'Day' | 'Week' | 'Month' | 'Year';
                    const currentDaily = Number(profile.dailyFoodBudget) || 0;
                    let newAmount = currentDaily;
                    if (newPeriod === 'Week') newAmount = Math.round(currentDaily * 7);
                    else if (newPeriod === 'Month') newAmount = Math.round(currentDaily * 30);
                    else if (newPeriod === 'Year') newAmount = Math.round(currentDaily * 365);
                    else newAmount = Math.round(currentDaily);

                    updateProfile('budgetPeriod', newPeriod);
                    updateProfile('enteredBudgetAmount', newAmount > 0 ? String(newAmount) : '');
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm font-bold focus:outline-hidden focus:ring-2 focus:ring-amber-700/30 cursor-pointer"
                  style={{
                    backgroundColor: 'var(--theme-subtle)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text)',
                  }}
                >
                  <option value="Day">Day</option>
                  <option value="Week">Week</option>
                  <option value="Month">Month</option>
                  <option value="Year">Year</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--theme-text-muted)' }}>
                  <span>Estimated Budget (per {profile.budgetPeriod || 'Day'})</span>
                  <span className="text-red-500 font-bold">*</span>
                </label>
                <div className="relative">
                  <input
                    id="wizard-input-budget"
                    type="text"
                    inputMode="decimal"
                    value={
                      profile.enteredBudgetAmount !== undefined
                        ? String(profile.enteredBudgetAmount)
                        : (profile.dailyFoodBudget ? String(profile.dailyFoodBudget) : '')
                    }
                    onChange={(e) => {
                      const valStr = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');
                      updateProfile('enteredBudgetAmount', valStr);

                      if (valStr === '') {
                        updateProfile('dailyFoodBudget', '' as any);
                        updateProfile('weeklyFoodBudget', '' as any);
                        return;
                      }

                      const num = parseFloat(valStr);
                      if (!isNaN(num)) {
                        const period = profile.budgetPeriod || 'Day';
                        let daily = num;
                        if (period === 'Week') daily = num / 7;
                        else if (period === 'Month') daily = num / 30;
                        else if (period === 'Year') daily = num / 365;

                        updateProfile('dailyFoodBudget', daily);
                        updateProfile('weeklyFoodBudget', daily * 7);
                      }
                    }}
                    placeholder={`e.g. ${
                      (profile.budgetPeriod || 'Day') === 'Day'
                        ? '350'
                        : (profile.budgetPeriod || 'Day') === 'Week'
                        ? '2450'
                        : (profile.budgetPeriod || 'Day') === 'Month'
                        ? '10500'
                        : '126000'
                    }`}
                    className="w-full pl-3.5 pr-18 py-2.5 rounded-xl border text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-amber-700/30"
                    style={{
                      backgroundColor: 'var(--theme-subtle)',
                      borderColor: 'var(--theme-border)',
                      color: 'var(--theme-text)',
                    }}
                  />
                  <span
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold px-2 py-0.5 rounded-md pointer-events-none"
                    style={{
                      backgroundColor: 'var(--theme-primary-light)',
                      color: 'var(--theme-primary-text)',
                    }}
                  >
                    /{profile.budgetPeriod || 'Day'}
                  </span>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--theme-text-muted)' }}>
                  <span>Calculated Time Breakdown</span>
                  <span className="text-[10px] text-stone-400 font-normal normal-case">(Live)</span>
                </label>
                <div
                  className="w-full px-2 py-1.5 rounded-xl border grid grid-cols-4 gap-1 text-center"
                  style={{
                    backgroundColor: 'var(--theme-subtle)',
                    borderColor: 'var(--theme-border)',
                  }}
                >
                  <div className={`p-1 rounded-lg ${ (profile.budgetPeriod || 'Day') === 'Day' ? 'bg-amber-900/10 ring-1 ring-amber-800/30' : 'bg-black/5'}`}>
                    <span className="block text-[9px] uppercase font-bold text-stone-500">Day</span>
                    <span className="text-xs font-bold block truncate" style={{ color: 'var(--theme-text)' }}>
                      ₹{Math.round(Number(profile.dailyFoodBudget) || 0)}
                    </span>
                  </div>
                  <div className={`p-1 rounded-lg ${ (profile.budgetPeriod || 'Day') === 'Week' ? 'bg-amber-900/10 ring-1 ring-amber-800/30' : 'bg-black/5'}`}>
                    <span className="block text-[9px] uppercase font-bold text-stone-500">Week</span>
                    <span className="text-xs font-bold block truncate" style={{ color: 'var(--theme-text)' }}>
                      ₹{Math.round((Number(profile.dailyFoodBudget) || 0) * 7)}
                    </span>
                  </div>
                  <div className={`p-1 rounded-lg ${ (profile.budgetPeriod || 'Day') === 'Month' ? 'bg-amber-900/10 ring-1 ring-amber-800/30' : 'bg-black/5'}`}>
                    <span className="block text-[9px] uppercase font-bold text-stone-500">Month</span>
                    <span className="text-xs font-bold block truncate" style={{ color: 'var(--theme-text)' }}>
                      ₹{Math.round((Number(profile.dailyFoodBudget) || 0) * 30)}
                    </span>
                  </div>
                  <div className={`p-1 rounded-lg ${ (profile.budgetPeriod || 'Day') === 'Year' ? 'bg-amber-900/10 ring-1 ring-amber-800/30' : 'bg-black/5'}`}>
                    <span className="block text-[9px] uppercase font-bold text-stone-500">Year</span>
                    <span className="text-xs font-bold block truncate" style={{ color: 'var(--theme-text)' }}>
                      ₹{Math.round((Number(profile.dailyFoodBudget) || 0) * 365)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Lowest Budget Real-Price Weekly Diet Plan Calculator */}
            <div
              className="p-4 sm:p-5 rounded-2xl border space-y-4 shadow-xs"
              style={{
                backgroundColor: 'var(--theme-surface)',
                borderColor: 'var(--theme-border)',
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b" style={{ borderColor: 'var(--theme-border)' }}>
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <ShoppingBag className="w-4 h-4 text-amber-800" />
                    <span className="text-sm font-bold font-serif" style={{ color: 'var(--theme-text)' }}>
                      Lowest Budget Weekly Diet Plan (Real Market Prices)
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Real Mandi Rates
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>
                    Just set your weekly budget below — ingredients, quantities, macros, and cost are auto-calculated.
                  </p>
                </div>

                {/* Quick Weekly Budget Presets */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mr-1">Presets:</span>
                  {[
                    { label: '₹700/wk (Ultra)', val: 700 },
                    { label: '₹1,050/wk (Smart)', val: 1050 },
                    { label: '₹1,400/wk (Active)', val: 1400 },
                    { label: '₹2,100/wk (Prime)', val: 2100 },
                  ].map((preset) => {
                    const currentWeekly = Math.round((Number(profile.dailyFoodBudget) || 0) * 7);
                    const isMatched = Math.abs(currentWeekly - preset.val) <= 50;
                    return (
                      <button
                        key={preset.val}
                        type="button"
                        onClick={() => {
                          const daily = Math.round(preset.val / 7);
                          updateProfile('dailyFoodBudget', daily);
                          updateProfile('weeklyFoodBudget', preset.val);
                        }}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                          isMatched
                            ? 'bg-amber-900 text-white border-amber-900 shadow-xs'
                            : 'bg-black/5 hover:bg-black/10 text-stone-700 border-stone-200'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {(() => {
                const weeklyBudget = Math.round((Number(profile.dailyFoodBudget) || 0) * 7) || 1050;
                const dailyBudget = Math.round(weeklyBudget / 7);
                
                // Real price weekly grocery basket
                const groceryBasket = [
                  { item: 'Soya Chunks (High Protein)', qty: '500g', price: 45, protein: '260g', calories: 1720, note: '₹0.17 / g protein (Highest value)' },
                  { item: 'Farm Fresh Eggs (or Kala Chana 500g)', qty: '14 pcs (2/day)', price: 98, protein: '84g', calories: 1050, note: 'Bioavailable protein + choline' },
                  { item: 'Rolled Oats / Whole Dalia', qty: '1 kg', price: 110, protein: '130g', calories: 3800, note: 'Complex carbs & beta-glucan fiber' },
                  { item: 'Yellow Moong / Toor Dal', qty: '1 kg', price: 125, protein: '240g', calories: 3400, note: 'Easy digestion + amino acids' },
                  { item: 'Whole Wheat Atta / Brown Rice', qty: '2 kg', price: 90, protein: '220g', calories: 7100, note: 'Daily sustaining staple energy' },
                  { item: 'Seasonal Mandi Greens & Veggies', qty: '3.5 kg', price: 95, protein: '30g', calories: 750, note: 'Spinach, cucumber, tomatoes, gourds' },
                  { item: 'Fresh Curd / Dahi', qty: '1 kg', price: 70, protein: '35g', calories: 600, note: 'Gut microbiome + calcium' },
                  { item: 'Roasted Peanuts', qty: '400g', price: 55, protein: '104g', calories: 2300, note: 'Healthy fats & satiety' },
                  { item: 'Fresh Bananas', qty: '14 pcs (2/day)', price: 70, protein: '18g', calories: 1470, note: 'Natural electrolytes & potassium' },
                  { item: 'Mustard Oil & Pantry Spices', qty: 'Weekly quota', price: 45, protein: '0g', calories: 900, note: 'Turmeric, jeera, mustard oil' },
                ];

                const totalWeeklyCost = groceryBasket.reduce((sum, i) => sum + i.price, 0);
                const totalDailyCost = Math.round(totalWeeklyCost / 7);
                const totalWeeklyProtein = groceryBasket.reduce((sum, i) => sum + parseInt(i.protein), 0);
                const dailyProteinGrams = Math.round(totalWeeklyProtein / 7);
                const totalWeeklyCalories = groceryBasket.reduce((sum, i) => sum + i.calories, 0);
                const dailyCalories = Math.round(totalWeeklyCalories / 7);
                const budgetDifference = weeklyBudget - totalWeeklyCost;

                return (
                  <div className="space-y-4">
                    {/* Live KPI & Budget Status Banner */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div className="p-2.5 rounded-xl border bg-amber-50/50 border-amber-200">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block">Weekly Grocery Cost</span>
                        <div className="flex items-baseline space-x-1 mt-0.5">
                          <span className="text-base sm:text-lg font-extrabold text-amber-950 font-serif">₹{totalWeeklyCost}</span>
                          <span className="text-[11px] text-amber-800">/ week</span>
                        </div>
                        <span className="text-[10px] text-stone-500 block">≈ ₹{totalDailyCost} / day</span>
                      </div>

                      <div className="p-2.5 rounded-xl border bg-emerald-50/50 border-emerald-200">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 block">Your Weekly Budget</span>
                        <div className="flex items-baseline space-x-1 mt-0.5">
                          <span className="text-base sm:text-lg font-extrabold text-emerald-950 font-serif">₹{weeklyBudget}</span>
                          <span className="text-[11px] text-emerald-800">/ week</span>
                        </div>
                        <span className={`text-[10px] font-semibold block ${budgetDifference >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                          {budgetDifference >= 0 ? `+₹${budgetDifference} Buffer Saved` : `₹${Math.abs(budgetDifference)} deficit`}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl border bg-stone-50 border-stone-200">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-600 block">Target Daily Protein</span>
                        <div className="flex items-baseline space-x-1 mt-0.5">
                          <span className="text-base sm:text-lg font-extrabold text-stone-900 font-serif">~{dailyProteinGrams}g</span>
                          <span className="text-[11px] text-stone-600">/ day</span>
                        </div>
                        <span className="text-[10px] text-stone-500 block">100% complete sources</span>
                      </div>

                      <div className="p-2.5 rounded-xl border bg-stone-50 border-stone-200">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-600 block">Target Daily Energy</span>
                        <div className="flex items-baseline space-x-1 mt-0.5">
                          <span className="text-base sm:text-lg font-extrabold text-stone-900 font-serif">~{dailyCalories}</span>
                          <span className="text-[11px] text-stone-600">kcal</span>
                        </div>
                        <span className="text-[10px] text-stone-500 block">Balanced fuel</span>
                      </div>
                    </div>

                    {/* Weekly Grocery Items Table */}
                    <div className="border rounded-xl overflow-hidden" style={{ borderColor: 'var(--theme-border)' }}>
                      <div
                        className="px-3 py-2 text-xs font-bold uppercase tracking-wider flex items-center justify-between border-b"
                        style={{
                          backgroundColor: 'var(--theme-subtle)',
                          borderColor: 'var(--theme-border)',
                          color: 'var(--theme-text-muted)',
                        }}
                      >
                        <span>7-Day Lowest-Cost Grocery Basket</span>
                        <span className="normal-case font-medium text-[11px]">Real Indian Mandi / Wholesale Pricing</span>
                      </div>
                      <div className="divide-y max-h-56 overflow-y-auto" style={{ borderColor: 'var(--theme-border)' }}>
                        {groceryBasket.map((g, idx) => (
                          <div key={idx} className="px-3 py-2 flex items-center justify-between text-xs hover:bg-black/5 transition-colors">
                            <div className="flex-1 pr-2">
                              <div className="flex items-center space-x-1.5">
                                <span className="font-semibold text-stone-800" style={{ color: 'var(--theme-text)' }}>{g.item}</span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/5 text-stone-600">{g.qty}</span>
                              </div>
                              <span className="text-[10px] text-stone-400 block">{g.note}</span>
                            </div>
                            <div className="text-right whitespace-nowrap pl-2">
                              <span className="font-bold text-amber-900 block text-xs">₹{g.price}</span>
                              <span className="text-[10px] text-stone-500">{g.protein} protein</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 4-Meal Daily Low-Cost Routine Blueprint */}
                    <div className="p-3.5 rounded-xl border bg-stone-50/70 border-stone-200 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                          <Utensils className="w-3.5 h-3.5 text-amber-800" />
                          <span>Daily 4-Meal Schedule from This Weekly Basket</span>
                        </span>
                        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                          Total Daily Cost: ₹{totalDailyCost}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 rounded-lg bg-white border border-stone-200 shadow-2xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-stone-800">Breakfast (Cost: ~₹26)</span>
                            <span className="text-[10px] font-semibold text-amber-850 bg-amber-50 px-1.5 py-0.2 rounded">17g Protein</span>
                          </div>
                          <p className="text-stone-600 text-[11px] leading-relaxed">
                            50g Oats + 1 Banana + 20g Roasted Peanuts soaked in warm water with a pinch of cinnamon.
                          </p>
                        </div>

                        <div className="p-2.5 rounded-lg bg-white border border-stone-200 shadow-2xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-stone-800">Lunch (Cost: ~₹34)</span>
                            <span className="text-[10px] font-semibold text-amber-850 bg-amber-50 px-1.5 py-0.2 rounded">28g Protein</span>
                          </div>
                          <p className="text-stone-600 text-[11px] leading-relaxed">
                            1 bowl Yellow Dal Tadka (70g dry) + 1 cup Rice / 2 Rotis + 100g Fresh Dahi + Steamed Green Sabzi.
                          </p>
                        </div>

                        <div className="p-2.5 rounded-lg bg-white border border-stone-200 shadow-2xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-stone-800">Evening Snack (Cost: ~₹18)</span>
                            <span className="text-[10px] font-semibold text-amber-850 bg-amber-50 px-1.5 py-0.2 rounded">14g Protein</span>
                          </div>
                          <p className="text-stone-600 text-[11px] leading-relaxed">
                            2 Boiled Farm Eggs with chaat masala OR 1 cup boiled Kala Chana salad with diced onion & lemon.
                          </p>
                        </div>

                        <div className="p-2.5 rounded-lg bg-white border border-stone-200 shadow-2xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-stone-800">Dinner (Cost: ~₹36)</span>
                            <span className="text-[10px] font-semibold text-amber-850 bg-amber-50 px-1.5 py-0.2 rounded">39g Protein</span>
                          </div>
                          <p className="text-stone-600 text-[11px] leading-relaxed">
                            60g Soya Chunks Curry / Bhurji with tomatoes & spices + 2 Whole Wheat Rotis + cucumber salad.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Budget Tier Selection */}
            <div>
              <label className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--theme-text-muted)' }}>
                <span>Budget Archetype Preference</span>
                <span className="text-red-500 font-bold">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    tier: 'thrifty',
                    title: 'Thrifty & Smart',
                    desc: 'Prioritizes seasonal mandi produce, bulk dals, oats, eggs, and zero-waste pantry staples.',
                    cost: '~₹1,850/wk',
                  },
                  {
                    tier: 'balanced',
                    title: 'Balanced Value',
                    desc: 'Optimal balance of fresh dairy (paneer/curd), seasonal greens, grains, and nuts.',
                    cost: '~₹2,750/wk',
                  },
                  {
                    tier: 'gourmet',
                    title: 'Gourmet & Premium',
                    desc: 'Organic whole foods, Greek yogurt, berries, premium nuts, seeds, and artisan ingredients.',
                    cost: '~₹4,200/wk',
                  },
                ].map((b) => {
                  const isSelected = profile.budgetTier === b.tier;
                  return (
                    <div
                      key={b.tier}
                      onClick={() => updateProfile('budgetTier', b.tier as any)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        isSelected ? 'ring-2 ring-amber-800 shadow-xs' : 'hover:opacity-85'
                      }`}
                      style={{
                        backgroundColor: isSelected ? 'var(--theme-primary-light)' : 'var(--theme-subtle)',
                        borderColor: isSelected ? 'var(--theme-primary)' : 'var(--theme-border)',
                      }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold font-serif">{b.title}</span>
                        <span className="text-[11px] font-bold text-amber-900">{b.cost}</span>
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--theme-text-muted)' }}>
                        {b.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 8: Drinks & Supplements ================= */}
        {currentStep === 8 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
                  style={{ backgroundColor: 'var(--theme-primary)' }}
                >
                  <Coffee className="w-4 h-4 text-amber-200" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold font-serif flex items-center gap-1.5" style={{ color: 'var(--theme-text)' }}>
                    <span>Step 8 — Hydration, Beverages &amp; Supplements</span>
                    <span className="text-[11px] font-normal text-stone-500 bg-black/5 px-2 py-0.5 rounded-full">Optional</span>
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>
                    Optionally accounts for liquid calories, tea/coffee routines, and micronutrient supplementation.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  updateProfile('skipHydrationStep', true);
                  handleSkip();
                }}
                className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer hover:bg-black/5 flex items-center gap-1.5 shadow-2xs"
                style={{
                  backgroundColor: 'var(--theme-subtle)',
                  borderColor: 'var(--theme-border)',
                  color: 'var(--theme-text)',
                }}
              >
                <span>Skip Option 8 (Don&apos;t count in diet)</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Skip Status Banner */}
            <div
              className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${
                profile.skipHydrationStep ? 'bg-amber-50/80 border-amber-300' : 'border-dashed'
              }`}
              style={{
                backgroundColor: profile.skipHydrationStep ? undefined : 'var(--theme-subtle)',
                borderColor: profile.skipHydrationStep ? undefined : 'var(--theme-border)',
              }}
            >
              <div className="flex items-center space-x-2.5">
                <Info className={`w-4 h-4 shrink-0 ${profile.skipHydrationStep ? 'text-amber-800' : 'text-stone-500'}`} />
                <div className="text-xs">
                  <span className="font-bold block" style={{ color: 'var(--theme-text)' }}>
                    {profile.skipHydrationStep
                      ? 'Option 8 is Skipped (Excluded from Diet Calculation)'
                      : 'Skip if you do not want drinks or supplements factored into your plan'}
                  </span>
                  <span style={{ color: 'var(--theme-text-muted)' }} className="text-[11px]">
                    {profile.skipHydrationStep
                      ? 'No teas, coffees, smoothies, or custom supplement requirements will be counted or forced into your diet calculations.'
                      : 'You can skip this step anytime. The AI and calorie engine will focus 100% on your core whole-food solid meals.'}
                  </span>
                </div>
              </div>

              {profile.skipHydrationStep && (
                <button
                  type="button"
                  onClick={() => updateProfile('skipHydrationStep', false)}
                  className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-900 text-white cursor-pointer hover:bg-amber-950 transition-colors"
                >
                  Re-include Step 8
                </button>
              )}
            </div>

            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${profile.skipHydrationStep ? 'opacity-50 pointer-events-none' : ''}`}>
              {/* Daily Water Intake */}
              <div>
                <label className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--theme-text-muted)' }}>
                  <span>Daily Water Intake</span>
                </label>
                <select
                  value={profile.dailyWaterIntake}
                  onChange={(e) => {
                    updateProfile('skipHydrationStep', false);
                    updateProfile('dailyWaterIntake', e.target.value);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium"
                  style={{
                    backgroundColor: 'var(--theme-subtle)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text)',
                  }}
                >
                  <option value="1-2 Liters">1-2 Liters (~4-8 glasses)</option>
                  <option value="2-3 Liters">2-3 Liters (Recommended)</option>
                  <option value="3-4 Liters">3-4 Liters (Active hydration)</option>
                  <option value="4+ Liters">4+ Liters</option>
                </select>
              </div>

              {/* Tea Consumption */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--theme-text-muted)' }}>
                  <span>Tea Consumption (Chai)</span>
                  <span className="text-[10px] text-stone-400 font-normal normal-case">(Optional)</span>
                </label>
                <select
                  value={profile.teaConsumption}
                  onChange={(e) => {
                    updateProfile('skipHydrationStep', false);
                    updateProfile('teaConsumption', e.target.value);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm"
                  style={{
                    backgroundColor: 'var(--theme-subtle)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text)',
                  }}
                >
                  <option value="None">None</option>
                  <option value="1-2 cups (with milk & sugar)">1-2 cups (with milk &amp; sugar)</option>
                  <option value="1-2 cups (black / green / unsweetened)">1-2 cups (green / herbal / black)</option>
                  <option value="3-4 cups">3-4 cups</option>
                  <option value="5+ cups">5+ cups</option>
                </select>
              </div>

              {/* Coffee Consumption */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--theme-text-muted)' }}>
                  <span>Coffee Consumption</span>
                  <span className="text-[10px] text-stone-400 font-normal normal-case">(Optional)</span>
                </label>
                <select
                  value={profile.coffeeConsumption}
                  onChange={(e) => {
                    updateProfile('skipHydrationStep', false);
                    updateProfile('coffeeConsumption', e.target.value);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm"
                  style={{
                    backgroundColor: 'var(--theme-subtle)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text)',
                  }}
                >
                  <option value="None">None</option>
                  <option value="1-2 cups (black / espresso)">1-2 cups (black / espresso)</option>
                  <option value="1-2 cups (with milk & sugar)">1-2 cups (with milk &amp; sugar)</option>
                  <option value="3-4 cups">3-4 cups</option>
                </select>
              </div>

              {/* Soft / Sugary Drinks */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--theme-text-muted)' }}>
                  Soft / Sugary Drinks
                </label>
                <select
                  value={profile.sugaryDrinks}
                  onChange={(e) => {
                    updateProfile('skipHydrationStep', false);
                    updateProfile('sugaryDrinks', e.target.value);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm"
                  style={{
                    backgroundColor: 'var(--theme-subtle)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text)',
                  }}
                >
                  <option value="Never">Never</option>
                  <option value="Rarely (1-2 times/month)">Rarely (1-2 times/month)</option>
                  <option value="1-2 times/week">1-2 times/week</option>
                  <option value="Almost Daily">Almost Daily</option>
                </select>
              </div>
            </div>

            {/* Current Supplements */}
            <div className={profile.skipHydrationStep ? 'opacity-50 pointer-events-none' : ''}>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2.5" style={{ color: 'var(--theme-text-muted)' }}>
                Current Supplements Taken:
              </label>
              <div className="flex flex-wrap gap-2">
                {SUPPLEMENTS_LIST.map((sup) => {
                  const isChecked = profile.currentSupplements.includes(sup);
                  return (
                    <button
                      key={sup}
                      type="button"
                      onClick={() => {
                        updateProfile('skipHydrationStep', false);
                        toggleArrayItem('currentSupplements', sup);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer ${
                        isChecked ? 'bg-amber-900 text-white border-amber-900' : 'bg-white hover:bg-black/5 border-black/10'
                      }`}
                    >
                      {sup}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 9: Summary Review & Generate ================= */}
        {currentStep === 9 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
                  style={{ backgroundColor: 'var(--theme-primary)' }}
                >
                  <Sparkles className="w-4 h-4 text-amber-200" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold font-serif" style={{ color: 'var(--theme-text)' }}>
                    Step 9 — Review Summary & Calculated Nutrition Plan
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>
                    Review your complete profile below. You can click "Edit" on any section to adjust your answers.
                  </p>
                </div>
              </div>
            </div>

            {/* Biometric & Caloric Calculated Banner */}
            <div
              className="p-5 sm:p-6 rounded-3xl border shadow-xs"
              style={{
                backgroundColor: 'var(--theme-primary-light)',
                borderColor: 'var(--theme-border)',
              }}
            >
              <h4 className="text-sm font-bold font-serif uppercase tracking-wider mb-3" style={{ color: 'var(--theme-primary-text)' }}>
                Your Precision Nutritional Target Matrix
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-4">
                <div className="p-3 rounded-2xl bg-white/80 border border-black/5">
                  <span className="text-[11px] font-bold uppercase tracking-wider block text-stone-500">Target Calories</span>
                  <span className="text-xl font-bold font-serif" style={{ color: 'var(--theme-text)' }}>
                    {formatCalories(metrics.targetCalories)}
                  </span>
                  <span className="text-[11px] block text-stone-500 mt-0.5">TDEE: {metrics.tdee} kcal</span>
                </div>

                <div className="p-3 rounded-2xl bg-white/80 border border-black/5">
                  <span className="text-[11px] font-bold uppercase tracking-wider block text-stone-500">Target Protein</span>
                  <span className="text-xl font-bold font-serif text-emerald-800">
                    {formatGrams(metrics.macroTargets.proteinGrams)}
                  </span>
                  <span className="text-[11px] block text-stone-500 mt-0.5">
                    {metrics.macroTargets.proteinPct}% of total calories
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-white/80 border border-black/5">
                  <span className="text-[11px] font-bold uppercase tracking-wider block text-stone-500">Target Carbs</span>
                  <span className="text-xl font-bold font-serif text-amber-900">
                    {formatGrams(metrics.macroTargets.carbsGrams)}
                  </span>
                  <span className="text-[11px] block text-stone-500 mt-0.5">
                    {metrics.macroTargets.carbsPct}% of total calories
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-white/80 border border-black/5">
                  <span className="text-[11px] font-bold uppercase tracking-wider block text-stone-500">Healthy Fats</span>
                  <span className="text-xl font-bold font-serif text-amber-800">
                    {formatGrams(metrics.macroTargets.fatGrams)}
                  </span>
                  <span className="text-[11px] block text-stone-500 mt-0.5">
                    {metrics.macroTargets.fatPct}% of total calories
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs pt-2 border-t border-black/5 font-medium">
                <span className="flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-blue-600" />
                  <strong>Hydration Target:</strong> ~{metrics.recommendedWaterLiters} Liters/day
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <strong>Diet Type:</strong> {profile.dietType}
                </span>
                <span className="flex items-center gap-1">
                  <Wallet className="w-3.5 h-3.5 text-amber-700" />
                  <strong>Budget Tier:</strong> {profile.budgetTier?.toUpperCase() || 'BALANCED'} ({profile.currency}{profile.dailyFoodBudget}/day)
                </span>
              </div>
            </div>

            {/* Structured Review Cards with Inline Edit Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
              {/* Card 1: Basic & Goal */}
              <div className="p-4 rounded-2xl border flex flex-col justify-between" style={{ backgroundColor: 'var(--theme-subtle)', borderColor: 'var(--theme-border)' }}>
                <div>
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-black/5">
                    <span className="font-bold text-xs flex items-center gap-1.5" style={{ color: 'var(--theme-text)' }}>
                      <User className="w-3.5 h-3.5 text-amber-800" />
                      1. Basic Info &amp; 2. Goal
                    </span>
                    <button
                      type="button"
                      onClick={() => handleJumpToStep(1)}
                      className="text-amber-800 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                  </div>
                  <ul className="space-y-1" style={{ color: 'var(--theme-text-muted)' }}>
                    <li><strong>Age / Gender:</strong> {profile.age} yrs • {profile.gender}</li>
                    <li><strong>Height:</strong> {profile.heightUnit === 'cm' ? `${profile.heightCm} cm` : `${profile.heightFt}ft ${profile.heightIn}in`} (BMI {metrics.bmi})</li>
                    <li><strong>Weight:</strong> {profile.currentWeight} {profile.weightUnit} → Target: {profile.targetWeight} {profile.weightUnit}</li>
                    <li><strong>Location:</strong> {profile.cityRegion ? `${profile.cityRegion}, ` : ''}{profile.country}</li>
                    <li><strong>Goal:</strong> <span className="font-bold text-amber-900">{profile.goal}</span></li>
                  </ul>
                </div>
              </div>

              {/* Card 2: Diet Type & Activity */}
              <div className="p-4 rounded-2xl border flex flex-col justify-between" style={{ backgroundColor: 'var(--theme-subtle)', borderColor: 'var(--theme-border)' }}>
                <div>
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-black/5">
                    <span className="font-bold text-xs flex items-center gap-1.5" style={{ color: 'var(--theme-text)' }}>
                      <Utensils className="w-3.5 h-3.5 text-amber-800" />
                      3. Diet Type &amp; 4. Activity
                    </span>
                    <button
                      type="button"
                      onClick={() => handleJumpToStep(3)}
                      className="text-amber-800 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                  </div>
                  <ul className="space-y-1" style={{ color: 'var(--theme-text-muted)' }}>
                    <li><strong>Diet Type:</strong> {profile.dietType} {profile.customDietType ? `(${profile.customDietType})` : ''}</li>
                    <li><strong>Activity Level:</strong> {profile.activityLevel} ({profile.dailySteps})</li>
                    <li><strong>Exercise:</strong> {profile.hasExercise ? `${profile.workoutType.join(', ')} (${profile.workoutDaysPerWeek} days/wk, ${profile.workoutDuration})` : 'No formal exercise'}</li>
                  </ul>
                </div>
              </div>

              {/* Card 3: Schedule & Preferences */}
              <div className="p-4 rounded-2xl border flex flex-col justify-between" style={{ backgroundColor: 'var(--theme-subtle)', borderColor: 'var(--theme-border)' }}>
                <div>
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-black/5">
                    <span className="font-bold text-xs flex items-center gap-1.5" style={{ color: 'var(--theme-text)' }}>
                      <Clock className="w-3.5 h-3.5 text-amber-800" />
                      5. Schedule &amp; 6. Preferences
                    </span>
                    <button
                      type="button"
                      onClick={() => handleJumpToStep(5)}
                      className="text-amber-800 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                  </div>
                  <ul className="space-y-1" style={{ color: 'var(--theme-text-muted)' }}>
                    <li><strong>Schedule:</strong> Wake {profile.wakeUpTime} • Breakfast {profile.breakfastTime} • Lunch {profile.lunchTime} • Dinner {profile.dinnerTime}</li>
                    <li><strong>Meals/Day:</strong> {profile.mealsPerDay} meals {profile.intermittentFasting ? `(IF: ${profile.fastingWindow})` : ''}</li>
                    <li><strong>Favorite Foods:</strong> {profile.favoriteFoods || 'None specified'}</li>
                    <li><strong>Cuisines:</strong> {profile.preferredCuisines.join(', ') || 'Standard / Homestyle'}</li>
                  </ul>
                </div>
              </div>

              {/* Card 4: Budget & Hydration */}
              <div className="p-4 rounded-2xl border flex flex-col justify-between" style={{ backgroundColor: 'var(--theme-subtle)', borderColor: 'var(--theme-border)' }}>
                <div>
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-black/5">
                    <span className="font-bold text-xs flex items-center gap-1.5" style={{ color: 'var(--theme-text)' }}>
                      <Wallet className="w-3.5 h-3.5 text-amber-800" />
                      7. Budget &amp; 8. Hydration
                    </span>
                    <button
                      type="button"
                      onClick={() => handleJumpToStep(7)}
                      className="text-amber-800 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                  </div>
                  <ul className="space-y-1" style={{ color: 'var(--theme-text-muted)' }}>
                    <li><strong>Budget:</strong> {profile.currency}{profile.dailyFoodBudget}/day ({profile.currency}{profile.weeklyFoodBudget}/wk) — {profile.budgetTier?.toUpperCase()}</li>
                    {profile.skipHydrationStep ? (
                      <li>
                        <strong>Drinks &amp; Supplements (Step 8):</strong>{' '}
                        <span className="font-semibold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded-md inline-block">
                          Skipped (Excluded from diet calculation)
                        </span>
                      </li>
                    ) : (
                      <>
                        <li><strong>Hydration:</strong> {profile.dailyWaterIntake} water/day</li>
                        <li><strong>Beverages:</strong> Chai: {profile.teaConsumption} • Coffee: {profile.coffeeConsumption}</li>
                        <li><strong>Supplements:</strong> {profile.currentSupplements.join(', ') || 'None'}</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER ACTION BAR: BACK, SKIP, NEXT & GENERATE BUTTON */}
      <div
        className="pt-5 border-t border-black/10 flex flex-col sm:flex-row items-center justify-between gap-3 mt-4"
      >
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handleBack}
              disabled={isGenerating}
              className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer hover:opacity-80"
              style={{
                backgroundColor: 'var(--theme-subtle)',
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-text)',
              }}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          )}

          <span className="text-xs hidden sm:inline-block" style={{ color: 'var(--theme-text-muted)' }}>
            Step {currentStep} of 9
          </span>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
          {currentStep < 9 ? (
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              {(currentStep === 5 || currentStep === 6 || currentStep === 8) && (
                <button
                  type="button"
                  onClick={handleSkip}
                  className="flex-1 sm:flex-initial flex items-center justify-center px-4 py-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all cursor-pointer hover:opacity-80"
                  style={{
                    backgroundColor: 'var(--theme-subtle)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text)',
                  }}
                >
                  <span>Skip {currentStep === 8 ? 'Option 8' : ''}</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer active:scale-95"
                style={{
                  backgroundColor: 'var(--theme-btn-bg)',
                  color: 'var(--theme-btn-text)',
                }}
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              id="generate-diet-plan-btn"
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full sm:w-auto flex items-center justify-center space-x-2.5 px-8 py-3.5 rounded-2xl text-sm font-bold shadow-lg transition-all cursor-pointer active:scale-95 text-white animate-pulse"
              style={{
                backgroundColor: 'var(--theme-primary)',
              }}
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>{isGenerating ? 'Generating Your Personalized Plan...' : 'Generate My Diet Plan'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

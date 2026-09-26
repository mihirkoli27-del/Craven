import React, { useState } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { PlanGenerationConfig } from '../types';

interface PlanGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (config: PlanGenerationConfig) => Promise<void>;
  isLoading: boolean;
}

export const PlanGeneratorModal: React.FC<PlanGeneratorModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  isLoading,
}) => {
  const [goal, setGoal] = useState('Healthy Living & Weight Management');
  const [dietType, setDietType] = useState('Indian Vegetarian');
  const [calorieTarget, setCalorieTarget] = useState<number>(2000);
  const [budgetTier, setBudgetTier] = useState<'thrifty' | 'balanced' | 'gourmet'>('thrifty');
  const [householdSize, setHouseholdSize] = useState<number>(1);
  const [currency, setCurrency] = useState('₹');
  const [dislikedFoods, setDislikedFoods] = useState('');
  const [pantryItems, setPantryItems] = useState('Ghee, mustard oil, turmeric, cumin seeds, ginger-garlic, salt');
  const [cookingSkill, setCookingSkill] = useState('Quick 15-Minute Meals');
  const [loadingStep, setLoadingStep] = useState(0);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingStep(1);

    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 1800);

    try {
      await onGenerate({
        goal,
        dietType,
        calorieTarget,
        budgetTier,
        householdSize,
        currency,
        dislikedFoods,
        pantryItems,
        cookingSkill,
      });
      clearInterval(stepInterval);
    } catch (err) {
      clearInterval(stepInterval);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="rounded-3xl max-w-2xl w-full max-h-[92vh] sm:max-h-[90vh] overflow-y-auto border shadow-2xl flex flex-col"
        style={{
          backgroundColor: 'var(--theme-surface)',
          borderColor: 'var(--theme-border)',
        }}
      >
        {/* Modal Header */}
        <div
          className="sticky top-0 z-10 px-4 sm:px-6 py-3.5 sm:py-4 border-b flex items-center justify-between backdrop-blur-md"
          style={{
            backgroundColor: 'var(--theme-surface)',
            borderColor: 'var(--theme-border)',
          }}
        >
          <div className="flex items-center space-x-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0"
              style={{ backgroundColor: 'var(--theme-primary)' }}
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
            </div>
            <div>
              <h2
                className="text-base sm:text-lg font-bold font-serif"
                style={{ color: 'var(--theme-text)' }}
              >
                Generate Custom Diet Plan
              </h2>
              <p
                className="text-[11px] sm:text-xs font-medium"
                style={{ color: 'var(--theme-text-muted)' }}
              >
                Personalized meal schedule tailored to your goals & budget
              </p>
            </div>
          </div>

          {!isLoading && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer hover:opacity-80"
              style={{
                backgroundColor: 'var(--theme-subtle)',
                color: 'var(--theme-text)',
              }}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Modal Body: Loading state vs Config Form */}
        {isLoading ? (
          <div className="p-6 sm:p-12 text-center space-y-6">
            <div className="relative w-20 h-20 mx-auto">
              <div
                className="absolute inset-0 rounded-full border-4 animate-ping opacity-30"
                style={{ borderColor: 'var(--theme-accent)' }}
              ></div>
              <div
                className="relative w-20 h-20 rounded-full flex items-center justify-center shadow-lg"
                style={{ backgroundColor: 'var(--theme-primary)' }}
              >
                <Sparkles className="w-9 h-9 text-amber-200 animate-spin" />
              </div>
            </div>

            <div className="space-y-2">
              <h3
                className="text-lg sm:text-xl font-bold font-serif"
                style={{ color: 'var(--theme-text)' }}
              >
                Craven AI is Architecting Your 7-Day Plan
              </h3>
              <p
                className="text-xs max-w-md mx-auto"
                style={{ color: 'var(--theme-text-muted)' }}
              >
                Calculating exact macronutrients, daily recipe schedules, and budget breakdown in {currency}...
              </p>
            </div>

            {/* Step Indicators */}
            <div
              className="max-w-md mx-auto p-4 rounded-2xl border space-y-3 text-xs text-left"
              style={{
                backgroundColor: 'var(--theme-subtle)',
                borderColor: 'var(--theme-border)',
              }}
            >
              <div className="flex items-center space-x-2.5">
                <CheckCircle2
                  className="w-4 h-4"
                  style={{
                    color: loadingStep >= 1 ? 'var(--theme-primary)' : 'var(--theme-text-subtle)',
                  }}
                />
                <span
                  style={{
                    fontWeight: loadingStep >= 1 ? 600 : 400,
                    color: loadingStep >= 1 ? 'var(--theme-text)' : 'var(--theme-text-subtle)',
                  }}
                >
                  Balancing 28 daily meals for {calorieTarget} kcal/day
                </span>
              </div>

              <div className="flex items-center space-x-2.5">
                <CheckCircle2
                  className="w-4 h-4"
                  style={{
                    color: loadingStep >= 2 ? 'var(--theme-primary)' : 'var(--theme-text-subtle)',
                  }}
                />
                <span
                  style={{
                    fontWeight: loadingStep >= 2 ? 600 : 400,
                    color: loadingStep >= 2 ? 'var(--theme-text)' : 'var(--theme-text-subtle)',
                  }}
                >
                  Optimizing for {budgetTier.toUpperCase()} budget tier
                </span>
              </div>

              <div className="flex items-center space-x-2.5">
                <CheckCircle2
                  className="w-4 h-4"
                  style={{
                    color: loadingStep >= 3 ? 'var(--theme-primary)' : 'var(--theme-text-subtle)',
                  }}
                />
                <span
                  style={{
                    fontWeight: loadingStep >= 3 ? 600 : 400,
                    color: loadingStep >= 3 ? 'var(--theme-text)' : 'var(--theme-text-subtle)',
                  }}
                >
                  Designing meal prep guides & nutritional macro targets
                </span>
              </div>

              <div className="flex items-center space-x-2.5">
                <CheckCircle2
                  className="w-4 h-4"
                  style={{
                    color: loadingStep >= 4 ? 'var(--theme-primary)' : 'var(--theme-text-subtle)',
                  }}
                />
                <span
                  style={{
                    fontWeight: loadingStep >= 4 ? 600 : 400,
                    color: loadingStep >= 4 ? 'var(--theme-text)' : 'var(--theme-text-subtle)',
                  }}
                >
                  Finalizing 7-day schedule with step-by-step recipes
                </span>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5">
            {/* Primary Goal & Diet Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-xs font-bold uppercase tracking-wider mb-1.5"
                  style={{ color: 'var(--theme-text)' }}
                >
                  Primary Nutrition Goal
                </label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border focus:outline-hidden"
                  style={{
                    backgroundColor: 'var(--theme-surface)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text)',
                  }}
                >
                  <option value="Healthy Living & Weight Management">Healthy Living & Weight Management</option>
                  <option value="Fat Loss & Calorie Deficit">Fat Loss & Calorie Deficit</option>
                  <option value="Lean Muscle Building & High Protein">Lean Muscle Building & High Protein</option>
                  <option value="Heart Health & Longevity">Heart Health & Longevity</option>
                  <option value="Ultra-Budget Meal Saver">Ultra-Budget Meal Saver</option>
                  <option value="Quick 15-Min Low-Prep Routine">Quick 15-Min Low-Prep Routine</option>
                </select>
              </div>

              <div>
                <label
                  className="block text-xs font-bold uppercase tracking-wider mb-1.5"
                  style={{ color: 'var(--theme-text)' }}
                >
                  Diet Archetype
                </label>
                <select
                  value={dietType}
                  onChange={(e) => setDietType(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border focus:outline-hidden"
                  style={{
                    backgroundColor: 'var(--theme-surface)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text)',
                  }}
                >
                  <option value="Indian Vegetarian">Indian Vegetarian (Dal, Paneer, Sabzi, Roti)</option>
                  <option value="Balanced Everyday">Balanced Everyday</option>
                  <option value="High Protein">High Protein (Fitness & Satiety)</option>
                  <option value="Mediterranean">Mediterranean (Heart Healthy, Whole Grains)</option>
                  <option value="Vegetarian">Vegetarian (Plant-Forward)</option>
                  <option value="Vegan">100% Plant-Based Vegan</option>
                  <option value="Low Carb / Keto">Low Carb / Keto</option>
                  <option value="Diabetic Friendly">Diabetic-Friendly (Low GI)</option>
                  <option value="Pescatarian">Pescatarian (Fish & Veggies)</option>
                </select>
              </div>
            </div>

            {/* Budget Tier Selector */}
            <div>
              <label
                className="block text-xs font-bold uppercase tracking-wider mb-2"
                style={{ color: 'var(--theme-text)' }}
              >
                Weekly Budget Tier ({currency})
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setBudgetTier('thrifty')}
                  className="p-3 rounded-2xl border text-left transition-all cursor-pointer"
                  style={{
                    backgroundColor: budgetTier === 'thrifty' ? 'var(--theme-accent-light)' : 'var(--theme-surface)',
                    borderColor: budgetTier === 'thrifty' ? 'var(--theme-accent)' : 'var(--theme-border)',
                  }}
                >
                  <div className="flex items-center justify-between font-bold text-xs mb-1">
                    <span style={{ color: 'var(--theme-text)' }}>Thrifty</span>
                    <span style={{ color: 'var(--theme-accent-text)' }}>{currency === '$' ? '$35-50' : '₹1,500-2.2k'}</span>
                  </div>
                  <p className="text-[11px] leading-tight" style={{ color: 'var(--theme-text-muted)' }}>
                    Seasonal lentils, eggs, local veggies, rice, atta, curd.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setBudgetTier('balanced')}
                  className="p-3 rounded-2xl border text-left transition-all cursor-pointer"
                  style={{
                    backgroundColor: budgetTier === 'balanced' ? 'var(--theme-accent-light)' : 'var(--theme-surface)',
                    borderColor: budgetTier === 'balanced' ? 'var(--theme-accent)' : 'var(--theme-border)',
                  }}
                >
                  <div className="flex items-center justify-between font-bold text-xs mb-1">
                    <span style={{ color: 'var(--theme-text)' }}>Balanced</span>
                    <span style={{ color: 'var(--theme-accent-text)' }}>{currency === '$' ? '$60-80' : '₹2.2k-3.5k'}</span>
                  </div>
                  <p className="text-[11px] leading-tight" style={{ color: 'var(--theme-text-muted)' }}>
                    Paneer, chicken breast, Greek yogurt, fresh greens, nuts.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setBudgetTier('gourmet')}
                  className="p-3 rounded-2xl border text-left transition-all cursor-pointer"
                  style={{
                    backgroundColor: budgetTier === 'gourmet' ? 'var(--theme-accent-light)' : 'var(--theme-surface)',
                    borderColor: budgetTier === 'gourmet' ? 'var(--theme-accent)' : 'var(--theme-border)',
                  }}
                >
                  <div className="flex items-center justify-between font-bold text-xs mb-1">
                    <span style={{ color: 'var(--theme-text)' }}>Gourmet</span>
                    <span style={{ color: 'var(--theme-accent-text)' }}>{currency === '$' ? '$90+' : '₹3.5k+'}</span>
                  </div>
                  <p className="text-[11px] leading-tight" style={{ color: 'var(--theme-text-muted)' }}>
                    Fresh fish/mutton, organic avocados, imported nuts, berries.
                  </p>
                </button>
              </div>
            </div>

            {/* Target Calories & Household Size */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label
                  className="block text-xs font-bold uppercase tracking-wider mb-1.5"
                  style={{ color: 'var(--theme-text)' }}
                >
                  Daily Calorie Target
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={calorieTarget || ''}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/[^0-9]/g, '');
                      setCalorieTarget(clean === '' ? 0 : parseInt(clean, 10));
                    }}
                    className="w-full p-2.5 text-xs rounded-xl border focus:outline-hidden"
                    style={{
                      backgroundColor: 'var(--theme-surface)',
                      borderColor: 'var(--theme-border)',
                      color: 'var(--theme-text)',
                    }}
                  />
                  <span
                    className="absolute right-3 top-2.5 text-xs font-medium"
                    style={{ color: 'var(--theme-text-subtle)' }}
                  >
                    kcal
                  </span>
                </div>
              </div>

              <div>
                <label
                  className="block text-xs font-bold uppercase tracking-wider mb-1.5"
                  style={{ color: 'var(--theme-text)' }}
                >
                  Household Portions
                </label>
                <select
                  value={householdSize}
                  onChange={(e) => setHouseholdSize(parseInt(e.target.value) || 1)}
                  className="w-full p-2.5 text-xs rounded-xl border focus:outline-hidden"
                  style={{
                    backgroundColor: 'var(--theme-surface)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text)',
                  }}
                >
                  <option value={1}>1 Person (Single)</option>
                  <option value={2}>2 People (Couple)</option>
                  <option value={4}>4 People (Family of 4)</option>
                  <option value={6}>6 People (Large Household)</option>
                </select>
              </div>

              <div>
                <label
                  className="block text-xs font-bold uppercase tracking-wider mb-1.5"
                  style={{ color: 'var(--theme-text)' }}
                >
                  Currency Symbol
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border focus:outline-hidden"
                  style={{
                    backgroundColor: 'var(--theme-surface)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text)',
                  }}
                >
                  <option value="₹">INR (₹)</option>
                  <option value="$">USD ($)</option>
                  <option value="€">EUR (€)</option>
                  <option value="£">GBP (£)</option>
                  <option value="C$">CAD (C$)</option>
                  <option value="A$">AUD (A$)</option>
                </select>
              </div>
            </div>

            {/* Disliked Foods & Allergies */}
            <div>
              <label
                className="block text-xs font-bold uppercase tracking-wider mb-1.5"
                style={{ color: 'var(--theme-text)' }}
              >
                Allergies & Disliked Foods (Optional)
              </label>
              <input
                type="text"
                value={dislikedFoods}
                onChange={(e) => setDislikedFoods(e.target.value)}
                placeholder="e.g. No mushrooms, allergic to peanuts, no pork, gluten-free"
                className="w-full p-2.5 text-xs rounded-xl border focus:outline-hidden"
                style={{
                  backgroundColor: 'var(--theme-surface)',
                  borderColor: 'var(--theme-border)',
                  color: 'var(--theme-text)',
                }}
              />
            </div>

            {/* Modal Actions */}
            <div
              className="pt-4 border-t flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:space-x-3"
              style={{ borderColor: 'var(--theme-border)' }}
            >
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 text-xs font-medium rounded-xl transition-colors cursor-pointer hover:opacity-80 text-center"
                style={{
                  backgroundColor: 'var(--theme-subtle)',
                  color: 'var(--theme-text)',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-2.5 text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
                style={{
                  backgroundColor: 'var(--theme-btn-bg)',
                  color: 'var(--theme-btn-text)',
                }}
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Generate Diet Plan</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

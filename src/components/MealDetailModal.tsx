import React from 'react';
import {
  X,
  Clock,
  Flame,
  Leaf,
  Utensils,
  ChefHat,
  Coffee,
  Tag,
  DollarSign,
} from 'lucide-react';
import { Meal } from '../types';
import {
  formatCurrency,
  formatCalories,
  formatGrams,
  formatPricePer100g,
  getIngredientPriceDetails,
  getMealPricePer100g,
} from '../utils/formatters';

interface MealDetailModalProps {
  meal: Meal | null;
  dayName: string;
  currency: string;
  onClose: () => void;
}

export const MealDetailModal: React.FC<MealDetailModalProps> = ({
  meal,
  dayName,
  currency,
  onClose,
}) => {
  if (!meal) return null;

  const totalTime = meal.prepTimeMinutes + meal.cookTimeMinutes;
  const mealPriceInfo = getMealPricePer100g(meal);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border shadow-2xl flex flex-col"
        style={{
          backgroundColor: 'var(--theme-surface)',
          borderColor: 'var(--theme-border)',
        }}
      >
        {/* Modal Header */}
        <div
          className="sticky top-0 z-10 px-6 py-4 border-b flex items-center justify-between backdrop-blur-md"
          style={{
            backgroundColor: 'var(--theme-surface)',
            borderColor: 'var(--theme-border)',
          }}
        >
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <span
              className="px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider rounded-md border"
              style={{
                backgroundColor: 'var(--theme-primary-light)',
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-primary-text)',
              }}
            >
              {dayName} • {meal.type}
            </span>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-md border flex items-center gap-1"
              style={{
                backgroundColor: 'var(--theme-subtle)',
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-text)',
              }}
            >
              <span>Est. {formatCurrency(meal.estimatedCost, currency)}</span>
              <span className="opacity-40">•</span>
              <span className="text-amber-800 font-extrabold">{formatPricePer100g(mealPriceInfo.pricePer100g, undefined, currency)}</span>
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer hover:opacity-80"
            style={{
              backgroundColor: 'var(--theme-subtle)',
              color: 'var(--theme-text)',
            }}
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 space-y-6">
          {/* Title & Timing */}
          <div>
            <h2
              className="text-2xl sm:text-3xl font-bold font-serif"
              style={{ color: 'var(--theme-text)' }}
            >
              {meal.name}
            </h2>
            <p
              className="text-sm mt-1.5 leading-relaxed"
              style={{ color: 'var(--theme-text-muted)' }}
            >
              {meal.description}
            </p>

            <div className="flex flex-wrap items-center gap-2.5 mt-4 text-xs font-medium">
              <span
                className="flex items-center border px-3 py-1.5 rounded-xl font-bold"
                style={{
                  backgroundColor: 'var(--theme-primary-light)',
                  borderColor: 'var(--theme-border)',
                  color: 'var(--theme-primary-text)',
                }}
              >
                <Tag className="w-3.5 h-3.5 mr-1.5 text-amber-700" />
                {formatCurrency(meal.estimatedCost, currency)} ({formatPricePer100g(mealPriceInfo.pricePer100g, undefined, currency)})
              </span>

              <span
                className="flex items-center border px-3 py-1.5 rounded-xl"
                style={{
                  backgroundColor: 'var(--theme-subtle)',
                  borderColor: 'var(--theme-border)',
                  color: 'var(--theme-text)',
                }}
              >
                <Clock className="w-4 h-4 mr-1.5" style={{ color: 'var(--theme-text-muted)' }} />
                Prep: {meal.prepTimeMinutes}m | Cook: {meal.cookTimeMinutes}m ({totalTime}m total)
              </span>

              <span
                className="flex items-center border px-3 py-1.5 rounded-xl"
                style={{
                  backgroundColor: 'var(--theme-accent-light)',
                  borderColor: 'var(--theme-border)',
                  color: 'var(--theme-accent-text)',
                }}
              >
                <Flame className="w-4 h-4 mr-1.5" style={{ color: 'var(--theme-accent)' }} />
                {formatCalories(meal.macros.calories)}
              </span>

              {meal.dietaryBadges?.map((badge, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1.5 border rounded-xl"
                  style={{
                    backgroundColor: 'var(--theme-primary-light)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-primary-text)',
                  }}
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>

          {/* Macro Breakdown Bar */}
          <div
            className="rounded-2xl p-4 border"
            style={{
              backgroundColor: 'var(--theme-subtle)',
              borderColor: 'var(--theme-border)',
            }}
          >
            <h4
              className="text-xs font-bold uppercase tracking-wider mb-3"
              style={{ color: 'var(--theme-text)' }}
            >
              Nutritional Macros Breakdown
            </h4>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div
                className="p-2.5 rounded-xl border shadow-2xs"
                style={{
                  backgroundColor: 'var(--theme-surface)',
                  borderColor: 'var(--theme-border)',
                }}
              >
                <span
                  className="block text-[10px] font-semibold uppercase"
                  style={{ color: 'var(--theme-text-subtle)' }}
                >
                  Protein
                </span>
                <span
                  className="text-base font-bold"
                  style={{ color: 'var(--theme-text)' }}
                >
                  {formatGrams(meal.macros.protein)}
                </span>
              </div>
              <div
                className="p-2.5 rounded-xl border shadow-2xs"
                style={{
                  backgroundColor: 'var(--theme-surface)',
                  borderColor: 'var(--theme-border)',
                }}
              >
                <span
                  className="block text-[10px] font-semibold uppercase"
                  style={{ color: 'var(--theme-text-subtle)' }}
                >
                  Carbs
                </span>
                <span
                  className="text-base font-bold"
                  style={{ color: 'var(--theme-text)' }}
                >
                  {formatGrams(meal.macros.carbs)}
                </span>
              </div>
              <div
                className="p-2.5 rounded-xl border shadow-2xs"
                style={{
                  backgroundColor: 'var(--theme-surface)',
                  borderColor: 'var(--theme-border)',
                }}
              >
                <span
                  className="block text-[10px] font-semibold uppercase"
                  style={{ color: 'var(--theme-text-subtle)' }}
                >
                  Fat
                </span>
                <span
                  className="text-base font-bold"
                  style={{ color: 'var(--theme-text)' }}
                >
                  {formatGrams(meal.macros.fat)}
                </span>
              </div>
              <div
                className="p-2.5 rounded-xl border shadow-2xs"
                style={{
                  backgroundColor: 'var(--theme-surface)',
                  borderColor: 'var(--theme-border)',
                }}
              >
                <span
                  className="block text-[10px] font-semibold uppercase"
                  style={{ color: 'var(--theme-text-subtle)' }}
                >
                  Fiber
                </span>
                <span
                  className="text-base font-bold"
                  style={{ color: 'var(--theme-accent-text)' }}
                >
                  {meal.macros.fiber !== undefined ? formatGrams(meal.macros.fiber) : '4g'}
                </span>
              </div>
            </div>

            {/* Additional granular nutrition & vitamins */}
            {(meal.macros.sodium !== undefined || meal.macros.naturalSugar !== undefined || meal.macros.addedSugar !== undefined || meal.macros.vitaminsAndMinerals) && (
              <div className="mt-3 pt-3 border-t grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs" style={{ borderColor: 'var(--theme-border)' }}>
                <div className="flex flex-wrap gap-2 text-[11px]" style={{ color: 'var(--theme-text-muted)' }}>
                  {meal.macros.sodium !== undefined && (
                    <span className="px-2 py-0.5 rounded-md border" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
                      Sodium: <strong style={{ color: 'var(--theme-text)' }}>{meal.macros.sodium} mg</strong>
                    </span>
                  )}
                  {meal.macros.naturalSugar !== undefined && (
                    <span className="px-2 py-0.5 rounded-md border" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
                      Natural Sugar: <strong style={{ color: 'var(--theme-text)' }}>{meal.macros.naturalSugar}g</strong>
                    </span>
                  )}
                  {meal.macros.addedSugar !== undefined && (
                    <span className="px-2 py-0.5 rounded-md border" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
                      Added Sugar: <strong style={{ color: meal.macros.addedSugar > 5 ? 'var(--theme-accent)' : 'var(--theme-text)' }}>{meal.macros.addedSugar}g</strong>
                    </span>
                  )}
                </div>

                {meal.macros.vitaminsAndMinerals && Object.keys(meal.macros.vitaminsAndMinerals).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 justify-start sm:justify-end text-[10px]">
                    {Object.entries(meal.macros.vitaminsAndMinerals).map(([vit, val], vIdx) => (
                      <span
                        key={vIdx}
                        className="px-2 py-0.5 rounded-md border font-medium"
                        style={{
                          backgroundColor: 'var(--theme-primary-light)',
                          borderColor: 'var(--theme-border)',
                          color: 'var(--theme-primary-text)',
                        }}
                      >
                        {vit}: {val}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Ingredients Checklist */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3
                className="text-base font-bold font-serif flex items-center gap-2"
                style={{ color: 'var(--theme-text)' }}
              >
                <Utensils className="w-4 h-4" style={{ color: 'var(--theme-primary)' }} />
                Ingredients Needed:
              </h3>
              <span className="text-[11px] font-semibold" style={{ color: 'var(--theme-text-muted)' }}>
                Showing estimated cost &amp; price per 100g
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {meal.ingredients.map((ing, idx) => {
                const ingPriceInfo = getIngredientPriceDetails(ing, meal.estimatedCost, currency);

                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-2xl border text-xs shadow-2xs transition-all hover:border-black/20"
                    style={{
                      backgroundColor: 'var(--theme-subtle)',
                      borderColor: 'var(--theme-border)',
                    }}
                  >
                    <div className="flex items-start gap-2 min-w-0 pr-2">
                      <span
                        className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                        style={{ backgroundColor: 'var(--theme-primary)' }}
                      ></span>
                      <div className="min-w-0">
                        <span
                          className="font-semibold block truncate"
                          style={{ color: 'var(--theme-text)' }}
                          title={ing.name}
                        >
                          {ing.name}
                        </span>
                        <span
                          className="text-[11px] font-mono"
                          style={{ color: 'var(--theme-text-muted)' }}
                        >
                          {ing.amount}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0 gap-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="font-bold text-xs"
                          style={{ color: 'var(--theme-text)' }}
                        >
                          {ingPriceInfo.formattedPrice}
                        </span>
                        {ing.pantryStaple && (
                          <span
                            className="px-1.5 py-0.5 text-[9px] font-bold border rounded"
                            style={{
                              backgroundColor: 'var(--theme-accent-light)',
                              borderColor: 'var(--theme-border)',
                              color: 'var(--theme-accent-text)',
                            }}
                          >
                            Pantry
                          </span>
                        )}
                      </div>
                      <span
                        className="px-1.5 py-0.5 rounded-md text-[10px] font-bold border"
                        style={{
                          backgroundColor: 'var(--theme-surface)',
                          borderColor: 'var(--theme-border)',
                          color: 'var(--theme-primary-text)',
                        }}
                      >
                        {ingPriceInfo.formattedPricePer100g}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step-by-Step Cooking Instructions */}
          <div>
            <h3
              className="text-base font-bold font-serif flex items-center gap-2 mb-3"
              style={{ color: 'var(--theme-text)' }}
            >
              <ChefHat className="w-4 h-4" style={{ color: 'var(--theme-accent)' }} />
              Preparation & Cooking Steps:
            </h3>

            <div className="space-y-2.5">
              {meal.instructions.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 text-xs sm:text-sm leading-relaxed"
                  style={{ color: 'var(--theme-text)' }}
                >
                  <span
                    className="w-6 h-6 rounded-full font-bold flex items-center justify-center shrink-0 text-xs mt-0.5"
                    style={{
                      backgroundColor: 'var(--theme-btn-bg)',
                      color: 'var(--theme-btn-text)',
                    }}
                  >
                    {idx + 1}
                  </span>
                  <p className="flex-1 pt-0.5">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          className="sticky bottom-0 px-6 py-4 border-t flex items-center justify-end"
          style={{
            backgroundColor: 'var(--theme-subtle)',
            borderColor: 'var(--theme-border)',
          }}
        >
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer active:scale-95"
            style={{
              backgroundColor: 'var(--theme-btn-bg)',
              color: 'var(--theme-btn-text)',
            }}
          >
            Done Reading
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Clock,
  Flame,
  Sparkles,
  ChevronRight,
  RefreshCw,
  Utensils,
  Leaf,
  Info,
  LayoutGrid,
  Calendar,
} from 'lucide-react';
import { DayPlan, Meal } from '../types';
import {
  formatCurrency,
  formatCalories,
  formatGrams,
  formatPricePer100g,
  getMealPricePer100g,
} from '../utils/formatters';

interface DayPlanViewProps {
  days: DayPlan[];
  currency: string;
  onSelectMeal: (meal: Meal, dayName: string) => void;
}

export const DayPlanView: React.FC<DayPlanViewProps> = ({
  days,
  currency,
  onSelectMeal,
}) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');

  const activeDay = days[selectedDayIndex] || days[0];
  if (!activeDay) return null;

  const mealList: { key: string; meal: Meal; label: string; iconColor: string; bgBadge: string }[] = [
    {
      key: 'breakfast',
      meal: activeDay.meals.breakfast,
      label: 'Breakfast',
      iconColor: 'text-amber-700',
      bgBadge: 'bg-amber-50 text-amber-900 border-amber-200',
    },
    {
      key: 'lunch',
      meal: activeDay.meals.lunch,
      label: 'Lunch',
      iconColor: 'text-blue-700',
      bgBadge: 'bg-blue-50 text-blue-900 border-blue-200',
    },
    {
      key: 'dinner',
      meal: activeDay.meals.dinner,
      label: 'Dinner',
      iconColor: 'text-slate-700',
      bgBadge: 'bg-slate-100 text-slate-800 border-slate-200',
    },
    {
      key: 'snack',
      meal: activeDay.meals.snack,
      label: 'Snack / Fuel',
      iconColor: 'text-emerald-700',
      bgBadge: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    },
  ];

  return (
    <div className="space-y-6">
      {/* View Mode Toggle Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold font-serif" style={{ color: 'var(--theme-text)' }}>
            Meal Schedule &amp; Daily Menu
          </h2>
          <p className="text-xs text-stone-500">
            View detailed meals for a single day or check the full 7-day calendar overview.
          </p>
        </div>

        <div
          className="flex rounded-xl p-1 border text-xs font-semibold self-start sm:self-auto"
          style={{
            backgroundColor: 'var(--theme-subtle)',
            borderColor: 'var(--theme-border)',
          }}
        >
          <button
            type="button"
            onClick={() => setViewMode('day')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg cursor-pointer transition-all ${
              viewMode === 'day'
                ? 'bg-white shadow-xs font-bold text-stone-855'
                : 'opacity-70 hover:opacity-100 text-stone-500'
            }`}
            style={viewMode === 'day' ? { color: 'var(--theme-text)' } : undefined}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Single Day</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('week')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg cursor-pointer transition-all ${
              viewMode === 'week'
                ? 'bg-white shadow-xs font-bold text-stone-855'
                : 'opacity-70 hover:opacity-100 text-stone-500'
            }`}
            style={viewMode === 'week' ? { color: 'var(--theme-text)' } : undefined}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Week Grid</span>
          </button>
        </div>
      </div>

      {viewMode === 'day' ? (
        <>
          {/* 7-Day Day Selector Bar */}
          <div
            className="rounded-2xl p-2 sm:p-3 border shadow-xs transition-colors"
            style={{
              backgroundColor: 'var(--theme-surface, #FFFFFF)',
              borderColor: 'var(--theme-border, #E2E8F0)',
            }}
          >
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {days.map((day, idx) => {
                const isSelected = idx === selectedDayIndex;
                return (
                  <button
                    key={day.dayNumber}
                    onClick={() => setSelectedDayIndex(idx)}
                    className={`flex flex-col items-center justify-center py-2.5 sm:py-3.5 px-1 rounded-xl transition-all cursor-pointer ${
                      isSelected ? 'shadow-md scale-[1.02] font-semibold' : 'hover:opacity-80'
                    }`}
                    style={{
                      backgroundColor: isSelected ? 'var(--theme-btn-bg, #0F172A)' : 'transparent',
                      color: isSelected ? 'var(--theme-btn-text, #FFFFFF)' : 'var(--theme-text, #0F172A)',
                    }}
                  >
                    <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider opacity-80">
                      {day.dayName.slice(0, 3)}
                    </span>
                    <span className="text-sm sm:text-base font-bold my-0.5">
                      Day {day.dayNumber}
                    </span>
                    <span
                      className="text-[10px] sm:text-[11px] font-medium opacity-90"
                    >
                      {formatCurrency(day.dayEstimatedCost, currency)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Day Overview Banner */}
          <div
            className="rounded-2xl border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"
            style={{
              backgroundColor: 'var(--theme-subtle, #F1F5F9)',
              borderColor: 'var(--theme-border, #E2E8F0)',
            }}
          >
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold font-serif" style={{ color: 'var(--theme-text, #0F172A)' }}>
                  {activeDay.dayName} Diet Schedule
                </h2>
                <span
                  className="px-2 py-0.5 text-xs font-semibold rounded-md border"
                  style={{
                    backgroundColor: 'var(--theme-primary-light, #EFF6FF)',
                    borderColor: 'var(--theme-border, #E2E8F0)',
                    color: 'var(--theme-primary-text, #1E40AF)',
                  }}
                >
                  {formatCalories(activeDay.totalDayMacros.calories)}
                </span>
              </div>
              {activeDay.dailyWasteSaverNote && (
                <p className="text-xs sm:text-sm flex items-center gap-1.5 mt-1.5 font-medium" style={{ color: 'var(--theme-accent-text, #065F46)' }}>
                  <Leaf className="w-4 h-4 shrink-0" style={{ color: 'var(--theme-accent, #059669)' }} />
                  <span>{activeDay.dailyWasteSaverNote}</span>
                </p>
              )}
            </div>

            {/* Daily Macros Pill Cluster */}
            <div
              className="flex items-center gap-2 text-xs font-medium px-3.5 py-2 rounded-xl border shrink-0 transition-colors"
              style={{
                backgroundColor: 'var(--theme-surface, #FFFFFF)',
                borderColor: 'var(--theme-border, #E2E8F0)',
                color: 'var(--theme-text, #0F172A)',
              }}
            >
              <div className="text-center px-1.5">
                <span className="block text-[10px] uppercase" style={{ color: 'var(--theme-text-muted, #64748B)' }}>Protein</span>
                <span className="font-bold">{formatGrams(activeDay.totalDayMacros.protein)}</span>
              </div>
              <div className="w-px h-6" style={{ backgroundColor: 'var(--theme-border, #E2E8F0)' }} />
              <div className="text-center px-1.5">
                <span className="block text-[10px] uppercase" style={{ color: 'var(--theme-text-muted, #64748B)' }}>Carbs</span>
                <span className="font-bold">{formatGrams(activeDay.totalDayMacros.carbs)}</span>
              </div>
              <div className="w-px h-6" style={{ backgroundColor: 'var(--theme-border, #E2E8F0)' }} />
              <div className="text-center px-1.5">
                <span className="block text-[10px] uppercase" style={{ color: 'var(--theme-text-muted, #64748B)' }}>Fat</span>
                <span className="font-bold">{formatGrams(activeDay.totalDayMacros.fat)}</span>
              </div>
              {activeDay.totalDayMacros.fiber !== undefined && (
                <>
                  <div className="w-px h-6" style={{ backgroundColor: 'var(--theme-border, #E2E8F0)' }} />
                  <div className="text-center px-1.5">
                    <span className="block text-[10px] uppercase" style={{ color: 'var(--theme-text-muted, #64748B)' }}>Fiber</span>
                    <span className="font-bold" style={{ color: 'var(--theme-accent, #059669)' }}>{formatGrams(activeDay.totalDayMacros.fiber)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 4 Daily Meal Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {mealList.map(({ key, meal, label, bgBadge }) => {
              const totalTime = meal.prepTimeMinutes + meal.cookTimeMinutes;
              const mealPriceInfo = getMealPricePer100g(meal);

              return (
                <div
                  key={key}
                  onClick={() => onSelectMeal(meal, activeDay.dayName)}
                  className="group rounded-2xl border p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                  style={{
                    backgroundColor: 'var(--theme-surface, #FFFFFF)',
                    borderColor: 'var(--theme-border, #E2E8F0)',
                  }}
                >
                  <div>
                    {/* Card Header: Meal Label + Price & Price per 100g */}
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${bgBadge}`}
                        >
                          {label}
                        </span>
                        <span className="flex items-center text-xs font-medium" style={{ color: 'var(--theme-text-muted, #64748B)' }}>
                          <Clock className="w-3.5 h-3.5 mr-1 opacity-70" />
                          {totalTime > 0 ? `${totalTime} min` : '5 min'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span
                          className="text-xs sm:text-sm font-bold border px-2.5 py-1 rounded-lg"
                          style={{
                            backgroundColor: 'var(--theme-subtle, #F1F5F9)',
                            borderColor: 'var(--theme-border, #E2E8F0)',
                            color: 'var(--theme-text, #0F172A)',
                          }}
                        >
                          {formatCurrency(meal.estimatedCost, currency)}
                        </span>
                        <span
                          className="text-[10px] sm:text-[11px] font-bold border px-2 py-1 rounded-lg shrink-0"
                          style={{
                            backgroundColor: 'var(--theme-primary-light, #EFF6FF)',
                            borderColor: 'var(--theme-border, #E2E8F0)',
                            color: 'var(--theme-primary-text, #1E40AF)',
                          }}
                          title="Estimated price per 100g cooked portion"
                        >
                          {formatPricePer100g(mealPriceInfo.pricePer100g, undefined, currency)}
                        </span>
                      </div>
                    </div>

                    {/* Meal Title & Description */}
                    <h3
                      className="text-base sm:text-lg font-bold font-serif line-clamp-1 transition-colors group-hover:opacity-80"
                      style={{ color: 'var(--theme-text, #0F172A)' }}
                    >
                      {meal.name}
                    </h3>
                    <p
                      className="text-xs line-clamp-2 mt-1 leading-relaxed"
                      style={{ color: 'var(--theme-text-muted, #475569)' }}
                    >
                      {meal.description}
                    </p>

                    {/* Macro Badges Row */}
                    <div
                      className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t"
                      style={{ borderColor: 'var(--theme-border-subtle, #E2E8F0)' }}
                    >
                      <span
                        className="text-[11px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1"
                        style={{
                          backgroundColor: 'var(--theme-subtle, #F1F5F9)',
                          color: 'var(--theme-text, #0F172A)',
                        }}
                      >
                        <Flame className="w-3 h-3 text-rose-500" />
                        {formatCalories(meal.macros.calories)}
                      </span>
                      <span
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-md"
                        style={{
                          backgroundColor: 'var(--theme-primary-light, #EFF6FF)',
                          color: 'var(--theme-primary-text, #1E40AF)',
                        }}
                      >
                        {formatGrams(meal.macros.protein)} Protein
                      </span>
                      <span
                        className="text-[11px] font-medium px-2 py-0.5 rounded-md"
                        style={{
                          backgroundColor: 'var(--theme-subtle, #F1F5F9)',
                          color: 'var(--theme-text-muted, #475569)',
                        }}
                      >
                        {formatGrams(meal.macros.carbs)} Carbs
                      </span>
                      <span
                        className="text-[11px] font-medium px-2 py-0.5 rounded-md"
                        style={{
                          backgroundColor: 'var(--theme-subtle, #F1F5F9)',
                          color: 'var(--theme-text-muted, #475569)',
                        }}
                      >
                        {formatGrams(meal.macros.fat)} Fat
                      </span>
                    </div>

                    {/* Ingredients & Crossover Waste-Saver Highlight */}
                    <div className="mt-3 space-y-1.5">
                      <div
                        className="text-[11px] font-semibold uppercase tracking-wider"
                        style={{ color: 'var(--theme-text-muted, #64748B)' }}
                      >
                        Key Ingredients ({meal.ingredients.length}):
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {meal.ingredients.slice(0, 4).map((ing, iIdx) => (
                          <span
                            key={iIdx}
                            className="text-[11px] px-2 py-0.5 rounded-md font-medium border"
                            style={{
                              backgroundColor: ing.isReusedInOtherMeals
                                ? 'var(--theme-primary-light, #EFF6FF)'
                                : 'var(--theme-subtle, #F1F5F9)',
                              color: ing.isReusedInOtherMeals
                                ? 'var(--theme-primary-text, #1E40AF)'
                                : 'var(--theme-text-muted, #475569)',
                              borderColor: 'var(--theme-border, #E2E8F0)',
                            }}
                          >
                            {ing.name}
                          </span>
                        ))}
                        {meal.ingredients.length > 4 && (
                          <span className="text-[11px] px-1.5 py-0.5" style={{ color: 'var(--theme-text-subtle, #94A3B8)' }}>
                            +{meal.ingredients.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Waste Saving Badge if available */}
                    {meal.wasteSavingTip && (
                      <div
                        className="mt-3 p-2.5 rounded-xl border text-[11px] flex items-start gap-1.5"
                        style={{
                          backgroundColor: 'var(--theme-accent-light, #FEF3C7)',
                          borderColor: 'var(--theme-border, #E2E8F0)',
                          color: 'var(--theme-accent-text, #92400E)',
                        }}
                      >
                        <Leaf className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: 'var(--theme-accent, #D97706)' }} />
                        <span className="line-clamp-1">{meal.wasteSavingTip}</span>
                      </div>
                    )}
                  </div>

                  {/* Bottom Action */}
                  <div
                    className="mt-4 pt-3 border-t flex items-center justify-between text-xs font-semibold"
                    style={{
                      borderColor: 'var(--theme-border-subtle, #E2E8F0)',
                      color: 'var(--theme-primary, #1E3A8A)',
                    }}
                  >
                    <span>View Full Recipe &amp; Prep Steps</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        /* Week Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {days.map((day) => {
            const dayMeals = [
              { key: 'breakfast', meal: day.meals.breakfast, label: 'Breakfast', borderClass: 'border-l-4 border-amber-500' },
              { key: 'lunch', meal: day.meals.lunch, label: 'Lunch', borderClass: 'border-l-4 border-blue-500' },
              { key: 'dinner', meal: day.meals.dinner, label: 'Dinner', borderClass: 'border-l-4 border-slate-500' },
              { key: 'snack', meal: day.meals.snack, label: 'Snack / Fuel', borderClass: 'border-l-4 border-emerald-500' },
            ];

            return (
              <div
                key={day.dayNumber}
                className="rounded-2xl border p-4 shadow-2xs flex flex-col justify-between transition-all"
                style={{
                  backgroundColor: 'var(--theme-surface, #FFFFFF)',
                  borderColor: 'var(--theme-border, #E2E8F0)',
                }}
              >
                <div>
                  {/* Day Card Header */}
                  <div className="flex items-center justify-between pb-2 border-b mb-3" style={{ borderColor: 'var(--theme-border)' }}>
                    <div>
                      <h3 className="font-bold font-serif text-sm text-[var(--theme-text)]">
                        {day.dayName}
                      </h3>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400">
                        Day {day.dayNumber}
                      </span>
                    </div>
                    <span
                      className="px-2 py-0.5 text-[10px] font-bold rounded-lg border"
                      style={{
                        backgroundColor: 'var(--theme-subtle)',
                        borderColor: 'var(--theme-border)',
                        color: 'var(--theme-text)',
                      }}
                    >
                      {formatCurrency(day.dayEstimatedCost, currency)}
                    </span>
                  </div>

                  {/* Macros Summary for this day */}
                  <div className="flex items-center justify-between text-[10px] font-medium p-1.5 rounded-xl bg-black/5 mb-3">
                    <span className="flex items-center gap-0.5"><Flame className="w-3 h-3 text-rose-500" /> {formatCalories(day.totalDayMacros.calories)}</span>
                    <span>P: <strong>{formatGrams(day.totalDayMacros.protein)}</strong></span>
                    <span>C: <strong>{formatGrams(day.totalDayMacros.carbs)}</strong></span>
                    <span>F: <strong>{formatGrams(day.totalDayMacros.fat)}</strong></span>
                  </div>

                  {/* 4 Compact Meals List */}
                  <div className="space-y-2">
                    {dayMeals.map(({ key, meal, label, borderClass }) => {
                      if (!meal) return null;
                      const totalTime = meal.prepTimeMinutes + meal.cookTimeMinutes;
                      return (
                        <div
                          key={key}
                          onClick={() => onSelectMeal(meal, day.dayName)}
                          className={`p-2 rounded-xl border bg-black/[0.01] hover:bg-black/[0.04] hover:scale-[1.01] transition-all cursor-pointer ${borderClass} flex flex-col justify-between gap-0.5`}
                          style={{
                            borderColor: 'var(--theme-border-subtle, #E2E8F0)',
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold text-stone-500 uppercase">{label}</span>
                            <span className="text-[9px] text-stone-400 font-medium">{totalTime > 0 ? `${totalTime}m` : '5m'}</span>
                          </div>
                          <h4 className="text-xs font-bold text-stone-850 line-clamp-1" style={{ color: 'var(--theme-text)' }}>
                            {meal.name}
                          </h4>
                          <div className="flex items-center justify-between text-[9px] text-stone-500 pt-0.5 border-t border-black/5">
                            <span>{formatCurrency(meal.estimatedCost, currency)}</span>
                            <span>{meal.macros.calories} kcal • {meal.macros.protein}g P</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Day Waste-Saver Tip at bottom */}
                {day.dailyWasteSaverNote && (
                  <div
                    className="mt-3 p-2 rounded-xl border text-[9px] font-medium flex items-start gap-1 leading-normal"
                    style={{
                      backgroundColor: 'var(--theme-accent-light, #FEF3C7)',
                      borderColor: 'var(--theme-border)',
                      color: 'var(--theme-accent-text, #92400E)',
                    }}
                  >
                    <Leaf className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                    <span className="line-clamp-2">{day.dailyWasteSaverNote}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

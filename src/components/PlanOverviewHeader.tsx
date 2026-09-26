import React, { useState } from 'react';
import {
  Sparkles,
  Printer,
  ChevronDown,
  ChevronUp,
  Zap,
  Users,
  Flame,
  Wallet,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';
import { DietPlan } from '../types';
import { formatCurrency, formatCalories } from '../utils/formatters';

interface PlanOverviewHeaderProps {
  plan: DietPlan;
  onOpenGenerator: () => void;
  onPrint: () => void;
  onSelectTier: (tier: 'thrifty' | 'balanced' | 'gourmet') => void;
}

export const PlanOverviewHeader: React.FC<PlanOverviewHeaderProps> = ({
  plan,
  onOpenGenerator,
  onPrint,
  onSelectTier,
}) => {
  const [showStrategies, setShowStrategies] = useState(false);

  const avgCostPerDay = plan.estimatedWeeklyCost / 7;
  const avgCostPerMeal = plan.estimatedWeeklyCost / 28;

  return (
    <div
      className="rounded-2xl border p-4 sm:p-6 md:p-7 shadow-xs mb-8 transition-colors"
      style={{
        backgroundColor: 'var(--theme-surface)',
        borderColor: 'var(--theme-border)',
        color: 'var(--theme-text)',
      }}
    >
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5 sm:gap-6">
        {/* Left Column: Title & Tags */}
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span
              className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded-lg border"
              style={{
                backgroundColor: 'var(--theme-primary-light)',
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-primary-text)',
              }}
            >
              {plan.dietType} Diet
            </span>
            <span
              className="px-2.5 py-1 text-xs font-semibold capitalize rounded-lg border flex items-center gap-1"
              style={{
                backgroundColor: 'var(--theme-accent-light)',
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-accent-text)',
              }}
            >
              <Wallet className="w-3 h-3" />
              {plan.budgetTier} Tier
            </span>
            <span
              className="px-2.5 py-1 text-xs font-medium rounded-lg border flex items-center gap-1"
              style={{
                backgroundColor: 'var(--theme-subtle)',
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-text-muted)',
              }}
            >
              <Users className="w-3 h-3" />
              {plan.householdSize} {plan.householdSize === 1 ? 'Person' : 'People'}
            </span>
            <span
              className="px-2.5 py-1 text-xs font-medium rounded-lg border flex items-center gap-1"
              style={{
                backgroundColor: 'var(--theme-subtle)',
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-text-muted)',
              }}
            >
              <Flame className="w-3 h-3 text-amber-700" />
              {formatCalories(plan.targetCalories)} / day
            </span>
          </div>

          <h1
            className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight font-serif"
            style={{ color: 'var(--theme-text)' }}
          >
            {plan.title}
          </h1>

          <p
            className="text-xs sm:text-sm leading-relaxed max-w-3xl"
            style={{ color: 'var(--theme-text-muted)' }}
          >
            {plan.summary}
          </p>
        </div>

        {/* Right Column: Actions & Quick Tier Switch */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-2.5 shrink-0">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              onClick={onPrint}
              className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-3 py-2 text-xs font-medium border rounded-xl transition-colors cursor-pointer hover:opacity-80"
              style={{
                backgroundColor: 'var(--theme-subtle)',
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-text)',
              }}
              title="Print or Save Plan as PDF"
            >
              <Printer className="w-3.5 h-3.5" style={{ color: 'var(--theme-text-muted)' }} />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={onOpenGenerator}
              className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
              style={{
                backgroundColor: 'var(--theme-btn-bg)',
                color: 'var(--theme-btn-text)',
              }}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>New AI Plan</span>
            </button>
          </div>

          {/* Budget Switcher Pills */}
          <div
            className="w-full sm:w-auto overflow-x-auto no-scrollbar flex items-center p-1 rounded-xl border text-xs"
            style={{
              backgroundColor: 'var(--theme-subtle)',
              borderColor: 'var(--theme-border)',
            }}
          >
            <span
              className="text-[11px] font-semibold px-2 shrink-0"
              style={{ color: 'var(--theme-text-muted)' }}
            >
              Budget:
            </span>
            <button
              onClick={() => onSelectTier('thrifty')}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
                plan.budgetTier === 'thrifty' ? 'shadow-xs font-bold' : 'hover:opacity-80'
              }`}
              style={{
                backgroundColor: plan.budgetTier === 'thrifty' ? 'var(--theme-surface)' : 'transparent',
                color: plan.budgetTier === 'thrifty' ? 'var(--theme-text)' : 'var(--theme-text-muted)',
              }}
            >
              Thrifty {plan.currency === '$' ? '($35-50)' : '(₹800-1.1k)'}
            </button>
            <button
              onClick={() => onSelectTier('balanced')}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
                plan.budgetTier === 'balanced' ? 'shadow-xs font-bold' : 'hover:opacity-80'
              }`}
              style={{
                backgroundColor: plan.budgetTier === 'balanced' ? 'var(--theme-surface)' : 'transparent',
                color: plan.budgetTier === 'balanced' ? 'var(--theme-text)' : 'var(--theme-text-muted)',
              }}
            >
              Balanced {plan.currency === '$' ? '($60-80)' : '(₹1.1k-1.6k)'}
            </button>
            <button
              onClick={() => onSelectTier('gourmet')}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
                plan.budgetTier === 'gourmet' ? 'shadow-xs font-bold' : 'hover:opacity-80'
              }`}
              style={{
                backgroundColor: plan.budgetTier === 'gourmet' ? 'var(--theme-surface)' : 'transparent',
                color: plan.budgetTier === 'gourmet' ? 'var(--theme-text)' : 'var(--theme-text-muted)',
              }}
            >
              Gourmet {plan.currency === '$' ? '($90+)' : '(₹1.6k-2.5k)'}
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Bar */}
      <div
        className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 mt-6 pt-6 border-t"
        style={{ borderColor: 'var(--theme-border)' }}
      >
        <div
          className="rounded-xl p-3 sm:p-3.5 border"
          style={{
            backgroundColor: 'var(--theme-subtle)',
            borderColor: 'var(--theme-border)',
          }}
        >
          <div
            className="flex items-center space-x-1 text-xs font-medium"
            style={{ color: 'var(--theme-primary-text)' }}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Weekly Budget</span>
          </div>
          <div
            className="text-lg sm:text-xl font-bold mt-1"
            style={{ color: 'var(--theme-text)' }}
          >
            {formatCurrency(plan.estimatedWeeklyCost, plan.currency)}
          </div>
          <div
            className="text-[11px] mt-0.5"
            style={{ color: 'var(--theme-text-muted)' }}
          >
            ~{formatCurrency(avgCostPerDay, plan.currency)} / day
          </div>
        </div>

        <div
          className="rounded-xl p-3 sm:p-3.5 border"
          style={{
            backgroundColor: 'var(--theme-accent-light)',
            borderColor: 'var(--theme-border)',
          }}
        >
          <div
            className="flex items-center space-x-1 text-xs font-medium"
            style={{ color: 'var(--theme-accent-text)' }}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Cost Per Meal</span>
          </div>
          <div
            className="text-lg sm:text-xl font-bold mt-1"
            style={{ color: 'var(--theme-accent-text)' }}
          >
            {formatCurrency(avgCostPerMeal, plan.currency)}
          </div>
          <div
            className="text-[11px] mt-0.5"
            style={{ color: 'var(--theme-accent-text)' }}
          >
            28 planned daily meals &amp; snacks
          </div>
        </div>

        <div
          className="rounded-xl p-3 sm:p-3.5 border"
          style={{
            backgroundColor: 'var(--theme-subtle)',
            borderColor: 'var(--theme-border)',
          }}
        >
          <div
            className="flex items-center space-x-1 text-xs font-medium"
            style={{ color: 'var(--theme-text-muted)' }}
          >
            <Flame className="w-3.5 h-3.5 text-amber-700" />
            <span>Daily Calorie Target</span>
          </div>
          <div
            className="text-lg sm:text-xl font-bold mt-1"
            style={{ color: 'var(--theme-text)' }}
          >
            {formatCalories(plan.targetCalories)}
          </div>
          <div
            className="text-[11px] mt-0.5"
            style={{ color: 'var(--theme-text-muted)' }}
          >
            Balanced macro distribution
          </div>
        </div>

        <div
          className="rounded-xl p-3 sm:p-3.5 border"
          style={{
            backgroundColor: 'var(--theme-subtle)',
            borderColor: 'var(--theme-border)',
          }}
        >
          <div
            className="flex items-center space-x-1 text-xs font-medium"
            style={{ color: 'var(--theme-text-muted)' }}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-800" />
            <span>Plan Completeness</span>
          </div>
          <div
            className="text-lg sm:text-xl font-bold mt-1"
            style={{ color: 'var(--theme-text)' }}
          >
            7 Days Ready
          </div>
          <div
            className="text-[11px] mt-0.5"
            style={{ color: 'var(--theme-text-muted)' }}
          >
            Breakfast, Lunch, Dinner &amp; Snack
          </div>
        </div>
      </div>

      {/* Expandable Meal Prep Guide & Nutrition Tips */}
      <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--theme-border)' }}>
        <button
          onClick={() => setShowStrategies(!showStrategies)}
          className="w-full flex items-center justify-between text-xs font-semibold transition-colors py-1 cursor-pointer"
          style={{ color: 'var(--theme-text)' }}
        >
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4" style={{ color: 'var(--theme-primary)' }} />
            <span>Meal Prep Guide & Dietary Tactics ({plan.bulkPrepTips.length + plan.zeroWasteStrategy.length} tips)</span>
          </span>
          {showStrategies ? (
            <ChevronUp className="w-4 h-4" style={{ color: 'var(--theme-text-subtle)' }} />
          ) : (
            <ChevronDown className="w-4 h-4" style={{ color: 'var(--theme-text-subtle)' }} />
          )}
        </button>

        {showStrategies && (
          <div
            className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl border text-xs animate-in fade-in duration-200"
            style={{
              backgroundColor: 'var(--theme-subtle)',
              borderColor: 'var(--theme-border)',
            }}
          >
            <div>
              <h4
                className="font-bold flex items-center gap-1.5 mb-2"
                style={{ color: 'var(--theme-text)' }}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--theme-primary)' }}></span>
                Weekly Meal Strategy:
              </h4>
              <ul className="space-y-1.5 list-disc list-inside" style={{ color: 'var(--theme-text-muted)' }}>
                {plan.zeroWasteStrategy.map((tip, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4
                className="font-bold flex items-center gap-1.5 mb-2"
                style={{ color: 'var(--theme-text)' }}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--theme-accent)' }}></span>
                Batch Cooking & Prep Tactics:
              </h4>
              <ul className="space-y-1.5 list-disc list-inside" style={{ color: 'var(--theme-text-muted)' }}>
                {plan.bulkPrepTips.map((prep, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {prep}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

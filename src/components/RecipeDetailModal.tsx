import React, { useState } from 'react';
import {
  X,
  Clock,
  Flame,
  ChefHat,
  Sparkles,
  CheckCircle2,
  Copy,
  Printer,
  Heart,
  Utensils,
  Share2,
  Plus,
  Minus,
  Check,
  Award,
  Lightbulb,
} from 'lucide-react';
import { Recipe } from '../types';
import { formatCurrency, getRecipeImage } from '../utils/formatters';

interface RecipeDetailModalProps {
  recipe: Recipe;
  currency: string;
  onClose: () => void;
  onAddToFavorites?: (recipe: Recipe) => void;
  isFavorite?: boolean;
}

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({
  recipe,
  currency,
  onClose,
  onAddToFavorites,
  isFavorite = false,
}) => {
  const [servings, setServings] = useState(recipe.servings || 1);
  const [checkedIngredients, setCheckedIngredients] = useState<Record<number, boolean>>({});
  const [copied, setCopied] = useState(false);

  const baseServings = recipe.servings || 1;
  const servingMultiplier = servings / baseServings;

  // Scale ingredient amounts if possible
  const scaleAmount = (amountStr: string) => {
    if (servingMultiplier === 1) return amountStr;
    // Attempt to parse leading numbers or fractions
    return amountStr.replace(/(\d+(\.\d+)?)/g, (match) => {
      const num = parseFloat(match);
      if (isNaN(num)) return match;
      const scaled = num * servingMultiplier;
      return Number.isInteger(scaled) ? scaled.toString() : scaled.toFixed(1);
    });
  };

  const toggleIngredient = (idx: number) => {
    setCheckedIngredients((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleCopyRecipe = () => {
    const text = `🍳 ${recipe.name} (${recipe.category} • ${recipe.cuisine})
⏱️ Time: ${recipe.totalTimeMinutes || recipe.prepTimeMinutes + recipe.cookTimeMinutes} mins | 🍽️ Servings: ${servings}
🔥 Calories: ${Math.round(recipe.macros.calories * servingMultiplier)} kcal | Protein: ${Math.round(recipe.macros.protein * servingMultiplier)}g | Carbs: ${Math.round(recipe.macros.carbs * servingMultiplier)}g | Fat: ${Math.round(recipe.macros.fat * servingMultiplier)}g

📋 INGREDIENTS:
${recipe.ingredients.map((ing) => `- ${scaleAmount(ing.amount)} ${ing.name}`).join('\n')}

👨‍🍳 INSTRUCTIONS:
${recipe.instructions.map((step, i) => `${i + 1}. ${step}`).join('\n')}

💡 CHEF'S TIP:
${recipe.chefTips?.join('\n') || 'Enjoy fresh and warm!'}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const scaledCalories = Math.round(recipe.macros.calories * servingMultiplier);
  const scaledProtein = Math.round(recipe.macros.protein * servingMultiplier);
  const scaledCarbs = Math.round(recipe.macros.carbs * servingMultiplier);
  const scaledFat = Math.round(recipe.macros.fat * servingMultiplier);
  const scaledCost = Math.round(recipe.estimatedCost * servingMultiplier);

  return (
    <div
      id="recipe-detail-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="recipe-detail-modal-card"
        className="relative w-full max-w-3xl rounded-3xl border shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150"
        style={{
          backgroundColor: 'var(--theme-surface)',
          borderColor: 'var(--theme-border)',
          color: 'var(--theme-text)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div
          className="p-5 sm:p-6 border-b flex items-start justify-between relative"
          style={{
            borderColor: 'var(--theme-border)',
            backgroundColor: 'var(--theme-subtle)',
          }}
        >
          <div className="space-y-1.5 pr-8">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider text-white"
                style={{ backgroundColor: 'var(--theme-primary)' }}
              >
                {recipe.category}
              </span>
              <span
                className="px-2 py-0.5 rounded-md text-xs font-semibold border"
                style={{
                  backgroundColor: 'var(--theme-surface)',
                  borderColor: 'var(--theme-border)',
                  color: 'var(--theme-text-muted)',
                }}
              >
                {recipe.cuisine}
              </span>
              {recipe.difficulty && (
                <span
                  className="px-2 py-0.5 rounded-md text-xs font-semibold border"
                  style={{
                    backgroundColor: 'var(--theme-surface)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text-muted)',
                  }}
                >
                  {recipe.difficulty}
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif leading-tight">
              {recipe.name}
            </h2>
            <p className="text-xs sm:text-sm font-medium" style={{ color: 'var(--theme-text-muted)' }}>
              {recipe.description}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl border transition-all hover:opacity-80 cursor-pointer"
            style={{
              backgroundColor: 'var(--theme-surface)',
              borderColor: 'var(--theme-border)',
              color: 'var(--theme-text-muted)',
            }}
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Recipe Hero Image */}
          <div className="relative w-full h-48 sm:h-64 rounded-2xl overflow-hidden border bg-stone-100 dark:bg-stone-800" style={{ borderColor: 'var(--theme-border)' }}>
            <img
              src={getRecipeImage(recipe)}
              alt={recipe.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
              <span className="text-white text-xs font-semibold px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-xs">
                📸 {recipe.name}
              </span>
            </div>
          </div>

          {/* Quick Metrics Bar & Servings Adjuster */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            <div
              className="p-3 rounded-2xl border flex items-center space-x-3"
              style={{
                backgroundColor: 'var(--theme-subtle)',
                borderColor: 'var(--theme-border)',
              }}
            >
              <Clock className="w-5 h-5 text-amber-700 shrink-0" />
              <div>
                <p className="text-[10px] font-medium" style={{ color: 'var(--theme-text-muted)' }}>
                  Total Time
                </p>
                <p className="text-sm font-bold">
                  {recipe.totalTimeMinutes || recipe.prepTimeMinutes + recipe.cookTimeMinutes} mins
                </p>
              </div>
            </div>

            <div
              className="p-3 rounded-2xl border flex items-center space-x-3"
              style={{
                backgroundColor: 'var(--theme-subtle)',
                borderColor: 'var(--theme-border)',
              }}
            >
              <Flame className="w-5 h-5 text-orange-600 shrink-0" />
              <div>
                <p className="text-[10px] font-medium" style={{ color: 'var(--theme-text-muted)' }}>
                  Energy
                </p>
                <p className="text-sm font-bold">{scaledCalories} kcal</p>
              </div>
            </div>

            <div
              className="p-3 rounded-2xl border flex items-center space-x-3"
              style={{
                backgroundColor: 'var(--theme-subtle)',
                borderColor: 'var(--theme-border)',
              }}
            >
              <Utensils className="w-5 h-5 text-emerald-700 shrink-0" />
              <div>
                <p className="text-[10px] font-medium" style={{ color: 'var(--theme-text-muted)' }}>
                  Est. Cost
                </p>
                <p className="text-sm font-bold">
                  {formatCurrency(scaledCost, currency || recipe.currency || '₹')}
                </p>
              </div>
            </div>

            {/* Servings Counter */}
            <div
              className="p-2.5 sm:p-3 rounded-2xl border flex items-center justify-between"
              style={{
                backgroundColor: 'var(--theme-subtle)',
                borderColor: 'var(--theme-border)',
              }}
            >
              <div>
                <p className="text-[10px] font-medium" style={{ color: 'var(--theme-text-muted)' }}>
                  Servings
                </p>
                <p className="text-sm font-bold">{servings} {servings === 1 ? 'portion' : 'portions'}</p>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => setServings((s) => Math.max(1, s - 1))}
                  disabled={servings <= 1}
                  className="w-6 h-6 rounded-lg border flex items-center justify-center font-bold text-xs cursor-pointer hover:bg-black/5 disabled:opacity-30"
                  style={{ borderColor: 'var(--theme-border)' }}
                >
                  <Minus className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => setServings((s) => Math.min(12, s + 1))}
                  className="w-6 h-6 rounded-lg border flex items-center justify-center font-bold text-xs cursor-pointer hover:bg-black/5"
                  style={{ borderColor: 'var(--theme-border)' }}
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Macronutrients Detail Card */}
          <div
            className="p-4 rounded-2xl border space-y-3"
            style={{
              backgroundColor: 'var(--theme-subtle)',
              borderColor: 'var(--theme-border)',
            }}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--theme-text-muted)' }}>
                Nutritional Breakdown (Per {servings} {servings === 1 ? 'Serving' : 'Servings'})
              </h4>
              <span className="text-xs font-semibold" style={{ color: 'var(--theme-text-muted)' }}>
                100% Calculated
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2.5 rounded-xl border bg-white/40 dark:bg-black/20" style={{ borderColor: 'var(--theme-border)' }}>
                <p className="text-base sm:text-lg font-black text-amber-900 dark:text-amber-300">{scaledProtein}g</p>
                <p className="text-[10px] font-bold text-stone-500">Protein</p>
              </div>
              <div className="p-2.5 rounded-xl border bg-white/40 dark:bg-black/20" style={{ borderColor: 'var(--theme-border)' }}>
                <p className="text-base sm:text-lg font-black text-orange-900 dark:text-orange-300">{scaledCarbs}g</p>
                <p className="text-[10px] font-bold text-stone-500">Carbs</p>
              </div>
              <div className="p-2.5 rounded-xl border bg-white/40 dark:bg-black/20" style={{ borderColor: 'var(--theme-border)' }}>
                <p className="text-base sm:text-lg font-black text-emerald-900 dark:text-emerald-300">{scaledFat}g</p>
                <p className="text-[10px] font-bold text-stone-500">Healthy Fats</p>
              </div>
              <div className="p-2.5 rounded-xl border bg-white/40 dark:bg-black/20" style={{ borderColor: 'var(--theme-border)' }}>
                <p className="text-base sm:text-lg font-black text-blue-900 dark:text-blue-300">{recipe.macros.fiber ? Math.round(recipe.macros.fiber * servingMultiplier) : 4}g</p>
                <p className="text-[10px] font-bold text-stone-500">Fiber</p>
              </div>
            </div>
          </div>

          {/* Dietary Tags */}
          {recipe.dietaryTags && recipe.dietaryTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-xs font-semibold mr-1" style={{ color: 'var(--theme-text-muted)' }}>
                Highlights:
              </span>
              {recipe.dietaryTags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-full text-xs font-semibold border"
                  style={{
                    backgroundColor: 'var(--theme-subtle)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text)',
                  }}
                >
                  ✨ {tag}
                </span>
              ))}
            </div>
          )}

          {/* Ingredients Section with Checklist */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold font-serif flex items-center space-x-2">
                <ChefHat className="w-4 h-4 text-amber-700" />
                <span>Ingredients Checklist</span>
              </h3>
              <span className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>
                Tap to check off items you have
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {recipe.ingredients.map((ing, idx) => {
                const isChecked = checkedIngredients[idx];
                return (
                  <div
                    key={idx}
                    onClick={() => toggleIngredient(idx)}
                    className={`p-3 rounded-xl border transition-all flex items-start space-x-3 cursor-pointer select-none ${
                      isChecked ? 'opacity-50 line-through bg-black/5' : 'hover:border-amber-700/50'
                    }`}
                    style={{
                      backgroundColor: isChecked ? 'transparent' : 'var(--theme-subtle)',
                      borderColor: 'var(--theme-border)',
                    }}
                  >
                    <div
                      className={`w-4 h-4 rounded-md border mt-0.5 flex items-center justify-center transition-colors shrink-0 ${
                        isChecked ? 'bg-amber-900 border-amber-900 text-white' : 'border-stone-400'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <div className="flex-1 text-xs">
                      <span className="font-bold text-amber-900 dark:text-amber-300 mr-1.5">
                        {scaleAmount(ing.amount)}
                      </span>
                      <span className="font-medium">{ing.name}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step-by-step Instructions */}
          <div className="space-y-3">
            <h3 className="text-base font-bold font-serif flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-700" />
              <span>Step-by-Step Cooking Instructions</span>
            </h3>

            <div className="space-y-2.5">
              {recipe.instructions.map((step, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl border flex items-start space-x-3.5"
                  style={{
                    backgroundColor: 'var(--theme-subtle)',
                    borderColor: 'var(--theme-border)',
                  }}
                >
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5"
                    style={{ backgroundColor: 'var(--theme-primary)' }}
                  >
                    {idx + 1}
                  </span>
                  <p className="text-xs sm:text-sm leading-relaxed font-medium pt-0.5">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Chef Tips & Health Benefits */}
          {(recipe.chefTips || recipe.healthBenefits) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {recipe.chefTips && recipe.chefTips.length > 0 && (
                <div
                  className="p-4 rounded-2xl border space-y-2"
                  style={{
                    backgroundColor: 'var(--theme-subtle)',
                    borderColor: 'var(--theme-border)',
                  }}
                >
                  <h4 className="text-xs font-bold flex items-center space-x-1.5 text-amber-900 dark:text-amber-300">
                    <Lightbulb className="w-4 h-4 text-amber-600" />
                    <span>Chef’s Pro Secrets</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-stone-600 dark:text-stone-300 list-disc list-inside">
                    {recipe.chefTips.map((tip, i) => (
                      <li key={i} className="leading-snug">{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {recipe.healthBenefits && recipe.healthBenefits.length > 0 && (
                <div
                  className="p-4 rounded-2xl border space-y-2"
                  style={{
                    backgroundColor: 'var(--theme-subtle)',
                    borderColor: 'var(--theme-border)',
                  }}
                >
                  <h4 className="text-xs font-bold flex items-center space-x-1.5 text-emerald-900 dark:text-emerald-300">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <span>Nutritionist Benefits</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-stone-600 dark:text-stone-300 list-disc list-inside">
                    {recipe.healthBenefits.map((b, i) => (
                      <li key={i} className="leading-snug">{b}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          className="p-4 sm:p-5 border-t flex flex-wrap items-center justify-between gap-2"
          style={{
            borderColor: 'var(--theme-border)',
            backgroundColor: 'var(--theme-surface)',
          }}
        >
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleCopyRecipe}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all hover:bg-black/5 cursor-pointer"
              style={{
                backgroundColor: 'var(--theme-subtle)',
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-text)',
              }}
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Recipe Copied!' : 'Copy Recipe'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all hover:bg-black/5 cursor-pointer hidden sm:flex"
              style={{
                backgroundColor: 'var(--theme-subtle)',
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-text)',
              }}
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>

            {recipe.sourceUrl && (
              <a
                href={recipe.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all hover:bg-black/5 cursor-pointer"
                style={{
                  backgroundColor: 'var(--theme-subtle)',
                  borderColor: 'var(--theme-border)',
                  color: 'var(--theme-text)',
                }}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Original Source</span>
              </a>
            )}

            {onAddToFavorites && (
              <button
                type="button"
                onClick={() => onAddToFavorites(recipe)}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  isFavorite ? 'text-red-600 bg-red-50 border-red-200' : 'hover:bg-black/5'
                }`}
                style={!isFavorite ? {
                  backgroundColor: 'var(--theme-subtle)',
                  borderColor: 'var(--theme-border)',
                  color: 'var(--theme-text)',
                } : undefined}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-600 text-red-600' : ''}`} />
                <span>{isFavorite ? 'Saved' : 'Save'}</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
            style={{
              backgroundColor: 'var(--theme-btn-bg)',
              color: 'var(--theme-btn-text)',
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search,
  ChefHat,
  Sparkles,
  Clock,
  Flame,
  Utensils,
  Filter,
  X,
  Plus,
  Heart,
  BookOpen,
  Apple,
  CookingPot,
  Scale,
  RefreshCw,
  Layers,
  CheckCircle2,
  Sparkle,
  Globe,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { Recipe } from '../types';
import { DEFAULT_RECIPES } from '../data/defaultRecipes';
import { RecipeDetailModal } from './RecipeDetailModal';
import { formatCurrency, getRecipeImage } from '../utils/formatters';

interface RecipesViewProps {
  currency?: string;
}

const CUISINES = [
  'All',
  'Indian',
  'Italian',
  'Mediterranean',
  'Mexican',
  'Asian',
  'American',
  'Thai',
  'Middle Eastern',
  'French',
  'Japanese',
];

export const RecipesView: React.FC<RecipesViewProps> = ({ currency = '₹' }) => {
  // Spoonacular fetched recipes
  const [spoonacularRecipes, setSpoonacularRecipes] = useState<Recipe[]>([]);
  const [isLoadingSpoonacular, setIsLoadingSpoonacular] = useState(false);
  const [spoonacularOffset, setSpoonacularOffset] = useState(0);
  const [hasMoreSpoonacular, setHasMoreSpoonacular] = useState(true);
  const [spoonacularError, setSpoonacularError] = useState<string | null>(null);

  // Local & custom saved recipes
  const [customRecipes, setCustomRecipes] = useState<Recipe[]>(() => {
    try {
      const saved = localStorage.getItem('craven_custom_recipes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDiet, setSelectedDiet] = useState<string>('All');
  const [selectedCuisine, setSelectedCuisine] = useState<string>('All');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<string>('All');
  const [showPantrySearch, setShowPantrySearch] = useState(false);
  const [pantryInput, setPantryInput] = useState('');

  // Favorites tracking
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('craven_favorite_recipes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Active viewing recipe
  const [activeModalRecipe, setActiveModalRecipe] = useState<Recipe | null>(null);

  // AI Generator state
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiGenError, setAiGenError] = useState<string | null>(null);

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const toggleFavorite = (recipe: Recipe) => {
    setFavoriteIds((prev) => {
      const isFav = prev.includes(recipe.id);
      const updated = isFav ? prev.filter((id) => id !== recipe.id) : [...prev, recipe.id];
      try {
        localStorage.setItem('craven_favorite_recipes', JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });
  };

  // Fetch Spoonacular Recipes from server endpoint
  const fetchSpoonacularRecipes = async (offset = 0, isAppend = false) => {
    setIsLoadingSpoonacular(true);
    setSpoonacularError(null);

    try {
      const params = new URLSearchParams({
        currency,
        number: '12',
        offset: String(offset),
      });

      if (searchQuery.trim()) {
        params.append('query', searchQuery.trim());
      }
      if (selectedCategory !== 'All' && selectedCategory !== 'Favorites') {
        params.append('type', selectedCategory);
      }
      if (selectedDiet !== 'All') {
        params.append('diet', selectedDiet);
      }
      if (selectedCuisine !== 'All') {
        params.append('cuisine', selectedCuisine);
      }
      if (pantryInput.trim()) {
        params.append('includeIngredients', pantryInput.trim());
      }
      if (selectedTimeFilter === '<15m') {
        params.append('maxReadyTime', '15');
      } else if (selectedTimeFilter === '<30m') {
        params.append('maxReadyTime', '30');
      }

      const res = await fetch(`/api/spoonacular/recipes?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Spoonacular API returned status ${res.status}`);
      }

      const data = await res.json();
      const recipes: Recipe[] = data.recipes || [];

      if (isAppend) {
        setSpoonacularRecipes((prev) => [...prev, ...recipes]);
      } else {
        setSpoonacularRecipes(recipes);
      }

      setSpoonacularOffset(offset + recipes.length);
      setHasMoreSpoonacular(recipes.length >= 12);
    } catch (err: any) {
      console.warn('Failed to load Spoonacular recipes:', err);
      setSpoonacularError(err.message || 'Error fetching recipes from Spoonacular');
      // If error on initial load, fallback to default recipes
      if (!isAppend && spoonacularRecipes.length === 0) {
        setSpoonacularRecipes(DEFAULT_RECIPES);
      }
    } finally {
      setIsLoadingSpoonacular(false);
    }
  };

  // Debounced trigger for search and filter changes
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      setSpoonacularOffset(0);
      fetchSpoonacularRecipes(0, false);
    }, 350);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [searchQuery, selectedCategory, selectedDiet, selectedCuisine, selectedTimeFilter, pantryInput, currency]);

  // Merge all recipe sources: Custom + Spoonacular + Defaults
  const combinedRecipes = useMemo(() => {
    const map = new Map<string, Recipe>();

    // 1. Custom AI generated recipes first
    customRecipes.forEach((r) => map.set(r.id, r));

    // 2. Spoonacular recipes
    spoonacularRecipes.forEach((r) => {
      if (!map.has(r.id)) {
        map.set(r.id, r);
      }
    });

    // 3. Fallback defaults if list is small
    if (map.size < 6) {
      DEFAULT_RECIPES.forEach((r) => {
        if (!map.has(r.id)) {
          map.set(r.id, r);
        }
      });
    }

    return Array.from(map.values());
  }, [customRecipes, spoonacularRecipes]);

  // Client-side filtering on combined list (e.g. for Favorites or instant feedback)
  const filteredRecipes = useMemo(() => {
    return combinedRecipes.filter((r) => {
      // Category / Favorites filter
      if (selectedCategory === 'Favorites') {
        if (!favoriteIds.includes(r.id)) return false;
      } else if (selectedCategory !== 'All' && r.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }

      // Diet tag filter
      if (selectedDiet !== 'All') {
        const hasTag = r.dietaryTags.some(
          (t) => t.toLowerCase() === selectedDiet.toLowerCase() || t.toLowerCase().includes(selectedDiet.toLowerCase())
        );
        if (!hasTag) return false;
      }

      // Cuisine filter
      if (selectedCuisine !== 'All') {
        if (!r.cuisine.toLowerCase().includes(selectedCuisine.toLowerCase())) {
          return false;
        }
      }

      // Time filter
      const totalTime = r.totalTimeMinutes || r.prepTimeMinutes + r.cookTimeMinutes;
      if (selectedTimeFilter === '<15m' && totalTime > 15) return false;
      if (selectedTimeFilter === '<30m' && totalTime > 30) return false;

      // Text search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inName = r.name.toLowerCase().includes(q);
        const inCuisine = r.cuisine.toLowerCase().includes(q);
        const inDesc = r.description.toLowerCase().includes(q);
        const inTags = r.dietaryTags.some((t) => t.toLowerCase().includes(q));
        const inIngredients = r.ingredients.some((i) => i.name.toLowerCase().includes(q));
        if (!inName && !inCuisine && !inDesc && !inTags && !inIngredients) {
          return false;
        }
      }

      // Pantry ingredients search
      if (pantryInput.trim()) {
        const ingredientsList = pantryInput
          .toLowerCase()
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        if (ingredientsList.length > 0) {
          const matchAny = ingredientsList.some((item) =>
            r.ingredients.some((ing) => ing.name.toLowerCase().includes(item))
          );
          if (!matchAny) return false;
        }
      }

      return true;
    });
  }, [combinedRecipes, selectedCategory, selectedDiet, selectedCuisine, selectedTimeFilter, searchQuery, pantryInput, favoriteIds]);

  // AI Recipe Generator trigger
  const handleAiGenerateRecipe = async () => {
    const prompt = searchQuery.trim() || pantryInput.trim() || 'Healthy Chef High Protein Dish';
    setIsGeneratingAi(true);
    setAiGenError(null);

    try {
      const res = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: prompt,
          category: selectedCategory !== 'All' && selectedCategory !== 'Favorites' ? selectedCategory : undefined,
          dietType: selectedDiet !== 'All' ? selectedDiet : undefined,
          pantryIngredients: pantryInput.trim() || undefined,
          currency,
        }),
      });

      if (!res.ok) {
        throw new Error('Could not generate recipe. Please try again.');
      }

      const newRecipe: Recipe = await res.json();
      setCustomRecipes((prev) => {
        const updated = [newRecipe, ...prev];
        try {
          localStorage.setItem('craven_custom_recipes', JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });

      setActiveModalRecipe(newRecipe);
      setSearchQuery('');
    } catch (err: any) {
      console.error(err);
      setAiGenError(err.message || 'Error generating custom recipe.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const categories = ['All', 'Favorites', 'Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert', 'Beverage'];
  const diets = ['All', 'Vegetarian', 'High Protein', 'Vegan', 'Non-Veg', 'Keto', 'Gluten-Free', 'Quick & Easy'];

  return (
    <div className="space-y-6 animate-in fade-in duration-200" id="recipes-main-view">
      {/* Search Bar */}
      <div
        className="p-4 sm:p-5 rounded-3xl border shadow-xs transition-colors"
        style={{
          backgroundColor: 'var(--theme-surface)',
          borderColor: 'var(--theme-border)',
        }}
      >
        <div className="relative w-full">
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-stone-400" />
          <input
            id="recipe-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search recipes (e.g. Pasta, Butter Chicken, Oats, Salad, Salmon)..."
            className="w-full pl-11 pr-11 py-3 rounded-2xl border text-xs sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-amber-700/30 transition-all"
            style={{
              backgroundColor: 'var(--theme-subtle)',
              borderColor: 'var(--theme-border)',
              color: 'var(--theme-text)',
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-3.5 text-stone-400 hover:text-stone-700 cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category Pills & Diet Filters */}
      <div className="space-y-3">
        {/* Meal Type Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                  isSelected
                    ? 'text-white shadow-xs'
                    : 'hover:bg-black/5'
                }`}
                style={
                  isSelected
                    ? {
                        backgroundColor: 'var(--theme-primary)',
                        borderColor: 'var(--theme-primary)',
                      }
                    : {
                        backgroundColor: 'var(--theme-surface)',
                        borderColor: 'var(--theme-border)',
                        color: 'var(--theme-text-muted)',
                      }
                }
              >
                {cat === 'Favorites' ? `❤️ Saved (${favoriteIds.length})` : cat}
              </button>
            );
          })}
        </div>

        {/* Dietary Highlights Bar */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-stone-500 mr-1 flex items-center space-x-1">
            <Filter className="w-3 h-3 inline" />
            <span>Diet:</span>
          </span>
          {diets.map((diet) => {
            const isSelected = selectedDiet === diet;
            return (
              <button
                key={diet}
                type="button"
                onClick={() => setSelectedDiet(diet)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-amber-900 text-white border-amber-900 shadow-2xs'
                    : 'hover:border-stone-400'
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
                {diet}
              </button>
            );
          })}

          {/* Time Filter Chips */}
          <div className="ml-auto flex items-center space-x-1">
            {['All', '<15m', '<30m'].map((time) => {
              const isSelected = selectedTimeFilter === time;
              return (
                <button
                  key={time}
                  type="button"
                  onClick={() => setSelectedTimeFilter(time)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    isSelected ? 'font-bold underline' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: 'var(--theme-subtle)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text)',
                  }}
                >
                  <Clock className="w-3 h-3 inline mr-1" />
                  {time}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recipe Cards Count & Status */}
      <div className="flex items-center justify-between text-xs text-stone-500 px-1">
        <div className="flex items-center space-x-2">
          <span>
            Showing <strong>{filteredRecipes.length}</strong> {filteredRecipes.length === 1 ? 'recipe' : 'recipes'}
          </span>
          {isLoadingSpoonacular && (
            <span className="flex items-center space-x-1 text-amber-700 font-semibold">
              <RefreshCw className="w-3 h-3 animate-spin inline" />
              <span>Fetching from Spoonacular...</span>
            </span>
          )}
        </div>

        {(searchQuery || selectedCategory !== 'All' || selectedDiet !== 'All' || selectedCuisine !== 'All' || pantryInput) && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setSelectedDiet('All');
              setSelectedCuisine('All');
              setSelectedTimeFilter('All');
              setPantryInput('');
            }}
            className="text-amber-800 dark:text-amber-300 font-bold hover:underline cursor-pointer"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Recipe Grid */}
      {filteredRecipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRecipes.map((recipe) => {
            const isFav = favoriteIds.includes(recipe.id);
            const totalTime = recipe.totalTimeMinutes || recipe.prepTimeMinutes + recipe.cookTimeMinutes;
            const imgSrc = getRecipeImage(recipe);

            return (
              <div
                key={recipe.id}
                onClick={() => setActiveModalRecipe(recipe)}
                className="group p-4 sm:p-5 rounded-3xl border shadow-xs transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between overflow-hidden relative"
                style={{
                  backgroundColor: 'var(--theme-surface)',
                  borderColor: 'var(--theme-border)',
                }}
              >
                <div className="space-y-3">
                  {/* Recipe Image Card */}
                  <div className="relative w-full h-44 rounded-2xl overflow-hidden -mt-0.5 bg-stone-100 dark:bg-stone-800">
                    <img
                      src={imgSrc}
                      alt={recipe.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        // Fallback on image load error
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80';
                      }}
                    />

                    {/* Top Overlay Badges */}
                    <div className="absolute top-2.5 left-2.5 flex flex-wrap items-center gap-1.5 z-10">
                      <span
                        className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-white shadow-xs backdrop-blur-xs"
                        style={{ backgroundColor: 'var(--theme-primary)' }}
                      >
                        {recipe.category}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded-lg text-[10px] font-semibold text-white bg-black/50 backdrop-blur-xs border border-white/20 shadow-xs"
                      >
                        {recipe.cuisine}
                      </span>
                    </div>

                    {/* Favorite Button Overlay */}
                    <div className="absolute top-2.5 right-2.5 z-10">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(recipe);
                        }}
                        className={`p-2 rounded-full border shadow-sm backdrop-blur-xs transition-transform active:scale-90 cursor-pointer ${
                          isFav ? 'bg-white text-red-600 border-red-200' : 'bg-black/40 border-white/20 text-white hover:bg-black/60'
                        }`}
                        aria-label="Save to favorites"
                      >
                        <Heart className={`w-4 h-4 ${isFav ? 'fill-red-600 text-red-600' : ''}`} />
                      </button>
                    </div>

                    {/* Quick Time Badge on bottom-right of image */}
                    <div className="absolute bottom-2.5 right-2.5 z-10">
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold text-white bg-black/60 backdrop-blur-xs flex items-center gap-1 border border-white/10">
                        <Clock className="w-3 h-3 text-amber-300" />
                        <span>{totalTime}m</span>
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base sm:text-lg font-bold font-serif group-hover:text-amber-800 dark:group-hover:text-amber-300 transition-colors line-clamp-1">
                      {recipe.name}
                    </h3>
                    <p className="text-xs text-stone-500 font-medium line-clamp-2 mt-1 leading-relaxed">
                      {recipe.description}
                    </p>
                  </div>

                  {/* Key Stats Bar */}
                  <div
                    className="p-2.5 rounded-2xl border grid grid-cols-3 gap-1 text-center"
                    style={{
                      backgroundColor: 'var(--theme-subtle)',
                      borderColor: 'var(--theme-border)',
                    }}
                  >
                    <div>
                      <p className="text-[10px] font-medium text-stone-500 flex items-center justify-center">
                        <Clock className="w-3 h-3 mr-0.5 inline text-amber-700" />
                        Time
                      </p>
                      <p className="text-xs font-bold">{totalTime}m</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-stone-500 flex items-center justify-center">
                        <Flame className="w-3 h-3 mr-0.5 inline text-orange-600" />
                        Calories
                      </p>
                      <p className="text-xs font-bold">{recipe.macros.calories} kcal</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-stone-500 flex items-center justify-center">
                        <Scale className="w-3 h-3 mr-0.5 inline text-emerald-700" />
                        Protein
                      </p>
                      <p className="text-xs font-bold text-amber-900 dark:text-amber-300">{recipe.macros.protein}g</p>
                    </div>
                  </div>

                  {/* Dietary Tags preview */}
                  <div className="flex flex-wrap gap-1">
                    {recipe.dietaryTags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-md text-[10px] font-semibold border"
                        style={{
                          backgroundColor: 'var(--theme-subtle)',
                          borderColor: 'var(--theme-border)',
                          color: 'var(--theme-text-muted)',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                    {recipe.dietaryTags.length > 3 && (
                      <span className="text-[10px] text-stone-400 font-medium self-center">
                        +{recipe.dietaryTags.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Action Area */}
                <div className="pt-4 border-t mt-4 flex items-center justify-between" style={{ borderColor: 'var(--theme-border)' }}>
                  <div className="text-xs font-semibold" style={{ color: 'var(--theme-text-muted)' }}>
                    Est. {formatCurrency(recipe.estimatedCost, currency || recipe.currency || '₹')}
                  </div>

                  <button
                    type="button"
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all group-hover:bg-amber-900 group-hover:text-white group-hover:border-amber-900 cursor-pointer"
                    style={{
                      backgroundColor: 'var(--theme-subtle)',
                      borderColor: 'var(--theme-border)',
                      color: 'var(--theme-text)',
                    }}
                  >
                    <span>View Recipe</span>
                    <ChefHat className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div
          className="p-10 rounded-3xl border text-center space-y-4 max-w-lg mx-auto"
          style={{
            backgroundColor: 'var(--theme-surface)',
            borderColor: 'var(--theme-border)',
          }}
        >
          <div
            className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center text-amber-700"
            style={{ backgroundColor: 'var(--theme-subtle)' }}
          >
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold font-serif">No Recipes Found</h3>
            <p className="text-xs text-stone-500 mt-1">
              We couldn't find a matching recipe for "{searchQuery || pantryInput || selectedCategory}".
            </p>
          </div>
          <button
            type="button"
            onClick={handleAiGenerateRecipe}
            disabled={isGeneratingAi}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
            style={{
              backgroundColor: 'var(--theme-btn-bg)',
              color: 'var(--theme-btn-text)',
            }}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Generate This Custom Recipe with AI</span>
          </button>
        </div>
      )}

      {/* Load More Button for Spoonacular */}
      {hasMoreSpoonacular && !isLoadingSpoonacular && filteredRecipes.length > 0 && (
        <div className="flex justify-center pt-2 pb-6">
          <button
            type="button"
            onClick={() => fetchSpoonacularRecipes(spoonacularOffset, true)}
            className="flex items-center space-x-2 px-6 py-2.5 rounded-2xl border text-xs font-bold transition-all hover:bg-black/5 cursor-pointer shadow-2xs"
            style={{
              backgroundColor: 'var(--theme-surface)',
              borderColor: 'var(--theme-border)',
              color: 'var(--theme-text)',
            }}
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-700" />
            <span>Load More Spoonacular Recipes</span>
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {activeModalRecipe && (
        <RecipeDetailModal
          recipe={activeModalRecipe}
          currency={currency}
          onClose={() => setActiveModalRecipe(null)}
          onAddToFavorites={toggleFavorite}
          isFavorite={favoriteIds.includes(activeModalRecipe.id)}
        />
      )}
    </div>
  );
};

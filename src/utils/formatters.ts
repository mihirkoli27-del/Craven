export function formatCurrency(amount: number, currency: string = '₹'): string {
  const symbol = currency === '$' ? '₹' : currency;
  if (isNaN(amount) || amount === null || amount === undefined) {
    return `${symbol}0`;
  }
  // If amount is a whole number or cleanly rounded, format with commas
  if (Number.isInteger(amount)) {
    return `${symbol}${amount.toLocaleString('en-IN')}`;
  }
  return `${symbol}${amount.toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}`;
}

export function formatCalories(cal: number): string {
  return `${Math.round(cal).toLocaleString('en-IN')} kcal`;
}

export function formatGrams(g: number): string {
  return `${Math.round(g)}g`;
}

/**
 * Parses weight in grams or milliliters from strings like:
 * "150g", "200 g", "1 cup (240g)", "2 medium (120g)", "1 bowl (180g)", "2 eggs (100g)", "200ml", "1 tbsp (15g)"
 */
export function parseGramsFromAmount(amountStr: string): number {
  if (!amountStr) return 100;
  const str = amountStr.toLowerCase().trim();

  // Look for explicit grams in parentheses or direct: (150g), 150g, 150 grams, 150 gm
  const gramMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:g|gm|gms|gram|grams)\b/i);
  if (gramMatch) {
    return Math.max(5, parseFloat(gramMatch[1]));
  }

  // Look for explicit ml or liters
  const mlMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:ml|milliliter|milliliters)\b/i);
  if (mlMatch) {
    return Math.max(5, parseFloat(mlMatch[1]));
  }

  const literMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:l|liter|liters|litre|litres)\b/i);
  if (literMatch) {
    return Math.max(50, parseFloat(literMatch[1]) * 1000);
  }

  // Look for kg
  const kgMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:kg|kilo|kilogram)\b/i);
  if (kgMatch) {
    return Math.max(10, parseFloat(kgMatch[1]) * 1000);
  }

  // Common household measures
  if (str.includes('katori') || str.includes('bowl') || str.includes('cup')) {
    const qtyMatch = str.match(/(\d+(?:\.\d+)?)/);
    const count = qtyMatch ? parseFloat(qtyMatch[1]) : 1;
    return count * 150;
  }
  if (str.includes('glass') || str.includes('mug')) {
    const qtyMatch = str.match(/(\d+(?:\.\d+)?)/);
    const count = qtyMatch ? parseFloat(qtyMatch[1]) : 1;
    return count * 250;
  }
  if (str.includes('tbsp') || str.includes('tablespoon')) {
    const qtyMatch = str.match(/(\d+(?:\.\d+)?)/);
    const count = qtyMatch ? parseFloat(qtyMatch[1]) : 1;
    return count * 15;
  }
  if (str.includes('tsp') || str.includes('teaspoon')) {
    const qtyMatch = str.match(/(\d+(?:\.\d+)?)/);
    const count = qtyMatch ? parseFloat(qtyMatch[1]) : 1;
    return count * 5;
  }
  if (str.includes('scoop')) {
    const qtyMatch = str.match(/(\d+(?:\.\d+)?)/);
    const count = qtyMatch ? parseFloat(qtyMatch[1]) : 1;
    return count * 33;
  }
  if (str.includes('roti') || str.includes('chapati') || str.includes('paratha')) {
    const qtyMatch = str.match(/(\d+(?:\.\d+)?)/);
    const count = qtyMatch ? parseFloat(qtyMatch[1]) : 1;
    return count * 40;
  }
  if (str.includes('idli')) {
    const qtyMatch = str.match(/(\d+(?:\.\d+)?)/);
    const count = qtyMatch ? parseFloat(qtyMatch[1]) : 1;
    return count * 50;
  }
  if (str.includes('egg')) {
    const qtyMatch = str.match(/(\d+(?:\.\d+)?)/);
    const count = qtyMatch ? parseFloat(qtyMatch[1]) : 1;
    return count * 50;
  }
  if (str.includes('slice')) {
    const qtyMatch = str.match(/(\d+(?:\.\d+)?)/);
    const count = qtyMatch ? parseFloat(qtyMatch[1]) : 1;
    return count * 30;
  }
  if (str.includes('piece') || str.includes('pc')) {
    const qtyMatch = str.match(/(\d+(?:\.\d+)?)/);
    const count = qtyMatch ? parseFloat(qtyMatch[1]) : 1;
    return count * 60;
  }

  // Fallback default
  return 100;
}

/**
 * Computes price per 100g given a total price and weight in grams or amount string
 */
export function calculatePricePer100g(price: number, gramsOrAmount: number | string): number {
  if (!price || price <= 0) return 0;
  const grams = typeof gramsOrAmount === 'number' ? gramsOrAmount : parseGramsFromAmount(gramsOrAmount);
  if (grams <= 0) return 0;
  const p100 = (price / grams) * 100;
  return Math.round(p100 * 10) / 10;
}

/**
 * Formats price per 100g as "₹X / 100g"
 */
export function formatPricePer100g(
  price: number,
  gramsOrAmount?: number | string,
  currency: string = '₹'
): string {
  const symbol = currency === '$' ? '₹' : currency;
  if (!price || price <= 0) return `${symbol}0 / 100g`;

  let p100: number;
  if (gramsOrAmount !== undefined) {
    p100 = calculatePricePer100g(price, gramsOrAmount);
  } else {
    p100 = price;
  }

  if (p100 === 0) return `${symbol}0 / 100g`;
  if (Number.isInteger(p100)) {
    return `${symbol}${p100.toLocaleString('en-IN')} / 100g`;
  }
  return `${symbol}${p100.toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} / 100g`;
}

/**
 * Benchmark price per 100g dictionary for common ingredients to derive accurate ingredient prices
 */
const INGREDIENT_PRICE_BENCHMARKS: Record<string, number> = {
  // Grains & Flours (₹/100g)
  atta: 4.5,
  wheat: 4.5,
  rice: 5.5,
  basmati: 8.5,
  oats: 15.0,
  dalia: 5.0,
  poha: 5.5,
  besan: 8.0,
  suji: 5.0,
  rava: 5.0,
  ragi: 6.5,
  quinoa: 35.0,

  // Pulses & Dals (₹/100g)
  dal: 14.0,
  moong: 15.0,
  toor: 16.0,
  chana: 11.0,
  rajma: 14.0,
  sprouts: 12.0,
  soya: 10.0,
  tofu: 25.0,
  paneer: 38.0,

  // Animal Protein & Dairy (₹/100g)
  egg: 14.0,
  chicken: 32.0,
  fish: 40.0,
  milk: 6.5,
  curd: 7.5,
  dahi: 7.5,
  cheese: 55.0,
  whey: 220.0,

  // Nuts & Seeds (₹/100g)
  almonds: 90.0,
  badam: 90.0,
  walnuts: 120.0,
  akhrot: 120.0,
  peanuts: 16.0,
  chia: 80.0,
  flax: 35.0,
  seeds: 60.0,

  // Vegetables & Fruits (₹/100g)
  onion: 3.5,
  tomato: 4.0,
  potato: 3.0,
  spinach: 4.5,
  palak: 4.5,
  cucumber: 3.5,
  banana: 5.0,
  apple: 16.0,
  papaya: 4.0,
  lemon: 10.0,
  ginger: 12.0,
  garlic: 15.0,

  // Oils & Fats (₹/100g)
  ghee: 60.0,
  oil: 18.0,
  mustard: 17.0,
  olive: 85.0,
  butter: 52.0,
};

/**
 * Estimates ingredient individual price and price per 100g based on name and amount
 */
export function getIngredientPriceDetails(
  ingredient: {
    name: string;
    amount: string;
    estimatedPrice?: number;
    pricePer100g?: number;
  },
  mealTotalCost?: number,
  currency: string = '₹'
): {
  estimatedPrice: number;
  pricePer100g: number;
  formattedPrice: string;
  formattedPricePer100g: string;
  grams: number;
} {
  const grams = parseGramsFromAmount(ingredient.amount);
  let p100 = ingredient.pricePer100g;
  let price = ingredient.estimatedPrice;

  if (p100 === undefined || p100 === 0) {
    const lowerName = ingredient.name.toLowerCase();
    // Check benchmarks
    for (const [key, benchmarkRate] of Object.entries(INGREDIENT_PRICE_BENCHMARKS)) {
      if (lowerName.includes(key)) {
        p100 = benchmarkRate;
        break;
      }
    }
    if (!p100) {
      p100 = 12.0; // default standard healthy staple ₹12/100g
    }
  }

  if (price === undefined || price === 0) {
    price = Math.round(((p100 * grams) / 100) * 10) / 10;
  }

  // Double check p100 consistency
  if (p100 === undefined || p100 === 0) {
    p100 = calculatePricePer100g(price, grams);
  }

  return {
    estimatedPrice: price,
    pricePer100g: p100,
    formattedPrice: formatCurrency(price, currency),
    formattedPricePer100g: formatPricePer100g(p100, undefined, currency),
    grams,
  };
}

/**
 * Computes meal total weight and price per 100g
 */
export function getMealPricePer100g(
  meal: {
    estimatedCost: number;
    pricePer100g?: number;
    totalGrams?: number;
    ingredients?: { amount: string }[];
    macros?: { protein: number; carbs: number; fat: number };
  }
): { pricePer100g: number; totalGrams: number } {
  if (meal.pricePer100g && meal.pricePer100g > 0) {
    return {
      pricePer100g: meal.pricePer100g,
      totalGrams: meal.totalGrams || 250,
    };
  }

  let totalGrams = meal.totalGrams || 0;
  if (!totalGrams && meal.ingredients && meal.ingredients.length > 0) {
    totalGrams = meal.ingredients.reduce((sum, ing) => sum + parseGramsFromAmount(ing.amount), 0);
  }

  if (!totalGrams || totalGrams < 50) {
    // Estimate based on macros or typical meal weight
    if (meal.macros) {
      const macroGrams = meal.macros.protein + meal.macros.carbs + meal.macros.fat;
      totalGrams = Math.max(150, Math.round(macroGrams * 3.5)); // hydration multiplier
    } else {
      totalGrams = 250;
    }
  }

  const p100 = calculatePricePer100g(meal.estimatedCost, totalGrams);
  return { pricePer100g: p100, totalGrams };
}

const FALLBACK_CATEGORY_IMAGES: Record<string, string> = {
  Breakfast: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800&auto=format&fit=crop&q=80',
  Lunch: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
  Dinner: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80',
  Snack: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
  Dessert: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&auto=format&fit=crop&q=80',
  Beverage: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=800&auto=format&fit=crop&q=80',
};

export function getRecipeImage(recipe: { name: string; category?: string; imageUrl?: string }): string {
  if (recipe.imageUrl && recipe.imageUrl.trim() !== '') {
    return recipe.imageUrl;
  }
  const nameLower = recipe.name.toLowerCase();
  if (nameLower.includes('oat') || nameLower.includes('porridge')) {
    return 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=800&auto=format&fit=crop&q=80';
  }
  if (nameLower.includes('chicken') || nameLower.includes('poultry')) {
    return 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=800&auto=format&fit=crop&q=80';
  }
  if (nameLower.includes('salad') || nameLower.includes('bowl')) {
    return 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80';
  }
  if (nameLower.includes('dal') || nameLower.includes('curry') || nameLower.includes('soup') || nameLower.includes('stew') || nameLower.includes('lentil')) {
    return 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80';
  }
  if (nameLower.includes('smoothie') || nameLower.includes('shake') || nameLower.includes('juice')) {
    return 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=800&auto=format&fit=crop&q=80';
  }
  if (nameLower.includes('egg') || nameLower.includes('omelet') || nameLower.includes('scramble')) {
    return 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&auto=format&fit=crop&q=80';
  }
  if (nameLower.includes('paneer') || nameLower.includes('tofu') || nameLower.includes('tikka')) {
    return 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80';
  }
  if (nameLower.includes('fish') || nameLower.includes('salmon') || nameLower.includes('seafood')) {
    return 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&auto=format&fit=crop&q=80';
  }
  if (nameLower.includes('pasta') || nameLower.includes('noodle') || nameLower.includes('spaghetti')) {
    return 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&auto=format&fit=crop&q=80';
  }
  if (nameLower.includes('rice') || nameLower.includes('biryani') || nameLower.includes('pulao')) {
    return 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80';
  }
  if (recipe.category && FALLBACK_CATEGORY_IMAGES[recipe.category]) {
    return FALLBACK_CATEGORY_IMAGES[recipe.category];
  }
  return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80';
}


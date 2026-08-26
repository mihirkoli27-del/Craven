import { FoodScanResult } from '../types';
import { calculatePricePer100g, formatCurrency, formatPricePer100g } from '../utils/formatters';

export interface DatabaseFoodItem {
  id: string;
  name: string;
  hindiName?: string;
  category: 'High Protein' | 'Grains & Breads' | 'Dals & Curries' | 'Dairy & Eggs' | 'Snacks & Nuts' | 'Fruits & Veggies' | 'Packaged & Street Food' | 'Beverages';
  icon: string;
  servingSize: string;
  standardServingGrams: number;
  estimatedPrice?: number;
  pricePer100g?: number;
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    saturatedFat?: number;
    fiber: number;
    naturalSugar: number;
    addedSugar: number;
    sodium: number; // mg
    vitaminsAndMinerals?: Record<string, string>;
  };
  healthScore: number;
  healthStatus: 'Healthy' | 'Moderate' | 'Unhealthy';
  glycemicIndex: 'Low' | 'Medium' | 'High';
  dietaryBadges: string[];
  reason: string;
  insights: string[];
  budgetAlternative: {
    name: string;
    reason: string;
    estimatedSavings: string;
  };
}

export const FOOD_DATABASE: DatabaseFoodItem[] = [
  // --- GRAINS & BREADS ---
  {
    id: 'roti-chapati',
    name: 'Whole Wheat Roti / Chapati',
    hindiName: 'रोटी / चपाती',
    category: 'Grains & Breads',
    icon: '🫓',
    servingSize: '1 medium roti (35g raw atta)',
    standardServingGrams: 40,
    macros: {
      calories: 104,
      protein: 3.5,
      carbs: 22,
      fat: 0.5,
      saturatedFat: 0.1,
      fiber: 2.8,
      naturalSugar: 0.4,
      addedSugar: 0,
      sodium: 5,
    },
    healthScore: 88,
    healthStatus: 'Healthy',
    glycemicIndex: 'Medium',
    dietaryBadges: ['Whole Grain', 'Low Fat', 'Complex Carbs'],
    reason: 'Unprocessed complex carbohydrate staple providing steady energy release and gut-friendly wheat bran fiber.',
    insights: [
      'High in insoluble fiber which promotes healthy digestion and blood sugar stability.',
      'Naturally low in fat when cooked without heavy oil or butter on a dry tawa.',
      'Pairing with lentils (dal) creates a complete protein amino acid profile.',
    ],
    budgetAlternative: {
      name: 'Homemade Multigrain Roti (Atta + Besan + Oats)',
      reason: 'Blending 20% besan into whole wheat flour increases protein content by 40% for under ₹2 per roti.',
      estimatedSavings: '₹15 / meal',
    },
  },
  {
    id: 'cooked-white-rice',
    name: 'Cooked White Rice (Basmati / Sona Masoori)',
    hindiName: 'चावल (भात)',
    category: 'Grains & Breads',
    icon: '🍚',
    servingSize: '1 medium katori / bowl (150g cooked)',
    standardServingGrams: 150,
    macros: {
      calories: 195,
      protein: 4.1,
      carbs: 43,
      fat: 0.4,
      saturatedFat: 0.1,
      fiber: 0.6,
      naturalSugar: 0.1,
      addedSugar: 0,
      sodium: 2,
    },
    healthScore: 72,
    healthStatus: 'Moderate',
    glycemicIndex: 'High',
    dietaryBadges: ['Gluten Free', 'Easy Digestion'],
    reason: 'Easily digestible carbohydrate source; pair with high-fiber dals and sabzi to buffer glycemic impact.',
    insights: [
      'Gentle on the gastrointestinal tract, making it optimal for sensitive digestion.',
      'High glycemic index can cause quick glucose release; offset by adding ghee or vegetable fiber.',
      'Cooling cooked rice in refrigerator forms resistant starch, reducing caloric bioavailability by ~15%.',
    ],
    budgetAlternative: {
      name: 'Brown Rice or Hand-Pounded Red Rice',
      reason: 'Retains the bran and germ layer, multiplying fiber by 4x and adding B vitamins.',
      estimatedSavings: '₹5 / day',
    },
  },
  {
    id: 'poha-cooked',
    name: 'Vegetable Poha with Peanuts',
    hindiName: 'पोहा',
    category: 'Grains & Breads',
    icon: '🥣',
    servingSize: '1 plate (180g cooked)',
    standardServingGrams: 180,
    macros: {
      calories: 260,
      protein: 6.2,
      carbs: 44,
      fat: 7.0,
      saturatedFat: 1.2,
      fiber: 4.2,
      naturalSugar: 2.1,
      addedSugar: 0,
      sodium: 190,
    },
    healthScore: 84,
    healthStatus: 'Healthy',
    glycemicIndex: 'Medium',
    dietaryBadges: ['Iron Rich', 'Probiotic Heritage', 'Quick Breakfast'],
    reason: 'Traditional flattened rice loaded with peanuts, curry leaves, and veggies; rich in natural non-heme iron.',
    insights: [
      'Flattening through iron rollers infuses bioavailable iron into the rice flakes.',
      'Peanuts contribute essential heart-healthy monounsaturated fats and plant protein.',
      'Fresh lemon juice adds Vitamin C, drastically boosting iron absorption.',
    ],
    budgetAlternative: {
      name: 'Sprouted Moong & Vegetable Poha',
      reason: 'Substitute 50% poha with boiled sprouts to boost protein by 8g at zero extra cost.',
      estimatedSavings: '₹20 / breakfast',
    },
  },
  {
    id: 'plain-dosa',
    name: 'Crispy Plain Dosa',
    hindiName: 'सादा डोसा',
    category: 'Grains & Breads',
    icon: '🥞',
    servingSize: '1 medium dosa (80g)',
    standardServingGrams: 80,
    macros: {
      calories: 168,
      protein: 3.8,
      carbs: 29,
      fat: 4.2,
      saturatedFat: 0.8,
      fiber: 1.9,
      naturalSugar: 0.5,
      addedSugar: 0,
      sodium: 140,
    },
    healthScore: 80,
    healthStatus: 'Healthy',
    glycemicIndex: 'Medium',
    dietaryBadges: ['Fermented Gut Care', 'Vegetarian'],
    reason: 'Naturally fermented batter of rice and urad dal provides beneficial lactic acid probiotics.',
    insights: [
      'Microbial fermentation synthesizes Vitamin B12 precursors and breaks down phytates.',
      'Urad dal complements rice to provide lysine and essential amino acids.',
      'Control cooking oil to keep saturated fat minimal.',
    ],
    budgetAlternative: {
      name: 'Pesarattu (Whole Green Moong Dosa)',
      reason: 'Unpolished green moong delivers 12g protein per crepe with zero fermentation wait time.',
      estimatedSavings: '₹12 / serving',
    },
  },
  {
    id: 'idli-steamed',
    name: 'Steamed Rice & Urad Idli',
    hindiName: 'इडली',
    category: 'Grains & Breads',
    icon: '⚪',
    servingSize: '2 medium idlis (100g total)',
    standardServingGrams: 100,
    macros: {
      calories: 130,
      protein: 4.6,
      carbs: 26,
      fat: 0.4,
      saturatedFat: 0.1,
      fiber: 2.2,
      naturalSugar: 0.3,
      addedSugar: 0,
      sodium: 110,
    },
    healthScore: 92,
    healthStatus: 'Healthy',
    glycemicIndex: 'Medium',
    dietaryBadges: ['Zero Oil', 'Steamed', 'Gut Friendly'],
    reason: 'Zero-oil steamed fermented food ranked among the healthiest breakfast foods globally.',
    insights: [
      'Steam cooking retains 100% of heat-sensitive micronutrients without oxidized cooking fats.',
      'Extremely light on stomach, suitable for weight loss and recovery diets.',
      'Pair with vegetable sambar for added fiber and lycopene.',
    ],
    budgetAlternative: {
      name: 'Oats & Veggie Rava Idli',
      reason: 'Adding powdered oats doubles soluble beta-glucan fiber for under ₹10 per plate.',
      estimatedSavings: '₹10 / serving',
    },
  },
  {
    id: 'rolled-oats-cooked',
    name: 'Rolled Oats (Cooked in Water/Milk)',
    hindiName: 'ओट्स',
    category: 'Grains & Breads',
    icon: '🌾',
    servingSize: '1 bowl (40g dry oats cooked in 150ml milk)',
    standardServingGrams: 200,
    macros: {
      calories: 225,
      protein: 10.2,
      carbs: 34,
      fat: 5.5,
      saturatedFat: 1.8,
      fiber: 4.8,
      naturalSugar: 6.2,
      addedSugar: 0,
      sodium: 75,
    },
    healthScore: 94,
    healthStatus: 'Healthy',
    glycemicIndex: 'Low',
    dietaryBadges: ['High Fiber', 'Cholesterol Buster', 'Sustained Energy'],
    reason: 'Packed with Beta-Glucan soluble fiber proven to lower LDL cholesterol and balance blood sugar.',
    insights: [
      'Forms a viscous gel in the digestive tract that binds to excess dietary cholesterol.',
      'Very high satiety score prevents mid-morning energy crashes and binge snacking.',
      'Naturally rich in manganese, magnesium, and avenanthramide antioxidants.',
    ],
    budgetAlternative: {
      name: 'Broken Wheat (Dalia) Khichdi',
      reason: 'Local whole wheat dalia costs 50% less than imported oats with identical fiber benefits.',
      estimatedSavings: '₹25 / 500g',
    },
  },

  // --- DALS & CURRIES ---
  {
    id: 'yellow-moong-dal',
    name: 'Tadka Yellow Moong Dal (Cooked)',
    hindiName: 'मूंग दाल',
    category: 'Dals & Curries',
    icon: '🍲',
    servingSize: '1 medium katori / bowl (180g)',
    standardServingGrams: 180,
    macros: {
      calories: 145,
      protein: 9.4,
      carbs: 22,
      fat: 2.8,
      saturatedFat: 0.6,
      fiber: 5.4,
      naturalSugar: 1.2,
      addedSugar: 0,
      sodium: 260,
    },
    healthScore: 95,
    healthStatus: 'Healthy',
    glycemicIndex: 'Low',
    dietaryBadges: ['Plant Protein', 'Easy Digest', 'Ayurvedic Healer'],
    reason: 'Lightest and most digestible Indian lentil, packed with plant protein, potassium, and magnesium.',
    insights: [
      'Contains high levels of folate and iron essential for red blood cell synthesis.',
      'Low oligosaccharide content makes it non-bloating compared to whole pulses.',
      'A staple high-protein foundation for vegetarian and vegan wellness.',
    ],
    budgetAlternative: {
      name: 'Bulk Sourced Whole Green Moong',
      reason: 'Buying 5kg unpolished green moong directly from local mandi reduces cost to ₹110/kg.',
      estimatedSavings: '₹40 / kg',
    },
  },
  {
    id: 'rajma-curry',
    name: 'Punjabi Rajma Masala (Red Kidney Beans)',
    hindiName: 'राजमा मसाला',
    category: 'Dals & Curries',
    icon: '🍛',
    servingSize: '1 large bowl (200g)',
    standardServingGrams: 200,
    macros: {
      calories: 220,
      protein: 12.8,
      carbs: 34,
      fat: 4.5,
      saturatedFat: 0.8,
      fiber: 8.9,
      naturalSugar: 2.8,
      addedSugar: 0,
      sodium: 320,
    },
    healthScore: 92,
    healthStatus: 'Healthy',
    glycemicIndex: 'Low',
    dietaryBadges: ['High Fiber', 'Complex Carbs', 'Heart Healthy'],
    reason: 'Dense source of plant protein, resistant starch, and anthocyanin antioxidants.',
    insights: [
      'Low glycemic load helps regulate glucose metabolism and insulin sensitivity.',
      'Exceptional fiber density (nearly 9g per serving) nourishes beneficial gut microbiome.',
      'Rich in molybdenum, potassium, and plant-based non-heme iron.',
    ],
    budgetAlternative: {
      name: 'Black Chickpeas (Kala Chana) Curry',
      reason: 'Kala chana offers 20% higher protein and iron at ~₹85/kg versus ₹140/kg for Kashmiri rajma.',
      estimatedSavings: '₹55 / kg',
    },
  },
  {
    id: 'chole-chickpeas',
    name: 'Amritsari Chole (Kabuli Chana)',
    hindiName: 'छोले / काबुली चना',
    category: 'Dals & Curries',
    icon: '🥘',
    servingSize: '1 medium bowl (200g)',
    standardServingGrams: 200,
    macros: {
      calories: 245,
      protein: 13.5,
      carbs: 38,
      fat: 5.2,
      saturatedFat: 0.9,
      fiber: 9.6,
      naturalSugar: 3.1,
      addedSugar: 0,
      sodium: 340,
    },
    healthScore: 90,
    healthStatus: 'Healthy',
    glycemicIndex: 'Low',
    dietaryBadges: ['High Protein', 'B-Vitamins', 'Zero Cholesterol'],
    reason: 'Nutrient-rich legume delivering complete fullness, prebiotic fiber, and choline.',
    insights: [
      'Promotes deep satiety and controls hunger hormone ghrelin for 4-5 hours.',
      'High in saponins and phytosterols which support cardiovascular health.',
      'Cook with tea leaves and amla for natural dark color and polyphenols.',
    ],
    budgetAlternative: {
      name: 'Dry Roasted Chana / Kala Chana',
      reason: 'Pre-soaked local Bengal gram cuts cook time and saves ₹40 per batch.',
      estimatedSavings: '₹40 / week',
    },
  },
  {
    id: 'palak-paneer',
    name: 'Palak Paneer (Spinach & Cottage Cheese)',
    hindiName: 'पालक पनीर',
    category: 'Dals & Curries',
    icon: '🥬',
    servingSize: '1 medium bowl (200g with 60g paneer)',
    standardServingGrams: 200,
    macros: {
      calories: 270,
      protein: 16.5,
      carbs: 9.8,
      fat: 18.5,
      saturatedFat: 8.2,
      fiber: 4.8,
      naturalSugar: 3.2,
      addedSugar: 0,
      sodium: 290,
    },
    healthScore: 89,
    healthStatus: 'Healthy',
    glycemicIndex: 'Low',
    dietaryBadges: ['Low Carb', 'Calcium Rich', 'Keto Friendly'],
    reason: 'Power combo of calcium, casein protein, vitamin K, lutein, and iron.',
    insights: [
      'Paneer provides slow-digesting casein protein that sustains amino acid delivery.',
      'Fresh spinach supplies iron, magnesium, and eye-protective carotenoids.',
      'Prepare with low oil to maintain ideal caloric density.',
    ],
    budgetAlternative: {
      name: 'Palak Tofu or Palak Soya Chunks',
      reason: 'Replacing paneer with high-protein soya chunks cuts cost by 60% with zero saturated fat.',
      estimatedSavings: '₹60 / meal',
    },
  },
  {
    id: 'soya-chunks-curry',
    name: 'High-Protein Soya Chunks Curry',
    hindiName: 'सोया चंक्स करी',
    category: 'Dals & Curries',
    icon: '🧆',
    servingSize: '1 bowl (50g dry soya cooked into 200g curry)',
    standardServingGrams: 200,
    macros: {
      calories: 235,
      protein: 26.5,
      carbs: 18,
      fat: 4.2,
      saturatedFat: 0.6,
      fiber: 7.2,
      naturalSugar: 2.5,
      addedSugar: 0,
      sodium: 280,
    },
    healthScore: 96,
    healthStatus: 'Healthy',
    glycemicIndex: 'Low',
    dietaryBadges: ['Ultra High Protein', 'Budget Star', 'Lean Vegetarian'],
    reason: 'The single most cost-effective whole vegetarian protein source on earth (~52g protein per 100g dry).',
    insights: [
      'Delivers unmatched 26.5g protein per bowl for under ₹15 total ingredient cost.',
      'Contains all 9 essential amino acids with high bioavailability.',
      'Boil and squeeze thoroughly to remove bitter saponins before cooking.',
    ],
    budgetAlternative: {
      name: 'Bulk Unbranded Nutrela / Soya Granules',
      reason: 'Purchasing 1kg bulk soya chunks at ₹110 gives 520g of pure protein.',
      estimatedSavings: '₹150 / month',
    },
  },

  // --- DAIRY & EGGS ---
  {
    id: 'raw-paneer',
    name: 'Fresh Dairy Paneer (Cottage Cheese)',
    hindiName: 'पनीर',
    category: 'Dairy & Eggs',
    icon: '🧀',
    servingSize: '100g raw / lightly seared',
    standardServingGrams: 100,
    macros: {
      calories: 265,
      protein: 18.3,
      carbs: 3.4,
      fat: 20.8,
      saturatedFat: 12.5,
      fiber: 0,
      naturalSugar: 2.8,
      addedSugar: 0,
      sodium: 25,
    },
    healthScore: 86,
    healthStatus: 'Healthy',
    glycemicIndex: 'Low',
    dietaryBadges: ['High Protein', 'Keto Friendly', 'Calcium Rich'],
    reason: 'Rich in bioavailable dairy protein, conjugated linoleic acid (CLA), and bone-strengthening calcium.',
    insights: [
      'Casein protein breaks down slowly over 6-8 hours, ideal for muscle recovery.',
      'Virtually zero carbohydrate content, making it perfect for diabetes and keto management.',
      'Choose fresh local dairy paneer over packaged long-life blocks to avoid starch fillers.',
    ],
    budgetAlternative: {
      name: 'Home-Curdled Paneer from Toned Milk',
      reason: 'Making paneer at home with 1L toned milk (₹32) yields 180g paneer with 50% less fat.',
      estimatedSavings: '₹45 / 200g',
    },
  },
  {
    id: 'curd-dahi',
    name: 'Fresh Homestyle Curd / Dahi',
    hindiName: 'दही',
    category: 'Dairy & Eggs',
    icon: '🥣',
    servingSize: '1 medium katori (150g)',
    standardServingGrams: 150,
    macros: {
      calories: 98,
      protein: 5.8,
      carbs: 6.5,
      fat: 4.8,
      saturatedFat: 3.0,
      fiber: 0,
      naturalSugar: 6.2,
      addedSugar: 0,
      sodium: 55,
    },
    healthScore: 94,
    healthStatus: 'Healthy',
    glycemicIndex: 'Low',
    dietaryBadges: ['Live Probiotics', 'Gut Immunity', 'Natural Cooling'],
    reason: 'Natural live cultured probiotic that balances digestive gut flora and enhances nutrient uptake.',
    insights: [
      'Billions of active Lactobacillus bacteria improve gut barrier integrity and immunity.',
      'Pre-digested lactose makes it well-tolerated by mildly lactose-sensitive individuals.',
      'Naturally zero added sugar when set at home; avoid commercial fruit-flavored yogurts.',
    ],
    budgetAlternative: {
      name: 'Continuous Home Batch Culture',
      reason: 'Setting curd daily at home from starter culture costs ₹0 extra and eliminates plastic tubs.',
      estimatedSavings: '₹90 / week',
    },
  },
  {
    id: 'boiled-eggs',
    name: 'Whole Boiled Eggs (2 Large)',
    hindiName: 'उबले अंडे',
    category: 'Dairy & Eggs',
    icon: '🥚',
    servingSize: '2 large hard-boiled eggs (100g)',
    standardServingGrams: 100,
    macros: {
      calories: 144,
      protein: 12.6,
      carbs: 0.8,
      fat: 9.8,
      saturatedFat: 3.1,
      fiber: 0,
      naturalSugar: 0.6,
      addedSugar: 0,
      sodium: 130,
    },
    healthScore: 96,
    healthStatus: 'Healthy',
    glycemicIndex: 'Low',
    dietaryBadges: ['Gold Standard Protein', 'Choline Rich', 'Zero Carb'],
    reason: 'The biological gold standard of dietary protein (PDCAAS score 1.0) packed with choline and B12.',
    insights: [
      'Contains complete spectrum of essential amino acids with near-perfect human bioavailability.',
      'Egg yolk contains lutein, zeaxanthin, and high choline for neurological brain health.',
      'Very low calorie density per gram of protein; ideal for fat loss.',
    ],
    budgetAlternative: {
      name: 'Wholesale Tray (30 Eggs) from Mandi',
      reason: 'Buying whole trays directly from wholesale poultry vendors drops cost to ₹5.50 per egg.',
      estimatedSavings: '₹50 / tray',
    },
  },
  {
    id: 'grilled-chicken-breast',
    name: 'Grilled Skinless Chicken Breast',
    hindiName: 'चिकन ब्रेस्ट',
    category: 'Dairy & Eggs',
    icon: '🍗',
    servingSize: '150g cooked portion',
    standardServingGrams: 150,
    macros: {
      calories: 248,
      protein: 46.5,
      carbs: 0,
      fat: 5.4,
      saturatedFat: 1.5,
      fiber: 0,
      naturalSugar: 0,
      addedSugar: 0,
      sodium: 110,
    },
    healthScore: 95,
    healthStatus: 'Healthy',
    glycemicIndex: 'Low',
    dietaryBadges: ['Lean Protein', 'Zero Carb', 'Muscle Builder'],
    reason: 'Ultra-lean animal protein source rich in niacin, phosphorus, selenium, and vitamin B6.',
    insights: [
      'Over 80% of total calories derive directly from pure dietary protein.',
      'Zero carbohydrates and very low saturated fat support aggressive lean muscle building.',
      'Season with turmeric, ginger-garlic paste, and lemon for anti-inflammatory benefits.',
    ],
    budgetAlternative: {
      name: 'Whole Dressed Chicken (Portioned at home)',
      reason: 'Buying whole dressed chicken (₹180/kg) saves 40% compared to pre-cut boneless breast.',
      estimatedSavings: '₹120 / kg',
    },
  },
  {
    id: 'whey-protein-isolate',
    name: 'Whey Protein Isolate (Unflavored / Spiced)',
    hindiName: 'वे प्रोटीन',
    category: 'Dairy & Eggs',
    icon: '🥛',
    servingSize: '1 standard scoop (30g powder in water)',
    standardServingGrams: 30,
    macros: {
      calories: 118,
      protein: 26.0,
      carbs: 1.2,
      fat: 0.6,
      saturatedFat: 0.3,
      fiber: 0,
      naturalSugar: 0.8,
      addedSugar: 0,
      sodium: 50,
    },
    healthScore: 94,
    healthStatus: 'Healthy',
    glycemicIndex: 'Low',
    dietaryBadges: ['Rapid Absorption', 'BCAA Rich', 'Pure Protein'],
    reason: 'Fast-digesting microfiltered milk whey delivering 5.5g BCAAs and 2.7g leucine for protein synthesis.',
    insights: [
      'Rapidly elevates blood amino acid concentrations within 45 minutes of consumption.',
      'Unflavored raw whey eliminates artificial acesulfame-K, sucralose, and gum thickeners.',
      'Easily mixes into oats, besan chilla batter, or smoothies.',
    ],
    budgetAlternative: {
      name: 'Roasted Sattu Flour Drink',
      reason: 'Roasted chana sattu powder provides 25g protein per 100g at 1/5th the cost of imported whey.',
      estimatedSavings: '₹1,500 / month',
    },
  },

  // --- SNACKS & NUTS ---
  {
    id: 'roasted-makhana',
    name: 'Roasted Masala Makhana (Fox Nuts / Lotus Seeds)',
    hindiName: 'रोस्टेड मखाना',
    category: 'Snacks & Nuts',
    icon: '🍿',
    servingSize: '1 large bowl (30g roasted in 1/2 tsp ghee)',
    standardServingGrams: 30,
    macros: {
      calories: 125,
      protein: 3.2,
      carbs: 21,
      fat: 3.1,
      saturatedFat: 1.2,
      fiber: 2.8,
      naturalSugar: 0.2,
      addedSugar: 0,
      sodium: 85,
    },
    healthScore: 94,
    healthStatus: 'Healthy',
    glycemicIndex: 'Low',
    dietaryBadges: ['Anti-Inflammatory', 'Low Calorie', 'Magnesium Rich'],
    reason: 'Ancient superfood packed with kaempferol antioxidants, potassium, and magnesium with zero gluten.',
    insights: [
      'Very high crunch-to-calorie ratio; satisfies the desire for chips with 75% fewer calories.',
      'Contains kaempferol, a natural flavonoid with potent anti-aging and vascular benefits.',
      'Low sodium-to-potassium ratio helps regulate healthy blood pressure.',
    ],
    budgetAlternative: {
      name: 'Bulk Raw Fox Nuts (Roast at home)',
      reason: 'Buying unroasted raw makhana in 500g bags (₹320) saves ₹400 over commercial branded tins.',
      estimatedSavings: '₹80 / 100g',
    },
  },
  {
    id: 'roasted-black-chana',
    name: 'Dry Roasted Black Chana (Bhuna Chana)',
    hindiName: 'भुना चना',
    category: 'Snacks & Nuts',
    icon: '🥜',
    servingSize: '1 handful (40g)',
    standardServingGrams: 40,
    macros: {
      calories: 148,
      protein: 8.8,
      carbs: 23,
      fat: 2.2,
      saturatedFat: 0.4,
      fiber: 6.8,
      naturalSugar: 1.1,
      addedSugar: 0,
      sodium: 30,
    },
    healthScore: 96,
    healthStatus: 'Healthy',
    glycemicIndex: 'Low',
    dietaryBadges: ['High Protein Snack', 'Super Fiber', 'Pocket Friendly'],
    reason: 'The champion Indian working-class snack: immense fiber, sustained fullness, and zero greasy frying.',
    insights: [
      'Outer skin contains potent polyphenols and insoluble fiber that delays stomach emptying.',
      'Provides 8.8g protein per handful with almost zero saturated fats.',
      'Unsalted roasted chana is an ideal desk snack for steady glucose control.',
    ],
    budgetAlternative: {
      name: 'Local Kirana Store Loose Bhuna Chana',
      reason: 'Available at ₹30 for 250g in any local neighborhood grocery store.',
      estimatedSavings: '₹50 / pack',
    },
  },
  {
    id: 'raw-almonds',
    name: 'Raw / Soaked California & Mamra Almonds',
    hindiName: 'बादाम',
    category: 'Snacks & Nuts',
    icon: '🌰',
    servingSize: '10-12 almonds (15g)',
    standardServingGrams: 15,
    macros: {
      calories: 87,
      protein: 3.2,
      carbs: 3.2,
      fat: 7.5,
      saturatedFat: 0.6,
      fiber: 1.8,
      naturalSugar: 0.7,
      addedSugar: 0,
      sodium: 1,
    },
    healthScore: 95,
    healthStatus: 'Healthy',
    glycemicIndex: 'Low',
    dietaryBadges: ['Vitamin E', 'Healthy Fats', 'Brain Fuel'],
    reason: 'Outstanding source of alpha-tocopherol Vitamin E, magnesium, and monounsaturated lipids.',
    insights: [
      'Soaking overnight activates phytase enzymes, improving bioavailability of zinc and iron.',
      'Monounsaturated fats reduce vascular oxidation and improve HDL/LDL cholesterol ratio.',
      'Rich in antioxidant polyphenols concentrated primarily in the almond skin.',
    ],
    budgetAlternative: {
      name: 'Raw Roasted Peanuts (Moongphali)',
      reason: 'Peanuts provide equal protein and healthy fats at 1/4th the price of almonds.',
      estimatedSavings: '₹350 / kg',
    },
  },
  {
    id: 'pure-peanut-butter',
    name: '100% Roasted Peanut Butter (No Added Sugar)',
    hindiName: 'पीनट बटर',
    category: 'Snacks & Nuts',
    icon: '🥜',
    servingSize: '2 tablespoons (32g)',
    standardServingGrams: 32,
    macros: {
      calories: 190,
      protein: 8.5,
      carbs: 6.2,
      fat: 16.0,
      saturatedFat: 3.0,
      fiber: 2.4,
      naturalSugar: 1.5,
      addedSugar: 0,
      sodium: 10,
    },
    healthScore: 91,
    healthStatus: 'Healthy',
    glycemicIndex: 'Low',
    dietaryBadges: ['Healthy Fats', 'High Satiety', 'Zero Palm Oil'],
    reason: 'Clean calorie-dense spread loaded with oleic acid, resveratrol, and plant protein.',
    insights: [
      'Check label ingredients: pure peanut butter should only list "100% roasted peanuts".',
      'High in biotin, copper, and vitamin B3 (niacin) for cellular energy.',
      'Avoid commercial brands that sneak in hydrogenated palm oil and corn syrup.',
    ],
    budgetAlternative: {
      name: 'Homemade Blender Peanut Butter',
      reason: 'Roasting 500g raw peanuts (₹60) and blending for 3 minutes produces 500g pure spread.',
      estimatedSavings: '₹140 / jar',
    },
  },

  // --- FRUITS & VEGGIES ---
  {
    id: 'fresh-banana',
    name: 'Fresh Ripe Banana (Robusta / Yelakki)',
    hindiName: 'केला',
    category: 'Fruits & Veggies',
    icon: '🍌',
    servingSize: '1 medium banana (118g peeled)',
    standardServingGrams: 118,
    macros: {
      calories: 105,
      protein: 1.3,
      carbs: 27,
      fat: 0.3,
      saturatedFat: 0.1,
      fiber: 3.1,
      naturalSugar: 14.4,
      addedSugar: 0,
      sodium: 1,
    },
    healthScore: 89,
    healthStatus: 'Healthy',
    glycemicIndex: 'Medium',
    dietaryBadges: ['Potassium Rich', 'Prebiotic Fiber', 'Natural Pre-Workout'],
    reason: 'Instant natural energy fruit packed with potassium, vitamin B6, and fructooligosaccharides.',
    insights: [
      'High potassium counteracts sodium to ease arterial pressure and prevent cramps.',
      'Slightly greenish bananas contain prebiotic resistant starch that feeds gut flora.',
      'Natural whole-fruit sugars are bound with soluble pectin fiber for regulated uptake.',
    ],
    budgetAlternative: {
      name: 'Seasonal Local Fruit (Papaya / Guava)',
      reason: 'Guava offers 4x more Vitamin C and 3x more fiber for under ₹10 per fruit.',
      estimatedSavings: '₹10 / fruit',
    },
  },
  {
    id: 'fresh-guava',
    name: 'Fresh Indian Guava (Amrood)',
    hindiName: 'अमरूद',
    category: 'Fruits & Veggies',
    icon: '🍐',
    servingSize: '1 medium guava (100g)',
    standardServingGrams: 100,
    macros: {
      calories: 68,
      protein: 2.6,
      carbs: 14.3,
      fat: 1.0,
      saturatedFat: 0.3,
      fiber: 5.4,
      naturalSugar: 8.9,
      addedSugar: 0,
      sodium: 2,
    },
    healthScore: 98,
    healthStatus: 'Healthy',
    glycemicIndex: 'Low',
    dietaryBadges: ['Vitamin C Supercharger', 'Mega Fiber', 'Low GI'],
    reason: 'Nutritional powerhouse containing 4x the Vitamin C of an orange and 5.4g fiber per 68 calories.',
    insights: [
      'Over 200mg Vitamin C per fruit delivers complete daily immune and collagen support.',
      'Very low glycemic index makes it one of the safest fruits for diabetic individuals.',
      'Edible seeds provide healthy insoluble roughage for digestive motility.',
    ],
    budgetAlternative: {
      name: 'Mandi Sourced Seasonal Guavas',
      reason: 'Buy local green guavas at peak winter season for ₹30-40/kg in local weekly markets.',
      estimatedSavings: '₹30 / kg',
    },
  },
  {
    id: 'fresh-spinach-palak',
    name: 'Fresh Spinach / Palak Greens',
    hindiName: 'पालक',
    category: 'Fruits & Veggies',
    icon: '🥬',
    servingSize: '1 large bunch (150g raw)',
    standardServingGrams: 150,
    macros: {
      calories: 35,
      protein: 4.3,
      carbs: 5.4,
      fat: 0.6,
      saturatedFat: 0.1,
      fiber: 3.3,
      naturalSugar: 0.6,
      addedSugar: 0,
      sodium: 118,
    },
    healthScore: 99,
    healthStatus: 'Healthy',
    glycemicIndex: 'Low',
    dietaryBadges: ['Iron & Folate', 'Zero Fat', 'Micronutrient Dense'],
    reason: 'One of the most nutrient-dense greens on earth, rich in chlorophyll, nitrates, and lutein.',
    insights: [
      'High dietary nitrates improve endothelial function and cardiovascular stamina.',
      'Contains lutein and zeaxanthin which protect retina against blue-light strain.',
      'Lightly steam or sauté with garlic to break down oxalates and maximize mineral absorption.',
    ],
    budgetAlternative: {
      name: 'Local Fresh Methi / Bathua / Palak Bunches',
      reason: 'Fresh bunches cost ~₹15 at morning street vendors; wash and store in paper towels for 7 days.',
      estimatedSavings: '₹20 / bunch',
    },
  },

  // --- PACKAGED, FAST FOOD & STREET SNACKS ---
  {
    id: 'maggi-noodles',
    name: 'Maggi 2-Minute Masala Instant Noodles',
    hindiName: 'मैगी नूडल्स',
    category: 'Packaged & Street Food',
    icon: '🍜',
    servingSize: '1 single packet (70g dry cooked)',
    standardServingGrams: 70,
    macros: {
      calories: 312,
      protein: 6.8,
      carbs: 43.6,
      fat: 12.4,
      saturatedFat: 6.2,
      fiber: 1.8,
      naturalSugar: 1.2,
      addedSugar: 1.8,
      sodium: 860, // ~43% of daily sodium limit!
    },
    healthScore: 28,
    healthStatus: 'Unhealthy',
    glycemicIndex: 'High',
    dietaryBadges: ['Ultra Processed', 'Extreme Sodium', 'Palm Oil'],
    reason: 'Deep-fried refined flour (maida) noodles loaded with palm oil and dangerous sodium levels (>850mg).',
    insights: [
      '1 single packet consumes nearly 45% of the WHO maximum recommended daily sodium limit.',
      'Fried in refined palm oil, resulting in over 6g of artery-straining saturated fats.',
      'Very low dietary fiber and micronutrient density leads to rapid blood sugar spike and crash.',
    ],
    budgetAlternative: {
      name: 'Spiced Vegetable Whole Wheat Vermicelli (Semiya) or Oats',
      reason: 'Cooking roasted whole wheat vermicelli with carrots, peas, and homemade masala saves ₹10 and cuts 600mg sodium.',
      estimatedSavings: '₹12 / snack',
    },
  },
  {
    id: 'lays-potato-chips',
    name: "Lay's Classic Salted / Magic Masala Potato Chips",
    hindiName: 'आलू चिप्स',
    category: 'Packaged & Street Food',
    icon: '🥔',
    servingSize: '1 standard bag (50g)',
    standardServingGrams: 50,
    macros: {
      calories: 275,
      protein: 3.5,
      carbs: 26.5,
      fat: 17.5,
      saturatedFat: 7.8,
      fiber: 1.2,
      naturalSugar: 0.5,
      addedSugar: 0.8,
      sodium: 480,
    },
    healthScore: 22,
    healthStatus: 'Unhealthy',
    glycemicIndex: 'High',
    dietaryBadges: ['Deep Fried', 'High Saturated Fat', 'Ultra Processed'],
    reason: 'Thinly sliced potatoes deep-fried in palm olein oil with high sodium and artificial flavorings.',
    insights: [
      'Nearly 60% of calories derive from refined frying fats and trans-fat precursors.',
      'Contains high levels of acrylamides formed during ultra-high temperature deep frying.',
      'Extremely low satiety; prompts hyper-palatable overeating without nutritional nourishment.',
    ],
    budgetAlternative: {
      name: 'Roasted Masala Fox Nuts (Makhana) or Air-Popped Popcorn',
      reason: 'Swapping to roasted makhana saves 14g of bad fat, adds 3g protein, and saves ₹15 per snack.',
      estimatedSavings: '₹15 / pack',
    },
  },
  {
    id: 'coca-cola-soda',
    name: 'Coca-Cola / Pepsi Carbonated Beverage',
    hindiName: 'कोल्ड ड्रिंक',
    category: 'Beverages',
    icon: '🥤',
    servingSize: '1 can (330ml)',
    standardServingGrams: 330,
    macros: {
      calories: 140,
      protein: 0,
      carbs: 35.0,
      fat: 0,
      saturatedFat: 0,
      fiber: 0,
      naturalSugar: 0,
      addedSugar: 35.0, // 8.5 teaspoons of pure refined sugar!
      sodium: 45,
    },
    healthScore: 12,
    healthStatus: 'Unhealthy',
    glycemicIndex: 'High',
    dietaryBadges: ['Liquid Sugar Bomb', 'Zero Nutrients', 'Phosphoric Acid'],
    reason: 'Pure liquid refined sugar (35g = ~9 teaspoons) causing severe insulin spikes and enamel demineralization.',
    insights: [
      'Delivers 35 grams of free liquid sugar with zero fiber to buffer hepatic fructose overload.',
      'Phosphoric acid leaches calcium from teeth enamel and skeletal bone matrix over time.',
      'Liquid sugar does not trigger satiety receptors in the brain, encouraging excess caloric surplus.',
    ],
    budgetAlternative: {
      name: 'Chilled Spiced Buttermilk (Chaas) or Lemon Mint Water (Nimbu Pani)',
      reason: 'Fresh nimbu pani or jeera chaas provides probiotic gut cooling and hydration for ₹5 with zero added sugar.',
      estimatedSavings: '₹35 / bottle',
    },
  },
  {
    id: 'samosa-fried',
    name: 'Crispy Fried Potato Samosa (1 Piece)',
    hindiName: 'समोसा',
    category: 'Packaged & Street Food',
    icon: '🥟',
    servingSize: '1 large piece (90g)',
    standardServingGrams: 90,
    macros: {
      calories: 260,
      protein: 3.8,
      carbs: 32.0,
      fat: 13.5,
      saturatedFat: 5.8,
      fiber: 2.1,
      naturalSugar: 1.1,
      addedSugar: 0.5,
      sodium: 380,
    },
    healthScore: 35,
    healthStatus: 'Unhealthy',
    glycemicIndex: 'High',
    dietaryBadges: ['Maida & Dalda', 'Deep Fried', 'High Calorie'],
    reason: 'Refined white flour crust deep-fried in reused commercial oil filled with spiced mashed potatoes.',
    insights: [
      'Street vendors frequently reuse frying oil, generating toxic polar compounds and trans fats.',
      'Maida + mashed potato creates a high glycemic carbohydrate load.',
      'High caloric density: 2 samosas equal the caloric total of a complete balanced lunch.',
    ],
    budgetAlternative: {
      name: 'Air-Fried Paneer Tikka or Besan Puda',
      reason: 'Besan puda gives identical savory spice cravings with 3x more protein and 80% less oil.',
      estimatedSavings: '₹10 / snack',
    },
  },
  {
    id: 'masala-chai',
    name: 'Traditional Masala Chai with Milk & 1 tsp Sugar',
    hindiName: 'मसाला चाय',
    category: 'Beverages',
    icon: '☕',
    servingSize: '1 cup (150ml with 50% milk)',
    standardServingGrams: 150,
    macros: {
      calories: 78,
      protein: 2.4,
      carbs: 10.5,
      fat: 2.8,
      saturatedFat: 1.8,
      fiber: 0.2,
      naturalSugar: 4.8,
      addedSugar: 5.0,
      sodium: 35,
    },
    healthScore: 78,
    healthStatus: 'Healthy',
    glycemicIndex: 'Medium',
    dietaryBadges: ['Antioxidant Spices', 'Mild Caffeine', 'Ayurvedic Spices'],
    reason: 'Antioxidant-rich black tea infused with ginger, cardamom, clove, and cinnamon.',
    insights: [
      'Black tea polyphenols and gingerols stimulate metabolism and aid digestive enzyme secretion.',
      'Cardamom and cinnamon provide natural blood sugar stabilizing properties.',
      'Limit added sugar to 1/2 tsp or replace with green cardamom for natural sweetness.',
    ],
    budgetAlternative: {
      name: 'Spiced Ginger Tulsi Green Tea',
      reason: 'Brewing fresh ginger and tulsi leaves from home plant costs under ₹2 with 0g added sugar.',
      estimatedSavings: '₹10 / cup',
    },
  },
  {
    id: 'gulab-jamun',
    name: 'Gulab Jamun in Sugar Syrup (2 Pieces)',
    hindiName: 'गुलाब जामुन',
    category: 'Packaged & Street Food',
    icon: '🍯',
    servingSize: '2 medium pieces (80g total)',
    standardServingGrams: 80,
    macros: {
      calories: 340,
      protein: 4.2,
      carbs: 52.0,
      fat: 13.0,
      saturatedFat: 7.2,
      fiber: 0.4,
      naturalSugar: 2.0,
      addedSugar: 38.0, // Over 9.5 teaspoons sugar!
      sodium: 65,
    },
    healthScore: 18,
    healthStatus: 'Unhealthy',
    glycemicIndex: 'High',
    dietaryBadges: ['Extreme Sugar', 'Deep Fried Dairy', 'Festival Treat'],
    reason: 'Deep-fried mawa/khoya balls submerged in saturated refined sugar syrup flavored with rose water.',
    insights: [
      'Over 38 grams of refined sucrose syrup in a single small 2-piece serving.',
      'Combines high saturated dairy fat with high glycemic sugar, triggering high fat storage signals.',
      'Reserve purely for occasional festive celebrations rather than weekly diet.',
    ],
    budgetAlternative: {
      name: 'Cardamom Saffron Roasted Phirni with Jaggery',
      reason: 'Slow-cooked milk phirni with crushed nuts and a touch of raw jaggery cuts refined sugar by 70%.',
      estimatedSavings: '₹25 / serving',
    },
  },
  {
    id: 'spiced-buttermilk-chaas',
    name: 'Spiced Buttermilk / Masala Chaas',
    hindiName: 'मसाला छाछ',
    category: 'Beverages',
    icon: '🥛',
    servingSize: '1 tall glass (250ml)',
    standardServingGrams: 250,
    macros: {
      calories: 48,
      protein: 3.5,
      carbs: 4.8,
      fat: 1.5,
      saturatedFat: 0.9,
      fiber: 0.5,
      naturalSugar: 4.5,
      addedSugar: 0,
      sodium: 180,
    },
    healthScore: 97,
    healthStatus: 'Healthy',
    glycemicIndex: 'Low',
    dietaryBadges: ['Probiotic Hydration', 'Digestive Jeera', 'Electrolyte Rich'],
    reason: 'Hydrating churned yogurt beverage loaded with roasted cumin, mint, ginger, and natural electrolytes.',
    insights: [
      'Roasted jeera (cumin) and ginger stimulate salivary amylase and bile acid synthesis.',
      'Supplies essential potassium, calcium, and sodium to restore hydration without sugar.',
      'Light on calories (under 50 kcal) while providing natural satiety.',
    ],
    budgetAlternative: {
      name: 'Homestyle Churned Dahi with Cold Water',
      reason: 'Whisking 2 spoons of leftover homemade curd with cold water costs under ₹3.',
      estimatedSavings: '₹20 / glass',
    },
  },
];

export function searchDatabase(query: string): DatabaseFoodItem[] {
  if (!query || !query.trim()) return [];
  const q = query.toLowerCase().trim();
  const tokens = q.split(/\s+/).filter(Boolean);

  return FOOD_DATABASE.filter((item) => {
    const nameMatch = item.name.toLowerCase();
    const hindiMatch = item.hindiName ? item.hindiName.toLowerCase() : '';
    const catMatch = item.category.toLowerCase();
    const badgeMatch = item.dietaryBadges.join(' ').toLowerCase();

    return tokens.every(
      (token) =>
        nameMatch.includes(token) ||
        hindiMatch.includes(token) ||
        catMatch.includes(token) ||
        badgeMatch.includes(token)
    );
  });
}

const CATEGORY_DEFAULT_PRICE_PER_100G: Record<string, number> = {
  'High Protein': 35.0,
  'Grains & Breads': 8.5,
  'Dals & Curries': 14.0,
  'Dairy & Eggs': 18.0,
  'Snacks & Nuts': 45.0,
  'Fruits & Veggies': 6.5,
  'Packaged & Street Food': 25.0,
  'Beverages': 9.0,
};

export function getDatabaseItemPriceAndPer100g(
  item: DatabaseFoodItem,
  multiplier: number = 1
): {
  estimatedPrice: number;
  pricePer100g: number;
  formattedPrice: string;
  formattedPricePer100g: string;
  servingGrams: number;
} {
  const m = Math.max(0.1, multiplier);
  const servingGrams = Math.round(item.standardServingGrams * m);

  let p100 = item.pricePer100g;
  let price = item.estimatedPrice ? item.estimatedPrice * m : undefined;

  if (p100 === undefined || p100 === 0) {
    if (price !== undefined && price > 0 && servingGrams > 0) {
      p100 = calculatePricePer100g(price, servingGrams);
    } else {
      p100 = CATEGORY_DEFAULT_PRICE_PER_100G[item.category] || 12.0;
    }
  }

  if (price === undefined || price === 0) {
    price = Math.round(((p100 * servingGrams) / 100) * 10) / 10;
  }

  const roundedPrice = Math.round(price * 10) / 10;
  const roundedP100 = Math.round(p100 * 10) / 10;

  return {
    estimatedPrice: roundedPrice,
    pricePer100g: roundedP100,
    formattedPrice: formatCurrency(roundedPrice, '₹'),
    formattedPricePer100g: formatPricePer100g(roundedP100, undefined, '₹'),
    servingGrams,
  };
}

export function convertDatabaseItemToScanResult(
  item: DatabaseFoodItem,
  multiplier: number = 1
): FoodScanResult {
  const m = Math.max(0.1, multiplier);
  const rounded = (val: number) => Math.round(val * m * 10) / 10;
  const priceInfo = getDatabaseItemPriceAndPer100g(item, m);

  return {
    foodName: item.name,
    category: item.category,
    healthScore: item.healthScore,
    healthStatus: item.healthStatus,
    naturalSugar: rounded(item.macros.naturalSugar),
    addedSugar: rounded(item.macros.addedSugar),
    fat: rounded(item.macros.fat),
    saturatedFat: item.macros.saturatedFat ? rounded(item.macros.saturatedFat) : undefined,
    protein: rounded(item.macros.protein),
    carbs: rounded(item.macros.carbs),
    calories: Math.round(item.macros.calories * m),
    fiber: rounded(item.macros.fiber),
    sodium: item.macros.sodium ? Math.round(item.macros.sodium * m) : undefined,
    glycemicIndex: item.glycemicIndex,
    servingSize: m === 1 ? item.servingSize : `${m}x ${item.servingSize} (~${priceInfo.servingGrams}g)`,
    baseServingSize: item.servingSize,
    portionMultiplier: m,
    reason: item.reason,
    insights: item.insights,
    dietaryBadges: item.dietaryBadges,
    estimatedPrice: priceInfo.estimatedPrice,
    pricePer100g: priceInfo.pricePer100g,
    vitaminsAndMinerals: item.macros.vitaminsAndMinerals,
    personalizedTips: `Calculated for ${m === 1 ? '1 standard serving' : `${m} servings`} (~${priceInfo.servingGrams}g). Price: ${priceInfo.formattedPrice} (${priceInfo.formattedPricePer100g}).`,
    budgetAlternative: item.budgetAlternative,
    extractedText: `Verified Craven Food Database entry for ${item.name} (${item.hindiName || ''}). Serving: ${item.servingSize} (~${priceInfo.servingGrams}g). Estimated Price: ${priceInfo.formattedPrice} (${priceInfo.formattedPricePer100g}).`,
  };
}

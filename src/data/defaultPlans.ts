import { DietPlan, GroceryList } from '../types';

export const DEFAULT_PLANS: DietPlan[] = [
  {
    id: 'thrifty-mediterranean-plan',
    title: 'Thrifty Mediterranean Zero-Waste Diet Plan',
    goal: 'Healthy Living & Weight Management',
    dietType: 'Mediterranean',
    budgetTier: 'thrifty',
    targetCalories: 2000,
    householdSize: 1,
    estimatedWeeklyCost: 1087.00,
    currency: '₹',
    summary: 'A heart-healthy Mediterranean plan engineered around 5 core multi-use budget staples: chickpeas, brown rice, fresh carrots, spinach, and farm eggs. Leftover dinner ingredients become the base for next-day lunches, keeping food waste near zero and real-world grocery costs under ₹160/day.',
    zeroWasteStrategy: [
      'Batch-cook 4 cups of brown rice on Sunday to use across 4 distinct weekday meals.',
      'Roast a full sheet of Mediterranean spiced vegetables (peppers, onions, zucchini, carrots) for Dinner Day 1, then repurpose into Day 2 lunch bowls and Day 3 frittata.',
      'Save vegetable ends (carrot tops, onion skins) in a freezer container for homemade aromatic vegetable broth.',
      'Buy fresh spinach: Day 1 sauteed, Day 2 & 4 morning egg scramble, Day 5 lentil soup.'
    ],
    bulkPrepTips: [
      'Sunday Prep: 6 boiled eggs, 1 pot brown rice, 1 sheet pan roasted veggies.',
      'Storage: Keep washed greens with a dry paper towel in airtight container to triple shelf life.'
    ],
    createdAt: '2026-08-18T00:00:00Z',
    days: [
      {
        dayNumber: 1,
        dayName: 'Monday',
        dailyWasteSaverNote: 'Using freshly roasted vegetable batch for dinner; save half for Tuesday lunch.',
        dayEstimatedCost: 171.00,
        totalDayMacros: {
          calories: 1980,
          protein: 92,
          carbs: 230,
          fat: 76,
          fiber: 38,
          naturalSugar: 32,
          addedSugar: 8,
          sodium: 1420,
          vitaminsAndMinerals: {
            'Vitamin C': '68 mg (75% DV)',
            'Calcium': '580 mg (58% DV)',
            'Iron': '14.2 mg (79% DV)',
            'Potassium': '2450 mg',
            'Vitamin B12': '1.8 mcg (75% DV)',
          },
        },
        meals: {
          breakfast: {
            id: 'm1-b',
            name: 'Greek Yogurt Oat Bowl with Honey & Walnuts',
            type: 'breakfast',
            description: 'Creamy high-protein Greek yogurt topped with rolled oats, a drizzle of honey, and crushed walnuts.',
            prepTimeMinutes: 5,
            cookTimeMinutes: 0,
            estimatedCost: 35.00,
            macros: {
              calories: 420,
              protein: 24,
              carbs: 54,
              fat: 12,
              fiber: 6,
              naturalSugar: 14,
              addedSugar: 6,
              sodium: 95,
              vitaminsAndMinerals: { 'Calcium': '320 mg', 'Vitamin B12': '0.9 mcg', 'Magnesium': '68 mg' },
            },
            ingredients: [
              { name: 'Greek Yogurt (plain)', amount: '1 cup (200g)' },
              { name: 'Rolled Oats', amount: '1/3 cup (35g)', pantryStaple: true },
              { name: 'Honey', amount: '1 tbsp (15g)', pantryStaple: true },
              { name: 'Walnuts', amount: '15g', isReusedInOtherMeals: true }
            ],
            instructions: [
              'Scoop Greek yogurt into a bowl.',
              'Stir in raw rolled oats and allow to soften for 2 minutes.',
              'Top with crushed walnuts and drizzle with honey.'
            ],
            wasteSavingTip: 'Buy oats in bulk containers; they last up to 12 months in the pantry.',
            dietaryBadges: ['High Protein', 'Vegetarian', 'Quick (<10m)']
          },
          lunch: {
            id: 'm1-l',
            name: 'Crispy Lemon Chickpea & Spinach Wrap',
            type: 'lunch',
            description: 'Pan-toasted whole chickpeas tossed with lemon, cumin, fresh spinach, and creamy tahini in a whole wheat tortilla.',
            prepTimeMinutes: 8,
            cookTimeMinutes: 5,
            estimatedCost: 42.00,
            macros: {
              calories: 510,
              protein: 21,
              carbs: 68,
              fat: 18,
              fiber: 14,
              naturalSugar: 4,
              addedSugar: 0,
              sodium: 480,
              vitaminsAndMinerals: { 'Iron': '4.6 mg', 'Folate': '180 mcg', 'Vitamin C': '18 mg' },
            },
            ingredients: [
              { name: 'Boiled Chickpeas', amount: '1 cup (160g)', isReusedInOtherMeals: true },
              { name: 'Fresh Spinach', amount: '1.5 cups (45g)', isReusedInOtherMeals: true },
              { name: 'Whole Wheat Wrap / Roti', amount: '1 large', isReusedInOtherMeals: true },
              { name: 'Tahini or Olive Oil', amount: '1 tbsp (15ml)', pantryStaple: true },
              { name: 'Lemon Juice', amount: '1 tbsp' }
            ],
            instructions: [
              'Drain chickpeas. Pan-sear in olive oil with cumin, salt, and paprika for 4 minutes until golden.',
              'Warm tortilla in a dry skillet for 30 seconds.',
              'Layer fresh spinach, warm crispy chickpeas, and drizzle with tahini and lemon juice before rolling.'
            ],
            wasteSavingTip: 'Save the chickpea boiling liquid to use as a thickening base for gravies.',
            dietaryBadges: ['Vegan', 'High Fiber', 'Budget Staple']
          },
          dinner: {
            id: 'm1-d',
            name: 'Sheet-Pan Mediterranean Lemon Herb Chicken & Roasted Veggies',
            type: 'dinner',
            description: 'Tender chicken roasted with carrots, red onions, zucchini, and garlic alongside fluffy brown rice.',
            prepTimeMinutes: 12,
            cookTimeMinutes: 28,
            estimatedCost: 72.00,
            macros: {
              calories: 780,
              protein: 42,
              carbs: 78,
              fat: 34,
              fiber: 12,
              naturalSugar: 8,
              addedSugar: 0,
              sodium: 620,
              vitaminsAndMinerals: { 'Vitamin A': '820 mcg', 'Vitamin B6': '0.9 mg', 'Zinc': '2.8 mg', 'Potassium': '940 mg' },
            },
            ingredients: [
              { name: 'Chicken Thighs / Breast', amount: '200g', isReusedInOtherMeals: true },
              { name: 'Carrots', amount: '2 whole (120g)', isReusedInOtherMeals: true },
              { name: 'Zucchini / Lauki', amount: '1 medium (100g)', isReusedInOtherMeals: true },
              { name: 'Red Onion', amount: '1/2 (60g)', isReusedInOtherMeals: true },
              { name: 'Brown Rice', amount: '1 cup cooked (150g)', isReusedInOtherMeals: true },
              { name: 'Olive Oil & Dried Oregano', amount: '1 tbsp (15ml)', pantryStaple: true }
            ],
            instructions: [
              'Preheat oven or tawa/kadai.',
              'Toss chicken, sliced carrots, zucchini, and onion wedges with olive oil, salt, garlic, and oregano.',
              'Roast for 25 minutes until chicken is cooked through and veggies are caramelized.',
              'Serve over 1 cup warm brown rice. Reserve half the roasted vegetables for tomorrow’s lunch.'
            ],
            wasteSavingTip: 'Save chicken bones and vegetable skins in the freezer for homemade stock.',
            dietaryBadges: ['High Protein', 'Batch Prep', 'Gluten-Free']
          },
          snack: {
            id: 'm1-s',
            name: 'Sliced Apple with Cinnamon & Peanut Butter',
            type: 'snack',
            description: 'Crisp whole apple slices dusted with cinnamon and served with natural peanut butter.',
            prepTimeMinutes: 3,
            cookTimeMinutes: 0,
            estimatedCost: 22.00,
            macros: {
              calories: 270,
              protein: 5,
              carbs: 30,
              fat: 12,
              fiber: 6,
              naturalSugar: 19,
              addedSugar: 0,
              sodium: 80,
              vitaminsAndMinerals: { 'Vitamin C': '8.4 mg', 'Potassium': '210 mg', 'Magnesium': '28 mg' },
            },
            ingredients: [
              { name: 'Medium Apple', amount: '1 whole (150g)', isReusedInOtherMeals: true },
              { name: 'Peanut Butter', amount: '1.5 tbsp (24g)', pantryStaple: true },
              { name: 'Ground Cinnamon', amount: 'pinch', pantryStaple: true }
            ],
            instructions: [
              'Core and slice the apple into wedges.',
              'Dust with cinnamon and serve with peanut butter for dipping.'
            ],
            wasteSavingTip: 'Buy apples in 1kg bulk bags for ~₹120 instead of individual fruit for significant savings.',
            dietaryBadges: ['Zero Cooking', 'Vegetarian', 'Sustained Energy']
          }
        }
      },
      {
        dayNumber: 2,
        dayName: 'Tuesday',
        dailyWasteSaverNote: 'Recycled leftover roasted Mediterranean veggies into a fresh lunch grain bowl.',
        dayEstimatedCost: 140.00,
        totalDayMacros: {
          calories: 1950,
          protein: 88,
          carbs: 220,
          fat: 80,
          fiber: 35,
          naturalSugar: 28,
          addedSugar: 0,
          sodium: 1380,
          vitaminsAndMinerals: {
            'Vitamin C': '54 mg',
            'Calcium': '640 mg',
            'Iron': '15.8 mg',
            'Potassium': '2280 mg',
            'Vitamin B12': '1.6 mcg',
          },
        },
        meals: {
          breakfast: {
            id: 'm2-b',
            name: 'Mediterranean Spinach & Feta 2-Egg Scramble',
            type: 'breakfast',
            description: 'Fluffy eggs scrambled with a handful of fresh spinach, crumbled feta or paneer, and whole grain toast.',
            prepTimeMinutes: 5,
            cookTimeMinutes: 5,
            estimatedCost: 32.00,
            macros: {
              calories: 390,
              protein: 22,
              carbs: 26,
              fat: 22,
              fiber: 4,
              naturalSugar: 2,
              addedSugar: 0,
              sodium: 460,
              vitaminsAndMinerals: { 'Choline': '294 mg', 'Vitamin B12': '1.1 mcg', 'Iron': '2.6 mg' },
            },
            ingredients: [
              { name: 'Eggs', amount: '2 large', isReusedInOtherMeals: true },
              { name: 'Fresh Spinach', amount: '1 cup (30g)', isReusedInOtherMeals: true },
              { name: 'Feta Cheese / Paneer', amount: '2 tbsp (30g)', isReusedInOtherMeals: true },
              { name: 'Whole Wheat Toast', amount: '1 slice (35g)', isReusedInOtherMeals: true }
            ],
            instructions: [
              'Whisk eggs in a bowl with a pinch of salt and pepper.',
              'Heat a skillet with oil, wilt spinach for 45 seconds, then pour in eggs.',
              'Gently fold until softly set, sprinkle feta/paneer, and serve with toasted whole wheat bread.'
            ],
            wasteSavingTip: 'Use spinach stems and wilted leaves first; they cook down completely in scrambled eggs.',
            dietaryBadges: ['High Protein', 'Vegetarian', 'Under 10 Mins']
          },
          lunch: {
            id: 'm2-l',
            name: 'Roasted Veggie & Chickpea Mediterranean Grain Bowl',
            type: 'lunch',
            description: 'Warm brown rice layered with Monday’s leftover roasted veggies, chickpeas, and lemon herb dressing.',
            prepTimeMinutes: 5,
            cookTimeMinutes: 2,
            estimatedCost: 38.00,
            macros: {
              calories: 540,
              protein: 19,
              carbs: 82,
              fat: 16,
              fiber: 14,
              naturalSugar: 6,
              addedSugar: 0,
              sodium: 380,
              vitaminsAndMinerals: { 'Iron': '3.8 mg', 'Magnesium': '112 mg', 'Vitamin A': '450 mcg' },
            },
            ingredients: [
              { name: 'Leftover Roasted Veggies (from Day 1)', amount: '1.5 cups', isReusedInOtherMeals: true },
              { name: 'Brown Rice (cooked)', amount: '1 cup (150g)', isReusedInOtherMeals: true },
              { name: 'Chickpeas', amount: '1/2 cup (80g)', isReusedInOtherMeals: true },
              { name: 'Olive oil + Lemon juice', amount: '1 tbsp', pantryStaple: true }
            ],
            instructions: [
              'Warm the pre-cooked brown rice and leftover roasted vegetables for 90 seconds.',
              'Toss with rinsed chickpeas, olive oil, and a squeeze of fresh lemon juice.',
              'Garnish with herbs and serve warm.'
            ],
            wasteSavingTip: 'Zero cooking required! 5-minute lunch that uses 100% leftover prep from yesterday.',
            dietaryBadges: ['Leftover Hero', 'Vegetarian', 'Fiber Rich']
          },
          dinner: {
            id: 'm2-d',
            name: 'One-Pot Garlic Herb Lentil Stew with Crusty Bread',
            type: 'dinner',
            description: 'Hearty brown lentils / masoor simmered with diced carrots, onions, tomatoes, and dried rosemary.',
            prepTimeMinutes: 10,
            cookTimeMinutes: 25,
            estimatedCost: 52.00,
            macros: {
              calories: 720,
              protein: 36,
              carbs: 98,
              fat: 18,
              fiber: 28,
              naturalSugar: 9,
              addedSugar: 0,
              sodium: 480,
              vitaminsAndMinerals: { 'Folate': '280 mcg (70% DV)', 'Iron': '7.2 mg (40% DV)', 'Potassium': '1100 mg' },
            },
            ingredients: [
              { name: 'Dry Brown Lentils / Masoor', amount: '1 cup (180g)', isReusedInOtherMeals: true },
              { name: 'Tomatoes (pureed/diced)', amount: '1 cup (150g)', isReusedInOtherMeals: true },
              { name: 'Carrots', amount: '2 whole (120g)', isReusedInOtherMeals: true },
              { name: 'Yellow Onion', amount: '1/2 (60g)', isReusedInOtherMeals: true },
              { name: 'Garlic', amount: '3 cloves', pantryStaple: true },
              { name: 'Whole Wheat Bread', amount: '2 slices (70g)', isReusedInOtherMeals: true }
            ],
            instructions: [
              'Saute diced onion, garlic, and carrots in olive oil for 4 minutes until fragrant.',
              'Add rinsed lentils, tomatoes, and 3 cups of water.',
              'Bring to a boil, cover, and simmer for 22 minutes until lentils are tender.',
              'Season with salt, black pepper, and dried oregano. Serve with toasted whole wheat bread. Save 1 bowl for Day 3.'
            ],
            wasteSavingTip: 'Dry lentils cost ~₹110/kg (giving 10+ generous servings) and cook in under 25 minutes without pre-soaking.',
            dietaryBadges: ['Ultra Low-Cost', 'Vegan', 'High Protein', 'Freezer Friendly']
          },
          snack: {
            id: 'm2-s',
            name: 'Cucumber Rounds with Creamy Feta/Dahi Dip',
            type: 'snack',
            description: 'Crisp cucumber slices served with a quick whipped feta and Greek yogurt dip.',
            prepTimeMinutes: 4,
            cookTimeMinutes: 0,
            estimatedCost: 18.00,
            macros: {
              calories: 210,
              protein: 9,
              carbs: 12,
              fat: 14,
              fiber: 2,
              naturalSugar: 4,
              addedSugar: 0,
              sodium: 260,
              vitaminsAndMinerals: { 'Calcium': '180 mg', 'Vitamin K': '35 mcg' },
            },
            ingredients: [
              { name: 'Cucumber', amount: '1/2 medium (100g)', isReusedInOtherMeals: true },
              { name: 'Feta Cheese / Paneer', amount: '2 tbsp (30g)', isReusedInOtherMeals: true },
              { name: 'Greek Yogurt / Dahi', amount: '2 tbsp (40g)', isReusedInOtherMeals: true }
            ],
            instructions: [
              'Mash feta and Greek yogurt together with a fork and cracked black pepper.',
              'Slice cucumber into thick rounds and use to scoop dip.'
            ],
            wasteSavingTip: 'Keep cucumbers wrapped in paper towel in the produce drawer to prevent moisture buildup.',
            dietaryBadges: ['Low Carb', 'Hydrating', 'Quick Snack']
          }
        }
      },
      {
        dayNumber: 3,
        dayName: 'Wednesday',
        dailyWasteSaverNote: 'Used remaining tomatoes and open spinach in a Mediterranean skillet frittata.',
        dayEstimatedCost: 143.00,
        totalDayMacros: {
          calories: 2010,
          protein: 96,
          carbs: 215,
          fat: 84,
          fiber: 32,
          naturalSugar: 30,
          addedSugar: 6,
          sodium: 1410,
          vitaminsAndMinerals: {
            'Calcium': '710 mg',
            'Vitamin C': '62 mg',
            'Iron': '13.8 mg',
            'Vitamin B12': '2.2 mcg',
          },
        },
        meals: {
          breakfast: {
            id: 'm3-b',
            name: 'Warm Cinnamon Apple Oatmeal with Walnuts',
            type: 'breakfast',
            description: 'Hearty rolled oats simmered with diced apple and cinnamon, topped with crunchy walnuts.',
            prepTimeMinutes: 3,
            cookTimeMinutes: 6,
            estimatedCost: 28.00,
            macros: {
              calories: 440,
              protein: 12,
              carbs: 72,
              fat: 14,
              fiber: 10,
              naturalSugar: 18,
              addedSugar: 5,
              sodium: 70,
              vitaminsAndMinerals: { 'Iron': '2.8 mg', 'Magnesium': '95 mg', 'Zinc': '1.8 mg' },
            },
            ingredients: [
              { name: 'Rolled Oats', amount: '1/2 cup (50g)', pantryStaple: true },
              { name: 'Apple', amount: '1/2, diced (80g)', isReusedInOtherMeals: true },
              { name: 'Walnuts', amount: '15g', isReusedInOtherMeals: true },
              { name: 'Cinnamon & Honey', amount: '1 tsp each', pantryStaple: true }
            ],
            instructions: [
              'Simmer oats in 1 cup water with diced apple and cinnamon for 5 minutes.',
              'Remove from heat, stir in honey, and top with walnuts.'
            ],
            wasteSavingTip: 'Cooking the apple directly in the oatmeal softens even slightly bruised apples perfectly.',
            dietaryBadges: ['Heart Healthy', 'Vegan Option', 'Budget Friendly']
          },
          lunch: {
            id: 'm3-l',
            name: 'Reheated Garlic Herb Lentil Soup & Garden Salad',
            type: 'lunch',
            description: 'Rich lentil stew from Tuesday paired with crisp sliced cucumber and dressed greens.',
            prepTimeMinutes: 4,
            cookTimeMinutes: 2,
            estimatedCost: 35.00,
            macros: {
              calories: 520,
              protein: 26,
              carbs: 74,
              fat: 12,
              fiber: 20,
              naturalSugar: 6,
              addedSugar: 0,
              sodium: 390,
              vitaminsAndMinerals: { 'Iron': '5.2 mg', 'Folate': '210 mcg', 'Potassium': '850 mg' },
            },
            ingredients: [
              { name: 'Leftover Lentil Stew (from Day 2)', amount: '1.5 cups', isReusedInOtherMeals: true },
              { name: 'Fresh Spinach / Greens', amount: '1.5 cups (45g)', isReusedInOtherMeals: true },
              { name: 'Cucumber', amount: '1/2 sliced (100g)', isReusedInOtherMeals: true },
              { name: 'Olive Oil & Vinegar', amount: '1 tbsp', pantryStaple: true }
            ],
            instructions: [
              'Reheat lentil stew for 2 minutes.',
              'Toss spinach and cucumber slices with olive oil and salt for a refreshing side salad.'
            ],
            wasteSavingTip: 'Lentil stew tastes even richer on Day 2 as the herbs and spices infuse deeper.',
            dietaryBadges: ['High Protein', 'Gluten-Free', 'Leftover Hero']
          },
          dinner: {
            id: 'm3-d',
            name: 'Mediterranean Cast-Iron Spinach, Tomato & Feta Frittata',
            type: 'dinner',
            description: 'Whisked farm eggs baked with sauteed spinach, remainder crushed tomatoes, garlic, and salty feta cheese.',
            prepTimeMinutes: 10,
            cookTimeMinutes: 18,
            estimatedCost: 58.00,
            macros: {
              calories: 690,
              protein: 42,
              carbs: 32,
              fat: 44,
              fiber: 6,
              naturalSugar: 5,
              addedSugar: 0,
              sodium: 780,
              vitaminsAndMinerals: { 'Choline': '580 mg (105% DV)', 'Calcium': '340 mg', 'Vitamin A': '620 mcg' },
            },
            ingredients: [
              { name: 'Eggs', amount: '4 large', isReusedInOtherMeals: true },
              { name: 'Fresh Spinach', amount: '2 cups (60g)', isReusedInOtherMeals: true },
              { name: 'Tomatoes (diced)', amount: '1/2 cup (80g)', isReusedInOtherMeals: true },
              { name: 'Feta / Paneer', amount: '1/4 cup (40g)', isReusedInOtherMeals: true },
              { name: 'Whole Wheat Toast', amount: '2 slices (70g)', isReusedInOtherMeals: true }
            ],
            instructions: [
              'Saute spinach and minced garlic in a pan for 2 minutes until wilted. Swirl in diced tomatoes.',
              'Pour whisked seasoned eggs over the pan and crumble feta on top.',
              'Cook on low-medium until set and golden.',
              'Serve half tonight with toasted bread. Save remaining half for Thursday breakfast!'
            ],
            wasteSavingTip: 'Frittatas are the ultimate waste-reduction dinner: empty out open veggies before they spoil.',
            dietaryBadges: ['High Protein', 'Vegetarian', 'Two-Meal Maker']
          },
          snack: {
            id: 'm3-s',
            name: 'Greek Yogurt with Drizzled Honey',
            type: 'snack',
            description: 'Creamy Greek yogurt with raw wildflower honey.',
            prepTimeMinutes: 2,
            cookTimeMinutes: 0,
            estimatedCost: 22.00,
            macros: {
              calories: 220,
              protein: 18,
              carbs: 24,
              fat: 4,
              fiber: 0,
              naturalSugar: 8,
              addedSugar: 6,
              sodium: 85,
              vitaminsAndMinerals: { 'Calcium': '220 mg', 'Vitamin B12': '0.7 mcg' },
            },
            ingredients: [
              { name: 'Greek Yogurt', amount: '3/4 cup (150g)', isReusedInOtherMeals: true },
              { name: 'Honey', amount: '1 tbsp (15g)', pantryStaple: true }
            ],
            instructions: ['Stir honey into Greek yogurt and enjoy chilled.'],
            wasteSavingTip: 'Large 400g/500g tubs of yogurt are 40% cheaper per gram than single-serve cups.',
            dietaryBadges: ['Probiotic', 'High Protein', 'Sweet Craving']
          }
        }
      },
      {
        dayNumber: 4,
        dayName: 'Thursday',
        dailyWasteSaverNote: 'Breakfast features leftover frittata from Wednesday; zero morning cooking required.',
        dayEstimatedCost: 167.00,
        totalDayMacros: {
          calories: 2020,
          protein: 94,
          carbs: 218,
          fat: 82,
          fiber: 34,
          naturalSugar: 26,
          addedSugar: 0,
          sodium: 1450,
          vitaminsAndMinerals: {
            'Vitamin D': '120 IU',
            'Omega-3': '1.4 g',
            'Iron': '12.4 mg',
            'Calcium': '520 mg',
          },
        },
        meals: {
          breakfast: {
            id: 'm4-b',
            name: 'Leftover Spinach-Feta Frittata Slice & Whole Toast',
            type: 'breakfast',
            description: 'Warmed slice of yesterday’s savory frittata served with a crisp slice of toast.',
            prepTimeMinutes: 2,
            cookTimeMinutes: 2,
            estimatedCost: 22.00,
            macros: {
              calories: 410,
              protein: 24,
              carbs: 28,
              fat: 20,
              fiber: 4,
              naturalSugar: 3,
              addedSugar: 0,
              sodium: 440,
              vitaminsAndMinerals: { 'Choline': '290 mg', 'Vitamin B12': '1.1 mcg', 'Iron': '2.8 mg' },
            },
            ingredients: [
              { name: 'Leftover Frittata Slice (from Day 3)', amount: '1 slice', isReusedInOtherMeals: true },
              { name: 'Whole Wheat Toast', amount: '1 slice (35g)', isReusedInOtherMeals: true }
            ],
            instructions: ['Warm frittata in a pan or toaster oven for 60 seconds and enjoy with toast.'],
            wasteSavingTip: 'Batch egg dishes hold up in the fridge for up to 4 days without losing texture.',
            dietaryBadges: ['Ready in 2 Mins', 'High Protein']
          },
          lunch: {
            id: 'm4-l',
            name: 'Mediterranean Tuna & White Bean Salad',
            type: 'lunch',
            description: 'Flaked chunk light tuna mixed with chickpeas, red onion, olive oil, lemon, and parsley in a wrap.',
            prepTimeMinutes: 6,
            cookTimeMinutes: 0,
            estimatedCost: 75.00,
            macros: {
              calories: 530,
              protein: 38,
              carbs: 48,
              fat: 20,
              fiber: 12,
              naturalSugar: 4,
              addedSugar: 0,
              sodium: 540,
              vitaminsAndMinerals: { 'Selenium': '68 mcg', 'Niacin': '12 mg', 'Vitamin B12': '2.4 mcg' },
            },
            ingredients: [
              { name: 'Canned Tuna in water', amount: '1 can (120g)', isReusedInOtherMeals: true },
              { name: 'Chickpeas', amount: '1/2 cup (80g)', isReusedInOtherMeals: true },
              { name: 'Red Onion', amount: '2 tbsp finely diced (25g)', isReusedInOtherMeals: true },
              { name: 'Olive Oil + Lemon', amount: '1.5 tbsp', pantryStaple: true },
              { name: 'Whole Wheat Wrap', amount: '1 wrap (45g)', isReusedInOtherMeals: true }
            ],
            instructions: [
              'Drain tuna and chickpeas.',
              'Combine in a bowl with diced red onion, olive oil, lemon juice, salt, and black pepper.',
              'Serve wrapped in a whole wheat tortilla.'
            ],
            wasteSavingTip: 'Canned light tuna is rich in lean protein and essential omega-3 fatty acids.',
            dietaryBadges: ['Lean Protein', 'No Cook', 'High Omega-3']
          },
          dinner: {
            id: 'm4-d',
            name: 'Crispy Garlic Chickpea & Rice Bowl with Tahini Drizzle',
            type: 'dinner',
            description: 'Spiced pan-roasted chickpeas, sautéed garlic greens, and sweet caramelized carrots over brown rice.',
            prepTimeMinutes: 8,
            cookTimeMinutes: 14,
            estimatedCost: 48.00,
            macros: {
              calories: 730,
              protein: 24,
              carbs: 104,
              fat: 26,
              fiber: 22,
              naturalSugar: 9,
              addedSugar: 0,
              sodium: 480,
              vitaminsAndMinerals: { 'Iron': '5.4 mg', 'Folate': '240 mcg', 'Magnesium': '140 mg' },
            },
            ingredients: [
              { name: 'Chickpeas', amount: '1 cup (160g)', isReusedInOtherMeals: true },
              { name: 'Brown Rice', amount: '1 cup cooked (150g)', isReusedInOtherMeals: true },
              { name: 'Carrots', amount: '2 sliced (120g)', isReusedInOtherMeals: true },
              { name: 'Spinach', amount: '1.5 cups (45g)', isReusedInOtherMeals: true },
              { name: 'Tahini Dressing', amount: '2 tbsp (30g)', pantryStaple: true }
            ],
            instructions: [
              'In a skillet, saute carrots in olive oil until fork-tender (5 mins).',
              'Add chickpeas with smoked paprika, cumin, and garlic; cook until crisp.',
              'Toss in spinach at the final minute to wilt.',
              'Serve hot over brown rice and drizzle with lemon tahini sauce.'
            ],
            wasteSavingTip: 'Uses remaining carrots and finish off the fresh spinach bag before the weekend.',
            dietaryBadges: ['Vegan', 'Plant Protein', 'Budget Star']
          },
          snack: {
            id: 'm4-s',
            name: 'Apple Slices with Crushed Walnuts & Cinnamon',
            type: 'snack',
            description: 'Fresh sliced apple with walnut pieces and a dash of spice.',
            prepTimeMinutes: 2,
            cookTimeMinutes: 0,
            estimatedCost: 22.00,
            macros: {
              calories: 230,
              protein: 4,
              carbs: 28,
              fat: 12,
              fiber: 5,
              naturalSugar: 16,
              addedSugar: 0,
              sodium: 5,
              vitaminsAndMinerals: { 'Vitamin C': '7 mg', 'Copper': '0.3 mg', 'ALA Omega-3': '1.2 g' },
            },
            ingredients: [
              { name: 'Apple', amount: '1 medium (140g)', isReusedInOtherMeals: true },
              { name: 'Walnuts', amount: '15g', isReusedInOtherMeals: true }
            ],
            instructions: ['Slice apple and top with chopped walnuts.'],
            wasteSavingTip: 'Simple, shelf-stable whole foods keep snack costs under ₹25/day.',
            dietaryBadges: ['Vegan', 'Raw Whole Food']
          }
        }
      },
      {
        dayNumber: 5,
        dayName: 'Friday',
        dailyWasteSaverNote: 'End of week pantry cleanout: hearty skillet pasta using remaining canned tomato & chicken.',
        dayEstimatedCost: 166.00,
        totalDayMacros: {
          calories: 2040,
          protein: 98,
          carbs: 235,
          fat: 78,
          fiber: 29,
          naturalSugar: 24,
          addedSugar: 6,
          sodium: 1480,
          vitaminsAndMinerals: {
            'Calcium': '540 mg',
            'Iron': '11.8 mg',
            'Vitamin B6': '1.2 mg',
            'Potassium': '2100 mg',
          },
        },
        meals: {
          breakfast: {
            id: 'm5-b',
            name: 'High-Protein Greek Yogurt Parfait with Toasted Oats',
            type: 'breakfast',
            description: 'Layered Greek yogurt with lightly toasted rolled oats, walnuts, and honey.',
            prepTimeMinutes: 5,
            cookTimeMinutes: 3,
            estimatedCost: 34.00,
            macros: {
              calories: 430,
              protein: 25,
              carbs: 52,
              fat: 14,
              fiber: 5,
              naturalSugar: 12,
              addedSugar: 6,
              sodium: 90,
              vitaminsAndMinerals: { 'Calcium': '310 mg', 'Zinc': '2.1 mg', 'Magnesium': '72 mg' },
            },
            ingredients: [
              { name: 'Greek Yogurt', amount: '1 cup (200g)', isReusedInOtherMeals: true },
              { name: 'Rolled Oats', amount: '1/3 cup toasted (35g)', pantryStaple: true },
              { name: 'Walnuts & Honey', amount: '1 tbsp each', pantryStaple: true }
            ],
            instructions: [
              'Toast rolled oats in a dry pan for 3 minutes until nutty and golden.',
              'Layer into a glass with Greek yogurt and drizzle with honey and crushed walnuts.'
            ],
            wasteSavingTip: 'Toasting raw oats in a dry skillet gives granola flavor without buying expensive store granola bags.',
            dietaryBadges: ['High Protein', 'Vegetarian', 'Crunchy Texture']
          },
          lunch: {
            id: 'm5-l',
            name: 'Quick Mediterranean Hummus & Veggie Wrap',
            type: 'lunch',
            description: 'Smashed chickpeas with lemon and tahini, cucumber, onion, and feta rolled in a warm wrap.',
            prepTimeMinutes: 7,
            cookTimeMinutes: 0,
            estimatedCost: 38.00,
            macros: {
              calories: 480,
              protein: 18,
              carbs: 64,
              fat: 18,
              fiber: 11,
              naturalSugar: 5,
              addedSugar: 0,
              sodium: 460,
              vitaminsAndMinerals: { 'Iron': '3.4 mg', 'Folate': '140 mcg', 'Vitamin C': '12 mg' },
            },
            ingredients: [
              { name: 'Whole Wheat Wrap', amount: '1 wrap (45g)', isReusedInOtherMeals: true },
              { name: 'Chickpeas (mashed with olive oil & lemon)', amount: '1/2 cup (80g)', isReusedInOtherMeals: true },
              { name: 'Cucumber & Red Onion', amount: '1/2 cup sliced (60g)', isReusedInOtherMeals: true },
              { name: 'Feta / Paneer', amount: '2 tbsp (30g)', isReusedInOtherMeals: true }
            ],
            instructions: [
              'Coarsely mash chickpeas with a fork, olive oil, lemon juice, salt, and cumin to make instant rustic hummus.',
              'Spread across tortilla, add sliced cucumber, onion, and feta, and roll tightly.'
            ],
            wasteSavingTip: 'Making quick rustic fork-smashed hummus at home costs ₹15 vs ₹150 for a store container.',
            dietaryBadges: ['Vegetarian', 'No Blender Needed', 'Fiber Rich']
          },
          dinner: {
            id: 'm5-d',
            name: 'One-Pot Mediterranean Chicken & Tomato Pasta',
            type: 'dinner',
            description: 'Whole wheat penne pasta cooked in rich tomato sauce with seared chicken, garlic, oregano, and melted feta.',
            prepTimeMinutes: 10,
            cookTimeMinutes: 16,
            estimatedCost: 78.00,
            macros: {
              calories: 810,
              protein: 46,
              carbs: 92,
              fat: 28,
              fiber: 11,
              naturalSugar: 8,
              addedSugar: 0,
              sodium: 620,
              vitaminsAndMinerals: { 'Lycopene': '14 mg', 'Niacin': '16 mg', 'Phosphorus': '420 mg' },
            },
            ingredients: [
              { name: 'Whole Wheat Pasta', amount: '80g (dry)', isReusedInOtherMeals: true },
              { name: 'Chicken Thigh/Breast (diced)', amount: '160g', isReusedInOtherMeals: true },
              { name: 'Tomatoes (pureed)', amount: '1 cup (150g)', isReusedInOtherMeals: true },
              { name: 'Garlic & Dried Oregano', amount: '3 cloves', pantryStaple: true },
              { name: 'Feta / Paneer', amount: '30g', isReusedInOtherMeals: true }
            ],
            instructions: [
              'Sear diced seasoned chicken in olive oil until golden (5 mins).',
              'In the same skillet, add minced garlic, tomatoes, dried oregano, and 1.5 cups water.',
              'Add dry pasta directly into the sauce. Simmer for 10 minutes until pasta is al dente.',
              'Stir chicken back in, top with crumbled cheese, and let melt.'
            ],
            wasteSavingTip: 'One-pot pasta saves energy, water, cleanup time, and starchy pasta water thickens sauce naturally.',
            dietaryBadges: ['Friday Comfort', 'High Protein', 'One Pot Clean']
          },
          snack: {
            id: 'm5-s',
            name: 'Hard-Boiled Eggs with Sea Salt & Smoked Paprika',
            type: 'snack',
            description: 'Two hard-boiled eggs sprinkled with flaky salt and paprika.',
            prepTimeMinutes: 1,
            cookTimeMinutes: 0,
            estimatedCost: 16.00,
            macros: {
              calories: 140,
              protein: 12,
              carbs: 1,
              fat: 10,
              fiber: 0,
              naturalSugar: 0.6,
              addedSugar: 0,
              sodium: 140,
              vitaminsAndMinerals: { 'Choline': '294 mg', 'Vitamin D': '82 IU', 'Vitamin B12': '1.1 mcg' },
            },
            ingredients: [
              { name: 'Hard Boiled Eggs', amount: '2 large', isReusedInOtherMeals: true },
              { name: 'Smoked Paprika & Salt', amount: 'pinch', pantryStaple: true }
            ],
            instructions: ['Peel pre-boiled eggs, slice in half, and sprinkle with paprika and salt.'],
            wasteSavingTip: 'Boiling 6 eggs at the start of the week guarantees instant 10-second healthy snacks.',
            dietaryBadges: ['Keto/Low Carb', 'Under ₹20', 'High Protein']
          }
        }
      },
      {
        dayNumber: 6,
        dayName: 'Saturday',
        dailyWasteSaverNote: 'Weekend brunch and relaxed skillet cooking utilizing remaining eggs and veggies.',
        dayEstimatedCost: 167.00,
        totalDayMacros: {
          calories: 2050,
          protein: 92,
          carbs: 228,
          fat: 84,
          fiber: 30,
          naturalSugar: 28,
          addedSugar: 0,
          sodium: 1390,
          vitaminsAndMinerals: {
            'Vitamin A': '940 mcg',
            'Vitamin C': '48 mg',
            'Iron': '13.2 mg',
            'Potassium': '2320 mg',
          },
        },
        meals: {
          breakfast: {
            id: 'm6-b',
            name: 'Shakshuka-Style Eggs in Spiced Tomato Sauce',
            type: 'breakfast',
            description: 'Gently poached eggs simmered in spiced tomato, onion, and garlic sauce served with whole grain bread.',
            prepTimeMinutes: 6,
            cookTimeMinutes: 12,
            estimatedCost: 36.00,
            macros: {
              calories: 460,
              protein: 22,
              carbs: 44,
              fat: 22,
              fiber: 6,
              naturalSugar: 6,
              addedSugar: 0,
              sodium: 480,
              vitaminsAndMinerals: { 'Lycopene': '9.2 mg', 'Choline': '290 mg', 'Iron': '3.2 mg' },
            },
            ingredients: [
              { name: 'Eggs', amount: '2 large', isReusedInOtherMeals: true },
              { name: 'Tomatoes (diced/crushed)', amount: '3/4 cup (120g)', isReusedInOtherMeals: true },
              { name: 'Onion & Garlic', amount: '1/4 onion, 2 cloves', isReusedInOtherMeals: true },
              { name: 'Cumin, Paprika, Olive Oil', amount: '1 tbsp', pantryStaple: true },
              { name: 'Whole Wheat Bread', amount: '2 slices (70g)', isReusedInOtherMeals: true }
            ],
            instructions: [
              'Saute diced onion and garlic in olive oil with cumin and paprika for 3 minutes.',
              'Pour in crushed tomatoes and simmer for 4 minutes until thick.',
              'Make two small wells and crack eggs inside. Cover pan and cook on low for 5 minutes until set.',
              'Dip warm bread directly into eggs and sauce.'
            ],
            wasteSavingTip: 'Shakshuka finishes off open tomato cans and makes an extraordinary weekend breakfast for under ₹40.',
            dietaryBadges: ['Weekend Gourmet', 'High Protein', 'Vegetarian']
          },
          lunch: {
            id: 'm6-l',
            name: 'Brown Rice & Lentil Pilaf with Spiced Yogurt',
            type: 'lunch',
            description: 'Fragrant Mediterranean rice and lentils topped with sweet caramelized onions and yogurt.',
            prepTimeMinutes: 8,
            cookTimeMinutes: 20,
            estimatedCost: 35.00,
            macros: {
              calories: 560,
              protein: 22,
              carbs: 92,
              fat: 12,
              fiber: 16,
              naturalSugar: 6,
              addedSugar: 0,
              sodium: 320,
              vitaminsAndMinerals: { 'Folate': '180 mcg', 'Iron': '4.8 mg', 'Magnesium': '120 mg' },
            },
            ingredients: [
              { name: 'Brown Rice & Lentils', amount: '1.5 cups cooked together', isReusedInOtherMeals: true },
              { name: 'Yellow Onion', amount: '1 whole, sliced thin (80g)', isReusedInOtherMeals: true },
              { name: 'Olive Oil, Cumin, Cinnamon', amount: '1 tbsp', pantryStaple: true },
              { name: 'Greek Yogurt / Dahi', amount: '2 tbsp (40g)', isReusedInOtherMeals: true }
            ],
            instructions: [
              'Caramelize sliced onions in olive oil over medium-low heat for 10 minutes until deep golden.',
              'Toss warm pre-cooked brown rice and lentils with cumin and cinnamon.',
              'Top with sweet caramelized onions and a dollop of yogurt.'
            ],
            wasteSavingTip: 'Rice and lentils together form a complete amino acid protein chain at pennies per serving.',
            dietaryBadges: ['Complete Protein', 'Plant Based', 'Comfort Food']
          },
          dinner: {
            id: 'm6-d',
            name: 'Crispy Lemon Garlic Chicken with Steamed Carrots',
            type: 'dinner',
            description: 'Crispy skin pan-seared chicken thighs infused with lemon and garlic, served alongside tender carrots.',
            prepTimeMinutes: 10,
            cookTimeMinutes: 20,
            estimatedCost: 72.00,
            macros: {
              calories: 750,
              protein: 44,
              carbs: 42,
              fat: 42,
              fiber: 8,
              naturalSugar: 8,
              addedSugar: 0,
              sodium: 580,
              vitaminsAndMinerals: { 'Vitamin A': '950 mcg', 'Niacin': '14 mg', 'Zinc': '3.2 mg' },
            },
            ingredients: [
              { name: 'Chicken Thighs / Breast', amount: '200g', isReusedInOtherMeals: true },
              { name: 'Carrots', amount: '3 whole (180g)', isReusedInOtherMeals: true },
              { name: 'Lemon & Garlic', amount: '1 lemon, 3 cloves', pantryStaple: true },
              { name: 'Olive Oil', amount: '1 tbsp', pantryStaple: true }
            ],
            instructions: [
              'Season chicken with salt, pepper, and garlic powder.',
              'Pan-sear chicken over medium heat until golden and crispy (14 mins total).',
              'Squeeze fresh lemon juice over the pan.',
              'Steam or roast carrot rounds and serve alongside crispy chicken.'
            ],
            wasteSavingTip: 'Cooking chicken skin-side down renders fat naturally without requiring added cooking oil.',
            dietaryBadges: ['Crispy Texture', 'High Protein', 'Gluten Free']
          },
          snack: {
            id: 'm6-s',
            name: 'Apple Nachos with Peanut Butter & Walnuts',
            type: 'snack',
            description: 'Thinly sliced apple arranged flat, drizzled with warm peanut butter and walnuts.',
            prepTimeMinutes: 3,
            cookTimeMinutes: 0,
            estimatedCost: 24.00,
            macros: {
              calories: 250,
              protein: 5,
              carbs: 28,
              fat: 14,
              fiber: 4,
              naturalSugar: 17,
              addedSugar: 0,
              sodium: 50,
              vitaminsAndMinerals: { 'Vitamin C': '8 mg', 'ALA Omega-3': '1.0 g' },
            },
            ingredients: [
              { name: 'Apple', amount: '1 medium (140g)', isReusedInOtherMeals: true },
              { name: 'Peanut Butter', amount: '1 tbsp (16g)', pantryStaple: true },
              { name: 'Walnuts', amount: '10g', isReusedInOtherMeals: true }
            ],
            instructions: ['Arrange apple slices on a plate, drizzle melted peanut butter over apples, and top with walnuts.'],
            wasteSavingTip: 'Fun presentation turns basic fruit into a satisfying dessert without buying sugary packaged sweets.',
            dietaryBadges: ['Sweet Treat', 'Healthy Dessert']
          }
        }
      },
      {
        dayNumber: 7,
        dayName: 'Sunday',
        dailyWasteSaverNote: 'Zero-Waste Sunday: "Kitchen Sink" cleanup day to ensure 0% food spoilage before next grocery shop.',
        dayEstimatedCost: 131.00,
        totalDayMacros: {
          calories: 1970,
          protein: 88,
          carbs: 220,
          fat: 78,
          fiber: 30,
          naturalSugar: 28,
          addedSugar: 5,
          sodium: 1340,
          vitaminsAndMinerals: {
            'Calcium': '560 mg',
            'Iron': '11.4 mg',
            'Choline': '320 mg',
            'Potassium': '1950 mg',
          },
        },
        meals: {
          breakfast: {
            id: 'm7-b',
            name: 'Classic Peanut Butter Honey Oat Bowl',
            type: 'breakfast',
            description: 'Creamy warm rolled oats cooked with peanut butter, a pinch of salt, and honey.',
            prepTimeMinutes: 4,
            cookTimeMinutes: 5,
            estimatedCost: 28.00,
            macros: {
              calories: 430,
              protein: 14,
              carbs: 62,
              fat: 16,
              fiber: 8,
              naturalSugar: 12,
              addedSugar: 5,
              sodium: 85,
              vitaminsAndMinerals: { 'Magnesium': '90 mg', 'Iron': '2.4 mg', 'Zinc': '1.6 mg' },
            },
            ingredients: [
              { name: 'Rolled Oats', amount: '1/2 cup (50g)', pantryStaple: true },
              { name: 'Peanut Butter', amount: '1.5 tbsp (24g)', pantryStaple: true },
              { name: 'Honey & Cinnamon', amount: '1 tsp each', pantryStaple: true }
            ],
            instructions: ['Cook oats in water for 5 minutes. Stir in peanut butter until melted and creamy. Top with honey.'],
            wasteSavingTip: 'A pantry-staple breakfast that uses zero perishable goods when the fridge is nearly empty on Sunday morning.',
            dietaryBadges: ['Pantry Hero', 'Vegan Option', 'Under ₹30']
          },
          lunch: {
            id: 'm7-l',
            name: 'Crispy Skillet Wrap with Feta, Beans & Sliced Veggies',
            type: 'lunch',
            description: 'Toasted wrap stuffed with the last of the chickpeas, red onion, cucumber, and melted feta.',
            prepTimeMinutes: 6,
            cookTimeMinutes: 4,
            estimatedCost: 36.00,
            macros: {
              calories: 490,
              protein: 18,
              carbs: 66,
              fat: 18,
              fiber: 10,
              naturalSugar: 4,
              addedSugar: 0,
              sodium: 460,
              vitaminsAndMinerals: { 'Calcium': '240 mg', 'Iron': '3.2 mg' },
            },
            ingredients: [
              { name: 'Whole Wheat Wrap', amount: '1 wrap (45g)', isReusedInOtherMeals: true },
              { name: 'Remaining Chickpeas & Feta', amount: '1/3 cup total', isReusedInOtherMeals: true },
              { name: 'Remaining Cucumber & Onion', amount: 'sliced (50g)', isReusedInOtherMeals: true }
            ],
            instructions: [
              'Fill the final tortilla wrap with all remaining fridge produce and cheese.',
              'Toast in a dry skillet on both sides until crispy and cheese is melted.'
            ],
            wasteSavingTip: 'Toasting wraps gives older produce a great crunchy texture and melts cheeses together.',
            dietaryBadges: ['Waste Eliminator', 'Vegetarian', 'Crispy']
          },
          dinner: {
            id: 'm7-d',
            name: 'Zero-Waste "Clean Out the Fridge" Fried Rice',
            type: 'dinner',
            description: 'Day-old chilled brown rice stir-fried in a hot pan with scrambled eggs, diced onion, carrots, and soy sauce.',
            prepTimeMinutes: 8,
            cookTimeMinutes: 10,
            estimatedCost: 45.00,
            macros: {
              calories: 730,
              protein: 32,
              carbs: 88,
              fat: 28,
              fiber: 8,
              naturalSugar: 6,
              addedSugar: 0,
              sodium: 620,
              vitaminsAndMinerals: { 'Choline': '294 mg', 'Vitamin A': '640 mcg', 'Iron': '3.8 mg' },
            },
            ingredients: [
              { name: 'Chilled Brown Rice', amount: '1.5 cups (220g)', isReusedInOtherMeals: true },
              { name: 'Eggs', amount: '2 large', isReusedInOtherMeals: true },
              { name: 'Remaining Carrots & Onion', amount: '1/2 cup diced (60g)', isReusedInOtherMeals: true },
              { name: 'Soy Sauce & Oil', amount: '1.5 tbsp', pantryStaple: true }
            ],
            instructions: [
              'Heat oil in a skillet over high heat. Saute diced carrots and onions for 3 minutes.',
              'Push veggies to the side, crack eggs in and scramble quickly.',
              'Add cold pre-cooked brown rice and toss vigorously with soy sauce and black pepper.'
            ],
            wasteSavingTip: 'Fried rice is scientifically best made with cold, dry leftover rice from earlier in the week!',
            dietaryBadges: ['Kitchen Masterpiece', 'Zero Food Waste', '10-Minute Meal']
          },
          snack: {
            id: 'm7-s',
            name: 'Greek Yogurt with Cinnamon & Honey',
            type: 'snack',
            description: 'Final scoop of Greek yogurt with wildflower honey and cinnamon.',
            prepTimeMinutes: 2,
            cookTimeMinutes: 0,
            estimatedCost: 22.00,
            macros: {
              calories: 210,
              protein: 17,
              carbs: 22,
              fat: 4,
              fiber: 1,
              naturalSugar: 8,
              addedSugar: 5,
              sodium: 85,
              vitaminsAndMinerals: { 'Calcium': '220 mg', 'Vitamin B12': '0.7 mcg' },
            },
            ingredients: [
              { name: 'Greek Yogurt', amount: '3/4 cup (150g)', isReusedInOtherMeals: true },
              { name: 'Honey', amount: '1 tbsp (15g)', pantryStaple: true }
            ],
            instructions: ['Scoop remaining yogurt, top with honey and cinnamon.'],
            wasteSavingTip: 'All dairy tubs completely finished before next grocery shopping day.',
            dietaryBadges: ['Probiotic', 'High Protein']
          }
        }
      }
    ]
  }
];

export const DEFAULT_GROCERY_LIST: GroceryList = {
  id: 'grocery-thrifty-mediterranean',
  planId: 'thrifty-mediterranean-plan',
  totalEstimatedCost: 1087.00,
  projectedSavingsFromZeroWaste: 380.00,
  items: [
    {
      id: 'g-1',
      name: 'Carrots (whole, 1 kg bag)',
      category: 'Produce',
      quantity: '1 kg (approx 7-8 carrots)',
      estimatedPrice: 40.00,
      usedInMeals: ['Mon Dinner', 'Tue Lunch', 'Tue Dinner', 'Thu Dinner', 'Sat Dinner', 'Sun Dinner'],
      isBought: false,
      isInPantry: false,
      shelfLifeDays: 21,
      zeroWasteTip: 'Whole unpeeled carrots last 3+ weeks in the crisper drawer. Keep tops dry.'
    },
    {
      id: 'g-2',
      name: 'Fresh Palak / Baby Spinach (250g bunch)',
      category: 'Produce',
      quantity: '1 large bunch (250g)',
      estimatedPrice: 25.00,
      usedInMeals: ['Mon Lunch', 'Tue Breakfast', 'Wed Dinner', 'Thu Dinner'],
      isBought: false,
      isInPantry: false,
      shelfLifeDays: 7,
      zeroWasteTip: 'Slip a dry paper towel into the container to absorb moisture. Freeze any remainder for smoothies.'
    },
    {
      id: 'g-3',
      name: 'Yellow / White Onions (1 kg bag)',
      category: 'Produce',
      quantity: '1 kg (5-6 onions)',
      estimatedPrice: 35.00,
      usedInMeals: ['Mon Dinner', 'Tue Dinner', 'Sat Breakfast', 'Sat Lunch', 'Sun Dinner'],
      isBought: false,
      isInPantry: false,
      shelfLifeDays: 30,
      zeroWasteTip: 'Store in a cool, dark, ventilated pantry away from potatoes.'
    },
    {
      id: 'g-4',
      name: 'Red Onions (1 kg bag)',
      category: 'Produce',
      quantity: '1 kg (5-6 onions)',
      estimatedPrice: 35.00,
      usedInMeals: ['Mon Dinner', 'Wed Lunch', 'Thu Lunch', 'Fri Lunch', 'Sun Lunch'],
      isBought: false,
      isInPantry: false,
      shelfLifeDays: 20,
      zeroWasteTip: 'Wrap cut onion halves in parchment paper or airtight container.'
    },
    {
      id: 'g-5',
      name: 'Cucumbers (Kheera, 500g)',
      category: 'Produce',
      quantity: '2 whole cucumbers (500g)',
      estimatedPrice: 25.00,
      usedInMeals: ['Tue Snack', 'Wed Lunch', 'Fri Lunch', 'Sun Lunch'],
      isBought: false,
      isInPantry: false,
      shelfLifeDays: 10,
      zeroWasteTip: 'Do not wash until ready to eat.'
    },
    {
      id: 'g-6',
      name: 'Fresh Apples (1 kg bag)',
      category: 'Produce',
      quantity: '1 kg (approx 5-6 apples)',
      estimatedPrice: 120.00,
      usedInMeals: ['Mon Snack', 'Wed Breakfast', 'Thu Snack', 'Sat Snack'],
      isBought: false,
      isInPantry: false,
      shelfLifeDays: 25,
      zeroWasteTip: 'Refrigerate apples to keep them crisp for nearly a month.'
    },
    {
      id: 'g-7',
      name: 'Fresh Lemons (Nimbu)',
      category: 'Produce',
      quantity: '4 whole lemons',
      estimatedPrice: 20.00,
      usedInMeals: ['Mon Lunch', 'Mon Dinner', 'Tue Lunch', 'Thu Lunch', 'Sat Dinner'],
      isBought: false,
      isInPantry: false,
      shelfLifeDays: 14,
      zeroWasteTip: 'Zest lemons before juicing and freeze zest for seasoning.'
    },
    {
      id: 'g-8',
      name: 'Chicken (Curry Cut / Thighs / Breast)',
      category: 'Proteins',
      quantity: '600g',
      estimatedPrice: 150.00,
      usedInMeals: ['Mon Dinner', 'Fri Dinner', 'Sat Dinner'],
      isBought: false,
      isInPantry: false,
      shelfLifeDays: 3,
      zeroWasteTip: 'Divide into meal portions and freeze if not cooking within 48 hours.'
    },
    {
      id: 'g-9',
      name: 'Canned Chunk Light Tuna in Water',
      category: 'Proteins',
      quantity: '1 can (120g drained)',
      estimatedPrice: 75.00,
      usedInMeals: ['Thu Lunch'],
      isBought: false,
      isInPantry: false,
      shelfLifeDays: 730,
      zeroWasteTip: 'Long shelf life pantry protein; buy during supermarket discounts.'
    },
    {
      id: 'g-10',
      name: 'Dry Chickpeas / Kabuli Chana (500g pack)',
      category: 'Pantry & Grains',
      quantity: '1 pack (500g)',
      estimatedPrice: 65.00,
      usedInMeals: ['Mon Lunch', 'Tue Lunch', 'Thu Lunch', 'Thu Dinner', 'Fri Lunch', 'Sun Lunch'],
      isBought: false,
      isInPantry: false,
      shelfLifeDays: 730,
      zeroWasteTip: 'Massive crossover workhorse: boil once and use in wraps, salads, and bowls.'
    },
    {
      id: 'g-11',
      name: 'Dry Brown Lentils / Whole Masoor (500g)',
      category: 'Pantry & Grains',
      quantity: '1 pack (500g)',
      estimatedPrice: 55.00,
      usedInMeals: ['Tue Dinner', 'Wed Lunch', 'Sat Lunch'],
      isBought: false,
      isInPantry: false,
      shelfLifeDays: 730,
      zeroWasteTip: 'Gives 8+ generous servings. High in plant protein and dietary iron.'
    },
    {
      id: 'g-12',
      name: 'Brown Rice / Whole Grain Rice (1 kg)',
      category: 'Pantry & Grains',
      quantity: '1 kg bag',
      estimatedPrice: 65.00,
      usedInMeals: ['Mon Dinner', 'Tue Lunch', 'Thu Dinner', 'Sat Lunch', 'Sun Dinner'],
      isBought: false,
      isInPantry: false,
      shelfLifeDays: 365,
      zeroWasteTip: 'Cook 4 cups in 1 batch on Sunday. Chilled rice makes superior fried rice on Day 7.'
    },
    {
      id: 'g-13',
      name: 'Fresh Tomatoes (1 kg)',
      category: 'Produce',
      quantity: '1 kg',
      estimatedPrice: 35.00,
      usedInMeals: ['Tue Dinner', 'Wed Dinner', 'Fri Dinner', 'Sat Breakfast'],
      isBought: false,
      isInPantry: false,
      shelfLifeDays: 10,
      zeroWasteTip: 'Puree or cook down very ripe tomatoes into pasta and curry bases.'
    },
    {
      id: 'g-14',
      name: 'Whole Wheat Penne Pasta (500g)',
      category: 'Pantry & Grains',
      quantity: '1 pack (500g)',
      estimatedPrice: 55.00,
      usedInMeals: ['Fri Dinner'],
      isBought: false,
      isInPantry: false,
      shelfLifeDays: 365,
      zeroWasteTip: 'High-fiber complex carbohydrate with a 2-year shelf life.'
    },
    {
      id: 'g-15',
      name: 'Fresh Farm Eggs (1 Dozen - 12 count)',
      category: 'Dairy & Eggs',
      quantity: '1 carton (12 count)',
      estimatedPrice: 84.00,
      usedInMeals: ['Tue Breakfast', 'Wed Dinner', 'Fri Snack', 'Sat Breakfast', 'Sun Dinner'],
      isBought: false,
      isInPantry: false,
      shelfLifeDays: 30,
      zeroWasteTip: 'Check egg freshness in a glass of water: fresh eggs sink, older eggs float.'
    },
    {
      id: 'g-16',
      name: 'Greek Yogurt / Thick Curd (400g tub)',
      category: 'Dairy & Eggs',
      quantity: '2 tubs (800g total)',
      estimatedPrice: 90.00,
      usedInMeals: ['Mon Breakfast', 'Tue Snack', 'Wed Snack', 'Fri Breakfast', 'Sat Lunch', 'Sun Snack'],
      isBought: false,
      isInPantry: false,
      shelfLifeDays: 14,
      zeroWasteTip: 'Keep airtight in the refrigerator to prevent whey separation.'
    },
    {
      id: 'g-17',
      name: 'Feta Cheese / Fresh Paneer (200g pack)',
      category: 'Dairy & Eggs',
      quantity: '1 pack (200g)',
      estimatedPrice: 85.00,
      usedInMeals: ['Tue Breakfast', 'Tue Snack', 'Wed Dinner', 'Fri Dinner', 'Sun Lunch'],
      isBought: false,
      isInPantry: false,
      shelfLifeDays: 20,
      zeroWasteTip: 'Keep paneer or feta submerged in cold water/brine in an airtight container.'
    },
    {
      id: 'g-18',
      name: 'Whole Wheat Tortilla / Roti Wraps (6-8 pack)',
      category: 'Bakery',
      quantity: '1 pack',
      estimatedPrice: 45.00,
      usedInMeals: ['Mon Lunch', 'Thu Lunch', 'Fri Lunch', 'Sun Lunch'],
      isBought: false,
      isInPantry: false,
      shelfLifeDays: 14,
      zeroWasteTip: 'Can be frozen flat between wax paper sheets for 3 months.'
    },
    {
      id: 'g-19',
      name: 'Whole Wheat Bread (400g loaf)',
      category: 'Bakery',
      quantity: '1 loaf',
      estimatedPrice: 45.00,
      usedInMeals: ['Tue Breakfast', 'Tue Dinner', 'Wed Dinner', 'Thu Breakfast', 'Sat Breakfast'],
      isBought: false,
      isInPantry: false,
      shelfLifeDays: 7,
      zeroWasteTip: 'Store half the loaf in the freezer; toast slices directly from frozen!'
    },
    {
      id: 'g-20',
      name: 'Walnuts (Akhrot, 150g pack)',
      category: 'Pantry & Grains',
      quantity: '1 pack (150g)',
      estimatedPrice: 110.00,
      usedInMeals: ['Mon Breakfast', 'Wed Breakfast', 'Thu Snack', 'Fri Breakfast', 'Sat Snack'],
      isBought: false,
      isInPantry: false,
      shelfLifeDays: 90,
      zeroWasteTip: 'Keep nuts in the freezer or airtight jar to prevent natural plant oils from oxidizing.'
    }
  ]
};

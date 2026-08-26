import { Recipe } from '../types';

export const DEFAULT_RECIPES: Recipe[] = [
  {
    id: 'rec-1',
    name: 'High-Protein Paneer & Veggie Sauté Bowl',
    category: 'Lunch',
    cuisine: 'North Indian',
    dietaryTags: ['Vegetarian', 'High Protein', 'Gluten-Free', 'Low Carb'],
    description: 'Fresh cottage cheese cubes tossed with crisp bell peppers, zucchini, and aromatic Indian spices for a quick, muscle-building meal.',
    prepTimeMinutes: 10,
    cookTimeMinutes: 12,
    totalTimeMinutes: 22,
    servings: 1,
    difficulty: 'Easy',
    estimatedCost: 85,
    currency: '₹',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
    macros: {
      calories: 380,
      protein: 26,
      carbs: 14,
      fat: 24,
      fiber: 6,
      sodium: 380,
    },
    ingredients: [
      { name: 'Low-Fat Fresh Paneer (Cottage Cheese)', amount: '150g (cubed)' },
      { name: 'Red & Green Bell Peppers', amount: '1 cup (diced)' },
      { name: 'Onion & Tomatoes', amount: '1/2 medium each' },
      { name: 'Cold-Pressed Olive Oil / Ghee', amount: '1 tsp' },
      { name: 'Cumin Seeds & Garam Masala', amount: '1/2 tsp each' },
      { name: 'Turmeric, Red Chilli & Chaat Masala', amount: '1/4 tsp each' },
      { name: 'Fresh Lemon Juice & Coriander', amount: '1 tbsp garnish' },
    ],
    instructions: [
      'Heat oil or ghee in a non-stick pan over medium heat and add cumin seeds until they splutter.',
      'Add sliced onions and sauté for 2 minutes until translucent, then add chopped tomatoes and spices (turmeric, chilli powder, salt).',
      'Add bell peppers and cook on high heat for 3 minutes to keep them crunchy.',
      'Gently fold in paneer cubes and garam masala. Sauté for 3-4 minutes until paneer is warm and lightly golden.',
      'Finish with a squeeze of fresh lemon juice and chopped coriander. Serve warm.'
    ],
    chefTips: [
      'Soak paneer in warm water for 5 minutes before cooking for ultra-soft texture.',
      'Do not overcook the bell peppers; crisp veggies provide better micronutrient retention.'
    ],
    healthBenefits: [
      'Contains 26g of slow-digesting casein protein for long-lasting satiety.',
      'Rich in Vitamin C and antioxidants from colorful bell peppers.'
    ]
  },
  {
    id: 'rec-2',
    name: 'Spiced Masala Vegetable Oats with Chia Boost',
    category: 'Breakfast',
    cuisine: 'Fusion Indian',
    dietaryTags: ['Vegetarian', 'High Fiber', 'Heart Healthy', 'Quick & Easy'],
    description: 'Savory rolled oats cooked with fresh carrots, green peas, ginger, and turmeric, topped with roasted seeds for sustained morning energy.',
    prepTimeMinutes: 5,
    cookTimeMinutes: 8,
    totalTimeMinutes: 13,
    servings: 1,
    difficulty: 'Easy',
    estimatedCost: 45,
    currency: '₹',
    imageUrl: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=800&auto=format&fit=crop&q=80',
    macros: {
      calories: 290,
      protein: 11,
      carbs: 46,
      fat: 7,
      fiber: 9,
      sodium: 320,
    },
    ingredients: [
      { name: 'Rolled Oats (Gluten-Free optional)', amount: '60g (1/2 cup)' },
      { name: 'Finely Chopped Carrots & Peas', amount: '1/2 cup' },
      { name: 'Grated Ginger & Green Chilli', amount: '1 tsp' },
      { name: 'Mustard Seeds & Curry Leaves', amount: '1/2 tsp + 5 leaves' },
      { name: 'Chia Seeds / Flax Seeds', amount: '1 tsp' },
      { name: 'Water or Low-Fat Broth', amount: '1.5 cups' },
      { name: 'Lemon Juice', amount: '1 tsp' },
    ],
    instructions: [
      'In a saucepan, heat 1/2 tsp oil, add mustard seeds and curry leaves until fragrant.',
      'Add grated ginger, green chillies, carrots, and peas. Sauté for 2 minutes.',
      'Add rolled oats and roast dry with vegetables for 1 minute.',
      'Pour in 1.5 cups of water, add turmeric and salt to taste, and bring to a gentle boil.',
      'Simmer on low for 4-5 minutes until creamy. Top with chia seeds and a squeeze of fresh lemon.'
    ],
    chefTips: [
      'Use rolled oats rather than instant oats for a lower glycemic index and longer fullness.',
      'Add 50g sprouted moong or tofu cubes to easily bump protein past 18g.'
    ],
    healthBenefits: [
      'High in beta-glucan soluble fiber to support lower cholesterol and blood sugar stability.',
      'Anti-inflammatory properties from fresh ginger, curry leaves, and golden turmeric.'
    ]
  },
  {
    id: 'rec-3',
    name: 'Grilled Herb Chicken Breast with Steamed Broccoli',
    category: 'Dinner',
    cuisine: 'Continental',
    dietaryTags: ['Non-Veg', 'High Protein', 'Keto', 'Low Carb', 'Muscle Gain'],
    description: 'Tender chicken breast marinated in garlic, rosemary, and lemon zest, served with garlic-infused steamed broccoli florets.',
    prepTimeMinutes: 15,
    cookTimeMinutes: 12,
    totalTimeMinutes: 27,
    servings: 1,
    difficulty: 'Medium',
    estimatedCost: 130,
    currency: '₹',
    imageUrl: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=800&auto=format&fit=crop&q=80',
    macros: {
      calories: 340,
      protein: 42,
      carbs: 8,
      fat: 14,
      fiber: 4,
      sodium: 410,
    },
    ingredients: [
      { name: 'Boneless Skinless Chicken Breast', amount: '180g' },
      { name: 'Fresh Broccoli Florets', amount: '150g' },
      { name: 'Extra Virgin Olive Oil', amount: '1 tbsp' },
      { name: 'Minced Garlic', amount: '3 cloves' },
      { name: 'Dried Oregano, Rosemary & Black Pepper', amount: '1/2 tsp each' },
      { name: 'Lemon Juice & Sea Salt', amount: '1 tbsp' },
    ],
    instructions: [
      'Pat chicken breast dry and pound lightly to uniform thickness.',
      'Marinate with olive oil, minced garlic, herbs, lemon juice, salt, and pepper for 10-15 minutes.',
      'Heat a grill pan or cast-iron skillet over medium-high heat. Sear chicken for 5-6 minutes per side until internal temperature reaches 75°C (165°F).',
      'Rest the cooked chicken on a plate for 4 minutes before slicing to lock in juices.',
      'Steam broccoli for 4 minutes until vibrant green and tender-crisp; toss with a pinch of garlic and black pepper.'
    ],
    chefTips: [
      'Never skip resting the chicken breast—it keeps the meat incredibly juicy.',
      'Marinate with yogurt or buttermilk if you prefer extra tenderness.'
    ],
    healthBenefits: [
      'Delivers 42g of complete lean protein with minimal carbs.',
      'Broccoli provides sulforaphane, Vitamin K, and potent cellular detox compounds.'
    ]
  },
  {
    id: 'rec-4',
    name: 'Mediterranean Chickpea & Avocado Power Salad',
    category: 'Lunch',
    cuisine: 'Mediterranean',
    dietaryTags: ['Vegan', 'High Fiber', 'Heart Healthy', 'Gluten-Free'],
    description: 'Protein-rich boiled chickpeas, creamy avocado, crisp cucumbers, cherry tomatoes, and kalamata olives tossed with an herb-lemon dressing.',
    prepTimeMinutes: 10,
    cookTimeMinutes: 0,
    totalTimeMinutes: 10,
    servings: 1,
    difficulty: 'Easy',
    estimatedCost: 95,
    currency: '₹',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80',
    macros: {
      calories: 410,
      protein: 15,
      carbs: 48,
      fat: 18,
      fiber: 14,
      sodium: 360,
    },
    ingredients: [
      { name: 'Cooked/Canned Chickpeas (Kabuli Chana)', amount: '1.5 cups (200g)' },
      { name: 'Ripe Avocado', amount: '1/2 medium (diced)' },
      { name: 'Cucumber & Cherry Tomatoes', amount: '1 cup (chopped)' },
      { name: 'Red Onion & Fresh Mint/Parsley', amount: '2 tbsp each' },
      { name: 'Extra Virgin Olive Oil', amount: '1 tbsp' },
      { name: 'Lemon Juice, Salt & Cumin Powder', amount: '1.5 tbsp dressing' },
    ],
    instructions: [
      'Rinse and drain chickpeas thoroughly.',
      'In a large mixing bowl, combine chickpeas, diced cucumber, halved cherry tomatoes, and diced red onion.',
      'Whisk together olive oil, fresh lemon juice, cumin powder, salt, and black pepper in a small cup.',
      'Pour dressing over the salad and toss gently to coat.',
      'Gently fold in diced avocado and fresh mint leaves right before serving.'
    ],
    chefTips: [
      'Add avocado last and toss gently to prevent it from mashing.',
      'You can batch-prep the chickpeas and veggies 2 days in advance without dressing.'
    ],
    healthBenefits: [
      'Loaded with 14g of prebiotic dietary fiber for gut microbiome health.',
      'Rich in heart-healthy monounsaturated fats from fresh avocado and extra virgin olive oil.'
    ]
  },
  {
    id: 'rec-5',
    name: 'Tadka Moong Dal with Garlic Jeera Infusion',
    category: 'Dinner',
    cuisine: 'North Indian',
    dietaryTags: ['Vegetarian', 'Comfort Food', 'High Protein', 'Gluten-Free'],
    description: 'Golden yellow lentils simmered with ginger and tomatoes, tempered with sizzling cumin, garlic, and ghee.',
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    totalTimeMinutes: 30,
    servings: 2,
    difficulty: 'Easy',
    estimatedCost: 60,
    currency: '₹',
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
    macros: {
      calories: 260,
      protein: 16,
      carbs: 38,
      fat: 5,
      fiber: 9,
      sodium: 420,
    },
    ingredients: [
      { name: 'Yellow Split Moong Dal', amount: '1 cup (washed)' },
      { name: 'Water', amount: '3 cups' },
      { name: 'Turmeric Powder & Salt', amount: '1/2 tsp + to taste' },
      { name: 'Desi Ghee or Mustard Oil', amount: '1.5 tsp' },
      { name: 'Cumin Seeds & Asafoetida (Hing)', amount: '1/2 tsp + 1 pinch' },
      { name: 'Minced Garlic & Ginger', amount: '1 tbsp each' },
      { name: 'Ripe Tomato & Green Chilli', amount: '1 medium + 1 slit' },
      { name: 'Fresh Coriander Leaves', amount: '2 tbsp' },
    ],
    instructions: [
      'Pressure cook rinsed moong dal with 3 cups water, turmeric, and salt for 3-4 whistles (or simmer in pot for 22 mins).',
      'Whisk dal gently with a ladle until smooth and creamy.',
      'In a small tadka pan, heat ghee. Add cumin seeds and a pinch of hing until fragrant.',
      'Add minced garlic, ginger, and green chilli; sauté until garlic turns aromatic golden.',
      'Add chopped tomatoes and cook for 2 minutes until soft.',
      'Pour sizzling tadka directly into the cooked dal, cover with lid for 2 minutes to trap aroma, and garnish with fresh coriander.'
    ],
    chefTips: [
      'Yellow moong dal is the easiest legume on digestion—ideal for light evening dinners.',
      'Pair with 1 multigrain roti or steamed brown rice and cucumber raita.'
    ],
    healthBenefits: [
      'Gentle on the stomach and promotes gut healing.',
      'High in plant-based folate, potassium, and magnesium.'
    ]
  },
  {
    id: 'rec-6',
    name: 'Golden Turmeric Peanut Butter Banana Smoothie',
    category: 'Beverage',
    cuisine: 'Global Health',
    dietaryTags: ['Vegetarian', 'Post-Workout', 'Quick & Easy', 'Gluten-Free'],
    description: 'Thick recovery shake packed with natural peanut butter, ripe banana, cinnamon, turmeric, and Greek yogurt or plant milk.',
    prepTimeMinutes: 5,
    cookTimeMinutes: 0,
    totalTimeMinutes: 5,
    servings: 1,
    difficulty: 'Easy',
    estimatedCost: 55,
    currency: '₹',
    imageUrl: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=800&auto=format&fit=crop&q=80',
    macros: {
      calories: 320,
      protein: 18,
      carbs: 39,
      fat: 11,
      fiber: 6,
      sodium: 140,
    },
    ingredients: [
      { name: 'Frozen Ripe Banana', amount: '1 medium' },
      { name: 'Natural Peanut Butter (Unsweetened)', amount: '1.5 tbsp (25g)' },
      { name: 'Greek Yogurt / Soy Milk', amount: '150g / 200ml' },
      { name: 'Ground Turmeric & Cinnamon', amount: '1/4 tsp each' },
      { name: 'Chia Seeds / Hemp Hearts', amount: '1 tsp' },
      { name: 'Chilled Water or Ice Cubes', amount: '1/2 cup' },
    ],
    instructions: [
      'Add sliced frozen banana, peanut butter, yogurt/milk into a blender jar.',
      'Add turmeric powder, cinnamon, chia seeds, and ice cubes.',
      'Blend on high speed for 45-60 seconds until completely smooth and creamy.',
      'Pour into a tall glass and sprinkle extra cinnamon on top.'
    ],
    chefTips: [
      'Using frozen banana gives an ice-cream like thick milkshake consistency without adding dairy cream.',
      'Add 1 scoop of unflavored whey or plant protein if aiming for 35g+ protein post-workout.'
    ],
    healthBenefits: [
      'Fast muscle recovery glycogen replenishment from banana potassium.',
      'Anti-inflammatory curcumin paired with healthy fats for superior absorption.'
    ]
  },
  {
    id: 'rec-7',
    name: 'Air-Fryer / Tawa Tofu Tikka Skewers with Mint Chutney',
    category: 'Snack',
    cuisine: 'Fusion Indian',
    dietaryTags: ['Vegan', 'High Protein', 'Low Carb', 'Gluten-Free'],
    description: 'Firm tofu cubes marinated in hung curd/vegan yogurt, smoked paprika, kasuri methi, and roasted gram flour, crisped to perfection.',
    prepTimeMinutes: 15,
    cookTimeMinutes: 10,
    totalTimeMinutes: 25,
    servings: 1,
    difficulty: 'Easy',
    estimatedCost: 75,
    currency: '₹',
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
    macros: {
      calories: 270,
      protein: 22,
      carbs: 11,
      fat: 15,
      fiber: 5,
      sodium: 390,
    },
    ingredients: [
      { name: 'Firm Tofu (Pressed & Cubed)', amount: '180g' },
      { name: 'Thick Curd / Coconut Yogurt', amount: '2 tbsp' },
      { name: 'Roasted Besan (Gram Flour)', amount: '1 tbsp' },
      { name: 'Ginger-Garlic Paste', amount: '1 tsp' },
      { name: 'Kasuri Methi & Chaat Masala', amount: '1/2 tsp each' },
      { name: 'Mustard Oil & Kashmiri Mirch', amount: '1 tsp each' },
      { name: 'Onion & Capsicum Petals', amount: '1/2 cup' },
    ],
    instructions: [
      'In a bowl, mix curd, roasted besan, mustard oil, ginger-garlic paste, kasuri methi, red chilli, and salt into a thick marinade.',
      'Gently coat tofu cubes, onion petals, and capsicum pieces in the marinade. Let rest for 10 minutes.',
      'Thread onto skewers or arrange on a hot greased tawa / air fryer basket.',
      'Cook at 200°C for 10-12 minutes (or pan-sear on high heat for 6-8 mins) until edges are lightly charred and crispy.',
      'Sprinkle chaat masala and serve with homemade fresh mint-coriander chutney.'
    ],
    chefTips: [
      'Press the tofu with a clean paper towel for 10 minutes before marinating so it absorbs maximum spice flavor.'
    ],
    healthBenefits: [
      '22g of plant-based isoflavone-rich protein with zero cholesterol.',
      'Low in saturated fats, excellent for lipid profile and metabolic health.'
    ]
  },
  {
    id: 'rec-8',
    name: 'Fluffy Spinach & Feta (or Paneer) Egg White Omelet',
    category: 'Breakfast',
    cuisine: 'Mediterranean / Western',
    dietaryTags: ['Eggetarian', 'High Protein', 'Keto', 'Low Calorie', 'Quick & Easy'],
    description: 'Golden fluffy omelet loaded with iron-rich baby spinach, crumble feta or cottage cheese, and a pinch of black pepper.',
    prepTimeMinutes: 5,
    cookTimeMinutes: 6,
    totalTimeMinutes: 11,
    servings: 1,
    difficulty: 'Easy',
    estimatedCost: 50,
    currency: '₹',
    imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&auto=format&fit=crop&q=80',
    macros: {
      calories: 220,
      protein: 24,
      carbs: 4,
      fat: 11,
      fiber: 2,
      sodium: 380,
    },
    ingredients: [
      { name: 'Whole Eggs + Egg Whites', amount: '1 Whole + 3 Whites' },
      { name: 'Fresh Baby Spinach (Chop lightly)', amount: '1 cup (packed)' },
      { name: 'Feta Cheese or Crumbled Paneer', amount: '30g' },
      { name: 'Olive Oil or Butter', amount: '1/2 tsp' },
      { name: 'Black Pepper & Sea Salt', amount: '1/4 tsp each' },
      { name: 'Crushed Red Chilli Flakes', amount: '1 pinch' },
    ],
    instructions: [
      'Whisk whole egg and egg whites in a bowl with a pinch of salt and pepper until frothy.',
      'Heat oil in a non-stick pan over medium heat. Sauté spinach leaves for 1 minute until wilted.',
      'Pour the whisked egg mixture evenly over the wilted spinach.',
      'Cook undisturbed for 2 minutes until bottom is set. Sprinkle crumbled feta/paneer over one half.',
      'Fold the omelet in half, cook for 30 more seconds, and slide onto a warm plate.'
    ],
    chefTips: [
      'Whisking vigorously incorporates air to make the egg whites super fluffy without milk.'
    ],
    healthBenefits: [
      'Bioavailable leucine and albumin protein for optimal muscle protein synthesis.',
      'High in lutein and zeaxanthin for vision and eye health.'
    ]
  },
  {
    id: 'rec-9',
    name: 'Warm Quinoa Buddha Bowl with Roasted Sweet Potato & Tahini',
    category: 'Lunch',
    cuisine: 'Middle Eastern',
    dietaryTags: ['Vegan', 'High Fiber', 'Gluten-Free', 'Antioxidant Rich'],
    description: 'Nutty fluffy quinoa topped with caramelized roasted sweet potato cubes, steamed edamame/chickpeas, purple cabbage, and lemon-tahini drizzle.',
    prepTimeMinutes: 10,
    cookTimeMinutes: 18,
    totalTimeMinutes: 28,
    servings: 1,
    difficulty: 'Medium',
    estimatedCost: 110,
    currency: '₹',
    imageUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&auto=format&fit=crop&q=80',
    macros: {
      calories: 430,
      protein: 16,
      carbs: 64,
      fat: 14,
      fiber: 12,
      sodium: 290,
    },
    ingredients: [
      { name: 'Cooked Tri-Color Quinoa', amount: '1 cup (180g)' },
      { name: 'Sweet Potato (Cubed & Roasted)', amount: '1 medium (120g)' },
      { name: 'Steamed Edamame or Boiled Chana', amount: '1/2 cup' },
      { name: 'Shredded Purple Cabbage & Cucumber', amount: '1/2 cup' },
      { name: 'Sesame Tahini', amount: '1 tbsp' },
      { name: 'Lemon Juice & Warm Water', amount: '1 tbsp each (for drizzle)' },
    ],
    instructions: [
      'Toss cubed sweet potato with 1/2 tsp olive oil, paprika, and salt. Roast at 200°C for 16-18 mins until caramelized.',
      'Cook quinoa in 2 parts water for 14 minutes until fluffy; fluff with a fork.',
      'In a wide serving bowl, place a bed of warm quinoa.',
      'Arrange roasted sweet potatoes, edamame/chana, shredded cabbage, and sliced cucumber in vibrant sections around the bowl.',
      'Whisk tahini with lemon juice, a pinch of garlic powder, salt, and warm water until smooth. Drizzle generously over the bowl.'
    ],
    chefTips: [
      'Roast a big batch of sweet potatoes and cook a pot of quinoa on Sunday to make this bowl in 3 minutes during busy workdays.'
    ],
    healthBenefits: [
      'Quinoa is a rare plant food containing all 9 essential amino acids.',
      'Rich in anthocyanins and beta-carotene for cellular immunity.'
    ]
  },
  {
    id: 'rec-10',
    name: 'Greek Yogurt Berry Parfait with Roasted Almonds',
    category: 'Dessert',
    cuisine: 'Greek',
    dietaryTags: ['Vegetarian', 'High Protein', 'Low Calorie', 'Gut Health', 'Quick & Easy'],
    description: 'Layered thick Greek yogurt with wild blueberries, strawberries, toasted almond flakes, and a touch of raw honey.',
    prepTimeMinutes: 5,
    cookTimeMinutes: 0,
    totalTimeMinutes: 5,
    servings: 1,
    difficulty: 'Easy',
    estimatedCost: 70,
    currency: '₹',
    imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&auto=format&fit=crop&q=80',
    macros: {
      calories: 240,
      protein: 19,
      carbs: 26,
      fat: 7,
      fiber: 5,
      sodium: 70,
    },
    ingredients: [
      { name: 'Thick Plain Greek Yogurt (Zero or Low Sugar)', amount: '180g (3/4 cup)' },
      { name: 'Mixed Fresh or Frozen Berries (Blueberry, Strawberry)', amount: '1/2 cup' },
      { name: 'Sliced Toasted Almonds', amount: '1 tbsp (12g)' },
      { name: 'Raw Honey or Pure Maple Syrup', amount: '1 tsp (optional)' },
      { name: 'Chia Seeds & Cinnamon', amount: '1/2 tsp each' },
    ],
    instructions: [
      'Spoon half the Greek yogurt into a dessert glass or bowl.',
      'Add a layer of berries and half the toasted almond slices.',
      'Spoon remaining Greek yogurt on top.',
      'Garnish with remaining berries, toasted almonds, chia seeds, a light dusting of cinnamon, and an optional drizzle of raw honey.'
    ],
    chefTips: [
      'Use unsweetened Greek yogurt to avoid hidden sugars found in flavored commercial yogurts.'
    ],
    healthBenefits: [
      'Over 10 billion live active probiotics to nourish gut microbiome diversity.',
      'Polyphenol antioxidant power from dark berries.'
    ]
  },
  {
    id: 'rec-11',
    name: 'Methi Moong Dal Sprout Cheela (High-Protein Savory Pancake)',
    category: 'Breakfast',
    cuisine: 'South & West Indian',
    dietaryTags: ['Vegetarian', 'High Protein', 'Gluten-Free', 'Weight Loss'],
    description: 'Crispy savory crepes made from sprouted green moong beans and fresh fenugreek (methi) leaves, packed with natural enzymes and fiber.',
    prepTimeMinutes: 5,
    cookTimeMinutes: 8,
    totalTimeMinutes: 13,
    servings: 2,
    difficulty: 'Easy',
    estimatedCost: 35,
    currency: '₹',
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80',
    macros: {
      calories: 210,
      protein: 14,
      carbs: 30,
      fat: 4,
      fiber: 8,
      sodium: 260,
    },
    ingredients: [
      { name: 'Sprouted Green Moong Beans', amount: '1 cup (150g)' },
      { name: 'Fresh Chopped Methi (Fenugreek) Leaves', amount: '1/2 cup' },
      { name: 'Ginger & Green Chilli', amount: '1 inch + 1 piece' },
      { name: 'Cumin Seeds & Hing', amount: '1/2 tsp + 1 pinch' },
      { name: 'Oil for cooking', amount: '1 tsp total' },
      { name: 'Salt & Turmeric', amount: 'to taste' },
    ],
    instructions: [
      'Grind sprouted moong with ginger, green chilli, salt, and 1/4 cup water into a smooth, pourable batter.',
      'Stir in fresh chopped methi leaves and cumin seeds.',
      'Heat a non-stick tawa or cast-iron skillet and grease lightly with a few drops of oil.',
      'Pour a ladle of batter and spread into a thin circle like a dosa/pancake.',
      'Cook on medium heat for 2-3 minutes until bottom turns golden crisp. Flip and cook other side for 1 minute. Serve with coriander chutney.'
    ],
    chefTips: [
      'Sprouting legumes increases Vitamin C content and significantly reduces anti-nutrients like phytic acid.'
    ],
    healthBenefits: [
      'Natural fenugreek aids glucose regulation and insulin sensitivity.',
      'Low calorie density making it ideal for sustainable fat loss.'
    ]
  },
  {
    id: 'rec-12',
    name: 'Zesty Lemon Herb Grilled Fish / Paneer with Asparagus',
    category: 'Dinner',
    cuisine: 'Mediterranean',
    dietaryTags: ['High Protein', 'Keto', 'Omega-3', 'Low Carb'],
    description: 'Fresh white fish fillet (or paneer/tofu steak) marinated with crushed garlic, thyme, lemon juice, and olive oil, served with tender grilled asparagus.',
    prepTimeMinutes: 10,
    cookTimeMinutes: 10,
    totalTimeMinutes: 20,
    servings: 1,
    difficulty: 'Easy',
    estimatedCost: 140,
    currency: '₹',
    imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&auto=format&fit=crop&q=80',
    macros: {
      calories: 310,
      protein: 36,
      carbs: 5,
      fat: 16,
      fiber: 3,
      sodium: 340,
    },
    ingredients: [
      { name: 'White Fish Fillet (Basa, Tilapia, or Paneer Steak)', amount: '180g' },
      { name: 'Fresh Asparagus Spears or Green Beans', amount: '120g' },
      { name: 'Extra Virgin Olive Oil', amount: '1 tbsp' },
      { name: 'Lemon Zest & Juice', amount: '1 lemon' },
      { name: 'Fresh Garlic & Thyme/Dill', amount: '2 cloves + 1 sprig' },
      { name: 'Black Pepper & Sea Salt', amount: '1/4 tsp each' },
    ],
    instructions: [
      'Rinse and pat fish dry with paper towels.',
      'Whisk olive oil, lemon juice, lemon zest, minced garlic, herbs, salt, and freshly cracked black pepper.',
      'Brush marinade over fish and asparagus spears.',
      'Heat a grill pan over medium-high heat. Cook fish for 4 minutes on first side, flip gently, and cook 3 minutes until flaky.',
      'Grill asparagus spears alongside fish for 4-5 minutes until lightly charred and tender.'
    ],
    chefTips: [
      'Do not move the fish in the pan for the first 3 minutes so it develops a golden crust and doesn\'t stick.'
    ],
    healthBenefits: [
      'Rich in marine Omega-3 fatty acids (EPA/DHA) for heart and brain health.',
      'Asparagus provides natural prebiotic inulin for digestive support.'
    ]
  }
];

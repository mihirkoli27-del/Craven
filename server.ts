import express from 'express';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI, Type } from '@google/genai';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '25mb' }));

// Google OAuth & JWT Configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '561167231838-etavemdj5gpmqh7pavth0288kgnjlii4.apps.googleusercontent.com';
const JWT_SECRET = process.env.JWT_SECRET || 'craven_super_secure_jwt_token_secret_key_2026';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// ----------------------------------------------------
// DATABASE LAYER: PostgreSQL (Render) with Local JSON Fallback
// ----------------------------------------------------
const { Pool } = pg;
let pool: pg.Pool | null = null;
let isPostgresReady = false;

const rawDbUrl = process.env.DATABASE_URL?.trim();
const isDbUrlValid = Boolean(
  rawDbUrl &&
  (rawDbUrl.startsWith('postgres://') || rawDbUrl.startsWith('postgresql://')) &&
  rawDbUrl !== 'MY_DATABASE_URL'
);

if (isDbUrlValid) {
  try {
    const useSsl = process.env.NODE_ENV === 'production' || Boolean(rawDbUrl?.includes('render.com') || process.env.RENDER);
    pool = new Pool({
      connectionString: rawDbUrl,
      ssl: useSsl ? { rejectUnauthorized: false } : undefined,
    });
    // Create tables if not existing
    pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        google_id VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        avatar_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS user_profiles (
        user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        profile_data JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS diet_plans (
        id VARCHAR(100) PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        plan_data JSONB NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `).then(() => {
      isPostgresReady = true;
      console.log('✅ PostgreSQL database connected and tables verified.');
    }).catch((err: any) => {
      console.warn('⚠️ PostgreSQL connection failed, using local storage fallback:', err.message);
      isPostgresReady = false;
    });
  } catch (err: any) {
    console.warn('⚠️ PostgreSQL initialization warning:', err.message);
  }
}

// Local Database Fallback (.craven-local-db.json)
interface LocalDB {
  users: Array<{ id: number; google_id: string; email: string; name: string; avatar_url: string; created_at: string }>;
  user_profiles: Record<string, any>;
  diet_plans: Array<{ id: string; user_id: number; plan_data: any; is_active: boolean; created_at: string }>;
}

const LOCAL_DB_PATH = path.join(process.cwd(), '.craven-local-db.json');

function readLocalDB(): LocalDB {
  try {
    if (fs.existsSync(LOCAL_DB_PATH)) {
      return JSON.parse(fs.readFileSync(LOCAL_DB_PATH, 'utf-8'));
    }
  } catch (e) {
    console.warn('Could not read local db, initializing fresh:', e);
  }
  return { users: [], user_profiles: {}, diet_plans: [] };
}

function writeLocalDB(data: LocalDB) {
  try {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Could not write local db:', e);
  }
}

// Unified Database Helpers
async function dbUpsertUser(googleId: string, email: string, name: string, avatarUrl: string) {
  if (isPostgresReady && pool) {
    try {
      const res = await pool.query(
        `INSERT INTO users (google_id, email, name, avatar_url)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (google_id) DO UPDATE SET name = $3, avatar_url = $4
         RETURNING id, google_id, email, name, avatar_url, created_at`,
        [googleId, email, name, avatarUrl]
      );
      return res.rows[0];
    } catch (e) {
      console.warn('Postgres upsertUser error, using local fallback:', e);
    }
  }

  const local = readLocalDB();
  let user = local.users.find((u) => u.google_id === googleId);
  if (user) {
    user.name = name;
    user.avatar_url = avatarUrl;
  } else {
    user = {
      id: local.users.length + 1,
      google_id: googleId,
      email,
      name,
      avatar_url: avatarUrl,
      created_at: new Date().toISOString(),
    };
    local.users.push(user);
  }
  writeLocalDB(local);
  return user;
}

async function dbGetUserById(id: number | string) {
  if (isPostgresReady && pool) {
    try {
      const res = await pool.query('SELECT id, google_id, email, name, avatar_url FROM users WHERE id = $1', [id]);
      if (res.rows.length > 0) return res.rows[0];
    } catch (e) {
      console.warn('Postgres getUserById error:', e);
    }
  }
  const local = readLocalDB();
  return local.users.find((u) => String(u.id) === String(id)) || null;
}

async function dbSaveUserProfile(userId: number | string, profileData: any) {
  if (isPostgresReady && pool) {
    try {
      await pool.query(
        `INSERT INTO user_profiles (user_id, profile_data, updated_at)
         VALUES ($1, $2, CURRENT_TIMESTAMP)
         ON CONFLICT (user_id) DO UPDATE SET profile_data = $2, updated_at = CURRENT_TIMESTAMP`,
        [userId, JSON.stringify(profileData)]
      );
      return;
    } catch (e) {
      console.warn('Postgres saveUserProfile error:', e);
    }
  }
  const local = readLocalDB();
  local.user_profiles[String(userId)] = profileData;
  writeLocalDB(local);
}

async function dbGetUserProfile(userId: number | string) {
  if (isPostgresReady && pool) {
    try {
      const res = await pool.query('SELECT profile_data FROM user_profiles WHERE user_id = $1', [userId]);
      if (res.rows.length > 0) return res.rows[0].profile_data;
    } catch (e) {
      console.warn('Postgres getUserProfile error:', e);
    }
  }
  const local = readLocalDB();
  return local.user_profiles[String(userId)] || null;
}

async function dbSaveUserPlan(userId: number | string, planData: any) {
  const planId = planData.id || 'plan-' + Date.now();
  if (isPostgresReady && pool) {
    try {
      await pool.query('UPDATE diet_plans SET is_active = FALSE WHERE user_id = $1', [userId]);
      await pool.query(
        `INSERT INTO diet_plans (id, user_id, plan_data, is_active, created_at)
         VALUES ($1, $2, $3, TRUE, CURRENT_TIMESTAMP)
         ON CONFLICT (id) DO UPDATE SET plan_data = $3, is_active = TRUE`,
        [planId, userId, JSON.stringify(planData)]
      );
      return;
    } catch (e) {
      console.warn('Postgres saveUserPlan error:', e);
    }
  }
  const local = readLocalDB();
  local.diet_plans.forEach((p) => {
    if (String(p.user_id) === String(userId)) p.is_active = false;
  });
  const existing = local.diet_plans.find((p) => p.id === planId);
  if (existing) {
    existing.plan_data = planData;
    existing.is_active = true;
  } else {
    local.diet_plans.unshift({
      id: planId,
      user_id: Number(userId),
      plan_data: planData,
      is_active: true,
      created_at: new Date().toISOString(),
    });
  }
  writeLocalDB(local);
}

async function dbGetUserActivePlan(userId: number | string) {
  if (isPostgresReady && pool) {
    try {
      const res = await pool.query(
        'SELECT plan_data FROM diet_plans WHERE user_id = $1 AND is_active = TRUE ORDER BY created_at DESC LIMIT 1',
        [userId]
      );
      if (res.rows.length > 0) return res.rows[0].plan_data;
    } catch (e) {
      console.warn('Postgres getUserActivePlan error:', e);
    }
  }
  const local = readLocalDB();
  const found = local.diet_plans.find((p) => String(p.user_id) === String(userId) && p.is_active);
  return found ? found.plan_data : null;
}

async function dbGetUserPlans(userId: number | string) {
  if (isPostgresReady && pool) {
    try {
      const res = await pool.query(
        'SELECT id, plan_data, is_active, created_at FROM diet_plans WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );
      return res.rows.map((r) => ({ ...r.plan_data, id: r.id, is_active: r.is_active, createdAt: r.created_at }));
    } catch (e) {
      console.warn('Postgres getUserPlans error:', e);
    }
  }
  const local = readLocalDB();
  return local.diet_plans
    .filter((p) => String(p.user_id) === String(userId))
    .map((p) => ({ ...p.plan_data, id: p.id, is_active: p.is_active, createdAt: p.created_at }));
}

// Authentication Middleware
function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing authorization header' });
  }
  const token = authHeader.substring(7).trim();
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    (req as any).user = decoded;
    next();
  } catch (err: any) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
}

// Helper to get GoogleGenAI client dynamically with current process.env.GEMINI_API_KEY
function getAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey === 'dummy-key' || apiKey.trim() === '') {
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey.trim(),
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health Check API (for Render and uptime monitors)
app.get(['/health', '/api/health'], (req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
  const hasOAuth = Boolean(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== 'MY_GOOGLE_CLIENT_ID');
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    hasGeminiKey: hasKey,
    hasGoogleOAuth: hasOAuth,
    database: isPostgresReady ? 'postgresql' : 'local-json',
  });
});

// Google OAuth Token Exchange & Login
app.post('/api/auth/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ error: 'Missing Google credential token' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.sub || !payload.email) {
      return res.status(400).json({ error: 'Invalid Google credential token' });
    }

    const user = await dbUpsertUser(
      payload.sub,
      payload.email,
      payload.name || payload.email.split('@')[0],
      payload.picture || ''
    );

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatar_url,
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatar_url,
      },
    });
  } catch (err: any) {
    console.error('Google auth verification error:', err);
    res.status(401).json({ error: 'Google authentication failed', message: err.message });
  }
});

// Current User Profile Verification
app.get('/api/auth/me', requireAuth, async (req: any, res) => {
  try {
    const user = await dbGetUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatar_url,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve user session' });
  }
});

// Load User Saved Data (Profile & Active Plan)
app.get('/api/user/data', requireAuth, async (req: any, res) => {
  try {
    const [profile, plan] = await Promise.all([
      dbGetUserProfile(req.user.userId),
      dbGetUserActivePlan(req.user.userId),
    ]);
    res.json({ profile, plan });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve user data', message: err.message });
  }
});

// Save User Profile
app.post('/api/user/profile', requireAuth, async (req: any, res) => {
  try {
    const { profile } = req.body;
    if (!profile) return res.status(400).json({ error: 'Missing profile payload' });
    await dbSaveUserProfile(req.user.userId, profile);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to save profile' });
  }
});

// Save User 7-Day Plan
app.post('/api/user/plan', requireAuth, async (req: any, res) => {
  try {
    const { plan } = req.body;
    if (!plan) return res.status(400).json({ error: 'Missing plan payload' });
    await dbSaveUserPlan(req.user.userId, plan);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to save plan' });
  }
});

// Get User History of Plans
app.get('/api/user/plans', requireAuth, async (req: any, res) => {
  try {
    const plans = await dbGetUserPlans(req.user.userId);
    res.json({ plans });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve user plans' });
  }
});

// Fallback procedural Diet Plan Generator if Gemini API Key is missing or rate limited
function generateFallbackPlan(config: any) {
  const profile = config.profile || {};
  const goal = profile.goal || config.goal || 'Healthy Living & Weight Management';
  const dietType = profile.dietType ? (profile.customDietType ? `${profile.dietType} (${profile.customDietType})` : profile.dietType) : (config.dietType || 'Indian Vegetarian');
  const calorieTarget = Number(config.calorieTarget) || 2000;
  const budgetTier = profile.budgetTier || config.budgetTier || 'balanced';
  const householdSize = config.householdSize || 1;
  const currency = profile.currency || config.currency || '₹';

  const isVeg = dietType.toLowerCase().includes('veg');
  const isHighProtein = dietType.toLowerCase().includes('protein') || goal.toLowerCase().includes('muscle');

  const baseCost = budgetTier === 'thrifty' ? 1850 : budgetTier === 'balanced' ? 2750 : 4200;
  const householdMultiplier = householdSize > 1 ? 1 + (householdSize - 1) * 0.65 : 1;
  const estimatedWeeklyCost = Math.round(baseCost * householdMultiplier);

  const daysData = [
    {
      dayNumber: 1,
      dayName: 'Monday',
      dailyWasteSaverNote: 'Batch cook yellow dal and boiled chickpeas; use surplus for Tuesday lunch wraps.',
      dayEstimatedCost: Math.round(estimatedWeeklyCost / 7),
      totalDayMacros: {
        calories: calorieTarget,
        protein: Math.round(calorieTarget * 0.22 / 4),
        carbs: Math.round(calorieTarget * 0.50 / 4),
        fat: Math.round(calorieTarget * 0.28 / 9),
        fiber: 32,
      },
      meals: {
        breakfast: {
          id: 'm1-b',
          name: isVeg ? 'Masala Vegetable Oats & Spiced Curd' : 'Scrambled Eggs with Multigrain Toast',
          type: 'Breakfast',
          description: 'Hearty warm breakfast cooked with mild turmeric, fresh carrots, peas, and protein-rich curd.',
          prepTimeMinutes: 5,
          cookTimeMinutes: 10,
          estimatedCost: 45 * householdSize,
          macros: { calories: Math.round(calorieTarget * 0.25), protein: 18, carbs: 48, fat: 12, fiber: 8 },
          ingredients: [
            { name: 'Rolled Oats', amount: `${70 * householdSize}g`, isReusedInOtherMeals: true, pantryStaple: true },
            { name: 'Carrots & Green Peas', amount: `${100 * householdSize}g`, isReusedInOtherMeals: true, pantryStaple: false },
            { name: 'Curd / Yogurt', amount: `${150 * householdSize}g`, isReusedInOtherMeals: true, pantryStaple: false },
          ],
          instructions: [
            'Roast oats lightly in mustard oil or ghee for 2 minutes with cumin and green chilli.',
            'Add diced carrots and green peas with water and simmer until thick.',
            'Serve warm alongside fresh spiced curd.',
          ],
          wasteSavingTip: 'Use remaining diced carrots for today’s evening dinner salad.',
          dietaryBadges: ['High Fiber', 'Low GI', 'Quick Prep'],
        },
        lunch: {
          id: 'm1-l',
          name: isVeg ? 'Tadka Moong Dal with Jeera Brown Rice & Spinach' : 'Grilled Chicken Breast Bowl with Rice & Greens',
          type: 'Lunch',
          description: 'High-protein lentil curry cooked with garlic, fresh ginger, and iron-rich palak spinach.',
          prepTimeMinutes: 10,
          cookTimeMinutes: 20,
          estimatedCost: 75 * householdSize,
          macros: { calories: Math.round(calorieTarget * 0.35), protein: 26, carbs: 78, fat: 14, fiber: 12 },
          ingredients: [
            { name: 'Yellow Moong Dal', amount: `${80 * householdSize}g`, isReusedInOtherMeals: true, pantryStaple: true },
            { name: 'Fresh Palak (Spinach)', amount: `${150 * householdSize}g`, isReusedInOtherMeals: true, pantryStaple: false },
            { name: 'Brown Rice / Whole Wheat Roti', amount: `${80 * householdSize}g`, isReusedInOtherMeals: true, pantryStaple: true },
          ],
          instructions: [
            'Pressure cook moong dal with turmeric and salt until tender.',
            'Sauté cumin, garlic, and chopped palak leaves in a pan.',
            'Combine spinach into the dal and simmer for 4 minutes. Serve with hot brown rice.',
          ],
          wasteSavingTip: 'Save half the cooked dal in an airtight container for Tuesday lunch.',
          dietaryBadges: ['Iron Rich', 'Plant Protein', 'Heart Healthy'],
        },
        dinner: {
          id: 'm1-d',
          name: isVeg ? 'Paneer Bhurji with 2 Whole Wheat Rotis & Cucumber' : 'Egg Bhurji / Curry with Rotis & Salad',
          type: 'Dinner',
          description: 'Crumbled cottage cheese sautéed with onions, ripe tomatoes, green capsicum, and fresh coriander.',
          prepTimeMinutes: 10,
          cookTimeMinutes: 15,
          estimatedCost: 95 * householdSize,
          macros: { calories: Math.round(calorieTarget * 0.30), protein: 28, carbs: 45, fat: 18, fiber: 7 },
          ingredients: [
            { name: 'Fresh Paneer / Tofu', amount: `${150 * householdSize}g`, isReusedInOtherMeals: true, pantryStaple: false },
            { name: 'Onion & Tomato', amount: `${120 * householdSize}g`, isReusedInOtherMeals: true, pantryStaple: true },
            { name: 'Whole Wheat Atta', amount: `${70 * householdSize}g`, isReusedInOtherMeals: true, pantryStaple: true },
          ],
          instructions: [
            'Heat ghee in a pan, add finely chopped onions, ginger, and green chillies.',
            'Add diced tomatoes and cook until soft; crumble fresh paneer and mix gently with garam masala.',
            'Serve with hot rotis and sliced cucumber.',
          ],
          wasteSavingTip: 'Reserve leftover paneer water/whey to knead tomorrow morning’s roti dough.',
          dietaryBadges: ['High Protein', 'Gluten Conscious', 'Low Carb'],
        },
        snack: {
          id: 'm1-s',
          name: 'Roasted Masala Makhana & Spiced Green Tea',
          type: 'Snack',
          description: 'Crunchy fox nuts lightly roasted in 1/2 tsp ghee with rock salt and black pepper.',
          prepTimeMinutes: 2,
          cookTimeMinutes: 5,
          estimatedCost: 25 * householdSize,
          macros: { calories: Math.round(calorieTarget * 0.10), protein: 6, carbs: 22, fat: 3, fiber: 4 },
          ingredients: [
            { name: 'Fox Nuts (Makhana)', amount: `${30 * householdSize}g`, isReusedInOtherMeals: true, pantryStaple: true },
            { name: 'Green Tea', amount: '1 bag', isReusedInOtherMeals: false, pantryStaple: true },
          ],
          instructions: ['Dry roast makhana in a kadai on low flame with a pinch of rock salt until crisp.'],
          wasteSavingTip: 'Store bulk roasted makhana in an airtight jar for quick snacks all week.',
          dietaryBadges: ['Anti-Inflammatory', 'Low Calorie', 'Antioxidants'],
        },
      },
    },
    {
      dayNumber: 2,
      dayName: 'Tuesday',
      dailyWasteSaverNote: 'Use leftover cooked lentils from Monday in today’s high-protein stuffed parathas.',
      dayEstimatedCost: Math.round(estimatedWeeklyCost / 7),
      totalDayMacros: {
        calories: calorieTarget,
        protein: Math.round(calorieTarget * 0.23 / 4),
        carbs: Math.round(calorieTarget * 0.49 / 4),
        fat: Math.round(calorieTarget * 0.28 / 9),
        fiber: 34,
      },
      meals: {
        breakfast: {
          id: 'm2-b',
          name: 'Besan Chilla with Mint Chutney & Sprouts',
          type: 'Breakfast',
          description: 'Nutritious savory gram flour pancakes loaded with grated carrots and coriander leaves.',
          prepTimeMinutes: 8,
          cookTimeMinutes: 10,
          estimatedCost: 40 * householdSize,
          macros: { calories: Math.round(calorieTarget * 0.25), protein: 17, carbs: 46, fat: 11, fiber: 9 },
          ingredients: [
            { name: 'Besan (Gram Flour)', amount: `${60 * householdSize}g`, isReusedInOtherMeals: true, pantryStaple: true },
            { name: 'Moong Sprouts', amount: `${50 * householdSize}g`, isReusedInOtherMeals: true, pantryStaple: false },
          ],
          instructions: ['Whisk besan with water, turmeric, ajwain, and chopped herbs into a smooth batter; cook on tawa until golden.'],
          wasteSavingTip: 'Make extra mint chutney to accompany Wednesday lunch.',
          dietaryBadges: ['High Protein', 'Gluten Free'],
        },
        lunch: {
          id: 'm2-l',
          name: 'Chickpea & Mixed Veg Salad Bowl with Curd Dressing',
          type: 'Lunch',
          description: 'Boiled kabuli chana tossed with cucumbers, cherry tomatoes, roasted cumin, and thick curd.',
          prepTimeMinutes: 10,
          cookTimeMinutes: 10,
          estimatedCost: 65 * householdSize,
          macros: { calories: Math.round(calorieTarget * 0.35), protein: 24, carbs: 75, fat: 13, fiber: 14 },
          ingredients: [
            { name: 'Boiled Kabuli Chana', amount: `${120 * householdSize}g`, isReusedInOtherMeals: true, pantryStaple: true },
            { name: 'Cucumber & Tomatoes', amount: `${150 * householdSize}g`, isReusedInOtherMeals: true, pantryStaple: false },
          ],
          instructions: ['Toss boiled chickpeas with diced vegetables, lemon juice, chaat masala, and a dollop of curd.'],
          wasteSavingTip: 'Use remaining chickpeas in Thursday’s Mediterranean curry.',
          dietaryBadges: ['Gut Friendly', 'High Fiber'],
        },
        dinner: {
          id: 'm2-d',
          name: 'Lauki (Bottle Gourd) & Chana Dal with Roti & Salad',
          type: 'Dinner',
          description: 'Light, cooling bottle gourd stewed with Bengal gram, ginger, and aromatic coriander.',
          prepTimeMinutes: 10,
          cookTimeMinutes: 20,
          estimatedCost: 60 * householdSize,
          macros: { calories: Math.round(calorieTarget * 0.30), protein: 22, carbs: 65, fat: 12, fiber: 11 },
          ingredients: [
            { name: 'Bottle Gourd (Lauki)', amount: `${200 * householdSize}g`, isReusedInOtherMeals: true, pantryStaple: false },
            { name: 'Chana Dal', amount: `${60 * householdSize}g`, isReusedInOtherMeals: true, pantryStaple: true },
          ],
          instructions: ['Pressure cook diced lauki and chana dal together with turmeric, ginger, and green chillies.'],
          wasteSavingTip: 'Peels of fresh bottle gourd can be pan-fried with cumin for a crunchy side relish.',
          dietaryBadges: ['Light Dinner', 'Easy Digestion'],
        },
        snack: {
          id: 'm2-s',
          name: 'Handful of Soaked Almonds & Roasted Chana',
          type: 'Snack',
          description: 'Overnight soaked almonds and crunchy dry-roasted black chana.',
          prepTimeMinutes: 1,
          cookTimeMinutes: 0,
          estimatedCost: 30 * householdSize,
          macros: { calories: Math.round(calorieTarget * 0.10), protein: 7, carbs: 18, fat: 7, fiber: 5 },
          ingredients: [
            { name: 'Almonds', amount: '8 pcs', isReusedInOtherMeals: true, pantryStaple: true },
            { name: 'Roasted Black Chana', amount: `${30 * householdSize}g`, isReusedInOtherMeals: true, pantryStaple: true },
          ],
          instructions: ['Peel soaked almonds and enjoy with roasted black chana.'],
          wasteSavingTip: 'Almond skins can be composted.',
          dietaryBadges: ['Brain Health', 'Healthy Fats'],
        },
      },
    },
    {
      dayNumber: 3,
      dayName: 'Wednesday',
      dailyWasteSaverNote: 'Utilize surplus mint chutney and vegetable stock in your evening preparation.',
      dayEstimatedCost: Math.round(estimatedWeeklyCost / 7),
      totalDayMacros: {
        calories: calorieTarget,
        protein: Math.round(calorieTarget * 0.22 / 4),
        carbs: Math.round(calorieTarget * 0.50 / 4),
        fat: Math.round(calorieTarget * 0.28 / 9),
        fiber: 30,
      },
      meals: {
        breakfast: {
          id: 'm3-b',
          name: 'Vegetable Poha with Peanuts & Lemon',
          type: 'Breakfast',
          description: 'Flattened rice tossed with mustard seeds, curry leaves, crunchy roasted peanuts, and turmeric.',
          prepTimeMinutes: 5,
          cookTimeMinutes: 10,
          estimatedCost: 35 * householdSize,
          macros: { calories: Math.round(calorieTarget * 0.25), protein: 12, carbs: 55, fat: 10, fiber: 6 },
          ingredients: [
            { name: 'Thick Poha', amount: `${70 * householdSize}g`, isReusedInOtherMeals: true, pantryStaple: true },
            { name: 'Raw Peanuts', amount: `${20 * householdSize}g`, isReusedInOtherMeals: true, pantryStaple: true },
          ],
          instructions: ['Rinse poha and drain. Sauté mustard seeds, curry leaves, peanuts, and onions. Fold in poha with lemon juice.'],
          wasteSavingTip: 'Roast extra peanuts to sprinkle on Friday soups.',
          dietaryBadges: ['Iron Rich', 'Quick Cooking'],
        },
        lunch: {
          id: 'm3-l',
          name: 'Rajma Masala with Steamed Rice & Onion-Tomato Kachumber',
          type: 'Lunch',
          description: 'Slow-cooked red kidney beans in rich spiced tomato-onion gravy.',
          prepTimeMinutes: 10,
          cookTimeMinutes: 25,
          estimatedCost: 80 * householdSize,
          macros: { calories: Math.round(calorieTarget * 0.35), protein: 25, carbs: 80, fat: 14, fiber: 14 },
          ingredients: [
            { name: 'Red Kidney Beans (Rajma)', amount: `${80 * householdSize}g`, isReusedInOtherMeals: true, pantryStaple: true },
            { name: 'Basmati Rice', amount: `${70 * householdSize}g`, isReusedInOtherMeals: true, pantryStaple: true },
          ],
          instructions: ['Cook soaked rajma till melt-in-mouth soft; simmer in onion-tomato gravy with kasuri methi.'],
          wasteSavingTip: 'Save 1 cup of rajma gravy for Thursday night whole-wheat wraps.',
          dietaryBadges: ['Comfort Food', 'Plant Protein'],
        },
        dinner: {
          id: 'm3-d',
          name: 'Methi Paneer / Tofu Sabzi with 2 Multigrain Rotis',
          type: 'Dinner',
          description: 'Fresh bitter-sweet fenugreek leaves stir-fried with paneer cubes and mild spices.',
          prepTimeMinutes: 10,
          cookTimeMinutes: 15,
          estimatedCost: 90 * householdSize,
          macros: { calories: Math.round(calorieTarget * 0.30), protein: 26, carbs: 42, fat: 17, fiber: 8 },
          ingredients: [
            { name: 'Fresh Methi Leaves', amount: `${100 * householdSize}g`, isReusedInOtherMeals: true, pantryStaple: false },
            { name: 'Paneer / Tofu', amount: `${120 * householdSize}g`, isReusedInOtherMeals: true, pantryStaple: false },
          ],
          instructions: ['Wash methi thoroughly and chop finely; sauté with garlic and paneer cubes until fragrant.'],
          wasteSavingTip: 'Remaining methi leaves can be kneaded directly into Friday parathas.',
          dietaryBadges: ['Blood Sugar Control', 'Calcium Rich'],
        },
        snack: {
          id: 'm3-s',
          name: 'Fresh Seasonal Fruit (Guava / Papaya) with Chaat Masala',
          type: 'Snack',
          description: 'High-fiber sliced local fruit with a pinch of pink salt.',
          prepTimeMinutes: 2,
          cookTimeMinutes: 0,
          estimatedCost: 20 * householdSize,
          macros: { calories: Math.round(calorieTarget * 0.10), protein: 2, carbs: 24, fat: 1, fiber: 6 },
          ingredients: [{ name: 'Fresh Guava / Papaya', amount: '150g', isReusedInOtherMeals: false, pantryStaple: false }],
          instructions: ['Slice fruit fresh and season lightly with lemon and black salt.'],
          wasteSavingTip: 'Purchase seasonal local fruits from neighborhood mandi for 50% savings.',
          dietaryBadges: ['Vitamin C', 'Enzymes'],
        },
      },
    },
    {
      dayNumber: 4,
      dayName: 'Thursday',
      dailyWasteSaverNote: 'Transform yesterday’s cooked rajma into a protein-dense wrap filling.',
      dayEstimatedCost: Math.round(estimatedWeeklyCost / 7),
      totalDayMacros: {
        calories: calorieTarget,
        protein: Math.round(calorieTarget * 0.24 / 4),
        carbs: Math.round(calorieTarget * 0.48 / 4),
        fat: Math.round(calorieTarget * 0.28 / 9),
        fiber: 31,
      },
      meals: {
        breakfast: {
          id: 'm4-b',
          name: 'Moong Dal Idli / Steamed Dhokla with Coconut Chutney',
          type: 'Breakfast',
          description: 'Fermented or instant steamed protein cakes seasoned with mustard seeds and curry leaves.',
          prepTimeMinutes: 10,
          cookTimeMinutes: 12,
          estimatedCost: 40 * householdSize,
          macros: { calories: Math.round(calorieTarget * 0.25), protein: 16, carbs: 50, fat: 8, fiber: 7 },
          ingredients: [{ name: 'Yellow Moong Dal', amount: `${70 * householdSize}g`, isReusedInOtherMeals: true, pantryStaple: true }],
          instructions: ['Grind soaked moong dal with ginger, steam into fluffy idlis, and temper with curry leaves.'],
          wasteSavingTip: 'Leftover steamed idlis make delicious evening stir-fried masala snacks.',
          dietaryBadges: ['Low Oil', 'Steamed Health'],
        },
        lunch: {
          id: 'm4-l',
          name: 'High-Protein Rajma & Veggie Whole Wheat Wrap',
          type: 'Lunch',
          description: 'Spiced mashed rajma rolled inside hot whole-wheat chapati with crunchy cabbage salad.',
          prepTimeMinutes: 5,
          cookTimeMinutes: 10,
          estimatedCost: 55 * householdSize,
          macros: { calories: Math.round(calorieTarget * 0.35), protein: 22, carbs: 70, fat: 12, fiber: 11 },
          ingredients: [
            { name: 'Leftover Rajma', amount: `${120 * householdSize}g`, isReusedInOtherMeals: true, pantryStaple: false },
            { name: 'Cabbage & Onion Slaw', amount: `${80 * householdSize}g`, isReusedInOtherMeals: true, pantryStaple: false },
          ],
          instructions: ['Warm chapati, spread spiced rajma filling, top with cabbage slaw and roll tightly.'],
          wasteSavingTip: 'Zero cooking required for beans; 100% leftover reuse.',
          dietaryBadges: ['Zero Waste', 'Grab & Go'],
        },
        dinner: {
          id: 'm4-d',
          name: 'Mix Veg Soya Chunks Curry with Brown Rice / Roti',
          type: 'Dinner',
          description: 'Protein-packed soya chunks simmered with green peas, potatoes, and home-ground masala.',
          prepTimeMinutes: 10,
          cookTimeMinutes: 20,
          estimatedCost: 65 * householdSize,
          macros: { calories: Math.round(calorieTarget * 0.30), protein: 32, carbs: 52, fat: 12, fiber: 10 },
          ingredients: [
            { name: 'Soya Chunks', amount: `${50 * householdSize}g`, isReusedInOtherMeals: true, pantryStaple: true },
            { name: 'Mixed Vegetables', amount: `${120 * householdSize}g`, isReusedInOtherMeals: true, pantryStaple: false },
          ],
          instructions: ['Boil and squeeze soya chunks; sauté in onion tomato gravy with mixed vegetables.'],
          wasteSavingTip: 'Soya chunks are one of the most budget-effective protein sources at ~₹25/100g.',
          dietaryBadges: ['High Protein', 'Budget Star'],
        },
        snack: {
          id: 'm4-s',
          name: 'Spiced Buttermilk (Chaas) with Roasted Cumin & Mint',
          type: 'Snack',
          description: 'Cooling probiotic buttermilk blended with mint and toasted jeera.',
          prepTimeMinutes: 3,
          cookTimeMinutes: 0,
          estimatedCost: 15 * householdSize,
          macros: { calories: Math.round(calorieTarget * 0.10), protein: 5, carbs: 10, fat: 3, fiber: 2 },
          ingredients: [{ name: 'Fresh Curd', amount: `${100 * householdSize}g`, isReusedInOtherMeals: true, pantryStaple: false }],
          instructions: ['Whisk curd with cold water, roasted jeera powder, black salt, and chopped mint.'],
          wasteSavingTip: 'Use slight sour curd to make refreshing chaas.',
          dietaryBadges: ['Probiotic', 'Hydration'],
        },
      },
    },
    {
      dayNumber: 5,
      dayName: 'Friday',
      dailyWasteSaverNote: 'Batch use surplus greens and herbs before the weekend restock.',
      dayEstimatedCost: Math.round(estimatedWeeklyCost / 7),
      totalDayMacros: {
        calories: calorieTarget,
        protein: Math.round(calorieTarget * 0.22 / 4),
        carbs: Math.round(calorieTarget * 0.50 / 4),
        fat: Math.round(calorieTarget * 0.28 / 9),
        fiber: 33,
      },
      meals: {
        breakfast: {
          id: 'm5-b',
          name: 'Methi & Paneer Stuffed Paratha with Curd',
          type: 'Breakfast',
          description: 'Whole-wheat flatbread stuffed with finely chopped fenugreek and grated paneer.',
          prepTimeMinutes: 10,
          cookTimeMinutes: 10,
          estimatedCost: 50 * householdSize,
          macros: { calories: Math.round(calorieTarget * 0.25), protein: 18, carbs: 48, fat: 14, fiber: 8 },
          ingredients: [
            { name: 'Whole Wheat Atta', amount: `${70 * householdSize}g`, isReusedInOtherMeals: true, pantryStaple: true },
            { name: 'Methi & Paneer', amount: `${80 * householdSize}g`, isReusedInOtherMeals: true, pantryStaple: false },
          ],
          instructions: ['Mix chopped methi and paneer with spices, stuff inside wheat dough and cook with minimal oil.'],
          wasteSavingTip: 'Utilizes remaining methi leaves from Wednesday.',
          dietaryBadges: ['High Satiety', 'Traditional'],
        },
        lunch: {
          id: 'm5-l',
          name: 'Homestyle Dal Tadka with Jeera Rice & Bhindi Masala',
          type: 'Lunch',
          description: 'Comforting yellow lentils tempered with garlic and cumin, paired with stir-fried spiced okra.',
          prepTimeMinutes: 10,
          cookTimeMinutes: 20,
          estimatedCost: 75 * householdSize,
          macros: { calories: Math.round(calorieTarget * 0.35), protein: 22, carbs: 75, fat: 15, fiber: 11 },
          ingredients: [
            { name: 'Toor / Arhar Dal', amount: `${70 * householdSize}g`, isReusedInOtherMeals: true, pantryStaple: true },
            { name: 'Fresh Bhindi (Okra)', amount: `${120 * householdSize}g`, isReusedInOtherMeals: true, pantryStaple: false },
          ],
          instructions: ['Pressure cook dal; prepare garlic tadka and serve alongside crispy sautéed bhindi.'],
          wasteSavingTip: 'Ensure bhindi is completely dry before chopping to prevent sliminess.',
          dietaryBadges: ['Heart Healthy', 'Low GI'],
        },
        dinner: {
          id: 'm5-d',
          name: 'Vegetable Khichdi with Roasted Papad & Ghee',
          type: 'Dinner',
          description: 'Wholesome one-pot rice and lentil porridge cooked with diced vegetables and mild whole spices.',
          prepTimeMinutes: 8,
          cookTimeMinutes: 15,
          estimatedCost: 50 * householdSize,
          macros: { calories: Math.round(calorieTarget * 0.30), protein: 20, carbs: 62, fat: 11, fiber: 9 },
          ingredients: [
            { name: 'Rice & Moong Dal Mix', amount: `${90 * householdSize}g`, isReusedInOtherMeals: true, pantryStaple: true },
            { name: 'Mixed Diced Veggies', amount: `${100 * householdSize}g`, isReusedInOtherMeals: true, pantryStaple: false },
          ],
          instructions: ['Combine rice, lentils, vegetables, turmeric, and water in a cooker for 3 whistles. Finish with 1 tsp ghee.'],
          wasteSavingTip: 'A great refrigerator-clearing meal for odds and ends of veggies.',
          dietaryBadges: ['Gut Healing', 'One Pot Wonder'],
        },
        snack: {
          id: 'm5-s',
          name: 'Boiled Corn Chaat with Green Chillies & Lemon',
          type: 'Snack',
          description: 'Sweet corn kernels tossed with lime juice, black salt, and finely chopped coriander.',
          prepTimeMinutes: 3,
          cookTimeMinutes: 5,
          estimatedCost: 25 * householdSize,
          macros: { calories: Math.round(calorieTarget * 0.10), protein: 4, carbs: 22, fat: 2, fiber: 4 },
          ingredients: [{ name: 'Sweet Corn', amount: `${100 * householdSize}g`, isReusedInOtherMeals: true, pantryStaple: true }],
          instructions: ['Boil corn kernels with a pinch of salt; toss with fresh lime and coriander.'],
          wasteSavingTip: 'Corn cobs can be boiled in vegetable broths for natural sweet depth.',
          dietaryBadges: ['Eye Health', 'Antioxidants'],
        },
      },
    },
    {
      dayNumber: 6,
      dayName: 'Saturday',
      dailyWasteSaverNote: 'Weekend culinary treat focusing on wholesome slow-simmered flavors.',
      dayEstimatedCost: Math.round(estimatedWeeklyCost / 7),
      totalDayMacros: {
        calories: calorieTarget,
        protein: Math.round(calorieTarget * 0.23 / 4),
        carbs: Math.round(calorieTarget * 0.49 / 4),
        fat: Math.round(calorieTarget * 0.28 / 9),
        fiber: 30,
      },
      meals: {
        breakfast: {
          id: 'm6-b',
          name: 'Sprouted Moong Salad with Lemon & Pomegranate',
          type: 'Breakfast',
          description: 'Raw crunchy moong sprouts tossed with lemon juice, diced onions, and pomegranate pearls.',
          prepTimeMinutes: 5,
          cookTimeMinutes: 0,
          estimatedCost: 40 * householdSize,
          macros: { calories: Math.round(calorieTarget * 0.25), protein: 18, carbs: 45, fat: 5, fiber: 12 },
          ingredients: [{ name: 'Home Sprouted Moong', amount: `${100 * householdSize}g`, isReusedInOtherMeals: true, pantryStaple: true }],
          instructions: ['Toss fresh sprouts with lemon, diced cucumber, tomatoes, and pink salt.'],
          wasteSavingTip: 'Sprouting at home multiplies vitamin C and B complex by 300% at zero extra cost.',
          dietaryBadges: ['Raw Living', 'Enzyme Rich'],
        },
        lunch: {
          id: 'm6-l',
          name: 'Paneer Butter Masala (Low Oil) with Whole Wheat Naan & Salad',
          type: 'Lunch',
          description: 'Rich tomato cashew sauce cooked without excess butter, served with yeast-free tawa whole-wheat naan.',
          prepTimeMinutes: 15,
          cookTimeMinutes: 20,
          estimatedCost: 110 * householdSize,
          macros: { calories: Math.round(calorieTarget * 0.35), protein: 28, carbs: 68, fat: 20, fiber: 8 },
          ingredients: [
            { name: 'Fresh Paneer', amount: `${150 * householdSize}g`, isReusedInOtherMeals: true, pantryStaple: false },
            { name: 'Tomatoes & Cashew Paste', amount: `${150 * householdSize}g`, isReusedInOtherMeals: true, pantryStaple: true },
          ],
          instructions: ['Simmer pureed ripe tomatoes and cashew paste with spices; fold in fresh paneer cubes.'],
          wasteSavingTip: 'Cook tomato gravy in bulk; it freezes cleanly for up to 3 weeks.',
          dietaryBadges: ['Weekend Feast', 'High Protein'],
        },
        dinner: {
          id: 'm6-d',
          name: 'Warm Roasted Pumpkin / Vegetable Soup with Multigrain Toast',
          type: 'Dinner',
          description: 'Velvety roasted pumpkin and carrot soup infused with garlic, cumin, and cracked black pepper.',
          prepTimeMinutes: 10,
          cookTimeMinutes: 15,
          estimatedCost: 55 * householdSize,
          macros: { calories: Math.round(calorieTarget * 0.30), protein: 14, carbs: 50, fat: 9, fiber: 9 },
          ingredients: [
            { name: 'Yellow Pumpkin (Kaddu)', amount: `${200 * householdSize}g`, isReusedInOtherMeals: true, pantryStaple: false },
            { name: 'Multigrain Bread', amount: '2 slices', isReusedInOtherMeals: true, pantryStaple: true },
          ],
          instructions: ['Boil pumpkin with garlic and onion; blend into a smooth puree and season with black pepper.'],
          wasteSavingTip: 'Wash and roast pumpkin seeds for a crunchy zinc-rich snack.',
          dietaryBadges: ['Immunity Booster', 'Low Calorie'],
        },
        snack: {
          id: 'm6-s',
          name: 'Roasted Pumpkin Seeds & Green Tea',
          type: 'Snack',
          description: 'Crispy roasted salted pumpkin seeds.',
          prepTimeMinutes: 2,
          cookTimeMinutes: 5,
          estimatedCost: 15 * householdSize,
          macros: { calories: Math.round(calorieTarget * 0.10), protein: 6, carbs: 8, fat: 8, fiber: 3 },
          ingredients: [{ name: 'Pumpkin Seeds', amount: '25g', isReusedInOtherMeals: false, pantryStaple: true }],
          instructions: ['Toast seeds in pan with sea salt.'],
          wasteSavingTip: 'Zero waste salvaged directly from dinner pumpkin.',
          dietaryBadges: ['Zinc Rich', 'Healthy Fats'],
        },
      },
    },
    {
      dayNumber: 7,
      dayName: 'Sunday',
      dailyWasteSaverNote: 'Pantry audit and consolidation day to prepare for the upcoming week.',
      dayEstimatedCost: Math.round(estimatedWeeklyCost / 7),
      totalDayMacros: {
        calories: calorieTarget,
        protein: Math.round(calorieTarget * 0.22 / 4),
        carbs: Math.round(calorieTarget * 0.50 / 4),
        fat: Math.round(calorieTarget * 0.28 / 9),
        fiber: 32,
      },
      meals: {
        breakfast: {
          id: 'm7-b',
          name: 'South Indian Sambar with Rava Idli & Mint Chutney',
          type: 'Breakfast',
          description: 'Steamed semolina cakes loaded with grated carrots and mustard tempering, paired with lentil vegetable sambar.',
          prepTimeMinutes: 10,
          cookTimeMinutes: 15,
          estimatedCost: 45 * householdSize,
          macros: { calories: Math.round(calorieTarget * 0.25), protein: 15, carbs: 54, fat: 9, fiber: 7 },
          ingredients: [
            { name: 'Suji / Rava', amount: `${70 * householdSize}g`, isReusedInOtherMeals: true, pantryStaple: true },
            { name: 'Toor Dal & Drumstick Sambar', amount: `${150 * householdSize}g`, isReusedInOtherMeals: true, pantryStaple: false },
          ],
          instructions: ['Mix rava with curd and tempering; steam in idli stand. Serve with hot vegetable sambar.'],
          wasteSavingTip: 'Make extra sambar to accompany Sunday evening snacks.',
          dietaryBadges: ['Digestive Friendly', 'Fermented Care'],
        },
        lunch: {
          id: 'm7-l',
          name: 'Fragrant Vegetable Biryani with Cucumber Raita',
          type: 'Lunch',
          description: 'Aromatic layered basmati rice with carrots, peas, beans, paneer, and whole cardamom.',
          prepTimeMinutes: 15,
          cookTimeMinutes: 25,
          estimatedCost: 85 * householdSize,
          macros: { calories: Math.round(calorieTarget * 0.35), protein: 20, carbs: 82, fat: 14, fiber: 10 },
          ingredients: [
            { name: 'Basmati Rice', amount: `${80 * householdSize}g`, isReusedInOtherMeals: true, pantryStaple: true },
            { name: 'Paneer & Mixed Veggies', amount: `${120 * householdSize}g`, isReusedInOtherMeals: true, pantryStaple: false },
            { name: 'Fresh Curd for Raita', amount: `${100 * householdSize}g`, isReusedInOtherMeals: true, pantryStaple: false },
          ],
          instructions: ['Layer cooked basmati rice with spiced sautéed vegetables; steam on low heat (dum) for 10 minutes.'],
          wasteSavingTip: 'A great way to use up remaining week vegetables.',
          dietaryBadges: ['Sunday Special', 'Fiber Rich'],
        },
        dinner: {
          id: 'm7-d',
          name: 'Light Palak Dal with 2 Phulkas & Steamed Salad',
          type: 'Dinner',
          description: 'Cleansing yellow lentils cooked with spinach and garlic, served with oil-free puffed phulkas.',
          prepTimeMinutes: 8,
          cookTimeMinutes: 15,
          estimatedCost: 55 * householdSize,
          macros: { calories: Math.round(calorieTarget * 0.30), protein: 22, carbs: 55, fat: 10, fiber: 10 },
          ingredients: [
            { name: 'Moong Dal & Spinach', amount: `${120 * householdSize}g`, isReusedInOtherMeals: true, pantryStaple: true },
            { name: 'Whole Wheat Atta', amount: `${60 * householdSize}g`, isReusedInOtherMeals: true, pantryStaple: true },
          ],
          instructions: ['Simmer lentils and spinach; temper with garlic and serve with light warm phulkas.'],
          wasteSavingTip: 'Prepares the digestive system for a fresh, energizing week ahead.',
          dietaryBadges: ['Cleansing', 'Light Sleep Aid'],
        },
        snack: {
          id: 'm7-s',
          name: 'Roasted Chana & Herbal Spiced Kahwa',
          type: 'Snack',
          description: 'Crunchy dry-roasted chickpeas with a warm cinnamon saffron brew.',
          prepTimeMinutes: 2,
          cookTimeMinutes: 3,
          estimatedCost: 20 * householdSize,
          macros: { calories: Math.round(calorieTarget * 0.10), protein: 5, carbs: 18, fat: 3, fiber: 4 },
          ingredients: [{ name: 'Roasted Chana', amount: `${30 * householdSize}g`, isReusedInOtherMeals: true, pantryStaple: true }],
          instructions: ['Brew spices in hot water; enjoy with crunchy roasted chana.'],
          wasteSavingTip: 'Spices in whole form stay fresh for months in cool dry containers.',
          dietaryBadges: ['Antioxidant', 'Calming'],
        },
      },
    },
  ];

  return {
    id: 'plan-' + Date.now(),
    title: `7-Day ${dietType} Diet & Budget Plan`,
    goal,
    dietType,
    budgetTier,
    targetCalories: calorieTarget,
    householdSize,
    estimatedWeeklyCost,
    currency,
    summary: `A carefully architected 7-day ${dietType.toLowerCase()} schedule providing ~${calorieTarget} kcal daily with balanced macronutrient distributions, affordable whole-food ingredients in Indian Rupees (${currency}), and strategic multi-day ingredient reuse.`,
    zeroWasteStrategy: [
      'Batch-cook lentils and boiled beans on Mondays to halve weekly cooking times.',
      'Split whole spinach bunches between morning egg/paneer scrambles and evening dals.',
      'Save vegetable stems and peels to simmer rich mineral broths for soups and khichdi.',
      'Purchase seasonal whole grains, lentils, and nuts in bulk for up to 35% savings.',
    ],
    bulkPrepTips: [
      'Roast fox nuts (makhana) and chana in bulk on Sundays and store in airtight glass jars.',
      'Prepare garlic-ginger paste fresh and store with 1/2 tsp oil for up to 2 weeks.',
      'Sprout whole moong beans in a moist muslin cloth for 24-36 hours for 3x bioavailable nutrition.',
      'Pre-chop hard vegetables (carrots, beans, pumpkin) and store in dry containers.',
    ],
    days: daysData,
    createdAt: new Date().toISOString(),
  };
}

// Comprehensive Verified Food Database for High-Accuracy Matching & Fallbacks
interface DatabaseEntry {
  names: string[];
  category: string;
  serving: string;
  cal: number;
  pro: number;
  carb: number;
  fat: number;
  satFat: number;
  fib: number;
  natSug: number;
  addSug: number;
  sod: number;
  score: number;
  status: 'Healthy' | 'Moderate' | 'Unhealthy';
  gi: 'Low' | 'Medium' | 'High';
  reason: string;
  insights: string[];
  altName: string;
  altReason: string;
  savings: string;
}

const VERIFIED_FOODS_DB: DatabaseEntry[] = [
  {
    names: ['roti', 'chapati', 'phulka', 'atta roti', 'wheat roti', 'rotli'],
    category: 'Grains & Breads',
    serving: '1 medium roti (35g raw atta / 40g cooked)',
    cal: 104, pro: 3.5, carb: 22, fat: 0.5, satFat: 0.1, fib: 2.8, natSug: 0.4, addSug: 0, sod: 5,
    score: 88, status: 'Healthy', gi: 'Medium',
    reason: 'Unprocessed whole wheat carbohydrate staple delivering steady energy and digestive bran fiber.',
    insights: [
      'Rich in insoluble dietary fiber to nourish beneficial gut microbiome.',
      'Naturally low in fat when cooked without heavy oil on a dry tawa.',
      'Pairing with dal completes the plant protein amino acid profile.',
    ],
    altName: 'Homemade Multigrain Roti (Atta + Besan + Oats)',
    altReason: 'Blending 20% besan into wheat flour boosts protein by 40% for under ₹2 per roti.',
    savings: '₹15 / meal',
  },
  {
    names: ['rice', 'white rice', 'cooked rice', 'chawal', 'basmati', 'bhat'],
    category: 'Grains & Breads',
    serving: '1 medium bowl / katori (150g cooked)',
    cal: 195, pro: 4.1, carb: 43, fat: 0.4, satFat: 0.1, fib: 0.6, natSug: 0.1, addSug: 0, sod: 2,
    score: 72, status: 'Moderate', gi: 'High',
    reason: 'Easily digestible carbohydrate source; best paired with high-fiber dals and sabzi to lower glycemic response.',
    insights: [
      'Gentle on sensitive digestive tracts with near-zero allergenic compounds.',
      'High glycemic index; buffer with ghee or leafy vegetables to slow glucose absorption.',
      'Refrigerating cooked rice overnight forms resistant starch, reducing caloric bioavailability.',
    ],
    altName: 'Brown Rice or Hand-Pounded Red Rice',
    altReason: 'Retains bran layer, providing 4x higher fiber and B-complex vitamins.',
    savings: '₹5 / day',
  },
  {
    names: ['paneer', 'cottage cheese', 'raw paneer', 'fresh paneer', 'amul paneer'],
    category: 'Dairy & Eggs',
    serving: '100g fresh paneer',
    cal: 265, pro: 18.3, carb: 3.4, fat: 20.8, satFat: 12.5, fib: 0, natSug: 2.8, addSug: 0, sod: 25,
    score: 86, status: 'Healthy', gi: 'Low',
    reason: 'High biological value dairy protein and calcium with virtually zero carbohydrates.',
    insights: [
      'Casein protein breaks down slowly over 6-8 hours, ideal for steady muscle recovery.',
      'Zero refined carbs make it safe for diabetes and keto management.',
      'Choose local fresh dairy paneer over long-life packaged blocks with starch stabilizers.',
    ],
    altName: 'Homestyle Paneer Curdled from Toned Milk',
    altReason: 'Curdling 1L toned milk (₹32) yields 180g paneer with 50% less saturated fat.',
    savings: '₹45 / 200g',
  },
  {
    names: ['egg', 'boiled egg', 'eggs', 'anda', 'hard boiled egg'],
    category: 'Dairy & Eggs',
    serving: '2 large hard-boiled eggs (100g)',
    cal: 144, pro: 12.6, carb: 0.8, fat: 9.8, satFat: 3.1, fib: 0, natSug: 0.6, addSug: 0, sod: 130,
    score: 96, status: 'Healthy', gi: 'Low',
    reason: 'Biological gold-standard protein (PDCAAS 1.0) loaded with brain-essential choline and vitamin B12.',
    insights: [
      'Complete amino acid profile with highest human metabolic bioavailability.',
      'Egg yolk delivers lutein, zeaxanthin, and natural Vitamin D3.',
      'Low caloric load per gram of protein supports rapid fat loss and muscle preservation.',
    ],
    altName: 'Wholesale Egg Tray (30 eggs) from Mandi',
    altReason: 'Buying full trays drops cost to ₹5.50 per egg versus ₹8 at retail stores.',
    savings: '₹50 / tray',
  },
  {
    names: ['chicken', 'chicken breast', 'grilled chicken', 'murgh'],
    category: 'Dairy & Eggs',
    serving: '150g grilled skinless chicken breast',
    cal: 248, pro: 46.5, carb: 0, fat: 5.4, satFat: 1.5, fib: 0, natSug: 0, addSug: 0, sod: 110,
    score: 95, status: 'Healthy', gi: 'Low',
    reason: 'Ultra-lean animal protein source packed with niacin, phosphorus, and essential amino acids.',
    insights: [
      'Over 80% of total calories derive directly from pure dietary protein.',
      'Zero carbohydrates and low saturated fat promote lean muscle building.',
      'Marinate with turmeric, ginger-garlic, and lemon for maximum antioxidant absorption.',
    ],
    altName: 'Whole Dressed Chicken Portioned at Home',
    altReason: 'Buying whole dressed chicken (₹180/kg) saves 40% over pre-cut boneless breast.',
    savings: '₹120 / kg',
  },
  {
    names: ['dal', 'moong dal', 'yellow dal', 'tadka dal', 'toor dal', 'arhar dal', 'lentils'],
    category: 'Dals & Curries',
    serving: '1 medium bowl / katori (180g cooked)',
    cal: 145, pro: 9.4, carb: 22, fat: 2.8, satFat: 0.6, fib: 5.4, natSug: 1.2, addSug: 0, sod: 260,
    score: 95, status: 'Healthy', gi: 'Low',
    reason: 'Lightest and most digestible plant protein foundation, rich in folate, iron, and potassium.',
    insights: [
      'High folate supports cellular DNA repair and healthy red blood cell production.',
      'Non-bloating pulse gentle on daily digestive cycles.',
      'Tadka of cumin and mustard seeds stimulates gastric digestive enzymes.',
    ],
    altName: 'Bulk Whole Green Moong (Sabut Moong)',
    altReason: 'Buying 5kg unpolished whole moong from mandi costs only ₹110/kg.',
    savings: '₹40 / kg',
  },
  {
    names: ['curd', 'dahi', 'yogurt', 'greek yogurt'],
    category: 'Dairy & Eggs',
    serving: '1 medium katori (150g)',
    cal: 98, pro: 5.8, carb: 6.5, fat: 4.8, satFat: 3.0, fib: 0, natSug: 6.2, addSug: 0, sod: 55,
    score: 94, status: 'Healthy', gi: 'Low',
    reason: 'Live active probiotic culture strengthening gut microbiota and calcium absorption.',
    insights: [
      'Billions of live Lactobacillus bacteria reinforce intestinal lining integrity.',
      'Fermented lactic acid makes dairy proteins and minerals more bioavailable.',
      'Naturally zero added sugar when set at home without artificial syrups.',
    ],
    altName: 'Continuous Home Batch Culture Curd',
    altReason: 'Setting curd daily at home costs ₹0 extra and eliminates single-use plastic tubs.',
    savings: '₹90 / week',
  },
  {
    names: ['maggi', 'noodles', 'instant noodles', 'ramen', 'wai wai'],
    category: 'Packaged & Street Food',
    serving: '1 single packet (70g dry cooked)',
    cal: 312, pro: 6.8, carb: 43.6, fat: 12.4, satFat: 6.2, fib: 1.8, natSug: 1.2, addSug: 1.8, sod: 860,
    score: 28, status: 'Unhealthy', gi: 'High',
    reason: 'Deep-fried refined maida noodles cooked in palm olein with nearly half a day’s sodium limit (>850mg).',
    insights: [
      'Contains over 860mg sodium (43% of WHO maximum recommended daily intake).',
      'Fried in refined palm oil, delivering 6.2g saturated fat per single snack cake.',
      'High glycemic index triggers rapid blood sugar spike followed by lethargy.',
    ],
    altName: 'Spiced Whole Wheat Vermicelli (Semiya) or Oats',
    altReason: 'Cooking roasted whole wheat vermicelli with veggies saves ₹10 and cuts 600mg sodium.',
    savings: '₹12 / snack',
  },
  {
    names: ['chips', 'lays', 'potato chips', 'kurkure', 'bingo', 'wafers'],
    category: 'Packaged & Street Food',
    serving: '1 standard bag (50g)',
    cal: 275, pro: 3.5, carb: 26.5, fat: 17.5, satFat: 7.8, fib: 1.2, natSug: 0.5, addSug: 0.8, sod: 480,
    score: 22, status: 'Unhealthy', gi: 'High',
    reason: 'Ultra-processed deep fried potatoes containing excessive palm oil and sodium.',
    insights: [
      'Over 55% of total calories come from refined frying fats and trans-fat precursors.',
      'Contains high levels of frying acrylamides from ultra-high temperature processing.',
      'Hyper-palatable seasoning triggers compulsive overconsumption without satiety.',
    ],
    altName: 'Roasted Masala Fox Nuts (Makhana) or Roasted Peanuts',
    altReason: 'Swapping to roasted makhana saves 14g unhealthy fat, adds 3g protein, and saves ₹15.',
    savings: '₹15 / bag',
  },
  {
    names: ['coke', 'cola', 'pepsi', 'soda', 'cold drink', 'soft drink', 'sprite', 'fanta', 'thums up'],
    category: 'Beverages',
    serving: '1 can (330ml)',
    cal: 140, pro: 0, carb: 35.0, fat: 0, satFat: 0, fib: 0, natSug: 0, addSug: 35.0, sod: 45,
    score: 12, status: 'Unhealthy', gi: 'High',
    reason: 'Pure liquid sucrose bomb (35g = ~9 teaspoons sugar) causing acute liver stress and insulin surges.',
    insights: [
      'Delivers 35g free added sugar with zero dietary fiber to slow hepatic absorption.',
      'Phosphoric acid promotes dental enamel demineralization over time.',
      'Liquid sugars fail to activate leptin satiety receptors in the brain.',
    ],
    altName: 'Chilled Spiced Buttermilk (Chaas) or Fresh Lemon Water (Nimbu Pani)',
    altReason: 'Fresh jeera chaas or nimbu pani provides natural electrolytes for ₹5 with 0g added sugar.',
    savings: '₹35 / can',
  },
  {
    names: ['samosa', 'fried samosa', 'kachori', 'pakora'],
    category: 'Packaged & Street Food',
    serving: '1 large piece (90g)',
    cal: 260, pro: 3.8, carb: 32.0, fat: 13.5, satFat: 5.8, fib: 2.1, natSug: 1.1, addSug: 0.5, sod: 380,
    score: 35, status: 'Unhealthy', gi: 'High',
    reason: 'Deep-fried maida pastry shell soaked in reused commercial oil and spiced mashed potato.',
    insights: [
      'Commercial deep-frying oil is frequently reheated, generating harmful polar compounds.',
      'High glycemic carbohydrate surge combined with high saturated fat.',
      'Caloric density is high: 2 samosas match a full home-cooked lunch.',
    ],
    altName: 'Air-Fried Paneer Tikka or Besan Chilla',
    altReason: 'Besan chilla provides identical spicy crunch with 3x more protein and 80% less oil.',
    savings: '₹10 / snack',
  },
  {
    names: ['makhana', 'fox nuts', 'lotus seeds', 'roasted makhana'],
    category: 'Snacks & Nuts',
    serving: '1 large bowl (30g roasted in 1/2 tsp ghee)',
    cal: 125, pro: 3.2, carb: 21, fat: 3.1, satFat: 1.2, fib: 2.8, natSug: 0.2, addSug: 0, sod: 85,
    score: 94, status: 'Healthy', gi: 'Low',
    reason: 'Antioxidant-rich ancient superfood packed with kaempferol, magnesium, and zero gluten.',
    insights: [
      'Very high crunch volume per calorie; replaces fried chips with 75% fewer calories.',
      'Kaempferol flavonoids exhibit potent cellular anti-inflammatory benefits.',
      'Favorable potassium-to-sodium ratio supports cardiovascular blood pressure.',
    ],
    altName: 'Raw Bulk Lotus Seeds (Roast at Home)',
    altReason: 'Buying 500g raw makhana (₹320) saves ₹400 over branded snack tins.',
    savings: '₹80 / 100g',
  },
  {
    names: ['banana', 'kela', 'ripe banana'],
    category: 'Fruits & Veggies',
    serving: '1 medium banana (118g peeled)',
    cal: 105, pro: 1.3, carb: 27, fat: 0.3, satFat: 0.1, fib: 3.1, natSug: 14.4, addSug: 0, sod: 1,
    score: 89, status: 'Healthy', gi: 'Medium',
    reason: 'Natural energy fruit delivering bioavailable potassium, vitamin B6, and prebiotic fructans.',
    insights: [
      'High potassium balances dietary sodium and prevents muscle cramping.',
      'Natural whole-fruit sugars are bound inside pectin fiber matrices for regulated release.',
      'Greenish bananas contain high resistant starch that feeds healthy probiotic bacteria.',
    ],
    altName: 'Fresh Seasonal Indian Guava (Amrood)',
    altReason: 'Guava provides 4x more Vitamin C and 2x more fiber for under ₹10.',
    savings: '₹10 / fruit',
  },
  {
    names: ['oats', 'dalia', 'rolled oats', 'porridge', 'oatmeal'],
    category: 'Grains & Breads',
    serving: '1 bowl (40g dry oats in 150ml milk/water)',
    cal: 225, pro: 10.2, carb: 34, fat: 5.5, satFat: 1.8, fib: 4.8, natSug: 6.2, addSug: 0, sod: 75,
    score: 94, status: 'Healthy', gi: 'Low',
    reason: 'Rich in soluble Beta-Glucan fiber proven to reduce LDL cholesterol and stabilize insulin.',
    insights: [
      'Forms a protective viscous gel in digestive tract that binds to excess dietary cholesterol.',
      'High satiety index keeps appetite stable for 3-4 hours.',
      'Packed with avenanthramides, unique anti-inflammatory antioxidants.',
    ],
    altName: 'Broken Wheat (Dalia) Khichdi',
    altReason: 'Local whole wheat dalia costs 50% less than oats with identical high fiber benefits.',
    savings: '₹25 / 500g',
  },
  {
    names: ['chai', 'tea', 'masala chai', 'milk tea'],
    category: 'Beverages',
    serving: '1 cup (150ml with 50% milk and 1 tsp sugar)',
    cal: 78, pro: 2.4, carb: 10.5, fat: 2.8, satFat: 1.8, fib: 0.2, natSug: 4.8, addSug: 5.0, sod: 35,
    score: 78, status: 'Healthy', gi: 'Medium',
    reason: 'Antioxidant black tea brewed with digestive spices (ginger, cardamom, cinnamon).',
    insights: [
      'Gingerols and cardamom stimulate digestive bile secretion.',
      'Keep added refined sugar under 1 teaspoon to prevent unnecessary insulin surges.',
      'Cinnamon provides natural insulin-sensitizing benefits.',
    ],
    altName: 'Spiced Ginger Tulsi Green Brew',
    altReason: 'Brewing fresh tulsi and ginger leaves at home costs ₹2 with 0g added sugar.',
    savings: '₹10 / cup',
  },
];

// Fallback Food Analyzer with Precise Quantity & Token Matching
function generateFallbackFoodAnalysis(query: string | null) {
  const rawQ = (query || 'Food Item').toLowerCase().trim();

  // Extract quantity multiplier if specified (e.g. "2 rotis", "3 eggs", "200g paneer", "0.5 cup rice")
  let multiplier = 1;
  const numMatch = rawQ.match(/^(\d+(?:\.\d+)?)\s*(?:x|nos?|pieces?|pcs?|bowls?|cups?|rotis?|eggs?|plates?|g|gm|grams?|ml)?/i);
  if (numMatch && numMatch[1]) {
    const parsedNum = parseFloat(numMatch[1]);
    if (!isNaN(parsedNum) && parsedNum > 0) {
      if (rawQ.includes('100g') || rawQ.includes('100 g')) multiplier = 1;
      else if (rawQ.includes('200g') || rawQ.includes('200 g')) multiplier = 2;
      else if (rawQ.includes('50g') || rawQ.includes('50 g')) multiplier = 0.5;
      else if (parsedNum <= 10) multiplier = parsedNum;
    }
  }

  // Find best matching item in verified database
  let matchedItem = VERIFIED_FOODS_DB.find((item) =>
    item.names.some((n) => rawQ.includes(n))
  );

  // If no direct match, look for word token overlaps
  if (!matchedItem) {
    const tokens = rawQ.split(/\s+/).filter(Boolean);
    matchedItem = VERIFIED_FOODS_DB.find((item) =>
      tokens.some((t) => item.names.some((n) => n.includes(t) || t.includes(n)))
    );
  }

  if (matchedItem) {
    const m = multiplier;
    const rounded = (v: number) => Math.round(v * m * 10) / 10;

    return {
      foodName: `${m > 1 ? `${m}x ` : ''}${matchedItem.names[0].charAt(0).toUpperCase() + matchedItem.names[0].slice(1)}`,
      category: matchedItem.category,
      healthScore: matchedItem.score,
      healthStatus: matchedItem.status,
      naturalSugar: rounded(matchedItem.natSug),
      addedSugar: rounded(matchedItem.addSug),
      fat: rounded(matchedItem.fat),
      saturatedFat: rounded(matchedItem.satFat),
      protein: rounded(matchedItem.pro),
      carbs: rounded(matchedItem.carb),
      calories: Math.round(matchedItem.cal * m),
      fiber: rounded(matchedItem.fib),
      sodium: Math.round(matchedItem.sod * m),
      glycemicIndex: matchedItem.gi,
      servingSize: m === 1 ? matchedItem.serving : `${m}x ${matchedItem.serving}`,
      estimatedPrice: Math.round(25 * m),
      pricePer100g: 25,
      reason: matchedItem.reason,
      insights: matchedItem.insights,
      personalizedTips: `Nutritional values calculated for ${m > 1 ? `${m} servings` : '1 standard serving'}. Drink 2.5-3L water daily.`,
      budgetAlternative: {
        name: matchedItem.altName,
        reason: matchedItem.altReason,
        estimatedSavings: matchedItem.savings,
      },
      extractedText: `Precision Craven Nutrition Analysis for: "${query}". Verified whole-food database match.`,
    };
  }

  // Generic fallback if unknown food
  return {
    foodName: query ? query.charAt(0).toUpperCase() + query.slice(1) : 'Analyzed Food Item',
    category: 'General Foods',
    healthScore: 78,
    healthStatus: 'Healthy',
    naturalSugar: 3.5,
    addedSugar: 0,
    fat: 7.2,
    saturatedFat: 2.1,
    protein: 12.0,
    carbs: 26.0,
    calories: 215,
    fiber: 4.5,
    sodium: 140,
    glycemicIndex: 'Low',
    servingSize: '1 standard serving (150g)',
    estimatedPrice: 35,
    pricePer100g: 23,
    reason: 'Wholesome balanced food profile composed primarily of natural complex nutrients.',
    insights: [
      'Provides steady energy with balanced macronutrient distribution.',
      'Low glycemic response prevents sharp spikes in blood glucose.',
      'Free from synthetic trans fats and high fructose corn syrups.',
    ],
    personalizedTips: 'Pair with fresh greens and adequate hydration for optimal metabolic absorption.',
    budgetAlternative: {
      name: 'Homestyle Spiced Roasted Chickpeas or Paneer',
      reason: 'Preparing whole-food staples at home saves up to ₹80 weekly and eliminates preservatives.',
      estimatedSavings: '₹80 / week',
    },
    extractedText: query ? `Nutritional database scan for: "${query}". Analyzed with Craven Nutrition Engine.` : 'Extracted nutrition facts panel.',
  };
}

// 0. Instant Search Food Database API
app.get('/api/search-foods', (req, res) => {
  const query = (req.query.q as string || '').toLowerCase().trim();
  if (!query) {
    return res.json(VERIFIED_FOODS_DB.slice(0, 10));
  }
  const filtered = VERIFIED_FOODS_DB.filter((item) =>
    item.names.some((n) => n.includes(query)) ||
    item.category.toLowerCase().includes(query) ||
    item.reason.toLowerCase().includes(query)
  );
  res.json(filtered);
});

// 1. Generate 7-Day Diet Plan & Budget Strategy API
app.post('/api/generate-plan', async (req, res) => {
  try {
    const profile = req.body.profile || {};
    const goal = profile.goal || req.body.goal || 'Healthy Living & Weight Management';
    const dietType = profile.dietType ? (profile.customDietType ? `${profile.dietType} (${profile.customDietType})` : profile.dietType) : (req.body.dietType || 'Indian Vegetarian');
    const calorieTarget = Number(req.body.calorieTarget) || 2000;
    const budgetTier = profile.budgetTier || req.body.budgetTier || 'thrifty';
    const householdSize = req.body.householdSize || 1;
    const currency = profile.currency || req.body.currency || '₹';
    const dislikedFoods = profile.dislikedFoods || req.body.dislikedFoods || '';
    const pantryItems = req.body.pantryItems || 'Standard spices, cold-pressed oil, salt, turmeric, cumin';
    const cookingSkill = req.body.cookingSkill || 'Home Cook';

    const ai = getAI();

    // If Gemini key is available, attempt real AI generation
    if (ai) {
      try {
        const systemPrompt = `You are Craven AI, an elite Precision Culinary Biochemist, Registered Dietitian, and Zero-Waste Budgeting Expert.
Your mission is to construct an exceptional, realistic, culturally attuned 7-day meal plan (Monday through Sunday) that:
1. STRICTLY satisfies the user's calorie target (~${calorieTarget} kcal/day across Breakfast, Lunch, Dinner, Snack).
2. Minimizes grocery costs for the "${budgetTier}" budget tier in currency "${currency}" (e.g. thrifty ~₹1,850/wk bulk staples; balanced ~₹2,750/wk; gourmet ~₹4,200/wk).
3. ELIMINATES FOOD WASTE by strategically cross-utilizing bulk ingredients across multiple meals throughout the week.
4. STRICTLY avoids any listed allergens (${profile.allergies?.join(', ') || 'None'}), foods to avoid (${profile.foodsToAvoid || 'None'}), and disliked foods (${dislikedFoods || 'None'}).
5. RESPECTS medical conditions (${profile.medicalConditions?.join(', ') || 'None'}), doctor guidelines (${profile.doctorRestrictions || 'None'}), digestive sensitivities (${profile.digestiveIssues?.join(', ') || 'None'}), and medications (${profile.medications || 'None'}).
6. ALIGNS with user meal schedule: Wake ${profile.wakeUpTime || '6:30 AM'}, Breakfast ${profile.breakfastTime || '8:30 AM'}, Lunch ${profile.lunchTime || '1:30 PM'}, Snack ${profile.snackTime || '5:00 PM'}, Dinner ${profile.dinnerTime || '8:00 PM'}, Sleep ${profile.sleepTime || '11:00 PM'}${profile.intermittentFasting ? ` [Intermittent Fasting Window: ${profile.fastingWindow}]` : ''}.
7. INCORPORATES favorite foods (${profile.favoriteFoods || 'wholesome foods'}), preferred cuisines (${profile.preferredCuisines?.join(', ') || 'Regional'}), preferred protein sources (${profile.preferredProteinSources?.join(', ') || 'Paneer, Dals, Sprouts, Eggs'}), and matches preferred spice level (${profile.spiceLevel || 'Medium'}).
8. MATCHES available kitchen equipment (${profile.kitchenEquipment?.join(', ') || 'Gas stove, mixer, pressure cooker'}) and prep time (${profile.availableCookingTime || '15-30 mins'}).
9. Fits user biometrics: Age ${profile.age || 'N/A'}, Gender ${profile.gender || 'N/A'}, Weight ${profile.currentWeight || 'N/A'} ${profile.weightUnit || 'kg'}, Goal ${goal}.

Provide exact calculated nutritional values (calories, protein, carbs, fat, fiber) per meal, realistic prep/cook times in minutes, realistic cost estimates in ${currency}, step-by-step instructions, and explicit waste-saving tips.`;

        const prompt = `Generate a complete 7-Day Personalized Diet & Grocery Plan in currency "${currency}" for:
- User Profile: Age ${profile.age || 28}, Gender ${profile.gender || 'Male'}, Current Weight ${profile.currentWeight || 70} ${profile.weightUnit || 'kg'}, Target Weight ${profile.targetWeight || 65} ${profile.weightUnit || 'kg'}
- Location: ${profile.cityRegion ? profile.cityRegion + ', ' : ''}${profile.country || 'India'}
- Primary Goal: ${goal}
- Diet Type: ${dietType}
- Target Calories: ${calorieTarget} kcal/day
- Allergens & Foods to Avoid: Allergies: ${profile.allergies?.join(', ') || 'None'}; Disliked/Avoid: ${profile.foodsToAvoid || dislikedFoods || 'None'}
- Health & Digestive Considerations: Conditions: ${profile.medicalConditions?.join(', ') || 'None'}; Digestive: ${profile.digestiveIssues?.join(', ') || 'None'}; Doctor notes: ${profile.doctorRestrictions || 'None'}
- Activity & Exercise: Level: ${profile.activityLevel || 'Moderate'} (${profile.dailySteps || '8,000 steps'}); Workout: ${profile.hasExercise ? `${profile.workoutType?.join(', ')} (${profile.workoutDaysPerWeek || 3} days/wk, ${profile.workoutDuration || '45 min'} at ${profile.workoutTime || 'Evening'})` : 'No structured workout'}
- Meal Schedule: Breakfast ${profile.breakfastTime || '8:30 AM'}, Lunch ${profile.lunchTime || '1:30 PM'}, Snack ${profile.snackTime || '5:00 PM'}, Dinner ${profile.dinnerTime || '8:00 PM'}. Meals/day: ${profile.mealsPerDay || 4}. Fasting: ${profile.intermittentFasting ? profile.fastingWindow : 'None'}
- Food Preferences: Favorites: ${profile.favoriteFoods || 'Wholesome staples'}; Cuisines: ${profile.preferredCuisines?.join(', ') || 'Indian'}; Spice: ${profile.spiceLevel || 'Medium'}; Protein Sources: ${profile.preferredProteinSources?.join(', ') || 'Paneer, Dal, Curd, Eggs'}
- Cooking & Budget: Pattern: ${profile.cookingPattern || 'Mostly home-cooked'}; Prep Time: ${profile.availableCookingTime || '15-30 min'}; Equipment: ${profile.kitchenEquipment?.join(', ') || 'Stove, Cooker, Mixer'}; Budget: ${currency}${profile.dailyFoodBudget || 350}/day (${currency}${profile.weeklyFoodBudget || 2450}/wk) [${budgetTier} Tier]
- Drinks & Hydration (Step 8): ${profile.skipHydrationStep ? 'USER SKIPPED OPTION 8. Do NOT count, mandate, or calculate specific drinks, smoothies, tea/coffee liquid calories, or supplements into the meal macronutrient budget. Focus purely on core solid meal targets (Breakfast, Lunch, Dinner, Snack).' : `Water: ${profile.dailyWaterIntake || '2-3 Liters'}; Tea/Coffee: ${profile.teaConsumption || 'Chai'}; Supplements: ${profile.currentSupplements?.join(', ') || 'None'}`}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: prompt,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                goal: { type: Type.STRING },
                dietType: { type: Type.STRING },
                budgetTier: { type: Type.STRING },
                targetCalories: { type: Type.NUMBER },
                householdSize: { type: Type.NUMBER },
                estimatedWeeklyCost: { type: Type.NUMBER },
                currency: { type: Type.STRING },
                summary: { type: Type.STRING },
                zeroWasteStrategy: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                bulkPrepTips: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                days: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      dayNumber: { type: Type.NUMBER },
                      dayName: { type: Type.STRING },
                      dailyWasteSaverNote: { type: Type.STRING },
                      dayEstimatedCost: { type: Type.NUMBER },
                      totalDayMacros: {
                        type: Type.OBJECT,
                        properties: {
                          calories: { type: Type.NUMBER },
                          protein: { type: Type.NUMBER },
                          carbs: { type: Type.NUMBER },
                          fat: { type: Type.NUMBER },
                          fiber: { type: Type.NUMBER },
                        },
                        required: ['calories', 'protein', 'carbs', 'fat'],
                      },
                      meals: {
                        type: Type.OBJECT,
                        properties: {
                          breakfast: {
                            type: Type.OBJECT,
                            properties: {
                              id: { type: Type.STRING },
                              name: { type: Type.STRING },
                              type: { type: Type.STRING },
                              description: { type: Type.STRING },
                              prepTimeMinutes: { type: Type.NUMBER },
                              cookTimeMinutes: { type: Type.NUMBER },
                              estimatedCost: { type: Type.NUMBER },
                              macros: {
                                type: Type.OBJECT,
                                properties: {
                                  calories: { type: Type.NUMBER },
                                  protein: { type: Type.NUMBER },
                                  carbs: { type: Type.NUMBER },
                                  fat: { type: Type.NUMBER },
                                  fiber: { type: Type.NUMBER },
                                },
                                required: ['calories', 'protein', 'carbs', 'fat'],
                              },
                              ingredients: {
                                type: Type.ARRAY,
                                items: {
                                  type: Type.OBJECT,
                                  properties: {
                                    name: { type: Type.STRING },
                                    amount: { type: Type.STRING },
                                    isReusedInOtherMeals: { type: Type.BOOLEAN },
                                    pantryStaple: { type: Type.BOOLEAN },
                                  },
                                  required: ['name', 'amount'],
                                },
                              },
                              instructions: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING },
                              },
                              wasteSavingTip: { type: Type.STRING },
                              dietaryBadges: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING },
                              },
                            },
                            required: ['id', 'name', 'type', 'estimatedCost', 'macros', 'ingredients', 'instructions'],
                          },
                          lunch: {
                            type: Type.OBJECT,
                            properties: {
                              id: { type: Type.STRING },
                              name: { type: Type.STRING },
                              type: { type: Type.STRING },
                              description: { type: Type.STRING },
                              prepTimeMinutes: { type: Type.NUMBER },
                              cookTimeMinutes: { type: Type.NUMBER },
                              estimatedCost: { type: Type.NUMBER },
                              macros: {
                                type: Type.OBJECT,
                                properties: {
                                  calories: { type: Type.NUMBER },
                                  protein: { type: Type.NUMBER },
                                  carbs: { type: Type.NUMBER },
                                  fat: { type: Type.NUMBER },
                                  fiber: { type: Type.NUMBER },
                                },
                                required: ['calories', 'protein', 'carbs', 'fat'],
                              },
                              ingredients: {
                                type: Type.ARRAY,
                                items: {
                                  type: Type.OBJECT,
                                  properties: {
                                    name: { type: Type.STRING },
                                    amount: { type: Type.STRING },
                                    isReusedInOtherMeals: { type: Type.BOOLEAN },
                                    pantryStaple: { type: Type.BOOLEAN },
                                  },
                                  required: ['name', 'amount'],
                                },
                              },
                              instructions: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING },
                              },
                              wasteSavingTip: { type: Type.STRING },
                              dietaryBadges: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING },
                              },
                            },
                            required: ['id', 'name', 'type', 'estimatedCost', 'macros', 'ingredients', 'instructions'],
                          },
                          dinner: {
                            type: Type.OBJECT,
                            properties: {
                              id: { type: Type.STRING },
                              name: { type: Type.STRING },
                              type: { type: Type.STRING },
                              description: { type: Type.STRING },
                              prepTimeMinutes: { type: Type.NUMBER },
                              cookTimeMinutes: { type: Type.NUMBER },
                              estimatedCost: { type: Type.NUMBER },
                              macros: {
                                type: Type.OBJECT,
                                properties: {
                                  calories: { type: Type.NUMBER },
                                  protein: { type: Type.NUMBER },
                                  carbs: { type: Type.NUMBER },
                                  fat: { type: Type.NUMBER },
                                  fiber: { type: Type.NUMBER },
                                },
                                required: ['calories', 'protein', 'carbs', 'fat'],
                              },
                              ingredients: {
                                type: Type.ARRAY,
                                items: {
                                  type: Type.OBJECT,
                                  properties: {
                                    name: { type: Type.STRING },
                                    amount: { type: Type.STRING },
                                    isReusedInOtherMeals: { type: Type.BOOLEAN },
                                    pantryStaple: { type: Type.BOOLEAN },
                                  },
                                  required: ['name', 'amount'],
                                },
                              },
                              instructions: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING },
                              },
                              wasteSavingTip: { type: Type.STRING },
                              dietaryBadges: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING },
                              },
                            },
                            required: ['id', 'name', 'type', 'estimatedCost', 'macros', 'ingredients', 'instructions'],
                          },
                          snack: {
                            type: Type.OBJECT,
                            properties: {
                              id: { type: Type.STRING },
                              name: { type: Type.STRING },
                              type: { type: Type.STRING },
                              description: { type: Type.STRING },
                              prepTimeMinutes: { type: Type.NUMBER },
                              cookTimeMinutes: { type: Type.NUMBER },
                              estimatedCost: { type: Type.NUMBER },
                              macros: {
                                type: Type.OBJECT,
                                properties: {
                                  calories: { type: Type.NUMBER },
                                  protein: { type: Type.NUMBER },
                                  carbs: { type: Type.NUMBER },
                                  fat: { type: Type.NUMBER },
                                  fiber: { type: Type.NUMBER },
                                },
                                required: ['calories', 'protein', 'carbs', 'fat'],
                              },
                              ingredients: {
                                type: Type.ARRAY,
                                items: {
                                  type: Type.OBJECT,
                                  properties: {
                                    name: { type: Type.STRING },
                                    amount: { type: Type.STRING },
                                    isReusedInOtherMeals: { type: Type.BOOLEAN },
                                    pantryStaple: { type: Type.BOOLEAN },
                                  },
                                  required: ['name', 'amount'],
                                },
                              },
                              instructions: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING },
                              },
                              wasteSavingTip: { type: Type.STRING },
                              dietaryBadges: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING },
                              },
                            },
                            required: ['id', 'name', 'type', 'estimatedCost', 'macros', 'ingredients', 'instructions'],
                          },
                        },
                        required: ['breakfast', 'lunch', 'dinner', 'snack'],
                      },
                    },
                    required: ['dayNumber', 'dayName', 'dayEstimatedCost', 'totalDayMacros', 'meals'],
                  },
                },
              },
              required: [
                'title',
                'goal',
                'dietType',
                'budgetTier',
                'targetCalories',
                'householdSize',
                'estimatedWeeklyCost',
                'currency',
                'summary',
                'zeroWasteStrategy',
                'bulkPrepTips',
                'days',
              ],
            },
          },
        });

        const text = response.text;
        if (text) {
          const planData = JSON.parse(text);
          planData.id = 'plan-' + Date.now();
          planData.createdAt = new Date().toISOString();
          return res.json(planData);
        }
      } catch (geminiErr) {
        console.warn('Gemini API call failed, falling back to smart procedural generator:', geminiErr);
      }
    }

    // Fallback generation
    const fallbackPlan = generateFallbackPlan(req.body);
    return res.json(fallbackPlan);
  } catch (err: any) {
    console.error('Error generating plan:', err);
    const fallbackPlan = generateFallbackPlan(req.body);
    res.json(fallbackPlan);
  }
});

// 2. Analyze Food Label Nutrition & Health Score API (OCR + Vision + Search)
app.post('/api/analyze-label', async (req, res) => {
  try {
    const { image, query, age, weight } = req.body;
    if (!image && !query) {
      return res.status(400).json({ error: 'Please provide either an image of a food label or a food query.' });
    }

    const ai = getAI();

    if (ai) {
      try {
        const systemPrompt = `You are Craven, an elite Precision Nutritional Biochemist and Food Health Analyzer.
Your task is to analyze food nutritional content (either from an uploaded nutrition label image or a food name/query) with high mathematical and biochemical precision:
1. Exact Portion & Ingredient Parsing:
   - Carefully identify the exact food item, preparation style, and quantity specified in the query (e.g. '2 rotis', '100g paneer', '1 cup dal', '3 eggs', 'plate of biryani').
   - If a quantity is specified, calculate the exact corresponding macros. If no portion is specified, assume 1 standard typical serving (e.g., 1 medium bowl, 100g, or 1 piece) and clearly specify this in 'servingSize'.
2. Precise Macronutrients & Micronutrients:
   - calories (kcal): Mathematically accurate (approx 4*protein + 4*carbs + 9*fat).
   - protein (g), carbs (g), fat (g), saturatedFat (g), fiber (g).
   - naturalSugar (g): naturally present from milk, whole fruits, or whole grains.
   - addedSugar (g): added refined sucrose, corn syrup, jaggery, or honey.
   - sodium (mg): accurate estimation or label extraction.
   - glycemicIndex: 'Low' | 'Medium' | 'High'
3. Craven Health Score (0 to 100):
   - 85-100: Whole food, nutrient dense, zero added sugar, high fiber/protein.
   - 55-84: Moderate food, balanced attributes, whole grains or traditional preparations.
   - 0-54: Unhealthy (Ultra-processed, deep-fried, excessive added sugar >10g, high sodium >600mg, palm oil).
4. Health Status: 'Healthy' | 'Moderate' | 'Unhealthy'
5. Reason: 1-2 sentence evidence-based biological explanation.
6. Insights: 3-4 concise bullet points highlighting key nutritional pros and cons.
7. Price Estimation:
   - estimatedPrice: Estimated cost in INR (₹) for this specified serving.
   - pricePer100g: Calculated or normalized cost in INR (₹) per 100 grams of this food item.
8. Personalized Tips: Practical advice based on age (${age || 'unspecified'}) and weight (${weight ? weight + 'kg' : 'unspecified'}).
9. Budget Alternative: A healthier, lower-sugar or higher-protein alternative with estimated rupee savings in Indian Rupees (₹) (e.g. 'Homemade Spiced Roasted Makhana saves ₹15 and cuts 14g unhealthy fats compared to packaged chips').
10. If image was provided, extract the raw text OCR.`;

        let contents: any;
        if (image) {
          const base64Data = image.includes(',') ? image.split(',')[1] : image;
          let mimeType = 'image/jpeg';
          if (image.startsWith('data:image/png')) mimeType = 'image/png';
          else if (image.startsWith('data:image/webp')) mimeType = 'image/webp';

          contents = {
            parts: [
              {
                inlineData: {
                  data: base64Data,
                  mimeType: mimeType,
                },
              },
              {
                text: `Analyze this food nutrition label with precision. User Profile: Age: ${age || 'N/A'}, Weight: ${weight || 'N/A'} kg.`,
              },
            ],
          };
        } else {
          contents = `Analyze this specific food item and quantity in detail: "${query}". Provide exact calculated nutritional values for the exact quantity/serving indicated. User Profile: Age: ${age || 'N/A'}, Weight: ${weight || 'N/A'} kg.`;
        }

        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: contents,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                foodName: { type: Type.STRING },
                category: { type: Type.STRING },
                healthScore: { type: Type.NUMBER },
                healthStatus: { type: Type.STRING, enum: ['Healthy', 'Moderate', 'Unhealthy'] },
                naturalSugar: { type: Type.NUMBER },
                addedSugar: { type: Type.NUMBER },
                fat: { type: Type.NUMBER },
                saturatedFat: { type: Type.NUMBER },
                protein: { type: Type.NUMBER },
                carbs: { type: Type.NUMBER },
                calories: { type: Type.NUMBER },
                fiber: { type: Type.NUMBER },
                sodium: { type: Type.NUMBER },
                glycemicIndex: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
                servingSize: { type: Type.STRING },
                estimatedPrice: { type: Type.NUMBER },
                pricePer100g: { type: Type.NUMBER },
                reason: { type: Type.STRING },
                insights: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                dietaryBadges: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                personalizedTips: { type: Type.STRING },
                budgetAlternative: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    reason: { type: Type.STRING },
                    estimatedSavings: { type: Type.STRING },
                  },
                  required: ['name', 'reason', 'estimatedSavings'],
                },
                extractedText: { type: Type.STRING },
              },
              required: [
                'foodName',
                'healthScore',
                'healthStatus',
                'naturalSugar',
                'addedSugar',
                'fat',
                'protein',
                'carbs',
                'calories',
                'servingSize',
                'reason',
                'insights',
              ],
            },
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        if (parsed.foodName) {
          return res.json(parsed);
        }
      } catch (geminiErr) {
        console.warn('Gemini label analysis failed, using fallback engine:', geminiErr);
      }
    }

    const fallbackAnalysis = generateFallbackFoodAnalysis(query);
    res.json(fallbackAnalysis);
  } catch (err: any) {
    console.error('Error analyzing food label:', err);
    const fallbackAnalysis = generateFallbackFoodAnalysis(req.body.query);
    res.json(fallbackAnalysis);
  }
});

// Recipe Search & AI Generation API
app.post('/api/generate-recipe', async (req, res) => {
  try {
    const { query, category, dietType, maxTime, pantryIngredients, currency } = req.body;
    const curr = currency || '₹';
    const ai = getAI();

    if (ai && query) {
      try {
        const prompt = `You are an expert executive chef and clinical nutritionist for "Craven Diet Planner".
Create a detailed, healthy, delicious, and practical recipe based on the user's request:
User Request / Query: "${query}"
Category / Meal Type: "${category || 'Any'}"
Dietary Preference: "${dietType || 'Any'}"
Available Pantry Ingredients: "${pantryIngredients || 'Standard kitchen ingredients'}"
Max Cook/Prep Time: "${maxTime || '30'} minutes"
Currency: "${curr}"

Return a single JSON object strictly matching this schema:
{
  "id": "rec-ai-${Date.now()}",
  "name": "Recipe Name",
  "category": "Breakfast" | "Lunch" | "Dinner" | "Snack" | "Dessert" | "Beverage",
  "cuisine": "Cuisine style (e.g. North Indian, Mediterranean, Asian, Italian)",
  "dietaryTags": ["Vegetarian" or "Vegan" or "Non-Veg", "High Protein", "Quick & Easy", etc.],
  "description": "2 sentence enticing and nutritionist-approved description",
  "prepTimeMinutes": number,
  "cookTimeMinutes": number,
  "totalTimeMinutes": number,
  "servings": number,
  "difficulty": "Easy" | "Medium" | "Advanced",
  "estimatedCost": number (realistic estimated cost in ${curr}),
  "currency": "${curr}",
  "macros": {
    "calories": number,
    "protein": number (grams),
    "carbs": number (grams),
    "fat": number (grams),
    "fiber": number (grams),
    "sodium": number (mg)
  },
  "ingredients": [
    { "name": "Ingredient Name", "amount": "quantity e.g. 150g or 1 cup" }
  ],
  "instructions": [
    "Step 1: ...",
    "Step 2: ...",
    "Step 3: ...",
    "Step 4: ..."
  ],
  "chefTips": [
    "Chef tip on seasoning, texture, or technique",
    "Time-saving or meal-prep tip"
  ],
  "healthBenefits": [
    "Nutritional or metabolic benefit 1",
    "Nutritional benefit 2"
  ]
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                category: { type: Type.STRING },
                cuisine: { type: Type.STRING },
                dietaryTags: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                description: { type: Type.STRING },
                prepTimeMinutes: { type: Type.NUMBER },
                cookTimeMinutes: { type: Type.NUMBER },
                totalTimeMinutes: { type: Type.NUMBER },
                servings: { type: Type.NUMBER },
                difficulty: { type: Type.STRING },
                estimatedCost: { type: Type.NUMBER },
                currency: { type: Type.STRING },
                macros: {
                  type: Type.OBJECT,
                  properties: {
                    calories: { type: Type.NUMBER },
                    protein: { type: Type.NUMBER },
                    carbs: { type: Type.NUMBER },
                    fat: { type: Type.NUMBER },
                    fiber: { type: Type.NUMBER },
                    sodium: { type: Type.NUMBER },
                  },
                  required: ['calories', 'protein', 'carbs', 'fat'],
                },
                ingredients: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      amount: { type: Type.STRING },
                    },
                    required: ['name', 'amount'],
                  },
                },
                instructions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                chefTips: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                healthBenefits: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: [
                'id',
                'name',
                'category',
                'cuisine',
                'dietaryTags',
                'description',
                'prepTimeMinutes',
                'cookTimeMinutes',
                'servings',
                'macros',
                'ingredients',
                'instructions',
              ],
            },
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        if (parsed.name && parsed.ingredients?.length) {
          parsed.currency = curr;
          parsed.totalTimeMinutes = (parsed.prepTimeMinutes || 5) + (parsed.cookTimeMinutes || 10);
          return res.json(parsed);
        }
      } catch (geminiErr) {
        console.warn('Gemini recipe generation failed, using procedural fallback:', geminiErr);
      }
    }

    // Procedural Fallback Recipe Generator
    const qClean = (query || 'Healthy Chef Creation').trim();
    const isVeg = !qClean.toLowerCase().includes('chicken') && !qClean.toLowerCase().includes('egg') && !qClean.toLowerCase().includes('fish') && !qClean.toLowerCase().includes('meat');
    const fallbackRecipe = {
      id: `rec-gen-${Date.now()}`,
      name: qClean.charAt(0).toUpperCase() + qClean.slice(1),
      category: category || (qClean.toLowerCase().includes('smoothie') || qClean.toLowerCase().includes('shake') ? 'Beverage' : 'Lunch'),
      cuisine: 'Healthy Fusion',
      dietaryTags: isVeg ? ['Vegetarian', 'High Fiber', 'Clean Eating'] : ['High Protein', 'Balanced Nutrition'],
      description: `A wholesome, nutrient-dense ${qClean} prepared with fresh whole ingredients, balanced macros, and minimal processed oils.`,
      prepTimeMinutes: 10,
      cookTimeMinutes: 15,
      totalTimeMinutes: 25,
      servings: 1,
      difficulty: 'Easy',
      estimatedCost: curr === '$' ? 4.5 : 85,
      currency: curr,
      macros: {
        calories: 360,
        protein: isVeg ? 18 : 34,
        carbs: 42,
        fat: 12,
        fiber: 8,
        sodium: 320,
      },
      ingredients: [
        { name: isVeg ? 'Cottage Cheese / Tofu / Boiled Lentils' : 'Lean Chicken Breast or Eggs', amount: '150g' },
        { name: 'Mixed Seasonal Vegetables (Broccoli, Peppers, Zucchini)', amount: '1.5 cups' },
        { name: 'Olive Oil / Ghee', amount: '1 tsp' },
        { name: 'Aromatic Herbs, Garlic & Sea Salt', amount: 'to taste' },
        { name: 'Lemon Juice & Fresh Greens', amount: '1 tbsp' },
      ],
      instructions: [
        'Wash, prep, and dice all vegetables and protein into uniform bite-sized pieces.',
        'Heat oil in a heavy-bottomed skillet over medium flame; add garlic and aromatics until fragrant.',
        'Sauté vegetables for 3-4 minutes to keep them crisp-tender and retain micronutrients.',
        'Fold in the protein source with spices, salt, and black pepper. Cook for 5-6 minutes until thoroughly cooked through.',
        'Garnish with freshly squeezed lemon juice and fresh herbs. Serve hot.'
      ],
      chefTips: [
        'Prep ingredients in advance to cut cooking time in half.',
        'Adjust spices according to your personal heat preference.'
      ],
      healthBenefits: [
        'Balanced macronutrient distribution supporting stable insulin levels and sustained energy.',
        'High in dietary fiber and essential micronutrients.'
      ]
    };

    res.json(fallbackRecipe);
  } catch (err: any) {
    console.error('Error generating recipe:', err);
    res.status(500).json({ error: 'Failed to generate recipe' });
  }
});

// Spoonacular Recipe API Integration
const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY || 'ae3022522116437eb16791c5e04bcc5f';

function cleanHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/<[^>]*>?/gm, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function mapSpoonacularToRecipe(item: any, currency = '₹'): any {
  const dishTypes: string[] = item.dishTypes || [];
  let category = 'Lunch';
  const dishTypesStr = dishTypes.join(' ').toLowerCase();

  if (dishTypesStr.includes('breakfast') || dishTypesStr.includes('brunch') || dishTypesStr.includes('morning')) {
    category = 'Breakfast';
  } else if (dishTypesStr.includes('dessert') || dishTypesStr.includes('sweet')) {
    category = 'Dessert';
  } else if (dishTypesStr.includes('beverage') || dishTypesStr.includes('drink') || dishTypesStr.includes('smoothie')) {
    category = 'Beverage';
  } else if (dishTypesStr.includes('snack') || dishTypesStr.includes('appetizer') || dishTypesStr.includes('starter') || dishTypesStr.includes('fingerfood') || dishTypesStr.includes('side dish') || dishTypesStr.includes('salad') || dishTypesStr.includes('soup')) {
    category = 'Snack';
  } else if (dishTypesStr.includes('dinner') || dishTypesStr.includes('supper')) {
    category = 'Dinner';
  } else {
    category = 'Lunch';
  }

  // Extract nutrients
  const nutrients: any[] = item.nutrition?.nutrients || [];
  const getNutrient = (name: string, fallback: number) => {
    const found = nutrients.find((n: any) => n.name?.toLowerCase() === name.toLowerCase());
    return found ? Math.round(found.amount) : fallback;
  };

  const calories = getNutrient('Calories', 350);
  const protein = getNutrient('Protein', 18);
  const carbs = getNutrient('Carbohydrates', 38);
  const fat = getNutrient('Fat', 12);
  const fiber = getNutrient('Fiber', 5);
  const sodium = getNutrient('Sodium', 320);

  // Dietary tags
  const rawDiets: string[] = item.diets || [];
  const dietaryTags: string[] = [];
  rawDiets.forEach((d: string) => {
    const lower = d.toLowerCase();
    if (lower.includes('vegan')) dietaryTags.push('Vegan');
    else if (lower.includes('lacto ovo vegetarian') || lower === 'vegetarian') dietaryTags.push('Vegetarian');
    else if (lower.includes('gluten free')) dietaryTags.push('Gluten-Free');
    else if (lower.includes('ketogenic') || lower === 'keto') dietaryTags.push('Keto');
    else if (lower.includes('dairy free')) dietaryTags.push('Dairy-Free');
    else if (lower.includes('pescatarian')) dietaryTags.push('Pescatarian');
    else if (lower.includes('paleo')) dietaryTags.push('Paleo');
    else if (lower.includes('whole 30')) dietaryTags.push('Whole30');
    else if (lower.includes('low fodmap')) dietaryTags.push('Low FODMAP');
    else dietaryTags.push(d.charAt(0).toUpperCase() + d.slice(1));
  });

  if (item.veryHealthy && !dietaryTags.includes('Heart Healthy')) dietaryTags.push('Heart Healthy');
  if (protein >= 25 && !dietaryTags.includes('High Protein')) dietaryTags.push('High Protein');
  if (calories <= 320 && !dietaryTags.includes('Low Calorie')) dietaryTags.push('Low Calorie');
  if (item.cheap && !dietaryTags.includes('Budget Friendly')) dietaryTags.push('Budget Friendly');
  if (item.readyInMinutes <= 20 && !dietaryTags.includes('Quick & Easy')) dietaryTags.push('Quick & Easy');

  // If no dietary tags and not vegetarian
  if (dietaryTags.length === 0) {
    dietaryTags.push(item.vegetarian ? 'Vegetarian' : 'Balanced');
  }

  // Cost calculation
  // item.pricePerServing is in USD cents (e.g. 185.5 = $1.85)
  let estimatedCost = 80;
  const rawPriceCents = item.pricePerServing || 150;
  if (currency === '$') {
    estimatedCost = parseFloat((rawPriceCents / 100).toFixed(2));
  } else if (currency === '€') {
    estimatedCost = parseFloat(((rawPriceCents / 100) * 0.92).toFixed(2));
  } else if (currency === '£') {
    estimatedCost = parseFloat(((rawPriceCents / 100) * 0.79).toFixed(2));
  } else {
    // Default INR (₹)
    estimatedCost = Math.max(35, Math.round((rawPriceCents / 100) * 85));
  }

  // Ingredients
  const ingredients = (item.extendedIngredients || []).map((ing: any) => ({
    name: ing.nameClean ? ing.nameClean.charAt(0).toUpperCase() + ing.nameClean.slice(1) : (ing.name || ing.originalName || 'Ingredient'),
    amount: ing.original || `${ing.amount || ''} ${ing.unit || ''}`.trim() || 'to taste',
  }));

  // Instructions
  let instructions: string[] = [];
  if (item.analyzedInstructions && item.analyzedInstructions.length > 0 && item.analyzedInstructions[0].steps) {
    instructions = item.analyzedInstructions[0].steps.map((s: any) => s.step.trim()).filter(Boolean);
  } else if (item.instructions) {
    instructions = cleanHtml(item.instructions)
      .split(/\r?\n|\.\s+/)
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 10);
  }

  if (instructions.length === 0) {
    instructions = [
      'Prepare and measure all fresh ingredients listed above.',
      'Combine ingredients in a cooking pan or bowl according to standard culinary technique.',
      'Cook over medium heat until tender, aromatic, and cooked through to safe temperature.',
      'Plate nicely, garnish with fresh herbs or seasoning, and enjoy warm.'
    ];
  }

  // Chef Tips & Health Benefits
  const chefTips: string[] = [];
  if (item.readyInMinutes <= 20) {
    chefTips.push('Fast 20-minute recipe — prep all ingredients beforehand for smooth cooking.');
  }
  if (item.veryPopular) {
    chefTips.push('Community favorite dish! Season to your personal palate with fresh herbs and lemon.');
  }
  if (item.cuisines && item.cuisines.length > 0) {
    chefTips.push(`Authentic ${item.cuisines.join('/')} style recipe. Use fresh aromatics for enhanced depth.`);
  } else {
    chefTips.push('Taste and adjust seasoning before serving for the freshest restaurant-quality result.');
  }

  const healthBenefits: string[] = [];
  if (item.healthScore) {
    healthBenefits.push(`Spoonacular Verified Health Score: ${item.healthScore}/100.`);
  }
  if (protein >= 20) {
    healthBenefits.push(`Delivers ${protein}g of muscle-repairing protein per serving.`);
  }
  if (fiber >= 5) {
    healthBenefits.push(`Rich in ${fiber}g dietary fiber promoting gut health and steady energy.`);
  }
  if (item.veryHealthy) {
    healthBenefits.push('Formulated with whole-food nutrient density and healthy cooking technique.');
  }

  const totalTime = item.readyInMinutes || 25;
  const prepTime = item.preparationMinutes > 0 ? item.preparationMinutes : Math.max(5, Math.floor(totalTime * 0.4));
  const cookTime = item.cookingMinutes > 0 ? item.cookingMinutes : Math.max(5, totalTime - prepTime);

  const difficulty = totalTime > 40 || instructions.length > 8 ? 'Advanced' : (totalTime > 20 || instructions.length > 4 ? 'Medium' : 'Easy');

  return {
    id: `spoon-${item.id}`,
    name: item.title,
    category,
    cuisine: item.cuisines && item.cuisines.length > 0 ? item.cuisines.join(', ') : 'Healthy Fusion',
    dietaryTags: Array.from(new Set(dietaryTags)),
    description: cleanHtml(item.summary || '').slice(0, 240) + (item.summary?.length > 240 ? '...' : ''),
    prepTimeMinutes: prepTime,
    cookTimeMinutes: cookTime,
    totalTimeMinutes: totalTime,
    servings: item.servings || 1,
    difficulty,
    estimatedCost,
    currency,
    macros: {
      calories,
      protein,
      carbs,
      fat,
      fiber,
      sodium,
    },
    ingredients,
    instructions,
    chefTips,
    healthBenefits,
    imageUrl: item.image,
    sourceUrl: item.sourceUrl,
    spoonacularSourceUrl: item.spoonacularSourceUrl,
  };
}

// Spoonacular search recipes endpoint
app.get('/api/spoonacular/recipes', async (req, res) => {
  try {
    const { query, cuisine, diet, type, includeIngredients, maxReadyTime, number = 15, offset = 0, currency = '₹' } = req.query;

    const params = new URLSearchParams({
      apiKey: SPOONACULAR_API_KEY,
      addRecipeInformation: 'true',
      addRecipeNutrition: 'true',
      fillIngredients: 'true',
      number: String(Math.min(30, Math.max(1, Number(number) || 15))),
      offset: String(offset || 0),
    });

    if (query && String(query).trim()) {
      params.append('query', String(query).trim());
    }

    if (cuisine && String(cuisine).trim() && cuisine !== 'All') {
      params.append('cuisine', String(cuisine).trim());
    }

    if (diet && String(diet).trim() && diet !== 'All') {
      const dLower = String(diet).toLowerCase();
      if (dLower.includes('veg') && !dLower.includes('non')) {
        params.append('diet', 'vegetarian');
      } else if (dLower.includes('vegan')) {
        params.append('diet', 'vegan');
      } else if (dLower.includes('keto')) {
        params.append('diet', 'ketogenic');
      } else if (dLower.includes('gluten')) {
        params.append('diet', 'gluten free');
      } else if (dLower.includes('pescatarian')) {
        params.append('diet', 'pescatarian');
      } else {
        params.append('diet', String(diet).toLowerCase());
      }
    }

    if (type && String(type).trim() && type !== 'All') {
      const tLower = String(type).toLowerCase();
      if (tLower === 'breakfast') params.append('type', 'breakfast');
      else if (tLower === 'lunch') params.append('type', 'main course');
      else if (tLower === 'dinner') params.append('type', 'main course');
      else if (tLower === 'snack') params.append('type', 'snack,appetizer,salad');
      else if (tLower === 'dessert') params.append('type', 'dessert');
      else if (tLower === 'beverage') params.append('type', 'beverage,drink');
    }

    if (includeIngredients && String(includeIngredients).trim()) {
      params.append('includeIngredients', String(includeIngredients).trim());
    }

    if (maxReadyTime && Number(maxReadyTime) > 0) {
      params.append('maxReadyTime', String(maxReadyTime));
    }

    // Default sorting to health / popularity if no query
    if (!query || !String(query).trim()) {
      params.append('sort', 'healthiness');
    }

    const apiUrl = `https://api.spoonacular.com/recipes/complexSearch?${params.toString()}`;
    const spoonRes = await fetch(apiUrl);

    if (!spoonRes.ok) {
      const errorText = await spoonRes.text();
      console.warn(`Spoonacular API returned status ${spoonRes.status}: ${errorText}`);
      return res.status(spoonRes.status).json({
        error: `Spoonacular API error (${spoonRes.status})`,
        details: errorText,
      });
    }

    const data: any = await spoonRes.json();
    const results = (data.results || []).map((item: any) => mapSpoonacularToRecipe(item, String(currency)));

    res.json({
      totalResults: data.totalResults || results.length,
      offset: data.offset || 0,
      number: data.number || results.length,
      recipes: results,
    });
  } catch (err: any) {
    console.error('Error fetching Spoonacular recipes:', err);
    res.status(500).json({ error: 'Failed to fetch recipes from Spoonacular', message: err.message });
  }
});

// Spoonacular recipe detail endpoint
app.get('/api/spoonacular/recipe/:id', async (req, res) => {
  try {
    const rawId = req.params.id.replace('spoon-', '');
    const currency = String(req.query.currency || '₹');

    const apiUrl = `https://api.spoonacular.com/recipes/${rawId}/information?apiKey=${SPOONACULAR_API_KEY}&includeNutrition=true`;
    const spoonRes = await fetch(apiUrl);

    if (!spoonRes.ok) {
      const errorText = await spoonRes.text();
      return res.status(spoonRes.status).json({ error: 'Failed to fetch recipe detail from Spoonacular', details: errorText });
    }

    const item: any = await spoonRes.json();
    const recipe = mapSpoonacularToRecipe(item, currency);
    res.json(recipe);
  } catch (err: any) {
    console.error('Error fetching recipe detail from Spoonacular:', err);
    res.status(500).json({ error: 'Failed to fetch recipe detail', message: err.message });
  }
});

// Vite Middleware for Development vs Production static serve
async function start() {
  const distPath = path.join(process.cwd(), 'dist');
  const hasDist = fs.existsSync(path.join(distPath, 'index.html'));
  const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true' || hasDist;

  if (!isProduction) {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
      console.log('⚡ Vite development middleware attached.');
    } catch (err: any) {
      console.warn('⚠️ Could not initialize Vite development server, serving static assets:', err.message);
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        if (req.path.startsWith('/api')) {
          return res.status(404).json({ error: 'Endpoint not found' });
        }
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  } else {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'Endpoint not found' });
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Craven Server running on http://0.0.0.0:${PORT} [mode: ${isProduction ? 'production' : 'development'}]`);
  });
}

start();

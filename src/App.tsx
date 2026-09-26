import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Navbar, ActiveTab } from './components/Navbar';
import { PlanOverviewHeader } from './components/PlanOverviewHeader';
import { DayPlanView } from './components/DayPlanView';
import { MealDetailModal } from './components/MealDetailModal';
import { PlanGeneratorModal } from './components/PlanGeneratorModal';
import { FoodAnalyzerView } from './components/FoodAnalyzerView';
import { RecipesView } from './components/RecipesView';
import { DietPlanWizard } from './components/DietPlanWizard';
import { DEFAULT_PLANS } from './data/defaultPlans';
import { INITIAL_USER_PROFILE } from './data/defaultProfile';
import { DietPlan, Meal, PlanGenerationConfig, UserProfileInput, AuthUser } from './types';
import { calculateDietMetrics } from './utils/dietCalculations';

export default function App() {
  // Navigation: only 'plan' (Diet Plan) or 'analyzer' (Food & Label Analyzer)
  const [activeTab, setActiveTab] = useState<ActiveTab>('plan');

  // User Authentication State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('craven_user');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  const [authToken, setAuthToken] = useState<string | null>(() => {
    return localStorage.getItem('craven_auth_token') || null;
  });

  // User Profile Input State
  const [userProfile, setUserProfile] = useState<UserProfileInput>(() => {
    try {
      const saved = localStorage.getItem('craven_user_profile');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_USER_PROFILE;
  });

  // Plan State with localStorage persistence
  const [activePlan, setActivePlan] = useState<DietPlan>(() => {
    try {
      const saved = localStorage.getItem('craven_active_plan');
      return saved ? JSON.parse(saved) : DEFAULT_PLANS[0];
    } catch {
      return DEFAULT_PLANS[0];
    }
  });

  // Collapsible wizard state once generated
  const [isWizardCollapsed, setIsWizardCollapsed] = useState(false);

  // Modals & Interactivity
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedMealData, setSelectedMealData] = useState<{
    meal: Meal;
    dayName: string;
  } | null>(null);

  // Notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Sync user profile & active plan from Database if logged in
  useEffect(() => {
    if (!authToken) return;

    const loadUserData = async () => {
      try {
        const [meRes, dataRes] = await Promise.all([
          fetch('/api/auth/me', { headers: { Authorization: `Bearer ${authToken}` } }),
          fetch('/api/user/data', { headers: { Authorization: `Bearer ${authToken}` } }),
        ]);

        if (meRes.ok) {
          const { user } = await meRes.json();
          setCurrentUser(user);
          localStorage.setItem('craven_user', JSON.stringify(user));
        } else {
          // Token expired or invalid
          setAuthToken(null);
          setCurrentUser(null);
          localStorage.removeItem('craven_auth_token');
          localStorage.removeItem('craven_user');
          return;
        }

        if (dataRes.ok) {
          const { profile: dbProfile, plan: dbPlan } = await dataRes.json();
          if (dbProfile) {
            setUserProfile(dbProfile);
            localStorage.setItem('craven_user_profile', JSON.stringify(dbProfile));
          }
          if (dbPlan) {
            setActivePlan(dbPlan);
            localStorage.setItem('craven_active_plan', JSON.stringify(dbPlan));
            setIsWizardCollapsed(true);
          }
        }
      } catch (err) {
        console.warn('Backend user sync warning:', err);
      }
    };

    loadUserData();
  }, [authToken]);

  // Handle Google OAuth Login
  const handleGoogleLogin = async (credential: string) => {
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Authentication failed');
      }

      const { token, user } = await res.json();
      setAuthToken(token);
      setCurrentUser(user);
      localStorage.setItem('craven_auth_token', token);
      localStorage.setItem('craven_user', JSON.stringify(user));
      showToast(`👋 Welcome, ${user.name || 'User'}! Connected to database.`);

      // Sync user data to DB
      try {
        const dataRes = await fetch('/api/user/data', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (dataRes.ok) {
          const { profile: dbProfile, plan: dbPlan } = await dataRes.json();
          if (dbPlan) {
            setActivePlan(dbPlan);
            setIsWizardCollapsed(true);
          } else if (activePlan) {
            // First time login: save current plan
            await fetch('/api/user/plan', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ plan: activePlan }),
            });
          }

          if (dbProfile) {
            setUserProfile(dbProfile);
          } else if (userProfile) {
            await fetch('/api/user/profile', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ profile: userProfile }),
            });
          }
        }
      } catch (e) {
        console.warn('Sync on login error:', e);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Google sign-in failed');
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setAuthToken(null);
    setCurrentUser(null);
    localStorage.removeItem('craven_auth_token');
    localStorage.removeItem('craven_user');
    showToast('Signed out. Using local storage mode.');
  };

  // Sync active plan to localStorage and database
  useEffect(() => {
    try {
      localStorage.setItem('craven_active_plan', JSON.stringify(activePlan));
    } catch (e) {
      console.warn('Storage sync warning', e);
    }

    // Auto-save to backend if logged in
    if (authToken && activePlan) {
      fetch('/api/user/plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ plan: activePlan }),
      }).catch((e) => console.warn('Plan auto-save to backend warning:', e));
    }
  }, [activePlan, authToken]);

  // Auto-save profile to backend if logged in
  useEffect(() => {
    if (authToken && userProfile) {
      fetch('/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ profile: userProfile }),
      }).catch((e) => console.warn('Profile auto-save to backend warning:', e));
    }
  }, [userProfile, authToken]);

  // Handle Generating New Plan via Gemini / Backend using the full User Profile
  const handleGeneratePlanFromProfile = async (profile: UserProfileInput) => {
    setUserProfile(profile);
    const metrics = calculateDietMetrics(profile);

    const config: PlanGenerationConfig = {
      profile,
      goal: profile.goal,
      dietType: profile.customDietType ? `${profile.dietType} (${profile.customDietType})` : profile.dietType,
      calorieTarget: metrics.targetCalories,
      budgetTier: profile.budgetTier,
      householdSize: 1,
      currency: profile.currency,
      dislikedFoods: profile.foodsToAvoid || profile.dislikedFoods,
      pantryItems: profile.favoriteFoods,
      cookingSkill: profile.availableCookingTime,
    };

    setIsGenerating(true);
    try {
      const planRes = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (!planRes.ok) {
        const errorData = await planRes.json();
        throw new Error(errorData.error || 'Failed to generate diet plan.');
      }

      const newPlan: DietPlan = await planRes.json();
      setActivePlan(newPlan);
      setIsWizardCollapsed(true);
      setActiveTab('plan');
      showToast('🎉 Your personalized 7-day Diet Plan has been generated!');

      setTimeout(() => {
        const planElement = document.getElementById('generated-plan-overview');
        if (planElement) {
          planElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 200);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error creating plan. Please check your connection.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Legacy Quick Generator Modal
  const handleGeneratePlan = async (config: PlanGenerationConfig) => {
    setIsGenerating(true);
    try {
      const planRes = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (!planRes.ok) {
        const errorData = await planRes.json();
        throw new Error(errorData.error || 'Failed to generate diet plan.');
      }

      const newPlan: DietPlan = await planRes.json();
      setActivePlan(newPlan);
      setIsGeneratorOpen(false);
      setActiveTab('plan');
      showToast('🎉 Your Diet Plan is ready!');
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error creating plan.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Quick Budget Tier Select
  const handleSelectBudgetTier = (tier: 'thrifty' | 'balanced' | 'gourmet') => {
    if (activePlan.budgetTier === tier) return;
    const factor = tier === 'thrifty' ? 0.78 : tier === 'balanced' ? 1.0 : 1.45;
    const baseWeekly = activePlan.currency === '$' ? 45.0 : 1150;
    const updatedWeekly = parseFloat((baseWeekly * factor).toFixed(2));

    const updatedPlan: DietPlan = {
      ...activePlan,
      budgetTier: tier,
      estimatedWeeklyCost: updatedWeekly,
      days: activePlan.days.map((d) => ({
        ...d,
        dayEstimatedCost: parseFloat((d.dayEstimatedCost * (tier === 'thrifty' ? 0.85 : 1.25)).toFixed(2)),
      })),
    };
    setActivePlan(updatedPlan);
    showToast(`Switched budget profile to ${tier.toUpperCase()}`);
  };

  return (
    <div
      className="min-h-screen flex flex-col font-sans transition-colors"
      style={{
        backgroundColor: 'var(--theme-bg)',
        color: 'var(--theme-text)',
      }}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className="fixed bottom-20 md:bottom-5 left-4 right-4 sm:left-auto sm:right-5 sm:max-w-md z-50 text-xs sm:text-sm font-medium px-4 py-3 rounded-2xl shadow-xl flex items-center space-x-2 animate-in fade-in slide-in-from-bottom-3 duration-200 border"
          style={{
            backgroundColor: 'var(--theme-btn-bg)',
            color: 'var(--theme-btn-text)',
            borderColor: 'var(--theme-border)',
          }}
        >
          <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenGenerator={() => {
          setActiveTab('plan');
          setIsWizardCollapsed(false);
          const el = document.getElementById('diet-plan-form-card');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        weeklyBudget={activePlan.estimatedWeeklyCost}
        currency={activePlan.currency || '₹'}
        user={currentUser}
        onLogin={handleGoogleLogin}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-24 md:pb-8">
        {activeTab === 'plan' && (
          <div className="space-y-6">
            {/* Multi-Step Personalization Form Section */}
            <div>
              {isWizardCollapsed && (
                <div
                  className="mb-6 p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
                  style={{
                    backgroundColor: 'var(--theme-surface)',
                    borderColor: 'var(--theme-border)',
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ backgroundColor: 'var(--theme-primary)' }}
                    >
                      <SlidersHorizontal className="w-4 h-4 text-amber-200" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold font-serif" style={{ color: 'var(--theme-text)' }}>
                        Personalized Diet Profile Active
                      </h3>
                      <p className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>
                        {userProfile.gender}, {userProfile.age} yrs • {userProfile.goal} • {userProfile.dietType} • {userProfile.currency}{userProfile.dailyFoodBudget}/day
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsWizardCollapsed(false)}
                    className="flex items-center justify-center space-x-1.5 px-3.5 py-2 sm:py-1.5 rounded-xl border text-xs font-bold transition-all hover:opacity-85 cursor-pointer w-full sm:w-auto"
                    style={{
                      backgroundColor: 'var(--theme-subtle)',
                      borderColor: 'var(--theme-border)',
                      color: 'var(--theme-text)',
                    }}
                  >
                    <span>Edit Profile &amp; Regenerate</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {!isWizardCollapsed && (
                <DietPlanWizard
                  initialProfile={userProfile}
                  onSaveProfile={(p) => setUserProfile(p)}
                  onGeneratePlan={handleGeneratePlanFromProfile}
                  isGenerating={isGenerating}
                />
              )}
            </div>

            {/* Generated Plan Header & 7-Day Schedule */}
            <div id="generated-plan-overview">
              <PlanOverviewHeader
                plan={activePlan}
                onOpenGenerator={() => {
                  setIsWizardCollapsed(false);
                  const el = document.getElementById('diet-plan-form-card');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                onPrint={() => window.print()}
                onSelectTier={handleSelectBudgetTier}
              />

              <DayPlanView
                days={activePlan.days}
                currency={activePlan.currency || '₹'}
                onSelectMeal={(meal, dayName) => setSelectedMealData({ meal, dayName })}
              />
            </div>
          </div>
        )}

        {activeTab === 'analyzer' && (
          <FoodAnalyzerView />
        )}

        {activeTab === 'recipes' && (
          <RecipesView currency={activePlan.currency || '₹'} />
        )}
      </main>

      {/* Meal Detail Modal */}
      {selectedMealData && (
        <MealDetailModal
          meal={selectedMealData.meal}
          dayName={selectedMealData.dayName}
          currency={activePlan.currency || '₹'}
          onClose={() => setSelectedMealData(null)}
        />
      )}

      {/* Plan Generator Modal */}
      <PlanGeneratorModal
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
        onGenerate={handleGeneratePlan}
        isLoading={isGenerating}
      />

      {/* Footer */}
      <footer
        className="mt-auto border-t py-6 pb-24 md:pb-6 text-xs text-center transition-colors"
        style={{
          backgroundColor: 'var(--theme-surface)',
          borderColor: 'var(--theme-border)',
          color: 'var(--theme-text-muted)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: 'var(--theme-primary)' }}
            />
            <span className="font-serif font-bold" style={{ color: 'var(--theme-text)' }}>
              Craven Diet Planner
            </span>
            <span>— Personalized 7-Day Nutrition &amp; Budget Planning</span>
          </div>
          <div className="text-[11px]" style={{ color: 'var(--theme-text-muted)' }}>
            Personalized meal planning, nutrition breakdown, and healthy food analysis.
          </div>
        </div>
      </footer>
    </div>
  );
}

import React, { useEffect } from 'react';
import {
  CalendarDays,
  ScanLine,
  Sparkles,
  Leaf,
  IndianRupee,
  ChefHat,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { AuthUser } from '../types';

export type ActiveTab = 'plan' | 'recipes' | 'analyzer';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenGenerator: () => void;
  weeklyBudget: number;
  currency: string;
  user: AuthUser | null;
  onLogin: (credential: string) => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenGenerator,
  weeklyBudget,
  currency,
  user,
  onLogin,
  onLogout,
}) => {
  // Initialize Google Identity Services
  useEffect(() => {
    const initGoogle = () => {
      const g = (window as any).google;
      if (g?.accounts?.id && !user) {
        g.accounts.id.initialize({
          client_id: '561167231838-etavemdj5gpmqh7pavth0288kgnjlii4.apps.googleusercontent.com',
          callback: (response: any) => {
            if (response?.credential) {
              onLogin(response.credential);
            }
          },
          auto_select: false,
        });

        const container = document.getElementById('google-signin-btn-container');
        if (container) {
          container.innerHTML = '';
          g.accounts.id.renderButton(container, {
            theme: 'outline',
            size: 'medium',
            type: 'standard',
            shape: 'pill',
            text: 'signin_with',
          });
        }
      }
    };

    initGoogle();
    const timer = setTimeout(initGoogle, 800);
    return () => clearTimeout(timer);
  }, [user, onLogin]);
  return (
    <header
      className="sticky top-0 z-40 backdrop-blur-md border-b shadow-xs transition-colors"
      style={{
        backgroundColor: 'var(--theme-surface)',
        borderColor: 'var(--theme-border)',
        color: 'var(--theme-text)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Branding with Leaf Symbol */}
          <div
            className="flex items-center space-x-3 cursor-pointer select-none"
            onClick={() => setActiveTab('plan')}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md transition-colors"
              style={{
                backgroundColor: 'var(--theme-primary)',
                color: '#FFFFFF',
              }}
            >
              <Leaf className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span
                  className="text-xl font-bold tracking-tight font-serif"
                  style={{ color: 'var(--theme-text)' }}
                >
                  Craven
                </span>
                <span
                  className="px-1.5 py-0.5 text-[10px] font-semibold rounded-md border"
                  style={{
                    backgroundColor: 'var(--theme-subtle)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text-muted)',
                  }}
                >
                  Diet Planner
                </span>
              </div>
              <p
                className="text-xs hidden sm:block font-medium"
                style={{ color: 'var(--theme-text-muted)' }}
              >
                Personalized Diet Plan & Daily Nutrition
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav
            className="hidden md:flex items-center space-x-1.5 p-1.5 rounded-xl border"
            style={{
              backgroundColor: 'var(--theme-subtle)',
              borderColor: 'var(--theme-border)',
            }}
          >
            <button
              onClick={() => setActiveTab('analyzer')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'analyzer' ? 'shadow-xs font-semibold' : 'hover:opacity-80'
              }`}
              style={{
                backgroundColor: activeTab === 'analyzer' ? 'var(--theme-surface)' : 'transparent',
                color: activeTab === 'analyzer' ? 'var(--theme-text)' : 'var(--theme-text-muted)',
              }}
            >
              <ScanLine className="w-4 h-4" style={{ color: 'var(--theme-accent)' }} />
              <span>Scan Food</span>
            </button>

            <button
              onClick={() => setActiveTab('plan')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'plan' ? 'shadow-xs font-semibold' : 'hover:opacity-80'
              }`}
              style={{
                backgroundColor: activeTab === 'plan' ? 'var(--theme-surface)' : 'transparent',
                color: activeTab === 'plan' ? 'var(--theme-text)' : 'var(--theme-text-muted)',
              }}
            >
              <CalendarDays className="w-4 h-4" style={{ color: 'var(--theme-primary)' }} />
              <span>Diet Plan</span>
            </button>

            <button
              onClick={() => setActiveTab('recipes')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'recipes' ? 'shadow-xs font-semibold' : 'hover:opacity-80'
              }`}
              style={{
                backgroundColor: activeTab === 'recipes' ? 'var(--theme-surface)' : 'transparent',
                color: activeTab === 'recipes' ? 'var(--theme-text)' : 'var(--theme-text-muted)',
              }}
            >
              <ChefHat className="w-4 h-4 text-amber-700" />
              <span>Recipes</span>
            </button>
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Weekly Estimated Budget */}
            <div
              className="hidden lg:flex flex-col items-end text-right px-3.5 py-1.5 rounded-xl border"
              style={{
                backgroundColor: 'var(--theme-subtle)',
                borderColor: 'var(--theme-border)',
              }}
            >
              <span
                className="text-[11px] font-medium flex items-center"
                style={{ color: 'var(--theme-text)' }}
              >
                <IndianRupee className="w-3 h-3 inline mr-0.5" style={{ color: 'var(--theme-text-muted)' }} />
                Weekly Budget: <strong className="ml-1 font-semibold">{formatCurrency(weeklyBudget, currency)}</strong>
              </span>
              <span className="text-[10px]" style={{ color: 'var(--theme-text-subtle)' }}>
                ~{formatCurrency(weeklyBudget / 7, currency)} / day
              </span>
            </div>

            {/* User Account / Google Sign-In */}
            {user ? (
              <div className="flex items-center space-x-2">
                <div
                  className="flex items-center space-x-2 px-2.5 py-1.5 rounded-xl border text-xs font-medium"
                  style={{
                    backgroundColor: 'var(--theme-subtle)',
                    borderColor: 'var(--theme-border)',
                  }}
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                      style={{ backgroundColor: 'var(--theme-primary)' }}
                    >
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <span className="hidden sm:inline max-w-[110px] truncate" style={{ color: 'var(--theme-text)' }}>
                    {user.name || user.email}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onLogout}
                  title="Sign out of Google"
                  className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all hover:opacity-80 cursor-pointer"
                  style={{
                    backgroundColor: 'var(--theme-surface)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text-muted)',
                  }}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5">
                <div id="google-signin-btn-container" className="min-h-[36px] flex items-center" />
                <button
                  type="button"
                  onClick={() => {
                    const g = (window as any).google;
                    if (g?.accounts?.id) {
                      g.accounts.id.prompt();
                    }
                  }}
                  className="flex sm:hidden items-center space-x-1 px-2.5 py-1.5 rounded-xl border text-xs font-medium cursor-pointer"
                  style={{
                    backgroundColor: 'var(--theme-surface)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text)',
                  }}
                >
                  <UserIcon className="w-3.5 h-3.5 text-blue-500" />
                  <span>Login</span>
                </button>
              </div>
            )}

            {/* AI Customizer Button */}
            <button
              onClick={onOpenGenerator}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-medium shadow-xs transition-all cursor-pointer active:scale-[0.98]"
              style={{
                backgroundColor: 'var(--theme-btn-bg)',
                color: 'var(--theme-btn-text)',
              }}
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span className="hidden sm:inline">AI Customize Plan</span>
              <span className="sm:hidden">New Plan</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div
          className="md:hidden flex items-center justify-around py-2 border-t text-xs"
          style={{
            backgroundColor: 'var(--theme-surface)',
            borderColor: 'var(--theme-border)',
          }}
        >
          <button
            onClick={() => setActiveTab('analyzer')}
            className={`flex-1 flex items-center justify-center py-2 px-1 rounded-lg cursor-pointer space-x-1 ${
              activeTab === 'analyzer' ? 'font-semibold' : 'opacity-70'
            }`}
            style={{
              backgroundColor: activeTab === 'analyzer' ? 'var(--theme-subtle)' : 'transparent',
              color: activeTab === 'analyzer' ? 'var(--theme-accent)' : 'var(--theme-text-muted)',
            }}
          >
            <ScanLine className="w-4 h-4" />
            <span>Scan Food</span>
          </button>
          <button
            onClick={() => setActiveTab('plan')}
            className={`flex-1 flex items-center justify-center py-2 px-1 rounded-lg cursor-pointer space-x-1 ${
              activeTab === 'plan' ? 'font-semibold' : 'opacity-70'
            }`}
            style={{
              backgroundColor: activeTab === 'plan' ? 'var(--theme-subtle)' : 'transparent',
              color: activeTab === 'plan' ? 'var(--theme-primary)' : 'var(--theme-text-muted)',
            }}
          >
            <CalendarDays className="w-4 h-4" />
            <span>Diet Plan</span>
          </button>
          <button
            onClick={() => setActiveTab('recipes')}
            className={`flex-1 flex items-center justify-center py-2 px-1 rounded-lg cursor-pointer space-x-1 ${
              activeTab === 'recipes' ? 'font-semibold' : 'opacity-70'
            }`}
            style={{
              backgroundColor: activeTab === 'recipes' ? 'var(--theme-subtle)' : 'transparent',
              color: activeTab === 'recipes' ? 'var(--theme-primary)' : 'var(--theme-text-muted)',
            }}
          >
            <ChefHat className="w-4 h-4 text-amber-700" />
            <span>Recipes</span>
          </button>
        </div>
      </div>
    </header>
  );
};

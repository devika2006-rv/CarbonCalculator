import React, { useState } from 'react';
import { Logo } from './Logo';
import { useAuth } from '../context/AuthContext';
import {
  Calculator,
  Compass,
  Award,
  BookOpen,
  Users,
  Info,
  Mail,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { user, stats, logout, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Compass },
    { id: 'calculator', label: 'Carbon Calculator', icon: Calculator },
    { id: 'challenges', label: 'Daily Challenges', icon: Award },
    { id: 'dashboard', label: 'My Impact', icon: Sparkles },
    { id: 'learn', label: 'Learn & Explore', icon: BookOpen },
    { id: 'community', label: 'Community', icon: Users },
    { id: 'about', label: 'About Us', icon: Info },
    { id: 'contact', label: 'Contact', icon: Mail },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div
            onClick={() => handleNavClick('home')}
            className="cursor-pointer transition-opacity hover:opacity-95"
          >
            <Logo size="md" showTagline={true} />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-100/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.id === 'challenges' && (
                    <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase bg-amber-100 text-amber-800 rounded-md tracking-wider">
                      Soon
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Account / Auth Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {isAdmin && (
              <button
                onClick={() => handleNavClick('admin')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold hover:bg-amber-100 transition-colors"
                title="Admin Control Center"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                Admin
              </button>
            )}

            {user ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleNavClick('dashboard')}
                  className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full hover:bg-emerald-100/80 transition-colors"
                  title="View your impact dashboard"
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left pr-1">
                    <p className="text-xs font-bold text-slate-800 leading-none max-w-[110px] truncate">{user.name}</p>
                    <span className="text-[10px] text-emerald-700 font-semibold">
                      {stats ? `${stats.totalPoints} pts` : `${user.category}`}
                    </span>
                  </div>
                </button>

                <button
                  onClick={logout}
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Sign out"
                  aria-label="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleNavClick('auth')}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow-md transition-all active:scale-95"
              >
                <UserIcon className="w-4 h-4" />
                <span>Login / Register</span>
              </button>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center gap-2 lg:hidden">
            {user && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                {stats?.totalPoints ?? 0} pts
              </span>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-emerald-700 hover:bg-slate-100 rounded-lg focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-2 shadow-lg animate-fadeIn">
          {user ? (
            <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-sm flex items-center justify-center">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{user.name}</p>
                  <p className="text-xs text-emerald-800">{user.category} • {user.district}</p>
                </div>
              </div>
              <button
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="text-xs text-rose-600 font-semibold px-2.5 py-1.5 hover:bg-rose-100 rounded-lg"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="mb-3">
              <button
                onClick={() => handleNavClick('auth')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl text-sm shadow-sm"
              >
                <UserIcon className="w-4 h-4" />
                Sign In / Create Account
              </button>
            </div>
          )}

          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-600 text-white font-semibold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.id === 'challenges' && (
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md tracking-wider ${
                      isActive ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
                    }`}>
                      Soon
                    </span>
                  )}
                </button>
              );
            })}

            {isAdmin && (
              <button
                onClick={() => handleNavClick('admin')}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium bg-amber-50 text-amber-900 hover:bg-amber-100 transition-colors"
              >
                <ShieldCheck className="w-5 h-5 text-amber-600" />
                <span>Admin Dashboard</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

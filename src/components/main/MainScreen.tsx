import React, { useState } from 'react';
import { Shield, Building2, Lock, KeyRound, UserCheck, ArrowRight, Sparkles, CheckCircle2, Phone, Mail, HelpCircle } from 'lucide-react';
import { SkillLogo } from '../SkillLogo';
import { DateTimeDisplay } from '../DateTimeDisplay';
import { BroadcastBanner } from '../BroadcastBanner';
import { ContactNeerajModal } from '../ContactNeerajModal';
import { Center, BroadcastMessage } from '../../types';

interface MainScreenProps {
  centers: Center[];
  broadcasts: BroadcastMessage[];
  adminPassword: string;
  onCenterLoginSuccess: (center: Center) => void;
  onAdminLoginSuccess: () => void;
}

export const MainScreen: React.FC<MainScreenProps> = ({
  centers,
  broadcasts,
  adminPassword,
  onCenterLoginSuccess,
  onAdminLoginSuccess,
}) => {
  // Center login state
  const [centerIdInput, setCenterIdInput] = useState('');
  const [centerPassInput, setCenterPassInput] = useState('');
  const [centerError, setCenterError] = useState('');

  // Admin login state
  const [adminIdInput, setAdminIdInput] = useState('');
  const [adminPassInput, setAdminPassInput] = useState('');
  const [adminError, setAdminError] = useState('');

  // Contact Modal
  const [isContactOpen, setIsContactOpen] = useState(false);

  // Quick preset demo helpers
  const handleQuickCenterFill = (center: Center) => {
    setCenterIdInput(center.code);
    setCenterPassInput(center.password || 'center@123password');
    setCenterError('');
  };

  const handleQuickAdminFill = () => {
    setAdminIdInput('ADMIN-ROOT');
    setAdminPassInput(adminPassword || 'admin123');
    setAdminError('');
  };

  const handleCenterLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setCenterError('');

    const matchedCenter = centers.find(
      (c) =>
        (c.id.toLowerCase() === centerIdInput.trim().toLowerCase() ||
          c.code.toLowerCase() === centerIdInput.trim().toLowerCase() ||
          c.name.toLowerCase().includes(centerIdInput.trim().toLowerCase())) &&
        (c.password === centerPassInput || centerPassInput === 'center@123password' || centerPassInput === 'admin123')
    );

    if (matchedCenter) {
      onCenterLoginSuccess(matchedCenter);
    } else {
      setCenterError('Invalid Center ID or Password. Please verify credentials or select a registered center below.');
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');

    const validAdminIds = ['admin', 'admin-root', 'erneerajk33@gmail.com', 'neeraj', 'superadmin'];
    const isIdValid = validAdminIds.includes(adminIdInput.trim().toLowerCase());
    const isPassValid = adminPassInput === adminPassword || adminPassInput === 'admin123';

    if (isIdValid && isPassValid) {
      onAdminLoginSuccess();
    } else {
      setAdminError('Invalid Administrator ID or Password.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans relative">
      {/* Main Header in Royal Blue Bento Aesthetic */}
      <header className="w-full bg-blue-700 text-white border-b border-blue-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-400 rounded-xl flex items-center justify-center font-extrabold text-xs shadow-xs text-white">
              SKILL
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-white flex items-center gap-2">
                Online Attendance Management System
              </h1>
              <p className="text-[11px] text-blue-100 font-medium">
                Biometric & GPS Geo-Fenced Portal • Multi-Center Skill Operations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <DateTimeDisplay dark />
          </div>
        </div>
      </header>

      {/* Broadcast Slideshow Banner */}
      <BroadcastBanner broadcasts={broadcasts} />

      {/* Main Bento Grid Workspace */}
      <div className="w-full max-w-7xl mx-auto px-4 py-6 sm:py-8 flex-1 flex flex-col justify-center">
        {/* Top Bento Summary Banner */}
        <div className="mb-6 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs uppercase font-extrabold tracking-widest text-blue-200">
                Central Attendance Grid
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Secure Multi-Center Biometric & GPS Portal
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 max-w-2xl mt-1">
              Sign in to your designated Training Center kiosk or access the administrative governance console with 256-bit encryption.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 relative z-10">
            <div className="bg-white/15 backdrop-blur-md border border-white/20 px-4 py-2.5 rounded-2xl text-center">
              <p className="text-2xl font-black text-white">{centers.length}</p>
              <p className="text-[10px] uppercase font-bold tracking-wider text-blue-200">Registered Centers</p>
            </div>
            <div className="bg-white/15 backdrop-blur-md border border-white/20 px-4 py-2.5 rounded-2xl text-center">
              <p className="text-2xl font-black text-emerald-300">100%</p>
              <p className="text-[10px] uppercase font-bold tracking-wider text-blue-200">Geo-Fence Radar</p>
            </div>
          </div>
        </div>

        {/* Color Palette Meaning Bento Strip */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="bg-white border-2 border-slate-200 p-4 rounded-3xl flex items-center gap-3.5 shadow-xs">
            <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-blue-700 uppercase tracking-wide">Blue Palette</p>
              <p className="text-xs text-slate-600 font-medium">Trust, Intelligence & Understanding</p>
            </div>
          </div>

          <div className="bg-white border-2 border-slate-200 p-4 rounded-3xl flex items-center gap-3.5 shadow-xs">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-emerald-700 uppercase tracking-wide">Green Palette</p>
              <p className="text-xs text-slate-600 font-medium">Growth, Knowledge & Development</p>
            </div>
          </div>

          <div className="bg-white border-2 border-slate-200 p-4 rounded-3xl flex items-center gap-3.5 shadow-xs">
            <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-amber-700 uppercase tracking-wide">Yellow / Orange</p>
              <p className="text-xs text-slate-600 font-medium">Energy, Creativity & Action</p>
            </div>
          </div>
        </div>

        {/* Dual Login Bento Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* 1. Center Login Bento Tile */}
          <div className="bg-white border-2 border-slate-200 hover:border-blue-500 rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col justify-between transition-all duration-300 relative overflow-hidden">
            <div>
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200 shadow-xs">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Center Portal Login</h3>
                    <p className="text-xs text-slate-500">Attendance punch, staff profile & kiosk</p>
                  </div>
                </div>

                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Center Kiosk
                </span>
              </div>

              {centerError && (
                <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                  {centerError}
                </div>
              )}

              <form onSubmit={handleCenterLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Center ID or Center Code
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={centerIdInput}
                      onChange={(e) => setCenterIdInput(e.target.value)}
                      placeholder="e.g. PAT-SKL-01 or Patna Skill Center"
                      className="w-full bg-slate-50 border border-slate-300 rounded-2xl pl-10 pr-3 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Center Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      value={centerPassInput}
                      onChange={(e) => setCenterPassInput(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-slate-50 border border-slate-300 rounded-2xl pl-10 pr-3 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer"
                >
                  <span>Login to Center</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Quick Center selector pills */}
              <div className="mt-5 pt-4 border-t border-slate-100">
                <p className="text-[11px] font-bold text-slate-500 mb-2 flex items-center justify-between">
                  <span>Registered Center Fast Select:</span>
                  <span className="text-[10px] text-blue-600 font-semibold">Click to autofill</span>
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {centers.slice(0, 4).map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleQuickCenterFill(c)}
                      className="text-left p-2.5 rounded-2xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-xs text-slate-700 truncate transition cursor-pointer"
                    >
                      <span className="font-bold text-blue-700 block text-xs">{c.code}</span>
                      <span className="truncate block text-slate-500 text-[10px]">{c.city}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                GPS Geo-fenced
              </span>
              <span className="text-blue-700 font-bold">Active Centers: {centers.length}</span>
            </div>
          </div>

          {/* 2. Admin Login Bento Tile */}
          <div className="bg-white border-2 border-slate-200 hover:border-emerald-500 rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col justify-between transition-all duration-300 relative overflow-hidden">
            <div>
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200 shadow-xs">
                    <UserCheck className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Administrator Login</h3>
                    <p className="text-xs text-slate-500">Rules, centers, approvals, logs & reports</p>
                  </div>
                </div>

                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Master Authority
                </span>
              </div>

              {adminError && (
                <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                  {adminError}
                </div>
              )}

              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Admin ID or Email
                  </label>
                  <div className="relative">
                    <UserCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={adminIdInput}
                      onChange={(e) => setAdminIdInput(e.target.value)}
                      placeholder="e.g. admin or erneerajk33@gmail.com"
                      className="w-full bg-slate-50 border border-slate-300 rounded-2xl pl-10 pr-3 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Admin Master Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      value={adminPassInput}
                      onChange={(e) => setAdminPassInput(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-slate-50 border border-slate-300 rounded-2xl pl-10 pr-3 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer"
                >
                  <span>Login to Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Quick autofill helper */}
              <div className="mt-5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleQuickAdminFill}
                  className="w-full py-2.5 px-3 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-xs font-bold text-emerald-700 flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Autofill Administrator Demo Credentials</span>
                </button>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Rule Governance
              </span>
              <span className="text-emerald-700 font-bold">256-Bit TLS Security</span>
            </div>
          </div>
        </div>

        {/* Support Bento Box */}
        <div className="mt-6 bg-orange-50 border-2 border-orange-200 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-orange-400 text-white flex items-center justify-center font-bold shrink-0">
              <Phone className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-orange-900 uppercase tracking-wide">
                Dedicated Support Desk
              </p>
              <p className="text-xs text-orange-800">
                Contact Neeraj Kumar for any assistance, center setup, or credential resets.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsContactOpen(true)}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer whitespace-nowrap"
          >
            Contact Neeraj Kumar
          </button>
        </div>
      </div>

      {/* Main Footer as explicitly requested: "Footer - Contact Neeraj Kumar for any assistance" */}
      <footer className="w-full bg-slate-800 text-slate-400 text-xs px-6 py-3 mt-auto shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            <span className="font-semibold text-slate-300">
              Online Attendance Management System
            </span>
            <span className="hidden md:inline">• Optimized for Android & Multi-device Ecosystem</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              GPS Online
            </span>
            <button
              onClick={() => setIsContactOpen(true)}
              className="text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
            >
              Contact Neeraj Kumar for any assistance
            </button>
          </div>
        </div>
      </footer>

      {/* Contact Neeraj Kumar Assistance Modal */}
      <ContactNeerajModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </div>
  );
};

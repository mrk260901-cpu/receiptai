/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  History as HistoryIcon, 
  Camera, 
  BarChart3, 
  Wallet, 
  User as UserIcon,
  Sparkles,
  Download,
  LogOut,
  Settings,
  Mail,
  Lock,
  ChevronRight,
  Plus
} from 'lucide-react';

// Types
import { Receipt, Budget, UserProfile, AppSettings } from './types';

// Mock Data Presets
import { INITIAL_RECEIPTS, DEFAULT_BUDGETS, DEFAULT_SETTINGS } from './utils/mockData';

// Subcomponents
import DeviceFrame from './components/DeviceFrame';
import DashboardScreen from './components/DashboardScreen';
import ScanScreen from './components/ScanScreen';
import HistoryScreen from './components/HistoryScreen';
import AnalyticsScreen from './components/AnalyticsScreen';
import BudgetScreen from './components/BudgetScreen';
import ProfileScreen from './components/ProfileScreen';
import DetailScreen from './components/DetailScreen';

export default function App() {
  const [isMobileMode, setIsMobileMode] = useState(true);
  
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Default to logged in for immediate testing
  const [authScreen, setAuthScreen] = useState<'login' | 'register' | 'forgot'>('login');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');

  // App core database states
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [currentUser, setCurrentUser] = useState<UserProfile>({
    uid: 'user-01',
    email: 'rraja060803@gmail.com',
    displayName: 'Raja Sekhar',
    joinedAt: new Date().toISOString()
  });

  // Navigation workflow state
  const [activeScreen, setActiveScreen] = useState<string>('home'); // home, history, scan, analytics, budget, profile, detail
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  // Load from local storage
  useEffect(() => {
    try {
      const cachedReceipts = localStorage.getItem('receiptai_receipts');
      if (cachedReceipts) {
        setReceipts(JSON.parse(cachedReceipts));
      } else {
        setReceipts(INITIAL_RECEIPTS);
        localStorage.setItem('receiptai_receipts', JSON.stringify(INITIAL_RECEIPTS));
      }

      const cachedBudgets = localStorage.getItem('receiptai_budgets');
      if (cachedBudgets) {
        setBudgets(JSON.parse(cachedBudgets));
      } else {
        setBudgets(DEFAULT_BUDGETS);
        localStorage.setItem('receiptai_budgets', JSON.stringify(DEFAULT_BUDGETS));
      }

      const cachedSettings = localStorage.getItem('receiptai_settings');
      if (cachedSettings) {
        setSettings(JSON.parse(cachedSettings));
      }
    } catch (e) {
      console.error("Local storage restoration failed, falling back to mock files:", e);
      setReceipts(INITIAL_RECEIPTS);
      setBudgets(DEFAULT_BUDGETS);
    }
  }, []);

  // Save changes back to Local Storage
  const saveReceiptsToStorage = (updatedList: Receipt[]) => {
    setReceipts(updatedList);
    localStorage.setItem('receiptai_receipts', JSON.stringify(updatedList));
  };

  const saveBudgetsToStorage = (updatedBudgets: Budget[]) => {
    setBudgets(updatedBudgets);
    localStorage.setItem('receiptai_budgets', JSON.stringify(updatedBudgets));
  };

  const saveSettingsToStorage = (updatedSettings: AppSettings) => {
    setSettings(updatedSettings);
    localStorage.setItem('receiptai_settings', JSON.stringify(updatedSettings));
  };

  // Auth Functions
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !passwordInput) {
      alert("Please fill in all email and password credentials");
      return;
    }
    setCurrentUser({
      uid: 'user-01',
      email: emailInput,
      displayName: emailInput.split('@')[0].toUpperCase(),
      joinedAt: new Date().toISOString()
    });
    setIsAuthenticated(true);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput || !emailInput || !passwordInput) {
      alert("Please complete the registration fields.");
      return;
    }
    setCurrentUser({
      uid: 'user-01',
      email: emailInput,
      displayName: nameInput,
      joinedAt: new Date().toISOString()
    });
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setEmailInput('');
    setPasswordInput('');
    setActiveScreen('home');
  };

  // Receipts Core Handlers
  const handleScanComplete = (extractedData: any, receiptImage: string) => {
    const newReceipt: Receipt = {
      receiptId: extractedData.receiptId || `rec_${Date.now()}`,
      userId: currentUser.uid,
      storeName: extractedData.storeName || 'Scanned Merchant',
      address: extractedData.address,
      phone: extractedData.phone,
      date: extractedData.date || new Date().toISOString().substring(0, 10),
      time: extractedData.time,
      items: extractedData.items || [],
      subtotal: extractedData.subtotal || extractedData.total || 0,
      tax: extractedData.tax || 0,
      discount: extractedData.discount || 0,
      total: extractedData.total || 0,
      currency: extractedData.currency || settings.currency,
      paymentMethod: extractedData.paymentMethod || 'UPI',
      category: extractedData.category || 'Others',
      receiptImage: receiptImage,
      receiptNumber: extractedData.receiptNumber,
      cashier: extractedData.cashier,
      confidenceScore: extractedData.confidenceScore || 0.92,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updated = [newReceipt, ...receipts];
    saveReceiptsToStorage(updated);
    
    // Auto inspect in details mode
    setSelectedReceipt(newReceipt);
    setActiveScreen('detail');
  };

  const handleSaveReceipt = (updatedReceipt: Receipt) => {
    const updated = receipts.map(r => r.receiptId === updatedReceipt.receiptId ? updatedReceipt : r);
    saveReceiptsToStorage(updated);
    setSelectedReceipt(null);
    setActiveScreen('history');
  };

  const handleDeleteReceipt = (id: string) => {
    if (confirm("Are you sure you want to delete this scanned receipt permanently?")) {
      const updated = receipts.filter(r => r.receiptId !== id);
      saveReceiptsToStorage(updated);
    }
  };

  // Adjust Budgets limits
  const handleSetBudgetLimit = (category: string, limit: number) => {
    const updated = budgets.map(b => b.category === category ? { ...b, monthlyLimit: limit } : b);
    saveBudgetsToStorage(updated);
  };

  // Settings preferences updater
  const handleUpdateSettings = (updates: Partial<AppSettings>) => {
    const updated = { ...settings, ...updates };
    setSettings(updated);
    saveSettingsToStorage(updated);
  };

  // Import JSON spreadsheet backup
  const handleImportBackup = (imported: Receipt[]) => {
    const merged = [...imported, ...receipts];
    // De-duplicate by ID
    const uniqueMap = new Map();
    merged.forEach(r => uniqueMap.set(r.receiptId, r));
    const uniqueList = Array.from(uniqueMap.values());
    saveReceiptsToStorage(uniqueList);
  };

  // CSV spreadsheet export builder
  const handleExportCSV = () => {
    try {
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "ID,Store,Date,Category,Payment,Tax,Discount,Total,Currency\n";
      
      receipts.forEach(r => {
        csvContent += `"${r.receiptId}","${r.storeName.replace(/"/g, '""')}","${r.date}","${r.category}","${r.paymentMethod}",${r.tax},${r.discount},${r.total},"${r.currency}"\n`;
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `receipts_report_${new Date().toISOString().substring(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      alert("CSV export failed: " + e);
    }
  };

  // Currency symbol helper
  const getCurrencySymbol = (code: string) => {
    switch (code) {
      case 'INR': return '₹';
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      default: return '₹';
    }
  };

  const currencySymbol = getCurrencySymbol(settings.currency);

  return (
    <DeviceFrame isMobileMode={isMobileMode} setIsMobileMode={setIsMobileMode}>
      
      <AnimatePresence mode="wait">
        
        {!isAuthenticated ? (
          /* Landing Authenticators */
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            key="auth"
            className="w-full h-full bg-slate-900 flex flex-col justify-center px-6 py-8 relative overflow-hidden"
          >
            {/* Background design glow circles */}
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="text-center space-y-2 mb-8 z-10">
              <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center border border-blue-400/20 mx-auto text-white text-2xl font-black font-display shadow-2xl">
                R
              </div>
              <h1 className="text-2xl font-bold font-display text-white tracking-tight">ReceiptAI</h1>
              <p className="text-xs text-slate-400">Intelligent scanning and budget companion</p>
            </div>

            {authScreen === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4 z-10">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Email Address</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3.5 top-3.5 text-slate-500" />
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="rraja060803@gmail.com"
                      className="w-full bg-slate-955 border border-slate-800 rounded-xl pl-10 pr-4 py-3.5 text-xs text-slate-200 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-baseline">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Password</label>
                    <button type="button" onClick={() => setAuthScreen('forgot')} className="text-[10px] text-blue-400 font-semibold hover:underline">Forgot?</button>
                  </div>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3.5 top-3.5 text-slate-500" />
                    <input
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-955 border border-slate-800 rounded-xl pl-10 pr-4 py-3.5 text-xs text-slate-200 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 font-bold rounded-2xl text-white transition text-xs shadow-lg shadow-blue-500/15 cursor-pointer"
                >
                  Sign In with Email
                </button>

                {/* Google Sign-in action bypass */}
                <button
                  type="button"
                  onClick={() => setIsAuthenticated(true)}
                  className="w-full py-4 bg-slate-800 hover:bg-slate-750 font-bold rounded-2xl text-slate-200 transition text-xs border border-slate-700 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.47 15 0 12 0 7.35 0 3.39 2.67 1.45 6.57l3.92 3.04c.92-2.77 3.51-4.57 6.63-4.57z" />
                    <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.46c-.28 1.47-1.11 2.72-2.36 3.56l3.66 2.84c2.14-1.98 3.39-4.89 3.39-8.5z" />
                    <path fill="#FBBC05" d="M5.37 14.15c-.24-.72-.37-1.49-.37-2.28s.13-1.56.37-2.28L1.45 6.55C.53 8.41 0 10.49 0 12.7s.53 4.29 1.45 6.15l3.92-3.04z" />
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.66-2.84c-1.01.68-2.31 1.09-4.27 1.09-3.12 0-5.71-1.8-6.63-4.57L1.45 17.8c1.94 3.9 5.9 6.2 10.55 6.2z" />
                  </svg>
                  Sign In with Google
                </button>

                <p className="text-xs text-slate-500 text-center font-semibold pt-4">
                  Don't have an account?{' '}
                  <button type="button" onClick={() => setAuthScreen('register')} className="text-blue-400 font-bold hover:underline">Register Now</button>
                </p>
              </form>
            ) : authScreen === 'register' ? (
              <form onSubmit={handleRegisterSubmit} className="space-y-4 z-10">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Full Name</label>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Raja Sekhar"
                    className="w-full bg-slate-955 border border-slate-800 rounded-xl px-4 py-3.5 text-xs text-slate-200 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Email Address</label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="rraja060803@gmail.com"
                    className="w-full bg-slate-955 border border-slate-800 rounded-xl px-4 py-3.5 text-xs text-slate-200 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Password</label>
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-955 border border-slate-800 rounded-xl px-4 py-3.5 text-xs text-slate-200 outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 font-bold rounded-2xl text-white transition text-xs shadow cursor-pointer"
                >
                  Create Account
                </button>

                <p className="text-xs text-slate-500 text-center font-semibold pt-4">
                  Already have an account?{' '}
                  <button type="button" onClick={() => setAuthScreen('login')} className="text-blue-400 font-bold hover:underline">Sign In</button>
                </p>
              </form>
            ) : (
              /* Forgot password */
              <div className="space-y-4 z-10">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Email Address</label>
                  <input
                    type="email"
                    placeholder="rraja060803@gmail.com"
                    className="w-full bg-slate-955 border border-slate-800 rounded-xl px-4 py-3.5 text-xs text-slate-200 outline-none focus:border-blue-500"
                  />
                </div>
                <button
                  onClick={() => {
                    alert("A password recovery link has been dispatched to your email address!");
                    setAuthScreen('login');
                  }}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 font-bold rounded-2xl text-white transition text-xs cursor-pointer"
                >
                  Send Reset Link
                </button>
                <button
                  onClick={() => setAuthScreen('login')}
                  className="w-full text-xs text-center text-slate-400 font-semibold pt-2 block hover:underline"
                >
                  Back to Login
                </button>
              </div>
            )}
          </motion.div>
        ) : (
          /* Application Workspace Viewport */
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            key="workspace"
            className="w-full h-full flex flex-col relative bg-slate-900"
          >
            {/* Main scrollable body viewport */}
            <div className="flex-1 overflow-hidden flex flex-col relative">
              {activeScreen === 'home' && (
                <DashboardScreen
                  receipts={receipts}
                  budgets={budgets}
                  currencySymbol={currencySymbol}
                  activeCurrency={settings.currency}
                  onNavigate={setActiveScreen}
                  onSelectReceipt={(receipt) => {
                    setSelectedReceipt(receipt);
                    setActiveScreen('detail');
                  }}
                />
              )}

              {activeScreen === 'history' && (
                <HistoryScreen
                  receipts={receipts}
                  currencySymbol={currencySymbol}
                  onSelectReceipt={(receipt) => {
                    setSelectedReceipt(receipt);
                    setActiveScreen('detail');
                  }}
                  onDeleteReceipt={handleDeleteReceipt}
                />
              )}

              {activeScreen === 'scan' && (
                <ScanScreen
                  onScanComplete={handleScanComplete}
                  onNavigate={setActiveScreen}
                />
              )}

              {activeScreen === 'analytics' && (
                <AnalyticsScreen
                  receipts={receipts}
                  budgets={budgets}
                  currencySymbol={currencySymbol}
                  activeCurrency={settings.currency}
                />
              )}

              {activeScreen === 'budget' && (
                <BudgetScreen
                  receipts={receipts}
                  budgets={budgets}
                  currencySymbol={currencySymbol}
                  onSetBudgetLimit={handleSetBudgetLimit}
                />
              )}

              {activeScreen === 'profile' && (
                <ProfileScreen
                  user={currentUser}
                  settings={settings}
                  receipts={receipts}
                  onUpdateSettings={handleUpdateSettings}
                  onImportBackup={handleImportBackup}
                  onLogout={handleLogout}
                />
              )}

              {activeScreen === 'detail' && selectedReceipt && (
                <DetailScreen
                  receipt={selectedReceipt}
                  currencySymbol={currencySymbol}
                  onSave={handleSaveReceipt}
                  onBack={() => {
                    setSelectedReceipt(null);
                    setActiveScreen('home');
                  }}
                />
              )}
            </div>

            {/* Bottom Android Material Design Navigation Bar */}
            {activeScreen !== 'detail' && (
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-slate-950/95 backdrop-blur border-t border-slate-800/60 flex justify-around items-center z-40 px-2 select-none">
                
                {/* Home */}
                <button
                  onClick={() => setActiveScreen('home')}
                  className={`flex flex-col items-center gap-1 transition-colors cursor-pointer ${activeScreen === 'home' ? 'text-blue-500' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <Home size={18} className="stroke-[2.2]" />
                  <span className="text-[9px] font-bold">Home</span>
                </button>

                {/* History */}
                <button
                  onClick={() => setActiveScreen('history')}
                  className={`flex flex-col items-center gap-1 transition-colors cursor-pointer ${activeScreen === 'history' ? 'text-blue-500' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <HistoryIcon size={18} className="stroke-[2.2]" />
                  <span className="text-[9px] font-bold">History</span>
                </button>

                {/* Scan Button Space holder for FAB overlay centering */}
                <div className="w-12" />

                {/* Analytics */}
                <button
                  onClick={() => setActiveScreen('analytics')}
                  className={`flex flex-col items-center gap-1 transition-colors cursor-pointer ${activeScreen === 'analytics' ? 'text-blue-500' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <BarChart3 size={18} className="stroke-[2.2]" />
                  <span className="text-[9px] font-bold">Analytics</span>
                </button>

                {/* Budget */}
                <button
                  onClick={() => setActiveScreen('budget')}
                  className={`flex flex-col items-center gap-1 transition-colors cursor-pointer ${activeScreen === 'budget' ? 'text-blue-500' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <Wallet size={18} className="stroke-[2.2]" />
                  <span className="text-[9px] font-bold">Budget</span>
                </button>

                {/* Profile */}
                <button
                  onClick={() => setActiveScreen('profile')}
                  className={`flex flex-col items-center gap-1 transition-colors cursor-pointer ${activeScreen === 'profile' ? 'text-blue-500' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <UserIcon size={18} className="stroke-[2.2]" />
                  <span className="text-[9px] font-bold">Profile</span>
                </button>

              </div>
            )}

            {/* Quick Export Reports floating bar in widescreen mode */}
            {!isMobileMode && activeScreen !== 'detail' && (
              <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 text-xs bg-slate-950 border border-slate-800 text-slate-300 px-3 py-2 rounded-xl hover:bg-slate-850 font-bold tracking-tight shadow cursor-pointer transition"
                >
                  <Download size={13} /> Export CSV Report
                </button>
              </div>
            )}

          </motion.div>
        )}

      </AnimatePresence>

    </DeviceFrame>
  );
}

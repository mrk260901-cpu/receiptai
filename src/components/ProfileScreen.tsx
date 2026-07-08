/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { User, Shield, Moon, Sun, Download, UploadCloud, Globe, HelpCircle, LogOut, Check, Heart, Mail, MessageSquare } from 'lucide-react';
import { UserProfile, AppSettings, Receipt } from '../types';

interface ProfileScreenProps {
  user: UserProfile;
  settings: AppSettings;
  receipts: Receipt[];
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
  onImportBackup: (importedReceipts: Receipt[]) => void;
  onLogout: () => void;
}

export default function ProfileScreen({
  user,
  settings,
  receipts,
  onUpdateSettings,
  onImportBackup,
  onLogout
}: ProfileScreenProps) {
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Export JSON Backup file download
  const handleExportBackup = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(receipts, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `receiptai_backup_${new Date().toISOString().substring(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (e) {
      console.error("Backup export failed:", e);
    }
  };

  // Import JSON Backup file upload
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importedData = JSON.parse(event.target?.result as string);
          if (Array.isArray(importedData)) {
            // Very simple schema validations
            const isValid = importedData.every(r => r.storeName && r.total && r.category && r.date);
            if (isValid) {
              onImportBackup(importedData);
              alert(`Successfully restored ${importedData.length} receipts!`);
            } else {
              alert("Error: Invalid receipts backup schema. Please verify JSON file structure.");
            }
          } else {
            alert("Error: Backup file must contain a JSON array of receipts.");
          }
        } catch (err) {
          alert("Error: Failed to parse backup file. Please verify JSON file syntax.");
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="flex-1 bg-slate-900 overflow-y-auto px-4 pt-4 pb-24 space-y-6 scrollbar-none select-none">
      
      {/* Top Header */}
      <div>
        <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest font-display">ReceiptAI Profile</span>
        <h2 className="text-2xl font-bold font-display text-white tracking-tight">Account & Preferences</h2>
      </div>

      {/* User Card */}
      <div className="glass-panel border border-slate-800 p-5 rounded-3xl flex items-center gap-4">
        {/* User initials bubble avatar */}
        <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center border border-blue-400/20 text-white text-xl font-extrabold shadow-lg shadow-blue-500/10 shrink-0">
          {user.displayName.split(' ').map(n => n[0]).join('')}
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold text-white truncate">{user.displayName}</h4>
          <p className="text-xs text-slate-400 mt-0.5 truncate">{user.email}</p>
          <span className="inline-block text-[9px] text-blue-400 font-bold bg-blue-500/10 px-2.5 py-0.5 rounded-full mt-2 uppercase tracking-wider">Premium Account</span>
        </div>
      </div>

      {/* Primary General Options settings list */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display">General Preferences</h4>
        
        <div className="glass-panel border border-slate-800 rounded-3xl divide-y divide-slate-800/65 overflow-hidden">
          
          {/* Currency preferences */}
          <div className="p-4 flex justify-between items-center text-xs font-bold text-slate-200">
            <div className="flex items-center gap-3">
              <span className="text-slate-400 font-bold">Currency</span>
            </div>
            <div className="flex gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[10px]">
              {['INR', 'USD', 'EUR', 'GBP'].map(curr => (
                <button
                  key={curr}
                  onClick={() => onUpdateSettings({ currency: curr as any })}
                  className={`px-2 py-1 rounded-lg transition cursor-pointer font-mono font-bold ${settings.currency === curr ? 'bg-blue-600 text-white shadow' : 'text-slate-400'}`}
                >
                  {curr}
                </button>
              ))}
            </div>
          </div>

          {/* Languages preferences */}
          <div className="p-4 flex justify-between items-center text-xs font-bold text-slate-200">
            <div className="flex items-center gap-3">
              <span className="text-slate-400 font-bold">Language</span>
            </div>
            <div className="flex gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[10px]">
              {[
                { code: 'en', label: 'English' },
                { code: 'hi', label: 'Hindi' },
                { code: 'es', label: 'Español' }
              ].map(lang => (
                <button
                  key={lang.code}
                  onClick={() => onUpdateSettings({ language: lang.code as any })}
                  className={`px-2 py-1 rounded-lg transition cursor-pointer ${settings.language === lang.code ? 'bg-blue-600 text-white shadow' : 'text-slate-400'}`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Simulated Dark mode */}
          <div className="p-4 flex justify-between items-center text-xs font-bold text-slate-200">
            <div className="flex items-center gap-3">
              <span className="text-slate-400 font-bold">Dark Mode</span>
            </div>
            <button
              onClick={() => onUpdateSettings({ darkMode: !settings.darkMode })}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer duration-300 flex items-center ${settings.darkMode ? 'bg-blue-600 justify-end' : 'bg-slate-850 justify-start border border-slate-800'}`}
            >
              <div className="w-5 h-5 rounded-full bg-white shadow flex items-center justify-center">
                {settings.darkMode ? <Moon size={11} className="text-blue-600" /> : <Sun size={11} className="text-amber-500" />}
              </div>
            </button>
          </div>

        </div>
      </div>

      {/* Backup and Restore sections */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display">Data & Cloud Backup</h4>
        
        <div className="glass-panel border border-slate-800 rounded-3xl divide-y divide-slate-800/65 overflow-hidden">
          
          {/* Backup Exporter */}
          <div 
            onClick={handleExportBackup}
            className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition cursor-pointer"
          >
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center border border-blue-500/15 text-blue-400">
                <Download size={14} />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-200">Export Local Database</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Save all {receipts.length} receipts as JSON file</p>
              </div>
            </div>
          </div>

          {/* Backup Importer */}
          <div 
            onClick={handleImportClick}
            className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition cursor-pointer"
          >
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-lg bg-emerald-600/10 flex items-center justify-center border border-emerald-500/15 text-emerald-400">
                <UploadCloud size={14} />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-200">Import Database Backup</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Restore previously exported receipts data</p>
              </div>
            </div>
            {/* Invisible native file input for backups loading */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportFileChange}
              className="hidden"
            />
          </div>

        </div>
      </div>

      {/* Legal & About info cards */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display">Application Settings</h4>
        
        <div className="glass-panel border border-slate-800 rounded-3xl p-4 space-y-3.5 text-xs">
          <div className="flex justify-between font-bold text-slate-300">
            <span>App Version</span>
            <span className="font-mono text-slate-500">v1.0.0 (Production Build)</span>
          </div>
          <div className="flex justify-between font-bold text-slate-300">
            <span>Server OCR Engine</span>
            <span className="text-blue-400 flex items-center gap-1">Google Gemini 3.5 Flash <Shield size={12} /></span>
          </div>
          <div className="flex justify-between font-bold text-slate-300">
            <span>Google ML Kit</span>
            <span className="text-slate-400 font-normal">Active (Local OCR Backup)</span>
          </div>
        </div>
      </div>

      {/* Sign out button */}
      <button
        onClick={onLogout}
        className="w-full py-4 bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/20 text-rose-400 font-bold rounded-2xl transition text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm"
      >
        <LogOut size={14} /> Logout Account
      </button>

      {/* Developer note */}
      <p className="text-[10px] text-slate-600 text-center font-bold tracking-wider uppercase mt-4">
        Made with ❤️ by Google AI Studio
      </p>

    </div>
  );
}

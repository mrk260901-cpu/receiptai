/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sparkles, DollarSign, Edit3, ArrowUpRight, AlertTriangle, CheckCircle2, ChevronRight, SlidersHorizontal, Plus } from 'lucide-react';
import { Budget, Receipt } from '../types';

interface BudgetScreenProps {
  receipts: Receipt[];
  budgets: Budget[];
  currencySymbol: string;
  onSetBudgetLimit: (category: string, limit: number) => void;
}

export default function BudgetScreen({
  receipts,
  budgets,
  currencySymbol,
  onSetBudgetLimit
}: BudgetScreenProps) {
  
  // States
  const [selectedCategory, setSelectedCategory] = useState<string>('Groceries');
  const [limitInput, setLimitInput] = useState<string>('5000');
  const [isEditing, setIsEditing] = useState(false);

  // Calculate current month spending aggregated by category
  const now = new Date();
  const currentMonthStr = now.toISOString().substring(0, 7); // YYYY-MM
  const currentMonthReceipts = receipts.filter(r => r.date.startsWith(currentMonthStr));

  const spendingByCategory = currentMonthReceipts.reduce((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + r.total;
    return acc;
  }, {} as Record<string, number>);

  // Compute stats for list
  const budgetStats = budgets.map(b => {
    const spent = spendingByCategory[b.category] || 0;
    const remaining = Math.max(0, b.monthlyLimit - spent);
    const percent = b.monthlyLimit > 0 ? (spent / b.monthlyLimit) * 100 : 0;
    
    let statusColor = 'bg-emerald-500';
    let textColor = 'text-emerald-400';
    let bgGlow = 'rgba(16,185,129,0.1)';

    if (percent >= 100) {
      statusColor = 'bg-rose-500 animate-pulse';
      textColor = 'text-rose-400';
      bgGlow = 'rgba(244,63,94,0.15)';
    } else if (percent >= 80) {
      statusColor = 'bg-amber-500';
      textColor = 'text-amber-400';
      bgGlow = 'rgba(245,158,11,0.1)';
    }

    return {
      ...b,
      spent,
      remaining,
      percent,
      statusColor,
      textColor,
      bgGlow
    };
  });

  const totalLimit = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
  const totalSpent = currentMonthReceipts.reduce((sum, r) => sum + r.total, 0);
  const totalRemaining = Math.max(0, totalLimit - totalSpent);
  const totalPercent = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0;

  // Edit Action
  const handleEditBudget = (category: string, currentLimit: number) => {
    setSelectedCategory(category);
    setLimitInput(currentLimit.toString());
    setIsEditing(true);
  };

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const limit = parseFloat(limitInput);
    if (!isNaN(limit) && limit >= 0) {
      onSetBudgetLimit(selectedCategory, limit);
      setIsEditing(false);
    }
  };

  return (
    <div className="flex-1 bg-slate-900 overflow-y-auto px-4 pt-4 pb-24 space-y-6 scrollbar-none">
      
      <div>
        <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest font-display">ReceiptAI Budgets</span>
        <h2 className="text-2xl font-bold font-display text-white tracking-tight">Budget Planner</h2>
      </div>

      {/* Main Budget Progress Ring Card */}
      <div className="glass-panel border border-slate-800 p-5 rounded-3xl space-y-4">
        <div className="flex justify-between items-center text-xs font-bold text-slate-400">
          <span>Overall Monthly Limit</span>
          <span className="font-mono text-blue-400">{totalPercent.toFixed(0)}% Used</span>
        </div>

        <div className="flex items-center gap-5">
          <div className="flex-1 space-y-1">
            <h3 className="text-2xl font-extrabold text-white font-display">
              {currencySymbol}{totalSpent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </h3>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
              Spent of {currencySymbol}{totalLimit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
          </div>

          <div className="text-right text-xs shrink-0">
            <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Remaining</span>
            <span className="text-base font-bold text-emerald-400 font-mono mt-1 block">
              {currencySymbol}{totalRemaining.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>

        {/* Global Progress */}
        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-800">
          <div 
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-1000"
            style={{ width: `${Math.min(100, totalPercent)}%` }}
          />
        </div>
      </div>

      {/* Editing Drawer Form Overlay */}
      {isEditing ? (
        <form onSubmit={handleSaveBudget} className="glass-panel border border-blue-500/20 bg-blue-950/10 p-5 rounded-2xl space-y-4 animate-slideDown">
          <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 font-display flex items-center gap-2">
            <Sparkles size={14} className="animate-pulse" /> Configure Category Budget
          </h4>

          <div className="grid grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400 block">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                {budgets.map(b => (
                  <option key={b.category} value={b.category}>{b.category}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400 block">Limit ({currencySymbol})</label>
              <input
                type="number"
                value={limitInput}
                onChange={(e) => setLimitInput(e.target.value)}
                placeholder="Limit amount"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition cursor-pointer"
            >
              Save Budget
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setIsEditing(true)}
          className="w-full py-3.5 bg-slate-850 hover:bg-slate-800 text-slate-200 font-bold rounded-2xl transition border border-slate-800 text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm"
        >
          <Plus size={14} /> Adjust Category Budgets
        </button>
      )}

      {/* Warnings & Alerts Feed */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display">Budget Warnings</h4>
        
        {budgetStats.filter(b => b.percent >= 80).length === 0 ? (
          <div className="glass-panel border border-slate-800 rounded-2xl p-4 flex gap-3 items-center">
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            <p className="text-xs text-slate-400">Excellent! All expenses are well below limits.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {budgetStats
              .filter(b => b.percent >= 80)
              .map(b => (
                <div 
                  key={b.category} 
                  className="border border-rose-500/10 p-3.5 rounded-2xl flex gap-3 items-start"
                  style={{ backgroundColor: b.bgGlow }}
                >
                  <AlertTriangle size={16} className={`shrink-0 mt-0.5 ${b.percent >= 100 ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`} />
                  <div>
                    <h5 className="text-xs font-bold text-slate-100">{b.category} Limit Warning</h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                      You spent {currencySymbol}{b.spent.toLocaleString('en-IN')} of your {currencySymbol}{b.monthlyLimit.toLocaleString('en-IN')} budget ({b.percent.toFixed(0)}%).
                    </p>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Detail Category Bars List */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display">Category Spend Breakdowns</h4>
        
        <div className="space-y-3">
          {budgetStats.map((item) => (
            <div 
              key={item.category}
              className="glass-panel border border-slate-800/80 p-3.5 rounded-2xl space-y-2 relative group"
            >
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-200">{item.category}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 font-normal">Spent:</span>
                  <span className="text-white font-mono">{currencySymbol}{item.spent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  <span className="text-slate-600 font-normal">/</span>
                  <span className="text-slate-400 font-mono">{currencySymbol}{item.monthlyLimit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
              </div>

              {/* Progress Bar element */}
              <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-950">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${item.statusColor}`}
                  style={{ width: `${Math.min(100, item.percent)}%` }}
                />
              </div>

              {/* Stats Footer toggling Edit */}
              <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold pt-1">
                <span>{item.percent.toFixed(0)}% Utilized</span>
                <button
                  onClick={() => handleEditBudget(item.category, item.monthlyLimit)}
                  className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-0.5 font-semibold opacity-0 group-hover:opacity-100 transition duration-200 cursor-pointer"
                >
                  Adjust Limit <ChevronRight size={11} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

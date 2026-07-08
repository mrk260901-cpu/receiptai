/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor, Wifi, Battery, Volume2 } from 'lucide-react';

interface DeviceFrameProps {
  children: React.ReactNode;
  isMobileMode: boolean;
  setIsMobileMode: (val: boolean) => void;
}

export default function DeviceFrame({ children, isMobileMode, setIsMobileMode }: DeviceFrameProps) {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      setTime(`${hours}:${minutes} ${ampm}`);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isMobileMode) {
    return (
      <div className="w-full min-h-screen bg-slate-900 text-slate-100 flex flex-col">
        {/* Widescreen Desktop Header Banner */}
        <header className="bg-slate-950 border-b border-slate-800 py-3 px-6 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl text-white font-bold font-display shadow-lg shadow-blue-500/20">
              R
            </div>
            <div>
              <h1 className="text-lg font-bold font-display tracking-tight text-white flex items-center gap-2">
                ReceiptAI <span className="text-xs bg-emerald-500/20 text-emerald-400 font-normal px-2 py-0.5 rounded-full border border-emerald-500/30">Web Fullscreen</span>
              </h1>
              <p className="text-xs text-slate-400">Smart AI Receipt Scanner & Expense Tracker</p>
            </div>
          </div>
          
          <button
            onClick={() => setIsMobileMode(true)}
            className="flex items-center gap-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium px-4 py-2 rounded-xl transition border border-slate-700"
          >
            <Smartphone size={14} />
            Switch to Android App Simulator
          </button>
        </header>
        
        {/* Content body */}
        <div className="flex-1 overflow-auto bg-slate-950 relative">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col items-center justify-center p-4 select-none">
      {/* Visual Device Switcher Float */}
      <div className="mb-4 flex items-center bg-slate-850/80 backdrop-blur border border-slate-800 rounded-full p-1 shadow-2xl">
        <button
          onClick={() => setIsMobileMode(true)}
          className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full transition bg-blue-600 text-white shadow-lg"
        >
          <Smartphone size={14} />
          Android App Mode
        </button>
        <button
          onClick={() => setIsMobileMode(false)}
          className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full transition text-slate-400 hover:text-slate-200"
        >
          <Monitor size={14} />
          Widescreen Web Mode
        </button>
      </div>

      {/* Flagship Device Chassis (Physical mockup) */}
      <div className="relative w-full max-w-[395px] h-[820px] bg-slate-950 rounded-[50px] p-3.5 shadow-[0_0_80px_rgba(37,99,235,0.15)] border-4 border-slate-800/80 flex flex-col overflow-hidden">
        
        {/* Speaker grill and notch camera */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-7 bg-slate-950 rounded-b-2xl z-50 flex items-center justify-center gap-2 border-b border-l border-r border-slate-800">
          <div className="w-12 h-1 bg-slate-800 rounded-full" />
          <div className="w-3.5 h-3.5 bg-slate-900 rounded-full border-2 border-slate-850 flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-blue-900 rounded-full" />
          </div>
        </div>

        {/* Dynamic status bar */}
        <div className="h-7 w-full px-5 flex justify-between items-center text-[11px] font-medium text-slate-300 z-40 bg-slate-950/80 backdrop-blur shrink-0 mt-1">
          <span>{time}</span>
          <div className="flex items-center gap-1.5">
            <Wifi size={11} className="text-slate-300" />
            <Volume2 size={11} className="text-slate-300" />
            <span className="text-[10px] tracking-tighter">5G</span>
            <div className="flex items-center gap-0.5">
              <span className="text-[9px]">98%</span>
              <Battery size={13} className="text-emerald-400 fill-emerald-400/20" />
            </div>
          </div>
        </div>

        {/* Screen Bezel & Container */}
        <div className="flex-1 w-full rounded-[38px] overflow-hidden bg-slate-900 relative flex flex-col border border-slate-800">
          {children}
        </div>
        
        {/* Virtual home swipe indicator bar */}
        <div className="h-5 w-full flex items-center justify-center shrink-0 mt-1">
          <div className="w-32 h-1 bg-slate-700/60 rounded-full" />
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { CommissionConfig } from '@/types/crm';
import { Settings, Percent, Save, CheckCircle2, Shield, DollarSign } from 'lucide-react';

interface AdminCommissionSettingsViewProps {
  commissionConfig: CommissionConfig;
  onUpdateCommissionConfig: (newConfig: CommissionConfig) => void;
}

export function AdminCommissionSettingsView({
  commissionConfig,
  onUpdateCommissionConfig,
}: AdminCommissionSettingsViewProps) {
  const [price199, setPrice199] = useState(commissionConfig.price199);
  const [rate199, setRate199] = useState(commissionConfig.rate199);
  const [price1000, setPrice1000] = useState(commissionConfig.price1000);
  const [rate1000, setRate1000] = useState(commissionConfig.rate1000);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: CommissionConfig = {
      price199: Number(price199),
      rate199: Number(rate199),
      price1000: Number(price1000),
      rate1000: Number(rate1000),
    };
    onUpdateCommissionConfig(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/30 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1 text-center md:text-left">
          <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center justify-center md:justify-start gap-2">
            <Settings className="w-6 h-6 text-amber-500" />
            Konfigirasyon Pri Fòmasyon Ak Komisyon Ajan Yo (Commission Settings Menu)
          </h2>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Jere ak modifye pri pwogram fòmasyon yo ak pousantaj (%) komisyon tou de pwogram yo pou tout anplwaye yo.
          </p>
        </div>
        
        {savedSuccess && (
          <div className="flex items-center gap-1.5 bg-emerald-500 text-white px-4 py-2 rounded-2xl text-xs font-extrabold shadow-md animate-in fade-in shrink-0">
            <CheckCircle2 className="w-4 h-4" />
            Konfigirasyon Sovgarde Ak Siksè!
          </div>
        )}
      </div>

      {/* MAIN PRICING & COMMISSION CONFIGURATION FORM CARD */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 p-8 rounded-3xl shadow-sm space-y-6">
        
        <div className="border-b border-gray-100 dark:border-gray-700 pb-4">
          <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-500" />
            Paramèt Kontwòl Komisyon Ak Pri
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Nenpòt modifikasyon ou fè la a ap aplike otomatikman nan kalkilasyon pèfòmans tout Worker yo an tan reyèl.
          </p>
        </div>

        <form onSubmit={handleSaveConfig} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* PROGRAM 1 SETTINGS */}
            <div className="bg-gray-50 dark:bg-gray-900/60 p-5 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                <span className="text-xs font-black uppercase text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4" />
                  Pwogram 1: Fòmasyon Entwodiksyon
                </span>
                <span className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold px-2 py-0.5 rounded">Standard Offer</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                  PRI FÒMASYON 1 ($ USD)
                </label>
                <input
                  type="number"
                  value={price199}
                  onChange={(e) => setPrice199(Number(e.target.value))}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                  POUSANTAJ AGAN AN TOUCHE (% 1)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={rate199}
                    onChange={(e) => setRate199(Number(e.target.value))}
                    className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm font-bold text-amber-600 dark:text-amber-400 focus:outline-none focus:border-amber-500 pr-10"
                    required
                  />
                  <Percent className="absolute right-3.5 top-3 w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* PROGRAM 2 SETTINGS */}
            <div className="bg-gray-50 dark:bg-gray-900/60 p-5 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                <span className="text-xs font-black uppercase text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4" />
                  Pwogram 2: Done For You (DFY)
                </span>
                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold px-2 py-0.5 rounded">High Ticket Offer</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                  PRI FÒMASYON 2 ($ USD)
                </label>
                <input
                  type="number"
                  value={price1000}
                  onChange={(e) => setPrice1000(Number(e.target.value))}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                  POUSANTAJ AGAN AN TOUCHE (% 2)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={rate1000}
                    onChange={(e) => setRate1000(Number(e.target.value))}
                    className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm font-bold text-amber-600 dark:text-amber-400 focus:outline-none focus:border-amber-500 pr-10"
                    required
                  />
                  <Percent className="absolute right-3.5 top-3 w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>

          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold px-6 py-3 rounded-2xl text-sm shadow-md shadow-amber-500/20 hover:shadow-lg transition-all active:scale-95"
            >
              <Save className="w-5 h-5" />
              Sovgarde Konfigirasyon Nouvo Pri Yo
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}

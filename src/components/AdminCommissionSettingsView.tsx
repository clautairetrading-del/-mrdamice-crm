'use client';

import React, { useState, useEffect } from 'react';
import { CommissionConfig, Profile, WorkerCommissionRate } from '@/types/crm';
import { Settings, Percent, Save, CheckCircle2, Shield, DollarSign, UserCheck, Users } from 'lucide-react';

interface AdminCommissionSettingsViewProps {
  allProfiles: Profile[];
  commissionConfig: CommissionConfig;
  onUpdateCommissionConfig: (newConfig: CommissionConfig) => void;
}

export function AdminCommissionSettingsView({
  allProfiles,
  commissionConfig,
  onUpdateCommissionConfig,
}: AdminCommissionSettingsViewProps) {
  const [price199, setPrice199] = useState(commissionConfig.price199);
  const [rate199, setRate199] = useState(commissionConfig.rate199);
  const [price1000, setPrice1000] = useState(commissionConfig.price1000);
  const [rate1000, setRate1000] = useState(commissionConfig.rate1000);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Per-Worker Commission Rates State Map (email or id -> WorkerCommissionRate)
  const [workerRates, setWorkerRates] = useState<Record<string, WorkerCommissionRate>>(
    commissionConfig.workerRates || {}
  );

  // Selected worker for custom rate assignment
  const workerAgentsList = allProfiles.filter(
    (p) => p.role === 'worker' || p.email.toLowerCase().includes('user')
  );

  const [selectedWorkerKey, setSelectedWorkerKey] = useState<string>(
    workerAgentsList[0]?.email || 'Usertest@damice.com'
  );

  // Active form values for the currently selected worker
  const currentWorkerRate = workerRates[selectedWorkerKey.toLowerCase()] || {
    rate199: commissionConfig.rate199,
    rate1000: commissionConfig.rate1000,
  };

  const [customRate199, setCustomRate199] = useState<number>(currentWorkerRate.rate199);
  const [customRate1000, setCustomRate1000] = useState<number>(currentWorkerRate.rate1000);

  // When selected worker changes, update form fields to match that worker's assigned rate
  useEffect(() => {
    const existing = workerRates[selectedWorkerKey.toLowerCase()] || {
      rate199: commissionConfig.rate199,
      rate1000: commissionConfig.rate1000,
    };
    setCustomRate199(existing.rate199);
    setCustomRate1000(existing.rate1000);
  }, [selectedWorkerKey, workerRates, commissionConfig.rate199, commissionConfig.rate1000]);

  // Save global base pricing & default rates
  const handleSaveGlobalConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: CommissionConfig = {
      price199: Number(price199),
      rate199: Number(rate199),
      price1000: Number(price1000),
      rate1000: Number(rate1000),
      workerRates,
    };
    onUpdateCommissionConfig(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Save specific worker custom commission rates
  const handleSaveWorkerRate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkerKey) return;

    const updatedWorkerRates = {
      ...workerRates,
      [selectedWorkerKey.toLowerCase()]: {
        rate199: Number(customRate199),
        rate1000: Number(customRate1000),
      },
    };

    setWorkerRates(updatedWorkerRates);

    const updatedConfig: CommissionConfig = {
      price199: Number(price199),
      rate199: Number(rate199),
      price1000: Number(price1000),
      rate1000: Number(rate1000),
      workerRates: updatedWorkerRates,
    };

    onUpdateCommissionConfig(updatedConfig);
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
            Redesign Meni Konfigirasyon Pousantaj Pa Worker
          </h2>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Chwazi yon Worker nan lis la epi atribiye pousantaj (%) espesifik li pou fòmasyon $199 USD ak Done For You $1,000 USD.
          </p>
        </div>
        
        {savedSuccess && (
          <div className="flex items-center gap-1.5 bg-emerald-500 text-white px-4 py-2 rounded-2xl text-xs font-extrabold shadow-md animate-in fade-in shrink-0">
            <CheckCircle2 className="w-4 h-4" />
            Pousantaj Atribiye Ak Siksè!
          </div>
        )}
      </div>

      {/* SECTION 1: PER-WORKER CUSTOM COMMISSION ASSIGNMENT CARD */}
      <div className="bg-white dark:bg-gray-800 border border-amber-500/40 p-8 rounded-3xl shadow-sm space-y-6">
        
        <div className="border-b border-gray-100 dark:border-gray-700 pb-4">
          <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-amber-500" />
            1. Atribiye Pousantaj Personnalisé Pa Worker (Individual Worker Rates)
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Chak anplwaye ka gen yon pousantaj diferan kaye daprè pèfòmans oubyen akò li ak antrepriz la.
          </p>
        </div>

        <form onSubmit={handleSaveWorkerRate} className="space-y-6">
          
          {/* Worker Selector Dropdown */}
          <div>
            <label className="block text-xs font-extrabold text-gray-700 dark:text-gray-300 uppercase mb-2">
              CHWAZI WORKER / CLOSER AN:
            </label>
            <select
              value={selectedWorkerKey}
              onChange={(e) => setSelectedWorkerKey(e.target.value)}
              className="w-full md:w-1/2 bg-gray-50 dark:bg-gray-900 border-2 border-amber-500/50 rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:border-amber-500 shadow-xs"
            >
              {workerAgentsList.map((w) => (
                <option key={w.id} value={w.email}>
                  👤 {w.full_name} ({w.email})
                </option>
              ))}
            </select>
          </div>

          {/* Individual Commission Rate Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            
            {/* Worker Program 1 Rate */}
            <div className="bg-amber-50/60 dark:bg-amber-950/40 p-5 rounded-2xl border border-amber-200 dark:border-amber-800/60 space-y-3">
              <span className="text-xs font-black uppercase text-amber-800 dark:text-amber-300 block">
                POUSANTAJ POU FÒMASYON $199 USD (% 1)
              </span>
              <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                Pousantaj anplwaye {selectedWorkerKey} ap touche sou chak fòmasyon $199 USD.
              </p>
              <div className="relative">
                <input
                  type="number"
                  value={customRate199}
                  onChange={(e) => setCustomRate199(Number(e.target.value))}
                  className="w-full bg-white dark:bg-gray-800 border border-amber-300 dark:border-amber-700 rounded-xl px-4 py-2.5 text-base font-black text-amber-600 dark:text-amber-400 focus:outline-none focus:border-amber-500 pr-10"
                  required
                />
                <Percent className="absolute right-3.5 top-3.5 w-4 h-4 text-amber-500" />
              </div>
            </div>

            {/* Worker Program 2 Rate */}
            <div className="bg-emerald-50/60 dark:bg-emerald-950/40 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 space-y-3">
              <span className="text-xs font-black uppercase text-emerald-800 dark:text-emerald-300 block">
                POUSANTAJ POU DONE FOR YOU $1,000 USD (% 2)
              </span>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                Pousantaj anplwaye {selectedWorkerKey} ap touche sou chak sèvis $1,000 USD.
              </p>
              <div className="relative">
                <input
                  type="number"
                  value={customRate1000}
                  onChange={(e) => setCustomRate1000(Number(e.target.value))}
                  className="w-full bg-white dark:bg-gray-800 border border-emerald-300 dark:border-emerald-700 rounded-xl px-4 py-2.5 text-base font-black text-emerald-600 dark:text-emerald-400 focus:outline-none focus:border-emerald-500 pr-10"
                  required
                />
                <Percent className="absolute right-3.5 top-3.5 w-4 h-4 text-emerald-500" />
              </div>
            </div>

          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black px-6 py-3.5 rounded-2xl text-xs shadow-md shadow-amber-500/20 hover:shadow-lg transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              Anrejistre Pousantaj Pou Worker Sa A
            </button>
          </div>

        </form>

        {/* WORKERS COMMISSION SUMMARY TABLE */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
          <h4 className="text-xs font-black uppercase text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-500" />
            Kouri Rezime Pousantaj Atribiye Pou Tout Worker Yo:
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-100 dark:bg-gray-900 text-gray-500 uppercase font-bold">
                <tr>
                  <th className="p-3">Worker (Anplwaye)</th>
                  <th className="p-3">Pousantaj $199 USD</th>
                  <th className="p-3">Pousantaj $1,000 USD</th>
                  <th className="p-3 text-right">Estatut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700 font-semibold">
                {workerAgentsList.map((w) => {
                  const rates = workerRates[w.email.toLowerCase()] || {
                    rate199: commissionConfig.rate199,
                    rate1000: commissionConfig.rate1000,
                  };
                  return (
                    <tr key={w.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="p-3 font-bold text-gray-900 dark:text-white">
                        👤 {w.full_name} <span className="text-gray-500 font-normal">({w.email})</span>
                      </td>
                      <td className="p-3 font-mono font-bold text-amber-600 dark:text-amber-400">
                        {rates.rate199}% (${(commissionConfig.price199 * (rates.rate199 / 100)).toFixed(2)} USD)
                      </td>
                      <td className="p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {rates.rate1000}% (${(commissionConfig.price1000 * (rates.rate1000 / 100)).toFixed(2)} USD)
                      </td>
                      <td className="p-3 text-right">
                        <span className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold px-2 py-0.5 rounded text-[10px]">
                          {workerRates[w.email.toLowerCase()] ? 'Personnalisé' : 'Default Global'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* SECTION 2: GLOBAL BASE PRICING & DEFAULT RATES CARD */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 p-8 rounded-3xl shadow-sm space-y-6">
        <div className="border-b border-gray-100 dark:border-gray-700 pb-4">
          <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-500" />
            2. Pri De Baz Ak Pousantaj Par Défaut Global (Global Defaults)
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Konfigirasyon pri de baz konpayi an ak pousantaj pa défaut pou nenpòt nouvo Worker ki poko gen pousantaj personnalisé.
          </p>
        </div>

        <form onSubmit={handleSaveGlobalConfig} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
              PRI FÒMASYON 1 ($ USD)
            </label>
            <input
              type="number"
              value={price199}
              onChange={(e) => setPrice199(Number(e.target.value))}
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
              POUSANTAJ GLOBAL (% 1)
            </label>
            <div className="relative">
              <input
                type="number"
                value={rate199}
                onChange={(e) => setRate199(Number(e.target.value))}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm font-bold text-amber-600 dark:text-amber-400 focus:outline-none focus:border-amber-500 pr-8"
                required
              />
              <Percent className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
              PRI FÒMASYON 2 ($ USD)
            </label>
            <input
              type="number"
              value={price1000}
              onChange={(e) => setPrice1000(Number(e.target.value))}
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
              POUSANTAJ GLOBAL (% 2)
            </label>
            <div className="relative">
              <input
                type="number"
                value={rate1000}
                onChange={(e) => setRate1000(Number(e.target.value))}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm font-bold text-amber-600 dark:text-amber-400 focus:outline-none focus:border-amber-500 pr-8"
                required
              />
              <Percent className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-black dark:bg-amber-500 dark:hover:bg-amber-600 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs transition-all shadow-xs"
            >
              <Save className="w-4 h-4" />
              Sovgarde Defaults
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}

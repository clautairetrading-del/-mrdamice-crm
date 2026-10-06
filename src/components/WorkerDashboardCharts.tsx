'use client';

import React from 'react';
import Image from 'next/image';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { CommissionConfig, DEFAULT_COMMISSION_CONFIG } from '@/types/crm';

interface WorkerPerformanceProps {
  agentName: string;
  todayCalls: number;
  weekCalls: number;
  monthCalls: number;
  closes199: number;
  closes1000: number;
  dailyStatsData: { date: string; calls: number }[];
  commissionConfig?: CommissionConfig;
}

export function WorkerDashboardCharts({
  agentName,
  todayCalls,
  weekCalls,
  monthCalls,
  closes199,
  closes1000,
  dailyStatsData,
  commissionConfig = DEFAULT_COMMISSION_CONFIG,
}: WorkerPerformanceProps) {
  // Dynamic Calculations using Admin Commission & Price Config
  const rev199 = closes199 * commissionConfig.price199;
  const rev1000 = closes1000 * commissionConfig.price1000;
  const totalRevenue = rev199 + rev1000;

  const agentCommission199 = rev199 * (commissionConfig.rate199 / 100);
  const agentCommission1000 = rev1000 * (commissionConfig.rate1000 / 100);
  const totalAgentCommission = agentCommission199 + agentCommission1000;

  const pieData = [
    { name: `Fòmasyon $${commissionConfig.price199}`, value: closes199, color: '#f59e0b' },
    { name: `Done For You $${commissionConfig.price1000}`, value: closes1000, color: '#d97706' },
  ];

  return (
    <div className="space-y-8">
      
      {/* Elegant Welcome Banner with Image */}
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 dark:border-amber-500/30 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-3 z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Espace Worker Sales & Closing
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white leading-tight">
            Byenvini sou CRM la, <span className="text-amber-600 dark:text-amber-400">{agentName}</span>! 👋
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            Ann fè gwo chif jodi a! Swiv apèl ou yo, jere leads ou yo an tan reyèl, epi kalkile komisyon ou yo fasilman sou chak close.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs font-semibold text-gray-700 dark:text-gray-300">
            <div className="flex items-center gap-1.5 bg-white/80 dark:bg-gray-800/80 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Objectif lavant fikse
            </div>
            <div className="flex items-center gap-1.5 bg-white/80 dark:bg-gray-800/80 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700">
              <TrendingUp className="w-4 h-4 text-amber-500" />
              Komisyon aktif
            </div>
          </div>
        </div>

        {/* Welcome Image Container */}
        <div className="relative w-full md:w-64 h-44 rounded-2xl overflow-hidden shadow-lg border-2 border-amber-500/30 shrink-0">
          <Image
            src="/images/welcome.jpg"
            alt="Welcome to Mr Damice CRM"
            fill
            className="object-cover hover:scale-105 transition-transform duration-500"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-3">
            <span className="text-white text-xs font-bold tracking-wide drop-shadow">Mr Damice Closing Team</span>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700/80 p-5 rounded-2xl shadow-sm dark:shadow-none">
          <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider">Apèl Jodi a</p>
          <p className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">{todayCalls}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700/80 p-5 rounded-2xl shadow-sm dark:shadow-none">
          <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider">Apèl Semèn sa a</p>
          <p className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">{weekCalls}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700/80 p-5 rounded-2xl shadow-sm dark:shadow-none">
          <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider">Revenu Total Antrepriz</p>
          <p className="text-3xl font-extrabold text-gray-800 dark:text-gray-200 mt-1">${totalRevenue.toLocaleString()} USD</p>
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/30 p-5 rounded-2xl shadow-sm">
          <p className="text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">Komisyon Ou Touche</p>
          <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">${totalAgentCommission.toLocaleString()} USD</p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 font-medium">
            ({commissionConfig.rate199}% ak {commissionConfig.rate1000}% sou closes)
          </p>
        </div>
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Bar Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700/80 p-6 rounded-2xl shadow-sm dark:shadow-none">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Grafik Pèfòmans Apèl (Jounen / Semèn)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyStatsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-gray-700" />
                <XAxis dataKey="date" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff', borderRadius: '12px' }}
                />
                <Bar dataKey="calls" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Closing Breakdown */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700/80 p-6 rounded-2xl shadow-sm dark:shadow-none flex flex-col justify-between">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Repatisyon Vant (Close)</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                Fòmasyon $199
              </span>
              <span className="font-bold text-gray-900 dark:text-white">{closes199}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <span className="w-3 h-3 rounded-full bg-amber-600"></span>
                Done For You $1,000
              </span>
              <span className="font-bold text-gray-900 dark:text-white">{closes1000}</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

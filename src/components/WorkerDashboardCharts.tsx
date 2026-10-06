'use client';

import React from 'react';
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

interface WorkerPerformanceProps {
  todayCalls: number;
  weekCalls: number;
  monthCalls: number;
  closes199: number;
  closes1000: number;
  dailyStatsData: { date: string; calls: number }[];
}

export function WorkerDashboardCharts({
  todayCalls,
  weekCalls,
  monthCalls,
  closes199,
  closes1000,
  dailyStatsData,
}: WorkerPerformanceProps) {
  // Commission Calculations
  const commission199 = closes199 * 199;
  const commission1000 = closes1000 * 1000;
  const totalRevenue = commission199 + commission1000;

  const pieData = [
    { name: 'Fòmasyon $199', value: closes199, color: '#10b981' },
    { name: 'Done For You $1k', value: closes1000, color: '#6366f1' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Apèl Jodi a</p>
          <p className="text-3xl font-extrabold text-white mt-1">{todayCalls}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Apèl Semèn sa a</p>
          <p className="text-3xl font-extrabold text-emerald-400 mt-1">{weekCalls}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Apèl Mwa sa a</p>
          <p className="text-3xl font-extrabold text-blue-400 mt-1">{monthCalls}</p>
        </div>

        <div className="bg-slate-900 border border-emerald-500/30 p-5 rounded-2xl bg-emerald-950/20">
          <p className="text-emerald-400 text-xs font-semibold uppercase tracking-wider">Total Close / Revenue</p>
          <p className="text-3xl font-extrabold text-emerald-400 mt-1">${totalRevenue.toLocaleString()} USD</p>
          <p className="text-xs text-slate-400 mt-1">
            {closes199}x ($199) | {closes1000}x ($1,000)
          </p>
        </div>
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Bar Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <h3 className="text-lg font-bold text-white mb-4">Grafik Pèfòmans Apèl (Jounen / Semèn)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyStatsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }}
                />
                <Bar dataKey="calls" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Closing Breakdown */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
          <h3 className="text-lg font-bold text-white mb-2">Repatisyon Vant (Close)</h3>
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
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                Fòmasyon $199
              </span>
              <span className="font-bold text-white">{closes199}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
                Done For You $1,000
              </span>
              <span className="font-bold text-white">{closes1000}</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

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
    { name: 'Fòmasyon $199', value: closes199, color: '#f59e0b' }, // Amber-500
    { name: 'Done For You $1k', value: closes1000, color: '#d97706' }, // Amber-600
  ];

  return (
    <div className="space-y-6">
      
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
          <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider">Apèl Mwa sa a</p>
          <p className="text-3xl font-extrabold text-gray-800 dark:text-gray-200 mt-1">{monthCalls}</p>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/30 p-5 rounded-2xl shadow-sm">
          <p className="text-amber-700 dark:text-amber-400 text-xs font-semibold uppercase tracking-wider">Total Close / Revenue</p>
          <p className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">${totalRevenue.toLocaleString()} USD</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
            {closes199}x ($199) | {closes1000}x ($1,000)
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

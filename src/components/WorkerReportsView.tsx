'use client';

import React, { useState, useRef } from 'react';
import { Lead, Call, Profile } from '@/types/crm';
import { FileText, Download, Calendar, PhoneCall, CheckCircle2, Award, TrendingUp, Clock } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface WorkerReportsViewProps {
  currentProfile: Profile;
  myLeads: Lead[];
  calls: Call[];
}

export function WorkerReportsView({ currentProfile, myLeads, calls }: WorkerReportsViewProps) {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'overall'>('today');
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Calculate start date of current week (Monday)
  const startOfWeek = new Date(now);
  const day = startOfWeek.getDay();
  const diffToMonday = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
  startOfWeek.setDate(diffToMonday);
  const weekStartStr = startOfWeek.toISOString().split('T')[0];

  // Calculate start of current month
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthStartStr = startOfMonth.toISOString().split('T')[0];

  // Filter calls based on timeRange
  const filteredCalls = calls.filter((call) => {
    const callDate = call.created_at ? call.created_at.split('T')[0] : '';
    if (timeRange === 'today') return callDate === todayStr;
    if (timeRange === 'week') return callDate >= weekStartStr;
    if (timeRange === 'month') return callDate >= monthStartStr;
    return true; // overall
  });

  // Performance metrics calculation
  const totalCallsCount = filteredCalls.length;
  const closedCalls = filteredCalls.filter((c) => c.status === 'Close');
  const totalCloses = closedCalls.length;
  const totalRevenue = closedCalls.reduce((acc, c) => {
    if (c.closed_program === 'Done For You $1,000 USD') return acc + 1000;
    if (c.closed_program === 'Fòmasyon $199 USD') return acc + 199;
    return acc + 199; // Default close value fallback
  }, 0);

  const followUpCallsCount = filteredCalls.filter((c) => c.status === 'Gen follow up').length;
  const assistanceCallsCount = filteredCalls.filter((c) => c.status === 'Assistance').length;
  const spokenCallsCount = filteredCalls.filter((c) => c.status === 'Mwen pale ak li').length;

  const conversionRate = totalCallsCount > 0 ? ((totalCloses / totalCallsCount) * 100).toFixed(1) : '0';

  // Export Report to PDF function
  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);

    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Rappò_Pèfòmans_${currentProfile.full_name.replace(/\s+/g, '_')}_${timeRange.toUpperCase()}_${todayStr}.pdf`);
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('Erè nan jenere fichye PDF la.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Range Selector Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50 dark:bg-gray-800/60 p-4 rounded-2xl border border-gray-200 dark:border-gray-700/80">
        <div>
          <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-500" />
            Rapò Pèfòmans Ak Travay Mwen
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Gade epi telechaje tout done sou siksè ak kantite apèl ou fè nan CRM an.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
          
          {/* Time Filter Buttons */}
          <div className="grid grid-cols-4 gap-1 bg-gray-200 dark:bg-gray-900 p-1 rounded-xl border border-gray-300 dark:border-gray-700">
            <button
              onClick={() => setTimeRange('today')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                timeRange === 'today' ? 'bg-amber-500 text-white shadow-sm' : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Jodi a
            </button>
            <button
              onClick={() => setTimeRange('week')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                timeRange === 'week' ? 'bg-amber-500 text-white shadow-sm' : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Semèn sa
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                timeRange === 'month' ? 'bg-amber-500 text-white shadow-sm' : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Mwa sa
            </button>
            <button
              onClick={() => setTimeRange('overall')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                timeRange === 'overall' ? 'bg-amber-500 text-white shadow-sm' : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Tout (Overall)
            </button>
          </div>

          {/* Download PDF Button */}
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-xs font-extrabold shadow-md shadow-amber-500/20 transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Ap Jenere PDF...' : 'Telechaje Rapò PDF'}
          </button>
        </div>
      </div>

      {/* Printable Report Canvas Area */}
      <div ref={reportRef} className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-200 dark:border-gray-700/80 shadow-xl space-y-8">
        
        {/* Printable Header */}
        <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-500 rounded-xl text-white font-black text-sm">MD</div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white">MR DAMICE CRM SALES REPORT</h2>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Rappò Pèfòmans Zouti Travay Ajan Sales & Closing
            </p>
          </div>

          <div className="text-right">
            <p className="text-sm font-bold text-gray-900 dark:text-white">{currentProfile.full_name}</p>
            <p className="text-xs text-amber-600 font-semibold uppercase">{currentProfile.role} - ID: #{currentProfile.id.slice(0, 8)}</p>
            <p className="text-[11px] text-gray-400 mt-1 font-mono">Dat: {todayStr} ({timeRange.toUpperCase()})</p>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase">TOUT APÈL YO (TOTAL)</span>
              <PhoneCall className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-3xl font-black text-gray-900 dark:text-white">{totalCallsCount}</p>
            <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium mt-1">Apèl ou pase pandan seri sa</p>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase">KANTITE CLOSES (VENTES)</span>
              <Award className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-3xl font-black text-gray-900 dark:text-white">{totalCloses}</p>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium mt-1">Total lavant ki konfime</p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-blue-800 dark:text-blue-400 uppercase">CHIFFRE D'AFFAIRES (USD)</span>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-black text-gray-900 dark:text-white">${totalRevenue.toLocaleString()} USD</p>
            <p className="text-[11px] text-blue-700 dark:text-blue-400 font-medium mt-1">Revenu ou anplwaye bay biznis la</p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-purple-800 dark:text-purple-400 uppercase">TAUX DE CONVERSION</span>
              <CheckCircle2 className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-black text-gray-900 dark:text-white">{conversionRate}%</p>
            <p className="text-[11px] text-purple-700 dark:text-purple-400 font-medium mt-1">Pousantaj lavant sou tout apèl</p>
          </div>

        </div>

        {/* Call Status Breakdown Table */}
        <div className="space-y-3">
          <h4 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
            📊 REPATISYON APÈL YO PA ESTATI (CALL STATUS DETAILS)
          </h4>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
              <p className="text-xs font-semibold text-gray-500">Close (Fòmasyon $199 & $1k)</p>
              <p className="text-xl font-bold text-amber-600 mt-1">{totalCloses}</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
              <p className="text-xs font-semibold text-gray-500">Gen Follow-up Ranvwaye</p>
              <p className="text-xl font-bold text-blue-600 mt-1">{followUpCallsCount}</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
              <p className="text-xs font-semibold text-gray-500">Asistans / Sipò Bay</p>
              <p className="text-xl font-bold text-emerald-600 mt-1">{assistanceCallsCount}</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
              <p className="text-xs font-semibold text-gray-500">Mwen pale ak li</p>
              <p className="text-xl font-bold text-purple-600 mt-1">{spokenCallsCount}</p>
            </div>
          </div>
        </div>

        {/* Detailed Call History Log inside Report */}
        <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-700">
          <h4 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
            📋 LIS APÈL AK LEADS KI RESAN YO ({filteredCalls.length})
          </h4>

          <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-xl">
            <table className="w-full text-left text-xs text-gray-700 dark:text-gray-300">
              <thead className="bg-gray-100 dark:bg-gray-900 uppercase font-bold text-gray-500">
                <tr>
                  <th className="p-3">Dat ak Lè</th>
                  <th className="p-3">Moun/Lead</th>
                  <th className="p-3">Nimewo Telefòn</th>
                  <th className="p-3">Estati Apèl</th>
                  <th className="p-3 text-right">pwogram/Nòt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredCalls.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-gray-400">
                      Pa gen okenn done apèl anrejistre pou peryòd sa ({timeRange}).
                    </td>
                  </tr>
                ) : (
                  filteredCalls.slice(0, 15).map((call, idx) => {
                    const leadObj = myLeads.find((l) => l.id === call.lead_id);
                    return (
                      <tr key={call.id || idx} className="hover:bg-gray-50/50">
                        <td className="p-3 font-mono text-gray-500">
                          {call.created_at ? call.created_at.replace('T', ' ').slice(0, 16) : todayStr}
                        </td>
                        <td className="p-3 font-bold text-gray-900 dark:text-white">
                          {leadObj?.full_name || call.lead?.full_name || 'Lead Ajan'}
                        </td>
                        <td className="p-3 font-mono text-amber-600 font-semibold">
                          {leadObj?.phone || call.lead?.phone || 'Telefòn'}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                            {call.status}
                          </span>
                        </td>
                        <td className="p-3 text-right font-medium text-gray-600 dark:text-gray-300">
                          {call.closed_program || call.assistance_note || call.notes || '-'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Signature */}
        <div className="pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-[10px] text-gray-400">
          <p>MR DAMICE CRM PLATFORM - RAPÒ PÈFÒMANS OTO-JENERE</p>
          <p>Paj 1 / 1 - Signature Worker: {currentProfile.full_name}</p>
        </div>

      </div>

    </div>
  );
}

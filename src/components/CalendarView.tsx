'use client';

import React, { useState } from 'react';
import { Lead } from '@/types/crm';
import { Calendar as CalendarIcon, Clock, Phone, User, CheckCircle2, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface CalendarViewProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
}

export function CalendarView({ leads, onSelectLead }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Filter leads that have follow up dates
  const followUpLeads = leads.filter((l) => l.current_status === 'Gen follow up');

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfWeek = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const monthNames = [
    'Janvye', 'Fevriye', 'Mas', 'Avril', 'Me', 'Jwen',
    'Jiyè', 'Out', 'Setanb', 'Oktòb', 'Novanb', 'Desanb'
  ];

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 rounded-2xl p-6 space-y-6 shadow-sm">
      
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 dark:border-gray-700 pb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-amber-500" />
            Kalandriye Follow-Up Apèl yo
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Swiv dat ak lè ou gen pou w rele kliyan ki gen *Gen follow up* yo
          </p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900 p-1.5 rounded-xl border border-gray-200 dark:border-gray-700">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-sm font-bold text-gray-900 dark:text-white min-w-[120px] text-center">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>

          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid Days */}
      <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-gray-500 dark:text-gray-400 pb-2">
        <div>Dim</div>
        <div>Len</div>
        <div>Mad</div>
        <div>Mèk</div>
        <div>Jed</div>
        <div>Van</div>
        <div>Sam</div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {/* Empty slots before first day */}
        {Array.from({ length: firstDayOfWeek }).map((_, index) => (
          <div key={`empty-${index}`} className="h-24 bg-gray-50/50 dark:bg-gray-900/30 rounded-xl border border-dashed border-gray-200/50 dark:border-gray-800/50 opacity-40" />
        ))}

        {/* Days of Month */}
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const dayNumber = index + 1;
          const isToday =
            dayNumber === new Date().getDate() &&
            currentDate.getMonth() === new Date().getMonth() &&
            currentDate.getFullYear() === new Date().getFullYear();

          return (
            <div
              key={`day-${dayNumber}`}
              className={`h-28 p-2 rounded-xl border flex flex-col justify-between transition-all ${
                isToday
                  ? 'bg-amber-500/10 border-amber-500/50 font-bold'
                  : 'bg-white dark:bg-gray-900/60 border-gray-200/80 dark:border-gray-700/80'
              }`}
            >
              <div className="flex justify-between items-center text-xs">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${
                    isToday
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {dayNumber}
                </span>
              </div>

              {/* Followup items count badge */}
              <div className="space-y-1 overflow-y-auto max-h-16">
                {followUpLeads.slice(0, 2).map((lead) => (
                  <button
                    key={lead.id}
                    onClick={() => onSelectLead(lead)}
                    className="w-full text-[10px] p-1 bg-amber-500/20 text-amber-800 dark:text-amber-300 rounded-lg truncate text-left font-semibold hover:bg-amber-500 hover:text-white transition-colors"
                  >
                    📞 {lead.full_name}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}

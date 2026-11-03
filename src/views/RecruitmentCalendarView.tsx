/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Clock,
  MailCheck,
  Building,
  Filter,
} from 'lucide-react';
import { useRecruitment } from '../context/RecruitmentContext';
import { RecruitmentRecord } from '../types';

interface CalendarEvent {
  id: string;
  type: 'DOJ' | 'OFFER' | 'REQ';
  date: string;
  title: string;
  company: string;
  assistedBy: string;
  record: RecruitmentRecord;
}

export const RecruitmentCalendarView: React.FC = () => {
  const { records } = useRecruitment();

  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(9); // 0-indexed: 9 = October
  const [selectedDayEvents, setSelectedDayEvents] = useState<{ day: number; events: CalendarEvent[] } | null>(null);

  // Compile all calendar events from records
  const allEvents = useMemo(() => {
    const list: CalendarEvent[] = [];

    for (const r of records) {
      if (r.doj) {
        list.push({
          id: `doj-${r.id}`,
          type: 'DOJ',
          date: r.doj,
          title: `Joining: ${r.positionTitle}`,
          company: r.company,
          assistedBy: r.recruitmentAssistedBy,
          record: r,
        });
      }
      if (r.offerLetterDate) {
        list.push({
          id: `offer-${r.id}`,
          type: 'OFFER',
          date: r.offerLetterDate,
          title: `Offer Issued: ${r.positionTitle}`,
          company: r.company,
          assistedBy: r.recruitmentAssistedBy,
          record: r,
        });
      }
      if (r.requisitionDate) {
        list.push({
          id: `req-${r.id}`,
          type: 'REQ',
          date: r.requisitionDate,
          title: `Requisition: ${r.positionTitle}`,
          company: r.company,
          assistedBy: r.recruitmentAssistedBy,
          record: r,
        });
      }
    }

    return list;
  }, [records]);

  // Calendar Math
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  const monthName = new Date(currentYear, currentMonth, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <CalendarDays className="w-6 h-6 text-blue-600" />
            <span>Recruitment Calendar</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Key joining milestones, offer letter dates, and requisition initiations mapped across the recruitment cycle.
          </p>
        </div>

        {/* Month Navigation & Legend */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xs">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-xs px-3 text-slate-800 dark:text-slate-200 min-w-[120px] text-center">
              {monthName}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-slate-700 dark:text-slate-300">Date of Joining (DOJ)</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
          <span className="text-slate-700 dark:text-slate-300">Offer Letter Issued</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span className="text-slate-700 dark:text-slate-300">Requisition Initiated</span>
        </span>
      </div>

      {/* Calendar Grid */}
      <div className="glass-card-3d rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        {/* Day of Week Headers */}
        <div className="grid grid-cols-7 bg-slate-100/70 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-700 text-center text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 py-3">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Days cells */}
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-slate-800">
          {/* Empty cells before month starts */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[105px] bg-slate-50/30 dark:bg-slate-950/20 p-2" />
          ))}

          {/* Month Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dayStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(
              dayNum
            ).padStart(2, '0')}`;

            const dayEvents = allEvents.filter((e) => e.date === dayStr);

            return (
              <div
                key={dayNum}
                onClick={() => dayEvents.length > 0 && setSelectedDayEvents({ day: dayNum, events: dayEvents })}
                className={`min-h-[105px] p-2 flex flex-col justify-between transition-colors ${
                  dayEvents.length > 0 ? 'cursor-pointer hover:bg-blue-50/30 dark:hover:bg-slate-800/40' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                    {dayNum}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 font-bold">
                      {dayEvents.length}
                    </span>
                  )}
                </div>

                {/* Event Tags */}
                <div className="space-y-1 mt-1 overflow-hidden max-h-16">
                  {dayEvents.slice(0, 3).map((e) => (
                    <div
                      key={e.id}
                      className={`text-[10px] px-1.5 py-0.5 rounded truncate font-medium ${
                        e.type === 'DOJ'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300'
                          : e.type === 'OFFER'
                          ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                      }`}
                    >
                      {e.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <span className="text-[9px] text-slate-400 font-semibold block text-center">
                      +{dayEvents.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Event Drawer / Modal */}
      {selectedDayEvents && (
        <div className="glass-card-3d p-5 rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50/30 dark:bg-blue-950/20 space-y-3">
          <div className="flex items-center justify-between border-b border-blue-200/60 dark:border-blue-900/40 pb-2">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Recruitment Activities for {monthName.split(' ')[0]} {selectedDayEvents.day}, {currentYear}
            </h4>
            <button
              onClick={() => setSelectedDayEvents(null)}
              className="text-xs text-blue-600 hover:underline font-semibold"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {selectedDayEvents.events.map((e) => (
              <div
                key={e.id}
                className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase font-mono ${
                      e.type === 'DOJ'
                        ? 'bg-emerald-100 text-emerald-800'
                        : e.type === 'OFFER'
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {e.type === 'DOJ' ? 'Joining Date' : e.type === 'OFFER' ? 'Offer Letter' : 'Requisition'}
                  </span>
                  <span className="font-mono font-bold text-blue-600">{e.company}</span>
                </div>
                <div className="font-bold text-slate-900 dark:text-white leading-tight">
                  {e.record.positionTitle}
                </div>
                <div className="text-[11px] text-slate-500">
                  {e.record.department} • Assisted by: {e.assistedBy}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useRecruitment } from '../../context/RecruitmentContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseConfigModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { connectionState, records } = useRecruitment();

  const [supabaseUrl, setSupabaseUrl] = useState(() => {
    return localStorage.getItem('rghr_supabase_url') || 'https://xyzcompany.supabase.co';
  });
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(() => {
    return localStorage.getItem('rghr_supabase_anon_key') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
  });
  const [copiedSQL, setCopiedSQL] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const sampleSQL = `-- RG HR Database Schema for Supabase
CREATE TABLE IF NOT EXISTS recruitment_records (
  id TEXT PRIMARY KEY,
  sl INT NOT NULL,
  position_title TEXT NOT NULL,
  department TEXT NOT NULL,
  requisition_date DATE NOT NULL,
  requisition_submitted_by TEXT,
  hod TEXT,
  company TEXT NOT NULL,
  vacancy INT DEFAULT 1,
  recruitment_type TEXT NOT NULL,
  replacement_of_whom TEXT,
  replacement_employee_salary NUMERIC,
  offer_letter_date DATE,
  doj DATE,
  status TEXT NOT NULL,
  time_to_fill INT,
  pending_age INT,
  remarks TEXT,
  recruitment_assisted_by TEXT NOT NULL,
  checklist JSONB,
  last_updated_by TEXT,
  last_updated_at TIMESTAMPTZ DEFAULT NOW(),
  version INT DEFAULT 1
);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE recruitment_records;`;

  const handleCopySQL = () => {
    navigator.clipboard.writeText(sampleSQL);
    setCopiedSQL(true);
    setTimeout(() => setCopiedSQL(false), 2000);
  };

  const handleSave = () => {
    localStorage.setItem('rghr_supabase_url', supabaseUrl);
    localStorage.setItem('rghr_supabase_anon_key', supabaseAnonKey);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Supabase & Real-Time Cloud Database
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                PostgreSQL persistence & bi-directional synchronization settings.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
          {/* Active Status Banner */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-xs shadow-emerald-400" />
              <div>
                <span className="font-bold text-slate-900 dark:text-white">
                  Real-time Synchronization Engine: Active
                </span>
                <p className="text-[11px] text-slate-500">
                  {records.length} records persistently synchronized across all 4 HR employees and leadership.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold">
              PORT 3000 WS
            </span>
          </div>

          {/* Supabase Connection Details */}
          <div className="space-y-3">
            <h4 className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
              Custom Supabase Project Connection (Optional)
            </h4>
            <p className="text-slate-500">
              You can connect this applet directly to your own Supabase project by entering your credentials below:
            </p>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Supabase Project URL
              </label>
              <input
                type="text"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://your-project.supabase.co"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Supabase Anon / Public Key
              </label>
              <input
                type="password"
                value={supabaseAnonKey}
                onChange={(e) => setSupabaseAnonKey(e.target.value)}
                placeholder="eyJhbGciOi..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs dark:text-white"
              />
            </div>

            {savedSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Supabase configuration credentials saved successfully.</span>
              </div>
            )}
          </div>

          {/* Supabase SQL DDL Schema */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 dark:text-slate-300">
                Ready-to-Paste Supabase SQL Schema:
              </span>
              <button
                onClick={handleCopySQL}
                className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedSQL ? 'Copied to Clipboard!' : 'Copy SQL'}</span>
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto max-h-40 border border-slate-800">
              {sampleSQL}
            </pre>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600"
            >
              Close
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs"
            >
              Save Credentials
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

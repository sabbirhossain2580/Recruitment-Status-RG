/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  Building,
  Users,
  Timer,
  ClockAlert,
  Calendar,
  Layers,
  RotateCcw,
} from 'lucide-react';
import { useRecruitment } from '../context/RecruitmentContext';
import { useAuth } from '../context/AuthContext';
import { exportToExcel, exportToPDF, parseExcelFile } from '../utils/exportUtils';
import { RecruitmentRecord } from '../types';

export const ReportsExportView: React.FC = () => {
  const {
    records,
    stats,
    hrMetrics,
    companyStats,
    departmentStats,
    batchImportRecords,
    resetToBaseline,
  } = useRecruitment();
  const { isEditor } = useAuth();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Import state
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [importPreview, setImportPreview] = useState<Partial<RecruitmentRecord>[] | null>(null);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [importStatusMessage, setImportStatusMessage] = useState<string | null>(null);

  // Report generation handlers
  const handleExportFullExcel = () => {
    exportToExcel(records, `RG_HR_Recruitment_Full_Database_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleExportFullPDF = () => {
    exportToPDF(records, stats, 'RG_HR_Recruitment_Executive_Report');
  };

  const handleExportCategoryExcel = (category: string) => {
    let filtered = records;
    if (category === 'joined') {
      filtered = records.filter((r) => r.status === 'Joined');
    } else if (category === 'ongoing') {
      filtered = records.filter((r) => r.status === 'Ongoing');
    } else if (category === 'pending') {
      filtered = records.filter((r) => r.status === 'Ongoing' || r.status === 'Held Up');
    }

    exportToExcel(
      filtered,
      `RG_HR_Report_${category.toUpperCase()}_${new Date().toISOString().split('T')[0]}.xlsx`
    );
  };

  // Excel File Upload & Parser
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsingFile(true);
    setImportStatusMessage(null);

    try {
      const parsed = await parseExcelFile(file);
      if (parsed.length === 0) {
        alert('No recruitment records could be parsed from the file.');
      } else {
        setImportPreview(parsed);
      }
    } catch (err: any) {
      alert(`Error reading Excel file: ${err.message}`);
    } finally {
      setIsParsingFile(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!importPreview || importPreview.length === 0) return;
    if (!isEditor) {
      alert('Permission Denied: View-only users cannot import records.');
      return;
    }

    try {
      await batchImportRecords(importPreview, importMode);
      setImportStatusMessage(
        `Successfully imported ${importPreview.length} records into live database (mode: ${importMode}).`
      );
      setImportPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      alert(`Import error: ${err.message}`);
    }
  };

  const handleResetBaseline = async () => {
    if (confirm('Are you sure you want to restore the authentic 108 records baseline (98 Joined, 9 Ongoing, 1 Held Up)?')) {
      await resetToBaseline();
      alert('Database restored to original 108 records baseline.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
            <span>Reports, Excel Import & Executive Export</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Export standardized spreadsheets and PDF summaries for leadership, or import external Excel files (Book1.xlsx MRF worksheet).
          </p>
        </div>

        {/* Global Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportFullExcel}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Download All Records (.xlsx)</span>
          </button>

          <button
            onClick={handleExportFullPDF}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4" />
            <span>Executive PDF</span>
          </button>
        </div>
      </div>

      {/* 6 Report Generation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Report 1: Monthly Recruitment Report */}
        <div className="glass-card-3d p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 text-blue-600 dark:text-blue-400 mb-2">
              <Calendar className="w-5 h-5" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                1. Monthly Recruitment Report
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Breakdown of requisitions raised, candidate joining milestones, and ongoing pipeline for each calendar month.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-mono">10 Months Tracked</span>
            <button
              onClick={() => handleExportCategoryExcel('monthly')}
              className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
            >
              Export Excel &rarr;
            </button>
          </div>
        </div>

        {/* Report 2: Department-wise Report */}
        <div className="glass-card-3d p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400 mb-2">
              <Users className="w-5 h-5" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                2. Department-wise Report
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Departmental hiring volume, average turnaround velocity, and open requisitions per business unit.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-mono">
              {departmentStats.length} Departments
            </span>
            <button
              onClick={() => handleExportCategoryExcel('department')}
              className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
            >
              Export Excel &rarr;
            </button>
          </div>
        </div>

        {/* Report 3: Company-wise Report */}
        <div className="glass-card-3d p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 mb-2">
              <Building className="w-5 h-5" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                3. Company-wise Report
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Recruitment statistics separated across RAL, SGL, PSL, MTSL, RDL, and RBL subsidiaries.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-mono">6 Group Companies</span>
            <button
              onClick={() => handleExportCategoryExcel('company')}
              className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
            >
              Export Excel &rarr;
            </button>
          </div>
        </div>

        {/* Report 4: Employee-wise Performance Report */}
        <div className="glass-card-3d p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 text-purple-600 dark:text-purple-400 mb-2">
              <Users className="w-5 h-5" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                4. Employee Performance Report
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Individual scorecard for Quazi Nuzhat Rahman, Sabbir Hossain, Fariha Nasmi, and Maisha Islam with leadership ratings.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-mono">4 HR Profiles</span>
            <button
              onClick={() => handleExportCategoryExcel('employee')}
              className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
            >
              Export Excel &rarr;
            </button>
          </div>
        </div>

        {/* Report 5: Time-to-Fill Report */}
        <div className="glass-card-3d p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 text-cyan-600 dark:text-cyan-400 mb-2">
              <Timer className="w-5 h-5" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                5. Time-to-Fill Analysis Report
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Turnaround duration from Requisition Date to Date of Joining (DOJ). Excludes ongoing and cancelled requisitions.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-mono">
              Avg: {stats.avgTimeToFillDays} Days
            </span>
            <button
              onClick={() => handleExportCategoryExcel('joined')}
              className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
            >
              Export Excel &rarr;
            </button>
          </div>
        </div>

        {/* Report 6: Pending Recruitment Report */}
        <div className="glass-card-3d p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400 mb-2">
              <ClockAlert className="w-5 h-5" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                6. Pending Recruitment Report
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Urgency list of all Ongoing and Held Up requisitions categorized by pending age (&gt;30, &gt;60, &gt;90 days).
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-mono">
              {stats.ongoingRecruitment + stats.heldUpRecruitment} Active Cases
            </span>
            <button
              onClick={() => handleExportCategoryExcel('pending')}
              className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
            >
              Export Excel &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Section: Excel Import (Book1.xlsx MRF worksheet) */}
      <div className="glass-card-3d p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-600" />
              <span>Import Existing Excel Data (Book1.xlsx MRF Worksheet)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload existing Excel spreadsheets to import or update recruitment history without duplicating records.
            </p>
          </div>

          <button
            onClick={handleResetBaseline}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
            title="Restore original 108 records baseline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Baseline (108 records)</span>
          </button>
        </div>

        {importStatusMessage && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{importStatusMessage}</span>
          </div>
        )}

        {/* Upload Box */}
        <div className="p-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 bg-slate-50/50 dark:bg-slate-800/20 text-center transition-colors">
          <input
            type="file"
            ref={fileInputRef}
            accept=".xlsx,.xls,.csv"
            onChange={handleFileUpload}
            className="hidden"
            id="excel-file-input"
          />
          <label htmlFor="excel-file-input" className="cursor-pointer block space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center mx-auto shadow-sm">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-xs sm:text-sm text-blue-600 hover:underline">
                Click to browse Book1.xlsx or drag and drop
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Supports .xlsx, .xls, .csv. Automatically parses MRF columns, dates, statuses, and salaries.
              </p>
            </div>
          </label>
        </div>

        {/* Parsed Preview */}
        {importPreview && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                  Preview: {importPreview.length} records parsed from file
                </span>
                <p className="text-[11px] text-slate-500">
                  Validate mapped fields before saving to the central server.
                </p>
              </div>

              {/* Mode Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Mode:</span>
                <select
                  value={importMode}
                  onChange={(e) => setImportMode(e.target.value as any)}
                  className="px-2.5 py-1 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold"
                >
                  <option value="append">Append (Avoid Duplicates)</option>
                  <option value="replace">Replace Entire Database</option>
                </select>
              </div>
            </div>

            {/* Quick table preview */}
            <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 dark:bg-slate-800 text-[10px] uppercase font-bold text-slate-500 sticky top-0">
                  <tr>
                    <th className="p-2">SL</th>
                    <th className="p-2">Position Title</th>
                    <th className="p-2">Dept</th>
                    <th className="p-2">Company</th>
                    <th className="p-2">Req Date</th>
                    <th className="p-2">DOJ</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                  {importPreview.slice(0, 10).map((r, i) => (
                    <tr key={i}>
                      <td className="p-2 font-bold">{r.sl || i + 1}</td>
                      <td className="p-2 font-sans">{r.positionTitle}</td>
                      <td className="p-2 font-sans">{r.department}</td>
                      <td className="p-2 font-bold text-blue-600">{r.company}</td>
                      <td className="p-2 text-slate-500">{r.requisitionDate}</td>
                      <td className="p-2 text-emerald-600">{r.doj || 'Pending'}</td>
                      <td className="p-2">{r.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setImportPreview(null)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmImport}
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-600/20"
              >
                Confirm & Import Records
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

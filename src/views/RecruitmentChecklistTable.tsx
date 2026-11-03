/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Plus,
  Eye,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  PauseCircle,
  XCircle,
  AlertCircle,
  FileSpreadsheet,
  FileText,
  ChevronLeft,
  ChevronRight,
  Lock,
  Building,
  User,
  CheckSquare,
  Maximize,
  Minimize,
} from 'lucide-react';
import { RecruitmentRecord, RecruitmentStatus, CompanyCode } from '../types';
import { useRecruitment } from '../context/RecruitmentContext';
import { useAuth } from '../context/AuthContext';
import { exportToExcel, exportToPDF } from '../utils/exportUtils';
import { COMPANIES, HR_EMPLOYEE_NAMES } from '../data/authUsers';
import { DeleteConfirmationModal } from '../components/modals/DeleteConfirmationModal';
import { toggleBrowserFullscreen, isCurrentlyFullscreen } from '../utils/fullscreenUtils';

interface Props {
  onOpenAddModal: () => void;
  onOpenEditModal: (record: RecruitmentRecord) => void;
  onOpenDetailModal: (record: RecruitmentRecord) => void;
}

export const RecruitmentChecklistTable: React.FC<Props> = ({
  onOpenAddModal,
  onOpenEditModal,
  onOpenDetailModal,
}) => {
  const { records, stats, deleteRecord, updateRecord, isRecordLockedByOther, recruiterNames } = useRecruitment();
  const { isEditor, currentUser, canDelete } = useAuth();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [companyFilter, setCompanyFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [employeeFilter, setEmployeeFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [dateFilterStart, setDateFilterStart] = useState<string>('');
  const [dateFilterEnd, setDateFilterEnd] = useState<string>('');

  // Sorting
  const [sortField, setSortField] = useState<keyof RecruitmentRecord>('sl');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Deletion state
  const [recordToDelete, setRecordToDelete] = useState<RecruitmentRecord | null>(null);
  const [deleteSuccessToast, setDeleteSuccessToast] = useState<string | null>(null);

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(isCurrentlyFullscreen());
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleSort = (field: keyof RecruitmentRecord) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filtered & Sorted Records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matches =
          r.positionTitle.toLowerCase().includes(term) ||
          r.department.toLowerCase().includes(term) ||
          r.recruitmentAssistedBy.toLowerCase().includes(term) ||
          r.hod.toLowerCase().includes(term) ||
          String(r.sl).includes(term) ||
          r.company.toLowerCase().includes(term) ||
          r.remarks.toLowerCase().includes(term);
        if (!matches) return false;
      }

      if (companyFilter !== 'ALL' && r.company !== companyFilter) return false;
      if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
      if (
        employeeFilter !== 'ALL' &&
        !r.recruitmentAssistedBy.toLowerCase().includes(employeeFilter.toLowerCase())
      ) {
        return false;
      }
      if (typeFilter !== 'ALL' && r.recruitmentType !== typeFilter) return false;
      if (dateFilterStart && r.requisitionDate < dateFilterStart) return false;
      if (dateFilterEnd && r.requisitionDate > dateFilterEnd) return false;

      return true;
    });
  }, [records, searchTerm, companyFilter, statusFilter, employeeFilter, typeFilter, dateFilterStart, dateFilterEnd]);

  const sortedRecords = useMemo(() => {
    return [...filteredRecords].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === 'string') {
        return sortDirection === 'asc'
          ? (aVal as string).localeCompare(bVal as string)
          : (bVal as string).localeCompare(aVal as string);
      }

      return sortDirection === 'asc'
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });
  }, [filteredRecords, sortField, sortDirection]);

  // Pagination Slice
  const totalPages = Math.ceil(sortedRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRecords.slice(start, start + pageSize);
  }, [sortedRecords, currentPage, pageSize]);

  const handleQuickStatusChange = async (record: RecruitmentRecord, newStatus: RecruitmentStatus) => {
    try {
      await updateRecord({
        ...record,
        status: newStatus,
        doj: newStatus === 'Joined' && !record.doj ? new Date().toISOString().split('T')[0] : record.doj,
      });
    } catch (err: any) {
      console.error('Error updating status:', err);
    }
  };

  const handleConfirmDeleteRecord = async () => {
    if (!recordToDelete) return;
    const sl = recordToDelete.sl;
    const title = recordToDelete.positionTitle;
    await deleteRecord(recordToDelete.id);
    setRecordToDelete(null);
    setDeleteSuccessToast(`Requisition SL #${sl} ("${title}") was successfully deleted.`);
    setTimeout(() => setDeleteSuccessToast(null), 4000);
  };

  const getStatusBadge = (status: RecruitmentStatus) => {
    switch (status) {
      case 'Joined':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-200 border-2 border-emerald-500 shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Joined
          </span>
        );
      case 'Ongoing':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-950 dark:bg-amber-950 dark:text-amber-200 border-2 border-amber-500 shadow-xs">
            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            Ongoing
          </span>
        );
      case 'Held Up':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-purple-100 text-purple-950 dark:bg-purple-950 dark:text-purple-200 border-2 border-purple-500 shadow-xs">
            <PauseCircle className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            Held Up
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-slate-200 border-2 border-slate-500 shadow-xs">
            <XCircle className="w-3.5 h-3.5 text-slate-600" />
            Cancelled
          </span>
        );
      case 'Did not Join':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-950 dark:bg-rose-950 dark:text-rose-200 border-2 border-rose-500 shadow-xs">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            Did not Join
          </span>
        );
    }
  };

  return (
    <div className="space-y-5">
      {/* Toast Notification on Deletion */}
      {deleteSuccessToast && (
        <div className="p-3.5 rounded-2xl bg-emerald-500 text-white font-bold text-xs shadow-xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{deleteSuccessToast}</span>
          </div>
          <button onClick={() => setDeleteSuccessToast(null)} className="text-white hover:opacity-80">
            &times;
          </button>
        </div>
      )}

      {/* Page Header with High-Contrast Navy Brand Header */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border-2 border-slate-800">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>RG HR – Recruitment Status & Checklist</span>
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-bold bg-blue-500 text-white shadow-xs">
              {filteredRecords.length} / {records.length} Records
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Searchable, editable master recruitment table. Simultaneous multi-user live tracking with automated turnaround times.
          </p>
        </div>

        {/* Action Buttons: Add, Export Excel, Export PDF */}
        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={onOpenAddModal}
            className="px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Requisition</span>
          </button>

          <button
            onClick={() => exportToExcel(filteredRecords)}
            className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/25 flex items-center gap-1.5 transition-all cursor-pointer"
            title="Download formatted Excel file matching original MRF structure"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={() => exportToPDF(filteredRecords, stats)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            title="Download executive PDF report"
          >
            <FileText className="w-4 h-4" />
            <span>Export PDF</span>
          </button>

          <button
            onClick={async () => {
              await toggleBrowserFullscreen();
              setIsFullscreen(isCurrentlyFullscreen());
            }}
            className="px-3.5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
            title={isFullscreen ? 'Exit Full Screen' : 'Toggle Full Screen (সম্পূর্ণ স্ক্রিন / Edge-to-Edge)'}
          >
            {isFullscreen ? (
              <>
                <Minimize className="w-4 h-4" />
                <span>Exit Full Screen</span>
              </>
            ) : (
              <>
                <Maximize className="w-4 h-4" />
                <span>Full Screen (সম্পূর্ণ স্ক্রিন)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* High-Contrast Filter & Search Bar */}
      <div className="p-5 rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-md space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search Input */}
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold" />
            <input
              type="text"
              placeholder="Search position title, department, HOD, SL..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 focus:outline-hidden focus:border-blue-600 text-slate-900 dark:text-white"
            />
          </div>

          {/* Company Filter */}
          <div>
            <select
              value={companyFilter}
              onChange={(e) => {
                setCompanyFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-2 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 focus:outline-hidden focus:border-blue-600 text-slate-900 dark:text-white font-mono"
            >
              <option value="ALL">All Companies (6)</option>
              {COMPANIES.map((co) => (
                <option key={co} value={co}>
                  {co}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-2 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 focus:outline-hidden focus:border-blue-600 text-slate-900 dark:text-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="Joined">Joined (Completed)</option>
              <option value="Ongoing">Ongoing (Pending)</option>
              <option value="Held Up">Held Up</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Did not Join">Did not Join</option>
            </select>
          </div>

          {/* HR Employee Filter */}
          <div>
            <select
              value={employeeFilter}
              onChange={(e) => {
                setEmployeeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-2 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 focus:outline-hidden focus:border-blue-600 text-slate-900 dark:text-white"
            >
              <option value="ALL">All HR Officers</option>
              {recruiterNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Recruitment Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-2 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 focus:outline-hidden focus:border-blue-600 text-slate-900 dark:text-white"
            >
              <option value="ALL">All Requisition Types</option>
              <option value="New Recruitment">New Recruitment</option>
              <option value="Replacement">Replacement</option>
            </select>
          </div>
        </div>

        {/* Date Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t-2 border-slate-200 dark:border-slate-800 text-xs font-medium">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-700 dark:text-slate-300 font-bold">Filter Requisition Date:</span>
            <input
              type="date"
              value={dateFilterStart}
              onChange={(e) => setDateFilterStart(e.target.value)}
              className="px-2.5 py-1 text-xs font-mono font-bold rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
            />
            <span className="text-slate-500 font-bold">to</span>
            <input
              type="date"
              value={dateFilterEnd}
              onChange={(e) => setDateFilterEnd(e.target.value)}
              className="px-2.5 py-1 text-xs font-mono font-bold rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
            />
            {(dateFilterStart || dateFilterEnd) && (
              <button
                onClick={() => {
                  setDateFilterStart('');
                  setDateFilterEnd('');
                }}
                className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline"
              >
                Clear Dates
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
            <span>Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 font-mono font-bold"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table with Deep Solid Navy Blue Headers & High Contrast */}
      <div className="rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              {/* Solid Navy Blue Header for maximum clarity */}
              <tr className="bg-slate-900 text-white border-b-2 border-slate-800 font-black tracking-wider uppercase text-[11px]">
                <th
                  onClick={() => handleSort('sl')}
                  className="py-3.5 px-3 cursor-pointer hover:bg-slate-800 font-mono w-14 text-center border-r border-slate-800"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>SL</span>
                    <ArrowUpDown className="w-3 h-3 text-cyan-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('positionTitle')}
                  className="py-3.5 px-3.5 cursor-pointer hover:bg-slate-800 min-w-[210px] border-r border-slate-800"
                >
                  <div className="flex items-center gap-1">
                    <span>Position Title</span>
                    <ArrowUpDown className="w-3 h-3 text-cyan-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('department')}
                  className="py-3.5 px-3 cursor-pointer hover:bg-slate-800 min-w-[150px] border-r border-slate-800"
                >
                  <div className="flex items-center gap-1">
                    <span>Department & HOD</span>
                    <ArrowUpDown className="w-3 h-3 text-cyan-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('company')}
                  className="py-3.5 px-2.5 cursor-pointer hover:bg-slate-800 text-center border-r border-slate-800"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Company</span>
                    <ArrowUpDown className="w-3 h-3 text-cyan-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('recruitmentType')}
                  className="py-3.5 px-2.5 cursor-pointer hover:bg-slate-800 text-center border-r border-slate-800"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Type</span>
                    <ArrowUpDown className="w-3 h-3 text-cyan-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('requisitionDate')}
                  className="py-3.5 px-3 cursor-pointer hover:bg-slate-800 border-r border-slate-800"
                >
                  <div className="flex items-center gap-1">
                    <span>Req Date</span>
                    <ArrowUpDown className="w-3 h-3 text-cyan-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('doj')}
                  className="py-3.5 px-3 cursor-pointer hover:bg-slate-800 border-r border-slate-800"
                >
                  <div className="flex items-center gap-1">
                    <span>DOJ (Joining)</span>
                    <ArrowUpDown className="w-3 h-3 text-cyan-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('status')}
                  className="py-3.5 px-3 cursor-pointer hover:bg-slate-800 text-center border-r border-slate-800"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Status</span>
                    <ArrowUpDown className="w-3 h-3 text-cyan-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('timeToFill')}
                  className="py-3.5 px-3 cursor-pointer hover:bg-slate-800 text-center border-r border-slate-800"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>TTF / Age</span>
                    <ArrowUpDown className="w-3 h-3 text-cyan-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('recruitmentAssistedBy')}
                  className="py-3.5 px-3 cursor-pointer hover:bg-slate-800 border-r border-slate-800"
                >
                  <div className="flex items-center gap-1">
                    <span>Assisted By</span>
                    <ArrowUpDown className="w-3 h-3 text-cyan-400" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-center min-w-[170px]">Actions (Edit / Delete)</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-200 dark:divide-slate-800 font-medium">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-14 text-center text-slate-500 font-semibold text-sm">
                    {records.length === 0 ? (
                      <div className="space-y-3 max-w-md mx-auto">
                        <CheckSquare className="w-12 h-12 text-blue-500 mx-auto opacity-70" />
                        <h4 className="text-base font-extrabold text-slate-800 dark:text-slate-200">
                          Recruitment Database is Clean & Empty (0 Records)
                        </h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          All sample requisitions have been deleted. You can now add authentic company recruitment requisitions or import an Excel file.
                        </p>
                        <div className="pt-2">
                          <button
                            onClick={onOpenAddModal}
                            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                            <span>+ Add First Requisition</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      'No recruitment records match the current filters.'
                    )}
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((r, rowIdx) => {
                  const lockedByOther = isRecordLockedByOther(r.id);
                  const isEven = rowIdx % 2 === 0;

                  return (
                    <tr
                      key={r.id}
                      className={`transition-colors border-b border-slate-200 dark:border-slate-800 ${
                        lockedByOther
                          ? 'bg-amber-100/60 dark:bg-amber-950/40'
                          : isEven
                          ? 'bg-white dark:bg-slate-900 hover:bg-blue-50/70 dark:hover:bg-slate-800/80'
                          : 'bg-slate-100/60 dark:bg-slate-800/40 hover:bg-blue-50/70 dark:hover:bg-slate-800/80'
                      }`}
                    >
                      {/* SL */}
                      <td className="py-3 px-3 font-mono font-black text-slate-900 dark:text-white text-center border-r border-slate-200 dark:border-slate-800">
                        #{r.sl}
                      </td>

                      {/* Position Title & Lock Indicator */}
                      <td className="py-3 px-3.5 border-r border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onOpenDetailModal(r)}
                            className="font-extrabold text-slate-950 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 text-left transition-colors cursor-pointer text-xs"
                          >
                            {r.positionTitle}
                          </button>

                          {lockedByOther && (
                            <span
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] bg-amber-200 dark:bg-amber-950 text-amber-950 dark:text-amber-200 border border-amber-400 shrink-0 font-bold"
                              title={`${lockedByOther.lockedByName} is editing this right now`}
                            >
                              <Lock className="w-2.5 h-2.5" />
                              {lockedByOther.lockedByName.split(' ')[0]} editing
                            </span>
                          )}
                        </div>

                        {r.recruitmentType === 'Replacement' && r.replacementOfWhom && (
                          <div className="text-[10px] text-purple-700 dark:text-purple-300 font-semibold mt-0.5">
                            Rep: {r.replacementOfWhom}
                          </div>
                        )}
                      </td>

                      {/* Department */}
                      <td className="py-3 px-3 text-slate-900 dark:text-slate-100 border-r border-slate-200 dark:border-slate-800">
                        <div className="font-bold">{r.department}</div>
                        <div className="text-[10px] text-slate-500 font-semibold">HOD: {r.hod}</div>
                      </td>

                      {/* Company */}
                      <td className="py-3 px-2.5 text-center border-r border-slate-200 dark:border-slate-800">
                        <span className="font-mono font-black text-xs px-2.5 py-1 rounded-md bg-blue-100 text-blue-950 dark:bg-blue-950 dark:text-blue-200 border border-blue-400">
                          {r.company}
                        </span>
                      </td>

                      {/* Type */}
                      <td className="py-3 px-2.5 text-center border-r border-slate-200 dark:border-slate-800">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                            r.recruitmentType === 'New Recruitment'
                              ? 'bg-blue-100 text-blue-900 dark:bg-blue-900/60 dark:text-blue-200 border border-blue-300'
                              : 'bg-purple-100 text-purple-900 dark:bg-purple-900/60 dark:text-purple-200 border border-purple-300'
                          }`}
                        >
                          {r.recruitmentType === 'New Recruitment' ? 'New' : 'Replacement'}
                        </span>
                      </td>

                      {/* Requisition Date */}
                      <td className="py-3 px-3 font-mono font-bold text-xs text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-800">
                        {r.requisitionDate}
                      </td>

                      {/* DOJ */}
                      <td className="py-3 px-3 font-mono border-r border-slate-200 dark:border-slate-800">
                        {r.doj ? (
                          <span className="text-emerald-800 dark:text-emerald-300 font-black text-xs bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-300">
                            {r.doj}
                          </span>
                        ) : (
                          <span className="text-slate-500 italic text-[11px] font-semibold">Pending</span>
                        )}
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3 px-3 text-center border-r border-slate-200 dark:border-slate-800">
                        <div className="inline-block relative">
                          <select
                            value={r.status}
                            onChange={(e) => handleQuickStatusChange(r, e.target.value as RecruitmentStatus)}
                            className="appearance-none cursor-pointer focus:outline-hidden text-center"
                            title="Click to quickly switch status"
                          >
                            <option value="Joined">Joined</option>
                            <option value="Ongoing">Ongoing</option>
                            <option value="Held Up">Held Up</option>
                            <option value="Cancelled">Cancelled</option>
                            <option value="Did not Join">Did not Join</option>
                          </select>
                          <div className="pointer-events-none">{getStatusBadge(r.status)}</div>
                        </div>
                      </td>

                      {/* Time to Fill / Pending Age */}
                      <td className="py-3 px-3 text-center font-mono border-r border-slate-200 dark:border-slate-800">
                        {r.status === 'Joined' && r.timeToFill !== null ? (
                          <span
                            className="inline-block px-2.5 py-1 rounded-md font-black text-xs bg-emerald-100 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-400"
                            title="Turnaround time (DOJ - Req Date)"
                          >
                            {r.timeToFill} Days
                          </span>
                        ) : r.status === 'Ongoing' || r.status === 'Held Up' ? (
                          <span
                            className={`inline-block px-2 py-0.5 rounded-md font-bold text-xs border ${
                              (r.pendingAge || 0) >= 60
                                ? 'bg-rose-100 text-rose-950 border-rose-400 dark:bg-rose-950 dark:text-rose-300'
                                : (r.pendingAge || 0) >= 30
                                ? 'bg-amber-100 text-amber-950 border-amber-400 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-slate-200 text-slate-900 border-slate-400 dark:bg-slate-800 dark:text-slate-200'
                            }`}
                            title="Pending Age from Requisition Date to today"
                          >
                            {r.pendingAge || 0}d pending
                          </span>
                        ) : (
                          <span className="text-slate-400 font-bold">—</span>
                        )}
                      </td>

                      {/* Recruitment Assisted By */}
                      <td className="py-3 px-3 border-r border-slate-200 dark:border-slate-800">
                        <div className="font-extrabold text-slate-900 dark:text-white">
                          {r.recruitmentAssistedBy}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          Last: {r.lastUpdatedBy?.split(' ')[0] || 'System'}
                        </div>
                      </td>

                      {/* Prominent High-Visibility Action Buttons: View, Edit, DELETE */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {/* View Detail button */}
                          <button
                            onClick={() => onOpenDetailModal(r)}
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-300 transition-colors cursor-pointer"
                            title="View Checklist & Full Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit button */}
                          <button
                            onClick={() => onOpenEditModal(r)}
                            className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white border border-indigo-300 transition-colors cursor-pointer"
                            title="Edit Requisition Record"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* PROMINENT DELETE BUTTON WITH RED BADGE */}
                          <button
                            onClick={() => setRecordToDelete(r)}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border-2 border-rose-300 hover:border-rose-600 transition-all font-bold text-xs flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95"
                            title={`Delete requisition SL #${r.sl}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Footer */}
        <div className="p-4 bg-slate-100 dark:bg-slate-800/80 border-t-2 border-slate-300 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-800 dark:text-slate-200 font-bold">
            Showing{' '}
            <strong className="text-blue-600 font-black">
              {filteredRecords.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
            </strong>{' '}
            to{' '}
            <strong className="text-blue-600 font-black">
              {Math.min(currentPage * pageSize, filteredRecords.length)}
            </strong>{' '}
            of <strong className="text-slate-900 dark:text-white font-black">{filteredRecords.length}</strong>{' '}
            requisitions
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-200 transition-colors font-bold cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono font-black text-slate-900 dark:text-white px-3">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-200 transition-colors font-bold cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation In-App Modal */}
      <DeleteConfirmationModal
        isOpen={!!recordToDelete}
        onClose={() => setRecordToDelete(null)}
        onConfirmDelete={handleConfirmDeleteRecord}
        record={recordToDelete}
      />
    </div>
  );
};

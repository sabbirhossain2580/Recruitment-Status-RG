/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Users2,
  Award,
  Star,
  CheckCircle2,
  Send,
  Shield,
  UserPlus,
  UserMinus,
  RotateCcw,
  Trash2,
  X,
  AlertCircle,
} from 'lucide-react';
import { useRecruitment } from '../context/RecruitmentContext';
import { useAuth } from '../context/AuthContext';
import { HRPerformanceMetric } from '../types';

export const HRPerformanceDashboard: React.FC = () => {
  const { hrMetrics, ratings, submitRating, addEmployee, updateEmployeeStatus, removeEmployee } = useRecruitment();
  const { currentUser, canRate, canManageTeam } = useAuth();

  // Rating input state (Stars only, comments removed per user requirement)
  const [selectedEmpForRating, setSelectedEmpForRating] = useState<string | null>(null);
  const [ratingVal, setRatingVal] = useState<number>(5);
  const [isSubmittingRating, setIsSubmittingRating] = useState<boolean>(false);
  const [actionToast, setActionToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Add Employee Modal state (Restricted exclusively to Syeda Shaila Ashraf & Shahriyar Naiem)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEmpId, setNewEmpId] = useState('');
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpDesignation, setNewEmpDesignation] = useState('Executive, HR');
  const [newEmpEmail, setNewEmpEmail] = useState('');
  const [newEmpColor, setNewEmpColor] = useState('from-blue-600 to-indigo-700');
  const [isAddingEmp, setIsAddingEmp] = useState(false);

  // Confirmation modal for employee status / remove
  const [confirmModal, setConfirmModal] = useState<{
    type: 'resign' | 'reactivate' | 'delete';
    employeeId: string;
    employeeName: string;
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setActionToast({ message, type });
    setTimeout(() => setActionToast(null), 3500);
  };

  const handleOpenRating = (emp: HRPerformanceMetric) => {
    setSelectedEmpForRating(emp.employeeId);
    const existing = ratings.find(
      (r) => r.employeeId === emp.employeeId && r.ratedByEmpId === currentUser.employeeId
    );
    if (existing) {
      setRatingVal(existing.rating);
    } else {
      setRatingVal(5);
    }
  };

  const handleSaveRating = async (employeeId: string) => {
    if (!canRate) return;

    setIsSubmittingRating(true);
    try {
      await submitRating(employeeId, ratingVal);
      setSelectedEmpForRating(null);
      showToast(`Leadership rating of ${ratingVal} stars submitted successfully.`);
    } catch (err: any) {
      console.error('Error submitting rating:', err);
      showToast('Failed to submit rating.', 'error');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const handleAddEmployeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageTeam) {
      showToast('Permission denied: Only Syeda Shaila Ashraf and Shahriyar Naiem can add HR officers.', 'error');
      return;
    }

    if (!newEmpId.trim() || !newEmpName.trim()) {
      showToast('Employee ID and Name are required.', 'error');
      return;
    }

    setIsAddingEmp(true);
    try {
      await addEmployee({
        employeeId: newEmpId.trim(),
        name: newEmpName.trim(),
        designation: newEmpDesignation.trim() || 'Executive, HR',
        email: newEmpEmail.trim() || undefined,
        avatarColor: newEmpColor,
      });

      setIsAddModalOpen(false);
      setNewEmpId('');
      setNewEmpName('');
      setNewEmpDesignation('Executive, HR');
      setNewEmpEmail('');
      showToast(`Added ${newEmpName.trim()} to HR recruitment team.`);
    } catch (err: any) {
      showToast(err.message || 'Failed to add employee.', 'error');
    } finally {
      setIsAddingEmp(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmModal || !canManageTeam) return;

    const { type, employeeId, employeeName } = confirmModal;
    setConfirmModal(null);

    try {
      if (type === 'resign') {
        await updateEmployeeStatus(employeeId, 'resigned');
        showToast(`Marked ${employeeName} as Resigned.`);
      } else if (type === 'reactivate') {
        await updateEmployeeStatus(employeeId, 'active');
        showToast(`Reactivated ${employeeName}.`);
      } else if (type === 'delete') {
        await removeEmployee(employeeId);
        showToast(`Removed ${employeeName} from HR roster.`);
      }
    } catch (err: any) {
      showToast(err.message || 'Operation failed.', 'error');
    }
  };

  const avatarColorOptions = [
    { label: 'Indigo-Blue', val: 'from-indigo-600 to-blue-700' },
    { label: 'Blue-Cyan', val: 'from-blue-600 to-cyan-600' },
    { label: 'Emerald-Teal', val: 'from-emerald-600 to-teal-700' },
    { label: 'Rose-Pink', val: 'from-rose-600 to-pink-700' },
    { label: 'Purple-Violet', val: 'from-purple-600 to-violet-800' },
    { label: 'Amber-Orange', val: 'from-amber-600 to-orange-700' },
  ];

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {actionToast && (
        <div
          className={`p-3.5 rounded-2xl text-white font-bold text-xs shadow-xl flex items-center justify-between gap-3 animate-in fade-in ${
            actionToast.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionToast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            )}
            <span>{actionToast.message}</span>
          </div>
          <button onClick={() => setActionToast(null)} className="text-white hover:opacity-80">
            &times;
          </button>
        </div>
      )}

      {/* Header with Title and Add Employee (for Naiem & Shaila mam only) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Users2 className="w-6 h-6 text-blue-600" />
            <span>HR Recruitment Performance</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time recruiter turnaround analytics, completion velocity, and executive leadership ratings.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {canManageTeam && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-600/25 active:scale-95 transition-all flex items-center gap-2"
              title="Add a new recruitment officer to the HR roster"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Add HR Officer</span>
            </button>
          )}

          {canRate && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-semibold">
              <Award className="w-4 h-4 text-purple-600" />
              <span>Leadership Appraisal: {currentUser.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Employee Profiles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {hrMetrics.length === 0 ? (
          <div className="col-span-2 p-12 text-center rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
            <Users2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No HR Officers Found</h3>
            <p className="text-xs text-slate-500 mt-1">
              {canManageTeam
                ? 'Use the "+ Add HR Officer" button above to register team members.'
                : 'Team roster is currently being managed by HR Leadership.'}
            </p>
          </div>
        ) : (
          hrMetrics.map((emp) => {
            const empRatings = ratings.filter((r) => r.employeeId === emp.employeeId);
            const isCurrentlyRating = selectedEmpForRating === emp.employeeId;
            const isResigned = emp.status === 'resigned';

            return (
              <div
                key={emp.employeeId}
                className={`glass-card-3d rounded-3xl border transition-all overflow-hidden shadow-md flex flex-col justify-between ${
                  isResigned
                    ? 'border-rose-200 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/20 opacity-80'
                    : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900'
                }`}
              >
                {/* Profile Top Banner */}
                <div className="p-5 bg-gradient-to-r from-slate-50 to-blue-50/40 dark:from-slate-800/50 dark:to-slate-800/30 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${emp.avatarColor} text-white flex items-center justify-center font-black text-lg shadow-md shrink-0`}
                    >
                      {emp.name
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                          {emp.name}
                        </h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 font-bold">
                          ID: {emp.employeeId}
                        </span>
                        {isResigned && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300">
                            Resigned / Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">
                        {emp.designation}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center text-amber-500 text-xs">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="ml-1 font-bold font-mono text-slate-900 dark:text-white">
                            {emp.averageLeadershipRating} / 5.0
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          ({empRatings.length} ratings)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Rate Employee Button */}
                    {canRate && !isResigned && (
                      <button
                        onClick={() => handleOpenRating(emp)}
                        className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-xs active:scale-95 transition-all flex items-center gap-1.5"
                      >
                        <Star className="w-3.5 h-3.5" />
                        <span>Rate</span>
                      </button>
                    )}

                    {/* Resign / Reactivate / Delete Controls (Exclusive to Syeda Shaila Ashraf & Shahriyar Naiem) */}
                    {canManageTeam && (
                      <div className="flex items-center gap-1">
                        {!isResigned ? (
                          <button
                            onClick={() =>
                              setConfirmModal({
                                type: 'resign',
                                employeeId: emp.employeeId,
                                employeeName: emp.name,
                              })
                            }
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                            title="Mark as Resigned / Inactive"
                          >
                            <UserMinus className="w-4 h-4" />
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() =>
                                setConfirmModal({
                                  type: 'reactivate',
                                  employeeId: emp.employeeId,
                                  employeeName: emp.name,
                                })
                              }
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                              title="Reactivate Officer"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                setConfirmModal({
                                  type: 'delete',
                                  employeeId: emp.employeeId,
                                  employeeName: emp.name,
                                })
                              }
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                              title="Delete Officer Profile"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Core Metrics Grid */}
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                    <div className="p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40">
                      <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider block">
                        Assigned
                      </span>
                      <span className="text-xl font-black font-mono text-blue-900 dark:text-blue-200">
                        {emp.totalAssigned}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider block">
                        Joined
                      </span>
                      <span className="text-xl font-black font-mono text-emerald-900 dark:text-emerald-200">
                        {emp.totalJoined}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40">
                      <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider block">
                        Ongoing
                      </span>
                      <span className="text-xl font-black font-mono text-amber-900 dark:text-amber-200">
                        {emp.totalOngoing}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40">
                      <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider block">
                        Avg TTF
                      </span>
                      <span className="text-xl font-black font-mono text-purple-900 dark:text-purple-200">
                        {emp.avgTimeToFill}d
                      </span>
                    </div>
                  </div>

                  {/* Completion Rate Progress */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        Recruitment Completion Rate
                      </span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {emp.completionRate}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700"
                        style={{ width: `${emp.completionRate}%` }}
                      />
                    </div>
                  </div>

                  {/* Leadership Rating Input Drawer (Star Rating Only - Comments Removed) */}
                  {isCurrentlyRating && (
                    <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-3 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-purple-900 dark:text-purple-200">
                          Leadership Rating for {emp.name}
                        </span>
                        <button
                          onClick={() => setSelectedEmpForRating(null)}
                          className="text-slate-400 hover:text-slate-600 text-xs"
                        >
                          Cancel
                        </button>
                      </div>

                      {/* Star Rating Buttons */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRatingVal(star)}
                              className={`p-1.5 rounded-lg transition-transform hover:scale-125 cursor-pointer ${
                                ratingVal >= star ? 'text-amber-400' : 'text-slate-300'
                              }`}
                            >
                              <Star className="w-6 h-6 fill-current" />
                            </button>
                          ))}
                          <span className="text-xs font-mono font-bold ml-2 text-purple-900 dark:text-purple-200">
                            {ratingVal} / 5 Stars
                          </span>
                        </div>

                        <button
                          onClick={() => handleSaveRating(emp.employeeId)}
                          disabled={isSubmittingRating}
                          className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit Rating</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Employee Modal (Exclusive to Syeda Shaila Ashraf & Shahriyar Naiem) */}
      {isAddModalOpen && canManageTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Add HR Officer
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Authorized Access: Syeda Shaila Ashraf & Shahriyar Naiem
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEmployeeSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Employee ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 23-01-2180"
                  value={newEmpId}
                  onChange={(e) => setNewEmpId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 dark:text-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anika Tabassum"
                  value={newEmpName}
                  onChange={(e) => setNewEmpName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 dark:text-white font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Designation
                </label>
                <input
                  type="text"
                  placeholder="e.g. Executive, HR"
                  value={newEmpDesignation}
                  onChange={(e) => setNewEmpDesignation(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Official Email
                </label>
                <input
                  type="email"
                  placeholder="e.g. anika.tabassum@rghr.com"
                  value={newEmpEmail}
                  onChange={(e) => setNewEmpEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Profile Color
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {avatarColorOptions.map((opt) => (
                    <button
                      type="button"
                      key={opt.val}
                      onClick={() => setNewEmpColor(opt.val)}
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all flex items-center gap-1.5 ${
                        newEmpColor === opt.val
                          ? 'border-blue-500 ring-2 ring-blue-500/30'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full bg-gradient-to-tr ${opt.val}`} />
                      <span>{opt.label.split('-')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingEmp}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 disabled:opacity-50"
                >
                  {isAddingEmp ? 'Adding...' : 'Add Officer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Resign / Reactivate / Delete */}
      {confirmModal && canManageTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                  confirmModal.type === 'delete'
                    ? 'bg-rose-100 text-rose-700'
                    : confirmModal.type === 'resign'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {confirmModal.type === 'delete' ? (
                  <Trash2 className="w-5 h-5" />
                ) : confirmModal.type === 'resign' ? (
                  <UserMinus className="w-5 h-5" />
                ) : (
                  <RotateCcw className="w-5 h-5" />
                )}
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {confirmModal.type === 'delete'
                    ? 'Remove Employee Profile'
                    : confirmModal.type === 'resign'
                    ? 'Mark Employee as Resigned'
                    : 'Reactivate Employee'}
                </h4>
                <p className="text-xs text-slate-500 font-medium">{confirmModal.employeeName}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              {confirmModal.type === 'delete'
                ? `Are you sure you want to completely remove ${confirmModal.employeeName}? Historical records will retain their name, but the profile will be removed.`
                : confirmModal.type === 'resign'
                ? `Mark ${confirmModal.employeeName} as Resigned? They will be flagged as inactive and will not appear for new recruitment assignments.`
                : `Reactivate ${confirmModal.employeeName} as an active recruitment officer?`}
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                className={`px-4 py-2 rounded-xl text-white font-bold text-xs shadow-md ${
                  confirmModal.type === 'delete'
                    ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                    : confirmModal.type === 'resign'
                    ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

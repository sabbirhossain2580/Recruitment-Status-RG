/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  CheckCircle2,
  Clock,
  Building,
  User,
  DollarSign,
  AlertCircle,
  FileCheck,
  Calendar,
} from 'lucide-react';
import {
  RecruitmentRecord,
  RecruitmentStatus,
  RecruitmentType,
  CompanyCode,
  RecruitmentChecklist,
} from '../../types';
import { useRecruitment } from '../../context/RecruitmentContext';
import { useAuth } from '../../context/AuthContext';
import { COMPANIES, DEPARTMENTS, HR_EMPLOYEE_NAMES } from '../../data/authUsers';
import { calculateDaysBetween, calculatePendingAge } from '../../data/seedData';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  recordToEdit: RecruitmentRecord | null;
}

export const AddEditRequisitionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  recordToEdit,
}) => {
  const { addRecord, updateRecord, lockRecord, unlockRecord, records, recruiterNames } = useRecruitment();
  const { currentUser, isEditor } = useAuth();

  const isEditing = !!recordToEdit;

  // Form Fields
  const [positionTitle, setPositionTitle] = useState('');
  const [department, setDepartment] = useState<string>(DEPARTMENTS[0]);
  const [company, setCompany] = useState<CompanyCode>('RAL');
  const [vacancy, setVacancy] = useState(1);
  const [recruitmentType, setRecruitmentType] = useState<RecruitmentType>('New Recruitment');
  const [replacementOfWhom, setReplacementOfWhom] = useState('');
  const [replacementEmployeeSalary, setReplacementEmployeeSalary] = useState('');
  const [requisitionDate, setRequisitionDate] = useState(new Date().toISOString().split('T')[0]);
  const [requisitionSubmittedBy, setRequisitionSubmittedBy] = useState('HOD');
  const [hod, setHod] = useState('Department Head');
  const [offerLetterDate, setOfferLetterDate] = useState('');
  const [doj, setDoj] = useState('');
  const [status, setStatus] = useState<RecruitmentStatus>('Ongoing');
  const [remarks, setRemarks] = useState('');
  const [recruitmentAssistedBy, setRecruitmentAssistedBy] = useState<string>(currentUser.name);

  // Checklists
  const [checklist, setChecklist] = useState<RecruitmentChecklist>({
    mrfApproved: true,
    jobPosted: false,
    cvScreening: false,
    firstInterview: false,
    finalInterview: false,
    salaryDiscussion: false,
    bgVerification: false,
    offerLetterIssued: false,
    offerAccepted: false,
    onboardingPrepared: false,
    joiningConfirmed: false,
  });

  const [conflictWarning, setConflictWarning] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form on edit
  useEffect(() => {
    if (recordToEdit) {
      setPositionTitle(recordToEdit.positionTitle);
      setDepartment(recordToEdit.department);
      setCompany(recordToEdit.company);
      setVacancy(recordToEdit.vacancy || 1);
      setRecruitmentType(recordToEdit.recruitmentType);
      setReplacementOfWhom(recordToEdit.replacementOfWhom || '');
      setReplacementEmployeeSalary(recordToEdit.replacementEmployeeSalary ? String(recordToEdit.replacementEmployeeSalary) : '');
      setRequisitionDate(recordToEdit.requisitionDate);
      setRequisitionSubmittedBy(recordToEdit.requisitionSubmittedBy);
      setHod(recordToEdit.hod);
      setOfferLetterDate(recordToEdit.offerLetterDate || '');
      setDoj(recordToEdit.doj || '');
      setStatus(recordToEdit.status);
      setRemarks(recordToEdit.remarks || '');
      setRecruitmentAssistedBy(recordToEdit.recruitmentAssistedBy || currentUser.name);
      setChecklist(
        recordToEdit.checklist || {
          mrfApproved: true,
          jobPosted: false,
          cvScreening: false,
          firstInterview: false,
          finalInterview: false,
          salaryDiscussion: false,
          bgVerification: false,
          offerLetterIssued: false,
          offerAccepted: false,
          onboardingPrepared: false,
          joiningConfirmed: recordToEdit.status === 'Joined',
        }
      );

      // Lock this record in the real-time server
      lockRecord(recordToEdit.id, recordToEdit.sl);

      // Conflict detection: verify version hasn't changed on server
      const serverVersion = records.find((r) => r.id === recordToEdit.id);
      if (serverVersion && serverVersion.version > recordToEdit.version) {
        setConflictWarning(
          `Notice: This record was recently updated by ${serverVersion.lastUpdatedBy}. Your changes will overwrite newer changes.`
        );
      } else {
        setConflictWarning(null);
      }
    } else {
      // New record defaults
      setPositionTitle('');
      setDepartment(DEPARTMENTS[0]);
      setCompany('RAL');
      setVacancy(1);
      setRecruitmentType('New Recruitment');
      setReplacementOfWhom('');
      setReplacementEmployeeSalary('');
      setRequisitionDate(new Date().toISOString().split('T')[0]);
      setRequisitionSubmittedBy('Department Head');
      setHod('Department Head');
      setOfferLetterDate('');
      setDoj('');
      setStatus('Ongoing');
      setRemarks('');
      setRecruitmentAssistedBy(currentUser.name);
      setChecklist({
        mrfApproved: true,
        jobPosted: false,
        cvScreening: false,
        firstInterview: false,
        finalInterview: false,
        salaryDiscussion: false,
        bgVerification: false,
        offerLetterIssued: false,
        offerAccepted: false,
        onboardingPrepared: false,
        joiningConfirmed: false,
      });
      setConflictWarning(null);
    }

    return () => {
      if (recordToEdit) {
        unlockRecord(recordToEdit.id);
      }
    };
  }, [recordToEdit, isOpen, lockRecord, unlockRecord, currentUser.name, records]);

  if (!isOpen) return null;

  // Real-time automatic calculations
  const calculatedTTF =
    status === 'Joined' && doj && requisitionDate
      ? calculateDaysBetween(requisitionDate, doj)
      : null;

  const calculatedPendingAge =
    status === 'Ongoing' || status === 'Held Up'
      ? calculatePendingAge(requisitionDate)
      : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditor) {
      alert('Permission Denied: View-only accounts cannot modify records.');
      return;
    }

    if (!positionTitle.trim()) {
      alert('Please enter a Position Title.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing && recordToEdit) {
        await updateRecord({
          ...recordToEdit,
          positionTitle: positionTitle.trim(),
          department,
          company,
          vacancy: Number(vacancy) || 1,
          recruitmentType,
          replacementOfWhom: recruitmentType === 'Replacement' ? replacementOfWhom : '',
          replacementEmployeeSalary:
            recruitmentType === 'Replacement' && replacementEmployeeSalary
              ? Number(replacementEmployeeSalary)
              : undefined,
          requisitionDate,
          requisitionSubmittedBy,
          hod,
          offerLetterDate,
          doj,
          status,
          timeToFill: calculatedTTF,
          pendingAge: calculatedPendingAge,
          remarks: remarks.trim(),
          recruitmentAssistedBy,
          checklist: {
            ...checklist,
            joiningConfirmed: status === 'Joined',
          },
        });
      } else {
        await addRecord({
          positionTitle: positionTitle.trim(),
          department,
          company,
          vacancy: Number(vacancy) || 1,
          recruitmentType,
          replacementOfWhom: recruitmentType === 'Replacement' ? replacementOfWhom : '',
          replacementEmployeeSalary:
            recruitmentType === 'Replacement' && replacementEmployeeSalary
              ? Number(replacementEmployeeSalary)
              : undefined,
          requisitionDate,
          requisitionSubmittedBy,
          hod,
          offerLetterDate,
          doj,
          status,
          timeToFill: calculatedTTF,
          pendingAge: calculatedPendingAge,
          remarks: remarks.trim(),
          recruitmentAssistedBy,
          checklist: {
            ...checklist,
            joiningConfirmed: status === 'Joined',
          },
        });
      }
      onClose();
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
              {isEditing ? `#${recordToEdit.sl}` : '+'}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {isEditing ? `Edit Recruitment Requisition (SL #${recordToEdit.sl})` : 'Add New Recruitment Requisition'}
              </h3>
              <p className="text-xs text-slate-500">
                Log or update requisition specifications, offer milestones, and assisted officer assignment.
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

        {/* Conflict Alert */}
        {conflictWarning && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{conflictWarning}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Section 1: Basic Position Information */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 border-b border-slate-100 dark:border-slate-800 pb-1 flex items-center gap-2">
              <Building className="w-3.5 h-3.5" />
              <span>1. Position & Department Details</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Position Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Executive, Financial Planning"
                  value={positionTitle}
                  onChange={(e) => setPositionTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Company</label>
                <select
                  value={company}
                  onChange={(e) => setCompany(e.target.value as CompanyCode)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 dark:text-white font-mono font-bold"
                >
                  {COMPANIES.map((co) => (
                    <option key={co} value={co}>
                      {co}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 dark:text-white"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">HOD / Dept Head</label>
                <input
                  type="text"
                  value={hod}
                  onChange={(e) => setHod(e.target.value)}
                  placeholder="e.g. Farhan Kabir"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Vacancy Count
                </label>
                <input
                  type="number"
                  min={1}
                  value={vacancy}
                  onChange={(e) => setVacancy(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 dark:text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Requisition Type & Replacement Details */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 border-b border-slate-100 dark:border-slate-800 pb-1 flex items-center gap-2">
              <User className="w-3.5 h-3.5" />
              <span>2. Requisition Nature & Replacement Details</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Recruitment Type
                </label>
                <select
                  value={recruitmentType}
                  onChange={(e) => setRecruitmentType(e.target.value as RecruitmentType)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 dark:text-white"
                >
                  <option value="New Recruitment">New Recruitment</option>
                  <option value="Replacement">Replacement</option>
                </select>
              </div>

              {recruitmentType === 'Replacement' && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Replacement of Whom
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ex-Employee #1042 (Nazmul)"
                      value={replacementOfWhom}
                      onChange={(e) => setReplacementOfWhom(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Replacement Employee Salary (BDT)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 55000"
                      value={replacementEmployeeSalary}
                      onChange={(e) => setReplacementEmployeeSalary(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 dark:text-white font-mono"
                    />
                  </div>
                </>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Requisition Submitted By
                </label>
                <input
                  type="text"
                  value={requisitionSubmittedBy}
                  onChange={(e) => setRequisitionSubmittedBy(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 dark:text-white"
                />
              </div>

              {/* Recruitment Assisted By - strictly linked to 4 HR Employees */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Recruitment Assisted By <span className="text-rose-500">*</span>
                </label>
                <select
                  value={recruitmentAssistedBy}
                  onChange={(e) => setRecruitmentAssistedBy(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 font-semibold focus:ring-2 focus:ring-blue-500"
                >
                  {(recruiterNames && recruiterNames.length > 0 ? recruiterNames : HR_EMPLOYEE_NAMES).map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Dates, Status, & Automatic Turnaround Time */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 border-b border-slate-100 dark:border-slate-800 pb-1 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>3. Milestone Dates & Automated Time to Fill</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Requisition Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={requisitionDate}
                  onChange={(e) => setRequisitionDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 dark:text-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Offer Letter Date
                </label>
                <input
                  type="date"
                  value={offerLetterDate}
                  onChange={(e) => setOfferLetterDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 dark:text-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Date of Joining (DOJ)
                </label>
                <input
                  type="date"
                  value={doj}
                  onChange={(e) => {
                    setDoj(e.target.value);
                    if (e.target.value && status !== 'Joined') {
                      setStatus('Joined');
                    }
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 dark:text-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Recruitment Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as RecruitmentStatus)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 dark:text-white font-semibold"
                >
                  <option value="Ongoing">Ongoing</option>
                  <option value="Joined">Joined (Completed)</option>
                  <option value="Held Up">Held Up</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Did not Join">Did not Join</option>
                </select>
              </div>
            </div>

            {/* Calculated Turnaround Preview Banner */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-cyan-50 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-cyan-950/30 border border-blue-200/80 dark:border-blue-900/60 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Automatic Turnaround Time Calculation:
                </span>
                <p className="text-[11px] text-slate-500">
                  Formula: Date of Joining (DOJ) – Requisition Date. Computed automatically by system.
                </p>
              </div>
              <div className="text-right font-mono">
                {status === 'Joined' ? (
                  calculatedTTF !== null ? (
                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                      {calculatedTTF} Days to Fill
                    </span>
                  ) : (
                    <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
                      Enter DOJ to complete
                    </span>
                  )
                ) : (
                  <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                    Current Pending Age: {calculatedPendingAge || 0} Days
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Recruitment Checklist (11 Steps) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 border-b border-slate-100 dark:border-slate-800 pb-1 flex items-center gap-2">
              <FileCheck className="w-3.5 h-3.5" />
              <span>4. Recruitment Workflow Checklist</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              {[
                { key: 'mrfApproved', label: '1. MRF Approved' },
                { key: 'jobPosted', label: '2. Job Ad Published' },
                { key: 'cvScreening', label: '3. CV Screening' },
                { key: 'firstInterview', label: '4. First Round Viva' },
                { key: 'finalInterview', label: '5. Final Interview' },
                { key: 'salaryDiscussion', label: '6. Salary Negotiation' },
                { key: 'bgVerification', label: '7. Background Check' },
                { key: 'offerLetterIssued', label: '8. Offer Letter Issued' },
                { key: 'offerAccepted', label: '9. Offer Accepted' },
                { key: 'onboardingPrepared', label: '10. Onboarding Prepared' },
                { key: 'joiningConfirmed', label: '11. Candidate Joined' },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-blue-50/50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={(checklist as any)[item.key]}
                    onChange={(e) =>
                      setChecklist({ ...checklist, [item.key]: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-slate-800 dark:text-slate-200 font-medium">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Section 5: Remarks */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Remarks & Recruitment Notes
            </label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Candidate notice period discussed; onboarding formalities assigned to factory unit."
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 dark:text-white"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="text-[11px] text-slate-400">
              Editing as: <strong className="text-slate-700 dark:text-slate-300">{currentUser.name}</strong> ({currentUser.employeeId})
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !isEditor}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-600/20 active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isEditing ? 'Save Requisition Changes' : 'Create Requisition'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

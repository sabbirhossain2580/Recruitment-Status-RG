/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'editor' | 'viewer';

export interface HRUser {
  id: string; // e.g. "22-02-1330"
  employeeId: string;
  name: string;
  designation: string;
  role: UserRole;
  avatarColor: string;
  email: string;
  status?: 'active' | 'resigned';
  resignedAt?: string;
  addedAt?: string;
}

export type RecruitmentStatus = 'Ongoing' | 'Joined' | 'Held Up' | 'Cancelled' | 'Did not Join';

export type RecruitmentType = 'New Recruitment' | 'Replacement';

export type CompanyCode = 'RAL' | 'SGL' | 'PSL' | 'MTSL' | 'RDL' | 'RBL';

export interface RecruitmentChecklist {
  mrfApproved: boolean;
  jobPosted: boolean;
  cvScreening: boolean;
  firstInterview: boolean;
  finalInterview: boolean;
  salaryDiscussion: boolean;
  bgVerification: boolean;
  offerLetterIssued: boolean;
  offerAccepted: boolean;
  onboardingPrepared: boolean;
  joiningConfirmed: boolean;
}

export interface RecruitmentRecord {
  id: string;
  sl: number;
  positionTitle: string;
  department: string;
  requisitionDate: string; // YYYY-MM-DD
  requisitionSubmittedBy: string;
  hod: string;
  company: CompanyCode;
  vacancy: number;
  recruitmentType: RecruitmentType;
  replacementOfWhom?: string;
  replacementEmployeeSalary?: number | string;
  offerLetterDate?: string; // YYYY-MM-DD
  doj?: string; // YYYY-MM-DD (Date of Joining)
  status: RecruitmentStatus;
  timeToFill: number | null; // Calculated automatically: DOJ - Requisition Date (only for Joined)
  pendingAge: number | null; // Calculated automatically: Today - Requisition Date (for Ongoing / Held Up)
  remarks: string;
  recruitmentAssistedBy: string; // Must be one of the 4 HR employees
  checklist: RecruitmentChecklist;
  lastUpdatedBy: string; // Name & ID of the logged in user who last edited
  lastUpdatedAt: string; // ISO string
  version: number; // For optimistic locking & conflict detection
}

export interface AuditLogChange {
  field: string;
  oldValue: any;
  newValue: any;
}

export interface AuditLogEntry {
  id: string;
  recordId: string;
  recordSl?: number;
  positionTitle?: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE' | 'BATCH_IMPORT' | 'RATING';
  performedBy: string;
  performedByEmpId: string;
  performedByRole: UserRole;
  timestamp: string;
  changes: AuditLogChange[];
  summaryNote?: string;
}

export interface EmployeeRating {
  id: string;
  employeeId: string; // HR employee ID being rated
  employeeName: string;
  ratedByEmpId: string; // Head of HR or Manager ID
  ratedByName: string;
  ratedByDesignation: string;
  rating: number; // 1 to 5
  feedback: string;
  ratedAt: string;
}

export interface ActivePresence {
  userId: string;
  employeeId: string;
  name: string;
  designation: string;
  role: UserRole;
  avatarColor: string;
  activeRecordId?: string | null;
  activePage?: string;
  lastPing: number;
}

export interface RecordLock {
  recordId: string;
  recordSl: number;
  lockedByEmpId: string;
  lockedByName: string;
  lockedAt: number;
}

export interface KPIStats {
  totalRequisitions: number;
  totalVacancies: number;
  joinedEmployees: number;
  ongoingRecruitment: number;
  heldUpRecruitment: number;
  didNotJoinRecruitment: number;
  cancelledRecruitment: number;
  avgTimeToFillDays: number;
  newRecruitmentCount: number;
  replacementRecruitmentCount: number;
}

export interface HRPerformanceMetric {
  employeeId: string;
  name: string;
  designation: string;
  avatarColor: string;
  status?: 'active' | 'resigned';
  totalAssigned: number;
  totalJoined: number;
  totalOngoing: number;
  totalHeldUp: number;
  totalDidNotJoin: number;
  avgTimeToFill: number;
  completionRate: number; // percentage
}

export interface AlertThresholds {
  warningDays: number; // default 30
  dangerDays: number;  // default 60
  criticalDays: number; // default 90
}

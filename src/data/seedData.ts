/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RecruitmentRecord } from '../types';

// Helper to compute days difference
export function calculateDaysBetween(startDateStr: string, endDateStr: string): number {
  if (!startDateStr || !endDateStr) return 0;
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

export function calculatePendingAge(requisitionDateStr: string, referenceDateStr?: string): number {
  if (!requisitionDateStr) return 0;
  const reqDate = new Date(requisitionDateStr);
  const refDate = referenceDateStr ? new Date(referenceDateStr) : new Date();
  if (isNaN(reqDate.getTime()) || isNaN(refDate.getTime())) return 0;
  const diffTime = refDate.getTime() - reqDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

export function generateInitialRecruitmentRecords(): RecruitmentRecord[] {
  // All sample requisitions wiped - starting completely clean with 0 records
  return [];
}

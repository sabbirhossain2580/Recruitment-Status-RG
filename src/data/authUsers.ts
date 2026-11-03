/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HRUser } from '../types';

export const AUTHORIZED_USERS: HRUser[] = [
  // 4 HR Employees - Data Entry, Edit & Delete Access
  {
    id: '22-02-1330',
    employeeId: '22-02-1330',
    name: 'Quazi Nuzhat Rahman',
    designation: 'Senior Executive, HR',
    role: 'editor',
    avatarColor: 'from-indigo-600 to-blue-700',
    email: 'nuzhat.rahman@rghr.com',
  },
  {
    id: '22-02-1642',
    employeeId: '22-02-1642',
    name: 'Sabbir Hossain',
    designation: 'Executive, HR',
    role: 'editor',
    avatarColor: 'from-blue-600 to-cyan-600',
    email: 'sabbir.hossain@rghr.com',
  },
  {
    id: '02-02-2059',
    employeeId: '02-02-2059',
    name: 'Fariha Nasmi',
    designation: 'Assistant Executive, HR',
    role: 'editor',
    avatarColor: 'from-emerald-600 to-teal-700',
    email: 'fariha.nasmi@rghr.com',
  },
  {
    id: '22-02-1551',
    employeeId: '22-02-1551',
    name: 'Maisha Islam',
    designation: 'Assistant Executive, HR',
    role: 'editor',
    avatarColor: 'from-rose-600 to-pink-700',
    email: 'maisha.islam@rghr.com',
  },

  // Leadership Users - Now granted SAME Full Access (Add, Edit, Delete, Checklists) PLUS Leadership Ratings
  {
    id: '01-02-0440',
    employeeId: '01-02-0440',
    name: 'Syeda Shaila Ashraf',
    designation: 'Head of HR',
    role: 'editor',
    avatarColor: 'from-purple-600 to-violet-800',
    email: 'shaila.ashraf@rghr.com',
  },
  {
    id: '22-02-1826',
    employeeId: '22-02-1826',
    name: 'Shahriyar Naiem',
    designation: 'Manager, HR & OD',
    role: 'editor',
    avatarColor: 'from-amber-600 to-orange-700',
    email: 'shahriyar.naiem@rghr.com',
  },
];

// The 4 frontline HR officers handling recruitment records
export const HR_RECRUITER_IDS = ['22-02-1330', '22-02-1642', '02-02-2059', '22-02-1551'];
export const HR_FRONT_RECRUITERS = AUTHORIZED_USERS.filter((u) =>
  HR_RECRUITER_IDS.includes(u.employeeId)
);

export const HR_EDITORS = AUTHORIZED_USERS;
export const HR_MANAGEMENT = AUTHORIZED_USERS.filter(
  (u) => u.designation.includes('Head') || u.designation.includes('Manager')
);

// Primary 4 frontline recruitment officers for assignment & assisted by
export const HR_EMPLOYEE_NAMES = [
  'Quazi Nuzhat Rahman',
  'Sabbir Hossain',
  'Fariha Nasmi',
  'Maisha Islam',
];

export const COMPANIES = ['RAL', 'SGL', 'PSL', 'MTSL', 'RDL', 'RBL'] as const;

export const DEPARTMENTS = [
  'Accounts & Finance',
  'Marketing & Brand',
  'Information Technology',
  'Supply Chain Management',
  'Production & Factory Ops',
  'Quality Assurance',
  'Human Resources',
  'Commercial & Logistics',
  'Engineering & Maintenance',
  'Sales & Distribution',
  'Administration & Security',
  'Research & Development',
] as const;

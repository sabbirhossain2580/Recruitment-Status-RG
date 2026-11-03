/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { HRUser } from '../types';
import { AUTHORIZED_USERS } from '../data/authUsers';

interface AuthContextType {
  currentUser: HRUser;
  setCurrentUser: (user: HRUser) => void;
  switchUserById: (employeeId: string) => void;
  allUsers: HRUser[];
  setAllUsers: (users: HRUser[]) => void;
  isEditor: boolean;
  isViewer: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManageTeam: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allUsers, setAllUsers] = useState<HRUser[]>(() => {
    try {
      const saved = localStorage.getItem('rghr_team_employees');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return AUTHORIZED_USERS;
  });

  const [currentUser, setCurrentUserState] = useState<HRUser>(() => {
    const savedId = localStorage.getItem('rghr_active_user_id');
    if (savedId) {
      const match = allUsers.find((u) => u.employeeId === savedId);
      if (match) return match;
    }
    // Default to Quazi Nuzhat Rahman
    return allUsers[0] || AUTHORIZED_USERS[0];
  });

  const setCurrentUser = (user: HRUser) => {
    setCurrentUserState(user);
    localStorage.setItem('rghr_active_user_id', user.employeeId);
  };

  const switchUserById = (employeeId: string) => {
    const match = allUsers.find((u) => u.employeeId === employeeId);
    if (match) {
      setCurrentUser(match);
    }
  };

  // Synchronize when allUsers updates
  const updateUsersList = (users: HRUser[]) => {
    setAllUsers(users);
    try {
      localStorage.setItem('rghr_team_employees', JSON.stringify(users));
    } catch {
      // ignore
    }
    // If current user is no longer in users, switch to first
    if (!users.some((u) => u.employeeId === currentUser.employeeId) && users.length > 0) {
      setCurrentUser(users[0]);
    }
  };

  // Full editing and deletion access for all authorized users
  const isEditor = true;
  const isViewer = false;
  const canEdit = true;
  const canDelete = true;
  // ONLY Syeda Shaila Ashraf (01-02-0440) and Shahriyar Naiem (22-02-1826) can add or remove HR employees
  const canManageTeam = currentUser.employeeId === '01-02-0440' || currentUser.employeeId === '22-02-1826';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchUserById,
        allUsers,
        setAllUsers: updateUsersList,
        isEditor,
        isViewer,
        canEdit,
        canDelete,
        canManageTeam,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

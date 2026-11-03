/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  RecruitmentRecord,
  AuditLogEntry,
  EmployeeRating,
  ActivePresence,
  RecordLock,
  KPIStats,
  HRPerformanceMetric,
  AlertThresholds,
  HRUser,
} from '../types';
import { useAuth } from './AuthContext';
import { HR_FRONT_RECRUITERS, HR_EDITORS, HR_EMPLOYEE_NAMES, COMPANIES, DEPARTMENTS } from '../data/authUsers';
import { calculateDaysBetween, calculatePendingAge } from '../data/seedData';

type ConnectionState = 'connected' | 'syncing' | 'disconnected';

interface RecruitmentContextType {
  records: RecruitmentRecord[];
  auditLogs: AuditLogEntry[];
  activePresences: ActivePresence[];
  locks: RecordLock[];
  connectionState: ConnectionState;
  lastSyncTime: Date | null;
  stats: KPIStats;
  hrMetrics: HRPerformanceMetric[];
  companyStats: Array<{ company: string; total: number; joined: number; ongoing: number; heldUp: number }>;
  departmentStats: Array<{ department: string; total: number; joined: number; ongoing: number; avgTimeToFill: number }>;
  monthlyTrends: Array<{ month: string; requisitions: number; joined: number; ongoing: number; avgTimeToFill: number }>;
  alerts: {
    olderThan30Days: RecruitmentRecord[];
    olderThan60Days: RecruitmentRecord[];
    olderThan90Days: RecruitmentRecord[];
    missingDOJ: RecruitmentRecord[];
    missingOfferLetter: RecruitmentRecord[];
    heldUp: RecruitmentRecord[];
  };
  alertThresholds: AlertThresholds;
  updateAlertThresholds: (thresholds: AlertThresholds) => void;
  addRecord: (recordData: Partial<RecruitmentRecord>) => Promise<RecruitmentRecord>;
  updateRecord: (recordData: RecruitmentRecord) => Promise<RecruitmentRecord>;
  deleteRecord: (id: string) => Promise<void>;
  batchImportRecords: (importedRecords: Partial<RecruitmentRecord>[], mode?: 'append' | 'replace') => Promise<void>;
  lockRecord: (recordId: string, sl: number) => void;
  unlockRecord: (recordId: string) => void;
  resetToBaseline: () => Promise<void>;
  clearAllRecords: () => Promise<void>;
  triggerConfetti: () => void;
  isRecordLockedByOther: (recordId: string) => RecordLock | undefined;
  // Dynamic Team Management (Syeda Shaila Ashraf & Shahriyar Naiem)
  teamEmployees: HRUser[];
  activeRecruiters: HRUser[];
  allRecruiters: HRUser[];
  recruiterNames: string[];
  addEmployee: (employeeData: { employeeId: string; name: string; designation: string; email?: string; avatarColor?: string }) => Promise<void>;
  updateEmployeeStatus: (employeeId: string, status: 'active' | 'resigned') => Promise<void>;
  removeEmployee: (employeeId: string) => Promise<void>;
}

const RecruitmentContext = createContext<RecruitmentContextType | undefined>(undefined);

export const RecruitmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, allUsers, setAllUsers } = useAuth();
  const [records, setRecords] = useState<RecruitmentRecord[]>([]);
  const [teamEmployees, setTeamEmployees] = useState<HRUser[]>(allUsers);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [activePresences, setActivePresences] = useState<ActivePresence[]>([]);
  const [locks, setLocks] = useState<RecordLock[]>([]);
  const [connectionState, setConnectionState] = useState<ConnectionState>('syncing');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Synchronize teamEmployees whenever allUsers changes
  useEffect(() => {
    if (allUsers && allUsers.length > 0) {
      setTeamEmployees(allUsers);
    }
  }, [allUsers]);

  const [alertThresholds, setAlertThresholds] = useState<AlertThresholds>({
    warningDays: 30,
    dangerDays: 60,
    criticalDays: 90,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const triggerConfetti = useCallback(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2563eb', '#06b6d4', '#10b981', '#f59e0b', '#6366f1'],
      });
    } catch (err) {
      // Ignore if canvas is unavailable
    }
  }, []);

  // Initialize and maintain WebSocket connection
  const connectWebSocket = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;

    try {
      const socket = new WebSocket(wsUrl);
      wsRef.current = socket;
      setConnectionState('syncing');

      socket.onopen = () => {
        setConnectionState('connected');
        setLastSyncTime(new Date());

        // Send Presence
        socket.send(
          JSON.stringify({
            type: 'PRESENCE_JOIN',
            user: currentUser,
            activePage: window.location.pathname,
          })
        );

        // Setup Ping
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'PING' }));
          }
        }, 15000);
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastSyncTime(new Date());

          switch (data.type) {
            case 'INIT':
              setRecords(data.records || []);
              if (data.teamEmployees && Array.isArray(data.teamEmployees)) {
                setTeamEmployees(data.teamEmployees);
                setAllUsers(data.teamEmployees);
              }
              setAuditLogs(data.auditLogs || []);
              setLocks(data.locks || []);
              setActivePresences(data.presences || []);
              setConnectionState('connected');
              break;

            case 'EMPLOYEES_UPDATED':
              if (data.teamEmployees && Array.isArray(data.teamEmployees)) {
                setTeamEmployees(data.teamEmployees);
                setAllUsers(data.teamEmployees);
              }
              if (data.auditEntry) {
                setAuditLogs((prev) => [data.auditEntry, ...prev.slice(0, 200)]);
              }
              break;

            case 'RECORD_CREATED':
              setRecords((prev) => {
                if (prev.some((r) => r.id === data.record.id)) return prev;
                return [...prev, data.record];
              });
              if (data.auditEntry) {
                setAuditLogs((prev) => [data.auditEntry, ...prev.slice(0, 200)]);
              }
              break;

            case 'RECORD_UPDATED':
              setRecords((prev) => prev.map((r) => (r.id === data.record.id ? data.record : r)));
              if (data.auditEntry) {
                setAuditLogs((prev) => [data.auditEntry, ...prev.slice(0, 200)]);
              }
              break;

            case 'RECORD_DELETED':
              setRecords((prev) => prev.filter((r) => r.id !== data.recordId));
              if (data.auditEntry) {
                setAuditLogs((prev) => [data.auditEntry, ...prev.slice(0, 200)]);
              }
              break;

            case 'BATCH_IMPORTED':
              setRecords(data.records);
              if (data.auditEntry) {
                setAuditLogs((prev) => [data.auditEntry, ...prev.slice(0, 200)]);
              }
              break;

            case 'PRESENCE_UPDATE':
              setActivePresences(data.presences || []);
              break;

            case 'RECORD_LOCKED':
              setLocks((prev) => {
                const filtered = prev.filter((l) => l.recordId !== data.lock.recordId);
                return [...filtered, data.lock];
              });
              break;

            case 'RECORD_UNLOCKED':
              setLocks((prev) => prev.filter((l) => l.recordId !== data.recordId));
              break;

            case 'PONG':
              break;
          }
        } catch (err) {
          console.error('Error handling WS event:', err);
        }
      };

      socket.onerror = (err) => {
        console.warn('WebSocket connection error, fallback polling available:', err);
        setConnectionState('disconnected');
      };

      socket.onclose = () => {
        setConnectionState('disconnected');
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        // Attempt reconnect in 3s
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, 3000);
      };
    } catch (err) {
      console.error('Could not initiate WS:', err);
      setConnectionState('disconnected');
    }
  }, [currentUser]);

  // Initial connect & presence sync on user change
  useEffect(() => {
    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [connectWebSocket]);

  // Update presence whenever currentUser changes
  useEffect(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'PRESENCE_JOIN',
          user: currentUser,
          activePage: window.location.pathname,
        })
      );
    }
  }, [currentUser]);

  // Check if a record is currently locked by someone else
  const isRecordLockedByOther = useCallback(
    (recordId: string): RecordLock | undefined => {
      const lock = locks.find((l) => l.recordId === recordId);
      if (lock && lock.lockedByEmpId !== currentUser.employeeId) {
        return lock;
      }
      return undefined;
    },
    [locks, currentUser.employeeId]
  );

  const lockRecord = useCallback(
    (recordId: string, sl: number) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'LOCK_RECORD',
            recordId,
            recordSl: sl,
            user: currentUser,
          })
        );
      }
    },
    [currentUser]
  );

  const unlockRecord = useCallback((recordId: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'UNLOCK_RECORD',
          recordId,
        })
      );
    }
  }, []);

  // CRUD Actions
  const addRecord = async (recordData: Partial<RecruitmentRecord>): Promise<RecruitmentRecord> => {
    setConnectionState('syncing');
    try {
      const res = await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ record: recordData, user: currentUser }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create record');
      }
      const data = await res.json();
      setConnectionState('connected');
      if (data.record.status === 'Joined') {
        triggerConfetti();
      }
      return data.record;
    } catch (err) {
      setConnectionState('disconnected');
      throw err;
    }
  };

  const updateRecord = async (recordData: RecruitmentRecord): Promise<RecruitmentRecord> => {
    setConnectionState('syncing');
    try {
      const res = await fetch(`/api/records/${recordData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updatedRecord: recordData, user: currentUser }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update record');
      }
      const data = await res.json();
      setConnectionState('connected');
      if (data.record.status === 'Joined' && recordData.status === 'Joined') {
        triggerConfetti();
      }
      return data.record;
    } catch (err) {
      setConnectionState('disconnected');
      throw err;
    }
  };

  const deleteRecord = async (id: string): Promise<void> => {
    setConnectionState('syncing');
    try {
      const res = await fetch(`/api/records/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: currentUser }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete record');
      }
      setConnectionState('connected');
    } catch (err) {
      setConnectionState('disconnected');
      throw err;
    }
  };

  const batchImportRecords = async (
    importedRecords: Partial<RecruitmentRecord>[],
    mode: 'append' | 'replace' = 'append'
  ): Promise<void> => {
    setConnectionState('syncing');
    try {
      const res = await fetch('/api/records/batch-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ importedRecords, user: currentUser, mode }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to batch import');
      }
      setConnectionState('connected');
    } catch (err) {
      setConnectionState('disconnected');
      throw err;
    }
  };

  const resetToBaseline = async (): Promise<void> => {
    setConnectionState('syncing');
    try {
      const res = await fetch('/api/records/reset-seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: currentUser }),
      });
      if (!res.ok) throw new Error('Reset failed');
      setConnectionState('connected');
    } catch (err) {
      setConnectionState('disconnected');
      throw err;
    }
  };

  const clearAllRecords = async (): Promise<void> => {
    setConnectionState('syncing');
    try {
      const res = await fetch('/api/records-all', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: currentUser }),
      });
      if (!res.ok) throw new Error('Clear failed');
      setRecords([]);
      setConnectionState('connected');
    } catch (err) {
      setConnectionState('disconnected');
      throw err;
    }
  };

  const addEmployee = async (employeeData: {
    employeeId: string;
    name: string;
    designation: string;
    email?: string;
    avatarColor?: string;
  }): Promise<void> => {
    setConnectionState('syncing');
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employee: employeeData, user: currentUser }),
      });
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Failed to add employee');
      }
      const data = await res.json();
      if (data.teamEmployees) {
        setTeamEmployees(data.teamEmployees);
        setAllUsers(data.teamEmployees);
      }
      setConnectionState('connected');
    } catch (err) {
      setConnectionState('disconnected');
      throw err;
    }
  };

  const updateEmployeeStatus = async (employeeId: string, status: 'active' | 'resigned'): Promise<void> => {
    setConnectionState('syncing');
    try {
      const res = await fetch(`/api/employees/${encodeURIComponent(employeeId)}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, user: currentUser }),
      });
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Failed to update employee status');
      }
      const data = await res.json();
      if (data.teamEmployees) {
        setTeamEmployees(data.teamEmployees);
        setAllUsers(data.teamEmployees);
      }
      setConnectionState('connected');
    } catch (err) {
      setConnectionState('disconnected');
      throw err;
    }
  };

  const removeEmployee = async (employeeId: string): Promise<void> => {
    setConnectionState('syncing');
    try {
      const res = await fetch(`/api/employees/${encodeURIComponent(employeeId)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: currentUser }),
      });
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Failed to remove employee');
      }
      const data = await res.json();
      if (data.teamEmployees) {
        setTeamEmployees(data.teamEmployees);
        setAllUsers(data.teamEmployees);
      }
      setConnectionState('connected');
    } catch (err) {
      setConnectionState('disconnected');
      throw err;
    }
  };

  // Recruiters list excluding leadership management (Syeda Shaila Ashraf & Shahriyar Naiem)
  const allRecruiters = useMemo(() => {
    return teamEmployees.filter(
      (u) =>
        u.employeeId !== '01-02-0440' &&
        u.employeeId !== '22-02-1826' &&
        u.name !== 'Syeda Shaila Ashraf' &&
        u.name !== 'Shahriyar Naiem'
    );
  }, [teamEmployees]);

  const activeRecruiters = useMemo(() => {
    return allRecruiters.filter((u) => u.status !== 'resigned');
  }, [allRecruiters]);

  const recruiterNames = useMemo(() => {
    return activeRecruiters.map((u) => u.name);
  }, [activeRecruiters]);

  // KPI Calculations
  const stats: KPIStats = useMemo(() => {
    const totalRequisitions = records.length;
    const totalVacancies = records.reduce((sum, r) => sum + (Number(r.vacancy) || 1), 0);
    const joinedEmployees = records.filter((r) => r.status === 'Joined').length;
    const ongoingRecruitment = records.filter((r) => r.status === 'Ongoing').length;
    const heldUpRecruitment = records.filter((r) => r.status === 'Held Up').length;
    const didNotJoinRecruitment = records.filter((r) => r.status === 'Did not Join').length;
    const cancelledRecruitment = records.filter((r) => r.status === 'Cancelled').length;

    // Time to Fill: strictly joined records with valid timeToFill
    const joinedWithTTF = records.filter((r) => r.status === 'Joined' && typeof r.timeToFill === 'number');
    const totalTTFDays = joinedWithTTF.reduce((sum, r) => sum + (r.timeToFill || 0), 0);
    const avgTimeToFillDays = joinedWithTTF.length > 0 ? Math.round((totalTTFDays / joinedWithTTF.length) * 10) / 10 : 0;

    const newRecruitmentCount = records.filter((r) => r.recruitmentType === 'New Recruitment').length;
    const replacementRecruitmentCount = records.filter((r) => r.recruitmentType === 'Replacement').length;

    return {
      totalRequisitions,
      totalVacancies,
      joinedEmployees,
      ongoingRecruitment,
      heldUpRecruitment,
      didNotJoinRecruitment,
      cancelledRecruitment,
      avgTimeToFillDays,
      newRecruitmentCount,
      replacementRecruitmentCount,
    };
  }, [records]);

  // HR Employee Performance Metrics - for all recruitment officers
  const hrMetrics: HRPerformanceMetric[] = useMemo(() => {
    return allRecruiters.map((editor) => {
      const assigned = records.filter(
        (r) =>
          r.recruitmentAssistedBy.trim().toLowerCase() === editor.name.trim().toLowerCase() ||
          r.recruitmentAssistedBy.includes(editor.name)
      );

      const joined = assigned.filter((r) => r.status === 'Joined').length;
      const ongoing = assigned.filter((r) => r.status === 'Ongoing').length;
      const heldUp = assigned.filter((r) => r.status === 'Held Up').length;
      const didNotJoin = assigned.filter((r) => r.status === 'Did not Join').length;

      const joinedWithTTF = assigned.filter((r) => r.status === 'Joined' && typeof r.timeToFill === 'number');
      const totalTTF = joinedWithTTF.reduce((sum, r) => sum + (r.timeToFill || 0), 0);
      const avgTimeToFill = joinedWithTTF.length > 0 ? Math.round((totalTTF / joinedWithTTF.length) * 10) / 10 : 0;

      // Completion rate: Joined / (Total - Cancelled)
      const validTotal = assigned.filter((r) => r.status !== 'Cancelled').length;
      const completionRate = validTotal > 0 ? Math.round((joined / validTotal) * 100) : 0;

      return {
        employeeId: editor.employeeId,
        name: editor.name,
        designation: editor.designation,
        avatarColor: editor.avatarColor,
        status: editor.status || 'active',
        totalAssigned: assigned.length,
        totalJoined: joined,
        totalOngoing: ongoing,
        totalHeldUp: heldUp,
        totalDidNotJoin: didNotJoin,
        avgTimeToFill,
        completionRate,
      };
    });
  }, [allRecruiters, records]);

  // Company Stats
  const companyStats = useMemo(() => {
    return COMPANIES.map((co) => {
      const coRecords = records.filter((r) => r.company === co);
      return {
        company: co,
        total: coRecords.length,
        joined: coRecords.filter((r) => r.status === 'Joined').length,
        ongoing: coRecords.filter((r) => r.status === 'Ongoing').length,
        heldUp: coRecords.filter((r) => r.status === 'Held Up').length,
      };
    });
  }, [records]);

  // Department Stats
  const departmentStats = useMemo(() => {
    const map = new Map<string, { total: number; joined: number; ongoing: number; ttfTotal: number; ttfCount: number }>();

    for (const r of records) {
      const dept = r.department || 'General';
      if (!map.has(dept)) {
        map.set(dept, { total: 0, joined: 0, ongoing: 0, ttfTotal: 0, ttfCount: 0 });
      }
      const entry = map.get(dept)!;
      entry.total++;
      if (r.status === 'Joined') {
        entry.joined++;
        if (typeof r.timeToFill === 'number') {
          entry.ttfTotal += r.timeToFill;
          entry.ttfCount++;
        }
      } else if (r.status === 'Ongoing') {
        entry.ongoing++;
      }
    }

    return Array.from(map.entries())
      .map(([department, data]) => ({
        department,
        total: data.total,
        joined: data.joined,
        ongoing: data.ongoing,
        avgTimeToFill: data.ttfCount > 0 ? Math.round(data.ttfTotal / data.ttfCount) : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [records]);

  // Monthly Trends
  const monthlyTrends = useMemo(() => {
    const monthMap = new Map<string, { requisitions: number; joined: number; ongoing: number; ttfSum: number; ttfCount: number }>();

    // Initial 10 months of 2026
    const months = ['Jan 2026', 'Feb 2026', 'Mar 2026', 'Apr 2026', 'May 2026', 'Jun 2026', 'Jul 2026', 'Aug 2026', 'Sep 2026', 'Oct 2026'];
    months.forEach((m) => {
      monthMap.set(m, { requisitions: 0, joined: 0, ongoing: 0, ttfSum: 0, ttfCount: 0 });
    });

    for (const r of records) {
      if (!r.requisitionDate) continue;
      const d = new Date(r.requisitionDate);
      if (isNaN(d.getTime())) continue;
      const monthStr = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

      if (!monthMap.has(monthStr)) {
        monthMap.set(monthStr, { requisitions: 0, joined: 0, ongoing: 0, ttfSum: 0, ttfCount: 0 });
      }

      const item = monthMap.get(monthStr)!;
      item.requisitions++;

      if (r.status === 'Joined') {
        item.joined++;
        if (typeof r.timeToFill === 'number') {
          item.ttfSum += r.timeToFill;
          item.ttfCount++;
        }
      } else if (r.status === 'Ongoing') {
        item.ongoing++;
      }
    }

    return Array.from(monthMap.entries()).map(([month, data]) => ({
      month,
      requisitions: data.requisitions,
      joined: data.joined,
      ongoing: data.ongoing,
      avgTimeToFill: data.ttfCount > 0 ? Math.round(data.ttfSum / data.ttfCount) : 0,
    }));
  }, [records]);

  // Alerts
  const alerts = useMemo(() => {
    const ongoingAndHeld = records.filter((r) => r.status === 'Ongoing' || r.status === 'Held Up');

    return {
      olderThan30Days: ongoingAndHeld.filter((r) => (r.pendingAge || 0) >= alertThresholds.warningDays && (r.pendingAge || 0) < alertThresholds.dangerDays),
      olderThan60Days: ongoingAndHeld.filter((r) => (r.pendingAge || 0) >= alertThresholds.dangerDays && (r.pendingAge || 0) < alertThresholds.criticalDays),
      olderThan90Days: ongoingAndHeld.filter((r) => (r.pendingAge || 0) >= alertThresholds.criticalDays),
      missingDOJ: records.filter((r) => r.status === 'Joined' && !r.doj),
      missingOfferLetter: records.filter((r) => (r.status === 'Ongoing' || r.status === 'Joined') && !r.offerLetterDate),
      heldUp: records.filter((r) => r.status === 'Held Up'),
    };
  }, [records, alertThresholds]);

  return (
    <RecruitmentContext.Provider
      value={{
        records,
        auditLogs,
        ratings,
        activePresences,
        locks,
        connectionState,
        lastSyncTime,
        stats,
        hrMetrics,
        companyStats,
        departmentStats,
        monthlyTrends,
        alerts,
        alertThresholds,
        updateAlertThresholds: setAlertThresholds,
        addRecord,
        updateRecord,
        deleteRecord,
        batchImportRecords,
        lockRecord,
        unlockRecord,
        resetToBaseline,
        clearAllRecords,
        triggerConfetti,
        isRecordLockedByOther,
        teamEmployees,
        activeRecruiters,
        allRecruiters,
        recruiterNames,
        addEmployee,
        updateEmployeeStatus,
        removeEmployee,
      }}
    >
      {children}
    </RecruitmentContext.Provider>
  );
};

export const useRecruitment = () => {
  const context = useContext(RecruitmentContext);
  if (!context) {
    throw new Error('useRecruitment must be used within a RecruitmentProvider');
  }
  return context;
};

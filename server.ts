/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { RecruitmentRecord, AuditLogEntry, EmployeeRating, ActivePresence, RecordLock, HRUser } from './src/types';
import { generateInitialRecruitmentRecords, calculateDaysBetween, calculatePendingAge } from './src/data/seedData';
import { AUTHORIZED_USERS } from './src/data/authUsers';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const DATA_DIR = path.join(__dirname, 'data');
const RECORDS_FILE = path.join(DATA_DIR, 'recruitment_records.json');
const AUDIT_FILE = path.join(DATA_DIR, 'audit_logs.json');
const RATINGS_FILE = path.join(DATA_DIR, 'employee_ratings.json');
const EMPLOYEES_FILE = path.join(DATA_DIR, 'team_employees.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory state with persistence
let records: RecruitmentRecord[] = [];
let auditLogs: AuditLogEntry[] = [];
let ratings: EmployeeRating[] = [];
let teamEmployees: HRUser[] = [];
const connectedClients = new Map<WebSocket, { user: ActivePresence | null }>();
const activeLocks = new Map<string, RecordLock>();

// Load or Seed Initial Data
function loadData() {
  try {
    if (fs.existsSync(RECORDS_FILE)) {
      const content = fs.readFileSync(RECORDS_FILE, 'utf-8');
      records = JSON.parse(content);
      console.log(`Loaded ${records.length} recruitment records from disk.`);
    } else {
      records = generateInitialRecruitmentRecords();
      saveRecords();
      console.log(`Seeded ${records.length} authentic recruitment records.`);
    }

    if (fs.existsSync(AUDIT_FILE)) {
      const content = fs.readFileSync(AUDIT_FILE, 'utf-8');
      auditLogs = JSON.parse(content);
    } else {
      // Initial audit log
      auditLogs = [
        {
          id: 'audit-init-1',
          recordId: 'all',
          action: 'BATCH_IMPORT',
          performedBy: 'System / MRF Excel Import',
          performedByEmpId: 'SYSTEM',
          performedByRole: 'editor',
          timestamp: new Date().toISOString(),
          changes: [],
          summaryNote: 'Initial MRF Excel baseline imported (98 Joined, 9 Ongoing, 1 Held Up; Total 108 records).',
        },
      ];
      saveAuditLogs();
    }

    if (fs.existsSync(RATINGS_FILE)) {
      const content = fs.readFileSync(RATINGS_FILE, 'utf-8');
      ratings = JSON.parse(content);
    } else {
      // Seed initial leadership reviews for the 4 HR employees
      ratings = [
        {
          id: 'rating-1',
          employeeId: '22-02-1330',
          employeeName: 'Quazi Nuzhat Rahman',
          ratedByEmpId: '01-02-0440',
          ratedByName: 'Syeda Shaila Ashraf',
          ratedByDesignation: 'Head of HR',
          rating: 5,
          feedback: 'Exceptional recruitment turnaround and stakeholder handling in critical executive requisitions.',
          ratedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        },
        {
          id: 'rating-2',
          employeeId: '22-02-1642',
          employeeName: 'Sabbir Hossain',
          ratedByEmpId: '22-02-1826',
          ratedByName: 'Shahriyar Naiem',
          ratedByDesignation: 'Manager, HR & OD',
          rating: 4.8,
          feedback: 'Very proactive in closing commercial and sales requisitions. Great communication with HODs.',
          ratedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        },
        {
          id: 'rating-3',
          employeeId: '02-02-2059',
          employeeName: 'Fariha Nasmi',
          ratedByEmpId: '01-02-0440',
          ratedByName: 'Syeda Shaila Ashraf',
          ratedByDesignation: 'Head of HR',
          rating: 4.6,
          feedback: 'Consistent turnaround and thorough candidate background screening.',
          ratedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
        },
        {
          id: 'rating-4',
          employeeId: '22-02-1551',
          employeeName: 'Maisha Islam',
          ratedByEmpId: '22-02-1826',
          ratedByName: 'Shahriyar Naiem',
          ratedByDesignation: 'Manager, HR & OD',
          rating: 4.7,
          feedback: 'Great speed on technical and factory requisitions. High candidate offer acceptance rate.',
          ratedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        },
      ];
      saveRatings();
    }

    if (fs.existsSync(EMPLOYEES_FILE)) {
      const content = fs.readFileSync(EMPLOYEES_FILE, 'utf-8');
      teamEmployees = JSON.parse(content);
      console.log(`Loaded ${teamEmployees.length} HR team members from disk.`);
    } else {
      teamEmployees = AUTHORIZED_USERS.map((u) => ({ ...u, status: 'active' as const }));
      saveTeamEmployees();
    }
  } catch (err) {
    console.error('Error loading data:', err);
    records = generateInitialRecruitmentRecords();
  }
}

function saveRecords() {
  try {
    fs.writeFileSync(RECORDS_FILE, JSON.stringify(records, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving records:', err);
  }
}

function saveTeamEmployees() {
  try {
    fs.writeFileSync(EMPLOYEES_FILE, JSON.stringify(teamEmployees, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving team employees:', err);
  }
}

function saveAuditLogs() {
  try {
    fs.writeFileSync(AUDIT_FILE, JSON.stringify(auditLogs, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving audit logs:', err);
  }
}

function saveRatings() {
  try {
    fs.writeFileSync(RATINGS_FILE, JSON.stringify(ratings, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving ratings:', err);
  }
}

function isTeamManager(employeeId?: string): boolean {
  return employeeId === '01-02-0440' || employeeId === '22-02-1826';
}

loadData();

// Broadcast helper
function broadcast(message: object, excludeWs?: WebSocket) {
  const payload = JSON.stringify(message);
  for (const [client] of connectedClients) {
    if (client.readyState === WebSocket.OPEN && client !== excludeWs) {
      try {
        client.send(payload);
      } catch (err) {
        console.error('WebSocket send error:', err);
      }
    }
  }
}

function getActivePresences(): ActivePresence[] {
  const list: ActivePresence[] = [];
  const now = Date.now();
  for (const [, state] of connectedClients) {
    if (state.user && now - state.user.lastPing < 60000) {
      list.push(state.user);
    }
  }
  return list;
}

function cleanExpiredLocks() {
  const now = Date.now();
  for (const [recordId, lock] of activeLocks) {
    if (now - lock.lockedAt > 120000) {
      // 2 min lock timeout
      activeLocks.delete(recordId);
      broadcast({ type: 'RECORD_UNLOCKED', recordId });
    }
  }
}

setInterval(cleanExpiredLocks, 10000);

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '20mb' }));

  const httpServer = http.createServer(app);
  const wss = new WebSocketServer({ server: httpServer });

  // WebSocket Connection Handling
  wss.on('connection', (ws: WebSocket) => {
    connectedClients.set(ws, { user: null });

    // Send initial snapshot
    ws.send(
      JSON.stringify({
        type: 'INIT',
        records,
        teamEmployees,
        auditLogs: auditLogs.slice(-200), // recent 200 logs
        ratings,
        locks: Array.from(activeLocks.values()),
        presences: getActivePresences(),
      })
    );

    ws.on('message', (data: string) => {
      try {
        const msg = JSON.parse(data.toString());

        switch (msg.type) {
          case 'PING': {
            const clientState = connectedClients.get(ws);
            if (clientState?.user) {
              clientState.user.lastPing = Date.now();
            }
            ws.send(JSON.stringify({ type: 'PONG', timestamp: Date.now() }));
            break;
          }

          case 'PRESENCE_JOIN': {
            const clientState = connectedClients.get(ws);
            if (clientState) {
              clientState.user = {
                userId: msg.user.id || msg.user.employeeId,
                employeeId: msg.user.employeeId,
                name: msg.user.name,
                designation: msg.user.designation,
                role: msg.user.role,
                avatarColor: msg.user.avatarColor,
                activeRecordId: msg.activeRecordId || null,
                activePage: msg.activePage || 'dashboard',
                lastPing: Date.now(),
              };
              broadcast({ type: 'PRESENCE_UPDATE', presences: getActivePresences() });
            }
            break;
          }

          case 'LOCK_RECORD': {
            const { recordId, recordSl, user } = msg;
            activeLocks.set(recordId, {
              recordId,
              recordSl,
              lockedByEmpId: user.employeeId,
              lockedByName: user.name,
              lockedAt: Date.now(),
            });
            broadcast({
              type: 'RECORD_LOCKED',
              lock: activeLocks.get(recordId),
            });
            break;
          }

          case 'UNLOCK_RECORD': {
            const { recordId } = msg;
            if (activeLocks.has(recordId)) {
              activeLocks.delete(recordId);
              broadcast({ type: 'RECORD_UNLOCKED', recordId });
            }
            break;
          }

          case 'SUBMIT_RATING': {
            const { rating } = msg;
            // Update or add rating
            const existingIdx = ratings.findIndex(
              (r) => r.employeeId === rating.employeeId && r.ratedByEmpId === rating.ratedByEmpId
            );
            if (existingIdx >= 0) {
              ratings[existingIdx] = rating;
            } else {
              ratings.push(rating);
            }
            saveRatings();

            // Log in audit trail
            auditLogs.push({
              id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              recordId: rating.employeeId,
              action: 'RATING',
              performedBy: rating.ratedByName,
              performedByEmpId: rating.ratedByEmpId,
              performedByRole: 'viewer',
              timestamp: new Date().toISOString(),
              changes: [],
              summaryNote: `Leadership appraisal rating submitted for ${rating.employeeName}: ${rating.rating}/5 stars.`,
            });
            saveAuditLogs();

            broadcast({ type: 'RATING_SAVED', rating, ratings, auditLogs: auditLogs.slice(-200) });
            break;
          }
        }
      } catch (err) {
        console.error('Error handling WebSocket message:', err);
      }
    });

    ws.on('close', () => {
      // Release any locks held by this connection
      const clientState = connectedClients.get(ws);
      if (clientState?.user) {
        for (const [recordId, lock] of activeLocks) {
          if (lock.lockedByEmpId === clientState.user.employeeId) {
            activeLocks.delete(recordId);
            broadcast({ type: 'RECORD_UNLOCKED', recordId });
          }
        }
      }
      connectedClients.delete(ws);
      broadcast({ type: 'PRESENCE_UPDATE', presences: getActivePresences() });
    });
  });

  // REST APIs
  // 1. Get all records
  app.get('/api/records', (req, res) => {
    res.json({ records, count: records.length });
  });

  // 2. Add New Requisition
  app.post('/api/records', (req, res) => {
    const { record, user } = req.body;
    if (!user || user.role === 'viewer') {
      return res.status(403).json({ error: 'Permission denied: Dashboard Viewing accounts cannot create records.' });
    }

    const nextSl = records.length > 0 ? Math.max(...records.map((r) => r.sl || 0)) + 1 : 1;
    const newRecord: RecruitmentRecord = {
      ...record,
      id: `rg-rec-${Date.now()}-${nextSl}`,
      sl: nextSl,
      version: 1,
      lastUpdatedBy: `${user.name} (${user.employeeId})`,
      lastUpdatedAt: new Date().toISOString(),
    };

    // Calculate timeToFill or pendingAge
    if (newRecord.status === 'Joined' && newRecord.doj && newRecord.requisitionDate) {
      newRecord.timeToFill = calculateDaysBetween(newRecord.requisitionDate, newRecord.doj);
      newRecord.pendingAge = null;
    } else {
      newRecord.timeToFill = null;
      newRecord.pendingAge = calculatePendingAge(newRecord.requisitionDate);
    }

    records.push(newRecord);
    saveRecords();

    // Audit log
    const auditEntry: AuditLogEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      recordId: newRecord.id,
      recordSl: newRecord.sl,
      positionTitle: newRecord.positionTitle,
      action: 'CREATE',
      performedBy: user.name,
      performedByEmpId: user.employeeId,
      performedByRole: user.role,
      timestamp: new Date().toISOString(),
      changes: [],
      summaryNote: `Created new requisition for "${newRecord.positionTitle}" in ${newRecord.department} (${newRecord.company}).`,
    };
    auditLogs.push(auditEntry);
    saveAuditLogs();

    broadcast({ type: 'RECORD_CREATED', record: newRecord, auditEntry });
    res.status(201).json({ record: newRecord });
  });

  // 3. Update Existing Requisition
  app.put('/api/records/:id', (req, res) => {
    const { id } = req.params;
    const { updatedRecord, user } = req.body;

    if (!user || user.role === 'viewer') {
      return res.status(403).json({ error: 'Permission denied: View-only users cannot edit records.' });
    }

    const index = records.findIndex((r) => r.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Record not found' });
    }

    const currentRecord = records[index];

    // Compute field changes for audit log
    const changes: Array<{ field: string; oldValue: any; newValue: any }> = [];
    const fieldsToTrack: (keyof RecruitmentRecord)[] = [
      'positionTitle',
      'department',
      'company',
      'vacancy',
      'recruitmentType',
      'status',
      'offerLetterDate',
      'doj',
      'requisitionDate',
      'remarks',
      'recruitmentAssistedBy',
      'replacementOfWhom',
      'replacementEmployeeSalary',
    ];

    for (const field of fieldsToTrack) {
      if (currentRecord[field] !== updatedRecord[field]) {
        changes.push({
          field,
          oldValue: currentRecord[field] ?? '',
          newValue: updatedRecord[field] ?? '',
        });
      }
    }

    // Auto-calculate Time to Fill or Pending Age
    let timeToFill = currentRecord.timeToFill;
    let pendingAge = currentRecord.pendingAge;

    if (updatedRecord.status === 'Joined') {
      if (updatedRecord.doj && updatedRecord.requisitionDate) {
        timeToFill = calculateDaysBetween(updatedRecord.requisitionDate, updatedRecord.doj);
      }
      pendingAge = null;
    } else if (updatedRecord.status === 'Ongoing' || updatedRecord.status === 'Held Up') {
      timeToFill = null;
      pendingAge = calculatePendingAge(updatedRecord.requisitionDate);
    } else {
      timeToFill = null;
      pendingAge = null;
    }

    const finalRecord: RecruitmentRecord = {
      ...updatedRecord,
      id: currentRecord.id,
      sl: currentRecord.sl,
      timeToFill,
      pendingAge,
      version: (currentRecord.version || 1) + 1,
      lastUpdatedBy: `${user.name} (${user.employeeId})`,
      lastUpdatedAt: new Date().toISOString(),
    };

    records[index] = finalRecord;
    saveRecords();

    // Release any lock on this record
    if (activeLocks.has(id)) {
      activeLocks.delete(id);
      broadcast({ type: 'RECORD_UNLOCKED', recordId: id });
    }

    // Audit log
    const auditEntry: AuditLogEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      recordId: finalRecord.id,
      recordSl: finalRecord.sl,
      positionTitle: finalRecord.positionTitle,
      action: changes.some((c) => c.field === 'status') ? 'STATUS_CHANGE' : 'UPDATE',
      performedBy: user.name,
      performedByEmpId: user.employeeId,
      performedByRole: user.role,
      timestamp: new Date().toISOString(),
      changes,
      summaryNote: `Updated SL #${finalRecord.sl} (${finalRecord.positionTitle}). ${changes.length} field(s) modified.`,
    };
    auditLogs.push(auditEntry);
    saveAuditLogs();

    broadcast({ type: 'RECORD_UPDATED', record: finalRecord, auditEntry });
    res.json({ record: finalRecord });
  });

  // 4. Delete Record
  app.delete('/api/records/:id', (req, res) => {
    const { id } = req.params;
    const { user } = req.body;

    if (!user || user.role === 'viewer') {
      return res.status(403).json({ error: 'Permission denied: View-only users cannot delete records.' });
    }

    const index = records.findIndex((r) => r.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Record not found' });
    }

    const deleted = records.splice(index, 1)[0];
    saveRecords();

    const auditEntry: AuditLogEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      recordId: deleted.id,
      recordSl: deleted.sl,
      positionTitle: deleted.positionTitle,
      action: 'DELETE',
      performedBy: user.name,
      performedByEmpId: user.employeeId,
      performedByRole: user.role,
      timestamp: new Date().toISOString(),
      changes: [],
      summaryNote: `Deleted requisition SL #${deleted.sl} (${deleted.positionTitle}).`,
    };
    auditLogs.push(auditEntry);
    saveAuditLogs();

    broadcast({ type: 'RECORD_DELETED', recordId: id, auditEntry });
    res.json({ success: true, deletedId: id });
  });

  // 5. Batch Import (Excel / JSON)
  app.post('/api/records/batch-import', (req, res) => {
    const { importedRecords, user, mode } = req.body; // mode: 'append' or 'replace'

    if (!user || user.role === 'viewer') {
      return res.status(403).json({ error: 'Permission denied: View-only users cannot import records.' });
    }

    if (!Array.isArray(importedRecords) || importedRecords.length === 0) {
      return res.status(400).json({ error: 'Invalid records array.' });
    }

    let nextSl = mode === 'replace' ? 1 : (records.length > 0 ? Math.max(...records.map((r) => r.sl || 0)) + 1 : 1);

    const processedList: RecruitmentRecord[] = importedRecords.map((item: any, i: number) => {
      const sl = item.sl || (nextSl + i);
      const reqDate = item.requisitionDate || '2026-01-01';
      const doj = item.doj || '';
      const status = item.status || (doj ? 'Joined' : 'Ongoing');

      let timeToFill: number | null = null;
      let pendingAge: number | null = null;

      if (status === 'Joined' && doj && reqDate) {
        timeToFill = calculateDaysBetween(reqDate, doj);
      } else if (status === 'Ongoing' || status === 'Held Up') {
        pendingAge = calculatePendingAge(reqDate);
      }

      return {
        id: item.id || `rg-rec-${Date.now()}-${sl}`,
        sl,
        positionTitle: item.positionTitle || 'Untitled Position',
        department: item.department || 'General',
        requisitionDate: reqDate,
        requisitionSubmittedBy: item.requisitionSubmittedBy || 'HOD',
        hod: item.hod || 'HOD',
        company: item.company || 'RAL',
        vacancy: Number(item.vacancy) || 1,
        recruitmentType: item.recruitmentType || 'New Recruitment',
        replacementOfWhom: item.replacementOfWhom || '',
        replacementEmployeeSalary: item.replacementEmployeeSalary,
        offerLetterDate: item.offerLetterDate || '',
        doj,
        status,
        timeToFill,
        pendingAge,
        remarks: item.remarks || '',
        recruitmentAssistedBy: item.recruitmentAssistedBy || 'Quazi Nuzhat Rahman',
        checklist: item.checklist || {
          mrfApproved: true,
          jobPosted: true,
          cvScreening: true,
          firstInterview: false,
          finalInterview: false,
          salaryDiscussion: false,
          bgVerification: false,
          offerLetterIssued: !!item.offerLetterDate,
          offerAccepted: !!doj,
          onboardingPrepared: !!doj,
          joiningConfirmed: status === 'Joined',
        },
        lastUpdatedBy: `${user.name} (${user.employeeId})`,
        lastUpdatedAt: new Date().toISOString(),
        version: 1,
      };
    });

    if (mode === 'replace') {
      records = processedList;
    } else {
      // Append without duplicating existing ids or exact matches
      const existingIds = new Set(records.map((r) => r.id));
      for (const rec of processedList) {
        if (!existingIds.has(rec.id)) {
          records.push(rec);
        }
      }
    }

    saveRecords();

    const auditEntry: AuditLogEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      recordId: 'batch',
      action: 'BATCH_IMPORT',
      performedBy: user.name,
      performedByEmpId: user.employeeId,
      performedByRole: user.role,
      timestamp: new Date().toISOString(),
      changes: [],
      summaryNote: `Imported ${processedList.length} recruitment records via Excel/JSON import (mode: ${mode}).`,
    };
    auditLogs.push(auditEntry);
    saveAuditLogs();

    broadcast({ type: 'BATCH_IMPORTED', records, auditEntry });
    res.json({ success: true, count: records.length });
  });

  // 6. Reset to Baseline 108 records (Admin / testing feature)
  app.post('/api/records/reset-seed', (req, res) => {
    const { user } = req.body;
    records = generateInitialRecruitmentRecords();
    saveRecords();

    const auditEntry: AuditLogEntry = {
      id: `audit-${Date.now()}`,
      recordId: 'all',
      action: 'BATCH_IMPORT',
      performedBy: user?.name || 'Administrator',
      performedByEmpId: user?.employeeId || 'ADMIN',
      performedByRole: 'editor',
      timestamp: new Date().toISOString(),
      changes: [],
      summaryNote: 'Reset database to authentic MRF baseline (98 Joined, 9 Ongoing, 1 Held Up = 108 records).',
    };
    auditLogs.push(auditEntry);
    saveAuditLogs();

    broadcast({ type: 'BATCH_IMPORTED', records, auditEntry });
    res.json({ success: true, count: records.length });
  });

  // 7. Get Audit Logs
  app.get('/api/audit-logs', (req, res) => {
    res.json({ logs: auditLogs.slice(-300) });
  });

  // 8. Get Ratings
  app.get('/api/ratings', (req, res) => {
    res.json({ ratings });
  });

  // 9. Clear All Records (Wipe database)
  app.delete('/api/records-all', (req, res) => {
    const { user } = req.body;
    if (!user) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const count = records.length;
    records = [];
    saveRecords();

    const auditEntry: AuditLogEntry = {
      id: `audit-${Date.now()}`,
      recordId: 'all',
      action: 'DELETE',
      performedBy: user.name,
      performedByEmpId: user.employeeId,
      performedByRole: user.role,
      timestamp: new Date().toISOString(),
      changes: [],
      summaryNote: `Cleared all ${count} recruitment records from database.`,
    };
    auditLogs.push(auditEntry);
    saveAuditLogs();

    broadcast({ type: 'BATCH_IMPORTED', records: [], auditEntry });
    res.json({ success: true, count: 0 });
  });

  // 10. Get HR Team Members
  app.get('/api/employees', (req, res) => {
    res.json({ employees: teamEmployees });
  });

  // 11. Add New HR Officer (Restricted to Syeda Shaila Ashraf & Shahriyar Naiem)
  app.post('/api/employees', (req, res) => {
    const { employee, user } = req.body;

    if (!user || !isTeamManager(user.employeeId)) {
      return res.status(403).json({
        error: 'Permission denied: Only Syeda Shaila Ashraf and Shahriyar Naiem are authorized to add HR employees.',
      });
    }

    if (!employee || !employee.name || !employee.employeeId) {
      return res.status(400).json({ error: 'Name and Employee ID are required.' });
    }

    const trimmedId = employee.employeeId.trim();
    const trimmedName = employee.name.trim();

    if (teamEmployees.some((e) => e.employeeId === trimmedId)) {
      return res.status(400).json({ error: `An employee with ID "${trimmedId}" already exists.` });
    }

    const colors = [
      'from-cyan-600 to-blue-700',
      'from-emerald-600 to-teal-700',
      'from-purple-600 to-violet-800',
      'from-amber-600 to-orange-700',
      'from-rose-600 to-pink-700',
      'from-blue-600 to-indigo-700',
    ];
    const pickedColor = employee.avatarColor || colors[teamEmployees.length % colors.length];

    const newEmp: HRUser = {
      id: trimmedId,
      employeeId: trimmedId,
      name: trimmedName,
      designation: employee.designation ? employee.designation.trim() : 'Executive, HR',
      role: 'editor',
      avatarColor: pickedColor,
      email: employee.email || `${trimmedName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@rghr.com`,
      status: 'active',
      addedAt: new Date().toISOString(),
    };

    teamEmployees.push(newEmp);
    saveTeamEmployees();

    const auditEntry: AuditLogEntry = {
      id: `audit-${Date.now()}`,
      recordId: newEmp.employeeId,
      action: 'CREATE',
      performedBy: user.name,
      performedByEmpId: user.employeeId,
      performedByRole: user.role,
      timestamp: new Date().toISOString(),
      changes: [],
      summaryNote: `Added new HR officer: ${newEmp.name} (ID: ${newEmp.employeeId}, ${newEmp.designation}).`,
    };
    auditLogs.push(auditEntry);
    saveAuditLogs();

    broadcast({ type: 'EMPLOYEES_UPDATED', teamEmployees, auditEntry });
    res.status(201).json({ success: true, employee: newEmp, teamEmployees });
  });

  // 12. Update Employee Status / Resign (Restricted to Syeda Shaila Ashraf & Shahriyar Naiem)
  app.put('/api/employees/:employeeId/status', (req, res) => {
    const { employeeId } = req.params;
    const { status, user } = req.body; // 'active' | 'resigned'

    if (!user || !isTeamManager(user.employeeId)) {
      return res.status(403).json({
        error: 'Permission denied: Only Syeda Shaila Ashraf and Shahriyar Naiem can update employee status.',
      });
    }

    if (employeeId === '01-02-0440' || employeeId === '22-02-1826') {
      return res.status(400).json({ error: 'Cannot modify status of leadership administrators.' });
    }

    const emp = teamEmployees.find((e) => e.employeeId === employeeId);
    if (!emp) {
      return res.status(404).json({ error: 'Employee not found.' });
    }

    const oldStatus = emp.status || 'active';
    emp.status = status;
    if (status === 'resigned') {
      emp.resignedAt = new Date().toISOString();
    } else {
      emp.resignedAt = undefined;
    }
    saveTeamEmployees();

    const auditEntry: AuditLogEntry = {
      id: `audit-${Date.now()}`,
      recordId: emp.employeeId,
      action: 'UPDATE',
      performedBy: user.name,
      performedByEmpId: user.employeeId,
      performedByRole: user.role,
      timestamp: new Date().toISOString(),
      changes: [{ field: 'status', oldValue: oldStatus, newValue: status }],
      summaryNote: `${status === 'resigned' ? 'Marked as Resigned' : 'Reactivated'} HR officer: ${emp.name} (${emp.employeeId}).`,
    };
    auditLogs.push(auditEntry);
    saveAuditLogs();

    broadcast({ type: 'EMPLOYEES_UPDATED', teamEmployees, auditEntry });
    res.json({ success: true, employee: emp, teamEmployees });
  });

  // 13. Remove HR Officer (Restricted to Syeda Shaila Ashraf & Shahriyar Naiem)
  app.delete('/api/employees/:employeeId', (req, res) => {
    const { employeeId } = req.params;
    const { user } = req.body;

    if (!user || !isTeamManager(user.employeeId)) {
      return res.status(403).json({
        error: 'Permission denied: Only Syeda Shaila Ashraf and Shahriyar Naiem can remove HR employees.',
      });
    }

    if (employeeId === '01-02-0440' || employeeId === '22-02-1826') {
      return res.status(400).json({ error: 'Cannot delete leadership administrators.' });
    }

    const idx = teamEmployees.findIndex((e) => e.employeeId === employeeId);
    if (idx === -1) {
      return res.status(404).json({ error: 'Employee not found.' });
    }

    const removed = teamEmployees.splice(idx, 1)[0];
    saveTeamEmployees();

    const auditEntry: AuditLogEntry = {
      id: `audit-${Date.now()}`,
      recordId: removed.employeeId,
      action: 'DELETE',
      performedBy: user.name,
      performedByEmpId: user.employeeId,
      performedByRole: user.role,
      timestamp: new Date().toISOString(),
      changes: [],
      summaryNote: `Removed HR officer profile: ${removed.name} (${removed.employeeId}).`,
    };
    auditLogs.push(auditEntry);
    saveAuditLogs();

    broadcast({ type: 'EMPLOYEES_UPDATED', teamEmployees, auditEntry });
    res.json({ success: true, deletedId: employeeId, teamEmployees });
  });

  // Vite Integration
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`RG HR Recruitment Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

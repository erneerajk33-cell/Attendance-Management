import { Center, Staff, AttendanceRecord, Holiday, LeaveRequest, ApprovalRequest, BroadcastMessage, ActivityLog, AttendanceRuleConfig } from '../types';
import {
  INITIAL_CENTERS,
  INITIAL_STAFF,
  INITIAL_HOLIDAYS,
  INITIAL_BROADCASTS,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_APPROVAL_REQUESTS,
  INITIAL_ATTENDANCE_RECORDS,
  INITIAL_ACTIVITY_LOGS,
  INITIAL_RULE_CONFIG,
} from '../data/initialData';

const STORAGE_KEYS = {
  CENTERS: 'skill_attendance_centers_v1',
  STAFF: 'skill_attendance_staff_v1',
  ATTENDANCE: 'skill_attendance_records_v1',
  HOLIDAYS: 'skill_attendance_holidays_v1',
  LEAVES: 'skill_attendance_leaves_v1',
  APPROVALS: 'skill_attendance_approvals_v1',
  BROADCASTS: 'skill_attendance_broadcasts_v1',
  LOGS: 'skill_attendance_logs_v1',
  RULES: 'skill_attendance_rules_v1',
  ADMIN_PASS: 'skill_attendance_admin_password_v1',
};

export const storage = {
  getCenters(): Center[] {
    const data = localStorage.getItem(STORAGE_KEYS.CENTERS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.CENTERS, JSON.stringify(INITIAL_CENTERS));
      return INITIAL_CENTERS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_CENTERS;
    }
  },
  saveCenters(centers: Center[]) {
    localStorage.setItem(STORAGE_KEYS.CENTERS, JSON.stringify(centers));
  },

  getStaff(): Staff[] {
    const data = localStorage.getItem(STORAGE_KEYS.STAFF);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(INITIAL_STAFF));
      return INITIAL_STAFF;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_STAFF;
    }
  },
  saveStaff(staff: Staff[]) {
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staff));
  },

  getAttendance(): AttendanceRecord[] {
    const data = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(INITIAL_ATTENDANCE_RECORDS));
      return INITIAL_ATTENDANCE_RECORDS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_ATTENDANCE_RECORDS;
    }
  },
  saveAttendance(records: AttendanceRecord[]) {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records));
  },

  getHolidays(): Holiday[] {
    const data = localStorage.getItem(STORAGE_KEYS.HOLIDAYS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.HOLIDAYS, JSON.stringify(INITIAL_HOLIDAYS));
      return INITIAL_HOLIDAYS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_HOLIDAYS;
    }
  },
  saveHolidays(holidays: Holiday[]) {
    localStorage.setItem(STORAGE_KEYS.HOLIDAYS, JSON.stringify(holidays));
  },

  getLeaveRequests(): LeaveRequest[] {
    const data = localStorage.getItem(STORAGE_KEYS.LEAVES);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify(INITIAL_LEAVE_REQUESTS));
      return INITIAL_LEAVE_REQUESTS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_LEAVE_REQUESTS;
    }
  },
  saveLeaveRequests(leaves: LeaveRequest[]) {
    localStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify(leaves));
  },

  getApprovalRequests(): ApprovalRequest[] {
    const data = localStorage.getItem(STORAGE_KEYS.APPROVALS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.APPROVALS, JSON.stringify(INITIAL_APPROVAL_REQUESTS));
      return INITIAL_APPROVAL_REQUESTS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_APPROVAL_REQUESTS;
    }
  },
  saveApprovalRequests(approvals: ApprovalRequest[]) {
    localStorage.setItem(STORAGE_KEYS.APPROVALS, JSON.stringify(approvals));
  },

  getBroadcasts(): BroadcastMessage[] {
    const data = localStorage.getItem(STORAGE_KEYS.BROADCASTS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.BROADCASTS, JSON.stringify(INITIAL_BROADCASTS));
      return INITIAL_BROADCASTS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_BROADCASTS;
    }
  },
  saveBroadcasts(broadcasts: BroadcastMessage[]) {
    localStorage.setItem(STORAGE_KEYS.BROADCASTS, JSON.stringify(broadcasts));
  },

  getLogs(): ActivityLog[] {
    const data = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(INITIAL_ACTIVITY_LOGS));
      return INITIAL_ACTIVITY_LOGS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_ACTIVITY_LOGS;
    }
  },
  addLog(log: Omit<ActivityLog, 'id' | 'timestamp'>) {
    const logs = this.getLogs();
    const now = new Date();
    const newLog: ActivityLog = {
      ...log,
      id: 'LOG-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      timestamp: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${now.toLocaleTimeString('en-IN')}`,
    };
    const updated = [newLog, ...logs.slice(0, 199)];
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(updated));
    return newLog;
  },

  getRules(): AttendanceRuleConfig {
    const data = localStorage.getItem(STORAGE_KEYS.RULES);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(INITIAL_RULE_CONFIG));
      return INITIAL_RULE_CONFIG;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_RULE_CONFIG;
    }
  },
  saveRules(rules: AttendanceRuleConfig) {
    localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(rules));
  },

  getAdminPassword(): string {
    return localStorage.getItem(STORAGE_KEYS.ADMIN_PASS) || 'admin123';
  },
  setAdminPassword(password: string) {
    localStorage.setItem(STORAGE_KEYS.ADMIN_PASS, password);
  },

  resetAllToDefault() {
    localStorage.clear();
  },
};

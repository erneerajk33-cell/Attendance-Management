/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MainScreen } from './components/main/MainScreen';
import { CenterPortal } from './components/center/CenterPortal';
import { AdminPortal } from './components/admin/AdminPortal';
import { AndroidFrame } from './components/AndroidFrame';
import { storage } from './utils/storage';
import {
  Center,
  Staff,
  AttendanceRecord,
  Holiday,
  LeaveRequest,
  ApprovalRequest,
  BroadcastMessage,
  ActivityLog,
  AttendanceRuleConfig,
  UserRole,
} from './types';

export default function App() {
  // App view state
  const [currentRole, setCurrentRole] = useState<UserRole>('MAIN');
  const [activeCenter, setActiveCenter] = useState<Center | null>(null);

  // Persistent App State
  const [centers, setCenters] = useState<Center[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>([]);
  const [broadcasts, setBroadcasts] = useState<BroadcastMessage[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [rules, setRules] = useState<AttendanceRuleConfig>(storage.getRules());
  const [adminPassword, setAdminPassword] = useState<string>('admin123');

  // Load from local persistence on startup
  useEffect(() => {
    setCenters(storage.getCenters());
    setStaffList(storage.getStaff());
    setAttendanceRecords(storage.getAttendance());
    setHolidays(storage.getHolidays());
    setLeaveRequests(storage.getLeaveRequests());
    setApprovalRequests(storage.getApprovalRequests());
    setBroadcasts(storage.getBroadcasts());
    setActivityLogs(storage.getLogs());
    setRules(storage.getRules());
    setAdminPassword(storage.getAdminPassword());
  }, []);

  // Handlers for state updates
  const handleUpdateCenters = (updated: Center[]) => {
    setCenters(updated);
    storage.saveCenters(updated);
  };

  const handleUpdateStaff = (updated: Staff[]) => {
    setStaffList(updated);
    storage.saveStaff(updated);
  };

  const handleUpdateRules = (updated: AttendanceRuleConfig) => {
    setRules(updated);
    storage.saveRules(updated);
  };

  const handleUpdateHolidays = (updated: Holiday[]) => {
    setHolidays(updated);
    storage.saveHolidays(updated);
  };

  const handleUpdateBroadcasts = (updated: BroadcastMessage[]) => {
    setBroadcasts(updated);
    storage.saveBroadcasts(updated);
  };

  const handleAddLog = (
    action: string,
    details: string,
    severity: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR',
    centerId?: string
  ) => {
    const newLog = storage.addLog({
      actorType: currentRole === 'ADMIN' ? 'ADMIN' : currentRole === 'CENTER' ? 'CENTER' : 'SYSTEM',
      actorName:
        currentRole === 'ADMIN'
          ? 'Administrator Neeraj'
          : activeCenter
          ? activeCenter.name
          : 'Attendance System',
      action,
      details,
      severity,
      centerId,
    });
    setActivityLogs(storage.getLogs());
  };

  // Center Punch Record
  const handleRecordPunch = (record: Omit<AttendanceRecord, 'id'>) => {
    const newRecord: AttendanceRecord = {
      ...record,
      id: 'ATT-' + Date.now().toString(),
    };
    // Replace if same staff and date already exists, or append
    const existingIndex = attendanceRecords.findIndex(
      (r) => r.staffId === record.staffId && r.date === record.date
    );
    let updated: AttendanceRecord[];
    if (existingIndex >= 0) {
      updated = [...attendanceRecords];
      updated[existingIndex] = newRecord;
    } else {
      updated = [newRecord, ...attendanceRecords];
    }
    setAttendanceRecords(updated);
    storage.saveAttendance(updated);

    handleAddLog(
      record.inTime ? 'ATTENDANCE_PUNCH_IN' : 'ATTENDANCE_PUNCH_OUT',
      `${record.staffName} punched at ${record.centerName} (Method: ${record.inVerifiedMethod || record.outVerifiedMethod}, Distance: ${record.inDistanceMeters ?? record.outDistanceMeters}m)`,
      'SUCCESS',
      record.centerId
    );
  };

  // Profile Update Request from Staff
  const handleSubmitProfileUpdate = (staffId: string, updatedFields: Partial<Staff>) => {
    const staff = staffList.find((s) => s.id === staffId);
    if (!staff) return;

    const newReq: ApprovalRequest = {
      id: 'APR-' + Date.now().toString(),
      type: 'PROFILE_UPDATE',
      staffId: staff.id,
      staffName: staff.name,
      centerId: staff.centerId,
      centerName: centers.find((c) => c.id === staff.centerId)?.name || 'Skill Center',
      title: `Profile Update for ${staff.name}`,
      details: `Submitted changes for designation, phone, email, or photo details.`,
      payload: updatedFields,
      status: 'PENDING',
      requestedAt: new Date().toLocaleString('en-IN'),
    };

    const updatedReqs = [newReq, ...approvalRequests];
    setApprovalRequests(updatedReqs);
    storage.saveApprovalRequests(updatedReqs);

    handleAddLog('PROFILE_UPDATE_REQUESTED', `Staff ${staff.name} requested profile modification`, 'INFO', staff.centerId);
  };

  // Leave Request Submission
  const handleSubmitLeaveRequest = (leaveData: Omit<LeaveRequest, 'id' | 'status' | 'appliedAt'>) => {
    const newLeave: LeaveRequest = {
      ...leaveData,
      id: 'LEV-' + Date.now().toString(),
      status: 'PENDING',
      appliedAt: new Date().toLocaleString('en-IN'),
    };

    const updatedLeaves = [newLeave, ...leaveRequests];
    setLeaveRequests(updatedLeaves);
    storage.saveLeaveRequests(updatedLeaves);

    // Also add to approval requests for centralized admin review
    const newReq: ApprovalRequest = {
      id: 'APR-LEV-' + Date.now().toString(),
      type: 'LEAVE_REQUEST',
      staffId: leaveData.staffId,
      staffName: leaveData.staffName,
      centerId: leaveData.centerId,
      centerName: leaveData.centerName,
      title: `${leaveData.leaveType} Leave Application (${leaveData.daysCount} Days)`,
      details: `From ${leaveData.startDate} to ${leaveData.endDate}. Reason: ${leaveData.reason}`,
      payload: newLeave,
      status: 'PENDING',
      requestedAt: new Date().toLocaleString('en-IN'),
    };
    const updatedReqs = [newReq, ...approvalRequests];
    setApprovalRequests(updatedReqs);
    storage.saveApprovalRequests(updatedReqs);

    handleAddLog('LEAVE_APPLICATION_SUBMITTED', `${leaveData.staffName} applied for ${leaveData.daysCount} days leave`, 'INFO', leaveData.centerId);
  };

  // Out of Radius Manual Attendance Request
  const handleSubmitOutOfRadiusRequest = (staffId: string, details: string, payload: any) => {
    const staff = staffList.find((s) => s.id === staffId);
    if (!staff) return;

    const newReq: ApprovalRequest = {
      id: 'APR-RAD-' + Date.now().toString(),
      type: 'OUT_OF_RADIUS_PUNCH',
      staffId: staff.id,
      staffName: staff.name,
      centerId: staff.centerId,
      centerName: centers.find((c) => c.id === staff.centerId)?.name || 'Center',
      title: `Out-of-Radius Punch Approval for ${staff.name}`,
      details,
      payload,
      status: 'PENDING',
      requestedAt: new Date().toLocaleString('en-IN'),
    };

    const updatedReqs = [newReq, ...approvalRequests];
    setApprovalRequests(updatedReqs);
    storage.saveApprovalRequests(updatedReqs);

    handleAddLog('OUT_OF_RADIUS_REQUEST', `${staff.name} requested manual punch override (${payload.distance}m)`, 'WARNING', staff.centerId);
  };

  // Device Unblock Request
  const handleSubmitDeviceUnblockRequest = (staffId: string, reason: string, newDevice: any) => {
    const staff = staffList.find((s) => s.id === staffId);
    if (!staff) return;

    const newReq: ApprovalRequest = {
      id: 'APR-DEV-' + Date.now().toString(),
      type: 'DEVICE_UNBLOCK',
      staffId: staff.id,
      staffName: staff.name,
      centerId: staff.centerId,
      centerName: centers.find((c) => c.id === staff.centerId)?.name || 'Center',
      title: `Hardware Device Re-binding: ${staff.name}`,
      details: reason,
      payload: newDevice,
      status: 'PENDING',
      requestedAt: new Date().toLocaleString('en-IN'),
    };

    const updatedReqs = [newReq, ...approvalRequests];
    setApprovalRequests(updatedReqs);
    storage.saveApprovalRequests(updatedReqs);

    handleAddLog('DEVICE_UNBLOCK_REQUEST', `${staff.name} requested device hardware ID change`, 'WARNING', staff.centerId);
  };

  // Admin Approval Decision
  const handleApproveRequest = (requestId: string, approved: boolean, remarks?: string) => {
    const target = approvalRequests.find((r) => r.id === requestId);
    if (!target) return;

    const updatedReqs = approvalRequests.map((r) =>
      r.id === requestId
        ? {
            ...r,
            status: approved ? ('APPROVED' as const) : ('REJECTED' as const),
            reviewedAt: new Date().toLocaleString('en-IN'),
            adminRemarks: remarks,
          }
        : r
    );
    setApprovalRequests(updatedReqs);
    storage.saveApprovalRequests(updatedReqs);

    // Apply corresponding modifications if approved
    if (approved) {
      if (target.type === 'PROFILE_UPDATE' && target.payload) {
        const updatedStaff = staffList.map((s) =>
          s.id === target.staffId ? { ...s, ...target.payload } : s
        );
        handleUpdateStaff(updatedStaff);
      } else if (target.type === 'DEVICE_UNBLOCK' && target.payload?.newDeviceId) {
        const updatedStaff = staffList.map((s) =>
          s.id === target.staffId
            ? {
                ...s,
                registeredDeviceId: target.payload.newDeviceId,
                registeredDeviceModel: target.payload.deviceModel,
                isDeviceLocked: false,
              }
            : s
        );
        handleUpdateStaff(updatedStaff);
      } else if (target.type === 'LEAVE_REQUEST' && target.payload) {
        const updatedLeaves = leaveRequests.map((l) =>
          l.id === target.payload.id
            ? { ...l, status: 'APPROVED' as const, reviewedBy: 'Admin Neeraj', adminRemarks: remarks }
            : l
        );
        setLeaveRequests(updatedLeaves);
        storage.saveLeaveRequests(updatedLeaves);
      }
    }

    handleAddLog(
      approved ? 'REQUEST_APPROVED' : 'REQUEST_REJECTED',
      `Admin ${approved ? 'approved' : 'rejected'} request [${target.title}] for ${target.staffName}`,
      approved ? 'SUCCESS' : 'WARNING',
      target.centerId
    );
  };

  // Password Changes
  const handleChangeAdminPassword = (newPass: string) => {
    setAdminPassword(newPass);
    storage.setAdminPassword(newPass);
    handleAddLog('ADMIN_PASSWORD_CHANGED', 'Master administrator password updated', 'WARNING');
  };

  const handleChangeCenterPassword = (centerId: string, newPass: string) => {
    const updated = centers.map((c) => (c.id === centerId ? { ...c, password: newPass } : c));
    handleUpdateCenters(updated);
    handleAddLog('CENTER_PASSWORD_CHANGED', `Password updated for Center ID [${centerId}]`, 'INFO', centerId);
  };

  const handleChangeStaffPassword = (staffId: string, newPass: string) => {
    const updated = staffList.map((s) => (s.id === staffId ? { ...s, password: newPass } : s));
    handleUpdateStaff(updated);
    handleAddLog('STAFF_PASSWORD_CHANGED', `Password reset for Staff ID [${staffId}]`, 'INFO');
  };

  return (
    <AndroidFrame>
      {currentRole === 'MAIN' && (
        <MainScreen
          centers={centers}
          broadcasts={broadcasts}
          adminPassword={adminPassword}
          onCenterLoginSuccess={(center) => {
            setActiveCenter(center);
            setCurrentRole('CENTER');
            handleAddLog('CENTER_LOGIN', `Logged in to Center Portal [${center.name}]`, 'INFO', center.id);
          }}
          onAdminLoginSuccess={() => {
            setCurrentRole('ADMIN');
            handleAddLog('ADMIN_LOGIN', 'Administrator logged into Master Admin Portal', 'INFO');
          }}
        />
      )}

      {currentRole === 'CENTER' && activeCenter && (
        <CenterPortal
          center={activeCenter}
          staffList={staffList}
          attendanceRecords={attendanceRecords}
          leaveRequests={leaveRequests}
          approvalRequests={approvalRequests}
          broadcasts={broadcasts}
          rules={rules}
          onLogout={() => {
            handleAddLog('CENTER_LOGOUT', `Logged out from Center [${activeCenter.name}]`, 'INFO', activeCenter.id);
            setActiveCenter(null);
            setCurrentRole('MAIN');
          }}
          onRecordPunch={handleRecordPunch}
          onSubmitProfileUpdate={handleSubmitProfileUpdate}
          onSubmitLeaveRequest={handleSubmitLeaveRequest}
          onSubmitOutOfRadiusRequest={handleSubmitOutOfRadiusRequest}
          onSubmitDeviceUnblockRequest={handleSubmitDeviceUnblockRequest}
        />
      )}

      {currentRole === 'ADMIN' && (
        <AdminPortal
          centers={centers}
          staffList={staffList}
          attendanceRecords={attendanceRecords}
          holidays={holidays}
          leaveRequests={leaveRequests}
          approvalRequests={approvalRequests}
          broadcasts={broadcasts}
          activityLogs={activityLogs}
          rules={rules}
          adminPassword={adminPassword}
          onLogout={() => {
            handleAddLog('ADMIN_LOGOUT', 'Administrator logged out from master portal', 'INFO');
            setCurrentRole('MAIN');
          }}
          onUpdateCenters={handleUpdateCenters}
          onUpdateStaff={handleUpdateStaff}
          onUpdateRules={handleUpdateRules}
          onUpdateHolidays={handleUpdateHolidays}
          onUpdateBroadcasts={handleUpdateBroadcasts}
          onApproveRequest={handleApproveRequest}
          onChangeAdminPassword={handleChangeAdminPassword}
          onChangeCenterPassword={handleChangeCenterPassword}
          onChangeStaffPassword={handleChangeStaffPassword}
          onAddLog={(action, details, severity) => handleAddLog(action, details, severity)}
        />
      )}
    </AndroidFrame>
  );
}

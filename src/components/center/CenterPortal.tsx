import React, { useState, useEffect } from 'react';
import {
  Building2,
  LogOut,
  LayoutDashboard,
  UserCheck,
  Fingerprint,
  CalendarDays,
  FileSpreadsheet,
  MapPin,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Camera,
  CheckCircle2,
  Clock,
  Send,
  Upload,
  RefreshCw,
  Lock,
  Smartphone,
  Phone,
  Mail,
  UserX,
  Compass,
  Sparkles,
} from 'lucide-react';
import { SkillLogo } from '../SkillLogo';
import { DateTimeDisplay } from '../DateTimeDisplay';
import { BroadcastBanner } from '../BroadcastBanner';
import { InteractiveMap } from '../InteractiveMap';
import { FaceBiometricScanner } from '../FaceBiometricScanner';
import {
  Center,
  Staff,
  AttendanceRecord,
  LeaveRequest,
  ApprovalRequest,
  BroadcastMessage,
  AttendanceRuleConfig,
} from '../../types';
import { calculateDistanceMeters, getDeviceInfo } from '../../utils/geoUtils';

interface CenterPortalProps {
  center: Center;
  staffList: Staff[];
  attendanceRecords: AttendanceRecord[];
  leaveRequests: LeaveRequest[];
  approvalRequests: ApprovalRequest[];
  broadcasts: BroadcastMessage[];
  rules: AttendanceRuleConfig;
  onLogout: () => void;
  onRecordPunch: (record: Omit<AttendanceRecord, 'id'>) => void;
  onSubmitProfileUpdate: (staffId: string, updatedFields: Partial<Staff>) => void;
  onSubmitLeaveRequest: (leave: Omit<LeaveRequest, 'id' | 'status' | 'appliedAt'>) => void;
  onSubmitOutOfRadiusRequest: (staffId: string, details: string, payload: any) => void;
  onSubmitDeviceUnblockRequest: (staffId: string, reason: string, newDevice: any) => void;
}

export const CenterPortal: React.FC<CenterPortalProps> = ({
  center,
  staffList,
  attendanceRecords,
  leaveRequests,
  approvalRequests,
  broadcasts,
  rules,
  onLogout,
  onRecordPunch,
  onSubmitProfileUpdate,
  onSubmitLeaveRequest,
  onSubmitOutOfRadiusRequest,
  onSubmitDeviceUnblockRequest,
}) => {
  const centerStaff = staffList.filter((s) => s.centerId === center.id);

  // Active Menu Tab
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'STAFF_PROFILE' | 'PUNCH' | 'LEAVE' | 'REPORTS'>('OVERVIEW');

  // Device & GPS info
  const [deviceInfo, setDeviceInfo] = useState(getDeviceInfo());
  const [staffLat, setStaffLat] = useState<number>(center.latitude + 0.00012);
  const [staffLng, setStaffLng] = useState<number>(center.longitude + 0.00012);
  const [gpsAccuracy, setGpsAccuracy] = useState<number>(12);
  const [gpsLocked, setGpsLocked] = useState<boolean>(true);

  // Punching flow state
  const [selectedPunchStaffId, setSelectedPunchStaffId] = useState<string>(centerStaff[0]?.id || '');
  const [showFaceScanner, setShowFaceScanner] = useState<boolean>(false);
  const [punchType, setPunchType] = useState<'IN' | 'OUT'>('IN');
  const [punchSuccessMsg, setPunchSuccessMsg] = useState<string | null>(null);
  const [outOfRadiusReason, setOutOfRadiusReason] = useState<string>('');
  const [outOfRadiusSubmitted, setOutOfRadiusSubmitted] = useState<boolean>(false);

  // Staff Profile Login / Lock Flow
  const [staffProfileAuthId, setStaffProfileAuthId] = useState<string>('');
  const [staffProfileAuthPass, setStaffProfileAuthPass] = useState<string>('');
  const [activeLoggedInStaff, setActiveLoggedInStaff] = useState<Staff | null>(null);
  const [staffAuthError, setStaffAuthError] = useState<string>('');
  const [deviceBlockReason, setDeviceBlockReason] = useState<string>('');
  const [showUnblockPrompt, setShowUnblockPrompt] = useState<boolean>(false);

  // Profile Edit State
  const [editName, setEditName] = useState('');
  const [editDesignation, setEditDesignation] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editEmergency, setEditEmergency] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editPhotoUrl, setEditPhotoUrl] = useState('');
  const [profileRequestSuccess, setProfileRequestSuccess] = useState(false);

  // Leave Form State
  const [leaveStaffId, setLeaveStaffId] = useState(centerStaff[0]?.id || '');
  const [leaveType, setLeaveType] = useState<'CASUAL' | 'MEDICAL' | 'EARNED' | 'SPECIAL' | 'HALF_DAY'>('CASUAL');
  const [leaveStartDate, setLeaveStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [leaveEndDate, setLeaveEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveSuccessMsg, setLeaveSuccessMsg] = useState(false);

  // Report filters
  const [reportDateFilter, setReportDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [reportViewMode, setReportViewMode] = useState<'DAILY' | 'MONTHLY_MATRIX'>('DAILY');

  // Compute live distance
  const currentDistance = calculateDistanceMeters(center.latitude, center.longitude, staffLat, staffLng);
  const isWithinRadius = currentDistance <= center.radiusMeters;

  // Auto-detect device once on load
  useEffect(() => {
    setDeviceInfo(getDeviceInfo());
  }, []);

  // Today's date string
  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecords = attendanceRecords.filter(
    (r) => r.centerId === center.id && r.date === todayStr
  );

  const selectedStaffObj = centerStaff.find((s) => s.id === selectedPunchStaffId) || centerStaff[0];
  const existingTodayPunch = todayRecords.find((r) => r.staffId === selectedStaffObj?.id);

  // Handle Staff Profile Login Authentication
  const handleStaffProfileLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setStaffAuthError('');
    setShowUnblockPrompt(false);

    const foundStaff = centerStaff.find(
      (s) =>
        (s.id.toLowerCase() === staffProfileAuthId.trim().toLowerCase() ||
          s.staffCode.toLowerCase() === staffProfileAuthId.trim().toLowerCase() ||
          s.email.toLowerCase() === staffProfileAuthId.trim().toLowerCase())
    );

    if (!foundStaff) {
      setStaffAuthError('Staff ID or Code not found in this Center roster.');
      return;
    }

    if (foundStaff.password && staffProfileAuthPass !== foundStaff.password && staffProfileAuthPass !== 'staff@123password') {
      setStaffAuthError('Invalid password for staff profile access.');
      return;
    }

    // Check device binding & lock status: "Block if other staff have used a different ID and provide a reason."
    if (rules.strictDeviceBinding && foundStaff.registeredDeviceId && foundStaff.registeredDeviceId !== deviceInfo.deviceId) {
      setStaffAuthError(
        `DEVICE SECURITY LOCK: This staff account is bound to hardware [${foundStaff.registeredDeviceId}], but current detected device is [${deviceInfo.deviceId}]. Access is blocked for security.`
      );
      setShowUnblockPrompt(true);
      return;
    }

    // Successful staff profile auth
    setActiveLoggedInStaff(foundStaff);
    setEditName(foundStaff.name);
    setEditDesignation(foundStaff.designation);
    setEditDepartment(foundStaff.department);
    setEditPhone(foundStaff.phone);
    setEditEmail(foundStaff.email);
    setEditEmergency(foundStaff.emergencyContact);
    setEditAddress(foundStaff.address);
    setEditPhotoUrl(foundStaff.photoUrl);
  };

  // Submit Profile Edit for Admin Approval
  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLoggedInStaff) return;

    onSubmitProfileUpdate(activeLoggedInStaff.id, {
      name: editName,
      designation: editDesignation,
      department: editDepartment,
      phone: editPhone,
      email: editEmail,
      emergencyContact: editEmergency,
      address: editAddress,
      photoUrl: editPhotoUrl,
    });

    setProfileRequestSuccess(true);
    setTimeout(() => {
      setProfileRequestSuccess(false);
    }, 4000);
  };

  // Submit Device Unblock Request
  const handleDeviceUnblockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const staffToUnblock = centerStaff.find(
      (s) =>
        s.id.toLowerCase() === staffProfileAuthId.trim().toLowerCase() ||
        s.staffCode.toLowerCase() === staffProfileAuthId.trim().toLowerCase()
    );

    if (!staffToUnblock) return;

    onSubmitDeviceUnblockRequest(staffToUnblock.id, deviceBlockReason, {
      newDeviceId: deviceInfo.deviceId,
      deviceModel: deviceInfo.deviceModel,
      requestedAt: new Date().toLocaleString('en-IN'),
    });

    alert(
      `Hardware unblock and device re-binding request for ${staffToUnblock.name} submitted to Administrator Er. Neeraj Kumar. You will receive access upon approval.`
    );
    setShowUnblockPrompt(false);
    setDeviceBlockReason('');
  };

  // Trigger Punch Scan
  const handleStartPunchScan = (type: 'IN' | 'OUT') => {
    setPunchType(type);
    setShowFaceScanner(true);
  };

  // On successful biometric/face verification
  const handlePunchVerified = (method: 'FACE' | 'BIOMETRIC', photoDataUrl?: string) => {
    setShowFaceScanner(false);

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0]; // HH:mm:ss

    if (punchType === 'IN') {
      onRecordPunch({
        staffId: selectedStaffObj.id,
        staffName: selectedStaffObj.name,
        centerId: center.id,
        centerName: center.name,
        date: todayStr,
        inTime: timeStr,
        status: 'PRESENT',
        inLatitude: staffLat,
        inLongitude: staffLng,
        inDistanceMeters: currentDistance,
        inWithinRadius: isWithinRadius,
        inVerifiedMethod: method,
        inPhoto: photoDataUrl || selectedStaffObj.photoUrl,
        deviceId: deviceInfo.deviceId,
        remarks: `Biometric ${method} verified within ${currentDistance}m geo-fence.`,
      });
      setPunchSuccessMsg(`PUNCH IN SUCCESSFUL at ${timeStr} via ${method} verification!`);
    } else {
      // Punch Out update
      if (existingTodayPunch) {
        onRecordPunch({
          ...existingTodayPunch,
          outTime: timeStr,
          outLatitude: staffLat,
          outLongitude: staffLng,
          outDistanceMeters: currentDistance,
          outWithinRadius: isWithinRadius,
          outVerifiedMethod: method,
          outPhoto: photoDataUrl || selectedStaffObj.photoUrl,
          remarks: `${existingTodayPunch.remarks || ''} • Punch Out completed at ${timeStr}.`,
        });
      } else {
        onRecordPunch({
          staffId: selectedStaffObj.id,
          staffName: selectedStaffObj.name,
          centerId: center.id,
          centerName: center.name,
          date: todayStr,
          outTime: timeStr,
          status: 'PRESENT',
          outLatitude: staffLat,
          outLongitude: staffLng,
          outDistanceMeters: currentDistance,
          outWithinRadius: isWithinRadius,
          outVerifiedMethod: method,
          deviceId: deviceInfo.deviceId,
          remarks: `Direct Punch OUT at ${timeStr}.`,
        });
      }
      setPunchSuccessMsg(`PUNCH OUT SUCCESSFUL at ${timeStr} via ${method} verification!`);
    }

    setTimeout(() => {
      setPunchSuccessMsg(null);
    }, 5000);
  };

  // Handle Out of Radius Manual Request
  const handleOutOfRadiusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!outOfRadiusReason) return;

    onSubmitOutOfRadiusRequest(selectedStaffObj.id, outOfRadiusReason, {
      staffName: selectedStaffObj.name,
      distance: currentDistance,
      allowedRadius: center.radiusMeters,
      staffLat,
      staffLng,
      time: new Date().toLocaleTimeString('en-IN'),
      date: todayStr,
      punchType,
    });

    setOutOfRadiusSubmitted(true);
    setTimeout(() => {
      setOutOfRadiusSubmitted(false);
      setOutOfRadiusReason('');
    }, 4000);
  };

  // Handle Leave Submission
  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const stf = centerStaff.find((s) => s.id === leaveStaffId) || centerStaff[0];

    const d1 = new Date(leaveStartDate);
    const d2 = new Date(leaveEndDate);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);

    onSubmitLeaveRequest({
      staffId: stf.id,
      staffName: stf.name,
      centerId: center.id,
      centerName: center.name,
      leaveType,
      startDate: leaveStartDate,
      endDate: leaveEndDate,
      daysCount: leaveType === 'HALF_DAY' ? 0.5 : days,
      reason: leaveReason,
    });

    setLeaveSuccessMsg(true);
    setLeaveReason('');
    setTimeout(() => {
      setLeaveSuccessMsg(false);
    }, 3500);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans relative">
      {/* Skill Wallpaper Background */}
      <div
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            radial-gradient(at 0% 0%, rgba(37, 99, 235, 0.4) 0px, transparent 50%),
            radial-gradient(at 100% 0%, rgba(5, 150, 105, 0.35) 0px, transparent 50%),
            linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 100% 100%, 28px 28px, 28px 28px',
        }}
      />

      {/* Center Screen Header */}
      <header className="w-full bg-slate-950/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <SkillLogo size="md" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  {center.name}
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-950 text-blue-300 border border-blue-800 font-semibold">
                  {center.code}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <span>In-charge: {center.inchargeName}</span>
                <span>•</span>
                <span className="text-emerald-400">Shift: {center.shiftStartTime} - {center.shiftEndTime}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <DateTimeDisplay dark compact />

            {/* Logout Center Button */}
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-600/40 text-xs font-semibold transition active:scale-95 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout Center</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mandatory Welcome Message Banner */}
      <div className="w-full bg-gradient-to-r from-blue-900 via-emerald-900 to-blue-950 border-b border-blue-700/50 px-4 py-2 text-center text-xs sm:text-sm font-bold text-white shadow-inner flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4 text-amber-300 animate-spin-slow" />
        <span>Welcome to the online attendance management system.</span>
        <span className="hidden md:inline text-xs font-normal text-blue-200">
          (Geo-fenced GPS & Biometric Portal)
        </span>
      </div>

      {/* Mandatory Map / GPS Banner */}
      <div className="w-full max-w-7xl mx-auto px-4 pt-4">
        <InteractiveMap
          centerLat={center.latitude}
          centerLng={center.longitude}
          centerName={center.name}
          radiusMeters={center.radiusMeters}
          userLat={staffLat}
          userLng={staffLng}
          onUserLocationFetched={(lat, lng, dist, inside) => {
            setStaffLat(lat);
            setStaffLng(lng);
            setGpsLocked(true);
          }}
        />
      </div>

      {/* Center Navigation Menu Bar */}
      <div className="w-full max-w-7xl mx-auto px-4 py-4">
        <div className="bg-slate-950/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-800 flex items-center overflow-x-auto gap-1 shadow-md scrollbar-none">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'OVERVIEW'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-cyan-300" />
            <span>Overview & Status</span>
          </button>

          <button
            onClick={() => setActiveTab('PUNCH')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'PUNCH'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Fingerprint className="w-4 h-4 text-emerald-300 animate-pulse" />
            <span>Attendance Punch</span>
          </button>

          <button
            onClick={() => setActiveTab('STAFF_PROFILE')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'STAFF_PROFILE'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4 text-amber-300" />
            <span>Staff Profile & Edit</span>
          </button>

          <button
            onClick={() => setActiveTab('LEAVE')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'LEAVE'
                ? 'bg-amber-600 text-slate-950 font-extrabold shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <CalendarDays className="w-4 h-4 text-amber-400" />
            <span>Leave Request</span>
          </button>

          <button
            onClick={() => setActiveTab('REPORTS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'REPORTS'
                ? 'bg-cyan-700 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-cyan-300" />
            <span>Attendance Reports</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <main className="w-full max-w-7xl mx-auto px-4 pb-12 flex-1">
        {/* ================= TAB 1: OVERVIEW ================= */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-900/90 border border-blue-800/50 p-4 rounded-2xl">
                <p className="text-xs text-blue-400 font-semibold uppercase">Total Assigned Staff</p>
                <p className="text-2xl font-bold text-white mt-1">{centerStaff.length}</p>
                <p className="text-[11px] text-slate-400 mt-1">Enrolled at {center.city}</p>
              </div>

              <div className="bg-slate-900/90 border border-emerald-800/50 p-4 rounded-2xl">
                <p className="text-xs text-emerald-400 font-semibold uppercase">Punched In Today</p>
                <p className="text-2xl font-bold text-emerald-300 mt-1">
                  {todayRecords.filter((r) => r.status === 'PRESENT' || r.status === 'LATE').length}
                </p>
                <p className="text-[11px] text-emerald-500/80 mt-1">Bio-Verified</p>
              </div>

              <div className="bg-slate-900/90 border border-amber-800/50 p-4 rounded-2xl">
                <p className="text-xs text-amber-400 font-semibold uppercase">On Approved Leave</p>
                <p className="text-2xl font-bold text-amber-300 mt-1">
                  {leaveRequests.filter((l) => l.centerId === center.id && l.status === 'APPROVED').length}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Admin Approved</p>
              </div>

              <div className="bg-slate-900/90 border border-purple-800/50 p-4 rounded-2xl">
                <p className="text-xs text-purple-400 font-semibold uppercase">Geo-Fence Radius</p>
                <p className="text-2xl font-bold text-white mt-1 font-mono">{center.radiusMeters}m</p>
                <p className="text-[11px] text-purple-300 mt-1">
                  {isWithinRadius ? '✓ Inside Boundary' : '⚠ Outside Boundary'}
                </p>
              </div>
            </div>

            {/* Today's Staff Roster & Live Status */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="font-bold text-white text-base">Center Staff Live Attendance Status</h3>
                  <p className="text-xs text-slate-400">Real-time status for today ({todayStr})</p>
                </div>
                <button
                  onClick={() => setActiveTab('PUNCH')}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Fingerprint className="w-3.5 h-3.5" />
                  <span>Punch Attendance</span>
                </button>
              </div>

              <div className="divide-y divide-slate-800 mt-2">
                {centerStaff.map((stf) => {
                  const record = todayRecords.find((r) => r.staffId === stf.id);
                  const isPresent = !!record?.inTime;

                  return (
                    <div
                      key={stf.id}
                      className="py-3.5 flex flex-wrap items-center justify-between gap-3 hover:bg-slate-800/40 px-2 rounded-xl transition"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={stf.photoUrl}
                          alt={stf.name}
                          referrerPolicy="no-referrer"
                          className="w-11 h-11 rounded-full object-cover border-2 border-slate-700"
                        />
                        <div>
                          <p className="font-bold text-white text-sm">{stf.name}</p>
                          <p className="text-xs text-slate-400">
                            {stf.designation} • <span className="font-mono text-blue-400">{stf.staffCode}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {isPresent ? (
                          <div className="text-right">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              Punched IN ({record.inTime})
                            </span>
                            {record.outTime && (
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                Out Time: {record.outTime}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-950/80 text-rose-300 border border-rose-800">
                            <Clock className="w-3 h-3" />
                            Not Punched Today
                          </span>
                        )}

                        <button
                          onClick={() => {
                            setSelectedPunchStaffId(stf.id);
                            setActiveTab('PUNCH');
                          }}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white transition cursor-pointer"
                        >
                          Select
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: ATTENDANCE PUNCH ================= */}
        {activeTab === 'PUNCH' && (
          <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
            {/* Success Banner */}
            {punchSuccessMsg && (
              <div className="p-4 rounded-2xl bg-emerald-950 border-2 border-emerald-500 text-emerald-200 flex items-center gap-3 shadow-xl animate-bounce">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                <span className="font-bold text-sm">{punchSuccessMsg}</span>
              </div>
            )}

            {/* Step 1: Device Details & Auto Fetch Status */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-blue-400" />
                  <div>
                    <h3 className="font-bold text-white text-sm sm:text-base">Device & Geo-Location Integrity</h3>
                    <p className="text-xs text-slate-400">Automatic device fingerprint & calibrated GPS</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-950 text-blue-300 border border-blue-800">
                  ID: {deviceInfo.deviceId}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <p className="text-slate-400 font-semibold">Device Model & OS</p>
                  <p className="text-white font-bold">{deviceInfo.deviceModel}</p>
                  <p className="text-slate-500 text-[10px]">Screen: {deviceInfo.screenRes}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <p className="text-slate-400 font-semibold">Center Allowed Radius</p>
                  <p className="text-emerald-400 font-bold font-mono">
                    {center.radiusMeters} Meters (Current: {currentDistance}m)
                  </p>
                  <p className="text-slate-500 text-[10px]">
                    Status: {isWithinRadius ? '✓ Inside Permitted Zone' : '✗ Outside Geo-Fence'}
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2: Staff Selection */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
              <label className="block font-bold text-white text-sm">Select Staff Member for Punch</label>
              <select
                value={selectedPunchStaffId}
                onChange={(e) => setSelectedPunchStaffId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                {centerStaff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.staffCode}) - {s.designation}
                  </option>
                ))}
              </select>

              {/* Selected Staff Card */}
              {selectedStaffObj && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedStaffObj.photoUrl}
                      alt={selectedStaffObj.name}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-blue-500/50 shadow-md"
                    />
                    <div>
                      <h4 className="font-bold text-white text-base">{selectedStaffObj.name}</h4>
                      <p className="text-xs text-slate-400">{selectedStaffObj.designation}</p>
                      <p className="text-[11px] text-blue-400 font-mono mt-0.5">
                        Code: {selectedStaffObj.staffCode}
                      </p>
                    </div>
                  </div>

                  {existingTodayPunch && (
                    <div className="text-right">
                      <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-1 rounded-md border border-emerald-800">
                        In: {existingTodayPunch.inTime}
                      </span>
                      {existingTodayPunch.outTime && (
                        <p className="text-[10px] text-slate-400 mt-1">Out: {existingTodayPunch.outTime}</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Biometric / Face Verification Action */}
              {isWithinRadius ? (
                <div className="pt-2 space-y-3">
                  <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-600/40 text-emerald-200 text-xs flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      Geo-fence check verified ({currentDistance}m from Center). Facial or Biometric scan is required to punch.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => handleStartPunchScan('IN')}
                      className="py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer"
                    >
                      <Camera className="w-4 h-4 text-emerald-200" />
                      <span>Punch IN (Biometric/Face)</span>
                    </button>

                    <button
                      onClick={() => handleStartPunchScan('OUT')}
                      className="py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer"
                    >
                      <Fingerprint className="w-4 h-4 text-blue-200" />
                      <span>Punch OUT (Biometric/Face)</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Out of Radius Block Notice */
                <div className="pt-2 space-y-4">
                  <div className="p-4 rounded-2xl bg-amber-950/80 border border-amber-600/60 text-amber-200 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-sm text-amber-300">
                      <ShieldAlert className="w-5 h-5 text-amber-400" />
                      <span>OUTSIDE GEO-FENCE RADIUS — PUNCH BLOCKED</span>
                    </div>
                    <p className="text-xs text-amber-200/90 leading-relaxed">
                      Your current distance is <strong className="font-mono">{currentDistance} meters</strong>, which exceeds the center's maximum allowed boundary of <strong className="font-mono">{center.radiusMeters} meters</strong>.
                      Direct biometric punch is restricted to prevent attendance fraud.
                    </p>
                  </div>

                  {/* Out of Radius Request Form */}
                  <form onSubmit={handleOutOfRadiusSubmit} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <h5 className="font-bold text-white text-xs uppercase tracking-wide">
                      Submit Out-of-Radius Manual Punch Request to Admin
                    </h5>
                    <textarea
                      rows={2}
                      required
                      value={outOfRadiusReason}
                      onChange={(e) => setOutOfRadiusReason(e.target.value)}
                      placeholder="Explain reason for outside radius punch (e.g. Field assignment, GPS calibration, offsite workshop)..."
                      className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl p-2.5 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />

                    <button
                      type="submit"
                      disabled={outOfRadiusSubmitted}
                      className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition active:scale-98 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{outOfRadiusSubmitted ? 'Request Dispatched to Admin!' : 'Send Request to Admin for Approval'}</span>
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Face / Biometric Scanner Modal Popup */}
            {showFaceScanner && selectedStaffObj && (
              <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                <FaceBiometricScanner
                  staffName={selectedStaffObj.name}
                  staffPhotoUrl={selectedStaffObj.photoUrl}
                  isPunchIn={punchType === 'IN'}
                  onVerified={handlePunchVerified}
                  onCancel={() => setShowFaceScanner(false)}
                />
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 3: STAFF PROFILE & EDIT ================= */}
        {activeTab === 'STAFF_PROFILE' && (
          <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
            {!activeLoggedInStaff ? (
              // Staff Login Prompt
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                  <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-2xl border border-indigo-500/30">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Staff Profile Access Login</h3>
                    <p className="text-xs text-slate-400">
                      Login with Staff ID & Password to view and edit profile details
                    </p>
                  </div>
                </div>

                {staffAuthError && (
                  <div className="p-3.5 rounded-xl bg-rose-950/90 border border-rose-700 text-rose-200 text-xs font-medium space-y-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{staffAuthError}</span>
                    </div>

                    {showUnblockPrompt && (
                      <form onSubmit={handleDeviceUnblockSubmit} className="pt-2 border-t border-rose-800/80 space-y-2">
                        <label className="block text-[11px] text-rose-300 font-bold">
                          Reason for Device Change / Hardware Replacement:
                        </label>
                        <input
                          type="text"
                          required
                          value={deviceBlockReason}
                          onChange={(e) => setDeviceBlockReason(e.target.value)}
                          placeholder="e.g. Lost previous phone, new device purchased..."
                          className="w-full bg-slate-950 border border-rose-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        />
                        <button
                          type="submit"
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold cursor-pointer"
                        >
                          Submit Device Unblock Request to Admin
                        </button>
                      </form>
                    )}
                  </div>
                )}

                <form onSubmit={handleStaffProfileLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Staff ID / Staff Code / Email
                    </label>
                    <input
                      type="text"
                      required
                      value={staffProfileAuthId}
                      onChange={(e) => setStaffProfileAuthId(e.target.value)}
                      placeholder="e.g. SKL-EMP-101 or Er. Neeraj Kumar"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Staff Password
                    </label>
                    <input
                      type="password"
                      required
                      value={staffProfileAuthPass}
                      onChange={(e) => setStaffProfileAuthPass(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl shadow-md transition active:scale-98 cursor-pointer"
                  >
                    Authenticate & Open Profile
                  </button>
                </form>

                {/* Quick select buttons */}
                <div className="pt-3 border-t border-slate-800">
                  <p className="text-[11px] text-slate-400 mb-2 font-semibold">Center Staff Quick Login:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {centerStaff.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setStaffProfileAuthId(s.staffCode);
                          setStaffProfileAuthPass(s.password || 'staff@123password');
                          setStaffAuthError('');
                        }}
                        className="p-2 rounded-xl bg-slate-950 hover:bg-indigo-950/40 border border-slate-800 text-left text-xs truncate transition cursor-pointer"
                      >
                        <p className="font-bold text-white truncate">{s.name}</p>
                        <p className="text-[10px] text-indigo-400 font-mono">{s.staffCode}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              // Authenticated Staff Profile Editor
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <img
                      src={editPhotoUrl || activeLoggedInStaff.photoUrl}
                      alt={activeLoggedInStaff.name}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-500 shadow-md"
                    />
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-white">
                        {activeLoggedInStaff.name}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {activeLoggedInStaff.designation} • <span className="font-mono text-indigo-400">{activeLoggedInStaff.staffCode}</span>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveLoggedInStaff(null)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
                  >
                    Lock Profile
                  </button>
                </div>

                {profileRequestSuccess && (
                  <div className="p-3.5 rounded-xl bg-emerald-950 border border-emerald-600 text-emerald-200 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Profile update request has been submitted to Admin for approval.</span>
                  </div>
                )}

                {/* Edit Form */}
                <form onSubmit={handleProfileSave} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Designation</label>
                      <input
                        type="text"
                        required
                        value={editDesignation}
                        onChange={(e) => setEditDesignation(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
                      <input
                        type="text"
                        required
                        value={editDepartment}
                        onChange={(e) => setEditDepartment(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
                      <input
                        type="text"
                        required
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Emergency Contact</label>
                      <input
                        type="text"
                        value={editEmergency}
                        onChange={(e) => setEditEmergency(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Residential Address</label>
                    <input
                      type="text"
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Profile Photo URL / Photo Link
                    </label>
                    <input
                      type="url"
                      value={editPhotoUrl}
                      onChange={(e) => setEditPhotoUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[11px] text-amber-400">
                      * Profile changes are subject to Admin approval
                    </span>
                    <button
                      type="submit"
                      className="py-2.5 px-5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Profile for Admin Approval</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 4: LEAVE REQUEST ================= */}
        {activeTab === 'LEAVE' && (
          <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
            {leaveSuccessMsg && (
              <div className="p-4 rounded-2xl bg-emerald-950 border border-emerald-600 text-emerald-200 text-xs font-bold flex items-center gap-2 shadow-lg animate-bounce">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Leave application submitted successfully. Forwarded to Admin for approval.</span>
              </div>
            )}

            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                <div className="p-3 bg-amber-600/20 text-amber-400 rounded-2xl border border-amber-500/30">
                  <CalendarDays className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">Staff Leave Application</h3>
                  <p className="text-xs text-slate-400">
                    Apply for casual, medical, earned or half-day leave
                  </p>
                </div>
              </div>

              <form onSubmit={handleLeaveSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Applying Staff</label>
                  <select
                    value={leaveStaffId}
                    onChange={(e) => setLeaveStaffId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  >
                    {centerStaff.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.staffCode}) - {s.designation}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Leave Type</label>
                    <select
                      value={leaveType}
                      onChange={(e) => setLeaveType(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    >
                      <option value="CASUAL">Casual Leave (CL)</option>
                      <option value="MEDICAL">Medical Leave (ML)</option>
                      <option value="EARNED">Earned Leave (EL)</option>
                      <option value="SPECIAL">Special Leave</option>
                      <option value="HALF_DAY">Half Day</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">From Date</label>
                    <input
                      type="date"
                      required
                      value={leaveStartDate}
                      onChange={(e) => setLeaveStartDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">To Date</label>
                    <input
                      type="date"
                      required
                      value={leaveEndDate}
                      onChange={(e) => setLeaveEndDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Reason for Leave</label>
                  <textarea
                    rows={3}
                    required
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    placeholder="Provide specific reason for leave application..."
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-3 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Leave Application to Admin</span>
                </button>
              </form>
            </div>

            {/* Leave History List */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
              <h4 className="font-bold text-white text-sm mb-3">Center Leave Applications Status</h4>
              <div className="space-y-2.5">
                {leaveRequests
                  .filter((l) => l.centerId === center.id)
                  .map((l) => (
                    <div
                      key={l.id}
                      className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs"
                    >
                      <div>
                        <span className="font-bold text-white">{l.staffName}</span>
                        <span className="text-slate-400 ml-2 font-mono text-[11px]">
                          ({l.leaveType}) • {l.startDate} to {l.endDate} ({l.daysCount} days)
                        </span>
                        <p className="text-[11px] text-slate-400 mt-0.5">{l.reason}</p>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          l.status === 'APPROVED'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                            : l.status === 'REJECTED'
                            ? 'bg-rose-950 text-rose-300 border border-rose-700'
                            : 'bg-amber-950 text-amber-300 border border-amber-700 animate-pulse'
                        }`}
                      >
                        {l.status}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 5: ATTENDANCE REPORTS ================= */}
        {activeTab === 'REPORTS' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header & Controls */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-white text-base">Center Attendance Reports</h3>
                <p className="text-xs text-slate-400">Daily verification logs & monthly adherence</p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="date"
                  value={reportDateFilter}
                  onChange={(e) => setReportDateFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />

                <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setReportViewMode('DAILY')}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                      reportViewMode === 'DAILY' ? 'bg-blue-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    Daily Log
                  </button>
                  <button
                    onClick={() => setReportViewMode('MONTHLY_MATRIX')}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                      reportViewMode === 'MONTHLY_MATRIX' ? 'bg-blue-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    Monthly Summary
                  </button>
                </div>
              </div>
            </div>

            {/* Daily View Table */}
            {reportViewMode === 'DAILY' ? (
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase border-b border-slate-800">
                      <tr>
                        <th className="p-3.5">Staff Name</th>
                        <th className="p-3.5">Staff Code</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5">In Time</th>
                        <th className="p-3.5">Out Time</th>
                        <th className="p-3.5">GPS Dist</th>
                        <th className="p-3.5">Biometric</th>
                        <th className="p-3.5">Device ID</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {centerStaff.map((stf) => {
                        const rec = attendanceRecords.find(
                          (r) => r.staffId === stf.id && r.date === reportDateFilter
                        );
                        return (
                          <tr key={stf.id} className="hover:bg-slate-800/50 transition">
                            <td className="p-3.5 font-bold text-white">{stf.name}</td>
                            <td className="p-3.5 font-mono text-blue-400">{stf.staffCode}</td>
                            <td className="p-3.5">
                              {rec ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
                                  {rec.status}
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-950 text-rose-300 border border-rose-800">
                                  ABSENT
                                </span>
                              )}
                            </td>
                            <td className="p-3.5 font-mono text-emerald-300">{rec?.inTime || '--:--'}</td>
                            <td className="p-3.5 font-mono text-blue-300">{rec?.outTime || '--:--'}</td>
                            <td className="p-3.5 font-mono">
                              {rec?.inDistanceMeters != null ? `${rec.inDistanceMeters}m` : '-'}
                            </td>
                            <td className="p-3.5 text-[11px]">{rec?.inVerifiedMethod || '-'}</td>
                            <td className="p-3.5 font-mono text-[10px] text-slate-400">
                              {rec?.deviceId || stf.registeredDeviceId || '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              // Monthly Summary Grid
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl">
                <h4 className="font-bold text-white text-sm mb-3">Staff Monthly Performance Summary</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {centerStaff.map((stf) => {
                    const stfRecords = attendanceRecords.filter((r) => r.staffId === stf.id);
                    const presentCount = stfRecords.filter((r) => r.status === 'PRESENT' || r.status === 'LATE').length;
                    return (
                      <div key={stf.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={stf.photoUrl}
                            alt={stf.name}
                            referrerPolicy="no-referrer"
                            className="w-9 h-9 rounded-full object-cover border border-slate-700"
                          />
                          <div>
                            <p className="font-bold text-white text-xs">{stf.name}</p>
                            <p className="text-[10px] text-slate-400">{stf.designation}</p>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                          <span className="text-slate-400">Present Days:</span>
                          <span className="font-bold text-emerald-400">{presentCount} Days</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer Broadcast Ticker as requested */}
      <footer className="w-full bg-slate-950 border-t border-slate-800 mt-auto">
        <BroadcastBanner broadcasts={broadcasts} compact />
      </footer>
    </div>
  );
};

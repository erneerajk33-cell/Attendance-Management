import React, { useState } from 'react';
import {
  Building2,
  Users,
  Sliders,
  Calendar,
  FileSpreadsheet,
  CheckSquare,
  KeyRound,
  History,
  Megaphone,
  LogOut,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  Download,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Compass,
  Sparkles,
  Shield,
  Smartphone,
  CalendarCheck,
  AlertTriangle,
  UserPlus,
  Lock,
} from 'lucide-react';
import { SkillLogo } from '../SkillLogo';
import { DateTimeDisplay } from '../DateTimeDisplay';
import { InteractiveMap } from '../InteractiveMap';
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
} from '../../types';
import { exportAttendanceToExcel, exportAttendanceToPDF } from '../../utils/exportUtils';

interface AdminPortalProps {
  centers: Center[];
  staffList: Staff[];
  attendanceRecords: AttendanceRecord[];
  holidays: Holiday[];
  leaveRequests: LeaveRequest[];
  approvalRequests: ApprovalRequest[];
  broadcasts: BroadcastMessage[];
  activityLogs: ActivityLog[];
  rules: AttendanceRuleConfig;
  adminPassword: string;
  onLogout: () => void;
  onUpdateCenters: (centers: Center[]) => void;
  onUpdateStaff: (staff: Staff[]) => void;
  onUpdateRules: (rules: AttendanceRuleConfig) => void;
  onUpdateHolidays: (holidays: Holiday[]) => void;
  onUpdateBroadcasts: (broadcasts: BroadcastMessage[]) => void;
  onApproveRequest: (requestId: string, approved: boolean, remarks?: string) => void;
  onChangeAdminPassword: (newPass: string) => void;
  onChangeCenterPassword: (centerId: string, newPass: string) => void;
  onChangeStaffPassword: (staffId: string, newPass: string) => void;
  onAddLog: (action: string, details: string, severity: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR') => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  centers,
  staffList,
  attendanceRecords,
  holidays,
  leaveRequests,
  approvalRequests,
  broadcasts,
  activityLogs,
  rules,
  adminPassword,
  onLogout,
  onUpdateCenters,
  onUpdateStaff,
  onUpdateRules,
  onUpdateHolidays,
  onUpdateBroadcasts,
  onApproveRequest,
  onChangeAdminPassword,
  onChangeCenterPassword,
  onChangeStaffPassword,
  onAddLog,
}) => {
  // Navigation Menu Tabs
  type AdminTab =
    | 'CENTERS_STAFF'
    | 'RULES'
    | 'CALENDAR'
    | 'REPORTS'
    | 'APPROVALS'
    | 'PASSWORDS'
    | 'LOGS'
    | 'BROADCASTS';

  const [activeTab, setActiveTab] = useState<AdminTab>('CENTERS_STAFF');

  // Sub-view in Centers & Staff
  const [csSubTab, setCsSubTab] = useState<'CENTERS' | 'STAFF'>('CENTERS');

  // Center Modal Form
  const [isCenterModalOpen, setIsCenterModalOpen] = useState(false);
  const [editingCenter, setEditingCenter] = useState<Center | null>(null);
  const [centerForm, setCenterForm] = useState<Partial<Center>>({});

  // Staff Modal Form
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [staffForm, setStaffForm] = useState<Partial<Staff>>({});

  // Holiday Modal Form
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [holidayForm, setHolidayForm] = useState<Partial<Holiday>>({
    category: 'GAZETTED',
    date: new Date().toISOString().split('T')[0],
  });

  // Broadcast Modal Form
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [editingBroadcast, setEditingBroadcast] = useState<BroadcastMessage | null>(null);
  const [broadcastForm, setBroadcastForm] = useState<Partial<BroadcastMessage>>({
    priority: 'NORMAL',
    active: true,
  });

  // Report Controls
  const [reportCenterId, setReportCenterId] = useState<string>('ALL');
  const [reportMonthYear, setReportMonthYear] = useState<string>(
    new Date().toISOString().substring(0, 7) // YYYY-MM
  );
  const [reportFormat, setReportFormat] = useState<'HORIZONTAL_MATRIX' | 'VERTICAL_DATE'>(
    'HORIZONTAL_MATRIX'
  );

  // Password Management Form States
  const [newAdminPass, setNewAdminPass] = useState('');
  const [selectedCenterForPass, setSelectedCenterForPass] = useState(centers[0]?.id || '');
  const [newCenterPass, setNewCenterPass] = useState('');
  const [selectedStaffForPass, setSelectedStaffForPass] = useState(staffList[0]?.id || '');
  const [newStaffPass, setNewStaffPass] = useState('');
  const [passSuccessMessage, setPassSuccessMessage] = useState<string | null>(null);

  // Approval review modal / quick remarks
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [selectedApprovalReq, setSelectedApprovalReq] = useState<ApprovalRequest | null>(null);

  // Log search & filter
  const [logSearch, setLogSearch] = useState('');
  const [logSeverityFilter, setLogSeverityFilter] = useState('ALL');

  // Rules interactive center picker
  const [ruleSelectedCenterId, setRuleSelectedCenterId] = useState(centers[0]?.id || '');
  const ruleCenter = centers.find((c) => c.id === ruleSelectedCenterId) || centers[0];

  // ================= CRUD HANDLERS FOR CENTERS =================
  const handleOpenAddCenter = () => {
    setEditingCenter(null);
    setCenterForm({
      code: `SKL-CTR-${String(centers.length + 1).padStart(2, '0')}`,
      name: '',
      address: '',
      city: 'Patna',
      state: 'Bihar',
      latitude: 25.5941,
      longitude: 85.1376,
      radiusMeters: 150,
      shiftStartTime: '09:00',
      shiftEndTime: '17:30',
      graceTimeMinutes: 15,
      inchargeName: '',
      inchargeContact: '+91 ',
      inchargeEmail: '',
      password: 'center@123password',
      active: true,
    });
    setIsCenterModalOpen(true);
  };

  const handleOpenEditCenter = (ctr: Center) => {
    setEditingCenter(ctr);
    setCenterForm({ ...ctr });
    setIsCenterModalOpen(true);
  };

  const handleSaveCenter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!centerForm.name || !centerForm.code) return;

    if (editingCenter) {
      const updated = centers.map((c) =>
        c.id === editingCenter.id ? ({ ...c, ...centerForm } as Center) : c
      );
      onUpdateCenters(updated);
      onAddLog('CENTER_EDITED', `Updated Center [${centerForm.name} - ${centerForm.code}]`, 'INFO');
    } else {
      const newCenter: Center = {
        ...(centerForm as Center),
        id: 'CTR-' + String(Date.now()).slice(-4),
        active: true,
      };
      onUpdateCenters([...centers, newCenter]);
      onAddLog('CENTER_CREATED', `Added new Center [${newCenter.name} - ${newCenter.code}]`, 'SUCCESS');
    }
    setIsCenterModalOpen(false);
  };

  const handleDeleteCenter = (ctr: Center) => {
    if (confirm(`Are you sure you want to delete Center "${ctr.name}"?`)) {
      onUpdateCenters(centers.filter((c) => c.id !== ctr.id));
      onAddLog('CENTER_DELETED', `Deleted Center [${ctr.name}]`, 'WARNING');
    }
  };

  // ================= CRUD HANDLERS FOR STAFF =================
  const handleOpenAddStaff = () => {
    setEditingStaff(null);
    setStaffForm({
      staffCode: `SKL-EMP-${String(staffList.length + 101)}`,
      name: '',
      designation: 'Technical Trainer',
      department: 'Skill Training',
      phone: '+91 ',
      email: '',
      centerId: centers[0]?.id || '',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&auto=format&fit=crop&q=80',
      registeredDeviceId: `DEV-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      registeredDeviceModel: 'Android 14 (Registered Handset)',
      isDeviceLocked: false,
      faceEnrolled: true,
      biometricEnrolled: true,
      password: 'staff@123password',
      joiningDate: new Date().toISOString().split('T')[0],
      emergencyContact: '+91 ',
      address: '',
    });
    setIsStaffModalOpen(true);
  };

  const handleOpenEditStaff = (stf: Staff) => {
    setEditingStaff(stf);
    setStaffForm({ ...stf });
    setIsStaffModalOpen(true);
  };

  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffForm.name || !staffForm.staffCode) return;

    if (editingStaff) {
      const updated = staffList.map((s) =>
        s.id === editingStaff.id ? ({ ...s, ...staffForm } as Staff) : s
      );
      onUpdateStaff(updated);
      onAddLog('STAFF_EDITED', `Updated staff record [${staffForm.name} - ${staffForm.staffCode}]`, 'INFO');
    } else {
      const newStaff: Staff = {
        ...(staffForm as Staff),
        id: 'STF-' + String(Date.now()).slice(-4),
      };
      onUpdateStaff([...staffList, newStaff]);
      onAddLog('STAFF_CREATED', `Enrolled new staff [${newStaff.name} - ${newStaff.staffCode}]`, 'SUCCESS');
    }
    setIsStaffModalOpen(false);
  };

  const handleDeleteStaff = (stf: Staff) => {
    if (confirm(`Are you sure you want to remove staff member "${stf.name}"?`)) {
      onUpdateStaff(staffList.filter((s) => s.id !== stf.id));
      onAddLog('STAFF_DELETED', `Deleted staff member [${stf.name}]`, 'WARNING');
    }
  };

  // ================= HOLIDAY HANDLERS =================
  const handleSaveHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!holidayForm.name || !holidayForm.date) return;

    const newHol: Holiday = {
      ...(holidayForm as Holiday),
      id: 'HOL-' + String(Date.now()).slice(-4),
    };
    onUpdateHolidays([...holidays, newHol]);
    onAddLog('HOLIDAY_ADDED', `Added holiday [${newHol.name} on ${newHol.date}]`, 'INFO');
    setIsHolidayModalOpen(false);
  };

  const handleDeleteHoliday = (id: string, name: string) => {
    onUpdateHolidays(holidays.filter((h) => h.id !== id));
    onAddLog('HOLIDAY_DELETED', `Removed holiday [${name}]`, 'INFO');
  };

  // ================= BROADCAST HANDLERS =================
  const handleSaveBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastForm.title || !broadcastForm.message) return;

    if (editingBroadcast) {
      const updated = broadcasts.map((b) =>
        b.id === editingBroadcast.id ? ({ ...b, ...broadcastForm } as BroadcastMessage) : b
      );
      onUpdateBroadcasts(updated);
      onAddLog('BROADCAST_EDITED', `Updated broadcast announcement [${broadcastForm.title}]`, 'INFO');
    } else {
      const newB: BroadcastMessage = {
        ...(broadcastForm as BroadcastMessage),
        id: 'BRD-' + String(Date.now()).slice(-4),
        createdAt: new Date().toLocaleString('en-IN'),
        author: 'Administrator',
      };
      onUpdateBroadcasts([newB, ...broadcasts]);
      onAddLog('BROADCAST_CREATED', `Published broadcast announcement [${newB.title}]`, 'SUCCESS');
    }
    setIsBroadcastModalOpen(false);
  };

  const handleDeleteBroadcast = (id: string, title: string) => {
    onUpdateBroadcasts(broadcasts.filter((b) => b.id !== id));
    onAddLog('BROADCAST_DELETED', `Removed broadcast [${title}]`, 'WARNING');
  };

  const handleToggleBroadcast = (b: BroadcastMessage) => {
    const updated = broadcasts.map((item) =>
      item.id === b.id ? { ...item, active: !item.active } : item
    );
    onUpdateBroadcasts(updated);
  };

  // ================= EXPORT HANDLERS =================
  const handleExportExcel = () => {
    const targetCenter = reportCenterId === 'ALL' ? null : centers.find((c) => c.id === reportCenterId) || null;
    const targetStaff = reportCenterId === 'ALL' ? staffList : staffList.filter((s) => s.centerId === reportCenterId);
    exportAttendanceToExcel(attendanceRecords, targetStaff, targetCenter, reportMonthYear, reportFormat);
    onAddLog('REPORT_EXPORT_EXCEL', `Generated Excel sheet for period ${reportMonthYear}`, 'SUCCESS');
  };

  const handleExportPDF = () => {
    const targetCenter = reportCenterId === 'ALL' ? null : centers.find((c) => c.id === reportCenterId) || null;
    const targetStaff = reportCenterId === 'ALL' ? staffList : staffList.filter((s) => s.centerId === reportCenterId);
    exportAttendanceToPDF(attendanceRecords, targetStaff, targetCenter, reportMonthYear, reportFormat);
    onAddLog('REPORT_EXPORT_PDF', `Generated PDF report for period ${reportMonthYear}`, 'SUCCESS');
  };

  // ================= PASSWORD RESET HANDLERS =================
  const handleAdminPassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminPass) return;
    onChangeAdminPassword(newAdminPass);
    setNewAdminPass('');
    setPassSuccessMessage('Administrator password updated successfully.');
    setTimeout(() => setPassSuccessMessage(null), 3500);
  };

  const handleCenterPassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCenterPass) return;
    onChangeCenterPassword(selectedCenterForPass, newCenterPass);
    setNewCenterPass('');
    setPassSuccessMessage('Center portal password updated.');
    setTimeout(() => setPassSuccessMessage(null), 3500);
  };

  const handleStaffPassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffPass) return;
    onChangeStaffPassword(selectedStaffForPass, newStaffPass);
    setNewStaffPass('');
    setPassSuccessMessage('Staff account password reset successfully.');
    setTimeout(() => setPassSuccessMessage(null), 3500);
  };

  // Filtered Activity Logs
  const filteredLogs = activityLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.details.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.actorName.toLowerCase().includes(logSearch.toLowerCase());
    const matchesSeverity = logSeverityFilter === 'ALL' || log.severity === logSeverityFilter;
    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans relative">
      {/* Background Wallpaper */}
      <div
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            radial-gradient(at 0% 0%, rgba(5, 150, 105, 0.4) 0px, transparent 50%),
            radial-gradient(at 100% 0%, rgba(37, 99, 235, 0.35) 0px, transparent 50%),
            radial-gradient(at 50% 100%, rgba(217, 119, 6, 0.25) 0px, transparent 50%),
            linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 100% 100%, 100% 100%, 30px 30px, 30px 30px',
        }}
      />

      {/* Admin Screen Top Header */}
      <header className="w-full bg-slate-950/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <SkillLogo size="md" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                  System Administration Authority
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-700">
                  Master Control
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Er. Neeraj Kumar • Super-Administrator Console
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <DateTimeDisplay dark compact />

            {/* Logout Admin Button */}
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-600/40 text-xs font-semibold transition active:scale-95 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout Admin</span>
            </button>
          </div>
        </div>
      </header>

      {/* Admin Navigation Menu Bar as explicitly requested */}
      <div className="w-full bg-slate-950 border-b border-slate-800 sticky top-[57px] z-20 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('CENTERS_STAFF')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'CENTERS_STAFF'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4 text-blue-300" />
            <span>Centers & Staff</span>
          </button>

          <button
            onClick={() => setActiveTab('RULES')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'RULES'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Sliders className="w-4 h-4 text-emerald-300" />
            <span>Attendance Rules & Maps</span>
          </button>

          <button
            onClick={() => setActiveTab('CALENDAR')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'CALENDAR'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4 text-purple-300" />
            <span>Calendar & Holidays</span>
          </button>

          <button
            onClick={() => setActiveTab('REPORTS')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'REPORTS'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-cyan-300" />
            <span>Reports (PDF/Excel)</span>
          </button>

          <button
            onClick={() => setActiveTab('APPROVALS')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer relative ${
              activeTab === 'APPROVALS'
                ? 'bg-amber-600 text-slate-950 font-extrabold shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <CheckSquare className="w-4 h-4 text-amber-400" />
            <span>Approvals</span>
            {approvalRequests.filter((r) => r.status === 'PENDING').length > 0 && (
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
                {approvalRequests.filter((r) => r.status === 'PENDING').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('PASSWORDS')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'PASSWORDS'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <KeyRound className="w-4 h-4 text-indigo-300" />
            <span>Change Passwords</span>
          </button>

          <button
            onClick={() => setActiveTab('LOGS')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'LOGS'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <History className="w-4 h-4 text-teal-300" />
            <span>Activity Logs</span>
          </button>

          <button
            onClick={() => setActiveTab('BROADCASTS')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'BROADCASTS'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Megaphone className="w-4 h-4 text-rose-300" />
            <span>Broadcasts</span>
          </button>
        </div>
      </div>

      {/* Main Content View */}
      <main className="w-full max-w-7xl mx-auto px-4 py-6 flex-1">
        {/* ================= 1. CENTERS & STAFF CRUD ================= */}
        {activeTab === 'CENTERS_STAFF' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCsSubTab('CENTERS')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                    csSubTab === 'CENTERS'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Centers Directory ({centers.length})</span>
                </button>

                <button
                  onClick={() => setCsSubTab('STAFF')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                    csSubTab === 'STAFF'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Staff Directory ({staffList.length})</span>
                </button>
              </div>

              {csSubTab === 'CENTERS' ? (
                <button
                  onClick={handleOpenAddCenter}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Center</span>
                </button>
              ) : (
                <button
                  onClick={handleOpenAddStaff}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Enroll New Staff</span>
                </button>
              )}
            </div>

            {/* Sub-view: Centers List */}
            {csSubTab === 'CENTERS' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {centers.map((c) => {
                  const assignedStaff = staffList.filter((s) => s.centerId === c.id);
                  return (
                    <div
                      key={c.id}
                      className="bg-slate-900/90 border border-slate-800 hover:border-blue-700/60 rounded-3xl p-5 shadow-xl transition space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-white text-base">{c.name}</h4>
                            <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                              {c.code}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">{c.address}, {c.city}, {c.state}</p>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditCenter(c)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white transition cursor-pointer"
                            title="Edit Center"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCenter(c)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition cursor-pointer"
                            title="Delete Center"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-xs">
                        <div className="p-2 rounded-xl bg-slate-950 border border-slate-800/80">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold">Radius</span>
                          <p className="font-bold text-emerald-400 font-mono">{c.radiusMeters}m</p>
                        </div>

                        <div className="p-2 rounded-xl bg-slate-950 border border-slate-800/80">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold">Shift Timing</span>
                          <p className="font-bold text-blue-300 font-mono text-[11px]">
                            {c.shiftStartTime} - {c.shiftEndTime}
                          </p>
                        </div>

                        <div className="p-2 rounded-xl bg-slate-950 border border-slate-800/80 col-span-2 sm:col-span-1">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold">Staff Count</span>
                          <p className="font-bold text-amber-400 font-mono">{assignedStaff.length} Members</p>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400">
                        <span>In-charge: <strong className="text-slate-200">{c.inchargeName}</strong></span>
                        <span className="font-mono text-slate-500">Lat: {c.latitude}, Lng: {c.longitude}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Sub-view: Staff List */}
            {csSubTab === 'STAFF' && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase border-b border-slate-800">
                      <tr>
                        <th className="p-3.5">Staff</th>
                        <th className="p-3.5">Code</th>
                        <th className="p-3.5">Center</th>
                        <th className="p-3.5">Department</th>
                        <th className="p-3.5">Device ID</th>
                        <th className="p-3.5">Face Enrolled</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {staffList.map((stf) => {
                        const assignedCenter = centers.find((c) => c.id === stf.centerId);
                        return (
                          <tr key={stf.id} className="hover:bg-slate-800/50 transition">
                            <td className="p-3.5">
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={stf.photoUrl}
                                  alt={stf.name}
                                  referrerPolicy="no-referrer"
                                  className="w-9 h-9 rounded-full object-cover border border-slate-700"
                                />
                                <div>
                                  <p className="font-bold text-white text-xs">{stf.name}</p>
                                  <p className="text-[11px] text-slate-400">{stf.designation}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-3.5 font-mono text-blue-400 font-bold">{stf.staffCode}</td>
                            <td className="p-3.5 font-medium text-slate-200">
                              {assignedCenter ? assignedCenter.name : 'Unassigned'}
                            </td>
                            <td className="p-3.5">{stf.department}</td>
                            <td className="p-3.5 font-mono text-[11px] text-slate-400">
                              {stf.registeredDeviceId || 'None'}
                            </td>
                            <td className="p-3.5">
                              {stf.faceEnrolled ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
                                  ✓ Enrolled
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-950 text-amber-300 border border-amber-800">
                                  Pending
                                </span>
                              )}
                            </td>
                            <td className="p-3.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleOpenEditStaff(stf)}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white transition cursor-pointer"
                                  title="Edit Staff"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteStaff(stf)}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition cursor-pointer"
                                  title="Delete Staff"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= 2. SET ATTENDANCE RULES & GOOGLE MAPS ================= */}
        {activeTab === 'RULES' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Center Selector for Geo-fence customization */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white">Geo-Fence & Attendance Location Rules</h3>
                  <p className="text-xs text-slate-400">
                    Customize GPS latitude, longitude, and allowed radius circle for each center
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-400 font-semibold">Select Center:</label>
                  <select
                    value={ruleSelectedCenterId}
                    onChange={(e) => setRuleSelectedCenterId(e.target.value)}
                    className="bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-1.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    {centers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Interactive Radar & Google Maps Geo-Fence Visualizer */}
              {ruleCenter && (
                <InteractiveMap
                  centerLat={ruleCenter.latitude}
                  centerLng={ruleCenter.longitude}
                  centerName={ruleCenter.name}
                  radiusMeters={ruleCenter.radiusMeters}
                  isEditable={true}
                  onLocationChange={(lat, lng, radius) => {
                    const updated = centers.map((c) =>
                      c.id === ruleCenter.id ? { ...c, radiusMeters: radius } : c
                    );
                    onUpdateCenters(updated);
                  }}
                />
              )}
            </div>

            {/* Global Attendance Policy Configurations */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
              <h3 className="text-base font-bold text-white pb-3 border-b border-slate-800">
                Global Attendance & Hardware Policies
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <label className="text-xs font-bold text-slate-300 block">Default Radius (Meters)</label>
                  <input
                    type="number"
                    value={rules.defaultRadiusMeters}
                    onChange={(e) =>
                      onUpdateRules({ ...rules, defaultRadiusMeters: parseInt(e.target.value, 10) || 100 })
                    }
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <label className="text-xs font-bold text-slate-300 block">Grace Period (Minutes)</label>
                  <input
                    type="number"
                    value={rules.globalGraceMinutes}
                    onChange={(e) =>
                      onUpdateRules({ ...rules, globalGraceMinutes: parseInt(e.target.value, 10) || 15 })
                    }
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <label className="text-xs font-bold text-slate-300 block">Auto Mark Absent Time</label>
                  <input
                    type="time"
                    value={rules.autoMarkAbsentAfterTime}
                    onChange={(e) =>
                      onUpdateRules({ ...rules, autoMarkAbsentAfterTime: e.target.value })
                    }
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3 pt-2">
                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800 cursor-pointer">
                  <div>
                    <p className="font-bold text-white text-xs">Strict Single Device Hardware Binding</p>
                    <p className="text-[11px] text-slate-400">
                      Blocks staff from punching or accessing profile from un-enrolled device IDs
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={rules.strictDeviceBinding}
                    onChange={(e) => onUpdateRules({ ...rules, strictDeviceBinding: e.target.checked })}
                    className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800 cursor-pointer">
                  <div>
                    <p className="font-bold text-white text-xs">Mandatory Face & Biometric Verification</p>
                    <p className="text-[11px] text-slate-400">
                      Requires real-time AI face capture or fingerprint match on every punch
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={rules.requireFaceVerification}
                    onChange={(e) =>
                      onUpdateRules({ ...rules, requireFaceVerification: e.target.checked })
                    }
                    className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800 cursor-pointer">
                  <div>
                    <p className="font-bold text-white text-xs">Sundays and Gazetted Holidays Weekly Off</p>
                    <p className="text-[11px] text-slate-400">
                      Automatically exempts Sundays and recognized holidays from absent penalties
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={rules.enableSundaysOff}
                    onChange={(e) => onUpdateRules({ ...rules, enableSundaysOff: e.target.checked })}
                    className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ================= 3. CALENDAR & HOLIDAYS ================= */}
        {activeTab === 'CALENDAR' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white">Calendar & State Holiday Schedule</h3>
                  <p className="text-xs text-slate-400">
                    Adjust National, Central, Bihar State (Bihar Diwas, Chhath Puja), and Gazetted holidays
                  </p>
                </div>

                <button
                  onClick={() => setIsHolidayModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Custom Holiday</span>
                </button>
              </div>

              {/* Holiday Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {holidays.map((h) => {
                  const getCategoryStyle = (cat: string) => {
                    switch (cat) {
                      case 'NATIONAL':
                        return 'bg-blue-950 text-blue-300 border-blue-800';
                      case 'BIHAR_STATE':
                        return 'bg-amber-950 text-amber-300 border-amber-800';
                      case 'CENTRAL':
                        return 'bg-emerald-950 text-emerald-300 border-emerald-800';
                      default:
                        return 'bg-purple-950 text-purple-300 border-purple-800';
                    }
                  };

                  return (
                    <div
                      key={h.id}
                      className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-purple-800 transition flex flex-col justify-between"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getCategoryStyle(
                              h.category
                            )}`}
                          >
                            {h.category.replace('_', ' ')}
                          </span>
                          <button
                            onClick={() => handleDeleteHoliday(h.id, h.name)}
                            className="text-slate-500 hover:text-rose-400 p-1 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <h4 className="font-bold text-white text-sm">{h.name}</h4>
                        <p className="text-xs text-slate-400">{h.description || 'Official Holiday'}</p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                        <span className="font-mono text-emerald-400 font-semibold">{h.date}</span>
                        <CalendarCheck className="w-4 h-4 text-purple-400" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================= 4. ATTENDANCE REPORTS (PDF & EXCEL) ================= */}
        {activeTab === 'REPORTS' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white">Consolidated Attendance Reports & Export</h3>
                  <p className="text-xs text-slate-400">
                    Horizontal matrix & Vertical chronological reports with instant Excel & PDF generation
                  </p>
                </div>

                {/* Export Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportExcel}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Excel (.xlsx)</span>
                  </button>

                  <button
                    onClick={handleExportPDF}
                    className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF Document</span>
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Center</label>
                  <select
                    value={reportCenterId}
                    onChange={(e) => setReportCenterId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-hidden"
                  >
                    <option value="ALL">All Centers (Consolidated)</option>
                    {centers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Month & Year</label>
                  <input
                    type="month"
                    value={reportMonthYear}
                    onChange={(e) => setReportMonthYear(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-hidden"
                  >
                  </input>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Report Layout</label>
                  <select
                    value={reportFormat}
                    onChange={(e) => setReportFormat(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-hidden"
                  >
                    <option value="HORIZONTAL_MATRIX">Horizontal Matrix (Staff Rows x Date Columns)</option>
                    <option value="VERTICAL_DATE">Vertical Chronological (Date Records)</option>
                  </select>
                </div>
              </div>

              {/* Live Preview Table */}
              <div className="border border-slate-800 rounded-2xl overflow-hidden">
                <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300">Live Report Preview ({reportMonthYear})</span>
                  <span className="text-[11px] text-slate-500">
                    Total Records: {attendanceRecords.filter((r) => r.date.startsWith(reportMonthYear)).length}
                  </span>
                </div>

                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase border-b border-slate-800 sticky top-0">
                      <tr>
                        <th className="p-3">Date</th>
                        <th className="p-3">Staff</th>
                        <th className="p-3">Center</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">In Time</th>
                        <th className="p-3">Out Time</th>
                        <th className="p-3">Distance</th>
                        <th className="p-3">Verified By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {attendanceRecords
                        .filter((r) => r.date.startsWith(reportMonthYear))
                        .slice(0, 15)
                        .map((r) => (
                          <tr key={r.id} className="hover:bg-slate-800/40 transition">
                            <td className="p-3 font-mono">{r.date}</td>
                            <td className="p-3 font-bold text-white">{r.staffName}</td>
                            <td className="p-3 text-slate-300">{r.centerName}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
                                {r.status}
                              </span>
                            </td>
                            <td className="p-3 font-mono text-emerald-300">{r.inTime || '--:--'}</td>
                            <td className="p-3 font-mono text-blue-300">{r.outTime || '--:--'}</td>
                            <td className="p-3 font-mono">{r.inDistanceMeters != null ? `${r.inDistanceMeters}m` : '-'}</td>
                            <td className="p-3 text-[11px]">{r.inVerifiedMethod || '-'}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= 5. APPROVALS HUB ================= */}
        {activeTab === 'APPROVALS' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white">Pending Requests & Approvals</h3>
                  <p className="text-xs text-slate-400">
                    Review and authorize profile updates, device unblocks, face re-enrollment, and leave applications
                  </p>
                </div>
                <span className="text-xs font-bold text-amber-400 px-3 py-1 rounded-full bg-amber-950 border border-amber-800">
                  {approvalRequests.filter((r) => r.status === 'PENDING').length} Pending Requests
                </span>
              </div>

              {/* Requests List */}
              <div className="space-y-3">
                {approvalRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-800/80 transition space-y-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                            {req.type.replace(/_/g, ' ')}
                          </span>
                          <h4 className="font-bold text-white text-sm">{req.title}</h4>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          Applicant: <strong className="text-slate-200">{req.staffName}</strong> ({req.centerName}) • {req.requestedAt}
                        </p>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          req.status === 'APPROVED'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                            : req.status === 'REJECTED'
                            ? 'bg-rose-950 text-rose-300 border border-rose-700'
                            : 'bg-amber-950 text-amber-300 border border-amber-700 animate-pulse'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
                      <p>{req.details}</p>
                      {req.payload && (
                        <pre className="mt-2 text-[10px] text-slate-400 font-mono overflow-x-auto bg-slate-950 p-2 rounded">
                          {JSON.stringify(req.payload, null, 2)}
                        </pre>
                      )}
                    </div>

                    {req.status === 'PENDING' && (
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                        <button
                          onClick={() => {
                            const remarks = prompt('Enter rejection remarks:') || 'Rejected by Admin';
                            onApproveRequest(req.id, false, remarks);
                          }}
                          className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white rounded-xl text-xs font-bold border border-rose-600/50 transition cursor-pointer"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => {
                            onApproveRequest(req.id, true, 'Approved by Administrator Er. Neeraj Kumar');
                          }}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition active:scale-95 cursor-pointer flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve Request</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= 6. CHANGE PASSWORDS ================= */}
        {activeTab === 'PASSWORDS' && (
          <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
            {passSuccessMessage && (
              <div className="p-3.5 rounded-2xl bg-emerald-950 border border-emerald-600 text-emerald-200 text-xs font-bold flex items-center gap-2 shadow-lg animate-bounce">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{passSuccessMessage}</span>
              </div>
            )}

            {/* 1. Admin Password */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                <Shield className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Administrator Master Password</h3>
              </div>

              <form onSubmit={handleAdminPassSubmit} className="space-y-3">
                <input
                  type="password"
                  required
                  value={newAdminPass}
                  onChange={(e) => setNewAdminPass(e.target.value)}
                  placeholder="Enter new Master Admin Password..."
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Update Admin Password
                </button>
              </form>
            </div>

            {/* 2. Center Passwords */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                <Building2 className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-bold text-white">Reset Center Portal Password</h3>
              </div>

              <form onSubmit={handleCenterPassSubmit} className="space-y-3">
                <select
                  value={selectedCenterForPass}
                  onChange={(e) => setSelectedCenterForPass(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs"
                >
                  {centers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>

                <input
                  type="password"
                  required
                  value={newCenterPass}
                  onChange={(e) => setNewCenterPass(e.target.value)}
                  placeholder="Enter new password for selected Center..."
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />

                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Update Center Password
                </button>
              </form>
            </div>

            {/* 3. Staff Passwords */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                <Users className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Reset Staff Member Credentials</h3>
              </div>

              <form onSubmit={handleStaffPassSubmit} className="space-y-3">
                <select
                  value={selectedStaffForPass}
                  onChange={(e) => setSelectedStaffForPass(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs"
                >
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.staffCode})
                    </option>
                  ))}
                </select>

                <input
                  type="password"
                  required
                  value={newStaffPass}
                  onChange={(e) => setNewStaffPass(e.target.value)}
                  placeholder="Enter new password for selected Staff..."
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />

                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Update Staff Password
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ================= 7. ACTIVITY LOGS ================= */}
        {activeTab === 'LOGS' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white">Security & Operational Activity Logs</h3>
                  <p className="text-xs text-slate-400">
                    Chronological audit trail of punches, approvals, geo-fence validations, and admin changes
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                    placeholder="Search logs..."
                    className="bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-1.5 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />

                  <select
                    value={logSeverityFilter}
                    onChange={(e) => setLogSeverityFilter(e.target.value)}
                    className="bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-1.5 text-xs"
                  >
                    <option value="ALL">All Levels</option>
                    <option value="INFO">INFO</option>
                    <option value="SUCCESS">SUCCESS</option>
                    <option value="WARNING">WARNING</option>
                    <option value="ERROR">ERROR</option>
                  </select>
                </div>
              </div>

              {/* Logs List */}
              <div className="divide-y divide-slate-800 max-h-[500px] overflow-y-auto">
                {filteredLogs.map((log) => {
                  const getSeverityBadge = (s: string) => {
                    switch (s) {
                      case 'SUCCESS':
                        return 'bg-emerald-950 text-emerald-300 border-emerald-800';
                      case 'WARNING':
                        return 'bg-amber-950 text-amber-300 border-amber-800';
                      case 'ERROR':
                        return 'bg-rose-950 text-rose-300 border-rose-800';
                      default:
                        return 'bg-blue-950 text-blue-300 border-blue-800';
                    }
                  };

                  return (
                    <div key={log.id} className="py-3 px-2 hover:bg-slate-800/40 transition flex items-start justify-between gap-3 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getSeverityBadge(
                              log.severity
                            )}`}
                          >
                            {log.severity}
                          </span>
                          <span className="font-bold text-white">{log.action}</span>
                          <span className="text-[10px] text-slate-500 font-mono">by {log.actorName}</span>
                        </div>
                        <p className="text-slate-300 text-xs">{log.details}</p>
                      </div>

                      <span className="text-[11px] text-slate-500 font-mono whitespace-nowrap">
                        {log.timestamp}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================= 8. BROADCASTS MANAGEMENT ================= */}
        {activeTab === 'BROADCASTS' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white">Broadcast Slideshow Announcements</h3>
                  <p className="text-xs text-slate-400">
                    Manage real-time news, mandatory alerts, and circulars across Main Screen and Center portals
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEditingBroadcast(null);
                    setBroadcastForm({ priority: 'NORMAL', active: true, title: '', message: '' });
                    setIsBroadcastModalOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Broadcast</span>
                </button>
              </div>

              {/* Broadcasts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {broadcasts.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-rose-800 transition flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            b.priority === 'URGENT'
                              ? 'bg-rose-600 text-white'
                              : b.priority === 'IMPORTANT'
                              ? 'bg-amber-500 text-slate-950 font-extrabold'
                              : 'bg-blue-600 text-white'
                          }`}
                        >
                          {b.priority}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleBroadcast(b)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                              b.active ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-500'
                            }`}
                          >
                            {b.active ? 'ACTIVE' : 'INACTIVE'}
                          </button>
                          <button
                            onClick={() => handleDeleteBroadcast(b.id, b.title)}
                            className="p-1 text-slate-500 hover:text-rose-400 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h4 className="font-bold text-white text-sm mt-2">{b.title}</h4>
                      <p className="text-xs text-slate-300 mt-1">{b.message}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Author: {b.author}</span>
                      <span>{b.createdAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ================= MODAL: ADD / EDIT CENTER ================= */}
      {isCenterModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-3xl p-6 text-white shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base">
                {editingCenter ? 'Edit Center Details' : 'Add New Skill Center'}
              </h3>
              <button onClick={() => setIsCenterModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCenter} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Center Code</label>
                  <input
                    type="text"
                    required
                    value={centerForm.code || ''}
                    onChange={(e) => setCenterForm({ ...centerForm, code: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={centerForm.city || ''}
                    onChange={(e) => setCenterForm({ ...centerForm, city: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Center Name</label>
                <input
                  type="text"
                  required
                  value={centerForm.name || ''}
                  onChange={(e) => setCenterForm({ ...centerForm, name: e.target.value })}
                  placeholder="e.g. Patna Skill Development Center"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Address</label>
                <input
                  type="text"
                  required
                  value={centerForm.address || ''}
                  onChange={(e) => setCenterForm({ ...centerForm, address: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={centerForm.latitude || 25.5941}
                    onChange={(e) =>
                      setCenterForm({ ...centerForm, latitude: parseFloat(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={centerForm.longitude || 85.1376}
                    onChange={(e) =>
                      setCenterForm({ ...centerForm, longitude: parseFloat(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Radius (m)</label>
                  <input
                    type="number"
                    required
                    value={centerForm.radiusMeters || 150}
                    onChange={(e) =>
                      setCenterForm({ ...centerForm, radiusMeters: parseInt(e.target.value, 10) })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Shift Start</label>
                  <input
                    type="time"
                    required
                    value={centerForm.shiftStartTime || '09:00'}
                    onChange={(e) => setCenterForm({ ...centerForm, shiftStartTime: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Shift End</label>
                  <input
                    type="time"
                    required
                    value={centerForm.shiftEndTime || '17:30'}
                    onChange={(e) => setCenterForm({ ...centerForm, shiftEndTime: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">In-charge Name</label>
                  <input
                    type="text"
                    required
                    value={centerForm.inchargeName || ''}
                    onChange={(e) => setCenterForm({ ...centerForm, inchargeName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">In-charge Phone</label>
                  <input
                    type="text"
                    required
                    value={centerForm.inchargeContact || ''}
                    onChange={(e) => setCenterForm({ ...centerForm, inchargeContact: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl mt-2 cursor-pointer shadow-md"
              >
                Save Center Information
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT STAFF ================= */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-3xl p-6 text-white shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base">
                {editingStaff ? 'Edit Staff Details' : 'Enroll New Staff Member'}
              </h3>
              <button onClick={() => setIsStaffModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Staff Code</label>
                  <input
                    type="text"
                    required
                    value={staffForm.staffCode || ''}
                    onChange={(e) => setStaffForm({ ...staffForm, staffCode: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Assigned Center</label>
                  <select
                    value={staffForm.centerId || ''}
                    onChange={(e) => setStaffForm({ ...staffForm, centerId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    {centers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Staff Full Name</label>
                <input
                  type="text"
                  required
                  value={staffForm.name || ''}
                  onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Designation</label>
                  <input
                    type="text"
                    required
                    value={staffForm.designation || ''}
                    onChange={(e) => setStaffForm({ ...staffForm, designation: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Department</label>
                  <input
                    type="text"
                    required
                    value={staffForm.department || ''}
                    onChange={(e) => setStaffForm({ ...staffForm, department: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={staffForm.phone || ''}
                    onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={staffForm.email || ''}
                    onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Photo URL</label>
                <input
                  type="url"
                  value={staffForm.photoUrl || ''}
                  onChange={(e) => setStaffForm({ ...staffForm, photoUrl: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Hardware Device ID</label>
                <input
                  type="text"
                  value={staffForm.registeredDeviceId || ''}
                  onChange={(e) => setStaffForm({ ...staffForm, registeredDeviceId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl mt-2 cursor-pointer shadow-md"
              >
                Save Staff Profile
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD HOLIDAY ================= */}
      {isHolidayModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base">Add Holiday Event</h3>
              <button onClick={() => setIsHolidayModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveHoliday} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Holiday Name</label>
                <input
                  type="text"
                  required
                  value={holidayForm.name || ''}
                  onChange={(e) => setHolidayForm({ ...holidayForm, name: e.target.value })}
                  placeholder="e.g. Chhath Puja / Special Regional Off"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Holiday Date</label>
                <input
                  type="date"
                  required
                  value={holidayForm.date || ''}
                  onChange={(e) => setHolidayForm({ ...holidayForm, date: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Category</label>
                <select
                  value={holidayForm.category || 'GAZETTED'}
                  onChange={(e) => setHolidayForm({ ...holidayForm, category: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="NATIONAL">National Holiday</option>
                  <option value="CENTRAL">Central Holiday</option>
                  <option value="BIHAR_STATE">Bihar State Holiday</option>
                  <option value="GAZETTED">Gazetted Holiday</option>
                  <option value="CUSTOM">Custom Center Holiday</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description</label>
                <input
                  type="text"
                  value={holidayForm.description || ''}
                  onChange={(e) => setHolidayForm({ ...holidayForm, description: e.target.value })}
                  placeholder="Holiday note / details"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl mt-2 cursor-pointer shadow-md"
              >
                Add Holiday to Calendar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT BROADCAST ================= */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base">
                {editingBroadcast ? 'Edit Broadcast' : 'Create Broadcast Announcement'}
              </h3>
              <button onClick={() => setIsBroadcastModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBroadcast} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={broadcastForm.title || ''}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                  placeholder="e.g. Biometric Attendance Notice"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Priority Alert Level</label>
                <select
                  value={broadcastForm.priority || 'NORMAL'}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, priority: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="NORMAL">NORMAL (Informational Blue)</option>
                  <option value="IMPORTANT">IMPORTANT (Notice Amber)</option>
                  <option value="URGENT">URGENT (Critical Red)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Message Content</label>
                <textarea
                  rows={3}
                  required
                  value={broadcastForm.message || ''}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                  placeholder="Enter message text that displays on ticker banner..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl mt-2 cursor-pointer shadow-md"
              >
                Publish Broadcast Announcement
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

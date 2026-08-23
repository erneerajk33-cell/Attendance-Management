export interface Center {
  id: string;
  code: string;
  name: string;
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  shiftStartTime: string;
  shiftEndTime: string;
  graceTimeMinutes: number;
  inchargeName: string;
  inchargeContact: string;
  inchargeEmail: string;
  password?: string;
  active: boolean;
}

export interface Staff {
  id: string;
  staffCode: string;
  name: string;
  photoUrl: string;
  designation: string;
  department: string;
  email: string;
  phone: string;
  centerId: string;
  registeredDeviceId?: string;
  registeredDeviceModel?: string;
  isDeviceLocked: boolean;
  lockReason?: string;
  faceEnrolled: boolean;
  biometricEnrolled: boolean;
  password?: string;
  joiningDate: string;
  emergencyContact: string;
  address: string;
}

export interface AttendanceRecord {
  id: string;
  staffId: string;
  staffName: string;
  centerId: string;
  centerName: string;
  date: string; // YYYY-MM-DD
  inTime?: string; // HH:mm:ss
  outTime?: string; // HH:mm:ss
  status: 'PRESENT' | 'ABSENT' | 'LEAVE' | 'HOLIDAY' | 'HALF_DAY' | 'LATE';
  inLatitude?: number;
  inLongitude?: number;
  outLatitude?: number;
  outLongitude?: number;
  inDistanceMeters?: number;
  outDistanceMeters?: number;
  inWithinRadius?: boolean;
  outWithinRadius?: boolean;
  inVerifiedMethod?: 'FACE' | 'BIOMETRIC' | 'MANUAL_APPROVAL';
  outVerifiedMethod?: 'FACE' | 'BIOMETRIC' | 'MANUAL_APPROVAL';
  inPhoto?: string;
  outPhoto?: string;
  deviceId?: string;
  remarks?: string;
}

export interface LeaveRequest {
  id: string;
  staffId: string;
  staffName: string;
  centerId: string;
  centerName: string;
  leaveType: 'CASUAL' | 'MEDICAL' | 'EARNED' | 'SPECIAL' | 'HALF_DAY';
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  appliedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  adminRemarks?: string;
}

export interface ApprovalRequest {
  id: string;
  type: 'PROFILE_UPDATE' | 'DEVICE_UNBLOCK' | 'FACE_REENROLL' | 'OUT_OF_RADIUS_PUNCH' | 'LEAVE_REQUEST' | 'PASSWORD_RESET';
  staffId: string;
  staffName: string;
  centerId: string;
  centerName: string;
  title: string;
  details: string;
  payload?: any;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedAt: string;
  reviewedAt?: string;
  adminRemarks?: string;
}

export interface Holiday {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  category: 'NATIONAL' | 'CENTRAL' | 'BIHAR_STATE' | 'GAZETTED' | 'SUNDAY' | 'CUSTOM';
  description?: string;
  isOptional?: boolean;
}

export interface BroadcastMessage {
  id: string;
  title: string;
  message: string;
  priority: 'NORMAL' | 'IMPORTANT' | 'URGENT';
  active: boolean;
  createdAt: string;
  author: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  actorType: 'ADMIN' | 'CENTER' | 'STAFF' | 'SYSTEM';
  actorName: string;
  action: string;
  details: string;
  severity: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';
  centerId?: string;
}

export interface AttendanceRuleConfig {
  defaultRadiusMeters: number;
  globalGraceMinutes: number;
  halfDayThresholdHours: number;
  strictDeviceBinding: boolean;
  requireFaceVerification: boolean;
  allowOutOfRadiusRequest: boolean;
  autoMarkAbsentAfterTime: string;
  enableSundaysOff: boolean;
}

export type UserRole = 'MAIN' | 'CENTER' | 'ADMIN';

// Calculates distance between two lat/long coordinates in meters using the Haversine formula
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

// Generates or fetches device fingerprint info
export function getDeviceInfo(): {
  deviceId: string;
  deviceModel: string;
  userAgent: string;
  platform: string;
  screenRes: string;
} {
  let storedId = localStorage.getItem('skill_attendance_device_id');
  if (!storedId) {
    storedId = 'DEV-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    localStorage.setItem('skill_attendance_device_id', storedId);
  }

  const userAgent = navigator.userAgent;
  let model = 'Android Smartphone';
  if (/iPad|iPhone|iPod/.test(userAgent)) {
    model = 'Apple iOS Device';
  } else if (/Android/.test(userAgent)) {
    const match = userAgent.match(/Android\s+([\d.]+);?\s+([^;)]+)/);
    model = match ? `Android ${match[1]} (${match[2].trim()})` : 'Android Device';
  } else if (/Windows/.test(userAgent)) {
    model = 'Windows Station (Android Emulator/Client)';
  } else if (/Macintosh/.test(userAgent)) {
    model = 'Mac OS Client (Developer/Workstation)';
  } else if (/Linux/.test(userAgent)) {
    model = 'Linux Terminal Client';
  }

  return {
    deviceId: storedId,
    deviceModel: model,
    userAgent,
    platform: navigator.platform || 'Android OS',
    screenRes: `${window.screen.width}x${window.screen.height}`,
  };
}

export function formatIndianDateTime(date: Date = new Date()): {
  dateStr: string;
  timeStr: string;
  fullStr: string;
  dayName: string;
} {
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  };
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  };
  const dayOptions: Intl.DateTimeFormatOptions = { weekday: 'long' };

  const dateStr = date.toLocaleDateString('en-IN', options);
  const timeStr = date.toLocaleTimeString('en-IN', timeOptions);
  const dayName = date.toLocaleDateString('en-IN', dayOptions);

  return {
    dateStr,
    timeStr,
    fullStr: `${dayName}, ${dateStr} • ${timeStr}`,
    dayName,
  };
}

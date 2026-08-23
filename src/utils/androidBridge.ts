/**
 * Android Device Bridge & Hardware Interop Utilities
 * Provides haptic vibrations, sensor diagnostics, PWA WebAPK install prompt hooks, and offline listeners.
 */

// Safe Haptic feedback for Android devices
export const triggerHaptic = (type: 'LIGHT' | 'MEDIUM' | 'HEAVY' | 'SUCCESS' | 'ERROR' = 'LIGHT') => {
  if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
    try {
      switch (type) {
        case 'LIGHT':
          navigator.vibrate(25);
          break;
        case 'MEDIUM':
          navigator.vibrate(50);
          break;
        case 'HEAVY':
          navigator.vibrate(80);
          break;
        case 'SUCCESS':
          navigator.vibrate([40, 30, 70]);
          break;
        case 'ERROR':
          navigator.vibrate([100, 50, 100]);
          break;
      }
    } catch {
      // Haptics not allowed or unsupported in current context
    }
  }
};

// Check Android and device hardware capabilities
export interface AndroidDeviceCapabilities {
  isAndroid: boolean;
  isStandalonePWA: boolean;
  hasTouchScreen: boolean;
  hasCamera: boolean;
  hasGeolocation: boolean;
  hasVibration: boolean;
  online: boolean;
  screenDensity: number;
}

export const getAndroidDeviceCapabilities = (): AndroidDeviceCapabilities => {
  if (typeof window === 'undefined') {
    return {
      isAndroid: false,
      isStandalonePWA: false,
      hasTouchScreen: false,
      hasCamera: false,
      hasGeolocation: false,
      hasVibration: false,
      online: true,
      screenDensity: 1,
    };
  }

  const userAgent = navigator.userAgent || '';
  const isAndroid = /Android/i.test(userAgent);
  const isStandalonePWA =
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true;
  const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const hasCamera = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  const hasGeolocation = 'geolocation' in navigator;
  const hasVibration = 'vibrate' in navigator;
  const online = navigator.onLine;
  const screenDensity = window.devicePixelRatio || 1;

  return {
    isAndroid,
    isStandalonePWA,
    hasTouchScreen,
    hasCamera,
    hasGeolocation,
    hasVibration,
    online,
    screenDensity,
  };
};

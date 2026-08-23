import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Monitor,
  Wifi,
  Battery,
  BatteryCharging,
  Signal,
  RotateCcw,
  Sparkles,
  Download,
  CheckCircle2,
  X,
  Compass,
  Camera,
  ShieldCheck,
  CircleDot,
  Square,
  Triangle,
  Tablet,
  Sliders,
  Laptop
} from 'lucide-react';
import { triggerHaptic, getAndroidDeviceCapabilities } from '../utils/androidBridge';

interface AndroidFrameProps {
  children: React.ReactNode;
}

export type AndroidDeviceModel =
  | 'RESPONSIVE'
  | 'GALAXY_S24'
  | 'PIXEL_8'
  | 'REDMI_NOTE'
  | 'GALAXY_FOLD'
  | 'ANDROID_TABLET';

export type AndroidNavStyle = 'GESTURE' | 'THREE_BUTTON';

export const AndroidFrame: React.FC<AndroidFrameProps> = ({ children }) => {
  const [deviceModel, setDeviceModel] = useState<AndroidDeviceModel>('RESPONSIVE');
  const [isLandscape, setIsLandscape] = useState(false);
  const [navStyle, setNavStyle] = useState<AndroidNavStyle>('GESTURE');
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [currentTime, setCurrentTime] = useState('10:30');
  const [batteryLevel, setBatteryLevel] = useState(94);
  const [isCharging, setIsCharging] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  // Live time ticker
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      const h = d.getHours();
      const m = d.getMinutes().toString().padStart(2, '0');
      const ampm = h >= 12 ? 'PM' : 'AM';
      const formattedH = h % 12 || 12;
      setCurrentTime(`${formattedH}:${m} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Online / Offline monitor
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check battery if Battery API available
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));
        setIsCharging(battery.charging);
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
        battery.addEventListener('chargingchange', () => {
          setIsCharging(battery.charging);
        });
      }).catch(() => {});
    }

    // Capture PWA beforeinstallprompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = () => {
    triggerHaptic('MEDIUM');
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          setInstalledSuccess(true);
          triggerHaptic('SUCCESS');
        }
        setDeferredPrompt(null);
      });
    } else {
      setShowInstallModal(true);
    }
  };

  // Dimensions configuration for devices
  const getDeviceDimensions = () => {
    switch (deviceModel) {
      case 'GALAXY_S24':
        return isLandscape ? { width: '880px', height: '420px', notch: 'top-center' } : { width: '412px', height: '880px', notch: 'top-center' };
      case 'PIXEL_8':
        return isLandscape ? { width: '860px', height: '412px', notch: 'top-center' } : { width: '412px', height: '860px', notch: 'top-center' };
      case 'REDMI_NOTE':
        return isLandscape ? { width: '840px', height: '392px', notch: 'top-center' } : { width: '392px', height: '840px', notch: 'top-center' };
      case 'GALAXY_FOLD':
        return isLandscape ? { width: '840px', height: '673px', notch: 'corner' } : { width: '673px', height: '840px', notch: 'corner' };
      case 'ANDROID_TABLET':
        return isLandscape ? { width: '1100px', height: '720px', notch: 'none' } : { width: '768px', height: '1020px', notch: 'none' };
      default:
        return { width: '100%', height: '100%', notch: 'none' };
    }
  };

  const currentDim = getDeviceDimensions();
  const caps = getAndroidDeviceCapabilities();

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-start text-slate-900 font-sans">
      {/* Top Android Universal Device Controller Ribbon */}
      <header className="w-full bg-white border-b border-slate-200 px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2.5 text-xs select-none z-40 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-slate-800 hidden sm:inline">
                Android Universal Engine
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                {isOnline ? 'All Android Devices Ready' : 'Offline Mode'}
              </span>
            </div>
          </div>
        </div>

        {/* Device Switcher Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Device Model Selector Dropdown / Pills */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => {
                triggerHaptic('LIGHT');
                setDeviceModel('RESPONSIVE');
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                deviceModel === 'RESPONSIVE'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Fluid Full Screen View"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Adaptive View</span>
            </button>

            <button
              onClick={() => {
                triggerHaptic('LIGHT');
                setDeviceModel('GALAXY_S24');
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                deviceModel === 'GALAXY_S24'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Samsung Galaxy S24 Ultra (412x915)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Galaxy S24</span>
            </button>

            <button
              onClick={() => {
                triggerHaptic('LIGHT');
                setDeviceModel('PIXEL_8');
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                deviceModel === 'PIXEL_8'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Google Pixel 8 Pro (412x892)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pixel 8</span>
            </button>

            <button
              onClick={() => {
                triggerHaptic('LIGHT');
                setDeviceModel('GALAXY_FOLD');
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                deviceModel === 'GALAXY_FOLD'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Galaxy Foldable Screen (673x840)"
            >
              <Tablet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Foldable</span>
            </button>

            <button
              onClick={() => {
                triggerHaptic('LIGHT');
                setDeviceModel('ANDROID_TABLET');
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                deviceModel === 'ANDROID_TABLET'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Android Tablet / Kiosk (800x1280)"
            >
              <Laptop className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Tablet/Kiosk</span>
            </button>
          </div>

          {/* Orientation & Frame Controls (Active when in Emulated Device mode) */}
          {deviceModel !== 'RESPONSIVE' && (
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
              <button
                onClick={() => {
                  triggerHaptic('LIGHT');
                  setIsLandscape(!isLandscape);
                }}
                className={`p-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  isLandscape ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Rotate Orientation (Portrait / Landscape)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => {
                  triggerHaptic('LIGHT');
                  setNavStyle(navStyle === 'GESTURE' ? 'THREE_BUTTON' : 'GESTURE');
                }}
                className="px-2 py-1 rounded-xl text-[11px] font-bold text-slate-700 hover:bg-slate-200 transition cursor-pointer"
                title="Switch Android Navigation Style"
              >
                {navStyle === 'GESTURE' ? 'Gesture' : '3-Button'}
              </button>
            </div>
          )}

          {/* Android App Install Button */}
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install App</span>
          </button>

          {/* Diagnostics Modal Toggle */}
          <button
            onClick={() => {
              triggerHaptic('LIGHT');
              setShowDiagnostics(true);
            }}
            className="p-1.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition cursor-pointer"
            title="Device Capabilities & Hardware Status"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Screen Layout Container */}
      {deviceModel === 'RESPONSIVE' ? (
        <div className="w-full flex-1 flex flex-col">{children}</div>
      ) : (
        <div className="w-full flex-1 flex items-center justify-center p-2 sm:p-6 bg-slate-200/90 overflow-y-auto">
          {/* Emulated Android Hardware Shell */}
          <div
            style={{
              width: currentDim.width,
              height: currentDim.height,
              maxHeight: '92vh',
            }}
            className="bg-slate-900 rounded-[44px] p-2.5 shadow-2xl border-4 border-slate-800 relative flex flex-col overflow-hidden ring-2 ring-slate-400 transition-all duration-300"
          >
            {/* Top Android Status Bar */}
            <div className="w-full h-7 shrink-0 flex items-center justify-between px-6 text-[11px] text-white select-none z-50 bg-slate-950/80 backdrop-blur-md rounded-t-[36px]">
              <span className="font-bold font-mono text-[11px] text-slate-200">{currentTime}</span>

              {/* Punch-hole camera */}
              {currentDim.notch === 'top-center' && (
                <div className="w-4 h-4 rounded-full bg-black border border-slate-800 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-900 ring-1 ring-cyan-900" />
                </div>
              )}

              <div className="flex items-center gap-1.5 text-slate-200">
                <span className="text-[10px] font-bold text-emerald-400 font-mono">5G</span>
                <Signal className="w-3.5 h-3.5 text-emerald-400" />
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <div className="flex items-center gap-0.5">
                  {isCharging ? (
                    <BatteryCharging className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  ) : (
                    <Battery className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                  <span className="text-[10px] font-mono font-bold text-slate-300">{batteryLevel}%</span>
                </div>
              </div>
            </div>

            {/* Inner Android Application Viewport */}
            <div className="w-full flex-1 bg-slate-100 text-slate-900 overflow-y-auto overflow-x-hidden flex flex-col relative rounded-b-[36px]">
              {children}
            </div>

            {/* Bottom Android Navigation System */}
            {navStyle === 'GESTURE' ? (
              <div className="w-full h-4 shrink-0 flex items-center justify-center bg-slate-950/90 rounded-b-[36px]">
                <div className="w-28 h-1 bg-slate-400 rounded-full" />
              </div>
            ) : (
              <div className="w-full h-8 shrink-0 flex items-center justify-around bg-slate-950 px-12 text-slate-400 border-t border-slate-800 rounded-b-[36px]">
                <button
                  onClick={() => triggerHaptic('LIGHT')}
                  className="p-1 hover:text-white transition active:scale-90 cursor-pointer"
                  title="Android Back"
                >
                  <Triangle className="w-3.5 h-3.5 -rotate-90 fill-current" />
                </button>
                <button
                  onClick={() => {
                    triggerHaptic('MEDIUM');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="p-1 hover:text-white transition active:scale-90 cursor-pointer"
                  title="Android Home"
                >
                  <CircleDot className="w-4 h-4 text-slate-300" />
                </button>
                <button
                  onClick={() => triggerHaptic('LIGHT')}
                  className="p-1 hover:text-white transition active:scale-90 cursor-pointer"
                  title="Android Recent Apps"
                >
                  <Square className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Android Installation & WebAPK Help Modal */}
      {showInstallModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border-2 border-slate-200 overflow-hidden animate-fadeIn">
            <div className="bg-blue-700 text-white p-5 relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-orange-400 text-white flex items-center justify-center font-black text-sm shadow-md">
                  <Download className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Android App Installation</h3>
                  <p className="text-xs text-blue-100">Install as standalone app on any Android device</p>
                </div>
              </div>
              <button
                onClick={() => setShowInstallModal(false)}
                className="text-white/80 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {installedSuccess ? (
                <div className="text-center py-4 space-y-3">
                  <div className="w-14 h-14 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto animate-bounce">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">App Installed Successfully!</h4>
                  <p className="text-xs text-slate-600">
                    The Online Attendance System is now installed on your Android device home screen.
                  </p>
                </div>
              ) : (
                <>
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl">
                    <p className="text-xs font-extrabold text-blue-800 uppercase tracking-wide mb-1">
                      Universal Android Compatibility
                    </p>
                    <p className="text-xs text-blue-900">
                      This system is built with native Android PWA (Progressive Web App) architecture, supporting Samsung, Google Pixel, Xiaomi/Redmi, OnePlus, Vivo, Oppo, Realme, Motorola, and Android Tablets.
                    </p>
                  </div>

                  <div className="space-y-3 pt-1">
                    <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Steps to install on your Android Phone:
                    </p>

                    <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        1
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">Google Chrome / Samsung Internet</p>
                        <p className="text-xs text-slate-600">
                          Tap the three dots menu (<span className="font-bold font-mono">⋮</span>) at the top right of your browser.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        2
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">Select "Install app" or "Add to Home screen"</p>
                        <p className="text-xs text-slate-600">
                          Click <strong>Install</strong> to add the full-screen attendance kiosk app to your app drawer and home screen.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        3
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">Enable GPS & Camera Permissions</p>
                        <p className="text-xs text-slate-600">
                          When prompted, allow location and camera access for biometric face punches and geo-fenced verification.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                    <button
                      onClick={() => setShowInstallModal(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition cursor-pointer"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        triggerHaptic('SUCCESS');
                        setShowInstallModal(false);
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
                    >
                      Understood & Ready
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hardware Diagnostics & Capabilities Modal */}
      {showDiagnostics && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border-2 border-slate-200 overflow-hidden animate-fadeIn">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Android Hardware Diagnostics</h3>
                  <p className="text-xs text-slate-400">Live sensor & device capability matrix</p>
                </div>
              </div>
              <button
                onClick={() => setShowDiagnostics(false)}
                className="text-white/80 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                  <span className="text-slate-500 block text-[10px] font-bold uppercase">Operating System</span>
                  <span className="font-extrabold text-slate-900">{caps.isAndroid ? 'Android OS Detected' : 'Universal Android Compatible'}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                  <span className="text-slate-500 block text-[10px] font-bold uppercase">Touch Hardware</span>
                  <span className="font-extrabold text-emerald-600">{caps.hasTouchScreen ? 'Multi-Touch Enabled' : 'Mouse / Stylus Compatible'}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                  <span className="text-slate-500 block text-[10px] font-bold uppercase">GPS Radar Sensor</span>
                  <span className="font-extrabold text-blue-700">{caps.hasGeolocation ? 'High Accuracy GPS Ready' : 'Geo API Emulated'}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                  <span className="text-slate-500 block text-[10px] font-bold uppercase">Camera Biometrics</span>
                  <span className="font-extrabold text-emerald-600">{caps.hasCamera ? 'WebRTC HD Camera Available' : 'AI Simulation Fallback'}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                  <span className="text-slate-500 block text-[10px] font-bold uppercase">Haptic Engine</span>
                  <span className="font-extrabold text-amber-700">{caps.hasVibration ? 'Vibration Motor Active' : 'Virtual Audio Haptic'}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                  <span className="text-slate-500 block text-[10px] font-bold uppercase">Screen Density</span>
                  <span className="font-extrabold text-slate-900">{caps.screenDensity}x Retina / HiDPI</span>
                </div>
              </div>

              {/* Haptic Test Button */}
              <div className="pt-2">
                <button
                  onClick={() => triggerHaptic('SUCCESS')}
                  className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl text-xs font-bold border border-slate-300 transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Test Android Haptic Vibration</span>
                </button>
              </div>

              <div className="pt-3 flex justify-end border-t border-slate-100">
                <button
                  onClick={() => setShowDiagnostics(false)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

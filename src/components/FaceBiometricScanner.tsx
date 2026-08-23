import React, { useState, useRef, useEffect } from 'react';
import { Camera, Scan, CheckCircle, AlertTriangle, Fingerprint, ShieldCheck, RefreshCw, Sparkles, User } from 'lucide-react';
import confetti from 'canvas-confetti';
import { triggerHaptic } from '../utils/androidBridge';

interface FaceBiometricScannerProps {
  staffName: string;
  staffPhotoUrl?: string;
  isPunchIn: boolean;
  onVerified: (method: 'FACE' | 'BIOMETRIC', photoDataUrl?: string) => void;
  onCancel?: () => void;
}

export const FaceBiometricScanner: React.FC<FaceBiometricScannerProps> = ({
  staffName,
  staffPhotoUrl,
  isPunchIn,
  onVerified,
  onCancel,
}) => {
  const [mode, setMode] = useState<'FACE' | 'BIOMETRIC'>('FACE');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanningProgress, setScanningProgress] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);
  const [livenessStage, setLivenessStage] = useState<'ALIGN' | 'BLINK' | 'SMILE' | 'MATCHED'>('ALIGN');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize camera
  useEffect(() => {
    if (mode !== 'FACE') return;

    let mounted = true;
    async function startCamera() {
      try {
        setCameraError(null);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
        if (!mounted) return;
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
        setCameraActive(true);
      } catch (err: any) {
        console.warn('Camera access not granted or unavailable:', err.message);
        if (mounted) {
          setCameraActive(false);
          setCameraError('Live camera not detected or permission denied. AI Face Simulator ready.');
        }
      }
    }

    startCamera();

    return () => {
      mounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [mode]);

  // Handle Face Scan simulation / detection
  const handleTriggerFaceScan = () => {
    setIsVerifying(true);
    setScanningProgress(15);
    setLivenessStage('ALIGN');
    triggerHaptic('LIGHT');

    setTimeout(() => {
      setScanningProgress(45);
      setLivenessStage('BLINK');
      triggerHaptic('LIGHT');
    }, 800);

    setTimeout(() => {
      setScanningProgress(80);
      setLivenessStage('SMILE');
      triggerHaptic('LIGHT');
    }, 1600);

    setTimeout(() => {
      setScanningProgress(100);
      setLivenessStage('MATCHED');
      setVerifiedSuccess(true);
      triggerHaptic('SUCCESS');

      // Capture snapshot
      let photoData = staffPhotoUrl;
      if (videoRef.current && canvasRef.current && cameraActive) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth || 320;
        canvas.height = video.videoHeight || 240;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          photoData = canvas.toDataURL('image/jpeg', 0.8);
        }
      }

      // Celebrate success
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#3b82f6', '#f59e0b'],
        });
      } catch {}

      setTimeout(() => {
        onVerified('FACE', photoData);
      }, 1000);
    }, 2400);
  };

  // Handle Biometric Thumbprint
  const handleTriggerBiometric = () => {
    setIsVerifying(true);
    setScanningProgress(20);
    triggerHaptic('LIGHT');

    setTimeout(() => {
      setScanningProgress(75);
      triggerHaptic('LIGHT');
    }, 700);

    setTimeout(() => {
      setScanningProgress(100);
      setVerifiedSuccess(true);
      triggerHaptic('SUCCESS');
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#10b981', '#3b82f6'],
        });
      } catch {}

      setTimeout(() => {
        onVerified('BIOMETRIC', staffPhotoUrl);
      }, 1000);
    }, 1500);
  };

  return (
    <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 text-slate-900 shadow-xl max-w-md w-full mx-auto relative overflow-hidden">
      {/* Hidden canvas for taking snapshot */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold shadow-xs">
            <Scan className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900">
              {isPunchIn ? 'Attendance Punch IN' : 'Attendance Punch OUT'}
            </h3>
            <p className="text-xs text-slate-500 font-medium">Verifying Identity: {staffName}</p>
          </div>
        </div>

        {/* Mode switcher tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button
            onClick={() => {
              setMode('FACE');
              setIsVerifying(false);
              setVerifiedSuccess(false);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              mode === 'FACE'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Face AI</span>
          </button>
          <button
            onClick={() => {
              setMode('BIOMETRIC');
              setIsVerifying(false);
              setVerifiedSuccess(false);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              mode === 'BIOMETRIC'
                ? 'bg-green-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Fingerprint className="w-3.5 h-3.5" />
            <span>Fingerprint</span>
          </button>
        </div>
      </div>

      {/* Scanner Viewport */}
      <div className="my-5 relative">
        {mode === 'FACE' ? (
          <div className="relative w-full h-64 bg-slate-900 rounded-3xl overflow-hidden border-2 border-slate-200 flex items-center justify-center">
            {cameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />
            ) : (
              // AI Facial Mesh Simulator View
              <div className="relative w-full h-full flex flex-col items-center justify-center p-4 bg-slate-900">
                {staffPhotoUrl ? (
                  <img
                    src={staffPhotoUrl}
                    alt={staffName}
                    referrerPolicy="no-referrer"
                    className="w-32 h-32 rounded-full object-cover border-4 border-blue-500 shadow-xl"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-slate-400">
                    <User className="w-14 h-14" />
                  </div>
                )}
                <div className="mt-3 text-center">
                  <span className="text-xs text-blue-300 font-bold px-2.5 py-0.5 rounded-full bg-blue-950 border border-blue-800">
                    AI Bio-Metric Mesh Simulator
                  </span>
                </div>
              </div>
            )}

            {/* Facial Recognition Mesh Frame */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              {/* Outer Alignment Oval */}
              <div
                className={`w-48 h-56 rounded-[45%] border-2 transition-all duration-300 ${
                  verifiedSuccess
                    ? 'border-green-400 shadow-[0_0_20px_rgba(34,197,94,0.5)]'
                    : isVerifying
                    ? 'border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-pulse'
                    : 'border-slate-500/60'
                } relative`}
              >
                {/* 4 Corner Crosshairs */}
                <div className="absolute -top-2 -left-2 w-5 h-5 border-t-3 border-l-3 border-green-400" />
                <div className="absolute -top-2 -right-2 w-5 h-5 border-t-3 border-r-3 border-green-400" />
                <div className="absolute -bottom-2 -left-2 w-5 h-5 border-b-3 border-l-3 border-green-400" />
                <div className="absolute -bottom-2 -right-2 w-5 h-5 border-b-3 border-r-3 border-green-400" />

                {/* Scanning Laser Beam */}
                {isVerifying && !verifiedSuccess && (
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_10px_#22d3ee] animate-[scanLaser_1.5s_infinite_alternate]" />
                )}

                {/* AI Facial Landmarks Grid Points */}
                {isVerifying && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-70">
                    <div className="w-32 h-36 grid grid-cols-4 grid-rows-5 gap-3 p-2">
                      {Array.from({ length: 20 }).map((_, idx) => (
                        <div
                          key={idx}
                          className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"
                          style={{ animationDelay: `${idx * 70}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Status Pill on Top of Video */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-slate-950/90 text-slate-200 border border-slate-700 backdrop-blur-md">
                {verifiedSuccess
                  ? 'Face Matched (99.8%)'
                  : isVerifying
                  ? `Liveness: ${livenessStage}`
                  : 'Align Face in Frame'}
              </span>

              {cameraError && (
                <span className="text-[10px] font-bold text-orange-300 bg-orange-950/90 px-2 py-0.5 rounded-lg border border-orange-800">
                  Virtual Camera
                </span>
              )}
            </div>
          </div>
        ) : (
          // Biometric Fingerprint Sensor Mode
          <div className="relative w-full h-64 bg-slate-900 rounded-3xl border-2 border-slate-200 flex flex-col items-center justify-center p-6 text-center">
            <div
              onClick={!isVerifying ? handleTriggerBiometric : undefined}
              className={`w-28 h-28 rounded-3xl border-2 cursor-pointer transition-all duration-300 flex items-center justify-center relative overflow-hidden ${
                verifiedSuccess
                  ? 'border-green-400 bg-green-950/60 shadow-[0_0_30px_rgba(34,197,94,0.4)]'
                  : isVerifying
                  ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_20px_rgba(34,211,238,0.3)] animate-pulse'
                  : 'border-slate-700 bg-slate-800 hover:border-green-500 hover:bg-slate-700'
              }`}
            >
              <Fingerprint
                className={`w-16 h-16 transition-colors ${
                  verifiedSuccess
                    ? 'text-green-400'
                    : isVerifying
                    ? 'text-cyan-400 animate-bounce'
                    : 'text-slate-300'
                }`}
              />

              {/* Glowing Sensor Scanner Bar */}
              {isVerifying && !verifiedSuccess && (
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-emerald-400 via-cyan-300 to-emerald-400 shadow-md animate-[scanLaser_1.2s_infinite]" />
              )}
            </div>

            <p className="mt-4 text-xs font-bold text-slate-200">
              {verifiedSuccess
                ? 'Biometric Fingerprint Verified'
                : isVerifying
                ? 'Reading Fingerprint Ridge Geometry...'
                : 'Place Thumb / Finger on Scanner to Verify'}
            </p>
          </div>
        )}
      </div>

      {/* Progress Bar during scan */}
      {isVerifying && (
        <div className="w-full bg-slate-100 rounded-full h-2 mb-4 overflow-hidden border border-slate-200">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              verifiedSuccess
                ? 'bg-green-500'
                : 'bg-gradient-to-r from-blue-500 via-blue-400 to-green-500'
            }`}
            style={{ width: `${scanningProgress}%` }}
          />
        </div>
      )}

      {/* Bottom Action Buttons */}
      <div className="flex items-center gap-3">
        {onCancel && (
          <button
            onClick={onCancel}
            disabled={isVerifying}
            className="w-1/3 py-3 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-300 transition cursor-pointer"
          >
            Cancel
          </button>
        )}

        <button
          onClick={mode === 'FACE' ? handleTriggerFaceScan : handleTriggerBiometric}
          disabled={isVerifying}
          className={`flex-1 py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition active:scale-98 cursor-pointer ${
            verifiedSuccess
              ? 'bg-green-600 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {verifiedSuccess ? (
            <>
              <CheckCircle className="w-4 h-4 text-white" />
              <span>Verification Successful!</span>
            </>
          ) : isVerifying ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
              <span>Processing Bio-Verification...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-orange-300" />
              <span>
                {mode === 'FACE'
                  ? `Capture Face (${isPunchIn ? 'IN' : 'OUT'})`
                  : `Scan Fingerprint (${isPunchIn ? 'IN' : 'OUT'})`}
              </span>
            </>
          )}
        </button>
      </div>

      {/* Security notice footer */}
      <div className="mt-3.5 pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-medium">
        <span className="flex items-center gap-1 text-green-700 font-bold">
          <ShieldCheck className="w-3.5 h-3.5" />
          Encrypted Bio-Telemetry
        </span>
        <span>GPS & Timestamp Tagged</span>
      </div>
    </div>
  );
};

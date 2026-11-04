import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Loader2,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Camera,
  Upload,
  CheckCircle2,
  RefreshCw,
  Smartphone,
} from "lucide-react";
import jsQR from "jsqr";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { resolveScan } from "@/api/catering.api";
import { extractCodeFromQrPayload } from "@/utils/qrPayload";

export interface ScanDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (registrantId: string) => void;
}

interface BarcodeDetectionResult {
  rawValue?: string;
}

interface BarcodeDetectorType {
  new (options?: { formats: string[] }): {
    detect: (
      source: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement,
    ) => Promise<BarcodeDetectionResult[]>;
  };
}



/**
 * Decodes QR code from canvas using jsQR with attemptBoth for maximum recognition accuracy.
 */
function decodeQrFromCanvas(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
): string | null {
  try {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "attemptBoth",
    });
    if (code && code.data && code.data.trim().length > 0) {
      return code.data.trim();
    }
  } catch {
    // Ignore frame decode errors
  }
  return null;
}

export const ScanDialog: React.FC<ScanDialogProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
}) => {
  const [passcode, setPasscode] = useState("");
  const [isResolving, setIsResolving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [scanSuccessCode, setScanSuccessCode] = useState<string | null>(null);

  // Camera states
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [isSecureContextMode, setIsSecureContextMode] = useState(true);
  const [cameraFacing, setCameraFacing] = useState<"environment" | "user">("environment");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const scanCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Stop camera tracks cleanly
  const stopCamera = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  // Process detected QR code payload
  const handleCodeDetected = useCallback(
    async (rawCode: string) => {
      const code = extractCodeFromQrPayload(rawCode);
      if (!code || isResolving) return;

      setIsResolving(true);
      setErrorMessage(null);
      setScanSuccessCode(code);

      try {
        const res = await resolveScan(code);
        const targetId = res.registrantId || code;
        if (targetId) {
          stopCamera();
          setTimeout(() => {
            onClose();
            onScanSuccess(targetId);
          }, 350);
        } else {
          setErrorMessage(
            res.reason ||
              `Accreditation (${code}) could not be resolved.`,
          );
          setScanSuccessCode(null);
          setIsResolving(false);
        }
      } catch {
        // Fallback directly to scanned code if resolveScan threw
        if (code) {
          stopCamera();
          setTimeout(() => {
            onClose();
            onScanSuccess(code);
          }, 350);
        } else {
          setErrorMessage("Network error while resolving accreditation.");
          setScanSuccessCode(null);
          setIsResolving(false);
        }
      }
    },
    [isResolving, onClose, onScanSuccess, stopCamera],
  );

  // Start camera stream with multi-level constraint fallbacks
  const startCamera = useCallback(async (facingOverride?: "environment" | "user") => {
    stopCamera();
    setCameraError(null);
    setIsStartingCamera(true);

    const isSecure =
      typeof window !== "undefined" &&
      (window.isSecureContext ||
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1");

    setIsSecureContextMode(isSecure);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setIsStartingCamera(false);
      if (!isSecure) {
        setCameraError(
          "Live camera stream requires HTTPS. Please open via https:// on mobile, or tap 'Take QR Photo' below.",
        );
      } else {
        setCameraError(
          "Camera access is not supported by this browser. Tap 'Take QR Photo' to scan.",
        );
      }
      return;
    }

    try {
      if (!scanCanvasRef.current) {
        scanCanvasRef.current = document.createElement("canvas");
      }
      const scanCanvas = scanCanvasRef.current;
      const ctx = scanCanvas.getContext("2d", { willReadFrequently: true });

      const facing = facingOverride || cameraFacing;

      // Progressive constraint fallback
      const constraintCandidates: MediaStreamConstraints[] = [
        {
          video: {
            facingMode: { ideal: facing },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        },
        {
          video: { facingMode: facing },
          audio: false,
        },
        {
          video: { facingMode: facing === "environment" ? "user" : "environment" },
          audio: false,
        },
        {
          video: true,
          audio: false,
        },
      ];

      let stream: MediaStream | null = null;
      let lastErr: unknown = null;
      for (const constraints of constraintCandidates) {
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraints);
          if (stream) break;
        } catch (e) {
          lastErr = e;
        }
      }

      if (!stream) {
        throw lastErr || new Error("Unable to obtain media stream.");
      }

      streamRef.current = stream;
      if (videoRef.current) {
        const video = videoRef.current;
        video.muted = true;
        video.defaultMuted = true;
        video.playsInline = true;
        video.setAttribute("playsinline", "true");
        video.setAttribute("webkit-playsinline", "true");
        video.setAttribute("autoplay", "true");
        video.setAttribute("muted", "true");
        video.srcObject = stream;

        // Ensure video is playing with mobile Safari lifecycle support
        try {
          await video.play();
        } catch {
          video.muted = true;
          await new Promise<void>((resolve) => {
            video.onloadedmetadata = async () => {
              try {
                await video.play();
              } catch (e) {
                console.warn("Retrying video play:", e);
              }
              resolve();
            };
            setTimeout(resolve, 350);
          });
        }
        setCameraActive(true);

        // Continuous scanning loop using native BarcodeDetector or jsQR
        let isDetecting = false;
        const scanLoop = async () => {
          if (
            videoRef.current &&
            videoRef.current.readyState >= 2 &&
            !videoRef.current.paused
          ) {
            const v = videoRef.current;
            if (v.videoWidth > 0 && v.videoHeight > 0 && !isDetecting) {
              isDetecting = true;
              try {
                // 1. Native BarcodeDetector (hardware accelerated on Android/iOS)
                if (typeof window !== "undefined" && "BarcodeDetector" in window) {
                  try {
                    const DetectorClass = (window as unknown as { BarcodeDetector?: BarcodeDetectorType }).BarcodeDetector;
                    if (DetectorClass) {
                      const detector = new DetectorClass({ formats: ["qr_code"] });
                      const barcodes = await detector.detect(v);
                      if (barcodes && barcodes.length > 0 && barcodes[0]?.rawValue) {
                        handleCodeDetected(barcodes[0].rawValue);
                        return;
                      }
                    }
                  } catch {
                    // fallback to jsQR
                  }
                }

                // 2. jsQR via offscreen canvas
                if (ctx) {
                  const scale = Math.min(1, 640 / Math.max(v.videoWidth, v.videoHeight));
                  scanCanvas.width = Math.round(v.videoWidth * scale);
                  scanCanvas.height = Math.round(v.videoHeight * scale);

                  ctx.drawImage(v, 0, 0, scanCanvas.width, scanCanvas.height);
                  const detected = decodeQrFromCanvas(scanCanvas, ctx);
                  if (detected) {
                    handleCodeDetected(detected);
                    return;
                  }
                }
              } finally {
                isDetecting = false;
              }
            }
          }
          animFrameRef.current = requestAnimationFrame(scanLoop);
        };

        animFrameRef.current = requestAnimationFrame(scanLoop);
      }
    } catch (err: unknown) {
      console.warn("Camera stream initiation failed:", err);
      const isPermissionDenied =
        err instanceof Error &&
        (err.name === "NotAllowedError" || err.name === "PermissionDeniedError");
      setCameraError(
        isPermissionDenied
          ? "Camera permission denied. Please allow camera permissions in your browser or tap 'Take QR Photo' below."
          : "Unable to start live camera viewfinder. Tap 'Take QR Photo' to snap a photo with your mobile camera.",
      );
      setCameraActive(false);
    } finally {
      setIsStartingCamera(false);
    }
  }, [cameraFacing, handleCodeDetected, stopCamera]);

  const toggleCameraFacing = useCallback(() => {
    const nextFacing = cameraFacing === "environment" ? "user" : "environment";
    setCameraFacing(nextFacing);
    startCamera(nextFacing);
  }, [cameraFacing, startCamera]);

  // Handle uploaded QR image or direct camera snapshot with multi-engine recognition
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsResolving(true);
    setErrorMessage(null);

    try {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.src = objectUrl;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      URL.revokeObjectURL(objectUrl);

      // 1. Try native BarcodeDetector directly on Image
      if (typeof window !== "undefined" && "BarcodeDetector" in window) {
        try {
          const DetectorClass = (window as unknown as { BarcodeDetector?: BarcodeDetectorType }).BarcodeDetector;
          if (DetectorClass) {
            const detector = new DetectorClass({ formats: ["qr_code"] });
            const barcodes = await detector.detect(img);
            if (barcodes && barcodes.length > 0 && barcodes[0]?.rawValue) {
              handleCodeDetected(barcodes[0].rawValue);
              return;
            }
          }
        } catch {
          // fallback
        }
      }

      // 2. Multi-resolution canvas scanning with jsQR
      const candidateResolutions = [640, 1000, 1400, Math.max(img.width, img.height)];
      for (const maxDim of candidateResolutions) {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) continue;

        ctx.drawImage(img, 0, 0, width, height);
        const detected = decodeQrFromCanvas(canvas, ctx);
        if (detected) {
          handleCodeDetected(detected);
          return;
        }
      }

      setErrorMessage(
        "Could not detect a clear QR barcode in the photo. Please make sure the QR code is centered and well-lit, or enter the ID manually.",
      );
    } catch {
      setErrorMessage(
        "Error processing photo. Please snap another photo or enter the participant ID manually.",
      );
    } finally {
      setIsResolving(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (cameraInputRef.current) cameraInputRef.current.value = "";
    }
  };

  // Manage modal open/close lifecycle
  useEffect(() => {
    if (isOpen) {
      setPasscode("");
      setErrorMessage(null);
      setScanSuccessCode(null);
      setIsResolving(false);

      // Attempt live camera
      startCamera();

      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera]);

  if (!isOpen) return null;

  const handleManualSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!passcode.trim() || isResolving) return;
    handleCodeDetected(passcode.trim());
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        stopCamera();
        onClose();
      }}
      title="Accreditation QR Scanner"
      subtitle="Scan participant pass with your camera or enter credential ID below."
      maxWidth="md"
    >
      <div className="p-4 sm:p-5 space-y-4">
        {/* Camera Viewfinder Box */}
        <div className="relative flex flex-col items-center justify-center rounded-2xl bg-black min-h-[270px] sm:min-h-[300px] overflow-hidden border border-slate-800 shadow-inner">
          {/* Active Live Video Stream */}
          <video
            ref={videoRef}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              cameraActive ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            autoPlay
            playsInline
            muted
          />

          {/* Interactive Scanning Reticle & Laser Line Overlay */}
          {cameraActive && (
            <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center p-6">
              <div className="relative w-48 h-48 sm:w-56 sm:h-56">
                {/* 4 Corner Target Brackets in Gold */}
                <div className="absolute top-0 left-0 w-7 h-7 border-t-3 border-l-3 border-[#C9A227] rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-7 h-7 border-t-3 border-r-3 border-[#C9A227] rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-7 h-7 border-b-3 border-l-3 border-[#C9A227] rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-7 h-7 border-b-3 border-r-3 border-[#C9A227] rounded-br-lg" />

                {/* Animated Horizontal Laser Scanline */}
                <div className="absolute left-1 right-1 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-transparent via-[#DEC067] to-transparent shadow-[0_0_10px_#C9A227] animate-pulse" />
              </div>
            </div>
          )}

          {/* Success Overlay Flash */}
          {scanSuccessCode && (
            <div className="absolute inset-0 z-30 bg-emerald-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-white p-4 animate-in fade-in">
              <CheckCircle2 className="h-12 w-12 text-emerald-400 mb-2 animate-bounce" />
              <p className="text-sm font-bold">Accreditation Detected!</p>
              <p className="text-xs text-emerald-200 font-mono mt-1">
                {scanSuccessCode}
              </p>
            </div>
          )}

          {/* Camera Loading or Fallback Interface */}
          {!cameraActive && (
            <div className="relative z-10 flex flex-col items-center p-6 text-center text-white max-w-sm">
              {isStartingCamera ? (
                <>
                  <Loader2 className="h-10 w-10 text-[#DEC067] animate-spin mb-3" />
                  <p className="text-xs font-semibold text-slate-200">
                    Starting Camera Viewfinder…
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Please approve camera permissions if prompted.
                  </p>
                </>
              ) : (
                <>
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 border border-white/20">
                    <Smartphone className="h-7 w-7 text-[#DEC067]" />
                  </div>
                  <p className="text-sm font-bold text-slate-100">
                    {cameraError ? "Mobile QR Scanner" : "Camera Idle"}
                  </p>
                  <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                    {cameraError ||
                      "Tap below to open your mobile camera and scan the QR code badge."}
                  </p>

                  {/* Primary Mobile Action Buttons */}
                  <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-2.5 w-full">
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => cameraInputRef.current?.click()}
                      className="w-full sm:w-auto rounded-xl bg-[#C9A227] hover:bg-[#B8901E] text-white font-bold shadow-sm"
                      leftIcon={<Camera className="h-4 w-4" />}
                    >
                      Take QR Photo
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full sm:w-auto rounded-xl border-white/30 text-white hover:bg-white/10 font-semibold"
                      leftIcon={<Upload className="h-4 w-4" />}
                    >
                      Upload Image
                    </Button>
                  </div>

                  {typeof window !== "undefined" && window.location.protocol === "http:" && (
                    <a
                      href={window.location.href.replace(/^http:/, "https:")}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 text-xs font-bold shadow-xs transition cursor-pointer"
                    >
                      <ShieldCheck className="h-4 w-4 text-emerald-200" />
                      <span>Open HTTPS for Live Scanner</span>
                    </a>
                  )}

                  {isSecureContextMode && (
                    <button
                      type="button"
                      onClick={() => startCamera()}
                      className="mt-3 text-[11px] text-slate-400 hover:text-white underline underline-offset-2 transition-colors cursor-pointer"
                    >
                      Retry live camera stream
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {/* Floating Controls When Live Camera Stream Is Active */}
          {cameraActive && (
            <div className="absolute bottom-3 left-3 right-3 z-30 flex items-center justify-between text-[11px] text-white/90 bg-black/60 px-3 py-1.5 rounded-xl backdrop-blur-xs">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                Live Camera Scanner
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleCameraFacing}
                  className="hover:text-[#DEC067] transition-colors cursor-pointer flex items-center gap-1"
                  title="Switch camera"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Flip</span>
                </button>
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="hover:text-[#DEC067] transition-colors cursor-pointer flex items-center gap-1"
                  title="Snap photo with camera"
                >
                  <Camera className="h-3.5 w-3.5" />
                  <span>Snap Photo</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="hover:text-[#DEC067] transition-colors cursor-pointer flex items-center gap-1 ml-1"
                  title="Upload QR photo"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Upload</span>
                </button>
                <button
                  type="button"
                  onClick={() => startCamera()}
                  className="hover:text-[#DEC067] transition-colors cursor-pointer flex items-center gap-1 ml-1"
                  title="Restart stream"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Direct Mobile Native Camera Trigger (Works even on HTTP without SSL restrictions) */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* File Picker Input for Photo / Image Upload from Gallery */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Error Notification Alert */}
        {errorMessage && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 animate-in fade-in"
          >
            <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <strong className="font-semibold block mb-0.5">
                Verification Failed:
              </strong>
              {errorMessage}
            </div>
          </div>
        )}

        {/* Manual Passcode or Credential Entry Form */}
        <form onSubmit={handleManualSubmit} className="space-y-3 pt-1">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="scan-passcode-input"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700"
              >
                Manual Participant ID / Code
              </label>
              <span className="text-[11px] text-slate-400">
                Or type code directly
              </span>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="scan-passcode-input"
                  ref={inputRef}
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="e.g. UID-00001, STAFF-001, JCC100001…"
                  className="font-mono text-xs uppercase"
                  disabled={isResolving}
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={!passcode.trim() || isResolving}
                className="rounded-xl bg-[#C9A227] hover:bg-[#B8901E] text-white shrink-0 font-semibold"
              >
                {isResolving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span>Verify</span>
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default ScanDialog;

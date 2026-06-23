import React, { useState, useRef, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import jsQR from "jsqr";
import { validateCoupon } from "../../services/couponService";
import {
    QrCode,
    Camera,
    CheckCircle,
    XCircle,
    AlertCircle,
    Loader2,
    Keyboard,
    RefreshCw,
    StopCircle,
    X
} from "lucide-react";

// Toast notification component
const Toast = ({ type, title, message, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const colors = {
        success: "bg-green-500",
        error: "bg-red-500",
        warning: "bg-yellow-500",
    };

    return (
        <div className={`fixed top-4 right-4 z-[100] max-w-sm w-full ${colors[type]} text-white rounded-xl shadow-2xl animate-in slide-in-from-top-4 duration-300`}>
            <div className="p-4">
                <div className="flex items-start gap-3">
                    <div className="shrink-0">
                        {type === "success" && <CheckCircle className="h-6 w-6" />}
                        {type === "error" && <XCircle className="h-6 w-6" />}
                        {type === "warning" && <AlertCircle className="h-6 w-6" />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold">{title}</p>
                        <p className="text-sm opacity-90 mt-0.5">{message}</p>
                    </div>
                    <button onClick={onClose} className="shrink-0 p-1 hover:bg-white/20 rounded transition-colors">
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

const QRScanner = () => {
    const user = useSelector((state) => state.user.user);
    const brandId = user?.brand_id || user?.id;

    // Mode: 'select' | 'camera' | 'manual'
    const [mode, setMode] = useState("select");
    const [scanning, setScanning] = useState(false);
    const [manualCode, setManualCode] = useState("");
    const [validating, setValidating] = useState(false);
    const [toast, setToast] = useState(null);
    const [lastScannedCoupon, setLastScannedCoupon] = useState(null);
    const [cameraError, setCameraError] = useState(null);
    const [scanStatus, setScanStatus] = useState("Initializing camera...");

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const animationFrameRef = useRef(null);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);

    const showToast = useCallback((type, title, message) => {
        setToast({ type, title, message });
    }, []);

    const stopCamera = useCallback(() => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setScanning(false);
    }, []);

    const handleValidate = useCallback(async (token) => {
        if (!token || token.trim() === "") {
            showToast("error", "Invalid Code", "Please enter a valid coupon code");
            return;
        }

        setValidating(true);

        try {
            const response = await validateCoupon(token.trim(), brandId);

            // Success! Show toast and store coupon details
            setLastScannedCoupon(response.coupon);
            showToast(
                "success",
                "Coupon Validated!",
                `${response.coupon?.reward_title || "Reward"} has been redeemed successfully`
            );
            setManualCode("");

            // If in camera mode, stop and go back to select
            if (mode === "camera") {
                stopCamera();
            }

        } catch (err) {
            showToast(
                "error",
                "Validation Failed",
                err.message || "Could not validate coupon"
            );

            // If scanning, restart after error
            if (mode === "camera" && !scanning) {
                setTimeout(() => startCamera(), 1000);
            }
        } finally {
            setValidating(false);
        }
    }, [brandId, mode, scanning, showToast, stopCamera]);

    const startCamera = useCallback(async () => {
        setCameraError(null);
        setScanStatus("Initializing camera...");

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "environment",
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });

            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
                setScanning(true);
                setScanStatus("Point camera at QR code...");
            }
        } catch (err) {
            console.error("Camera error:", err);
            setCameraError(
                err.name === "NotAllowedError"
                    ? "Camera permission denied. Please allow camera access or use manual entry."
                    : "Could not access camera. Please use manual entry instead."
            );
        }
    }, []);

    // QR scanning loop
    useEffect(() => {
        if (!scanning || !videoRef.current || !canvasRef.current) return;

        const scanFrame = () => {
            if (!videoRef.current || !canvasRef.current || !scanning) return;

            const video = videoRef.current;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d", { willReadFrequently: true });

            if (video.readyState === video.HAVE_ENOUGH_DATA) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height, {
                    inversionAttempts: "dontInvert",
                });

                if (code && !validating) {
                    console.log("QR Code detected:", code.data);
                    setScanStatus("QR Code detected! Validating...");
                    stopCamera();
                    handleValidate(code.data);
                    return;
                }
            }

            animationFrameRef.current = requestAnimationFrame(scanFrame);
        };

        animationFrameRef.current = requestAnimationFrame(scanFrame);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [scanning, validating, stopCamera, handleValidate]);

    const handleManualSubmit = (e) => {
        e.preventDefault();
        handleValidate(manualCode);
    };

    const resetToSelect = () => {
        stopCamera();
        setMode("select");
        setManualCode("");
        setCameraError(null);
        setLastScannedCoupon(null);
        setScanStatus("Initializing camera...");
    };

    // Selection Mode
    if (mode === "select") {
        return (
            <div className="max-w-xl mx-auto">
                {/* Toast */}
                {toast && (
                    <Toast
                        type={toast.type}
                        title={toast.title}
                        message={toast.message}
                        onClose={() => setToast(null)}
                    />
                )}

                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--primary)]/10 rounded-full mb-4">
                        <QrCode className="h-8 w-8 text-[var(--primary)]" />
                    </div>
                    <h2 className="text-2xl font-bold text-[var(--foreground)]">Validate Coupon</h2>
                    <p className="text-[var(--muted-foreground)] mt-2">
                        Choose how you want to validate the customer's coupon
                    </p>
                </div>

                {/* Last scanned coupon success card */}
                {lastScannedCoupon && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                            <div>
                                <p className="font-semibold text-green-800">Last Validated</p>
                                <p className="text-green-600 text-sm">{lastScannedCoupon.reward_title}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Camera Option */}
                    <button
                        onClick={() => {
                            setMode("camera");
                            setTimeout(() => startCamera(), 100);
                        }}
                        className="group p-6 bg-[var(--card)] border-2 border-[var(--border)] rounded-xl hover:border-[var(--primary)] hover:shadow-lg transition-all text-left"
                    >
                        <div className="flex items-center gap-4 mb-3">
                            <div className="p-3 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                                <Camera className="h-6 w-6 text-blue-500" />
                            </div>
                            <h3 className="font-semibold text-lg">Scan QR Code</h3>
                        </div>
                        <p className="text-sm text-[var(--muted-foreground)]">
                            Use your camera to scan the customer's QR code
                        </p>
                    </button>

                    {/* Manual Entry Option */}
                    <button
                        onClick={() => setMode("manual")}
                        className="group p-6 bg-[var(--card)] border-2 border-[var(--border)] rounded-xl hover:border-[var(--primary)] hover:shadow-lg transition-all text-left"
                    >
                        <div className="flex items-center gap-4 mb-3">
                            <div className="p-3 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
                                <Keyboard className="h-6 w-6 text-green-500" />
                            </div>
                            <h3 className="font-semibold text-lg">Enter Code Manually</h3>
                        </div>
                        <p className="text-sm text-[var(--muted-foreground)]">
                            Type in the coupon code from the customer
                        </p>
                    </button>
                </div>
            </div>
        );
    }

    // Camera Mode
    if (mode === "camera") {
        return (
            <div className="max-w-xl mx-auto">
                {/* Toast */}
                {toast && (
                    <Toast
                        type={toast.type}
                        title={toast.title}
                        message={toast.message}
                        onClose={() => setToast(null)}
                    />
                )}

                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Scan QR Code</h2>
                    <button
                        onClick={resetToSelect}
                        className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] flex items-center gap-1"
                    >
                        ← Back
                    </button>
                </div>

                {/* Camera View */}
                <div className="relative bg-black rounded-xl overflow-hidden aspect-video mb-4">
                    {cameraError ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                            <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
                            <p className="text-white mb-4">{cameraError}</p>
                            <button
                                onClick={() => setMode("manual")}
                                className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg"
                            >
                                Use Manual Entry
                            </button>
                        </div>
                    ) : (
                        <>
                            <video
                                ref={videoRef}
                                className="w-full h-full object-cover"
                                playsInline
                                muted
                            />
                            {/* Scanning overlay */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-48 h-48 border-2 border-white/50 rounded-xl relative">
                                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-green-400 rounded-tl-lg" />
                                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-green-400 rounded-tr-lg" />
                                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-green-400 rounded-bl-lg" />
                                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-green-400 rounded-br-lg" />
                                    <div className="absolute inset-x-2 h-0.5 bg-green-400 animate-pulse top-1/2" />
                                </div>
                            </div>
                            {scanning && !validating && (
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 px-4 py-2 rounded-full text-white text-sm flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    {scanStatus}
                                </div>
                            )}
                            {validating && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <div className="bg-white rounded-xl p-6 flex flex-col items-center gap-3">
                                        <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
                                        <p className="font-medium">Validating coupon...</p>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                    <canvas ref={canvasRef} className="hidden" />
                </div>

                {/* Camera controls */}
                <div className="flex gap-3">
                    {scanning ? (
                        <button
                            onClick={stopCamera}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                            <StopCircle className="h-5 w-5" />
                            Stop Camera
                        </button>
                    ) : (
                        <button
                            onClick={startCamera}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary)]/90 transition-colors"
                        >
                            <RefreshCw className="h-5 w-5" />
                            Start Camera
                        </button>
                    )}
                    <button
                        onClick={() => {
                            stopCamera();
                            setMode("manual");
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[var(--secondary)] text-[var(--foreground)] rounded-lg hover:bg-[var(--secondary)]/80 transition-colors"
                    >
                        <Keyboard className="h-5 w-5" />
                        Enter Manually
                    </button>
                </div>

                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                    <strong>Tip:</strong> Hold the QR code steady within the green corners. Works with screens and printed codes.
                </div>
            </div>
        );
    }

    // Manual Entry Mode
    return (
        <div className="max-w-xl mx-auto">
            {/* Toast */}
            {toast && (
                <Toast
                    type={toast.type}
                    title={toast.title}
                    message={toast.message}
                    onClose={() => setToast(null)}
                />
            )}

            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Enter Coupon Code</h2>
                <button
                    onClick={resetToSelect}
                    className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] flex items-center gap-1"
                >
                    ← Back
                </button>
            </div>

            {/* Manual Entry Form */}
            <form onSubmit={handleManualSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-2 text-[var(--foreground)]">
                        Coupon Code
                    </label>
                    <input
                        type="text"
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value)}
                        placeholder="Enter the 32-character code..."
                        className="w-full px-4 py-3 bg-[var(--card)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent font-mono text-lg tracking-wider"
                        disabled={validating}
                        autoFocus
                    />
                    <p className="text-xs text-[var(--muted-foreground)] mt-2">
                        The code is shown below the QR code on the customer's coupon
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={validating || !manualCode.trim()}
                    className="w-full py-3 bg-[var(--primary)] text-white rounded-lg font-medium hover:bg-[var(--primary)]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {validating ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Validating...
                        </>
                    ) : (
                        <>
                            <CheckCircle className="h-5 w-5" />
                            Validate Coupon
                        </>
                    )}
                </button>
            </form>

            {/* Last validated coupon */}
            {lastScannedCoupon && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-center gap-3">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                        <div>
                            <p className="font-semibold text-green-800">Last Validated</p>
                            <p className="text-green-600 text-sm">{lastScannedCoupon.reward_title} - User #{lastScannedCoupon.user_id}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-6 p-4 bg-[var(--secondary)]/50 rounded-lg">
                <h4 className="font-semibold mb-2">Where to find the code?</h4>
                <p className="text-sm text-[var(--muted-foreground)]">
                    Ask the customer to show their coupon from "My Coupons" tab. They can copy the code for you.
                </p>
            </div>
        </div>
    );
};

export default QRScanner;

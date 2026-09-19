import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, Check, AlertCircle } from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoCaptured: (base64Image: string) => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onPhotoCaptured
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedData, setCapturedData] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setCapturedData(null);
      setErrorMsg(null);
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setErrorMsg(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.warn('Camera access issue:', err);
      setErrorMsg('Camera access was not granted or is unavailable on this device. You can choose a photo from your computer or tablet instead.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedData(dataUrl);
    stopCamera();
  };

  const retakePhoto = () => {
    setCapturedData(null);
    startCamera();
  };

  const confirmPhoto = () => {
    if (capturedData) {
      onPhotoCaptured(capturedData);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="camera-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
    >
      <div className="bg-[#FBF9F5] border-2 border-[#1E3A34] rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#D6CEC2] bg-[#EFEEEA]">
          <div className="flex items-center gap-2">
            <Camera className="w-6 h-6 text-[#1E3A34]" />
            <h2 id="camera-modal-title" className="font-serif text-xl font-bold text-[#1E3A34]">
              Take Photo with Camera
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close camera window"
            className="w-10 h-10 rounded-full hover:bg-black/5 flex items-center justify-center text-[#1B1C1A] cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Viewfinder or Preview */}
        <div className="p-6 flex flex-col items-center justify-center min-h-[340px] bg-black relative">
          {errorMsg ? (
            <div className="text-white text-center p-6 max-w-md">
              <AlertCircle className="w-12 h-12 text-[#C05621] mx-auto mb-3" />
              <p className="text-[17px] font-semibold">{errorMsg}</p>
            </div>
          ) : capturedData ? (
            <img
              src={capturedData}
              alt="Captured document snapshot"
              className="max-h-[380px] w-auto object-contain rounded-lg border-2 border-white/20"
            />
          ) : (
            <div className="relative w-full h-[360px] flex items-center justify-center overflow-hidden rounded-lg">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {/* Overlay guides for centering paper */}
              <div className="absolute inset-6 border-2 border-dashed border-white/60 rounded-lg pointer-events-none flex items-center justify-center">
                <span className="bg-black/50 text-white px-3 py-1.5 rounded-md text-sm font-medium">
                  Center the letter inside this box
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-5 bg-[#F5F3EF] border-t border-[#D6CEC2] flex items-center justify-between gap-4">
          {capturedData ? (
            <>
              <button
                type="button"
                onClick={retakePhoto}
                className="min-h-[52px] px-5 py-2.5 rounded-lg border-2 border-[#1E3A34] text-[#1E3A34] font-bold text-[16px] hover:bg-white flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Retake Photo</span>
              </button>
              <button
                type="button"
                onClick={confirmPhoto}
                className="min-h-[52px] px-6 py-2.5 rounded-lg bg-[#1E3A34] text-white font-bold text-[16px] hover:bg-[#142723] flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Check className="w-5 h-5" />
                <span>Use This Letter</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                className="min-h-[52px] px-5 py-2.5 rounded-lg border border-[#D6CEC2] text-[#414846] font-semibold text-[16px] hover:bg-white cursor-pointer"
              >
                Cancel
              </button>
              {!errorMsg && (
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="min-h-[52px] px-7 py-2.5 rounded-lg bg-[#1E3A34] text-white font-bold text-[17px] hover:bg-[#142723] flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Camera className="w-5 h-5" />
                  <span>Snap Photo Now</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

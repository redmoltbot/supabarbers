"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (code: string) => void;
}

export default function BarcodeScanner({
  isOpen,
  onClose,
  onScanSuccess,
}: BarcodeScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string>("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const startScanner = async () => {
      try {
        const scanner = new Html5Qrcode("qr-code-reader");
        scannerRef.current = scanner;

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 150 },
          aspectRatio: 1.0,
          formatsToSupport: ["code_128", "code_39"],
        };

        await scanner.start(
          { facingMode: "environment" },
          config,
          (decodedText: string) => {
            // Success callback
            if (decodedText) {
              stopAndClose(decodedText);
            }
          },
          () => {
            // No code detected - ignore frame errors
          }
        );

        // Set timeout for 30 seconds
        timeoutRef.current = setTimeout(() => {
          setError("Couldn't detect barcode. Try again or type manually.");
          setTimeout(() => stopAndClose(""), 2000);
        }, 30000);

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        if (errorMessage.includes("Permission")) {
          setError("Camera access needed for scanning");
        } else if (errorMessage.includes("not found")) {
          setError("No camera found on this device");
        } else {
          setError("Could not access camera");
        }
      }
    };

    const stopAndClose = async (code: string) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (scannerRef.current?.isScanning) {
        try {
          await scannerRef.current.stop();
        } catch {
          // Ignore stop errors
        }
      }
      if (code) {
        onScanSuccess(code);
      }
      onClose();
    };

    startScanner();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [isOpen, onClose, onScanSuccess]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div id="qr-code-reader" className="flex-1" />

      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-4xl p-4 active:opacity-70"
        aria-label="Close scanner"
      >
        ×
      </button>

      {error && (
        <div className="absolute bottom-24 left-4 right-4 bg-red-500 text-white p-4 rounded-lg text-center">
          {error}
        </div>
      )}

      <button
        onClick={onClose}
        className="bg-white text-gray-900 py-4 text-xl font-bold active:scale-95 transition-transform"
      >
        Cancel
      </button>
    </div>
  );
}

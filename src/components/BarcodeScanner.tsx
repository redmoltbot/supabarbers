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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Scanner container */}
      <div id="qr-code-reader" className="flex-1" />

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-4xl p-4"
        aria-label="Close scanner"
      >
        ×
      </button>

      {/* Error message */}
      {error && (
        <div className="absolute bottom-24 left-4 right-4 bg-red-500 text-white p-4 rounded-lg text-center">
          {error}
        </div>
      )}

      {/* Cancel button */}
      <button
        onClick={onClose}
        className="bg-white text-gray-900 py-4 text-xl font-bold"
      >
        Cancel
      </button>
    </div>
  );
}

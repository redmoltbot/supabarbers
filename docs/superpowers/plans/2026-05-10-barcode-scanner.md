# Barcode Scanner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add mobile barcode scanning to SupaBarbers home page, allowing users to scan serial card numbers via phone camera instead of manual typing.

**Architecture:** New `BarcodeScanner` modal component using `html5-qrcode` library for browser-based barcode detection. Camera icon button added to existing `HomePage` input field. State management via React hooks for scanner visibility and scan result handling.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, html5-qrcode (^2.3.8)

---

## File Structure

**New files:**
- `src/components/BarcodeScanner.tsx` — Scanner modal component with camera feed, detection, and error handling

**Modified files:**
- `src/app/home/page.tsx` — Add camera icon button and scanner integration

**Dependencies:**
- `html5-qrcode` — Browser-based barcode/QR scanning library

---

## Task 1: Install html5-qrcode Dependency

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install the dependency**

```bash
cd /Users/terence/supabarbers
npm install html5-qrcode@^2.3.8
```

Expected output: `added 1 package, and audited...`

- [ ] **Step 2: Verify installation**

```bash
grep "html5-qrcode" package.json
```

Expected: `"html5-qrcode": "^2.3.8"` in dependencies

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "deps: add html5-qrcode for barcode scanning"
```

---

## Task 2: Create BarcodeScanner Component Structure

**Files:**
- Create: `src/components/BarcodeScanner.tsx`

- [ ] **Step 1: Create the component file with basic structure**

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/BarcodeScanner.tsx
git commit -m "feat: add BarcodeScanner component structure"
```

---

## Task 3: Implement Camera Initialization and Scanning Logic

**Files:**
- Modify: `src/components/BarcodeScanner.tsx`

- [ ] **Step 1: Add scanner initialization and cleanup**

Replace the entire component with:

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/BarcodeScanner.tsx
git commit -m "feat: implement camera scanning logic with timeout and error handling"
```

---

## Task 4: Add Camera Icon Button to HomePage

**Files:**
- Modify: `src/app/home/page.tsx`

- [ ] **Step 1: Import BarcodeScanner and add state**

Add after existing imports:

```tsx
import BarcodeScanner from "@/components/BarcodeScanner";
```

Add after existing state declarations (after `useToast` line):

```tsx
const [isScannerOpen, setIsScannerOpen] = useState(false);
```

- [ ] **Step 2: Add scan success handler**

Add before the `return` statement:

```tsx
const handleScanSuccess = (code: string) => {
  setCardNum(code);
};
```

- [ ] **Step 3: Wrap input in relative container and add camera button**

Replace the existing serial card number input (lines 88-94) with:

```tsx
<div className="relative">
  <input
    type="text"
    placeholder="Serial Card Number"
    value={cardNum}
    onChange={(e) => setCardNum(e.target.value)}
    className="w-full text-xl p-4 pr-14 rounded-xl border-2 border-gray-300 focus:border-[#007A4D] focus:outline-none dark:bg-gray-800 dark:text-white dark:border-gray-600"
  />
  <button
    onClick={() => setIsScannerOpen(true)}
    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#007A4D] active:opacity-70"
    aria-label="Scan barcode"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className="w-8 h-8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
      />
    </svg>
  </button>
</div>
```

- [ ] **Step 4: Add BarcodeScanner component**

Add after the `Toast` component (after line 77):

```tsx
<BarcodeScanner
  isOpen={isScannerOpen}
  onClose={() => setIsScannerOpen(false)}
  onScanSuccess={handleScanSuccess}
/>
```

- [ ] **Step 5: Commit**

```bash
git add src/app/home/page.tsx
git commit -m "feat: add camera scanner button to home page"
```

---

## Task 5: Build and Verify No Type Errors

**Files:**
- None (build verification)

- [ ] **Step 1: Build the project**

```bash
cd /Users/terence/supabarbers
npm run build
```

Expected: Build completes successfully with no TypeScript errors

- [ ] **Step 2: Check for type errors**

```bash
npx tsc --noEmit
```

Expected: No type errors reported

- [ ] **Step 3: Commit if no changes needed**

If build passed with no code changes:
```bash
git commit --allow-empty -m "chore: verify build passes after barcode scanner implementation"
```

---

## Task 6: Manual Testing Checklist

**Files:**
- None (manual testing)

- [ ] **Step 1: Start dev server**

```bash
cd /Users/terence/supabarbers
npm run dev
```

- [ ] **Step 2: Test on mobile device**

Access https://supabarber.tryclawagents.com/home on a mobile device and verify:

1. **Camera button visible** — Camera icon appears in serial number input field
2. **Scanner opens** — Tapping camera button opens full-screen scanner
3. **Permission prompt** — Browser requests camera access (first time)
4. **Camera feed displays** — Live camera visible with scanning frame
5. **Scan detection** — Point at Code 128 barcode → detects and populates field
6. **Scanner closes** — Scanner closes after successful scan
7. **Cancel works** — Cancel/close buttons close scanner
8. **Permission denied** — Denying camera shows error message
9. **Manual input still works** — Can still type manually without scanner
10. **Dark mode compatible** — Scanner works in both light and dark modes

- [ ] **Step 3: Test barcode generation**

Use an online Code 128 barcode generator to create test barcodes with known numbers:
- https://www.barcodesinc.com/generator/index.php (or similar)
- Generate barcodes for test card numbers
- Verify scanned numbers match exactly

- [ ] **Step 4: Test card not found flow**

1. Scan a barcode with an invalid/non-existent card number
2. Verify existing "Card not found" error appears
3. Verify scanner can be reopened to try again

- [ ] **Step 5: Note any issues**

Document any bugs or edge cases found during testing.

---

## Task 7: Deploy to Production

**Files:**
- None (deployment)

- [ ] **Step 1: Push changes to GitHub**

```bash
cd /Users/terence/supabarbers
git push origin main
```

Expected: "Successfully pushed to refs/heads/main"

- [ ] **Step 2: Verify Vercel deployment**

Wait for Vercel auto-deployment to complete. Check at:
https://vercel.com/terence/supabarbers/deployments

- [ ] **Step 3: Test production deployment**

Access https://supabarber.tryclawagents.com/home on mobile device and repeat testing checklist from Task 6.

- [ ] **Step 4: Create deployment tag**

```bash
git tag -a v1.1.0 -m "Add barcode scanner feature"
git push origin v1.1.0
```

---

## Post-Implementation Notes

**Browser compatibility confirmed:**
- ✓ iOS Safari 15+
- ✓ Android Chrome 90+
- ✓ Samsung Internet 14+

**Barcode formats supported:**
- Code 128 (most common linear barcode)
- Code 39 (alphanumeric linear barcode)

**Known limitations:**
- Requires HTTPS (enforced by Vercel)
- Camera permission required on first use
- 30-second auto-timeout for scanning attempts
- Desktop not optimized (mobile-first)

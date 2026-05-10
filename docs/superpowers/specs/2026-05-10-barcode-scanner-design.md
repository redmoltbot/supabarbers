# Barcode Scanner for SupaBarbers Home Page

**Date:** 2026-05-10
**Status:** Approved Design

## Overview

Add mobile barcode scanning capability to the SupaBarbers home page, allowing users to scan serial card numbers using their phone camera instead of manual typing.

## Problem

Users currently type serial card numbers manually into a text input field on the home page. This is slow and error-prone on mobile devices.

## Solution

Add a browser-based barcode scanner using `html5-qrcode` library, triggered by a camera icon button next to the serial number input field.

---

## Architecture

### New Component: `BarcodeScanner`

**Location:** `src/components/BarcodeScanner.tsx`

A modal overlay component that:
- Opens on camera button click
- Streams camera feed using `html5-qrcode`
- Detects Code 128 / Code 39 linear barcodes
- Returns detected number to parent and closes
- Handles camera permissions, errors, and close actions

### Modified Component: `HomePage`

**Location:** `src/app/home/page.tsx`

Add a camera icon button next to the "Serial Card Number" input field that opens the scanner.

### New Dependency

**Package:** `html5-qrcode`
- Version: Latest (^2.x)
- Size: ~50KB
- Purpose: Web-based barcode/QR scanning using MediaDevices API

---

## User Flow

1. User taps the **camera icon** next to "Serial Card Number" field
2. **Permission prompt** appears (first time only): "Allow SupaBarbers to use your camera?"
3. Scanner overlay opens with **live camera feed** and a scanning frame
4. User points camera at barcode → **auto-detects** and beeps/vibrates
5. Scanner closes, **serial number populates** the input field automatically
6. User proceeds with Redeem/Top Up action
7. If card not found → error toast appears, scanner can be reopened for retry

**Manual input remains available** — users can skip scanner and type directly.

---

## Technical Implementation

### Camera Button

- Positioned absolutely inside the input field (right side)
- Touch-friendly 44×44px tap target
- Uses existing South Africa green `#007A4D` color
- Icon: SVG camera or heroicon

### Scanner Modal

- Full-screen overlay on mobile
- Camera viewfinder with scanning frame guide
- Close button (top-right) and "Cancel" button (bottom)
- Real-time detection feedback (flash/beep on success)

### html5-qrcode Configuration

```javascript
{
  formatsToSupport: ["code_128", "code_39"],
  fps: 10,
  qrbox: { width: 250, height: 150 },
  aspectRatio: 1.0
}
```

### State Management

- `isScannerOpen` (boolean) — controls modal visibility
- `onScanSuccess` (callback) — populates `cardNum` state with detected value

---

## Error Handling

| Scenario | Response |
|----------|----------|
| Camera permission denied | Toast: "Camera access needed for scanning" |
| No camera detected | Toast: "No camera found" + disable button |
| Scanning timeout (30s) | Auto-close + "Couldn't detect barcode" toast |
| Card not found (API error) | Existing API error handling + scanner available for retry |
| Multiple barcodes in frame | Auto-select first valid detection |

---

## Testing

### Testing Matrix
- iOS Safari (iPhone)
- Android Chrome
- Samsung Internet
- Mobile Firefox (backup)

### Test Scenarios
1. Grant camera permission → scan works
2. Deny camera permission → fallback to manual input
3. Scan Code 128 barcode → populates correctly
4. Scan Code 39 barcode → populates correctly
5. QR code present → ignore gracefully
6. Card not found error → scanner can be reopened
7. Dark mode compatibility
8. Portrait and landscape orientations

### Manual Testing Approach
- Use online barcode generators to create test codes
- Test on real devices (not desktop DevTools emulation)

---

## Barcode Format

**Type:** Linear barcode (Code 128 or Code 39)
**Content:** Numbers only (serial card number)

---

## Platform Scope

**Primary:** Mobile browsers (iOS Safari, Android Chrome)
**Optimization:** Touch-first interaction
**Not in scope:** Desktop webcam support

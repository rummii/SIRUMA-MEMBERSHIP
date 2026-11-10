"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type QrScannerProps = {
  onResult: (text: string) => void;
};

export function QrScanner({ onResult }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const readerRef = useRef<{ reset: () => void } | null>(null);
  const [active, setActive] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function stop() {
    try {
      readerRef.current?.reset();
    } catch {
      // Ignore teardown errors.
    }
    readerRef.current = null;
    setActive(false);
  }

  useEffect(() => stop, []);

  async function start() {
    setError(null);
    setStarting(true);
    try {
      const { BrowserQRCodeReader } = await import("@zxing/library");
      const reader = new BrowserQRCodeReader();
      readerRef.current = reader;
      setActive(true);
      await reader.decodeFromVideoDevice(
        null,
        videoRef.current as HTMLVideoElement,
        (result) => {
          if (result) {
            onResult(result.getText());
            stop();
          }
        },
      );
    } catch (err) {
      console.error(err);
      setError(
        "Camera unavailable. Grant camera permission or paste the QR contents below.",
      );
      stop();
    } finally {
      setStarting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <Camera className="h-4 w-4" />
          Scan member QR
        </div>
        {active ? (
          <Button type="button" size="sm" variant="outline" onClick={stop}>
            <CameraOff className="h-4 w-4" />
            Stop camera
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={start}
            disabled={starting}
          >
            {starting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
            Start camera
          </Button>
        )}
      </div>

      <div className="mt-3 overflow-hidden rounded-xl bg-slate-900">
        <video
          ref={videoRef}
          className="h-44 w-full object-cover"
          muted
          playsInline
        />
      </div>

      {error ? (
        <p className="mt-2 text-xs text-rose-600">{error}</p>
      ) : (
        <p className="mt-2 text-xs text-slate-500">
          Point the card&apos;s QR code at the camera. If no camera is available,
          enter the member number below.
        </p>
      )}
    </div>
  );
}

import { X } from 'lucide-react'

import QrScanner from 'qr-scanner'

import { useEffect, useRef, useState } from 'react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { API_PATHS, ApiError, apiJson } from '#/lib/config'

type ScanQrDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ScanQrDialog({ open, onOpenChange }: ScanQrDialogProps) {
  const [qrToken, setQrToken] = useState('')
  const [scanState, setScanState] = useState<
    'idle' | 'starting' | 'scanning' | 'submitting' | 'success' | 'error'
  >('idle')
  const [scanError, setScanError] = useState<string | null>(null)
  const [cameraAvailable, setCameraAvailable] = useState(true)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const scannerRef = useRef<QrScanner | null>(null)
  const isDetectedRef = useRef(false)

  async function submitQrToken(token: string) {
    const normalizedToken = token.trim()
    if (!normalizedToken) {
      setScanError('QR token tidak boleh kosong')
      setScanState('error')
      return
    }
    setScanError(null)
    setScanState('submitting')
    try {
      await apiJson<{ ok: boolean; status: 'approved' }>(API_PATHS.qr.scan, {
        method: 'POST',
        body: JSON.stringify({ qrToken: normalizedToken }),
      })
      setScanState('success')
    } catch (err) {
      setScanState('error')
      setScanError(err instanceof ApiError ? err.message : 'Gagal scan QR')
    }
  }

  async function startCameraScan() {
    if (!open || !videoRef.current) return
    setScanState('starting')
    setScanError(null)
    isDetectedRef.current = false
    try {
      if (scannerRef.current) {
        scannerRef.current.stop()
        scannerRef.current.destroy()
        scannerRef.current = null
      }

      if (typeof window !== 'undefined' && !window.isSecureContext) {
        setScanState('error')
        setScanError('Kamera hanya bisa diakses di HTTPS atau localhost')
        return
      }

      const hasCamera = await QrScanner.hasCamera()
      if (!hasCamera) {
        setCameraAvailable(false)
        setScanState('idle')
        return
      }
      setCameraAvailable(true)

      // On some mobile browsers, camera init can race with dialog animation.
      // Give the video element a moment to be fully visible before starting.
      await new Promise<void>((resolve) => {
        window.setTimeout(() => resolve(), 250)
      })

      scannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          if (isDetectedRef.current) return
          const value = result.data.trim()
          if (!value) return
          isDetectedRef.current = true
          setQrToken(value)
          void submitQrToken(value)
        },
        {
          // Avoid calling listCameras() before start; it can create a temporary stream.
          preferredCamera: 'environment',
          highlightScanRegion: false,
          highlightCodeOutline: false,
          returnDetailedScanResult: true,
        }
      )
      await scannerRef.current.start()
      setScanState('scanning')
    } catch (error) {
      setScanState('error')
      setScanError(
        error instanceof Error && error.message
          ? `Gagal membuka kamera: ${error.message}`
          : 'Akses kamera ditolak atau tidak tersedia',
      )
    }
  }

  useEffect(() => {
    if (!open) return
    void startCameraScan()
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop()
        scannerRef.current.destroy()
        scannerRef.current = null
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
    }
  }, [open])

  function resetState() {
    setQrToken('')
    setScanError(null)
    setScanState('idle')
    isDetectedRef.current = false
  }

  function closeDialog() {
    resetState()
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) {
          onOpenChange(true)
          return
        }
        closeDialog()
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="max-w-md rounded-2xl border border-border bg-card p-5"
      >
        <DialogHeader className="mb-4 flex-row items-start justify-between gap-3">
          <div>
            <DialogTitle className="text-sm font-black tracking-wider uppercase">
              Scan QR Login
            </DialogTitle>
            <DialogDescription className="mt-1 text-xs">
              Menyetujui login web dari device lain.
            </DialogDescription>
          </div>
          <button
            type="button"
            onClick={closeDialog}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Tutup modal scan QR"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>

        <div className="space-y-3">
          <div className="overflow-hidden rounded-xl border border-border bg-black">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="h-56 w-full object-cover"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {scanState === 'starting' && 'Menyalakan kamera...'}
            {scanState === 'scanning' && 'Arahkan kamera ke QR code.'}
            {scanState === 'submitting' && 'Memverifikasi QR...'}
            {scanState === 'success' && 'QR berhasil disetujui.'}
            {scanState === 'error' && (scanError ?? 'Gagal memproses QR')}
            {scanState === 'idle' && cameraAvailable
              ? 'Scanner siap digunakan.'
              : null}
            {scanState === 'idle' && !cameraAvailable
              ? 'Browser tidak mendukung scan kamera. Gunakan input token manual.'
              : null}
          </p>
        </div>

        <div className="mt-4 space-y-2">
          <label
            htmlFor="qr-token-manual"
            className="text-[10px] font-black tracking-widest text-muted-foreground uppercase"
          >
            Fallback token manual
          </label>
          <input
            id="qr-token-manual"
            value={qrToken}
            onChange={(ev) => setQrToken(ev.target.value)}
            placeholder="Paste qrToken jika diperlukan"
            className="w-full rounded-xl border border-border bg-muted px-3 py-2 text-sm focus:border-[#d4ff3f] focus:ring-1 focus:ring-[#d4ff3f] focus:outline-none"
          />
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={() => void submitQrToken(qrToken)}
            disabled={scanState === 'submitting' || scanState === 'success'}
            className="flex-1 rounded-xl bg-[#d4ff3f] py-2 text-xs font-black tracking-wider text-black uppercase transition-colors hover:bg-[#e5ff80] disabled:opacity-60"
          >
            {scanState === 'submitting' ? 'Memproses...' : 'Approve Login'}
          </button>
          <button
            type="button"
            onClick={() => void startCameraScan()}
            disabled={scanState === 'starting' || scanState === 'submitting'}
            className="rounded-xl border border-border px-4 py-2 text-xs font-black tracking-wider uppercase transition-colors hover:bg-muted disabled:opacity-60"
          >
            Coba lagi
          </button>
          <button
            type="button"
            onClick={closeDialog}
            className="rounded-xl border border-border px-4 py-2 text-xs font-black tracking-wider uppercase transition-colors hover:bg-muted"
          >
            Tutup
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

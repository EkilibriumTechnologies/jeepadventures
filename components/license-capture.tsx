"use client"

import { useRef, useState, useCallback } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Camera, RotateCcw, Check, X, Upload } from "lucide-react"
import { supabaseClient } from "@/lib/supabase"

// Dynamic import to avoid SSR issues - react-webcam only works in browser
const Webcam = dynamic(
  () => import("react-webcam"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-black flex items-center justify-center text-white">
        Cargando cámara...
      </div>
    ),
  }
) as any

interface LicenseCaptureProps {
  onCapture: (imageUrl: string, imageFile: File) => void
  currentImageUrl?: string
}

export function LicenseCapture({ onCapture, currentImageUrl }: LicenseCaptureProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const webcamRef = useRef<any>(null)
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment")

  // Capture photo from webcam
  const capture = useCallback(() => {
    if (!webcamRef.current) return

    const imageSrc = webcamRef.current.getScreenshot()
    if (imageSrc) {
      setCapturedImage(imageSrc)
    }
  }, [webcamRef])

  // Reset to camera view
  const retake = () => {
    setCapturedImage(null)
  }

  // Convert base64 to File
  const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(",")
    const mime = arr[0].match(/:(.*?);/)?.[1] || "image/jpeg"
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    return new File([u8arr], filename, { type: mime })
  }

  // Handle confirm and upload
  const handleConfirm = async () => {
    if (!capturedImage) return

    setIsUploading(true)

    try {
      // Convert base64 to File
      const timestamp = Date.now()
      const filename = `license-${timestamp}.jpg`
      const imageFile = dataURLtoFile(capturedImage, filename)

      // Upload to Supabase Storage
      const fileExt = filename.split(".").pop()
      const filePath = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

      const { data: uploadData, error: uploadError } = await supabaseClient.storage
        .from("licenses")
        .upload(filePath, imageFile, {
          cacheControl: "3600",
          upsert: false,
        })

      if (uploadError) {
        console.error("Upload error:", uploadError)
        throw uploadError
      }

      // Get public URL
      const { data: urlData } = supabaseClient.storage
        .from("licenses")
        .getPublicUrl(filePath)

      const publicUrl = urlData.publicUrl

      // Call parent callback with URL and file
      onCapture(publicUrl, imageFile)

      // Close dialog and reset
      setIsOpen(false)
      setCapturedImage(null)
    } catch (error) {
      console.error("Error uploading license:", error)
      alert("Error al subir la imagen. Por favor intenta de nuevo.")
    } finally {
      setIsUploading(false)
    }
  }

  // Toggle camera (front/back)
  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"))
  }

  // Close dialog and reset
  const handleClose = () => {
    setIsOpen(false)
    setCapturedImage(null)
  }

  return (
    <>
      <div className="space-y-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsOpen(true)}
          className="w-full"
        >
          <Camera className="mr-2 h-4 w-4" />
          {currentImageUrl ? "Cambiar Foto" : "Escanear Licencia"}
        </Button>
        {currentImageUrl && (
          <div className="relative rounded-lg border overflow-hidden">
            <img
              src={currentImageUrl}
              alt="Licencia capturada"
              className="w-full h-48 object-contain bg-slate-50"
            />
          </div>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Capturar Foto de Licencia</DialogTitle>
            <DialogDescription>
              Coloca tu licencia de conducir frente a la cámara
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {!capturedImage ? (
              // Camera View
              <div className="space-y-4">
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{
                      facingMode: facingMode,
                      width: { ideal: 1280 },
                      height: { ideal: 720 },
                    }}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 border-4 border-white/20 rounded-lg pointer-events-none">
                    <div className="absolute inset-4 border-2 border-dashed border-white/40 rounded" />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={toggleCamera}
                    className="flex-1"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Cambiar Cámara
                  </Button>
                  <Button
                    type="button"
                    onClick={capture}
                    className="flex-1"
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Capturar Foto
                  </Button>
                </div>
              </div>
            ) : (
              // Preview View
              <div className="space-y-4">
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                  <img
                    src={capturedImage}
                    alt="Vista previa"
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={retake}
                    className="flex-1"
                    disabled={isUploading}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Volver a Tomar
                  </Button>
                  <Button
                    type="button"
                    onClick={handleConfirm}
                    className="flex-1"
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <Upload className="mr-2 h-4 w-4 animate-pulse" />
                        Subiendo...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Confirmar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}


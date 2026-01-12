"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock, Unlock, Camera, CheckCircle2, X, HelpCircle, Loader2, AlertCircle } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

interface PhotoState {
  file: File | null
  preview: string | null
  uploading?: boolean
  uploadError?: string | null
  uploadSuccess?: boolean
}

export default function ActiveRentalPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const bookingId = searchParams.get("bookingId") || ""
  
  const [isLocked, setIsLocked] = useState(true)
  const [unlockState, setUnlockState] = useState<'pending' | 'success' | 'failed' | null>(null)
  const [unlockError, setUnlockError] = useState<string | null>(null)
  const [networkError, setNetworkError] = useState<string | null>(null)
  
  // Booking data state (to check for license)
  const [booking, setBooking] = useState<{ guest_license_image_url?: string | null } | null>(null)
  const [loadingBooking, setLoadingBooking] = useState(true)
  
  // Photo upload state - track 4 required photos
  const [photos, setPhotos] = useState<{
    front: PhotoState
    back: PhotoState
    left: PhotoState
    right: PhotoState
  }>({
    front: { file: null, preview: null },
    back: { file: null, preview: null },
    left: { file: null, preview: null },
    right: { file: null, preview: null },
  })

  // Refs for file inputs
  const frontInputRef = useRef<HTMLInputElement>(null)
  const backInputRef = useRef<HTMLInputElement>(null)
  const leftInputRef = useRef<HTMLInputElement>(null)
  const rightInputRef = useRef<HTMLInputElement>(null)

  // Check if license is verified (from booking)
  const licenseVerified = booking?.guest_license_image_url !== null && booking?.guest_license_image_url !== undefined

  // Check if all 4 photos are uploaded
  const allPhotosUploaded = 
    photos.front.file !== null &&
    photos.back.file !== null &&
    photos.left.file !== null &&
    photos.right.file !== null

  // Check if all requirements are met (license verified + 4 vehicle photos)
  const allRequirementsMet = licenseVerified && allPhotosUploaded

  // Fetch booking data to check for license
  useEffect(() => {
    if (!bookingId) {
      setLoadingBooking(false)
      return
    }

    const fetchBooking = async () => {
      try {
        const response = await fetch(`/api/booking/${bookingId}`)
        const data = await response.json()

        if (!response.ok) {
          console.error('Error fetching booking:', data)
          setLoadingBooking(false)
          return
        }

        setBooking(data)
      } catch (error) {
        console.error('Error fetching booking:', error)
      } finally {
        setLoadingBooking(false)
      }
    }

    fetchBooking()
  }, [bookingId])

  // Handle photo upload with error handling
  const handlePhotoUpload = async (side: 'front' | 'back' | 'left' | 'right', file: File | null) => {
    if (!file) return

    // Set uploading state
    setPhotos((prev) => ({
      ...prev,
      [side]: {
        ...prev[side],
        uploading: true,
        uploadError: null,
        uploadSuccess: false,
      },
    }))

    // Check camera permission if using capture
    try {
      const reader = new FileReader()
      
      reader.onloadend = () => {
        // Simulate upload delay for UX
        setTimeout(() => {
          setPhotos((prev) => ({
            ...prev,
            [side]: {
              file,
              preview: reader.result as string,
              uploading: false,
              uploadError: null,
              uploadSuccess: true,
            },
          }))
          
          // Clear success message after 2 seconds
          setTimeout(() => {
            setPhotos((prev) => ({
              ...prev,
              [side]: {
                ...prev[side],
                uploadSuccess: false,
              },
            }))
          }, 2000)
        }, 500)
      }
      
      reader.onerror = () => {
        setPhotos((prev) => ({
          ...prev,
          [side]: {
            ...prev[side],
            uploading: false,
            uploadError: "Photo upload failed. Please try again.",
            uploadSuccess: false,
          },
        }))
      }
      
      reader.readAsDataURL(file)
    } catch (error) {
      setPhotos((prev) => ({
        ...prev,
        [side]: {
          ...prev[side],
          uploading: false,
          uploadError: "Photo upload failed. Please try again.",
          uploadSuccess: false,
        },
      }))
    }
  }

  // Handle file input change
  const handleFileChange = (side: 'front' | 'back' | 'left' | 'right', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (file) {
      handlePhotoUpload(side, file)
    }
  }


  // Handle photo selection (camera or gallery)
  const handlePhotoSelect = (side: 'front' | 'back' | 'left' | 'right') => {
    // Trigger file input - user can choose camera or gallery
    const inputRef = {
      front: frontInputRef,
      back: backInputRef,
      left: leftInputRef,
      right: rightInputRef,
    }[side]
    inputRef.current?.click()
  }

  // Remove photo
  const handleRemovePhoto = (side: 'front' | 'back' | 'left' | 'right') => {
    setPhotos((prev) => ({
      ...prev,
      [side]: { file: null, preview: null, uploading: false, uploadError: null, uploadSuccess: false },
    }))
    // Reset the file input
    const inputRef = {
      front: frontInputRef,
      back: backInputRef,
      left: leftInputRef,
      right: rightInputRef,
    }[side]
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const handleUnlock = async () => {
    if (!licenseVerified) {
      setUnlockError("Driver information is incomplete. Please contact support.")
      return
    }

    if (!allPhotosUploaded) {
      setUnlockError("All 4 photos are required before unlocking the Jeep.")
      return
    }

    // Set to pending state
    setUnlockState('pending')
    setUnlockError(null)
    setNetworkError(null)

    try {
      // Simulate unlock process (2-3 seconds delay)
      await new Promise(resolve => setTimeout(resolve, 2500))
      
      // Simulate potential failure (optional - uncomment to test failure state)
      // if (Math.random() > 0.8) {
      //   setUnlockState('failed')
      //   setUnlockError("We couldn't unlock the Jeep. Please try again.")
      //   return
      // }
      
      // Success - set state to success
      setUnlockState('success')
      setIsLocked(false)
      
      // Generate access token and send email
      try {
        const tokenResponse = await fetch(`/api/booking/${bookingId}/generate-access-token`, {
          method: 'POST',
        })
        
        if (tokenResponse.ok) {
          console.log('✅ Access token generated and email sent')
        } else {
          console.error('⚠️ Failed to generate access token:', await tokenResponse.json())
          // Don't fail the unlock if token generation fails
        }
      } catch (error) {
        console.error('⚠️ Error generating access token:', error)
        // Don't fail the unlock if token generation fails
      }
      
      // Remove alert for cleaner UX (or keep if needed)
      // alert("Conectando satélite... Auto Abierto 🔓")
    } catch (error) {
      setUnlockState('failed')
      setUnlockError("We couldn't unlock the Jeep. Please try again.")
    }
  }

  const handleLock = () => {
    alert("Auto Cerrado 🔒")
    setIsLocked(true)
  }

  const handleEndTrip = () => {
    if (bookingId) {
      router.push(`/trip/${bookingId}`)
    } else {
      router.push("/")
    }
  }

  // Photo upload slot component
  const PhotoUploadSlot = ({ 
    side, 
    label, 
    inputRef 
  }: { 
    side: 'front' | 'back' | 'left' | 'right'
    label: string
    inputRef: React.RefObject<HTMLInputElement>
  }) => {
    const photo = photos[side]
    const hasPhoto = photo.file !== null
    const isUploading = photo.uploading || false
    const uploadError = photo.uploadError
    const uploadSuccess = photo.uploadSuccess || false

    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <div className="relative">
          {hasPhoto ? (
            <div className="relative group">
              <img
                src={photo.preview!}
                alt={label}
                className="w-full h-32 object-cover rounded-lg border-2 border-green-500"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemovePhoto(side)}
                  className="h-8"
                >
                  <X className="h-4 w-4 mr-1" />
                  Eliminar
                </Button>
              </div>
              <div className="absolute top-2 right-2">
                <CheckCircle2 className="h-6 w-6 text-green-500 bg-white rounded-full" />
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 h-32 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors">
              {isUploading ? (
                <>
                  <Loader2 className="h-8 w-8 text-blue-500 mb-2 animate-spin" />
                  <p className="text-xs text-slate-600">Uploading photo… please wait.</p>
                </>
              ) : (
                <>
                  <Camera className="h-8 w-8 text-slate-400 mb-2" />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handlePhotoSelect(side)}
                    className="text-xs"
                  >
                    Subir Foto
                  </Button>
                </>
              )}
            </div>
          )}
          
          {/* Upload success message */}
          {uploadSuccess && (
            <div className="mt-1 p-2 bg-green-50 border border-green-200 rounded text-center">
              <p className="text-xs text-green-700">Photo uploaded successfully.</p>
            </div>
          )}
          
          {/* Upload error message */}
          {uploadError && (
            <div className="mt-1 p-2 bg-amber-50 border border-amber-200 rounded text-center">
              <p className="text-xs text-amber-700">{uploadError}</p>
            </div>
          )}
          
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(side, e)}
            className="hidden"
          />
        </div>
      </div>
    )
  }

  // Redirect if bookingId is missing
  if (!bookingId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-amber-600 mx-auto" />
            <p className="text-muted-foreground">
              Booking ID is required. Please return to the booking confirmation page.
            </p>
            <Button onClick={() => router.push("/")} className="w-full">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 flex flex-col">
      <div className="max-w-2xl mx-auto w-full space-y-8 flex-1 flex flex-col justify-center">
        {/* Network error banner */}
        {networkError && (
          <Card className="border-amber-200 bg-amber-50/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-amber-800">{networkError}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Header verde */}
        <div className="bg-green-500 text-white rounded-lg p-6 text-center shadow-lg">
          <h1 className="text-2xl md:text-3xl font-bold">
            ¡Pago Exitoso! Tu Jeep está listo
          </h1>
        </div>

        {/* Driver's License Verification Status */}
        {loadingBooking ? (
          <Card className="border-slate-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-3">
                <Loader2 className="h-5 w-5 text-slate-600 animate-spin" />
                <p className="text-sm text-slate-600">Verifying driver information...</p>
              </div>
            </CardContent>
          </Card>
        ) : licenseVerified ? (
          <Card className="border-green-200 bg-green-50/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                <p className="text-sm font-medium text-green-800">Driver's license verified.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-amber-200 bg-amber-50/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-800 mb-1">
                    Driver information is incomplete.
                  </p>
                  <p className="text-sm text-amber-700">
                    Please contact support to complete your booking.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Vehicle Inspection Section */}
        <Card className="border-purple-200 bg-purple-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Vehicle Inspection (Required)
            </CardTitle>
            <CardDescription>
              Upload all 4 exterior photos before unlocking the Jeep.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <PhotoUploadSlot
                side="front"
                label="Frente"
                inputRef={frontInputRef}
              />
              <PhotoUploadSlot
                side="back"
                label="Atrás"
                inputRef={backInputRef}
              />
              <PhotoUploadSlot
                side="left"
                label="Lado Izquierdo"
                inputRef={leftInputRef}
              />
              <PhotoUploadSlot
                side="right"
                label="Lado Derecho"
                inputRef={rightInputRef}
              />
            </div>
            
            {/* Photo upload helper text */}
            <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <p className="text-sm text-slate-700 text-center">
                These photos protect both you and the vehicle. Unlocking is disabled until all photos are uploaded.
              </p>
            </div>

            {!allPhotosUploaded && (
              <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800 text-center">
                  <strong>Debes subir las 4 fotos antes de desbloquear el Jeep.</strong>
                </p>
                <p className="text-xs text-amber-700 text-center mt-1">
                  Fotos restantes: {4 - Object.values(photos).filter(p => p.file !== null).length}
                </p>
              </div>
            )}

            {allPhotosUploaded && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800 text-center font-semibold">
                  ✓ Todas las fotos han sido subidas. Ya puedes desbloquear el Jeep.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Llave Digital - Centro */}
        <div className="flex flex-col items-center space-y-8">
          {/* Círculo grande con icono de candado */}
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center shadow-xl border-4 border-slate-400">
            {isLocked ? (
              <Lock className="w-16 h-16 md:w-20 md:h-20 text-slate-600" />
            ) : (
              <Unlock className="w-16 h-16 md:w-20 md:h-20 text-slate-600" />
            )}
          </div>

          {/* Helper text above unlock button */}
          <div className="w-full max-w-md text-center space-y-2">
            {!licenseVerified && (
              <p className="text-sm font-medium text-amber-700">
                Driver information is incomplete. Please contact support.
              </p>
            )}
            {licenseVerified && !allPhotosUploaded && (
              <p className="text-sm font-medium text-amber-700">
                Complete the inspection to unlock the Jeep.
              </p>
            )}
            {allRequirementsMet && unlockState === null && !unlockError && (
              <p className="text-sm font-medium text-green-700">
                All requirements completed. You can now unlock the Jeep.
              </p>
            )}
            {unlockState === 'pending' && (
              <p className="text-sm font-medium text-blue-700 flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Unlocking the Jeep… please wait.
              </p>
            )}
            {unlockState === 'success' && (
              <p className="text-sm font-medium text-green-700">
                Jeep unlocked successfully.
              </p>
            )}
            {(unlockState === 'failed' || unlockError) && (
              <p className="text-sm font-medium text-amber-700">
                {unlockError || "We couldn't unlock the Jeep. Please try again."}
              </p>
            )}
          </div>

          {/* Botones enormes o mensaje de estado */}
          <div className="w-full space-y-4 max-w-md">
            {isLocked ? (
              <Button
                onClick={handleUnlock}
                disabled={!allRequirementsMet || unlockState === 'pending'}
                className={`w-full h-20 md:h-24 text-xl md:text-2xl font-bold text-white shadow-lg ${
                  allRequirementsMet && unlockState !== 'pending'
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-slate-400 cursor-not-allowed"
                }`}
                size="lg"
              >
                {unlockState === 'pending' ? (
                  <>
                    <Loader2 className="mr-3 h-8 w-8 md:h-10 md:w-10 animate-spin" />
                    Unlocking...
                  </>
                ) : (
                  <>
                    <Unlock className="mr-3 h-8 w-8 md:h-10 md:w-10" />
                    ABRIR (UNLOCK)
                  </>
                )}
              </Button>
            ) : unlockState === 'success' ? (
              // Post-unlock state: show passive message, no buttons
              <div className="w-full text-center space-y-2 py-6">
                <p className="text-lg md:text-xl font-semibold text-green-700">
                  ✅ Jeep unlocked
                </p>
                <p className="text-sm md:text-base text-slate-600">
                  You can now start your trip.
                </p>
              </div>
            ) : null}
          </div>
        </div>

        {/* Botón Finalizar Viaje - Available after unlock */}
        {unlockState === 'success' && (
          <div className="pt-8 space-y-2">
            <div className="text-center">
              <Button
                onClick={handleEndTrip}
                className="w-full h-14 text-lg font-semibold bg-red-600 hover:bg-red-700 text-white shadow-lg"
                size="lg"
              >
                Finalizar Viaje
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Completa la inspección final del vehículo para finalizar tu viaje.
              </p>
            </div>
          </div>
        )}

        {/* Support Message - Always visible */}
        <Card className="border-slate-200 bg-slate-50/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <HelpCircle className="h-5 w-5 text-slate-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-slate-900 mb-1">
                  Having trouble?
                </h3>
                <p className="text-sm text-slate-700">
                  If the Jeep does not unlock or something doesn't work as expected, call us and we'll assist you remotely.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

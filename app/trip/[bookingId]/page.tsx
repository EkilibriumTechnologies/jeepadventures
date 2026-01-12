"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, CheckCircle2, X, Loader2, Car, Check } from "lucide-react"

interface PhotoState {
  file: File | null
  preview: string | null
  uploading?: boolean
  uploadError?: string | null
  uploadSuccess?: boolean
  url?: string | null
}

interface BookingData {
  id: string
  cars: {
    plate: string
    model?: string
    year?: number
    image_url?: string
  }
}

export default function EndTripPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params.bookingId as string
  
  const [booking, setBooking] = useState<BookingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFinalizing, setIsFinalizing] = useState(false)
  const [tripCompleted, setTripCompleted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Exit inspection photos state - ALWAYS start empty
  const [photos, setPhotos] = useState<{
    front: PhotoState
    back: PhotoState
    left: PhotoState
    right: PhotoState
  }>({
    front: { file: null, preview: null, url: null },
    back: { file: null, preview: null, url: null },
    left: { file: null, preview: null, url: null },
    right: { file: null, preview: null, url: null },
  })

  // Refs for file inputs
  const frontInputRef = useRef<HTMLInputElement>(null)
  const backInputRef = useRef<HTMLInputElement>(null)
  const leftInputRef = useRef<HTMLInputElement>(null)
  const rightInputRef = useRef<HTMLInputElement>(null)

  // Check if all 4 photos are uploaded (only exit photos)
  const allPhotosUploaded = 
    photos.front.url !== null &&
    photos.back.url !== null &&
    photos.left.url !== null &&
    photos.right.url !== null

  // Clear photos on component mount to prevent stale state
  useEffect(() => {
    // Reset photos state when component mounts
    setPhotos({
      front: { file: null, preview: null, url: null },
      back: { file: null, preview: null, url: null },
      left: { file: null, preview: null, url: null },
      right: { file: null, preview: null, url: null },
    })
  }, [])

  // Load booking data on mount
  useEffect(() => {
    if (!bookingId) {
      setError("Booking ID is required")
      setLoading(false)
      return
    }

    const fetchBooking = async () => {
      try {
        const response = await fetch(`/api/booking/${bookingId}`)
        const data = await response.json()

        if (!response.ok) {
          setError(data.error || "Failed to load booking")
          setLoading(false)
          return
        }

        setBooking(data)
        
        // IMPORTANT: Do NOT load photos from booking.photos_urls
        // Exit inspection photos must be captured fresh on this page
        // Reset photos state to ensure clean slate
        setPhotos({
          front: { file: null, preview: null, url: null },
          back: { file: null, preview: null, url: null },
          left: { file: null, preview: null, url: null },
          right: { file: null, preview: null, url: null },
        })
      } catch (error) {
        console.error("Error fetching booking:", error)
        setError("Failed to load booking information")
      } finally {
        setLoading(false)
      }
    }

    fetchBooking()
  }, [bookingId])

  // Handle photo upload to Supabase Storage
  const handlePhotoUpload = async (side: 'front' | 'back' | 'left' | 'right', file: File) => {
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

    try {
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotos((prev) => ({
          ...prev,
          [side]: {
            ...prev[side],
            preview: reader.result as string,
          },
        }))
      }
      reader.readAsDataURL(file)

      // Upload to exit inspection API route (separate from entry inspection)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bookingId', bookingId)
      formData.append('side', side)

      const response = await fetch('/api/trip/upload-exit-inspection', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      // Update state with uploaded URL
      setPhotos((prev) => ({
        ...prev,
        [side]: {
          ...prev[side],
          uploading: false,
          uploadError: null,
          uploadSuccess: true,
          url: data.url,
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
    } catch (error) {
      console.error('Upload error:', error)
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
  // Note: capture="environment" enforces camera-only on mobile devices
  // On desktop browsers, file selection may still be available (browser limitation)
  const handleFileChange = (side: 'front' | 'back' | 'left' | 'right', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (file) {
      // Validate file is an image
      if (!file.type.startsWith('image/')) {
        setPhotos((prev) => ({
          ...prev,
          [side]: {
            ...prev[side],
            uploadError: "Please capture a photo using your camera.",
            uploadSuccess: false,
          },
        }))
        return
      }
      handlePhotoUpload(side, file)
    }
    // Reset input to allow re-capture
    e.target.value = ''
  }

  // Handle photo selection
  const handlePhotoSelect = (side: 'front' | 'back' | 'left' | 'right') => {
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
      [side]: { file: null, preview: null, uploading: false, uploadError: null, uploadSuccess: false, url: null },
    }))
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

  // Handle finalize trip
  const handleFinalizeTrip = async () => {
    if (!allPhotosUploaded) {
      return
    }

    setIsFinalizing(true)
    setError(null)

    try {
      const response = await fetch(`/api/trip/${bookingId}/finalize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exitPhotos: [
            photos.front.url,
            photos.back.url,
            photos.left.url,
            photos.right.url,
          ],
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to finalize trip')
      }

      // Success - redirect to completion page
      router.push(`/trip-completed?bookingId=${bookingId}`)
    } catch (error) {
      console.error('Finalize error:', error)
      setError(error instanceof Error ? error.message : 'Failed to finalize trip')
    } finally {
      setIsFinalizing(false)
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
    // Only show photo if it has a valid URL from exit inspection upload
    // Check that URL contains 'exit-' prefix to ensure it's an exit photo
    const hasValidExitPhoto = photo.url !== null && photo.url.includes('exit-')
    const hasPreview = photo.preview !== null
    const hasPhoto = hasValidExitPhoto || hasPreview
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
                src={photo.preview || photo.url || ''}
                alt={label}
                className="w-full h-32 object-cover rounded-lg border-2 border-green-500"
                onError={(e) => {
                  // If image fails to load, clear it
                  console.error('Failed to load photo:', photo.url)
                  setPhotos((prev) => ({
                    ...prev,
                    [side]: { file: null, preview: null, url: null, uploading: false, uploadError: null, uploadSuccess: false },
                  }))
                }}
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
                  Remove
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
                    Capture Photo
                  </Button>
                  <p className="text-xs text-slate-500 mt-1">Camera only</p>
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
            capture="environment"
            onChange={(e) => handleFileChange(side, e)}
            className="hidden"
          />
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-slate-600" />
          <p className="text-muted-foreground">Loading trip information...</p>
        </div>
      </div>
    )
  }

  if (error && !booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">{error}</p>
              <Button
                onClick={() => router.push("/")}
                className="w-full mt-4"
              >
                Go to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (tripCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 flex items-center justify-center">
        <div className="max-w-2xl mx-auto w-full">
          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="pt-6 text-center space-y-4">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
              <h2 className="text-2xl font-bold text-green-900">Trip completed successfully.</h2>
              <p className="text-lg text-slate-700">Thank you for using Jeep & Go.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-2xl mx-auto space-y-6 py-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">End Your Trip</h1>
          <p className="text-lg text-muted-foreground">You're returning the Jeep you rented.</p>
        </div>

        {/* Jeep Information */}
        {booking && (
          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Vehicle Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {booking.cars?.image_url && (
                <div className="aspect-video w-full bg-slate-200 rounded-lg overflow-hidden">
                  <img
                    src={booking.cars.image_url}
                    alt={`${booking.cars.model || 'Jeep'} ${booking.cars.plate}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="space-y-2">
                {booking.cars?.model && (
                  <div>
                    <p className="text-sm text-muted-foreground">Vehicle</p>
                    <p className="font-semibold">
                      {booking.cars.model} {booking.cars.year && `(${booking.cars.year})`}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">License Plate</p>
                  <p className="font-semibold">{booking.cars.plate}</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 italic">
                This Jeep is linked to your active trip.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Instructions Section */}
        <Card>
          <CardHeader>
            <CardTitle>Return Instructions</CardTitle>
            <CardDescription>Follow these steps to complete your trip</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 list-decimal list-inside">
              <li className="text-slate-700">Park the Jeep safely.</li>
              <li className="text-slate-700">Place the physical key inside the center console.</li>
              <li className="text-slate-700">Make sure all personal belongings are removed.</li>
              <li className="text-slate-700 font-semibold">Complete the final vehicle inspection below.</li>
            </ol>
          </CardContent>
        </Card>

        {/* Exit Inspection Section */}
        <Card className="border-purple-200 bg-purple-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Final Vehicle Inspection (Required)
            </CardTitle>
            <CardDescription>
              Capture all 4 exterior photos using your device camera before finalizing your trip.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <PhotoUploadSlot
                side="front"
                label="Front"
                inputRef={frontInputRef}
              />
              <PhotoUploadSlot
                side="back"
                label="Back"
                inputRef={backInputRef}
              />
              <PhotoUploadSlot
                side="left"
                label="Left Side"
                inputRef={leftInputRef}
              />
              <PhotoUploadSlot
                side="right"
                label="Right Side"
                inputRef={rightInputRef}
              />
            </div>

            {/* Helper text */}
            <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <p className="text-sm text-slate-700 text-center">
                These photos document the condition of the Jeep at return.
              </p>
            </div>

            {!allPhotosUploaded && (
              <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800 text-center">
                  <strong>All 4 photos must be captured using your camera before finalizing your trip.</strong>
                </p>
                <p className="text-xs text-amber-700 text-center mt-1">
                  Photos remaining: {4 - Object.values(photos).filter(p => p.url !== null).length}
                </p>
              </div>
            )}

            {allPhotosUploaded && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800 text-center font-semibold">
                  ✓ All photos captured and uploaded. You can now finalize your trip.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Error message */}
        {error && (
          <Card className="border-red-200 bg-red-50/50">
            <CardContent className="pt-6">
              <p className="text-sm text-red-800 text-center">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Finalize Trip Button */}
        <div className="pt-4">
          <Button
            onClick={handleFinalizeTrip}
            disabled={!allPhotosUploaded || isFinalizing}
            className={`w-full h-14 text-lg font-semibold text-white shadow-lg ${
              allPhotosUploaded && !isFinalizing
                ? "bg-red-600 hover:bg-red-700"
                : "bg-slate-400 cursor-not-allowed"
            }`}
            size="lg"
          >
            {isFinalizing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Finalizing...
              </>
            ) : (
              <>
                <Check className="mr-2 h-5 w-5" />
                Finalize Trip
              </>
            )}
          </Button>
          {!allPhotosUploaded && (
            <p className="text-xs text-center text-muted-foreground mt-2">
              Capture all 4 photos using your camera to finalize your trip.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

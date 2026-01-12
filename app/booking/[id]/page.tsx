"use client"

import { useParams, useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, AlertCircle, Car, Lock, CheckCircle2 } from "lucide-react"

export default function BookingAccessPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const bookingId = params.id as string
  const token = searchParams.get("token")
  
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tokenValid, setTokenValid] = useState<boolean | null>(null)

  useEffect(() => {
    if (!bookingId) {
      setError("Booking ID is required")
      setLoading(false)
      return
    }

    const fetchBooking = async () => {
      try {
        // Build URL with token if provided
        const url = token 
          ? `/api/booking/${bookingId}?token=${encodeURIComponent(token)}`
          : `/api/booking/${bookingId}`
        
        const response = await fetch(url)
        const data = await response.json()

        if (!response.ok) {
          if (response.status === 403) {
            setError("Invalid access token. Please use the link from your email.")
            setTokenValid(false)
          } else {
            setError(data.error || "Failed to load booking")
          }
          setLoading(false)
          return
        }

        setBooking(data)
        setTokenValid(data.tokenValid === true)
      } catch (error) {
        console.error("Error fetching booking:", error)
        setError("Failed to load booking information")
      } finally {
        setLoading(false)
      }
    }

    fetchBooking()
  }, [bookingId, token])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-slate-600" />
          <p className="text-muted-foreground">Loading booking information...</p>
        </div>
      </div>
    )
  }

  // Token validation error
  if (error && tokenValid === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 flex items-center justify-center">
        <div className="max-w-md mx-auto w-full">
          <Card className="border-red-200 bg-red-50/50">
            <CardContent className="pt-6 text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
              <h2 className="text-xl font-bold text-red-900">Invalid Access Token</h2>
              <p className="text-sm text-red-700">
                {error}
              </p>
              <p className="text-xs text-red-600">
                Please check your email for the correct access link, or contact support if you need assistance.
              </p>
              <Button
                onClick={() => router.push("/")}
                variant="outline"
                className="w-full"
              >
                Go to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // General error
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 flex items-center justify-center">
        <div className="max-w-md mx-auto w-full">
          <Card>
            <CardContent className="pt-6 text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-amber-500 mx-auto" />
              <p className="text-muted-foreground">{error}</p>
              <Button
                onClick={() => router.push("/")}
                className="w-full"
              >
                Go to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 flex items-center justify-center">
        <div className="max-w-md mx-auto w-full">
          <Card>
            <CardContent className="pt-6 text-center space-y-4">
              <p className="text-muted-foreground">Booking not found</p>
              <Button
                onClick={() => router.push("/")}
                className="w-full"
              >
                Go to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Token missing warning
  if (!token && tokenValid === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="max-w-2xl mx-auto space-y-6 py-8">
          <Card className="border-amber-200 bg-amber-50/50">
            <CardContent className="pt-6 text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-amber-500 mx-auto" />
              <h2 className="text-xl font-bold text-amber-900">Access Token Required</h2>
              <p className="text-sm text-amber-700">
                Please use the access link from your email to view this booking.
              </p>
              <p className="text-xs text-amber-600">
                If you don't have the email, please check your inbox or contact support.
              </p>
              <Button
                onClick={() => router.push("/")}
                variant="outline"
                className="w-full"
              >
                Go to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Valid token - show booking access
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-2xl mx-auto space-y-6 py-8">
        {/* Success Header */}
        <div className="text-center space-y-2">
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            Booking Access
          </h1>
          <p className="text-muted-foreground">
            You have access to your booking
          </p>
        </div>

        {/* Booking Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Booking Details
            </CardTitle>
            <CardDescription>ID: {booking.id.substring(0, 8)}...</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {booking.cars && (
              <div className="flex items-center gap-3">
                <Car className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Vehicle</p>
                  <p className="font-medium">
                    Jeep - {booking.cars.plate}
                  </p>
                </div>
              </div>
            )}

            <div className="pt-4 border-t space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Status</span>
                <span className="font-medium capitalize">{booking.payment_status}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4">
          {booking.payment_status === 'paid' && booking.cars?.smartcar_id && (
            <Button
              onClick={() => router.push(`/active-rental?bookingId=${bookingId}`)}
              className="w-full"
              size="lg"
            >
              <Lock className="mr-2 h-5 w-5" />
              Access Active Rental
            </Button>
          )}
          
          {booking.end_time === null && (
            <Button
              onClick={() => router.push(`/trip/${bookingId}`)}
              variant="outline"
              className="w-full"
              size="lg"
            >
              Finalize Trip
            </Button>
          )}

          <Button
            onClick={() => router.push("/")}
            variant="outline"
            className="w-full"
          >
            Go to Home
          </Button>
        </div>
      </div>
    </div>
  )
}

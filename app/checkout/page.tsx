"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CreditCard, Calendar, Loader2, User, Mail, Phone, MapPin, FileText } from "lucide-react"
import { useState } from "react"
import { format, parse } from "date-fns"

interface GuestDetails {
  fullName: string
  email: string
  phone: string
  address: string
  licenseNumber: string
  licenseImageUrl?: string
  timestamp?: number
}

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [guestDetails, setGuestDetails] = useState<GuestDetails | null>(null)
  const [isLoadingGuestDetails, setIsLoadingGuestDetails] = useState(true)
  // Guest checkout - no authentication state needed

  // Load guest details from sessionStorage on mount
  useEffect(() => {
    const loadGuestDetails = () => {
      try {
        console.log('📂 Loading guest details from sessionStorage...')
        const stored = sessionStorage.getItem("guestDetails")
        if (stored) {
          const parsed = JSON.parse(stored) as GuestDetails
          // Check if data is not too old (e.g., less than 1 hour)
          if (parsed.timestamp && Date.now() - parsed.timestamp < 3600000) {
            setGuestDetails(parsed)
            console.log('✅ Guest details loaded from sessionStorage:', {
              fullName: parsed.fullName,
              email: parsed.email,
              hasLicenseImage: !!parsed.licenseImageUrl,
            })
          } else {
            console.log('⚠️ Guest details expired, removing from sessionStorage')
            sessionStorage.removeItem("guestDetails")
          }
        } else {
          console.log('ℹ️ No guest details found in sessionStorage')
        }
      } catch (error) {
        console.error("❌ Error loading guest details:", error)
      } finally {
        setIsLoadingGuestDetails(false)
      }
    }

    loadGuestDetails()
  }, [])

  // Read URL parameters
  const plate = searchParams.get("plate") || ""
  const daysParam = searchParams.get("days") || "0"
  const totalParam = searchParams.get("total") || "0"
  const startDateParam = searchParams.get("start") || ""
  const endDateParam = searchParams.get("end") || ""

  // Parse and format values
  const days = parseInt(daysParam, 10) || 0
  const rentalSubtotal = parseFloat(totalParam) || 0
  const deposit = 450.00
  
  // Puerto Rico IVU: 11.5% (10.5% Estatal + 1% Municipal)
  const IVU_RATE = 0.115
  const taxAmount = rentalSubtotal * IVU_RATE
  
  // Calculate totals
  const rentalTotal = rentalSubtotal + taxAmount
  const totalToPay = rentalTotal + deposit

  // Calculate daily rate from subtotal and days
  const dailyRate = days > 0 ? rentalSubtotal / days : 0

  // Format dates
  const formatDate = (dateString: string): string => {
    if (!dateString) return ""
    try {
      const date = parse(dateString, "yyyy-MM-dd", new Date())
      return format(date, "dd MMM yyyy")
    } catch {
      return dateString
    }
  }

  const formattedStartDate = formatDate(startDateParam)
  const formattedEndDate = formatDate(endDateParam)

  // Redirect if missing essential data - ONLY after loading sessionStorage
  useEffect(() => {
    if (isLoadingGuestDetails) {
      console.log('⏳ Still loading guest details from sessionStorage...')
      return // Wait for sessionStorage to load
    }

    if (!plate || days === 0 || rentalSubtotal === 0) {
      console.log('⚠️ Missing rental data, redirecting to home')
      router.push("/")
      return
    }

    // Only redirect if really no guest data after loading
    if (!guestDetails) {
      console.log('⚠️ No guest details found after loading, redirecting to guest-details form')
      const guestUrl = `/guest-details?plate=${encodeURIComponent(plate)}&days=${days}&total=${rentalSubtotal.toFixed(2)}&start=${startDateParam}&end=${endDateParam}`
      router.push(guestUrl)
    } else {
      console.log('✅ Guest details available, showing checkout form')
    }
  }, [isLoadingGuestDetails, plate, days, rentalSubtotal, router, guestDetails, startDateParam, endDateParam])

  const handlePayment = async () => {
    if (!plate || days === 0 || rentalTotal === 0 || !startDateParam || !endDateParam) {
      window.alert("Faltan datos de la reserva. Regresa y selecciona las fechas.")
      return
    }

    // Check if we have guest details (required for guest checkout)
    if (!guestDetails) {
      window.alert("Faltan datos del conductor. Por favor, completa el formulario.")
      const guestUrl = `/guest-details?plate=${encodeURIComponent(plate)}&days=${days}&total=${rentalSubtotal.toFixed(2)}&start=${startDateParam}&end=${endDateParam}`
      router.push(guestUrl)
      return
    }

    try {
      setIsProcessing(true)
      console.log('🚀 Starting checkout process...')

      // Guest checkout - no authentication required
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          guestDetails: {
            fullName: guestDetails.fullName,
            email: guestDetails.email,
            phone: guestDetails.phone,
            address: guestDetails.address,
            licenseNumber: guestDetails.licenseNumber,
            licenseImageUrl: guestDetails.licenseImageUrl,
          },
          plate,
          days,
          rentalTotal: rentalSubtotal, // Send subtotal (before tax) to API
          startDate: startDateParam,
          endDate: endDateParam,
        }),
      })

      const data = await response.json()

      console.log('📦 Checkout response:', data)

      if (!response.ok || !data.success) {
        setIsProcessing(false)
        console.error('❌ Checkout failed:', data)
        
        // Detailed error logging
        if (data.errorDetails) {
          console.error('Error de Supabase:', {
            message: data.errorDetails.message,
            details: data.errorDetails.details,
            code: data.errorDetails.code,
            hint: data.errorDetails.hint,
          })
        }
        
        window.alert(
          data.error || "No se pudo procesar el checkout. Por favor intenta de nuevo."
        )
        return
      }

      // Success!
      console.log('✅ Checkout successful, redirecting to confirmation...')
      console.log('📋 Booking ID:', data.bookingId)
      
      sessionStorage.removeItem("guestDetails")
      
      if (data.bookingId) {
        // Use window.location for more reliable redirect
        window.location.href = `/booking-confirmation?bookingId=${data.bookingId}`
      } else {
        console.error('❌ No bookingId in response:', data)
        setIsProcessing(false)
        window.alert("Reserva creada pero no se pudo obtener el ID. Por favor contacta soporte.")
      }
    } catch (error) {
      console.error("❌ Error in handlePayment:", error)
      
      // Detailed error logging for Supabase errors
      if (error && typeof error === 'object' && 'message' in error) {
        const supabaseError = error as any
        console.error("Error de Supabase:", {
          message: supabaseError.message,
          details: supabaseError.details,
          code: supabaseError.code,
          hint: supabaseError.hint,
        })
      }
      
      setIsProcessing(false)
      window.alert("Ocurrió un error inesperado. Intenta nuevamente.")
    }
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2 pt-8">
          <h1 className="text-3xl font-bold">Checkout</h1>
          <p className="text-muted-foreground">Complete your reservation</p>
        </div>

        {/* Guest Details Summary */}
        {guestDetails && (
          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader>
              <CardTitle className="text-lg">Información del Conductor</CardTitle>
              <CardDescription>Confirma que los datos son correctos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Nombre Completo</p>
                  <p className="font-medium">{guestDetails.fullName}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Correo Electrónico</p>
                  <p className="font-medium">{guestDetails.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Teléfono</p>
                  <p className="font-medium">{guestDetails.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Dirección</p>
                  <p className="font-medium">{guestDetails.address}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileText className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Licencia de Conducir</p>
                  <p className="font-medium">{guestDetails.licenseNumber}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoadingGuestDetails && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <p className="text-sm text-blue-700">
                ⏳ Cargando información del conductor...
              </p>
            </CardContent>
          </Card>
        )}

        {/* Guest Checkout Info */}
        {!isLoadingGuestDetails && guestDetails && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <p className="text-sm text-amber-700">
                ℹ️ Checkout como invitado. No se requiere cuenta.
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Rental Summary</CardTitle>
            <CardDescription>
              {plate ? `Plate: ${plate}` : "No rental information"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Rental Details */}
            <div className="space-y-3">
              {plate && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {formattedStartDate && formattedEndDate
                      ? `Del ${formattedStartDate} al ${formattedEndDate}`
                      : "Fechas no disponibles"}
                  </span>
                </div>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2 pt-2 border-t">
              <div className="flex justify-between">
                <span>Renta: ${dailyRate.toFixed(2)} x {days} {days === 1 ? "día" : "días"}</span>
                <span>${rentalSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>IVU (11.5%)</span>
                <span>${taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span>${rentalTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Depósito de Seguridad</span>
                <span>${deposit.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Total a Pagar</span>
                <span>${totalToPay.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold">Payment Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="card">Card Number</Label>
                <Input id="card" placeholder="1234 5678 9012 3456" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input id="expiry" placeholder="MM/YY" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input id="cvv" placeholder="123" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Cardholder Name</Label>
                <Input id="name" placeholder="John Doe" />
              </div>
            </div>

            <Button 
              className="w-full" 
              size="lg"
              onClick={handlePayment}
              disabled={
                isProcessing || 
                isLoadingGuestDetails ||
                !plate || 
                days === 0 || 
                rentalSubtotal === 0 ||
                !guestDetails
              }
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-5 w-5" />
                  Pagar ${totalToPay.toFixed(2)}
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              By completing this reservation, you agree to our terms and conditions.
              The security deposit will be held and released after vehicle return.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


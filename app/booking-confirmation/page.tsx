"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Calendar, Car, ArrowLeft, Unlock } from "lucide-react"
// Using API route instead of direct Supabase client to bypass RLS for guest bookings

export default function BookingConfirmationPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const bookingId = searchParams.get("bookingId")
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!bookingId) {
      router.push("/")
      return
    }

    // Fetch booking details via API route (uses admin client to bypass RLS)
    const fetchBooking = async () => {
      try {
        console.log('📋 Fetching booking:', bookingId)
        
        const response = await fetch(`/api/booking/${bookingId}`)
        const data = await response.json()

        if (!response.ok) {
          console.error("❌ Error fetching booking:", data)
          console.error("Error details:", {
            status: response.status,
            error: data.error,
            details: data.details,
          })
          setLoading(false)
          return
        }

        console.log('✅ Booking fetched successfully:', {
          id: data?.id,
          plate: data?.cars?.plate,
          hasCar: !!data?.cars,
          smartcar_id: data?.cars?.smartcar_id,
        })
        
        setBooking(data)
      } catch (error) {
        console.error("❌ Unexpected error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBooking()
  }, [bookingId, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Cargando información de la reserva...</p>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                No se pudo encontrar la reserva con ID: {bookingId?.substring(0, 8)}...
              </p>
              <p className="text-center text-sm text-muted-foreground mt-2">
                Por favor verifica el ID de la reserva o contacta soporte.
              </p>
              <Button
                onClick={() => router.push("/")}
                className="w-full mt-4"
              >
                Volver al inicio
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2 pt-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          <h1 className="text-3xl font-bold">¡Reserva Confirmada!</h1>
          <p className="text-muted-foreground">
            Tu reserva ha sido procesada exitosamente
          </p>
        </div>

        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle>Detalles de la Reserva</CardTitle>
            <CardDescription>ID: {booking.id.substring(0, 8)}...</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {booking.cars && (
              <div className="flex items-center gap-3">
                <Car className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Vehículo</p>
                  <p className="font-medium">
                    Jeep - {booking.cars.plate}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Período de Renta</p>
                <p className="font-medium">
                  {new Date(booking.start_time).toLocaleDateString("es-PR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}{" "}
                  -{" "}
                  {new Date(booking.end_time).toLocaleDateString("es-PR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t space-y-2">
              {booking.subtotal && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">${Number(booking.subtotal).toFixed(2)}</span>
                </div>
              )}
              {booking.tax_amount && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IVU (11.5%)</span>
                  <span className="font-medium">${Number(booking.tax_amount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total de Renta</span>
                <span className="font-medium">
                  ${Number(booking.total_price || booking.total_amount || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Depósito de Seguridad</span>
                <span className="font-medium">
                  ${Number(booking.security_deposit || booking.deposit_amount || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t font-bold text-lg">
                <span>Total Pagado</span>
                <span>
                  ${(
                    Number(booking.total_price || booking.total_amount || 0) + 
                    Number(booking.security_deposit || booking.deposit_amount || 0)
                  ).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Estado del Pago:{" "}
                <span className="font-medium capitalize">{booking.payment_status}</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Abrir Jeep Button - Only show if smartcar_id exists and payment is successful */}
        {booking.cars?.smartcar_id && booking.payment_status === 'paid' && (
          <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="pt-6">
              <Button
                onClick={() => router.push("/active-rental")}
                className="w-full"
                size="lg"
              >
                <Unlock className="mr-2 h-5 w-5" />
                Abrir Jeep
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-2">
                Tu Jeep está listo. Haz clic para abrirlo.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => router.push("/")}
            className="flex-1"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Inicio
          </Button>
          <Button
            onClick={() => router.push("/active-rental")}
            className="flex-1"
          >
            Abrir Vehículo
          </Button>
        </div>
      </div>
    </div>
  )
}


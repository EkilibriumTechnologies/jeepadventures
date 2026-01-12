"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Calendar, Car, ArrowLeft, Home, Clock, DollarSign } from "lucide-react"

export default function TripCompletedPage() {
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

    // Fetch booking details via API route
    const fetchBooking = async () => {
      try {
        const response = await fetch(`/api/booking/${bookingId}`)
        const data = await response.json()

        if (!response.ok) {
          console.error("Error fetching booking:", data)
          setLoading(false)
          return
        }

        setBooking(data)
      } catch (error) {
        console.error("Error fetching booking:", error)
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
          <p className="text-muted-foreground">Cargando información del viaje...</p>
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
                No se pudo encontrar la información del viaje.
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

  // Calculate trip duration
  const startDate = booking.start_time ? new Date(booking.start_time) : null
  const endDate = booking.end_time ? new Date(booking.end_time) : null
  const tripDuration = startDate && endDate 
    ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-2xl mx-auto space-y-6 py-8">
        {/* Success Header */}
        <div className="text-center space-y-4">
          <CheckCircle2 className="h-20 w-20 text-green-500 mx-auto" />
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
            ¡Viaje Finalizado Exitosamente!
          </h1>
          <p className="text-lg text-muted-foreground">
            Gracias por usar Jeep & Go. Tu depósito de seguridad será liberado en breve.
          </p>
        </div>

        {/* Trip Summary Card */}
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Resumen del Viaje
            </CardTitle>
            <CardDescription>ID: {booking.id.substring(0, 8)}...</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {booking.cars && (
              <div className="flex items-center gap-3">
                <Car className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Vehículo</p>
                  <p className="font-medium">
                    {booking.cars.model || 'Jeep'} {booking.cars.year && `(${booking.cars.year})`} - {booking.cars.plate}
                  </p>
                </div>
              </div>
            )}

            {startDate && (
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Período de Renta</p>
                  <p className="font-medium">
                    {startDate.toLocaleDateString("es-PR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {endDate && (
                      <>
                        {" - "}
                        {endDate.toLocaleDateString("es-PR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </>
                    )}
                  </p>
                </div>
              </div>
            )}

            {tripDuration !== null && (
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Duración del Viaje</p>
                  <p className="font-medium">
                    {tripDuration} {tripDuration === 1 ? 'día' : 'días'}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle>Resumen de Pagos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
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
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-muted-foreground">Depósito de Seguridad</span>
                  <p className="text-xs text-muted-foreground mt-1">
                    Será liberado automáticamente
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-medium">
                    ${Number(booking.security_deposit || booking.deposit_amount || 0).toFixed(2)}
                  </span>
                  <p className="text-xs text-green-600 mt-1 font-medium">
                    ✓ En proceso de liberación
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deposit Release Information */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Liberación del Depósito
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-slate-700">
              Tu depósito de seguridad de{" "}
              <strong>${Number(booking.security_deposit || booking.deposit_amount || 0).toFixed(2)}</strong>{" "}
              está siendo procesado para su liberación.
            </p>
            <p className="text-sm text-slate-600">
              El depósito será liberado automáticamente a tu método de pago original. 
              Esto puede tomar entre 3-5 días hábiles dependiendo de tu banco.
            </p>
            <p className="text-sm text-slate-600 mt-2">
              Si tienes alguna pregunta sobre tu depósito, por favor contáctanos.
            </p>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button
            variant="outline"
            onClick={() => router.push("/")}
            className="flex-1"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Inicio
          </Button>
          <Button
            onClick={() => router.push("/")}
            className="flex-1"
          >
            <Home className="mr-2 h-4 w-4" />
            Explorar Más Vehículos
          </Button>
        </div>

        {/* Thank You Message */}
        <Card className="border-slate-200 bg-slate-50/50">
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-slate-600">
              Gracias por elegir Jeep & Go. Esperamos verte de nuevo pronto.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

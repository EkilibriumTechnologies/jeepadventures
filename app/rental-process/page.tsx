"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Shield, 
  Fuel, 
  Camera, 
  CheckCircle2, 
  ArrowRight,
  AlertCircle,
  Info
} from "lucide-react"
import { format, parse } from "date-fns"

export default function RentalProcessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [isValid, setIsValid] = useState(false)

  // Validate parameters on mount
  useEffect(() => {
    const plate = searchParams.get("plate") || ""
    const daysParam = searchParams.get("days") || "0"
    const totalParam = searchParams.get("total") || "0"
    const startDateParam = searchParams.get("start") || ""
    const endDateParam = searchParams.get("end") || ""

    const days = parseInt(daysParam, 10) || 0
    const rentalTotal = parseFloat(totalParam) || 0

    if (!plate || days === 0 || rentalTotal === 0 || !startDateParam || !endDateParam) {
      // Redirect back to rent page if missing parameters
      if (plate) {
        router.push(`/rent/${plate}`)
      } else {
        router.push("/")
      }
    } else {
      setIsValid(true)
    }
  }, [searchParams, router])

  // Read URL parameters from previous step
  const plate = searchParams.get("plate") || ""
  const daysParam = searchParams.get("days") || "0"
  const totalParam = searchParams.get("total") || "0"
  const startDateParam = searchParams.get("start") || ""
  const endDateParam = searchParams.get("end") || ""

  const days = parseInt(daysParam, 10) || 0
  const rentalTotal = parseFloat(totalParam) || 0

  // Format dates for display
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

  // Handle navigation to guest details
  const handleContinue = () => {
    if (!termsAccepted) {
      return
    }

    if (!plate || days === 0 || rentalTotal === 0 || !startDateParam || !endDateParam) {
      window.alert("Faltan datos de la reserva. Regresa y selecciona las fechas.")
      router.push(`/rent/${plate}`)
      return
    }

    // Redirect to guest details with all parameters
    const guestDetailsUrl = `/guest-details?plate=${encodeURIComponent(plate)}&days=${days}&total=${rentalTotal.toFixed(2)}&start=${startDateParam}&end=${endDateParam}`
    router.push(guestDetailsUrl)
  }

  // Show loading or redirect if invalid
  if (!isValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-3xl mx-auto space-y-6 py-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold text-slate-900">
            Estás a 3 pasos de tu aventura en Jeep
          </h1>
          <p className="text-lg text-muted-foreground">
            Modelo <span className="font-semibold text-slate-700">Scan & Go</span>
          </p>
        </div>

        {/* Rental Summary Card */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="text-lg">Resumen de tu Reserva</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Vehículo:</span>
              <span className="font-medium">Placa {plate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Período:</span>
              <span className="font-medium">
                {formattedStartDate && formattedEndDate
                  ? `${formattedStartDate} - ${formattedEndDate}`
                  : "Fechas no disponibles"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duración:</span>
              <span className="font-medium">
                {days} {days === 1 ? "día" : "días"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Information Cards */}
        <div className="space-y-4">
          {/* Security Deposit Card */}
          <Card className="border-amber-200 bg-amber-50/30">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Shield className="h-6 w-6 text-amber-700" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">Retención de Seguridad</CardTitle>
                  <CardDescription className="text-base font-semibold text-amber-900">
                    $450.00
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-slate-700">
                Se realizará una <strong>retención de seguridad (Hold)</strong> de $450.00 en tu tarjeta.
              </p>
              <div className="flex items-start gap-2 p-3 bg-white rounded-lg border border-amber-200">
                <Info className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-slate-700">
                  <strong>Importante:</strong> Este monto <strong>no es un cobro</strong>, es una garantía que se libera automáticamente al finalizar la renta, siempre que el vehículo esté en las mismas condiciones.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Fuel Policy Card */}
          <Card className="border-green-200 bg-green-50/30">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Fuel className="h-6 w-6 text-green-700" />
                </div>
                <CardTitle className="text-lg">Política de Gasolina (Smartcar)</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-700">
                <strong>Sin fotos de odómetro.</strong> Smartcar mide el nivel de gasolina automáticamente al abrir y cerrar el Jeep.
              </p>
              <div className="flex items-start gap-2 p-3 bg-white rounded-lg border border-green-200">
                <AlertCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800 mb-1">
                    Regla de Devolución:
                  </p>
                  <p className="text-sm text-slate-700">
                    Devuélvelo igual. Cada <strong>1/4 faltante</strong> tiene un cargo de <strong>$8</strong> deducido del hold de seguridad.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Photo Inspection Card */}
          <Card className="border-purple-200 bg-purple-50/30">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Camera className="h-6 w-6 text-purple-700" />
                </div>
                <CardTitle className="text-lg">Inspección de 4 Fotos</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-700">
                Para tu protección y la nuestra, el sistema te pedirá <strong>4 fotos del exterior</strong> del vehículo antes de activar el botón de <strong>"ABRIR"</strong>.
              </p>
              <div className="mt-3 p-3 bg-white rounded-lg border border-purple-200">
                <p className="text-xs text-slate-600">
                  Las fotos ayudan a documentar el estado inicial del vehículo y protegen tanto al cliente como a la empresa.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Terms Acceptance */}
        <Card className="border-slate-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                className="mt-1"
              />
              <label
                htmlFor="terms"
                className="flex-1 text-sm text-slate-700 cursor-pointer"
              >
                <span className="font-semibold">Acepto los términos de renta y la política de retención.</span>
                <span className="block mt-1 text-xs text-muted-foreground">
                  Al continuar, confirmo que he leído y entendido toda la información sobre el depósito de seguridad, la política de gasolina y el proceso de inspección.
                </span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Continue Button */}
        <div className="pt-4">
          <Button
            onClick={handleContinue}
            disabled={!termsAccepted}
            className="w-full"
            size="lg"
          >
            <span className="flex items-center gap-2">
              Entendido, ir a Registro
              <ArrowRight className="h-5 w-5" />
            </span>
          </Button>
          {!termsAccepted && (
            <p className="text-sm text-center text-muted-foreground mt-2">
              Debes aceptar los términos para continuar
            </p>
          )}
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 pt-4">
          <div className="flex items-center gap-1">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="text-xs text-muted-foreground">1. Selección de fechas</span>
          </div>
          <div className="h-px w-8 bg-slate-300" />
          <div className="flex items-center gap-1">
            <div className="h-4 w-4 rounded-full bg-blue-600" />
            <span className="text-xs font-semibold text-blue-600">2. Información</span>
          </div>
          <div className="h-px w-8 bg-slate-300" />
          <div className="flex items-center gap-1">
            <div className="h-4 w-4 rounded-full bg-slate-300" />
            <span className="text-xs text-muted-foreground">3. Registro</span>
          </div>
        </div>
      </div>
    </div>
  )
}

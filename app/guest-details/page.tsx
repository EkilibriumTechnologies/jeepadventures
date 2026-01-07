"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Mail, Phone, MapPin, CreditCard, ArrowRight } from "lucide-react"
import { format, parse } from "date-fns"
import { LicenseCapture } from "@/components/license-capture"

interface GuestDetailsForm {
  fullName: string
  email: string
  phone: string
  address: string
  licenseNumber: string
  licenseImageUrl?: string
}

export default function GuestDetailsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof GuestDetailsForm, string>>>({})

  // Read URL parameters from previous step
  const plate = searchParams.get("plate") || ""
  const daysParam = searchParams.get("days") || "0"
  const totalParam = searchParams.get("total") || "0"
  const startDateParam = searchParams.get("start") || ""
  const endDateParam = searchParams.get("end") || ""

  const [formData, setFormData] = useState<GuestDetailsForm>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    licenseNumber: "",
    licenseImageUrl: undefined,
  })

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
  const days = parseInt(daysParam, 10) || 0
  const rentalTotal = parseFloat(totalParam) || 0

  // Validate email format
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof GuestDetailsForm, string>> = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = "El nombre completo es obligatorio"
    }

    if (!formData.email.trim()) {
      newErrors.email = "El correo electrónico es obligatorio"
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "El correo electrónico no tiene un formato válido"
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "El número de teléfono es obligatorio"
    }

    if (!formData.address.trim()) {
      newErrors.address = "La dirección es obligatoria"
    }

    if (!formData.licenseNumber.trim()) {
      newErrors.licenseNumber = "El número de licencia es obligatorio"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('📝 Form submitted, validating...')

    if (!validateForm()) {
      console.log('❌ Form validation failed:', errors)
      return
    }

    if (!plate || days === 0 || rentalTotal === 0 || !startDateParam || !endDateParam) {
      console.error('❌ Missing rental data')
      window.alert("Faltan datos de la reserva. Regresa y selecciona las fechas.")
      router.push(`/rent/${plate}`)
      return
    }

    setIsSubmitting(true)
    console.log('💾 Saving guest details to sessionStorage...')

    // Save guest details to sessionStorage
    const guestData = {
      ...formData,
      timestamp: Date.now(), // Add timestamp to ensure freshness
    }

    console.log('📦 Guest data to save:', {
      fullName: guestData.fullName,
      email: guestData.email,
      phone: guestData.phone,
      hasLicenseImage: !!guestData.licenseImageUrl,
    })

    sessionStorage.setItem("guestDetails", JSON.stringify(guestData))
    
    // Verify it was saved
    const saved = sessionStorage.getItem("guestDetails")
    if (saved) {
      console.log('✅ Successfully saved to sessionStorage')
    } else {
      console.error('❌ Failed to save to sessionStorage')
      setIsSubmitting(false)
      window.alert("Error al guardar los datos. Por favor intenta de nuevo.")
      return
    }

    // Redirect to checkout with all necessary parameters
    const checkoutUrl = `/checkout?plate=${encodeURIComponent(plate)}&days=${days}&total=${rentalTotal.toFixed(2)}&start=${startDateParam}&end=${endDateParam}`
    
    console.log('🔄 Redirecting to checkout:', checkoutUrl)
    router.push(checkoutUrl)
  }

  // Handle input changes
  const handleChange = (field: keyof GuestDetailsForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  // Handle license image capture
  const handleLicenseCapture = (imageUrl: string, imageFile: File) => {
    setFormData((prev) => ({ ...prev, licenseImageUrl: imageUrl }))
    console.log("License image captured:", imageUrl)
    // File is already uploaded to Supabase, we just need the URL
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2 pt-8">
          <h1 className="text-3xl font-bold">Información del Conductor</h1>
          <p className="text-muted-foreground">
            Completa tus datos para continuar con la reserva
          </p>
        </div>

        {/* Rental Summary Card */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="text-lg">Resumen de Reserva</CardTitle>
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
            <div className="flex justify-between pt-2 border-t">
              <span className="text-muted-foreground">Total:</span>
              <span className="font-bold text-lg">${rentalTotal.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Guest Details Form */}
        <Card>
          <CardHeader>
            <CardTitle>Datos del Conductor</CardTitle>
            <CardDescription>
              Todos los campos son obligatorios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Nombre Completo
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Juan Pérez"
                  value={formData.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  className={errors.fullName ? "border-red-500" : ""}
                />
                {errors.fullName && (
                  <p className="text-sm text-red-500">{errors.fullName}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Correo Electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="juan@ejemplo.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Número de Teléfono
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (787) 123-4567"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className={errors.phone ? "border-red-500" : ""}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone}</p>
                )}
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Dirección
                </Label>
                <Input
                  id="address"
                  type="text"
                  placeholder="Calle Principal #123, San Juan, PR"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  className={errors.address ? "border-red-500" : ""}
                />
                {errors.address && (
                  <p className="text-sm text-red-500">{errors.address}</p>
                )}
              </div>

              {/* License Number */}
              <div className="space-y-2">
                <Label htmlFor="licenseNumber" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Número de Licencia de Conducir
                </Label>
                <Input
                  id="licenseNumber"
                  type="text"
                  placeholder="123456789"
                  value={formData.licenseNumber}
                  onChange={(e) => handleChange("licenseNumber", e.target.value)}
                  className={errors.licenseNumber ? "border-red-500" : ""}
                />
                {errors.licenseNumber && (
                  <p className="text-sm text-red-500">{errors.licenseNumber}</p>
                )}
              </div>

              {/* License Photo Capture */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Foto de Licencia de Conducir
                </Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Captura una foto de tu licencia de conducir (opcional pero recomendado)
                </p>
                <LicenseCapture
                  onCapture={handleLicenseCapture}
                  currentImageUrl={formData.licenseImageUrl}
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    "Procesando..."
                  ) : (
                    <>
                      Continuar al Pago
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


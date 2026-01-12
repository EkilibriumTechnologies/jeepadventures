"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Mail, Phone, MapPin, CreditCard, ArrowRight, Camera, CheckCircle2, X, Loader2 } from "lucide-react"
import { format, parse } from "date-fns"
import { useRef } from "react"

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

  // License photo upload state
  const [licenseUploading, setLicenseUploading] = useState(false)
  const [licenseUploadSuccess, setLicenseUploadSuccess] = useState(false)
  const [licenseUploadError, setLicenseUploadError] = useState<string | null>(null)
  const [licensePreview, setLicensePreview] = useState<string | null>(null)
  const licenseInputRef = useRef<HTMLInputElement>(null)

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

    if (!formData.licenseImageUrl) {
      newErrors.licenseImageUrl = "La foto de licencia es obligatoria"
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

  // Handle license photo upload
  const handleLicenseUpload = async (file: File) => {
    if (!file) return

    setLicenseUploading(true)
    setLicenseUploadError(null)
    setLicenseUploadSuccess(false)

    try {
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setLicensePreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const timestamp = Date.now()
      const filePath = `${timestamp}-${Math.random().toString(36).substring(7)}.${fileExt}`

      const { createClient } = await import('@supabase/supabase-js')
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      const supabase = createClient(supabaseUrl, supabaseAnonKey)

      // Convert File to ArrayBuffer for upload
      const arrayBuffer = await file.arrayBuffer()
      const buffer = new Uint8Array(arrayBuffer)

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('licenses')
        .upload(filePath, buffer, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        console.error('License upload error:', uploadError)
        throw new Error(uploadError.message || 'Failed to upload license photo')
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('licenses')
        .getPublicUrl(filePath)

      if (!urlData?.publicUrl) {
        throw new Error('Failed to get license photo URL')
      }

      // Update form data with license URL
      setFormData((prev) => ({ ...prev, licenseImageUrl: urlData.publicUrl }))
      setLicenseUploadSuccess(true)
      setLicenseUploadError(null)

      // Clear success message after 3 seconds
      setTimeout(() => {
        setLicenseUploadSuccess(false)
      }, 3000)

      // Clear error if it exists
      if (errors.licenseImageUrl) {
        setErrors((prev) => ({ ...prev, licenseImageUrl: undefined }))
      }
    } catch (error) {
      console.error('License upload error:', error)
      setLicenseUploadError(error instanceof Error ? error.message : 'Error al subir la foto de licencia')
      setLicenseUploadSuccess(false)
    } finally {
      setLicenseUploading(false)
    }
  }

  // Handle license file input change
  const handleLicenseFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (file) {
      handleLicenseUpload(file)
    }
  }

  // Handle license photo selection
  const handleLicenseSelect = () => {
    licenseInputRef.current?.click()
  }

  // Remove license photo
  const handleRemoveLicense = () => {
    setFormData((prev) => ({ ...prev, licenseImageUrl: undefined }))
    setLicensePreview(null)
    setLicenseUploadSuccess(false)
    setLicenseUploadError(null)
    if (licenseInputRef.current) {
      licenseInputRef.current.value = ''
    }
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

              {/* License Photo Upload - MANDATORY */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Foto de Licencia de Conducir <span className="text-red-500">*</span>
                </Label>
                <p className="text-sm text-slate-700 mb-2">
                  Captura una foto clara de tu licencia de conducir. Este paso es obligatorio.
                </p>
                
                <div className="relative">
                  {formData.licenseImageUrl || licensePreview ? (
                    <div className="relative group">
                      <img
                        src={licensePreview || formData.licenseImageUrl || ''}
                        alt="Licencia de conducir"
                        className="w-full h-48 object-contain rounded-lg border-2 border-green-500 bg-white"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={handleRemoveLicense}
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
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 h-48 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors">
                      {licenseUploading ? (
                        <>
                          <Loader2 className="h-10 w-10 text-blue-500 mb-3 animate-spin" />
                          <p className="text-sm text-slate-600">Subiendo foto de licencia… por favor espera.</p>
                        </>
                      ) : (
                        <>
                          <Camera className="h-10 w-10 text-slate-400 mb-3" />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleLicenseSelect}
                            className="text-sm"
                          >
                            Subir Foto de Licencia
                          </Button>
                        </>
                      )}
                    </div>
                  )}

                  {/* Upload success message */}
                  {licenseUploadSuccess && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-center">
                      <p className="text-xs text-green-700">Licencia cargada correctamente.</p>
                    </div>
                  )}

                  {/* Upload error message */}
                  {licenseUploadError && (
                    <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-center">
                      <p className="text-xs text-amber-700">{licenseUploadError}</p>
                    </div>
                  )}

                  {/* Validation error */}
                  {errors.licenseImageUrl && (
                    <p className="text-sm text-red-500 mt-1">{errors.licenseImageUrl}</p>
                  )}

                  <input
                    ref={licenseInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLicenseFileChange}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isSubmitting || !formData.licenseImageUrl || licenseUploading}
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
                {!formData.licenseImageUrl && (
                  <p className="text-xs text-center text-amber-600 mt-2">
                    Debes subir una foto de tu licencia de conducir para continuar.
                  </p>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


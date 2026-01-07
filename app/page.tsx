"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Car } from "lucide-react"
import { supabaseClient } from "@/lib/supabase"

export default function Home() {
  const [plate, setPlate] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!plate.trim()) {
      return
    }

    setIsLoading(true)

    try {
      // Normalize plate: remove spaces, convert to uppercase
      const normalizedPlate = plate.trim().toUpperCase().replace(/\s+/g, "-")
      
      // Query the cars table by plate
      const { data, error: queryError } = await supabaseClient
        .from('cars')
        .select('plate, status')
        .eq('plate', normalizedPlate)
        .single()

      if (queryError) {
        // If no rows returned, the car doesn't exist
        if (queryError.code === 'PGRST116') {
          setError("Ese Jeep no está en nuestro sistema")
        } else {
          setError("Error al buscar el Jeep. Intenta de nuevo.")
          console.error('Error querying car:', queryError)
        }
        setIsLoading(false)
        return
      }

      // If car exists, allow to proceed (bypass temporal for testing)
      if (data) {
        // TEMPORAL BYPASS: Allow to proceed even if car is rented (for testing purposes)
        if (data.status !== 'available') {
          console.warn('⚠️ Car is rented, but allowing to proceed for testing')
          // Still redirect to allow testing the full flow
        }

        // Car exists - redirect (bypass status check for testing)
        router.push(`/rent/${normalizedPlate}`)
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      setError("Error al buscar el Jeep. Intenta de nuevo.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-primary/10 p-4">
              <Car className="h-12 w-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">Jeep Adventures Express</CardTitle>
          <CardDescription className="text-base">
            Scan & Go Rental - Rent Jeeps in Puerto Rico
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="plate" className="text-sm font-medium">
                Enter Plate Number
              </label>
              <Input
                id="plate"
                type="text"
                placeholder="e.g., JEEP-01"
                value={plate}
                onChange={(e) => {
                  setPlate(e.target.value)
                  setError("") // Clear error when user types
                }}
                className="text-center text-lg font-mono uppercase"
                autoFocus
                disabled={isLoading}
              />
              {error && (
                <p className="text-sm text-red-600 text-center font-medium">
                  {error}
                </p>
              )}
              <p className="text-xs text-muted-foreground text-center">
                Simulate scanning a QR code by entering a plate number
              </p>
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? "Buscando..." : "BUSCAR JEEP"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}


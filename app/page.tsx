"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Car } from "lucide-react"

export default function Home() {
  const [plate, setPlate] = useState("")
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (plate.trim()) {
      // Normalize plate: remove spaces, convert to uppercase
      const normalizedPlate = plate.trim().toUpperCase().replace(/\s+/g, "-")
      router.push(`/rent/${normalizedPlate}`)
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
                onChange={(e) => setPlate(e.target.value)}
                className="text-center text-lg font-mono uppercase"
                autoFocus
              />
              <p className="text-xs text-muted-foreground text-center">
                Simulate scanning a QR code by entering a plate number
              </p>
            </div>
            <Button type="submit" className="w-full" size="lg">
              Continue to Rental
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}


"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Unlock, Lock, MapPin, Clock } from "lucide-react"
import { useState } from "react"

export default function ActiveRentalPage() {
  const [isUnlocked, setIsUnlocked] = useState(false)

  // Mock data
  const rental = {
    plate: "JEEP-01",
    model: "Jeep Wrangler",
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  }

  const handleUnlock = () => {
    setIsUnlocked(true)
    // In production: Call SmartCar API to unlock vehicle
  }

  const handleLock = () => {
    setIsUnlocked(false)
    // In production: Call SmartCar API to lock vehicle
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2 pt-8">
          <h1 className="text-3xl font-bold">Active Rental</h1>
          <p className="text-muted-foreground">Manage your rental</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{rental.model}</CardTitle>
            <CardDescription>Plate: {rental.plate}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Rental Period</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(rental.startTime).toLocaleDateString()} - {new Date(rental.endTime).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <p className="text-sm font-semibold text-green-600">
                    {isUnlocked ? "Unlocked" : "Locked"}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t space-y-3">
              {!isUnlocked ? (
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleUnlock}
                >
                  <Unlock className="mr-2 h-5 w-5" />
                  Unlock Vehicle
                </Button>
              ) : (
                <Button 
                  className="w-full" 
                  size="lg"
                  variant="outline"
                  onClick={handleLock}
                >
                  <Lock className="mr-2 h-5 w-5" />
                  Lock Vehicle
                </Button>
              )}

              <Button 
                className="w-full" 
                size="lg"
                variant="destructive"
              >
                End Rental & Return Vehicle
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


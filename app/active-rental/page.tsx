"use client"

import { Button } from "@/components/ui/button"
import { Lock, Unlock } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function ActiveRentalPage() {
  const [isLocked, setIsLocked] = useState(true)
  const router = useRouter()

  const handleUnlock = () => {
    alert("Conectando satélite... Auto Abierto 🔓")
    setIsLocked(false)
  }

  const handleLock = () => {
    alert("Auto Cerrado 🔒")
    setIsLocked(true)
  }

  const handleEndTrip = () => {
    // TODO: Implement end trip functionality
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 flex flex-col">
      <div className="max-w-2xl mx-auto w-full space-y-8 flex-1 flex flex-col justify-center">
        {/* Header verde */}
        <div className="bg-green-500 text-white rounded-lg p-6 text-center shadow-lg">
          <h1 className="text-2xl md:text-3xl font-bold">
            ¡Pago Exitoso! Tu Jeep está listo
          </h1>
        </div>

        {/* Llave Digital - Centro */}
        <div className="flex flex-col items-center space-y-8">
          {/* Círculo grande con icono de candado */}
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center shadow-xl border-4 border-slate-400">
            {isLocked ? (
              <Lock className="w-16 h-16 md:w-20 md:h-20 text-slate-600" />
            ) : (
              <Unlock className="w-16 h-16 md:w-20 md:h-20 text-slate-600" />
            )}
          </div>

          {/* Botones enormes */}
          <div className="w-full space-y-4 max-w-md">
            {isLocked ? (
              <Button
                onClick={handleUnlock}
                className="w-full h-20 md:h-24 text-xl md:text-2xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                size="lg"
              >
                <Unlock className="mr-3 h-8 w-8 md:h-10 md:w-10" />
                ABRIR (UNLOCK)
              </Button>
            ) : (
              <Button
                onClick={handleLock}
                className="w-full h-20 md:h-24 text-xl md:text-2xl font-bold bg-slate-700 hover:bg-slate-800 text-white shadow-lg"
                size="lg"
              >
                <Lock className="mr-3 h-8 w-8 md:h-10 md:w-10" />
                CERRAR (LOCK)
              </Button>
            )}
          </div>
        </div>

        {/* Botón Finalizar Viaje */}
        <div className="pt-8">
          <Button
            onClick={handleEndTrip}
            className="w-full h-14 text-lg font-semibold bg-red-600 hover:bg-red-700 text-white shadow-lg"
            variant="destructive"
            size="lg"
          >
            Finalizar Viaje
          </Button>
        </div>
      </div>
    </div>
  )
}

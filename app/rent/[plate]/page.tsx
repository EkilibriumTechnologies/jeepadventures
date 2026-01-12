"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Car, Calendar, MapPin, CalendarDays } from "lucide-react"
import { DateRange } from "react-day-picker"
import { format, differenceInDays } from "date-fns"
import { cn } from "@/lib/utils"

interface RentPageProps {
  params: {
    plate: string
  }
}

const DAILY_RATE = 89.99

export default function RentPage({ params }: RentPageProps) {
  const { plate } = params
  const router = useRouter()
  const [date, setDate] = useState<DateRange | undefined>()

  // Mock data - In production, fetch from Supabase
  const mockCar = {
    plate: plate,
    model: "Jeep Wrangler",
    year: 2023,
    pricing_daily: DAILY_RATE,
    location_lat: 18.2208,
    location_lng: -66.5901,
    image_url: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800",
    status: "available"
  }

  if (!mockCar) {
    notFound()
  }

  // Calculate number of days
  const calculateDays = (): number => {
    if (!date?.from || !date?.to) return 0
    return differenceInDays(date.to, date.from) + 1 // +1 to include both start and end day
  }

  // Calculate total price
  const days = calculateDays()
  const totalPrice = days * DAILY_RATE

  // Handle reservation - redirect to rental process page first
  const handleReserve = () => {
    if (!date?.from || !date?.to) return

    const startDate = format(date.from, "yyyy-MM-dd")
    const endDate = format(date.to, "yyyy-MM-dd")
    
    router.push(
      `/rental-process?plate=${encodeURIComponent(plate)}&days=${days}&total=${totalPrice.toFixed(2)}&start=${startDate}&end=${endDate}`
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2 pt-8">
          <h1 className="text-3xl font-bold">Jeep Adventures Express</h1>
          <p className="text-muted-foreground">Plate: {plate}</p>
        </div>

        <Card>
          <div className="aspect-video w-full bg-slate-200 rounded-t-lg overflow-hidden">
            <img
              src={mockCar.image_url}
              alt={`${mockCar.model} ${plate}`}
              className="w-full h-full object-cover"
            />
          </div>
          <CardHeader>
            <CardTitle className="text-2xl">{mockCar.model} {mockCar.year}</CardTitle>
            <CardDescription>Plate: {plate}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Daily Rate</p>
                  <p className="text-2xl font-bold">${mockCar.pricing_daily}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Location</p>
                  <p className="text-sm">Puerto Rico</p>
                </div>
              </div>
            </div>

            {/* Date Range Picker */}
            <div className="pt-4 border-t space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Rental Dates</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {date?.from ? (
                        date.to ? (
                          <>
                            {format(date.from, "LLL dd, y")} -{" "}
                            {format(date.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(date.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      initialFocus
                      mode="range"
                      defaultMonth={date?.from}
                      selected={date}
                      onSelect={setDate}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Price Summary */}
              {date?.from && date?.to && (
                <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">
                      {days} {days === 1 ? "día" : "días"} x ${DAILY_RATE.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-2xl font-bold">${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Reserve Button */}
              <Button
                className="w-full"
                size="lg"
                disabled={!date?.from || !date?.to}
                onClick={handleReserve}
              >
                <Car className="mr-2 h-5 w-5" />
                Reserve Now
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


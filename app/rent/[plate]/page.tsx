import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Car, Calendar, MapPin } from "lucide-react"
import Link from "next/link"

interface RentPageProps {
  params: {
    plate: string
  }
}

export default function RentPage({ params }: RentPageProps) {
  const { plate } = params

  // Mock data - In production, fetch from Supabase
  const mockCar = {
    plate: plate,
    model: "Jeep Wrangler",
    year: 2023,
    pricing_daily: 89.99,
    location_lat: 18.2208,
    location_lng: -66.5901,
    image_url: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800",
    status: "available"
  }

  if (!mockCar) {
    notFound()
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

            <div className="pt-4 border-t">
              <Link href={`/checkout?plate=${plate}`}>
                <Button className="w-full" size="lg">
                  <Car className="mr-2 h-5 w-5" />
                  Reserve Now
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


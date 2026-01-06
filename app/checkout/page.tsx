"use client"

import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CreditCard, Calendar } from "lucide-react"

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const plate = searchParams.get("plate") || "JEEP-01"

  // Mock data
  const dailyRate = 89.99
  const days = 1
  const subtotal = dailyRate * days
  const deposit = 200.00
  const total = subtotal + deposit

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2 pt-8">
          <h1 className="text-3xl font-bold">Checkout</h1>
          <p className="text-muted-foreground">Complete your reservation</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Rental Summary</CardTitle>
            <CardDescription>Plate: {plate}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Daily Rate (1 day)</span>
                <span>${dailyRate.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Security Deposit</span>
                <span>${deposit.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold">Payment Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="card">Card Number</Label>
                <Input id="card" placeholder="1234 5678 9012 3456" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input id="expiry" placeholder="MM/YY" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input id="cvv" placeholder="123" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Cardholder Name</Label>
                <Input id="name" placeholder="John Doe" />
              </div>
            </div>

            <Button className="w-full" size="lg">
              <CreditCard className="mr-2 h-5 w-5" />
              Pay ${total.toFixed(2)} & Complete Reservation
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              By completing this reservation, you agree to our terms and conditions.
              The security deposit will be held and released after vehicle return.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


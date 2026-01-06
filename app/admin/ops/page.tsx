"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, Car, Users, Calendar } from "lucide-react"
import { useState } from "react"

export default function AdminOpsPage() {
  const [masterKey, setMasterKey] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // In production: Verify master key against Supabase
  const handleLogin = () => {
    if (masterKey === "ADMIN-2024") {
      setIsAuthenticated(true)
    } else {
      alert("Invalid master key")
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-primary" />
            <CardTitle>Admin Operations</CardTitle>
            <CardDescription>Enter master key to access</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="key">Master Key</Label>
              <Input
                id="key"
                type="password"
                placeholder="Enter master key"
                value={masterKey}
                onChange={(e) => setMasterKey(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
            <Button onClick={handleLogin} className="w-full" size="lg">
              Access Panel
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Demo key: ADMIN-2024
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center pt-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Operations</h1>
            <p className="text-muted-foreground">Manage vehicles and bookings</p>
          </div>
          <Button variant="outline" onClick={() => setIsAuthenticated(false)}>
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                <CardTitle>Vehicles</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">12</p>
              <p className="text-sm text-muted-foreground">Total vehicles</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <CardTitle>Bookings</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">8</p>
              <p className="text-sm text-muted-foreground">Active rentals</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <CardTitle>Users</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">156</p>
              <p className="text-sm text-muted-foreground">Total customers</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              Add New Vehicle
            </Button>
            <Button variant="outline" className="w-full justify-start">
              View All Bookings
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Manage Users
            </Button>
            <Button variant="outline" className="w-full justify-start">
              System Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


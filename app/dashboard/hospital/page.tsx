"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Building2, Activity, Users, Ambulance, LogOut, Settings, AlertTriangle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import AIChatbot from "@/components/ai-chatbot"

export default function HospitalDashboard() {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const [profileLoaded, setProfileLoaded] = useState(false)

  useEffect(() => {
    if (!user || user.role !== "hospital") {
      router.push("/auth/signin?role=hospital")
    }
  }, [user, router])

  useEffect(() => {
    // Simulate profile loading with delay
    const timer = setTimeout(() => {
      setProfileLoaded(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  if (!user) return null

  const profile = user.profile as any

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => router.push("/")}>
              <Heart className="h-6 w-6 text-red-600 fill-red-600 animate-heartbeat" />
              <h1 className="text-xl font-bold text-gray-900 hover:text-red-600 transition-colors">
                Medic AI - Hospital
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-green-600 border-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Online
              </Badge>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
              <Button variant="outline" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Chat Interface - At the top */}
        <div>
          <AIChatbot onEmergencyDetected={() => router.push("/emergency")} className="h-[600px]" />
        </div>

        {/* Hospital Profile & Stats - Below Chat */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Emergency Dashboard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <span>Emergency Dashboard</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="font-semibold text-gray-600 mb-2">No Active Emergency Requests</h3>
                  <p className="text-gray-500 text-sm mb-4">
                    Emergency requests will appear here when received from the system.
                  </p>
                  <Button
                    onClick={() => router.push("/emergency?mode=simulation")}
                    variant="outline"
                    className="border-blue-600 text-blue-600 hover:bg-blue-50"
                  >
                    View Simulation Mode
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Hospital Management */}
            <Card>
              <CardHeader>
                <CardTitle>Hospital Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center bg-transparent">
                    <Users className="h-6 w-6 mb-2 text-blue-500" />
                    <span className="text-sm">Staff</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center bg-transparent">
                    <Ambulance className="h-6 w-6 mb-2 text-green-500" />
                    <span className="text-sm">Ambulances</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center bg-transparent">
                    <Activity className="h-6 w-6 mb-2 text-purple-500" />
                    <span className="text-sm">Resources</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center bg-transparent">
                    <Settings className="h-6 w-6 mb-2 text-gray-500" />
                    <span className="text-sm">Settings</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-6">
            {profileLoaded ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Building2 className="h-5 w-5 text-green-600" />
                      <span>Hospital Profile</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {profile && (
                      <div>
                        <h3 className="font-semibold text-lg">{profile.hospitalName}</h3>
                        <p className="text-gray-600">{user.email}</p>
                        <p className="text-gray-600">{profile.address}</p>
                      </div>
                    )}

                    {profile && (
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Contact:</span>
                          <span className="font-medium">{profile.contactNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Type:</span>
                          <span className="font-medium">{profile.hospitalType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Ambulance:</span>
                          <Badge variant={profile.hasAmbulance ? "default" : "secondary"}>
                            {profile.hasAmbulance ? "Available" : "Not Available"}
                          </Badge>
                        </div>
                      </div>
                    )}

                    <Button className="w-full bg-transparent" variant="outline">
                      Edit Profile
                    </Button>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Activity className="h-5 w-5 text-blue-600" />
                      <span>Quick Stats</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">0</div>
                      <div className="text-sm text-blue-600">Active Requests</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">24</div>
                      <div className="text-sm text-green-600">Staff on Duty</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">12</div>
                      <div className="text-sm text-purple-600">Available Beds</div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Loading Hospital Data...</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6"></div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

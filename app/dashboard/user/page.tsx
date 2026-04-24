"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Heart,
  User,
  AlertTriangle,
  Clock,
  MapPin,
  Phone,
  LogOut,
  Settings,
  Camera,
  History,
  UserPlus,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { FirstAidModal } from "@/components/first-aid-modal"
import { FindHospitalModal } from "@/components/find-hospital-modal"
import { EmergencyContactsModal } from "@/components/emergency-contacts-modal"
import { SettingsModal } from "@/components/settings-modal"
import { EditProfileModal } from "@/components/edit-profile-modal"
import { ThirdPartyEmergencyModal } from "@/components/third-party-emergency-modal"

export default function UserDashboard() {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const [activeModal, setActiveModal] = useState<string | null>(null)

  useEffect(() => {
    if (!user || user.role !== "user") {
      router.push("/auth/signin?role=user")
    }
  }, [user, router])

  if (!user) return null

  const profile = user.profile as any

  const getInitials = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`
    }
    return user.username?.[0]?.toUpperCase() || "U"
  }

  const closeModal = () => setActiveModal(null)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => router.push("/")}>
              <Heart className="h-6 w-6 text-red-500" />
              <h1 className="text-xl font-bold text-gray-900 hover:text-red-600 transition-colors">Medic AI</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-green-600 border-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Online
              </Badge>
              <Button variant="ghost" size="icon" onClick={() => setActiveModal("settings")}>
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

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-blue-600" />
                  <span>Profile</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage
                        src={profile?.profilePicture || "/placeholder.svg"}
                        alt={`${user.firstName} ${user.lastName}`}
                      />
                      <AvatarFallback className="text-lg font-semibold bg-blue-100 text-blue-600">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="icon"
                      variant="outline"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-white"
                      onClick={() => setActiveModal("editProfile")}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="text-center">
                    <h3 className="font-semibold text-lg">
                      {user.firstName} {user.lastName}
                    </h3>
                    <p className="text-gray-600">@{user.username}</p>
                    <p className="text-gray-600">{user.email}</p>
                  </div>
                </div>

                {profile && (
                  <div className="space-y-3">
                    {profile.gender && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Gender:</span>
                        <span className="font-medium">{profile.gender}</span>
                      </div>
                    )}
                    {profile.bloodGroup && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Blood Group:</span>
                        <span className="font-medium text-red-600">{profile.bloodGroup}</span>
                      </div>
                    )}
                    {profile.genotype && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Genotype:</span>
                        <span className="font-medium">{profile.genotype}</span>
                      </div>
                    )}
                    {profile.medicalHistory && profile.medicalHistory.length > 0 && (
                      <div>
                        <span className="text-gray-600 block mb-2">Medical History:</span>
                        <div className="flex flex-wrap gap-1">
                          {profile.medicalHistory.map((condition: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {condition}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <Button
                  className="w-full bg-transparent"
                  variant="outline"
                  onClick={() => setActiveModal("editProfile")}
                >
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Emergency Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <span>Emergency Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Button
                    onClick={() => router.push("/emergency")}
                    className="bg-red-600 hover:bg-red-700 text-white py-6 text-lg font-semibold"
                    size="lg"
                  >
                    <Phone className="mr-2 h-5 w-5" />
                    Start Emergency
                  </Button>
                  <Button
                    onClick={() => router.push("/emergency?mode=simulation")}
                    variant="outline"
                    className="border-blue-600 text-blue-600 hover:bg-blue-50 py-6 text-lg font-semibold"
                    size="lg"
                  >
                    <MapPin className="mr-2 h-5 w-5" />
                    Try Simulation
                  </Button>
                </div>

                {/* Third Party Emergency */}
                <div className="pt-4 border-t">
                  <h4 className="font-medium text-gray-900 mb-3">Report Emergency for Someone Else</h4>
                  <Button
                    onClick={() => setActiveModal("thirdPartyEmergency")}
                    variant="outline"
                    className="w-full border-orange-600 text-orange-600 hover:bg-orange-50 py-4 text-base font-semibold"
                    size="lg"
                  >
                    <UserPlus className="mr-2 h-5 w-5" />
                    Third Party Emergency
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    Report an emergency for a family member, friend, or someone who cannot call themselves
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Emergency History */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-gray-600" />
                    <span>Emergency History</span>
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/user/history")}>
                    <History className="h-4 w-4 mr-2" />
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="font-semibold text-gray-600 mb-2">No Emergency History</h3>
                  <p className="text-gray-500 text-sm">Your emergency requests and responses will appear here.</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center bg-transparent hover:bg-red-50"
                    onClick={() => setActiveModal("firstAid")}
                  >
                    <Heart className="h-6 w-6 mb-2 text-red-500" />
                    <span className="text-sm">First Aid</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center bg-transparent hover:bg-blue-50"
                    onClick={() => setActiveModal("findHospital")}
                  >
                    <MapPin className="h-6 w-6 mb-2 text-blue-500" />
                    <span className="text-sm">Find Hospitals</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center bg-transparent hover:bg-green-50"
                    onClick={() => setActiveModal("emergencyContacts")}
                  >
                    <Phone className="h-6 w-6 mb-2 text-green-500" />
                    <span className="text-sm">Emergency Contacts</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center bg-transparent hover:bg-gray-50"
                    onClick={() => setActiveModal("settings")}
                  >
                    <Settings className="h-6 w-6 mb-2 text-gray-500" />
                    <span className="text-sm">Settings</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      {activeModal === "firstAid" && <FirstAidModal onClose={closeModal} />}
      {activeModal === "findHospital" && <FindHospitalModal onClose={closeModal} />}
      {activeModal === "emergencyContacts" && <EmergencyContactsModal onClose={closeModal} />}
      {activeModal === "settings" && <SettingsModal onClose={closeModal} />}
      {activeModal === "editProfile" && <EditProfileModal onClose={closeModal} />}
      {activeModal === "thirdPartyEmergency" && <ThirdPartyEmergencyModal onClose={closeModal} />}
    </div>
  )
}

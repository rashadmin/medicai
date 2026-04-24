"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Phone, MapPin, Wifi, WifiOff, Heart, Navigation, AlertTriangle, Info, Hospital, Car } from "lucide-react"
import { useRouter } from "next/navigation"

interface CachedHospital {
  id: string
  name: string
  address: string
  phone: string
  distance: number
  type: string
  hasAmbulance: boolean
  lat: number
  lng: number
  cachedAt: number
}

interface CachedLocation {
  lat: number
  lng: number
  city?: string
  state?: string
  country?: string
  accuracy: string
  cachedAt: number
}

interface EmergencyNumber {
  service: string
  number: string
  description: string
}

export default function OfflinePage() {
  const router = useRouter()
  const [isOnline, setIsOnline] = useState(true)
  const [cachedHospitals, setCachedHospitals] = useState<CachedHospital[]>([])
  const [cachedLocation, setCachedLocation] = useState<CachedLocation | null>(null)
  const [emergencyNumbers, setEmergencyNumbers] = useState<EmergencyNumber[]>([])
  const [lastSync, setLastSync] = useState<Date | null>(null)

  // Check online status
  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }

    window.addEventListener("online", updateOnlineStatus)
    window.addEventListener("offline", updateOnlineStatus)
    updateOnlineStatus()

    return () => {
      window.removeEventListener("online", updateOnlineStatus)
      window.removeEventListener("offline", updateOnlineStatus)
    }
  }, [])

  // Load cached data on component mount
  useEffect(() => {
    loadCachedData()
  }, [])

  const loadCachedData = () => {
    try {
      // Load cached hospitals
      const hospitalsData = localStorage.getItem("medic-ai-cached-hospitals")
      if (hospitalsData) {
        const hospitals = JSON.parse(hospitalsData)
        setCachedHospitals(hospitals)
      }

      // Load cached location
      const locationData = localStorage.getItem("medic-ai-cached-location")
      if (locationData) {
        const location = JSON.parse(locationData)
        setCachedLocation(location)

        // Set emergency numbers based on location
        setEmergencyNumbers(getEmergencyNumbers(location.country || "US"))
      }

      // Load last sync time
      const syncData = localStorage.getItem("medic-ai-last-sync")
      if (syncData) {
        setLastSync(new Date(JSON.parse(syncData)))
      }
    } catch (error) {
      console.error("Error loading cached data:", error)
    }
  }

  const getEmergencyNumbers = (country: string): EmergencyNumber[] => {
    const emergencyNumbersByCountry: Record<string, EmergencyNumber[]> = {
      US: [
        { service: "Emergency Services", number: "911", description: "Police, Fire, Medical Emergency" },
        { service: "Poison Control", number: "1-800-222-1222", description: "Poison emergencies and information" },
        { service: "Crisis Text Line", number: "Text HOME to 741741", description: "Mental health crisis support" },
        { service: "National Suicide Prevention", number: "988", description: "Suicide prevention lifeline" },
      ],
      CA: [
        { service: "Emergency Services", number: "911", description: "Police, Fire, Medical Emergency" },
        { service: "Poison Control", number: "1-844-764-7669", description: "Poison emergencies and information" },
        { service: "Crisis Services Canada", number: "1-833-456-4566", description: "Mental health crisis support" },
      ],
      GB: [
        { service: "Emergency Services", number: "999", description: "Police, Fire, Medical Emergency" },
        { service: "NHS Non-Emergency", number: "111", description: "Non-emergency medical advice" },
        { service: "Samaritans", number: "116 123", description: "Mental health crisis support" },
      ],
      AU: [
        { service: "Emergency Services", number: "000", description: "Police, Fire, Medical Emergency" },
        { service: "Poison Information", number: "13 11 26", description: "Poison emergencies and information" },
        { service: "Lifeline", number: "13 11 14", description: "Mental health crisis support" },
      ],
      IN: [
        { service: "Emergency Services", number: "112", description: "Police, Fire, Medical Emergency" },
        { service: "Ambulance", number: "108", description: "Medical emergency ambulance" },
        { service: "Police", number: "100", description: "Police emergency" },
        { service: "Fire", number: "101", description: "Fire emergency" },
      ],
    }

    return emergencyNumbersByCountry[country] || emergencyNumbersByCountry["US"]
  }

  const makeEmergencyCall = (number: string) => {
    // Remove non-numeric characters for tel: links
    const cleanNumber = number.replace(/[^\d+]/g, "")
    window.open(`tel:${cleanNumber}`)
  }

  const getDirectionsToHospital = (hospital: CachedHospital) => {
    if (cachedLocation) {
      const url = `https://www.google.com/maps/dir/${cachedLocation.lat},${cachedLocation.lng}/${hospital.lat},${hospital.lng}`
      window.open(url, "_blank")
    } else {
      const url = `https://www.google.com/maps/search/${encodeURIComponent(hospital.address)}`
      window.open(url, "_blank")
    }
  }

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`
    return "Recently"
  }

  const goToEmergencyMode = () => {
    if (isOnline) {
      router.push("/emergency")
    } else {
      // Show offline emergency guidance
      alert(
        "You are currently offline. Please use the emergency numbers below or try to get to a location with internet connectivity.",
      )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => router.push("/")}>
              <Heart className="h-6 w-6 text-red-500" />
              <h1 className="text-xl font-bold text-gray-900 hover:text-red-600 transition-colors">Medic AI</h1>
              <Badge variant="secondary" className="ml-2">
                OFFLINE MODE
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              {isOnline ? (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <Wifi className="w-3 h-3 mr-1" />
                  Online
                </Badge>
              ) : (
                <Badge variant="outline" className="text-red-600 border-red-600">
                  <WifiOff className="w-3 h-3 mr-1" />
                  Offline
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Offline Status Alert */}
          {!isOnline && (
            <Alert className="border-orange-200 bg-orange-50">
              <WifiOff className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>You are currently offline.</strong> This page shows cached emergency information from your last
                online session.
                {lastSync && <span className="block mt-1 text-sm">Last updated: {lastSync.toLocaleString()}</span>}
              </AlertDescription>
            </Alert>
          )}

          {/* Emergency Numbers */}
          <Card className="border-red-200">
            <CardHeader className="bg-red-50">
              <CardTitle className="flex items-center space-x-2 text-red-800">
                <Phone className="h-5 w-5" />
                <span>Emergency Numbers</span>
                {cachedLocation && (
                  <Badge variant="outline" className="ml-2">
                    {cachedLocation.country || "US"}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid gap-3">
                {emergencyNumbers.map((emergency, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{emergency.service}</h3>
                      <p className="text-sm text-gray-600">{emergency.description}</p>
                    </div>
                    <Button
                      onClick={() => makeEmergencyCall(emergency.number)}
                      className="bg-red-600 hover:bg-red-700 text-white"
                      size="sm"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      {emergency.number}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Current Location */}
          {cachedLocation && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <span>Your Last Known Location</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-gray-900">
                    {cachedLocation.city && cachedLocation.state
                      ? `${cachedLocation.city}, ${cachedLocation.state}`
                      : cachedLocation.country || "Unknown location"}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Accuracy: {cachedLocation.accuracy}</span>
                    <span>Cached: {formatTimeAgo(cachedLocation.cachedAt)}</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Coordinates: {cachedLocation.lat.toFixed(4)}, {cachedLocation.lng.toFixed(4)}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cached Hospitals */}
          {cachedHospitals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Hospital className="h-5 w-5 text-green-600" />
                  <span>Nearby Medical Facilities</span>
                  <Badge variant="secondary">{cachedHospitals.length} cached</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cachedHospitals.slice(0, 5).map((hospital) => (
                    <div key={hospital.id} className="border rounded-lg p-4 bg-white">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{hospital.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{hospital.address}</p>

                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Navigation className="h-4 w-4" />
                              <span>{hospital.distance} km</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Phone className="h-4 w-4" />
                              <span>{hospital.phone}</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {hospital.type.replace("_", " ").toUpperCase()}
                            </Badge>
                            {hospital.hasAmbulance && (
                              <Badge variant="default" className="text-xs bg-blue-600">
                                <Car className="h-3 w-3 mr-1" />
                                Ambulance
                              </Badge>
                            )}
                          </div>

                          <p className="text-xs text-gray-500 mt-2">Cached: {formatTimeAgo(hospital.cachedAt)}</p>
                        </div>

                        <div className="flex flex-col space-y-2 ml-4">
                          <Button onClick={() => makeEmergencyCall(hospital.phone)} size="sm" variant="outline">
                            <Phone className="h-4 w-4 mr-1" />
                            Call
                          </Button>
                          <Button onClick={() => getDirectionsToHospital(hospital)} size="sm" variant="outline">
                            <Navigation className="h-4 w-4 mr-1" />
                            Directions
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Cached Data */}
          {cachedHospitals.length === 0 && !cachedLocation && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-6 text-center">
                <AlertTriangle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">No Cached Data Available</h3>
                <p className="text-yellow-700 mb-4">
                  No offline emergency data is available. Connect to the internet and use the emergency feature to cache
                  nearby medical facilities.
                </p>
                <Button onClick={goToEmergencyMode} disabled={!isOnline}>
                  {isOnline ? "Go to Emergency Mode" : "Requires Internet Connection"}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Emergency Action Button */}
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Need Immediate Help?</h3>
              <p className="text-red-700 mb-4">
                For life-threatening emergencies, call emergency services immediately.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => makeEmergencyCall(emergencyNumbers[0]?.number || "911")}
                  className="bg-red-600 hover:bg-red-700"
                  size="lg"
                >
                  <Phone className="h-5 w-5 mr-2" />
                  Call {emergencyNumbers[0]?.number || "911"}
                </Button>
                <Button onClick={goToEmergencyMode} variant="outline" size="lg" disabled={!isOnline}>
                  <Heart className="h-5 w-5 mr-2" />
                  {isOnline ? "Emergency Mode" : "Offline - Use Phone Numbers Above"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Offline Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Info className="h-5 w-5 text-blue-600" />
                <span>Offline Emergency Guide</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-700">
                <div>
                  <h4 className="font-medium text-gray-900">1. Call Emergency Services</h4>
                  <p>Use the emergency numbers above for immediate help.</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">2. Use Cached Hospital Information</h4>
                  <p>Call nearby hospitals directly using the cached contact information.</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">3. Get to Internet Connection</h4>
                  <p>Try to reach a location with internet connectivity for full emergency features.</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">4. Ask for Help</h4>
                  <p>Ask nearby people for assistance or to use their phone if needed.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

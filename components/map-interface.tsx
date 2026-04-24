"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Navigation, Phone, Clock, Ambulance, Car, AlertTriangle } from "lucide-react"

interface Hospital {
  id: string
  name: string
  distance: number
  eta: number
  hasAmbulance: boolean
  score: number
  address: string
  phone: string
  lat: number
  lng: number
}

interface LocationInfo {
  lat: number
  lng: number
  city?: string
  state?: string
  country?: string
  street?: string
  accuracy: "precise" | "approximate" | "city_level"
}

interface MapInterfaceProps {
  hospital?: Hospital | null
  selectedHospital?: Hospital | null
  hospitals?: Hospital[]
  userLocation?: LocationInfo | null
  isSimulation?: boolean
  onHospitalSelect?: (hospital: Hospital) => void
}

export function MapInterface({
  hospital,
  selectedHospital,
  hospitals = [],
  userLocation,
  isSimulation = false,
  onHospitalSelect,
}: MapInterfaceProps) {
  const [isNavigating, setIsNavigating] = useState(false)
  const [estimatedArrival, setEstimatedArrival] = useState<string>("")

  // Use either hospital or selectedHospital, whichever is provided
  const activeHospital = hospital || selectedHospital

  useEffect(() => {
    if (activeHospital) {
      // Calculate estimated arrival time
      const now = new Date()
      const arrivalTime = new Date(now.getTime() + activeHospital.eta * 60000)
      setEstimatedArrival(arrivalTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))
    }
  }, [activeHospital])

  const handleStartNavigation = () => {
    if (!activeHospital) {
      console.warn("No hospital selected for navigation")
      return
    }

    // Validate coordinates
    if (!activeHospital.lat || !activeHospital.lng || isNaN(activeHospital.lat) || isNaN(activeHospital.lng)) {
      console.error("Invalid hospital coordinates:", activeHospital)
      alert("Unable to navigate: Invalid hospital location coordinates")
      return
    }

    setIsNavigating(true)

    try {
      console.log(
        "Starting navigation to:",
        activeHospital.name,
        "at coordinates:",
        activeHospital.lat,
        activeHospital.lng,
      )

      // Use exact coordinates for navigation
      const lat = activeHospital.lat
      const lng = activeHospital.lng

      // Detect platform and open appropriate maps app
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
      const isAndroid = /Android/.test(navigator.userAgent)

      let navigationUrl = ""

      if (isIOS) {
        // Try Apple Maps first on iOS
        navigationUrl = `maps://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`

        // Fallback to Google Maps if Apple Maps fails
        const fallbackUrl = `https://maps.google.com/maps?daddr=${lat},${lng}&amp;ll=`

        window.location.href = navigationUrl

        // Check if Apple Maps opened, if not, use Google Maps
        setTimeout(() => {
          window.open(fallbackUrl, "_blank")
        }, 1000)
      } else if (isAndroid) {
        // Use Google Maps on Android
        navigationUrl = `google.navigation:q=${lat},${lng}`

        // Fallback to web version
        const fallbackUrl = `https://maps.google.com/maps?daddr=${lat},${lng}&amp;ll=`

        try {
          window.location.href = navigationUrl
        } catch (error) {
          window.open(fallbackUrl, "_blank")
        }
      } else {
        // Desktop or other platforms - use Google Maps web
        navigationUrl = `https://maps.google.com/maps?daddr=${lat},${lng}&amp;ll=`
        window.open(navigationUrl, "_blank")
      }

      console.log("Navigation URL:", navigationUrl)
    } catch (error) {
      console.error("Navigation error:", error)

      // Fallback: copy coordinates to clipboard
      if (navigator.clipboard && activeHospital.lat && activeHospital.lng) {
        const coordinates = `${activeHospital.lat}, ${activeHospital.lng}`
        navigator.clipboard
          .writeText(coordinates)
          .then(() => {
            alert(`Navigation failed. Hospital coordinates copied to clipboard: ${coordinates}`)
          })
          .catch(() => {
            alert(`Navigation failed. Hospital coordinates: ${coordinates}`)
          })
      } else {
        alert(`Navigation failed. Please manually navigate to: ${activeHospital.address}`)
      }
    } finally {
      setIsNavigating(false)
    }
  }

  const handleCallHospital = () => {
    if (activeHospital?.phone && activeHospital.phone !== "Phone not available") {
      window.location.href = `tel:${activeHospital.phone}`
    }
  }

  // If no hospital is selected, show a placeholder
  if (!activeHospital) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Navigation</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Select a medical facility to start navigation</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Hospital Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            <span>Selected Facility</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg">{activeHospital.name}</h3>
            <p className="text-gray-600 text-sm">{activeHospital.address}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span>{activeHospital.distance} km away</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span>{activeHospital.eta} min ETA</span>
            </div>
          </div>

          {activeHospital.hasAmbulance && (
            <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Ambulance className="h-5 w-5 text-blue-600" />
              <span className="text-blue-800 font-medium">Ambulance Available</span>
            </div>
          )}

          {estimatedArrival && (
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <span className="text-green-800 font-medium">Estimated Arrival:</span>
                <span className="text-green-600">{estimatedArrival}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Navigation className="h-5 w-5 text-green-600" />
            <span>Navigation & Contact</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={handleStartNavigation}
            disabled={isNavigating}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            {isNavigating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Opening Navigation...
              </>
            ) : (
              <>
                <Navigation className="h-4 w-4 mr-2" />
                Start Navigation
              </>
            )}
          </Button>

          {activeHospital.phone && activeHospital.phone !== "Phone not available" && (
            <Button onClick={handleCallHospital} variant="outline" className="w-full bg-transparent" size="lg">
              <Phone className="h-4 w-4 mr-2" />
              Call Hospital
            </Button>
          )}

          <div className="text-xs text-gray-500 text-center">Navigation will open in your default maps app</div>
        </CardContent>
      </Card>

      {/* Live Tracking Simulation */}
      {isSimulation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Car className="h-5 w-5 text-orange-600" />
              <span>Live Tracking</span>
              <Badge variant="secondary">SIMULATION</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                  <span className="text-orange-800 font-medium">En Route</span>
                </div>
                <span className="text-orange-600">{activeHospital.eta} min remaining</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Progress</span>
                  <span className="text-gray-600">65%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full w-2/3 transition-all duration-1000"></div>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                <p>🚗 Current location: Main Street</p>
                <p>📍 Next turn: Right on Hospital Drive in 0.5 km</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Emergency Instructions */}
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-red-800 mb-1">Emergency Instructions:</p>
              <ul className="text-red-700 space-y-1">
                <li>• Drive safely and follow traffic laws</li>
                <li>• Call 911 if condition worsens</li>
                <li>• Have emergency contacts ready</li>
                <li>• Bring ID and insurance information</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Export both named and default exports for compatibility
export default MapInterface

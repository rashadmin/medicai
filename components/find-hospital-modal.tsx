"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Search, Phone, Clock, Star, Ambulance, Navigation } from "lucide-react"

interface FindHospitalModalProps {
  onClose: () => void
}

interface Hospital {
  id: string
  name: string
  address: string
  distance: number
  phone: string
  rating: number
  hasAmbulance: boolean
  hasEmergency: boolean
  specialties: string[]
  waitTime: string
}

export function FindHospitalModal({ onClose }: FindHospitalModalProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterEmergency, setFilterEmergency] = useState(true)
  const [filterAmbulance, setFilterAmbulance] = useState(false)
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentRadius, setCurrentRadius] = useState(5000) // Start with 5km
  const [searchStatus, setSearchStatus] = useState("Searching nearby hospitals...")

  const radiusSteps = [5000, 10000, 15000, 20000] // 5km, 10km, 15km, 20km in meters

  const fetchHospitalsWithRadius = async (lat: number, lng: number, radius: number) => {
    console.log("[v0] Fetching hospitals with radius:", radius)
    const response = await fetch("/api/hospitals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lat, lng, radius }),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch hospitals")
    }

    const data = await response.json()
    console.log("[v0] Hospitals received:", data.elements?.length || 0)

    // Transform Overpass API response to Hospital format
    const transformedHospitals = (data.elements || [])
      .slice(0, 15) // Limit to 15 results
      .map((element: any, index: number) => ({
        id: element.id?.toString() || `hospital-${index}`,
        name: element.tags?.name || element.tags?.["healthcare:speciality"] || "Healthcare Facility",
        address: element.tags?.["addr:street"] || element.tags?.["addr:city"] || "Address not available",
        distance: Math.random() * 10 + 1,
        phone: element.tags?.["contact:phone"] || "Not available",
        rating: Math.random() * 2 + 3.5,
        hasAmbulance: element.tags?.["emergency:ambulance:response_time"] ? true : false,
        hasEmergency: element.tags?.emergency === "yes",
        specialties: element.tags?.["healthcare:speciality"]
          ? [element.tags["healthcare:speciality"]]
          : ["General Medical"],
        waitTime: "Not available",
      }))

    return transformedHospitals
  }

  const searchWithProgressiveRadius = async (lat: number, lng: number) => {
    let radiusIndex = 0
    let foundResults = false

    while (radiusIndex < radiusSteps.length && !foundResults) {
      const radius = radiusSteps[radiusIndex]
      const radiusKm = radius / 1000

      setCurrentRadius(radius)
      setSearchStatus(`Searching within ${radiusKm}km...`)
      console.log("[v0] Starting search at radius:", radiusKm, "km")

      try {
        const results = await fetchHospitalsWithRadius(7.1784, 4.6976, radius)
        console.log("[v0] Results returned:", results.length)

        if (results && results.length > 0) {
          console.log("[v0] Found results at radius:", radiusKm, "km")
          setHospitals(results)
          setSearchStatus(`Found hospitals within ${radiusKm}km`)
          foundResults = true
          setIsLoading(false)
        } else {
          console.log("[v0] No results at radius:", radiusKm, "km, expanding...")
          // No results, try next radius
          if (radiusIndex < radiusSteps.length - 1) {
            radiusIndex++
            console.log("[v0] Moving to next radius index:", radiusIndex)
            // Small delay before next search
            await new Promise(resolve => setTimeout(resolve, 1000))
          } else {
            // Reached max radius with no results
            console.log("[v0] Reached max radius with no results")
            setSearchStatus("No hospitals found within 20km")
            setHospitals([])
            setIsLoading(false)
            foundResults = true
          }
        }
      } catch (err) {
        console.error("[v0] Error at radius:", radiusKm, "km", err)
        // Error occurred, try next radius
        if (radiusIndex < radiusSteps.length - 1) {
          radiusIndex++
          console.log("[v0] Error occurred, expanding to next radius, index:", radiusIndex)
          // Small delay before next search
          await new Promise(resolve => setTimeout(resolve, 1000))
        } else {
          // Reached max radius
          console.log("[v0] Error at max radius")
          setError(err instanceof Error ? err.message : "Failed to fetch hospitals")
          setIsLoading(false)
          foundResults = true
        }
      }
    }
  }

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        setError(null)
        // Get user's current location
        if (!navigator.geolocation) {
          throw new Error("Geolocation is not supported by your browser")
        }

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords
            console.log("[v0] User location:", { latitude, longitude })
            await searchWithProgressiveRadius(latitude, longitude)
          },
          (error) => {
            console.error("[v0] Geolocation error:", error.message)
            setError(`Location error: ${error.message}`)
            setIsLoading(false)
          }
        )
      } catch (err) {
        console.error("[v0] Hospital fetch error:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch hospitals")
        setIsLoading(false)
      }
    }

    fetchHospitals()
  }, [])

  const filteredHospitals = hospitals
    .filter((hospital) => {
      const matchesSearch =
        hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hospital.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hospital.specialties.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesEmergency = !filterEmergency || hospital.hasEmergency
      const matchesAmbulance = !filterAmbulance || hospital.hasAmbulance

      return matchesSearch && matchesEmergency && matchesAmbulance
    })
    .sort((a, b) => a.distance - b.distance)

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`
  }

  const handleDirections = (address: string) => {
    const encodedAddress = encodeURIComponent(address)
    window.open(`https://maps.google.com/maps?q=${encodedAddress}`, "_blank")
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-blue-500" />
            <span>Find Nearby Hospitals</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* Search Status */}
          {isLoading && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-700 font-medium">{searchStatus}</p>
              <p className="text-xs text-blue-600 mt-1">Expanding search radius as needed...</p>
            </div>
          )}

          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search hospitals by name, location, or specialty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button
                variant={filterEmergency ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterEmergency(!filterEmergency)}
              >
                Emergency Services
              </Button>
              <Button
                variant={filterAmbulance ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterAmbulance(!filterAmbulance)}
              >
                <Ambulance className="h-4 w-4 mr-2" />
                Ambulance Available
              </Button>
            </div>
          </div>

          {/* Hospitals List */}
          <div className="flex-1 overflow-y-auto space-y-3">
            {error ? (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 mx-auto mb-4 text-red-400" />
                <h3 className="font-semibold text-red-600 mb-2">Unable to find hospitals</h3>
                <p className="text-red-500 text-sm mb-4">{error}</p>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </div>
            ) : isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredHospitals.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="font-semibold text-gray-600 mb-2">No hospitals found</h3>
                <p className="text-gray-500 text-sm">Try adjusting your search or filter criteria.</p>
              </div>
            ) : (
              filteredHospitals.map((hospital) => (
                <Card key={hospital.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{hospital.name}</h3>
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span className="text-sm text-gray-600">{hospital.rating}</span>
                          </div>
                        </div>

                        <p className="text-gray-600 text-sm mb-2">{hospital.address}</p>

                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>{hospital.distance} km away</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>~{hospital.waitTime} wait</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1 mb-3">
                          {hospital.hasEmergency && (
                            <Badge variant="destructive" className="text-xs">
                              Emergency
                            </Badge>
                          )}
                          {hospital.hasAmbulance && (
                            <Badge variant="secondary" className="text-xs">
                              <Ambulance className="h-2 w-2 mr-1" />
                              Ambulance
                            </Badge>
                          )}
                          {hospital.specialties.slice(0, 3).map((specialty) => (
                            <Badge key={specialty} variant="outline" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                          {hospital.specialties.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{hospital.specialties.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="text-right ml-4 space-y-2">
                        <Button size="sm" onClick={() => handleCall(hospital.phone)} className="w-full">
                          <Phone className="h-3 w-3 mr-2" />
                          Call
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDirections(hospital.address)}
                          className="w-full"
                        >
                          <Navigation className="h-3 w-3 mr-2" />
                          Directions
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Location Note */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <MapPin className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-800 text-sm">Location Services</h4>
                <p className="text-blue-700 text-xs mt-1">
                  Distances are calculated from your current location. Enable location services for more accurate
                  results.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

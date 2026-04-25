"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Ambulance, Phone, Heart, Building2, AlertTriangle } from "lucide-react"
import { ChatInterface } from "@/components/chat-interface"
import { HospitalSelection } from "@/components/hospital-selection"
import { MapInterface } from "@/components/map-interface"
import { FirstAidPanel } from "@/components/first-aid-panel"
import { AutoSelectModal } from "@/components/auto-select-modal"
import { HospitalSimulationView } from "@/components/hospital-simulation-view"
import { useAuth } from "@/contexts/auth-context"
import { OfflineDetector } from "@/components/offline-detector"

interface MedicalFacility {
  id: string
  name: string
  type:
  | "hospital"
  | "clinic"
  | "urgent_care"
  | "emergency_room"
  | "medical_center"
  | "diagnostic_center"
  | "pharmacy"
  | "laboratory"
  distance: number
  eta: number
  hasAmbulance: boolean
  score: number
  address: string
  phone: string
  lat: number
  lng: number
  services: string[]
  availability: "24/7" | "limited" | "emergency_only"
  accepted?: boolean
}

interface EmergencyData {
  type: string
  severity: string
  location: string
  description: string
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

export default function EmergencyPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  const isSimulation = searchParams.get("mode") === "simulation"

  // Redirect to auth if not authenticated and not simulation
  useEffect(() => {
    if (!isSimulation && !user) {
      router.push("/auth/signin")
      return
    }
  }, [user, isSimulation, router])

  const [step, setStep] = useState<"chat" | "hospitals" | "selected" | "tracking">("chat")
  const [emergencyData, setEmergencyData] = useState<EmergencyData | null>(null)
  const [medicalFacilities, setMedicalFacilities] = useState<MedicalFacility[]>([])
  const [allFacilities, setAllFacilities] = useState<MedicalFacility[]>([])
  const [selectedFacility, setSelectedFacility] = useState<MedicalFacility | null>(null)
  const [showAutoSelect, setShowAutoSelect] = useState(false)
  const [showHospitalView, setShowHospitalView] = useState(false)
  const [inactivityTimer, setInactivityTimer] = useState(120)
  const [isLoading, setIsLoading] = useState(false)
  const [isContactingHospitals, setIsContactingHospitals] = useState(false)
  const [countdownStarted, setCountdownStarted] = useState(false)

  const countdownRef = useRef<NodeJS.Timeout>()
  const countdownStartTimeRef = useRef<number | null>(null)

  // ✅ Refs to avoid stale closures in intervals
  const medicalFacilitiesRef = useRef<MedicalFacility[]>([])
  const userLocationRef = useRef<LocationInfo | null>(null)

  const [userLocation, setUserLocation] = useState<LocationInfo | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [isGettingLocation, setIsGettingLocation] = useState(true)
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false)
  const [locationAttempts, setLocationAttempts] = useState(0)
  const [hospitalsError, setHospitalsError] = useState<string | null>(null)
  const [isFetchingHospitals, setIsFetchingHospitals] = useState(false)
  const [currentRadius, setCurrentRadius] = useState(5000)

  // ✅ Keep refs in sync with state
  useEffect(() => {
    medicalFacilitiesRef.current = medicalFacilities
  }, [medicalFacilities])

  useEffect(() => {
    userLocationRef.current = userLocation
  }, [userLocation])

  // Request location permission immediately when component mounts
  useEffect(() => {
    requestLocationPermission()
  }, [])

  const requestLocationPermission = async () => {
    setIsGettingLocation(true)
    setLocationError(null)
    setLocationPermissionDenied(false)

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser.")
      await getLocationFromIP()
      return
    }

    if ("permissions" in navigator) {
      try {
        const permission = await navigator.permissions.query({ name: "geolocation" })
        if (permission.state === "denied") {
          setLocationPermissionDenied(true)
          setLocationError("Location access is blocked. Using approximate location based on your internet connection.")
          await getLocationFromIP()
          return
        }
      } catch (error) {
        console.warn("Could not check geolocation permission:", error)
      }
    }

    const tryGeolocation = (highAccuracy: boolean, timeout: number) => {
      return new Promise<LocationInfo>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: "precise",
            })
          },
          (error) => {
            reject(error)
          },
          {
            enableHighAccuracy: highAccuracy,
            timeout: timeout,
            maximumAge: highAccuracy ? 300000 : 600000,
          },
        )
      })
    }

    try {
      console.log("Attempting high accuracy geolocation...")
      const location = await tryGeolocation(true, 15000)
      setUserLocation(location)
      setIsGettingLocation(false)
      setLocationError(null)
      console.log("Got precise location:", location)
      return
    } catch (error: any) {
      console.warn("High accuracy geolocation failed:", error)

      try {
        console.log("Attempting lower accuracy geolocation...")
        const location = await tryGeolocation(false, 10000)
        setUserLocation({ ...location, accuracy: "approximate" })
        setIsGettingLocation(false)
        setLocationError("Using approximate GPS location.")
        console.log("Got approximate location:", location)
        return
      } catch (secondError: any) {
        console.warn("Lower accuracy geolocation also failed:", secondError)

        let errorMessage = "Unable to get your precise location."
        switch (secondError.code) {
          case secondError.PERMISSION_DENIED:
            setLocationPermissionDenied(true)
            errorMessage = "Location access denied. Using approximate location based on your internet connection."
            break
          case secondError.POSITION_UNAVAILABLE:
            errorMessage = "GPS location is unavailable. Using approximate location based on your internet connection."
            break
          case secondError.TIMEOUT:
            errorMessage = "GPS location request timed out. Using approximate location based on your internet connection."
            break
          default:
            errorMessage = "GPS location failed. Using approximate location based on your internet connection."
        }

        setLocationError(errorMessage)
        await getLocationFromIP()
      }
    }
  }

  const getLocationFromIP = async () => {
    try {
      console.log("Attempting to get location from IP...")

      const services = [
        {
          name: "ipapi.co",
          url: "https://ipapi.co/json/",
          parser: (data: any) => {
            if (data.latitude && data.longitude && !data.error) {
              return {
                lat: Number.parseFloat(data.latitude),
                lng: Number.parseFloat(data.longitude),
                city: data.city,
                state: data.region,
                country: data.country_name,
                accuracy: "city_level" as const,
              }
            }
            return null
          },
        },
        {
          name: "ip-api.com",
          url: "https://ip-api.com/json/",
          parser: (data: any) => {
            if (data.lat && data.lon && data.status === "success") {
              return {
                lat: Number.parseFloat(data.lat),
                lng: Number.parseFloat(data.lon),
                city: data.city,
                state: data.regionName,
                country: data.country,
                accuracy: "city_level" as const,
              }
            }
            return null
          },
        },
        {
          name: "ipinfo.io",
          url: "https://ipinfo.io/json",
          parser: (data: any) => {
            if (data.loc && !data.error) {
              const [lat, lng] = data.loc.split(",").map((coord: string) => Number.parseFloat(coord.trim()))
              if (!isNaN(lat) && !isNaN(lng)) {
                return {
                  lat,
                  lng,
                  city: data.city,
                  state: data.region,
                  country: data.country,
                  accuracy: "city_level" as const,
                }
              }
            }
            return null
          },
        },
        {
          name: "ipgeolocation.io",
          url: "https://api.ipgeolocation.io/ipgeo?apiKey=free",
          parser: (data: any) => {
            if (data.latitude && data.longitude && !data.error) {
              return {
                lat: Number.parseFloat(data.latitude),
                lng: Number.parseFloat(data.longitude),
                city: data.city,
                state: data.state_prov,
                country: data.country_name,
                accuracy: "city_level" as const,
              }
            }
            return null
          },
        },
      ]

      for (const service of services) {
        try {
          console.log(`Trying ${service.name}...`)

          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 8000)

          const response = await fetch(service.url, {
            headers: {
              Accept: "application/json",
              "User-Agent": "MedicAI/1.0",
            },
            signal: controller.signal,
          })

          clearTimeout(timeoutId)

          if (!response.ok) {
            console.warn(`${service.name} returned ${response.status}`)
            continue
          }

          const data = await response.json()
          console.log(`Response from ${service.name}:`, data)

          const location = service.parser(data)

          if (location && location.lat && location.lng && !isNaN(location.lat) && !isNaN(location.lng)) {
            if (location.lat >= -90 && location.lat <= 90 && location.lng >= -180 && location.lng <= 180) {
              console.log(`Successfully got IP location from ${service.name}:`, location)
              setUserLocation(location)
              setIsGettingLocation(false)
              if (!locationPermissionDenied) {
                const locationDesc =
                  location.city && location.state
                    ? `${location.city}, ${location.state}`
                    : location.country || "your area"
                setLocationError(`Using approximate location for ${locationDesc}.`)
              }
              return
            }
          }
        } catch (serviceError: any) {
          console.warn(`Failed to get location from ${service.name}:`, serviceError.message)
          continue
        }
      }

      console.error("All IP geolocation services failed")
      setLocationError("Unable to determine your location. Showing medical facilities from major cities.")
      setIsGettingLocation(false)

      const majorCities = [
        { name: "New York", lat: 40.7128, lng: -74.006, state: "NY" },
        { name: "Los Angeles", lat: 34.0522, lng: -118.2437, state: "CA" },
        { name: "Chicago", lat: 41.8781, lng: -87.6298, state: "IL" },
        { name: "Houston", lat: 29.7604, lng: -95.3698, state: "TX" },
        { name: "Phoenix", lat: 33.4484, lng: -112.074, state: "AZ" },
      ]

      const randomCity = majorCities[Math.floor(Math.random() * majorCities.length)]
      setUserLocation({
        lat: randomCity.lat,
        lng: randomCity.lng,
        city: randomCity.name,
        state: randomCity.state,
        country: "United States",
        accuracy: "city_level",
      })
    } catch (error) {
      console.error("Error getting IP location:", error)
      setLocationError("Unable to determine your location. Showing medical facilities from major cities.")
      setIsGettingLocation(false)

      setUserLocation({
        lat: 40.7128,
        lng: -74.006,
        city: "New York",
        state: "NY",
        country: "United States",
        accuracy: "city_level",
      })
    }
  }

  const retryLocation = async () => {
    setLocationAttempts((prev) => prev + 1)
    if (locationAttempts < 2) {
      await requestLocationPermission()
    } else {
      await getLocationFromIP()
    }
  }

  const processFacilityData = (data: any, location: LocationInfo) => {
    return data.elements
      .filter((element: any) => {
        return true // filters disabled for testing
      })
      .map((element: any, index: number) => {
        const tags = element.tags || {}
        const lat = element.lat || element.center?.lat || location.lat
        const lng = element.lon || element.center?.lon || location.lng
        const distance = calculateDistance(location.lat, location.lng, lat, lng)
        const eta = Math.round(distance * 2.5)

        let facilityType: MedicalFacility["type"] = "medical_center"
        if (tags.amenity === "hospital" || tags.healthcare === "hospital") {
          facilityType = "hospital"
        } else if (tags.amenity === "clinic" || tags.healthcare === "clinic") {
          facilityType = "clinic"
        } else if (tags.amenity === "pharmacy") {
          facilityType = "pharmacy"
        } else if (tags.healthcare === "laboratory") {
          facilityType = "laboratory"
        } else if (tags.healthcare === "diagnostic_centre") {
          facilityType = "diagnostic_center"
        } else if (tags.emergency === "yes") {
          facilityType = "emergency_room"
        } else if (tags.healthcare === "centre") {
          facilityType = "medical_center"
        } else if (tags["healthcare:speciality"]) {
          facilityType = "clinic"
        }

        const services: string[] = []
        if (tags.emergency === "yes") services.push("Emergency Care")
        if (tags["healthcare:speciality"]) {
          const specialities = tags["healthcare:speciality"].split(";")
          services.push(...specialities.slice(0, 2))
        }
        if (facilityType === "hospital") services.push("Inpatient Care", "Surgery")
        if (facilityType === "clinic") services.push("Outpatient Care")
        if (facilityType === "pharmacy") services.push("Prescription Drugs", "Medical Supplies")
        if (facilityType === "laboratory") services.push("Lab Tests", "Diagnostics")
        if (facilityType === "diagnostic_center") services.push("Medical Imaging", "Diagnostics")
        if (services.length === 0) services.push("General Medical Care")

        let availability: MedicalFacility["availability"] = "limited"
        if (
          tags.opening_hours === "24/7" ||
          facilityType === "hospital" ||
          facilityType === "emergency_room"
        ) {
          availability = "24/7"
        } else if (tags.emergency === "yes") {
          availability = "emergency_only"
        }

        return {
          id: element.id?.toString() || `facility_${index}`,
          name:
            tags.name ||
            tags["name:en"] ||
            tags.operator ||
            tags.brand ||
            `Medical Facility ${index + 1}`,
          type: facilityType,
          distance: Math.round(distance * 10) / 10,
          eta: Math.max(5, eta),
          hasAmbulance: facilityType === "hospital" || facilityType === "emergency_room" || Math.random() > 0.7,
          score: Math.floor(Math.random() * 20) + 80,
          address:
            tags["addr:full"] ||
            `${tags["addr:housenumber"] || ""} ${tags["addr:street"] || ""}`.trim() ||
            tags["addr:city"] ||
            "Address not available",
          phone:
            tags.phone || tags["contact:phone"] || tags.telephone || "Phone not available",
          lat,
          lng,
          services,
          availability,
        }
      })
      .sort((a: MedicalFacility, b: MedicalFacility) => a.distance - b.distance)
      .slice(0, 20)
  }

  const fetchNearbyMedicalFacilities = async (location: LocationInfo) => {
    setIsFetchingHospitals(true)
    setHospitalsError(null)

    // ⚠️ Remove this override when done testing
    location = { ...location, lat: 7.1784, lng: 4.6976 }

    const radiusSteps = [5000, 10000, 15000, 20000, 30000, 40000, 50000]
    let radiusIndex = 0
    let foundResults = false

    try {
      while (radiusIndex < radiusSteps.length && !foundResults) {
        const radius = radiusSteps[radiusIndex]
        const radiusKm = radius / 1000

        console.log(`[v0] Searching for facilities within ${radiusKm}km...`)
        setCurrentRadius(radius)
        setHospitalsError(`Searching for hospitals within ${radiusKm}km...`)

        try {
          const response = await fetch("/api/hospitals", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ lat: location.lat, lng: location.lng, radius }),
          })

          if (!response.ok) {
            throw new Error(`Backend API returned ${response.status}`)
          }

          const data = await response.json()
          console.log(`[v0] API response for ${radiusKm}km radius:`, data.elements?.length || 0)

          if (data.elements && data.elements.length > 0) {
            console.log(`[v0] Processing ${data.elements.length} elements from API...`)
            const facilityData = processFacilityData(data, location)
            console.log(`[v0] After processing: ${facilityData.length} valid facilities`)

            if (facilityData.length >= 3) {
              console.log(`[v0] Found ${facilityData.length} facilities within ${radiusKm}km - sufficient results`)
              setAllFacilities(facilityData)
              setMedicalFacilities(facilityData)
              setHospitalsError(null)
              foundResults = true
              setIsFetchingHospitals(false)
            } else if (facilityData.length > 0 && facilityData.length < 3) {
              if (radiusIndex < radiusSteps.length - 1) {
                radiusIndex++
                console.log(`[v0] Only ${facilityData.length} facilities at ${radiusKm}km, expanding to ${radiusSteps[radiusIndex] / 1000}km...`)
              } else {
                // Max radius reached, use what we have
                console.log(`[v0] Max radius reached with ${facilityData.length} facilities`)
                setAllFacilities(facilityData)
                setMedicalFacilities(facilityData)
                setHospitalsError(null)
                foundResults = true
                setIsFetchingHospitals(false)
              }
            } else {
              if (radiusIndex < radiusSteps.length - 1) {
                radiusIndex++
                console.log(`[v0] No valid facilities at ${radiusKm}km, expanding to ${radiusSteps[radiusIndex] / 1000}km...`)
              } else {
                setAllFacilities([])
                setMedicalFacilities([])
                setHospitalsError("No hospitals found within 50km. Please check the location or try again.")
                setIsFetchingHospitals(false)
                foundResults = true
              }
            }
          } else {
            if (radiusIndex < radiusSteps.length - 1) {
              radiusIndex++
              console.log(`[v0] No results at ${radiusKm}km, expanding to ${radiusSteps[radiusIndex] / 1000}km...`)
            } else {
              setAllFacilities([])
              setMedicalFacilities([])
              setHospitalsError("No hospitals found within 50km. Please check the location or try again.")
              setIsFetchingHospitals(false)
              foundResults = true
            }
          }
        } catch (fetchError: any) {
          console.error(`[v0] Error fetching at ${radiusKm}km radius:`, fetchError)

          if (radiusIndex < radiusSteps.length - 1) {
            radiusIndex++
            console.log(`[v0] Error at ${radiusKm}km, expanding to ${radiusSteps[radiusIndex] / 1000}km...`)
          } else {
            let errorMsg = "Unable to fetch hospital data"
            if (fetchError.name === "AbortError") {
              console.log("[v0] Overpass API request was aborted due to timeout")
              errorMsg = "Hospital search took too long to respond. Please try again."
            } else {
              console.warn("[v0] Hospital API fetch failed:", fetchError.message)
            }

            setHospitalsError(errorMsg)
            setAllFacilities([])
            setMedicalFacilities([])
            setIsFetchingHospitals(false)
            foundResults = true
          }
        }
      }
    } catch (error) {
      console.error("[v0] Error in fetchNearbyMedicalFacilities:", error)
      setHospitalsError("Unable to locate hospitals. Please check your location and try again.")
      setAllFacilities([])
      setMedicalFacilities([])
      setIsFetchingHospitals(false)
    }
  }

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLng = ((lng2 - lng1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const retryFetchHospitals = async () => {
    if (userLocation) {
      console.log("[v0] Retrying hospital fetch...")
      await fetchNearbyMedicalFacilities(userLocation)
    }
  }

  useEffect(() => {
    if (userLocation) {
      console.log("[v0] ===== LOCATION ACQUIRED =====")
      console.log("[v0] Location:", userLocation)
      console.log("[v0] Accuracy:", userLocation.accuracy)
      console.log("[v0] Coordinates:", `${userLocation.lat}, ${userLocation.lng}`)
      console.log("[v0] City:", userLocation.city || "Unknown")
      console.log("[v0] Fetching nearby medical facilities...")
      fetchNearbyMedicalFacilities(userLocation)
    }
  }, [userLocation])

  const startCountdown = () => {
    if (countdownRef.current) {
      return
    }

    countdownStartTimeRef.current = Date.now()
    setCountdownStarted(true)
    let countdown = 120
    setInactivityTimer(countdown)

    countdownRef.current = setInterval(() => {
      countdown -= 1
      setInactivityTimer(countdown)

      if (countdown <= 0) {
        autoSelectFacility()
      } else if (countdown === 30) {
        setShowAutoSelect(true)
      }
    }, 1000)
  }

  const autoSelectFacility = () => {
    const facilitiesWithAmbulance = allFacilities.filter((f) => f.hasAmbulance)
    const acceptedAmbulanceFacilities = facilitiesWithAmbulance.filter(() => Math.random() > 0.3)

    const bestFacility =
      acceptedAmbulanceFacilities.length > 0
        ? acceptedAmbulanceFacilities.sort((a, b) => {
          const distanceDiff = a.distance - b.distance
          if (Math.abs(distanceDiff) < 1) {
            return b.score - a.score
          }
          return distanceDiff
        })[0]
        : allFacilities.sort((a, b) => a.distance - b.distance)[0]

    setSelectedFacility(bestFacility)
    setStep("selected")
    setShowAutoSelect(false)
    if (countdownRef.current) {
      clearInterval(countdownRef.current)
    }
  }

  const handleEmergencySubmitted = (data: EmergencyData) => {
    setEmergencyData(data)
    setIsLoading(true)
    console.log("[v0] Emergency submitted, user location:", userLocationRef.current)
    console.log("[v0] Medical facilities available:", medicalFacilitiesRef.current.length)

    // If we already have facilities, proceed immediately
    if (userLocationRef.current && medicalFacilitiesRef.current.length > 0) {
      console.log("[v0] Location and hospitals ready, proceeding to selection")
      setStep("hospitals")
      setIsLoading(false)
      startCountdown()
      return
    }

    // ✅ Use refs inside the interval to avoid stale closures
    const maxWait = 60000 // 60 seconds — allows time for progressive radius search
    const startTime = Date.now()

    const waitInterval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const currentFacilities = medicalFacilitiesRef.current
      const currentLocation = userLocationRef.current

      console.log(`[v0] Waiting... elapsed: ${elapsed}ms, location: ${currentLocation ? 'yes' : 'no'}, facilities: ${currentFacilities.length}`)

      if ((currentLocation && currentFacilities.length > 0) || elapsed >= maxWait) {
        clearInterval(waitInterval)
        console.log("[v0] Proceeding with hospitals:", currentFacilities.length)
        setStep("hospitals")
        setIsLoading(false)
        startCountdown()
      }
    }, 500)
  }

  const handleFacilitySelect = (facility: MedicalFacility) => {
    setSelectedFacility(facility)
    setStep("selected")
    if (countdownRef.current) {
      clearInterval(countdownRef.current)
    }
  }

  const handleStartTracking = () => {
    setStep("tracking")
  }

  const handleUserActivity = () => {
    console.log("User activity detected (countdown continues)")
  }

  useEffect(() => {
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current)
      }
    }
  }, [])

  const getLocationDisplayText = () => {
    if (!userLocation) return "Unknown location"

    if (userLocation.accuracy === "precise") {
      return "Your precise location"
    } else if (userLocation.city && userLocation.state) {
      return `${userLocation.city}, ${userLocation.state}`
    } else if (userLocation.city) {
      return userLocation.city
    } else if (userLocation.country) {
      return userLocation.country
    } else {
      return "Approximate location"
    }
  }

  const getBestFacilityForAutoSelect = () => {
    const facilitiesWithAmbulance = allFacilities.filter((f) => f.hasAmbulance)
    if (facilitiesWithAmbulance.length > 0) {
      return facilitiesWithAmbulance.sort((a, b) => a.distance - b.distance)[0]
    }
    return allFacilities.length > 0 ? allFacilities.sort((a, b) => a.distance - b.distance)[0] : null
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
              {isSimulation && (
                <Badge variant="secondary" className="ml-2">
                  SIMULATION MODE
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-green-600 border-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Emergency Active
              </Badge>
              <OfflineDetector hospitals={allFacilities} userLocation={userLocation} />
              {isSimulation && emergencyData && (
                <Button variant="outline" size="sm" onClick={() => setShowHospitalView(true)} className="ml-2">
                  <Building2 className="h-4 w-4 mr-2" />
                  Hospital View
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {step === "chat" && (
              <div className="space-y-4">
                {isGettingLocation && (
                  <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600"></div>
                        <div className="flex-1">
                          <h3 className="font-medium text-yellow-800">Getting Your Location...</h3>
                          <p className="text-sm text-yellow-600">
                            {locationPermissionDenied
                              ? "Location blocked. Trying alternative methods..."
                              : locationAttempts > 0
                                ? "Trying alternative location methods..."
                                : "Please allow location access for accurate medical facility search."}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {locationError && !isGettingLocation && (
                  <Card className="border-orange-200 bg-orange-50">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                        <div className="flex-1">
                          <h3 className="font-medium text-orange-800">Location Notice</h3>
                          <p className="text-sm text-orange-600">{locationError}</p>
                        </div>
                        {(locationPermissionDenied || locationAttempts < 2) && (
                          <Button onClick={retryLocation} size="sm" variant="outline">
                            {locationAttempts < 2 ? "Retry" : "Try Again"}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {userLocation && !isGettingLocation && (
                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-5 w-5 text-green-600" />
                        <div>
                          <h3 className="font-medium text-green-800">Location Detected</h3>
                          <p className="text-sm text-green-600">
                            Medical facilities near {getLocationDisplayText()} will be shown.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <ChatInterface
                  onEmergencySubmitted={handleEmergencySubmitted}
                  isSimulation={isSimulation}
                  isLoading={isLoading}
                />
              </div>
            )}

            {step === "hospitals" && (
              <HospitalSelection
                hospitals={medicalFacilities}
                onHospitalSelect={handleFacilitySelect}
                isContactingHospitals={isContactingHospitals}
                setIsContactingHospitals={setIsContactingHospitals}
                countdown={inactivityTimer}
                showCountdown={true}
                hospitalsError={hospitalsError}
                onRetry={retryFetchHospitals}
                isFetchingHospitals={isFetchingHospitals}
                currentRadius={currentRadius}
              />
            )}

            {(step === "selected" || step === "tracking") && selectedFacility && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Ambulance className="h-5 w-5 text-blue-600" />
                      <span>Emergency Response Coordinated</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                        <div>
                          <h3 className="font-semibold text-green-800">{selectedFacility.name}</h3>
                          <p className="text-green-600">{selectedFacility.address}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {selectedFacility.type.replace("_", " ").toUpperCase()}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {selectedFacility.availability}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-800">{selectedFacility.eta} min</div>
                          <div className="text-sm text-green-600">ETA</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{selectedFacility.distance} km away</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{selectedFacility.phone}</span>
                        </div>
                      </div>

                      {selectedFacility.hasAmbulance && (
                        <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                          <Ambulance className="h-5 w-5 text-blue-600" />
                          <span className="text-blue-800 font-medium">Ambulance dispatched</span>
                        </div>
                      )}

                      {step === "selected" && (
                        <Button onClick={handleStartTracking} className="w-full" size="lg">
                          Start Live Tracking
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {step === "tracking" && (
                  <MapInterface hospital={selectedFacility} isSimulation={isSimulation} userLocation={userLocation} />
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {emergencyData && <FirstAidPanel emergencyType={emergencyData.type} severity={emergencyData.severity} />}

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600">Emergency Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {emergencyData ? (
                  <>
                    <div>
                      <div className="text-sm text-gray-500">Type</div>
                      <div className="font-medium">{emergencyData.type}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Severity</div>
                      <Badge variant={emergencyData.severity === "High" ? "destructive" : "secondary"}>
                        {emergencyData.severity}
                      </Badge>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Location</div>
                      <div className="font-medium">{getLocationDisplayText()}</div>
                    </div>
                    {user && (
                      <div>
                        <div className="text-sm text-gray-500">User</div>
                        <div className="font-medium">
                          {user.role === "guest" ? "Guest User" : `${user.firstName} ${user.lastName}`}
                        </div>
                      </div>
                    )}
                    {userLocation && (
                      <div>
                        <div className="text-sm text-gray-500">Coordinates</div>
                        <div className="font-medium text-xs">
                          {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                        </div>
                      </div>
                    )}
                    <div>
                      <div className="text-sm text-gray-500">Medical Facilities Found</div>
                      <div className="font-medium">{allFacilities.length} nearby</div>
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-gray-500">Waiting for emergency details...</div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Auto-select Modal */}
      {showAutoSelect && (
        <AutoSelectModal
          countdown={inactivityTimer}
          selectedFacility={getBestFacilityForAutoSelect()}
          onCancel={() => {
            setShowAutoSelect(false)
            if (countdownRef.current) {
              clearInterval(countdownRef.current)
            }
            startCountdown()
          }}
          onConfirm={autoSelectFacility}
          isOpen={showAutoSelect}
          onClose={() => {
            setShowAutoSelect(false)
            if (countdownRef.current) {
              clearInterval(countdownRef.current)
            }
            startCountdown()
          }}
        />
      )}

      {/* Hospital Simulation View */}
      {showHospitalView && emergencyData && (
        <HospitalSimulationView
          emergencyData={emergencyData}
          hospitals={allFacilities}
          onClose={() => setShowHospitalView(false)}
        />
      )}
    </div>
  )
}
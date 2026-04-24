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
  const [allFacilities, setAllFacilities] = useState<MedicalFacility[]>([]) // Store all facilities for consistency
  const [selectedFacility, setSelectedFacility] = useState<MedicalFacility | null>(null)
  const [showAutoSelect, setShowAutoSelect] = useState(false)
  const [showHospitalView, setShowHospitalView] = useState(false)
  const [inactivityTimer, setInactivityTimer] = useState(120) // Start with 2 minutes (120 seconds)
  const [isLoading, setIsLoading] = useState(false)
  const [isContactingHospitals, setIsContactingHospitals] = useState(false)
  const [countdownStarted, setCountdownStarted] = useState(false) // Track if countdown has started

  const countdownRef = useRef<NodeJS.Timeout>()
  const countdownStartTimeRef = useRef<number | null>(null) // Track when countdown started

  const [userLocation, setUserLocation] = useState<LocationInfo | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [isGettingLocation, setIsGettingLocation] = useState(true)
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false)
  const [locationAttempts, setLocationAttempts] = useState(0)
  const [hospitalsError, setHospitalsError] = useState<string | null>(null)
  const [isFetchingHospitals, setIsFetchingHospitals] = useState(false)

  // Request location permission immediately when component mounts
  useEffect(() => {
    requestLocationPermission()
  }, [])

  // Request location permission on page load with improved error handling
  const requestLocationPermission = async () => {
    setIsGettingLocation(true)
    setLocationError(null)
    setLocationPermissionDenied(false)

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser.")
      await getLocationFromIP()
      return
    }

    // Check if permission is already granted
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

    // Try high accuracy first, then fallback to lower accuracy
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
            maximumAge: highAccuracy ? 300000 : 600000, // 5-10 minutes
          },
        )
      })
    }

    try {
      // First attempt: High accuracy with longer timeout
      console.log("Attempting high accuracy geolocation...")
      const location = await tryGeolocation(true, 15000) // 15 seconds
      setUserLocation(location)
      setIsGettingLocation(false)
      setLocationError(null)
      console.log("Got precise location:", location)
      return
    } catch (error: any) {
      console.warn("High accuracy geolocation failed:", error)

      try {
        // Second attempt: Lower accuracy with shorter timeout
        console.log("Attempting lower accuracy geolocation...")
        const location = await tryGeolocation(false, 10000) // 10 seconds
        setUserLocation({ ...location, accuracy: "approximate" })
        setIsGettingLocation(false)
        setLocationError("Using approximate GPS location.")
        console.log("Got approximate location:", location)
        return
      } catch (secondError: any) {
        console.warn("Lower accuracy geolocation also failed:", secondError)

        // Handle specific error types
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
            errorMessage =
              "GPS location request timed out. Using approximate location based on your internet connection."
            break
          default:
            errorMessage = "GPS location failed. Using approximate location based on your internet connection."
        }

        setLocationError(errorMessage)
        await getLocationFromIP()
      }
    }
  }

  // Get approximate location from IP address with improved error handling
  const getLocationFromIP = async () => {
    try {
      console.log("Attempting to get location from IP...")

      // Try multiple IP geolocation services with different approaches
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
          const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 second timeout per service

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
            // Validate coordinates are reasonable
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

      // If all services fail, provide a fallback with major city coordinates
      console.error("All IP geolocation services failed")
      setLocationError("Unable to determine your location. Showing medical facilities from major cities.")
      setIsGettingLocation(false)

      // Use major city coordinates as fallback
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

      // Final fallback to NYC
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

  // Retry location with user interaction
  const retryLocation = async () => {
    setLocationAttempts((prev) => prev + 1)
    if (locationAttempts < 2) {
      await requestLocationPermission()
    } else {
      // After 2 attempts, just use IP location
      await getLocationFromIP()
    }
  }

  // Process facility data from API response
  const processFacilityData = (data: any, location: LocationInfo) => {
    return data.elements
      .filter((element: any) => {
        return (
          element.tags &&
          (element.tags.name || element.tags["name:en"] || element.tags.operator || element.tags.brand) &&
          (element.lat || element.center?.lat)
        )
      })
      .map((element: any, index: number) => {
        const lat = element.lat || element.center?.lat || location.lat
        const lng = element.lon || element.center?.lon || location.lng
        const distance = calculateDistance(location.lat, location.lng, lat, lng)
        const eta = Math.round(distance * 2.5)

        let facilityType: MedicalFacility["type"] = "medical_center"
        if (element.tags.amenity === "hospital" || element.tags.healthcare === "hospital") {
          facilityType = "hospital"
        } else if (element.tags.amenity === "clinic" || element.tags.healthcare === "clinic") {
          facilityType = "clinic"
        } else if (element.tags.amenity === "pharmacy") {
          facilityType = "pharmacy"
        } else if (element.tags.healthcare === "laboratory") {
          facilityType = "laboratory"
        } else if (element.tags.healthcare === "diagnostic_centre") {
          facilityType = "diagnostic_center"
        } else if (element.tags.emergency === "yes") {
          facilityType = "emergency_room"
        } else if (element.tags.healthcare === "centre") {
          facilityType = "medical_center"
        } else if (element.tags["healthcare:speciality"]) {
          facilityType = "clinic"
        }

        const services = []
        if (element.tags.emergency === "yes") services.push("Emergency Care")
        if (element.tags["healthcare:speciality"]) {
          const specialities = element.tags["healthcare:speciality"].split(";")
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
          element.tags.opening_hours === "24/7" ||
          facilityType === "hospital" ||
          facilityType === "emergency_room"
        ) {
          availability = "24/7"
        } else if (element.tags.emergency === "yes") {
          availability = "emergency_only"
        }

        return {
          id: element.id?.toString() || `facility_${index}`,
          name:
            element.tags.name ||
            element.tags["name:en"] ||
            element.tags.operator ||
            element.tags.brand ||
            `Medical Facility ${index + 1}`,
          type: facilityType,
          distance: Math.round(distance * 10) / 10,
          eta: Math.max(5, eta),
          hasAmbulance: facilityType === "hospital" || facilityType === "emergency_room" || Math.random() > 0.7,
          score: Math.floor(Math.random() * 20) + 80,
          address:
            element.tags["addr:full"] ||
            `${element.tags["addr:housenumber"] || ""} ${element.tags["addr:street"] || ""}`.trim() ||
            element.tags["addr:city"] ||
            "Address not available",
          phone:
            element.tags.phone || element.tags["contact:phone"] || element.tags.telephone || "Phone not available",
          lat,
          lng,
          services,
          availability,
        }
      })
      .sort((a: MedicalFacility, b: MedicalFacility) => a.distance - b.distance)
      .slice(0, 20)
  }

  // Fetch nearby medical facilities with progressive radius expansion
  const fetchNearbyMedicalFacilities = async (location: LocationInfo) => {
    setIsFetchingHospitals(true)
    setHospitalsError(null)

    const radiusSteps = [5000, 10000, 15000, 20000] // 5km, 10km, 15km, 20km in meters
    let radiusIndex = 0
    let foundResults = false

    while (radiusIndex < radiusSteps.length && !foundResults) {
      const radius = radiusSteps[radiusIndex]
      const radiusKm = radius / 1000

      console.log(`[v0] Searching for facilities within ${radiusKm}km...`)
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
          const facilityData = processFacilityData(data, location)

          if (facilityData.length > 0) {
            console.log(`[v0] Found ${facilityData.length} facilities within ${radiusKm}km`)
            setAllFacilities(facilityData)
            setMedicalFacilities(facilityData)
            setHospitalsError(null)
            foundResults = true
            setIsFetchingHospitals(false)
          } else {
            // No valid facilities, try next radius
            if (radiusIndex < radiusSteps.length - 1) {
              radiusIndex++
              console.log(`[v0] No valid facilities at ${radiusKm}km, expanding to ${radiusSteps[radiusIndex] / 1000}km...`)
              await new Promise(resolve => setTimeout(resolve, 1000)) // 1 second delay
            } else {
              // Max radius reached
              setAllFacilities([])
              setMedicalFacilities([])
              setHospitalsError("No hospitals found within 20km. Please check the location or try again.")
              setIsFetchingHospitals(false)
              foundResults = true
            }
          }
        } else {
          // No results, try next radius
          if (radiusIndex < radiusSteps.length - 1) {
            radiusIndex++
            console.log(`[v0] No results at ${radiusKm}km, expanding to ${radiusSteps[radiusIndex] / 1000}km...`)
            await new Promise(resolve => setTimeout(resolve, 1000)) // 1 second delay
          } else {
            // Max radius reached
            setAllFacilities([])
            setMedicalFacilities([])
            setHospitalsError("No hospitals found within 20km. Please check the location or try again.")
            setIsFetchingHospitals(false)
            foundResults = true
          }
        }
      } catch (fetchError: any) {
        console.error(`[v0] Error fetching at ${radiusKm}km radius:`, fetchError)

        // Try next radius on error
        if (radiusIndex < radiusSteps.length - 1) {
          radiusIndex++
          console.log(`[v0] Error at ${radiusKm}km, expanding to ${radiusSteps[radiusIndex] / 1000}km...`)
          await new Promise(resolve => setTimeout(resolve, 1000))
        } else {
          // Max radius reached
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
    } catch (error) {
      console.error("[v0] Error in fetchNearbyMedicalFacilities:", error)
      setHospitalsError("Unable to locate hospitals. Please check your location and try again.")
      setAllFacilities([])
      setMedicalFacilities([])
      setIsFetchingHospitals(false)
  }



  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371 // Radius of the Earth in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLng = ((lng2 - lng1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // Retry fetching hospitals
  const retryFetchHospitals = async () => {
    if (userLocation) {
      console.log("[v0] Retrying hospital fetch...")
      await fetchNearbyMedicalFacilities(userLocation)
    }
  }

  // Watch for location changes and fetch facilities
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

  // Start countdown when hospitals step is reached - runs independently without resetting
  const startCountdown = () => {
    if (countdownRef.current) {
      return // Countdown already running, don't restart
    }

    countdownStartTimeRef.current = Date.now()
    setCountdownStarted(true)
    let countdown = 120 // Start with 2 minutes
    setInactivityTimer(countdown)

    countdownRef.current = setInterval(() => {
      countdown -= 1
      setInactivityTimer(countdown)

      if (countdown <= 0) {
        autoSelectFacility()
      } else if (countdown === 30) {
        // Show auto-select modal when 30 seconds remain
        setShowAutoSelect(true)
      }
    }, 1000)
  }

  const autoSelectFacility = () => {
    // Use the same facilities that are shown in the hospital list
    const facilitiesWithAmbulance = allFacilities.filter((f) => f.hasAmbulance)
    const acceptedAmbulanceFacilities = facilitiesWithAmbulance.filter(() => Math.random() > 0.3)

    // Select the best available facility (closest with highest score)
    const bestFacility =
      acceptedAmbulanceFacilities.length > 0
        ? acceptedAmbulanceFacilities.sort((a, b) => {
            // Prioritize by distance first, then score
            const distanceDiff = a.distance - b.distance
            if (Math.abs(distanceDiff) < 1) {
              // If distances are similar (within 1km)
              return b.score - a.score // Higher score wins
            }
            return distanceDiff // Closer distance wins
          })[0]
        : allFacilities.sort((a, b) => a.distance - b.distance)[0] // Fallback to closest facility

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
    console.log("[v0] Emergency submitted, user location:", userLocation)
    console.log("[v0] Medical facilities available:", medicalFacilities.length)

    // If we have location and hospitals, proceed immediately
    if (userLocation && medicalFacilities.length > 0) {
      console.log("[v0] Location and hospitals ready, proceeding to selection")
      setStep("hospitals")
      setIsLoading(false)
      startCountdown()
      return
    }

    // If we don't have location yet, wait for it
    if (!userLocation || isGettingLocation) {
      console.log("[v0] Waiting for location and hospitals...")
      const maxWait = 8000 // Wait max 8 seconds
      const startTime = Date.now()
      
      const waitInterval = setInterval(() => {
        const elapsed = Date.now() - startTime
        console.log(`[v0] Waiting... elapsed: ${elapsed}ms, location: ${userLocation ? 'yes' : 'no'}, facilities: ${medicalFacilities.length}`)
        
        if ((userLocation && medicalFacilities.length > 0) || elapsed >= maxWait) {
          clearInterval(waitInterval)
          console.log("[v0] Proceeding with hospitals:", medicalFacilities.length)
          setStep("hospitals")
          setIsLoading(false)
          startCountdown()
        }
      }, 500)
      
      return
    }

    // Default: proceed with what we have
    setStep("hospitals")
    setIsLoading(false)
    startCountdown()
  }

  const handleFacilitySelect = (facility: MedicalFacility) => {
    setSelectedFacility(facility)
    setStep("selected")
    if (countdownRef.current) {
      clearTimeout(countdownRef.current)
    }
  }

  const handleStartTracking = () => {
    setStep("tracking")
  }

  // Dummy function for onUserActivity prop (no longer used for countdown reset)
  const handleUserActivity = () => {
    // This function is called but doesn't reset the countdown anymore
    console.log("User activity detected (countdown continues)")
  }

  useEffect(() => {
    return () => {
      if (countdownRef.current) {
        clearTimeout(countdownRef.current)
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

  // Get the best facility for auto-selection
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

            {/* Emergency Info Card */}
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
            startCountdown() // Restart countdown if cancelled
          }}
          onConfirm={autoSelectFacility}
          isOpen={showAutoSelect}
          onClose={() => {
            setShowAutoSelect(false)
            if (countdownRef.current) {
              clearInterval(countdownRef.current)
            }
            startCountdown() // Restart countdown if closed
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

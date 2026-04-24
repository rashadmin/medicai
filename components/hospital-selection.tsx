"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  MapPin,
  Clock,
  Star,
  Phone,
  Ambulance,
  AlertTriangle,
  Volume2,
  VolumeX,
  Building2,
  Activity,
} from "lucide-react"

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

interface HospitalSelectionProps {
  hospitals: MedicalFacility[]
  onHospitalSelect: (hospital: MedicalFacility) => void
  isContactingHospitals: boolean
  setIsContactingHospitals: (contacting: boolean) => void
  countdown: number
  showCountdown: boolean
  hospitalsError?: string | null
  onRetry?: () => Promise<void>
  isFetchingHospitals?: boolean
}

export function HospitalSelection({
  hospitals,
  onHospitalSelect,
  isContactingHospitals,
  setIsContactingHospitals,
  countdown,
  showCountdown,
  hospitalsError,
  onRetry,
  isFetchingHospitals = false,
}: HospitalSelectionProps) {
  const [selectedTab, setSelectedTab] = useState("ambulance")
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [isRetrying, setIsRetrying] = useState(false)
  const audioContextRef = useRef<AudioContext | null>(null)
  const lastBeepTime = useRef<number>(0)

  // Handle retry
  const handleRetry = async () => {
    setIsRetrying(true)
    try {
      if (onRetry) {
        await onRetry()
      }
    } finally {
      setIsRetrying(false)
    }
  }

  // Initialize audio context
  useEffect(() => {
    if (typeof window !== "undefined" && audioEnabled) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      } catch (error) {
        console.warn("Audio context not supported:", error)
      }
    }
  }, [audioEnabled])

  // Audio alert system
  const playBeep = (frequency: number, duration: number, volume = 0.3) => {
    if (!audioContextRef.current || !audioEnabled) return

    try {
      const oscillator = audioContextRef.current.createOscillator()
      const gainNode = audioContextRef.current.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContextRef.current.destination)

      oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime)
      oscillator.type = "sine"

      gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime)
      gainNode.gain.linearRampToValueAtTime(volume, audioContextRef.current.currentTime + 0.01)
      gainNode.gain.linearRampToValueAtTime(0, audioContextRef.current.currentTime + duration)

      oscillator.start(audioContextRef.current.currentTime)
      oscillator.stop(audioContextRef.current.currentTime + duration)
    } catch (error) {
      console.warn("Audio playback failed:", error)
    }
  }

  // Handle audio alerts based on countdown
  useEffect(() => {
    if (!showCountdown || !audioEnabled) return

    const now = Date.now()

    // Prevent rapid repeated beeps
    if (now - lastBeepTime.current < 800) return

    if (countdown <= 10 && countdown > 0) {
      // Final 10 seconds: rapid beeping
      playBeep(1000, 0.1, 0.4)
      lastBeepTime.current = now
    } else if (countdown <= 30 && countdown > 10) {
      // 30-10 seconds: moderate beeping
      if (countdown % 2 === 0) {
        playBeep(800, 0.15, 0.3)
        lastBeepTime.current = now
      }
    } else if (countdown <= 60 && countdown > 30) {
      // 60-30 seconds: slow beeping
      if (countdown % 5 === 0) {
        playBeep(600, 0.2, 0.2)
        lastBeepTime.current = now
      }
    }
  }, [countdown, audioEnabled, showCountdown])

  // Contact hospitals simulation - set all hospitals as available
  useEffect(() => {
    if (hospitals.length > 0 && !isContactingHospitals) {
      setIsContactingHospitals(true)

      // Simulate contacting hospitals
      setTimeout(() => {
        setIsContactingHospitals(false)

        // Set all hospitals as available (no toggling)
        hospitals.forEach((hospital) => {
          hospital.accepted = true // All hospitals are available
        })
      }, 3000)
    }
  }, [hospitals.length, isContactingHospitals, setIsContactingHospitals])

  const getCountdownColor = () => {
    if (countdown > 60) return "bg-blue-500"
    if (countdown > 30) return "bg-orange-500"
    return "bg-red-500"
  }

  const getCountdownProgress = () => {
    return ((120 - countdown) / 120) * 100
  }

  const getCountdownMessage = () => {
    if (countdown > 60) return "Please select a medical facility"
    if (countdown > 30) return "Time is running out - please make a selection"
    if (countdown > 10) return "URGENT: Auto-selection in progress"
    return "AUTO-SELECTING NOW"
  }

  // Filter hospitals within 5km radius
  const hospitalsWithin5km = hospitals.filter((h) => h.distance <= 5)
  const ambulanceHospitals = hospitalsWithin5km.filter((h) => h.hasAmbulance)
  const selfDriveHospitals = hospitalsWithin5km

  const renderHospitalCard = (hospital: MedicalFacility) => (
    <Card
      key={hospital.id}
      className="cursor-pointer transition-all duration-200 hover:shadow-md hover:border-blue-300"
      onClick={() => onHospitalSelect(hospital)}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{hospital.name}</h3>
            <p className="text-sm text-gray-600 mb-2">{hospital.address}</p>
            <div className="flex flex-wrap gap-1 mb-2">
              <Badge variant="outline" className="text-xs">
                {hospital.type.replace("_", " ").toUpperCase()}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {hospital.availability}
              </Badge>
              {hospital.hasAmbulance && (
                <Badge variant="secondary" className="text-xs">
                  <Ambulance className="h-3 w-3 mr-1" />
                  Ambulance
                </Badge>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-1 mb-1">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">{hospital.score}/100</span>
            </div>
            {hospital.accepted === true && (
              <Badge variant="default" className="text-xs bg-green-600">
                Available
              </Badge>
            )}
            {hospital.accepted === undefined && isContactingHospitals && (
              <Badge variant="secondary" className="text-xs">
                Checking...
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-1">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span>{hospital.distance} km</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4 text-gray-500" />
            <span>{hospital.eta} min</span>
          </div>
          <div className="flex items-center space-x-1">
            <Phone className="h-4 w-4 text-gray-500" />
            <span className="text-xs">{hospital.phone}</span>
          </div>
        </div>

        <div className="mt-3">
          <div className="text-xs text-gray-600 mb-1">Services:</div>
          <div className="flex flex-wrap gap-1">
            {hospital.services.slice(0, 3).map((service, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {service}
              </Badge>
            ))}
            {hospital.services.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{hospital.services.length - 3} more
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              <span>Select Medical Facility</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => setAudioEnabled(!audioEnabled)}>
                {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
              {isContactingHospitals && (
                <Badge variant="secondary" className="animate-pulse">
                  <Activity className="h-3 w-3 mr-1" />
                  Contacting Hospitals...
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {hospitalsError && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-amber-800 mb-1">Unable to Locate Hospitals</h3>
                  <p className="text-sm text-amber-700">{hospitalsError}</p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={handleRetry}
                disabled={isRetrying || isFetchingHospitals}
                className="flex-shrink-0"
              >
                {isRetrying || isFetchingHospitals ? "Retrying..." : "Retry"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              Showing hospitals within 5km of incident location
            </span>
          </div>
        </div>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ambulance" className="flex items-center space-x-2">
            <Ambulance className="h-4 w-4" />
            <span>Ambulance Service ({ambulanceHospitals.length})</span>
          </TabsTrigger>
          <TabsTrigger value="self-drive" className="flex items-center space-x-2">
            <MapPin className="h-4 w-4" />
            <span>Self Drive ({selfDriveHospitals.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* Countdown Bar - Always visible when showCountdown is true */}
        {showCountdown && (
          <div className="mt-4 p-4 border rounded-lg bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <AlertTriangle
                  className={`h-4 w-4 ${countdown <= 30 ? "text-red-500 animate-pulse" : "text-orange-500"}`}
                />
                <span className="text-sm font-medium">{getCountdownMessage()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className={`text-sm font-mono ${countdown <= 30 ? "text-red-600 font-bold" : "text-gray-700"}`}>
                  {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, "0")}
                </span>
              </div>
            </div>
            <Progress value={getCountdownProgress()} className="h-2" />
            <div
              className={`h-1 rounded-full mt-1 transition-all duration-1000 ${getCountdownColor()} ${countdown <= 10 ? "animate-pulse" : ""}`}
              style={{ width: `${getCountdownProgress()}%` }}
            />
            {countdown <= 30 && (
              <div className="mt-2 text-xs text-center text-red-600 font-medium animate-pulse">
                {countdown <= 10
                  ? "SELECTING BEST AVAILABLE FACILITY WITHIN 5KM..."
                  : "Please make a selection to avoid auto-selection"}
              </div>
            )}
          </div>
        )}

        <TabsContent value="ambulance" className="space-y-4 mt-4">
          {ambulanceHospitals.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Ambulance className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">No Ambulance Services Within 5km</h3>
                <p className="text-gray-600">
                  No hospitals with ambulance services were found within 5km of the incident location. Please consider the self-drive option or
                  contact emergency services directly.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">{ambulanceHospitals.map(renderHospitalCard)}</div>
          )}
        </TabsContent>

        <TabsContent value="self-drive" className="space-y-4 mt-4">
          {selfDriveHospitals.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">No Medical Facilities Within 5km</h3>
                <p className="text-gray-600">
                  No medical facilities were found within 5km of the incident location. Please contact
                  emergency services directly.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">{selfDriveHospitals.map(renderHospitalCard)}</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

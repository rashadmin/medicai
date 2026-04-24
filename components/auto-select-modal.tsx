"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertTriangle, Timer, MapPin, Phone, Ambulance } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

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
}

interface AutoSelectModalProps {
  countdown: number
  selectedFacility: MedicalFacility | null
  onCancel: () => void
  onConfirm: () => void
  isOpen: boolean
  onClose: () => void
}

export function AutoSelectModal({
  countdown,
  selectedFacility,
  onCancel,
  onConfirm,
  isOpen,
  onClose,
}: AutoSelectModalProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Calculate progress based on countdown (120 seconds total)
    const totalTime = 120
    const elapsed = totalTime - countdown
    const progressPercent = Math.max(0, Math.min(100, (elapsed / totalTime) * 100))
    setProgress(progressPercent)
  }, [countdown])

  const getUrgencyColor = () => {
    if (countdown > 60) return "text-blue-600"
    if (countdown > 30) return "text-orange-600"
    return "text-red-700"
  }

  const getProgressColor = () => {
    if (countdown > 60) return "bg-blue-500"
    if (countdown > 30) return "bg-orange-500"
    return "bg-red-600"
  }

  const getBackgroundColor = () => {
    if (countdown > 60) return "bg-blue-50 border-blue-200"
    if (countdown > 30) return "bg-orange-50 border-orange-200"
    return "bg-red-50 border-red-200"
  }

  if (!selectedFacility) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertTriangle className={`h-5 w-5 ${getUrgencyColor()}`} />
            <span>Selected Medical Facility</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Facility Information Card */}
          <Card className={`border-2 ${getBackgroundColor()}`}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold mb-2">{selectedFacility.name}</h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="default">{selectedFacility.availability}</Badge>
                    <Badge variant="outline">{selectedFacility.type.replace("_", " ").toUpperCase()}</Badge>
                    {selectedFacility.hasAmbulance && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <Ambulance className="h-3 w-3 mr-1" />
                        Ambulance Available
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                <div className="flex items-start space-x-2">
                  <MapPin className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-700">Location</div>
                    <div className="text-gray-600">{selectedFacility.address}</div>
                    <div className="text-gray-500 text-xs mt-1">Distance: {selectedFacility.distance} km</div>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <Phone className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-700">Contact</div>
                    <div className="text-gray-600">{selectedFacility.phone}</div>
                    <div className="text-gray-500 text-xs mt-1">ETA: {selectedFacility.eta} minutes</div>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-sm font-medium text-gray-700 mb-2">Services Available:</div>
                <div className="flex flex-wrap gap-2">
                  {selectedFacility.services.slice(0, 4).map((service, index) => (
                    <Badge key={index} variant="outline" className="bg-white">
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="text-right text-sm">
                <span className="text-gray-600">Quality Score: </span>
                <span className="font-bold text-lg">{selectedFacility.score}/100</span>
              </div>
            </CardContent>
          </Card>

          {/* Countdown Timer Display */}
          <Card className={`border-2 ${getBackgroundColor()}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Timer className={`h-6 w-6 ${getUrgencyColor()}`} />
                  <span className={`text-lg font-bold ${getUrgencyColor()}`}>
                    {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, "0")}
                  </span>
                </div>
                <span className="text-sm text-gray-600">Time remaining</span>
              </div>
              <Progress value={progress} className="h-2 mb-2" />
              <div className="text-xs text-gray-600">
                {countdown > 60
                  ? "Please confirm this facility"
                  : countdown > 30
                    ? "Confirming facility selection"
                    : "Contacting facility and requesting ambulance"}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}

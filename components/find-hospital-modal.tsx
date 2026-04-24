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

const mockHospitals: Hospital[] = [
  {
    id: "1",
    name: "City General Hospital",
    address: "123 Medical Center Dr, Downtown",
    distance: 2.3,
    phone: "+1-555-0123",
    rating: 4.5,
    hasAmbulance: true,
    hasEmergency: true,
    specialties: ["Emergency", "Cardiology", "Trauma"],
    waitTime: "15 min",
  },
  {
    id: "2",
    name: "St. Mary's Medical Center",
    address: "456 Healthcare Ave, Midtown",
    distance: 3.1,
    phone: "+1-555-0456",
    rating: 4.3,
    hasAmbulance: true,
    hasEmergency: true,
    specialties: ["Emergency", "Pediatrics", "Maternity"],
    waitTime: "25 min",
  },
  {
    id: "3",
    name: "Regional Medical Center",
    address: "789 Regional Blvd, Westside",
    distance: 4.2,
    phone: "+1-555-0789",
    rating: 4.1,
    hasAmbulance: false,
    hasEmergency: true,
    specialties: ["Emergency", "Orthopedics", "Surgery"],
    waitTime: "20 min",
  },
  {
    id: "4",
    name: "University Hospital",
    address: "321 University Way, Campus",
    distance: 5.8,
    phone: "+1-555-0321",
    rating: 4.7,
    hasAmbulance: true,
    hasEmergency: true,
    specialties: ["Emergency", "Neurology", "Research"],
    waitTime: "30 min",
  },
  {
    id: "5",
    name: "Community Health Center",
    address: "654 Community St, Eastside",
    distance: 6.5,
    phone: "+1-555-0654",
    rating: 3.9,
    hasAmbulance: false,
    hasEmergency: false,
    specialties: ["Primary Care", "Family Medicine"],
    waitTime: "45 min",
  },
]

export function FindHospitalModal({ onClose }: FindHospitalModalProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterEmergency, setFilterEmergency] = useState(true)
  const [filterAmbulance, setFilterAmbulance] = useState(false)
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading hospitals
    setTimeout(() => {
      setHospitals(mockHospitals)
      setIsLoading(false)
    }, 1000)
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
            {isLoading ? (
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

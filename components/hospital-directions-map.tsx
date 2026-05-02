'use client'

import { Hospital } from '@/lib/simulator-utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Navigation, Phone, Clock, ArrowLeft } from 'lucide-react'

interface HospitalDirectionsMapProps {
  hospital: Hospital
  userLatitude: number
  userLongitude: number
  onBack: () => void
}

export default function HospitalDirectionsMap({
  hospital,
  userLatitude,
  userLongitude,
  onBack,
}: HospitalDirectionsMapProps) {
  // Calculate approximate distance and estimated time
  const distance = hospital.distance
  const estimatedTime = Math.ceil(distance / 50 * 60) // Assuming avg speed 50km/h

  // Generate Google Maps URL
  const mapsUrl = `https://www.google.com/maps/dir/${userLatitude},${userLongitude}/${hospital.latitude},${hospital.longitude}`

  // Generate approximate route visualization (simple SVG representation)
  const renderMapPreview = () => {
    const width = 400
    const height = 300
    const padding = 40
    const latDiff = hospital.latitude - userLatitude
    const lngDiff = hospital.longitude - userLongitude
    const scale = Math.max(Math.abs(latDiff), Math.abs(lngDiff)) || 0.05

    const userX = padding + (lngDiff / scale) * (width - 2 * padding) * 0.5
    const userY = height - padding - (latDiff / scale) * (height - 2 * padding) * 0.5
    const hospX = width - padding
    const hospY = padding

    return (
      <svg width={width} height={height} className="border border-gray-200 rounded-lg bg-blue-50">
        {/* Grid background */}
        {[...Array(5)].map((_, i) => (
          <g key={`grid-${i}`} opacity="0.1">
            <line x1={i * (width / 4)} y1="0" x2={i * (width / 4)} y2={height} stroke="#999" strokeWidth="1" />
            <line x1="0" y1={i * (height / 4)} x2={width} y2={i * (height / 4)} stroke="#999" strokeWidth="1" />
          </g>
        ))}

        {/* Route line */}
        <line x1={userX} y1={userY} x2={hospX} y2={hospY} stroke="#3b82f6" strokeWidth="3" strokeDasharray="5,5" />

        {/* User location */}
        <circle cx={userX} cy={userY} r="8" fill="#ef4444" />
        <circle cx={userX} cy={userY} r="12" fill="none" stroke="#ef4444" strokeWidth="1" opacity="0.3" />
        <text x={userX} y={userY - 20} textAnchor="middle" fontSize="12" fill="#1f2937" fontWeight="bold">
          You
        </text>

        {/* Hospital location */}
        <circle cx={hospX} cy={hospY} r="8" fill="#10b981" />
        <circle cx={hospX} cy={hospY} r="12" fill="none" stroke="#10b981" strokeWidth="1" opacity="0.3" />
        <text x={hospX} y={hospY + 25} textAnchor="middle" fontSize="12" fill="#1f2937" fontWeight="bold">
          Hospital
        </text>

        {/* Direction arrow */}
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill="#3b82f6" />
          </marker>
        </defs>
        <line
          x1={userX + (hospX - userX) * 0.7}
          y1={userY + (hospY - userY) * 0.7}
          x2={userX + (hospX - userX) * 0.85}
          y2={userY + (hospY - userY) * 0.85}
          stroke="#3b82f6"
          strokeWidth="2"
          markerEnd="url(#arrowhead)"
        />
      </svg>
    )
  }

  return (
    <div className="space-y-4">
      {/* Back Button */}
      <Button onClick={onBack} variant="outline" className="w-full justify-start text-gray-700 hover:bg-gray-50">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Hospital List
      </Button>

      {/* Hospital Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{hospital.name}</CardTitle>
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{hospital.address}</span>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800 border-0">Accepted</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Route Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-xs text-gray-600 mb-1">Distance</div>
              <div className="text-2xl font-bold text-blue-600">{distance.toFixed(1)} km</div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-xs text-gray-600 mb-1">Est. Time</div>
              <div className="text-2xl font-bold text-green-600">{estimatedTime} min</div>
            </div>
          </div>

          {/* Map Preview */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-100 p-2">{renderMapPreview()}</div>
            <div className="p-3 bg-gray-50 text-xs text-gray-600 text-center">
              Schematic route visualization
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-xs text-gray-600">Contact Hospital</p>
                <p className="font-semibold text-gray-900">{hospital.phone}</p>
              </div>
            </div>
          </div>

          {/* Hospital Details */}
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900 text-sm">Specialties</h4>
            <div className="flex flex-wrap gap-2">
              {hospital.specialty.map((spec) => (
                <Badge key={spec} variant="outline" className="bg-blue-50">
                  {spec}
                </Badge>
              ))}
            </div>
          </div>

          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-900">
              <span className="font-semibold">{hospital.beds}</span> beds available
            </p>
          </div>

          {/* Open in Google Maps */}
          <Button
            onClick={() => window.open(mapsUrl, '_blank')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Navigation className="h-4 w-4 mr-2" />
            Open in Google Maps
          </Button>

          {/* Call Ambulance Button */}
          <Button variant="outline" className="w-full border-green-600 text-green-600 hover:bg-green-50">
            <Phone className="h-4 w-4 mr-2" />
            Call Hospital Ambulance
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

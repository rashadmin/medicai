'use client'

import { Hospital } from '@/lib/simulator-utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Building2, MapPin, Phone, Check, Clock } from 'lucide-react'

interface HospitalListProps {
  hospitals: Hospital[]
  onSelectHospital: (hospital: Hospital) => void
  loading?: boolean
}

export default function HospitalList({ hospitals, onSelectHospital, loading = false }: HospitalListProps) {
  return (
    <div className="space-y-4 overflow-y-auto max-h-96 pr-2">
      <div className="sticky top-0 bg-white z-10 pb-2">
        <h3 className="text-lg font-semibold text-gray-900">Nearby Hospitals</h3>
        <p className="text-sm text-gray-600">Select a hospital that has accepted your case</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : hospitals.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600">No hospitals available at this time.</p>
          </CardContent>
        </Card>
      ) : (
        hospitals.map((hospital) => (
          <Card
            key={hospital.id}
            className={`cursor-pointer transition-all ${
              hospital.accepted
                ? 'border-green-200 hover:border-green-400 hover:shadow-md'
                : 'border-yellow-200 hover:border-yellow-400 opacity-75'
            }`}
          >
            <CardContent className="pt-4">
              <div className="space-y-3">
                {/* Header with status */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2 flex-1">
                    <Building2 className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{hospital.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="h-3 w-3 text-gray-500" />
                        <p className="text-xs text-gray-600">{hospital.distance.toFixed(1)} km away</p>
                      </div>
                    </div>
                  </div>
                  {hospital.accepted ? (
                    <Badge className="bg-green-100 text-green-800 border-0 flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      Accepted
                    </Badge>
                  ) : (
                    <Badge className="bg-yellow-100 text-yellow-800 border-0 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Pending
                    </Badge>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <Phone className="h-3 w-3 text-gray-500" />
                    <span>{hospital.phone}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {hospital.specialty.map((spec) => (
                      <Badge key={spec} variant="outline" className="text-xs bg-blue-50">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">{hospital.beds} beds available</p>
                </div>

                {/* Action Button */}
                {hospital.accepted && (
                  <Button
                    onClick={() => onSelectHospital(hospital)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white mt-2"
                    size="sm"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    View Directions
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}

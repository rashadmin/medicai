"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"
import {
  X,
  MapPin,
  Clock,
  Ambulance,
  Car,
  AlertTriangle,
  CheckCircle,
  XCircle,
  User,
  Building2,
  Plus,
  Search,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Activity,
  Users,
  TrendingUp,
  Menu,
} from "lucide-react"

interface EmergencyData {
  type: string
  severity: string
  location: string
  description: string
}

interface Hospital {
  id: string
  name: string
  distance: number
  eta: number
  hasAmbulance: boolean
  score: number
  address: string
  phone: string
}

interface EmergencyRequest {
  id: string
  patientName: string
  emergencyType: string
  severity: "Low" | "Medium" | "High"
  location: string
  description: string
  distance: number
  eta: number
  timestamp: Date
  status: "new" | "pending" | "accepted" | "rejected"
  hospitalId: string
  age?: number
  gender?: string
  bloodGroup?: string
  genotype?: string
  medicalHistory?: string[]
  chatSummary: string[]
  ambulanceRequired: boolean
  urgencyLevel: "low" | "medium" | "high"
}

interface HospitalSimulationViewProps {
  emergencyData: EmergencyData
  hospitals: Hospital[]
  onClose: () => void
}

// Emergency Request Card Component
function EmergencyRequestCard({
  request,
  isExpanded,
  onToggleExpand,
  onAction,
}: {
  request: EmergencyRequest
  isExpanded: boolean
  onToggleExpand: () => void
  onAction: (requestId: string, action: "accept" | "accept_ambulance" | "reject") => void
}) {
  const [isProcessing, setIsProcessing] = useState(false)

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "accepted":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const handleAction = async (action: "accept" | "accept_ambulance" | "reject") => {
    setIsProcessing(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    onAction(request.id, action)
    setIsProcessing(false)
  }

  const formatTimeAgo = (minutes: number) => {
    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m ago`
  }

  const timeAgo = Math.floor((Date.now() - request.timestamp.getTime()) / (1000 * 60))

  // In the EmergencyRequestCard component, add special styling for user emergency
  const isUserEmergency = request.id === "user_emergency"

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`transition-all duration-300 ${request.status === "accepted" ? "opacity-75" : ""}`}
    >
      <Card
        className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
          request.status === "new" ? "ring-2 ring-green-400 shadow-lg" : ""
        } ${isUserEmergency ? "ring-2 ring-blue-500 bg-blue-50 border-blue-300" : ""} ${
          request.urgencyLevel === "high"
            ? "border-l-4 border-l-red-500"
            : request.urgencyLevel === "medium"
              ? "border-l-4 border-l-yellow-500"
              : "border-l-4 border-l-blue-500"
        }`}
      >
        <CardContent className="p-3 sm:p-4">
          {/* Collapsed View */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <div className="flex items-center space-x-2 min-w-0">
                  <AlertTriangle
                    className={`h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 ${
                      request.urgencyLevel === "high"
                        ? "text-red-600"
                        : request.urgencyLevel === "medium"
                          ? "text-yellow-600"
                          : "text-blue-600"
                    }`}
                  />
                  <span className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                    {request.emergencyType}
                  </span>
                </div>

                {request.status === "new" && (
                  <Badge variant="default" className="bg-green-600 animate-pulse text-xs">
                    NEW
                  </Badge>
                )}

                {isUserEmergency && (
                  <Badge variant="default" className="bg-blue-600 animate-pulse text-xs">
                    YOUR EMERGENCY
                  </Badge>
                )}

                <Badge className={`text-xs ${getUrgencyColor(request.urgencyLevel)}`}>
                  {request.urgencyLevel.toUpperCase()}
                </Badge>

                <Badge className={`text-xs ${getStatusColor(request.status)}`}>{request.status.toUpperCase()}</Badge>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span>{request.distance} km</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3 flex-shrink-0" />
                  <span className="whitespace-nowrap">{formatTimeAgo(timeAgo)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  {request.ambulanceRequired ? (
                    <>
                      <Ambulance className="h-3 w-3 text-blue-600 flex-shrink-0" />
                      <span className="text-blue-600 text-xs">Ambulance</span>
                    </>
                  ) : (
                    <>
                      <Car className="h-3 w-3 text-gray-500 flex-shrink-0" />
                      <span className="text-xs">Self Transport</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between lg:justify-end space-x-2 flex-shrink-0">
              {request.status === "pending" || request.status === "new" ? (
                <div className="flex space-x-1 sm:space-x-2">
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAction(request.ambulanceRequired ? "accept_ambulance" : "accept")
                    }}
                    disabled={isProcessing}
                    className={`text-xs px-2 py-1 sm:px-3 sm:py-2 ${
                      request.ambulanceRequired
                        ? "bg-blue-600 hover:bg-blue-700 animate-pulse"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">Accept</span>
                    {request.ambulanceRequired && <Ambulance className="h-3 w-3 ml-1" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAction("reject")
                    }}
                    disabled={isProcessing}
                    className="border-red-300 text-red-600 hover:bg-red-50 text-xs px-2 py-1 sm:px-3 sm:py-2"
                  >
                    <XCircle className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">Reject</span>
                  </Button>
                </div>
              ) : request.status === "accepted" ? (
                <Badge variant="default" className="bg-green-600 text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Accepted
                </Badge>
              ) : (
                <Badge variant="outline" className="text-red-600 border-red-300 text-xs">
                  <XCircle className="h-3 w-3 mr-1" />
                  Rejected
                </Badge>
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleExpand()
                }}
                className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0"
              >
                {isExpanded ? (
                  <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4" />
                ) : (
                  <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Expanded View */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                    {/* Patient Details */}
                    <div className="min-w-0">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center text-sm sm:text-base">
                        <User className="h-4 w-4 mr-2 flex-shrink-0" />
                        Patient Information
                      </h4>
                      <div className="space-y-2 text-xs sm:text-sm">
                        <div className="flex justify-between items-start">
                          <span className="text-gray-600 flex-shrink-0">Name:</span>
                          <span className="font-medium text-right truncate ml-2">{request.patientName}</span>
                        </div>
                        {request.age && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 flex-shrink-0">Age:</span>
                            <span className="font-medium">{request.age} years</span>
                          </div>
                        )}
                        {request.gender && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 flex-shrink-0">Gender:</span>
                            <span className="font-medium">{request.gender}</span>
                          </div>
                        )}
                        {request.bloodGroup && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 flex-shrink-0">Blood Group:</span>
                            <span className="font-medium text-red-600">{request.bloodGroup}</span>
                          </div>
                        )}
                        {request.genotype && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 flex-shrink-0">Genotype:</span>
                            <span className="font-medium">{request.genotype}</span>
                          </div>
                        )}
                        {request.medicalHistory && request.medicalHistory.length > 0 && (
                          <div>
                            <span className="text-gray-600 block mb-1">Medical History:</span>
                            <div className="flex flex-wrap gap-1">
                              {request.medicalHistory.map((condition, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {condition}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Location & Chat */}
                    <div className="min-w-0">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center text-sm sm:text-base">
                        <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                        Location & Context
                      </h4>
                      <div className="space-y-3">
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-xs sm:text-sm text-gray-600 mb-1">Address:</div>
                          <div className="font-medium text-xs sm:text-sm break-words">{request.location}</div>
                        </div>

                        <div>
                          <div className="flex items-center mb-2">
                            <MessageSquare className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span className="font-medium text-gray-900 text-sm">Chat Summary</span>
                          </div>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {request.chatSummary.map((message, index) => (
                              <div
                                key={index}
                                className="text-xs sm:text-sm p-2 bg-gray-50 rounded border-l-2 border-blue-200 break-words"
                              >
                                {message}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Action Buttons */}
                  {(request.status === "pending" || request.status === "new") && (
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3">
                        <Button
                          onClick={() => handleAction("accept_ambulance")}
                          disabled={isProcessing}
                          className="bg-blue-600 hover:bg-blue-700 text-sm"
                          size="sm"
                        >
                          <Ambulance className="h-4 w-4 mr-2" />
                          Accept with Ambulance
                        </Button>
                        <Button
                          onClick={() => handleAction("accept")}
                          disabled={isProcessing}
                          variant="outline"
                          className="border-green-600 text-green-600 hover:bg-green-50 text-sm"
                          size="sm"
                        >
                          <Car className="h-4 w-4 mr-2" />
                          Accept (No Ambulance)
                        </Button>
                        <Button
                          onClick={() => handleAction("reject")}
                          disabled={isProcessing}
                          variant="outline"
                          className="border-red-600 text-red-600 hover:bg-red-50 text-sm"
                          size="sm"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject Request
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Hospital Stats Component
function HospitalStats({
  totalRequests,
  newRequests,
  pendingRequests,
  acceptedRequests,
}: {
  totalRequests: number
  newRequests: number
  pendingRequests: number
  acceptedRequests: number
}) {
  const rejectedRequests = totalRequests - newRequests - pendingRequests - acceptedRequests
  const acceptanceRate = totalRequests > 0 ? Math.round((acceptedRequests / totalRequests) * 100) : 0

  return (
    <div className="space-y-4">
      {/* Overview Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-base lg:text-lg">
            <Activity className="h-4 w-4 lg:h-5 lg:w-5 text-blue-600" />
            <span>Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-xl lg:text-2xl font-bold text-blue-600">{totalRequests}</div>
              <div className="text-xs lg:text-sm text-blue-600">Total Requests</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-xl lg:text-2xl font-bold text-green-600">{acceptanceRate}%</div>
              <div className="text-xs lg:text-sm text-green-600">Acceptance Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Request Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-base lg:text-lg">
            <Clock className="h-4 w-4 lg:h-5 lg:w-5 text-yellow-600" />
            <span>Request Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-2 bg-green-50 rounded">
            <div className="flex items-center space-x-2 min-w-0">
              <AlertTriangle className="h-3 w-3 lg:h-4 lg:w-4 text-green-600 flex-shrink-0" />
              <span className="text-xs lg:text-sm font-medium truncate">New</span>
            </div>
            <Badge variant="default" className="bg-green-600 text-xs">
              {newRequests}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
            <div className="flex items-center space-x-2 min-w-0">
              <Clock className="h-3 w-3 lg:h-4 lg:w-4 text-yellow-600 flex-shrink-0" />
              <span className="text-xs lg:text-sm font-medium truncate">Pending</span>
            </div>
            <Badge variant="outline" className="border-yellow-600 text-yellow-600 text-xs">
              {pendingRequests}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
            <div className="flex items-center space-x-2 min-w-0">
              <CheckCircle className="h-3 w-3 lg:h-4 lg:w-4 text-blue-600 flex-shrink-0" />
              <span className="text-xs lg:text-sm font-medium truncate">Accepted</span>
            </div>
            <Badge variant="outline" className="border-blue-600 text-blue-600 text-xs">
              {acceptedRequests}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-2 bg-red-50 rounded">
            <div className="flex items-center space-x-2 min-w-0">
              <XCircle className="h-3 w-3 lg:h-4 lg:w-4 text-red-600 flex-shrink-0" />
              <span className="text-xs lg:text-sm font-medium truncate">Rejected</span>
            </div>
            <Badge variant="outline" className="border-red-600 text-red-600 text-xs">
              {rejectedRequests}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-base lg:text-lg">
            <TrendingUp className="h-4 w-4 lg:h-5 lg:w-5 text-purple-600" />
            <span>Quick Stats</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <Users className="h-5 w-5 lg:h-6 lg:w-6 mx-auto mb-2 text-purple-600" />
            <div className="text-base lg:text-lg font-bold text-purple-600">24</div>
            <div className="text-xs lg:text-sm text-purple-600">Staff on Duty</div>
          </div>

          <div className="text-center p-3 bg-indigo-50 rounded-lg">
            <Ambulance className="h-5 w-5 lg:h-6 lg:w-6 mx-auto mb-2 text-indigo-600" />
            <div className="text-base lg:text-lg font-bold text-indigo-600">3</div>
            <div className="text-xs lg:text-sm text-indigo-600">Available Ambulances</div>
          </div>

          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <Activity className="h-5 w-5 lg:h-6 lg:w-6 mx-auto mb-2 text-orange-600" />
            <div className="text-base lg:text-lg font-bold text-orange-600">12</div>
            <div className="text-xs lg:text-sm text-orange-600">Available Beds</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function HospitalSimulationView({ emergencyData, hospitals, onClose }: HospitalSimulationViewProps) {
  const [emergencyRequests, setEmergencyRequests] = useState<EmergencyRequest[]>([])
  const [selectedHospital, setSelectedHospital] = useState<string>(hospitals[0]?.id || "")
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"proximity" | "urgency" | "time">("urgency")
  const [filterStatus, setFilterStatus] = useState<"all" | "new" | "pending">("all")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Random names for simulation
  const randomNames = [
    "John Smith",
    "Sarah Johnson",
    "Michael Brown",
    "Emily Davis",
    "David Wilson",
    "Jessica Miller",
    "Christopher Moore",
    "Ashley Taylor",
    "Matthew Anderson",
    "Amanda Thomas",
    "James Jackson",
    "Jennifer White",
    "Robert Harris",
    "Lisa Martin",
    "William Thompson",
    "Mary Garcia",
    "Richard Martinez",
    "Patricia Robinson",
    "Charles Clark",
    "Linda Rodriguez",
  ]

  // Emergency types and descriptions
  const emergencyTypes = [
    {
      type: "Cardiac Emergency",
      severity: "High" as const,
      urgencyLevel: "high" as const,
      descriptions: [
        "Patient experiencing chest pain and shortness of breath",
        "Suspected heart attack, patient unconscious",
        "Cardiac arrest, CPR in progress",
        "Severe chest pain radiating to left arm",
      ],
      chatSummaries: [
        [
          "Patient: My chest hurts really bad and I can't breathe properly",
          "AI: I understand you're experiencing chest pain. Are you feeling any pain in your left arm?",
          "Patient: Yes, and I'm sweating a lot. I think I'm having a heart attack",
        ],
        [
          "Caller: My husband just collapsed and isn't responding",
          "AI: Is he breathing? Can you check for a pulse?",
          "Caller: I can't feel a pulse and he's not breathing normally",
        ],
      ],
    },
    {
      type: "Trauma/Injury",
      severity: "High" as const,
      urgencyLevel: "high" as const,
      descriptions: [
        "Motor vehicle accident, multiple injuries",
        "Fall from height, suspected spinal injury",
        "Severe laceration with heavy bleeding",
        "Construction accident, crush injury",
      ],
      chatSummaries: [
        [
          "Patient: I fell down the stairs and my leg is bent in a weird way",
          "AI: Can you move your toes? Is there any numbness?",
          "Patient: I can't move it at all and there's a lot of blood",
        ],
        [
          "Caller: There's been a car accident, the driver is trapped",
          "AI: Is the person conscious? Are they bleeding?",
          "Caller: Yes they're awake but there's blood and they can't move their legs",
        ],
      ],
    },
    {
      type: "Respiratory Emergency",
      severity: "Medium" as const,
      urgencyLevel: "medium" as const,
      descriptions: [
        "Severe asthma attack, difficulty breathing",
        "Allergic reaction with respiratory distress",
        "Choking incident, partial airway obstruction",
        "COPD exacerbation, oxygen saturation low",
      ],
      chatSummaries: [
        [
          "Patient: Having severe asthma attack, inhaler not working",
          "AI: Are you able to speak in full sentences?",
          "Patient: No... very... difficult... to breathe",
        ],
        [
          "Patient: I ate something and now my throat is swelling",
          "AI: Do you have an EpiPen? Are you having trouble breathing?",
          "Patient: Yes I used it but still having trouble breathing",
        ],
      ],
    },
    {
      type: "Neurological Emergency",
      severity: "High" as const,
      urgencyLevel: "high" as const,
      descriptions: [
        "Suspected stroke, facial drooping",
        "Seizure episode, patient disoriented",
        "Head injury from fall, loss of consciousness",
        "Severe headache with vision changes",
      ],
      chatSummaries: [
        [
          "Caller: My father suddenly can't speak properly and his face is drooping",
          "AI: Is he conscious and responsive to you?",
          "Caller: Yes but he seems confused and can't lift his right arm",
        ],
        [
          "Patient: I have the worst headache of my life and my vision is blurry",
          "AI: When did this start? Any nausea or vomiting?",
          "Patient: About an hour ago, yes I've been throwing up",
        ],
      ],
    },
    {
      type: "Medical Emergency",
      severity: "Medium" as const,
      urgencyLevel: "medium" as const,
      descriptions: [
        "Diabetic emergency, blood sugar critical",
        "Severe abdominal pain, possible appendicitis",
        "Drug overdose, patient semi-conscious",
        "Severe allergic reaction, swelling",
      ],
      chatSummaries: [
        [
          "Patient: I think I took too many pills by accident",
          "AI: What medication did you take and how many?",
          "Patient: Pain medication, maybe 6 or 7 pills. Feeling very dizzy",
        ],
        [
          "Patient: My blood sugar is really low and I feel like I'm going to pass out",
          "AI: Have you eaten today? Do you have glucose tablets?",
          "Patient: No I haven't eaten and I don't have any glucose with me",
        ],
      ],
    },
  ]

  const locations = [
    "Downtown Business District",
    "Residential Area - Oak Street",
    "Shopping Mall Parking Lot",
    "Highway 101 Mile Marker 15",
    "City Park Recreation Center",
    "University Campus",
    "Industrial District",
    "Suburban Neighborhood",
    "Airport Terminal",
    "Train Station Platform",
  ]

  // Generate random emergency request
  const generateEmergencyRequest = (hospitalId: string): EmergencyRequest => {
    const randomEmergency = emergencyTypes[Math.floor(Math.random() * emergencyTypes.length)]
    const randomDescription =
      randomEmergency.descriptions[Math.floor(Math.random() * randomEmergency.descriptions.length)]
    const randomChatSummary =
      randomEmergency.chatSummaries[Math.floor(Math.random() * randomEmergency.chatSummaries.length)]
    const randomLocation = locations[Math.floor(Math.random() * locations.length)]
    const randomName = randomNames[Math.floor(Math.random() * randomNames.length)]
    const distance = Math.round((Math.random() * 8 + 1) * 10) / 10 // 1-9 km
    const eta = Math.ceil(distance * 2 + Math.random() * 5) // Rough ETA calculation
    const ambulanceRequired = Math.random() > 0.4 // 60% chance of needing ambulance

    return {
      id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      patientName: randomName,
      emergencyType: randomEmergency.type,
      severity: randomEmergency.severity,
      urgencyLevel: randomEmergency.urgencyLevel,
      location: randomLocation,
      description: randomDescription,
      distance,
      eta,
      timestamp: new Date(),
      status: "new",
      hospitalId,
      age: Math.floor(Math.random() * 60) + 20,
      gender: Math.random() > 0.5 ? "Male" : "Female",
      bloodGroup: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"][Math.floor(Math.random() * 8)],
      genotype: ["AA", "AS", "SS"][Math.floor(Math.random() * 3)],
      medicalHistory:
        Math.random() > 0.5
          ? ["Hypertension", "Diabetes", "Asthma", "Heart Disease"].slice(0, Math.floor(Math.random() * 3) + 1)
          : undefined,
      chatSummary: randomChatSummary,
      ambulanceRequired,
    }
  }

  // Add the current user's emergency request
  useEffect(() => {
    const userRequest: EmergencyRequest = {
      id: "user_emergency",
      patientName: "Current Emergency Patient",
      emergencyType: emergencyData.type,
      severity: emergencyData.severity as "Low" | "Medium" | "High",
      urgencyLevel: emergencyData.severity.toLowerCase() as "low" | "medium" | "high",
      location: emergencyData.location,
      description: emergencyData.description,
      distance: 2.3, // Default distance
      eta: 8, // Default ETA
      timestamp: new Date(),
      status: "new",
      hospitalId: selectedHospital,
      age: 28, // Default age for demo
      gender: "Unknown", // Default gender
      bloodGroup: "O+", // Default blood group
      genotype: "AA", // Default genotype
      medicalHistory: ["No known allergies"], // Default medical history
      chatSummary: [
        `Patient: ${emergencyData.description}`,
        "AI: I understand your situation. Help is being coordinated.",
        "Patient: Please hurry, I'm really scared.",
        "AI: Emergency services have been notified. Stay calm and follow the first aid instructions.",
      ],
      ambulanceRequired: true,
    }

    // Set the user request immediately as the first request
    setEmergencyRequests([userRequest])

    // Generate additional mock requests for demonstration
    const additionalRequests = hospitals.slice(0, 3).map((hospital, index) => {
      const mockEmergency = emergencyTypes[Math.floor(Math.random() * emergencyTypes.length)]
      const randomDescription =
        mockEmergency.descriptions[Math.floor(Math.random() * mockEmergency.descriptions.length)]
      const randomChatSummary =
        mockEmergency.chatSummaries[Math.floor(Math.random() * mockEmergency.chatSummaries.length)]
      const randomLocation = locations[Math.floor(Math.random() * locations.length)]
      const randomName = randomNames[Math.floor(Math.random() * randomNames.length)]

      return {
        id: `demo_req_${index}`,
        patientName: randomName,
        emergencyType: mockEmergency.type,
        severity: mockEmergency.severity,
        urgencyLevel: mockEmergency.urgencyLevel,
        location: randomLocation,
        description: randomDescription,
        distance: Math.round((Math.random() * 8 + 1) * 10) / 10,
        eta: Math.ceil((Math.random() * 8 + 1) * 2 + Math.random() * 5),
        timestamp: new Date(Date.now() - Math.random() * 300000), // Random time in last 5 minutes
        status: Math.random() > 0.7 ? "pending" : ("new" as "new" | "pending"),
        hospitalId: hospital.id,
        age: Math.floor(Math.random() * 60) + 20,
        gender: Math.random() > 0.5 ? "Male" : "Female",
        bloodGroup: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"][Math.floor(Math.random() * 8)],
        genotype: ["AA", "AS", "SS"][Math.floor(Math.random() * 3)],
        medicalHistory:
          Math.random() > 0.5
            ? ["Hypertension", "Diabetes", "Asthma"].slice(0, Math.floor(Math.random() * 3) + 1)
            : undefined,
        chatSummary: randomChatSummary,
        ambulanceRequired: Math.random() > 0.4,
      }
    })

    // Add the additional requests after a short delay to simulate real-time arrival
    setTimeout(() => {
      setEmergencyRequests((prev) => [...prev, ...additionalRequests])
    }, 2000)
  }, [emergencyData, selectedHospital, hospitals])

  // Initialize with first hospital selected
  useEffect(() => {
    if (hospitals.length > 0 && !selectedHospital) {
      setSelectedHospital(hospitals[0].id)
    }
  }, [hospitals, selectedHospital])

  // Generate new emergency requests periodically
  useEffect(() => {
    const interval = setInterval(
      () => {
        // Add new emergency request every 30-60 seconds
        const randomHospital = hospitals[Math.floor(Math.random() * hospitals.length)]
        const newRequest = generateEmergencyRequest(randomHospital.id)

        setEmergencyRequests((prev) => [...prev, newRequest])
      },
      Math.random() * 30000 + 30000,
    ) // 30-60 seconds

    return () => clearInterval(interval)
  }, [hospitals])

  const handleCardExpand = (requestId: string) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(requestId)) {
        newSet.delete(requestId)
      } else {
        // Limit to 5 expanded cards
        if (newSet.size >= 5) {
          const firstExpanded = Array.from(newSet)[0]
          newSet.delete(firstExpanded)
        }
        newSet.add(requestId)
      }
      return newSet
    })
  }

  const handleRequestAction = (requestId: string, action: "accept" | "accept_ambulance" | "reject") => {
    setEmergencyRequests((prev) =>
      prev.map((req) =>
        req.id === requestId ? { ...req, status: action === "reject" ? "rejected" : "accepted" } : req,
      ),
    )

    // Auto-collapse after action
    setTimeout(() => {
      setExpandedCards((prev) => {
        const newSet = new Set(prev)
        newSet.delete(requestId)
        return newSet
      })
    }, 2000)

    // Remove rejected requests after 30 seconds
    if (action === "reject") {
      setTimeout(() => {
        setEmergencyRequests((prev) => prev.filter((req) => req.id !== requestId))
      }, 30000)
    }
  }

  const sortRequests = (requests: EmergencyRequest[]) => {
    // Separate user request from others
    const userRequest = requests.find((req) => req.id === "user_emergency")
    const otherRequests = requests.filter((req) => req.id !== "user_emergency")

    // Sort other requests based on selected criteria
    const sortedOthers = [...otherRequests].sort((a, b) => {
      switch (sortBy) {
        case "proximity":
          return a.distance - b.distance
        case "urgency":
          const urgencyOrder = { high: 3, medium: 2, low: 1 }
          return urgencyOrder[b.urgencyLevel] - urgencyOrder[a.urgencyLevel]
        case "time":
          return a.timestamp.getTime() - b.timestamp.getTime()
        default:
          return 0
      }
    })

    // Always return user request first, then sorted others
    return userRequest ? [userRequest, ...sortedOthers] : sortedOthers
  }

  const filterRequests = (requests: EmergencyRequest[]) => {
    let filtered = requests

    if (filterStatus !== "all") {
      filtered = filtered.filter((req) => req.status === filterStatus)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (req) =>
          req.emergencyType.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.location.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    return filtered
  }

  const selectedHospitalData = hospitals.find((h) => h.id === selectedHospital)
  const hospitalRequests = filterRequests(
    sortRequests(emergencyRequests.filter((req) => req.hospitalId === selectedHospital)),
  )

  const newRequestsCount = emergencyRequests.filter((req) => req.status === "new").length
  const pendingRequestsCount = emergencyRequests.filter((req) => req.status === "pending").length

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b bg-blue-50">
          <div className="flex items-center space-x-3">
            <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Hospital Emergency Dashboard</h2>
              <p className="text-xs sm:text-sm text-gray-600">Real-time emergency requests and responses</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Hospital Selection Sidebar */}
          <div
            className={`fixed lg:static inset-y-0 left-0 z-50 w-80 bg-white border-r transform transition-transform duration-300 ease-in-out lg:transform-none ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            } lg:translate-x-0`}
          >
            <div className="p-4 h-full overflow-y-auto">
              <div className="flex items-center justify-between mb-4 lg:hidden">
                <h2 className="text-lg font-semibold">Hospitals</h2>
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <h3 className="font-semibold text-gray-900 mb-4 hidden lg:block">Select Hospital</h3>
              <div className="space-y-2 mb-6">
                {hospitals.map((hospital) => {
                  const hospitalRequestCount = emergencyRequests.filter((req) => req.hospitalId === hospital.id).length
                  const pendingCount = emergencyRequests.filter(
                    (req) => req.hospitalId === hospital.id && req.status === "pending",
                  ).length

                  return (
                    <Card
                      key={hospital.id}
                      className={`cursor-pointer transition-colors ${
                        selectedHospital === hospital.id ? "border-blue-500 bg-blue-50" : "hover:bg-gray-100"
                      }`}
                      onClick={() => setSelectedHospital(hospital.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <h4 className="font-medium text-sm truncate">{hospital.name}</h4>
                            <div className="flex items-center space-x-2 mt-1">
                              {hospital.hasAmbulance && (
                                <Badge variant="outline" className="text-xs">
                                  <Ambulance className="h-2 w-2 mr-1" />
                                  Ambulance
                                </Badge>
                              )}
                              <span className="text-xs text-gray-500 truncate">{hospital.address}</span>
                            </div>
                          </div>
                          <div className="text-right ml-2">
                            <div className="text-sm font-bold">{hospitalRequestCount}</div>
                            <div className="text-xs text-gray-500">requests</div>
                            {pendingCount > 0 && (
                              <Badge variant="destructive" className="text-xs mt-1">
                                {pendingCount} pending
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* Stats */}
              <HospitalStats
                totalRequests={emergencyRequests.length}
                newRequests={newRequestsCount}
                pendingRequests={pendingRequestsCount}
                acceptedRequests={emergencyRequests.filter((req) => req.status === "accepted").length}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="p-4 lg:p-6 space-y-4 lg:space-y-6 h-full overflow-y-auto">
              {/* Controls */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-base lg:text-lg">
                    <Building2 className="h-4 w-4 lg:h-5 lg:w-5 text-blue-600" />
                    <span className="truncate">{selectedHospitalData?.name} - Emergency Requests</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search emergencies..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 text-sm"
                    />
                  </div>

                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
                    >
                      <option value="urgency">Sort by Urgency</option>
                      <option value="proximity">Sort by Distance</option>
                      <option value="time">Sort by Time</option>
                    </select>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as any)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
                    >
                      <option value="all">All Requests</option>
                      <option value="new">New Only</option>
                      <option value="pending">Pending Only</option>
                    </select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newRequest = generateEmergencyRequest(selectedHospital)
                        setEmergencyRequests((prev) => [...prev, newRequest])
                      }}
                      className="whitespace-nowrap"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Simulate Request
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Emergency Requests */}
              <div className="space-y-4">
                {hospitalRequests.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 lg:p-8 text-center">
                      <AlertTriangle className="h-8 w-8 lg:h-12 lg:w-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="font-semibold text-gray-600 mb-2 text-sm lg:text-base">No Emergency Requests</h3>
                      <p className="text-gray-500 text-xs lg:text-sm">
                        {searchTerm || filterStatus !== "all"
                          ? "No requests match your current filters."
                          : "This hospital hasn't received any emergency requests yet. New requests will appear here automatically."}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  hospitalRequests.map((request) => (
                    <EmergencyRequestCard
                      key={request.id}
                      request={request}
                      isExpanded={expandedCards.has(request.id)}
                      onToggleExpand={() => handleCardExpand(request.id)}
                      onAction={handleRequestAction}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HospitalSimulationView

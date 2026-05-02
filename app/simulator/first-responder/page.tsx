"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Heart, ArrowLeft, Send, MapPin, Phone } from "lucide-react"
import AIChatbot from "@/components/ai-chatbot"

export default function FirstResponderSimulator() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    patientName: "",
    age: "",
    bloodGroup: "O+",
    medicalHistory: "",
    currentSymptoms: "",
    latitude: 0,
    longitude: 0,
    contactNumber: "",
  })
  const [submitted, setSubmitted] = useState(false)
  const [locationLoading, setLocationLoading] = useState(true)
  const [locationError, setLocationError] = useState<string | null>(null)

  useEffect(() => {
    // Request GPS location on component mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setFormData((prev) => ({
            ...prev,
            latitude,
            longitude,
          }))
          setLocationLoading(false)
        },
        (error) => {
          console.log("[v0] GPS error:", error.message)
          setLocationError("Unable to access GPS. Using default location.")
          // Use default location if GPS fails
          setFormData((prev) => ({
            ...prev,
            latitude: 40.7128,
            longitude: -74.006,
          }))
          setLocationLoading(false)
        }
      )
    } else {
      setLocationError("Geolocation not supported. Using default location.")
      setLocationLoading(false)
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  const handleReset = () => {
    setFormData({
      patientName: "",
      age: "",
      bloodGroup: "O+",
      medicalHistory: "",
      currentSymptoms: "",
      latitude: formData.latitude,
      longitude: formData.longitude,
      contactNumber: "",
    })
    setSubmitted(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push("/")}
              className="flex items-center space-x-2 hover:text-red-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="text-sm font-medium">Back to Simulator</span>
            </button>
            <div className="flex items-center space-x-2">
              <Heart className="h-6 w-6 text-red-600 fill-red-600 animate-heartbeat" />
              <h1 className="text-xl font-bold text-gray-900">First Responder Simulator</h1>
            </div>
            <Badge className="bg-blue-100 text-blue-700 border-blue-200">Simulation Mode</Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {!submitted ? (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Form Section */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Patient Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
                      <Input
                        type="text"
                        name="patientName"
                        value={formData.patientName}
                        onChange={handleChange}
                        placeholder="Enter patient name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                      <Input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        placeholder="Enter age"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                      <select
                        name="bloodGroup"
                        value={formData.bloodGroup}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Medical History</label>
                      <Textarea
                        name="medicalHistory"
                        value={formData.medicalHistory}
                        onChange={handleChange}
                        placeholder="e.g., Diabetes, Hypertension, Allergies"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Symptoms</label>
                      <Textarea
                        name="currentSymptoms"
                        value={formData.currentSymptoms}
                        onChange={handleChange}
                        placeholder="Describe symptoms in detail"
                        rows={3}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        GPS Location
                      </label>
                      {locationLoading ? (
                        <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 animate-pulse">
                          Detecting location...
                        </div>
                      ) : locationError ? (
                        <div className="px-3 py-2 border border-yellow-300 rounded-md bg-yellow-50 text-yellow-700 text-sm">
                          {locationError}
                        </div>
                      ) : (
                        <div className="px-3 py-2 border border-green-300 rounded-md bg-green-50">
                          <p className="text-sm font-semibold text-green-800">Location Detected</p>
                          <p className="text-xs text-green-700">
                            Latitude: {formData.latitude.toFixed(4)}°, Longitude: {formData.longitude.toFixed(4)}°
                          </p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                      <Input
                        type="tel"
                        name="contactNumber"
                        value={formData.contactNumber}
                        onChange={handleChange}
                        placeholder="Phone number"
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      <Send className="h-4 w-4 mr-2" />
                      Submit Emergency Report
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* AI Chat Section */}
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-600 fill-red-600" />
                    AI Medical Assistant
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AIChatbot className="h-[600px]" onEmergencyDetected={() => {}} />
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-700">Report Submitted Successfully</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-white p-6 rounded-lg space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Patient Name</p>
                    <p className="text-lg font-semibold">{formData.patientName}</p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Age</p>
                      <p className="text-lg font-semibold">{formData.age} years</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Blood Group</p>
                      <p className="text-lg font-semibold">{formData.bloodGroup}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Location (GPS)</p>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <p className="text-lg font-semibold">
                        {formData.latitude.toFixed(4)}°, {formData.longitude.toFixed(4)}°
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Contact</p>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <p className="text-lg font-semibold">{formData.contactNumber}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Current Symptoms</p>
                    <p className="bg-gray-50 p-3 rounded text-gray-800">{formData.currentSymptoms}</p>
                  </div>
                  {formData.medicalHistory && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Medical History</p>
                      <p className="bg-gray-50 p-3 rounded text-gray-800">{formData.medicalHistory}</p>
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800">
                    <strong>Status:</strong> Your emergency report has been submitted to nearby hospitals. They will
                    review your case and coordinate immediate response. Stay on the line if contact is needed.
                  </p>
                </div>

                <Button onClick={handleReset} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Submit Another Report
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

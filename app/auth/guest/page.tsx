"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Heart, User, Shuffle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

export default function GuestPage() {
  const router = useRouter()
  const { signInAsGuest } = useAuth()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    age: "",
    gender: "",
    bloodGroup: "",
    genotype: "",
    medicalHistory: "",
    emergencyContact: "",
    emergencyContactPhone: "",
    simulationMode: false,
  })

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
    if (!formData.age || Number.parseInt(formData.age) < 1 || Number.parseInt(formData.age) > 120) {
      newErrors.age = "Please enter a valid age between 1 and 120"
    }
    if (!formData.gender) newErrors.gender = "Gender is required"
    if (!formData.bloodGroup) newErrors.bloodGroup = "Blood group is required"
    if (!formData.genotype) newErrors.genotype = "Genotype is required"
    if (!formData.emergencyContact.trim()) newErrors.emergencyContact = "Emergency contact name is required"
    if (!formData.emergencyContactPhone.trim()) {
      newErrors.emergencyContactPhone = "Emergency contact phone is required"
    } else if (!/^\+?[\d\s\-$$$$]{10,}$/.test(formData.emergencyContactPhone)) {
      newErrors.emergencyContactPhone = "Please enter a valid phone number"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const fillRandomData = () => {
    const firstNames = [
      "John",
      "Jane",
      "Michael",
      "Sarah",
      "David",
      "Emily",
      "James",
      "Jessica",
      "Robert",
      "Ashley",
      "William",
      "Amanda",
      "Christopher",
      "Stephanie",
      "Matthew",
      "Jennifer",
      "Joshua",
      "Elizabeth",
      "Daniel",
      "Megan",
      "Anthony",
      "Nicole",
      "Mark",
      "Samantha",
      "Donald",
      "Rachel",
      "Steven",
      "Heather",
      "Andrew",
      "Michelle",
    ]

    const lastNames = [
      "Smith",
      "Johnson",
      "Williams",
      "Brown",
      "Jones",
      "Garcia",
      "Miller",
      "Davis",
      "Rodriguez",
      "Martinez",
      "Hernandez",
      "Lopez",
      "Gonzalez",
      "Wilson",
      "Anderson",
      "Thomas",
      "Taylor",
      "Moore",
      "Jackson",
      "Martin",
      "Lee",
      "Perez",
      "Thompson",
      "White",
      "Harris",
      "Sanchez",
      "Clark",
      "Ramirez",
      "Lewis",
      "Robinson",
    ]

    const genders = ["Male", "Female", "Other", "Prefer not to say"]
    const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
    const genotypes = ["AA", "AS", "AC", "SS", "SC", "CC"]
    const medicalHistories = [
      "No significant medical history",
      "Hypertension",
      "Diabetes Type 2",
      "Asthma",
      "Allergies to penicillin",
      "Previous surgery - appendectomy",
      "Migraine headaches",
      "High cholesterol",
      "Arthritis",
      "Depression",
      "Anxiety disorder",
      "Heart disease",
      "Kidney stones",
      "Thyroid disorder",
      "Previous fracture - left arm",
    ]

    const emergencyContacts = [
      "Mary Johnson",
      "Robert Smith",
      "Linda Williams",
      "James Brown",
      "Patricia Jones",
      "Michael Davis",
      "Jennifer Garcia",
      "William Miller",
      "Elizabeth Wilson",
      "David Anderson",
      "Susan Thomas",
      "Richard Taylor",
      "Jessica Moore",
      "Charles Jackson",
      "Sarah Martin",
      "Joseph Lee",
      "Nancy Thompson",
      "Thomas White",
      "Lisa Harris",
      "Christopher Clark",
    ]

    const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const randomAge = Math.floor(Math.random() * 60) + 18 // 18-77 years
    const randomGender = genders[Math.floor(Math.random() * genders.length)]
    const randomBloodGroup = bloodGroups[Math.floor(Math.random() * bloodGroups.length)]
    const randomGenotype = genotypes[Math.floor(Math.random() * genotypes.length)]
    const randomMedicalHistory = medicalHistories[Math.floor(Math.random() * medicalHistories.length)]
    const randomEmergencyContact = emergencyContacts[Math.floor(Math.random() * emergencyContacts.length)]
    const randomPhone = `+1-555-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`

    setFormData({
      firstName: randomFirstName,
      lastName: randomLastName,
      age: randomAge.toString(),
      gender: randomGender,
      bloodGroup: randomBloodGroup,
      genotype: randomGenotype,
      medicalHistory: randomMedicalHistory,
      emergencyContact: randomEmergencyContact,
      emergencyContactPhone: randomPhone,
      simulationMode: true, // Auto-enable simulation mode with random data
    })

    // Clear any existing errors
    setErrors({})

    toast({
      title: "Random data filled",
      description: "Form has been populated with sample data for testing purposes.",
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      await signInAsGuest({
        firstName: formData.firstName,
        lastName: formData.lastName,
        age: Number.parseInt(formData.age),
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        genotype: formData.genotype,
        medicalHistory: formData.medicalHistory,
        emergencyContact: formData.emergencyContact,
        emergencyContactPhone: formData.emergencyContactPhone,
        simulationMode: formData.simulationMode,
      })

      toast({
        title: "Welcome!",
        description: "You have successfully signed in as a guest.",
      })

      router.push("/emergency")
    } catch (error) {
      console.error("Guest sign in failed:", error)
      toast({
        title: "Sign In Failed",
        description: "There was an error signing you in. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Heart className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">Medic AI</h1>
          </div>
          <CardTitle className="flex items-center justify-center space-x-2">
            <User className="h-5 w-5" />
            <span>Guest Access</span>
          </CardTitle>
          <p className="text-gray-600">
            Provide your medical information for emergency assistance. This information will be used to help medical
            professionals provide better care.
          </p>
        </CardHeader>

        <CardContent>
          <div className="mb-6">
            <Button
              type="button"
              onClick={fillRandomData}
              variant="outline"
              className="w-full bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
              disabled={loading}
            >
              <Shuffle className="h-4 w-4 mr-2" />
              Fill Random Data (For Testing)
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    className={errors.firstName ? "border-red-500" : ""}
                    disabled={loading}
                  />
                  {errors.firstName && <p className="text-sm text-red-600 mt-1">{errors.firstName}</p>}
                </div>

                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    className={errors.lastName ? "border-red-500" : ""}
                    disabled={loading}
                  />
                  {errors.lastName && <p className="text-sm text-red-600 mt-1">{errors.lastName}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    min="1"
                    max="120"
                    value={formData.age}
                    onChange={(e) => handleInputChange("age", e.target.value)}
                    className={errors.age ? "border-red-500" : ""}
                    disabled={loading}
                  />
                  {errors.age && <p className="text-sm text-red-600 mt-1">{errors.age}</p>}
                </div>

                <div>
                  <Label htmlFor="gender">Gender *</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => handleInputChange("gender", value)}
                    disabled={loading}
                  >
                    <SelectTrigger className={errors.gender ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                      <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && <p className="text-sm text-red-600 mt-1">{errors.gender}</p>}
                </div>
              </div>
            </div>

            {/* Medical Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Medical Information</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bloodGroup">Blood Group *</Label>
                  <Select
                    value={formData.bloodGroup}
                    onValueChange={(value) => handleInputChange("bloodGroup", value)}
                    disabled={loading}
                  >
                    <SelectTrigger className={errors.bloodGroup ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.bloodGroup && <p className="text-sm text-red-600 mt-1">{errors.bloodGroup}</p>}
                </div>

                <div>
                  <Label htmlFor="genotype">Genotype *</Label>
                  <Select
                    value={formData.genotype}
                    onValueChange={(value) => handleInputChange("genotype", value)}
                    disabled={loading}
                  >
                    <SelectTrigger className={errors.genotype ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select genotype" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AA">AA</SelectItem>
                      <SelectItem value="AS">AS</SelectItem>
                      <SelectItem value="AC">AC</SelectItem>
                      <SelectItem value="SS">SS</SelectItem>
                      <SelectItem value="SC">SC</SelectItem>
                      <SelectItem value="CC">CC</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.genotype && <p className="text-sm text-red-600 mt-1">{errors.genotype}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="medicalHistory">Medical History</Label>
                <Textarea
                  id="medicalHistory"
                  placeholder="Any known medical conditions, allergies, medications, or previous surgeries..."
                  value={formData.medicalHistory}
                  onChange={(e) => handleInputChange("medicalHistory", e.target.value)}
                  rows={3}
                  disabled={loading}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Include any allergies, chronic conditions, current medications, or relevant medical history
                </p>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Emergency Contact</h3>

              <div>
                <Label htmlFor="emergencyContact">Emergency Contact Name *</Label>
                <Input
                  id="emergencyContact"
                  placeholder="Full name of emergency contact"
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                  className={errors.emergencyContact ? "border-red-500" : ""}
                  disabled={loading}
                />
                {errors.emergencyContact && <p className="text-sm text-red-600 mt-1">{errors.emergencyContact}</p>}
              </div>

              <div>
                <Label htmlFor="emergencyContactPhone">Emergency Contact Phone *</Label>
                <Input
                  id="emergencyContactPhone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.emergencyContactPhone}
                  onChange={(e) => handleInputChange("emergencyContactPhone", e.target.value)}
                  className={errors.emergencyContactPhone ? "border-red-500" : ""}
                  disabled={loading}
                />
                {errors.emergencyContactPhone && (
                  <p className="text-sm text-red-600 mt-1">{errors.emergencyContactPhone}</p>
                )}
              </div>
            </div>

            {/* Options */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="simulationMode"
                  checked={formData.simulationMode}
                  onCheckedChange={(checked) => handleInputChange("simulationMode", checked as boolean)}
                  disabled={loading}
                />
                <Label htmlFor="simulationMode" className="text-sm">
                  Enable simulation mode (for testing and demonstration purposes)
                </Label>
              </div>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing In..." : "Continue as Guest"}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Button variant="link" className="p-0 h-auto" onClick={() => router.push("/auth/signin")}>
                  Sign In
                </Button>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

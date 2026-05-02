"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Heart, Siren, Building2 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-red-600 fill-red-600 animate-heartbeat" />
              <h1 className="text-2xl font-bold text-gray-900">Medic AI Simulator</h1>
            </div>
            <Badge className="bg-blue-100 text-blue-700 border-blue-200">Simulation Mode</Badge>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Emergency Response Simulator</h2>
          <p className="text-xl text-gray-600 mb-2 max-w-2xl mx-auto">
            Experience both sides of emergency medical response. Choose your role and test the system.
          </p>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            No registration needed. Pure simulation experience.
          </p>
        </div>

        {/* Simulator Role Selection */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          {/* First Responder */}
          <Card className="border-blue-200 hover:border-blue-400 transition-all hover:shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Siren className="h-10 w-10 text-blue-600" />
              </div>
              <CardTitle className="text-blue-700 text-2xl">First Responder</CardTitle>
              <CardDescription>Fill emergency case information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg space-y-2 text-sm text-blue-900">
                <p>✓ Enter patient information</p>
                <p>✓ Describe symptoms & medical history</p>
                <p>✓ Get AI medical guidance</p>
                <p>✓ Submit emergency report</p>
              </div>
              <Button
                onClick={() => router.push("/simulator/first-responder")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-semibold"
                size="lg"
              >
                <Siren className="mr-2 h-5 w-5" />
                Start as First Responder
              </Button>
            </CardContent>
          </Card>

          {/* Hospital */}
          <Card className="border-green-200 hover:border-green-400 transition-all hover:shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Building2 className="h-10 w-10 text-green-600" />
              </div>
              <CardTitle className="text-green-700 text-2xl">Hospital</CardTitle>
              <CardDescription>Manage incoming emergency cases</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg space-y-2 text-sm text-green-900">
                <p>✓ View incoming emergency cases</p>
                <p>✓ See AI medical analysis</p>
                <p>✓ Accept or decline cases</p>
                <p>✓ Auto-alert for new cases (15s)</p>
              </div>
              <Button
                onClick={() => router.push("/simulator/hospital")}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-semibold"
                size="lg"
              >
                <Building2 className="mr-2 h-5 w-5" />
                Start as Hospital
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <div className="max-w-3xl mx-auto mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">How It Works</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  First Responder Submits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  As a first responder, fill in patient details including symptoms, medical history, and location.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  AI Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  The AI analyzes the emergency and provides medical insights to guide first aid and response.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  Hospital Receives Alert
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Hospitals receive alerts with audio notification when new emergency cases arrive every 15 seconds.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                  Hospital Responds
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Hospitals can accept or decline cases based on severity and availability with confirmation.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features Highlight */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
          <Card>
            <CardHeader>
              <Heart className="h-8 w-8 text-red-600 mb-2" />
              <CardTitle className="text-lg">Real-Time AI Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Instant AI medical analysis with severity classification for better decision-making
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Siren className="h-8 w-8 text-yellow-600 mb-2" />
              <CardTitle className="text-lg">Audio Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Automatic sound notifications when new emergency cases arrive to ensure visibility
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Building2 className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle className="text-lg">Case Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Easy accept/decline workflow with confirmation dialogs to prevent accidental actions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Info Box */}
        <div className="mt-12 p-6 bg-yellow-50 border border-yellow-200 rounded-lg max-w-2xl mx-auto">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-6 w-6 text-yellow-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-yellow-800 mb-2">Simulation Notice</h3>
              <p className="text-yellow-700 text-sm">
                This is a fully simulated environment for educational and demonstration purposes. New emergency cases
                are generated automatically every 15 seconds. Choose a role above to begin your simulation.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

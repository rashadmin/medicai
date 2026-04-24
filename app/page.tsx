"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Heart, MapPin, Clock, Users, User, Building2, UserPlus } from "lucide-react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => window.location.reload()}>
              <Heart className="h-8 w-8 text-red-500" />
              <h1 className="text-2xl font-bold text-gray-900 hover:text-red-600 transition-colors">Medic AI</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-green-600 border-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                System Online
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Emergency Medical Response</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Get instant AI-powered emergency assistance with real-time hospital coordination, ambulance dispatch, and
            first aid guidance.
          </p>
        </div>

        {/* Authentication Options */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
          {/* Sign In as User */}
          <Card className="border-blue-200 hover:border-blue-300 transition-colors">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-blue-700">Sign In as User</CardTitle>
              <CardDescription>Access your personal emergency profile and history</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => router.push("/auth/signin?role=user")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-semibold"
                size="lg"
              >
                <User className="mr-2 h-5 w-5" />
                User Sign In
              </Button>
            </CardContent>
          </Card>

          {/* Sign In as Hospital */}
          <Card className="border-green-200 hover:border-green-300 transition-colors">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Building2 className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-green-700">Sign In as Hospital</CardTitle>
              <CardDescription>Access hospital dashboard and manage emergency requests</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => router.push("/auth/signin?role=hospital")}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-lg font-semibold"
                size="lg"
              >
                <Building2 className="mr-2 h-5 w-5" />
                Hospital Sign In
              </Button>
            </CardContent>
          </Card>

          {/* Continue as Guest */}
          <Card className="border-purple-200 hover:border-purple-300 transition-colors">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle className="text-purple-700">Continue as Guest</CardTitle>
              <CardDescription>Quick access without creating an account</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => router.push("/auth/guest")}
                variant="outline"
                className="w-full border-purple-600 text-purple-600 hover:bg-purple-50 py-4 text-lg font-semibold"
                size="lg"
              >
                <Users className="mr-2 h-5 w-5" />
                Guest Access
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sign Up Link */}
        <div className="text-center mb-12">
          <p className="text-gray-600 mb-4">Don't have an account?</p>
          <Button
            onClick={() => router.push("/auth/signup")}
            variant="outline"
            size="lg"
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <UserPlus className="mr-2 h-5 w-5" />
            Sign Up Here
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <Clock className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle className="text-lg">Real-Time Response</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Instant hospital coordination with live ETA updates and ambulance tracking
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Heart className="h-8 w-8 text-red-600 mb-2" />
              <CardTitle className="text-lg">AI First Aid</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Intelligent first aid guidance with video tutorials and safety instructions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <MapPin className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle className="text-lg">Smart Routing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Optimal hospital selection based on proximity, availability, and capabilities
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Emergency Info */}
        <div className="mt-12 p-6 bg-yellow-50 border border-yellow-200 rounded-lg max-w-2xl mx-auto">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-6 w-6 text-yellow-600 mt-1" />
            <div>
              <h3 className="font-semibold text-yellow-800 mb-2">Important Notice</h3>
              <p className="text-yellow-700 text-sm">
                For life-threatening emergencies, always call your local emergency number (911, 999, etc.) first. This
                system provides additional support and coordination but should not replace emergency services.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

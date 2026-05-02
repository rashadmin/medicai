"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, ArrowLeft, ChevronDown, ChevronUp, AlertTriangle, Check, X } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { EmergencyCase, generateMockCase, playAlertSound } from "@/lib/simulator-utils"

export default function HospitalSimulator() {
  const router = useRouter()
  const [cases, setCases] = useState<EmergencyCase[]>([])
  const [expandedCaseId, setExpandedCaseId] = useState<string | null>(null)
  const [confirmAction, setConfirmAction] = useState<{
    caseId: string
    action: "accept" | "decline"
  } | null>(null)
  const [processedCases, setProcessedCases] = useState<Set<string>>(new Set())

  // Generate initial case
  useEffect(() => {
    setCases([generateMockCase()])
  }, [])

  // Auto-generate new cases every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const newCase = generateMockCase()
      setCases((prev) => [newCase, ...prev])
      playAlertSound()
    }, 15000)

    return () => clearInterval(interval)
  }, [])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "border-l-4 border-l-red-600 bg-red-50"
      case "medium":
        return "border-l-4 border-l-yellow-500 bg-yellow-50"
      case "low":
        return "border-l-4 border-l-green-600 bg-green-50"
      default:
        return "border-l-4 border-l-gray-400"
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Badge className="bg-red-100 text-red-700 border-red-300">Critical</Badge>
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">Medium</Badge>
      case "low":
        return <Badge className="bg-green-100 text-green-700 border-green-300">Low</Badge>
      default:
        return null
    }
  }

  const handleAccept = (caseId: string) => {
    setConfirmAction({ caseId, action: "accept" })
  }

  const handleDecline = (caseId: string) => {
    setConfirmAction({ caseId, action: "decline" })
  }

  const confirmDecision = () => {
    if (!confirmAction) return

    setProcessedCases((prev) => new Set([...prev, confirmAction.caseId]))
    setConfirmAction(null)

    setTimeout(() => {
      setCases((prev) => prev.filter((c) => c.id !== confirmAction.caseId))
      setExpandedCaseId(null)
    }, 500)
  }

  const cancelConfirm = () => {
    setConfirmAction(null)
  }

  const activeCases = cases.filter((c) => !processedCases.has(c.id))

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
              <h1 className="text-xl font-bold text-gray-900">Hospital Emergency Dashboard</h1>
            </div>
            <Badge className="bg-green-100 text-green-700 border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Active: {activeCases.length}
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Status Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 mb-2">{activeCases.filter((c) => c.severity === "critical").length}</div>
                <p className="text-sm text-gray-600">Critical Cases</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600 mb-2">{activeCases.filter((c) => c.severity === "medium").length}</div>
                <p className="text-sm text-gray-600">Medium Priority</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">{activeCases.filter((c) => c.severity === "low").length}</div>
                <p className="text-sm text-gray-600">Low Priority</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Emergency Cases List */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Incoming Emergency Cases</h2>

          {activeCases.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="pt-8 text-center py-12">
                <AlertTriangle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Active Cases</h3>
                <p className="text-gray-500">Waiting for emergency cases... New cases will appear automatically.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {activeCases.map((emergencyCase) => (
                <Card key={emergencyCase.id} className={`transition-all ${getSeverityColor(emergencyCase.severity)}`}>
                  <Collapsible
                    open={expandedCaseId === emergencyCase.id}
                    onOpenChange={(open) => setExpandedCaseId(open ? emergencyCase.id : null)}
                  >
                    <CollapsibleTrigger asChild>
                      <div className="cursor-pointer p-4 flex items-center justify-between hover:bg-gray-100 transition-colors rounded-t-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div>
                              <h3 className="font-semibold text-lg">{emergencyCase.patientName}</h3>
                              <p className="text-sm text-gray-600">
                                Age: {emergencyCase.age} | Blood: {emergencyCase.bloodGroup}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getSeverityBadge(emergencyCase.severity)}
                          {expandedCaseId === emergencyCase.id ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
                          )}
                        </div>
                      </div>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <div className="border-t px-4 py-4 space-y-4">
                        {/* Location */}
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-1">Location</p>
                          <p className="text-gray-600">{emergencyCase.location}</p>
                        </div>

                        {/* Symptoms */}
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-2">Symptoms</p>
                          <div className="flex flex-wrap gap-2">
                            {emergencyCase.symptoms.map((symptom, idx) => (
                              <Badge key={idx} variant="outline" className="bg-white">
                                {symptom}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Medical History */}
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-2">Medical History</p>
                          <div className="flex flex-wrap gap-2">
                            {emergencyCase.medicalHistory.map((history, idx) => (
                              <Badge key={idx} variant="secondary">
                                {history}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* AI Analysis */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <p className="text-sm font-semibold text-blue-900 mb-2">AI Medical Analysis</p>
                          <p className="text-blue-800 text-sm leading-relaxed">{emergencyCase.aiAnalysis}</p>
                        </div>

                        {/* Time */}
                        <div className="text-xs text-gray-500">
                          Received: {emergencyCase.timestamp.toLocaleTimeString()}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4 border-t">
                          <Button
                            onClick={() => handleAccept(emergencyCase.id)}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Accept Case
                          </Button>
                          <Button
                            onClick={() => handleDecline(emergencyCase.id)}
                            variant="outline"
                            className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Decline Case
                          </Button>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className={confirmAction.action === "accept" ? "text-green-700" : "text-red-700"}>
                Confirm {confirmAction.action === "accept" ? "Acceptance" : "Decline"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Are you sure you want to <strong>{confirmAction.action === "accept" ? "accept" : "decline"}</strong> this
                emergency case?
              </p>
              <p className="text-sm text-gray-500">
                Case ID: <code className="bg-gray-100 px-2 py-1 rounded">{confirmAction.caseId}</code>
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={cancelConfirm}
                  variant="outline"
                  className="flex-1 border-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmDecision}
                  className={`flex-1 text-white ${
                    confirmAction.action === "accept" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  Confirm
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

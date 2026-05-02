"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { AlertTriangle, ChevronDown } from "lucide-react"

interface EmergencyCase {
  id: string
  patientName: string
  age: number
  bloodGroup: string
  severity: "critical" | "medium" | "low"
  emergencyType: string
  medicalHistory: string[]
  aiInference: string
  timestamp: string
  initialMessage: string
}

const mockCases: EmergencyCase[] = [
  {
    id: "1",
    patientName: "John Doe",
    age: 45,
    bloodGroup: "O+",
    severity: "critical",
    emergencyType: "Acute Myocardial Infarction",
    medicalHistory: ["Hypertension", "Diabetes Type 2", "Smoking history"],
    aiInference:
      "AI analysis indicates acute myocardial infarction with ST-elevation pattern. Patient experiencing severe chest pain radiating to left arm. Immediate cardiac intervention required.",
    timestamp: "2:34 PM",
    initialMessage:
      "I have severe chest pain, it started 30 minutes ago. I can't breathe properly.",
  },
  {
    id: "2",
    patientName: "Sarah Johnson",
    age: 28,
    bloodGroup: "AB-",
    severity: "medium",
    emergencyType: "Acute Appendicitis",
    medicalHistory: ["No significant history", "Previous surgery: Tonsillectomy"],
    aiInference:
      "AI analysis suggests acute appendicitis with potential perforation risk. Right lower abdominal pain with fever. Surgical consultation recommended within 4 hours.",
    timestamp: "1:12 PM",
    initialMessage:
      "I have sharp pain in my lower right abdomen, feeling nauseous and have a fever of 38.5°C",
  },
  {
    id: "3",
    patientName: "Michael Chen",
    age: 62,
    bloodGroup: "B+",
    severity: "critical",
    emergencyType: "Acute Stroke",
    medicalHistory: ["Atrial Fibrillation", "High cholesterol", "Previous TIA"],
    aiInference:
      "AI detection of acute ischemic stroke with facial drooping and speech difficulty. NIHSS score suggests severe stroke. Thrombolytic therapy window still open. Time critical.",
    timestamp: "3:45 PM",
    initialMessage: "My face feels numb on one side and I can't speak clearly",
  },
  {
    id: "4",
    patientName: "Emma Wilson",
    age: 35,
    bloodGroup: "A-",
    severity: "medium",
    emergencyType: "Moderate Allergic Reaction",
    medicalHistory: ["Nut allergy", "Asthma"],
    aiInference:
      "AI analysis indicates moderate allergic reaction with mild angioedema and respiratory involvement. Epinephrine administered. Monitor for progression to anaphylaxis.",
    timestamp: "2:10 PM",
    initialMessage:
      "My lips and throat feel swollen after eating something at a restaurant",
  },
  {
    id: "5",
    patientName: "David Martinez",
    age: 19,
    bloodGroup: "O-",
    severity: "low",
    emergencyType: "Laceration and Bleeding",
    medicalHistory: ["No significant history"],
    aiInference:
      "AI analysis of laceration shows superficial wound requiring sutures. Bleeding controlled. No signs of nerve or tendon involvement. Standard wound care protocol recommended.",
    timestamp: "1:50 PM",
    initialMessage:
      "I cut my hand accidentally while cooking, it's bleeding quite a bit",
  },
]

const severityConfig = {
  critical: {
    borderColor: "border-l-4 border-l-red-600",
    badgeColor: "bg-red-100 text-red-800",
    badgeLabel: "Critical",
    icon: "🔴",
  },
  medium: {
    borderColor: "border-l-4 border-l-yellow-500",
    badgeColor: "bg-yellow-100 text-yellow-800",
    badgeLabel: "Medium",
    icon: "🟡",
  },
  low: {
    borderColor: "border-l-4 border-l-green-600",
    badgeColor: "bg-green-100 text-green-800",
    badgeLabel: "Low",
    icon: "🟢",
  },
}

export default function EmergencyCases() {
  const [expandedCase, setExpandedCase] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-6">
        <AlertTriangle className="h-5 w-5 text-red-600" />
        <h2 className="text-2xl font-bold text-gray-900">Active Emergency Cases</h2>
        <Badge variant="default" className="bg-red-600">
          {mockCases.length}
        </Badge>
      </div>

      {mockCases.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="font-semibold text-gray-600 mb-2">No Active Cases</h3>
            <p className="text-gray-500 text-sm">
              Emergency cases will appear here when received from the system.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {mockCases.map((caseItem) => {
            const config = severityConfig[caseItem.severity]
            const isExpanded = expandedCase === caseItem.id

            return (
              <Collapsible
                key={caseItem.id}
                open={isExpanded}
                onOpenChange={(open) => setExpandedCase(open ? caseItem.id : null)}
              >
                <Card className={`${config.borderColor} overflow-hidden`}>
                  <CollapsibleTrigger asChild>
                    <button className="w-full hover:bg-gray-50 transition-colors">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 text-left">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {caseItem.patientName}
                              </h3>
                              <Badge className={config.badgeColor}>
                                {config.badgeLabel}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {caseItem.emergencyType}
                            </p>
                            <p className="text-sm text-gray-500 italic">
                              {caseItem.initialMessage}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className="text-xs text-gray-500">{caseItem.timestamp}</span>
                            <ChevronDown
                              className={`h-5 w-5 text-gray-500 transition-transform ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                            />
                          </div>
                        </div>
                      </CardHeader>
                    </button>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <CardContent className="pt-0 pb-4 space-y-4 border-t">
                      {/* Patient Info */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-600 font-medium">Age</p>
                          <p className="text-lg font-bold text-gray-900">{caseItem.age}</p>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-600 font-medium">Blood Group</p>
                          <p className="text-lg font-bold text-gray-900">
                            {caseItem.bloodGroup}
                          </p>
                        </div>
                        <div className="bg-orange-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-600 font-medium">Severity</p>
                          <p className="text-lg font-bold text-gray-900">{config.icon}</p>
                        </div>
                      </div>

                      {/* Medical History */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Medical History</h4>
                        <div className="space-y-2">
                          {caseItem.medicalHistory.map((history, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 text-sm text-gray-700"
                            >
                              <span className="inline-block w-2 h-2 bg-gray-400 rounded-full"></span>
                              {history}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* AI Inference */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                            AI Analysis
                          </span>
                        </h4>
                        <p className="text-sm text-gray-700 leading-relaxed bg-blue-50 p-3 rounded-lg">
                          {caseItem.aiInference}
                        </p>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            )
          })}
        </div>
      )}
    </div>
  )
}

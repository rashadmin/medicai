"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Heart, Search, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, X, Play } from "lucide-react"

interface FirstAidModalProps {
  onClose: () => void
}

interface FirstAidTopic {
  id: string
  title: string
  category: string
  severity: "low" | "medium" | "high"
  steps: string[]
  warnings: string[]
  videoId?: string
}

const firstAidTopics: FirstAidTopic[] = [
  {
    id: "cpr",
    title: "CPR (Cardiopulmonary Resuscitation)",
    category: "Cardiac",
    severity: "high",
    steps: [
      "Check for responsiveness - tap shoulders and shout 'Are you okay?'",
      "Call emergency services immediately or have someone else do it",
      "Place person on firm, flat surface on their back",
      "Tilt head back slightly and lift chin to open airway",
      "Place heel of one hand on center of chest between nipples",
      "Place other hand on top, interlacing fingers",
      "Push hard and fast at least 2 inches deep at 100-120 compressions per minute",
      "Allow complete chest recoil between compressions",
      "Continue until emergency services arrive",
    ],
    warnings: [
      "Only perform if person is unresponsive and not breathing normally",
      "Do not stop compressions unless person starts breathing normally",
      "Switch with another person every 2 minutes if possible to avoid fatigue",
    ],
    videoId: "tD2qTmih4ic",
  },
  {
    id: "choking",
    title: "Choking (Heimlich Maneuver)",
    category: "Respiratory",
    severity: "high",
    steps: [
      "Ask 'Are you choking?' - if they can't speak, cough, or breathe, begin first aid",
      "Stand behind the person and wrap arms around their waist",
      "Make a fist with one hand and place thumb side against upper abdomen",
      "Grasp fist with other hand and press into abdomen with quick upward thrust",
      "Repeat until object is expelled or person becomes unconscious",
      "If person becomes unconscious, begin CPR",
    ],
    warnings: [
      "Do not perform on someone who can cough, speak, or breathe",
      "For pregnant women or obese individuals, place hands on chest instead of abdomen",
      "Seek medical attention even if object is successfully removed",
    ],
  },
  {
    id: "bleeding",
    title: "Severe Bleeding Control",
    category: "Trauma",
    severity: "high",
    steps: [
      "Apply direct pressure to wound with clean cloth or bandage",
      "Maintain pressure continuously - do not lift to check bleeding",
      "If blood soaks through, add more layers without removing original",
      "Elevate injured area above heart level if possible",
      "Apply pressure to pressure points if bleeding doesn't stop",
      "Apply tourniquet only if trained and bleeding is life-threatening",
    ],
    warnings: [
      "Do not remove embedded objects - stabilize them instead",
      "Do not use tourniquet unless specifically trained",
      "Seek immediate medical attention for severe bleeding",
    ],
  },
  {
    id: "burns",
    title: "Burns (1st and 2nd Degree)",
    category: "Trauma",
    severity: "medium",
    steps: [
      "Remove person from heat source if safe to do so",
      "Cool burn with cool (not cold) running water for 10-20 minutes",
      "Remove jewelry and loose clothing before swelling begins",
      "Cover burn with sterile, non-adhesive bandage or clean cloth",
      "Take over-the-counter pain medication if needed",
      "Keep person warm to prevent shock",
    ],
    warnings: [
      "Do not use ice, butter, or home remedies on burns",
      "Do not break blisters",
      "Seek medical attention for burns larger than palm of hand or on face, hands, feet, or genitals",
    ],
  },
  {
    id: "seizure",
    title: "Seizure Response",
    category: "Neurological",
    severity: "medium",
    steps: [
      "Stay calm and time the seizure",
      "Clear area of hard or sharp objects",
      "Place something soft under person's head",
      "Turn person on their side to keep airway clear",
      "Do not restrain movements or put anything in mouth",
      "Stay with person until seizure ends and they are fully conscious",
    ],
    warnings: [
      "Never put anything in person's mouth during seizure",
      "Do not hold person down or try to stop movements",
      "Call emergency services if seizure lasts more than 5 minutes",
    ],
  },
  {
    id: "allergic-reaction",
    title: "Allergic Reaction",
    category: "Medical",
    severity: "medium",
    steps: [
      "Remove or avoid the allergen if known",
      "Help person use their epinephrine auto-injector if available",
      "Have person sit up if breathing is difficult, lie down if feeling faint",
      "Loosen tight clothing around neck and waist",
      "Monitor breathing and consciousness",
      "Be prepared to perform CPR if person becomes unconscious",
    ],
    warnings: [
      "Call emergency services immediately for severe reactions",
      "Even if epinephrine is used, emergency medical care is still needed",
      "Watch for signs of anaphylaxis: difficulty breathing, swelling, rapid pulse",
    ],
  },
]

export function FirstAidModal({ onClose }: FirstAidModalProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null)

  const categories = ["all", "Cardiac", "Respiratory", "Trauma", "Neurological", "Medical"]

  const filteredTopics = firstAidTopics.filter((topic) => {
    const matchesSearch =
      topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      topic.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || topic.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Heart className="h-5 w-5 text-red-500" />
            <span>First Aid Guide</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search first aid topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="capitalize"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Topics List */}
          <div className="flex-1 overflow-y-auto space-y-3">
            {filteredTopics.map((topic) => (
              <div key={topic.id} className="border rounded-lg overflow-hidden">
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedTopic(expandedTopic === topic.id ? null : topic.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold text-gray-900">{topic.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        {topic.category}
                      </Badge>
                      <Badge className={`text-xs ${getSeverityColor(topic.severity)}`}>
                        {topic.severity.toUpperCase()}
                      </Badge>
                      {topic.videoId && (
                        <Badge variant="outline" className="text-xs">
                          <Play className="h-2 w-2 mr-1" />
                          Video
                        </Badge>
                      )}
                    </div>
                    {expandedTopic === topic.id ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </div>

                {expandedTopic === topic.id && (
                  <div className="px-4 pb-4 border-t bg-gray-50">
                    <div className="grid md:grid-cols-2 gap-6 mt-4">
                      {/* Steps */}
                      <div>
                        <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Steps to Follow
                        </h4>
                        <ol className="space-y-2">
                          {topic.steps.map((step, index) => (
                            <li key={index} className="flex items-start space-x-2 text-sm">
                              <span className="bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                                {index + 1}
                              </span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* Warnings */}
                      <div>
                        <h4 className="font-semibold text-red-800 mb-3 flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Important Warnings
                        </h4>
                        <ul className="space-y-2">
                          {topic.warnings.map((warning, index) => (
                            <li key={index} className="flex items-start space-x-2 text-sm">
                              <X className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                              <span className="text-red-700">{warning}</span>
                            </li>
                          ))}
                        </ul>

                        {topic.videoId && (
                          <div className="mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(`https://youtube.com/watch?v=${topic.videoId}`, "_blank")}
                              className="w-full"
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Watch Video Tutorial
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {filteredTopics.length === 0 && (
              <div className="text-center py-8">
                <Heart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="font-semibold text-gray-600 mb-2">No topics found</h3>
                <p className="text-gray-500 text-sm">Try adjusting your search or filter criteria.</p>
              </div>
            )}
          </div>

          {/* Emergency Disclaimer */}
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-red-800 text-sm">Emergency Disclaimer</h4>
                <p className="text-red-700 text-xs mt-1">
                  This guide provides basic first aid information. For life-threatening emergencies, always call your
                  local emergency number (911, 999, etc.) first. First aid should only be performed by those trained to
                  do so.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

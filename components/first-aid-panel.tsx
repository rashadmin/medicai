"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, AlertTriangle, CheckCircle, X, Play, MessageCircle, ChevronDown, ChevronUp, Clock } from "lucide-react"
import AIChatbot from "@/components/ai-chatbot"
import VideoModal from "@/components/video-modal"
// Declare AIChatbot variable

interface FirstAidPanelProps {
  emergencyType: string
  severity: string
}

export function FirstAidPanel({ emergencyType, severity }: FirstAidPanelProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>("immediate")
  const [showChat, setShowChat] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<any>(null)
  const [showVideoModal, setShowVideoModal] = useState(false)

  const getFirstAidContent = () => {
    switch (emergencyType.toLowerCase()) {
      case "cardiac emergency":
        return {
          immediate: [
            "Call emergency services immediately",
            "Check if person is responsive",
            "Begin CPR if no pulse detected",
            "Use AED if available",
          ],
          doNots: [
            "Don't give food or water",
            "Don't leave the person alone",
            "Don't give medications unless prescribed",
          ],
          videos: [
            {
              title: "CPR Basics - Adult CPR",
              id: "tD2qTmih4ic",
              thumbnail: "/placeholder.svg?height=120&width=200",
              duration: "3:45",
              description: "Learn the essential steps for performing CPR on adults in emergency situations.",
            },
            {
              title: "How to Use an AED",
              id: "BQdNbXm5-kI",
              thumbnail: "/placeholder.svg?height=120&width=200",
              duration: "2:30",
              description: "Step-by-step guide on using an Automated External Defibrillator (AED).",
            },
          ],
        }
      case "trauma/injury":
        return {
          immediate: [
            "Control bleeding with direct pressure",
            "Keep the person still and calm",
            "Check for signs of shock",
            "Don't move if spinal injury suspected",
          ],
          doNots: [
            "Don't remove embedded objects",
            "Don't move the person unnecessarily",
            "Don't give pain medication",
          ],
          videos: [
            {
              title: "CPR Basics - Adult CPR",
              id: "tD2qTmih4ic",
              thumbnail: "/placeholder.svg?height=120&width=200",
              duration: "3:45",
              description: "Learn the essential steps for performing CPR on adults in emergency situations.",
            },
            {
              title: "How to Use an AED",
              id: "BQdNbXm5-kI",
              thumbnail: "/placeholder.svg?height=120&width=200",
              duration: "2:30",
              description: "Step-by-step guide on using an Automated External Defibrillator (AED).",
            },
          ],
        }
      case "respiratory emergency":
        return {
          immediate: [
            "Help person sit upright",
            "Loosen tight clothing",
            "Assist with prescribed inhaler if available",
            "Monitor breathing closely",
          ],
          doNots: ["Don't lay the person flat", "Don't give food or drink", "Don't leave them alone"],
          videos: [
            {
              title: "CPR Basics - Adult CPR",
              id: "tD2qTmih4ic",
              thumbnail: "/placeholder.svg?height=120&width=200",
              duration: "3:45",
              description: "Learn the essential steps for performing CPR on adults in emergency situations.",
            },
            {
              title: "How to Use an AED",
              id: "BQdNbXm5-kI",
              thumbnail: "/placeholder.svg?height=120&width=200",
              duration: "2:30",
              description: "Step-by-step guide on using an Automated External Defibrillator (AED).",
            },
          ],
        }
      default:
        return {
          immediate: [
            "Stay calm and assess the situation",
            "Ensure the area is safe",
            "Check person's responsiveness",
            "Monitor vital signs",
          ],
          doNots: ["Don't panic", "Don't move the person unless necessary", "Don't give medications unless prescribed"],
          videos: [
            {
              title: "CPR Basics - Adult CPR",
              id: "tD2qTmih4ic",
              thumbnail: "/placeholder.svg?height=120&width=200",
              duration: "3:45",
              description: "Learn the essential steps for performing CPR on adults in emergency situations.",
            },
            {
              title: "How to Use an AED",
              id: "BQdNbXm5-kI",
              thumbnail: "/placeholder.svg?height=120&width=200",
              duration: "2:30",
              description: "Step-by-step guide on using an Automated External Defibrillator (AED).",
            },
          ],
        }
    }
  }

  const firstAidContent = getFirstAidContent()

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  return (
    <div className="space-y-4">
      {/* Emergency Type Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Heart className="h-5 w-5 text-red-500" />
              <span>First Aid Guidance</span>
            </CardTitle>
            <Badge variant={severity === "High" ? "destructive" : "secondary"}>{severity} Priority</Badge>
          </div>
          <p className="text-sm text-gray-600">{emergencyType}</p>
        </CardHeader>
      </Card>

      {/* Immediate Actions */}
      <Card>
        <CardHeader className="cursor-pointer" onClick={() => toggleSection("immediate")}>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2 text-base">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Immediate Actions</span>
            </CardTitle>
            {expandedSection === "immediate" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </CardHeader>
        {expandedSection === "immediate" && (
          <CardContent className="pt-0">
            <ul className="space-y-2">
              {firstAidContent.immediate.map((action, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{action}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        )}
      </Card>

      {/* What NOT to Do */}
      <Card>
        <CardHeader className="cursor-pointer" onClick={() => toggleSection("donts")}>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2 text-base">
              <X className="h-4 w-4 text-red-600" />
              <span>Do NOT Do</span>
            </CardTitle>
            {expandedSection === "donts" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </CardHeader>
        {expandedSection === "donts" && (
          <CardContent className="pt-0">
            <ul className="space-y-2">
              {firstAidContent.doNots.map((action, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <X className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm font-medium text-red-700">{action}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        )}
      </Card>

      {/* Video Resources */}
      <Card>
        <CardHeader className="cursor-pointer" onClick={() => toggleSection("videos")}>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2 text-base">
              <Play className="h-4 w-4 text-blue-600" />
              <span>Video Guides</span>
            </CardTitle>
            {expandedSection === "videos" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </CardHeader>
        {expandedSection === "videos" && (
          <CardContent className="pt-0 space-y-3">
            {firstAidContent.videos.map((video, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg overflow-hidden cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => {
                  setSelectedVideo(video)
                  setShowVideoModal(true)
                }}
              >
                <div className="flex items-center space-x-3 p-3">
                  <div className="relative w-20 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                    <img
                      src={video.thumbnail || "/placeholder.svg"}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                      <Play className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium truncate">{video.title}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-2 w-2 mr-1" />
                        {video.duration}
                      </Badge>
                      <span className="text-xs text-gray-500">Video Guide</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="flex-shrink-0">
                    <Play className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        )}
      </Card>

      {/* AI Chat Interface */}
      <Card>
        <CardContent className="p-4">
          <Button onClick={() => setShowChat(!showChat)} variant="outline" className="w-full">
            <MessageCircle className="h-4 w-4 mr-2" />
            {showChat ? "Hide AI Assistant" : "Ask AI Assistant"}
          </Button>
        </CardContent>
      </Card>

      {/* AI Chatbot Interface */}
      {showChat && (
        <AIChatbot emergencyType={emergencyType} severity={severity} onMinimize={() => setShowChat(false)} />
      )}

      {/* Emergency Warning */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-800 font-medium mb-1">Important Reminder</p>
              <p className="text-xs text-yellow-700">
                This guidance supplements professional medical care. Emergency services have been contacted and are on
                their way. Continue following these instructions until help arrives.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Video Modal */}
      {showVideoModal && selectedVideo && (
        <VideoModal
          video={selectedVideo}
          isOpen={showVideoModal}
          onClose={() => {
            setShowVideoModal(false)
            setSelectedVideo(null)
          }}
        />
      )}
    </div>
  )
}

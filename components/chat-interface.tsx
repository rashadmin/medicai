"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Send, Bot, User, Loader2, MapPin } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface EmergencyData {
  type: string
  severity: string
  location: string
  description: string
}

interface ChatInterfaceProps {
  onEmergencySubmitted: (data: EmergencyData) => void
  isSimulation: boolean
  isLoading: boolean
}

export function ChatInterface({ onEmergencySubmitted, isSimulation, isLoading }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: isSimulation
        ? "Hello! I'm your AI emergency assistant. This is simulation mode - please describe a mock emergency scenario so I can demonstrate the system."
        : "Hello! I'm your AI emergency assistant. Please describe your emergency situation as clearly as possible. What's happening?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    // Simulate AI processing
    setTimeout(() => {
      const emergencyData = analyzeEmergency(input)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `I understand you're experiencing: **${emergencyData.type}** (${emergencyData.severity} severity)

Location detected: ${emergencyData.location}

I'm now contacting nearby hospitals and coordinating emergency response. Please stay calm and follow any first aid instructions I provide.

${isSimulation ? "🔄 **Simulation Mode**: Using test data for demonstration" : "🚨 **Real Emergency**: Dispatching actual emergency services"}`,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setIsTyping(false)

      // Submit emergency data
      setTimeout(() => {
        onEmergencySubmitted(emergencyData)
      }, 1000)
    }, 2000)
  }

  const analyzeEmergency = (description: string): EmergencyData => {
    // Simple keyword analysis for demo
    const lowerDesc = description.toLowerCase()

    let type = "Medical Emergency"
    let severity = "Medium"

    if (lowerDesc.includes("heart") || lowerDesc.includes("chest pain") || lowerDesc.includes("cardiac")) {
      type = "Cardiac Emergency"
      severity = "High"
    } else if (lowerDesc.includes("accident") || lowerDesc.includes("injury") || lowerDesc.includes("trauma")) {
      type = "Trauma/Injury"
      severity = "High"
    } else if (lowerDesc.includes("breathing") || lowerDesc.includes("asthma") || lowerDesc.includes("respiratory")) {
      type = "Respiratory Emergency"
      severity = "High"
    } else if (lowerDesc.includes("stroke") || lowerDesc.includes("neurological")) {
      type = "Neurological Emergency"
      severity = "High"
    } else if (lowerDesc.includes("allergic") || lowerDesc.includes("allergy")) {
      type = "Allergic Reaction"
      severity = "Medium"
    }

    return {
      type,
      severity,
      location: isSimulation ? "Demo Location, Test City" : "Current Location (GPS)",
      description,
    }
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-blue-600" />
          <span>Emergency AI Assistant</span>
          {isSimulation && <Badge variant="secondary">Simulation</Badge>}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                }`}
              >
                <div className="flex items-start space-x-2">
                  {message.role === "assistant" && <Bot className="h-4 w-4 mt-1 text-blue-600" />}
                  {message.role === "user" && <User className="h-4 w-4 mt-1 text-white" />}
                  <div className="flex-1">
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    <div className={`text-xs mt-1 ${message.role === "user" ? "text-blue-100" : "text-gray-500"}`}>
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                <div className="flex items-center space-x-2">
                  <Bot className="h-4 w-4 text-blue-600" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex justify-center py-4">
              <div className="flex items-center space-x-2 text-blue-600">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Coordinating with hospitals...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your emergency situation..."
              disabled={isTyping || isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={!input.trim() || isTyping || isLoading} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </form>

          {!isSimulation && (
            <div className="flex items-center space-x-2 mt-2 text-sm text-gray-500">
              <MapPin className="h-4 w-4" />
              <span>Location services enabled for emergency response</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

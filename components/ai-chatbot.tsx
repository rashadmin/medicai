"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Bot, User, Send, Loader2, AlertTriangle, Heart, Phone, Volume2, VolumeX, Mic, MicOff } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { apiClient, type Chat, type ChatMessage } from "@/lib/api-client"
import type { SpeechRecognition } from "speech-recognition"

interface AIChatbotProps {
  onEmergencyDetected: () => void
  className?: string
}

export default function AIChatbot({ onEmergencyDetected, className = "" }: AIChatbotProps) {
  const { user, isAuthenticated } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentChat, setCurrentChat] = useState<Chat | null>(null)
  const [emergencyDetected, setEmergencyDetected] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [speechEnabled, setSpeechEnabled] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(true)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)

  // Emergency keywords that trigger hospital selection
  const emergencyKeywords = [
    "emergency",
    "urgent",
    "help",
    "pain",
    "bleeding",
    "chest pain",
    "heart attack",
    "stroke",
    "accident",
    "injury",
    "unconscious",
    "breathing",
    "choking",
    "overdose",
    "severe",
    "critical",
    "ambulance",
    "hospital",
    "911",
    "emergency room",
    "er",
    "trauma",
    "wound",
    "burn",
    "fracture",
    "seizure",
    "allergic reaction",
  ]

  useEffect(() => {
    // Initialize speech recognition if available
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = "en-US"

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setInput(transcript)
        setIsListening(false)
      }

      recognitionRef.current.onerror = () => {
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }

    // Initialize speech synthesis
    if ("speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis
    }

    // Initialize chat
    initializeChat()
  }, [user])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const initializeChat = async () => {
    if (!user) return

    try {
      let chat: Chat
      if (isAuthenticated && "id" in user) {
        // Create new chat for authenticated user
        chat = await apiClient.createUserChat(user.id)
      } else {
        // Create or get anonymous chat
        chat = await apiClient.createAnonymousChat(user.username)
      }

      setCurrentChat(chat)
      setMessages(chat.message || [])

      // Add welcome message if no existing messages
      if (!chat.message || chat.message.length === 0) {
        const welcomeMessage: ChatMessage = {
          role: "model",
          parts: `Hello! I'm your AI medical assistant. I'm here to help you with medical questions and can connect you with emergency services if needed.

**How I can help:**
- Answer medical questions
- Provide first aid guidance
- Connect you with nearby hospitals
- Assist in emergency situations

**Important:** If this is a life-threatening emergency, please call 911 immediately.

How are you feeling today? Please describe any symptoms or concerns you have.`,
        }
        setMessages([welcomeMessage])
      }
    } catch (error) {
      console.error("Failed to initialize chat:", error)
    }
  }

  const detectEmergency = (message: string): boolean => {
    const lowerMessage = message.toLowerCase()
    return emergencyKeywords.some((keyword) => lowerMessage.includes(keyword))
  }

  const speakMessage = (text: string) => {
    if (!audioEnabled || !synthRef.current) return

    // Cancel any ongoing speech
    synthRef.current.cancel()

    // Clean text for speech (remove markdown and special characters)
    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold markdown
      .replace(/\*(.*?)\*/g, "$1") // Remove italic markdown
      .replace(/#{1,6}\s/g, "") // Remove headers
      .replace(/`(.*?)`/g, "$1") // Remove code blocks
      .replace(/\[.*?\]$$.*?$$/g, "") // Remove links
      .replace(/[-•]/g, "") // Remove bullet points
      .substring(0, 200) // Limit length for speech

    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.rate = 0.9
    utterance.pitch = 1
    utterance.volume = 0.8

    synthRef.current.speak(utterance)
  }

  const startListening = () => {
    if (!recognitionRef.current) return

    setIsListening(true)
    recognitionRef.current.start()
  }

  const stopListening = () => {
    if (!recognitionRef.current) return

    recognitionRef.current.stop()
    setIsListening(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading || !currentChat) return

    const userMessage = input.trim()
    setInput("")
    setIsLoading(true)

    // Add user message immediately
    const newUserMessage: ChatMessage = {
      role: "user",
      parts: userMessage,
    }
    setMessages((prev) => [...prev, newUserMessage])

    try {
      // Check for emergency keywords
      const isEmergency = detectEmergency(userMessage)
      if (isEmergency && !emergencyDetected) {
        setEmergencyDetected(true)
        // Trigger emergency flow after a short delay to show AI response first
        setTimeout(() => {
          onEmergencyDetected()
        }, 2000)
      }

      // Send message to API
      let updatedChat: Chat
      if (isAuthenticated && "id" in user) {
        updatedChat = await apiClient.updateUserChat(user.id, currentChat.id as number, userMessage)
      } else {
        updatedChat = await apiClient.updateAnonymousChat(user.username, userMessage)
      }

      // Update messages with AI response
      setMessages(updatedChat.message)
      setCurrentChat(updatedChat)

      // Speak the AI response if audio is enabled
      const aiResponse = updatedChat.message[updatedChat.message.length - 1]
      if (aiResponse && aiResponse.role === "model" && speechEnabled) {
        speakMessage(aiResponse.parts)
      }
    } catch (error) {
      console.error("Failed to send message:", error)

      // Add error message
      const errorMessage: ChatMessage = {
        role: "model",
        parts:
          "I apologize, but I'm having trouble processing your request right now. If this is an emergency, please call 911 immediately.",
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const formatMessage = (content: string) => {
    // Simple markdown-like formatting
    return content.split("\n").map((line, index) => {
      if (line.startsWith("**") && line.endsWith("**")) {
        return (
          <div key={index} className="font-bold text-lg mb-2">
            {line.slice(2, -2)}
          </div>
        )
      }
      if (line.startsWith("- ") || line.startsWith("• ")) {
        return (
          <div key={index} className="ml-4 mb-1">
            • {line.slice(2)}
          </div>
        )
      }
      if (line.startsWith("1. ") || line.startsWith("2. ") || line.startsWith("3. ")) {
        return (
          <div key={index} className="ml-4 mb-1">
            {line}
          </div>
        )
      }
      if (line.trim() === "") {
        return <div key={index} className="mb-2"></div>
      }
      return (
        <div key={index} className="mb-1">
          {line}
        </div>
      )
    })
  }

  return (
    <Card className={`flex flex-col h-full ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-blue-600" />
            <span>AI Medical Assistant</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={() => setAudioEnabled(!audioEnabled)} className="h-8 w-8">
              {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setSpeechEnabled(!speechEnabled)} className="h-8 w-8">
              {speechEnabled ? <Volume2 className="h-4 w-4 text-green-600" /> : <VolumeX className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        {emergencyDetected && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Emergency situation detected. Connecting you with medical services...
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-4 pb-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`flex max-w-[80%] ${
                    message.role === "user" ? "flex-row-reverse" : "flex-row"
                  } items-start space-x-2`}
                >
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === "user" ? "bg-blue-600 text-white ml-2" : "bg-gray-200 text-gray-600 mr-2"
                    }`}
                  >
                    {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div
                    className={`rounded-lg px-4 py-2 ${
                      message.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <div className="text-sm">
                      {message.role === "user" ? message.parts : <div>{formatMessage(message.parts)}</div>}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-gray-100 rounded-lg px-4 py-2">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-gray-600">Analyzing your symptoms...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <Separator />

        <div className="p-4">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <div className="flex-1 relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe your symptoms or ask a medical question..."
                disabled={isLoading}
                className="pr-12"
              />
              {recognitionRef.current && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                  onClick={isListening ? stopListening : startListening}
                  disabled={isLoading}
                >
                  {isListening ? <MicOff className="h-4 w-4 text-red-500" /> : <Mic className="h-4 w-4" />}
                </Button>
              )}
            </div>
            <Button type="submit" disabled={isLoading || !input.trim()}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>

          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">
              <Heart className="h-3 w-3 mr-1" />
              Emergency Detection
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Phone className="h-3 w-3 mr-1" />
              Hospital Connection
            </Badge>
            {recognitionRef.current && (
              <Badge variant="outline" className="text-xs">
                <Mic className="h-3 w-3 mr-1" />
                Voice Input
              </Badge>
            )}
            {synthRef.current && (
              <Badge variant="outline" className="text-xs">
                <Volume2 className="h-3 w-3 mr-1" />
                Text-to-Speech
              </Badge>
            )}
          </div>

          <div className="mt-2 text-xs text-gray-500 text-center">
            For life-threatening emergencies, call{" "}
            <a href="tel:911" className="text-red-600 font-semibold hover:underline">
              911
            </a>{" "}
            immediately
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

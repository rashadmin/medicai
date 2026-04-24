// Mock API Client for development purposes
// This simulates real API calls with realistic delays and responses

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: "user" | "hospital" | "admin" | "guest"
  medicalInfo?: {
    age: number
    gender: string
    bloodGroup: string
    genotype: string
    medicalHistory: string
    emergencyContact: string
  }
}

interface LoginData {
  email: string
  password: string
}

interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
}

interface GuestData {
  firstName: string
  lastName: string
  age: number
  gender: string
  bloodGroup: string
  genotype: string
  medicalHistory: string
  emergencyContact: string
  emergencyContactPhone: string
  simulationMode?: boolean
}

interface ChatMessage {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  metadata?: {
    emergencyDetected?: boolean
    severity?: string
    type?: string
    youtubeLinks?: string[]
    hospitalInfo?: any
  }
}

interface EmergencyData {
  type: string
  severity: string
  location: string
  description: string
}

class MockApiClient {
  private token: string | null = null
  private currentUser: User | null = null

  constructor() {
    // Initialize from localStorage if available
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("auth_token")
      const userData = localStorage.getItem("user_data")
      if (userData) {
        try {
          this.currentUser = JSON.parse(userData)
        } catch (error) {
          console.warn("Failed to parse stored user data:", error)
        }
      }
    }
  }

  // Simulate network delay
  private async delay(ms = 1000): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  // Generate mock response with realistic data
  private generateMockResponse(prompt: string): string {
    const lowerPrompt = prompt.toLowerCase()

    // Emergency keywords detection
    const emergencyKeywords = [
      "emergency",
      "urgent",
      "help",
      "pain",
      "bleeding",
      "accident",
      "injury",
      "chest pain",
      "difficulty breathing",
      "unconscious",
      "seizure",
      "stroke",
      "heart attack",
      "allergic reaction",
      "overdose",
      "poisoning",
      "burn",
      "fracture",
      "cut",
      "wound",
    ]

    const hasEmergency = emergencyKeywords.some((keyword) => lowerPrompt.includes(keyword))

    if (hasEmergency) {
      const emergencyResponses = [
        "I understand this is an emergency situation. I'm immediately connecting you with nearby medical facilities. Please stay calm and follow these initial steps while help is on the way.",
        "This sounds like a medical emergency. I'm locating the nearest hospitals and emergency services for you right now. Please remain where you are if it's safe to do so.",
        "I'm detecting an urgent medical situation. Emergency response is being coordinated. Please try to stay calm while I connect you with the appropriate medical facilities.",
        "This appears to be a serious medical emergency. I'm immediately searching for nearby hospitals and ambulance services. Help is on the way.",
      ]
      return emergencyResponses[Math.floor(Math.random() * emergencyResponses.length)]
    }

    // Medical advice responses
    if (lowerPrompt.includes("symptom") || lowerPrompt.includes("feel") || lowerPrompt.includes("sick")) {
      const medicalResponses = [
        "I understand you're experiencing symptoms. While I can provide general guidance, it's important to consult with a healthcare professional for proper diagnosis and treatment.",
        "Thank you for describing your symptoms. Based on what you've shared, I'd recommend monitoring your condition and considering a visit to a healthcare provider if symptoms persist or worsen.",
        "I hear your concerns about these symptoms. For your safety, I'd suggest speaking with a medical professional who can properly evaluate your condition.",
      ]
      return medicalResponses[Math.floor(Math.random() * medicalResponses.length)]
    }

    // General health responses
    const generalResponses = [
      "I'm here to help with your medical concerns. Please describe your symptoms or situation in detail so I can provide the most appropriate guidance.",
      "Thank you for reaching out. I'm designed to help with medical emergencies and health concerns. What specific symptoms or issues are you experiencing?",
      "I'm ready to assist you with your health-related questions. Please share more details about your current situation or symptoms.",
      "I understand you may have health concerns. Please describe what you're experiencing so I can provide appropriate guidance and connect you with medical resources if needed.",
    ]

    return generalResponses[Math.floor(Math.random() * generalResponses.length)]
  }

  // Authentication methods
  async getToken(): Promise<string | null> {
    return this.token
  }

  async setToken(token: string | null): Promise<void> {
    this.token = token
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("auth_token", token)
      } else {
        localStorage.removeItem("auth_token")
      }
    }
  }

  async isAuthenticated(): Promise<boolean> {
    return !!this.token
  }

  async getUser(): Promise<User | null> {
    if (!this.token) return null
    return this.currentUser
  }

  async login(data: LoginData): Promise<{ user: User; token: string }> {
    await this.delay(1500)

    // Mock authentication - accept any credentials for demo
    const mockUser: User = {
      id: "user_" + Math.random().toString(36).substr(2, 9),
      email: data.email,
      firstName: data.email.split("@")[0] || "User",
      lastName: "Demo",
      role: "user",
    }

    const token = "mock_token_" + Math.random().toString(36).substr(2, 16)

    this.currentUser = mockUser
    this.token = token

    // Store in localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token)
      localStorage.setItem("user_data", JSON.stringify(mockUser))
    }

    return { user: mockUser, token }
  }

  async register(data: RegisterData): Promise<{ user: User; token: string }> {
    await this.delay(2000)

    const mockUser: User = {
      id: "user_" + Math.random().toString(36).substr(2, 9),
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: "user",
    }

    const token = "mock_token_" + Math.random().toString(36).substr(2, 16)

    this.currentUser = mockUser
    this.token = token

    // Store in localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token)
      localStorage.setItem("user_data", JSON.stringify(mockUser))
    }

    return { user: mockUser, token }
  }

  async createAnonymousUser(data: GuestData): Promise<{ user: User; token: string }> {
    await this.delay(1000)

    const mockUser: User = {
      id: "guest_" + Math.random().toString(36).substr(2, 9),
      email: `guest_${Date.now()}@temp.com`,
      firstName: data.firstName,
      lastName: data.lastName,
      role: "guest",
      medicalInfo: {
        age: data.age,
        gender: data.gender,
        bloodGroup: data.bloodGroup,
        genotype: data.genotype,
        medicalHistory: data.medicalHistory,
        emergencyContact: `${data.emergencyContact} - ${data.emergencyContactPhone}`,
      },
    }

    const token = "guest_token_" + Math.random().toString(36).substr(2, 16)

    this.currentUser = mockUser
    this.token = token

    // Store in localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token)
      localStorage.setItem("user_data", JSON.stringify(mockUser))
      if (data.simulationMode) {
        localStorage.setItem("simulation_mode", "true")
      }
    }

    return { user: mockUser, token }
  }

  async updateUser(updates: Partial<User>): Promise<User> {
    await this.delay(1000)

    if (!this.currentUser) {
      throw new Error("No user logged in")
    }

    this.currentUser = { ...this.currentUser, ...updates }

    // Update localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("user_data", JSON.stringify(this.currentUser))
    }

    return this.currentUser
  }

  async logout(): Promise<void> {
    await this.delay(500)

    this.token = null
    this.currentUser = null

    // Clear localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
      localStorage.removeItem("user_data")
      localStorage.removeItem("simulation_mode")
    }
  }

  // Chat methods
  async sendMessage(message: string): Promise<ChatMessage> {
    await this.delay(2000)

    const response = this.generateMockResponse(message)
    const lowerMessage = message.toLowerCase()

    // Detect emergency keywords
    const emergencyKeywords = [
      "emergency",
      "urgent",
      "help",
      "pain",
      "bleeding",
      "accident",
      "injury",
      "chest pain",
      "difficulty breathing",
      "unconscious",
      "seizure",
      "stroke",
      "heart attack",
    ]

    const emergencyDetected = emergencyKeywords.some((keyword) => lowerMessage.includes(keyword))

    // Generate YouTube links for medical topics
    const youtubeLinks = emergencyDetected
      ? [
          "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // First Aid Basics
          "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Emergency Response
        ]
      : []

    return {
      id: "msg_" + Math.random().toString(36).substr(2, 9),
      content: response,
      role: "assistant",
      timestamp: new Date(),
      metadata: {
        emergencyDetected,
        severity: emergencyDetected ? (Math.random() > 0.5 ? "High" : "Medium") : undefined,
        type: emergencyDetected ? "Medical Emergency" : "General Inquiry",
        youtubeLinks: youtubeLinks.length > 0 ? youtubeLinks : undefined,
      },
    }
  }

  async getChatHistory(): Promise<ChatMessage[]> {
    await this.delay(1000)

    // Return mock chat history
    return [
      {
        id: "msg_1",
        content: "I'm experiencing chest pain and difficulty breathing",
        role: "user",
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      },
      {
        id: "msg_2",
        content:
          "I understand this is an emergency situation. I'm immediately connecting you with nearby medical facilities. Please stay calm and follow these initial steps while help is on the way.",
        role: "assistant",
        timestamp: new Date(Date.now() - 3590000),
        metadata: {
          emergencyDetected: true,
          severity: "High",
          type: "Cardiac Emergency",
          youtubeLinks: ["https://www.youtube.com/watch?v=dQw4w9WgXcQ"],
          hospitalInfo: {
            name: "City General Hospital",
            distance: "0.8 miles",
            eta: "4 minutes",
          },
        },
      },
    ]
  }

  // Hospital methods
  async getNearbyHospitals(lat: number, lng: number): Promise<any[]> {
    await this.delay(1500)

    // Return mock hospital data
    return [
      {
        id: "hospital_1",
        name: "City General Hospital",
        address: "123 Main St, Downtown",
        distance: 0.8,
        eta: 4,
        hasAmbulance: true,
        score: 95,
        phone: "(555) 123-4567",
        lat: lat + 0.01,
        lng: lng + 0.01,
        services: ["Emergency Medicine", "Cardiology", "Trauma"],
        availability: "24/7",
        type: "hospital",
      },
      {
        id: "hospital_2",
        name: "St. Mary's Medical Center",
        address: "456 Oak Ave, Midtown",
        distance: 1.2,
        eta: 6,
        hasAmbulance: true,
        score: 88,
        phone: "(555) 234-5678",
        lat: lat + 0.02,
        lng: lng - 0.01,
        services: ["Emergency Medicine", "Neurology", "Orthopedics"],
        availability: "24/7",
        type: "hospital",
      },
    ]
  }

  async contactHospital(
    hospitalId: string,
    emergencyData: EmergencyData,
  ): Promise<{ accepted: boolean; eta?: number }> {
    await this.delay(2000)

    // Simulate hospital response
    const accepted = Math.random() > 0.3 // 70% acceptance rate
    return {
      accepted,
      eta: accepted ? Math.floor(Math.random() * 10) + 5 : undefined, // 5-15 minutes
    }
  }
}

// Export singleton instance
export const apiClient = new MockApiClient()

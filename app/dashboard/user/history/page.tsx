"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Search,
  Calendar,
  MessageSquare,
  ExternalLink,
  Clock,
  User,
  Bot,
  Download,
  Trash2,
  Eye,
  Heart,
  AlertTriangle,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { apiClient, type Chat } from "@/lib/api-client"

export default function HistoryPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [chats, setChats] = useState<Chat[]>([])
  const [filteredChats, setFilteredChats] = useState<Chat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"date" | "length" | "title">("date")
  const [filterBy, setFilterBy] = useState<"all" | "emergency" | "consultation">("all")
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    if (user) {
      fetchChatHistory()
    }
  }, [user, currentPage])

  useEffect(() => {
    filterAndSortChats()
  }, [chats, searchTerm, sortBy, filterBy])

  const fetchChatHistory = async () => {
    if (!user) return

    try {
      setIsLoading(true)

      if (isAuthenticated && "id" in user) {
        const response = await apiClient.getUserChats(user.id, currentPage, 10)
        setChats(response.chats)
        setTotalPages(response._meta.total_pages)
      } else {
        // For anonymous users, we can only get the current chat
        const chat = await apiClient.getAnonymousChat(user.username)
        setChats([chat])
        setTotalPages(1)
      }
    } catch (error) {
      console.error("Failed to fetch chat history:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterAndSortChats = () => {
    let filtered = [...chats]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (chat) =>
          chat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          chat.message.some((msg) => msg.parts.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Apply category filter
    if (filterBy !== "all") {
      filtered = filtered.filter((chat) => {
        const hasEmergencyKeywords = chat.message.some(
          (msg) =>
            msg.parts.toLowerCase().includes("emergency") ||
            msg.parts.toLowerCase().includes("urgent") ||
            msg.parts.toLowerCase().includes("hospital") ||
            msg.parts.toLowerCase().includes("ambulance"),
        )
        return filterBy === "emergency" ? hasEmergencyKeywords : !hasEmergencyKeywords
      })
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.modified_at).getTime() - new Date(a.modified_at).getTime()
        case "length":
          return b.length - a.length
        case "title":
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })

    setFilteredChats(filtered)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getChatType = (chat: Chat) => {
    const hasEmergencyKeywords = chat.message.some(
      (msg) =>
        msg.parts.toLowerCase().includes("emergency") ||
        msg.parts.toLowerCase().includes("urgent") ||
        msg.parts.toLowerCase().includes("hospital") ||
        msg.parts.toLowerCase().includes("ambulance"),
    )
    return hasEmergencyKeywords ? "emergency" : "consultation"
  }

  const getChatTypeColor = (type: string) => {
    return type === "emergency" ? "bg-red-100 text-red-800 border-red-200" : "bg-blue-100 text-blue-800 border-blue-200"
  }

  const getChatTypeIcon = (type: string) => {
    return type === "emergency" ? <AlertTriangle className="h-3 w-3" /> : <MessageSquare className="h-3 w-3" />
  }

  const handleChatClick = (chat: Chat) => {
    setSelectedChat(chat)
  }

  const handleDeleteChat = async (chatId: number | string) => {
    // Mock delete functionality
    setChats((prev) => prev.filter((chat) => chat.id !== chatId))
  }

  const handleExportChat = (chat: Chat) => {
    const chatData = {
      title: chat.title,
      created_at: chat.created_at,
      modified_at: chat.modified_at,
      messages: chat.message,
      hospital_link: chat._links.hospital_link,
      youtube_link: chat._links.youtube_link,
    }

    const dataStr = JSON.stringify(chatData, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    const exportFileDefaultName = `medic-ai-chat-${chat.id}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-4">Please sign in to view your chat history.</p>
            <Button onClick={() => router.push("/auth/signin")}>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Chat History</h1>
              <p className="text-gray-600">View and manage your medical consultations</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="flex items-center space-x-1">
              <Heart className="h-3 w-3" />
              <span>{filteredChats.length} conversations</span>
            </Badge>
          </div>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Chats</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="consultation">Consultation</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Sort by Date</SelectItem>
                    <SelectItem value="length">Sort by Length</SelectItem>
                    <SelectItem value="title">Sort by Title</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>Conversations</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-4 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-sm text-gray-600 mt-2">Loading conversations...</p>
                  </div>
                ) : filteredChats.length === 0 ? (
                  <div className="p-4 text-center">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No conversations found</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredChats.map((chat) => {
                      const chatType = getChatType(chat)
                      return (
                        <div
                          key={chat.id}
                          className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                            selectedChat?.id === chat.id ? "bg-blue-50 border-r-2 border-blue-500" : ""
                          }`}
                          onClick={() => handleChatClick(chat)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-medium text-sm truncate flex-1">{chat.title}</h3>
                            <Badge className={`${getChatTypeColor(chatType)} text-xs ml-2`}>
                              {getChatTypeIcon(chatType)}
                              <span className="ml-1">{chatType}</span>
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{formatDate(chat.modified_at)}</span>
                            </div>
                            <span>{chat.message.length} messages</span>
                          </div>
                          {chat.message.length > 0 && (
                            <p className="text-xs text-gray-600 mt-1 truncate">
                              {chat.message[chat.message.length - 1].parts.substring(0, 60)}...
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-4 space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-3 text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>

          {/* Chat Detail */}
          <div className="lg:col-span-2">
            {selectedChat ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <MessageSquare className="h-5 w-5" />
                      <span>{selectedChat.title}</span>
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleExportChat(selectedChat)}>
                        <Download className="h-4 w-4 mr-1" />
                        Export
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteChat(selectedChat.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Created: {formatDate(selectedChat.created_at)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>Modified: {formatDate(selectedChat.modified_at)}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {selectedChat.message.map((message, index) => (
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
                            <div className="text-sm whitespace-pre-wrap">{message.parts}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  {/* Additional Resources */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Additional Resources</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedChat._links.hospital_link && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(selectedChat._links.hospital_link, "_blank")}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Hospital Information
                        </Button>
                      )}
                      {selectedChat._links.youtube_link && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(selectedChat._links.youtube_link, "_blank")}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Educational Video
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Conversation</h3>
                  <p className="text-gray-600">Choose a conversation from the list to view its details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

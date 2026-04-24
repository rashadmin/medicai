"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Wifi, WifiOff, Download } from "lucide-react"
import { useRouter } from "next/navigation"
import { OfflineCache } from "@/lib/offline-cache"

interface OfflineDetectorProps {
  hospitals?: any[]
  userLocation?: any
}

export function OfflineDetector({ hospitals, userLocation }: OfflineDetectorProps) {
  const [isOnline, setIsOnline] = useState(true)
  const [showOfflinePrompt, setShowOfflinePrompt] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const updateOnlineStatus = () => {
      const online = navigator.onLine
      setIsOnline(online)

      if (!online) {
        setShowOfflinePrompt(true)
      } else {
        setShowOfflinePrompt(false)
        // Cache data when coming back online
        if (hospitals && hospitals.length > 0) {
          OfflineCache.cacheHospitals(hospitals, userLocation)
        }
      }
    }

    // Initial check
    updateOnlineStatus()

    // Listen for online/offline events
    window.addEventListener("online", updateOnlineStatus)
    window.addEventListener("offline", updateOnlineStatus)

    return () => {
      window.removeEventListener("online", updateOnlineStatus)
      window.removeEventListener("offline", updateOnlineStatus)
    }
  }, [hospitals, userLocation])

  // Auto-cache hospitals when they're available
  useEffect(() => {
    if (isOnline && hospitals && hospitals.length > 0 && userLocation) {
      OfflineCache.cacheHospitals(hospitals, userLocation)
    }
  }, [hospitals, userLocation, isOnline])

  const goToOfflinePage = () => {
    router.push("/offline")
  }

  return (
    <>
      {/* Online/Offline Status Badge */}
      <Badge variant="outline" className={isOnline ? "text-green-600 border-green-600" : "text-red-600 border-red-600"}>
        {isOnline ? (
          <>
            <Wifi className="w-3 h-3 mr-1" />
            Online
          </>
        ) : (
          <>
            <WifiOff className="w-3 h-3 mr-1" />
            Offline
          </>
        )}
      </Badge>

      {/* Offline Prompt */}
      {showOfflinePrompt && (
        <Alert className="border-orange-200 bg-orange-50 mt-4">
          <WifiOff className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <div className="flex items-center justify-between">
              <div>
                <strong>You are offline.</strong> Emergency numbers and cached hospital data are still available.
              </div>
              <Button onClick={goToOfflinePage} size="sm" variant="outline" className="ml-4 bg-transparent">
                <Download className="h-4 w-4 mr-1" />
                Offline Mode
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </>
  )
}

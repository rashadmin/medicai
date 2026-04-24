"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings, Palette, Bell, Shield, Moon, Sun, Monitor } from "lucide-react"

interface SettingsModalProps {
  onClose: () => void
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const [theme, setTheme] = useState("system")
  const [accentColor, setAccentColor] = useState("blue")
  const [notifications, setNotifications] = useState({
    emergencyAlerts: true,
    systemUpdates: true,
    emailNotifications: false,
    smsNotifications: true,
  })
  const [privacy, setPrivacy] = useState({
    shareLocation: true,
    shareProfile: false,
    analyticsData: true,
  })

  const themes = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ]

  const accentColors = [
    { value: "blue", label: "Blue", color: "bg-blue-500" },
    { value: "red", label: "Red", color: "bg-red-500" },
    { value: "green", label: "Green", color: "bg-green-500" },
    { value: "purple", label: "Purple", color: "bg-purple-500" },
    { value: "orange", label: "Orange", color: "bg-orange-500" },
    { value: "pink", label: "Pink", color: "bg-pink-500" },
  ]

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: value }))
  }

  const handlePrivacyChange = (key: string, value: boolean) => {
    setPrivacy((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    // Save settings to localStorage or API
    localStorage.setItem(
      "medicai-settings",
      JSON.stringify({
        theme,
        accentColor,
        notifications,
        privacy,
      }),
    )
    onClose()
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-gray-500" />
            <span>Settings</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-base">
                <Palette className="h-4 w-4 text-purple-600" />
                <span>Appearance</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <div className="grid grid-cols-3 gap-2">
                  {themes.map((themeOption) => {
                    const IconComponent = themeOption.icon
                    return (
                      <Button
                        key={themeOption.value}
                        variant={theme === themeOption.value ? "default" : "outline"}
                        onClick={() => setTheme(themeOption.value)}
                        className="flex items-center space-x-2 h-12"
                      >
                        <IconComponent className="h-4 w-4" />
                        <span>{themeOption.label}</span>
                      </Button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Accent Color</Label>
                <div className="grid grid-cols-3 gap-2">
                  {accentColors.map((color) => (
                    <Button
                      key={color.value}
                      variant={accentColor === color.value ? "default" : "outline"}
                      onClick={() => setAccentColor(color.value)}
                      className="flex items-center space-x-2 h-12"
                    >
                      <div className={`w-4 h-4 rounded-full ${color.color}`} />
                      <span>{color.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-base">
                <Bell className="h-4 w-4 text-blue-600" />
                <span>Notifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Emergency Alerts</Label>
                  <p className="text-xs text-gray-500">Critical emergency notifications</p>
                </div>
                <Switch
                  checked={notifications.emergencyAlerts}
                  onCheckedChange={(checked) => handleNotificationChange("emergencyAlerts", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">System Updates</Label>
                  <p className="text-xs text-gray-500">App updates and maintenance notices</p>
                </div>
                <Switch
                  checked={notifications.systemUpdates}
                  onCheckedChange={(checked) => handleNotificationChange("systemUpdates", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Email Notifications</Label>
                  <p className="text-xs text-gray-500">Receive notifications via email</p>
                </div>
                <Switch
                  checked={notifications.emailNotifications}
                  onCheckedChange={(checked) => handleNotificationChange("emailNotifications", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">SMS Notifications</Label>
                  <p className="text-xs text-gray-500">Receive notifications via text message</p>
                </div>
                <Switch
                  checked={notifications.smsNotifications}
                  onCheckedChange={(checked) => handleNotificationChange("smsNotifications", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-base">
                <Shield className="h-4 w-4 text-green-600" />
                <span>Privacy & Security</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Share Location</Label>
                  <p className="text-xs text-gray-500">Allow location sharing for emergency services</p>
                </div>
                <Switch
                  checked={privacy.shareLocation}
                  onCheckedChange={(checked) => handlePrivacyChange("shareLocation", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Share Profile</Label>
                  <p className="text-xs text-gray-500">Share medical profile with emergency responders</p>
                </div>
                <Switch
                  checked={privacy.shareProfile}
                  onCheckedChange={(checked) => handlePrivacyChange("shareProfile", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Analytics Data</Label>
                  <p className="text-xs text-gray-500">Help improve the app with usage data</p>
                </div>
                <Switch
                  checked={privacy.analyticsData}
                  onCheckedChange={(checked) => handlePrivacyChange("analyticsData", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex space-x-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1">
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Phone, Plus, Edit, Trash2, User, Heart } from "lucide-react"

interface EmergencyContactsModalProps {
  onClose: () => void
}

interface EmergencyContact {
  id: string
  name: string
  relationship: string
  phone: string
  email?: string
  isPrimary: boolean
}

const relationships = [
  "Spouse/Partner",
  "Parent",
  "Child",
  "Sibling",
  "Friend",
  "Doctor",
  "Neighbor",
  "Colleague",
  "Other",
]

export function EmergencyContactsModal({ onClose }: EmergencyContactsModalProps) {
  const [contacts, setContacts] = useState<EmergencyContact[]>([
    {
      id: "1",
      name: "Sarah Johnson",
      relationship: "Spouse/Partner",
      phone: "+1-555-0123",
      email: "sarah.johnson@email.com",
      isPrimary: true,
    },
    {
      id: "2",
      name: "Dr. Michael Smith",
      relationship: "Doctor",
      phone: "+1-555-0456",
      email: "dr.smith@medical.com",
      isPrimary: false,
    },
  ])

  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    relationship: "",
    phone: "",
    email: "",
    isPrimary: false,
  })

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    if (!formData.name || !formData.phone || !formData.relationship) return

    if (editingId) {
      // Update existing contact
      setContacts((prev) => prev.map((contact) => (contact.id === editingId ? { ...contact, ...formData } : contact)))
    } else {
      // Add new contact
      const newContact: EmergencyContact = {
        id: Date.now().toString(),
        ...formData,
      }
      setContacts((prev) => [...prev, newContact])
    }

    // Reset form
    setFormData({ name: "", relationship: "", phone: "", email: "", isPrimary: false })
    setIsAdding(false)
    setEditingId(null)
  }

  const handleEdit = (contact: EmergencyContact) => {
    setFormData({
      name: contact.name,
      relationship: contact.relationship,
      phone: contact.phone,
      email: contact.email || "",
      isPrimary: contact.isPrimary,
    })
    setEditingId(contact.id)
    setIsAdding(true)
  }

  const handleDelete = (id: string) => {
    setContacts((prev) => prev.filter((contact) => contact.id !== id))
  }

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`
  }

  const handleCancel = () => {
    setFormData({ name: "", relationship: "", phone: "", email: "", isPrimary: false })
    setIsAdding(false)
    setEditingId(null)
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Phone className="h-5 w-5 text-green-500" />
            <span>Emergency Contacts</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* Add Contact Button */}
          {!isAdding && (
            <Button onClick={() => setIsAdding(true)} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Emergency Contact
            </Button>
          )}

          {/* Add/Edit Form */}
          {isAdding && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4 space-y-4">
                <h3 className="font-semibold text-blue-900">{editingId ? "Edit Contact" : "Add New Contact"}</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Enter full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="relationship">Relationship *</Label>
                    <Select
                      value={formData.relationship}
                      onValueChange={(value) => handleInputChange("relationship", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        {relationships.map((rel) => (
                          <SelectItem key={rel} value={rel}>
                            {rel}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email (Optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="Enter email address"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPrimary"
                    checked={formData.isPrimary}
                    onChange={(e) => handleInputChange("isPrimary", e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="isPrimary" className="text-sm">
                    Set as primary emergency contact
                  </Label>
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={handleSave}
                    disabled={!formData.name || !formData.phone || !formData.relationship}
                    className="flex-1"
                  >
                    {editingId ? "Update Contact" : "Add Contact"}
                  </Button>
                  <Button variant="outline" onClick={handleCancel} className="flex-1 bg-transparent">
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contacts List */}
          <div className="flex-1 overflow-y-auto space-y-3">
            {contacts.length === 0 ? (
              <div className="text-center py-8">
                <User className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="font-semibold text-gray-600 mb-2">No Emergency Contacts</h3>
                <p className="text-gray-500 text-sm">Add emergency contacts to call in case of emergency.</p>
              </div>
            ) : (
              contacts.map((contact) => (
                <Card key={contact.id} className={contact.isPrimary ? "border-green-200 bg-green-50" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                          {contact.isPrimary && (
                            <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">Primary</span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-1">{contact.relationship}</p>
                        <p className="text-gray-600 text-sm">{contact.phone}</p>
                        {contact.email && <p className="text-gray-500 text-xs">{contact.email}</p>}
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleCall(contact.phone)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Phone className="h-3 w-3 mr-1" />
                          Call
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleEdit(contact)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(contact.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Emergency Note */}
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <Heart className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-red-800 text-sm">Emergency Information</h4>
                <p className="text-red-700 text-xs mt-1">
                  These contacts will be notified in case of emergency. Make sure to keep this information up to date.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

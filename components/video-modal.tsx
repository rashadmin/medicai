"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Clock, ExternalLink } from "lucide-react"

interface Video {
  title: string
  id: string
  thumbnail: string
  duration: string
  description?: string
}

interface VideoModalProps {
  video: Video
  isOpen: boolean
  onClose: () => void
}

export function VideoModal({ video, isOpen, onClose }: VideoModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{video.title}</span>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {video.duration}
              </Badge>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
            <iframe
              src={`https://www.youtube.com/embed/${video.id}?autoplay=1`}
              title={video.title}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {video.description && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">{video.description}</p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              This video provides essential first aid guidance for emergency situations.
            </p>
            <Button variant="outline" size="sm" asChild>
              <a href={`https://youtube.com/watch?v=${video.id}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3 mr-2" />
                Open in YouTube
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default VideoModal

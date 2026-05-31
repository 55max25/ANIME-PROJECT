'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface StreamingServer {
  name?: string
  url?: string
}

interface DonghuaVideoPlayerClientProps {
  servers: StreamingServer[]
  title: string
  defaultUrl: string
}

export function DonghuaVideoPlayerClient({ servers, title, defaultUrl }: DonghuaVideoPlayerClientProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [currentUrl, setCurrentUrl] = useState(defaultUrl)

  const handleServerChange = (index: number, url: string) => {
    setSelectedIndex(index)
    setCurrentUrl(url)
  }

  return (
    <div className="space-y-4">
      {/* Video Container */}
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
        {currentUrl ? (
          <iframe
            src={currentUrl}
            className="h-full w-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            title={title}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-muted-foreground">Pilih server untuk memutar video</p>
          </div>
        )}
      </div>

      {/* Server Selection */}
      {servers.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Pilih Server</h3>
          <div className="flex flex-wrap gap-2">
            {servers.map((server, index) => (
              <button
                key={`server-${index}`}
                onClick={() => handleServerChange(index, server.url || '')}
                className={cn(
                  'rounded-lg px-4 py-2 text-sm font-medium transition-all',
                  selectedIndex === index
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                )}
              >
                {server.name || `Server ${index + 1}`}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

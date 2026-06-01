'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface ServerItem {
  name: string
  serverId: string
  quality?: string
  directUrl?: string
}

interface VideoPlayerProps {
  servers: ServerItem[]
  title: string
  defaultUrl?: string
  source?: string
}

export function VideoPlayer({ servers, title, defaultUrl, source }: VideoPlayerProps) {
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null)
  const [streamUrl, setStreamUrl] = useState<string | null>(defaultUrl || null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Auto-select first server or use defaultUrl on mount
  useEffect(() => {
    if (defaultUrl) {
      setStreamUrl(defaultUrl)
      return
    }
    // If no defaultUrl but we have servers with directUrl, auto-load first one
    if (!streamUrl && servers.length > 0) {
      const firstWithUrl = servers.find(s => s.directUrl)
      if (firstWithUrl) {
        setSelectedServerId(firstWithUrl.serverId)
        setStreamUrl(firstWithUrl.directUrl || null)
      } else if (servers[0]) {
        // No directUrl, must fetch from API
        handleServerSelect(servers[0])
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update when defaultUrl changes (e.g. navigation)
  useEffect(() => {
    if (defaultUrl) {
      setStreamUrl(defaultUrl)
      setError(null)
    }
  }, [defaultUrl])

  const handleServerSelect = async (server: ServerItem) => {
    setSelectedServerId(server.serverId)
    setError(null)

    // Jika sudah ada directUrl, langsung pakai tanpa fetch API
    if (server.directUrl) {
      setStreamUrl(server.directUrl)
      return
    }

    // Tidak ada directUrl → ambil dari /api/stream dengan source hint
    setIsLoading(true)
    try {
      const params = new URLSearchParams({ serverId: server.serverId })
      if (source) params.set('source', source)

      const response = await fetch(`/api/stream?${params.toString()}`)
      const data = await response.json()

      if (data.url) {
        setStreamUrl(data.url)
      } else {
        // Try next server automatically
        const currentIdx = servers.findIndex(s => s.serverId === server.serverId)
        const nextServer = servers[currentIdx + 1]
        if (nextServer) {
          setError(null)
          setIsLoading(false)
          handleServerSelect(nextServer)
          return
        }
        setError('Gagal memuat video. Coba server lain.')
      }
    } catch {
      setError('Gagal memuat video. Coba server lain.')
    } finally {
      setIsLoading(false)
    }
  }

  // Group servers by quality
  const serversByQuality: Record<string, ServerItem[]> = {}
  servers.forEach((server) => {
    const quality = server.quality || 'Auto'
    if (!serversByQuality[quality]) serversByQuality[quality] = []
    serversByQuality[quality].push(server)
  })
  const qualities = Object.keys(serversByQuality)

  return (
    <div className="space-y-4">
      {/* Video Container */}
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-4 text-center">
            <p className="text-muted-foreground">{error}</p>
            <p className="text-sm text-muted-foreground">Silakan pilih server lain di bawah</p>
          </div>
        ) : streamUrl ? (
          <iframe
            src={streamUrl}
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

      {/* Server Selection by Quality */}
      {qualities.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground">Pilih Server</h3>
          {qualities.map((quality) => (
            <div key={quality}>
              <p className="mb-2 text-xs font-medium text-muted-foreground/70">{quality}</p>
              <div className="flex flex-wrap gap-2">
                {serversByQuality[quality].map((server, index) => (
                  <button
                    key={`${server.serverId}-${index}`}
                    onClick={() => handleServerSelect(server)}
                    className={cn(
                      'rounded-lg px-4 py-2 text-sm font-medium transition-all',
                      selectedServerId === server.serverId
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    )}
                  >
                    {server.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

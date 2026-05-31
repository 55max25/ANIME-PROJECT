import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { VideoPlayer } from '@/components/video-player'
import { getEpisodeDetail } from '@/lib/api'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, List, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { notFound } from 'next/navigation'

export const revalidate = 3600

interface PageProps {
  params: Promise<{ slug: string }>
}

interface ServerItem {
  title?: string
  name?: string
  serverId?: string
  server_name?: string
  quality?: string
  url?: string
}

interface QualityGroup {
  title?: string
  quality?: string
  serverList?: ServerItem[]
  servers?: ServerItem[]
}

interface DownloadItem {
  title?: string
  quality?: string
  url?: string
  urls?: { title: string; url: string }[]
}

export default async function WatchAnimePage({ params }: PageProps) {
  const { slug } = await params
  
  let episodeData = null
  let apiSource = 'unknown'

  try {
    const response = await getEpisodeDetail(slug)
    episodeData = response?.data || response
    apiSource = response?.source || 'unknown'
  } catch (error) {
    console.error('[v0] Error fetching episode:', error)
  }

  if (!episodeData) {
    notFound()
  }

  // Parse servers dari berbagai format API
  const servers: { name: string; serverId: string; quality: string; directUrl?: string }[] = []
  
  // Format 1: Otakudesu style - { server: { qualities: [{title, serverList: [{title, serverId}]}] } }
  const rawQualities = episodeData.server?.qualities || episodeData.servers || episodeData.streamingUrls || []
  if (Array.isArray(rawQualities)) {
    rawQualities.forEach((quality: QualityGroup) => {
      const qualityTitle = quality.title || quality.quality || 'Auto'
      const serverList = quality.serverList || quality.servers || []
      
      serverList.forEach((server: ServerItem) => {
        if (server.serverId || server.url) {
          servers.push({
            name: server.title || server.name || server.server_name || 'Server',
            serverId: server.serverId || `direct-${servers.length}`,
            quality: qualityTitle,
            directUrl: server.url,
          })
        }
      })
    })
  }

  // Format 2: Samehadaku/Animasu style - { streaming: [{name, url}] }
  const streamingServers = episodeData.streaming || episodeData.stream || []
  if (Array.isArray(streamingServers)) {
    streamingServers.forEach((server: ServerItem, index: number) => {
      if (server.url) {
        servers.push({
          name: server.name || server.title || `Server ${index + 1}`,
          serverId: `stream-${index}`,
          quality: server.quality || 'Auto',
          directUrl: server.url,
        })
      }
    })
  }

  // Format 3: Direct embed URL
  if (servers.length === 0 && episodeData.defaultStreamingUrl) {
    servers.push({
      name: 'Default',
      serverId: 'default',
      quality: 'Auto',
      directUrl: episodeData.defaultStreamingUrl,
    })
  }

  // Format 4: iframe/embed URL langsung
  if (servers.length === 0 && (episodeData.iframe || episodeData.embed)) {
    servers.push({
      name: 'Default',
      serverId: 'default',
      quality: 'Auto',
      directUrl: episodeData.iframe || episodeData.embed,
    })
  }

  // Parse download links
  const downloads: { quality: string; links: { name: string; url: string }[] }[] = []
  const rawDownloads = episodeData.downloads || episodeData.download || episodeData.downloadUrl || []
  
  if (Array.isArray(rawDownloads)) {
    rawDownloads.forEach((dl: DownloadItem) => {
      const links: { name: string; url: string }[] = []
      
      if (dl.urls && Array.isArray(dl.urls)) {
        dl.urls.forEach((link: { title: string; url: string }) => {
          if (link.url) {
            links.push({ name: link.title || 'Download', url: link.url })
          }
        })
      } else if (dl.url) {
        links.push({ name: dl.title || 'Download', url: dl.url })
      }
      
      if (links.length > 0) {
        downloads.push({
          quality: dl.quality || dl.title || 'Unknown',
          links,
        })
      }
    })
  }

  // Parse navigation
  const prevEpisode = episodeData.prevEpisode || episodeData.prev || episodeData.navigation?.previous_episode
  const nextEpisode = episodeData.nextEpisode || episodeData.next || episodeData.navigation?.next_episode
  const animeId = episodeData.animeId || episodeData.anime_id || ''
  const episodeTitle = episodeData.title || episodeData.episode || 'Episode'

  // Get default URL for player
  const defaultUrl = episodeData.defaultStreamingUrl || 
                     episodeData.iframe || 
                     episodeData.embed ||
                     (servers[0]?.directUrl) || 
                     ''

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 -z-10">
        <Image
          src="/images/anime-hero-bg.png"
          alt="Background"
          fill
          className="object-cover opacity-10"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/90 to-background" />
      </div>

      <Header />

      <main className="container mx-auto px-4 py-6">
        {/* Breadcrumb & Source Badge */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <Link href="/anime" className="hover:text-primary">Anime</Link>
            {animeId && (
              <>
                <span>/</span>
                <Link href={`/anime/${animeId}`} className="hover:text-primary">
                  Detail
                </Link>
              </>
            )}
          </div>
          <Badge variant="outline" className="text-xs">
            Sumber: {apiSource}
          </Badge>
        </div>

        {/* Title */}
        <h1 className="mb-6 text-xl font-bold md:text-2xl">{episodeTitle}</h1>

        {/* Video Player */}
        <VideoPlayer 
          servers={servers} 
          title={episodeTitle} 
          defaultUrl={defaultUrl}
          source={apiSource}
        />

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between gap-4">
          {(prevEpisode?.episodeId || prevEpisode?.slug) ? (
            <Link href={`/watch/anime/${prevEpisode.episodeId || prevEpisode.slug}`}>
              <Button variant="outline" className="gap-2">
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Episode Sebelumnya</span>
                <span className="sm:hidden">Prev</span>
              </Button>
            </Link>
          ) : (
            <div />
          )}

          {animeId && (
            <Link href={`/anime/${animeId}`}>
              <Button variant="secondary" className="gap-2">
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">Daftar Episode</span>
                <span className="sm:hidden">List</span>
              </Button>
            </Link>
          )}

          {(nextEpisode?.episodeId || nextEpisode?.slug) ? (
            <Link href={`/watch/anime/${nextEpisode.episodeId || nextEpisode.slug}`}>
              <Button variant="outline" className="gap-2">
                <span className="hidden sm:inline">Episode Selanjutnya</span>
                <span className="sm:hidden">Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <div />
          )}
        </div>

        {/* Download Section */}
        {downloads.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-4 text-lg font-semibold">Download</h2>
            <div className="space-y-4">
              {downloads.map((dl, idx) => (
                <div key={idx} className="rounded-xl bg-card/50 p-4">
                  <p className="mb-2 text-sm font-medium text-muted-foreground">{dl.quality}</p>
                  <div className="flex flex-wrap gap-2">
                    {dl.links.map((link, linkIdx) => (
                      <a
                        key={linkIdx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg bg-secondary px-3 py-1.5 text-sm font-medium transition-colors hover:bg-secondary/80"
                      >
                        {link.name}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Release Info */}
        {episodeData.releaseTime && (
          <div className="mt-8 rounded-xl bg-card/50 p-6">
            <p className="text-sm text-muted-foreground">{episodeData.releaseTime}</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

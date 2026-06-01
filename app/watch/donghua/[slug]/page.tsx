import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { VideoPlayer } from '@/components/video-player'
import { getDonghuaEpisode } from '@/lib/api'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { notFound } from 'next/navigation'

export const revalidate = 0

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ source?: string }>
}

interface StreamingServer {
  name?: string
  url?: string
}

export default async function WatchDonghuaPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const { source } = await searchParams

  let episodeData = null

  try {
    const response = await getDonghuaEpisode(slug, source || undefined)
    // getDonghuaEpisode already flattens nested data
    episodeData = response
  } catch (error) {
    console.error('[v0] Error fetching donghua episode:', error)
  }

  if (!episodeData) {
    notFound()
  }

  // Parse servers - handle multiple response shapes
  const allServers: StreamingServer[] = []

  // Shape 1: { streaming: { main_url: {name, url}, servers: [{name, url}] } }
  const streamingObj = episodeData.streaming || {}
  if (typeof streamingObj === 'object' && !Array.isArray(streamingObj)) {
    const sObj = streamingObj as Record<string, unknown>
    const mainUrl = sObj.main_url as StreamingServer | undefined
    if (mainUrl?.url) allServers.push({ name: mainUrl.name || 'Main', url: mainUrl.url })
    const sArr = (sObj.servers || sObj.serverList || []) as StreamingServer[]
    sArr.forEach((s: StreamingServer) => { if (s.url) allServers.push(s) })
  }

  // Shape 2: streaming is an array
  if (Array.isArray(episodeData.streaming)) {
    (episodeData.streaming as StreamingServer[]).forEach((s: StreamingServer) => {
      if (s.url) allServers.push(s)
    })
  }

  // Shape 3: stream field
  if (Array.isArray(episodeData.stream)) {
    (episodeData.stream as StreamingServer[]).forEach((s: StreamingServer) => {
      if (s.url) allServers.push(s)
    })
  }

  // Shape 4: servers field at root
  if (Array.isArray(episodeData.servers)) {
    (episodeData.servers as StreamingServer[]).forEach((s: StreamingServer) => {
      if (s.url) allServers.push(s)
    })
  }

  // Shape 5: direct url fields
  if (allServers.length === 0) {
    const directUrl = episodeData.url || episodeData.embed || episodeData.iframe || episodeData.link
    if (directUrl) allServers.push({ name: 'Video', url: String(directUrl) })
  }

  // Deduplicate by URL
  const rawServers = allServers.filter((s, i, arr) => arr.findIndex(x => x.url === s.url) === i)
  const servers = rawServers.map((server: StreamingServer, index: number) => ({
    name: server.name || `Server ${index + 1}`,
    serverId: `donghua-${index}`,
    quality: 'Auto',
    directUrl: server.url,
  }))

  // Get default URL
  const defaultUrl = rawServers[0]?.url || ''

  // Parse navigation
  const navigation = episodeData.navigation || {}
  const prevEpisode = navigation.previous_episode
  const nextEpisode = navigation.next_episode
  const donghuaDetails = episodeData.donghua_details || {}
  const episodeTitle = episodeData.episode || episodeData.title || 'Episode'

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 -z-10">
        <Image
          src="/images/anime-bg.png"
          alt="Background"
          fill
          className="object-cover opacity-10"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/90 to-background" />
      </div>

      <Header />

      <main className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link href="/donghua" className="hover:text-primary">Donghua</Link>
          {donghuaDetails.slug && (
            <>
              <span>/</span>
              <Link href={`/donghua/${donghuaDetails.slug}`} className="hover:text-primary">
                {donghuaDetails.title || 'Detail'}
              </Link>
            </>
          )}
        </div>

        {/* Title */}
        <h1 className="mb-6 text-xl font-bold md:text-2xl">{episodeTitle}</h1>

        {/* Video Player - Donghua uses direct URLs */}
        <DonghuaVideoPlayer 
          servers={rawServers as StreamingServer[]} 
          title={episodeTitle}
          defaultUrl={defaultUrl}
        />

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between gap-4">
          {prevEpisode?.slug ? (
            <Link href={`/watch/donghua/${prevEpisode.slug}`}>
              <Button variant="outline" className="gap-2">
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Episode Sebelumnya</span>
                <span className="sm:hidden">Prev</span>
              </Button>
            </Link>
          ) : (
            <div />
          )}

          {donghuaDetails.slug && (
            <Link href={`/donghua/${donghuaDetails.slug}`}>
              <Button variant="secondary" className="gap-2">
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">Daftar Episode</span>
                <span className="sm:hidden">List</span>
              </Button>
            </Link>
          )}

          {nextEpisode?.slug ? (
            <Link href={`/watch/donghua/${nextEpisode.slug}`}>
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
      </main>

      <Footer />
    </div>
  )
}

// Special video player for donghua that uses direct URLs
function DonghuaVideoPlayer({ 
  servers, 
  title, 
  defaultUrl 
}: { 
  servers: StreamingServer[]
  title: string
  defaultUrl: string
}) {
  'use client'
  
  return (
    <DonghuaVideoPlayerClient servers={servers} title={title} defaultUrl={defaultUrl} />
  )
}

// Client component for donghua video player
import { DonghuaVideoPlayerClient } from '@/components/donghua-video-player'

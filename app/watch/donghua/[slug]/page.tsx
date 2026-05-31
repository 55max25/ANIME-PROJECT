import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { VideoPlayer } from '@/components/video-player'
import { getDonghuaEpisode } from '@/lib/api'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { notFound } from 'next/navigation'

export const revalidate = 3600

interface PageProps {
  params: Promise<{ slug: string }>
}

interface StreamingServer {
  name?: string
  url?: string
}

export default async function WatchDonghuaPage({ params }: PageProps) {
  const { slug } = await params
  
  let episodeData = null

  try {
    const response = await getDonghuaEpisode(slug)
    // Donghua episode API returns data directly
    episodeData = response?.data || response
  } catch (error) {
    console.error('[v0] Error fetching donghua episode:', error)
  }

  if (!episodeData) {
    notFound()
  }

  // Parse servers from donghua API
  // API returns: { streaming: { main_url: {name, url}, servers: [{name, url}] } }
  const streaming = episodeData.streaming || {}
  const rawServers = streaming.servers || []
  
  const servers = rawServers.map((server: StreamingServer, index: number) => ({
    name: server.name || `Server ${index + 1}`,
    serverId: `donghua-${index}`, // Use index as we have direct URLs
    quality: 'Auto',
    directUrl: server.url, // Store direct URL for donghua
  }))

  // Get default URL
  const defaultUrl = streaming.main_url?.url || (rawServers[0] as StreamingServer)?.url || ''

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

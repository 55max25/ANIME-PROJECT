import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { getDonghuaDetail } from '@/lib/api'
import Image from 'next/image'
import Link from 'next/link'
import { Play, Star, Calendar, Clock, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { notFound } from 'next/navigation'

export const revalidate = 3600

interface PageProps {
  params: Promise<{ slug: string }>
}

interface GenreItem {
  name?: string
  title?: string
  slug?: string
}

interface EpisodeItem {
  episode?: string
  title?: string
  slug?: string
  date?: string
}

export default async function DonghuaDetailPage({ params }: PageProps) {
  const { slug } = await params
  
  let donghuaData = null

  try {
    const response = await getDonghuaDetail(slug)
    // Donghua API returns data directly, not wrapped in data property
    donghuaData = response?.data || response
  } catch (error) {
    console.error('[v0] Error fetching donghua detail:', error)
  }

  if (!donghuaData || !donghuaData.title) {
    notFound()
  }

  // Handle different episode list structures
  const rawEpisodes = donghuaData.episodes_list || donghuaData.episodeList || donghuaData.episodes || []
  const episodes = rawEpisodes.map((ep: EpisodeItem, idx: number) => ({
    title: ep.episode || ep.title || `Episode ${idx + 1}`,
    slug: ep.slug || '',
    date: ep.date,
  }))

  // Handle genres
  const rawGenres = donghuaData.genres || []
  const genres = rawGenres.map((g: GenreItem | string) => 
    typeof g === 'string' ? g : (g.name || g.title || '')
  ).filter(Boolean)

  // Get studio info
  const studio = donghuaData.studio || ''

  // Get first and last episode for navigation
  const lastEpisode = episodes[0] // Latest episode
  const firstEpisode = episodes[episodes.length - 1] // First episode

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 -z-10">
        <Image
          src="/images/anime-bg.png"
          alt="Background"
          fill
          className="object-cover opacity-20"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
      </div>

      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Poster Section */}
          <div className="flex-shrink-0">
            <div className="relative mx-auto aspect-[2/3] w-64 overflow-hidden rounded-xl shadow-2xl lg:w-72">
              <Image
                src={donghuaData.poster || donghuaData.thumbnail || '/images/anime-bg.png'}
                alt={donghuaData.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Info Section */}
          <div className="flex-1">
            <h1 className="mb-4 text-2xl font-bold md:text-4xl">{donghuaData.title}</h1>
            
            {/* Meta Info */}
            <div className="mb-6 flex flex-wrap gap-4">
              {donghuaData.rating && (
                <div className="flex items-center gap-1 text-yellow-400">
                  <Star className="h-5 w-5" fill="currentColor" />
                  <span className="font-semibold">{donghuaData.rating}</span>
                </div>
              )}
              {donghuaData.status && (
                <Badge variant={donghuaData.status.toLowerCase().includes('ongoing') ? 'default' : 'secondary'}>
                  {donghuaData.status}
                </Badge>
              )}
              {donghuaData.type && (
                <Badge variant="outline">{donghuaData.type}</Badge>
              )}
              {donghuaData.duration && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{donghuaData.duration}</span>
                </div>
              )}
              {donghuaData.country && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Globe className="h-4 w-4" />
                  <span>{donghuaData.country}</span>
                </div>
              )}
              {(donghuaData.released || donghuaData.released_on) && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{donghuaData.released || donghuaData.released_on}</span>
                </div>
              )}
            </div>

            {/* Genres */}
            {genres.length > 0 && (
              <div className="mb-6">
                <h3 className="mb-2 text-sm font-semibold text-muted-foreground">Genre</h3>
                <div className="flex flex-wrap gap-2">
                  {genres.map((genre: string, index: number) => (
                    <Badge key={index} variant="outline">
                      {genre}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Studio */}
            {studio && (
              <div className="mb-6">
                <h3 className="mb-1 text-sm font-semibold text-muted-foreground">Studio</h3>
                <p>{studio}</p>
              </div>
            )}

            {/* Synopsis */}
            {donghuaData.synopsis && (
              <div className="mb-6">
                <h3 className="mb-2 text-sm font-semibold text-muted-foreground">Sinopsis</h3>
                <p className="leading-relaxed text-foreground/80">{donghuaData.synopsis}</p>
              </div>
            )}

            {/* Watch Buttons */}
            {episodes.length > 0 && (
              <div className="flex flex-wrap gap-3">
                <Link href={`/watch/donghua/${firstEpisode.slug}`}>
                  <Button size="lg" className="gap-2">
                    <Play className="h-5 w-5" fill="currentColor" />
                    Tonton Episode 1
                  </Button>
                </Link>
                {lastEpisode.slug !== firstEpisode.slug && (
                  <Link href={`/watch/donghua/${lastEpisode.slug}`}>
                    <Button size="lg" variant="outline" className="gap-2">
                      <Play className="h-5 w-5" />
                      Episode Terbaru
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Episodes List */}
        {episodes.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-6 text-xl font-bold md:text-2xl">
              Daftar Episode ({episodes.length} Episode)
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {episodes.map((episode: { title: string; slug: string; date?: string }, index: number) => (
                <Link
                  key={index}
                  href={`/watch/donghua/${episode.slug}`}
                  className="group flex items-center gap-3 rounded-lg bg-card/50 p-4 transition-all hover:bg-card hover:shadow-lg"
                >
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/20 transition-colors group-hover:bg-primary">
                    <Play className="h-5 w-5 text-primary transition-colors group-hover:text-primary-foreground" fill="currentColor" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{episode.title}</p>
                    {episode.date && (
                      <p className="text-xs text-muted-foreground">{episode.date}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}

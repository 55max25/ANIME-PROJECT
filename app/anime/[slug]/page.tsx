import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { getAnimeDetail } from '@/lib/api'
import Image from 'next/image'
import Link from 'next/link'
import { Play, Star, Calendar, Clock, Film, Tv } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { notFound } from 'next/navigation'

export const revalidate = 3600

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ source?: string }>
}

interface GenreItem {
  title?: string
  name?: string
  genreId?: string
}

interface EpisodeItem {
  title?: string
  episodeId?: string
  slug?: string
  eps?: number
  episode?: number | string
  date?: string
}

export default async function AnimeDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const { source } = await searchParams

  let animeData = null
  let apiSource = source || ''

  try {
    // Teruskan source hint agar API tahu endpoint mana yang dicoba duluan
    const response = await getAnimeDetail(slug, source || undefined)
    // response.data is the normalized detail object, fallback to root if not present
    apiSource = response?.source || apiSource
    animeData = response?.data || response
    // Ensure title is present (might be at root level of response)
    if (!animeData?.title && response?.title) {
      animeData = { ...animeData, title: response.title }
    }
  } catch (error) {
    console.error('[v0] Error fetching anime detail:', error)
  }

  if (!animeData || !animeData.title) {
    notFound()
  }

  // Handle different episode list structures
  const rawEpisodes = animeData.episodeList || animeData.episodes || []
  const episodes = rawEpisodes.map((ep: EpisodeItem) => ({
    title: ep.title || `Episode ${ep.eps || ep.episode || ''}`,
    slug: ep.episodeId || ep.slug || '',
    episode: ep.eps || ep.episode,
    date: ep.date,
  }))

  // Handle different genre structures
  const rawGenres = animeData.genreList || animeData.genres || []
  const genres = rawGenres.map((g: GenreItem | string) =>
    typeof g === 'string' ? g : (g.title || g.name || '')
  ).filter(Boolean)

  // Handle synopsis
  let synopsis = ''
  if (animeData.synopsis) {
    if (typeof animeData.synopsis === 'string') {
      synopsis = animeData.synopsis
    } else if (animeData.synopsis.paragraphs && Array.isArray(animeData.synopsis.paragraphs)) {
      synopsis = animeData.synopsis.paragraphs.join('\n\n')
    }
  }

  const studio = animeData.studios || animeData.studio || ''
  const rating = animeData.score || animeData.rating || ''

  // Episode navigation
  const lastEpisode = episodes[0]
  const firstEpisode = episodes[episodes.length - 1]

  // Teruskan source ke link episode agar watch page juga tahu sumbernya
  const watchLink = (epSlug: string) =>
    apiSource ? `/watch/anime/${epSlug}?source=${encodeURIComponent(apiSource)}` : `/watch/anime/${epSlug}`

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
                src={animeData.poster || animeData.thumbnail || '/images/anime-bg.png'}
                alt={animeData.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Info Section */}
          <div className="flex-1">
            <h1 className="mb-4 text-2xl font-bold md:text-4xl">{animeData.title}</h1>

            {/* Source badge */}
            {apiSource && (
              <Badge variant="outline" className="mb-4 text-xs">
                Sumber: {apiSource}
              </Badge>
            )}

            {/* Meta Info */}
            <div className="mb-6 flex flex-wrap gap-4">
              {rating && (
                <div className="flex items-center gap-1 text-yellow-400">
                  <Star className="h-5 w-5" fill="currentColor" />
                  <span className="font-semibold">{rating}</span>
                </div>
              )}
              {animeData.status && (
                <Badge variant={animeData.status.toLowerCase().includes('ongoing') ? 'default' : 'secondary'}>
                  {animeData.status}
                </Badge>
              )}
              {animeData.type && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  {animeData.type.toLowerCase().includes('movie') ? (
                    <Film className="h-4 w-4" />
                  ) : (
                    <Tv className="h-4 w-4" />
                  )}
                  <span>{animeData.type}</span>
                </div>
              )}
              {animeData.duration && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{animeData.duration}</span>
                </div>
              )}
              {animeData.aired && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{animeData.aired}</span>
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
            {synopsis && (
              <div className="mb-6">
                <h3 className="mb-2 text-sm font-semibold text-muted-foreground">Sinopsis</h3>
                <p className="whitespace-pre-line leading-relaxed text-foreground/80">{synopsis}</p>
              </div>
            )}

            {/* Watch Buttons */}
            {episodes.length > 0 && (
              <div className="flex flex-wrap gap-3">
                <Link href={watchLink(firstEpisode.slug)}>
                  <Button size="lg" className="gap-2">
                    <Play className="h-5 w-5" fill="currentColor" />
                    Tonton Episode 1
                  </Button>
                </Link>
                {lastEpisode.slug !== firstEpisode.slug && (
                  <Link href={watchLink(lastEpisode.slug)}>
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
              {episodes.map((episode: { title: string; slug: string; episode?: number | string; date?: string }, index: number) => (
                <Link
                  key={index}
                  href={watchLink(episode.slug)}
                  className="group flex items-center gap-3 rounded-lg bg-card/50 p-4 transition-all hover:bg-card hover:shadow-lg"
                >
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/20 transition-colors group-hover:bg-primary">
                    <Play className="h-5 w-5 text-primary transition-colors group-hover:text-primary-foreground" fill="currentColor" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{episode.title || `Episode ${episode.episode || index + 1}`}</p>
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

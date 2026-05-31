import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { AnimeGrid } from '@/components/anime-grid'
import { getOngoingAnime, getDonghuaOngoing, getDonghuaLatest, getCompleteAnime, getAnimeTotalCount, getDonghuaTotalCount } from '@/lib/api'
import Image from 'next/image'
import Link from 'next/link'
import { Play, TrendingUp, Sparkles, Tv, Film, Zap, Globe, Clock, ArrowRight, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const revalidate = 3600

export default async function HomePage() {
  let ongoingAnime = { data: [] }
  let donghuaOngoing = { data: [] }
  let donghuaLatest = { data: [] }
  let nextAnime = { data: [] }
  let animeTotalCount = 0
  let donghuaTotalCount = 0

  try {
    const [animeRes, donghuaOngoingRes, donghuaLatestRes, nextAnimeRes, animeTotalRes, donghuaTotalRes] = await Promise.allSettled([
      getOngoingAnime(1),
      getDonghuaOngoing(1),
      getDonghuaLatest(1),
      getCompleteAnime(1),
      Promise.all([getAnimeTotalCount('ongoing'), getAnimeTotalCount('complete')]).then(([o, c]) => o + c),
      Promise.all([getDonghuaTotalCount('ongoing'), getDonghuaTotalCount('completed')]).then(([o, c]) => o + c),
    ])
    
    if (animeRes.status === 'fulfilled') ongoingAnime = animeRes.value
    if (donghuaOngoingRes.status === 'fulfilled') donghuaOngoing = donghuaOngoingRes.value
    if (donghuaLatestRes.status === 'fulfilled') donghuaLatest = donghuaLatestRes.value
    if (nextAnimeRes.status === 'fulfilled') nextAnime = nextAnimeRes.value
    if (animeTotalRes.status === 'fulfilled') animeTotalCount = animeTotalRes.value
    if (donghuaTotalRes.status === 'fulfilled') donghuaTotalCount = donghuaTotalRes.value
  } catch (error) {
    console.error('[v0] Error fetching data:', error)
  }

  const animeItems = ongoingAnime?.data || []
  const donghuaOngoingItems = donghuaOngoing?.data || []
  const donghuaLatestItems = donghuaLatest?.data || []
  const nextAnimeItems = nextAnime?.data || []

  const featuredAnime = animeItems[0]
  const featuredAnime2 = animeItems[1]

  return (
    <div className="relative min-h-screen">
      {/* Full Anime Background */}
      <div className="fixed inset-0 -z-10">
        <Image
          src="/images/anime-hero-bg.png"
          alt="Anime Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent" />
      </div>

      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="grid items-center gap-8 md:grid-cols-2">
              <div className="relative z-10">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 py-2 text-sm font-medium text-primary backdrop-blur-sm">
                  <Sparkles className="h-4 w-4" />
                  <span>Streaming Anime & Donghua Gratis</span>
                </div>
                <h1 className="mb-6 text-4xl font-bold leading-tight md:text-6xl">
                  Selamat Datang di{' '}
                  <span className="gradient-text text-glow">YumeStream</span>
                </h1>
                <p className="mb-8 max-w-lg text-lg text-foreground/80">
                  Nikmati koleksi anime dan donghua terlengkap dengan subtitle Indonesia. Update setiap hari, streaming tanpa batas!
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link href="/anime">
                    <Button size="lg" className="group gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-8 shadow-lg shadow-primary/30 transition-all hover:shadow-xl hover:shadow-primary/40">
                      <Play className="h-5 w-5 transition-transform group-hover:scale-110" fill="currentColor" />
                      Jelajahi Anime
                    </Button>
                  </Link>
                  <Link href="/donghua">
                    <Button size="lg" variant="outline" className="gap-2 rounded-full border-border/50 bg-background/30 px-8 backdrop-blur-sm transition-all hover:border-primary hover:bg-primary/10">
                      <Film className="h-5 w-5" />
                      Jelajahi Donghua
                    </Button>
                  </Link>
                </div>

                {/* Stats */}
                <div className="mt-12 flex gap-8">
                  <div className="glass rounded-xl px-4 py-3">
                    <div className="text-3xl font-bold gradient-text">{animeTotalCount > 0 ? animeTotalCount : '1000'}+</div>
                    <div className="text-sm text-muted-foreground">Anime</div>
                  </div>
                  <div className="glass rounded-xl px-4 py-3">
                    <div className="text-3xl font-bold gradient-text">{donghuaTotalCount > 0 ? donghuaTotalCount : '500'}+</div>
                    <div className="text-sm text-muted-foreground">Donghua</div>
                  </div>
                  <div className="glass rounded-xl px-4 py-3">
                    <div className="text-3xl font-bold gradient-text">Daily</div>
                    <div className="text-sm text-muted-foreground">Update</div>
                  </div>
                </div>
              </div>

              {/* Featured Cards */}
              <div className="relative hidden md:block">
                <div className="absolute -left-4 top-1/2 h-80 w-56 -translate-y-1/2 -rotate-6 transform">
                  {featuredAnime2 && (
                    <div className="relative h-full w-full overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10">
                      <Image
                        src={featuredAnime2.poster}
                        alt={featuredAnime2.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                  )}
                </div>
                <div className="relative ml-auto h-96 w-64 rotate-3 transform">
                  {featuredAnime && (
                    <Link href={`/anime/${featuredAnime.slug}`} className="group block h-full">
                      <div className="relative h-full w-full overflow-hidden rounded-2xl shadow-2xl ring-2 ring-primary/50 transition-all group-hover:ring-primary">
                        <Image
                          src={featuredAnime.poster}
                          alt={featuredAnime.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <div className="mb-2 flex items-center gap-2">
                            <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">TRENDING</span>
                          </div>
                          <h3 className="text-lg font-bold text-white">{featuredAnime.title}</h3>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/90 shadow-lg">
                            <Play className="h-8 w-8 text-primary-foreground" fill="currentColor" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute left-0 top-1/4 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
        </section>

        {/* Content Sections */}
        <div className="container mx-auto px-4">
          {animeItems.length > 0 && (
            <AnimeGrid
              title="Anime Ongoing"
              items={animeItems.slice(0, 12)}
              type="anime"
              showAll="/anime"
              horizontal
              icon={<Tv className="h-4 w-4 text-primary-foreground" />}
            />
          )}

          {/* Next Anime Section - NEW */}
          {nextAnimeItems.length > 0 && (
            <section className="py-8">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-primary">
                    <ArrowRight className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <h2 className="text-xl font-bold md:text-2xl">Next Anime</h2>
                  <span className="rounded-full bg-accent/20 px-3 py-1 text-xs font-medium text-accent">Rekomendasi</span>
                </div>
                <Link
                  href="/anime?tab=completed"
                  className="rounded-full bg-secondary px-4 py-2 text-sm font-medium text-foreground transition-all hover:bg-primary hover:text-primary-foreground"
                >
                  Lihat Semua
                </Link>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {nextAnimeItems.slice(0, 4).map((item, index) => (
                  <Link 
                    key={`next-${item.slug}-${index}`} 
                    href={`/anime/${item.slug}`}
                    className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-card to-card/50 p-4 transition-all hover:shadow-lg hover:shadow-primary/20"
                  >
                    <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/10 blur-2xl transition-all group-hover:bg-primary/20" />
                    <div className="relative flex gap-4">
                      <div className="relative h-24 w-16 flex-shrink-0 overflow-hidden rounded-lg">
                        <Image
                          src={item.poster}
                          alt={item.title}
                          fill
                          className="object-cover transition-transform group-hover:scale-110"
                        />
                      </div>
                      <div className="flex flex-col justify-center">
                        <div className="mb-1 flex items-center gap-1.5">
                          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-medium text-foreground/70">{item.rating || 'N/A'}</span>
                        </div>
                        <h3 className="line-clamp-2 text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                          {item.title}
                        </h3>
                        <span className="mt-1 text-xs text-muted-foreground">
                          {item.episode || 'Completed'}
                        </span>
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 opacity-0 transition-opacity group-hover:opacity-100">
                      <Play className="h-4 w-4 text-primary" fill="currentColor" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {donghuaOngoingItems.length > 0 && (
            <AnimeGrid
              title="Donghua Ongoing"
              items={donghuaOngoingItems.slice(0, 12)}
              type="donghua"
              showAll="/donghua"
              horizontal
              icon={<Film className="h-4 w-4 text-primary-foreground" />}
            />
          )}

          {donghuaLatestItems.length > 0 && (
            <AnimeGrid
              title="Donghua Terbaru"
              items={donghuaLatestItems.slice(0, 12)}
              type="donghua"
              showAll="/donghua?tab=latest"
              horizontal
              icon={<Clock className="h-4 w-4 text-primary-foreground" />}
            />
          )}

          {/* Features Section */}
          <section className="py-16">
            <div className="mb-10 text-center">
              <h2 className="mb-4 text-3xl font-bold">Mengapa <span className="gradient-text">YumeStream</span>?</h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                Nikmati pengalaman streaming terbaik dengan fitur-fitur unggulan kami
              </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-3">
              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-card to-card/50 p-6 transition-all hover:shadow-lg hover:shadow-primary/10">
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/10 blur-2xl transition-all group-hover:bg-primary/20" />
                <div className="relative">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
                    <Zap className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold">Streaming Cepat</h3>
                  <p className="text-sm text-muted-foreground">
                    Server cepat dengan multiple quality options untuk streaming tanpa buffering.
                  </p>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-card to-card/50 p-6 transition-all hover:shadow-lg hover:shadow-primary/10">
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-accent/10 blur-2xl transition-all group-hover:bg-accent/20" />
                <div className="relative">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-primary">
                    <TrendingUp className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold">Update Terbaru</h3>
                  <p className="text-sm text-muted-foreground">
                    Selalu update dengan episode terbaru dari anime dan donghua ongoing.
                  </p>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-card to-card/50 p-6 transition-all hover:shadow-lg hover:shadow-primary/10">
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/10 blur-2xl transition-all group-hover:bg-primary/20" />
                <div className="relative">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
                    <Globe className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold">Subtitle Indonesia</h3>
                  <p className="text-sm text-muted-foreground">
                    Semua konten dilengkapi dengan subtitle bahasa Indonesia berkualitas.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { AnimeGridPaginated } from '@/components/anime-grid-paginated'
import { getOngoingAnime, getCompleteAnime, getAnimeTotalCount } from '@/lib/api'
import Image from 'next/image'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tv, Sparkles, Play, Clock } from 'lucide-react'

export const revalidate = 3600

export default async function AnimePage() {
  let ongoingAnime = { data: [] }
  let completedAnime = { data: [] }
  let ongoingTotal = 0
  let completedTotal = 0

  try {
    const [ongoingRes, completedRes, ongoingTotalRes, completedTotalRes] = await Promise.allSettled([
      getOngoingAnime(1),
      getCompleteAnime(1),
      getAnimeTotalCount('ongoing'),
      getAnimeTotalCount('complete'),
    ])
    
    if (ongoingRes.status === 'fulfilled') ongoingAnime = ongoingRes.value
    if (completedRes.status === 'fulfilled') completedAnime = completedRes.value
    if (ongoingTotalRes.status === 'fulfilled') ongoingTotal = ongoingTotalRes.value
    if (completedTotalRes.status === 'fulfilled') completedTotal = completedTotalRes.value
  } catch (error) {
    console.error('[v0] Error fetching anime:', error)
  }

  const ongoingItems = ongoingAnime?.data || []
  const completedItems = completedAnime?.data || []
  
  // Use API total if available, otherwise fallback to current page count
  const displayOngoingTotal = ongoingTotal > 0 ? ongoingTotal : ongoingItems.length
  const displayCompletedTotal = completedTotal > 0 ? completedTotal : completedItems.length

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
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/85 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/15 via-transparent to-transparent" />
      </div>

      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="relative mb-12 overflow-hidden rounded-3xl bg-gradient-to-br from-card/80 to-card/50 p-8 backdrop-blur-lg md:p-12">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-accent/15 blur-3xl" />
          
          <div className="relative flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 py-2 text-sm font-medium text-primary">
                <Tv className="h-4 w-4" />
                <span>Koleksi Anime Jepang</span>
              </div>
              <h1 className="mb-3 text-4xl font-bold md:text-5xl">
                <span className="gradient-text">Anime</span>
              </h1>
              <p className="max-w-xl text-foreground/70">
                Jelajahi koleksi anime Jepang terlengkap dengan subtitle Indonesia. Dari ongoing hingga completed, semua ada di sini!
              </p>
            </div>
            
            <div className="flex gap-4">
              <div className="glass rounded-xl px-5 py-3 text-center">
                <div className="text-2xl font-bold gradient-text">{displayOngoingTotal}+</div>
                <div className="text-xs text-muted-foreground">Ongoing</div>
              </div>
              <div className="glass rounded-xl px-5 py-3 text-center">
                <div className="text-2xl font-bold gradient-text">{displayCompletedTotal}+</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="ongoing" className="w-full">
          <TabsList className="mb-8 w-full justify-start gap-2 bg-transparent p-0">
            <TabsTrigger 
              value="ongoing" 
              className="group relative gap-2 rounded-full border border-border/50 bg-card/50 px-6 py-3 backdrop-blur-sm data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Play className="h-4 w-4" />
              Ongoing
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground group-data-[state=active]:bg-background group-data-[state=active]:text-primary">
                {displayOngoingTotal}
              </span>
            </TabsTrigger>
            <TabsTrigger 
              value="completed"
              className="group relative gap-2 rounded-full border border-border/50 bg-card/50 px-6 py-3 backdrop-blur-sm data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Sparkles className="h-4 w-4" />
              Completed
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground group-data-[state=active]:bg-background group-data-[state=active]:text-accent">
                {displayCompletedTotal}
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ongoing" className="mt-0">
            {ongoingItems.length > 0 ? (
              <AnimeGridPaginated
                title="Anime Sedang Tayang"
                initialItems={ongoingItems}
                type="anime"
                fetchEndpoint="ongoing"
                icon={<Clock className="h-4 w-4 text-primary-foreground" />}
              />
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl bg-card/50 py-20 text-center backdrop-blur-sm">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Tv className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium text-muted-foreground">
                  Tidak ada anime ongoing saat ini
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-0">
            {completedItems.length > 0 ? (
              <AnimeGridPaginated
                title="Anime Tamat"
                initialItems={completedItems}
                type="anime"
                fetchEndpoint="complete"
                icon={<Sparkles className="h-4 w-4 text-primary-foreground" />}
              />
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl bg-card/50 py-20 text-center backdrop-blur-sm">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Sparkles className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium text-muted-foreground">
                  Tidak ada anime completed
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  )
}

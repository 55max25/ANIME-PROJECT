import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { AnimeGrid } from '@/components/anime-grid'
import { searchAnime, searchDonghua } from '@/lib/api'
import Image from 'next/image'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const revalidate = 0

interface PageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q: query } = await searchParams

  if (!query) {
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
          <div className="py-20 text-center">
            <h1 className="mb-4 text-2xl font-bold">Cari Anime atau Donghua</h1>
            <p className="text-muted-foreground">
              Gunakan kolom pencarian di atas untuk mencari anime atau donghua favorit kamu
            </p>
          </div>
        </main>

        <Footer />
      </div>
    )
  }

  let animeResults = { data: [] }
  let donghuaResults = { data: [] }

  try {
    const [animeRes, donghuaRes] = await Promise.allSettled([
      searchAnime(query),
      searchDonghua(query),
    ])
    
    if (animeRes.status === 'fulfilled') animeResults = animeRes.value
    if (donghuaRes.status === 'fulfilled') donghuaResults = donghuaRes.value
  } catch (error) {
    console.error('[v0] Error searching:', error)
  }

  const animeItems = animeResults?.data || []
  const donghuaItems = donghuaResults?.data || []
  const totalResults = animeItems.length + donghuaItems.length

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
        <div className="mb-8">
          <h1 className="text-2xl font-bold md:text-3xl">
            Hasil Pencarian: &quot;{query}&quot;
          </h1>
          <p className="mt-2 text-muted-foreground">
            Ditemukan {totalResults} hasil
          </p>
        </div>

        {totalResults === 0 ? (
          <div className="py-20 text-center">
            <p className="text-lg text-muted-foreground">
              Tidak ada hasil untuk &quot;{query}&quot;
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Coba kata kunci yang berbeda
            </p>
          </div>
        ) : (
          <Tabs defaultValue={animeItems.length > 0 ? 'anime' : 'donghua'} className="w-full">
            <TabsList className="mb-6 w-full justify-start">
              <TabsTrigger value="anime" disabled={animeItems.length === 0}>
                Anime ({animeItems.length})
              </TabsTrigger>
              <TabsTrigger value="donghua" disabled={donghuaItems.length === 0}>
                Donghua ({donghuaItems.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="anime">
              {animeItems.length > 0 && (
                <AnimeGrid
                  title={`Anime - ${animeItems.length} hasil`}
                  items={animeItems}
                  type="anime"
                />
              )}
            </TabsContent>

            <TabsContent value="donghua">
              {donghuaItems.length > 0 && (
                <AnimeGrid
                  title={`Donghua - ${donghuaItems.length} hasil`}
                  items={donghuaItems}
                  type="donghua"
                />
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>

      <Footer />
    </div>
  )
}

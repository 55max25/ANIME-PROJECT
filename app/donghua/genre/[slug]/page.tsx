import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { AnimeGrid } from '@/components/anime-grid'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Film, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const revalidate = 3600

interface Props {
  params: Promise<{ slug: string }>
}

// Format genre name for display
function formatGenreName(slug: string) {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const genreName = formatGenreName(slug)
  return {
    title: `Donghua ${genreName} - YumeStream`,
    description: `Daftar donghua genre ${genreName} dengan subtitle Indonesia di YumeStream`,
  }
}

export default async function DonghuaGenrePage({ params }: Props) {
  const { slug } = await params
  const genreName = formatGenreName(slug)

  // Fetch donghua by genre
  let donghuaList: { title: string; slug: string; poster: string; episode?: string; rating?: string }[] = []
  
  try {
    const res = await fetch(`https://www.sankavollerei.com/anime/donghua/genres/${slug}`, {
      next: { revalidate: 3600 }
    })
    if (res.ok) {
      const json = await res.json()
      const list = json?.data || json?.donghuaList || []
      donghuaList = Array.isArray(list) ? list.map((item: Record<string, unknown>) => ({
        title: String(item.title || ''),
        slug: String(item.slug || '').replace(/\/$/, ''),
        poster: String(item.poster || item.thumbnail || ''),
        episode: item.episode ? String(item.episode) : item.episodes ? `Ep ${item.episodes}` : undefined,
        rating: item.rating ? String(item.rating) : undefined,
      })) : []
    }
  } catch (error) {
    console.error('[v0] Error fetching donghua by genre:', error)
  }

  return (
    <div className="relative min-h-screen">
      {/* Full Anime Background */}
      <div className="fixed inset-0 -z-10">
        <Image
          src="/images/anime-hero-bg.png"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/85 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent/15 via-transparent to-transparent" />
      </div>

      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/donghua">
          <Button variant="ghost" className="mb-6 gap-2 text-foreground/70 hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Donghua
          </Button>
        </Link>

        {/* Hero Section */}
        <div className="relative mb-12 overflow-hidden rounded-3xl bg-gradient-to-br from-card/80 to-card/50 p-8 backdrop-blur-lg md:p-12">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
          
          <div className="relative flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent/20 px-4 py-2 text-sm font-medium text-accent">
                <Filter className="h-4 w-4" />
                <span>Genre</span>
              </div>
              <h1 className="mb-3 text-3xl font-bold md:text-4xl">
                Donghua <span className="gradient-text">{genreName}</span>
              </h1>
              <p className="max-w-xl text-foreground/70">
                Koleksi donghua dengan genre {genreName} lengkap dengan subtitle Indonesia
              </p>
            </div>
            
            <div className="glass rounded-xl px-5 py-3 text-center">
              <div className="text-2xl font-bold gradient-text">{donghuaList.length}</div>
              <div className="text-xs text-muted-foreground">Donghua</div>
            </div>
          </div>
        </div>

        {/* Donghua List */}
        {donghuaList.length > 0 ? (
          <AnimeGrid
            title={`Donghua ${genreName}`}
            items={donghuaList}
            type="donghua"
            icon={<Film className="h-4 w-4 text-primary-foreground" />}
          />
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-card/50 py-20 text-center backdrop-blur-sm">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Film className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="mb-2 text-lg font-medium text-muted-foreground">
              Tidak ada donghua ditemukan
            </p>
            <p className="text-sm text-muted-foreground">
              Coba cari genre lain atau kembali ke halaman donghua
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

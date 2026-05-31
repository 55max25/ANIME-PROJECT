import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Home } from 'lucide-react'
import Image from 'next/image'

export default function NotFound() {
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

      <main className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-20 text-center">
        <h1 className="mb-4 text-6xl font-bold text-primary">404</h1>
        <h2 className="mb-4 text-2xl font-semibold">Halaman Tidak Ditemukan</h2>
        <p className="mb-8 max-w-md text-muted-foreground">
          Maaf, halaman yang kamu cari tidak ditemukan. Mungkin sudah dihapus atau URL salah.
        </p>
        <Link href="/">
          <Button size="lg" className="gap-2">
            <Home className="h-5 w-5" />
            Kembali ke Home
          </Button>
        </Link>
      </main>

      <Footer />
    </div>
  )
}

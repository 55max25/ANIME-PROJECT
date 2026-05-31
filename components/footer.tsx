import Link from 'next/link'
import { Sparkles, Github, Twitter, Heart } from 'lucide-react'

export function Footer() {
  return (
    <footer className="relative mt-16 border-t border-border/40">
      {/* Gradient line at top */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="group inline-flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary to-accent transition-transform duration-300 group-hover:scale-110">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                <span className="gradient-text">Yume</span>
                <span className="text-foreground">Stream</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Streaming anime dan donghua favorit kamu dengan subtitle Indonesia. Koleksi lengkap, update terbaru, gratis!
            </p>
            <div className="mt-4 flex items-center gap-3">
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground">
                <Github className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Navigasi</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                Home
              </Link>
              <Link href="/anime" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                Anime
              </Link>
              <Link href="/donghua" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                Donghua
              </Link>
              <Link href="/search" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                Pencarian
              </Link>
            </nav>
          </div>

          {/* Genre */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Genre Populer</h3>
            <nav className="flex flex-col gap-2">
              <span className="text-sm text-muted-foreground">Action</span>
              <span className="text-sm text-muted-foreground">Romance</span>
              <span className="text-sm text-muted-foreground">Fantasy</span>
              <span className="text-sm text-muted-foreground">Isekai</span>
            </nav>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/40 pt-8 md:flex-row">
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            Made with <Heart className="h-4 w-4 text-primary" fill="currentColor" /> by YumeStream Team
          </p>
          <p className="text-center text-xs text-muted-foreground">
            Disclaimer: YumeStream tidak menyimpan file video di server kami. Semua konten di-host oleh pihak ketiga.
          </p>
        </div>
      </div>
    </footer>
  )
}

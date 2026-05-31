'use client'

import Link from 'next/link'
import { Search, Menu, X, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { GenreDropdown } from './genre-dropdown'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="absolute inset-0 bg-background/70 backdrop-blur-xl" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      <div className="container relative mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary to-accent transition-transform duration-300 group-hover:scale-110">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            <span className="gradient-text">Yume</span>
            <span className="text-foreground">Stream</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link
            href="/"
            className="relative px-4 py-2 text-sm font-medium text-foreground/70 transition-colors hover:text-primary"
          >
            Home
            <span className="absolute inset-x-2 -bottom-px h-px scale-x-0 bg-gradient-to-r from-primary to-accent transition-transform duration-300 hover:scale-x-100" />
          </Link>
          
          <GenreDropdown type="anime" label="Anime" href="/anime" />
          <GenreDropdown type="donghua" label="Donghua" href="/donghua" />
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <form onSubmit={handleSearch} className="relative">
            <div className={`absolute -inset-0.5 rounded-xl bg-gradient-to-r from-primary to-accent opacity-0 blur transition-opacity duration-300 ${isSearchFocused ? 'opacity-50' : ''}`} />
            <div className="relative flex items-center">
              <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari anime atau donghua..."
                className="w-64 border-border/50 bg-secondary/50 pl-10 transition-all duration-300 focus:w-80 focus:bg-secondary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
            </div>
          </form>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="relative md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 opacity-0 transition-opacity hover:opacity-100" />
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {isMenuOpen && (
        <div className="absolute inset-x-0 top-16 border-b border-border/40 bg-background/95 p-4 backdrop-blur-xl md:hidden">
          <nav className="flex flex-col gap-1">
            <Link
              href="/"
              className="rounded-lg px-4 py-3 text-sm font-medium text-foreground/80 transition-colors hover:bg-primary/10 hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            
            <GenreDropdown 
              type="anime" 
              label="Anime" 
              href="/anime" 
              onClose={() => setIsMenuOpen(false)}
              isMobile 
            />
            <GenreDropdown 
              type="donghua" 
              label="Donghua" 
              href="/donghua" 
              onClose={() => setIsMenuOpen(false)}
              isMobile 
            />
            
            <form onSubmit={handleSearch} className="relative mt-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari anime atau donghua..."
                className="w-full border-border/50 bg-secondary/50 pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </nav>
        </div>
      )}
    </header>
  )
}

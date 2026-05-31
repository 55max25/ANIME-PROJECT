'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ChevronDown, Sparkles, Filter } from 'lucide-react'
import { getAnimeGenres, getDonghuaGenres } from '@/lib/api'

interface Genre {
  title: string
  slug: string
  genreId?: string
}

interface GenreDropdownProps {
  type: 'anime' | 'donghua'
  label: string
  href: string
  onClose?: () => void
  isMobile?: boolean
}

export function GenreDropdown({ type, label, href, onClose, isMobile = false }: GenreDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [genres, setGenres] = useState<Genre[]>([])
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchGenres = async () => {
    if (genres.length > 0) return
    
    setLoading(true)
    try {
      const data = type === 'anime' 
        ? await getAnimeGenres()
        : await getDonghuaGenres()
      
      const genreList = data?.genres || data?.data?.genres || data?.data || data || []
      setGenres(Array.isArray(genreList) ? genreList : [])
    } catch (error) {
      console.error('[v0] Error fetching genres:', error)
      setGenres([])
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = () => {
    if (!isOpen) {
      fetchGenres()
    }
    setIsOpen(!isOpen)
  }

  const handleLinkClick = () => {
    setIsOpen(false)
    onClose?.()
  }

  // Popular genres as fallback
  const popularGenres: Genre[] = type === 'anime' 
    ? [
        { title: 'Action', slug: 'action' },
        { title: 'Adventure', slug: 'adventure' },
        { title: 'Comedy', slug: 'comedy' },
        { title: 'Drama', slug: 'drama' },
        { title: 'Fantasy', slug: 'fantasy' },
        { title: 'Romance', slug: 'romance' },
        { title: 'Sci-Fi', slug: 'sci-fi' },
        { title: 'Slice of Life', slug: 'slice-of-life' },
        { title: 'Sports', slug: 'sports' },
        { title: 'Supernatural', slug: 'supernatural' },
        { title: 'Horror', slug: 'horror' },
        { title: 'Mystery', slug: 'mystery' },
      ]
    : [
        { title: 'Action', slug: 'action' },
        { title: 'Adventure', slug: 'adventure' },
        { title: 'Comedy', slug: 'comedy' },
        { title: 'Fantasy', slug: 'fantasy' },
        { title: 'Martial Arts', slug: 'martial-arts' },
        { title: 'Romance', slug: 'romance' },
        { title: 'Historical', slug: 'historical' },
        { title: 'Cultivation', slug: 'cultivation' },
        { title: 'Xianxia', slug: 'xianxia' },
        { title: 'Wuxia', slug: 'wuxia' },
        { title: 'Reincarnation', slug: 'reincarnation' },
        { title: 'School', slug: 'school' },
      ]

  const displayGenres = genres.length > 0 ? genres : popularGenres

  if (isMobile) {
    return (
      <div ref={dropdownRef} className="w-full">
        <button
          onClick={handleToggle}
          className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-sm font-medium text-foreground/80 transition-colors hover:bg-primary/10 hover:text-primary"
        >
          <span>{label}</span>
          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <div className="mt-1 space-y-1 pl-4">
            <Link
              href={href}
              onClick={handleLinkClick}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-foreground/70 transition-colors hover:bg-primary/10 hover:text-primary"
            >
              <Sparkles className="h-3 w-3" />
              Lihat Semua {label}
            </Link>
            
            <div className="py-2">
              <div className="flex items-center gap-2 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Filter className="h-3 w-3" />
                Genre
              </div>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-1">
                {displayGenres.slice(0, 12).map((genre) => (
                  <Link
                    key={genre.slug || genre.genreId}
                    href={`/${type}/genre/${genre.slug || genre.genreId}`}
                    onClick={handleLinkClick}
                    className="rounded-lg px-3 py-2 text-xs text-foreground/70 transition-colors hover:bg-primary/10 hover:text-primary"
                  >
                    {genre.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={handleToggle}
        className="group relative flex items-center gap-1 px-4 py-2 text-sm font-medium text-foreground/70 transition-colors hover:text-primary"
      >
        {label}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        <span className="absolute inset-x-2 -bottom-px h-px scale-x-0 bg-gradient-to-r from-primary to-accent transition-transform duration-300 group-hover:scale-x-100" />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-xl border border-border/50 bg-popover/95 p-2 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <div className="absolute -top-px left-8 h-px w-16 bg-gradient-to-r from-transparent via-primary to-transparent" />
          
          <Link
            href={href}
            onClick={handleLinkClick}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-primary/10 hover:text-primary"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <div>Lihat Semua {label}</div>
              <div className="text-xs text-muted-foreground">Jelajahi koleksi lengkap</div>
            </div>
          </Link>

          <div className="my-2 h-px bg-border/50" />

          <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Filter className="h-3 w-3" />
            Pilih Genre
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            <div className="grid max-h-64 grid-cols-2 gap-1 overflow-y-auto pr-1">
              {displayGenres.map((genre) => (
                <Link
                  key={genre.slug || genre.genreId}
                  href={`/${type}/genre/${genre.slug || genre.genreId}`}
                  onClick={handleLinkClick}
                  className="rounded-lg px-3 py-2 text-sm text-foreground/80 transition-all hover:bg-primary/10 hover:text-primary hover:translate-x-0.5"
                >
                  {genre.title}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

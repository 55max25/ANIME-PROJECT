'use client'

import { AnimeCard } from './anime-card'
import { ChevronLeft, ChevronRight, Sparkles, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useCallback } from 'react'
import Link from 'next/link'

interface AnimeItem {
  title: string
  slug: string
  poster: string
  episode?: string
  rating?: string
}

interface AnimeGridPaginatedProps {
  title: string
  initialItems: AnimeItem[]
  type?: 'anime' | 'donghua'
  showAll?: string
  icon?: React.ReactNode
  fetchEndpoint: 'ongoing' | 'complete' | 'donghua-ongoing' | 'donghua-completed' | 'donghua-latest'
}

export function AnimeGridPaginated({ 
  title, 
  initialItems, 
  type = 'anime', 
  showAll, 
  icon,
  fetchEndpoint 
}: AnimeGridPaginatedProps) {
  const [items, setItems] = useState<AnimeItem[]>(initialItems)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const fetchPage = useCallback(async (newPage: number) => {
    if (loading) return
    setLoading(true)
    
    try {
      const res = await fetch(`/api/anime-list?endpoint=${fetchEndpoint}&page=${newPage}`)
      const data = await res.json()
      
      if (data.data && data.data.length > 0) {
        setItems(data.data)
        setPage(newPage)
        setHasMore(data.data.length >= 12)
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error('Error fetching page:', error)
    } finally {
      setLoading(false)
    }
  }, [fetchEndpoint, loading])

  const handleNext = () => {
    if (hasMore && !loading) {
      fetchPage(page + 1)
    }
  }

  const handlePrev = () => {
    if (page > 1 && !loading) {
      fetchPage(page - 1)
    }
  }

  if (!items || items.length === 0) {
    return null
  }

  return (
    <section className="py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
            {icon || <Sparkles className="h-4 w-4 text-primary-foreground" />}
          </div>
          <h2 className="text-xl font-bold md:text-2xl">{title}</h2>
          <span className="rounded-full bg-primary/20 px-3 py-1 text-xs font-medium text-primary">
            Halaman {page}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className={`gap-1.5 rounded-full border-border/50 transition-all ${page <= 1 ? 'opacity-50' : 'hover:border-primary hover:bg-primary/10'}`}
            onClick={handlePrev}
            disabled={page <= 1 || loading}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Prev</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={`gap-1.5 rounded-full border-border/50 transition-all ${!hasMore ? 'opacity-50' : 'hover:border-primary hover:bg-primary/10'}`}
            onClick={handleNext}
            disabled={!hasMore || loading}
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          {showAll && (
            <Link
              href={showAll}
              className="ml-2 rounded-full bg-secondary px-4 py-2 text-sm font-medium text-foreground transition-all hover:bg-primary hover:text-primary-foreground"
            >
              Lihat Semua
            </Link>
          )}
        </div>
      </div>

      <div className="relative">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm">
            <div className="flex items-center gap-2 rounded-full bg-card px-4 py-2 shadow-lg">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm font-medium">Memuat...</span>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {items.map((item, index) => (
            <AnimeCard
              key={`${item.slug}-${page}-${index}`}
              title={item.title}
              slug={item.slug}
              poster={item.poster}
              episode={item.episode}
              rating={item.rating}
              type={type}
            />
          ))}
        </div>
      </div>

      {/* Mobile Pagination */}
      <div className="mt-6 flex items-center justify-center gap-4 sm:hidden">
        <Button
          variant="outline"
          size="lg"
          className={`flex-1 gap-2 rounded-full ${page <= 1 ? 'opacity-50' : ''}`}
          onClick={handlePrev}
          disabled={page <= 1 || loading}
        >
          <ChevronLeft className="h-5 w-5" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="lg"
          className={`flex-1 gap-2 rounded-full ${!hasMore ? 'opacity-50' : ''}`}
          onClick={handleNext}
          disabled={!hasMore || loading}
        >
          Next
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </section>
  )
}

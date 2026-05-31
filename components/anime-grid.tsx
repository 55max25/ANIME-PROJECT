'use client'

import { AnimeCard } from './anime-card'
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'

interface AnimeItem {
  title: string
  slug: string
  poster: string
  episode?: string
  rating?: string
  source?: string
}

interface AnimeGridProps {
  title: string
  items: AnimeItem[]
  type?: 'anime' | 'donghua'
  showAll?: string
  horizontal?: boolean
  icon?: React.ReactNode
}

export function AnimeGrid({ title, items, type = 'anime', showAll, horizontal, icon }: AnimeGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    checkScroll()
    const ref = scrollRef.current
    if (ref) {
      ref.addEventListener('scroll', checkScroll)
      return () => ref.removeEventListener('scroll', checkScroll)
    }
  }, [items])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
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
        </div>
        <div className="flex items-center gap-2">
          {horizontal && (
            <>
              <Button
                variant="outline"
                size="icon"
                className={`h-9 w-9 rounded-full border-border/50 transition-all ${!canScrollLeft ? 'opacity-50' : 'hover:border-primary hover:bg-primary/10'}`}
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className={`h-9 w-9 rounded-full border-border/50 transition-all ${!canScrollRight ? 'opacity-50' : 'hover:border-primary hover:bg-primary/10'}`}
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
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

      {horizontal ? (
        <div className="relative">
          {canScrollLeft && (
            <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-background to-transparent" />
          )}
          
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
          >
            {items.map((item, index) => (
              <div key={`${item.slug}-${index}`} className="w-40 flex-shrink-0 md:w-48">
                <AnimeCard
                  title={item.title}
                  slug={item.slug}
                  poster={item.poster}
                  episode={item.episode}
                  rating={item.rating}
                  source={item.source}
                  type={type}
                />
              </div>
            ))}
          </div>

          {canScrollRight && (
            <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-background to-transparent" />
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {items.map((item, index) => (
            <AnimeCard
              key={`${item.slug}-${index}`}
              title={item.title}
              slug={item.slug}
              poster={item.poster}
              episode={item.episode}
              rating={item.rating}
              source={item.source}
              type={type}
            />
          ))}
        </div>
      )}
    </section>
  )
}

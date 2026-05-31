import Image from 'next/image'
import Link from 'next/link'
import { Play, Star, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AnimeCardProps {
  title: string
  slug: string
  poster: string
  episode?: string
  rating?: string
  type?: 'anime' | 'donghua'
  className?: string
}

export function AnimeCard({
  title,
  slug,
  poster,
  episode,
  rating,
  type = 'anime',
  className,
}: AnimeCardProps) {
  const href = type === 'anime' ? `/anime/${slug}` : `/donghua/${slug}`

  return (
    <Link href={href} className={cn('group anime-card block', className)}>
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-secondary">
        <Image
          src={poster}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        />
        
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-transparent to-accent/0 opacity-0 transition-opacity duration-300 group-hover:opacity-40" />
        
        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-14 w-14 scale-0 items-center justify-center rounded-full bg-primary/90 shadow-lg shadow-primary/30 transition-all duration-300 group-hover:scale-100">
            <Play className="h-6 w-6 translate-x-0.5 text-primary-foreground" fill="currentColor" />
          </div>
        </div>

        {/* Episode badge */}
        {episode && (
          <div className="absolute right-2 top-2 flex items-center gap-1 rounded-lg bg-gradient-to-r from-primary to-primary/80 px-2.5 py-1 text-xs font-bold text-primary-foreground shadow-lg">
            <Clock className="h-3 w-3" />
            {episode}
          </div>
        )}

        {/* Rating badge */}
        {rating && (
          <div className="absolute left-2 top-2 flex items-center gap-1 rounded-lg bg-black/70 px-2 py-1 text-xs font-semibold backdrop-blur-sm">
            <Star className="h-3 w-3 text-yellow-400" fill="currentColor" />
            <span className="text-yellow-400">{rating}</span>
          </div>
        )}

        {/* Title */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
          <h3 className="relative line-clamp-2 text-sm font-bold text-white">
            {title}
          </h3>
        </div>

        {/* Hover border glow */}
        <div className="absolute inset-0 rounded-xl opacity-0 ring-2 ring-primary/50 transition-opacity duration-300 group-hover:opacity-100" />
      </div>
    </Link>
  )
}

import { NextRequest, NextResponse } from 'next/server'

const BASE_URL = 'https://www.sankavollerei.com/anime'

// Endpoint stream per source
const SOURCE_ENDPOINTS: Record<string, (serverId: string) => string> = {
  otakudesu:    (id) => `${BASE_URL}/server/${id}`,
  samehadaku:   (id) => `${BASE_URL}/samehadaku/server/${id}`,
  animasu:      (id) => `${BASE_URL}/animasu/server/${id}`,
  oploverz:     (id) => `${BASE_URL}/oploverz/server/${id}`,
  alqanime:     (id) => `${BASE_URL}/alqanime/server/${id}`,
  winbu:        (id) => `${BASE_URL}/winbu/server?${id}`,
  kuramanime:   (id) => `${BASE_URL}/kura/server/${id}`,
  animesail:    (id) => `${BASE_URL}/animesail/server/${id}`,
  stream:       (id) => `${BASE_URL}/stream/server/${id}`,
  animekuindo:  (id) => `${BASE_URL}/animekuindo/server/${id}`,
  nimegami:     (id) => `${BASE_URL}/nimegami/server/${id}`,
  anoboy:       (id) => `${BASE_URL}/anoboy/server/${id}`,
  kusonime:     (id) => `${BASE_URL}/kusonime/server/${id}`,
}

async function tryFetchStreamUrl(url: string): Promise<string | null> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000)
    const response = await fetch(url, {
      next: { revalidate: 3600 },
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    if (!response.ok) return null
    const data = await response.json()
    return data?.data?.url || data?.url || data?.data?.embed || data?.embed || null
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  const serverId = request.nextUrl.searchParams.get('serverId')
  const source   = request.nextUrl.searchParams.get('source') || ''

  if (!serverId) {
    return NextResponse.json({ error: 'Server ID is required' }, { status: 400 })
  }

  try {
    // 1. Coba source yang diberikan dulu
    if (source && SOURCE_ENDPOINTS[source]) {
      const url = await tryFetchStreamUrl(SOURCE_ENDPOINTS[source](serverId))
      if (url) return NextResponse.json({ url, source })
    }

    // 2. Fallback: coba semua source secara berurutan
    for (const [src, buildUrl] of Object.entries(SOURCE_ENDPOINTS)) {
      if (src === source) continue // sudah dicoba
      const url = await tryFetchStreamUrl(buildUrl(serverId))
      if (url) return NextResponse.json({ url, source: src })
    }

    return NextResponse.json({ error: 'Stream URL not found' }, { status: 404 })
  } catch (error) {
    console.error('[stream] Error fetching stream:', error)
    return NextResponse.json({ error: 'Failed to fetch stream' }, { status: 500 })
  }
}

const BASE_URL = 'https://www.sankavollerei.com/anime'

// Helper to normalize anime data from different API responses
function normalizeAnimeList(data: Record<string, unknown>, source: string): AnimeItem[] {
  const list = data?.animeList || data?.data?.animeList || data?.data || data?.anime ||
               data?.animes || data?.popular || data?.latest || data?.ongoing ||
               data?.completed || data?.list || data?.results || []

  if (!Array.isArray(list)) return []

  return list.map((item: Record<string, unknown>) => ({
    title: String(item.title || item.name || ''),
    slug: String(item.animeId || item.slug || item.id || ''),
    poster: String(item.poster || item.thumbnail || item.image || item.cover || ''),
    episode: item.episodes ? `Ep ${item.episodes}` : item.episode ? String(item.episode) :
             item.latestEpisode ? `Ep ${item.latestEpisode}` : undefined,
    rating: item.rating ? String(item.rating) : item.score ? String(item.score) : undefined,
    status: item.status ? String(item.status) : undefined,
    source: source,
  }))
}

// Helper to normalize donghua data
function normalizeDonghuaList(data: Record<string, unknown>, source: string): DonghuaItem[] {
  const list = data?.ongoing_donghua || data?.completed_donghua || data?.latest_donghua ||
               data?.data || data?.donghuaList || data?.donghua || data?.list ||
               data?.popular || data?.latest || data?.results || []

  if (!Array.isArray(list)) return []

  return list.map((item: Record<string, unknown>) => ({
    title: String(item.title || item.name || ''),
    slug: String(item.slug || item.id || '').replace(/\/$/, ''),
    poster: String(item.poster || item.thumbnail || item.image || item.cover || ''),
    episode: item.episode ? String(item.episode) : item.episodes ? `Ep ${item.episodes}` :
             item.latestEpisode ? `Ep ${item.latestEpisode}` : undefined,
    rating: item.rating ? String(item.rating) : item.score ? String(item.score) : undefined,
    status: item.status ? String(item.status) : undefined,
    source: source,
  }))
}

// -------------------------------------------------------
// Keyword filter: judul yang mengandung kata khas donghua
// akan di-exclude dari list anime, dan sebaliknya
// -------------------------------------------------------
const DONGHUA_KEYWORDS = [
  'donghua', 'manhua', 'chinese', 'china', 'tiongkok',
  'cultivation', 'immortal', 'xianxia', 'wuxia', 'dao',
  'martial universe', 'battle through', 'soul land',
  'swallowed star', 'great ruler', 'against the gods',
  'perfect world', 'spirit realm', 'tales of demons',
]

function isDonghuaTitle(title: string): boolean {
  const lower = title.toLowerCase()
  return DONGHUA_KEYWORDS.some(kw => lower.includes(kw))
}

function isAnimeTitle(title: string): boolean {
  return !isDonghuaTitle(title)
}

// Safe fetch with timeout and error handling
async function safeFetch(url: string, revalidate = 3600): Promise<Record<string, unknown> | null> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000)

    const res = await fetch(url, {
      next: { revalidate },
      signal: controller.signal
    })
    clearTimeout(timeoutId)

    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

// ===========================================
// ANIME SOURCES - ONGOING
// ===========================================

async function getOtakudesuOngoing(page = 1) {
  const json = await safeFetch(`${BASE_URL}/ongoing-anime?page=${page}`)
  return json ? normalizeAnimeList(json.data || json, 'otakudesu') : []
}

async function getSamehadakuOngoing(page = 1) {
  const json = await safeFetch(`${BASE_URL}/samehadaku/ongoing?page=${page}`)
  return json ? normalizeAnimeList(json.data || json, 'samehadaku') : []
}

async function getAnimasuOngoing(page = 1) {
  const json = await safeFetch(`${BASE_URL}/animasu/ongoing?page=${page}`)
  return json ? normalizeAnimeList(json.data || json, 'animasu') : []
}

async function getOploverzOngoing(page = 1) {
  const json = await safeFetch(`${BASE_URL}/oploverz/ongoing?page=${page}`)
  return json ? normalizeAnimeList(json.data || json, 'oploverz') : []
}

async function getAlqanimeOngoing(page = 1) {
  const json = await safeFetch(`${BASE_URL}/alqanime/ongoing?page=${page}`)
  return json ? normalizeAnimeList(json.data || json, 'alqanime') : []
}

async function getWinbuOngoing(page = 1) {
  const json = await safeFetch(`${BASE_URL}/winbu/ongoing?page=${page}`)
  return json ? normalizeAnimeList(json.data || json, 'winbu') : []
}

async function getKuramanimeOngoing(page = 1) {
  const json = await safeFetch(`${BASE_URL}/kura/quick/ongoing?page=${page}`)
  // Kuramanime bisa campuran; filter judul yang bukan donghua
  return json
    ? normalizeAnimeList(json.data || json, 'kuramanime').filter(a => isAnimeTitle(a.title))
    : []
}

// AnimeSail terbaru bisa mix — filter hanya judul yang bukan donghua
async function getAnimeSailOngoing(page = 1) {
  const json = await safeFetch(`${BASE_URL}/animesail/terbaru?page=${page}`)
  return json
    ? normalizeAnimeList(json.data || json, 'animesail').filter(a => isAnimeTitle(a.title))
    : []
}

async function getStreamLatest(page = 1) {
  const json = await safeFetch(`${BASE_URL}/stream/latest/${page}`)
  return json ? normalizeAnimeList(json.data || json, 'stream') : []
}

async function getAnimekuindoLatest(page = 1) {
  const json = await safeFetch(`${BASE_URL}/animekuindo/latest?page=${page}`)
  return json ? normalizeAnimeList(json.data || json, 'animekuindo') : []
}

async function getNimegamiLatest(page = 1) {
  const json = await safeFetch(`${BASE_URL}/nimegami/home?page=${page}`)
  return json ? normalizeAnimeList(json.data || json, 'nimegami') : []
}

async function getAnoboyHome(page = 1) {
  const json = await safeFetch(`${BASE_URL}/anoboy/home?page=${page}`)
  return json ? normalizeAnimeList(json.data || json, 'anoboy') : []
}

async function getKusonimeLatest(page = 1) {
  const json = await safeFetch(`${BASE_URL}/kusonime/latest?page=${page}`)
  return json ? normalizeAnimeList(json.data || json, 'kusonime') : []
}

// ===========================================
// ANIME SOURCES - COMPLETED
// ===========================================

async function getOtakudesuCompleted(page = 1) {
  const json = await safeFetch(`${BASE_URL}/complete-anime?page=${page}`)
  return json ? normalizeAnimeList(json.data || json, 'otakudesu') : []
}

async function getSamehadakuCompleted(page = 1) {
  const json = await safeFetch(`${BASE_URL}/samehadaku/completed?page=${page}`)
  return json ? normalizeAnimeList(json.data || json, 'samehadaku') : []
}

async function getAnimasuCompleted(page = 1) {
  const json = await safeFetch(`${BASE_URL}/animasu/completed?page=${page}`)
  return json ? normalizeAnimeList(json.data || json, 'animasu') : []
}

async function getOploverzCompleted(page = 1) {
  const json = await safeFetch(`${BASE_URL}/oploverz/completed?page=${page}`)
  return json ? normalizeAnimeList(json.data || json, 'oploverz') : []
}

async function getAlqanimeCompleted(page = 1) {
  const json = await safeFetch(`${BASE_URL}/alqanime/completed?page=${page}`)
  return json ? normalizeAnimeList(json.data || json, 'alqanime') : []
}

async function getWinbuCompleted(page = 1) {
  const json = await safeFetch(`${BASE_URL}/winbu/completed?page=${page}`)
  return json ? normalizeAnimeList(json.data || json, 'winbu') : []
}

async function getKuramanimeFinished(page = 1) {
  const json = await safeFetch(`${BASE_URL}/kura/quick/finished?page=${page}`)
  return json
    ? normalizeAnimeList(json.data || json, 'kuramanime').filter(a => isAnimeTitle(a.title))
    : []
}

// ===========================================
// DONGHUA SOURCES - ONGOING
// ===========================================

async function getDonghuaApiOngoing(page = 1) {
  const json = await safeFetch(`${BASE_URL}/donghua/ongoing/${page}`)
  return json ? normalizeDonghuaList(json, 'donghua') : []
}

async function getDonghubLatest(page = 1) {
  const json = await safeFetch(`${BASE_URL}/donghub/latest?page=${page}`)
  return json ? normalizeDonghuaList(json.data || json, 'donghub') : []
}

// Kuramanime donghua — pastikan tidak masuk ke anime list
async function getKuramanimeDonghua(page = 1) {
  const json = await safeFetch(`${BASE_URL}/kura/quick/donghua?page=${page}`)
  // Normalisasi sebagai donghua, filter judul yang memang donghua atau tidak ada keyword anime spesifik
  return json
    ? normalizeDonghuaList(json.data || json, 'kuramanime')
    : []
}

// AnimeSail donghua — endpoint khusus donghua, tidak boleh masuk anime list
async function getAnimeSailDonghua(page = 1) {
  const json = await safeFetch(`${BASE_URL}/animesail/donghua?page=${page}`)
  return json ? normalizeDonghuaList(json.data || json, 'animesail') : []
}

// ===========================================
// DONGHUA SOURCES - COMPLETED
// ===========================================

async function getDonghuaApiCompleted(page = 1) {
  const json = await safeFetch(`${BASE_URL}/donghua/completed/${page}`)
  return json ? normalizeDonghuaList(json, 'donghua') : []
}

async function getDonghubPopular(page = 1) {
  const json = await safeFetch(`${BASE_URL}/donghub/popular?page=${page}`)
  return json ? normalizeDonghuaList(json.data || json, 'donghub') : []
}

// ===========================================
// COMBINED FETCH FUNCTIONS
// ===========================================

export async function getOngoingAnime(page = 1) {
  const results = await Promise.allSettled([
    getOtakudesuOngoing(page),
    getSamehadakuOngoing(page),
    getAnimasuOngoing(page),
    getOploverzOngoing(page),
    getAlqanimeOngoing(page),
    getWinbuOngoing(page),
    getKuramanimeOngoing(page),
    getAnimeSailOngoing(page),    // sudah difilter, tidak nyasar ke donghua
    getStreamLatest(page),
    getAnimekuindoLatest(page),
    getNimegamiLatest(page),
    getAnoboyHome(page),
    getKusonimeLatest(page),
  ])

  const allAnime: AnimeItem[] = []
  const seenTitles = new Set<string>()

  for (const result of results) {
    if (result.status === 'fulfilled' && Array.isArray(result.value)) {
      for (const anime of result.value) {
        const normalizedTitle = anime.title.toLowerCase().replace(/[^a-z0-9]/g, '')
        if (!seenTitles.has(normalizedTitle) && anime.title && anime.poster) {
          seenTitles.add(normalizedTitle)
          allAnime.push(anime)
        }
      }
    }
  }

  return { data: allAnime }
}

export async function getCompleteAnime(page = 1) {
  const results = await Promise.allSettled([
    getOtakudesuCompleted(page),
    getSamehadakuCompleted(page),
    getAnimasuCompleted(page),
    getOploverzCompleted(page),
    getAlqanimeCompleted(page),
    getWinbuCompleted(page),
    getKuramanimeFinished(page),  // sudah difilter
  ])

  const allAnime: AnimeItem[] = []
  const seenTitles = new Set<string>()

  for (const result of results) {
    if (result.status === 'fulfilled' && Array.isArray(result.value)) {
      for (const anime of result.value) {
        const normalizedTitle = anime.title.toLowerCase().replace(/[^a-z0-9]/g, '')
        if (!seenTitles.has(normalizedTitle) && anime.title && anime.poster) {
          seenTitles.add(normalizedTitle)
          allAnime.push(anime)
        }
      }
    }
  }

  return { data: allAnime }
}

export async function getDonghuaOngoing(page = 1) {
  const results = await Promise.allSettled([
    getDonghuaApiOngoing(page),
    getDonghubLatest(page),
    getKuramanimeDonghua(page),   // endpoint khusus donghua
    getAnimeSailDonghua(page),    // endpoint khusus donghua
  ])

  const allDonghua: DonghuaItem[] = []
  const seenTitles = new Set<string>()

  for (const result of results) {
    if (result.status === 'fulfilled' && Array.isArray(result.value)) {
      for (const donghua of result.value) {
        const normalizedTitle = donghua.title.toLowerCase().replace(/[^a-z0-9]/g, '')
        if (!seenTitles.has(normalizedTitle) && donghua.title && donghua.poster) {
          seenTitles.add(normalizedTitle)
          allDonghua.push(donghua)
        }
      }
    }
  }

  return { data: allDonghua }
}

export async function getDonghuaCompleted(page = 1) {
  const results = await Promise.allSettled([
    getDonghuaApiCompleted(page),
    getDonghubPopular(page),
  ])

  const allDonghua: DonghuaItem[] = []
  const seenTitles = new Set<string>()

  for (const result of results) {
    if (result.status === 'fulfilled' && Array.isArray(result.value)) {
      for (const donghua of result.value) {
        const normalizedTitle = donghua.title.toLowerCase().replace(/[^a-z0-9]/g, '')
        if (!seenTitles.has(normalizedTitle) && donghua.title && donghua.poster) {
          seenTitles.add(normalizedTitle)
          allDonghua.push(donghua)
        }
      }
    }
  }

  return { data: allDonghua }
}

export async function getDonghuaLatest(page = 1) {
  const json = await safeFetch(`${BASE_URL}/donghua/latest/${page}`)
  return { data: json ? normalizeDonghuaList(json, 'donghua') : [] }
}

// ===========================================
// ANIME DETAIL & EPISODE FUNCTIONS
// ===========================================

export async function getAnimeDetail(slug: string, source?: string) {
  const sourceOrder = source ? [source] : [
    'otakudesu', 'samehadaku', 'animasu', 'oploverz',
    'alqanime', 'winbu', 'kuramanime', 'animesail',
    'stream', 'animekuindo', 'nimegami', 'anoboy', 'kusonime'
  ]

  const sourceEndpoints: Record<string, string> = {
    otakudesu:   `${BASE_URL}/anime/${slug}`,
    samehadaku:  `${BASE_URL}/samehadaku/anime/${slug}`,
    animasu:     `${BASE_URL}/animasu/detail/${slug}`,
    oploverz:    `${BASE_URL}/oploverz/anime/${slug}`,
    alqanime:    `${BASE_URL}/alqanime/detail/${slug}`,
    winbu:       `${BASE_URL}/winbu/anime/${slug}`,
    kuramanime:  `${BASE_URL}/kura/anime/${slug}`,
    animesail:   `${BASE_URL}/animesail/detail/${slug}`,
    stream:      `${BASE_URL}/stream/anime/${slug}`,
    animekuindo: `${BASE_URL}/animekuindo/detail/${slug}`,
    nimegami:    `${BASE_URL}/nimegami/detail/${slug}`,
    anoboy:      `${BASE_URL}/anoboy/anime/${slug}`,
    kusonime:    `${BASE_URL}/kusonime/detail/${slug}`,
  }

  for (const src of sourceOrder) {
    const endpoint = sourceEndpoints[src]
    if (!endpoint) continue
    const json = await safeFetch(endpoint)
    if (json && (json.title || json.data?.title)) {
      return { ...json, source: src }
    }
  }

  throw new Error('Failed to fetch anime detail')
}

export async function getEpisodeDetail(slug: string, source?: string) {
  const sourceEndpoints: Record<string, string> = {
    otakudesu:   `${BASE_URL}/episode/${slug}`,
    samehadaku:  `${BASE_URL}/samehadaku/episode/${slug}`,
    animasu:     `${BASE_URL}/animasu/episode/${slug}`,
    oploverz:    `${BASE_URL}/oploverz/episode/${slug}`,
    alqanime:    `${BASE_URL}/alqanime/episode/${slug}`,
    winbu:       `${BASE_URL}/winbu/episode/${slug}`,
    kuramanime:  `${BASE_URL}/kura/episode/${slug}`,
    animesail:   `${BASE_URL}/animesail/episode/${slug}`,
    stream:      `${BASE_URL}/stream/episode/${slug}`,
    animekuindo: `${BASE_URL}/animekuindo/episode/${slug}`,
    nimegami:    `${BASE_URL}/nimegami/episode/${slug}`,
    anoboy:      `${BASE_URL}/anoboy/episode/${slug}`,
    kusonime:    `${BASE_URL}/kusonime/episode/${slug}`,
  }

  if (source && sourceEndpoints[source]) {
    const json = await safeFetch(sourceEndpoints[source])
    if (json) return { ...json, source }
  }

  for (const [src, endpoint] of Object.entries(sourceEndpoints)) {
    if (src === source) continue
    const json = await safeFetch(endpoint)
    if (json && (json.data || json.title || json.streaming || json.server)) {
      return { ...json, source: src }
    }
  }

  throw new Error('Failed to fetch episode detail')
}

// Get stream server URL — mendukung semua source
export async function getStreamServer(serverId: string, source?: string) {
  const sourceEndpoints: Record<string, string> = {
    otakudesu:   `${BASE_URL}/server/${serverId}`,
    samehadaku:  `${BASE_URL}/samehadaku/server/${serverId}`,
    animasu:     `${BASE_URL}/animasu/server/${serverId}`,
    oploverz:    `${BASE_URL}/oploverz/server/${serverId}`,
    alqanime:    `${BASE_URL}/alqanime/server/${serverId}`,
    winbu:       `${BASE_URL}/winbu/server?${serverId}`,
    kuramanime:  `${BASE_URL}/kura/server/${serverId}`,
    animesail:   `${BASE_URL}/animesail/server/${serverId}`,
    stream:      `${BASE_URL}/stream/server/${serverId}`,
    animekuindo: `${BASE_URL}/animekuindo/server/${serverId}`,
    nimegami:    `${BASE_URL}/nimegami/server/${serverId}`,
    anoboy:      `${BASE_URL}/anoboy/server/${serverId}`,
    kusonime:    `${BASE_URL}/kusonime/server/${serverId}`,
  }

  if (source && sourceEndpoints[source]) {
    const json = await safeFetch(sourceEndpoints[source])
    if (json) return json
  }

  // Fallback ke semua source
  for (const [, endpoint] of Object.entries(sourceEndpoints)) {
    const json = await safeFetch(endpoint)
    if (json) return json
  }

  throw new Error('Failed to fetch stream server')
}

export async function getKuramanimeWatch(id: string, slug: string, episode: number) {
  const json = await safeFetch(`${BASE_URL}/kura/watch/${id}/${slug}/${episode}`)
  return json
}

// ===========================================
// DONGHUA DETAIL & EPISODE FUNCTIONS
// ===========================================

export async function getDonghuaDetail(slug: string, source?: string) {
  const sourceEndpoints: Record<string, string> = {
    donghua: `${BASE_URL}/donghua/detail/${slug}`,
    donghub: `${BASE_URL}/donghub/detail/${slug}`,
  }

  if (source && sourceEndpoints[source]) {
    const json = await safeFetch(sourceEndpoints[source])
    if (json && (json.title || json.data?.title)) {
      return { ...json, source }
    }
  }

  for (const [src, endpoint] of Object.entries(sourceEndpoints)) {
    const json = await safeFetch(endpoint)
    if (json && (json.title || json.data?.title)) {
      return { ...json, source: src }
    }
  }

  throw new Error('Failed to fetch donghua detail')
}

export async function getDonghuaEpisode(slug: string, source?: string) {
  const sourceEndpoints: Record<string, string> = {
    donghua: `${BASE_URL}/donghua/episode/${slug}`,
    donghub: `${BASE_URL}/donghub/episode/${slug}`,
  }

  if (source && sourceEndpoints[source]) {
    const json = await safeFetch(sourceEndpoints[source])
    if (json) return { ...json, source }
  }

  for (const [src, endpoint] of Object.entries(sourceEndpoints)) {
    const json = await safeFetch(endpoint)
    if (json && (json.data || json.streaming || json.title)) {
      return { ...json, source: src }
    }
  }

  throw new Error('Failed to fetch donghua episode')
}

// ===========================================
// SEARCH FUNCTIONS
// ===========================================

export async function searchAnime(keyword: string) {
  const encodedKeyword = encodeURIComponent(keyword)

  const results = await Promise.allSettled([
    safeFetch(`${BASE_URL}/search/${encodedKeyword}`).then(json =>
      json ? normalizeAnimeList(json.data || json, 'otakudesu') : []
    ),
    safeFetch(`${BASE_URL}/samehadaku/search?q=${encodedKeyword}`).then(json =>
      json ? normalizeAnimeList(json.data || json, 'samehadaku') : []
    ),
    safeFetch(`${BASE_URL}/animasu/search/${encodedKeyword}`).then(json =>
      json ? normalizeAnimeList(json.data || json, 'animasu') : []
    ),
    safeFetch(`${BASE_URL}/oploverz/search/${encodedKeyword}`).then(json =>
      json ? normalizeAnimeList(json.data || json, 'oploverz') : []
    ),
    safeFetch(`${BASE_URL}/alqanime/search/${encodedKeyword}`).then(json =>
      json ? normalizeAnimeList(json.data || json, 'alqanime') : []
    ),
    safeFetch(`${BASE_URL}/winbu/search?q=${encodedKeyword}`).then(json =>
      json ? normalizeAnimeList(json.data || json, 'winbu') : []
    ),
    safeFetch(`${BASE_URL}/kura/search/${encodedKeyword}`).then(json =>
      json ? normalizeAnimeList(json.data || json, 'kuramanime').filter(a => isAnimeTitle(a.title)) : []
    ),
    safeFetch(`${BASE_URL}/animesail/search/${encodedKeyword}`).then(json =>
      json ? normalizeAnimeList(json.data || json, 'animesail').filter(a => isAnimeTitle(a.title)) : []
    ),
    safeFetch(`${BASE_URL}/stream/search/${encodedKeyword}`).then(json =>
      json ? normalizeAnimeList(json.data || json, 'stream') : []
    ),
    safeFetch(`${BASE_URL}/animekuindo/search/${encodedKeyword}`).then(json =>
      json ? normalizeAnimeList(json.data || json, 'animekuindo') : []
    ),
    safeFetch(`${BASE_URL}/nimegami/search/${encodedKeyword}`).then(json =>
      json ? normalizeAnimeList(json.data || json, 'nimegami') : []
    ),
    safeFetch(`${BASE_URL}/anoboy/search/${encodedKeyword}`).then(json =>
      json ? normalizeAnimeList(json.data || json, 'anoboy') : []
    ),
    safeFetch(`${BASE_URL}/kusonime/search/${encodedKeyword}`).then(json =>
      json ? normalizeAnimeList(json.data || json, 'kusonime') : []
    ),
  ])

  const allAnime: AnimeItem[] = []
  const seenTitles = new Set<string>()

  for (const result of results) {
    if (result.status === 'fulfilled' && Array.isArray(result.value)) {
      for (const anime of result.value) {
        const normalizedTitle = anime.title.toLowerCase().replace(/[^a-z0-9]/g, '')
        if (!seenTitles.has(normalizedTitle) && anime.title && anime.poster) {
          seenTitles.add(normalizedTitle)
          allAnime.push(anime)
        }
      }
    }
  }

  return { data: allAnime }
}

export async function searchDonghua(keyword: string, page = 1) {
  const encodedKeyword = encodeURIComponent(keyword)

  const results = await Promise.allSettled([
    safeFetch(`${BASE_URL}/donghua/search/${encodedKeyword}/${page}`).then(json =>
      json ? normalizeDonghuaList(json.data || json, 'donghua') : []
    ),
    safeFetch(`${BASE_URL}/donghub/search/${encodedKeyword}`).then(json =>
      json ? normalizeDonghuaList(json.data || json, 'donghub') : []
    ),
  ])

  const allDonghua: DonghuaItem[] = []
  const seenTitles = new Set<string>()

  for (const result of results) {
    if (result.status === 'fulfilled' && Array.isArray(result.value)) {
      for (const donghua of result.value) {
        const normalizedTitle = donghua.title.toLowerCase().replace(/[^a-z0-9]/g, '')
        if (!seenTitles.has(normalizedTitle) && donghua.title && donghua.poster) {
          seenTitles.add(normalizedTitle)
          allDonghua.push(donghua)
        }
      }
    }
  }

  return { data: allDonghua }
}

// ===========================================
// GENRE FUNCTIONS
// ===========================================

export async function getAnimeGenres() {
  const res = await fetch(`${BASE_URL}/genre`, { next: { revalidate: 86400 } })
  if (!res.ok) throw new Error('Failed to fetch genres')
  return res.json()
}

export async function getDonghuaGenres() {
  const res = await fetch(`${BASE_URL}/donghua/genres`, { next: { revalidate: 86400 } })
  if (!res.ok) throw new Error('Failed to fetch donghua genres')
  return res.json()
}

export async function getAnimeByGenre(genreSlug: string, page = 1) {
  const json = await safeFetch(`${BASE_URL}/genre/${genreSlug}?page=${page}`)
  return { data: json ? normalizeAnimeList(json.data || json, 'otakudesu') : [] }
}

export async function getDonghuaByGenre(genreSlug: string, page = 1) {
  const json = await safeFetch(`${BASE_URL}/donghua/genres/${genreSlug}/${page}`)
  return { data: json ? normalizeDonghuaList(json.data || json, 'donghua') : [] }
}

// ===========================================
// ADDITIONAL FUNCTIONS
// ===========================================

export async function getAllAnime() {
  const res = await fetch(`${BASE_URL}/unlimited`, { next: { revalidate: 3600 } })
  if (!res.ok) throw new Error('Failed to fetch all anime')
  const json = await res.json()
  return { data: normalizeAnimeList(json.data || json, 'otakudesu') }
}

export async function getDonghuaHome(page = 1) {
  const json = await safeFetch(`${BASE_URL}/donghua/home/${page}`)
  return { data: json ? normalizeDonghuaList(json, 'donghua') : [] }
}

export async function getAnimeSchedule() {
  const json = await safeFetch(`${BASE_URL}/schedule`)
  return json
}

export async function getDonghuaSchedule() {
  const json = await safeFetch(`${BASE_URL}/donghua/schedule`)
  return json
}

// ===========================================
// TOTAL COUNT FUNCTIONS
// ===========================================

export async function getAnimeTotalCount(type: 'ongoing' | 'complete') {
  try {
    const sources = type === 'ongoing'
      ? [
          () => safeFetch(`${BASE_URL}/ongoing-anime?page=1`),
          () => safeFetch(`${BASE_URL}/samehadaku/ongoing?page=1`),
          () => safeFetch(`${BASE_URL}/animasu/ongoing?page=1`),
          () => safeFetch(`${BASE_URL}/oploverz/ongoing?page=1`),
          () => safeFetch(`${BASE_URL}/alqanime/ongoing?page=1`),
          () => safeFetch(`${BASE_URL}/winbu/ongoing?page=1`),
          () => safeFetch(`${BASE_URL}/kura/quick/ongoing?page=1`),
        ]
      : [
          () => safeFetch(`${BASE_URL}/complete-anime?page=1`),
          () => safeFetch(`${BASE_URL}/samehadaku/completed?page=1`),
          () => safeFetch(`${BASE_URL}/animasu/completed?page=1`),
          () => safeFetch(`${BASE_URL}/oploverz/completed?page=1`),
          () => safeFetch(`${BASE_URL}/alqanime/completed?page=1`),
          () => safeFetch(`${BASE_URL}/winbu/completed?page=1`),
          () => safeFetch(`${BASE_URL}/kura/quick/finished?page=1`),
        ]

    const promises: Promise<number>[] = sources.map(fetchFn =>
      fetchFn().then(json => {
        if (!json) return 0
        const list = normalizeAnimeList(json.data || json, 'count')
        return list.length * 10
      }).catch(() => 0)
    )

    const results = await Promise.all(promises)
    return results.reduce((a, b) => a + b, 0)
  } catch {
    return 0
  }
}

export async function getDonghuaTotalCount(type: 'ongoing' | 'completed' | 'latest') {
  try {
    const sources = {
      ongoing: [
        () => safeFetch(`${BASE_URL}/donghua/ongoing/1`),
        () => safeFetch(`${BASE_URL}/donghub/latest?page=1`),
        () => safeFetch(`${BASE_URL}/kura/quick/donghua?page=1`),
        () => safeFetch(`${BASE_URL}/animesail/donghua?page=1`),
      ],
      completed: [
        () => safeFetch(`${BASE_URL}/donghua/completed/1`),
        () => safeFetch(`${BASE_URL}/donghub/popular?page=1`),
      ],
      latest: [
        () => safeFetch(`${BASE_URL}/donghua/latest/1`),
        () => safeFetch(`${BASE_URL}/donghub/latest?page=1`),
      ],
    }

    const promises = sources[type].map(fetchFn =>
      fetchFn().then(json => {
        if (!json) return 0
        const list = normalizeDonghuaList(json.data || json, 'count')
        return list.length * 10
      }).catch(() => 0)
    )

    const results = await Promise.all(promises)
    return results.reduce((a, b) => a + b, 0)
  } catch {
    return 0
  }
}

// ===========================================
// TYPES
// ===========================================

export interface AnimeItem {
  title: string
  slug: string
  poster: string
  episode?: string
  rating?: string
  status?: string
  source: string
}

export interface DonghuaItem {
  title: string
  slug: string
  poster: string
  episode?: string
  rating?: string
  status?: string
  source: string
}

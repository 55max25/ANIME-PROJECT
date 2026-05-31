import { NextRequest, NextResponse } from 'next/server'
import { 
  getOngoingAnime, 
  getCompleteAnime, 
  getDonghuaOngoing, 
  getDonghuaCompleted, 
  getDonghuaLatest 
} from '@/lib/api'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const endpoint = searchParams.get('endpoint')
  const page = parseInt(searchParams.get('page') || '1', 10)

  try {
    let data
    
    switch (endpoint) {
      case 'ongoing':
        data = await getOngoingAnime(page)
        break
      case 'complete':
        data = await getCompleteAnime(page)
        break
      case 'donghua-ongoing':
        data = await getDonghuaOngoing(page)
        break
      case 'donghua-completed':
        data = await getDonghuaCompleted(page)
        break
      case 'donghua-latest':
        data = await getDonghuaLatest(page)
        break
      default:
        return NextResponse.json({ error: 'Invalid endpoint' }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching anime list:', error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}

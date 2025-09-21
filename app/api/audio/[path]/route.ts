import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest, { params }: { params: { path: string } }) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify user with regular client
  const userClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  const { data: { user }, error: authError } = await userClient.auth.getUser(token)
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Use service role for storage access
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const audioPath = decodeURIComponent(params.path)
  
  // Verify the path belongs to the authenticated user
  if (!audioPath.startsWith(user.id + '/')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { data, error } = await supabase.storage
      .from('audio-recordings')
      .download(audioPath)

    if (error || !data) {
      return NextResponse.json({ error: 'Audio not found' }, { status: 404 })
    }

    return new NextResponse(data, {
      headers: {
        'Content-Type': 'audio/webm',
        'Cache-Control': 'private, max-age=3600'
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load audio' }, { status: 500 })
  }
}
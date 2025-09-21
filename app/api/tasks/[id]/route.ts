import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  
  // Filter out invalid fields
  const validFields = {
    date: body.date,
    focus_area: body.focus_area,
    title: body.title,
    details: body.details,
    time_estimate: body.time_estimate,
    status: body.status,
    notes: body.notes,
    links: body.links,
    code: body.code,
    code_language: body.code_language,
    is_dsa: body.is_dsa,
    completed_at: body.completed_at,
    audio_path: body.audio_path,
    updated_at: new Date().toISOString()
  }
  
  // Remove undefined fields
  Object.keys(validFields).forEach(key => {
    if ((validFields as any)[key] === undefined) {
      delete (validFields as any)[key]
    }
  })
  
  const { data, error } = await supabase
    .from('tasks')
    .update(validFields)
    .eq('id', params.id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', params.id)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
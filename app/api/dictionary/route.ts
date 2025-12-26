import { NextRequest, NextResponse } from 'next/server';
import { DICTIONARIES } from '@/lib/dictionary';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const dictName = searchParams.get('dict');
  
  if (!dictName || !DICTIONARIES[dictName]) {
    return NextResponse.json({ error: 'Invalid dictionary name' }, { status: 400 });
  }
  
  const dictInfo = DICTIONARIES[dictName];
  
  try {
    // Try to fetch from URL
    const response = await fetch(dictInfo.url);
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch dictionary' }, { status: 500 });
    }
    
    const text = await response.text();
    const words = text
      .split('\n')
      .map(line => line.trim().toLowerCase())
      .filter(word => word.length >= 2);
    
    return NextResponse.json({ words, count: words.length });
  } catch (error) {
    return NextResponse.json(
      { error: `Error loading dictionary: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}


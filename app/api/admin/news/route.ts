import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const SETTINGS_ID = 999999;

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', SETTINGS_ID)
      .single();

    if (error || !data) {
      // Default settings if not found
      return NextResponse.json({ items: [], speed: 30, direction: 'left' });
    }

    try {
      const parsed = JSON.parse(data.description);
      return NextResponse.json(parsed);
    } catch (e) {
      return NextResponse.json({ items: [data.description], speed: 30, direction: 'left' });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch news from Supabase' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newsData = await request.json();
    
    const { error } = await supabase
      .from('products')
      .upsert({
        id: SETTINGS_ID,
        name: 'News Ticker Settings',
        price: 0,
        description: JSON.stringify(newsData),
        category: 'SETTINGS_NEWS',
        image: 'https://cdn-icons-png.flaticon.com/512/21/21601.png', // News icon
        duration: ''
      }, { onConflict: 'id' });

    if (error) throw error;
    
    return NextResponse.json({ message: 'News updated in Supabase successfully' });
  } catch (error: any) {
    console.error('Supabase News Update Error:', error);
    return NextResponse.json({ error: 'Failed to update news in Supabase: ' + error.message }, { status: 500 });
  }
}

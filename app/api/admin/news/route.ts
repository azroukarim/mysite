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
      return NextResponse.json({ items: [], speed: 30, direction: 'left' });
    }

    try {
      // If it's a JSON string, parse it
      const parsed = JSON.parse(data.description);
      return NextResponse.json({
        items: Array.isArray(parsed.items) ? parsed.items : [data.description],
        speed: parsed.speed || 30,
        direction: parsed.direction || 'left'
      });
    } catch (e) {
      // If it's a plain string, return it as the only item
      return NextResponse.json({ items: [data.description], speed: 30, direction: 'left' });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newsData = await request.json();
    
    // Ensure newsData has the expected format
    const formattedData = {
      items: Array.isArray(newsData.items) ? newsData.items : [],
      speed: newsData.speed || 30,
      direction: newsData.direction || 'left'
    };

    const { error } = await supabase
      .from('products')
      .upsert({
        id: SETTINGS_ID,
        name: 'News Ticker Settings',
        price: 0,
        description: JSON.stringify(formattedData),
        category: 'SETTINGS_NEWS',
        image: 'https://cdn-icons-png.flaticon.com/512/21/21601.png',
        duration: ''
      }, { onConflict: 'id' });

    if (error) throw error;
    
    return NextResponse.json({ success: true, message: 'News updated in Supabase' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

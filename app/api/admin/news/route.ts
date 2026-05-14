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
      return NextResponse.json({ bars: [] });
    }

    try {
      const parsed = JSON.parse(data.description);
      // Ensure we return bars
      if (parsed.bars) {
        return NextResponse.json({ bars: parsed.bars });
      }
      // Migration from old single-ticker format
      return NextResponse.json({
        bars: [{
          id: Date.now(),
          name: 'Main Ticker',
          items: Array.isArray(parsed.items) ? parsed.items : [data.description],
          speed: parsed.speed || 30,
          direction: parsed.direction || 'left',
          active: true
        }]
      });
    } catch (e) {
      return NextResponse.json({
        bars: [{
          id: Date.now(),
          name: 'Main Ticker',
          items: [data.description],
          speed: 30,
          direction: 'left',
          active: true
        }]
      });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}

async function verifyAdmin(password: string) {
  if (!password) return false;
  const masterPass = process.env.ADMIN_PASSWORD || 'streamtv';
  if (password === masterPass) return true;
  const { data: config } = await supabase.from('admin_config').select('password').limit(1);
  if (config && config.length > 0 && config[0].password === password) return true;
  return false;
}

export async function POST(request: Request) {
  try {
    const { password, bars } = await request.json();
    
    if (!(await verifyAdmin(password))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const formattedData = {
      bars: Array.isArray(bars) ? bars : [],
      lastUpdated: new Date().toISOString()
    };

    const { error } = await supabase
      .from('products')
      .upsert({
        id: SETTINGS_ID,
        name: 'Multi Ticker Settings',
        price: 0,
        description: JSON.stringify(formattedData),
        category: 'SETTINGS_NEWS_MULTI',
        image: 'https://cdn-icons-png.flaticon.com/512/21/21601.png',
        duration: ''
      }, { onConflict: 'id' });

    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

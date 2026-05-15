import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data: configs, error } = await supabase
      .from('admin_config')
      .select('protection_enabled, splash_ads_json')
      .limit(1);

    // If table is empty or error, default values
    if (error || !configs || configs.length === 0) {
      if (error) console.error('Database fetch error:', error);
      return NextResponse.json({ 
        success: true, 
        protection_enabled: false,
        maintenance_enabled: false,
        splash_ad_url: '',
        splash_ad_enabled: false
      });
    }

    const config = configs[0];
    const adsData = config.splash_ads_json || { ads: [] };

    return NextResponse.json({ 
      success: true, 
      protection_enabled: !!config.protection_enabled,
      maintenance_enabled: !!adsData.maintenance_enabled,
      splash_ad_url: adsData.ads?.[0]?.image_url || '',
      splash_ad_enabled: (adsData.ads?.length || 0) > 0
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { protection_enabled, maintenance_enabled } = await request.json();

    // 1. Try to fetch the first record's ID
    const { data: existing } = await supabase.from('admin_config').select('id, splash_ads_json').limit(1);

    let error;
    if (!existing || existing.length === 0) {
      // 2. If no record exists, try to insert one
      const { error: insertError } = await supabase
        .from('admin_config')
        .insert([{ 
          username: 'admin', 
          password: 'streamtv', 
          protection_enabled: !!protection_enabled,
          splash_ads_json: { maintenance_enabled: !!maintenance_enabled }
        }]);
      error = insertError;
    } else {
      // 3. If record exists, update it
      const currentJson = existing[0].splash_ads_json || { ads: [] };
      const updatedJson = { ...currentJson, maintenance_enabled: !!maintenance_enabled };

      const { error: updateError } = await supabase
        .from('admin_config')
        .update({ 
          protection_enabled: protection_enabled !== undefined ? !!protection_enabled : undefined,
          splash_ads_json: updatedJson
        })
        .eq('id', existing[0].id);
      error = updateError;
    }

    if (error) {
      console.error('Database update error:', error);
      return NextResponse.json({ success: false, error: 'Database error: ' + error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Settings saved successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

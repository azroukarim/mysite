import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Helper to verify admin password (shared logic)
async function verifyAdmin(password: string) {
  if (!password) return false;
  
  // 1. Check against Environment Variable (Master Password)
  const masterPass = process.env.ADMIN_PASSWORD || 'streamtv';
  if (password === masterPass) return true;

  // 2. Check against Database
  const { data: config } = await supabase
    .from('admin_config')
    .select('password')
    .limit(1);
    
  if (config && config.length > 0) {
    if (config[0].password === password) return true;
  }
  
  return false;
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('admin_config')
      .select('splash_ads_json')
      .limit(1);

    if (error) throw error;
    
    const json = data && data[0]?.splash_ads_json ? data[0].splash_ads_json : { ads: [], queueStartTime: null };
    
    // Migration: if it's just an array, wrap it
    if (Array.isArray(json)) {
      return NextResponse.json({ ads: json, queueStartTime: null });
    }
    
    return NextResponse.json(json);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { password, ads, queueStartTime } = await request.json();

    if (!(await verifyAdmin(password))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = {
      ads: Array.isArray(ads) ? ads : [],
      queueStartTime: queueStartTime || new Date().toISOString()
    };

    const { error } = await supabase
      .from('admin_config')
      .upsert({ 
        password: password, 
        splash_ads_json: payload 
      }, { onConflict: 'password' }); // This works if password is unique/PK

    if (error) {
      // If upsert fails (e.g. unique constraint issues), we try to update the first row
      const { data: rows } = await supabase.from('admin_config').select('id').limit(1);
      if (rows && rows[0]) {
        const { error: updateError } = await supabase
          .from('admin_config')
          .update({ splash_ads_json: payload })
          .eq('id', rows[0].id);
        if (updateError) throw updateError;
      } else {
        // Last resort: just insert
        const { error: insertError } = await supabase
          .from('admin_config')
          .insert({ password, splash_ads_json: payload });
        if (insertError) throw insertError;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

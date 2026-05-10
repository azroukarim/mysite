import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data: configs, error } = await supabase
      .from('admin_config')
      .select('protection_enabled')
      .limit(1);

    // If table is empty or error, default to ENABLED for security
    if (error || !configs || configs.length === 0) {
      return NextResponse.json({ success: true, protection_enabled: true });
    }

    return NextResponse.json({ success: true, protection_enabled: configs[0].protection_enabled });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { protection_enabled } = await request.json();

    // 1. Try to fetch the first record's ID
    const { data: existing } = await supabase.from('admin_config').select('id, username').limit(1);

    let error;
    if (!existing || existing.length === 0) {
      // 2. If no record exists, try to insert one (might fail due to RLS, but we try)
      const { error: insertError } = await supabase
        .from('admin_config')
        .insert([{ 
          username: 'admin', 
          password: 'streamtv', 
          protection_enabled: !!protection_enabled 
        }]);
      error = insertError;
    } else {
      // 3. If record exists, update it
      const { error: updateError } = await supabase
        .from('admin_config')
        .update({ protection_enabled: !!protection_enabled })
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

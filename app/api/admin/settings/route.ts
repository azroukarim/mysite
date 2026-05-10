import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('admin_config')
      .select('protection_enabled')
      .single();

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    return NextResponse.json({ success: true, protection_enabled: data.protection_enabled });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { password, protection_enabled } = await request.json();

    // Verify password
    const { data: config, error: configError } = await supabase
      .from('admin_config')
      .select('password')
      .single();

    if (configError || password !== config.password) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Update protection setting
    const { error } = await supabase
      .from('admin_config')
      .update({ protection_enabled })
      .eq('id', 1);

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data: configs, error } = await supabase
      .from('admin_config')
      .select('protection_enabled')
      .limit(1);

    if (error || !configs || configs.length === 0) {
      return NextResponse.json({ success: true, protection_enabled: false });
    }

    return NextResponse.json({ success: true, protection_enabled: configs[0].protection_enabled });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { password, protection_enabled } = await request.json();

    // Ultra-forceful update: Use upsert to ensure at least one record exists with this setting
    // Safely update the protection state for the admin record
    const { error } = await supabase
      .from('admin_config')
      .update({ protection_enabled: !!protection_enabled })
      .eq('username', 'admin');

    if (error) {
      console.error('Database update error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Settings saved successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Helper to verify admin password (shared logic)
async function verifyAdmin(password: string) {
  const { data: config } = await supabase
    .from('admin_config')
    .select('password')
    .limit(1);
  return config && config[0]?.password === password;
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('admin_config')
      .select('splash_ads_json')
      .limit(1);

    if (error) throw error;
    return NextResponse.json(data && data[0]?.splash_ads_json ? data[0].splash_ads_json : []);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { password, ads } = await request.json();

    if (!(await verifyAdmin(password))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use upsert to handle cases where the row might not exist yet
    // We assume the first row or create one with the password
    const { error } = await supabase
      .from('admin_config')
      .upsert({ 
        password: password, 
        splash_ads_json: ads 
      }, { onConflict: 'password' }); // This works if password is unique/PK

    if (error) {
      // If password isn't unique, we try to update the first row
      const { data: rows } = await supabase.from('admin_config').select('id').limit(1);
      if (rows && rows[0]) {
        const { error: updateError } = await supabase
          .from('admin_config')
          .update({ splash_ads_json: ads })
          .eq('id', rows[0].id);
        if (updateError) throw updateError;
      } else {
        // Last resort: just insert
        const { error: insertError } = await supabase
          .from('admin_config')
          .insert({ password, splash_ads_json: ads });
        if (insertError) throw insertError;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 });
    }

    // Use Supabase Auth for professional authentication
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Auth error:', error.message);
      
      // Legacy Fallback: check if the input matches username or email in admin_config
      const { data: configs } = await supabase.from('admin_config').select('*').limit(1);
      
      if (configs && configs.length > 0) {
        const config = configs[0];
        // Check if input matches username OR email from the old config
        if ((email === config.username || email === config.email) && password === config.password) {
          return NextResponse.json({ success: true, message: 'Legacy Login successful', legacy: true });
        }
      }
      return NextResponse.json({ success: false, error: 'بيانات الدخول غير صحيحة' }, { status: 401 });
    }

    return NextResponse.json({ success: true, user: data.user });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

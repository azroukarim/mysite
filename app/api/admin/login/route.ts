import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // Fetch credentials from Supabase
    const { data: config, error } = await supabase
      .from('admin_config')
      .select('username, password')
      .single();

    if (error) {
      console.error('Error fetching admin config:', error);
      return NextResponse.json({ success: false, error: 'تعذر الاتصال بقاعدة البيانات' }, { status: 500 });
    }

    if (username === config.username && password === config.password) {
      return NextResponse.json({ success: true, message: 'Login successful' });
    }

    return NextResponse.json({ success: false, error: 'بيانات الدخول غير صحيحة' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

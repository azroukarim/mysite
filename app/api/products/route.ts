import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';


export async function GET() {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;
    
    return NextResponse.json(products);
  } catch (error: any) {
    console.error('Error fetching from Supabase:', error);
    return NextResponse.json({ error: 'Failed to fetch products: ' + error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password, products } = body;

    // Fetch expected password from Supabase
    const { data: config, error: configError } = await supabase
      .from('admin_config')
      .select('password')
      .single();

    if (configError || password !== config.password) {
      return NextResponse.json({ error: 'كلمة السر غير صالحة (Unauthorized)' }, { status: 401 });
    }

    if (!Array.isArray(products)) {
      return NextResponse.json({ error: 'بيانات المنتجات غير صالحة' }, { status: 400 });
    }

    // Step 1: Get existing IDs to find what to delete
    const { data: existingProducts } = await supabase.from('products').select('id');
    const existingIds = existingProducts?.map(p => p.id) || [];
    const newIds = products.map(p => p.id);
    
    const idsToDelete = existingIds.filter(id => !newIds.includes(id));

    // Step 2: Delete products that are no longer in the list
    if (idsToDelete.length > 0) {
      await supabase.from('products').delete().in('id', idsToDelete);
    }

    // Step 3: Sanitize data and ensure created_at is not null
    const sanitizedProducts = products.map(p => ({
      ...p,
      created_at: p.created_at || new Date().toISOString()
    }));

    // Step 4: Upsert (Update or Insert) the products
    const { error: upsertError } = await supabase
      .from('products')
      .upsert(sanitizedProducts, { onConflict: 'id' });

    if (upsertError) throw upsertError;

    return NextResponse.json({ message: 'تم الحفظ في Supabase بنجاح' });
  } catch (error: any) {
    console.error('Error in POST /api/products:', error);
    return NextResponse.json({ 
      error: 'فشل في حفظ البيانات في Supabase: ' + (error.message || 'Unknown error'),
    }, { status: 500 });
  }
}

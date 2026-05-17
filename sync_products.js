const fs = require('fs');
const path = require('path');

// 1. Read .env.local to get Supabase URL and Key
const envPath = path.join(__dirname, '.env.local');
let supabaseUrl = '';
let supabaseKey = '';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL\s*=\s*(.+)/);
  const keyMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY\s*=\s*(.+)/);
  if (urlMatch) supabaseUrl = urlMatch[1].trim();
  if (keyMatch) supabaseKey = keyMatch[1].trim();
}

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseKey ? 'Found' : 'Not Found');

async function sync() {
  try {
    // 2. Fetch products from strea4k.xyz
    console.log('Fetching products from strea4k.xyz...');
    const response = await fetch('https://strea4k.xyz/api/products');
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }
    const products = await response.json();
    console.log(`Fetched ${products.length} products successfully.`);

    // 3. Save products locally to data/products.json and products_debug.json
    const localDataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(localDataDir)) {
      fs.mkdirSync(localDataDir, { recursive: true });
    }
    
    // Save to data/products.json
    fs.writeFileSync(
      path.join(localDataDir, 'products.json'),
      JSON.stringify(products, null, 2),
      'utf8'
    );
    console.log('Saved to data/products.json');

    // Save to products_debug.json as a backup
    fs.writeFileSync(
      path.join(__dirname, 'products_debug.json'),
      JSON.stringify({ value: products, Count: products.length }, null, 2),
      'utf8'
    );
    console.log('Saved to products_debug.json');

    if (supabaseUrl && supabaseKey) {
      console.log('Upserting products to Supabase...');
      
      // We can use Supabase REST API directly!
      // First, get all existing IDs from the table to see what needs to be deleted
      const selectUrl = `${supabaseUrl}/rest/v1/products?select=id`;
      const selectRes = await fetch(selectUrl, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });
      
      if (!selectRes.ok) {
        throw new Error(`Failed to get existing products: ${await selectRes.text()}`);
      }
      
      const existingProducts = await selectRes.json();
      const existingIds = existingProducts.map(p => p.id);
      const newIds = products.map(p => p.id);
      const idsToDelete = existingIds.filter(id => !newIds.includes(id));
      
      console.log(`Existing IDs: ${existingIds.length}, New IDs: ${newIds.length}`);
      console.log(`IDs to delete:`, idsToDelete);

      // Delete old products no longer in the list
      if (idsToDelete.length > 0) {
        const deleteUrl = `${supabaseUrl}/rest/v1/products?id=in.(${idsToDelete.join(',')})`;
        const deleteRes = await fetch(deleteUrl, {
          method: 'DELETE',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        });
        if (!deleteRes.ok) {
          console.error('Failed to delete old products:', await deleteRes.text());
        } else {
          console.log(`Successfully deleted ${idsToDelete.length} obsolete products.`);
        }
      }

      // Prepare products for upsert, preserving sequential created_at for order
      const now = new Date();
      const sanitizedProducts = products.map((p, index) => {
        const sequentialDate = new Date(now.getTime() + index * 1000).toISOString();
        return {
          id: p.id,
          name: p.name,
          price: p.price,
          description: p.description,
          image: p.image,
          category: p.category,
          link: p.link,
          duration: p.duration,
          sale_start_date: p.sale_start_date,
          sale_end_date: p.sale_end_date,
          created_at: sequentialDate
        };
      });

      // Upsert into Supabase
      const upsertUrl = `${supabaseUrl}/rest/v1/products`;
      const upsertRes = await fetch(upsertUrl, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify(sanitizedProducts)
      });

      if (!upsertRes.ok) {
        throw new Error(`Failed to upsert to Supabase: ${await upsertRes.text()}`);
      }
      console.log('✅ Successfully synced products with Supabase!');
    } else {
      console.log('❌ Supabase credentials not found in .env.local. Skip DB sync.');
    }

  } catch (error) {
    console.error('Error during sync:', error);
  }
}

sync();

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://anwukpgaibrunqamcphx.supabase.co';
const supabaseKey = 'sb_publishable_6fitaJLnv4gAdU7OdJNzQw_fXxTsvhJ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  const tables = ['admin_config', 'products', 'settings', 'config'];
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    console.log(`Table ${table}:`, data ? 'Exists' : 'Error/Missing', error ? error.message : 'OK');
    if (data) console.log(`Data in ${table}:`, data);
  }
}

checkTables();

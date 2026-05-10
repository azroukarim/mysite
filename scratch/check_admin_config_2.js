const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://anwukpgaibrunqamcphx.supabase.co';
const supabaseKey = 'sb_publishable_6fitaJLnv4gAdU7OdJNzQw_fXxTsvhJ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function listTables() {
  // Supabase doesn't have a direct list tables in the JS client easily,
  // but we can try to query a common one or use a trick.
  // Let's try to query 'admin_config' again and see if we can at least get some error info.
  const { data, error } = await supabase.from('admin_config').select('*');
  console.log('admin_config:', data, error);
}

listTables();

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://anwukpgaibrunqamcphx.supabase.co';
const supabaseKey = 'sb_publishable_6fitaJLnv4gAdU7OdJNzQw_fXxTsvhJ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixSchema() {
  // We can't easily run SQL via the client without a RPC, but we can try to just insert.
  // Let's see if we can find any row.
  const { data } = await supabase.from('admin_config').select('*');
  console.log('Current rows:', data);
  
  if (data.length === 0) {
    const { error } = await supabase.from('admin_config').insert([{ username: 'admin', protection_enabled: true }]);
    if (error) console.error('Insert error:', error);
    else console.log('Inserted admin row.');
  }
}

fixSchema();

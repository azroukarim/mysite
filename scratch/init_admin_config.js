const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://anwukpgaibrunqamcphx.supabase.co';
const supabaseKey = 'sb_publishable_6fitaJLnv4gAdU7OdJNzQw_fXxTsvhJ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function initAdminConfig() {
  console.log('Initializing admin_config row...');
  const { data, error } = await supabase
    .from('admin_config')
    .upsert([
      { username: 'admin', protection_enabled: true }
    ], { onConflict: 'username' });

  if (error) {
    console.error('Error initializing admin_config:', error);
  } else {
    console.log('Successfully initialized admin_config:', data);
  }
}

initAdminConfig();

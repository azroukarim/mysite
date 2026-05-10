const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://anwukpgaibrunqamcphx.supabase.co';
const supabaseKey = 'sb_publishable_6fitaJLnv4gAdU7OdJNzQw_fXxTsvhJ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAdminConfig() {
  const { data, error } = await supabase
    .from('admin_config')
    .select('*');

  if (error) {
    console.error('Error fetching admin_config:', error);
  } else {
    console.log('Admin Config Data:', data);
  }
}

checkAdminConfig();

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://anwukpgaibrunqamcphx.supabase.co';
const supabaseKey = 'sb_publishable_6fitaJLnv4gAdU7OdJNzQw_fXxTsvhJ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
  const { data, error } = await supabase.from('products').select('*').limit(1);
  if (data && data[0]) {
    console.log('Columns:', Object.keys(data[0]));
  } else {
    console.log('No data or error:', error);
  }
}

checkColumns();

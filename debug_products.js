
async function check() {
  const res = await fetch('http://localhost:3000/api/products');
  const products = await res.json();
  const neo4k = products.find(p => p.name.includes('NEO4K'));
  console.log(JSON.stringify(neo4k, null, 2));
}
check();

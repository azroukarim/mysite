export default function TestPage() {
  return (
    <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1>🚀 DEPLOYMENT TEST SUCCESSFUL</h1>
      <p>If you see this, the new build is LIVE.</p>
      <p>Time: {new Date().toISOString()}</p>
    </div>
  );
}

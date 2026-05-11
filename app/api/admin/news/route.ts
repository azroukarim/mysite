import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const NEWS_FILE = path.join(process.cwd(), 'data', 'news.json');

// Ensure the directory exists
const ensureDirectory = () => {
  const dir = path.dirname(NEWS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

export async function GET() {
  try {
    ensureDirectory();
    if (!fs.existsSync(NEWS_FILE)) {
      return NextResponse.json({ items: [], speed: 30 });
    }
    const data = fs.readFileSync(NEWS_FILE, 'utf8');
    const parsed = JSON.parse(data);
    
    // Migration for old array format
    if (Array.isArray(parsed)) {
      return NextResponse.json({ items: parsed, speed: 30 });
    }
    
    return NextResponse.json(parsed);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    ensureDirectory();
    fs.writeFileSync(NEWS_FILE, JSON.stringify(data, null, 2));
    return NextResponse.json({ message: 'News updated successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update news' }, { status: 500 });
  }
}

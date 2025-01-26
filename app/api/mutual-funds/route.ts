import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('http://localhost:8080/api/mutual-funds');

    if (!response.ok) {
      throw new Error(`Backend error: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching mutual funds from backend:', error);
    return NextResponse.json({ error: 'Failed to fetch mutual funds' }, { status: 500 });
  }
}

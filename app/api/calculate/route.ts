import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get('ticker');
  const initialInvestment = searchParams.get('initialInvestment');
  const time = searchParams.get('time');

  if (!ticker || !initialInvestment || !time) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  try {
    const response = await fetch(
        `http://localhost:8080/api/mutual-funds/calculate?ticker=${ticker}&amount=${initialInvestment}&time=${time}`
    );

    if (!response.ok) {
      throw new Error(`Backend error: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying to backend:', error);
    return NextResponse.json({ error: 'Error proxying to backend' }, { status: 500 });
  }
}
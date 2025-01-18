import { NextResponse } from 'next/server';

const RISK_FREE_RATE = 0.0366; // Current 10-year Treasury yield as of 2023-07-15

async function fetchBeta(ticker: string) {
  const response = await fetch(`https://api.newtonanalytics.com/stock-beta/?ticker=${ticker}&index=^GSPC&interval=1mo&observations=12`);
  const data = await response.json();
  return data.beta;
}

async function fetchMarketReturnRate() {
  const apiKey = 'd26079fc190512773ac705629a92f8ea';
  const currentYear = new Date().getFullYear();
  const lastYear = currentYear - 1;
  
  const response = await fetch(`https://api.stlouisfed.org/fred/series/observations?series_id=SP500&api_key=${apiKey}&file_type=json&observation_start=${lastYear}-01-01&observation_end=${lastYear}-12-31`);
  const data = await response.json();
  
  const firstDayValue = parseFloat(data.observations[0].value);
  const lastDayValue = parseFloat(data.observations[data.observations.length - 1].value);
  
  return (lastDayValue - firstDayValue) / firstDayValue;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get('ticker');
  const initialInvestment = parseFloat(searchParams.get('initialInvestment') || '0');
  const time = parseFloat(searchParams.get('time') || '0');

  if (!ticker || !initialInvestment || !time) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  try {
    const [beta, marketReturnRate] = await Promise.all([
      fetchBeta(ticker),
      fetchMarketReturnRate()
    ]);

    const rate = RISK_FREE_RATE + beta * (marketReturnRate - RISK_FREE_RATE);
    const futureValue = initialInvestment * Math.exp(rate * time);

    return NextResponse.json({
      futureValue: futureValue.toFixed(2),
      annualizedReturn: ((Math.pow(futureValue / initialInvestment, 1 / time) - 1) * 100).toFixed(2)
    });
  } catch (error) {
    console.error('Error calculating future value:', error);
    return NextResponse.json({ error: 'Error calculating future value' }, { status: 500 });
  }
}


import { NextResponse } from 'next/server';


// HOTNESS IS A RANKING SCORE FROM 1 (MOST TRENDING) TO 5 {OR HOWEVER MANY FUNDS THERE ARE} (5 MEANING LEAST TRENDING)
// the top 2 most popular ones will be marked trending
const BASE_FUNDS = [
  { ticker: 'VFIAX', name: 'Vanguard 500 Index Fund Admiral Shares' },
  { ticker: 'FXAIX', name: 'Fidelity 500 Index Fund' },
  { ticker: 'SWPPX', name: 'Schwab S&P 500 Index Fund' },
  { ticker: 'PRGFX', name: 'T. Rowe Price Growth Stock Fund' },
  { ticker: 'TRBCX', name: 'T. Rowe Price Blue Chip Growth Fund' },
];



// API CALL EXPECTS TO RECEIVE ALREADY CALCULATED HOTNESS RANKS SO BACKEND MUST COMPUTE RANKS
async function fetchHotnessScores(tickers: string[]) {
  const API_URL = "TBD";
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tickers }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch hotness scores');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching hotness scores:', error);
    return tickers.reduce((acc, ticker) => ({
      ...acc,
      [ticker]: 5, // worst case scenario: do not mark any funds as hot if it doesnt work
    }), {});
  }
}

export async function GET() {
  try {
    const tickers = BASE_FUNDS.map(fund => fund.ticker);
    const hotnessScores = await fetchHotnessScores(tickers);
    
    const mutualFundsWithHotness = BASE_FUNDS.map(fund => ({
      ...fund,
      hotness: hotnessScores[fund.ticker],
    }));
    
    return NextResponse.json(mutualFundsWithHotness);
  } catch (error) {
    console.error('Error in GET handler:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mutual funds data' },
      { status: 500 }
    );
  }
}


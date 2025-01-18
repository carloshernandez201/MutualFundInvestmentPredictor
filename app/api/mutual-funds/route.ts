import { NextResponse } from 'next/server';

const mutualFunds = [
  { ticker: 'VFIAX', name: 'Vanguard 500 Index Fund Admiral Shares' },
  { ticker: 'FXAIX', name: 'Fidelity 500 Index Fund' },
  { ticker: 'SWPPX', name: 'Schwab S&P 500 Index Fund' },
  { ticker: 'PRGFX', name: 'T. Rowe Price Growth Stock Fund' },
  { ticker: 'TRBCX', name: 'T. Rowe Price Blue Chip Growth Fund' },
];

export async function GET() {
  return NextResponse.json(mutualFunds);
}


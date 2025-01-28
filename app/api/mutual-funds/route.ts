import { NextResponse } from 'next/server';

const mutualFunds = [
  { ticker: 'VFIAX', name: 'Vanguard 500 Index Fund Admiral Shares', hotness : 1 },
  { ticker: 'FXAIX', name: 'Fidelity 500 Index Fund' ,hotness : 2},
  { ticker: 'SWPPX', name: 'Schwab S&P 500 Index Fund' ,hotness : 3},
  { ticker: 'PRGFX', name: 'T. Rowe Price Growth Stock Fund',hotness : 4 },
  { ticker: 'TRBCX', name: 'T. Rowe Price Blue Chip Growth Fund', hotness : 5 },
];

export async function GET() {
  return NextResponse.json(mutualFunds);
}


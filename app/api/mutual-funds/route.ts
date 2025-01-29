import { MongoClient } from 'mongodb';
import { NextResponse } from 'next/server';

const MONGO_URI = process.env.MONGO_URI || '';
const DB_NAME = 'mutualFundApp';
const COLLECTION_NAME = 'mutualFundQueries';

export async function GET() {
  try {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // fetch all mutual funds with their hotness from MongoDB
    const mutualFunds = await collection.find({}).toArray();

    const mutualFundsWithHotness = mutualFunds.map(fund => ({
      ticker: fund.mutualFundID,
      name: fund.mutualFundName,
      hotness: fund.hotness // directly use the hotness value from MongoDB
    }));

    await client.close();

    return NextResponse.json(mutualFundsWithHotness);
  } catch (error) {
    console.error('Error fetching mutual funds:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mutual funds data' },
      { status: 500 }
    );
  }
}
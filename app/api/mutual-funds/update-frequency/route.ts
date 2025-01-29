import { MongoClient } from 'mongodb';
import { NextResponse } from 'next/server';

const MONGO_URI = process.env.MONGO_URI || '';
const DB_NAME = 'mutualFundApp';
const COLLECTION_NAME = 'mutualFundQueries';

export async function POST(req: Request) {
  try {
    const { ticker } = await req.json();

    if (!ticker) {
      return NextResponse.json({ error: 'Ticker is required' }, { status: 400 });
    }

    console.log('Received ticker:', ticker);

    const client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    console.log('Updating hotness for mutualFundID:', ticker);

    // update the hotness value
    const updateResult = await collection.updateOne(
      { mutualFundID: ticker },
      { $inc: { hotness: 1 } }
    );

    console.log('Update result:', updateResult);

    if (updateResult.matchedCount === 0) {
      console.log(`No matching document found for ticker: ${ticker}`);
      return NextResponse.json({ error: 'Mutual fund not found' }, { status: 404 });
    }

    // fetch the updated document
    const updatedFund = await collection.findOne({ mutualFundID: ticker });

    await client.close();

    if (!updatedFund) {
      return NextResponse.json({ error: 'Mutual fund not found after update' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Hotness updated',
      hotness: updatedFund.hotness, // ensure we return the latest value
    });
  } catch (error) {
    console.error('Error updating hotness:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
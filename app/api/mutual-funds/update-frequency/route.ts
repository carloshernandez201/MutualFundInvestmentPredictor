import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const MONGO_URI = process.env.MONGO_URI || ''; // Store your MongoDB URI in .env
const DB_NAME = 'your_database_name'; // Replace with your actual database name
const COLLECTION_NAME = 'mutualFunds'; // Replace with your actual collection name

export async function POST(req: Request) {
  try {
    const { ticker } = await req.json();
    
    if (!ticker) {
      return NextResponse.json({ error: 'Ticker is required' }, { status: 400 });
    }

    const client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Update the frequency by incrementing it
    const result = await collection.findOneAndUpdate(
      { mutualFundID: ticker },
      { $inc: { frequency: 1 } },
      { returnDocument: 'after' }
    );

    await client.close();

    if (!result) {
      return NextResponse.json({ error: 'Mutual fund not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Frequency updated', frequency: result.frequency });

  } catch (error) {
    console.error('Error updating frequency:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
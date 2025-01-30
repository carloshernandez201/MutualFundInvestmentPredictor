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

        // Fetch all mutual funds from MongoDB
        const mutualFunds = await collection.find({}).toArray();
        await client.close();

        if (mutualFunds.length > 0) {
            // If MongoDB has data, return it
            const mutualFundsWithHotness = mutualFunds.map(fund => ({
                ticker: fund.mutualFundID,
                name: fund.mutualFundName,
                hotness: fund.hotness // Use the hotness value from MongoDB
            }));

            return NextResponse.json(mutualFundsWithHotness);
        } else {
            console.log("No data in MongoDB, falling back to backend API...");
        }
    } catch (error) {
        console.error('Error fetching mutual funds from MongoDB:', error);
    }

    // If MongoDB has no data or fails, fetch from Spring Boot Backend
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

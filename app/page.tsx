import MutualFundCalculator from '../components/MutualFundCalculator';
import MarketOverview from '../components/MarketOverview';
import Header from '../components/Header';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-semibold text-gray-800 mb-8">Investment Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <MutualFundCalculator />
          </div>
          <div>
            <MarketOverview />
          </div>
        </div>
      </main>
    </div>
  );
}


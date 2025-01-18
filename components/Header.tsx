import Link from 'next/link';
import { Button } from "@/components/ui/button"

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-semibold text-gray-800">
              FinanceCalc
            </Link>
            <nav className="hidden md:block ml-10">
              <ul className="flex space-x-4">
                <li><Link href="#" className="text-gray-600 hover:text-gray-800">Investments</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-gray-800">Market Analysis</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-gray-800">Resources</Link></li>
              </ul>
            </nav>
          </div>
          <div>
            <Button variant="outline" className="mr-2">Log In</Button>
            <Button>Sign Up</Button>
          </div>
        </div>
      </div>
    </header>
  );
}


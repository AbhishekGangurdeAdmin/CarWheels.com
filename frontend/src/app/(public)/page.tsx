'use client';

import Link from 'next/link';
import { FiTrendingUp, FiZap, FiDollarSign, FiAward } from 'react-icons/fi';

export default function HomePage() {
  const budgetCategories = [
    { range: 'Under ₹5 Lakh', minPrice: 0, maxPrice: 500000 },
    { range: '₹5L - ₹10L', minPrice: 500000, maxPrice: 1000000 },
    { range: '₹10L - ₹20L', minPrice: 1000000, maxPrice: 2000000 },
    { range: '₹20L+', minPrice: 2000000, maxPrice: 10000000 },
  ];

  const categories = [
    { name: 'SUV', icon: '🚙', count: '450+ Models' },
    { name: 'Sedan', icon: '🚗', count: '320+ Models' },
    { name: 'Hatchback', icon: '🚕', count: '280+ Models' },
    { name: 'MPV', icon: '🚐', count: '120+ Models' },
    { name: 'Cruiser', icon: '🏍️', count: '200+ Models' },
    { name: 'Sports Bike', icon: '🏎️', count: '180+ Models' },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="min-h-screen bg-gradient-to-r from-red-600 to-slate-900 flex items-center">
        <div className="max-w-7xl mx-auto px-4 w-full">
          <div className="text-center md:text-left">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">Find Your Perfect Ride</h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-2xl">
              Discover, compare, and decide with confidence. CarWheels is your trusted platform for automotive exploration.
            </p>

            <div className="flex flex-col md:flex-row gap-4">
              <Link href="/explore" className="btn-primary text-lg px-8">
                Start Exploring
              </Link>
              <button className="btn-secondary text-lg px-8">Watch Demo</button>
            </div>

            {/* Hero Stats */}
            <div className="grid grid-cols-3 gap-4 mt-12 max-w-2xl">
              <div>
                <div className="text-3xl font-bold text-yellow-400">2000+</div>
                <div className="text-slate-300">Vehicles</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-yellow-400">15+</div>
                <div className="text-slate-300">Brands</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-yellow-400">50K+</div>
                <div className="text-slate-300">Reviews</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Smart Search Section */}
      <section className="py-20 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">Smart Search</h2>
          <p className="text-slate-400 text-center mb-12 max-w-2xl mx-auto">
            Find vehicles by budget, category, or features. Get instant comparisons and expert insights.
          </p>

          <div className="bg-slate-800 rounded-lg p-8 mb-12">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="Search brand or model..."
                className="flex-1 bg-slate-700 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
              />
              <button className="btn-primary px-8">Search</button>
            </div>
          </div>

          {/* Budget Categories */}
          <div>
            <h3 className="text-2xl font-bold mb-6">Explore by Budget</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {budgetCategories.map((cat) => (
                <Link
                  key={cat.range}
                  href={`/explore?minPrice=${cat.minPrice}&maxPrice=${cat.maxPrice}`}
                  className="bg-slate-800 p-6 rounded-lg hover:bg-red-600 transition text-center"
                >
                  <FiDollarSign className="mx-auto mb-2 text-2xl" />
                  <div className="font-bold">{cat.range}</div>
                  <div className="text-sm text-slate-400">Popular Choice</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">Explore by Category</h2>
          <p className="text-slate-400 text-center mb-12">Browse through our extensive collection</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={`/explore?category=${cat.name}`}
                className="bg-slate-800 p-8 rounded-lg hover:shadow-2xl hover:shadow-red-600/50 transition text-center"
              >
                <div className="text-5xl mb-4">{cat.icon}</div>
                <h3 className="text-2xl font-bold mb-2">{cat.name}</h3>
                <p className="text-slate-400">{cat.count}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">Why Choose CarWheels?</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                icon: <FiTrendingUp className="text-4xl" />,
                title: 'Latest Updates',
                desc: 'Get real-time vehicle data and market trends',
              },
              {
                icon: <FiZap className="text-4xl" />,
                title: 'Fast Comparison',
                desc: 'Compare specs side-by-side instantly',
              },
              {
                icon: <FiAward className="text-4xl" />,
                title: 'Expert Reviews',
                desc: 'In-depth analysis from automotive experts',
              },
              {
                icon: <FiDollarSign className="text-4xl" />,
                title: 'Price Tracking',
                desc: 'Know the fair market value instantly',
              },
            ].map((feature, i) => (
              <div key={i} className="text-center">
                <div className="text-red-600 mb-4 flex justify-center">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-slate-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-red-600 to-red-700">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Find Your Perfect Vehicle?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of customers who trust CarWheels for their automotive decisions.
          </p>
          <Link href="/explore" className="btn-primary text-lg px-8 inline-block">
            Start Exploring Now
          </Link>
        </div>
      </section>
    </div>
  );
}

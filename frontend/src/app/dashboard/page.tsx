'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-slate-800 rounded-lg p-6">
          <p className="text-slate-400 mb-2">Welcome</p>
          <h2 className="text-2xl font-bold">{user.full_name}</h2>
        </div>
        <div className="bg-slate-800 rounded-lg p-6">
          <p className="text-slate-400 mb-2">Email</p>
          <p className="text-lg">{user.email}</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-6">
          <p className="text-slate-400 mb-2">Member Since</p>
          <p className="text-lg">2026</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Recent Wishlist Items</h3>
          <p className="text-slate-400">No vehicles in your wishlist yet.</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Recent Comparisons</h3>
          <p className="text-slate-400">No comparisons created yet.</p>
        </div>
      </div>
    </div>
  );
}

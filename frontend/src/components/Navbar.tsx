'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { FiMenu, FiX, FiSearch, FiHeart, FiUser } from 'react-icons/fi';
import { useAuthStore } from '@/store';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuthStore();

  return (
    <nav className="sticky top-0 z-50 bg-slate-900 border-b border-red-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-3xl font-bold gradient-text">CarWheels</div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/explore" className="hover:text-red-600 transition">
              Explore
            </Link>
            <Link href="/comparisons" className="hover:text-red-600 transition">
              Compare
            </Link>
            <Link href="/reviews" className="hover:text-red-600 transition">
              Reviews
            </Link>
            <Link href="/dealers" className="hover:text-red-600 transition">
              Dealers
            </Link>
          </div>

          {/* Right Icons */}
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-slate-800 rounded-lg transition">
              <FiSearch size={20} />
            </button>
            <Link href="/wishlist" className="p-2 hover:bg-slate-800 rounded-lg transition">
              <FiHeart size={20} />
            </Link>

            {user ? (
              <div className="flex items-center space-x-2">
                <Link href="/dashboard" className="p-2 hover:bg-slate-800 rounded-lg transition">
                  <FiUser size={20} />
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="btn-primary text-sm py-2 px-4"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link href="/login" className="btn-primary py-2 px-4 text-sm">
                Login
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link href="/explore" className="block px-4 py-2 hover:bg-slate-800 rounded-lg">
              Explore
            </Link>
            <Link href="/comparisons" className="block px-4 py-2 hover:bg-slate-800 rounded-lg">
              Compare
            </Link>
            <Link href="/reviews" className="block px-4 py-2 hover:bg-slate-800 rounded-lg">
              Reviews
            </Link>
            <Link href="/dealers" className="block px-4 py-2 hover:bg-slate-800 rounded-lg">
              Dealers
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

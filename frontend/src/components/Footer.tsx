'use client';

import Link from 'next/link';
import { FiPhone, FiMail, FiMapPin, FiFacebook, FiTwitter, FiLinkedin } from 'react-icons/fi';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 border-t border-red-600 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold gradient-text mb-4">CarWheels</h3>
            <p className="text-slate-400 mb-4">Your trusted platform for automotive discovery and comparison.</p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-red-600 transition">
                <FiFacebook />
              </a>
              <a href="#" className="hover:text-red-600 transition">
                <FiTwitter />
              </a>
              <a href="#" className="hover:text-red-600 transition">
                <FiLinkedin />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link href="/" className="hover:text-red-600 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/explore" className="hover:text-red-600 transition">
                  Explore Cars
                </Link>
              </li>
              <li>
                <Link href="/comparisons" className="hover:text-red-600 transition">
                  Compare
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-red-600 transition">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link href="/guides" className="hover:text-red-600 transition">
                  Buying Guide
                </Link>
              </li>
              <li>
                <Link href="/reviews" className="hover:text-red-600 transition">
                  Reviews
                </Link>
              </li>
              <li>
                <Link href="/dealers" className="hover:text-red-600 transition">
                  Find Dealers
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-red-600 transition">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <div className="space-y-3 text-slate-400">
              <div className="flex items-center space-x-2">
                <FiPhone />
                <span>1-800-CARWHEELS</span>
              </div>
              <div className="flex items-center space-x-2">
                <FiMail />
                <span>support@carwheels.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <FiMapPin />
                <span>India</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-slate-400 text-sm">
            <p>&copy; 2026 CarWheels.com. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="hover:text-red-600 transition">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-red-600 transition">
                Terms of Service
              </Link>
              <Link href="/contact" className="hover:text-red-600 transition">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

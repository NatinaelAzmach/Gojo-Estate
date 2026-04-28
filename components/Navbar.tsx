'use client';

import Link from 'next/link';
import { useState } from 'react';
import { signOut } from '@/actions/auth';

interface NavbarProps {
  session: { user: { email?: string; user_metadata?: { full_name?: string } } } | null;
  fullName?: string | null;
}

const navLinks = [
  { label: 'Listings', href: '/listings' },
  { label: 'Post Property', href: '/post-property' },
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
];

export default function Navbar({ session, fullName }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const displayName = fullName || session?.user?.email || 'User';
  const avatarInitial = displayName[0]?.toUpperCase() ?? '?';

  return (
    <nav className="sticky top-0 z-50 bg-navy-brand shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="GOJO logo" className="w-10 h-10 rounded-lg object-contain" />
            <span className="text-teal-brand">GOJO</span>
          </Link>

          {/* Center nav links — desktop */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-300 hover:text-teal-brand transition-colors text-sm font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side — desktop */}
          <div className="hidden md:flex items-center gap-4">
            {session === null ? (
              <Link
                href="/login"
                className="text-sm font-medium text-white bg-teal-brand hover:bg-teal-700 px-4 py-2 rounded-md transition-colors"
              >
                Sign In
              </Link>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen((o) => !o)}
                  className="flex items-center gap-2 text-gray-300 hover:text-white focus:outline-none"
                >
                  <span className="w-8 h-8 rounded-full bg-teal-brand text-white flex items-center justify-center text-sm font-semibold">
                    {avatarInitial}
                  </span>
                  <span className="text-sm">{displayName}</span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      My Profile
                    </Link>
                    <Link href="/my-properties" onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      My Properties
                    </Link>
                    <form action={signOut}>
                      <button
                        type="submit"
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        Sign Out
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Hamburger — mobile */}
          <button
            className="md:hidden text-gray-300 hover:text-white focus:outline-none"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-navy-brand border-t border-gray-700 px-4 pb-4 pt-2 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block text-gray-300 hover:text-teal-brand py-2 text-sm font-medium"
            >
              {link.label}
            </Link>
          ))}

          {session === null ? (
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="block text-sm font-medium text-white bg-teal-brand hover:bg-teal-700 px-4 py-2 rounded-md text-center"
            >
              Sign In
            </Link>
          ) : (
            <>
              <p className="text-gray-400 text-xs pt-2">{displayName}</p>
              <Link
                href="/profile"
                onClick={() => setMenuOpen(false)}
                className="block text-gray-300 hover:text-teal-brand py-2 text-sm"
              >
                My Profile
              </Link>
              <Link href="/my-properties" onClick={() => setMenuOpen(false)}
                className="block text-gray-300 hover:text-teal-brand py-2 text-sm">
                My Properties
              </Link>
              <form action={signOut}>
                <button type="submit" className="text-red-400 hover:text-red-300 py-2 text-sm">
                  Sign Out
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { FileText, PlusCircle, LogOut, ShieldCheck, User as UserIcon } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; username: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Not logged in');
      })
      .then((data) => {
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  if (pathname === '/login') return null;

  return (
    <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <Link href="/challans" className="flex items-center space-x-2">
              <img
                src="/asi-logo.png"
                alt="ASI Logo"
                className="w-10 h-10 object-contain rounded shadow-sm"
              />
              <div className="flex flex-col">
                <span className="font-bold text-slate-900 text-base leading-tight">
                  Apparel Sourcing International Inc
                </span>
                <span className="text-xs text-slate-500">Challan Management System</span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-4">
            <Link
              href="/challans"
              className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                pathname === '/challans'
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center space-x-1.5">
                <FileText className="w-4 h-4" />
                <span>All Challans</span>
              </div>
            </Link>

            {user && (
              <Link
                href="/challans/new"
                className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                  pathname === '/challans/new'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                <div className="flex items-center space-x-1.5">
                  <PlusCircle className="w-4 h-4" />
                  <span>+ New Challan</span>
                </div>
              </Link>
            )}

            {/* User Profile & Badge */}
            {user ? (
              <div className="flex items-center pl-4 border-l border-slate-200 space-x-3">
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-800 leading-none">{user.name}</span>
                    <div className="flex items-center mt-0.5">
                      {user.role === 'ADMIN' ? (
                        <span className="inline-flex items-center text-[10px] bg-amber-100 text-amber-800 font-semibold px-1.5 py-0.2 rounded">
                          <ShieldCheck className="w-2.5 h-2.5 mr-0.5" />
                          ADMIN
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[10px] bg-slate-100 text-slate-600 font-medium px-1.5 py-0.2 rounded">
                          VIEW ONLY
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  title="Log out"
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              !loading && (
                <Link
                  href="/login"
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  Sign In
                </Link>
              )
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

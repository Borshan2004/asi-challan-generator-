'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FileText,
  PlusCircle,
  Search,
  Printer,
  FileSpreadsheet,
  Edit,
  Trash2,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import { formatChallanDate } from '@/lib/challan-utils';

interface ChallanListItem {
  id: string;
  challanNo: string;
  name: string;
  address: string;
  refNo?: string | null;
  fromName: string;
  isReturnable: boolean;
  date: string;
  totalQty: number;
  totalYdsKg: number;
  items: {
    particular: string;
    qty?: number | null;
  }[];
  createdBy: {
    name: string;
  };
}

export default function ChallansListPage() {
  const router = useRouter();
  const [challans, setChallans] = useState<ChallanListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentUser, setCurrentUser] = useState<{ role: string; name: string } | null>(null);

  useEffect(() => {
    // Check auth
    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) throw new Error('Not logged in');
        return res.json();
      })
      .then((data) => {
        setCurrentUser(data.user);
      })
      .catch(() => {
        router.push('/login');
      });

    loadChallans();
  }, [router]);

  const loadChallans = (searchQuery = '') => {
    setLoading(true);
    const query = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : '';
    fetch(`/api/challans${query}`)
      .then((res) => res.json())
      .then((data) => {
        setChallans(data.challans || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadChallans(search);
  };

  const handleDelete = async (id: string, challanNo: string) => {
    if (!confirm(`Are you sure you want to permanently delete Challan ${challanNo}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/challans/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      loadChallans(search);
    } catch (err: any) {
      alert(err.message || 'Error deleting challan');
    }
  };

  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center">
            <FileText className="w-6 h-6 mr-2 text-blue-600" />
            Challan Registry
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Apparel Sourcing International Inc • Banani DOHS, Dhaka-1206
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {currentUser ? (
            <Link
              href="/challans/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
            >
              <PlusCircle className="w-4 h-4 mr-1.5" />
              Generate New Challan
            </Link>
          ) : null}
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="my-6 bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full max-w-md relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Challan No, Customer, Address, Ref..."
            className="w-full pl-9 pr-20 py-2 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded transition"
          >
            Search
          </button>
        </form>

        <div className="flex items-center text-xs text-slate-500 space-x-4">
          <span>
            Total Challans: <strong className="text-slate-800">{challans.length}</strong>
          </span>
        </div>
      </div>

      {/* Challan Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs">
                <th className="py-3 px-3">Challan No</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Customer / Recipient</th>
                <th className="py-3 px-3">Address</th>
                <th className="py-3 px-3">Particulars Summary</th>
                <th className="py-3 px-2 text-center">Qty</th>
                <th className="py-3 px-2 text-center">YDS/KG</th>
                <th className="py-3 px-2 text-center">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    Loading Challans...
                  </td>
                </tr>
              ) : challans.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Layers className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    No Challans found. {isAdmin && 'Click "+ Generate New Challan" to create one.'}
                  </td>
                </tr>
              ) : (
                challans.map((ch) => (
                  <tr key={ch.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-3 font-bold text-slate-900 whitespace-nowrap">
                      <Link
                        href={`/challans/${ch.id}`}
                        className="text-blue-600 hover:underline flex items-center"
                      >
                        {ch.challanNo}
                      </Link>
                    </td>
                    <td className="py-3 px-3 text-slate-600 whitespace-nowrap text-xs">
                      {formatChallanDate(ch.date)}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800">
                      {ch.name}
                    </td>
                    <td className="py-3 px-3 text-slate-600 max-w-[150px] truncate">
                      {ch.address}
                    </td>
                    <td className="py-3 px-3 text-slate-600 max-w-[200px] truncate text-xs">
                      {ch.items.map((i) => i.particular).filter(Boolean).join(', ') || '-'}
                    </td>
                    <td className="py-3 px-2 text-center font-semibold text-slate-900 whitespace-nowrap">
                      {ch.totalQty} pcs
                    </td>
                    <td className="py-3 px-2 text-center font-semibold text-slate-700 whitespace-nowrap">
                      {ch.totalYdsKg} yds
                    </td>
                    <td className="py-3 px-2 text-center whitespace-nowrap">
                      {ch.isReturnable ? (
                        <span className="inline-flex text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded">
                          Returnable
                        </span>
                      ) : (
                        <span className="inline-flex text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded">
                          Not Returnable
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap space-x-1.5">
                      {/* View / Print Preview */}
                      <Link
                        href={`/challans/${ch.id}`}
                        title="View & Print Challan"
                        className="inline-flex items-center px-2 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition"
                      >
                        <Printer className="w-3.5 h-3.5 mr-1" />
                        View
                      </Link>

                      {/* Download Excel */}
                      <a
                        href={`/api/challans/${ch.id}/excel`}
                        title="Download Excel"
                        className="inline-flex items-center px-2 py-1 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                      </a>

                      {/* Edit - available to all logged-in users */}
                      {currentUser && (
                        <Link
                          href={`/challans/${ch.id}/edit`}
                          title="Edit Challan"
                          className="inline-flex items-center px-2 py-1 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 rounded border border-amber-200 transition"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Link>
                      )}

                      {/* Delete - Admin only */}
                      {isAdmin && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleDelete(ch.id, ch.challanNo)}
                            title="Delete Challan"
                            className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded border border-red-200 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

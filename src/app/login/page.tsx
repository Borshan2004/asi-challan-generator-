"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  UserCheck,
  Lock,
  User as UserIcon,
  ArrowRight,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showAdminPopup, setShowAdminPopup] = useState(false);

  const handleLogin = async (u: string, p: string) => {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: u, password: p }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      router.push("/challans");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Login failed");
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin(username, password);
  };

  return (

    <div>
       {showAdminPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowAdminPopup(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-xl bg-white p-6 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowAdminPopup(false)}
              className="absolute right-3 top-3 text-xl text-slate-400 hover:text-slate-700"
              aria-label="Close popup"
            >
              &times;
            </button>

            <ShieldCheck className="mx-auto mb-3 h-10 w-10 text-amber-600" />

            <h2 className="text-lg font-bold text-slate-900">
              Admin Access Required
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Please enter your Admin ID and password to access the admin panel.
            </p>

            <button
              type="button"
              onClick={() => setShowAdminPopup(false)}
              className="mt-5 w-full rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700"
            >
              Got it
            </button>
          </div>
        </div>
      )}



    
    
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <img
          src="/asi-logo.png"
          alt="ASI Logo"
          className="w-20 h-16 object-contain mx-auto mb-3"
        />
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Apparel Sourcing International Inc
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Challan PDF & Excel Generator Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl rounded-xl border border-slate-200 sm:px-10">
          {error && (
            <div className="mb-5 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin or user"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </button>
          </form>

          {/* Quick Demo Logins for Testing Roles */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-xs text-center font-medium text-slate-500 mb-3">
              Fast Role Testing (Click to login directly):
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShowAdminPopup(true)}
                className="flex items-center justify-center p-2.5 rounded-lg border border-amber-200 bg-amber-50/70 hover:bg-amber-100 transition text-left"
              >
                <ShieldCheck className="w-4 h-4 text-amber-700 mr-2 flex-shrink-0" />
                <div>
                  <div className="text-xs font-bold text-amber-900">
                    Admin Mode
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleLogin("user", "user123")}
                className="flex items-center justify-center p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition text-left"
              >
                <UserCheck className="w-4 h-4 text-slate-700 mr-2 flex-shrink-0" />
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    User Mode
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    </div>
  );
}

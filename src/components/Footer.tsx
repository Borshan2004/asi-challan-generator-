'use client';

import React from 'react';
import { ExternalLink, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="no-print bg-white border-t border-slate-200 py-4 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center space-x-1">
          <span>&copy; {new Date().getFullYear()} Apparel Sourcing International Inc. All rights reserved.</span>
        </div>

        <div className="flex items-center space-x-1.5">
          <span>Developed by</span>
          <a
            href="https://bprnd.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center font-bold text-blue-600 hover:text-blue-800 hover:underline px-2 py-0.5 rounded bg-blue-50 hover:bg-blue-100 transition border border-blue-200"
            title="Visit BP R&D Website"
          >
            <span>BP R&D</span>
            <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        </div>
      </div>
    </footer>
  );
}

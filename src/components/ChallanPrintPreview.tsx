'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Printer,
  Download,
  FileSpreadsheet,
  Edit,
  Trash2,
  ArrowLeft,
  Scissors,
} from 'lucide-react';
import { formatChallanDate } from '@/lib/challan-utils';

interface ChallanPrintPreviewProps {
  challan: {
    id: string;
    challanNo: string;
    name: string;
    address: string;
    refNo?: string | null;
    fromName: string;
    isReturnable: boolean;
    senderSign: string;
    receiverName?: string | null;
    date: Date | string;
    totalQty: number;
    totalYdsKg: number;
    notes?: string | null;
    items: {
      slNo: number;
      particular: string;
      qty?: number | null;
      unit?: string | null;
      ydsKg?: number | null;
      ydsUnit?: string | null;
    }[];
  };
  currentUserRole?: string;
}

export default function ChallanPrintPreview({
  challan,
  currentUserRole,
}: ChallanPrintPreviewProps) {
  const router = useRouter();
  const printAreaRef = useRef<HTMLDivElement>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const formattedDate = formatChallanDate(challan.date);

  // Show only the exact items created (no extra padded rows)
  const displayItems = challan.items;

  // Handle native browser print
  const handlePrint = () => {
    window.print();
  };

  // Direct PDF download using jspdf + html2canvas
  const handleDownloadPdf = async () => {
    if (!printAreaRef.current) return;
    try {
      setDownloadingPdf(true);
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const element = printAreaRef.current;
      const canvas = await html2canvas(element, {
        scale: 2, // high DPI
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, Math.min(pdfHeight, 287));
      pdf.save(`CHALLAN-${challan.challanNo}.pdf`);
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('Could not generate PDF directly. Please use "Print / Save as PDF".');
    } finally {
      setDownloadingPdf(false);
    }
  };

  // Direct Excel download
  const handleDownloadExcel = () => {
    window.open(`/api/challans/${challan.id}/excel`, '_blank');
  };

  // Delete Challan
  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to permanently delete Challan ${challan.challanNo}?`)) {
      return;
    }

    try {
      setDeleting(true);
      const res = await fetch(`/api/challans/${challan.id}`, { method: 'DELETE' });
      if (!res.ok) {
        throw new Error('Failed to delete challan');
      }
      router.push('/challans');
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Error deleting challan');
      setDeleting(false);
    }
  };

  // Reusable Single Slip Component with pure white backgrounds and crisp borders
  const renderSlip = (copyLabel?: string) => (
    <div className="challan-slip bg-white p-4 sm:p-5 border border-black rounded-none shadow-none text-black select-none text-[11px] leading-normal">
      {/* 1. Header with Logo & Address */}
      <div className="flex items-start justify-between pb-2 border-b border-black bg-white">
        {/* ASI Logo Icon */}
        <div className="flex items-center space-x-3">
          <img
            src="/asi-logo.png"
            alt="ASI Logo"
            className="w-12 h-11 object-contain flex-shrink-0"
          />
          <div className="flex flex-col">
            <h2 className="text-[16px] font-bold text-black tracking-tight leading-tight">
              Apparel Sourcing International Inc
            </h2>
            <p className="text-[9.5px] text-black leading-tight mt-0.5">
              Anukul, House# 30, Apt# B-3, (3rd Floor) Western Road,
            </p>
            <p className="text-[9.5px] text-black leading-tight">
              Banani DOHS, Dhaka-1206, Bangladesh. Ph: 880-2-8715826, 8715827, 8715779
            </p>
          </div>
        </div>

        {/* Challan Title & Number (Clean text, NO gray background) */}
        <div className="text-right flex-shrink-0">
          <div className="text-[17px] font-extrabold tracking-wider underline">
            CHALLAN
          </div>
          <div className="mt-1 flex items-center justify-end text-[11.5px]">
            <span className="font-bold mr-1.5 text-black">Challan No:</span>
            <span className="font-extrabold text-[12.5px] text-black">
              {challan.challanNo}
            </span>
          </div>
          {copyLabel && (
            <div className="mt-0.5 text-[9px] uppercase tracking-wider text-black font-semibold">
              {copyLabel}
            </div>
          )}
        </div>
      </div>

      {/* 2. Top Info Box (Name, Address, Date, Ref. No) - Pure White */}
      <div className="border border-black my-2 grid grid-cols-12 text-[10.5px] bg-white">
        {/* Left Column (Name & Address) */}
        <div className="col-span-8 p-1.5 border-r border-black space-y-0.5 bg-white">
          <div className="flex">
            <span className="w-18 font-bold text-black shrink-0">Name :</span>
            <span className="font-semibold text-black">{challan.name}</span>
          </div>
          <div className="flex">
            <span className="w-18 font-bold text-black shrink-0">Address :</span>
            <span className="text-black">{challan.address}</span>
          </div>
        </div>

        {/* Right Column (Date & Ref No) */}
        <div className="col-span-4 p-1.5 space-y-0.5 bg-white">
          <div className="flex">
            <span className="w-18 font-bold text-black shrink-0">Date :</span>
            <span className="font-semibold text-black">{formattedDate}</span>
          </div>
          <div className="flex">
            <span className="w-18 font-bold text-black shrink-0">Ref. No. :</span>
            <span className="text-black">{challan.refNo || '-'}</span>
          </div>
        </div>
      </div>

      {/* 3. Items Table - Pure HTML Table on White Background */}
      <div className="my-2">
        <table className="w-full text-left text-[10.5px] border-collapse border border-black bg-white">
          <thead>
            <tr className="border-b border-black text-center font-bold bg-white">
              <th className="w-12 py-1 border-r border-black text-center font-bold text-black">Sl.No</th>
              <th className="py-1 px-3 border-r border-black text-left font-bold text-black">Particulars</th>
              <th className="w-24 py-1 border-r border-black text-center font-bold text-black">Qty.</th>
              <th className="w-28 py-1 text-center font-bold text-black">YDS/KG</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {displayItems.map((item, idx) => (
              <tr key={idx} className="border-b border-black/40 border-dotted text-center bg-white">
                <td className="border-r border-black py-1 px-2 font-medium text-black">{idx + 1}</td>
                <td className="border-r border-black py-1 px-3 text-left font-normal truncate max-w-[260px] text-black">
                  {item.particular || ''}
                </td>
                <td className="border-r border-black py-1 px-2 font-medium text-black">
                  {item.qty ? `${item.qty} ${item.unit || 'Pcs'}` : ''}
                </td>
                <td className="py-1 px-2 font-medium text-black">
                  {item.ydsKg ? `${item.ydsKg} ${item.ydsUnit || 'yds'}` : ''}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-white">
            <tr className="border-t-2 border-black bg-white font-bold text-[10.5px]">
              <td colSpan={2} className="border-r border-black py-1.5 px-3 bg-white text-black">
                <div className="flex justify-between items-center">
                  <span>From: {challan.fromName || 'Ms.Shamoly'}</span>
                  <span className="italic">{challan.isReturnable ? '(Returnable)' : '(Not Returnable)'}</span>
                </div>
              </td>
              <td className="border-r border-black py-1.5 px-2 text-center whitespace-nowrap bg-white text-black">
                Total- {challan.totalQty} pcs
              </td>
              <td className="py-1.5 px-2 text-center whitespace-nowrap bg-white text-black">
                {challan.totalYdsKg} yds
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* 4. Notes & Signatures */}
      <div className="mt-1.5 text-[9.5px] text-black">
        <p className="italic">{challan.notes || '1) Receive the above goods in good condition.'}</p>
      </div>

      <div className="mt-6 flex justify-between items-end text-[10.5px] pt-1 bg-white">
        {/* Receiver Signature Line with optional input name beside signature */}
        <div className="w-64 text-left">
          <div className="h-5"></div>
          <div className="border-t border-black pt-1 text-[10.5px] font-semibold text-black flex items-baseline flex-wrap">
            <span>Receiver&apos;s Signature / Phn:</span>
            {challan.receiverName && (
              <span className="font-bold text-black ml-1.5">
                {challan.receiverName}
              </span>
            )}
          </div>
        </div>

        {/* Sender / Company Signature Line */}
        <div className="w-60 text-center">
          <div className="text-[10.5px] font-bold text-black pb-1">
            {challan.senderSign || 'Srabon (01774-109199)'}
          </div>
          <div className="border-t border-black pt-1 font-bold text-black text-[10.5px]">
            For-Apparel Sourcing int&apos;l inc
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Action Toolbar (Hidden in Print) */}
      <div className="no-print mb-6 bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.push('/challans')}
            className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to List
          </button>
          <span className="text-slate-300">|</span>
          <span className="text-sm font-bold text-slate-800">
            Challan: {challan.challanNo}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Print A4 1-Page (2-in-1 Dual Copy) */}
          <button
            onClick={handlePrint}
            className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 transition"
          >
            <Printer className="w-3.5 h-3.5 mr-1 text-slate-700" />
            Print (1 Page A4)
          </button>

          {/* Download PDF button */}
          <button
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-sm transition disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 mr-1" />
            {downloadingPdf ? 'Exporting PDF...' : 'Download PDF'}
          </button>

          {/* Download Excel button */}
          <button
            onClick={handleDownloadExcel}
            className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-300 transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            Download Excel
          </button>

          {/* Edit - available to all users */}
          {currentUserRole && (
            <>
              <span className="text-slate-300">|</span>
              <Link
                href={`/challans/${challan.id}/edit`}
                className="inline-flex items-center px-2.5 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded border border-amber-300 transition"
              >
                <Edit className="w-3.5 h-3.5 mr-1" />
                Edit
              </Link>
            </>
          )}

          {/* Delete - Admin only */}
          {currentUserRole === 'ADMIN' && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center px-2.5 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded border border-red-300 transition"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          )}
        </div>
      </div>

      {/* The Printable Page Container: Fits exactly on ONE single A4 Sheet */}
      <div
        ref={printAreaRef}
        className="print-page bg-white p-3 sm:p-5 rounded-lg border border-slate-200 shadow-sm space-y-3"
      >
        {/* Slip 1: Top Copy */}
        {renderSlip('Office Copy')}

        {/* Perforated Cutting Line with Scissor Icon */}
        <div className="flex items-center my-2.5 relative select-none">
          <div className="flex-grow border-t-2 border-dashed border-black"></div>
          <div className="px-3 flex items-center text-[9.5px] text-black font-semibold bg-white">
            <Scissors className="w-3 h-3 mr-1 text-black" />
            <span>Cut Here • Same to Same Dual Copy</span>
          </div>
          <div className="flex-grow border-t-2 border-dashed border-black"></div>
        </div>

        {/* Slip 2: Bottom Copy ("same to same") */}
        {renderSlip('Customer Copy')}
      </div>
    </div>
  );
}

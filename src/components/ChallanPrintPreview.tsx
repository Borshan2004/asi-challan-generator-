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

  // Normalize items to exactly 8 rows
  const displayItems = [...challan.items];
  while (displayItems.length < 8) {
    displayItems.push({
      slNo: displayItems.length + 1,
      particular: '',
      qty: null,
      unit: '',
      ydsKg: null,
      ydsUnit: '',
    });
  }

  // Handle native browser print (which uses @page A4 for perfect 2-slip rendering)
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

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, Math.min(pdfHeight, 297));
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

  // Reusable Single Slip Component
  const renderSlip = (copyLabel?: string) => (
    <div className="challan-slip bg-white p-6 border border-slate-300 rounded shadow-none text-black select-none text-[12px] leading-tight">
      {/* 1. Header with Logo & Address */}
      <div className="flex items-start justify-between pb-2">
        {/* ASI Logo Icon */}
        <div className="flex items-center space-x-3">
          <div className="w-14 h-12 bg-slate-900 text-white font-extrabold flex items-center justify-center text-xl tracking-tighter rounded-sm">
            ASI
          </div>
          <div className="flex flex-col">
            <h2 className="text-[17px] font-bold text-black tracking-tight leading-tight">
              Apparel Sourcing International Inc
            </h2>
            <p className="text-[10px] text-slate-800 leading-tight">
              Anukul, House# 30, Apt# B-3, (3rd Floor) Western Road,
            </p>
            <p className="text-[10px] text-slate-800 leading-tight">
              Banani DOHS, Dhaka-1206, Bangladesh. Ph: 880-2-8715826, 8715827, 8715779
            </p>
          </div>
        </div>

        {/* Challan Title & Number */}
        <div className="text-right">
          <div className="text-[18px] font-extrabold tracking-wider underline mr-6">
            CHALLAN
          </div>
          <div className="mt-1 flex items-center justify-end text-[12px]">
            <span className="font-bold mr-1.5">Challan No:</span>
            <span className="font-extrabold text-[13px] bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
              {challan.challanNo}
            </span>
          </div>
          {copyLabel && (
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">
              {copyLabel}
            </span>
          )}
        </div>
      </div>

      {/* 2. Top Info Box (Name, Address, Date, Ref. No) */}
      <div className="border border-black mt-2 grid grid-cols-12 text-[11px]">
        {/* Left Column (Name & Address) */}
        <div className="col-span-8 p-1.5 border-r border-black space-y-1">
          <div className="flex">
            <span className="w-20 font-bold">Name :</span>
            <span className="font-semibold">{challan.name}</span>
          </div>
          <div className="flex">
            <span className="w-20 font-bold">Address :</span>
            <span>{challan.address}</span>
          </div>
        </div>

        {/* Right Column (Date & Ref No) */}
        <div className="col-span-4 p-1.5 space-y-1">
          <div className="flex">
            <span className="w-18 font-bold">Date :</span>
            <span className="font-semibold">{formattedDate}</span>
          </div>
          <div className="flex">
            <span className="w-18 font-bold">Ref. No. :</span>
            <span>{challan.refNo || '-'}</span>
          </div>
        </div>
      </div>

      {/* 3. Items Table */}
      <div className="border-x border-b border-black">
        <table className="w-full text-left text-[11px] border-collapse">
          <thead>
            <tr className="border-b border-black text-center font-bold bg-slate-50">
              <th className="w-12 py-1 border-r border-black">Sl.No</th>
              <th className="py-1 px-3 border-r border-black text-left">Particulars</th>
              <th className="w-24 py-1 border-r border-black">Qty.</th>
              <th className="w-28 py-1">YDS/KG</th>
            </tr>
          </thead>
          <tbody>
            {displayItems.map((item, idx) => (
              <tr key={idx} className="h-6 border-b border-dotted border-slate-300 text-center">
                <td className="border-r border-black font-medium">{idx + 1}</td>
                <td className="px-3 border-r border-black text-left font-normal truncate max-w-[260px]">
                  {item.particular || ''}
                </td>
                <td className="border-r border-black font-medium">
                  {item.qty ? `${item.qty} ${item.unit || 'Pcs'}` : ''}
                </td>
                <td className="font-medium">
                  {item.ydsKg ? `${item.ydsKg} ${item.ydsUnit || 'yds'}` : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Table Bottom: From, Returnable, Totals */}
        <div className="border-t border-black grid grid-cols-12 items-center px-3 py-1.5 text-[11px] bg-slate-50/50">
          <div className="col-span-4 font-bold">
            From: {challan.fromName || 'Ms.Shamoly'}
          </div>
          <div className="col-span-4 text-center font-bold italic">
            {challan.isReturnable ? '(Returnable)' : '(Not Returnable)'}
          </div>
          <div className="col-span-4 text-right flex justify-end space-x-3 font-bold">
            <span>Total-</span>
            <span>{challan.totalQty} pcs</span>
            <span>{challan.totalYdsKg} yds</span>
          </div>
        </div>
      </div>

      {/* 4. Notes & Signatures */}
      <div className="mt-2 text-[10px] text-slate-800">
        <p className="italic">{challan.notes || '1) Receive the above goods in good condition.'}</p>
      </div>

      <div className="mt-8 flex justify-between items-end text-[11px] pt-1">
        <div className="border-t border-slate-600 pt-1 w-64 text-slate-800">
          Receiver&apos;s Signature / Phn:
        </div>
        <div className="text-center">
          <div className="font-bold text-slate-900 text-[10px]">
            {challan.senderSign || 'Srabon (01774-109199)'}
          </div>
          <div className="border-t border-slate-600 pt-1 font-bold text-slate-900">
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
          {/* Print A4 2-in-1 */}
          <button
            onClick={handlePrint}
            className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 transition"
          >
            <Printer className="w-3.5 h-3.5 mr-1 text-slate-700" />
            Print / Save as PDF
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

          {/* Admin Controls: Edit & Delete */}
          {currentUserRole === 'ADMIN' && (
            <>
              <span className="text-slate-300">|</span>
              <Link
                href={`/challans/${challan.id}/edit`}
                className="inline-flex items-center px-2.5 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded border border-amber-300 transition"
              >
                <Edit className="w-3.5 h-3.5 mr-1" />
                Edit
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center px-2.5 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded border border-red-300 transition"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* The Printable Page Container: Fits exactly TWO slips on an A4 Sheet */}
      <div
        ref={printAreaRef}
        className="print-page bg-white p-4 sm:p-6 rounded-lg border border-slate-300 shadow-md space-y-4"
        style={{ minHeight: '290mm' }}
      >
        {/* Slip 1: Top Copy */}
        {renderSlip('Office Copy')}

        {/* Perforated Cutting Line with Scissor Icon */}
        <div className="flex items-center my-3 relative select-none">
          <div className="flex-grow border-t-2 border-dashed border-slate-400"></div>
          <div className="px-3 flex items-center text-[10px] text-slate-500 font-semibold bg-white">
            <Scissors className="w-3.5 h-3.5 mr-1 text-slate-500" />
            <span>Cut Here • Same to Same Dual Copy</span>
          </div>
          <div className="flex-grow border-t-2 border-dashed border-slate-400"></div>
        </div>

        {/* Slip 2: Bottom Copy ("same to same") */}
        {renderSlip('Customer Copy')}
      </div>
    </div>
  );
}

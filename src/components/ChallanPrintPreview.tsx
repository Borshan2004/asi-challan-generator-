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

  // Provide at least 3 display rows for visual balance if user entered 1 or 2 items
  const displayItems = [...challan.items];
  while (displayItems.length < 3) {
    displayItems.push({
      slNo: displayItems.length + 1,
      particular: '',
      qty: null,
      unit: '',
      ydsKg: null,
      ydsUnit: '',
    });
  }

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

  // Reusable Single Slip Component with rock-solid spacing and borders
  const renderSlip = (copyLabel?: string) => (
    <div className="challan-slip bg-white p-6 border border-slate-300 rounded shadow-none text-black select-none text-[12px] leading-normal">
      {/* 1. Header with Logo & Address */}
      <div className="flex items-start justify-between pb-3 border-b border-slate-200">
        {/* ASI Logo Icon */}
        <div className="flex items-center space-x-3">
          <div className="w-14 h-12 bg-slate-900 text-white font-extrabold flex items-center justify-center text-xl tracking-tighter rounded-sm flex-shrink-0">
            ASI
          </div>
          <div className="flex flex-col">
            <h2 className="text-[17px] font-bold text-black tracking-tight leading-tight">
              Apparel Sourcing International Inc
            </h2>
            <p className="text-[10px] text-slate-800 leading-normal mt-0.5">
              Anukul, House# 30, Apt# B-3, (3rd Floor) Western Road,
            </p>
            <p className="text-[10px] text-slate-800 leading-normal">
              Banani DOHS, Dhaka-1206, Bangladesh. Ph: 880-2-8715826, 8715827, 8715779
            </p>
          </div>
        </div>

        {/* Challan Title & Number */}
        <div className="text-right flex-shrink-0">
          <div className="text-[18px] font-extrabold tracking-wider underline">
            CHALLAN
          </div>
          <div className="mt-1.5 flex items-center justify-end text-[12px]">
            <span className="font-bold mr-1.5 text-slate-800">Challan No:</span>
            <span className="font-extrabold text-[13px] bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
              {challan.challanNo}
            </span>
          </div>
          {copyLabel && (
            <div className="mt-1 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
              {copyLabel}
            </div>
          )}
        </div>
      </div>

      {/* 2. Top Info Box (Name, Address, Date, Ref. No) */}
      <div className="border border-black my-2.5 grid grid-cols-12 text-[11px] bg-white">
        {/* Left Column (Name & Address) */}
        <div className="col-span-8 p-2 border-r border-black space-y-1">
          <div className="flex">
            <span className="w-20 font-bold text-slate-900 shrink-0">Name :</span>
            <span className="font-semibold text-black">{challan.name}</span>
          </div>
          <div className="flex">
            <span className="w-20 font-bold text-slate-900 shrink-0">Address :</span>
            <span className="text-black">{challan.address}</span>
          </div>
        </div>

        {/* Right Column (Date & Ref No) */}
        <div className="col-span-4 p-2 space-y-1">
          <div className="flex">
            <span className="w-20 font-bold text-slate-900 shrink-0">Date :</span>
            <span className="font-semibold text-black">{formattedDate}</span>
          </div>
          <div className="flex">
            <span className="w-20 font-bold text-slate-900 shrink-0">Ref. No. :</span>
            <span className="text-black">{challan.refNo || '-'}</span>
          </div>
        </div>
      </div>

      {/* 3. Items Table - Pure HTML Table for Zero Overlap */}
      <div className="my-2.5">
        <table className="w-full text-left text-[11px] border-collapse border border-black">
          <thead>
            <tr className="border-b border-black text-center font-bold bg-slate-50">
              <th className="w-12 py-1.5 border-r border-black text-center font-bold">Sl.No</th>
              <th className="py-1.5 px-3 border-r border-black text-left font-bold">Particulars</th>
              <th className="w-24 py-1.5 border-r border-black text-center font-bold">Qty.</th>
              <th className="w-28 py-1.5 text-center font-bold">YDS/KG</th>
            </tr>
          </thead>
          <tbody>
            {displayItems.map((item, idx) => (
              <tr key={idx} className="border-b border-slate-300 border-dotted text-center">
                <td className="border-r border-black py-1.5 px-2 font-medium">{idx + 1}</td>
                <td className="border-r border-black py-1.5 px-3 text-left font-normal truncate max-w-[260px]">
                  {item.particular || ''}
                </td>
                <td className="border-r border-black py-1.5 px-2 font-medium">
                  {item.qty ? `${item.qty} ${item.unit || 'Pcs'}` : ''}
                </td>
                <td className="py-1.5 px-2 font-medium">
                  {item.ydsKg ? `${item.ydsKg} ${item.ydsUnit || 'yds'}` : ''}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-black bg-slate-50 font-bold text-[11px]">
              <td colSpan={2} className="border-r border-black py-2 px-3">
                <div className="flex justify-between items-center">
                  <span>From: {challan.fromName || 'Ms.Shamoly'}</span>
                  <span className="italic">{challan.isReturnable ? '(Returnable)' : '(Not Returnable)'}</span>
                </div>
              </td>
              <td className="border-r border-black py-2 px-2 text-center whitespace-nowrap">
                Total- {challan.totalQty} pcs
              </td>
              <td className="py-2 px-2 text-center whitespace-nowrap">
                {challan.totalYdsKg} yds
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* 4. Notes & Signatures */}
      <div className="mt-2 text-[10px] text-slate-800">
        <p className="italic">{challan.notes || '1) Receive the above goods in good condition.'}</p>
      </div>

      <div className="mt-8 flex justify-between items-end text-[11px] pt-2">
        {/* Receiver Signature Line */}
        <div className="w-60 text-left">
          <div className="h-6"></div>
          <div className="border-t border-black pt-1 text-[11px] font-semibold text-slate-900">
            Receiver&apos;s Signature / Phn:
          </div>
        </div>

        {/* Sender / Company Signature Line */}
        <div className="w-60 text-center">
          <div className="text-[11px] font-bold text-slate-900 pb-1.5">
            {challan.senderSign || 'Srabon (01774-109199)'}
          </div>
          <div className="border-t border-black pt-1 font-bold text-slate-900 text-[11px]">
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

      {/* The Printable Page Container: Fits exactly TWO slips on an A4 Sheet */}
      <div
        ref={printAreaRef}
        className="print-page bg-white p-4 sm:p-6 rounded-lg border border-slate-300 shadow-md space-y-4"
        style={{ minHeight: '290mm' }}
      >
        {/* Slip 1: Top Copy */}
        {renderSlip('Office Copy')}

        {/* Perforated Cutting Line with Scissor Icon */}
        <div className="flex items-center my-4 relative select-none">
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

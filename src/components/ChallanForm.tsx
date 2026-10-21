'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Save, ArrowLeft, Info, Calendar, Hash } from 'lucide-react';
import ParticularCombobox from './ParticularCombobox';

interface ChallanItemInput {
  slNo: number;
  particular: string;
  qty: number | string;
  unit: string;
  ydsKg: number | string;
  ydsUnit: string;
}

interface ChallanFormProps {
  initialData?: {
    id?: string;
    challanNo?: string;
    name: string;
    address: string;
    refNo?: string | null;
    fromName: string;
    isReturnable: boolean;
    senderSign: string;
    receiverName?: string | null;
    date?: string | Date;
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
  isEdit?: boolean;
}

const DEFAULT_SUGGESTIONS = [
  "Sample",
  "shirt",
  "pant",
  "shorts",
  "polo shirt",
  "T-shirt",
  "jacket",
  "hoddi",
  "hoddi jacket",
  "trim card",
  "shead band",
  "swatch",
  "fabric",
  "lab deep",
  "rib",
  "twil tape",
  "size sticker",
  "jeep sticker",
  "label sticker",
  "tag",
  "elastic",
  "drocoat",
  "chemical"
];

export default function ChallanForm({ initialData, isEdit = false }: ChallanFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>(DEFAULT_SUGGESTIONS);

  // Form State
  const [name, setName] = useState(initialData?.name || '');
  const [address, setAddress] = useState(initialData?.address || '');
  const [refNo, setRefNo] = useState(initialData?.refNo || '');
  const [fromName, setFromName] = useState(initialData?.fromName || 'Ms.Shamoly');
  const [isReturnable, setIsReturnable] = useState(initialData ? initialData.isReturnable : true);
  const [senderSign, setSenderSign] = useState(initialData?.senderSign || 'Srabon (01774-109199)');
  const [receiverName, setReceiverName] = useState(initialData?.receiverName || '');
  const [notes, setNotes] = useState(initialData?.notes || '1) Receive the above goods in good condition.');

  // Initialize with existing data or start with 1 empty row
  const [items, setItems] = useState<ChallanItemInput[]>(() => {
    if (initialData?.items && initialData.items.length > 0) {
      return initialData.items.map((it, idx) => ({
        slNo: idx + 1,
        particular: it.particular || '',
        qty: it.qty ?? '',
        unit: it.unit || 'Pcs',
        ydsKg: it.ydsKg ?? '',
        ydsUnit: it.ydsUnit || 'yds',
      }));
    }

    // Start with just 1 row — user adds more as needed
    return [{
      slNo: 1,
      particular: '',
      qty: '',
      unit: 'Pcs',
      ydsKg: '',
      ydsUnit: 'yds',
    }];
  });

  // Fetch suggestions from database
  useEffect(() => {
    fetch('/api/particulars')
      .then((res) => res.json())
      .then((data) => {
        if (data.suggestions && data.suggestions.length > 0) {
          setSuggestions(data.suggestions.map((s: any) => s.name));
        }
      })
      .catch(() => {});
  }, []);

  // Update item field
  const handleItemChange = (index: number, field: keyof ChallanItemInput, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  // Add extra row
  const addRow = () => {
    setItems([
      ...items,
      {
        slNo: items.length + 1,
        particular: '',
        qty: '',
        unit: 'Pcs',
        ydsKg: '',
        ydsUnit: 'yds',
      },
    ]);
  };

  // Remove row
  const removeRow = (index: number) => {
    if (items.length <= 1) {
      // Just clear the row
      const updated = [...items];
      updated[0] = { slNo: 1, particular: '', qty: '', unit: 'Pcs', ydsKg: '', ydsUnit: 'yds' };
      setItems(updated);
      return;
    }
    const updated = items.filter((_, i) => i !== index).map((item, idx) => ({
      ...item,
      slNo: idx + 1,
    }));
    setItems(updated);
  };

  // Calculate live totals
  const totalQty = items.reduce((sum, item) => {
    const q = parseInt(String(item.qty), 10);
    return sum + (isNaN(q) ? 0 : q);
  }, 0);

  const totalYdsKg = items.reduce((sum, item) => {
    const y = parseFloat(String(item.ydsKg));
    return sum + (isNaN(y) ? 0 : y);
  }, 0);

  const roundedYdsKg = Math.round(totalYdsKg * 100) / 100;

  // Format today's date for display (Asia/Dhaka)
  const todayDisplay = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Dhaka',
    day: '2-digit',
    month: 'short',
    year: '2-digit',
  }).format(new Date());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter Customer / Recipient Name');
      return;
    }

    if (!address.trim()) {
      setError('Please enter Customer / Company Address');
      return;
    }

    // Filter valid items
    const validItems = items.filter((it) => it.particular.trim() !== '');
    if (validItems.length === 0) {
      setError('Please add at least one Particular item');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name,
        address,
        refNo: refNo.trim() || null,
        fromName,
        isReturnable,
        senderSign,
        receiverName: receiverName.trim() || null,
        notes,
        items: validItems,
      };

      const url = isEdit ? `/api/challans/${initialData?.id}` : '/api/challans';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save Challan');
      }

      router.push(`/challans/${data.challan.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            onClick={() => router.back()}
            type="button"
            className="flex items-center text-sm text-slate-500 hover:text-slate-800 transition mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-slate-900">
            {isEdit ? `Edit Challan: ${initialData?.challanNo}` : 'Generate New Challan'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Apparel Sourcing International Inc • Banani DOHS, Dhaka
          </p>
        </div>

        {/* Server Controlled Badges */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-md flex items-center shadow-sm">
            <Hash className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
            <span>
              Challan No:{' '}
              <strong className="text-slate-900">
                {isEdit ? initialData?.challanNo : 'Auto (ASI-XXXX)'}
              </strong>
            </span>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-md flex items-center shadow-sm">
            <Calendar className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
            <span>
              Date (Server locked):{' '}
              <strong className="text-emerald-900">{todayDisplay}</strong>
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Recipient Details Card */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-600 mb-4 pb-2 border-b border-slate-100">
            Recipient & Reference Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Enter Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Mr.Tutul, Sterling Styles"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
              />
            </div>

            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Enter Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Mouchak knitting, Gazipur"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
              />
            </div>

            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ref. No.
              </label>
              <input
                type="text"
                value={refNo}
                onChange={(e) => setRefNo(e.target.value)}
                placeholder="e.g. ASI-501 or style no"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Particulars Table Card */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-600">
                Particulars Section (Garments & Items)
              </h2>
              <p className="text-xs text-slate-500">
                Select from the 23 standard garments/accessories or type custom items.
              </p>
            </div>
            <button
              type="button"
              onClick={addRow}
              className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 rounded transition"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Row
            </button>
          </div>

          <div className="overflow-visible min-h-[240px]">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-y border-slate-200 text-slate-700 font-semibold text-xs">
                  <th className="py-2 px-2 w-12 text-center">Sl.No</th>
                  <th className="py-2 px-3">Particulars (Garment Items)</th>
                  <th className="py-2 px-2 w-24">Qty</th>
                  <th className="py-2 px-2 w-24">Unit</th>
                  <th className="py-2 px-2 w-28">YDS/KG</th>
                  <th className="py-2 px-2 w-24">Yds Unit</th>
                  <th className="py-2 px-2 w-10 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-slate-50/70 transition relative"
                    style={{ zIndex: items.length - index + 20 }}
                  >
                    <td className="py-2 px-2 text-center text-slate-500 font-medium">
                      {index + 1}
                    </td>
                    <td className="py-2 px-3 relative">
                      <ParticularCombobox
                        value={item.particular}
                        suggestions={suggestions}
                        onChange={(val) => handleItemChange(index, 'particular', val)}
                        placeholder={`Select or type item ${index + 1} (e.g. Polo shirt, Sample...)`}
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        min="0"
                        value={item.qty}
                        onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                        placeholder="0"
                        className="w-full px-2 py-1.5 text-xs sm:text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-center bg-white"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <select
                        value={item.unit}
                        onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                        className="w-full px-2 py-1.5 text-xs sm:text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      >
                        <option value="Pcs">Pcs</option>
                        <option value="Box's">Box&apos;s</option>
                        <option value="Poly">Poly</option>
                        <option value="Roll">Roll</option>
                        <option value="Set">Set</option>
                      </select>
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.ydsKg}
                        onChange={(e) => handleItemChange(index, 'ydsKg', e.target.value)}
                        placeholder="0.00"
                        className="w-full px-2 py-1.5 text-xs sm:text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-center bg-white"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <select
                        value={item.ydsUnit}
                        onChange={(e) => handleItemChange(index, 'ydsUnit', e.target.value)}
                        className="w-full px-2 py-1.5 text-xs sm:text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      >
                        <option value="yds">yds</option>
                        <option value="kg">kg</option>
                      </select>
                    </td>
                    <td className="py-2 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeRow(index)}
                        title="Clear or remove row"
                        className="text-slate-400 hover:text-red-500 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Live Totals Section */}
          <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap justify-between items-center bg-slate-50 p-3 rounded-md">
            <div className="text-xs text-slate-500 flex items-center">
              <Info className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
              <span>Start with 1 row. Add more rows as needed using the &quot;+ Add Row&quot; button above.</span>
            </div>
            <div className="flex items-center space-x-6 text-sm font-semibold">
              <div>
                <span className="text-slate-500 mr-2">Total Qty:</span>
                <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {totalQty} pcs
                </span>
              </div>
              <div>
                <span className="text-slate-500 mr-2">Total YDS/KG:</span>
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {roundedYdsKg} yds
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Challan Policy & Sender Information Card */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-600 mb-4 pb-2 border-b border-slate-100">
            Sender, Receiver & Returnable Policy
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                From Name
              </label>
              <input
                type="text"
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
                placeholder="Ms.Shamoly"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Returnable Status
              </label>
              <select
                value={isReturnable ? 'yes' : 'no'}
                onChange={(e) => setIsReturnable(e.target.value === 'yes')}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white font-medium"
              >
                <option value="yes">(Returnable)</option>
                <option value="no">(Not Returnable)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sender Sign & Phone
              </label>
              <input
                type="text"
                value={senderSign}
                onChange={(e) => setSenderSign(e.target.value)}
                placeholder="Srabon (01774-109199)"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Receiver Name / Phn (Beside Sign)
              </label>
              <input
                type="text"
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                placeholder="e.g. Mr. Tutul (017...)"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Footer Note
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-700"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={loading}
            className="px-5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-6 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 shadow-sm transition disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-1.5" />
            {loading ? 'Saving...' : isEdit ? 'Update Challan' : 'Save & Submit Challan'}
          </button>
        </div>
      </form>
    </div>
  );
}

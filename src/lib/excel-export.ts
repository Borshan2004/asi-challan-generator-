import ExcelJS from 'exceljs';
import { formatChallanDate } from './challan-utils';

export interface ChallanExportData {
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
}

export async function generateChallanExcel(data: ChallanExportData): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Apparel Sourcing International Inc';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('CHALLAN', {
    pageSetup: {
      paperSize: 9, // A4
      orientation: 'portrait',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 1,
      margins: {
        left: 0.4,
        right: 0.4,
        top: 0.4,
        bottom: 0.4,
        header: 0.2,
        footer: 0.2,
      },
    },
  });

  // Set column widths
  worksheet.columns = [
    { width: 8 },  // A: Sl.No
    { width: 35 }, // B: Particulars
    { width: 12 }, // C: Qty
    { width: 10 }, // D: Unit
    { width: 14 }, // E: YDS/KG
    { width: 10 }, // F: Yds Unit
  ];

  const formattedDate = formatChallanDate(data.date);

  // Helper function to build one slip
  const renderSlip = (startRow: number) => {
    // 1. Company Header
    worksheet.mergeCells(`A${startRow}:F${startRow}`);
    const companyCell = worksheet.getCell(`A${startRow}`);
    companyCell.value = 'Apparel Sourcing International Inc';
    companyCell.font = { name: 'Calibri', size: 14, bold: true };
    companyCell.alignment = { horizontal: 'center' };

    worksheet.mergeCells(`A${startRow + 1}:F${startRow + 1}`);
    const addressCell = worksheet.getCell(`A${startRow + 1}`);
    addressCell.value = 'Anukul, House# 30, Apt# B-3, (3rd Floor) Western Road, Banani DOHS, Dhaka-1206, Bangladesh.\nPh: 880-2-8715826, 8715827, 8715779';
    addressCell.font = { name: 'Calibri', size: 9 };
    addressCell.alignment = { horizontal: 'center', wrapText: true };
    worksheet.getRow(startRow + 1).height = 24;

    // 2. Title & Challan No
    const titleRow = startRow + 3;
    worksheet.mergeCells(`B${titleRow}:D${titleRow}`);
    const challanTitle = worksheet.getCell(`B${titleRow}`);
    challanTitle.value = 'CHALLAN';
    challanTitle.font = { name: 'Calibri', size: 14, bold: true, underline: true };
    challanTitle.alignment = { horizontal: 'center' };

    worksheet.getCell(`E${titleRow}`).value = 'Challan No:';
    worksheet.getCell(`E${titleRow}`).font = { name: 'Calibri', size: 10, bold: true };
    worksheet.getCell(`F${titleRow}`).value = data.challanNo;
    worksheet.getCell(`F${titleRow}`).font = { name: 'Calibri', size: 11, bold: true };

    // 3. Name, Date, Address, Ref No
    const metaRow1 = startRow + 4;
    worksheet.getCell(`A${metaRow1}`).value = 'Name      :';
    worksheet.getCell(`A${metaRow1}`).font = { name: 'Calibri', size: 10, bold: true };
    worksheet.mergeCells(`B${metaRow1}:D${metaRow1}`);
    worksheet.getCell(`B${metaRow1}`).value = data.name;
    worksheet.getCell(`B${metaRow1}`).font = { name: 'Calibri', size: 10 };

    worksheet.getCell(`E${metaRow1}`).value = 'Date         :';
    worksheet.getCell(`E${metaRow1}`).font = { name: 'Calibri', size: 10, bold: true };
    worksheet.getCell(`F${metaRow1}`).value = formattedDate;
    worksheet.getCell(`F${metaRow1}`).font = { name: 'Calibri', size: 10 };

    const metaRow2 = startRow + 5;
    worksheet.getCell(`A${metaRow2}`).value = 'Address  :';
    worksheet.getCell(`A${metaRow2}`).font = { name: 'Calibri', size: 10, bold: true };
    worksheet.mergeCells(`B${metaRow2}:D${metaRow2}`);
    worksheet.getCell(`B${metaRow2}`).value = data.address;
    worksheet.getCell(`B${metaRow2}`).font = { name: 'Calibri', size: 10 };

    worksheet.getCell(`E${metaRow2}`).value = 'Ref. No.  :';
    worksheet.getCell(`E${metaRow2}`).font = { name: 'Calibri', size: 10, bold: true };
    worksheet.getCell(`F${metaRow2}`).value = data.refNo || '-';
    worksheet.getCell(`F${metaRow2}`).font = { name: 'Calibri', size: 10 };

    // 4. Table Header
    const tableHeaderRow = startRow + 7;
    const headers = ['Sl.No', 'Particulars', 'Qty.', 'Unit', 'YDS/KG', 'Unit'];
    const cols = ['A', 'B', 'C', 'D', 'E', 'F'];

    cols.forEach((col, idx) => {
      const cell = worksheet.getCell(`${col}${tableHeaderRow}`);
      cell.value = headers[idx];
      cell.font = { name: 'Calibri', size: 10, bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF2F2F2' },
      };
      cell.alignment = { horizontal: idx === 1 ? 'left' : 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    // 5. Table Rows (dynamic based on actual item count)
    const itemCount = Math.max(data.items.length, 1); // At least 1 row
    const itemsStartRow = tableHeaderRow + 1;
    for (let i = 0; i < itemCount; i++) {
      const currentRow = itemsStartRow + i;
      const item = data.items[i];

      worksheet.getCell(`A${currentRow}`).value = i + 1;
      worksheet.getCell(`B${currentRow}`).value = item ? item.particular : '';
      worksheet.getCell(`C${currentRow}`).value = item && item.qty ? item.qty : '';
      worksheet.getCell(`D${currentRow}`).value = item && item.qty ? (item.unit || 'Pcs') : '';
      worksheet.getCell(`E${currentRow}`).value = item && item.ydsKg !== null && item.ydsKg !== undefined ? item.ydsKg : '';
      worksheet.getCell(`F${currentRow}`).value = item && item.ydsKg ? (item.ydsUnit || 'yds') : '';

      cols.forEach((col, idx) => {
        const cell = worksheet.getCell(`${col}${currentRow}`);
        cell.font = { name: 'Calibri', size: 10 };
        cell.alignment = { horizontal: idx === 1 ? 'left' : 'center', vertical: 'middle' };
        cell.border = {
          left: { style: 'thin' },
          right: { style: 'thin' },
          bottom: i === itemCount - 1 ? { style: 'thin' } : { style: 'dotted' },
        };
      });
    }

    // 6. From & Returnable row
    const footerMetaRow = itemsStartRow + itemCount;
    worksheet.getCell(`B${footerMetaRow}`).value = `From: ${data.fromName}`;
    worksheet.getCell(`B${footerMetaRow}`).font = { name: 'Calibri', size: 10, bold: true };

    const statusRow = footerMetaRow + 1;
    worksheet.getCell(`B${statusRow}`).value = data.isReturnable ? '(Returnable)' : '(Not Returnable)';
    worksheet.getCell(`B${statusRow}`).font = { name: 'Calibri', size: 10, bold: true, italic: true };
    worksheet.getCell(`B${statusRow}`).alignment = { horizontal: 'center' };

    // Total Row
    worksheet.getCell(`B${statusRow}`).border = { bottom: { style: 'thin' } };
    worksheet.getCell(`C${statusRow}`).value = `Total- ${data.totalQty}`;
    worksheet.getCell(`C${statusRow}`).font = { name: 'Calibri', size: 10, bold: true };
    worksheet.getCell(`D${statusRow}`).value = 'pcs';
    worksheet.getCell(`D${statusRow}`).font = { name: 'Calibri', size: 10 };

    worksheet.getCell(`E${statusRow}`).value = `${data.totalYdsKg}`;
    worksheet.getCell(`E${statusRow}`).font = { name: 'Calibri', size: 10, bold: true };
    worksheet.getCell(`F${statusRow}`).value = 'yds';
    worksheet.getCell(`F${statusRow}`).font = { name: 'Calibri', size: 10 };

    ['C', 'D', 'E', 'F'].forEach((col) => {
      worksheet.getCell(`${col}${statusRow}`).border = {
        top: { style: 'thin' },
        bottom: { style: 'double' },
      };
    });

    // 7. Notes
    const noteRow = statusRow + 1;
    worksheet.mergeCells(`A${noteRow}:F${noteRow}`);
    const noteCell = worksheet.getCell(`A${noteRow}`);
    noteCell.value = data.notes || '1) Receive the above goods in good condition.';
    noteCell.font = { name: 'Calibri', size: 9, italic: true };

    // 8. Signatures
    const signRow = noteRow + 3;
    worksheet.mergeCells(`D${signRow}:F${signRow}`);
    const senderCell = worksheet.getCell(`D${signRow}`);
    senderCell.value = data.senderSign || 'Srabon (01774-109199)';
    senderCell.font = { name: 'Calibri', size: 9, bold: true };
    senderCell.alignment = { horizontal: 'center' };

    const signBottomRow = signRow + 1;
    worksheet.mergeCells(`A${signBottomRow}:C${signBottomRow}`);
    const receiverSign = worksheet.getCell(`A${signBottomRow}`);
    receiverSign.value = data.receiverName
      ? `Receiver's Signature / Phn: ${data.receiverName}`
      : "Receiver's Signature / Phn: ___________________";
    receiverSign.font = { name: 'Calibri', size: 9 };

    worksheet.mergeCells(`D${signBottomRow}:F${signBottomRow}`);
    const companySign = worksheet.getCell(`D${signBottomRow}`);
    companySign.value = "For-Apparel Sourcing int'l inc";
    companySign.font = { name: 'Calibri', size: 9, bold: true };
    companySign.alignment = { horizontal: 'center' };
  };

  // Render First Copy (Top)
  renderSlip(1);

  // Calculate dynamic second copy start row based on actual item count
  // Each slip takes: 7 header rows + 1 table header + itemCount data rows + 6 footer rows = 14 + itemCount
  const slipHeight = 14 + Math.max(data.items.length, 1);
  const secondSlipStart = slipHeight + 3; // 3 row gap between slips

  // Render Second Copy (Bottom - "Same to same" on single A4 sheet)
  renderSlip(secondSlipStart);

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

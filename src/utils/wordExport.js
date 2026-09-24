import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
  AlignmentType,
  HeadingLevel,
  BorderStyle
} from 'docx';
import { saveAs } from 'file-saver';
import { formatDateFull, formatRupiah } from './formatters';

export const exportToWord = async (transactions, summary) => {
  const netStockProfit = summary.totalProfitSaham - summary.totalLossSaham;

  // Header Title Paragraph
  const titleParagraph = new Paragraph({
    alignment: AlignmentType.CENTER,
    spaceAfter: { after: 200 },
    children: [
      new TextRun({
        text: 'LAPORAN TATANAN UANG & PORTOFOLIO SAHAM',
        bold: true,
        size: 32, // 16pt
        color: '0F172A'
      })
    ]
  });

  const dateParagraph = new Paragraph({
    alignment: AlignmentType.CENTER,
    spaceAfter: { after: 400 },
    children: [
      new TextRun({
        text: `Tanggal Laporan: ${formatDateFull(new Date())}`,
        italic: true,
        size: 20, // 10pt
        color: '64748B'
      })
    ]
  });

  // Section 1: Executive Summary Title
  const summaryTitle = new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spaceBefore: { before: 200 },
    spaceAfter: { after: 150 },
    children: [
      new TextRun({
        text: 'I. Ringkasan Aset & Arus Kas',
        bold: true,
        size: 24,
        color: '10B981'
      })
    ]
  });

  // Summary Table Rows
  const summaryRowsData = [
    ['Total Duit yang Dibawa (Cash)', formatRupiah(summary.duitDibawa)],
    ['Total Portofolio (Saham)', formatRupiah(summary.duitSaham)],
    ['TOTAL KEKAYAAN ASET', formatRupiah(summary.totalKekayaan)],
    ['Total Pemasukan', `+${formatRupiah(summary.totalPemasukan)}`],
    ['Total Pengeluaran', `-${formatRupiah(summary.totalPengeluaran)}`],
    ['Total Profit Saham (Gain)', `+${formatRupiah(summary.totalProfitSaham)}`],
    ['Total Loss Saham (Loss)', `-${formatRupiah(summary.totalLossSaham)}`],
    ['Net Performa Saham', `${netStockProfit >= 0 ? '+' : ''}${formatRupiah(netStockProfit)}`]
  ];

  const summaryTableRows = [
    // Header Row
    new TableRow({
      children: [
        new TableCell({
          width: { size: 60, type: WidthType.PERCENTAGE },
          shading: { fill: '0F172A' },
          children: [new Paragraph({ children: [new TextRun({ text: 'Indikator Finansial', bold: true, color: 'FFFFFF' })] })]
        }),
        new TableCell({
          width: { size: 40, type: WidthType.PERCENTAGE },
          shading: { fill: '0F172A' },
          children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Jumlah (Rp)', bold: true, color: 'FFFFFF' })] })]
        })
      ]
    }),
    ...summaryRowsData.map(([label, val], idx) => {
      const isHeaderHighlight = label.includes('TOTAL KEKAYAAN');
      return new TableRow({
        children: [
          new TableCell({
            shading: { fill: isHeaderHighlight ? 'D1FAE5' : idx % 2 === 0 ? 'F8FAFC' : 'FFFFFF' },
            children: [new Paragraph({ children: [new TextRun({ text: label, bold: isHeaderHighlight })] })]
          }),
          new TableCell({
            shading: { fill: isHeaderHighlight ? 'D1FAE5' : idx % 2 === 0 ? 'F8FAFC' : 'FFFFFF' },
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [new TextRun({ text: val, bold: isHeaderHighlight, color: isHeaderHighlight ? '065F46' : '000000' })]
              })
            ]
          })
        ]
      });
    })
  ];

  const summaryTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: summaryTableRows,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
      left: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
      right: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' }
    }
  });

  // Section 2: Detailed Transactions Title
  const detailTitle = new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spaceBefore: { before: 400 },
    spaceAfter: { after: 150 },
    children: [
      new TextRun({
        text: 'II. Rincian Catatan Keuangan & Saham Harian',
        bold: true,
        size: 24,
        color: '10B981'
      })
    ]
  });

  // Detail Table Header & Rows
  const tableHeader = new TableRow({
    children: [
      new TableCell({ width: { size: 5, type: WidthType.PERCENTAGE }, shading: { fill: '0F172A' }, children: [new Paragraph({ children: [new TextRun({ text: 'No', bold: true, color: 'FFFFFF', size: 16 })] })] }),
      new TableCell({ width: { size: 18, type: WidthType.PERCENTAGE }, shading: { fill: '0F172A' }, children: [new Paragraph({ children: [new TextRun({ text: 'Hari & Tanggal', bold: true, color: 'FFFFFF', size: 16 })] })] }),
      new TableCell({ width: { size: 22, type: WidthType.PERCENTAGE }, shading: { fill: '0F172A' }, children: [new Paragraph({ children: [new TextRun({ text: 'Kebutuhan', bold: true, color: 'FFFFFF', size: 16 })] })] }),
      new TableCell({ width: { size: 11, type: WidthType.PERCENTAGE }, shading: { fill: '0F172A' }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Pemasukan', bold: true, color: 'FFFFFF', size: 16 })] })] }),
      new TableCell({ width: { size: 11, type: WidthType.PERCENTAGE }, shading: { fill: '0F172A' }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Pengeluaran', bold: true, color: 'FFFFFF', size: 16 })] })] }),
      new TableCell({ width: { size: 11, type: WidthType.PERCENTAGE }, shading: { fill: '0F172A' }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Profit Saham', bold: true, color: 'FFFFFF', size: 16 })] })] }),
      new TableCell({ width: { size: 11, type: WidthType.PERCENTAGE }, shading: { fill: '0F172A' }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Loss Saham', bold: true, color: 'FFFFFF', size: 16 })] })] }),
      new TableCell({ width: { size: 11, type: WidthType.PERCENTAGE }, shading: { fill: '0F172A' }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Duit Dibawa', bold: true, color: 'FFFFFF', size: 16 })] })] })
    ]
  });

  const detailRows = transactions.map((t, idx) => {
    const isOdd = idx % 2 === 1;
    return new TableRow({
      children: [
        new TableCell({ shading: { fill: isOdd ? 'F8FAFC' : 'FFFFFF' }, children: [new Paragraph({ children: [new TextRun({ text: String(idx + 1), size: 16 })] })] }),
        new TableCell({ shading: { fill: isOdd ? 'F8FAFC' : 'FFFFFF' }, children: [new Paragraph({ children: [new TextRun({ text: formatDateFull(t.tanggal), size: 16 })] })] }),
        new TableCell({ shading: { fill: isOdd ? 'F8FAFC' : 'FFFFFF' }, children: [new Paragraph({ children: [new TextRun({ text: t.kebutuhan, size: 16 })] })] }),
        new TableCell({ shading: { fill: isOdd ? 'F8FAFC' : 'FFFFFF' }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: t.pemasukan > 0 ? formatRupiah(t.pemasukan) : '-', size: 16, color: '059669' })] })] }),
        new TableCell({ shading: { fill: isOdd ? 'F8FAFC' : 'FFFFFF' }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: t.pengeluaran > 0 ? formatRupiah(t.pengeluaran) : '-', size: 16, color: 'DC2626' })] })] }),
        new TableCell({ shading: { fill: isOdd ? 'F8FAFC' : 'FFFFFF' }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: t.profitSaham > 0 ? formatRupiah(t.profitSaham) : '-', size: 16, color: '059669' })] })] }),
        new TableCell({ shading: { fill: isOdd ? 'F8FAFC' : 'FFFFFF' }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: t.lossSaham > 0 ? formatRupiah(t.lossSaham) : '-', size: 16, color: 'D97706' })] })] }),
        new TableCell({ shading: { fill: isOdd ? 'F8FAFC' : 'FFFFFF' }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: formatRupiah(t.duitDibawa), size: 16 })] })] })
      ]
    });
  });

  const detailTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [tableHeader, ...detailRows],
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
      left: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
      right: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' }
    }
  });

  // Create Document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          titleParagraph,
          dateParagraph,
          summaryTitle,
          summaryTable,
          detailTitle,
          detailTable
        ]
      }
    ]
  });

  // Generate Blob and download
  const blob = await Packer.toBlob(doc);
  const fileName = `Laporan_Tatanan_Uang_${new Date().toISOString().split('T')[0]}.docx`;
  saveAs(blob, fileName);
};

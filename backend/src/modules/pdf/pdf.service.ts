import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';

const COMPANY = 'PARBATYA TRAVELS BD';
const TAGLINE = 'Discover Bangladesh Beyond the Ordinary';
const GREEN = '#1f3b2d';
const GOLD = '#a8905a';
const bdt = (paisa: number) => `BDT ${(paisa / 100).toLocaleString('en-US')}`;

function toBuffer(build: (doc: PDFKit.PDFDocument) => void, opts: PDFKit.PDFDocumentOptions): Promise<Buffer> {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ ...opts, info: { Title: `${COMPANY}`, Author: COMPANY, Creator: COMPANY, Producer: COMPANY } });
    const chunks: Buffer[] = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    build(doc);
    doc.end();
  });
}

// Note: built-in PDF fonts cover Latin text only. For Bangla names, register a Bengali TTF with doc.registerFont().
@Injectable()
export class PdfService {
  receipt(r: { receiptNo: string; paidAt: Date | null; amount: number; method: string; event: string; guests: number; holder: string; total: number; balanceDue: number }) {
    return toBuffer((doc) => {
      doc.rect(0, 0, doc.page.width, 110).fill(GREEN);
      doc.fillColor('#ffffff').font('Times-Bold').fontSize(24).text(COMPANY, 50, 40);
      doc.font('Times-Roman').fontSize(12).fillColor('#d9c99a').text(TAGLINE, 50, 72);
      doc.fillColor('#1c1c1a').font('Times-Roman').fontSize(28).text('Payment receipt', 50, 150);
      const rows: [string, string][] = [
        ['Receipt no.', r.receiptNo], ['Date', (r.paidAt ?? new Date()).toLocaleString('en-GB')], ['Name', r.holder],
        ['Event', r.event], ['People', String(r.guests)], ['Total', bdt(r.total)],
        [`Paid now (${r.method})`, bdt(r.amount)], ['Balance due', r.balanceDue ? bdt(r.balanceDue) : 'None'],
      ];
      let y = 210;
      for (const [k, v] of rows) {
        doc.fontSize(11).fillColor('#6b675c').text(k, 50, y);
        doc.fontSize(13).fillColor('#1c1c1a').text(v, 200, y - 2, { width: 345, align: 'right' });
        doc.moveTo(50, y + 22).lineTo(545, y + 22).strokeColor('#ddd5c3').stroke();
        y += 44;
      }
      doc.fontSize(10).fillColor('#6b675c').text(`${COMPANY} · Thank you for travelling with us`, 50, 780, { align: 'center', width: 495 });
    }, { size: 'A4', margin: 0 });
  }

  eventCertificate(c: { code: string; holderName: string; event: string; issuedAt: Date }) {
    return toBuffer((doc) => {
      const w = doc.page.width, h = doc.page.height;
      doc.rect(20, 20, w - 40, h - 40).lineWidth(3).strokeColor(GOLD).stroke();
      doc.rect(32, 32, w - 64, h - 64).lineWidth(1).strokeColor(GOLD).stroke();
      doc.fillColor(GREEN).font('Times-Roman').fontSize(18).text(COMPANY, 0, 80, { align: 'center', characterSpacing: 4 });
      doc.fillColor('#1c1c1a').fontSize(40).text('Certificate of Completion', 0, 140, { align: 'center' });
      doc.fontSize(15).text('This certifies that', 0, 215, { align: 'center' });
      doc.font('Times-Bold').fontSize(34).text(c.holderName, 0, 250, { align: 'center' });
      doc.font('Times-Roman').fontSize(15).text('has successfully completed', 0, 310, { align: 'center' });
      doc.fillColor(GREEN).fontSize(26).text(c.event, 60, 345, { align: 'center', width: w - 120 });
      doc.fillColor('#6b675c').fontSize(10).text(`Issued ${c.issuedAt.toLocaleDateString('en-GB')} · Verification ID ${c.code}`, 0, h - 90, { align: 'center' });
      doc.text(`${COMPANY} · ${TAGLINE}`, 0, h - 70, { align: 'center' });
    }, { size: 'A4', layout: 'landscape', margin: 0 });
  }
}

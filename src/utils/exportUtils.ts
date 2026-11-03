/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { RecruitmentRecord, KPIStats, HRPerformanceMetric } from '../types';

export function exportToExcel(records: RecruitmentRecord[], filename = 'RG_HR_Recruitment_Status.xlsx') {
  const exportData = records.map((r) => ({
    'SL': r.sl,
    'Position Title': r.positionTitle,
    'Department': r.department,
    'Requisition Date': r.requisitionDate,
    'Requisition Submitted By': r.requisitionSubmittedBy,
    'HOD': r.hod,
    'Company': r.company,
    'Vacancy': r.vacancy,
    'Recruitment Type': r.recruitmentType,
    'Replacement of Whom': r.replacementOfWhom || 'N/A',
    'Replacement Employee Salary': r.replacementEmployeeSalary ? `${r.replacementEmployeeSalary} BDT` : 'N/A',
    'Offer Letter Date': r.offerLetterDate || 'Pending',
    'Date of Joining (DOJ)': r.doj || 'Pending',
    'Recruitment Status': r.status,
    'Time to Fill (Days)': r.timeToFill !== null ? r.timeToFill : 'N/A',
    'Pending Age (Days)': r.pendingAge !== null ? r.pendingAge : 'N/A',
    'Remarks': r.remarks,
    'Recruitment Assisted By': r.recruitmentAssistedBy,
    'Last Updated By': r.lastUpdatedBy,
    'Last Updated At': r.lastUpdatedAt ? new Date(r.lastUpdatedAt).toLocaleString() : '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Recruitment_Checklist');

  // Auto-fit column widths
  const colWidths = [
    { wch: 6 },  // SL
    { wch: 30 }, // Position
    { wch: 25 }, // Dept
    { wch: 15 }, // Req Date
    { wch: 25 }, // Sub by
    { wch: 20 }, // HOD
    { wch: 10 }, // Company
    { wch: 8 },  // Vacancy
    { wch: 18 }, // Type
    { wch: 25 }, // Rep of whom
    { wch: 20 }, // Salary
    { wch: 15 }, // Offer date
    { wch: 18 }, // DOJ
    { wch: 14 }, // Status
    { wch: 18 }, // TTF
    { wch: 18 }, // Pending Age
    { wch: 35 }, // Remarks
    { wch: 24 }, // Assisted by
    { wch: 25 }, // Updated by
    { wch: 22 }, // Updated at
  ];
  worksheet['!cols'] = colWidths;

  XLSX.writeFile(workbook, filename);
}

export function exportToPDF(
  records: RecruitmentRecord[],
  stats: KPIStats,
  title = 'RG HR – Recruitment Status & Checklist Report'
) {
  const doc = new jsPDF('landscape', 'pt', 'a4');

  // Brand Header
  doc.setFillColor(15, 23, 42); // Navy Blue
  doc.rect(0, 0, 842, 60, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('RG HR – RECRUITMENT STATUS & CHECKLIST', 40, 36);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleString()} | Total Requisitions: ${stats.totalRequisitions}`, 500, 36);

  // KPI Summary Bar
  doc.setFillColor(241, 245, 249);
  doc.rect(40, 75, 762, 45, 'F');

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');

  const kpis = [
    `Total Requisitions: ${stats.totalRequisitions}`,
    `Total Vacancies: ${stats.totalVacancies}`,
    `Joined: ${stats.joinedEmployees}`,
    `Ongoing: ${stats.ongoingRecruitment}`,
    `Held Up: ${stats.heldUpRecruitment}`,
    `Avg Time to Fill: ${stats.avgTimeToFillDays} Days`,
  ];

  kpis.forEach((kpi, idx) => {
    doc.text(kpi, 55 + idx * 125, 102);
  });

  // Table
  const tableData = records.slice(0, 200).map((r) => [
    r.sl,
    r.positionTitle,
    r.department,
    r.company,
    r.recruitmentType === 'New Recruitment' ? 'New' : 'Repl.',
    r.requisitionDate,
    r.doj || '-',
    r.status,
    r.timeToFill !== null ? `${r.timeToFill}d` : (r.pendingAge ? `${r.pendingAge}d pend.` : '-'),
    r.recruitmentAssistedBy.split(' ')[0] + ' ' + (r.recruitmentAssistedBy.split(' ')[1] || ''),
  ]);

  autoTable(doc, {
    startY: 135,
    head: [['SL', 'Position Title', 'Department', 'Co.', 'Type', 'Req Date', 'DOJ', 'Status', 'TTF / Age', 'Assisted By']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [30, 58, 138], // Royal Blue
      textColor: 255,
      fontSize: 8,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 7.5,
      cellPadding: 4,
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 140 },
      2: { cellWidth: 110 },
      3: { cellWidth: 40 },
      4: { cellWidth: 45 },
      5: { cellWidth: 65 },
      6: { cellWidth: 65 },
      7: { cellWidth: 60 },
      8: { cellWidth: 65 },
      9: { cellWidth: 100 },
    },
    margin: { left: 40, right: 40 },
  });

  doc.save(`${title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
}

export function parseExcelFile(file: File): Promise<Partial<RecruitmentRecord>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        const mapped: Partial<RecruitmentRecord>[] = rawJson.map((row, idx) => {
          // Normalize column headers
          const getVal = (possibleKeys: string[]) => {
            for (const key of possibleKeys) {
              const foundKey = Object.keys(row).find((k) => k.trim().toLowerCase() === key.toLowerCase());
              if (foundKey && row[foundKey] !== undefined && row[foundKey] !== '') {
                return row[foundKey];
              }
            }
            return '';
          };

          const parseDate = (val: any) => {
            if (!val) return '';
            if (typeof val === 'number') {
              // Excel date serial number to YYYY-MM-DD
              const date = new Date(Math.round((val - 25569) * 86400 * 1000));
              return date.toISOString().split('T')[0];
            }
            const str = String(val).trim();
            const d = new Date(str);
            if (!isNaN(d.getTime())) {
              return d.toISOString().split('T')[0];
            }
            return str;
          };

          const sl = parseInt(getVal(['SL', 'Serial', 'Sl. No', 'SlNo'])) || idx + 1;
          const positionTitle = getVal(['Position Title', 'Position', 'Designation', 'Title']) || 'Position Title';
          const department = getVal(['Department', 'Dept']) || 'General';
          const requisitionDate = parseDate(getVal(['Requisition Date', 'Req Date', 'Requisition']));
          const requisitionSubmittedBy = getVal(['Requisition Submitted By', 'Submitted By', 'Requisition By']);
          const hod = getVal(['HOD', 'Head of Department', 'HOD Name']);
          const company = (getVal(['Company', 'Company Name']) || 'RAL').toUpperCase() as any;
          const vacancy = parseInt(getVal(['Vacancy', 'Vacancies', 'No of Vacancy'])) || 1;
          const recruitmentType = getVal(['Recruitment Type', 'Type']).toLowerCase().includes('replacement')
            ? 'Replacement'
            : 'New Recruitment';
          const replacementOfWhom = getVal(['Replacement of Whom', 'Replacement Of']);
          const replacementEmployeeSalary = getVal(['Replacement Employee Salary', 'Replacement Salary', 'Salary']);
          const offerLetterDate = parseDate(getVal(['Offer Letter Date', 'Offer Date']));
          const doj = parseDate(getVal(['Date of Joining (DOJ)', 'DOJ', 'Date of Joining', 'Joining Date']));
          let status = getVal(['Recruitment Status', 'Status']) || (doj ? 'Joined' : 'Ongoing');

          // Normalize status
          if (status.toLowerCase().includes('joined')) status = 'Joined';
          else if (status.toLowerCase().includes('held')) status = 'Held Up';
          else if (status.toLowerCase().includes('cancel')) status = 'Cancelled';
          else if (status.toLowerCase().includes('not join')) status = 'Did not Join';
          else status = 'Ongoing';

          const remarks = getVal(['Remarks', 'Remark', 'Comments']);
          const recruitmentAssistedBy = getVal(['Recruitment Assisted By', 'Assisted By', 'Assigned To']) || 'Quazi Nuzhat Rahman';

          return {
            sl,
            positionTitle,
            department,
            requisitionDate: requisitionDate || '2026-01-01',
            requisitionSubmittedBy: requisitionSubmittedBy || 'HOD',
            hod: hod || 'HOD',
            company: ['RAL', 'SGL', 'PSL', 'MTSL', 'RDL', 'RBL'].includes(company) ? company : 'RAL',
            vacancy,
            recruitmentType: recruitmentType as any,
            replacementOfWhom,
            replacementEmployeeSalary,
            offerLetterDate,
            doj,
            status: status as any,
            remarks,
            recruitmentAssistedBy,
          };
        });

        resolve(mapped);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

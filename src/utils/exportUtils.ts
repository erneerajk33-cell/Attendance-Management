import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { AttendanceRecord, Staff, Center } from '../types';

export function exportAttendanceToExcel(
  records: AttendanceRecord[],
  staffList: Staff[],
  center: Center | null,
  monthYearStr: string, // YYYY-MM
  format: 'HORIZONTAL_MATRIX' | 'VERTICAL_DATE'
) {
  const [yearStr, monthStr] = monthYearStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const daysInMonth = new Date(year, month, 0).getDate();

  const wb = XLSX.utils.book_new();

  if (format === 'HORIZONTAL_MATRIX') {
    // Generate Horizontal Matrix: Staff Name x Date Columns (1 to N)
    const headerRow = ['Emp Code', 'Staff Name', 'Designation', 'Department'];
    for (let d = 1; d <= daysInMonth; d++) {
      headerRow.push(String(d));
    }
    headerRow.push('Total Present', 'Total Late', 'Total Leave', 'Total Absent', '% Attendance');

    const rows: any[] = [];
    rows.push(['ONLINE ATTENDANCE MANAGEMENT SYSTEM - MONTHLY MATRIX REPORT']);
    rows.push([`Center: ${center ? center.name : 'All Centers'} (${center ? center.code : 'All'})`]);
    rows.push([`Period: ${monthYearStr} | Total Days: ${daysInMonth}`]);
    rows.push([]);
    rows.push(headerRow);

    staffList.forEach((stf) => {
      const staffRecords = records.filter(
        (r) => r.staffId === stf.id && r.date.startsWith(monthYearStr)
      );

      let presentCount = 0;
      let lateCount = 0;
      let leaveCount = 0;
      let absentCount = 0;

      const dateStatusMap: Record<number, string> = {};
      staffRecords.forEach((r) => {
        const dayNum = parseInt(r.date.split('-')[2], 10);
        if (r.status === 'PRESENT') {
          dateStatusMap[dayNum] = 'P';
          presentCount++;
        } else if (r.status === 'LATE') {
          dateStatusMap[dayNum] = 'L';
          lateCount++;
          presentCount++;
        } else if (r.status === 'LEAVE') {
          dateStatusMap[dayNum] = 'LV';
          leaveCount++;
        } else if (r.status === 'HOLIDAY') {
          dateStatusMap[dayNum] = 'H';
        } else {
          dateStatusMap[dayNum] = 'A';
          absentCount++;
        }
      });

      const row: (string | number)[] = [stf.staffCode, stf.name, stf.designation, stf.department];
      for (let d = 1; d <= daysInMonth; d++) {
        const dateObj = new Date(year, month - 1, d);
        const isSunday = dateObj.getDay() === 0;
        const statusVal = dateStatusMap[d] || (isSunday ? 'WO' : '-');
        row.push(statusVal);
      }

      const totalActiveDays = Math.max(1, presentCount + leaveCount + absentCount);
      const percentage = Math.round((presentCount / totalActiveDays) * 100);

      row.push(presentCount, lateCount, leaveCount, absentCount, `${percentage}%`);
      rows.push(row);
    });

    const ws = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Monthly Attendance Matrix');
  } else {
    // Generate Vertical Detail List
    const headerRow = [
      'Date',
      'Staff Code',
      'Staff Name',
      'Center',
      'Status',
      'In Time',
      'Out Time',
      'Distance (m)',
      'Within Radius',
      'Verified By',
      'Remarks',
    ];

    const rows: any[] = [];
    rows.push(['ONLINE ATTENDANCE MANAGEMENT SYSTEM - CHRONOLOGICAL LOG REPORT']);
    rows.push([`Center: ${center ? center.name : 'All Centers'}`]);
    rows.push([`Report Generated: ${new Date().toLocaleString('en-IN')}`]);
    rows.push([]);
    rows.push(headerRow);

    const sortedRecords = [...records].sort((a, b) => b.date.localeCompare(a.date));
    sortedRecords.forEach((r) => {
      rows.push([
        r.date,
        staffList.find((s) => s.id === r.staffId)?.staffCode || r.staffId,
        r.staffName,
        r.centerName,
        r.status,
        r.inTime || '--:--',
        r.outTime || '--:--',
        r.inDistanceMeters != null ? `${r.inDistanceMeters}m` : 'N/A',
        r.inWithinRadius ? 'YES' : 'NO',
        r.inVerifiedMethod || 'N/A',
        r.remarks || '-',
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Detailed Attendance Log');
  }

  const fileName = `Attendance_Report_${center ? center.code : 'ALL'}_${monthYearStr}_${format.toLowerCase()}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

export function exportAttendanceToPDF(
  records: AttendanceRecord[],
  staffList: Staff[],
  center: Center | null,
  monthYearStr: string,
  format: 'HORIZONTAL_MATRIX' | 'VERTICAL_DATE'
) {
  const doc = new jsPDF({
    orientation: format === 'HORIZONTAL_MATRIX' ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Primary Header Blue Banner
  doc.setFillColor(30, 58, 138); // Navy blue (#1e3a8a)
  doc.rect(0, 0, pageWidth, 26, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('ONLINE ATTENDANCE MANAGEMENT SYSTEM', pageWidth / 2, 11, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Center: ${center ? center.name : 'Consolidated All Centers'} | Period: ${monthYearStr} | Generated: ${new Date().toLocaleDateString('en-IN')}`,
    pageWidth / 2,
    18,
    { align: 'center' }
  );

  doc.setTextColor(30, 41, 59);
  let yPos = 35;

  if (format === 'HORIZONTAL_MATRIX') {
    const [yearStr, monthStr] = monthYearStr.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const daysInMonth = new Date(year, month, 0).getDate();

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Monthly Attendance Matrix Sheet (1 to ${daysInMonth})`, 14, yPos);
    yPos += 6;

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('Legend: [P] Present  [L] Late  [LV] Leave  [H] Holiday  [WO] Weekly Off / Sunday  [A] Absent', 14, yPos);
    yPos += 6;

    // Draw table header
    doc.setFillColor(241, 245, 249);
    doc.rect(14, yPos, pageWidth - 28, 7, 'F');
    doc.setTextColor(30, 58, 138);
    doc.setFont('helvetica', 'bold');
    doc.text('Staff Name', 16, yPos + 5);

    const dateColStart = 70;
    const colWidth = (pageWidth - 28 - 95) / daysInMonth;

    for (let d = 1; d <= daysInMonth; d++) {
      doc.text(String(d), dateColStart + (d - 1) * colWidth + 1, yPos + 5);
    }
    doc.text('P', pageWidth - 36, yPos + 5);
    doc.text('A', pageWidth - 28, yPos + 5);
    doc.text('L', pageWidth - 20, yPos + 5);

    yPos += 8;

    staffList.forEach((stf) => {
      if (yPos > 185) {
        doc.addPage();
        yPos = 20;
      }

      const staffRecords = records.filter(
        (r) => r.staffId === stf.id && r.date.startsWith(monthYearStr)
      );

      let presentCount = 0;
      let lateCount = 0;
      let leaveCount = 0;
      let absentCount = 0;

      const dateStatusMap: Record<number, string> = {};
      staffRecords.forEach((r) => {
        const dayNum = parseInt(r.date.split('-')[2], 10);
        if (r.status === 'PRESENT') {
          dateStatusMap[dayNum] = 'P';
          presentCount++;
        } else if (r.status === 'LATE') {
          dateStatusMap[dayNum] = 'L';
          lateCount++;
          presentCount++;
        } else if (r.status === 'LEAVE') {
          dateStatusMap[dayNum] = 'LV';
          leaveCount++;
        } else if (r.status === 'HOLIDAY') {
          dateStatusMap[dayNum] = 'H';
        } else {
          dateStatusMap[dayNum] = 'A';
          absentCount++;
        }
      });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(15, 23, 42);
      doc.text(`${stf.name.substring(0, 18)} (${stf.staffCode})`, 16, yPos + 4);

      for (let d = 1; d <= daysInMonth; d++) {
        const dateObj = new Date(year, month - 1, d);
        const isSunday = dateObj.getDay() === 0;
        const val = dateStatusMap[d] || (isSunday ? 'WO' : '-');

        if (val === 'P') doc.setTextColor(22, 101, 52);
        else if (val === 'L') doc.setTextColor(194, 65, 12);
        else if (val === 'LV') doc.setTextColor(202, 138, 4);
        else if (val === 'A') doc.setTextColor(185, 28, 28);
        else doc.setTextColor(100, 116, 139);

        doc.text(val, dateColStart + (d - 1) * colWidth + 1, yPos + 4);
      }

      doc.setTextColor(22, 101, 52);
      doc.text(String(presentCount), pageWidth - 36, yPos + 4);
      doc.setTextColor(185, 28, 28);
      doc.text(String(absentCount), pageWidth - 28, yPos + 4);
      doc.setTextColor(202, 138, 4);
      doc.text(String(leaveCount), pageWidth - 20, yPos + 4);

      doc.setDrawColor(226, 232, 240);
      doc.line(14, yPos + 6, pageWidth - 14, yPos + 6);
      yPos += 7;
    });
  } else {
    // Vertical chronological log
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Chronological Attendance Log Records', 14, yPos);
    yPos += 6;

    // Header
    doc.setFillColor(241, 245, 249);
    doc.rect(14, yPos, pageWidth - 28, 7, 'F');
    doc.setTextColor(30, 58, 138);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('Date', 16, yPos + 5);
    doc.text('Staff Name', 38, yPos + 5);
    doc.text('Status', 85, yPos + 5);
    doc.text('In Time', 105, yPos + 5);
    doc.text('Out Time', 125, yPos + 5);
    doc.text('GPS Dist', 145, yPos + 5);
    doc.text('Method', 168, yPos + 5);
    yPos += 8;

    const sortedRecords = [...records].sort((a, b) => b.date.localeCompare(a.date));
    sortedRecords.forEach((r) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(30, 41, 59);

      doc.text(r.date, 16, yPos + 4);
      doc.text(r.staffName.substring(0, 22), 38, yPos + 4);

      if (r.status === 'PRESENT') doc.setTextColor(22, 101, 52);
      else if (r.status === 'LATE') doc.setTextColor(194, 65, 12);
      else if (r.status === 'LEAVE') doc.setTextColor(202, 138, 4);
      else doc.setTextColor(185, 28, 28);
      doc.text(r.status, 85, yPos + 4);

      doc.setTextColor(30, 41, 59);
      doc.text(r.inTime || '--:--', 105, yPos + 4);
      doc.text(r.outTime || '--:--', 125, yPos + 4);
      doc.text(r.inDistanceMeters != null ? `${r.inDistanceMeters}m` : 'N/A', 145, yPos + 4);
      doc.text(r.inVerifiedMethod || 'N/A', 168, yPos + 4);

      doc.setDrawColor(241, 245, 249);
      doc.line(14, yPos + 6, pageWidth - 14, yPos + 6);
      yPos += 6.5;
    });
  }

  // Footer note
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'For any assistance, technical inquiries or database audits, contact Er. Neeraj Kumar (erneerajk33@gmail.com)',
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 6,
    { align: 'center' }
  );

  doc.save(`Attendance_Report_${center ? center.code : 'ALL'}_${monthYearStr}.pdf`);
}

import * as XLSX from 'xlsx';
import { AppDatabase, Student, SUBJECT_LIST, SemesterKey } from '../types';
import { calculateStudentGraduationSummary, cleanBirthDateString } from './calculations';

export function exportFullExcelDatabase(db: AppDatabase) {
  const wb = XLSX.utils.book_new();

  // 1. SHEET: INFO_SEKOLAH
  const schoolRows = [
    { Parameter: 'Nama Sekolah', Nilai: db.school.name },
    { Parameter: 'NPSN', Nilai: db.school.npsn },
    { Parameter: 'NSS', Nilai: db.school.nss },
    { Parameter: 'Alamat', Nilai: db.school.address },
    { Parameter: 'Desa / Kelurahan', Nilai: db.school.village },
    { Parameter: 'Kecamatan', Nilai: db.school.district },
    { Parameter: 'Kabupaten', Nilai: db.school.regency },
    { Parameter: 'Provinsi', Nilai: db.school.province },
    { Parameter: 'Kode Pos', Nilai: db.school.postalCode },
    { Parameter: 'Tahun Pelajaran', Nilai: db.school.academicYear },
    { Parameter: 'Kepala Sekolah', Nilai: db.school.principalName },
    { Parameter: 'NIP Kepala Sekolah', Nilai: db.school.principalNip },
    { Parameter: 'Bobot Nilai Rapor (%)', Nilai: db.school.reportWeight },
    { Parameter: 'Bobot Nilai Ujian (%)', Nilai: db.school.examWeight },
    { Parameter: 'KKM Kelulusan', Nilai: db.school.passingKkm },
    { Parameter: 'Tanggal Kelulusan', Nilai: db.school.graduationDate },
    { Parameter: 'Nomor Surat Keputusan Kelulusan', Nilai: db.school.skNumber },
  ];
  const wsSchool = XLSX.utils.json_to_sheet(schoolRows);
  XLSX.utils.book_append_sheet(wb, wsSchool, 'INFO_SEKOLAH');

  // 2. SHEET: DATA_SISWA
  const studentRows = db.students.map((s, idx) => ({
    'No': idx + 1,
    'ID': s.id,
    'Kelas': s.classRoom,
    'NIS': s.nis,
    'NISN': s.nisn,
    'Nama Lengkap': s.name,
    'L/P': s.gender,
    'Tempat Lahir': s.birthPlace,
    'Tanggal Lahir': s.birthDate,
    'Nama Orang Tua / Wali': s.parentName,
    'Alamat Rumah': s.address || '-',
    'No Telepon': s.phone || '-',
    'Nomor Seri Ijazah': s.serialNumber || `DN-02/D-SD/27/01/${s.nis.padStart(4, '0')}`
  }));
  const wsStudents = XLSX.utils.json_to_sheet(studentRows);
  XLSX.utils.book_append_sheet(wb, wsStudents, 'DATA_SISWA');

  // 3. SHEET: REKAP_IJAZAH_DKN
  const dknRows = db.students.map((s, idx) => {
    const summary = calculateStudentGraduationSummary(
      s,
      db.grades[s.id],
      db.exams[s.id],
      db.school
    );
    
    const row: Record<string, string | number> = {
      'No': idx + 1,
      'Kelas': s.classRoom,
      'NISN': s.nisn,
      'Nama Siswa': s.name,
      'L/P': s.gender,
    };

    summary.subjects.forEach((sub) => {
      row[sub.subjectCode] = sub.finalScore;
    });

    row['Rata-Rata Rapor (6 Smt)'] = summary.grandRaporAvg;
    row['Rata-Rata Ujian Sekolah'] = summary.grandExamAvg;
    row['NILAI AKHIR IJAZAH'] = summary.finalScore;
    row['Predikat'] = summary.predicate;
    row['Status Kelulusan'] = summary.isPassed ? 'LULUS' : 'TIDAK LULUS';
    row['No Seri Ijazah'] = summary.serialNumber;

    return row;
  });
  const wsDkn = XLSX.utils.json_to_sheet(dknRows);
  XLSX.utils.book_append_sheet(wb, wsDkn, 'REKAP_IJAZAH_DKN');

  // 4. SHEET: RAPOR_6_SEMESTER
  const semKeys: { key: SemesterKey; label: string }[] = [
    { key: 'K4_S1', label: 'K4-Smt1' },
    { key: 'K4_S2', label: 'K4-Smt2' },
    { key: 'K5_S1', label: 'K5-Smt1' },
    { key: 'K5_S2', label: 'K5-Smt2' },
    { key: 'K6_S1', label: 'K6-Smt1' },
    { key: 'K6_S2', label: 'K6-Smt2' },
  ];

  const raporRows: Record<string, string | number>[] = [];
  db.students.forEach((s, idx) => {
    semKeys.forEach((sem) => {
      const g = (db.grades[s.id] && db.grades[s.id][sem.key]) || {};
      const row: Record<string, string | number> = {
        'No': idx + 1,
        'Kelas': s.classRoom,
        'NISN': s.nisn,
        'Nama Siswa': s.name,
        'Semester': sem.label,
      };

      let sum = 0;
      SUBJECT_LIST.forEach((sub) => {
        const val = g[sub.id] || 0;
        row[sub.code] = val;
        sum += val;
      });

      row['Rata-Rata'] = Number((sum / SUBJECT_LIST.length).toFixed(2));
      raporRows.push(row);
    });
  });
  const wsRapor = XLSX.utils.json_to_sheet(raporRows);
  XLSX.utils.book_append_sheet(wb, wsRapor, 'RAPOR_6_SEMESTER');

  // 5. SHEET: UJIAN_SEKOLAH
  const examRows = db.students.map((s, idx) => {
    const ex = db.exams[s.id] || {};
    const row: Record<string, string | number> = {
      'No': idx + 1,
      'Kelas': s.classRoom,
      'NISN': s.nisn,
      'Nama Siswa': s.name,
    };

    let total = 0;
    SUBJECT_LIST.forEach((sub) => {
      const detail = ex[sub.id];
      const score = detail ? detail.finalScore : 0;
      row[`${sub.code}_Nilai_Tulis`] = detail && detail.written > 0 ? detail.written : '';
      if (sub.hasPractice) {
        row[`${sub.code}_Nilai_Praktek`] = detail && detail.practice > 0 ? detail.practice : '';
      }
      row[`${sub.code}_Nilai_Akhir_US`] = score > 0 ? score : '';
      total += score;
    });

    row['Rata-Rata US'] = total > 0 ? Number((total / SUBJECT_LIST.length).toFixed(2)) : '';
    return row;
  });
  const wsExam = XLSX.utils.json_to_sheet(examRows);
  XLSX.utils.book_append_sheet(wb, wsExam, 'UJIAN_SEKOLAH');

  // Apply Arial font and auto column widths to all sheets
  const allSheets = [wsSchool, wsStudents, wsDkn, wsRapor, wsExam];
  allSheets.forEach((ws) => {
    if (!ws['!ref']) return;
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell_address = XLSX.utils.encode_cell({ c: C, r: R });
        if (ws[cell_address]) {
          if (!ws[cell_address].s) ws[cell_address].s = {};
          ws[cell_address].s.font = { name: 'Arial', sz: 10 };
        }
      }
    }
  });

  // Write and trigger download
  const dateStr = new Date().toISOString().slice(0, 10);
  const fileName = `Database_Nilai_SDN_Babelan_Kota_01_TP_2026_2027_${dateStr}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

export function downloadEmptyExcelTemplate() {
  const wb = XLSX.utils.book_new();

  // Template Data Siswa
  const sampleStudents = [
    {
      'Kelas': '6A',
      'NIS': '2101',
      'NISN': '0134829101',
      'Nama Lengkap': 'CONTOH NAMA SISWA',
      'L/P': 'L',
      'Tempat Lahir': 'Bekasi',
      'Tanggal Lahir': '2014-04-12',
      'Nama Orang Tua / Wali': 'Nama Ayah / Ibu',
      'Alamat Rumah': 'Kp. Babelan RT 01/01',
      'No Telepon': '08123456789'
    }
  ];
  const wsStudents = XLSX.utils.json_to_sheet(sampleStudents);
  XLSX.utils.book_append_sheet(wb, wsStudents, 'DATA_SISWA');

  // Template Nilai Semester
  const sampleGrades = [
    {
      'NISN': '0134829101',
      'Semester': 'K6_S1',
      'PAI': 85,
      'PPKn': 86,
      'B.INDO': 88,
      'MTK': 84,
      'IPAS': 85,
      'SBdP': 87,
      'PJOK': 88,
      'B.SUNDA': 86,
      'B.ING': 85
    }
  ];
  const wsGrades = XLSX.utils.json_to_sheet(sampleGrades);
  XLSX.utils.book_append_sheet(wb, wsGrades, 'NILAI_SEMESTER');

  XLSX.writeFile(wb, 'Format_Template_Input_SDN_Babelan_Kota_01.xlsx');
}

export async function parseExcelDatabase(file: File): Promise<{
  students?: Student[];
  grades?: Record<string, any>;
  exams?: Record<string, any>;
  message: string;
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });

        const importedStudents: Student[] = [];

        // Check if DATA_SISWA sheet exists
        const studentSheetName = wb.SheetNames.find(n => n.toUpperCase().includes('SISWA') || n.toUpperCase().includes('STUDENT'));
        if (studentSheetName) {
          const rawStudents = XLSX.utils.sheet_to_json<any>(wb.Sheets[studentSheetName]);
          rawStudents.forEach((row, i) => {
            const nisn = String(row['NISN'] || row['nisn'] || '').trim();
            const nis = String(row['NIS'] || row['nis'] || '').trim();
            const name = String(row['Nama Lengkap'] || row['Nama Siswa'] || row['Nama'] || row['name'] || '').trim();
            const classRoom = String(row['Kelas'] || row['classRoom'] || '6A').toUpperCase().trim() as any;
            
            if (name && (nisn || nis)) {
              importedStudents.push({
                id: row['ID'] || `imported_${Date.now()}_${i}`,
                nis: nis || `21${(i + 1).toString().padStart(2, '0')}`,
                nisn: nisn || `013${(i + 1).toString().padStart(7, '0')}`,
                name: name.toUpperCase(),
                gender: String(row['L/P'] || row['gender'] || 'L').toUpperCase().startsWith('P') ? 'P' : 'L',
                classRoom: ['6A', '6B', '6C', '6D'].includes(classRoom) ? classRoom : '6A',
                birthPlace: String(row['Tempat Lahir'] || 'Bekasi').trim(),
                birthDate: cleanBirthDateString(row['Tanggal Lahir']) || '2014-06-06',
                parentName: String(row['Nama Orang Tua / Wali'] || row['Orang Tua'] || '-').trim(),
                address: String(row['Alamat Rumah'] || row['Alamat'] || '-').trim(),
                phone: String(row['No Telepon'] || '-').trim(),
                serialNumber: row['Nomor Seri Ijazah'] || row['No Seri Ijazah']
              });
            }
          });
        }

        resolve({
          students: importedStudents.length > 0 ? importedStudents : undefined,
          message: `Berhasil membaca file Excel. Ditemukan ${importedStudents.length} siswa.`
        });
      } catch (err: any) {
        reject(new Error('Gagal memproses file Excel: ' + err.message));
      }
    };
    reader.onerror = () => reject(new Error('Gagal membaca file dari disk'));
    reader.readAsArrayBuffer(file);
  });
}

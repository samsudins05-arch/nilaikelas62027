import { AppDatabase, Student, StudentGrades, StudentExams, SUBJECT_LIST, SemesterKey } from '../types';

export const INITIAL_SCHOOL: AppDatabase['school'] = {
  name: 'SD NEGERI BABELAN KOTA 01',
  npsn: '20218320',
  nss: '101022101001',
  address: 'Jl. Pasar Babelan No. 01, Desa Babelan Kota',
  village: 'Babelan Kota',
  district: 'Kecamatan Babelan',
  regency: 'Kabupaten Bekasi',
  province: 'Jawa Barat',
  postalCode: '17610',
  academicYear: '2026/2027',
  principalName: 'H. SAMSUDIN, S.Pd., M.M.',
  principalNip: '197105151996031004',
  reportWeight: 60,
  examWeight: 40,
  passingKkm: 75.0,
  graduationDate: '10 Juni 2027',
  skNumber: '421.2/085/SDN-BK01/VI/2027'
};

/**
 * Data bawaan siswa dan nilai dikosongkan sesuai permintaan pengguna.
 * Pengguna dapat menginput data siswa asli atau menyinkronkan dari Google Spreadsheet.
 */
export const INITIAL_STUDENTS: Student[] = [];

export function generateInitialGrades(students: Student[] = []): Record<string, StudentGrades> {
  const grades: Record<string, StudentGrades> = {};
  return grades;
}

export function generateInitialExams(students: Student[] = []): Record<string, StudentExams> {
  const exams: Record<string, StudentExams> = {};
  return exams;
}

export function getInitialDatabase(): AppDatabase {
  return {
    school: INITIAL_SCHOOL,
    students: [],
    grades: {},
    exams: {},
  };
}

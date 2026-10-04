export type ClassRoom = '6A' | '6B' | '6C' | '6D';

export type SemesterKey = 'K4_S1' | 'K4_S2' | 'K5_S1' | 'K5_S2' | 'K6_S1' | 'K6_S2';

export interface SubjectItem {
  id: string;
  code: string;
  name: string;
  kkm: number;
  hasPractice: boolean;
}

export const SUBJECT_LIST: SubjectItem[] = [
  { id: 'pai', code: 'PAI', name: 'Pendidikan Agama dan Budi Pekerti', kkm: 75, hasPractice: true },
  { id: 'ppkn', code: 'PPKn', name: 'Pendidikan Pancasila dan Kewarganegaraan', kkm: 75, hasPractice: false },
  { id: 'bindo', code: 'B.INDO', name: 'Bahasa Indonesia', kkm: 75, hasPractice: true },
  { id: 'mtk', code: 'MTK', name: 'Matematika', kkm: 75, hasPractice: false },
  { id: 'ipas', code: 'IPAS', name: 'Ilmu Pengetahuan Alam dan Sosial', kkm: 75, hasPractice: true },
  { id: 'sbdp', code: 'SBdP', name: 'Seni Budaya dan Prakarya', kkm: 75, hasPractice: true },
  { id: 'pjok', code: 'PJOK', name: 'Pendidikan Jasmani, Olahraga & Kesehatan', kkm: 75, hasPractice: true },
  { id: 'sunda', code: 'B.SUNDA', name: 'Bahasa Sunda (Muatan Lokal Jabar)', kkm: 75, hasPractice: true },
  { id: 'bing', code: 'B.ING', name: 'Bahasa Inggris (Muatan Lokal)', kkm: 75, hasPractice: false },
];

export const SEMESTER_LIST: { key: SemesterKey; label: string; period: string; year: string }[] = [
  { key: 'K4_S1', label: 'Kelas 4 Semester 1', period: 'Semester Gasal', year: '2024/2025' },
  { key: 'K4_S2', label: 'Kelas 4 Semester 2', period: 'Semester Genap', year: '2024/2025' },
  { key: 'K5_S1', label: 'Kelas 5 Semester 1', period: 'Semester Gasal', year: '2025/2026' },
  { key: 'K5_S2', label: 'Kelas 5 Semester 2', period: 'Semester Genap', year: '2025/2026' },
  { key: 'K6_S1', label: 'Kelas 6 Semester 1', period: 'Semester Gasal', year: '2026/2027' },
  { key: 'K6_S2', label: 'Kelas 6 Semester 2', period: 'Semester Genap', year: '2026/2027' },
];

export interface Student {
  id: string;
  nis: string;
  nisn: string;
  name: string;
  gender: 'L' | 'P';
  classRoom: ClassRoom;
  birthPlace: string;
  birthDate: string; // YYYY-MM-DD
  parentName: string;
  address?: string;
  phone?: string;
  serialNumber?: string;
  photo?: string; // Data URL / Base64 Pas Foto Siswa 3x4
}

export type SubjectScores = Record<string, number>; // key is subject id (pai, ppkn, etc.) -> score

export type StudentGrades = Record<SemesterKey, SubjectScores>;

export interface ExamScoreDetail {
  written: number;
  practice: number;
  finalScore: number;
}

export type StudentExams = Record<string, ExamScoreDetail>; // key is subject id

export interface SchoolProfile {
  name: string;
  npsn: string;
  nss: string;
  address: string;
  village: string;
  district: string;
  regency: string;
  province: string;
  postalCode: string;
  academicYear: string;
  principalName: string;
  principalNip: string;
  reportWeight: number; // e.g., 60
  examWeight: number;   // e.g., 40
  passingKkm: number;   // e.g., 75
  graduationDate: string; // e.g., "10 Juni 2027"
  skNumber: string;       // e.g., "421.2/085/SDN-BK01/VI/2027"
  customKopImage?: string; // Data URL / Base64 gambar kop surat sekolah
}

export interface AppDatabase {
  school: SchoolProfile;
  students: Student[];
  grades: Record<string, StudentGrades>; // studentId -> StudentGrades
  exams: Record<string, StudentExams>;   // studentId -> StudentExams
}

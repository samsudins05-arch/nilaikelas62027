import React from 'react';
import { 
  Users, 
  GraduationCap, 
  Award, 
  BookOpen, 
  Printer, 
  CheckCircle2, 
  TrendingUp, 
  ChevronRight
} from 'lucide-react';
import { AppDatabase, ClassRoom, SUBJECT_LIST } from '../types';
import { calculateStudentGraduationSummary } from '../utils/calculations';

interface DashboardTabProps {
  db: AppDatabase;
  onSelectTab: (tab: string) => void;
  onPrintStudentSKL: (studentId: string) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  db,
  onSelectTab,
  onPrintStudentSKL
}) => {
  const classes: ClassRoom[] = ['6A', '6B', '6C', '6D'];

  // Calculate summaries for all students
  const studentSummaries = db.students.map((s) =>
    calculateStudentGraduationSummary(s, db.grades[s.id], db.exams[s.id], db.school)
  );

  const totalStudents = db.students.length;
  const passedStudents = studentSummaries.filter((s) => s.isPassed).length;
  const passRate = totalStudents > 0 ? ((passedStudents / totalStudents) * 100).toFixed(0) : '0';
  
  const grandAvg = totalStudents > 0
    ? (studentSummaries.reduce((acc, curr) => acc + curr.finalScore, 0) / totalStudents).toFixed(1)
    : '0.0';

  const classStats = classes.map((c) => {
    const classStudents = studentSummaries.filter((s) => s.student.classRoom === c);
    const count = classStudents.length;
    const avg = count > 0
      ? (classStudents.reduce((acc, curr) => acc + curr.finalScore, 0) / count).toFixed(1)
      : '0.0';
    const topStudent = [...classStudents].sort((a, b) => b.finalScore - a.finalScore)[0];
    return {
      className: c,
      count,
      avg,
      topStudent: topStudent ? topStudent.student.name : '-'
    };
  });

  // Top 5 Highest Achieving Students
  const topGraduates = [...studentSummaries]
    .sort((a, b) => b.finalScore - a.finalScore)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      
      {/* Banner Pengumuman & Identitas */}
      <div className="bg-gradient-to-r from-[#1E3A8A] via-[#2563EB] to-[#3B82F6] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur rounded-full text-xs font-bold text-amber-300 mb-2 border border-white/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Sistem Aktif & Terintegrasi
            </div>
            <h2 className="text-2xl font-black tracking-tight">
              Portal Nilai Rapor & Rekap Ijazah SD Negeri Babelan Kota 01
            </h2>
            <p className="text-xs text-blue-100 mt-1 max-w-2xl leading-relaxed">
              Pengolahan nilai rapor 6 semester (Kelas 4 Semester 1 s/d Kelas 6 Semester 2), Ujian Sekolah Tulis & Praktek, DKN Kelulusan, cetak SKL resmi, dan database Google Spreadsheet terpadu.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onSelectTab('graduation')}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-[#172554] rounded-xl text-xs font-bold shadow-md transition transform active:scale-95 flex items-center gap-1.5"
            >
              <Award className="w-4 h-4" />
              Buka DKN Ijazah
            </button>
          </div>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Siswa Kelas 6</p>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2 num-font">{totalStudents}</p>
          <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
            <span className="font-semibold text-blue-700">4 Kelas:</span>
            <span>6A, 6B, 6C, 6D</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Cakupan Rapor</p>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-indigo-700 mt-2 num-font">6 Semester</p>
          <p className="text-xs text-slate-500 mt-2">
            9 Mapel Lengkap (PAI s/d B.Inggris)
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Rata-Rata Akhir Ijazah</p>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-[#1E3A8A] mt-2 num-font">{grandAvg}</p>
          <p className="text-xs text-slate-500 mt-2">
            Bobot: {db.school.reportWeight}% Rapor + {db.school.examWeight}% US
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">Tingkat Kelulusan</p>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-emerald-600 mt-2 num-font">{passRate}%</p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-700 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{passedStudents} dari {totalStudents} Siswa LULUS</span>
          </div>
        </div>

      </div>

      {/* Rombel Class Breakdown Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">
            Statistik Per Rombongan Belajar (Rombel)
          </h3>
          <span className="text-xs text-slate-500">SDN Babelan Kota 01</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {classStats.map((c) => (
            <div 
              key={c.className}
              className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-sm transition group"
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 bg-blue-100 text-blue-900 font-extrabold text-sm rounded-lg">
                  Kelas {c.className}
                </span>
                <span className="text-xs font-semibold text-slate-500 num-font">
                  {c.count} Siswa
                </span>
              </div>
              <div className="mt-4">
                <p className="text-xs text-slate-500 font-medium">Rata-rata Nilai Ijazah:</p>
                <p className="text-2xl font-bold text-slate-900 num-font mt-0.5">{c.avg}</p>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100">
                <p className="text-[11px] text-slate-500">Nilai Tertinggi:</p>
                <p className="text-xs font-semibold text-blue-700 truncate" title={c.topStudent}>
                  {c.topStudent}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        <div 
          onClick={() => onSelectTab('students')}
          className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm hover:border-blue-500 hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 group-hover:bg-blue-600 group-hover:text-white text-blue-700 flex items-center justify-center transition-colors mb-3">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-base group-hover:text-blue-700 transition-colors">
              Data Siswa Kelas 6
            </h4>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Kelola biodata siswa, NIS, NISN resmi, tempat tanggal lahir, data orang tua, dan nomor seri ijazah.
            </p>
          </div>
          <div className="mt-5 flex items-center text-xs font-bold text-blue-700 group-hover:translate-x-1 transition-transform">
            <span>Buka Data Siswa</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </div>
        </div>

        <div 
          onClick={() => onSelectTab('semesters')}
          className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm hover:border-blue-500 hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="w-11 h-11 rounded-xl bg-indigo-50 group-hover:bg-indigo-600 group-hover:text-white text-indigo-700 flex items-center justify-center transition-colors mb-3">
              <BookOpen className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-base group-hover:text-indigo-700 transition-colors">
              Nilai Rapor 6 Semester
            </h4>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Input dan kelola nilai 9 mata pelajaran untuk K4 Smt 1/2, K5 Smt 1/2, dan K6 Smt 1/2 dengan rata-rata otomatis.
            </p>
          </div>
          <div className="mt-5 flex items-center text-xs font-bold text-indigo-700 group-hover:translate-x-1 transition-transform">
            <span>Input Nilai Rapor</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </div>
        </div>

        <div 
          onClick={() => onSelectTab('graduation')}
          className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm hover:border-blue-500 hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 group-hover:bg-amber-500 group-hover:text-slate-950 text-amber-700 flex items-center justify-center transition-colors mb-3">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-base group-hover:text-blue-700 transition-colors">
              DKN & Kelulusan Ijazah
            </h4>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Rekapitulasi DKN, Nilai Akhir Ijazah 9 mata pelajaran, dan cetak Surat Keterangan Lulus (SKL) resmi.
            </p>
          </div>
          <div className="mt-5 flex items-center text-xs font-bold text-blue-700 group-hover:translate-x-1 transition-transform">
            <span>Buka DKN & Ijazah</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </div>
        </div>

      </div>

      {/* Top 5 High Achieving Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-slate-900 text-sm">
              5 Siswa Peraih Nilai Akhir Ijazah Tertinggi (SDN Babelan Kota 01)
            </h3>
          </div>
          <button 
            onClick={() => onSelectTab('graduation')}
            className="text-xs font-bold text-blue-700 hover:underline"
          >
            Lihat Semua Siswa &rarr;
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Peringkat</th>
                <th className="py-3 px-4">Kelas</th>
                <th className="py-3 px-4">NISN</th>
                <th className="py-3 px-4">Nama Siswa</th>
                <th className="py-3 px-4 text-center">Rata-Rata Rapor (60%)</th>
                <th className="py-3 px-4 text-center">Ujian Sekolah (40%)</th>
                <th className="py-3 px-4 text-center font-bold text-blue-900">Nilai Akhir Ijazah</th>
                <th className="py-3 px-4 text-center">Predikat</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topGraduates.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Belum ada data siswa untuk ditampilkan. Silakan input data siswa di menu <strong>Data Siswa Kelas 6</strong> atau sinkronkan dengan Google Spreadsheet.
                  </td>
                </tr>
              ) : (
                topGraduates.map((item, idx) => (
                <tr key={item.student.id} className="hover:bg-blue-50/40 transition">
                  <td className="py-3 px-4 font-bold text-amber-600 num-font">
                    #{idx + 1}
                  </td>
                  <td className="py-3 px-4 font-bold text-blue-900">
                    {item.student.classRoom}
                  </td>
                  <td className="py-3 px-4 num-font text-slate-600">
                    {item.student.nisn}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    {item.student.name}
                  </td>
                  <td className="py-3 px-4 text-center num-font text-slate-700">
                    {item.grandRaporAvg}
                  </td>
                  <td className="py-3 px-4 text-center num-font text-slate-700">
                    {item.grandExamAvg}
                  </td>
                  <td className="py-3 px-4 text-center font-extrabold text-blue-700 text-sm num-font">
                    {item.finalScore}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[11px]">
                      {item.predicate} ({item.predicateText})
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => onPrintStudentSKL(item.student.id)}
                      className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg text-[11px] inline-flex items-center gap-1 transition"
                    >
                      <Printer className="w-3 h-3" />
                      Cetak SKL
                    </button>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

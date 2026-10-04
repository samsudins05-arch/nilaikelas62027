import React, { useState } from 'react';
import { 
  Award, 
  Printer, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Filter, 
  FileSpreadsheet,
  Download
} from 'lucide-react';
import { AppDatabase, ClassRoom, Student } from '../types';
import { calculateStudentGraduationSummary } from '../utils/calculations';

interface GraduationTabProps {
  db: AppDatabase;
  onPrintStudentSKL: (studentId: string) => void;
  onPrintStudentTranskrip: (studentId: string) => void;
  onExportExcel: () => void;
}

export const GraduationTab: React.FC<GraduationTabProps> = ({
  db,
  onPrintStudentSKL,
  onPrintStudentTranskrip,
  onExportExcel
}) => {
  const [selectedClass, setSelectedClass] = useState<string>('ALL');

  const summaries = db.students.map((s) =>
    calculateStudentGraduationSummary(s, db.grades[s.id], db.exams[s.id], db.school)
  );

  const filteredSummaries = summaries.filter((s) => {
    return selectedClass === 'ALL' || s.student.classRoom === selectedClass;
  });

  const passedCount = filteredSummaries.filter((s) => s.isPassed).length;
  const failedCount = filteredSummaries.length - passedCount;

  return (
    <div className="space-y-4">
      
      {/* Header Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Rekapitulasi DKN & Kelulusan Ijazah TP 2026/2027
              </h2>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                KKM &ge; {db.school.passingKkm}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              SD Negeri Babelan Kota 01 · Komposisi Kelulusan: {db.school.reportWeight}% Rapor 6 Semester + {db.school.examWeight}% Ujian Sekolah
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Tabel DKN</span>
            </button>

            <button
              onClick={onExportExcel}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export DKN (.xlsx)</span>
            </button>
          </div>
        </div>

        {/* Filter Rombel & Stat Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-blue-700" />
              Filter Kelas:
            </span>
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              {['ALL', '6A', '6B', '6C', '6D'].map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedClass(c)}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    selectedClass === c
                      ? 'bg-blue-700 text-white font-bold shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {c === 'ALL' ? 'Semua Kelas' : `Kelas ${c}`}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 font-bold rounded-lg border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>LULUS: {passedCount} Siswa</span>
            </div>
            {failedCount > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-800 font-bold rounded-lg border border-red-200">
                <XCircle className="w-4 h-4 text-red-600" />
                <span>BELUM LULUS: {failedCount} Siswa</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DKN Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#172554] text-white font-semibold">
              <tr>
                <th className="py-3 px-3 border-r border-blue-900/60 w-10 text-center">No</th>
                <th className="py-3 px-3 border-r border-blue-900/60 w-14 text-center">Kelas</th>
                <th className="py-3 px-3 border-r border-blue-900/60 w-28">NISN</th>
                <th className="py-3 px-3.5 border-r border-blue-900/60 min-w-[190px]">Nama Lengkap Siswa</th>
                <th className="py-3 px-3 border-r border-blue-900/60 text-center">
                  Rata Rapor (6 Smt)
                </th>
                <th className="py-3 px-3 border-r border-blue-900/60 text-center">
                  Rata US
                </th>
                <th className="py-3 px-3 border-r border-blue-900/60 text-center bg-blue-900 font-extrabold text-amber-300">
                  Nilai Ijazah
                </th>
                <th className="py-3 px-3 border-r border-blue-900/60 text-center">
                  Predikat
                </th>
                <th className="py-3 px-3 border-r border-blue-900/60 text-center">
                  Status
                </th>
                <th className="py-3 px-3.5 border-r border-blue-900/60">
                  No. Seri Ijazah
                </th>
                <th className="py-3 px-3 text-center no-print w-28">
                  Cetak Dokumen
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSummaries.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    Tidak ada data siswa untuk kelas ini.
                  </td>
                </tr>
              ) : (
                filteredSummaries.map((item, idx) => (
                  <tr key={item.student.id} className="hover:bg-blue-50/40 transition">
                    <td className="py-2.5 px-3 border-r border-slate-100 text-center font-bold text-slate-500 num-font">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-100 text-center">
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-extrabold text-[11px]">
                        {item.student.classRoom}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-100 num-font text-slate-700">
                      {item.student.nisn}
                    </td>
                    <td className="py-2.5 px-3.5 border-r border-slate-100 font-bold text-slate-900">
                      {item.student.name}
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-100 text-center num-font text-slate-800">
                      {item.grandRaporAvg}
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-100 text-center num-font text-slate-800">
                      {item.grandExamAvg}
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-100 text-center font-extrabold text-[#1E3A8A] text-sm num-font bg-blue-50/40">
                      {item.finalScore}
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-100 text-center">
                      <span className="font-semibold text-slate-700">
                        {item.predicate} ({item.predicateText})
                      </span>
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-100 text-center">
                      {item.isPassed ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px]">
                          LULUS
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-extrabold text-[10px]">
                          TIDAK LULUS
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3.5 border-r border-slate-100 num-font text-[11px] text-slate-600">
                      {item.serialNumber}
                    </td>
                    <td className="py-2.5 px-3 text-center no-print">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onPrintStudentSKL(item.student.id)}
                          className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition"
                          title="Cetak Surat Keterangan Lulus (SKL)"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onPrintStudentTranskrip(item.student.id)}
                          className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition"
                          title="Cetak Transkrip Nilai Rapor 6 Semester"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                      </div>
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

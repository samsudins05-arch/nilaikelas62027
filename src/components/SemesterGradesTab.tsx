import React, { useState } from 'react';
import { 
  BookOpen, 
  Save, 
  Printer, 
  Check 
} from 'lucide-react';
import { 
  Student, 
  StudentGrades, 
  SemesterKey, 
  SEMESTER_LIST, 
  SUBJECT_LIST, 
  ClassRoom 
} from '../types';

interface SemesterGradesTabProps {
  students: Student[];
  grades: Record<string, StudentGrades>;
  onUpdateSubjectGrade: (studentId: string, semKey: SemesterKey, subjectId: string, value: number) => void;
  onOpenLeger: (semKey: SemesterKey, classRoom: ClassRoom) => void;
}

export const SemesterGradesTab: React.FC<SemesterGradesTabProps> = ({
  students,
  grades,
  onUpdateSubjectGrade,
  onOpenLeger
}) => {
  const [selectedSem, setSelectedSem] = useState<SemesterKey>('K6_S1');
  const [selectedClass, setSelectedClass] = useState<ClassRoom>('6A');
  const [saveToast, setSaveToast] = useState(false);

  const currentStudents = students.filter((s) => s.classRoom === selectedClass);
  const currentSemInfo = SEMESTER_LIST.find((s) => s.key === selectedSem);

  const handleSaveNotice = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  // Calculate subject averages for bottom row
  const subjectAverages: Record<string, number> = {};
  SUBJECT_LIST.forEach((sub) => {
    let sum = 0;
    let count = 0;
    currentStudents.forEach((s) => {
      const g = grades[s.id]?.[selectedSem]?.[sub.id];
      if (typeof g === 'number' && g > 0) {
        sum += g;
        count++;
      }
    });
    subjectAverages[sub.id] = count > 0 ? Number((sum / count).toFixed(1)) : 0;
  });

  return (
    <div className="space-y-4" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
      
      {/* Control Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-700" />
              <span>Input & Rekapitulasi Nilai Rapor</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola nilai 9 mata pelajaran per semester untuk {currentStudents.length} siswa {selectedClass}. Kolom kosong siap diisi langsung.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onOpenLeger(selectedSem, selectedClass)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              title="Cetak Buku Leger Nilai Semester Kelas Ini"
            >
              <Printer className="w-4 h-4 text-slate-700" />
              <span>Cetak Leger</span>
            </button>

            <button
              onClick={handleSaveNotice}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-sm transition active:scale-95 flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Nilai</span>
            </button>
          </div>
        </div>

        {/* Semester & Class Selector */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          
          {/* Semester Dropdown */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">Semester:</span>
              <select
                value={selectedSem}
                onChange={(e) => setSelectedSem(e.target.value as SemesterKey)}
                className="text-xs font-bold text-blue-900 bg-blue-50/70 border border-blue-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {SEMESTER_LIST.map((sem) => (
                  <option key={sem.key} value={sem.key}>
                    {sem.label} ({sem.year} · {sem.period})
                  </option>
                ))}
              </select>
            </div>

            {/* Class Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              {(['6A', '6B', '6C', '6D'] as ClassRoom[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedClass(c)}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    selectedClass === c
                      ? 'bg-blue-700 text-white font-bold shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Kelas {c}
                </button>
              ))}
            </div>
          </div>

          {/* Current Semester Badge */}
          <div className="text-xs text-slate-500 font-medium">
            <span className="font-bold text-blue-800">{currentSemInfo?.label}</span> · TP {currentSemInfo?.year}
          </div>

        </div>
      </div>

      {/* Save Success Toast */}
      {saveToast && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-md text-xs font-bold flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>Perubahan nilai semester berhasil disimpan!</span>
          </div>
          <span className="text-[11px] opacity-80">Tersimpan otomatis</span>
        </div>
      )}

      {/* Grades Input Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#172554] text-white font-semibold">
              <tr>
                <th className="py-3 px-3 border-r border-blue-900/60 w-10 text-center">No</th>
                <th className="py-3 px-3.5 border-r border-blue-900/60 min-w-[200px]">Nama Lengkap Siswa</th>
                {SUBJECT_LIST.map((sub) => (
                  <th key={sub.id} className="py-3 px-2 border-r border-blue-900/60 text-center w-16">
                    <div className="font-extrabold text-[11px]">{sub.code}</div>
                    <div className="text-[9px] text-blue-200 font-normal">KKM {sub.kkm}</div>
                  </th>
                ))}
                <th className="py-3 px-3 text-center bg-blue-900 w-24">
                  <div className="font-extrabold text-[11px]">Rata-Rata</div>
                  <div className="text-[9px] text-blue-200 font-normal">9 Mapel</div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentStudents.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-400">
                    Tidak ada siswa di kelas {selectedClass}. Silakan tambahkan siswa terlebih dahulu.
                  </td>
                </tr>
              ) : (
                currentStudents.map((s, idx) => {
                  const studentSemGrades = grades[s.id]?.[selectedSem] || {};
                  
                  let sum = 0;
                  let count = 0;
                  SUBJECT_LIST.forEach((sub) => {
                    const score = studentSemGrades[sub.id];
                    if (typeof score === 'number' && score > 0) {
                      sum += score;
                      count++;
                    }
                  });
                  const avg = count > 0 ? (sum / count).toFixed(1) : '-';

                  return (
                    <tr key={s.id} className="hover:bg-blue-50/40 transition">
                      <td className="py-2.5 px-3 border-r border-slate-100 text-center font-bold text-slate-500 num-font">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3.5 border-r border-slate-100 font-semibold text-slate-900">
                        <div>{s.name}</div>
                        <div className="text-[10px] text-slate-500 num-font">{s.nisn}</div>
                      </td>
                      {SUBJECT_LIST.map((sub) => {
                        const val = studentSemGrades[sub.id];
                        // If 0, null, or undefined, show blank/empty string (no 0!)
                        const displayVal = (val === undefined || val === null || val === 0) ? '' : val;
                        const isUnderKkm = typeof val === 'number' && val > 0 && val < sub.kkm;

                        return (
                          <td key={sub.id} className="py-2 px-1 border-r border-slate-100 text-center">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={displayVal}
                              placeholder=""
                              onChange={(e) => {
                                const raw = e.target.value;
                                const num = raw === '' ? 0 : Math.min(100, Math.max(0, Number(raw)));
                                onUpdateSubjectGrade(s.id, selectedSem, sub.id, num);
                              }}
                              className={`w-14 text-center py-1 rounded-lg text-xs font-bold num-font border transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                isUnderKkm 
                                  ? 'bg-red-50 text-red-700 border-red-300' 
                                  : val && val >= 85 
                                    ? 'bg-blue-50/50 text-blue-900 border-blue-200' 
                                    : 'bg-white text-slate-800 border-slate-200'
                              }`}
                            />
                          </td>
                        );
                      })}
                      <td className="py-2.5 px-3 text-center font-extrabold text-blue-800 bg-blue-50/30 num-font">
                        {avg}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {/* Subject Averages Footer */}
            {currentStudents.length > 0 && (
              <tfoot className="bg-slate-100/80 border-t-2 border-slate-300 font-bold">
                <tr>
                  <td colSpan={2} className="py-3 px-3.5 border-r border-slate-200 text-right text-slate-700">
                    Rata-Rata Kelas {selectedClass}:
                  </td>
                  {SUBJECT_LIST.map((sub) => (
                    <td key={sub.id} className="py-3 px-1 border-r border-slate-200 text-center num-font text-blue-900 text-xs">
                      {subjectAverages[sub.id] || '-'}
                    </td>
                  ))}
                  <td className="py-3 px-3 text-center num-font text-indigo-900 bg-indigo-50">
                    {(() => {
                      const vals = Object.values(subjectAverages).filter((v) => v > 0);
                      return vals.length > 0 ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : '-';
                    })()}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

    </div>
  );
};

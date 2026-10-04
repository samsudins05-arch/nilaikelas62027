import React, { useState } from 'react';
import { 
  Award, 
  Save, 
  Check 
} from 'lucide-react';
import { 
  Student, 
  StudentExams, 
  SUBJECT_LIST, 
  ClassRoom, 
  SubjectItem 
} from '../types';

interface ExamGradesTabProps {
  students: Student[];
  exams: Record<string, StudentExams>;
  onUpdateExamDetail: (
    studentId: string, 
    subjectId: string, 
    written: number, 
    practice: number
  ) => void;
}

export const ExamGradesTab: React.FC<ExamGradesTabProps> = ({
  students,
  exams,
  onUpdateExamDetail
}) => {
  const [selectedClass, setSelectedClass] = useState<ClassRoom>('6A');
  const [saveToast, setSaveToast] = useState(false);

  const currentStudents = students.filter((s) => s.classRoom === selectedClass);

  const handleSaveToast = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  const handleInputChange = (
    studentId: string,
    sub: SubjectItem,
    field: 'written' | 'practice',
    rawVal: string
  ) => {
    const studentEx = exams[studentId]?.[sub.id] || { written: 0, practice: 0, finalScore: 0 };
    const num = rawVal === '' ? 0 : Math.min(100, Math.max(0, Number(rawVal)));

    const newWritten = field === 'written' ? num : (studentEx.written || 0);
    const newPractice = field === 'practice' ? num : (studentEx.practice || 0);

    onUpdateExamDetail(studentId, sub.id, newWritten, newPractice);
  };

  return (
    <div className="space-y-4" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
      
      {/* Header card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-700" />
              <span>Input Nilai Ujian Sekolah: Nilai Tulis & Nilai Praktek</span>
            </h2>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleSaveToast}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-sm transition active:scale-95 flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Nilai Ujian</span>
            </button>
          </div>
        </div>

        {/* Filter Rombel */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">Rombel:</span>
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
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

          <div className="text-xs text-slate-500 font-medium">
            <span>Kelas {selectedClass}</span> · <span className="font-bold text-slate-800">{currentStudents.length} Siswa</span>
          </div>
        </div>
      </div>

      {saveToast && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-md text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>Nilai Ujian Sekolah berhasil disimpan!</span>
          </div>
          <span className="text-[11px] opacity-80">Siap untuk DKN & Ijazah</span>
        </div>
      )}

      {/* TABEL LENGKAP NILAI TULIS & NILAI PRAKTEK SEMUA MAPEL */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#172554] text-white font-semibold">
              <tr>
                <th rowSpan={2} className="py-2.5 px-2 border-r border-blue-900/60 w-8 text-center">No</th>
                <th rowSpan={2} className="py-2.5 px-3 border-r border-blue-900/60 min-w-[180px]">Nama Lengkap Siswa</th>
                {SUBJECT_LIST.map((sub) => (
                  <th 
                    key={sub.id} 
                    colSpan={sub.hasPractice ? 2 : 1}
                    className="py-1.5 px-2 border-r border-blue-900/60 text-center font-extrabold bg-blue-900/90 text-[11px]"
                  >
                    {sub.code}
                  </th>
                ))}
                <th rowSpan={2} className="py-2.5 px-3 text-center bg-blue-950 font-extrabold w-20">
                  Rata US
                </th>
              </tr>
              <tr className="bg-blue-950 text-blue-200 text-[10px]">
                {SUBJECT_LIST.map((sub) => (
                  sub.hasPractice ? (
                    <React.Fragment key={`${sub.id}_subs`}>
                      <th className="py-1 px-1 border-r border-blue-900/60 text-center w-14 font-semibold">Nilai Tulis</th>
                      <th className="py-1 px-1 border-r border-blue-900/60 text-center w-14 font-semibold text-amber-200">Nilai Praktek</th>
                    </React.Fragment>
                  ) : (
                    <th key={`${sub.id}_tulis`} className="py-1 px-1 border-r border-blue-900/60 text-center w-16 font-semibold">
                      Nilai Tulis
                    </th>
                  )
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentStudents.length === 0 ? (
                <tr>
                  <td colSpan={18} className="py-12 text-center text-slate-400">
                    Tidak ada siswa di kelas {selectedClass}.
                  </td>
                </tr>
              ) : (
                currentStudents.map((s, idx) => {
                  const studentExams = exams[s.id] || {};
                  let sum = 0;
                  let count = 0;
                  SUBJECT_LIST.forEach((sub) => {
                    const ex = studentExams[sub.id];
                    if (ex && ex.finalScore > 0) {
                      sum += ex.finalScore;
                      count++;
                    }
                  });
                  const grandAvg = count > 0 ? (sum / SUBJECT_LIST.length).toFixed(1) : '-';

                  return (
                    <tr key={s.id} className="hover:bg-blue-50/40 transition">
                      <td className="py-2 px-2 border-r border-slate-100 text-center font-bold text-slate-500 num-font">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-100 font-semibold text-slate-900">
                        <div>{s.name}</div>
                        <div className="text-[10px] text-slate-500 num-font">{s.nisn}</div>
                      </td>
                      
                      {SUBJECT_LIST.map((sub) => {
                        const ex = studentExams[sub.id] || { written: 0, practice: 0, finalScore: 0 };
                        const wDisplay = (ex.written === undefined || ex.written === null || ex.written === 0) ? '' : ex.written;
                        const pDisplay = (ex.practice === undefined || ex.practice === null || ex.practice === 0) ? '' : ex.practice;

                        return sub.hasPractice ? (
                          <React.Fragment key={`${sub.id}_inputs`}>
                            {/* NILAI TULIS */}
                            <td className="py-1.5 px-1 border-r border-slate-100 text-center">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={wDisplay}
                                placeholder=""
                                onChange={(e) => handleInputChange(s.id, sub, 'written', e.target.value)}
                                className="w-13 text-center py-1 rounded border border-slate-200 font-bold num-font text-xs focus:ring-1 focus:ring-blue-500 bg-white"
                              />
                            </td>
                            {/* NILAI PRAKTEK */}
                            <td className="py-1.5 px-1 border-r border-slate-100 text-center bg-indigo-50/20">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={pDisplay}
                                placeholder=""
                                onChange={(e) => handleInputChange(s.id, sub, 'practice', e.target.value)}
                                className="w-13 text-center py-1 rounded border border-slate-200 font-bold num-font text-xs focus:ring-1 focus:ring-indigo-500 bg-white"
                              />
                            </td>
                          </React.Fragment>
                        ) : (
                          /* NILAI TULIS SAJA */
                          <td key={`${sub.id}_only_w`} className="py-1.5 px-1 border-r border-slate-100 text-center">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={wDisplay}
                              placeholder=""
                              onChange={(e) => handleInputChange(s.id, sub, 'written', e.target.value)}
                              className="w-13 text-center py-1 rounded border border-slate-200 font-bold num-font text-xs focus:ring-1 focus:ring-blue-500 bg-white"
                            />
                          </td>
                        );
                      })}

                      <td className="py-2 px-3 text-center font-extrabold text-blue-800 bg-blue-50/40 num-font text-xs">
                        {grandAvg}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

import React, { useRef } from 'react';
import { Printer, X, Upload, RotateCcw } from 'lucide-react';
import { SchoolProfile, Student, StudentGrades, StudentExams, SemesterKey, SEMESTER_LIST } from '../types';
import { calculateStudentGraduationSummary, formatBirthDateIndonesian } from '../utils/calculations';

interface PrintTranskripModalProps {
  student: Student;
  grades: StudentGrades | undefined;
  exams: StudentExams | undefined;
  school: SchoolProfile;
  onUpdateSchool?: (updatedSchool: SchoolProfile) => void;
  onClose: () => void;
}

export const PrintTranskripModal: React.FC<PrintTranskripModalProps> = ({
  student,
  grades,
  exams,
  school,
  onUpdateSchool,
  onClose
}) => {
  const summary = calculateStudentGraduationSummary(student, grades, exams, school);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleKopUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (onUpdateSchool) {
        onUpdateSchool({
          ...school,
          customKopImage: dataUrl
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetKop = () => {
    if (confirm('Kembalikan ke format Kop Teks Standar resmi?')) {
      if (onUpdateSchool) {
        onUpdateSchool({
          ...school,
          customKopImage: undefined
        });
      }
    }
  };

  const sems: { key: SemesterKey; label: string }[] = [
    { key: 'K4_S1', label: 'K4-S1' },
    { key: 'K4_S2', label: 'K4-S2' },
    { key: 'K5_S1', label: 'K5-S1' },
    { key: 'K5_S2', label: 'K5-S2' },
    { key: 'K6_S1', label: 'K6-S1' },
    { key: 'K6_S2', label: 'K6-S2' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto p-4 flex justify-center items-start sm:py-8">
      
      {/* Top action buttons */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 no-print bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 shadow-2xl">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleKopUpload}
          accept="image/*"
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 transition active:scale-95"
          title="Unggah berkas gambar Kop Surat Sekolah (PNG / JPG)"
        >
          <Upload className="w-4 h-4" />
          <span>{school.customKopImage ? 'Ganti Kop Surat' : 'Unggah Kop Surat'}</span>
        </button>

        {school.customKopImage && (
          <button
            onClick={handleResetKop}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold text-xs rounded-xl shadow flex items-center gap-1.5 transition"
            title="Kembali ke Kop Teks Standar"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Kop Teks</span>
          </button>
        )}

        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow flex items-center gap-1.5 transition active:scale-95"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Transkrip</span>
        </button>

        <button
          onClick={onClose}
          className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition"
          title="Tutup"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Printable Sheet */}
      <div 
        className="bg-white text-black w-full max-w-[210mm] min-h-[297mm] p-8 sm:p-12 shadow-2xl rounded-sm print-area print:p-0 print:shadow-none text-xs leading-normal"
        style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
      >
        
        {/* KOP SURAT (UNGGAH GAMBAR ATAU FORMAT TEKS STANDAR) */}
        {school.customKopImage ? (
          <div className="text-center relative pb-2 mb-3 border-b-2 border-black">
            <img 
              src={school.customKopImage} 
              alt={`Kop Surat Resmi ${school.name}`}
              className="w-full max-h-[140px] object-contain mx-auto" 
            />
          </div>
        ) : (
          <div className="text-center relative pb-3 border-b-4 border-double border-black">
            <h4 className="text-xs font-bold tracking-wider uppercase">
              PEMERINTAH KABUPATEN BEKASI · DINAS PENDIDIKAN
            </h4>
            <h2 className="text-base font-black tracking-wide uppercase text-blue-950 print:text-black">
              {school.name}
            </h2>
            <p className="text-[10px] text-slate-700 print:text-black mt-0.5">
              {school.address}, {school.village}, {school.district}, {school.regency} · NPSN: {school.npsn}
            </p>
          </div>
        )}

        {/* JUDUL */}
        <div className="text-center mt-4 mb-3">
          <h3 className="text-sm font-extrabold uppercase underline underline-offset-4">
            TRANSKRIP REKAPITULASI NILAI RAPOR 6 SEMESTER
          </h3>
          <p className="text-[10px] font-bold mt-0.5">
            CALON PESERTA IJAZAH TAHUN PELAJARAN {school.academicYear}
          </p>
        </div>

        {/* BIODATA */}
        <div className="mb-4 text-[10px] space-y-0.5 bg-slate-50 print:bg-transparent p-2.5 border border-slate-200 print:border-black rounded">
          <div className="grid grid-cols-12 gap-1">
            <span className="col-span-3 font-semibold">Nama Siswa</span>
            <span className="col-span-1 text-center">:</span>
            <span className="col-span-8 font-bold uppercase">{student.name}</span>
          </div>
          <div className="grid grid-cols-12 gap-1">
            <span className="col-span-3 font-semibold">NIS / NISN</span>
            <span className="col-span-1 text-center">:</span>
            <span className="col-span-8 num-font font-bold">{student.nis} / {student.nisn}</span>
          </div>
          <div className="grid grid-cols-12 gap-1">
            <span className="col-span-3 font-semibold">Kelas / Rombel</span>
            <span className="col-span-1 text-center">:</span>
            <span className="col-span-8 font-bold">Kelas {student.classRoom}</span>
          </div>
          <div className="grid grid-cols-12 gap-1">
            <span className="col-span-3 font-semibold">Tempat, Tanggal Lahir</span>
            <span className="col-span-1 text-center">:</span>
            <span className="col-span-8">{student.birthPlace}, {formatBirthDateIndonesian(student.birthDate)}</span>
          </div>
          <div className="grid grid-cols-12 gap-1">
            <span className="col-span-3 font-semibold">No. Seri Ijazah</span>
            <span className="col-span-1 text-center">:</span>
            <span className="col-span-8 num-font">{summary.serialNumber}</span>
          </div>
        </div>

        {/* 6 SEMESTER DETAIL TABLE */}
        <table className="w-full border-collapse border border-black text-[9px] mb-4">
          <thead>
            <tr className="bg-slate-100 print:bg-slate-100 font-bold text-center">
              <th rowSpan={2} className="border border-black py-1 px-1 w-6">No</th>
              <th rowSpan={2} className="border border-black py-1 px-2 text-left">Mata Pelajaran</th>
              <th colSpan={6} className="border border-black py-1 px-1">Nilai Rapor Semester (Kelas 4, 5, 6)</th>
              <th rowSpan={2} className="border border-black py-1 px-1 w-12">Rata Rapor</th>
              <th rowSpan={2} className="border border-black py-1 px-1 w-12">Ujian Sekolah</th>
              <th rowSpan={2} className="border border-black py-1 px-1 w-14 bg-slate-200 font-extrabold">Nilai Ijazah</th>
              <th rowSpan={2} className="border border-black py-1 px-1 w-12">Predikat</th>
            </tr>
            <tr className="bg-slate-50 print:bg-slate-50 font-bold text-center">
              {sems.map((s) => (
                <th key={s.key} className="border border-black py-0.5 px-1 w-9">{s.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {summary.subjects.map((sub, idx) => (
              <tr key={sub.subjectId}>
                <td className="border border-black py-1 px-1 text-center num-font">{idx + 1}</td>
                <td className="border border-black py-1 px-2 font-medium">{sub.subjectName}</td>
                {sems.map((s) => (
                  <td key={s.key} className="border border-black py-1 px-1 text-center num-font">
                    {sub.semScores[s.key] || 0}
                  </td>
                ))}
                <td className="border border-black py-1 px-1 text-center num-font font-bold">{sub.raporAvg}</td>
                <td className="border border-black py-1 px-1 text-center num-font font-bold">{sub.examScore}</td>
                <td className="border border-black py-1 px-1 text-center num-font font-extrabold bg-slate-100">{sub.finalScore}</td>
                <td className="border border-black py-1 px-1 text-center font-bold">
                  {sub.finalScore >= 90 ? 'A' : sub.finalScore >= 80 ? 'B' : sub.finalScore >= 75 ? 'C' : 'D'}
                </td>
              </tr>
            ))}
            <tr className="font-extrabold bg-slate-100 print:bg-slate-100">
              <td colSpan={2} className="border border-black py-1.5 px-2 text-right">
                RATA-RATA NILAI:
              </td>
              {sems.map((s) => {
                let sum = 0;
                summary.subjects.forEach((sub) => {
                  sum += sub.semScores[s.key] || 0;
                });
                return (
                  <td key={s.key} className="border border-black py-1.5 px-1 text-center num-font">
                    {(sum / summary.subjects.length).toFixed(1)}
                  </td>
                );
              })}
              <td className="border border-black py-1.5 px-1 text-center num-font font-extrabold">{summary.grandRaporAvg}</td>
              <td className="border border-black py-1.5 px-1 text-center num-font font-extrabold">{summary.grandExamAvg}</td>
              <td className="border border-black py-1.5 px-1 text-center num-font font-black text-xs">{summary.finalScore}</td>
              <td className="border border-black py-1.5 px-1 text-center font-black">{summary.predicate}</td>
            </tr>
          </tbody>
        </table>

        {/* STATUS KELULUSAN */}
        <div className="p-2 border border-black rounded text-[10px] mb-6 flex items-center justify-between">
          <div>
            Status Kelulusan: <strong className="uppercase">{summary.isPassed ? 'LULUS DARI SATUAN PENDIDIKAN' : 'TIDAK LULUS'}</strong>
          </div>
          <div>
            Kriteria Kelulusan Minimal (KKM): <strong>{school.passingKkm}</strong>
          </div>
        </div>

        {/* SIGNATURE */}
        <div className="grid grid-cols-12 gap-4 text-[10px]">
          <div className="col-span-7">
            <p className="font-bold">Keterangan Predikat:</p>
            <p>A = 90 - 100 (Sangat Baik)</p>
            <p>B = 80 - 89 (Baik)</p>
            <p>C = 75 - 79 (Cukup)</p>
            <p>D = &lt; 75 (Kurang)</p>
          </div>

          <div className="col-span-5 text-right">
            <p>Bekasi, {school.graduationDate}</p>
            <p className="font-bold">Kepala Sekolah,</p>
            <div className="h-16"></div>
            <p className="font-bold underline uppercase">{school.principalName}</p>
            <p className="num-font">NIP. {school.principalNip}</p>
          </div>
        </div>

      </div>

    </div>
  );
};

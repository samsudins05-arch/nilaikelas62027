import React from 'react';
import { Printer, X } from 'lucide-react';
import { SchoolProfile, Student, StudentGrades, SemesterKey, SEMESTER_LIST, SUBJECT_LIST, ClassRoom } from '../types';

interface PrintLegerModalProps {
  students: Student[];
  grades: Record<string, StudentGrades>;
  school: SchoolProfile;
  semKey: SemesterKey;
  classRoom: ClassRoom;
  onClose: () => void;
}

export const PrintLegerModal: React.FC<PrintLegerModalProps> = ({
  students,
  grades,
  school,
  semKey,
  classRoom,
  onClose
}) => {
  const currentStudents = students.filter((s) => s.classRoom === classRoom);
  const semInfo = SEMESTER_LIST.find((s) => s.key === semKey);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto p-4 flex justify-center items-start sm:py-8">
      
      {/* Top action buttons */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 no-print">
        <button
          onClick={() => window.print()}
          className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-2 transition active:scale-95"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Leger (Landscape A4)</span>
        </button>
        <button
          onClick={onClose}
          className="p-2.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl shadow-lg border border-slate-200 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Printable Sheet (Landscape) */}
      <div 
        className="bg-white text-black w-full max-w-[297mm] min-h-[210mm] p-8 shadow-2xl rounded-sm print-area print:p-0 print:shadow-none text-xs leading-normal"
        style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
      >
        
        {/* KOP LEGER */}
        <div className="text-center pb-2 border-b-2 border-black mb-3">
          <h2 className="text-sm font-extrabold uppercase">
            BUKU LEGER NILAI RAPOR PESERTA DIDIK
          </h2>
          <h3 className="text-xs font-bold uppercase text-slate-800 print:text-black">
            {school.name} · KELAS {classRoom} · {semInfo?.label}
          </h3>
          <p className="text-[10px] text-slate-600 print:text-black mt-0.5">
            Tahun Pelajaran {semInfo?.year} · {semInfo?.period} · NPSN: {school.npsn}
          </p>
        </div>

        {/* TABLE */}
        <table className="w-full border-collapse border border-black text-[9px] mb-4">
          <thead>
            <tr className="bg-slate-100 print:bg-slate-100 font-bold text-center">
              <th className="border border-black py-1.5 px-1 w-8">No</th>
              <th className="border border-black py-1.5 px-1 w-14">NIS</th>
              <th className="border border-black py-1.5 px-1 w-20">NISN</th>
              <th className="border border-black py-1.5 px-2 text-left">Nama Siswa</th>
              <th className="border border-black py-1.5 px-1 w-8">L/P</th>
              {SUBJECT_LIST.map((sub) => (
                <th key={sub.id} className="border border-black py-1.5 px-1 w-11">
                  <div>{sub.code}</div>
                  <div className="text-[8px] font-normal">({sub.kkm})</div>
                </th>
              ))}
              <th className="border border-black py-1.5 px-1 w-12 bg-slate-200">Jumlah</th>
              <th className="border border-black py-1.5 px-1 w-12 bg-slate-200">Rata2</th>
              <th className="border border-black py-1.5 px-1 w-12">Rank</th>
            </tr>
          </thead>
          <tbody>
            {currentStudents.map((s, idx) => {
              const semGrades = grades[s.id]?.[semKey] || {};
              let sum = 0;
              SUBJECT_LIST.forEach((sub) => {
                sum += semGrades[sub.id] || 0;
              });
              const avg = (sum / SUBJECT_LIST.length).toFixed(1);

              return (
                <tr key={s.id}>
                  <td className="border border-black py-1 px-1 text-center num-font">{idx + 1}</td>
                  <td className="border border-black py-1 px-1 text-center num-font">{s.nis}</td>
                  <td className="border border-black py-1 px-1 text-center num-font">{s.nisn}</td>
                  <td className="border border-black py-1 px-2 font-medium">{s.name}</td>
                  <td className="border border-black py-1 px-1 text-center font-bold">{s.gender}</td>
                  {SUBJECT_LIST.map((sub) => (
                    <td key={sub.id} className="border border-black py-1 px-1 text-center num-font">
                      {semGrades[sub.id] || 0}
                    </td>
                  ))}
                  <td className="border border-black py-1 px-1 text-center num-font font-bold">{sum}</td>
                  <td className="border border-black py-1 px-1 text-center num-font font-bold bg-slate-50">{avg}</td>
                  <td className="border border-black py-1 px-1 text-center num-font">{idx + 1}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* TANDA TANGAN WALI KELAS & KEPALA SEKOLAH */}
        <div className="grid grid-cols-12 gap-8 text-[10px] mt-6">
          <div className="col-span-6">
            <p>Mengetahui,</p>
            <p className="font-bold">Kepala Sekolah,</p>
            <div className="h-14"></div>
            <p className="font-bold underline uppercase">{school.principalName}</p>
            <p className="num-font">NIP. {school.principalNip}</p>
          </div>

          <div className="col-span-6 text-right">
            <p>Bekasi, {school.graduationDate}</p>
            <p className="font-bold">Guru Kelas {classRoom},</p>
            <div className="h-14"></div>
            <p className="font-bold underline">WALI KELAS {classRoom}</p>
            <p className="num-font">NIP. ........................................</p>
          </div>
        </div>

      </div>

    </div>
  );
};

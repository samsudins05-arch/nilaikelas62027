import React, { useRef } from 'react';
import { Printer, X, Award, CheckCircle, Upload, RotateCcw, Image as ImageIcon } from 'lucide-react';
import { SchoolProfile, Student, StudentGrades, StudentExams } from '../types';
import { calculateStudentGraduationSummary, numberToWordsIndonesian, formatBirthDateIndonesian } from '../utils/calculations';

interface PrintSKLModalProps {
  student: Student;
  grades: StudentGrades | undefined;
  exams: StudentExams | undefined;
  school: SchoolProfile;
  onUpdateSchool?: (updatedSchool: SchoolProfile) => void;
  onClose: () => void;
}

export const PrintSKLModal: React.FC<PrintSKLModalProps> = ({
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

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto p-4 flex justify-center items-start sm:py-8">
      
      {/* Modal Actions Bar (hidden during print) */}
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
          <span>Cetak Dokumen SKL</span>
        </button>

        <button
          onClick={onClose}
          className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition"
          title="Tutup"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Printable Sheet (Standard A4 Letterhead Format) */}
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
            {/* Logo Kemendikbud / Lambang Tut Wuri Handayani / Lambang Pemkab Bekasi placeholder */}
            <div className="flex items-center justify-between gap-4">
              <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center border-2 border-black rounded-lg font-black text-xs text-slate-800">
                BEKASI
              </div>

              <div className="flex-1 text-center">
                <h4 className="text-sm font-bold tracking-wider uppercase">
                  PEMERINTAH KABUPATEN BEKASI
                </h4>
                <h4 className="text-sm font-bold tracking-wider uppercase">
                  DINAS PENDIDIKAN
                </h4>
                <h2 className="text-lg font-black tracking-wide uppercase text-blue-950 print:text-black">
                  {school.name}
                </h2>
                <p className="text-[10px] text-slate-700 print:text-black mt-0.5">
                  {school.address}, {school.village}, {school.district}, {school.regency} - {school.postalCode}
                </p>
                <p className="text-[10px] text-slate-700 print:text-black">
                  NPSN: {school.npsn} · NSS: {school.nss} · Email: sdn.babelankota01@gmail.com
                </p>
              </div>

              <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center border-2 border-black rounded-full font-black text-xs text-slate-800">
                01
              </div>
            </div>
          </div>
        )}

        {/* JUDUL SURAT */}
        <div className="text-center mt-5 mb-4">
          <h3 className="text-sm font-extrabold tracking-wider uppercase underline underline-offset-4">
            SURAT KETERANGAN LULUS
          </h3>
          <p className="text-[11px] font-bold mt-1">
            TAHUN PELAJARAN {school.academicYear}
          </p>
          <p className="text-[10px] num-font text-slate-700 print:text-black">
            Nomor: {school.skNumber}
          </p>
        </div>

        {/* PENGANTAR */}
        <p className="text-justify mb-3 text-[11px] leading-relaxed">
          Yang bertanda tangan di bawah ini, Kepala Sekolah Dasar Negeri Babelan Kota 01, Kecamatan Babelan, Kabupaten Bekasi, Provinsi Jawa Barat, menerangkan bahwa:
        </p>

        {/* BIODATA SISWA */}
        <div className="mb-4 pl-4 space-y-1 text-[11px]">
          <div className="grid grid-cols-12 gap-1">
            <span className="col-span-4 font-semibold text-slate-700 print:text-black">Nama Lengkap</span>
            <span className="col-span-1 text-center">:</span>
            <span className="col-span-7 font-bold uppercase">{student.name}</span>
          </div>
          <div className="grid grid-cols-12 gap-1">
            <span className="col-span-4 font-semibold text-slate-700 print:text-black">Tempat, Tanggal Lahir</span>
            <span className="col-span-1 text-center">:</span>
            <span className="col-span-7">{student.birthPlace}, {formatBirthDateIndonesian(student.birthDate)}</span>
          </div>
          <div className="grid grid-cols-12 gap-1">
            <span className="col-span-4 font-semibold text-slate-700 print:text-black">Nama Orang Tua / Wali</span>
            <span className="col-span-1 text-center">:</span>
            <span className="col-span-7">{student.parentName}</span>
          </div>
          <div className="grid grid-cols-12 gap-1">
            <span className="col-span-4 font-semibold text-slate-700 print:text-black">Nomor Induk Siswa (NIS)</span>
            <span className="col-span-1 text-center">:</span>
            <span className="col-span-7 num-font">{student.nis}</span>
          </div>
          <div className="grid grid-cols-12 gap-1">
            <span className="col-span-4 font-semibold text-slate-700 print:text-black">Nomor Induk Siswa Nasional (NISN)</span>
            <span className="col-span-1 text-center">:</span>
            <span className="col-span-7 num-font font-bold">{student.nisn}</span>
          </div>
          <div className="grid grid-cols-12 gap-1">
            <span className="col-span-4 font-semibold text-slate-700 print:text-black">Rombongan Belajar / Kelas</span>
            <span className="col-span-1 text-center">:</span>
            <span className="col-span-7 font-bold">Kelas {student.classRoom}</span>
          </div>
        </div>

        {/* PERNYATAAN KELULUSAN */}
        <p className="text-justify text-[11px] leading-relaxed mb-2">
          Berdasarkan Kriteria Kelulusan Peserta Didik SD Negeri Babelan Kota 01 Tahun Pelajaran {school.academicYear}, melalui Rapat Pleno Dewan Guru yang diselenggarakan pada tanggal {school.graduationDate}, yang bersangkutan dinyatakan:
        </p>

        <div className="my-3 py-2 text-center border-2 border-black bg-slate-50 print:bg-transparent">
          <span className="text-base font-black tracking-widest uppercase">
            {summary.isPassed ? 'L U L U S' : 'T I D A K   L U L U S'}
          </span>
        </div>

        {/* TABEL NILAI */}
        <div className="mb-4">
          <p className="text-[11px] font-bold mb-1.5">
            Daftar Nilai Ujian Sekolah & Rata-rata Rapor:
          </p>
          <table className="w-full border-collapse border border-black text-[10px]">
            <thead>
              <tr className="bg-slate-100 print:bg-slate-100 font-bold text-center">
                <th className="border border-black py-1.5 px-2 w-8">No</th>
                <th className="border border-black py-1.5 px-3 text-left">Mata Pelajaran</th>
                <th className="border border-black py-1.5 px-2 w-20">Rata-rata Rapor (6 Smt)</th>
                <th className="border border-black py-1.5 px-2 w-20">Nilai Ujian Sekolah</th>
                <th className="border border-black py-1.5 px-2 w-20 bg-slate-200 print:bg-slate-200">Nilai Ijazah</th>
              </tr>
            </thead>
            <tbody>
              {summary.subjects.map((sub, idx) => (
                <tr key={sub.subjectId}>
                  <td className="border border-black py-1 px-2 text-center num-font">{idx + 1}</td>
                  <td className="border border-black py-1 px-3 font-medium">{sub.subjectName}</td>
                  <td className="border border-black py-1 px-2 text-center num-font">{sub.raporAvg}</td>
                  <td className="border border-black py-1 px-2 text-center num-font">{sub.examScore}</td>
                  <td className="border border-black py-1 px-2 text-center num-font font-bold">{sub.finalScore}</td>
                </tr>
              ))}
              <tr className="font-bold bg-slate-100 print:bg-slate-100">
                <td colSpan={2} className="border border-black py-1.5 px-3 text-right">
                  RATA-RATA NILAI:
                </td>
                <td className="border border-black py-1.5 px-2 text-center num-font">{summary.grandRaporAvg}</td>
                <td className="border border-black py-1.5 px-2 text-center num-font">{summary.grandExamAvg}</td>
                <td className="border border-black py-1.5 px-2 text-center num-font font-extrabold text-sm">{summary.finalScore}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-[10px] text-justify text-slate-700 print:text-black mb-6">
          Surat Keterangan Lulus ini bersifat resmi dan berlaku sementara sampai dengan diterbitkannya Ijazah Asli Tahun Pelajaran {school.academicYear}, serta dapat digunakan untuk keperluan pendaftaran ke jenjang pendidikan lanjutan (SMP/MTs/Sederajat).
        </p>

        {/* TANDA TANGAN & PENGESAHAN */}
        <div className="grid grid-cols-12 gap-4 items-end mt-4">
          
          {/* Pas Foto 3x4 */}
          <div className="col-span-4 text-center">
            {student.photo ? (
              <div className="w-[30mm] h-[40mm] border border-black mx-auto overflow-hidden bg-white shadow-xs">
                <img 
                  src={student.photo} 
                  alt={`Pas Foto ${student.name}`} 
                  className="w-full h-full object-cover" 
                />
              </div>
            ) : (
              <div className="w-[30mm] h-[40mm] border-2 border-dashed border-slate-400 mx-auto flex flex-col items-center justify-center text-[10px] text-slate-400 font-bold p-2 bg-slate-50 print:bg-white">
                <span>PAS FOTO</span>
                <span>3 x 4 cm</span>
                <span className="text-[8px] font-normal mt-1">Cap Tiga Jari Kiri</span>
              </div>
            )}
          </div>

          {/* QR Verification placeholder */}
          <div className="col-span-3 text-center">
            <div className="w-16 h-16 border border-slate-300 mx-auto flex items-center justify-center p-1 text-[8px] text-slate-500 text-center">
              QR Verifikasi Sekolah
            </div>
            <p className="text-[8px] text-slate-400 mt-1">Validasi Dokumen Digital</p>
          </div>

          {/* Tanda Tangan Kepala Sekolah & Stempel */}
          <div className="col-span-5 text-right pl-4">
            <p className="text-[11px]">Bekasi, {school.graduationDate}</p>
            <p className="text-[11px] font-bold">Kepala Sekolah,</p>
            
            {/* Space for Stamp & TTD */}
            <div className="h-20 flex items-center justify-end pr-6 relative">
              {/* Stempel bulat SDN Babelan Kota 01 simulation */}
              <div className="w-20 h-20 rounded-full border-2 border-blue-600 text-blue-600 opacity-60 flex flex-col items-center justify-center text-[8px] font-bold rotate-[-12deg] pointer-events-none absolute right-12">
                <span>★ PEMKAB BEKASI ★</span>
                <span className="text-[7px]">SDN BABELAN</span>
                <span className="text-[7px]">KOTA 01</span>
                <span>★ DISDIK ★</span>
              </div>
            </div>

            <p className="text-[11px] font-bold underline uppercase">{school.principalName}</p>
            <p className="text-[10px] num-font">NIP. {school.principalNip}</p>
          </div>

        </div>

      </div>

    </div>
  );
};

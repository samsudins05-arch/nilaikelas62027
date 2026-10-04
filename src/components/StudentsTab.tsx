import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Printer, 
  FileText, 
  UserCheck, 
  Download,
  Eye,
  Camera,
  Upload
} from 'lucide-react';
import { Student, ClassRoom } from '../types';

interface StudentsTabProps {
  students: Student[];
  onAddStudent: () => void;
  onEditStudent: (student: Student) => void;
  onUpdateStudent?: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onPrintSKL: (studentId: string) => void;
  onPrintTranskrip: (studentId: string) => void;
}

export const StudentsTab: React.FC<StudentsTabProps> = ({
  students,
  onAddStudent,
  onEditStudent,
  onUpdateStudent,
  onDeleteStudent,
  onPrintSKL,
  onPrintTranskrip
}) => {
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredStudents = students.filter((s) => {
    const matchClass = selectedClass === 'ALL' || s.classRoom === selectedClass;
    const q = searchQuery.toLowerCase().trim();
    const matchQ = !q || 
      s.name.toLowerCase().includes(q) || 
      s.nisn.includes(q) || 
      s.nis.includes(q) ||
      (s.parentName && s.parentName.toLowerCase().includes(q));
    return matchClass && matchQ;
  });

  return (
    <div className="space-y-4">
      
      {/* Header & Controls Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
              Data Siswa Kelas 6
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              SD Negeri Babelan Kota 01 · Tahun Pelajaran 2026/2027 · Total: {students.length} Siswa Terdaftar
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onAddStudent}
              className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-sm transition active:scale-95 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Siswa Baru</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-blue-700" />
              Rombel:
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
                  {c === 'ALL' ? 'Semua' : `Kelas ${c}`}
                </button>
              ))}
            </div>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama siswa, NISN, atau NIS..."
              className="w-full text-xs pl-9 pr-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
            />
          </div>
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#172554] text-white font-semibold">
              <tr>
                <th className="py-3 px-3.5 border-r border-blue-900/60 w-12 text-center">No</th>
                <th className="py-3 px-2 border-r border-blue-900/60 w-16 text-center">Foto 3x4</th>
                <th className="py-3 px-3.5 border-r border-blue-900/60 w-16 text-center">Kelas</th>
                <th className="py-3 px-3.5 border-r border-blue-900/60">NIS / NISN</th>
                <th className="py-3 px-3.5 border-r border-blue-900/60">Nama Lengkap Siswa</th>
                <th className="py-3 px-3 border-r border-blue-900/60 text-center w-12">L/P</th>
                <th className="py-3 px-3.5 border-r border-blue-900/60">Tempat, Tanggal Lahir</th>
                <th className="py-3 px-3.5 border-r border-blue-900/60">Orang Tua / Wali</th>
                <th className="py-3 px-3.5 border-r border-blue-900/60">No. Seri Ijazah</th>
                <th className="py-3 px-3.5 text-center w-36">Aksi & Dokumen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-14 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-slate-500">
                      <p className="font-bold text-slate-800 text-sm">Belum Ada Data Siswa</p>
                      <p className="text-xs text-slate-500 mt-1 mb-3">
                        {students.length === 0
                          ? 'Data siswa bawaan telah dikosongkan. Silakan klik tombol Tambah Siswa Baru untuk mulai menginput data siswa.'
                          : 'Tidak ada data siswa yang cocok dengan filter pencarian.'}
                      </p>
                      {students.length === 0 && (
                        <button
                          onClick={onAddStudent}
                          className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Tambah Siswa Baru</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-blue-50/40 transition">
                    <td className="py-3 px-3.5 border-r border-slate-100 text-center font-bold text-slate-500 num-font">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-2 border-r border-slate-100 text-center">
                      <div className="relative inline-block group">
                        {s.photo ? (
                          <div className="w-8 h-11 rounded border border-slate-300 mx-auto overflow-hidden shadow-xs bg-white">
                            <img src={s.photo} alt={s.name} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-8 h-11 rounded border border-dashed border-slate-300 mx-auto flex flex-col items-center justify-center text-[7px] text-slate-400 bg-slate-50">
                            <Camera className="w-3.5 h-3.5 mb-0.5 text-slate-300" />
                            <span>3x4</span>
                          </div>
                        )}
                        <input
                          type="file"
                          id={`table-photo-${s.id}`}
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              const dataUrl = ev.target?.result as string;
                              if (onUpdateStudent) {
                                onUpdateStudent({ ...s, photo: dataUrl });
                              }
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                        <label
                          htmlFor={`table-photo-${s.id}`}
                          className="absolute inset-0 bg-black/60 text-white rounded opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition text-[9px] font-bold"
                          title="Unggah / ganti pas foto 3x4"
                        >
                          <Upload className="w-3.5 h-3.5" />
                        </label>
                      </div>
                    </td>
                    <td className="py-3 px-3.5 border-r border-slate-100 text-center">
                      <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 font-extrabold text-[11px]">
                        {s.classRoom}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 border-r border-slate-100 num-font">
                      <div className="font-semibold text-slate-800">{s.nis}</div>
                      <div className="text-[11px] text-slate-500">{s.nisn}</div>
                    </td>
                    <td className="py-3 px-3.5 border-r border-slate-100 font-bold text-slate-900">
                      {s.name}
                    </td>
                    <td className="py-3 px-3 border-r border-slate-100 text-center font-bold">
                      <span className={`px-1.5 py-0.5 rounded text-[11px] ${
                        s.gender === 'L' ? 'bg-sky-100 text-sky-800' : 'bg-pink-100 text-pink-800'
                      }`}>
                        {s.gender}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 border-r border-slate-100 text-slate-700">
                      <div>{s.birthPlace}</div>
                      <div className="text-[11px] text-slate-500 num-font">{s.birthDate}</div>
                    </td>
                    <td className="py-3 px-3.5 border-r border-slate-100 text-slate-700">
                      {s.parentName}
                    </td>
                    <td className="py-3 px-3.5 border-r border-slate-100 num-font text-slate-600 text-[11px]">
                      {s.serialNumber || `DN-02/D-SD/27/01/${s.nis.padStart(4, '0')}`}
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onPrintSKL(s.id)}
                          className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition"
                          title="Cetak Surat Keterangan Lulus (SKL)"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onPrintTranskrip(s.id)}
                          className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition"
                          title="Cetak Transkrip Nilai Rapor 6 Semester"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEditStudent(s)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                          title="Edit Biodata Siswa"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteStudent(s.id)}
                          className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition"
                          title="Hapus Siswa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

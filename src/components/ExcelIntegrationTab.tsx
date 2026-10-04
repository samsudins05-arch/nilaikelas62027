import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Database, 
  FileText,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { AppDatabase } from '../types';
import { exportFullExcelDatabase, downloadEmptyExcelTemplate, parseExcelDatabase } from '../utils/excel';

interface ExcelIntegrationTabProps {
  db: AppDatabase;
  onImportSuccess: (importedStudents: any[]) => void;
}

export const ExcelIntegrationTab: React.FC<ExcelIntegrationTabProps> = ({
  db,
  onImportSuccess
}) => {
  const [importStatus, setImportStatus] = useState<{
    type: 'success' | 'error' | 'loading' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatus({ type: 'loading', message: 'Sedang membaca dan menganalisis file Excel...' });

    try {
      const result = await parseExcelDatabase(file);
      if (result.students && result.students.length > 0) {
        onImportSuccess(result.students);
        setImportStatus({
          type: 'success',
          message: `Berhasil mengimpor ${result.students.length} siswa dari file Excel!`
        });
      } else {
        setImportStatus({
          type: 'error',
          message: 'Tidak ditemukan sheet DATA_SISWA yang valid dalam file Excel yang diunggah.'
        });
      }
    } catch (err: any) {
      setImportStatus({
        type: 'error',
        message: err.message || 'Gagal memproses file Excel.'
      });
    }

    // Reset input
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      
      {/* Intro Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Database Spreadsheet Microsoft Excel (.xlsx)
            </h2>
            <p className="text-xs text-slate-500">
              Integrasi langsung dua arah antara Aplikasi Web SDN Babelan Kota 01 dan file Excel offline tanpa memerlukan Google Drive berbayar.
            </p>
          </div>
        </div>
      </div>

      {/* Main 2-Column Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* EXPORT CARD */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-emerald-950">
              Export Database Lengkap (.xlsx)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Unduh seluruh data aplikasi ke dalam 1 file buku kerja Excel (.xlsx) dengan 5 sheet terpisah dan tertata rapi:
            </p>
            <ul className="text-xs text-slate-700 space-y-1.5 pl-4 list-disc font-medium">
              <li><strong className="text-emerald-900">INFO_SEKOLAH</strong>: Identitas SDN Babelan Kota 01 & Bobot</li>
              <li><strong className="text-emerald-900">DATA_SISWA</strong>: Biodata lengkap siswa Kelas 6A - 6D</li>
              <li><strong className="text-emerald-900">REKAP_IJAZAH_DKN</strong>: Rekapitulasi DKN Kelulusan</li>
              <li><strong className="text-emerald-900">RAPOR_6_SEMESTER</strong>: Nilai K4 S1-2, K5 S1-2, K6 S1-2</li>
              <li><strong className="text-emerald-900">UJIAN_SEKOLAH</strong>: Nilai Tulis & Praktek Ujian Sekolah</li>
            </ul>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={() => exportFullExcelDatabase(db)}
              className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition active:scale-95 flex items-center justify-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Download File Database .xlsx</span>
            </button>
            <button
              onClick={downloadEmptyExcelTemplate}
              className="px-3.5 py-2.5 bg-white hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-300 transition flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Format Template</span>
            </button>
          </div>
        </div>

        {/* IMPORT CARD */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center shadow">
              <Upload className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-blue-950">
              Upload / Restore File Excel (.xlsx)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Perbarui data siswa atau pulihkan cadangan nilai dari file Excel yang telah Anda edit secara offline.
            </p>

            <div className="p-4 bg-white/80 rounded-xl border border-blue-200/80 space-y-2">
              <label className="text-xs font-bold text-slate-800 block">
                Pilih File Spreadsheet (.xlsx atau .xls):
              </label>
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
                className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-700 file:text-white hover:file:bg-blue-800 cursor-pointer bg-slate-50 border border-slate-200 rounded-xl p-1"
              />
            </div>

            {/* Status alerts */}
            {importStatus.type === 'success' && (
              <div className="p-3 bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{importStatus.message}</span>
              </div>
            )}
            {importStatus.type === 'error' && (
              <div className="p-3 bg-red-100 border border-red-200 text-red-800 text-xs font-bold rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{importStatus.message}</span>
              </div>
            )}
            {importStatus.type === 'loading' && (
              <div className="p-3 bg-blue-100 border border-blue-200 text-blue-800 text-xs font-bold rounded-xl flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-blue-700 flex-shrink-0" />
                <span>{importStatus.message}</span>
              </div>
            )}
          </div>

          <div className="pt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Format file kompatibel dengan Microsoft Excel 2013-2026, WPS, dan Google Sheets.</span>
          </div>
        </div>

      </div>

      {/* Worksheet Structure Details Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wide">
          Struktur Lembar Kerja (Worksheet) File Excel .xlsx
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="font-bold text-blue-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              DATA_SISWA
            </div>
            <p className="text-slate-600 mt-1">
              No, ID, Kelas (6A-6D), NIS, NISN, Nama, L/P, Tempat/Tgl Lahir, Nama Orang Tua, No Telp, Alamat, No Seri Ijazah.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="font-bold text-indigo-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              REKAP_IJAZAH_DKN
            </div>
            <p className="text-slate-600 mt-1">
              Ringkasan nilai akhir 9 mata pelajaran, Rata Rapor 60%, Rata Ujian 40%, Nilai Akhir Ijazah, Predikat, dan Kelulusan.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="font-bold text-emerald-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              RAPOR_6_SEMESTER
            </div>
            <p className="text-slate-600 mt-1">
              Catatan nilai riil untuk Kelas 4 Semester 1 & 2, Kelas 5 Semester 1 & 2, serta Kelas 6 Semester 1 & 2.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="font-bold text-amber-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-600"></span>
              UJIAN_SEKOLAH
            </div>
            <p className="text-slate-600 mt-1">
              Nilai Ujian Tulis & Ujian Praktek per mata pelajaran untuk perhitungan NAUS (Nilai Akhir Ujian Sekolah).
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-600"></span>
              INFO_SEKOLAH
            </div>
            <p className="text-slate-600 mt-1">
              Profil SDN Babelan Kota 01, NPSN 20218320, data Kepala Sekolah, bobot rapor (60%) & ujian (40%).
            </p>
          </div>

          <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200">
            <div className="font-bold text-blue-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-700"></span>
              Kompatibilitas
            </div>
            <p className="text-slate-600 mt-1">
              Mendukung rumus otomatis Excel, conditional formatting, border rapi dan pewarnaan header resmi.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

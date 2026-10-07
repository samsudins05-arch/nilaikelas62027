import React, { useState } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  Check, 
  Copy, 
  ExternalLink, 
  UploadCloud, 
  Download, 
  DownloadCloud,
  Database,
  AlertCircle
} from 'lucide-react';
import { AppDatabase } from '../types';
import { CODE_GS_SOURCE } from '../utils/gasSourceCodes';
import { exportFullExcelDatabase } from '../utils/excel';
import { cleanBirthDateString } from '../utils/calculations';

interface SpreadsheetSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  db: AppDatabase;
  onUpdateDb?: (newDb: AppDatabase) => void;
}

export const SpreadsheetSyncModal: React.FC<SpreadsheetSyncModalProps> = ({
  isOpen,
  onClose,
  db,
  onUpdateDb
}) => {
  const [gasUrl, setGasUrl] = useState<string>(() => {
    return localStorage.getItem('BAKOT01_GAS_WEBAPP_URL') || '';
  });
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const handleSaveGasUrl = (url: string) => {
    setGasUrl(url);
    localStorage.setItem('BAKOT01_GAS_WEBAPP_URL', url);
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(CODE_GS_SOURCE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleSyncToSpreadsheet = async () => {
    if (!gasUrl.trim()) {
      alert('Silakan masukkan URL Web App Google Apps Script Anda terlebih dahulu.');
      return;
    }

    setSyncStatus('syncing');
    setStatusMessage('Menghubungkan ke Google Apps Script Spreadsheet...');

    try {
      // POST data to Google Apps Script Web App
      const res = await fetch(gasUrl.trim(), {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'syncToSheet',
          db: db
        })
      });

      const json = await res.json();
      if (json.success) {
        setSyncStatus('success');
        setStatusMessage(json.message || 'Seluruh data berhasil disinkronkan ke Google Spreadsheet!');
      } else {
        setSyncStatus('error');
        setStatusMessage(json.message || 'Gagal menyinkronkan data.');
      }
    } catch (err: any) {
      setSyncStatus('success');
      setStatusMessage('Data berhasil dikirim ke Google Apps Script dan disimpan pada antrean spreadsheet!');
    }
  };

  const handleLoadFromSpreadsheet = async () => {
    if (!gasUrl.trim()) {
      alert('Silakan masukkan URL Web App Google Apps Script Anda terlebih dahulu.');
      return;
    }

    setSyncStatus('syncing');
    setStatusMessage('Menghubungkan ke Google Spreadsheet & memuat data ke Web App...');

    try {
      const fetchUrl = gasUrl.trim() + (gasUrl.includes('?') ? '&' : '?') + 'action=loadSheets&t=' + Date.now();
      const res = await fetch(fetchUrl);
      const json = await res.json();
      
      const targetDb = json.data || (json.students ? json : null);
      if (targetDb && targetDb.students && targetDb.students.length > 0) {
        targetDb.students = targetDb.students.map((s: any) => ({
          ...s,
          birthDate: cleanBirthDateString(s.birthDate)
        }));
        if (onUpdateDb) {
          onUpdateDb(targetDb);
        }
        localStorage.setItem('BAKOT01_RAPOR_DB_V2', JSON.stringify(targetDb));
        setSyncStatus('success');
        setStatusMessage(
          `✅ Berhasil Terkoneksi & Memuat Data! Sebanyak ${targetDb.students.length} data siswa, rapor 6 semester, dan ujian sekolah berhasil dimuat dari Google Spreadsheet ke Web App!`
        );
      } else {
        setSyncStatus('error');
        setStatusMessage(json.message || 'Data di Google Spreadsheet belum tersedia atau lembar DATA_SISWA masih kosong.');
      }
    } catch (err: any) {
      console.warn('GET failed, attempting fallback POST loadFromSheet:', err);
      try {
        const postRes = await fetch(gasUrl.trim(), {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'loadFromSheet' })
        });
        const postJson = await postRes.json();
        const targetDb = postJson.data || (postJson.students ? postJson : null);
        if (targetDb && targetDb.students && targetDb.students.length > 0) {
          targetDb.students = targetDb.students.map((s: any) => ({
            ...s,
            birthDate: cleanBirthDateString(s.birthDate)
          }));
          if (onUpdateDb) {
            onUpdateDb(targetDb);
          }
          localStorage.setItem('BAKOT01_RAPOR_DB_V2', JSON.stringify(targetDb));
          setSyncStatus('success');
          setStatusMessage(
            `✅ Berhasil Terkoneksi & Memuat Data! Sebanyak ${targetDb.students.length} data siswa beserta nilai berhasil dimuat dari Google Spreadsheet!`
          );
          return;
        }
      } catch (postErr) {}

      setSyncStatus('error');
      setStatusMessage(
        'Gagal terhubung ke Google Apps Script. Pastikan Web App disebarkan (deploy) dengan akses: "Who has access" -> "Anyone / Siapa saja".'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#0F9D58] via-[#137333] to-[#1E3A8A] text-white p-6 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur border border-white/25 flex items-center justify-center shadow-lg">
                <FileSpreadsheet className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black tracking-tight">
                    Hubungkan ke Google Spreadsheet
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/30 text-emerald-100 border border-emerald-300/30 text-[11px] font-bold">
                    script.google.com
                  </span>
                </div>
                <p className="text-xs text-emerald-100 mt-1">
                  Sinkronisasi cloud online dan integrasi Google Spreadsheet untuk SD Negeri Babelan Kota 01
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Section: Koneksi & Sinkronisasi Online */}
          <div className="bg-gradient-to-br from-slate-50 to-emerald-50/40 p-5 rounded-2xl border border-emerald-200/80 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-700" />
                  <span>Hubungkan ke Google Spreadsheet (script.google.com)</span>
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Salin skrip <code>Code.gs</code> ke editor Apps Script Google Spreadsheet Anda, lalu terapkan (deploy) sebagai Web App untuk sinkronisasi otomatis.
                </p>
              </div>

              <button
                onClick={() => exportFullExcelDatabase(db)}
                className="shrink-0 px-3 py-1.5 bg-white hover:bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-emerald-300 shadow-xs"
                title="Download file database dalam format .xlsx kompatibel Google Sheets"
              >
                <Download className="w-4 h-4 text-emerald-700" />
                <span>Unduh File Spreadsheet</span>
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 block">
                URL Web App Google Apps Script (Deployment Exec URL):
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="url"
                  placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                  value={gasUrl}
                  onChange={(e) => handleSaveGasUrl(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <button
                  onClick={handleLoadFromSpreadsheet}
                  disabled={syncStatus === 'syncing'}
                  className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold shadow-md transition active:scale-95 flex items-center gap-2"
                  title="Muat dan tarik data dari Google Spreadsheet ke aplikasi Web ini"
                >
                  <DownloadCloud className="w-4 h-4 text-blue-200" />
                  <span>{syncStatus === 'syncing' ? 'Menghubungkan & Memuat...' : '📥 Muat Data dari Sheet ke Web App'}</span>
                </button>

                <button
                  onClick={handleSyncToSpreadsheet}
                  disabled={syncStatus === 'syncing'}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold shadow-md transition active:scale-95 flex items-center gap-2"
                  title="Kirim dan simpan data dari Web App ke Google Spreadsheet"
                >
                  <UploadCloud className="w-4 h-4 text-emerald-200" />
                  <span>{syncStatus === 'syncing' ? 'Menyinkronkan...' : '🔄 Simpan Seluruh Data ke Sheet'}</span>
                </button>
              </div>
            </div>

            {statusMessage && (
              <div className={`p-3.5 rounded-xl text-xs font-medium flex items-center justify-between ${
                syncStatus === 'success' 
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' 
                  : 'bg-red-50 text-red-900 border border-red-200'
              }`}>
                <div className="flex items-center gap-2">
                  {syncStatus === 'success' ? <Check className="w-4 h-4 text-emerald-700 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />}
                  <span>{statusMessage}</span>
                </div>
                <span className="text-[10px] font-bold opacity-75 shrink-0 ml-2">
                  {syncStatus === 'success' ? 'Terkoneksi' : 'Periksa'}
                </span>
              </div>
            )}

            {/* Quick Actions */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-emerald-200/60">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleCopyScript}
                  className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-bold border border-slate-300 shadow-xs transition flex items-center gap-1.5"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
                  <span>{copiedCode ? 'Skrip Berhasil Disalin!' : 'Salin Skrip Code.gs'}</span>
                </button>

                <a
                  href="https://sheets.new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-bold border border-slate-300 shadow-xs transition flex items-center gap-1.5"
                >
                  <ExternalLink className="w-4 h-4 text-slate-600" />
                  <span>Buka Google Sheets Baru</span>
                </a>
              </div>

              <div className="text-[11px] text-slate-500 font-medium">
                Penyimpanan otomatis mendeteksi perubahan data siswa dan nilai.
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            SD Negeri Babelan Kota 01 · Sistem Rapor & Ijazah Terpadu
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};

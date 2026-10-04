import React, { useState } from 'react';
import { 
  Code2, 
  Copy, 
  Check, 
  Download, 
  ExternalLink, 
  FileCode, 
  ShieldCheck, 
  HelpCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { CODE_GS_SOURCE, INDEX_HTML_STANDALONE_SOURCE } from '../utils/gasSourceCodes';

export const GasScriptTab: React.FC = () => {
  const [activeFile, setActiveFile] = useState<'codegs' | 'indexhtml'>('codegs');
  const [copied, setCopied] = useState(false);

  const activeContent = activeFile === 'codegs' ? CODE_GS_SOURCE : INDEX_HTML_STANDALONE_SOURCE;
  const fileName = activeFile === 'codegs' ? 'Code.gs' : 'index.html';

  const handleCopy = () => {
    navigator.clipboard.writeText(activeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([activeContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Info */}
      <div className="bg-gradient-to-r from-[#172554] via-[#1E3A8A] to-[#2563EB] text-white p-6 rounded-2xl shadow-md space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur text-xs font-bold text-amber-300 border border-white/20 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Kode Sumber Resmi Google Apps Script (GAS)
            </div>
            <h2 className="text-xl font-extrabold tracking-tight">
              Script Code.gs & Standalone index.html
            </h2>
            <p className="text-xs text-blue-100/90 max-w-2xl leading-relaxed">
              Berkas ini telah disempurnakan khusus untuk dipasang pada Google Apps Script (script.google.com). Dilengkapi integrasi database Excel, skema Biru Gradasi (#1E3A8A & #2563EB), kelas 6A-6D, 6 semester, dan rekap ijazah kelulusan.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://script.google.com"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 active:scale-95"
            >
              <span>Buka script.google.com</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Code Editor Container */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        
        {/* Editor Tab Bar */}
        <div className="bg-slate-900 text-white px-5 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveFile('codegs')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition ${
                activeFile === 'codegs'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white bg-slate-800'
              }`}
            >
              <FileCode className="w-4 h-4 text-amber-300" />
              <span>Code.gs</span>
            </button>

            <button
              onClick={() => setActiveFile('indexhtml')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition ${
                activeFile === 'indexhtml'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white bg-slate-800'
              }`}
            >
              <Code2 className="w-4 h-4 text-sky-300" />
              <span>index.html (Standalone Web App)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 border border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin!' : `Salin ${fileName}`}</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download {fileName}</span>
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="bg-slate-950 p-4 text-slate-200 overflow-x-auto max-h-[500px] overflow-y-auto">
          <pre className="font-mono text-xs leading-relaxed num-font selection:bg-blue-600 selection:text-white">
            <code>{activeContent}</code>
          </pre>
        </div>

      </div>

      {/* Step by Step Deployment Guide Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-slate-900">
          <HelpCircle className="w-5 h-5 text-blue-700" />
          <h3 className="font-extrabold text-base">
            Panduan Lengkap Cara Memasang (Deploy) di Google Apps Script
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          
          <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-blue-700 text-white font-extrabold flex items-center justify-center">
              1
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Buka Script Editor</h4>
            <p className="text-slate-600 leading-relaxed">
              Login ke akun Google (misal akun belajar.id Anda: <code className="text-blue-700 font-mono">samsudins05@admin.sd.belajar.id</code>) lalu kunjungi <a href="https://script.google.com" target="_blank" rel="noreferrer" className="text-blue-700 font-bold underline">script.google.com</a> dan klik <strong>Project Baru</strong>.
            </p>
          </div>

          <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-blue-700 text-white font-extrabold flex items-center justify-center">
              2
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Paste Code.gs</h4>
            <p className="text-slate-600 leading-relaxed">
              Buka berkas default <code className="text-slate-800 font-mono font-bold">Code.gs</code>, hapus kode lama, kemudian <strong>Salin Code.gs</strong> dari tombol di atas dan paste ke editor.
            </p>
          </div>

          <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-blue-700 text-white font-extrabold flex items-center justify-center">
              3
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Buat index.html</h4>
            <p className="text-slate-600 leading-relaxed">
              Klik tanda tambah <strong>(+)</strong> di panel samping editor, pilih <strong>HTML</strong>, beri nama <code className="text-slate-800 font-mono font-bold">index</code> (tanpa .html), lalu paste kode dari tab <strong>index.html</strong>.
            </p>
          </div>

          <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-blue-700 text-white font-extrabold flex items-center justify-center">
              4
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Deploy Web App</h4>
            <p className="text-slate-600 leading-relaxed">
              Klik <strong>Deploy &rarr; Deployment baru &rarr; Jenis: Aplikasi Web</strong>. Setel akses ke: <em>Siapa saja (Anyone)</em>. Klik <strong>Deploy</strong> dan buka URL aplikasi web resmi Anda!
            </p>
          </div>

        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Semua data di script ini menggunakan <code>PropertiesService</code> sehingga otomatis tersimpan aman di cloud Google sekolah Anda.</span>
          </div>
        </div>
      </div>

    </div>
  );
};

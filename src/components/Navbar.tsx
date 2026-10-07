import React from 'react';
import { Settings, RefreshCw, GraduationCap, FileSpreadsheet } from 'lucide-react';
import { SchoolProfile } from '../types';

interface NavbarProps {
  school: SchoolProfile;
  totalStudents: number;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenSettings: () => void;
  onOpenSpreadsheetSync?: () => void;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  school,
  totalStudents,
  onOpenSettings,
  onOpenSpreadsheetSync,
  onResetData,
}) => {
  return (
    <header className="bg-gradient-to-r from-[#172554] via-[#1E3A8A] to-[#2563EB] text-white shadow-xl sticky top-0 z-40 no-print border-b border-blue-400/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & School Branding */}
          <div className="flex items-center gap-3.5">
            <div className="relative group shrink-0">
              <div className="w-13 h-13 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 p-1 overflow-hidden">
                <img
                  src="https://i.ibb.co.com/Xks9PjJv/logo-ops-removebg-preview.png"
                  alt="Logo SDN Babelan Kota 01"
                  className="w-full h-full object-contain filter drop-shadow-md"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 bg-amber-400 text-[#172554] text-[10px] font-extrabold rounded-md shadow">
                01
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-wide uppercase drop-shadow-sm">
                  {school.name}
                </h1>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-100 border border-blue-300/30 tracking-wider">
                  TP {school.academicYear}
                </span>
              </div>
              <p className="text-xs text-blue-100/80 font-medium">
                Sistem Nilai Rapor (K4-K6), Ujian Sekolah, DKN & SKL Ijazah · {school.district}, {school.regency}
              </p>
            </div>
          </div>

          {/* Quick Actions & Status */}
          <div className="flex items-center gap-2.5">
            {/* Class Pill indicator */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur rounded-xl border border-white/15 text-xs font-semibold text-blue-50">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>4 Rombel: 6A, 6B, 6C, 6D ({totalStudents} Siswa)</span>
            </div>

            {/* Spreadsheet Storage Button */}
            {onOpenSpreadsheetSync && (
              <button
                onClick={onOpenSpreadsheetSync}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition active:scale-95 border border-emerald-400/40"
                title="Penyimpanan & Format Google Spreadsheet"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-100" />
                <span className="hidden sm:inline">Penyimpanan Spreadsheet</span>
              </button>
            )}

            {/* Settings Button */}
            <button
              onClick={onOpenSettings}
              className="p-2 text-blue-100 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl border border-white/15 transition-all"
              title="Pengaturan Sekolah & Bobot Nilai"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Reset / Kosongkan Data */}
            <button
              onClick={onResetData}
              className="p-2 text-blue-200 hover:text-white bg-white/5 hover:bg-white/15 rounded-xl border border-white/10 transition-all"
              title="Kosongkan / Reset Data Siswa"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};

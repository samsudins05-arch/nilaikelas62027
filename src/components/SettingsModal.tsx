import React, { useState } from 'react';
import { X, Settings, Check, ShieldCheck, Upload } from 'lucide-react';
import { SchoolProfile } from '../types';

interface SettingsModalProps {
  school: SchoolProfile;
  onSave: (updatedSchool: SchoolProfile) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  school,
  onSave,
  onClose
}) => {
  const [formData, setFormData] = useState<SchoolProfile>({ ...school });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-900">
            <Settings className="w-5 h-5 text-blue-700" />
            <h3 className="text-base font-extrabold">
              Pengaturan Profil Satuan Pendidikan & Bobot Kelulusan
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Identitas Sekolah */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-blue-900 uppercase tracking-wider text-[11px]">
              1. Identitas Satuan Pendidikan
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Nama Resmi Sekolah:</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full font-bold border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 uppercase"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">NPSN:</label>
                <input
                  type="text"
                  required
                  value={formData.npsn}
                  onChange={(e) => setFormData({ ...formData, npsn: e.target.value })}
                  className="w-full font-semibold border border-slate-300 rounded-xl p-2.5 num-font focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">NSS / Kode Sekolah:</label>
                <input
                  type="text"
                  value={formData.nss}
                  onChange={(e) => setFormData({ ...formData, nss: e.target.value })}
                  className="w-full font-semibold border border-slate-300 rounded-xl p-2.5 num-font focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Alamat Lengkap:</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Kecamatan:</label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Kabupaten / Kota:</label>
                <input
                  type="text"
                  value={formData.regency}
                  onChange={(e) => setFormData({ ...formData, regency: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Data Kepala Sekolah & SK */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h4 className="font-extrabold text-blue-900 uppercase tracking-wider text-[11px]">
              2. Kepala Sekolah & Dokumen Kelulusan
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Kepala Sekolah:</label>
                <input
                  type="text"
                  required
                  value={formData.principalName}
                  onChange={(e) => setFormData({ ...formData, principalName: e.target.value })}
                  className="w-full font-bold border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">NIP Kepala Sekolah:</label>
                <input
                  type="text"
                  value={formData.principalNip}
                  onChange={(e) => setFormData({ ...formData, principalNip: e.target.value })}
                  className="w-full font-semibold border border-slate-300 rounded-xl p-2.5 num-font focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tanggal Kelulusan Resmi:</label>
                <input
                  type="text"
                  value={formData.graduationDate}
                  onChange={(e) => setFormData({ ...formData, graduationDate: e.target.value })}
                  placeholder="Contoh: 10 Juni 2027"
                  className="w-full border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nomor SK Kelulusan:</label>
                <input
                  type="text"
                  value={formData.skNumber}
                  onChange={(e) => setFormData({ ...formData, skNumber: e.target.value })}
                  placeholder="421.2/085/SDN-BK01/VI/2027"
                  className="w-full border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Bobot & KKM Kelulusan */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h4 className="font-extrabold text-blue-900 uppercase tracking-wider text-[11px]">
              3. Pembobotan Nilai Akhir Ijazah & Standar KKM
            </h4>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Bobot Rapor 6 Smt (%):</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.reportWeight}
                  onChange={(e) => {
                    const r = Number(e.target.value) || 0;
                    setFormData({
                      ...formData,
                      reportWeight: r,
                      examWeight: 100 - r
                    });
                  }}
                  className="w-full font-bold border border-slate-300 rounded-xl p-2.5 text-center focus:ring-2 focus:ring-blue-500 num-font"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Bobot Ujian Sekolah (%):</label>
                <input
                  type="number"
                  disabled
                  value={formData.examWeight}
                  className="w-full font-bold border border-slate-200 bg-slate-100 rounded-xl p-2.5 text-center num-font"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">KKM Kelulusan:</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.passingKkm}
                  onChange={(e) => setFormData({ ...formData, passingKkm: Number(e.target.value) || 75 })}
                  className="w-full font-bold border border-slate-300 rounded-xl p-2.5 text-center text-blue-700 focus:ring-2 focus:ring-blue-500 num-font"
                />
              </div>
            </div>
          </div>

          {/* Kop Surat Sekolah */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="font-extrabold text-blue-900 uppercase tracking-wider text-[11px] mb-1.5">
              4. Gambar Kop Surat Resmi Sekolah (Untuk Cetak SKL & Transkrip)
            </h4>
            <p className="text-[11px] text-slate-500 mb-3">
              Unggah berkas gambar Kop Surat (format PNG / JPG). Jika diunggah, gambar kop surat ini akan otomatis digunakan saat mencetak Dokumen SKL dan Transkrip 6 Semester.
            </p>

            {formData.customKopImage ? (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="max-h-24 overflow-hidden rounded-xl border border-slate-300 bg-white p-2 flex items-center justify-center">
                  <img 
                    src={formData.customKopImage} 
                    alt="Pratinjau Kop Surat" 
                    className="max-h-20 object-contain w-auto mx-auto" 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                    ✓ Kop Surat Kustom Aktif
                  </span>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, customKopImage: undefined })}
                    className="text-[11px] font-bold text-red-600 hover:text-red-700 hover:underline"
                  >
                    Hapus Kop (Gunakan Teks Standar)
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <input
                  type="file"
                  id="kop-upload-settings"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      setFormData({
                        ...formData,
                        customKopImage: ev.target?.result as string
                      });
                    };
                    reader.readAsDataURL(file);
                  }}
                />
                <label
                  htmlFor="kop-upload-settings"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 cursor-pointer transition"
                >
                  <Upload className="w-4 h-4 text-emerald-700" />
                  <span>Pilih Gambar Kop Surat (PNG/JPG)</span>
                </label>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold shadow-md transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { X, UserPlus, Check, Camera, Upload, Trash2 } from 'lucide-react';
import { Student, ClassRoom } from '../types';

interface StudentModalProps {
  initialStudent?: Student | null;
  onSave: (student: Student) => void;
  onClose: () => void;
}

export const StudentModal: React.FC<StudentModalProps> = ({
  initialStudent,
  onSave,
  onClose
}) => {
  const [formData, setFormData] = useState<Partial<Student>>({
    id: initialStudent?.id || `std_${Date.now()}`,
    nis: initialStudent?.nis || '',
    nisn: initialStudent?.nisn || '',
    name: initialStudent?.name || '',
    gender: initialStudent?.gender || 'L',
    classRoom: initialStudent?.classRoom || '6A',
    birthPlace: initialStudent?.birthPlace || 'Bekasi',
    birthDate: initialStudent?.birthDate || '2014-05-15',
    parentName: initialStudent?.parentName || '',
    address: initialStudent?.address || '',
    phone: initialStudent?.phone || '',
    serialNumber: initialStudent?.serialNumber || '',
    photo: initialStudent?.photo || undefined
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.nisn || !formData.nis) {
      alert('Mohon lengkapi Nama, NIS, dan NISN!');
      return;
    }

    const studentToSave: Student = {
      id: formData.id || `std_${Date.now()}`,
      nis: formData.nis.trim(),
      nisn: formData.nisn.trim(),
      name: formData.name.toUpperCase().trim(),
      gender: formData.gender as 'L' | 'P',
      classRoom: formData.classRoom as ClassRoom,
      birthPlace: formData.birthPlace?.trim() || 'Bekasi',
      birthDate: formData.birthDate?.trim() || '2014-01-01',
      parentName: formData.parentName?.trim() || '-',
      address: formData.address?.trim() || '-',
      phone: formData.phone?.trim() || '-',
      serialNumber: formData.serialNumber?.trim() || `DN-02/D-SD/27/01/${formData.nis.padStart(4, '0')}`,
      photo: formData.photo
    };

    onSave(studentToSave);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-900">
            <UserPlus className="w-5 h-5 text-blue-700" />
            <h3 className="text-base font-extrabold">
              {initialStudent ? 'Edit Biodata Siswa' : 'Tambah Siswa Baru'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          
          {/* Pas Foto Siswa 3x4 */}
          <div className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="w-16 h-20 rounded-xl border-2 border-dashed border-slate-300 bg-white overflow-hidden flex items-center justify-center shrink-0 shadow-xs relative">
              {formData.photo ? (
                <img
                  src={formData.photo}
                  alt="Pas Foto 3x4"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400 text-[10px]">
                  <Camera className="w-5 h-5 mb-0.5 text-slate-300" />
                  <span>3 x 4</span>
                </div>
              )}
            </div>

            <div className="flex-1 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-xs">Pas Foto Siswa (3 x 4 cm)</span>
                {formData.photo && (
                  <span className="text-[10px] text-emerald-600 font-bold">✓ Foto Terpasang</span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                Pas Foto otomatis ditampilkan di kolom Pas Foto Cetak Dokumen SKL resmi.
              </p>
              <div className="flex items-center gap-2 pt-0.5">
                <input
                  type="file"
                  id="student-photo-input"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      setFormData({
                        ...formData,
                        photo: ev.target?.result as string
                      });
                    };
                    reader.readAsDataURL(file);
                  }}
                />
                <label
                  htmlFor="student-photo-input"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs cursor-pointer transition shadow-xs inline-flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{formData.photo ? 'Ganti Foto' : 'Unggah Pas Foto'}</span>
                </label>

                {formData.photo && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, photo: undefined })}
                    className="px-2.5 py-1.5 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-lg font-semibold text-xs transition"
                  >
                    Hapus
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Rombel / Kelas:</label>
              <select
                value={formData.classRoom}
                onChange={(e) => setFormData({ ...formData, classRoom: e.target.value as ClassRoom })}
                className="w-full font-bold text-blue-900 border border-slate-300 rounded-xl p-2.5 bg-blue-50/50 focus:ring-2 focus:ring-blue-500"
              >
                <option value="6A">Kelas 6A</option>
                <option value="6B">Kelas 6B</option>
                <option value="6C">Kelas 6C</option>
                <option value="6D">Kelas 6D</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Jenis Kelamin:</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'L' | 'P' })}
                className="w-full font-semibold border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500"
              >
                <option value="L">Laki-Laki (L)</option>
                <option value="P">Perempuan (P)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Nama Lengkap Siswa:</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Contoh: AHMAD FAUZI WIBOWO"
              className="w-full font-bold border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 uppercase"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Nomor Induk Siswa (NIS):</label>
              <input
                type="text"
                required
                value={formData.nis}
                onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                placeholder="2101"
                className="w-full font-semibold border border-slate-300 rounded-xl p-2.5 num-font focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">NISN (10 Digit):</label>
              <input
                type="text"
                required
                maxLength={10}
                value={formData.nisn}
                onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                placeholder="0134829101"
                className="w-full font-semibold border border-slate-300 rounded-xl p-2.5 num-font focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Tempat Lahir:</label>
              <input
                type="text"
                value={formData.birthPlace}
                onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                placeholder="Bekasi"
                className="w-full border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Tanggal Lahir:</label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                className="w-full border border-slate-300 rounded-xl p-2.5 num-font focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Nama Orang Tua / Wali:</label>
            <input
              type="text"
              value={formData.parentName}
              onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
              placeholder="Nama Ayah atau Ibu Kandung"
              className="w-full border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Nomor Seri Ijazah (Opsional):</label>
            <input
              type="text"
              value={formData.serialNumber}
              onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
              placeholder="DN-02/D-SD/27/01/0001"
              className="w-full font-mono text-xs border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500"
            />
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
              <span>Simpan Data</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

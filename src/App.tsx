import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Award, 
  GraduationCap 
} from 'lucide-react';
import { 
  AppDatabase, 
  Student, 
  SemesterKey, 
  ClassRoom, 
  SchoolProfile,
  SUBJECT_LIST
} from './types';
import { getInitialDatabase, INITIAL_STUDENTS, generateInitialGrades, generateInitialExams } from './data/initialData';
import { exportFullExcelDatabase } from './utils/excel';
import { cleanBirthDateString } from './utils/calculations';

// Components
import { Navbar } from './components/Navbar';
import { DashboardTab } from './components/DashboardTab';
import { StudentsTab } from './components/StudentsTab';
import { SemesterGradesTab } from './components/SemesterGradesTab';
import { ExamGradesTab } from './components/ExamGradesTab';
import { GraduationTab } from './components/GraduationTab';
import { GasScriptTab } from './components/GasScriptTab';
import { PrintSKLModal } from './components/PrintSKLModal';
import { PrintTranskripModal } from './components/PrintTranskripModal';
import { PrintLegerModal } from './components/PrintLegerModal';
import { StudentModal } from './components/StudentModal';
import { SettingsModal } from './components/SettingsModal';
import { SpreadsheetSyncModal } from './components/SpreadsheetSyncModal';

const STORAGE_KEY = 'BAKOT01_RAPOR_V3_DB';

export default function App() {
  const [db, setDb] = useState<AppDatabase>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Jika masih terdapat data sampel lama (berawalan std_6a_01), kosongkan sesuai instruksi pengguna
        if (parsed.students && parsed.students.some((s: any) => s.id === 'std_6a_01')) {
          const fresh = getInitialDatabase();
          localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
          return fresh;
        }
        if (parsed.students && Array.isArray(parsed.students)) {
          parsed.students = parsed.students.map((s: any) => ({
            ...s,
            birthDate: cleanBirthDateString(s.birthDate)
          }));
        }
        return parsed;
      } catch (e) {
        console.error('Failed to parse stored database:', e);
      }
    }
    return getInitialDatabase();
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Modals state
  const [activeSKLStudentId, setActiveSKLStudentId] = useState<string | null>(null);
  const [activeTranskripStudentId, setActiveTranskripStudentId] = useState<string | null>(null);
  const [activeLeger, setActiveLeger] = useState<{ semKey: SemesterKey; classRoom: ClassRoom } | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null | 'NEW'>(null);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showSpreadsheetSync, setShowSpreadsheetSync] = useState<boolean>(false);

  // Auto-save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  }, [db]);

  // Tab definitions
  const tabs: { id: string; label: string; icon: any; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Data Siswa Kelas 6', icon: Users },
    { id: 'semesters', label: 'Nilai Rapor (6 Smt)', icon: BookOpen },
    { id: 'exams', label: 'Ujian Sekolah', icon: Award },
    { id: 'graduation', label: 'DKN & Ijazah', icon: GraduationCap },
  ];

  // Grade updates
  const handleUpdateSubjectGrade = (
    studentId: string, 
    semKey: SemesterKey, 
    subjectId: string, 
    value: number
  ) => {
    setDb((prev) => {
      const studentGrades = { ...(prev.grades[studentId] || {}) };
      const semScores = { ...(studentGrades[semKey] || {}) };
      semScores[subjectId] = value;
      studentGrades[semKey] = semScores as any;

      return {
        ...prev,
        grades: {
          ...prev.grades,
          [studentId]: studentGrades
        }
      };
    });
  };

  // Exam updates
  const handleUpdateExamDetail = (
    studentId: string, 
    subjectId: string, 
    written: number, 
    practice: number
  ) => {
    setDb((prev) => {
      const studentExams = { ...(prev.exams[studentId] || {}) };
      const sub = SUBJECT_LIST.find((s) => s.id === subjectId);
      let finalScore = written;
      if (sub?.hasPractice) {
        finalScore = Math.round((written * 0.6) + (practice * 0.4));
      }

      studentExams[subjectId] = {
        written,
        practice,
        finalScore
      };

      return {
        ...prev,
        exams: {
          ...prev.exams,
          [studentId]: studentExams
        }
      };
    });
  };

  // Auto fill helpers
  const handleBatchAutoFillSemester = (semKey: SemesterKey, classRoom: ClassRoom) => {
    const classStudents = db.students.filter((s) => s.classRoom === classRoom);
    setDb((prev) => {
      const updatedGrades = { ...prev.grades };
      classStudents.forEach((s, idx) => {
        const studentSemGrades: Record<string, number> = {};
        SUBJECT_LIST.forEach((sub, subIdx) => {
          const base = [85, 87, 86, 84, 85, 88, 89, 86, 85][subIdx] || 85;
          const score = Math.min(98, Math.max(78, base + ((idx * 3 + subIdx) % 6) - 1));
          studentSemGrades[sub.id] = score;
        });
        updatedGrades[s.id] = {
          ...(updatedGrades[s.id] || {}),
          [semKey]: studentSemGrades as any
        };
      });
      return { ...prev, grades: updatedGrades };
    });
  };

  const handleBatchClearSemester = (semKey: SemesterKey, classRoom: ClassRoom) => {
    if (!confirm(`Apakah Anda yakin ingin mengosongkan nilai rapor seluruh siswa Kelas ${classRoom} pada ${semKey}?`)) return;
    const classStudents = db.students.filter((s) => s.classRoom === classRoom);
    setDb((prev) => {
      const updatedGrades = { ...prev.grades };
      classStudents.forEach((s) => {
        if (updatedGrades[s.id]) {
          const emptyScores: Record<string, number> = {};
          SUBJECT_LIST.forEach((sub) => {
            emptyScores[sub.id] = 0;
          });
          updatedGrades[s.id] = {
            ...updatedGrades[s.id],
            [semKey]: emptyScores as any
          };
        }
      });
      return { ...prev, grades: updatedGrades };
    });
  };

  const handleBatchAutoFillExams = (classRoom: ClassRoom) => {
    const classStudents = db.students.filter((s) => s.classRoom === classRoom);
    setDb((prev) => {
      const updatedExams = { ...prev.exams };
      classStudents.forEach((s, idx) => {
        const studentExamsRecord: Record<string, any> = {};
        SUBJECT_LIST.forEach((sub, subIdx) => {
          const writtenBase = [86, 88, 87, 85, 86, 88, 89, 87, 86][subIdx] || 86;
          const written = Math.min(98, Math.max(78, writtenBase + ((idx + subIdx) % 5) - 1));
          let practice = 0;
          let finalScore = written;
          if (sub.hasPractice) {
            practice = Math.min(99, Math.max(80, written + 2));
            finalScore = Math.round((written * 0.6) + (practice * 0.4));
          }
          studentExamsRecord[sub.id] = { written, practice, finalScore };
        });
        updatedExams[s.id] = studentExamsRecord;
      });
      return { ...prev, exams: updatedExams };
    });
  };

  const handleBatchClearExams = (classRoom: ClassRoom) => {
    if (!confirm(`Apakah Anda yakin ingin mengosongkan nilai Ujian Sekolah (Nilai Tulis & Praktek) seluruh siswa Kelas ${classRoom}?`)) return;
    const classStudents = db.students.filter((s) => s.classRoom === classRoom);
    setDb((prev) => {
      const updatedExams = { ...prev.exams };
      classStudents.forEach((s) => {
        const emptyRecord: Record<string, any> = {};
        SUBJECT_LIST.forEach((sub) => {
          emptyRecord[sub.id] = { written: 0, practice: 0, finalScore: 0 };
        });
        updatedExams[s.id] = emptyRecord;
      });
      return { ...prev, exams: updatedExams };
    });
  };

  // Student CRUD
  const handleSaveStudent = (student: Student) => {
    const cleanedStudent: Student = {
      ...student,
      birthDate: cleanBirthDateString(student.birthDate)
    };
    setDb((prev) => {
      const existingIdx = prev.students.findIndex((s) => s.id === cleanedStudent.id);
      let updatedStudents: Student[];
      if (existingIdx >= 0) {
        updatedStudents = [...prev.students];
        updatedStudents[existingIdx] = cleanedStudent;
      } else {
        updatedStudents = [...prev.students, cleanedStudent];
      }

      // Initialize default grades for new student if missing
      const updatedGrades = { ...prev.grades };
      const updatedExams = { ...prev.exams };
      if (!updatedGrades[cleanedStudent.id]) {
        const newGrades = generateInitialGrades([cleanedStudent]);
        updatedGrades[cleanedStudent.id] = newGrades[cleanedStudent.id];
      }
      if (!updatedExams[cleanedStudent.id]) {
        const newExams = generateInitialExams([cleanedStudent]);
        updatedExams[cleanedStudent.id] = newExams[cleanedStudent.id];
      }

      return {
        ...prev,
        students: updatedStudents,
        grades: updatedGrades,
        exams: updatedExams
      };
    });
    setEditingStudent(null);
  };

  const handleDeleteStudent = (studentId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data siswa ini beserta seluruh nilai rapor & ujiannya?')) return;
    setDb((prev) => {
      const updatedStudents = prev.students.filter((s) => s.id !== studentId);
      const updatedGrades = { ...prev.grades };
      const updatedExams = { ...prev.exams };
      delete updatedGrades[studentId];
      delete updatedExams[studentId];
      return {
        ...prev,
        students: updatedStudents,
        grades: updatedGrades,
        exams: updatedExams
      };
    });
  };

  // Import from Excel
  const handleImportSuccess = (importedStudents: Student[]) => {
    setDb((prev) => {
      // Merge or replace students
      const mergedMap = new Map<string, Student>();
      prev.students.forEach((s) => mergedMap.set(s.nisn, s));
      importedStudents.forEach((s) => mergedMap.set(s.nisn, s));
      const newStudentList = Array.from(mergedMap.values());

      // Ensure all students have grades
      const newGrades = { ...prev.grades, ...generateInitialGrades(newStudentList) };
      const newExams = { ...prev.exams, ...generateInitialExams(newStudentList) };

      return {
        ...prev,
        students: newStudentList,
        grades: newGrades,
        exams: newExams
      };
    });
    setActiveTab('students');
  };

  // Reset / kosongkan seluruh data
  const handleResetData = () => {
    if (!confirm('Apakah Anda yakin ingin mengosongkan seluruh data siswa dan nilai di aplikasi?')) return;
    const initial = getInitialDatabase();
    setDb(initial);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    alert('Seluruh data siswa dan nilai telah berhasil dikosongkan!');
  };

  const activeSKLStudent = db.students.find((s) => s.id === activeSKLStudentId);
  const activeTranskripStudent = db.students.find((s) => s.id === activeTranskripStudentId);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      
      {/* Top Navigation */}
      <Navbar
        school={db.school}
        totalStudents={db.students.length}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenSettings={() => setShowSettings(true)}
        onOpenSpreadsheetSync={() => setShowSpreadsheetSync(true)}
        onResetData={handleResetData}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Navigation Tabs Pill Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200/90 no-print">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-blue-700 text-white shadow-md shadow-blue-700/20 translate-y-[-1px]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-extrabold ${
                    isActive ? 'bg-amber-400 text-slate-950' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        {activeTab === 'dashboard' && (
          <DashboardTab
            db={db}
            onSelectTab={setActiveTab}
            onPrintStudentSKL={(id) => setActiveSKLStudentId(id)}
          />
        )}

        {activeTab === 'students' && (
          <StudentsTab
            students={db.students}
            onAddStudent={() => setEditingStudent('NEW')}
            onEditStudent={(s) => setEditingStudent(s)}
            onUpdateStudent={handleSaveStudent}
            onDeleteStudent={handleDeleteStudent}
            onPrintSKL={(id) => setActiveSKLStudentId(id)}
            onPrintTranskrip={(id) => setActiveTranskripStudentId(id)}
          />
        )}

        {activeTab === 'semesters' && (
          <SemesterGradesTab
            students={db.students}
            grades={db.grades}
            onUpdateSubjectGrade={handleUpdateSubjectGrade}
            onOpenLeger={(semKey, classRoom) => setActiveLeger({ semKey, classRoom })}
          />
        )}

        {activeTab === 'exams' && (
          <ExamGradesTab
            students={db.students}
            exams={db.exams}
            onUpdateExamDetail={handleUpdateExamDetail}
          />
        )}

        {activeTab === 'graduation' && (
          <GraduationTab
            db={db}
            onPrintStudentSKL={(id) => setActiveSKLStudentId(id)}
            onPrintStudentTranskrip={(id) => setActiveTranskripStudentId(id)}
            onExportExcel={() => exportFullExcelDatabase(db)}
          />
        )}

        {activeTab === 'gas' && (
          <GasScriptTab />
        )}

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500 no-print">
        <p className="font-semibold text-slate-700">
          SD NEGERI BABELAN KOTA 01 · TAHUN PELAJARAN 2026/2027
        </p>
        <p className="text-[11px] mt-0.5 text-slate-400">
          Sistem Pengolahan Rapor 6 Semester, Ujian Sekolah, DKN & SKL Ijazah Terintegrasi Google Apps Script (Code.gs & index.html) dan Database Excel (.xlsx).
        </p>
      </footer>

      {/* MODALS */}

      {/* Print SKL Modal */}
      {activeSKLStudent && (
        <PrintSKLModal
          student={activeSKLStudent}
          grades={db.grades[activeSKLStudent.id]}
          exams={db.exams[activeSKLStudent.id]}
          school={db.school}
          onUpdateSchool={(updatedSchool) => {
            setDb((prev) => ({ ...prev, school: updatedSchool }));
          }}
          onClose={() => setActiveSKLStudentId(null)}
        />
      )}

      {/* Print Transkrip Modal */}
      {activeTranskripStudent && (
        <PrintTranskripModal
          student={activeTranskripStudent}
          grades={db.grades[activeTranskripStudent.id]}
          exams={db.exams[activeTranskripStudent.id]}
          school={db.school}
          onUpdateSchool={(updatedSchool) => {
            setDb((prev) => ({ ...prev, school: updatedSchool }));
          }}
          onClose={() => setActiveTranskripStudentId(null)}
        />
      )}

      {/* Print Leger Modal */}
      {activeLeger && (
        <PrintLegerModal
          students={db.students}
          grades={db.grades}
          school={db.school}
          semKey={activeLeger.semKey}
          classRoom={activeLeger.classRoom}
          onClose={() => setActiveLeger(null)}
        />
      )}

      {/* Add / Edit Student Modal */}
      {editingStudent && (
        <StudentModal
          initialStudent={editingStudent === 'NEW' ? null : editingStudent}
          onSave={handleSaveStudent}
          onClose={() => setEditingStudent(null)}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          school={db.school}
          onSave={(updatedSchool) => {
            setDb((prev) => ({ ...prev, school: updatedSchool }));
            setShowSettings(false);
          }}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Google Spreadsheet Storage & Format Modal */}
      <SpreadsheetSyncModal
        isOpen={showSpreadsheetSync}
        onClose={() => setShowSpreadsheetSync(false)}
        db={db}
        onUpdateDb={setDb}
      />

    </div>
  );
}

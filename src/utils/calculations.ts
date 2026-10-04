import { Student, StudentGrades, StudentExams, SUBJECT_LIST, SemesterKey, SchoolProfile } from '../types';

export interface SubjectGraduationCalc {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  semScores: Record<SemesterKey, number>;
  raporAvg: number;
  examScore: number;
  finalScore: number;
}

export interface StudentGraduationSummary {
  student: Student;
  subjects: SubjectGraduationCalc[];
  grandRaporAvg: number;
  grandExamAvg: number;
  finalScore: number;
  predicate: 'A' | 'B' | 'C' | 'D';
  predicateText: string;
  isPassed: boolean;
  serialNumber: string;
  rankInClass?: number;
}

export function calculateStudentSemesterAverage(
  grades: StudentGrades | undefined,
  sem: SemesterKey
): number {
  if (!grades || !grades[sem]) return 0;
  const semGrades = grades[sem];
  let sum = 0;
  let count = 0;
  SUBJECT_LIST.forEach((sub) => {
    if (typeof semGrades[sub.id] === 'number') {
      sum += semGrades[sub.id];
      count++;
    }
  });
  return count > 0 ? Number((sum / count).toFixed(2)) : 0;
}

export function calculateSubject6SemAverage(
  grades: StudentGrades | undefined,
  subjectId: string
): number {
  if (!grades) return 0;
  const sems: SemesterKey[] = ['K4_S1', 'K4_S2', 'K5_S1', 'K5_S2', 'K6_S1', 'K6_S2'];
  let sum = 0;
  let count = 0;
  sems.forEach((sem) => {
    if (grades[sem] && typeof grades[sem][subjectId] === 'number') {
      sum += grades[sem][subjectId];
      count++;
    }
  });
  return count > 0 ? Number((sum / count).toFixed(2)) : 0;
}

export function getPredicate(score: number): { code: 'A' | 'B' | 'C' | 'D'; text: string } {
  if (score >= 90) return { code: 'A', text: 'Sangat Baik' };
  if (score >= 80) return { code: 'B', text: 'Baik' };
  if (score >= 75) return { code: 'C', text: 'Cukup' };
  return { code: 'D', text: 'Kurang' };
}

export function calculateStudentGraduationSummary(
  student: Student,
  grades: StudentGrades | undefined,
  exams: StudentExams | undefined,
  school: SchoolProfile
): StudentGraduationSummary {
  const sems: SemesterKey[] = ['K4_S1', 'K4_S2', 'K5_S1', 'K5_S2', 'K6_S1', 'K6_S2'];
  const subjects: SubjectGraduationCalc[] = [];

  let grandRaporSum = 0;
  let grandExamSum = 0;
  let grandFinalSum = 0;

  const rWeight = (school.reportWeight || 60) / 100;
  const eWeight = (school.examWeight || 40) / 100;

  SUBJECT_LIST.forEach((sub) => {
    const semScores: Record<SemesterKey, number> = {} as Record<SemesterKey, number>;
    let subRaporSum = 0;
    let subRaporCount = 0;

    sems.forEach((sem) => {
      const score = grades && grades[sem] && typeof grades[sem][sub.id] === 'number'
        ? grades[sem][sub.id]
        : 0;
      semScores[sem] = score;
      if (score > 0) {
        subRaporSum += score;
        subRaporCount++;
      }
    });

    const raporAvg = subRaporCount > 0 ? Number((subRaporSum / subRaporCount).toFixed(2)) : 0;
    
    // Exam score
    const exObj = exams && exams[sub.id];
    let examScore = 0;
    if (exObj) {
      examScore = exObj.finalScore || (exObj.written * 0.6 + (exObj.practice || 0) * 0.4);
    }
    examScore = Number(examScore.toFixed(2));

    // Final score for this subject
    const finalScore = Number(((raporAvg * rWeight) + (examScore * eWeight)).toFixed(2));

    subjects.push({
      subjectId: sub.id,
      subjectCode: sub.code,
      subjectName: sub.name,
      semScores,
      raporAvg,
      examScore,
      finalScore
    });

    grandRaporSum += raporAvg;
    grandExamSum += examScore;
    grandFinalSum += finalScore;
  });

  const subjectCount = SUBJECT_LIST.length;
  const grandRaporAvg = Number((grandRaporSum / subjectCount).toFixed(2));
  const grandExamAvg = Number((grandExamSum / subjectCount).toFixed(2));
  const finalScore = Number((grandFinalSum / subjectCount).toFixed(2));

  const pred = getPredicate(finalScore);
  const isPassed = finalScore >= (school.passingKkm || 75.0);

  const serialNumber = student.serialNumber || `DN-02/D-SD/27/01/${student.nis.padStart(4, '0')}`;

  return {
    student,
    subjects,
    grandRaporAvg,
    grandExamAvg,
    finalScore,
    predicate: pred.code,
    predicateText: pred.text,
    isPassed,
    serialNumber
  };
}

export function numberToWordsIndonesian(n: number): string {
  const units = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];
  
  function convert(num: number): string {
    if (num < 12) return units[num];
    if (num < 20) return convert(num - 10) + ' Belas';
    if (num < 100) return convert(Math.floor(num / 10)) + ' Puluh' + (num % 10 !== 0 ? ' ' + convert(num % 10) : '');
    if (num < 200) return 'Seratus' + (num % 100 !== 0 ? ' ' + convert(num % 100) : '');
    if (num < 1000) return convert(Math.floor(num / 100)) + ' Ratus' + (num % 100 !== 0 ? ' ' + convert(num % 100) : '');
    return num.toString();
  }

  const intPart = Math.floor(n);
  const decPart = Math.round((n - intPart) * 100);

  let result = convert(intPart);
  if (decPart > 0) {
    result += ' Koma ';
    const decStr = decPart.toString();
    for (let i = 0; i < decStr.length; i++) {
      const digit = parseInt(decStr[i], 10);
      result += (digit === 0 ? 'Nol ' : units[digit] + ' ');
    }
  }
  return result.trim();
}

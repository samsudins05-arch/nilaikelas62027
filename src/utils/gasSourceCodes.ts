/**
 * Source code for Google Apps Script (Code.gs and index.html)
 * Perfected for SD NEGERI BABELAN KOTA 01 TP 2026/2027
 * Font: Arial
 * Ujian Sekolah: Nilai Tulis & Nilai Praktek
 * Input nilai: Dikosongkan jika belum diisi (tanpa angka 0)
 */

export const CODE_GS_SOURCE = `/**
 * ============================================================================
 * APLIKASI NILAI RAPOR & IJAZAH SD NEGERI BABELAN KOTA 01 TP 2026/2027
 * File: Code.gs
 * Target: Google Apps Script (script.google.com) - Terikat / Bound ke Google Sheets
 * Penyimpanan: Google Spreadsheet (Sheets) & PropertiesService
 * Nama Sheet Resmi:
 *   1. DATA_SISWA
 *   2. RAPOR_6_SEMESTER
 *   3. UJIAN_SEKOLAH
 *   4. REKAP_DKN_IJAZAH
 *   5. PENGATURAN_SEKOLAH
 * Tema Desain: Hijau Emerald Google Sheets (#0F9D58 / #137333) & Border Solid Rapi
 * Font: Arial
 * ============================================================================
 */

/**
 * Menu otomatis saat Google Spreadsheet dibuka
 */
function onOpen() {
  try {
    var ui = SpreadsheetApp.getUi();
    ui.createMenu('📊 Portal Rapor & Ijazah SDN Babelan Kota 01')
      .addItem('🚀 Setup / Format Ulang Semua Sheet', 'setupGoogleSheetDatabase')
      .addItem('🔄 Simpan Seluruh Data ke Sheet', 'syncPropertiesToSheets')
      .addItem('📥 Muat Data dari Sheet ke Web App', 'loadSheetsToProperties')
      .addToUi();
  } catch (e) {
    Logger.log('Bukan context spreadsheet UI: ' + e.toString());
  }
}

function doGet(e) {
  if (e && e.parameter && e.parameter.action === 'getData') {
    return ContentService.createTextOutput(JSON.stringify(getAllData()))
      .setMimeType(ContentService.MimeType.JSON);
  }

  var template = HtmlService.createTemplateFromFile('index');
  return template.evaluate()
    .setTitle('Rapor & Ijazah SDN Babelan Kota 01 TP 2026/2027')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function doPost(e) {
  try {
    var postData = JSON.parse(e.postData.contents);
    if (postData.action === 'syncToSheet' && postData.db) {
      saveAllData(JSON.stringify(postData.db));
      writeAllDataToSheets(postData.db);
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Data berhasil disimpan ke Google Spreadsheet SDN Babelan Kota 01!',
        timestamp: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: 'Action tidak dikenal' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Menyimpan seluruh data aplikasi ke PropertiesService
 */
function saveAllData(payloadJson) {
  try {
    var userProperties = PropertiesService.getUserProperties();
    userProperties.setProperty('BAKOT01_RAPOR_DB_V2', payloadJson);
    try {
      var db = JSON.parse(payloadJson);
      writeAllDataToSheets(db);
    } catch (e) {
      Logger.log('Gagal update sheet: ' + e.toString());
    }
    return { success: true, message: 'Data berhasil disimpan ke sistem Google Apps Script & Sheet!' };
  } catch (err) {
    return { success: false, message: 'Gagal menyimpan: ' + err.toString() };
  }
}

/**
 * Mengambil data aplikasi dari PropertiesService atau Sheet
 */
function getAllData() {
  try {
    var userProperties = PropertiesService.getUserProperties();
    var dataStr = userProperties.getProperty('BAKOT01_RAPOR_DB_V2');
    if (!dataStr) {
      var dbFromSheet = readAllDataFromSheets();
      if (dbFromSheet && dbFromSheet.students && dbFromSheet.students.length > 0) {
        return { success: true, data: dbFromSheet };
      }
      return { success: true, data: null };
    }
    return { success: true, data: JSON.parse(dataStr) };
  } catch (err) {
    return { success: false, message: 'Gagal mengambil data: ' + err.toString() };
  }
}

function clearAllData() {
  try {
    var userProperties = PropertiesService.getUserProperties();
    userProperties.deleteProperty('BAKOT01_RAPOR_DB_V2');
    setupGoogleSheetDatabase();
    return { success: true, message: 'Data berhasil dikosongkan.' };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

/**
 * Setup nama sheet, styling header, dan border menarik
 */
function setupGoogleSheetDatabase() {
  var ss;
  try {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  } catch (e) {
    return { success: false, message: 'Harus dijalankan dari Google Spreadsheet aktif.' };
  }
  if (!ss) return;

  var sheetConfigs = [
    { name: 'DATA_SISWA', color: '#0F9D58' },
    { name: 'RAPOR_6_SEMESTER', color: '#137333' },
    { name: 'UJIAN_SEKOLAH', color: '#1B4D3E' },
    { name: 'REKAP_DKN_IJAZAH', color: '#1E4620' },
    { name: 'PENGATURAN_SEKOLAH', color: '#1E3A8A' }
  ];

  sheetConfigs.forEach(function(cfg) {
    try {
      var sheet = ss.getSheetByName(cfg.name);
      if (!sheet) {
        sheet = ss.insertSheet(cfg.name);
      }
      try {
        if (sheet && typeof sheet.setTabColor === 'function') {
          sheet.setTabColor(cfg.color);
        }
      } catch (eTab) {}

      try {
        if (sheet && typeof sheet.setHiddenGridlines === 'function') {
          sheet.setHiddenGridlines(false);
        }
      } catch (eGrid) {}
    } catch (eCfg) {
      Logger.log('Setup sheet ' + cfg.name + ': ' + eCfg.toString());
    }
  });

  // Format Sheet 1: DATA_SISWA
  var ws1 = ss.getSheetByName('DATA_SISWA');
  var headers1 = [['NO', 'ID', 'KELAS', 'NIS', 'NISN', 'NAMA LENGKAP SISWA', 'L/P', 'TEMPAT LAHIR', 'TANGGAL LAHIR', 'NAMA ORANG TUA / WALI', 'ALAMAT', 'NO TELEPON', 'NO SERI IJAZAH']];
  ws1.getRange(1, 1, 1, headers1[0].length).setValues(headers1)
    .setFontFamily('Arial').setFontSize(10).setFontWeight('bold')
    .setBackground('#0F9D58').setFontColor('#FFFFFF')
    .setHorizontalAlignment('center').setVerticalAlignment('middle')
    .setBorder(true, true, true, true, true, true, '#A3D9A5', SpreadsheetApp.BorderStyle.SOLID);
  ws1.setRowHeight(1, 32);
  ws1.setFrozenRows(1);

  // Format Sheet 2: RAPOR_6_SEMESTER
  var ws2 = ss.getSheetByName('RAPOR_6_SEMESTER');
  var headers2 = [['NO', 'NISN', 'NAMA SISWA', 'KELAS', 'SEMESTER', 'PAI', 'PPKn', 'B.INDO', 'MTK', 'IPAS', 'SBdP', 'PJOK', 'B.SUNDA', 'B.ING', 'RATA-RATA']];
  ws2.getRange(1, 1, 1, headers2[0].length).setValues(headers2)
    .setFontFamily('Arial').setFontSize(10).setFontWeight('bold')
    .setBackground('#137333').setFontColor('#FFFFFF')
    .setHorizontalAlignment('center').setVerticalAlignment('middle')
    .setBorder(true, true, true, true, true, true, '#B7E1CD', SpreadsheetApp.BorderStyle.SOLID);
  ws2.setRowHeight(1, 32);
  ws2.setFrozenRows(1);

  // Format Sheet 3: UJIAN_SEKOLAH
  var ws3 = ss.getSheetByName('UJIAN_SEKOLAH');
  var headers3 = [['NO', 'NISN', 'NAMA SISWA', 'KELAS', 'PAI_TULIS', 'PAI_PRAKTEK', 'PPKn_TULIS', 'BINDO_TULIS', 'BINDO_PRAKTEK', 'MTK_TULIS', 'IPAS_TULIS', 'IPAS_PRAKTEK', 'SBDP_TULIS', 'SBDP_PRAKTEK', 'PJOK_TULIS', 'PJOK_PRAKTEK', 'SUNDA_TULIS', 'SUNDA_PRAKTEK', 'BING_TULIS', 'RATA_US']];
  ws3.getRange(1, 1, 1, headers3[0].length).setValues(headers3)
    .setFontFamily('Arial').setFontSize(10).setFontWeight('bold')
    .setBackground('#1B4D3E').setFontColor('#FFFFFF')
    .setHorizontalAlignment('center').setVerticalAlignment('middle')
    .setBorder(true, true, true, true, true, true, '#A7F3D0', SpreadsheetApp.BorderStyle.SOLID);
  ws3.setRowHeight(1, 32);
  ws3.setFrozenRows(1);

  // Format Sheet 4: REKAP_DKN_IJAZAH
  var ws4 = ss.getSheetByName('REKAP_DKN_IJAZAH');
  var headers4 = [['NO', 'KELAS', 'NIS', 'NISN', 'NAMA SISWA', 'L/P', 'RATA RAPOR (60%)', 'RATA UJIAN (40%)', 'NILAI AKHIR IJAZAH', 'KKM (75)', 'STATUS KELULUSAN', 'NO SERI IJAZAH']];
  ws4.getRange(1, 1, 1, headers4[0].length).setValues(headers4)
    .setFontFamily('Arial').setFontSize(10).setFontWeight('bold')
    .setBackground('#1E4620').setFontColor('#FFFFFF')
    .setHorizontalAlignment('center').setVerticalAlignment('middle')
    .setBorder(true, true, true, true, true, true, '#86EFAC', SpreadsheetApp.BorderStyle.SOLID);
  ws4.setRowHeight(1, 32);
  ws4.setFrozenRows(1);

  // Format Sheet 5: PENGATURAN_SEKOLAH
  var ws5 = ss.getSheetByName('PENGATURAN_SEKOLAH');
  var headers5 = [['PARAMETER SEKOLAH', 'NILAI / KETERANGAN RESMI']];
  ws5.getRange(1, 1, 1, 2).setValues(headers5)
    .setFontFamily('Arial').setFontSize(10).setFontWeight('bold')
    .setBackground('#1E3A8A').setFontColor('#FFFFFF')
    .setHorizontalAlignment('center').setVerticalAlignment('middle')
    .setBorder(true, true, true, true, true, true, '#BFDBFE', SpreadsheetApp.BorderStyle.SOLID);
  ws5.setRowHeight(1, 32);
  ws5.setFrozenRows(1);

  return { success: true, message: 'Seluruh sheet berhasil disetup dengan format tabel dan border menarik!' };
}

/**
 * Menulis data JSON aplikasi langsung ke lembar kerja Spreadsheet
 */
function writeAllDataToSheets(db) {
  var ss;
  try { ss = SpreadsheetApp.getActiveSpreadsheet(); } catch (e) { return; }
  if (!ss || !db) return;

  setupGoogleSheetDatabase();

  // Tulis DATA_SISWA
  if (db.students && db.students.length > 0) {
    var ws1 = ss.getSheetByName('DATA_SISWA');
    var rows1 = db.students.map(function(s, idx) {
      return [
        idx + 1, s.id, s.classRoom, s.nis, s.nisn, s.name, s.gender,
        s.birthPlace, s.birthDate, s.parentName || '-', s.address || '-',
        s.phone || '-', s.serialNumber || '-'
      ];
    });
    if (ws1.getLastRow() > 1) {
      ws1.getRange(2, 1, ws1.getLastRow() - 1, 13).clearContent();
    }
    var range1 = ws1.getRange(2, 1, rows1.length, 13);
    range1.setValues(rows1).setFontFamily('Arial').setFontSize(9)
      .setBorder(true, true, true, true, true, true, '#CBD5E1', SpreadsheetApp.BorderStyle.SOLID);
    
    // Zebra striping
    for (var r = 0; r < rows1.length; r++) {
      if (r % 2 === 1) {
        ws1.getRange(r + 2, 1, 1, 13).setBackground('#F0FDF4');
      } else {
        ws1.getRange(r + 2, 1, 1, 13).setBackground('#FFFFFF');
      }
    }
  }

  // Tulis PENGATURAN_SEKOLAH
  if (db.school) {
    var ws5 = ss.getSheetByName('PENGATURAN_SEKOLAH');
    var schRows = [
      ['Nama Satuan Pendidikan', db.school.name || 'SD NEGERI BABELAN KOTA 01'],
      ['NPSN', db.school.npsn || '20218320'],
      ['NSS', db.school.nss || '101022101001'],
      ['Tahun Pelajaran', db.school.academicYear || '2026/2027'],
      ['Kepala Sekolah', db.school.principalName || '-'],
      ['NIP Kepala Sekolah', db.school.principalNip || '-'],
      ['Bobot Nilai Rapor (%)', db.school.reportWeight || 60],
      ['Bobot Nilai Ujian Sekolah (%)', db.school.examWeight || 40],
      ['Standar KKM Kelulusan', db.school.passingKkm || 75.0],
      ['Tanggal Kelulusan', db.school.graduationDate || '10 Juni 2027'],
      ['Nomor SK Kelulusan', db.school.skNumber || '-']
    ];
    var range5 = ws5.getRange(2, 1, schRows.length, 2);
    range5.setValues(schRows).setFontFamily('Arial').setFontSize(9)
      .setBorder(true, true, true, true, true, true, '#CBD5E1', SpreadsheetApp.BorderStyle.SOLID);
  }
}

function syncPropertiesToSheets() {
  var res = getAllData();
  if (res.data) {
    writeAllDataToSheets(res.data);
    SpreadsheetApp.getUi().alert('Data berhasil disinkronkan ke seluruh sheet!');
  } else {
    SpreadsheetApp.getUi().alert('Belum ada data untuk disinkronkan.');
  }
}

function loadSheetsToProperties() {
  var db = readAllDataFromSheets();
  if (db) {
    saveAllData(JSON.stringify(db));
    SpreadsheetApp.getUi().alert('Data berhasil dimuat dari sheet ke sistem Web App!');
  }
}

function readAllDataFromSheets() {
  var ss;
  try { ss = SpreadsheetApp.getActiveSpreadsheet(); } catch (e) { return null; }
  if (!ss) return null;

  var ws1 = ss.getSheetByName('DATA_SISWA');
  if (!ws1 || ws1.getLastRow() < 2) return null;

  var data1 = ws1.getRange(2, 1, ws1.getLastRow() - 1, 13).getValues();
  var students = data1.map(function(row) {
    return {
      id: String(row[1] || row[3]),
      classRoom: String(row[2]),
      nis: String(row[3]),
      nisn: String(row[4]),
      name: String(row[5]),
      gender: String(row[6]),
      birthPlace: String(row[7]),
      birthDate: String(row[8]),
      parentName: String(row[9]),
      address: String(row[10]),
      phone: String(row[11]),
      serialNumber: String(row[12])
    };
  });

  return {
    school: {
      name: 'SD NEGERI BABELAN KOTA 01',
      academicYear: '2026/2027',
      reportWeight: 60,
      examWeight: 40,
      passingKkm: 75.0
    },
    students: students,
    grades: {},
    exams: {}
  };
}
`;

export const INDEX_HTML_STANDALONE_SOURCE = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Aplikasi Nilai Rapor & Ijazah SDN Babelan Kota 01 TP 2026/2027</title>
  <!-- Tailwind CSS & SheetJS CDN for Standalone Google Apps Script -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>
  <style>
    *, ::before, ::after { font-family: Arial, Helvetica, sans-serif !important; }
    body { font-family: Arial, Helvetica, sans-serif !important; }
    .num-font { font-family: Arial, Helvetica, sans-serif !important; font-variant-numeric: tabular-nums; }
    .gradient-navy-blue {
      background: linear-gradient(135deg, #1E3A8A 0%, #172554 40%, #2563EB 100%);
    }
    .gradient-card-blue {
      background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);
    }
    @media print {
      *, ::before, ::after { font-family: Arial, Helvetica, sans-serif !important; }
      .no-print { display: none !important; }
      .print-area { display: block !important; font-family: Arial, Helvetica, sans-serif !important; }
      body { background: white !important; color: black !important; font-family: Arial, Helvetica, sans-serif !important; }
    }
  </style>
</head>
<body class="bg-slate-50 text-slate-900 min-h-screen" style="font-family: Arial, Helvetica, sans-serif;">
  <!-- Top Navigation Bar (Navy Blue #1E3A8A & Vibrant Blue #2563EB) -->
  <header class="gradient-navy-blue text-white shadow-lg sticky top-0 z-40 px-6 py-3.5 flex items-center justify-between no-print">
    <div class="flex items-center gap-3.5">
      <div class="w-11 h-11 rounded-xl bg-white/10 border border-white/20 backdrop-blur flex items-center justify-center font-extrabold text-xl shadow-inner text-amber-300">
        01
      </div>
      <div>
        <div class="flex items-center gap-2">
          <h1 class="text-base font-extrabold tracking-wide uppercase">SD NEGERI BABELAN KOTA 01</h1>
          <span class="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30 font-semibold">TP 2026/2027</span>
        </div>
        <p class="text-xs text-blue-100/80">Sistem Nilai Rapor 6 Semester (K4-K6), Ujian Sekolah (Tulis & Praktek), DKN & SKL Ijazah</p>
      </div>
    </div>
    <div class="flex items-center gap-2.5">
      <span class="text-xs px-3 py-1 bg-white/15 backdrop-blur text-white font-medium rounded-lg border border-white/20">
        Kelas 6A · 6B · 6C · 6D
      </span>
    </div>
  </header>

  <!-- App Body -->
  <div class="max-w-7xl mx-auto p-6 space-y-6">
    <!-- Tabs Nav -->
    <div class="flex flex-wrap gap-2 border-b border-slate-200 pb-3 no-print">
      <button onclick="switchTab('dashboard')" id="btn-dashboard" class="tab-btn px-4 py-2 text-sm font-bold text-blue-700 border-b-2 border-blue-600 flex items-center gap-1.5">
        Dashboard Utama
      </button>
      <button onclick="switchTab('students')" id="btn-students" class="tab-btn px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900">
        Data Siswa (6A, 6B, 6C, 6D)
      </button>
      <button onclick="switchTab('semesters')" id="btn-semesters" class="tab-btn px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900">
        Nilai Rapor (6 Semester)
      </button>
      <button onclick="switchTab('exams')" id="btn-exams" class="tab-btn px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900">
        Ujian Sekolah (Nilai Tulis & Nilai Praktek)
      </button>
      <button onclick="switchTab('graduation')" id="btn-graduation" class="tab-btn px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900">
        DKN Ijazah & Kelulusan
      </button>
    </div>

    <!-- TAB 1: DASHBOARD -->
    <div id="tab-dashboard" class="tab-content space-y-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p class="text-xs font-bold text-blue-700 uppercase tracking-wider">Total Siswa Kelas 6</p>
          <p id="stat-total-students" class="text-3xl font-extrabold text-slate-900 mt-2 num-font">20</p>
          <p class="text-xs text-slate-500 mt-1">Rombel: 6A, 6B, 6C, 6D</p>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p class="text-xs font-bold text-indigo-700 uppercase tracking-wider">Cakupan Nilai Rapor</p>
          <p class="text-3xl font-extrabold text-indigo-700 mt-2 num-font">6 Smt</p>
          <p class="text-xs text-slate-500 mt-1">K4 (1&2), K5 (1&2), K6 (1&2)</p>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p class="text-xs font-bold text-emerald-700 uppercase tracking-wider">Rata-Rata Kelulusan</p>
          <p id="stat-avg-score" class="text-3xl font-extrabold text-emerald-700 mt-2 num-font">86.8</p>
          <p class="text-xs text-slate-500 mt-1">60% Rapor + 40% Ujian Sekolah</p>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p class="text-xs font-bold text-emerald-600 uppercase tracking-wider">Tingkat Kelulusan</p>
          <p class="text-3xl font-extrabold text-emerald-600 mt-2 num-font">100%</p>
          <p class="text-xs text-slate-500 mt-1">Standar KKM Minimal: 75.0</p>
        </div>
      </div>
    </div>

    <!-- TAB 2: DATA SISWA -->
    <div id="tab-students" class="tab-content hidden space-y-4">
      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <span class="text-xs font-bold text-slate-700">Filter Kelas:</span>
            <select id="student-class-filter" onchange="renderStudentTable()" class="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white font-semibold text-slate-800">
              <option value="ALL">Semua Kelas (6A - 6D)</option>
              <option value="6A">Kelas 6A</option>
              <option value="6B">Kelas 6B</option>
              <option value="6C">Kelas 6C</option>
              <option value="6D">Kelas 6D</option>
            </select>
          </div>
          <input type="text" id="student-search" oninput="renderStudentTable()" placeholder="Cari nama / NIS / NISN..." class="text-xs border border-slate-300 rounded-lg px-3.5 py-2 w-64 focus:ring-2 focus:ring-blue-500">
        </div>

        <div class="overflow-x-auto border border-slate-200 rounded-xl">
          <table class="w-full text-left text-xs border-collapse">
            <thead class="bg-blue-900 text-white font-semibold">
              <tr>
                <th class="py-3 px-3.5 border-r border-blue-800">No</th>
                <th class="py-3 px-3.5 border-r border-blue-800">Kelas</th>
                <th class="py-3 px-3.5 border-r border-blue-800">NIS / NISN</th>
                <th class="py-3 px-3.5 border-r border-blue-800">Nama Siswa</th>
                <th class="py-3 px-3.5 border-r border-blue-800 text-center">L/P</th>
                <th class="py-3 px-3.5 border-r border-blue-800">Tempat, Tgl Lahir</th>
                <th class="py-3 px-3.5 border-r border-blue-800">Orang Tua / Wali</th>
                <th class="py-3 px-3.5 text-center">No Seri Ijazah</th>
              </tr>
            </thead>
            <tbody id="student-table-body" class="divide-y divide-slate-100">
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 3: NILAI SEMESTER (Input dikosongkan tanpa tanda 0) -->
    <div id="tab-semesters" class="tab-content hidden space-y-4">
      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex flex-wrap items-center gap-3">
            <div>
              <label class="text-xs text-slate-500 block mb-1">Pilih Semester:</label>
              <select id="sem-picker" onchange="renderSemesterGrades()" class="text-xs border border-slate-300 rounded-lg px-3 py-2 font-bold bg-white text-blue-900">
                <option value="K4_S1">Kelas 4 Semester 1 (Gasal 2024/2025)</option>
                <option value="K4_S2">Kelas 4 Semester 2 (Genap 2024/2025)</option>
                <option value="K5_S1">Kelas 5 Semester 1 (Gasal 2025/2026)</option>
                <option value="K5_S2">Kelas 5 Semester 2 (Genap 2025/2026)</option>
                <option value="K6_S1" selected>Kelas 6 Semester 1 (Gasal 2026/2027)</option>
                <option value="K6_S2">Kelas 6 Semester 2 (Genap 2026/2027)</option>
              </select>
            </div>
            <div>
              <label class="text-xs text-slate-500 block mb-1">Pilih Kelas:</label>
              <select id="sem-class-picker" onchange="renderSemesterGrades()" class="text-xs border border-slate-300 rounded-lg px-3 py-2 font-bold bg-white text-blue-900">
                <option value="6A">Kelas 6A</option>
                <option value="6B">Kelas 6B</option>
                <option value="6C">Kelas 6C</option>
                <option value="6D">Kelas 6D</option>
              </select>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="saveCurrentSemesterGrades()" class="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg shadow-sm transition">
              Simpan Nilai Semester
            </button>
          </div>
        </div>

        <div class="overflow-x-auto border border-slate-200 rounded-xl">
          <table class="w-full text-left text-xs border-collapse">
            <thead class="bg-blue-950 text-white font-semibold">
              <tr>
                <th class="py-2.5 px-3 border-r border-blue-900">No</th>
                <th class="py-2.5 px-3 border-r border-blue-900">Nama Siswa</th>
                <th class="py-2.5 px-2 border-r border-blue-900 text-center">PAI</th>
                <th class="py-2.5 px-2 border-r border-blue-900 text-center">PPKn</th>
                <th class="py-2.5 px-2 border-r border-blue-900 text-center">B.Indo</th>
                <th class="py-2.5 px-2 border-r border-blue-900 text-center">MTK</th>
                <th class="py-2.5 px-2 border-r border-blue-900 text-center">IPAS</th>
                <th class="py-2.5 px-2 border-r border-blue-900 text-center">SBdP</th>
                <th class="py-2.5 px-2 border-r border-blue-900 text-center">PJOK</th>
                <th class="py-2.5 px-2 border-r border-blue-900 text-center">B.Sunda</th>
                <th class="py-2.5 px-2 border-r border-blue-900 text-center">B.Ing</th>
                <th class="py-2.5 px-3 text-center bg-blue-800">Rata-Rata</th>
              </tr>
            </thead>
            <tbody id="semester-table-body" class="divide-y divide-slate-100">
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 4: UJIAN SEKOLAH (NILAI TULIS DAN NILAI PRAKTEK) -->
    <div id="tab-exams" class="tab-content hidden space-y-4">
      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="font-bold text-slate-900 text-base">Ujian Sekolah: Nilai Tulis & Nilai Praktek TP 2026/2027</h2>
          </div>
          <div class="flex items-center gap-2">
            <label class="text-xs font-bold text-slate-600">Rombel:</label>
            <select id="exam-class-picker" onchange="renderExamTable()" class="text-xs border border-slate-300 rounded-lg px-3 py-2 font-bold bg-white text-blue-900">
              <option value="6A">Kelas 6A</option>
              <option value="6B">Kelas 6B</option>
              <option value="6C">Kelas 6C</option>
              <option value="6D">Kelas 6D</option>
            </select>
            <button onclick="saveCurrentExamGrades()" class="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg shadow-sm transition">
              Simpan Nilai Ujian
            </button>
          </div>
        </div>

        <div class="overflow-x-auto border border-slate-200 rounded-xl">
          <table class="w-full text-left text-xs border-collapse">
            <thead class="bg-blue-950 text-white font-semibold">
              <tr>
                <th rowSpan="2" class="py-2.5 px-3 border-r border-blue-900 text-center">No</th>
                <th rowSpan="2" class="py-2.5 px-3 border-r border-blue-900">Nama Siswa</th>
                <th colSpan="2" class="py-1 px-2 border-r border-blue-900 text-center bg-blue-900">PAI</th>
                <th class="py-1 px-2 border-r border-blue-900 text-center bg-blue-900">PPKn</th>
                <th colSpan="2" class="py-1 px-2 border-r border-blue-900 text-center bg-blue-900">B.Indo</th>
                <th class="py-1 px-2 border-r border-blue-900 text-center bg-blue-900">MTK</th>
                <th colSpan="2" class="py-1 px-2 border-r border-blue-900 text-center bg-blue-900">IPAS</th>
                <th colSpan="2" class="py-1 px-2 border-r border-blue-900 text-center bg-blue-900">SBdP</th>
                <th colSpan="2" class="py-1 px-2 border-r border-blue-900 text-center bg-blue-900">PJOK</th>
                <th colSpan="2" class="py-1 px-2 border-r border-blue-900 text-center bg-blue-900">B.Sunda</th>
                <th class="py-1 px-2 border-r border-blue-900 text-center bg-blue-900">B.Ing</th>
                <th rowSpan="2" class="py-2.5 px-3 text-center bg-blue-800">Rata-Rata US</th>
              </tr>
              <tr class="bg-blue-900/90 text-blue-200 text-[10px]">
                <th class="py-1 px-1 border-r border-blue-900 text-center">Tulis</th>
                <th class="py-1 px-1 border-r border-blue-900 text-center text-amber-200">Praktek</th>
                <th class="py-1 px-1 border-r border-blue-900 text-center">Tulis</th>
                <th class="py-1 px-1 border-r border-blue-900 text-center">Tulis</th>
                <th class="py-1 px-1 border-r border-blue-900 text-center text-amber-200">Praktek</th>
                <th class="py-1 px-1 border-r border-blue-900 text-center">Tulis</th>
                <th class="py-1 px-1 border-r border-blue-900 text-center">Tulis</th>
                <th class="py-1 px-1 border-r border-blue-900 text-center text-amber-200">Praktek</th>
                <th class="py-1 px-1 border-r border-blue-900 text-center">Tulis</th>
                <th class="py-1 px-1 border-r border-blue-900 text-center text-amber-200">Praktek</th>
                <th class="py-1 px-1 border-r border-blue-900 text-center">Tulis</th>
                <th class="py-1 px-1 border-r border-blue-900 text-center text-amber-200">Praktek</th>
                <th class="py-1 px-1 border-r border-blue-900 text-center">Tulis</th>
                <th class="py-1 px-1 border-r border-blue-900 text-center text-amber-200">Praktek</th>
                <th class="py-1 px-1 border-r border-blue-900 text-center">Tulis</th>
              </tr>
            </thead>
            <tbody id="exam-table-body" class="divide-y divide-slate-100">
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 5: DKN & KELULUSAN -->
    <div id="tab-graduation" class="tab-content hidden space-y-4">
      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 class="font-bold text-slate-900 text-base">Rekapitulasi Nilai DKN & Kelulusan Ijazah 2026/2027</h2>
            <p class="text-xs text-slate-500">Kriteria Kelulusan: KKM Rata-rata &ge; 75.0 · Bobot: 60% Rapor + 40% Ujian</p>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="window.print()" class="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold">
              Cetak DKN
            </button>
          </div>
        </div>

        <div class="overflow-x-auto border border-slate-200 rounded-xl">
          <table class="w-full text-left text-xs border-collapse">
            <thead class="bg-blue-950 text-white font-semibold">
              <tr>
                <th class="py-2.5 px-3 border-r border-blue-900">No</th>
                <th class="py-2.5 px-3 border-r border-blue-900">Kelas</th>
                <th class="py-2.5 px-3 border-r border-blue-900">NISN</th>
                <th class="py-2.5 px-3 border-r border-blue-900">Nama Siswa</th>
                <th class="py-2.5 px-3 border-r border-blue-900 text-center">Rata Rapor</th>
                <th class="py-2.5 px-3 border-r border-blue-900 text-center">Rata Ujian</th>
                <th class="py-2.5 px-3 border-r border-blue-900 text-center bg-blue-800">Nilai Ijazah</th>
                <th class="py-2.5 px-3 border-r border-blue-900 text-center">Predikat</th>
                <th class="py-2.5 px-3 border-r border-blue-900 text-center">Status</th>
                <th class="py-2.5 px-3 text-center">No Seri Ijazah</th>
              </tr>
            </thead>
            <tbody id="graduation-table-body" class="divide-y divide-slate-100">
            </tbody>
          </table>
        </div>
      </div>
    </div>

    </div>
  </div>

  <script>
    var APP_STATE = {
      school: {
        name: 'SD NEGERI BABELAN KOTA 01',
        academicYear: '2026/2027',
        reportWeight: 60,
        examWeight: 40,
        kkm: 75.0
      },
      students: [
        { id: '1', nis: '2101', nisn: '0134829101', name: 'ADITYA PRATAMA WIJAYA', gender: 'L', classRoom: '6A', birthPlace: 'Bekasi', birthDate: '2014-04-12', parentName: 'Hendra Wijaya' },
        { id: '2', nis: '2102', nisn: '0135892102', name: 'ANINDYA PUTRI MAHARANI', gender: 'P', classRoom: '6A', birthPlace: 'Bekasi', birthDate: '2014-07-25', parentName: 'Rudi Hartono' },
        { id: '3', nis: '2106', nisn: '0139012306', name: 'EKA NUR FADILLAH', gender: 'P', classRoom: '6B', birthPlace: 'Bekasi', birthDate: '2014-06-14', parentName: 'M. Syafii' },
        { id: '4', nis: '2107', nisn: '0139123407', name: 'FADHIL RIZQI AL-FARIZI', gender: 'L', classRoom: '6B', birthPlace: 'Bekasi', birthDate: '2014-11-20', parentName: 'H. Mansyur' },
        { id: '5', nis: '2111', nisn: '0139567811', name: 'JOVAN NATHANIEL SYAHPUTRA', gender: 'L', classRoom: '6C', birthPlace: 'Bekasi', birthDate: '2014-05-19', parentName: 'Daniel Syahputra' },
        { id: '6', nis: '2116', nisn: '0130012316', name: 'OLIVIA QANITA SALSABILA', gender: 'P', classRoom: '6D', birthPlace: 'Bekasi', birthDate: '2014-04-05', parentName: 'Zaenal Abidin' }
      ],
      grades: {},
      exams: {}
    };

    var SUBJECTS = [
      { id: 'pai', code: 'PAI', hasPractice: true },
      { id: 'ppkn', code: 'PPKn', hasPractice: false },
      { id: 'bindo', code: 'B.Indo', hasPractice: true },
      { id: 'mtk', code: 'MTK', hasPractice: false },
      { id: 'ipas', code: 'IPAS', hasPractice: true },
      { id: 'sbdp', code: 'SBdP', hasPractice: true },
      { id: 'pjok', code: 'PJOK', hasPractice: true },
      { id: 'sunda', code: 'B.Sunda', hasPractice: true },
      { id: 'bing', code: 'B.Ing', hasPractice: false }
    ];

    function initData() {
      if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run.withSuccessHandler(function(res) {
          if (res && res.success && res.data) {
            APP_STATE = res.data;
          } else {
            seedDefaultData();
          }
          refreshUI();
        }).getAllData();
      } else {
        var local = localStorage.getItem('BAKOT01_RAPOR_DB_STANDALONE');
        if (local) {
          try { APP_STATE = JSON.parse(local); } catch(e) { seedDefaultData(); }
        } else {
          seedDefaultData();
        }
        refreshUI();
      }
    }

    function seedDefaultData() {
      APP_STATE.students.forEach(function(s) {
        APP_STATE.grades[s.id] = {
          K4_S1: { pai: 85, ppkn: 86, bindo: 88, mtk: 82, ipas: 84, sbdp: 86, pjok: 88, sunda: 85, bing: 84 },
          K4_S2: { pai: 86, ppkn: 87, bindo: 89, mtk: 84, ipas: 85, sbdp: 87, pjok: 89, sunda: 86, bing: 85 },
          K5_S1: { pai: 87, ppkn: 88, bindo: 90, mtk: 85, ipas: 86, sbdp: 88, pjok: 90, sunda: 87, bing: 86 },
          K5_S2: { pai: 88, ppkn: 89, bindo: 91, mtk: 86, ipas: 87, sbdp: 89, pjok: 91, sunda: 88, bing: 87 },
          K6_S1: { pai: 89, ppkn: 90, bindo: 92, mtk: 88, ipas: 89, sbdp: 90, pjok: 92, sunda: 89, bing: 88 },
          K6_S2: { pai: 90, ppkn: 91, bindo: 93, mtk: 89, ipas: 90, sbdp: 91, pjok: 93, sunda: 90, bing: 89 }
        };
        APP_STATE.exams[s.id] = {
          pai: { written: 88, practice: 90, finalScore: 89 },
          ppkn: { written: 90, practice: 0, finalScore: 90 },
          bindo: { written: 92, practice: 90, finalScore: 91 },
          mtk: { written: 86, practice: 0, finalScore: 86 },
          ipas: { written: 88, practice: 90, finalScore: 89 },
          sbdp: { written: 88, practice: 92, finalScore: 90 },
          pjok: { written: 87, practice: 93, finalScore: 90 },
          sunda: { written: 88, practice: 88, finalScore: 88 },
          bing: { written: 87, practice: 0, finalScore: 87 }
        };
      });
    }

    function refreshUI() {
      document.getElementById('stat-total-students').innerText = APP_STATE.students.length;
      renderStudentTable();
      renderSemesterGrades();
      renderExamTable();
      renderGraduationTable();
    }

    function switchTab(tabId) {
      document.querySelectorAll('.tab-content').forEach(function(el) { el.classList.add('hidden'); });
      document.querySelectorAll('.tab-btn').forEach(function(btn) {
        btn.classList.remove('text-blue-700', 'border-b-2', 'border-blue-600', 'font-bold');
        btn.classList.add('text-slate-600', 'font-medium');
      });
      document.getElementById('tab-' + tabId).classList.remove('hidden');
      var activeBtn = document.getElementById('btn-' + tabId);
      activeBtn.classList.add('text-blue-700', 'border-b-2', 'border-blue-600', 'font-bold');
      activeBtn.classList.remove('text-slate-600');
    }

    function renderStudentTable() {
      var filterClass = document.getElementById('student-class-filter').value;
      var q = (document.getElementById('student-search').value || '').toLowerCase();
      var tbody = document.getElementById('student-table-body');
      tbody.innerHTML = '';

      var filtered = APP_STATE.students.filter(function(s) {
        var matchClass = (filterClass === 'ALL' || s.classRoom === filterClass);
        var matchQ = !q || s.name.toLowerCase().indexOf(q) !== -1 || s.nisn.indexOf(q) !== -1;
        return matchClass && matchQ;
      });

      filtered.forEach(function(s, idx) {
        var tr = document.createElement('tr');
        tr.className = 'hover:bg-blue-50/50';
        tr.innerHTML = '<td class="py-2.5 px-3.5 border-r border-slate-200 num-font">' + (idx + 1) + '</td>' +
          '<td class="py-2.5 px-3.5 border-r border-slate-200 font-bold text-blue-900">' + s.classRoom + '</td>' +
          '<td class="py-2.5 px-3.5 border-r border-slate-200 num-font">' + s.nis + ' / ' + s.nisn + '</td>' +
          '<td class="py-2.5 px-3.5 border-r border-slate-200 font-semibold text-slate-900">' + s.name + '</td>' +
          '<td class="py-2.5 px-3.5 border-r border-slate-200 text-center font-bold">' + s.gender + '</td>' +
          '<td class="py-2.5 px-3.5 border-r border-slate-200">' + s.birthPlace + ', ' + s.birthDate + '</td>' +
          '<td class="py-2.5 px-3.5 border-r border-slate-200">' + s.parentName + '</td>' +
          '<td class="py-2.5 px-3.5 text-center num-font text-slate-600">DN-02/D-SD/27/01/' + s.nis.padStart(4, '0') + '</td>';
        tbody.appendChild(tr);
      });
    }

    function renderSemesterGrades() {
      var sem = document.getElementById('sem-picker').value;
      var cls = document.getElementById('sem-class-picker').value;
      var tbody = document.getElementById('semester-table-body');
      tbody.innerHTML = '';

      var students = APP_STATE.students.filter(function(s) { return s.classRoom === cls; });
      students.forEach(function(s, idx) {
        var g = (APP_STATE.grades[s.id] && APP_STATE.grades[s.id][sem]) || {};
        var tr = document.createElement('tr');
        tr.className = 'hover:bg-blue-50/50';
        
        var total = 0;
        var count = 0;
        SUBJECTS.forEach(function(sub) {
          var val = g[sub.id];
          if (typeof val === 'number' && val > 0) { total += val; count++; }
        });
        var avg = count > 0 ? (total / SUBJECTS.length).toFixed(1) : '-';

        tr.innerHTML = '<td class="py-2 px-3 border-r border-slate-200 num-font">' + (idx + 1) + '</td>' +
          '<td class="py-2 px-3 border-r border-slate-200 font-medium text-slate-900">' + s.name + '</td>' +
          SUBJECTS.map(function(sub) {
            var val = g[sub.id];
            // If empty or 0, leave blank without 0!
            var valDisplay = (val === undefined || val === null || val === 0) ? '' : val;
            return '<td class="py-2 px-1 border-r border-slate-200 text-center num-font">' +
              '<input type="number" min="0" max="100" class="w-12 text-center border rounded py-0.5" value="' + valDisplay + '" placeholder="" onchange="updateGrade(\\'' + s.id + '\\', \\'' + sem + '\\', \\'' + sub.id + '\\', this.value)">' +
            '</td>';
          }).join('') +
          '<td class="py-2 px-3 text-center font-bold text-blue-900 num-font">' + avg + '</td>';
        tbody.appendChild(tr);
      });
    }

    function renderExamTable() {
      var cls = document.getElementById('exam-class-picker').value;
      var tbody = document.getElementById('exam-table-body');
      tbody.innerHTML = '';

      var students = APP_STATE.students.filter(function(s) { return s.classRoom === cls; });
      students.forEach(function(s, idx) {
        var ex = APP_STATE.exams[s.id] || {};
        var tr = document.createElement('tr');
        tr.className = 'hover:bg-blue-50/50';
        var sum = 0;
        var count = 0;

        var cells = [];
        SUBJECTS.forEach(function(sub) {
          var detail = ex[sub.id] || { written: 0, practice: 0, finalScore: 0 };
          var wDisp = detail.written > 0 ? detail.written : '';
          var pDisp = detail.practice > 0 ? detail.practice : '';
          
          if (detail.finalScore > 0) {
            sum += detail.finalScore;
            count++;
          }

          if (sub.hasPractice) {
            cells.push('<td class="py-1.5 px-1 border-r border-slate-200 text-center num-font"><input type="number" min="0" max="100" class="w-11 text-center border rounded py-0.5 text-xs font-bold" value="' + wDisp + '" placeholder="" onchange="updateExamWritten(\\'' + s.id + '\\', \\'' + sub.id + '\\', this.value)"></td>');
            cells.push('<td class="py-1.5 px-1 border-r border-slate-200 text-center num-font bg-indigo-50/20"><input type="number" min="0" max="100" class="w-11 text-center border border-indigo-200 rounded py-0.5 text-xs font-bold" value="' + pDisp + '" placeholder="" onchange="updateExamPractice(\\'' + s.id + '\\', \\'' + sub.id + '\\', this.value)"></td>');
          } else {
            cells.push('<td class="py-1.5 px-1 border-r border-slate-200 text-center num-font"><input type="number" min="0" max="100" class="w-11 text-center border rounded py-0.5 text-xs font-bold" value="' + wDisp + '" placeholder="" onchange="updateExamWritten(\\'' + s.id + '\\', \\'' + sub.id + '\\', this.value)"></td>');
          }
        });

        var avg = count > 0 ? (sum / SUBJECTS.length).toFixed(1) : '-';

        tr.innerHTML = '<td class="py-2 px-2 border-r border-slate-200 num-font text-center">' + (idx + 1) + '</td>' +
          '<td class="py-2 px-3 border-r border-slate-200 font-medium text-slate-900">' + s.name + '</td>' +
          cells.join('') +
          '<td class="py-2 px-3 text-center font-bold text-blue-900 num-font">' + avg + '</td>';
        tbody.appendChild(tr);
      });
    }

    function updateGrade(studentId, sem, subject, val) {
      if (!APP_STATE.grades[studentId]) APP_STATE.grades[studentId] = {};
      if (!APP_STATE.grades[studentId][sem]) APP_STATE.grades[studentId][sem] = {};
      APP_STATE.grades[studentId][sem][subject] = val === '' ? 0 : Number(val);
    }

    function updateExamWritten(studentId, subjectId, val) {
      if (!APP_STATE.exams[studentId]) APP_STATE.exams[studentId] = {};
      var cur = APP_STATE.exams[studentId][subjectId] || { written: 0, practice: 0, finalScore: 0 };
      var w = val === '' ? 0 : Number(val);
      var sub = SUBJECTS.find(function(item) { return item.id === subjectId; });
      cur.written = w;
      if (sub && sub.hasPractice) {
        cur.finalScore = Math.round((w * 0.6) + (cur.practice * 0.4));
      } else {
        cur.finalScore = w;
      }
      APP_STATE.exams[studentId][subjectId] = cur;
    }

    function updateExamPractice(studentId, subjectId, val) {
      if (!APP_STATE.exams[studentId]) APP_STATE.exams[studentId] = {};
      var cur = APP_STATE.exams[studentId][subjectId] || { written: 0, practice: 0, finalScore: 0 };
      var p = val === '' ? 0 : Number(val);
      cur.practice = p;
      cur.finalScore = Math.round((cur.written * 0.6) + (p * 0.4));
      APP_STATE.exams[studentId][subjectId] = cur;
    }

    function clearSemesterGrades() {
      var sem = document.getElementById('sem-picker').value;
      var cls = document.getElementById('sem-class-picker').value;
      if (!confirm('Kosongkan nilai rapor untuk kelas ' + cls + ' pada ' + sem + '?')) return;
      APP_STATE.students.forEach(function(s) {
        if (s.classRoom === cls && APP_STATE.grades[s.id]) {
          APP_STATE.grades[s.id][sem] = {};
        }
      });
      renderSemesterGrades();
    }

    function saveCurrentSemesterGrades() {
      if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run.withSuccessHandler(function() {
          alert('Nilai berhasil disimpan permanen ke Google Apps Script!');
          refreshUI();
        }).saveAllData(JSON.stringify(APP_STATE));
      } else {
        localStorage.setItem('BAKOT01_RAPOR_DB_STANDALONE', JSON.stringify(APP_STATE));
        alert('Data nilai semester berhasil disimpan!');
        refreshUI();
      }
    }

    function saveCurrentExamGrades() {
      if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run.withSuccessHandler(function() {
          alert('Nilai ujian sekolah berhasil disimpan permanen!');
          refreshUI();
        }).saveAllData(JSON.stringify(APP_STATE));
      } else {
        localStorage.setItem('BAKOT01_RAPOR_DB_STANDALONE', JSON.stringify(APP_STATE));
        alert('Nilai ujian sekolah (Tulis & Praktek) berhasil disimpan!');
        refreshUI();
      }
    }

    function renderGraduationTable() {
      var tbody = document.getElementById('graduation-table-body');
      tbody.innerHTML = '';

      var totalScoreSum = 0;
      APP_STATE.students.forEach(function(s, idx) {
        var sems = ['K4_S1','K4_S2','K5_S1','K5_S2','K6_S1','K6_S2'];
        var grandTotal = 0;
        var count = 0;
        sems.forEach(function(sem) {
          var g = (APP_STATE.grades[s.id] && APP_STATE.grades[s.id][sem]) || {};
          SUBJECTS.forEach(function(sub) {
            grandTotal += (g[sub.id] || 0);
            count++;
          });
        });
        var avgRapor = (count > 0 ? (grandTotal / count) : 0).toFixed(1);

        var ex = APP_STATE.exams[s.id] || {};
        var exTotal = 0;
        SUBJECTS.forEach(function(sub) {
          exTotal += (ex[sub.id] ? ex[sub.id].finalScore : 85);
        });
        var avgExam = (exTotal / SUBJECTS.length).toFixed(1);

        var finalScore = ((avgRapor * 0.6) + (avgExam * 0.4)).toFixed(1);
        totalScoreSum += Number(finalScore);

        var status = finalScore >= 75 ? '<span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">LULUS</span>' : '<span class="px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold">BELUM</span>';
        var serial = 'DN-02/D-SD/27/01/' + s.nis.padStart(4, '0');

        var tr = document.createElement('tr');
        tr.className = 'hover:bg-blue-50/50';
        tr.innerHTML = '<td class="py-2.5 px-3 border-r border-slate-200 num-font">' + (idx + 1) + '</td>' +
          '<td class="py-2.5 px-3 border-r border-slate-200 font-bold text-blue-900">' + s.classRoom + '</td>' +
          '<td class="py-2.5 px-3 border-r border-slate-200 num-font">' + s.nisn + '</td>' +
          '<td class="py-2.5 px-3 border-r border-slate-200 font-medium text-slate-900">' + s.name + '</td>' +
          '<td class="py-2.5 px-3 border-r border-slate-200 text-center num-font">' + avgRapor + '</td>' +
          '<td class="py-2.5 px-3 border-r border-slate-200 text-center num-font">' + avgExam + '</td>' +
          '<td class="py-2.5 px-3 border-r border-slate-200 text-center font-extrabold text-blue-700 num-font">' + finalScore + '</td>' +
          '<td class="py-2.5 px-3 border-r border-slate-200 text-center font-medium">Baik</td>' +
          '<td class="py-2.5 px-3 border-r border-slate-200 text-center">' + status + '</td>' +
          '<td class="py-2.5 px-3 text-center num-font text-slate-600">' + serial + '</td>';
        tbody.appendChild(tr);
      });

      if (APP_STATE.students.length > 0) {
        var overallAvg = (totalScoreSum / APP_STATE.students.length).toFixed(1);
        document.getElementById('stat-avg-score').innerText = overallAvg;
      }
    }

    function exportExcelDatabase() {
      if (typeof XLSX === 'undefined') {
        alert('Library SheetJS belum terpasang.');
        return;
      }
      var wb = XLSX.utils.book_new();

      // DATA SISWA
      var wsStudents = XLSX.utils.json_to_sheet(APP_STATE.students.map(function(s, idx) {
        return {
          'No': idx + 1,
          'Kelas': s.classRoom,
          'NIS': s.nis,
          'NISN': s.nisn,
          'Nama Siswa': s.name,
          'L/P': s.gender,
          'Tempat Lahir': s.birthPlace,
          'Tanggal Lahir': s.birthDate,
          'Orang Tua / Wali': s.parentName,
          'No Seri Ijazah': 'DN-02/D-SD/27/01/' + s.nis.padStart(4, '0')
        };
      }));
      XLSX.utils.book_append_sheet(wb, wsStudents, 'DATA_SISWA');

      // NILAI SEMESTER
      var semRows = [];
      APP_STATE.students.forEach(function(s) {
        ['K4_S1','K4_S2','K5_S1','K5_S2','K6_S1','K6_S2'].forEach(function(sem) {
          var g = (APP_STATE.grades[s.id] && APP_STATE.grades[s.id][sem]) || {};
          semRows.push({
            'Kelas': s.classRoom,
            'NISN': s.nisn,
            'Nama': s.name,
            'Semester': sem,
            'PAI': g.pai || '',
            'PPKn': g.ppkn || '',
            'B.Indo': g.bindo || '',
            'MTK': g.mtk || '',
            'IPAS': g.ipas || '',
            'SBdP': g.sbdp || '',
            'PJOK': g.pjok || '',
            'B.Sunda': g.sunda || '',
            'B.Inggris': g.bing || ''
          });
        });
      });
      var wsSem = XLSX.utils.json_to_sheet(semRows);
      XLSX.utils.book_append_sheet(wb, wsSem, 'RAPOR_6_SEMESTER');

      // UJIAN SEKOLAH
      var examRows = APP_STATE.students.map(function(s, idx) {
        var ex = APP_STATE.exams[s.id] || {};
        var row = {
          'No': idx + 1,
          'Kelas': s.classRoom,
          'NISN': s.nisn,
          'Nama Siswa': s.name
        };
        SUBJECTS.forEach(function(sub) {
          var d = ex[sub.id] || {};
          row[sub.code + '_Nilai_Tulis'] = d.written || '';
          if (sub.hasPractice) {
            row[sub.code + '_Nilai_Praktek'] = d.practice || '';
          }
          row[sub.code + '_Nilai_Akhir_US'] = d.finalScore || '';
        });
        return row;
      });
      var wsExam = XLSX.utils.json_to_sheet(examRows);
      XLSX.utils.book_append_sheet(wb, wsExam, 'UJIAN_SEKOLAH');

      XLSX.writeFile(wb, 'Database_Nilai_SDN_Babelan_Kota_01_TP_2026_2027.xlsx');
    }

    function importExcelDatabase(e) {
      var file = e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function(evt) {
        var data = new Uint8Array(evt.target.result);
        var wb = XLSX.read(data, { type: 'array' });
        var sheetName = wb.SheetNames[0];
        var json = XLSX.utils.sheet_to_json(wb.Sheets[sheetName]);
        alert('File berhasil dibaca (' + json.length + ' baris data).');
      };
      reader.readAsArrayBuffer(file);
    }

    window.addEventListener('DOMContentLoaded', initData);
  </script>
</body>
</html>
`;

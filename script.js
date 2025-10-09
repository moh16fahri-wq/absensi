// BAGIAN 1: DATABASE SIMULASI
const data = {
    users: {
        admins: [{ username: "admin", password: "admin123" }],
        gurus: [
            { id: 1, nama: "Budi Santoso", password: "guru1", jadwal: [ { id_kelas: 1, hari: 4, jam: 9, nama_kelas: "Kelas 10A" }, { id_kelas: 2, hari: 4, jam: 10, nama_kelas: "Kelas 11B" } ] },
            { id: 2, nama: "Anisa Putri", password: "guru2", jadwal: [{ id_kelas: 2, hari: 2, jam: 10, nama_kelas: "Kelas 11B" }] }
        ],
        siswas: [
            { id: 101, nama: "Agus", password: "siswa1", id_kelas: 1 },
            { id: 102, nama: "Citra", password: "siswa2", id_kelas: 1 },
            { id: 201, nama: "Dewi", password: "siswa3", id_kelas: 2 },
            { id: 202, nama: "Eko", password: "siswa4", id_kelas: 2 }
        ]
    },
    kelas: [
        { id: 1, nama: "Kelas 10A", lokasi: { latitude: -7.983908, longitude: 112.621391 } },
        { id: 2, nama: "Kelas 11B", lokasi: { latitude: -7.983500, longitude: 112.621800 } }
    ],
    tugas: [],
    absensi: []
};

// BAGIAN 2: PENGATURAN AWAL & TAMPILAN
let currentUser = null, currentRole = null, absensiHariIniSelesai = false;
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("kata-harian") ? setupHalamanAwal() : document.getElementById("app") && showView("view-role-selection");
});
function setupHalamanAwal() {
    const quotes = ["Minggu: Istirahat adalah bagian dari proses.", "Senin: Mulailah minggu dengan energi penuh!", "Selasa: Terus belajar, terus bertumbuh.", "Rabu: Jangan takut gagal, takutlah tidak mencoba.", "Kamis: Optimis melihat masa depan!", "Jumat: Selesaikan apa yang kamu mulai.", "Sabtu: Refleksi dan siapkan hari esok."];
    document.getElementById("kata-harian").textContent = quotes[new Date().getDay()];
    document.getElementById("tombol-buka").addEventListener("click", () => window.location.href = "main.html");
}
function showView(viewId) {
    document.querySelectorAll("#app > div").forEach(div => div.classList.add("hidden"));
    document.getElementById(viewId).classList.remove("hidden");
}

// BAGIAN 3: LOGIKA LOGIN
function showLogin(role) {
    currentRole = role;
    showView("view-login-form");
    document.querySelectorAll("#view-login-form > div").forEach(div => div.classList.add("hidden"));
    const title = document.getElementById("login-title");
    if (role === 'admin') { title.textContent = "Login Admin"; document.getElementById("form-admin").classList.remove("hidden"); }
    else if (role === 'guru') { title.textContent = "Login Guru"; document.getElementById("form-guru").classList.remove("hidden"); populateGuruDropdown(); }
    else if (role === 'siswa') { title.textContent = "Login Siswa"; document.getElementById("form-siswa").classList.remove("hidden"); populateKelasDropdown(); }
}
function populateGuruDropdown() {
    const select = document.getElementById("guru-select-nama");
    select.innerHTML = '<option value="">-- Pilih Nama Guru --</option>';
    data.users.gurus.forEach(guru => select.innerHTML += `<option value="${guru.id}">${guru.nama}</option>`);
}
function populateKelasDropdown() {
    const select = document.getElementById("siswa-select-kelas");
    select.innerHTML = '<option value="">-- Pilih Kelas --</option>';
    data.kelas.forEach(k => select.innerHTML += `<option value="${k.id}">${k.nama}</option>`);
    populateSiswaDropdown();
}
function populateSiswaDropdown() {
    const kelasId = document.getElementById("siswa-select-kelas").value;
    const select = document.getElementById("siswa-select-nama");
    select.innerHTML = '<option value="">-- Pilih Nama Siswa --</option>';
    if (kelasId) {
        data.users.siswas.filter(s => s.id_kelas == kelasId).forEach(s => select.innerHTML += `<option value="${s.id}">${s.nama}</option>`);
    }
}
function login() {
    let user = null;
    if (currentRole === 'admin') user = data.users.admins.find(u => u.username === document.getElementById("admin-user").value && u.password === document.getElementById("admin-pass").value);
    else if (currentRole === 'guru') user = data.users.gurus.find(u => u.id == document.getElementById("guru-select-nama").value && u.password === document.getElementById("guru-pass").value);
    else if (currentRole === 'siswa') user = data.users.siswas.find(u => u.id == document.getElementById("siswa-select-nama").value && u.password === document.getElementById("siswa-pass").value);

    if (user) { currentUser = user; alert("Login Berhasil!"); showDashboard(); }
    else { alert("Login Gagal! Periksa kembali data Anda."); }
}
function logout() {
    currentUser = null; currentRole = null; absensiHariIniSelesai = false;
    showView("view-role-selection");
    document.querySelectorAll("input").forEach(i => i.value = "");
}

// BAGIAN 4: RENDER DASHBOARD UTAMA
function showDashboard() {
    showView("view-dashboard");
    const title = document.getElementById("dashboard-title");
    const content = document.getElementById("dashboard-content");
    content.innerHTML = "";
    const gantiPasswordHTML = `<div class="dashboard-section"><h4>🔑 Ganti Password</h4><input type="password" id="old-pass" placeholder="Password Lama"><input type="password" id="new-pass" placeholder="Password Baru"><input type="password" id="confirm-new-pass" placeholder="Konfirmasi Password Baru"><button onclick="changePassword()">Simpan Password Baru</button></div>`;

    if (currentRole === 'admin') {
        title.textContent = "Dashboard Admin";
        content.innerHTML = renderAdminDashboard() + gantiPasswordHTML;
        renderRekapAbsensiGuru(); // Tampilkan rekap guru secara default
    } else if (currentRole === 'guru') {
        title.textContent = `Selamat Datang, ${currentUser.nama}`;
        content.innerHTML = renderGuruDashboard() + gantiPasswordHTML;
        cekJadwalMengajar();
        renderTugasSubmissions();
    } else if (currentRole === 'siswa') {
        title.textContent = `Selamat Datang, ${currentUser.nama}`;
        cekAbsensiSiswaHariIni();
        content.innerHTML = renderSiswaDashboard() + gantiPasswordHTML;
        renderDaftarTugas();
    }
}

// =================================================================================
// BAGIAN 5: FITUR-FITUR BARU & YANG DIPERBARUI
// =================================================================================

// --- FITUR 3: EKSPOR CSV & REKAP ADMIN ---
function renderAdminDashboard() {
    let kelasOptions = data.kelas.map(k => `<option value="${k.id}">${k.nama}</option>`).join("");
    return `
    <div class="dashboard-section">
        <h4>📊 Rekap Absensi</h4>
        <div class="filter-group">
            <label>Dari:</label><input type="date" id="start-date">
            <label>Sampai:</label><input type="date" id="end-date">
        </div>
        <div class="filter-group">
            <button onclick="renderRekapAbsensiGuru()">Rekap Guru</button>
            <label>atau rekap siswa:</label>
            <select id="kelas-select" onchange="renderRekapSiswa()">
                <option value="">-- Pilih Kelas --</option>${kelasOptions}
            </select>
            <button id="export-btn" onclick="exportToCSV()" style="margin-left: 1rem;">🖨️ Ekspor ke CSV</button>
        </div>
        <div id="rekap-container"><p>Pilih rentang tanggal dan jenis rekap untuk melihat data.</p></div>
    </div>
    <div class="dashboard-section">
        <h4>⚙️ Manajemen Data</h4>
        <div class="management-container" id="management-container">
             <p>Pilih data yang ingin Anda kelola.</p>
             <button onclick="renderManajemen('guru')">Kelola Guru</button>
             <button onclick="renderManajemen('siswa')">Kelola Siswa</button>
             <button onclick="renderManajemen('kelas')">Kelola Kelas</button>
        </div>
    </div>
    `;
}

function exportToCSV() {
    const table = document.querySelector("#rekap-container table");
    if (!table) { alert("Tidak ada data untuk diekspor!"); return; }
    let csv = [];
    let rows = table.querySelectorAll("tr");
    for (let row of rows) {
        let cols = row.querySelectorAll("th, td");
        let rowData = Array.from(cols).map(col => `"${col.innerText.replace(/"/g, '""')}"`);
        csv.push(rowData.join(","));
    }
    const csvContent = "data:text/csv;charset=utf-8," + csv.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "rekap_absensi.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// --- FITUR 2: MANAJEMEN CRUD UNTUK ADMIN ---
function renderManajemen(tipe) {
    const container = document.getElementById('management-container');
    let html = '';
    if (tipe === 'guru') {
        html += `<h4>Kelola Data Guru</h4>`;
        html += `<table class="management-table"><thead><tr><th>ID</th><th>Nama</th><th>Password</th><th>Aksi</th></tr></thead><tbody>`;
        data.users.gurus.forEach(g => {
            html += `<tr><td>${g.id}</td><td>${g.nama}</td><td>*****</td>
                     <td><button class="small-btn edit" onclick="editGuru(${g.id})">Edit</button><button class="small-btn delete" onclick="hapusGuru(${g.id})">Hapus</button></td></tr>`;
        });
        html += `</tbody></table>`;
        html += `<div class="form-container"><h5>Tambah Guru Baru</h5>
                 <input type="text" id="guru-nama-baru" placeholder="Nama Guru">
                 <input type="password" id="guru-pass-baru" placeholder="Password">
                 <button onclick="tambahGuru()">+ Tambah Guru</button></div>`;
    } else if (tipe === 'siswa') {
        let kelasOptions = data.kelas.map(k => `<option value="${k.id}">${k.nama}</option>`).join("");
        html += `<h4>Kelola Data Siswa</h4>`;
        html += `<table class="management-table"><thead><tr><th>ID</th><th>Nama</th><th>Kelas</th><th>Aksi</th></tr></thead><tbody>`;
        data.users.siswas.forEach(s => {
            const kelasNama = data.kelas.find(k => k.id === s.id_kelas)?.nama || 'N/A';
            html += `<tr><td>${s.id}</td><td>${s.nama}</td><td>${kelasNama}</td>
                     <td><button class="small-btn edit" onclick="editSiswa(${s.id})">Edit</button><button class="small-btn delete" onclick="hapusSiswa(${s.id})">Hapus</button></td></tr>`;
        });
        html += `</tbody></table>`;
        html += `<div class="form-container"><h5>Tambah Siswa Baru</h5>
                 <input type="text" id="siswa-nama-baru" placeholder="Nama Siswa">
                 <input type="password" id="siswa-pass-baru" placeholder="Password">
                 <select id="siswa-kelas-baru">${kelasOptions}</select>
                 <button onclick="tambahSiswa()">+ Tambah Siswa</button></div>`;
    }
    container.innerHTML = html + `<button class="back-button" onclick="showDashboard()">« Kembali ke Dashboard</button>`;
}

function tambahGuru() {
    const nama = document.getElementById('guru-nama-baru').value;
    const password = document.getElementById('guru-pass-baru').value;
    if (!nama || !password) { alert("Nama dan password harus diisi!"); return; }
    const newId = data.users.gurus.length > 0 ? Math.max(...data.users.gurus.map(g => g.id)) + 1 : 1;
    data.users.gurus.push({ id: newId, nama, password, jadwal: [] });
    renderManajemen('guru');
}

function hapusGuru(id) {
    if (confirm(`Yakin ingin menghapus guru dengan ID ${id}?`)) {
        data.users.gurus = data.users.gurus.filter(g => g.id !== id);
        renderManajemen('guru');
    }
}

function editGuru(id) {
    const guru = data.users.gurus.find(g => g.id === id);
    const namaBaru = prompt("Masukkan nama baru:", guru.nama);
    const passBaru = prompt("Masukkan password baru (kosongkan jika tidak diubah):");
    if (namaBaru) guru.nama = namaBaru;
    if (passBaru) guru.password = passBaru;
    renderManajemen('guru');
}

function tambahSiswa() {
    const nama = document.getElementById('siswa-nama-baru').value;
    const password = document.getElementById('siswa-pass-baru').value;
    const id_kelas = parseInt(document.getElementById('siswa-kelas-baru').value);
    if (!nama || !password || !id_kelas) { alert("Semua data harus diisi!"); return; }
    const newId = data.users.siswas.length > 0 ? Math.max(...data.users.siswas.map(s => s.id)) + 1 : 101;
    data.users.siswas.push({ id: newId, nama, password, id_kelas });
    renderManajemen('siswa');
}

function hapusSiswa(id) {
    if (confirm(`Yakin ingin menghapus siswa dengan ID ${id}?`)) {
        data.users.siswas = data.users.siswas.filter(s => s.id !== id);
        renderManajemen('siswa');
    }
}

function editSiswa(id) {
    const siswa = data.users.siswas.find(s => s.id === id);
    const namaBaru = prompt("Masukkan nama baru:", siswa.nama);
    if (namaBaru) siswa.nama = namaBaru;
    renderManajemen('siswa');
}


// --- FITUR 1: PENILAIAN & UMPAN BALIK TUGAS ---
function renderTugasSubmissions() {
    const container = document.getElementById("submission-container");
    const tugasGuru = data.tugas.filter(t => t.id_guru === currentUser.id);
    if (tugasGuru.length === 0) { container.innerHTML = "<p>Anda belum mengirim tugas apapun.</p>"; return; }
    let html = "";
    tugasGuru.forEach(t => {
        html += `<h5>Tugas: ${t.judul} (Kelas: ${data.kelas.find(k=>k.id===t.id_kelas).nama})</h5>`;
        if (t.submissions && t.submissions.length > 0) {
            html += "<ul class='submission-list'>";
            t.submissions.forEach(sub => {
                html += `<li>
                    <strong>${sub.nama_siswa}</strong> mengumpulkan file: <em>${sub.file}</em>
                    <div class="grading-container">
                        ${sub.nilai !== null ? `
                            <p class="grade-display"><strong>Nilai: ${sub.nilai}</strong></p>
                            <p class="feedback-display"><em>Feedback: ${sub.feedback}</em></p>
                        ` : `
                            <input type="number" id="nilai-${t.id}-${sub.id_siswa}" placeholder="Nilai (0-100)" min="0" max="100">
                            <input type="text" id="feedback-${t.id}-${sub.id_siswa}" placeholder="Umpan Balik">
                            <button class="small-btn" onclick="simpanNilai(${t.id}, ${sub.id_siswa})">Simpan</button>
                        `}
                    </div>
                </li>`;
            });
            html += "</ul>";
        } else { html += "<p>Belum ada siswa yang mengumpulkan.</p>"; }
    });
    container.innerHTML = html;
}

function simpanNilai(id_tugas, id_siswa) {
    const nilai = document.getElementById(`nilai-${id_tugas}-${id_siswa}`).value;
    const feedback = document.getElementById(`feedback-${id_tugas}-${id_siswa}`).value;
    if (nilai === "" || nilai < 0 || nilai > 100) { alert("Nilai harus diisi antara 0-100."); return; }
    
    const tugas = data.tugas.find(t => t.id === id_tugas);
    const submission = tugas.submissions.find(s => s.id_siswa === id_siswa);
    submission.nilai = parseInt(nilai);
    submission.feedback = feedback || "Tidak ada feedback.";
    
    alert("Nilai berhasil disimpan!");
    renderTugasSubmissions();
}

function renderDaftarTugas() {
    const container = document.getElementById("daftar-tugas-container");
    const notif = document.getElementById("notif-tugas");
    const tugasSiswa = data.tugas.filter(t => t.id_kelas === currentUser.id_kelas);
    
    notif.textContent = tugasSiswa.length;
    if (tugasSiswa.length === 0) { container.innerHTML = "<p>🎉 Hore, tidak ada tugas saat ini!</p>"; return; }
    
    let html = "";
    tugasSiswa.forEach(t => {
        const submission = t.submissions ? t.submissions.find(s => s.id_siswa === currentUser.id) : null;
        html += `<div class="task-card">
            <div class="task-header"><span><strong>${t.judul}</strong> - dari ${t.nama_guru}</span><span class="task-deadline">Deadline: ${t.deadline}</span></div>
            <p class="task-body">${t.deskripsi}</p><p>File dari guru: <em>${t.file}</em></p>
            ${submission ? `
                <div class="submission-status">
                    <p style="color:green;"><strong>✔ Anda sudah mengumpulkan tugas ini.</strong></p>
                    ${submission.nilai !== null ? `
                        <p class="grade-display"><strong>Nilai Anda: ${submission.nilai}</strong></p>
                        <p class="feedback-display"><strong>Umpan Balik Guru:</strong> <em>${submission.feedback}</em></p>
                    ` : `<p>Menunggu penilaian dari guru...</p>`}
                </div>
            ` : `
                <label>Kirim Jawaban Anda:</label><input type="file" id="submit-file-${t.id}">
                <button onclick="submitTugas(${t.id})">Kirim Jawaban</button>
            `}
        </div>`;
    });
    container.innerHTML = html;
}

function kirimTugas() {
    const id_kelas = parseInt(document.getElementById("tugas-kelas").value);
    const judul = document.getElementById("tugas-judul").value;
    const deskripsi = document.getElementById("tugas-deskripsi").value;
    const deadline = document.getElementById("tugas-deadline").value;
    const file = document.getElementById("tugas-file").files[0];
    if (!id_kelas || !judul || !deskripsi || !deadline) return alert("Harap lengkapi semua data tugas!");
    
    const tugasBaru = {
        id: Date.now(),
        id_guru: currentUser.id,
        nama_guru: currentUser.nama,
        id_kelas: id_kelas,
        judul: judul,
        deskripsi: deskripsi,
        deadline: deadline,
        file: file ? file.name : "Tidak ada file",
        submissions: []
    };
    data.tugas.push(tugasBaru);
    alert(`Tugas "${judul}" berhasil dikirim!`);
    showDashboard();
}

function submitTugas(id_tugas) {
    const fileInput = document.getElementById(`submit-file-${id_tugas}`);
    const file = fileInput.files[0];
    if (!file) return alert("Pilih file jawaban terlebih dahulu!");
    
    const tugas = data.tugas.find(t => t.id === id_tugas);
    if (tugas) {
        // Inisialisasi submissions jika belum ada
        if (!tugas.submissions) {
            tugas.submissions = [];
        }
        tugas.submissions.push({
            id_siswa: currentUser.id,
            nama_siswa: currentUser.nama,
            file: file.name,
            timestamp: new Date().toLocaleString("id-ID"),
            nilai: null,      // Properti baru
            feedback: ""      // Properti baru
        });
        alert(`Jawaban untuk tugas "${tugas.judul}" berhasil dikirim!`);
        renderDaftarTugas();
    }
}


// =================================================================================
// BAGIAN 6: FUNGSI-FUNGSI INTI LAINNYA (TIDAK BANYAK BERUBAH)
// =================================================================================

// --- Absensi & Dashboard Siswa/Guru ---
function renderGuruDashboard() { /* ... (fungsi ini tidak berubah dari sebelumnya) ... */ }
function cekJadwalMengajar() { /* ... (fungsi ini tidak berubah dari sebelumnya) ... */ }
function mulaiAjar() { /* ... (fungsi ini не berubah dari sebelumnya) ... */ }
function renderSiswaDashboard() { /* ... (fungsi ini tidak berubah dari sebelumnya) ... */ }
function cekAbsensiSiswaHariIni() { /* ... (fungsi ini tidak berubah dari sebelumnya) ... */ }
function getFilteredAbsensi() { /* ... (fungsi ini tidak berubah dari sebelumnya) ... */ }
function renderRekapAbsensiGuru() { /* ... (fungsi ini tidak berubah dari sebelumnya) ... */ }
function renderRekapSiswa() { /* ... (fungsi ini tidak berubah dari sebelumnya) ... */ }
function absen(status, id_kelas = null) { /* ... (fungsi ini tidak berubah dari sebelumnya) ... */ }
function hitungJarak(lat1, lon1, lat2, lon2) { /* ... (fungsi ini tidak berubah dari sebelumnya) ... */ }
function changePassword() { /* ... (fungsi ini tidak berubah dari sebelumnya) ... */ }

// --- Implementasi fungsi-fungsi yang tidak berubah ---
function renderGuruDashboard() {
    let kelasOptions = data.kelas.map(k => `<option value="${k.id}">${k.nama}</option>`).join("");
    return `
    <div class="dashboard-section" id="guru-absen">
        <h4>🗓️ Absensi Pengajar</h4><p id="info-absen-guru">Mengecek jadwal mengajar Anda...</p>
        <button id="btn-mulai-ajar" onclick="mulaiAjar()" disabled>Mulai Ajar</button>
        <div id="container-absen-kelas" style="margin-top: 1rem;"></div>
    </div>
    <div class="dashboard-section" id="guru-tugas">
        <h4>📤 Kirim Tugas Baru</h4><select id="tugas-kelas">${kelasOptions}</select>
        <input type="text" id="tugas-judul" placeholder="Judul Tugas"><textarea id="tugas-deskripsi" placeholder="Deskripsi..."></textarea>
        <label>Batas Waktu:</label><input type="date" id="tugas-deadline">
        <label>Upload File:</label><input type="file" id="tugas-file">
        <button onclick="kirimTugas()">Kirim Tugas</button>
    </div>
    <div class="dashboard-section"><h4>👀 Lihat Pengumpulan Tugas</h4><div id="submission-container"></div></div>`;
}
function cekJadwalMengajar() {
    const btn = document.getElementById("btn-mulai-ajar"), info = document.getElementById("info-absen-guru"), now = new Date();
    const jadwalSekarang = currentUser.jadwal.filter(j => j.hari === now.getDay() && j.jam === now.getHours());
    if (jadwalSekarang.length > 0) { info.textContent = "Anda memiliki jadwal mengajar sekarang. Silakan tekan 'Mulai Ajar'."; btn.disabled = false; }
    else { info.textContent = "Tidak ada jadwal mengajar pada saat ini."; btn.disabled = true; }
}
function mulaiAjar() {
    const container = document.getElementById("container-absen-kelas"), now = new Date();
    const jadwalSekarang = currentUser.jadwal.filter(j => j.hari === now.getDay() && j.jam === now.getHours());
    if (jadwalSekarang.length === 0) { container.innerHTML = "<p>Gagal memuat sesi. Tidak ada jadwal ditemukan.</p>"; return; }
    let html = "<h5>Pilih Kelas untuk Absen:</h5>";
    jadwalSekarang.forEach(sesi => {
        html += `<div class="task-card"><strong>${sesi.nama_kelas}</strong><p>Jadwal: Jam ${sesi.jam}:00</p><button onclick="absen('masuk', ${sesi.id_kelas})">✅ Absen Masuk</button></div>`;
    });
    html += `<p>Jika berhalangan hadir, silakan pilih opsi di bawah:</p><button onclick="absen('izin')">📝 Izin</button><button onclick="absen('sakit')">🤒 Sakit</button>`;
    container.innerHTML = html;
    document.getElementById("btn-mulai-ajar").disabled = true;
}
function renderSiswaDashboard() {
    const locked = absensiHariIniSelesai ? "" : "locked-feature";
    const warning = absensiHariIniSelesai ? "" : "<p><strong>🔒 Harap lakukan absensi terlebih dahulu untuk membuka fitur tugas.</strong></p>";
    return `
    <div class="dashboard-section" id="siswa-absen"><h4>✅ Absensi Siswa</h4><button id="btn-absen-masuk-siswa" onclick="absen('masuk')">📍 Masuk</button><button onclick="absen('izin')">📝 Izin</button><button onclick="absen('sakit')">🤒 Sakit</button></div>
    <div id="tugas-wrapper" class="${locked}">${warning}<div class="dashboard-section" id="siswa-tugas"><h4>📚 Tugas Sekolah <span id="notif-tugas" class="notification-badge">0</span></h4><div id="daftar-tugas-container"></div></div></div>`;
}
function cekAbsensiSiswaHariIni() {
    const today = new Date().toISOString().slice(0, 10);
    absensiHariIniSelesai = !!data.absensi.find(a => a.id_user === currentUser.id && a.tanggal === today);
}
function getFilteredAbsensi() {
    const start = document.getElementById("start-date").value;
    const end = document.getElementById("end-date").value;
    return start && end ? data.absensi.filter(a => a.tanggal >= start && a.tanggal <= end) : data.absensi;
}
function renderRekapAbsensiGuru() {
    const container = document.getElementById("rekap-container");
    const absensiFiltered = getFilteredAbsensi().filter(a => a.role === 'guru');
    let html = "<h5>Rekap Absensi Guru</h5>";
    if (absensiFiltered.length === 0) {
        html += "<p>Tidak ada data absensi guru pada rentang tanggal ini.</p>";
    } else {
        html += "<table><thead><tr><th>Nama</th><th>Tanggal</th><th>Status</th><th>Keterangan</th></tr></thead><tbody>";
        absensiFiltered.forEach(a => {
            html += `<tr><td>${a.nama}</td><td>${a.tanggal}</td><td>${a.status}</td><td>${a.keterangan || "-"}</td></tr>`;
        });
        html += "</tbody></table>";
    }
    container.innerHTML = html;
}
function renderRekapSiswa() {
    const container = document.getElementById("rekap-container");
    const kelasId = document.getElementById("kelas-select").value;
    if (!kelasId) { container.innerHTML = `<p>Silakan pilih kelas terlebih dahulu.</p>`; return; }
    const siswaDiKelas = data.users.siswas.filter(s => s.id_kelas == kelasId);
    const absensiFiltered = getFilteredAbsensi();
    let html = `<h5>Rekap Absensi ${document.getElementById("kelas-select").options[document.getElementById("kelas-select").selectedIndex].text}</h5>`;
    html += "<table><thead><tr><th>Nama Siswa</th><th>Masuk</th><th>Izin</th><th>Sakit</th><th>Alfa</th></tr></thead><tbody>";
    siswaDiKelas.forEach(siswa => {
        const absensiSiswa = absensiFiltered.filter(a => a.id_user === siswa.id);
        const rekap = {
            masuk: absensiSiswa.filter(a => a.status === 'masuk').length,
            izin: absensiSiswa.filter(a => a.status === 'izin').length,
            sakit: absensiSiswa.filter(a => a.status === 'sakit').length,
            alfa: absensiSiswa.filter(a => a.status === 'alfa').length
        };
        html += `<tr><td>${siswa.nama}</td><td>${rekap.masuk}</td><td>${rekap.izin}</td><td>${rekap.sakit}</td><td>${rekap.alfa}</td></tr>`;
    });
    html += "</tbody></table>";
    container.innerHTML = html;
}
function absen(status, id_kelas = null) {
    const today = new Date().toISOString().slice(0, 10);
    if (data.absensi.find(a => a.id_user === currentUser.id && a.role === currentRole && a.tanggal === today)) {
        return alert(`Anda sudah melakukan absensi hari ini.`);
    }
    const catatAbsensi = (keterangan = "") => {
        data.absensi.push({ id_user: currentUser.id, role: currentRole, nama: currentUser.nama, tanggal: today, status, keterangan });
        alert(`Absensi '${status}' berhasil dicatat!`);
        if (currentRole === 'siswa') { absensiHariIniSelesai = true; showDashboard(); }
        else if (currentRole === 'guru') { document.getElementById("container-absen-kelas").innerHTML = `<p style="color:green;"><strong>Absensi Anda telah tercatat.</strong></p>`; }
    };
    if (status === 'masuk') {
        let targetLokasi, btn;
        const radius = 200; // meter
        if (currentRole === 'guru' && id_kelas) {
            const kelas = data.kelas.find(k => k.id === id_kelas);
            targetLokasi = kelas.lokasi;
        } else if (currentRole === 'siswa') {
            targetLokasi = { latitude: -7.983908, longitude: 112.621391 }; // Lokasi sekolah
            btn = document.getElementById(`btn-absen-masuk-siswa`);
            btn.disabled = true; btn.textContent = "Mengecek Lokasi...";
        }
        navigator.geolocation.getCurrentPosition(pos => {
            const jarak = hitungJarak(pos.coords.latitude, pos.coords.longitude, targetLokasi.latitude, targetLokasi.longitude);
            if (jarak <= radius) catatAbsensi();
            else alert(`Gagal! Jarak Anda dari lokasi: ${Math.round(jarak)} meter. Terlalu jauh.`);
            if (btn) { btn.disabled = false; btn.textContent = "📍 Masuk"; }
        }, () => {
            alert("Tidak bisa mengakses lokasi. Pastikan GPS aktif.");
            if (btn) { btn.disabled = false; btn.textContent = "📍 Masuk"; }
        });
    } else {
        const alasan = prompt(`Masukkan alasan Anda ${status}:`);
        if (alasan) catatAbsensi(alasan);
        else alert("Absensi dibatalkan.");
    }
}
function hitungJarak(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180, φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180, Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}
function changePassword() {
    const oldP = document.getElementById("old-pass").value, newP = document.getElementById("new-pass").value, confirmP = document.getElementById("confirm-new-pass").value;
    if (!oldP || !newP || !confirmP) return alert("Semua kolom harus diisi!");
    if (newP !== confirmP) return alert("Password baru dan konfirmasi tidak cocok!");
    if (oldP !== currentUser.password) return alert("Password lama salah!");
    currentUser.password = newP;
    alert("Password berhasil diubah!");
    document.getElementById("old-pass").value = ""; document.getElementById("new-pass").value = ""; document.getElementById("confirm-new-pass").value = "";
}

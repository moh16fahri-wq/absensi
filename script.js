// BAGIAN 1: DATABASE SIMULASI
const data = {
    users: {
        admins: [{ username: "admin", password: "admin123" }],
        gurus: [
            { id: 1, nama: "Budi Santoso", password: "guru1", jadwal: [ { id_kelas: 1, hari: 4, jam: 9, nama_kelas: "Kelas 10A" }, { id_kelas: 2, hari: 4, jam: 10, nama_kelas: "Kelas 11B" } ] },
            { id: 2, nama: "Anisa Putri", password: "guru2", jadwal: [{ id_kelas: 2, hari: 2, jam: 10, nama_kelas: "Kelas 11B" }] }
        ],
        siswas: [
            { id: 101, nama: "Agus", password: "siswa1", id_kelas: 1 }, { id: 102, nama: "Citra", password: "siswa2", id_kelas: 1 },
            { id: 201, nama: "Dewi", password: "siswa3", id_kelas: 2 }, { id: 202, nama: "Eko", password: "siswa4", id_kelas: 2 }
        ]
    },
    kelas: [
        { id: 1, nama: "Kelas 10A", lokasi: { latitude: -7.983908, longitude: 112.621391 } },
        { id: 2, nama: "Kelas 11B", lokasi: { latitude: -7.983500, longitude: 112.621800 } }
    ],
    tugas: [], absensi: [],
    // DATA BARU UNTUK FITUR LANJUTAN
    pengumuman: [
        { id: Date.now(), oleh: 'Admin', judul: 'Selamat Datang!', isi: 'Ini adalah versi baru dari aplikasi sekolah digital. Jelajahi fitur-fitur baru yang tersedia!', tanggal: new Date().toISOString().slice(0, 10), target_kelas_id: 'semua' }
    ],
    materi: [
        { id: Date.now(), id_guru: 1, id_kelas: 1, judul: 'Pengantar Aljabar', deskripsi: 'Materi dasar aljabar dalam format PDF untuk dipelajari.', file: 'aljabar_bab1.pdf' }
    ]
};

// BAGIAN 2: PENGATURAN AWAL & TAMPILAN
let currentUser = null, currentRole = null, absensiHariIniSelesai = false;
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("kata-harian") ? setupHalamanAwal() : document.getElementById("app") && showView("view-role-selection");
});
function setupHalamanAwal() { /* ... (fungsi ini tidak berubah) ... */ }
function showView(viewId, subViewId = null) {
    document.querySelectorAll("#app > div").forEach(div => div.classList.add("hidden"));
    document.getElementById(viewId).classList.remove("hidden");
    if (subViewId) {
        document.querySelectorAll(`#${viewId} .sub-view`).forEach(sv => sv.style.display = 'none');
        const subView = document.getElementById(subViewId);
        if (subView) subView.style.display = 'block';
    }
}

// BAGIAN 3: LOGIKA LOGIN
function showLogin(role) { /* ... (fungsi ini tidak berubah) ... */ }
function populateGuruDropdown() { /* ... (fungsi ini tidak berubah) ... */ }
function populateKelasDropdown() { /* ... (fungsi ini tidak berubah) ... */ }
function populateSiswaDropdown() { /* ... (fungsi ini tidak berubah) ... */ }
function login() { /* ... (fungsi ini tidak berubah) ... */ }
function logout() { /* ... (fungsi ini tidak berubah) ... */ }

// BAGIAN 4: RENDER DASHBOARD UTAMA
function showDashboard() {
    showView("view-dashboard");
    const title = document.getElementById("dashboard-title");
    const content = document.getElementById("dashboard-content");
    content.innerHTML = "";
    const gantiPasswordHTML = `<div class="dashboard-section"><h4>🔑 Ganti Password</h4><input type="password" id="old-pass" placeholder="Password Lama"><input type="password" id="new-pass" placeholder="Password Baru"><input type="password" id="confirm-new-pass" placeholder="Konfirmasi Password Baru"><button onclick="changePassword()">Simpan</button></div>`;

    if (currentRole === 'admin') {
        title.textContent = "Dashboard Admin";
        content.innerHTML = renderAdminDashboard();
        // Default view: Analitik
        renderAdminAnalitik();
    } else if (currentRole === 'guru') {
        title.textContent = `Selamat Datang, ${currentUser.nama}`;
        content.innerHTML = renderGuruDashboard() + gantiPasswordHTML;
        cekJadwalMengajar();
        renderTugasSubmissions();
    } else if (currentRole === 'siswa') {
        title.textContent = `Selamat Datang, ${currentUser.nama}`;
        cekAbsensiSiswaHariIni();
        content.innerHTML = renderSiswaDashboard() + gantiPasswordHTML;
        renderSiswaFeatures(); // Memuat pengumuman & materi
    }
}


// =================================================================================
// BAGIAN 5: FITUR-FITUR BARU & YANG DIPERBARUI (LANJUTAN)
// =================================================================================

// --- FITUR 4, 5: DASHBOARD ADMIN DENGAN ANALITIK & PENGUMUMAN ---
function renderAdminDashboard() {
    return `
    <div class="tabs">
        <button class="tab-link active" onclick="openAdminTab(event, 'Analitik')">📈 Analitik</button>
        <button class="tab-link" onclick="openAdminTab(event, 'Absensi')">📊 Rekap Absensi</button>
        <button class="tab-link" onclick="openAdminTab(event, 'Manajemen')">⚙️ Manajemen Data</button>
        <button class="tab-link" onclick="openAdminTab(event, 'Pengumuman')">📢 Pengumuman</button>
    </div>

    <div id="Analitik" class="tab-content" style="display:block;"></div>
    <div id="Absensi" class="tab-content"></div>
    <div id="Manajemen" class="tab-content"></div>
    <div id="Pengumuman" class="tab-content"></div>
    `;
}

function openAdminTab(evt, tabName) {
    document.querySelectorAll(".tab-content").forEach(tc => tc.style.display = "none");
    document.querySelectorAll(".tab-link").forEach(tl => tl.className = tl.className.replace(" active", ""));
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";

    // Memuat konten tab saat dibuka
    if (tabName === 'Analitik') renderAdminAnalitik();
    else if (tabName === 'Absensi') renderAdminAbsensi();
    else if (tabName === 'Manajemen') renderAdminManajemen();
    else if (tabName === 'Pengumuman') renderAdminPengumuman();
}

function renderAdminAnalitik() {
    const container = document.getElementById('Analitik');
    const totalSiswa = data.users.siswas.length;
    const totalGuru = data.users.gurus.length;
    const totalAbsenHariIni = data.absensi.filter(a => a.tanggal === new Date().toISOString().slice(0, 10)).length;

    let chartHTML = `<div class="chart-container"><h5>Persentase Kehadiran per Kelas (Bulan Ini)</h5>`;
    data.kelas.forEach(k => {
        const siswaDiKelas = data.users.siswas.filter(s => s.id_kelas === k.id);
        const absenBulanIni = data.absensi.filter(a => siswaDiKelas.some(s => s.id === a.id_user) && a.status === 'masuk');
        const persentase = siswaDiKelas.length > 0 ? (absenBulanIni.length / (siswaDiKelas.length * 30)) * 100 : 0; // Asumsi 30 hari
        chartHTML += `
            <div class="chart-bar-wrapper">
                <div class="chart-label">${k.nama}</div>
                <div class="chart-bar-background">
                    <div class="chart-bar-foreground" style="width: ${Math.min(persentase, 100)}%;">${Math.round(persentase)}%</div>
                </div>
            </div>
        `;
    });
    chartHTML += `</div>`;

    container.innerHTML = `
        <div class="stats-container">
            <div class="stat-card"><h4>Total Siswa</h4><p>${totalSiswa}</p></div>
            <div class="stat-card"><h4>Total Guru</h4><p>${totalGuru}</p></div>
            <div class="stat-card"><h4>Absen Hari Ini</h4><p>${totalAbsenHariIni}</p></div>
        </div>
        ${chartHTML}
    `;
}

function renderAdminPengumuman() {
    const container = document.getElementById('Pengumuman');
    let listHTML = '<h5>Daftar Pengumuman</h5>';
    if (data.pengumuman.length === 0) {
        listHTML += '<p>Belum ada pengumuman.</p>';
    } else {
        [...data.pengumuman].reverse().forEach(p => {
            listHTML += `<div class="announcement-card">
                <div class="announcement-header"><strong>${p.judul}</strong> - <span>Oleh: ${p.oleh} (${p.tanggal})</span></div>
                <p>${p.isi}</p>
                <button class="small-btn delete" onclick="hapusPengumuman(${p.id})">Hapus</button>
            </div>`;
        });
    }

    container.innerHTML = `
        <div class="dashboard-section">
            <h4>Buat Pengumuman Baru</h4>
            <input type="text" id="pengumuman-judul" placeholder="Judul Pengumuman">
            <textarea id="pengumuman-isi" placeholder="Isi pengumuman..."></textarea>
            <button onclick="buatPengumuman()">Kirim Pengumuman</button>
        </div>
        <div class="dashboard-section">${listHTML}</div>
    `;
}

function buatPengumuman() {
    const judul = document.getElementById('pengumuman-judul').value;
    const isi = document.getElementById('pengumuman-isi').value;
    if (!judul || !isi) return alert('Judul dan isi harus diisi!');
    data.pengumuman.push({
        id: Date.now(),
        oleh: currentRole === 'admin' ? 'Admin' : currentUser.nama,
        judul, isi,
        tanggal: new Date().toISOString().slice(0, 10),
        target_kelas_id: 'semua' // Sederhana, bisa dikembangkan
    });
    alert('Pengumuman berhasil dikirim!');
    currentRole === 'admin' ? renderAdminPengumuman() : showDashboard();
}

function hapusPengumuman(id) {
    if (confirm('Yakin ingin menghapus pengumuman ini?')) {
        data.pengumuman = data.pengumuman.filter(p => p.id !== id);
        renderAdminPengumuman();
    }
}


// --- FITUR 6: UNGGAH MATERI OLEH GURU ---
function renderGuruDashboard() {
    // Menambahkan tab untuk materi dan pengumuman
    return `
    <div class="dashboard-section" id="guru-absen">
        <h4>🗓️ Absensi & Jadwal</h4><p id="info-absen-guru">Mengecek jadwal...</p>
        <button id="btn-mulai-ajar" onclick="mulaiAjar()" disabled>Mulai Ajar</button>
        <div id="container-absen-kelas" style="margin-top: 1rem;"></div>
    </div>
    <div class="dashboard-section" id="guru-tugas"><h4>📤 Manajemen Tugas</h4><div id="submission-container"></div></div>
    <div class="dashboard-section">
        <h4>📚 Unggah Materi Pembelajaran</h4>
        <select id="materi-kelas">${data.kelas.map(k => `<option value="${k.id}">${k.nama}</option>`).join("")}</select>
        <input type="text" id="materi-judul" placeholder="Judul Materi">
        <textarea id="materi-deskripsi" placeholder="Deskripsi singkat..."></textarea>
        <label>Upload File (Simulasi):</label><input type="file" id="materi-file">
        <button onclick="unggahMateri()">Unggah Materi</button>
    </div>
     <div class="dashboard-section">
        <h4>📢 Buat Pengumuman</h4>
        <input type="text" id="pengumuman-judul" placeholder="Judul Pengumuman">
        <textarea id="pengumuman-isi" placeholder="Isi pengumuman..."></textarea>
        <button onclick="buatPengumuman()">Kirim</button>
    </div>
    `;
}

function unggahMateri() {
    const id_kelas = parseInt(document.getElementById('materi-kelas').value);
    const judul = document.getElementById('materi-judul').value;
    const deskripsi = document.getElementById('materi-deskripsi').value;
    const file = document.getElementById('materi-file').files[0];
    if (!id_kelas || !judul || !deskripsi) return alert('Semua kolom harus diisi!');
    data.materi.push({
        id: Date.now(),
        id_guru: currentUser.id,
        id_kelas, judul, deskripsi,
        file: file ? file.name : 'Tidak ada file'
    });
    alert('Materi berhasil diunggah!');
    document.getElementById('materi-judul').value = '';
    document.getElementById('materi-deskripsi').value = '';
    document.getElementById('materi-file').value = '';
}


// --- TAMPILAN SISWA (PENGUMUMAN & MATERI) ---
function renderSiswaDashboard() {
    const locked = absensiHariIniSelesai ? "" : "locked-feature";
    const warning = absensiHariIniSelesai ? "" : "<p><strong>🔒 Lakukan absensi untuk membuka fitur lain.</strong></p>";
    return `
    <div class="dashboard-section" id="siswa-absen"><h4>✅ Absensi Siswa</h4><button id="btn-absen-masuk-siswa" onclick="absen('masuk')">📍 Masuk</button><button onclick="absen('izin')">📝 Izin</button><button onclick="absen('sakit')">🤒 Sakit</button></div>
    <div id="fitur-siswa-wrapper" class="${locked}">${warning}
        <div class="dashboard-section"><h4>📢 Pengumuman</h4><div id="pengumuman-container"></div></div>
        <div class="dashboard-section"><h4>📚 Materi Pembelajaran</h4><div id="materi-container"></div></div>
        <div class="dashboard-section"><h4>📚 Tugas Sekolah <span id="notif-tugas" class="notification-badge">0</span></h4><div id="daftar-tugas-container"></div></div>
    </div>`;
}

function renderSiswaFeatures() {
    // Render Pengumuman
    const pengumumanContainer = document.getElementById('pengumuman-container');
    let pengumumanHTML = '';
    if (data.pengumuman.length > 0) {
        [...data.pengumuman].reverse().forEach(p => {
            pengumumanHTML += `<div class="announcement-card">
                <div class="announcement-header"><strong>${p.judul}</strong> - <span>Oleh: ${p.oleh} (${p.tanggal})</span></div>
                <p>${p.isi}</p>
            </div>`;
        });
    } else {
        pengumumanHTML = '<p>Tidak ada pengumuman baru.</p>';
    }
    pengumumanContainer.innerHTML = pengumumanHTML;

    // Render Materi
    const materiContainer = document.getElementById('materi-container');
    const materiKelas = data.materi.filter(m => m.id_kelas === currentUser.id_kelas);
    let materiHTML = '';
    if (materiKelas.length > 0) {
        materiKelas.forEach(m => {
            materiHTML += `<div class="task-card">
                <div class="task-header"><strong>${m.judul}</strong></div>
                <p>${m.deskripsi}</p>
                <p>File: <em>${m.file}</em></p>
                <button class="small-btn" onclick="alert('Simulasi mengunduh file ${m.file}')">Unduh</button>
            </div>`;
        });
    } else {
        materiHTML = '<p>Belum ada materi yang diunggah untuk kelas ini.</p>';
    }
    materiContainer.innerHTML = materiHTML;

    // Render Tugas (fungsi yang sudah ada)
    renderDaftarTugas();
}

// =================================================================================
// BAGIAN 6: FUNGSI-FUNGSI INTI (SEDikit diubah untuk struktur tab admin)
// =================================================================================

function renderAdminAbsensi() {
    let kelasOptions = data.kelas.map(k => `<option value="${k.id}">${k.nama}</option>`).join("");
    const container = document.getElementById('Absensi');
    container.innerHTML = `
        <div class="filter-group">
            <label>Dari:</label><input type="date" id="start-date">
            <label>Sampai:</label><input type="date" id="end-date">
        </div>
        <div class="filter-group">
            <button onclick="renderRekapAbsensiGuru()">Rekap Guru</button>
            <label>atau rekap siswa:</label>
            <select id="kelas-select" onchange="renderRekapSiswa()"><option value="">-- Pilih Kelas --</option>${kelasOptions}</select>
            <button id="export-btn" onclick="exportToCSV()">🖨️ Ekspor ke CSV</button>
        </div>
        <div id="rekap-container"><p>Pilih rentang tanggal dan jenis rekap.</p></div>
    `;
}

function renderAdminManajemen() {
    const container = document.getElementById('Manajemen');
    container.innerHTML = `
        <p>Pilih data yang ingin Anda kelola.</p>
        <button onclick="renderManajemenDetail('guru')">Kelola Guru</button>
        <button onclick="renderManajemenDetail('siswa')">Kelola Siswa</button>
    `;
}
function renderManajemenDetail(tipe) { /* ... (fungsi ini sebelumnya bernama renderManajemen) ... */ }
function tambahGuru() { /* ... (fungsi ini tidak berubah) ... */ }
function hapusGuru(id) { /* ... (fungsi ini tidak berubah) ... */ }
function editGuru(id) { /* ... (fungsi ini tidak berubah) ... */ }
function tambahSiswa() { /* ... (fungsi ini tidak berubah) ... */ }
function hapusSiswa(id) { /* ... (fungsi ini tidak berubah) ... */ }
function editSiswa(id) { /* ... (fungsi ini tidak berubah) ... */ }
function exportToCSV() { /* ... (fungsi ini tidak berubah) ... */ }
function renderTugasSubmissions() { /* ... (fungsi ini tidak berubah) ... */ }
function simpanNilai(id_tugas, id_siswa) { /* ... (fungsi ini tidak berubah) ... */ }
function renderDaftarTugas() { /* ... (fungsi ini tidak berubah) ... */ }
function kirimTugas() { /* ... (fungsi ini tidak berubah) ... */ }
function submitTugas(id_tugas) { /* ... (fungsi ini tidak berubah) ... */ }
function cekJadwalMengajar() { /* ... (fungsi ini tidak berubah) ... */ }
function mulaiAjar() { /* ... (fungsi ini tidak berubah) ... */ }
function cekAbsensiSiswaHariIni() { /* ... (fungsi ini tidak berubah) ... */ }
function getFilteredAbsensi() { /* ... (fungsi ini tidak berubah) ... */ }
function renderRekapAbsensiGuru() { /* ... (fungsi ini tidak berubah) ... */ }
function renderRekapSiswa() { /* ... (fungsi ini tidak berubah) ... */ }
function absen(status, id_kelas = null) { /* ... (fungsi ini tidak berubah) ... */ }
function hitungJarak(lat1, lon1, lat2, lon2) { /* ... (fungsi ini tidak berubah) ... */ }
function changePassword() { /* ... (fungsi ini tidak berubah) ... */ }

// --- Implementasi fungsi-fungsi yang tidak berubah (hanya copy-paste) ---
function setupHalamanAwal(){const e=["Minggu: Istirahat adalah bagian dari proses.","Senin: Mulailah minggu dengan energi penuh!","Selasa: Terus belajar, terus bertumbuh.","Rabu: Jangan takut gagal, takutlah tidak mencoba.","Kamis: Optimis melihat masa depan!","Jumat: Selesaikan apa yang kamu mulai.","Sabtu: Refleksi dan siapkan hari esok."];document.getElementById("kata-harian").textContent=e[new Date().getDay()],document.getElementById("tombol-buka").addEventListener("click",()=>{window.location.href="main.html"})}
function showLogin(e){currentRole=e,showView("view-login-form"),document.querySelectorAll("#view-login-form > div").forEach(e=>e.classList.add("hidden"));const t=document.getElementById("login-title");"admin"===e?(t.textContent="Login Admin",document.getElementById("form-admin").classList.remove("hidden")):"guru"===e?(t.textContent="Login Guru",document.getElementById("form-guru").classList.remove("hidden"),populateGuruDropdown()):"siswa"===e&&(t.textContent="Login Siswa",document.getElementById("form-siswa").classList.remove("hidden"),populateKelasDropdown())}
function populateGuruDropdown(){const e=document.getElementById("guru-select-nama");e.innerHTML='<option value="">-- Pilih Nama Guru --</option>',data.users.gurus.forEach(t=>{e.innerHTML+=`<option value="${t.id}">${t.nama}</option>`})}
function populateKelasDropdown(){const e=document.getElementById("siswa-select-kelas");e.innerHTML='<option value="">-- Pilih Kelas --</option>',data.kelas.forEach(t=>{e.innerHTML+=`<option value="${t.id}">${t.nama}</option>`}),populateSiswaDropdown()}
function populateSiswaDropdown(){const e=document.getElementById("siswa-select-kelas").value,t=document.getElementById("siswa-select-nama");t.innerHTML='<option value="">-- Pilih Nama Siswa --</option>',e&&data.users.siswas.filter(t=>t.id_kelas==e).forEach(e=>{t.innerHTML+=`<option value="${e.id}">${e.nama}</option>`})}
function login(){let e=null;"admin"===currentRole?e=data.users.admins.find(e=>e.username===document.getElementById("admin-user").value&&e.password===document.getElementById("admin-pass").value):"guru"===currentRole?e=data.users.gurus.find(e=>e.id==document.getElementById("guru-select-nama").value&&e.password===document.getElementById("guru-pass").value):"siswa"===currentRole&&(e=data.users.siswas.find(e=>e.id==document.getElementById("siswa-select-nama").value&&e.password===document.getElementById("siswa-pass").value)),e?(currentUser=e,alert("Login Berhasil!"),showDashboard()):alert("Login Gagal! Periksa kembali data Anda.")}
function logout(){currentUser=null,currentRole=null,absensiHariIniSelesai=!1,showView("view-role-selection"),document.querySelectorAll("input").forEach(e=>e.value="")}
function renderManajemenDetail(tipe){const container=document.getElementById("Manajemen");let html="";if("guru"===tipe){html+=`<h4>Kelola Data Guru</h4><table class="management-table"><thead><tr><th>ID</th><th>Nama</th><th>Password</th><th>Aksi</th></tr></thead><tbody>`,data.users.gurus.forEach(g=>{html+=`<tr><td>${g.id}</td><td>${g.nama}</td><td>*****</td><td><button class="small-btn edit" onclick="editGuru(${g.id})">Edit</button><button class="small-btn delete" onclick="hapusGuru(${g.id})">Hapus</button></td></tr>`}),html+=`</tbody></table><div class="form-container"><h5>Tambah Guru Baru</h5><input type="text" id="guru-nama-baru" placeholder="Nama Guru"><input type="password" id="guru-pass-baru" placeholder="Password"><button onclick="tambahGuru()">+ Tambah Guru</button></div>`}else if("siswa"===tipe){let kelasOptions=data.kelas.map(k=>`<option value="${k.id}">${k.nama}</option>`).join("");html+=`<h4>Kelola Data Siswa</h4><table class="management-table"><thead><tr><th>ID</th><th>Nama</th><th>Kelas</th><th>Aksi</th></tr></thead><tbody>`,data.users.siswas.forEach(s=>{const kelasNama=data.kelas.find(k=>k.id===s.id_kelas)?.nama||"N/A";html+=`<tr><td>${s.id}</td><td>${s.nama}</td><td>${kelasNama}</td><td><button class="small-btn edit" onclick="editSiswa(${s.id})">Edit</button><button class="small-btn delete" onclick="hapusSiswa(${s.id})">Hapus</button></td></tr>`}),html+=`</tbody></table><div class="form-container"><h5>Tambah Siswa Baru</h5><input type="text" id="siswa-nama-baru" placeholder="Nama Siswa"><input type="password" id="siswa-pass-baru" placeholder="Password"><select id="siswa-kelas-baru">${kelasOptions}</select><button onclick="tambahSiswa()">+ Tambah Siswa</button></div>`}container.innerHTML=html+`<button class="back-button" onclick="renderAdminManajemen()">« Kembali</button>`}
function tambahGuru(){const nama=document.getElementById("guru-nama-baru").value,password=document.getElementById("guru-pass-baru").value;if(!nama||!password)return alert("Nama dan password harus diisi!");const newId=data.users.gurus.length>0?Math.max(...data.users.gurus.map(g=>g.id))+1:1;data.users.gurus.push({id:newId,nama,password,jadwal:[]}),renderManajemenDetail("guru")}
function hapusGuru(id){if(confirm(`Yakin ingin menghapus guru dengan ID ${id}?`))data.users.gurus=data.users.gurus.filter(g=>g.id!==id),renderManajemenDetail("guru")}
function editGuru(id){const guru=data.users.gurus.find(g=>g.id===id),namaBaru=prompt("Masukkan nama baru:",guru.nama),passBaru=prompt("Masukkan password baru (kosongkan jika tidak diubah):");namaBaru&&(guru.nama=namaBaru),passBaru&&(guru.password=passBaru),renderManajemenDetail("guru")}
function tambahSiswa(){const nama=document.getElementById("siswa-nama-baru").value,password=document.getElementById("siswa-pass-baru").value,id_kelas=parseInt(document.getElementById("siswa-kelas-baru").value);if(!nama||!password||!id_kelas)return alert("Semua data harus diisi!");const newId=data.users.siswas.length>0?Math.max(...data.users.siswas.map(s=>s.id))+1:101;data.users.siswas.push({id:newId,nama,password,id_kelas}),renderManajemenDetail("siswa")}
function hapusSiswa(id){if(confirm(`Yakin ingin menghapus siswa dengan ID ${id}?`))data.users.siswas=data.users.siswas.filter(s=>s.id!==id),renderManajemenDetail("siswa")}
function editSiswa(id){const siswa=data.users.siswas.find(s=>s.id===id),namaBaru=prompt("Masukkan nama baru:",siswa.nama);namaBaru&&(siswa.nama=namaBaru),renderManajemenDetail("siswa")}
function exportToCSV(){const table=document.querySelector("#rekap-container table");if(!table)return alert("Tidak ada data untuk diekspor!");let csv=[];for(let row of table.querySelectorAll("tr")){let cols=row.querySelectorAll("th, td"),rowData=Array.from(cols).map(col=>`"${col.innerText.replace(/"/g,'""')}"`);csv.push(rowData.join(","))}const csvContent="data:text/csv;charset=utf-8,"+csv.join("\n"),encodedUri=encodeURI(csvContent),link=document.createElement("a");link.setAttribute("href",encodedUri),link.setAttribute("download","rekap_absensi.csv"),document.body.appendChild(link),link.click(),document.body.removeChild(link)}
function renderTugasSubmissions(){const container=document.getElementById("submission-container"),tugasGuru=data.tugas.filter(t=>t.id_guru===currentUser.id);if(0===tugasGuru.length)return void(container.innerHTML="<p>Anda belum mengirim tugas apapun.</p>");let html="";tugasGuru.forEach(t=>{html+=`<h5>Tugas: ${t.judul} (Kelas: ${data.kelas.find(k=>k.id===t.id_kelas).nama})</h5>`,t.submissions&&t.submissions.length>0?(html+="<ul class='submission-list'>",t.submissions.forEach(sub=>{html+=`<li><strong>${sub.nama_siswa}</strong> mengumpulkan file: <em>${sub.file}</em><div class="grading-container">${null!==sub.nilai?`<p class="grade-display"><strong>Nilai: ${sub.nilai}</strong></p><p class="feedback-display"><em>Feedback: ${sub.feedback}</em></p>`:`<input type="number" id="nilai-${t.id}-${sub.id_siswa}" placeholder="Nilai (0-100)" min="0" max="100"><input type="text" id="feedback-${t.id}-${sub.id_siswa}" placeholder="Umpan Balik"><button class="small-btn" onclick="simpanNilai(${t.id}, ${sub.id_siswa})">Simpan</button>`}</div></li>`}),html+="</ul>"):html+="<p>Belum ada siswa yang mengumpulkan.</p>"}),container.innerHTML=html}
function simpanNilai(id_tugas,id_siswa){const nilai=document.getElementById(`nilai-${id_tugas}-${id_siswa}`).value,feedback=document.getElementById(`feedback-${id_tugas}-${id_siswa}`).value;if(""===nilai||nilai<0||nilai>100)return alert("Nilai harus diisi antara 0-100.");const tugas=data.tugas.find(t=>t.id===id_tugas),submission=tugas.submissions.find(s=>s.id_siswa===id_siswa);submission.nilai=parseInt(nilai),submission.feedback=feedback||"Tidak ada feedback.",alert("Nilai berhasil disimpan!"),renderTugasSubmissions()}
function renderDaftarTugas(){const container=document.getElementById("daftar-tugas-container"),notif=document.getElementById("notif-tugas"),tugasSiswa=data.tugas.filter(t=>t.id_kelas===currentUser.id_kelas);if(notif.textContent=tugasSiswa.length,0===tugasSiswa.length)return void(container.innerHTML="<p>🎉 Hore, tidak ada tugas saat ini!</p>");let html="";tugasSiswa.forEach(t=>{const submission=t.submissions?t.submissions.find(s=>s.id_siswa===currentUser.id):null;html+=`<div class="task-card"><div class="task-header"><span><strong>${t.judul}</strong> - dari ${t.nama_guru}</span><span class="task-deadline">Deadline: ${t.deadline}</span></div><p class="task-body">${t.deskripsi}</p><p>File dari guru: <em>${t.file}</em></p>${submission?`<div class="submission-status"><p style="color:green;"><strong>✔ Anda sudah mengumpulkan tugas ini.</strong></p>${null!==submission.nilai?`<p class="grade-display"><strong>Nilai Anda: ${submission.nilai}</strong></p><p class="feedback-display"><strong>Umpan Balik Guru:</strong> <em>${submission.feedback}</em></p>`:"<p>Menunggu penilaian dari guru...</p>"}</div>`:`<label>Kirim Jawaban Anda:</label><input type="file" id="submit-file-${t.id}"><button onclick="submitTugas(${t.id})">Kirim Jawaban</button>`}</div>`}),container.innerHTML=html}
function kirimTugas(){const id_kelas=parseInt(document.getElementById("tugas-kelas").value),judul=document.getElementById("tugas-judul").value,deskripsi=document.getElementById("tugas-deskripsi").value,deadline=document.getElementById("tugas-deadline").value,file=document.getElementById("tugas-file").files[0];if(!id_kelas||!judul||!deskripsi||!deadline)return alert("Harap lengkapi semua data tugas!");const tugasBaru={id:Date.now(),id_guru:currentUser.id,nama_guru:currentUser.nama,id_kelas:id_kelas,judul:judul,deskripsi:deskripsi,deadline:deadline,file:file?file.name:"Tidak ada file",submissions:[]};data.tugas.push(tugasBaru),alert(`Tugas "${judul}" berhasil dikirim!`),showDashboard()}
function submitTugas(id_tugas){const fileInput=document.getElementById(`submit-file-${id_tugas}`),file=fileInput.files[0];if(!file)return alert("Pilih file jawaban terlebih dahulu!");const tugas=data.tugas.find(t=>t.id===id_tugas);tugas&&(tugas.submissions||(tugas.submissions=[]),tugas.submissions.push({id_siswa:currentUser.id,nama_siswa:currentUser.nama,file:file.name,timestamp:(new Date).toLocaleString("id-ID"),nilai:null,feedback:""}),alert(`Jawaban untuk tugas "${tugas.judul}" berhasil dikirim!`),renderDaftarTugas())}
function cekJadwalMengajar(){const btn=document.getElementById("btn-mulai-ajar"),info=document.getElementById("info-absen-guru"),now=new Date,jadwalSekarang=currentUser.jadwal.filter(j=>j.hari===now.getDay()&&j.jam===now.getHours());jadwalSekarang.length>0?(info.textContent="Anda memiliki jadwal mengajar sekarang. Silakan tekan 'Mulai Ajar'.",btn.disabled=!1):(info.textContent="Tidak ada jadwal mengajar pada saat ini.",btn.disabled=!0)}
function mulaiAjar(){const container=document.getElementById("container-absen-kelas"),now=new Date,jadwalSekarang=currentUser.jadwal.filter(j=>j.hari===now.getDay()&&j.jam===now.getHours());if(0===jadwalSekarang.length)return void(container.innerHTML="<p>Gagal memuat sesi. Tidak ada jadwal ditemukan.</p>");let html="<h5>Pilih Kelas untuk Absen:</h5>";jadwalSekarang.forEach(sesi=>{html+=`<div class="task-card"><strong>${sesi.nama_kelas}</strong><p>Jadwal: Jam ${sesi.jam}:00</p><button onclick="absen('masuk', ${sesi.id_kelas})">✅ Absen Masuk</button></div>`}),html+='<p>Jika berhalangan hadir, silakan pilih opsi di bawah:</p><button onclick="absen(\'izin\')">📝 Izin</button><button onclick="absen(\'sakit\')">🤒 Sakit</button>',container.innerHTML=html,document.getElementById("btn-mulai-ajar").disabled=!0}
function cekAbsensiSiswaHariIni(){const today=(new Date).toISOString().slice(0,10);absensiHariIniSelesai=!!data.absensi.find(a=>a.id_user===currentUser.id&&a.tanggal===today)}
function getFilteredAbsensi(){const start=document.getElementById("start-date").value,end=document.getElementById("end-date").value;return start&&end?data.absensi.filter(a=>a.tanggal>=start&&a.tanggal<=end):data.absensi}
function renderRekapAbsensiGuru(){const container=document.getElementById("rekap-container"),absensiFiltered=getFilteredAbsensi().filter(a=>"guru"===a.role);let html="<h5>Rekap Absensi Guru</h5>";0===absensiFiltered.length?html+="<p>Tidak ada data absensi guru pada rentang tanggal ini.</p>":(html+="<table><thead><tr><th>Nama</th><th>Tanggal</th><th>Status</th><th>Keterangan</th></tr></thead><tbody>",absensiFiltered.forEach(a=>{html+=`<tr><td>${a.nama}</td><td>${a.tanggal}</td><td>${a.status}</td><td>${a.keterangan||"-"}</td></tr>`}),html+="</tbody></table>"),container.innerHTML=html}
function renderRekapSiswa(){const container=document.getElementById("rekap-container"),kelasId=document.getElementById("kelas-select").value;if(!kelasId)return void(container.innerHTML="<p>Silakan pilih kelas terlebih dahulu.</p>");const siswaDiKelas=data.users.siswas.filter(s=>s.id_kelas==kelasId),absensiFiltered=getFilteredAbsensi();let html=`<h5>Rekap Absensi ${document.getElementById("kelas-select").options[document.getElementById("kelas-select").selectedIndex].text}</h5>`;html+="<table><thead><tr><th>Nama Siswa</th><th>Masuk</th><th>Izin</th><th>Sakit</th><th>Alfa</th></tr></thead><tbody>",siswaDiKelas.forEach(siswa=>{const absensiSiswa=absensiFiltered.filter(a=>a.id_user===siswa.id),rekap={masuk:absensiSiswa.filter(a=>"masuk"===a.status).length,izin:absensiSiswa.filter(a=>"izin"===a.status).length,sakit:absensiSiswa.filter(a=>"sakit"===a.status).length,alfa:absensiSiswa.filter(a=>"alfa"===a.status).length};html+=`<tr><td>${siswa.nama}</td><td>${rekap.masuk}</td><td>${rekap.izin}</td><td>${rekap.sakit}</td><td>${rekap.alfa}</td></tr>`}),html+="</tbody></table>",container.innerHTML=html}
function absen(status,id_kelas=null){const today=(new Date).toISOString().slice(0,10);if(data.absensi.find(a=>a.id_user===currentUser.id&&a.role===currentRole&&a.tanggal===today))return alert("Anda sudah melakukan absensi hari ini.");const catatAbsensi=(keterangan="")=>{data.absensi.push({id_user:currentUser.id,role:currentRole,nama:currentUser.nama,tanggal:today,status:status,keterangan:keterangan}),alert(`Absensi '${status}' berhasil dicatat!`),"siswa"===currentRole?(absensiHariIniSelesai=!0,showDashboard()):"guru"===currentRole&&(document.getElementById("container-absen-kelas").innerHTML='<p style="color:green;"><strong>Absensi Anda telah tercatat.</strong></p>')};if("masuk"===status){let targetLokasi,btn;const radius=200;if("guru"===currentRole&&id_kelas){const kelas=data.kelas.find(k=>k.id===id_kelas);targetLokasi=kelas.lokasi}else"siswa"===currentRole&&(targetLokasi={latitude:-7.983908,longitude:112.621391},btn=document.getElementById("btn-absen-masuk-siswa"),btn.disabled=!0,btn.textContent="Mengecek Lokasi...");navigator.geolocation.getCurrentPosition(pos=>{const jarak=hitungJarak(pos.coords.latitude,pos.coords.longitude,targetLokasi.latitude,targetLokasi.longitude);jarak<=radius?catatAbsensi():alert(`Gagal! Jarak Anda dari lokasi: ${Math.round(jarak)} meter. Terlalu jauh.`),btn&&(btn.disabled=!1,btn.textContent="📍 Masuk")},()=>{alert("Tidak bisa mengakses lokasi. Pastikan GPS aktif."),btn&&(btn.disabled=!1,btn.textContent="📍 Masuk")})}else{const alasan=prompt(`Masukkan alasan Anda ${status}:`);alasan?catatAbsensi(alasan):alert("Absensi dibatalkan.")}}
function hitungJarak(lat1,lon1,lat2,lon2){const R=6371e3,φ1=lat1*Math.PI/180,φ2=lat2*Math.PI/180,Δφ=(lat2-lat1)*Math.PI/180,Δλ=(lon2-lon1)*Math.PI/180,a=Math.sin(Δφ/2)*Math.sin(Δφ/2)+Math.cos(φ1)*Math.cos(φ2)*Math.sin(Δλ/2)*Math.sin(Δλ/2);return R*(2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a)))}
function changePassword(){const oldP=document.getElementById("old-pass").value,newP=document.getElementById("new-pass").value,confirmP=document.getElementById("confirm-new-pass").value;if(!oldP||!newP||!confirmP)return alert("Semua kolom harus diisi!");if(newP!==confirmP)return alert("Password baru dan konfirmasi tidak cocok!");if(oldP!==currentUser.password)return alert("Password lama salah!");currentUser.password=newP,alert("Password berhasil diubah!"),document.getElementById("old-pass").value="",document.getElementById("new-pass").value="",document.getElementById("confirm-new-pass").value=""}

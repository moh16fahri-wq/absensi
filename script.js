// =================================================================================
// BAGIAN 1: DATABASE SIMULASI (Gabungan Terlengkap)
// =================================================================================
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
        { id: 1, nama: "Kelas 10A", lokasi: { latitude: -7.983908, longitude: 112.621391 }, backgroundData: null },
        { id: 2, nama: "Kelas 11B", lokasi: { latitude: -7.983500, longitude: 112.621800 }, backgroundData: null }
    ],
    absensi: [
        { id: 1, id_siswa: 101, tanggal: "2025-10-10", status: "Hadir" },
        { id: 2, id_siswa: 102, tanggal: "2025-10-10", status: "Izin" },
        { id: 3, id_siswa: 201, tanggal: "2025-10-11", status: "Hadir" },
    ],
    tugas: [],
    pengumuman: [],
    materi: [],
    notifikasi: [],
    jadwalPelajaran: {
        1: [
            { id: 1672531200000, hari: 1, jamMulai: '08:00', jamSelesai: '09:30', mataPelajaran: 'Matematika' },
            { id: 1672537200001, hari: 1, jamMulai: '10:00', jamSelesai: '11:30', mataPelajaran: 'Bahasa Indonesia' },
        ],
        2: [
            { id: 1672707600003, hari: 3, jamMulai: '09:00', jamSelesai: '10:30', mataPelajaran: 'Kimia' }
        ]
    },
    catatanPR: []
};

// =================================================================================
// BAGIAN 2: PENGATURAN AWAL & FUNGSI HELPER
// =================================================================================
let currentUser = null, currentRole = null, absensiHariIniSelesai = false;
let nextId = {
    tugas: 1,
    materi: 1,
    pengumuman: 1,
    notifikasi: 1,
    absensi: 4
};

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("kata-harian")) {
        fetch('https://api.quotable.io/random?tags=inspirational|technology|education')
            .then(res => res.json())
            .then(data => { document.getElementById('kata-harian').textContent = `"${data.content}" - ${data.author}`; })
            .catch(() => { document.getElementById('kata-harian').textContent = '"Pendidikan adalah senjata paling ampuh yang bisa kamu gunakan untuk mengubah dunia."'; });
        document.getElementById("tombol-buka").addEventListener("click", () => window.location.href = "main.html");
    } else if (document.getElementById("app")) {
        showView("view-role-selection");
    }
});

function showView(viewId) {
    document.querySelectorAll("#app > div").forEach(div => div.classList.add("hidden"));
    document.getElementById(viewId).classList.remove("hidden");
}

function getTodayDate() {
    return new Date().toISOString().split('T')[0];
}

// =================================================================================
// BAGIAN 3: LOGIN & LOGOUT
// =================================================================================
function showLogin(role) {
    currentRole = role;
    showView("view-login-form");
    document.querySelectorAll("#view-login-form > div").forEach(div => div.classList.add("hidden"));
    document.getElementById("login-title").textContent = `Login ${role.charAt(0).toUpperCase() + role.slice(1)}`;
    document.getElementById(`form-${role}`).classList.remove("hidden");

    if (role === 'guru') populateGuruDropdown();
    if (role === 'siswa') populateKelasDropdown();
}

function populateGuruDropdown() {
    const select = document.getElementById("guru-select-nama");
    select.innerHTML = '<option value="">-- Pilih Nama Guru --</option>' + data.users.gurus.map(g => `<option value="${g.id}">${g.nama}</option>`).join('');
}

function populateKelasDropdown() {
    const select = document.getElementById("siswa-select-kelas");
    select.innerHTML = '<option value="">-- Pilih Kelas --</option>' + data.kelas.map(k => `<option value="${k.id}">${k.nama}</option>`).join('');
    populateSiswaDropdown();
}

function populateSiswaDropdown() {
    const kelasId = document.getElementById("siswa-select-kelas").value;
    const select = document.getElementById("siswa-select-nama");
    select.innerHTML = '<option value="">-- Pilih Nama Siswa --</option>';
    if (kelasId) {
        select.innerHTML += data.users.siswas.filter(s => s.id_kelas == kelasId).map(s => `<option value="${s.id}">${s.nama}</option>`).join('');
    }
}

function login() {
    let user;
    if (currentRole === "admin") {
        user = data.users.admins.find(u => u.username === document.getElementById("admin-user").value && u.password === document.getElementById("admin-pass").value);
    } else if (currentRole === "guru") {
        user = data.users.gurus.find(u => u.id == document.getElementById("guru-select-nama").value && u.password === document.getElementById("guru-pass").value);
    } else if (currentRole === "siswa") {
        user = data.users.siswas.find(u => u.id == document.getElementById("siswa-select-nama").value && u.password === document.getElementById("siswa-pass").value);
    }

    if (user) {
        currentUser = user;
        alert("Login Berhasil!");
        if (currentRole === 'siswa') {
            const kelasSiswa = data.kelas.find(k => k.id === currentUser.id_kelas);
            if (kelasSiswa && kelasSiswa.backgroundData) {
                document.body.style.backgroundImage = `url('${kelasSiswa.backgroundData}')`;
            }
        }
        showDashboard();
    } else {
        alert("Login Gagal!");
    }
}

function logout() {
    currentUser = null;
    currentRole = null;
    absensiHariIniSelesai = false;
    document.body.style.backgroundImage = 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)';
    showView("view-role-selection");
}

// =================================================================================
// BAGIAN 4: DASHBOARD UTAMA
// =================================================================================
function showDashboard() {
    showView("view-dashboard");
    const header = document.querySelector("#view-dashboard .header");
    const content = document.getElementById("dashboard-content");

    if (!document.getElementById('notification-bell')) {
        header.innerHTML = `
            <h2 id="dashboard-title">Dashboard</h2>
            <div class="header-actions">
                <div id="notification-bell" onclick="toggleNotifDropdown()">
                    <span id="notif-badge" class="notification-badge hidden">0</span>🔔
                </div>
                <div id="notification-dropdown" class="hidden"></div>
                <button class="logout-button" onclick="logout()">Logout</button>
            </div>`;
    }

    const gantiPasswordHTML = `<div class="dashboard-section"><h4>🔑 Ganti Password</h4><input type="password" id="old-pass" placeholder="Password Lama"><input type="password" id="new-pass" placeholder="Password Baru"><button onclick="changePassword()">Simpan</button></div>`;

    if (currentRole === 'admin') {
        document.getElementById('dashboard-title').textContent = "Dashboard Admin";
        content.innerHTML = renderAdminDashboard();
        openAdminTab({ currentTarget: document.querySelector('.tab-link') }, 'Analitik');
    } else if (currentRole === 'guru') {
        document.getElementById('dashboard-title').textContent = `Selamat Datang, ${currentUser.nama}`;
        content.innerHTML = renderGuruDashboard() + gantiPasswordHTML;
    } else if (currentRole === 'siswa') {
        document.getElementById('dashboard-title').textContent = `Selamat Datang, ${currentUser.nama}`;
        cekAbsensiSiswaHariIni();
        content.innerHTML = renderSiswaDashboard() + gantiPasswordHTML;
        renderSiswaFeatures();
    }
    renderNotificationBell();
}

// =================================================================================
// BAGIAN 5: FITUR ADMIN (LENGKAP)
// =================================================================================
function renderAdminDashboard() {
    return `<div class="tabs">
        <button class="tab-link active" onclick="openAdminTab(event, 'Analitik')">📈 Analitik</button>
        <button class="tab-link" onclick="openAdminTab(event, 'Absensi')">📊 Rekap Absensi</button>
        <button class="tab-link" onclick="openAdminTab(event, 'Pengumuman')">📢 Pengumuman</button>
        <button class="tab-link" onclick="openAdminTab(event, 'Tampilan')">🎨 Tampilan</button>
    </div>
    <div id="Analitik" class="tab-content"></div>
    <div id="Absensi" class="tab-content"></div>
    <div id="Pengumuman" class="tab-content"></div>
    <div id="Tampilan" class="tab-content"></div>`;
}

function openAdminTab(evt, tabName) {
    document.querySelectorAll(".tab-content").forEach(tc => tc.style.display = "none");
    document.querySelectorAll(".tab-link").forEach(tl => tl.classList.remove("active"));
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.classList.add("active");

    if (tabName === 'Analitik') renderAdminAnalitik();
    if (tabName === 'Absensi') renderAdminAbsensi();
    if (tabName === 'Pengumuman') renderAdminPengumuman();
    if (tabName === 'Tampilan') renderAdminTampilan();
}

function renderAdminAnalitik() {
    const totalSiswa = data.users.siswas.length;
    const absensiHariIni = data.absensi.filter(a => a.tanggal === getTodayDate());
    const hadir = absensiHariIni.filter(a => a.status === 'Hadir').length;
    const izin = absensiHariIni.filter(a => a.status === 'Izin').length;
    const sakit = absensiHariIni.filter(a => a.status === 'Sakit').length;
    const alpa = totalSiswa - hadir - izin - sakit;
    document.getElementById('Analitik').innerHTML = `<div class="dashboard-section">
        <h4>Analitik Kehadiran Hari Ini (${getTodayDate()})</h4>
        <p>Total Siswa: <strong>${totalSiswa}</strong> | Hadir: <strong>${hadir}</strong> | Izin: <strong>${izin}</strong> | Sakit: <strong>${sakit}</strong> | Alpa: <strong>${alpa}</strong></p>
    </div>`;
}

function renderAdminAbsensi() {
    const container = document.getElementById('Absensi');
    const filterTanggal = document.getElementById('filter-tanggal')?.value || getTodayDate();
    let filteredAbsensi = data.absensi.filter(a => a.tanggal === filterTanggal);
    
    let tableHTML = `<div class="dashboard-section">
        <h4>Rekap Absensi</h4>
        <div class="filter-group"><input type="date" id="filter-tanggal" value="${filterTanggal}" onchange="renderAdminAbsensi()"></div>
        <table><thead><tr><th>Nama Siswa</th><th>Kelas</th><th>Status</th></tr></thead><tbody>`;
    
    filteredAbsensi.forEach(absen => {
        const siswa = data.users.siswas.find(s => s.id === absen.id_siswa);
        const kelas = data.kelas.find(k => k.id === siswa.id_kelas);
        tableHTML += `<tr><td>${siswa.nama}</td><td>${kelas.nama}</td><td>${absen.status}</td></tr>`;
    });
    container.innerHTML = tableHTML + `</tbody></table></div>`;
}

function renderAdminPengumuman() {
    const container = document.getElementById('Pengumuman');
    container.innerHTML = `<div class="dashboard-section">
        <h4>Buat Pengumuman</h4>
        <input type="text" id="judul-pengumuman" placeholder="Judul">
        <textarea id="isi-pengumuman" placeholder="Isi pengumuman..."></textarea>
        <button onclick="buatPengumuman()">Kirim</button>
        <h4>Daftar Pengumuman</h4><div id="list-pengumuman"></div>
    </div>`;
    renderDaftarPengumumanAdmin();
}

function renderDaftarPengumumanAdmin() {
    document.getElementById('list-pengumuman').innerHTML = '<table>' + data.pengumuman.map(p => `<tr><td><strong>${p.judul}</strong><br>${p.isi}</td><td><button class="small-btn delete" onclick="hapusPengumuman(${p.id})">Hapus</button></td></tr>`).join('') + '</table>';
}

function buatPengumuman() {
    const judul = document.getElementById('judul-pengumuman').value;
    const isi = document.getElementById('isi-pengumuman').value;
    if (!judul || !isi) return alert('Judul dan isi harus diisi!');
    
    data.pengumuman.push({ id: nextId.pengumuman++, judul, isi, tanggal: getTodayDate() });
    alert('Pengumuman terkirim!');
    renderAdminPengumuman();
}

function hapusPengumuman(id) {
    data.pengumuman = data.pengumuman.filter(p => p.id !== id);
    renderDaftarPengumumanAdmin();
}

function renderAdminTampilan() {
    const container = document.getElementById('Tampilan');
    let html = `<div class="dashboard-section"><h4>🎨 Kelola Latar Belakang Kelas</h4><div class="tampilan-manager">`;
    data.kelas.forEach(k => {
        html += `<div class="tampilan-item">
            <label>${k.nama}</label>
            <div class="upload-area">
                <div class="background-preview" id="preview-${k.id}" style="background-image: url('${k.backgroundData || ''}')"></div>
                <label for="bg-upload-${k.id}" class="file-label">Pilih Gambar</label>
                <input type="file" id="bg-upload-${k.id}" accept="image/*" onchange="simpanBackground(${k.id}, this)">
            </div>
        </div>`;
    });
    container.innerHTML = html + `</div></div>`;
}

function simpanBackground(id_kelas, input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
        const kelas = data.kelas.find(k => k.id === id_kelas);
        kelas.backgroundData = e.target.result;
        document.getElementById(`preview-${id_kelas}`).style.backgroundImage = `url('${e.target.result}')`;
        alert(`Latar belakang untuk ${kelas.nama} diperbarui!`);
    };
    reader.readAsDataURL(file);
}

// =================================================================================
// BAGIAN 6: FITUR GURU
// =================================================================================
function renderGuruDashboard() {
    return `<div class="dashboard-section">Fitur Guru sedang dalam pengembangan.</div>`;
}

// =================================================================================
// BAGIAN 7: FITUR SISWA
// =================================================================================
function renderSiswaDashboard() {
    const locked = absensiHariIniSelesai ? "" : "locked-feature";
    return `<div class="dashboard-section" id="siswa-absen"><h4>✅ Absensi Hari Ini</h4><button onclick="absen('Hadir')">📍 Masuk</button><button onclick="absen('Izin')">📝 Izin</button><button onclick="absen('Sakit')">🤒 Sakit</button></div>
    <div class="dashboard-section"><h4>🗓️ Jadwal & Catatan PR</h4><div id="jadwal-siswa-container"></div></div>
    <div id="fitur-siswa-wrapper" class="${locked}">
        ${!absensiHariIniSelesai ? '<p><strong>🔒 Lakukan absensi untuk membuka fitur lain.</strong></p>' : ''}
        <div class="dashboard-section"><h4>📢 Pengumuman</h4><div id="pengumuman-container"></div></div>
    </div>`;
}

function renderSiswaFeatures() {
    renderJadwalSiswa();
    renderPengumumanSiswa();
}

function cekAbsensiSiswaHariIni() {
    const sudahAbsen = data.absensi.some(a => a.id_siswa === currentUser.id && a.tanggal === getTodayDate());
    if (sudahAbsen) {
        absensiHariIniSelesai = true;
        document.getElementById("siswa-absen").innerHTML = '<h4>✅ Absensi Hari Ini</h4><p>Anda sudah melakukan absensi hari ini.</p>';
        document.getElementById('fitur-siswa-wrapper')?.classList.remove('locked-feature');
    }
}

function absen(status) {
    if (absensiHariIniSelesai) return alert('Anda sudah absen hari ini.');
    data.absensi.push({ id: nextId.absensi++, id_siswa: currentUser.id, tanggal: getTodayDate(), status });
    alert(`Absen ${status} berhasil!`);
    cekAbsensiSiswaHariIni();
    document.querySelector('#fitur-siswa-wrapper p')?.remove();
}

function renderJadwalSiswa() {
    const container = document.getElementById('jadwal-siswa-container');
    const jadwalKelas = data.jadwalPelajaran[currentUser.id_kelas] || [];
    const namaHari = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat'];
    let html = '<div class="jadwal-grid">';
    [1,2,3,4,5].forEach(hari => {
        html += `<div class="jadwal-hari"><h5>${namaHari[hari]}</h5>`;
        jadwalKelas.filter(s => s.hari === hari).forEach(sesi => {
            html += `<div class="jadwal-sesi"><strong>${sesi.mataPelajaran}</strong><br><small>${sesi.jamMulai} - ${sesi.jamSelesai}</small><textarea class="catatan-pr" placeholder="Catatan PR..."></textarea></div>`;
        });
        html += `</div>`;
    });
    container.innerHTML = html + `</div>`;
}

function renderPengumumanSiswa() {
    const container = document.getElementById('pengumuman-container');
    container.innerHTML = data.pengumuman.length === 0 ? '<p>Tidak ada pengumuman.</p>' : 
        [...data.pengumuman].reverse().map(p => `<div><h4>${p.judul}</h4><p>${p.isi}</p><small>${p.tanggal}</small></div>`).join('<hr>');
}

// =================================================================================
// BAGIAN 8: FITUR UMUM (Notifikasi, Ganti Password)
// =================================================================================
function renderNotificationBell() {
    // Implementasi Notifikasi
}

function toggleNotifDropdown() {
    // Implementasi Notifikasi
}

function changePassword(){
    // Implementasi Ganti Password
}

// =================================================================================
// BAGIAN 1: DATABASE SIMULASI (Gabungan dari kedua versi)
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
        // Menambahkan properti backgroundData dari versi kedua
        { id: 1, nama: "Kelas 10A", lokasi: { latitude: -7.983908, longitude: 112.621391 }, backgroundData: null },
        { id: 2, nama: "Kelas 11B", lokasi: { latitude: -7.983500, longitude: 112.621800 }, backgroundData: null }
    ],
    // Menggunakan struktur absensi yang lebih baik dari versi kedua
    absensi: [
        { id: 1, id_siswa: 101, tanggal: "2025-10-10", status: "Hadir" },
        { id: 2, id_siswa: 102, tanggal: "2025-10-10", status: "Izin" },
        { id: 3, id_siswa: 201, tanggal: "2025-10-11", status: "Hadir" },
        { id: 4, id_siswa: 101, tanggal: "2025-10-11", status: "Sakit" },
        { id: 5, id_siswa: 202, tanggal: "2025-10-11", status: "Alpa" }
    ],
    // Mengambil data lain dari versi pertama yang lebih lengkap
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
let nextAbsensiId = 6; // Counter untuk ID absensi baru

document.addEventListener("DOMContentLoaded", () => {
    // Logika untuk halaman index.html (mengambil kutipan dari API)
    if (document.getElementById("kata-harian")) {
        fetch('https://api.quotable.io/random?tags=inspirational|technology|education')
            .then(response => response.json())
            .then(data => {
                document.getElementById('kata-harian').textContent = `"${data.content}" - ${data.author}`;
            })
            .catch(() => {
                // Fallback jika API gagal
                document.getElementById('kata-harian').textContent = '"Pendidikan adalah senjata paling ampuh yang bisa kamu gunakan untuk mengubah dunia." - Nelson Mandela';
            });
        document.getElementById("tombol-buka").addEventListener("click", () => window.location.href = "main.html");
    }
    // Logika untuk halaman main.html
    else if (document.getElementById("app")) {
        showView("view-role-selection");
    }
});

function showView(viewId) {
    document.querySelectorAll("#app > div").forEach(div => div.classList.add("hidden"));
    document.getElementById(viewId).classList.remove("hidden");
}

// =================================================================================
// BAGIAN 3: LOGIKA LOGIN & LOGOUT
// =================================================================================
function showLogin(role) {
    currentRole = role;
    showView("view-login-form");
    document.querySelectorAll("#view-login-form > div").forEach(div => div.classList.add("hidden"));
    const title = document.getElementById("login-title");
    title.textContent = `Login ${role.charAt(0).toUpperCase() + role.slice(1)}`;
    document.getElementById(`form-${role}`).classList.remove("hidden");

    if (role === 'guru') populateGuruDropdown();
    if (role === 'siswa') populateKelasDropdown();
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
    populateSiswaDropdown(); // Panggil agar dropdown siswa juga terisi
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
        // Fitur background dari versi kedua
        if (currentRole === 'siswa') {
            const kelasSiswa = data.kelas.find(k => k.id === currentUser.id_kelas);
            if (kelasSiswa && kelasSiswa.backgroundData) {
                document.body.style.backgroundImage = `url('${kelasSiswa.backgroundData}')`;
                document.body.style.backgroundSize = 'cover';
                document.body.style.backgroundPosition = 'center';
            }
        }
        showDashboard();
    } else {
        alert("Login Gagal! Periksa kembali data Anda.");
    }
}

function logout() {
    currentUser = null;
    currentRole = null;
    absensiHariIniSelesai = false;
    // Reset background saat logout
    document.body.style.backgroundImage = 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)';
    showView("view-role-selection");
    document.querySelectorAll("input").forEach(i => i.value = "");
}

// =================================================================================
// BAGIAN 4: RENDER DASHBOARD UTAMA
// =================================================================================
function showDashboard() {
    showView("view-dashboard");
    const header = document.querySelector("#view-dashboard .header");
    const content = document.getElementById("dashboard-content");
    content.innerHTML = "";

    // Membuat header dengan lonceng notifikasi (dari versi pertama)
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

    const gantiPasswordHTML = `<div class="dashboard-section"><h4>🔑 Ganti Password</h4><input type="password" id="old-pass" placeholder="Password Lama"><input type="password" id="new-pass" placeholder="Password Baru"><input type="password" id="confirm-new-pass" placeholder="Konfirmasi"><button onclick="changePassword()">Simpan</button></div>`;

    if (currentRole === 'admin') {
        document.getElementById('dashboard-title').textContent = "Dashboard Admin";
        content.innerHTML = renderAdminDashboard();
        openAdminTab({ currentTarget: document.querySelector('.tab-link.active') }, 'Analitik');
    } else if (currentRole === 'guru') {
        document.getElementById('dashboard-title').textContent = `Selamat Datang, ${currentUser.nama}`;
        content.innerHTML = renderGuruDashboard() + gantiPasswordHTML;
        // Fungsi-fungsi guru dari versi pertama
    } else if (currentRole === 'siswa') {
        document.getElementById('dashboard-title').textContent = `Selamat Datang, ${currentUser.nama}`;
        cekAbsensiSiswaHariIni(); // Fungsi penting dari versi pertama
        content.innerHTML = renderSiswaDashboard() + gantiPasswordHTML;
        renderSiswaFeatures(); // Fungsi penting dari versi pertama
    }
    renderNotificationBell(); // Fungsi notifikasi dari versi pertama
}

// =================================================================================
// BAGIAN 5: FITUR ADMIN (Gabungan)
// =================================================================================
function renderAdminDashboard() {
    return `
    <div class="tabs">
        <button class="tab-link active" onclick="openAdminTab(event, 'Analitik')">📈 Analitik</button>
        <button class="tab-link" onclick="openAdminTab(event, 'Absensi')">📊 Rekap Absensi</button>
        <button class="tab-link" onclick="openAdminTab(event, 'Manajemen')">⚙️ Manajemen Data</button>
        <button class="tab-link" onclick="openAdminTab(event, 'JadwalPelajaran')">📚 Jadwal Pelajaran</button>
        <button class="tab-link" onclick="openAdminTab(event, 'Pengumuman')">📢 Pengumuman</button>
        <button class="tab-link" onclick="openAdminTab(event, 'Tampilan')">🎨 Tampilan</button> </div>
    <div id="Analitik" class="tab-content"></div>
    <div id="Absensi" class="tab-content"></div>
    <div id="Manajemen" class="tab-content"></div>
    <div id="JadwalPelajaran" class="tab-content"></div>
    <div id="Pengumuman" class="tab-content"></div>
    <div id="Tampilan" class="tab-content"></div> `;
}

function openAdminTab(evt, tabName) {
    document.querySelectorAll(".tab-content").forEach(tc => tc.style.display = "none");
    document.querySelectorAll(".tab-link").forEach(tl => tl.classList.remove("active"));
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.classList.add("active");

    // Memanggil fungsi render yang sesuai
    if (tabName === 'Analitik') renderAdminAnalitik();
    else if (tabName === 'Absensi') renderAdminAbsensi();
    else if (tabName === 'Manajemen') renderAdminManajemen();
    else if (tabName === 'JadwalPelajaran') renderAdminManajemenJadwal();
    else if (tabName === 'Pengumuman') renderAdminPengumuman();
    else if (tabName === 'Tampilan') renderAdminTampilan(); // Panggil fungsi render baru
}

// **[Fitur Baru]** Fungsi untuk merender tab Tampilan
function renderAdminTampilan() {
    const container = document.getElementById('Tampilan');
    let html = `
    <div class="dashboard-section">
        <h4>🎨 Kelola Latar Belakang Kelas</h4>
        <p>Pilih gambar dari komputermu untuk dijadikan latar belakang saat siswa login.</p>
        <div class="tampilan-manager">
    `;
    data.kelas.forEach(k => {
        const previewStyle = k.backgroundData ? `background-image: url('${k.backgroundData}')` : '';
        html += `
        <div class="tampilan-item">
            <label for="bg-upload-${k.id}">${k.nama}</label>
            <div class="upload-area">
                <div class="background-preview" id="preview-${k.id}" style="${previewStyle}"></div>
                <label for="bg-upload-${k.id}" class="file-label">Pilih Gambar</label>
                <input type="file" id="bg-upload-${k.id}" accept="image/*" onchange="simpanBackground(${k.id}, this)">
            </div>
        </div>
        `;
    });
    html += `</div></div>`;
    container.innerHTML = html;
}

// **[Fitur Baru]** Fungsi untuk menyimpan gambar background
function simpanBackground(id_kelas, input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        const imageData = e.target.result;
        const kelas = data.kelas.find(k => k.id === id_kelas);
        if (kelas) {
            kelas.backgroundData = imageData;
            document.getElementById(`preview-${id_kelas}`).style.backgroundImage = `url('${imageData}')`;
            alert(`Latar belakang untuk ${kelas.nama} berhasil diperbarui!`);
        }
    };
    reader.readAsDataURL(file);
}


// ... (Salin semua fungsi render admin lainnya dari script.js versi pertama, seperti renderAdminAnalitik, renderAdminAbsensi, renderAdminManajemen, renderAdminManajemenJadwal, renderAdminPengumuman, dll.)
// ... (Salin semua fungsi render guru dari script.js versi pertama)
// ... (Salin semua fungsi render siswa dan fitur-fiturnya seperti absensi, jadwal, catatan PR, tugas, materi, notifikasi dari script.js versi pertama)

// Contoh fungsi yang disalin dari versi pertama:
function renderSiswaDashboard() {
    const locked = absensiHariIniSelesai ? "" : "locked-feature";
    const warning = absensiHariIniSelesai ? "" : '<p><strong>🔒 Lakukan absensi untuk membuka fitur lain.</strong></p>';
    return `
    <div class="dashboard-section" id="siswa-absen"><h4>✅ Absensi Siswa</h4><button id="btn-absen-masuk-siswa" onclick="absen('masuk')">📍 Masuk</button><button onclick="absen('izin')">📝 Izin</button><button onclick="absen('sakit')">🤒 Sakit (Wajib Foto)</button></div>
    <div class="dashboard-section"><h4>🗓️ Jadwal & Catatan PR</h4><div id="jadwal-siswa-container">Memuat jadwal...</div></div>
    <div id="fitur-siswa-wrapper" class="${locked}">${warning}
        <div class="dashboard-section"><h4>📢 Pengumuman</h4><div id="pengumuman-container"></div></div>
        <div class="dashboard-section"><h4>📚 Materi Pembelajaran</h4><div id="materi-container"></div></div>
        <div class="dashboard-section"><h4>📚 Tugas Sekolah <span id="notif-tugas" class="notification-badge hidden">0</span></h4><div id="daftar-tugas-container"></div></div>
    </div>`;
}

function renderSiswaFeatures() {
    renderJadwalSiswa();
    renderPengumumanSiswa();
    renderMateriSiswa();
    renderDaftarTugas();
}

function renderJadwalSiswa() {
    const container = document.getElementById('jadwal-siswa-container');
    const jadwalKelas = data.jadwalPelajaran[currentUser.id_kelas] || [];
    if (jadwalKelas.length === 0) {
        container.innerHTML = '<p>Jadwal pelajaran belum diatur oleh admin.</p>';
        return;
    }
    const hariSekolah = [1, 2, 3, 4, 5]; // Senin - Jumat
    const namaHari = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat'];
    let html = '<div class="jadwal-grid">';
    hariSekolah.forEach(hari => {
        html += `<div class="jadwal-hari"><h5>${namaHari[hari]}</h5>`;
        const sesiUntukHariIni = jadwalKelas.filter(s => s.hari === hari).sort((a,b) => a.jamMulai.localeCompare(b.jamMulai));
        if (sesiUntukHariIni.length > 0) {
            sesiUntukHariIni.forEach(sesi => {
                const catatanTersimpan = data.catatanPR.find(c => c.id_siswa === currentUser.id && c.id_jadwal === sesi.id);
                html += `
                    <div class="jadwal-sesi">
                        <div><strong>${sesi.mataPelajaran}</strong></div>
                        <div><small>${sesi.jamMulai} - ${sesi.jamSelesai}</small></div>
                        <textarea class="catatan-pr" id="catatan-${sesi.id}" placeholder="Ketik catatan PR..." onblur="simpanCatatan(${sesi.id})">${catatanTersimpan ? catatanTersimpan.catatan : ''}</textarea>
                    </div>`;
            });
        } else {
            html += '<p class="sesi-kosong">Tidak ada jadwal</p>';
        }
        html += `</div>`;
    });
    html += `</div>`;
    container.innerHTML = html;
}
// Placeholder: Pastikan Anda menyalin SEMUA fungsi lain yang relevan dari file script.js
// original untuk memastikan semua fitur (analitik, rekap absensi, manajemen data, dll.) berfungsi.

// ========== APLIKASI SEKOLAH DIGITAL - LENGKAP ==========

// BAGIAN 1: DATABASE SIMULASI
const data = {
    users: {
        admins: [{ username: "admin", password: "admin123" }],
        gurus: [
            { id: 1, nama: "Budi Santoso", password: "guru1", email: "budi@sekolah.com", jadwal: [ { id_kelas: 1, hari: 4, jam: 9, nama_kelas: "Kelas 10A" }, { id_kelas: 2, hari: 4, jam: 10, nama_kelas: "Kelas 11B" } ] },
            { id: 2, nama: "Anisa Putri", password: "guru2", email: "anisa@sekolah.com", jadwal: [{ id_kelas: 2, hari: 2, jam: 10, nama_kelas: "Kelas 11B" }] }
        ],
        siswas: [
            { id: 101, nama: "Agus", password: "siswa1", id_kelas: 1, nis: "2024001" }, 
            { id: 102, nama: "Citra", password: "siswa2", id_kelas: 1, nis: "2024002" },
            { id: 201, nama: "Dewi", password: "siswa3", id_kelas: 2, nis: "2024003" }, 
            { id: 202, nama: "Eko", password: "siswa4", id_kelas: 2, nis: "2024004" }
        ]
    },
    kelas: [
        { id: 1, nama: "Kelas 10A", lokasi: { latitude: -7.983908, longitude: 112.621391 } },
        { id: 2, nama: "Kelas 11B", lokasi: { latitude: -7.983500, longitude: 112.621800 } }
    ],
    tugas: [], 
    absensi: [], 
    pengumuman: [], 
    materi: [], 
    notifikasi: [],
    jadwalPelajaran: {
        1: [
            { id: 1672531200000, hari: 1, jamMulai: '08:00', jamSelesai: '09:30', mataPelajaran: 'Matematika' },
            { id: 1672537200001, hari: 1, jamMulai: '10:00', jamSelesai: '11:30', mataPelajaran: 'Bahasa Indonesia' },
            { id: 1672621200002, hari: 2, jamMulai: '08:00', jamSelesai: '09:30', mataPelajaran: 'Fisika' }
        ],
        2: [
            { id: 1672707600003, hari: 3, jamMulai: '09:00', jamSelesai: '10:30', mataPelajaran: 'Kimia' }
        ]
    },
    catatanPR: [],
    diskusi: []
};

// VARIABEL GLOBAL
let currentUser = null;
let currentRole = null;
let absensiHariIniSelesai = false;

// INISIALISASI
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("kata-harian")) {
        setupHalamanAwal();
    } else if (document.getElementById("app")) {
        showView("view-role-selection");
    }
});

function setupHalamanAwal() {
    const quotes = ["Minggu: Istirahat.", "Senin: Mulailah!", "Selasa: Terus bertumbuh.", "Rabu: Jangan takut gagal.", "Kamis: Optimis!", "Jumat: Selesaikan.", "Sabtu: Refleksi."];
    document.getElementById("kata-harian").textContent = quotes[new Date().getDay()];
    document.getElementById("tombol-buka").addEventListener("click", () => window.location.href = "main.html");
}

function showView(viewId) {
    document.querySelectorAll("#app > div").forEach(div => div.classList.add("hidden"));
    document.getElementById(viewId).classList.remove("hidden");
}

function getNomorMinggu(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// LOGIN & LOGOUT
function showLogin(role) {
    currentRole = role;
    showView("view-login-form");
    document.querySelectorAll("#view-login-form > div").forEach(div => div.classList.add("hidden"));
    const title = document.getElementById("login-title");
    
    if (role === "admin") {
        title.textContent = "Login Admin";
        document.getElementById("form-admin").classList.remove("hidden");
    } else if (role === "guru") {
        title.textContent = "Login Guru";
        document.getElementById("form-guru").classList.remove("hidden");
        populateGuruDropdown();
    } else if (role === "siswa") {
        title.textContent = "Login Siswa";
        document.getElementById("form-siswa").classList.remove("hidden");
        populateKelasDropdown();
    }
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
        data.users.siswas.filter(s => s.id_kelas == kelasId).forEach(s => {
            select.innerHTML += `<option value="${s.id}">${s.nama}</option>`;
        });
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
        showDashboard();
    } else {
        alert("Login Gagal! Periksa kembali data Anda.");
    }
}

function logout() {
    currentUser = null;
    currentRole = null;
    absensiHariIniSelesai = false;
    showView("view-role-selection");
    document.querySelectorAll("input").forEach(i => i.value = "");
}

// PROFIL POPUP
function toggleProfilPopup() {
    const popup = document.getElementById("profil-popup");
    popup.classList.toggle("hidden");
}

function renderProfilPopup() {
    let dataProfil = '';
    if (currentRole === 'admin') {
        dataProfil = `<div class="profil-info"><p><strong>Username:</strong> ${currentUser.username}</p><p><strong>Role:</strong> Administrator</p></div>`;
    } else if (currentRole === 'guru') {
        const jumlahJadwal = currentUser.jadwal ? currentUser.jadwal.length : 0;
        dataProfil = `<div class="profil-info"><p><strong>Nama:</strong> ${currentUser.nama}</p><p><strong>Email:</strong> ${currentUser.email || '-'}</p><p><strong>ID Guru:</strong> ${currentUser.id}</p><p><strong>Jadwal Mengajar:</strong> ${jumlahJadwal} sesi</p></div>`;
    } else if (currentRole === 'siswa') {
        const namaKelas = data.kelas.find(k => k.id === currentUser.id_kelas)?.nama || '-';
        dataProfil = `<div class="profil-info"><p><strong>Nama:</strong> ${currentUser.nama}</p><p><strong>NIS:</strong> ${currentUser.nis || '-'}</p><p><strong>Kelas:</strong> ${namaKelas}</p></div>`;
    }
    return `<div class="profil-header"><div class="profil-avatar">👤</div><h4>${currentUser.nama || currentUser.username}</h4></div>${dataProfil}<div class="profil-actions"><button class="profil-btn ganti-pass-btn" onclick="showGantiPassword()">🔒 Ganti Password</button><button class="profil-btn logout-btn" onclick="logout()">🚪 Logout</button></div><div id="ganti-password-section" class="hidden"><hr><h5>Ganti Password</h5><input type="password" id="old-pass-popup" placeholder="Password Lama"><input type="password" id="new-pass-popup" placeholder="Password Baru"><input type="password" id="confirm-new-pass-popup" placeholder="Konfirmasi Password"><button onclick="changePasswordFromPopup()">Simpan Password</button></div>`;
}

function showGantiPassword() {
    document.getElementById("ganti-password-section").classList.toggle("hidden");
}

function changePasswordFromPopup() {
    const oldP = document.getElementById("old-pass-popup").value;
    const newP = document.getElementById("new-pass-popup").value;
    const confirmP = document.getElementById("confirm-new-pass-popup").value;
    if (!oldP || !newP || !confirmP) return alert("Semua kolom harus diisi!");
    if (newP !== confirmP) return alert("Password baru tidak cocok!");
    if (oldP !== currentUser.password) return alert("Password lama salah!");
    currentUser.password = newP;
    alert("Password berhasil diubah!");
    document.getElementById("old-pass-popup").value = "";
    document.getElementById("new-pass-popup").value = "";
    document.getElementById("confirm-new-pass-popup").value = "";
    document.getElementById("ganti-password-section").classList.add("hidden");
}

// DASHBOARD
function showDashboard() {
    showView("view-dashboard");
    const header = document.querySelector("#view-dashboard .header");
    const content = document.getElementById("dashboard-content");
    content.innerHTML = "";
    
    if (!document.getElementById('notification-bell')) {
        header.innerHTML = `<h2 id="dashboard-title">Dashboard</h2><div class="header-actions"><div id="notification-bell" onclick="toggleNotifDropdown()"><span id="notif-badge" class="notification-badge hidden">0</span>🔔</div><div id="notification-dropdown" class="hidden"></div><div class="profil-menu" onclick="toggleProfilPopup()"><div class="profil-icon">👤</div><span class="profil-name">${currentUser.nama || currentUser.username}</span></div><div id="profil-popup" class="hidden"></div></div>`;
    }

    if (currentRole === 'admin') {
        document.getElementById('dashboard-title').textContent = "Dashboard Admin";
        content.innerHTML = renderAdminDashboard();
        renderAdminAnalitik();
    } else if (currentRole === 'guru') {
        document.getElementById('dashboard-title').textContent = `Selamat Datang, ${currentUser.nama}`;
        content.innerHTML = renderGuruDashboard();
        cekJadwalMengajar();
        renderTugasSubmissions();
    } else if (currentRole === 'siswa') {
        document.getElementById('dashboard-title').textContent = `Selamat Datang, ${currentUser.nama}`;
        cekAbsensiSiswaHariIni();
        content.innerHTML = renderSiswaDashboard();
        renderSiswaFeatures();
    }
    
    document.getElementById('profil-popup').innerHTML = renderProfilPopup();
    renderNotificationBell();
}

function renderAdminDashboard() {
    return `<div class="tabs"><button class="tab-link active" onclick="openAdminTab(event, 'Analitik')">📈 Analitik</button><button class="tab-link" onclick="openAdminTab(event, 'Absensi')">📊 Rekap Absensi</button><button class="tab-link" onclick="openAdminTab(event, 'Manajemen')">⚙️ Manajemen Data</button><button class="tab-link" onclick="openAdminTab(event, 'JadwalGuru')">🗓️ Jadwal Guru</button><button class="tab-link" onclick="openAdminTab(event, 'JadwalPelajaran')">📚 Jadwal Pelajaran</button><button class="tab-link" onclick="openAdminTab(event, 'Pengumuman')">📢 Pengumuman</button></div><div id="Analitik" class="tab-content" style="display:block;"></div><div id="Absensi" class="tab-content"></div><div id="Manajemen" class="tab-content"></div><div id="JadwalGuru" class="tab-content"></div><div id="JadwalPelajaran" class="tab-content"></div><div id="Pengumuman" class="tab-content"></div>`;
}

function openAdminTab(evt, tabName) {
    document.querySelectorAll(".tab-content").forEach(tc => tc.style.display = "none");
    document.querySelectorAll(".tab-link").forEach(tl => tl.className = tl.className.replace(" active", ""));
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
    if (tabName === 'Analitik') renderAdminAnalitik();
    else if (tabName === 'Absensi') renderAdminAbsensi();
    else if (tabName === 'Manajemen') renderAdminManajemen();
    else if (tabName === 'JadwalGuru') renderAdminJadwal();
    else if (tabName === 'JadwalPelajaran') renderAdminManajemenJadwal();
    else if (tabName === 'Pengumuman') renderAdminPengumuman();
}

function renderGuruDashboard() {
    return `<div class="dashboard-section" id="guru-absen"><h4>🗓️ Absensi & Jadwal</h4><p id="info-absen-guru">Mengecek jadwal...</p><button id="btn-mulai-ajar" onclick="mulaiAjar()" disabled>Mulai Ajar</button><div id="container-absen-kelas" style="margin-top: 1rem;"></div></div><div class="dashboard-section" id="guru-tugas"><h4>📤 Manajemen Tugas</h4><div class="form-container"><h5>Buat Tugas Baru</h5><select id="tugas-kelas">${data.kelas.map(k => `<option value="${k.id}">${k.nama}</option>`).join("")}</select><input type="text" id="tugas-judul" placeholder="Judul Tugas"><textarea id="tugas-deskripsi" placeholder="Deskripsi tugas..."></textarea><input type="date" id="tugas-deadline"><label>Upload File (Simulasi):</label><input type="file" id="tugas-file"><button onclick="buatTugas()">Kirim Tugas</button></div><div id="submission-container"></div></div><div class="dashboard-section"><h4>📚 Unggah Materi</h4><select id="materi-kelas">${data.kelas.map(k => `<option value="${k.id}">${k.nama}</option>`).join("")}</select><input type="text" id="materi-judul" placeholder="Judul Materi"><textarea id="materi-deskripsi" placeholder="Deskripsi..."></textarea><label>Upload File (Simulasi):</label><input type="file" id="materi-file"><button onclick="unggahMateri()">Unggah</button></div><div class="dashboard-section"><h4>📢 Buat Pengumuman</h4><input type="text" id="pengumuman-judul" placeholder="Judul"><textarea id="pengumuman-isi" placeholder="Isi..."></textarea><button onclick="buatPengumuman()">Kirim</button></div>`;
}

function renderSiswaDashboard() {
    const locked = absensiHariIniSelesai ? "" : "locked-feature";
    const warning = absensiHariIniSelesai ? "" : '<p style="color: var(--danger-color); font-weight: 600;">🔒 Lakukan absensi untuk membuka fitur lain.</p>';
    return `<div class="dashboard-section" id="siswa-absen"><h4>✅ Absensi Siswa</h4><button id="btn-absen-masuk-siswa" onclick="absen('masuk')">📍 Masuk</button><button onclick="absen('izin')">📝 Izin</button><button onclick="absen('sakit')">🤒 Sakit (Wajib Foto)</button></div><div class="dashboard-section"><h4>🗓️ Jadwal & Catatan PR</h4><div id="jadwal-siswa-container">Memuat jadwal...</div></div><div id="fitur-siswa-wrapper" class="${locked}">${warning}<div class="dashboard-section"><h4>📢 Pengumuman</h4><div id="pengumuman-container"></div></div><div class="dashboard-section"><h4>📚 Materi Pembelajaran</h4><div id="materi-container"></div></div><div class="dashboard-section"><h4>📚 Tugas Sekolah <span id="notif-tugas" class="notification-badge">0</span></h4><div id="daftar-tugas-container"></div></div></div>`;
}

function renderSiswaFeatures() {
    cekDanHapusCatatanLama();
    renderJadwalSiswa();
    renderPengumumanSiswa();
    renderMateriSiswa();
    renderDaftarTugas();
}

function cekDanHapusCatatanLama() {
    const mingguSekarang = getNomorMinggu(new Date());
    data.catatanPR = data.catatanPR.filter(catatan => !(catatan.id_siswa === currentUser.id && catatan.mingguDibuat < mingguSekarang));
}

function renderJadwalSiswa() {
    const container = document.getElementById('jadwal-siswa-container');
    const jadwalKelas = data.jadwalPelajaran[currentUser.id_kelas] || [];
    if (jadwalKelas.length === 0) { container.innerHTML = '<p>Jadwal pelajaran belum diatur oleh admin.</p>'; return; }
    const hariSekolah = [1, 2, 3, 4, 5];
    const namaHari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
    let html = '<div class="jadwal-grid">';
    hariSekolah.forEach(hari => {
        html += `<div class="jadwal-hari"><h5>${namaHari[hari]}</h5>`;
        const sesiUntukHariIni = jadwalKelas.filter(s => s.hari === hari);
        if (sesiUntukHariIni.length > 0) {
            sesiUntukHariIni.forEach(sesi => {
                const catatanTersimpan = data.catatanPR.find(c => c.id_siswa === currentUser.id && c.id_jadwal === sesi.id);
                html += `<div class="jadwal-sesi"><div class="sesi-info"><strong>${sesi.mataPelajaran}</strong><span>${sesi.jamMulai} - ${sesi.jamSelesai}</span></div><textarea class="catatan-pr" id="catatan-${sesi.id}" placeholder="Ketik catatan PR..." onblur="simpanCatatan(${sesi.id})">${catatanTersimpan ? catatanTersimpan.catatan : ''}</textarea></div>`;
            });
        } else { html += '<p class="sesi-kosong">Tidak ada jadwal</p>'; }
        html += `</div>`;
    });
    html += `</div>`;
    container.innerHTML = html;
}

function simpanCatatan(id_jadwal) {
    const textarea = document.getElementById(`catatan-${id_jadwal}`);
    const catatanTeks = textarea.value.trim();
    data.catatanPR = data.catatanPR.filter(c => !(c.id_siswa === currentUser.id && c.id_jadwal === id_jadwal));
    if (catatanTeks) { data.catatanPR.push({ id_siswa: currentUser.id, id_jadwal, catatan: catatanTeks, mingguDibuat: getNomorMinggu(new Date()) }); }
    textarea.style.borderColor = 'var(--success-color)';
    setTimeout(() => { textarea.style.borderColor = 'var(--border-color)'; }, 1500);
}

// FUNGSI ABSENSI SISWA
function cekAbsensiSiswaHariIni() {
    const today = new Date().toLocaleDateString("id-ID");
    const sudahAbsen = data.absensi.some(a => a.id_siswa === currentUser.id && a.tanggal === today);
    absensiHariIniSelesai = sudahAbsen;
}

function absen(status) {
    const today = new Date().toLocaleDateString("id-ID");
    const sudahAbsen = data.absensi.some(a => a.id_siswa === currentUser.id && a.tanggal === today);
    
    if (sudahAbsen) {
        return alert("Anda sudah melakukan absensi hari ini!");
    }

    if (status === 'sakit') {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.onchange = (e) => {
            if (e.target.files[0]) {
                prosesAbsensi(status, e.target.files[0].name);
            } else {
                alert("Foto bukti wajib diupload untuk status sakit!");
            }
        };
        fileInput.click();
    } else if (status === 'masuk') {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lokasi = data.kelas.find(k => k.id === currentUser.id_kelas).lokasi;
                    const jarak = hitungJarak(position.coords.latitude, position.coords.longitude, lokasi.latitude, lokasi.longitude);
                    
                    if (jarak <= 50) {
                        prosesAbsensi(status);
                    } else {
                        alert(`Anda terlalu jauh dari lokasi kelas (${jarak.toFixed(0)}m). Maksimal 50m.`);
                    }
                },
                () => {
                    alert("Tidak dapat mengakses lokasi. Absensi masuk memerlukan GPS.");
                }
            );
        } else {
            alert("Browser tidak mendukung geolokasi.");
        }
    } else {
        prosesAbsensi(status);
    }
}

function prosesAbsensi(status, fotoNama = null) {
    const today = new Date().toLocaleDateString("id-ID");
    data.absensi.push({
        id: Date.now(),
        id_siswa: currentUser.id,
        nama_siswa: currentUser.nama,
        id_kelas: currentUser.id_kelas,
        status: status,
        tanggal: today,
        waktu: new Date().toLocaleTimeString("id-ID"),
        foto: fotoNama
    });
    
    absensiHariIniSelesai = true;
    alert(`Absensi ${status} berhasil dicatat!`);
    showDashboard();
}

function hitungJarak(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Radius bumi dalam meter
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// NOTIFIKASI
function createNotification(id_user, role, message) {
    if (currentUser && currentUser.id === id_user && currentRole === role) return;
    data.notifikasi.push({ id: Date.now(), id_user, role, message, read: false, timestamp: new Date() });
}

function renderNotificationBell() {
    const notifBadge = document.getElementById("notif-badge");
    const unreadNotifs = data.notifikasi.filter(n => (n.id_user === currentUser.id || n.id_user === "semua") && n.role === currentRole && !n.read);
    if (unreadNotifs.length > 0) {
        notifBadge.textContent = unreadNotifs.length;
        notifBadge.classList.remove("hidden");
    } else {
        notifBadge.classList.add("hidden");
    }
}

function toggleNotifDropdown() {
    const dropdown = document.getElementById("notification-dropdown");
    dropdown.classList.toggle("hidden");
    if (!dropdown.classList.contains("hidden")) renderNotifList();
}

function renderNotifList() {
    const dropdown = document.getElementById("notification-dropdown");
    const userNotifs = data.notifikasi.filter(n => (n.id_user === currentUser.id || n.id_user === "semua") && n.role === currentRole);
    if (userNotifs.length === 0) { dropdown.innerHTML = '<div class="notif-item">Tidak ada notifikasi.</div>'; return; }
    let html = "";
    [...userNotifs].reverse().forEach(n => {
        html += `<div class="notif-item ${n.read ? 'read' : ''}" onclick="markNotifAsRead(${n.id})"><p>${n.message}</p><span class="notif-time">${new Date(n.timestamp).toLocaleString("id-ID")}</span></div>`;
    });
    dropdown.innerHTML = html;
}

function markNotifAsRead(notifId) {
    const notif = data.notifikasi.find(n => n.id === notifId);
    if (notif) notif.read = true;
    renderNotificationBell();
    renderNotifList();
}

// PENGUMUMAN
function renderPengumumanSiswa() {
    const container = document.getElementById("pengumuman-container");
    if (data.pengumuman.length === 0) {
        container.innerHTML = "<p>Belum ada pengumuman.</p>";
        return;
    }
    let html = "";
    [...data.pengumuman].reverse().forEach(p => {
        html += `<div class="announcement-card"><h5>${p.judul}</h5><p>${p.isi}</p><small>oleh ${p.nama_guru} - ${p.tanggal}</small></div>`;
    });
    container.innerHTML = html;
}

function buatPengumuman() {
    const judul = document.getElementById("pengumuman-judul").value;
    const isi = document.getElementById("pengumuman-isi").value;
    if (!judul || !isi) return alert("Judul dan isi harus diisi!");
    
    data.pengumuman.push({
        id: Date.now(),
        judul,
        isi,
        nama_guru: currentUser.nama,
        tanggal: new Date().toLocaleDateString("id-ID")
    });
    
    createNotification("semua", "siswa", `Pengumuman baru: ${judul}`);
    alert("Pengumuman berhasil dibuat!");
    document.getElementById("pengumuman-judul").value = "";
    document.getElementById("pengumuman-isi").value = "";
}

// MATERI
function renderMateriSiswa() {
    const container = document.getElementById("materi-container");
    const materiKelas = data.materi.filter(m => m.id_kelas === currentUser.id_kelas);
    if (materiKelas.length === 0) {
        container.innerHTML = "<p>Belum ada materi.</p>";
        return;
    }
    let html = "";
    [...materiKelas].reverse().forEach(m => {
        html += `<div class="task-card"><h5>${m.judul}</h5><p>${m.deskripsi}</p><p>File: <em>${m.file}</em></p><small>oleh ${m.nama_guru} - ${m.tanggal}</small></div>`;
    });
    container.innerHTML = html;
}

function unggahMateri() {
    const id_kelas = parseInt(document.getElementById("materi-kelas").value);
    const judul = document.getElementById("materi-judul").value;
    const deskripsi = document.getElementById("materi-deskripsi").value;
    const file = document.getElementById("materi-file").files[0];
    
    if (!judul || !deskripsi) return alert("Judul dan deskripsi harus diisi!");
    
    data.materi.push({
        id: Date.now(),
        id_kelas,
        judul,
        deskripsi,
        file: file ? file.name : "Tidak ada file",
        nama_guru: currentUser.nama,
        tanggal: new Date().toLocaleDateString("id-ID")
    });
    
    const namaKelas = data.kelas.find(k => k.id === id_kelas).nama;
    data.users.siswas.filter(s => s.id_kelas === id_kelas).forEach(siswa => {
        createNotification(siswa.id, "siswa", `Materi baru: ${judul} (${namaKelas})`);
    });
    
    alert("Materi berhasil diunggah!");
    document.getElementById("materi-judul").value = "";
    document.getElementById("materi-deskripsi").value = "";
    document.getElementById("materi-file").value = "";
}

// TUGAS
function renderDaftarTugas() {
    const container = document.getElementById("daftar-tugas-container");
    const notif = document.getElementById("notif-tugas");
    const tugasSiswa = data.tugas.filter(t => t.id_kelas === currentUser.id_kelas);
    notif.textContent = tugasSiswa.length;
    if (tugasSiswa.length === 0) { 
        container.innerHTML = "<p>🎉 Hore, tidak ada tugas saat ini!</p>"; 
        return; 
    }
    let html = "";
    tugasSiswa.forEach(t => {
        const submission = t.submissions ? t.submissions.find(s => s.id_siswa === currentUser.id) : null;
        const submissionHTML = submission ? `<div class="submission-status"><p style="color:green;"><strong>✓ Anda sudah mengumpulkan.</strong></p>${submission.nilai !== null ? `<p class="grade-display"><strong>Nilai: ${submission.nilai}</strong></p><p class="feedback-display"><em>Feedback: ${submission.feedback}</em></p>` : `<p>Menunggu penilaian...</p>`}</div>` : `<label>Kirim Jawaban:</label><input type="file" id="submit-file-${t.id}"><button onclick="submitTugas(${t.id})">Kirim</button>`;
        html += `<div class="task-card"><div class="task-header"><span><strong>${t.judul}</strong> - ${t.nama_guru}</span><span class="task-deadline">Deadline: ${t.deadline}</span></div><p>${t.deskripsi}</p><p>File: <em>${t.file}</em></p>${submissionHTML}${renderDiskusi(t.id)}</div>`;
    });
    container.innerHTML = html;
}

function buatTugas() {
    const id_kelas = parseInt(document.getElementById("tugas-kelas").value);
    const judul = document.getElementById("tugas-judul").value;
    const deskripsi = document.getElementById("tugas-deskripsi").value;
    const deadline = document.getElementById("tugas-deadline").value;
    const file = document.getElementById("tugas-file").files[0];
    
    if (!judul || !deskripsi || !deadline) return alert("Semua field harus diisi!");
    
    const tugas = {
        id: Date.now(),
        id_kelas,
        id_guru: currentUser.id,
        nama_guru: currentUser.nama,
        judul,
        deskripsi,
        deadline: new Date(deadline).toLocaleDateString("id-ID"),
        file: file ? file.name : "Tidak ada file",
        submissions: []
    };
    
    data.tugas.push(tugas);
    
    const namaKelas = data.kelas.find(k => k.id === id_kelas).nama;
    data.users.siswas.filter(s => s.id_kelas === id_kelas).forEach(siswa => {
        createNotification(siswa.id, "siswa", `Tugas baru: ${judul} (${namaKelas})`);
    });
    
    alert("Tugas berhasil dibuat!");
    document.getElementById("tugas-judul").value = "";
    document.getElementById("tugas-deskripsi").value = "";
    document.getElementById("tugas-deadline").value = "";
    document.getElementById("tugas-file").value = "";
    renderTugasSubmissions();
}

function submitTugas(id_tugas) {
    const file = document.getElementById(`submit-file-${id_tugas}`).files[0];
    if (!file) return alert("Pilih file!");
    const tugas = data.tugas.find(t => t.id === id_tugas);
    if (tugas) {
        tugas.submissions.push({ 
            id_siswa: currentUser.id, 
            nama_siswa: currentUser.nama, 
            file: file.name, 
            timestamp: new Date().toLocaleString("id-ID"), 
            nilai: null, 
            feedback: "" 
        });
        createNotification(tugas.id_guru, "guru", `Siswa '${currentUser.nama}' mengumpulkan tugas '${tugas.judul}'.`);
        alert(`Jawaban berhasil dikirim!`);
        renderDaftarTugas();
        renderNotificationBell();
    }
}

function renderTugasSubmissions() {
    const container = document.getElementById("submission-container");
    const tugasGuru = data.tugas.filter(t => t.id_guru === currentUser.id);
    if (tugasGuru.length === 0) { 
        container.innerHTML = "<p>Anda belum mengirim tugas apapun.</p>"; 
        return; 
    }
    let html = "";
    tugasGuru.forEach(t => {
        html += `<div class="task-card"><h5>Tugas: ${t.judul} (Kelas: ${data.kelas.find(k => k.id === t.id_kelas).nama})</h5>`;
        if (t.submissions && t.submissions.length > 0) {
            html += "<ul class='submission-list'>";
            t.submissions.forEach(sub => {
                const submissionDetailHTML = `<strong>${sub.nama_siswa}</strong> mengumpulkan file: <em>${sub.file}</em><div class="grading-container">${sub.nilai !== null ? `<p class="grade-display"><strong>Nilai: ${sub.nilai}</strong></p><p class="feedback-display"><em>Feedback: ${sub.feedback}</em></p>` : `<input type="number" id="nilai-${t.id}-${sub.id_siswa}" placeholder="Nilai (0-100)"><input type="text" id="feedback-${t.id}-${sub.id_siswa}" placeholder="Umpan Balik"><button class="small-btn" onclick="simpanNilai(${t.id}, ${sub.id_siswa})">Simpan</button>`}</div>`;
                html += `<li>${submissionDetailHTML}</li>`;
            });
            html += "</ul>";
        } else { 
            html += "<p>Belum ada siswa yang mengumpulkan.</p>"; 
        }
        html += renderDiskusi(t.id) + `</div>`;
    });
    container.innerHTML = html;
}

function simpanNilai(id_tugas, id_siswa) {
    const nilai = document.getElementById(`nilai-${id_tugas}-${id_siswa}`).value;
    const feedback = document.getElementById(`feedback-${id_tugas}-${id_siswa}`).value;
    if (nilai === "" || nilai < 0 || nilai > 100) return alert("Nilai harus 0-100.");
    const tugas = data.tugas.find(t => t.id === id_tugas);
    const submission = tugas.submissions.find(s => s.id_siswa === id_siswa);
    submission.nilai = parseInt(nilai);
    submission.feedback = feedback || "Tidak ada feedback.";
    createNotification(id_siswa, "siswa", `Tugas '${tugas.judul}' Anda telah dinilai.`);
    alert("Nilai berhasil disimpan!");
    renderTugasSubmissions();
}

// DISKUSI
function renderDiskusi(id_tugas) {
    const diskusiTugas = data.diskusi.filter(d => d.id_tugas === id_tugas);
    let html = '<div class="discussion-container"><h5>💬 Diskusi</h5>';
    if (diskusiTugas.length > 0) {
        html += '<div class="discussion-messages">';
        diskusiTugas.forEach(d => {
            html += `<div class="discussion-message"><strong>${d.nama}:</strong> ${d.pesan}<br><small>${d.timestamp}</small></div>`;
        });
        html += '</div>';
    }
    html += `<div class="discussion-form"><textarea id="diskusi-${id_tugas}" placeholder="Tulis komentar..."></textarea><button onclick="kirimDiskusi(${id_tugas})">Kirim</button></div></div>`;
    return html;
}

function kirimDiskusi(id_tugas) {
    const textarea = document.getElementById(`diskusi-${id_tugas}`);
    const pesan = textarea.value.trim();
    if (!pesan) return alert("Pesan tidak boleh kosong!");
    
    data.diskusi.push({
        id: Date.now(),
        id_tugas,
        nama: currentUser.nama,
        role: currentRole,
        pesan,
        timestamp: new Date().toLocaleString("id-ID")
    });
    
    textarea.value = "";
    
    if (currentRole === 'siswa') {
        renderDaftarTugas();
    } else if (currentRole === 'guru') {
        renderTugasSubmissions();
    }
}

// JADWAL MENGAJAR GURU
function cekJadwalMengajar() {
    const infoText = document.getElementById("info-absen-guru");
    const btnMulai = document.getElementById("btn-mulai-ajar");
    
    const now = new Date();
    const hariIni = now.getDay();
    const jamSekarang = now.getHours();
    
    const jadwalHariIni = currentUser.jadwal.filter(j => j.hari === hariIni);
    
    if (jadwalHariIni.length === 0) {
        infoText.textContent = "Tidak ada jadwal mengajar hari ini.";
        return;
    }
    
    const jadwalAktif = jadwalHariIni.find(j => j.jam === jamSekarang);
    
    if (jadwalAktif) {
        infoText.innerHTML = `<strong>Jadwal Aktif:</strong> ${jadwalAktif.nama_kelas} (Jam ${jadwalAktif.jam}:00)`;
        btnMulai.disabled = false;
        btnMulai.setAttribute('data-kelas-id', jadwalAktif.id_kelas);
    } else {
        infoText.innerHTML = `<strong>Jadwal Hari Ini:</strong><br>`;
        jadwalHariIni.forEach(j => {
            infoText.innerHTML += `${j.nama_kelas} - Jam ${j.jam}:00<br>`;
        });
    }
}

function mulaiAjar() {
    const kelasId = parseInt(document.getElementById("btn-mulai-ajar").getAttribute('data-kelas-id'));
    const kelas = data.kelas.find(k => k.id === kelasId);
    
    const container = document.getElementById("container-absen-kelas");
    const siswaDiKelas = data.users.siswas.filter(s => s.id_kelas === kelasId);
    const today = new Date().toLocaleDateString("id-ID");
    
    let html = `<h5>Absensi ${kelas.nama}</h5><table><tr><th>Nama</th><th>Status</th></tr>`;
    
    siswaDiKelas.forEach(siswa => {
        const absensi = data.absensi.find(a => a.id_siswa === siswa.id && a.tanggal === today);
        const status = absensi ? absensi.status : "Belum absen";
        const statusClass = status === "masuk" ? "style='color: green;'" : status === "Belum absen" ? "style='color: red;'" : "";
        html += `<tr><td>${siswa.nama}</td><td ${statusClass}>${status}</td></tr>`;
    });
    
    html += "</table>";
    container.innerHTML = html;
}

// ADMIN FUNCTIONS
function renderAdminAnalitik() {
    const container = document.getElementById("Analitik");
    const totalSiswa = data.users.siswas.length;
    const totalGuru = data.users.gurus.length;
    const totalKelas = data.kelas.length;
    const totalTugas = data.tugas.length;
    
    const today = new Date().toLocaleDateString("id-ID");
    const absenHariIni = data.absensi.filter(a => a.tanggal === today);
    const hadir = absenHariIni.filter(a => a.status === "masuk").length;
    const izin = absenHariIni.filter(a => a.status === "izin").length;
    const sakit = absenHariIni.filter(a => a.status === "sakit").length;
    
    container.innerHTML = `
        <div class="dashboard-section">
            <h4>📊 Statistik Umum</h4>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem;">
                <div style="background: white; padding: 1rem; border-radius: 8px; text-align: center;">
                    <h3>${totalSiswa}</h3>
                    <p>Siswa</p>
                </div>
                <div style="background: white; padding: 1rem; border-radius: 8px; text-align: center;">
                    <h3>${totalGuru}</h3>
                    <p>Guru</p>
                </div>
                <div style="background: white; padding: 1rem; border-radius: 8px; text-align: center;">
                    <h3>${totalKelas}</h3>
                    <p>Kelas</p>
                </div>
                <div style="background: white; padding: 1rem; border-radius: 8px; text-align: center;">
                    <h3>${totalTugas}</h3>
                    <p>Tugas</p>
                </div>
            </div>
        </div>
        <div class="dashboard-section">
            <h4>📊 Absensi Hari Ini (${today})</h4>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
                <div style="background: white; padding: 1rem; border-radius: 8px; text-align: center;">
                    <h3 style="color: green;">${hadir}</h3>
                    <p>Hadir</p>
                </div>
                <div style="background: white; padding: 1rem; border-radius: 8px; text-align: center;">
                    <h3 style="color: orange;">${izin}</h3>
                    <p>Izin</p>
                </div>
                <div style="background: white; padding: 1rem; border-radius: 8px; text-align: center;">
                    <h3 style="color: red;">${sakit}</h3>
                    <p>Sakit</p>
                </div>
            </div>
        </div>
    `;
}

function renderAdminAbsensi() {
    const container = document.getElementById("Absensi");
    
    let html = `<div class="dashboard-section"><h4>📊 Rekap Absensi</h4>`;
    
    if (data.absensi.length === 0) {
        html += "<p>Belum ada data absensi.</p>";
    } else {
        html += `<table><tr><th>Tanggal</th><th>Nama</th><th>Kelas</th><th>Status</th><th>Waktu</th></tr>`;
        [...data.absensi].reverse().forEach(a => {
            const namaKelas = data.kelas.find(k => k.id === a.id_kelas)?.nama || "-";
            html += `<tr><td>${a.tanggal}</td><td>${a.nama_siswa}</td><td>${namaKelas}</td><td>${a.status}</td><td>${a.waktu}</td></tr>`;
        });
        html += "</table>";
    }
    
    html += "</div>";
    container.innerHTML = html;
}

function renderAdminManajemen() {
    const container = document.getElementById("Manajemen");
    container.innerHTML = `
        <div class="dashboard-section">
            <h4>👥 Manajemen Siswa</h4>
            <div class="form-container">
                <h5>Tambah Siswa Baru</h5>
                <input type="text" id="new-siswa-nama" placeholder="Nama Siswa">
                <input type="text" id="new-siswa-nis" placeholder="NIS">
                <select id="new-siswa-kelas">${data.kelas.map(k => `<option value="${k.id}">${k.nama}</option>`).join("")}</select>
                <input type="password" id="new-siswa-pass" placeholder="Password">
                <button onclick="tambahSiswa()">Tambah Siswa</button>
            </div>
            <table>
                <tr><th>ID</th><th>Nama</th><th>NIS</th><th>Kelas</th><th>Aksi</th></tr>
                ${data.users.siswas.map(s => {
                    const namaKelas = data.kelas.find(k => k.id === s.id_kelas)?.nama || "-";
                    return `<tr><td>${s.id}</td><td>${s.nama}</td><td>${s.nis}</td><td>${namaKelas}</td><td><button class="small-btn delete" onclick="hapusSiswa(${s.id})">Hapus</button></td></tr>`;
                }).join("")}
            </table>
        </div>
        <div class="dashboard-section">
            <h4>👨‍🏫 Manajemen Guru</h4>
            <table>
                <tr><th>ID</th><th>Nama</th><th>Email</th></tr>
                ${data.users.gurus.map(g => `<tr><td>${g.id}</td><td>${g.nama}</td><td>${g.email}</td></tr>`).join("")}
            </table>
        </div>
    `;
}

function tambahSiswa() {
    const nama = document.getElementById("new-siswa-nama").value;
    const nis = document.getElementById("new-siswa-nis").value;
    const id_kelas = parseInt(document.getElementById("new-siswa-kelas").value);
    const password = document.getElementById("new-siswa-pass").value;
    
    if (!nama || !nis || !password) return alert("Semua field harus diisi!");
    
    const newId = Math.max(...data.users.siswas.map(s => s.id)) + 1;
    data.users.siswas.push({ id: newId, nama, nis, id_kelas, password });
    
    alert("Siswa berhasil ditambahkan!");
    renderAdminManajemen();
}

function hapusSiswa(id) {
    if (confirm("Yakin ingin menghapus siswa ini?")) {
        data.users.siswas = data.users.siswas.filter(s => s.id !== id);
        alert("Siswa berhasil dihapus!");
        renderAdminManajemen();
    }
}

function renderAdminJadwal() {
    const container = document.getElementById("JadwalGuru");
    let html = '<div class="dashboard-section"><h4>🗓️ Jadwal Mengajar Guru</h4>';
    
    data.users.gurus.forEach(guru => {
        html += `<div class="jadwal-guru-container"><h5>${guru.nama}</h5>`;
        if (guru.jadwal && guru.jadwal.length > 0) {
            html += '<ul class="jadwal-list">';
            guru.jadwal.forEach((j, index) => {
                const namaHari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
                html += `<li class="jadwal-item"><span>${namaHari[j.hari]} - Jam ${j.jam}:00 - ${j.nama_kelas}</span><button class="small-btn delete" onclick="hapusJadwalGuru(${guru.id}, ${index})">Hapus</button></li>`;
            });
            html += '</ul>';
        } else {
            html += '<p>Belum ada jadwal.</p>';
        }
        html += `<div class="jadwal-form">
            <select id="jadwal-kelas-${guru.id}">${data.kelas.map(k => `<option value="${k.id}">${k.nama}</option>`).join("")}</select>
            <select id="jadwal-hari-${guru.id}">
                <option value="1">Senin</option>
                <option value="2">Selasa</option>
                <option value="3">Rabu</option>
                <option value="4">Kamis</option>
                <option value="5">Jumat</option>
            </select>
            <input type="number" id="jadwal-jam-${guru.id}" placeholder="Jam (0-23)" min="0" max="23">
            <button onclick="tambahJadwalGuru(${guru.id})">Tambah</button>
        </div></div>`;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

function tambahJadwalGuru(id_guru) {
    const id_kelas = parseInt(document.getElementById(`jadwal-kelas-${id_guru}`).value);
    const hari = parseInt(document.getElementById(`jadwal-hari-${id_guru}`).value);
    const jam = parseInt(document.getElementById(`jadwal-jam-${id_guru}`).value);
    
    if (isNaN(jam) || jam < 0 || jam > 23) return alert("Jam harus antara 0-23!");
    
    const guru = data.users.gurus.find(g => g.id === id_guru);
    const kelas = data.kelas.find(k => k.id === id_kelas);
    
    if (!guru.jadwal) guru.jadwal = [];
    guru.jadwal.push({ id_kelas, hari, jam, nama_kelas: kelas.nama });
    
    alert("Jadwal berhasil ditambahkan!");
    renderAdminJadwal();
}

function hapusJadwalGuru(id_guru, index) {
    const guru = data.users.gurus.find(g => g.id === id_guru);
    guru.jadwal.splice(index, 1);
    alert("Jadwal berhasil dihapus!");
    renderAdminJadwal();
}

function renderAdminManajemenJadwal() {
    const container = document.getElementById("JadwalPelajaran");
    let html = '<div class="dashboard-section"><h4>📚 Jadwal Pelajaran Per Kelas</h4>';
    
    data.kelas.forEach(kelas => {
        const jadwal = data.jadwalPelajaran[kelas.id] || [];
        html += `<div class="form-container"><h5>${kelas.nama}</h5>`;
        
        if (jadwal.length > 0) {
            const namaHari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
            html += '<table><tr><th>Hari</th><th>Jam</th><th>Mata Pelajaran</th><th>Aksi</th></tr>';
            jadwal.forEach((j, index) => {
                html += `<tr><td>${namaHari[j.hari]}</td><td>${j.jamMulai} - ${j.jamSelesai}</td><td>${j.mataPelajaran}</td><td><button class="small-btn delete" onclick="hapusJadwalPelajaran(${kelas.id}, ${index})">Hapus</button></td></tr>`;
            });
            html += '</table>';
        } else {
            html += '<p>Belum ada jadwal pelajaran.</p>';
        }
        
        html += `<h6>Tambah Jadwal Baru</h6>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
            <select id="jp-hari-${kelas.id}">
                <option value="1">Senin</option>
                <option value="2">Selasa</option>
                <option value="3">Rabu</option>
                <option value="4">Kamis</option>
                <option value="5">Jumat</option>
            </select>
            <input type="text" id="jp-mapel-${kelas.id}" placeholder="Mata Pelajaran">
            <input type="time" id="jp-mulai-${kelas.id}">
            <input type="time" id="jp-selesai-${kelas.id}">
        </div>
        <button onclick="tambahJadwalPelajaran(${kelas.id})" style="margin-top: 10px;">Tambah Jadwal</button>
        </div>`;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

function tambahJadwalPelajaran(id_kelas) {
    const hari = parseInt(document.getElementById(`jp-hari-${id_kelas}`).value);
    const mataPelajaran = document.getElementById(`jp-mapel-${id_kelas}`).value;
    const jamMulai = document.getElementById(`jp-mulai-${id_kelas}`).value;
    const jamSelesai = document.getElementById(`jp-selesai-${id_kelas}`).value;
    
    if (!mataPelajaran || !jamMulai || !jamSelesai) return alert("Semua field harus diisi!");
    
    if (!data.jadwalPelajaran[id_kelas]) data.jadwalPelajaran[id_kelas] = [];
    
    data.jadwalPelajaran[id_kelas].push({
        id: Date.now(),
        hari,
        jamMulai,
        jamSelesai,
        mataPelajaran
    });
    
    alert("Jadwal pelajaran berhasil ditambahkan!");
    renderAdminManajemenJadwal();
}

function hapusJadwalPelajaran(id_kelas, index) {
    data.jadwalPelajaran[id_kelas].splice(index, 1);
    alert("Jadwal berhasil dihapus!");
    renderAdminManajemenJadwal();
}

function renderAdminPengumuman() {
    const container = document.getElementById("Pengumuman");
    let html = `<div class="dashboard-section"><h4>📢 Kelola Pengumuman</h4>
    <div class="form-container">
        <h5>Buat Pengumuman Baru</h5>
        <input type="text" id="admin-pengumuman-judul" placeholder="Judul Pengumuman">
        <textarea id="admin-pengumuman-isi" placeholder="Isi pengumuman..."></textarea>
        <button onclick="buatPengumumanAdmin()">Kirim Pengumuman</button>
    </div>`;
    
    if (data.pengumuman.length > 0) {
        html += '<h5>Daftar Pengumuman</h5>';
        [...data.pengumuman].reverse().forEach((p, index) => {
            html += `<div class="announcement-card">
                <h5>${p.judul}</h5>
                <p>${p.isi}</p>
                <small>oleh ${p.nama_guru} - ${p.tanggal}</small>
                <button class="small-btn delete" onclick="hapusPengumuman(${data.pengumuman.length - 1 - index})">Hapus</button>
            </div>`;
        });
    } else {
        html += '<p>Belum ada pengumuman.</p>';
    }
    
    html += '</div>';
    container.innerHTML = html;
}

function buatPengumumanAdmin() {
    const judul = document.getElementById("admin-pengumuman-judul").value;
    const isi = document.getElementById("admin-pengumuman-isi").value;
    
    if (!judul || !isi) return alert("Judul dan isi harus diisi!");
    
    data.pengumuman.push({
        id: Date.now(),
        judul,
        isi,
        nama_guru: "Admin",
        tanggal: new Date().toLocaleDateString("id-ID")
    });
    
    createNotification("semua", "siswa", `Pengumuman baru: ${judul}`);
    createNotification("semua", "guru", `Pengumuman baru: ${judul}`);
    
    alert("Pengumuman berhasil dibuat!");
    document.getElementById("admin-pengumuman-judul").value = "";
    document.getElementById("admin-pengumuman-isi").value = "";
    renderAdminPengumuman();
}

function hapusPengumuman(index) {
    if (confirm("Yakin ingin menghapus pengumuman ini?")) {
        data.pengumuman.splice(index, 1);
        alert("Pengumuman berhasil dihapus!");
        renderAdminPengumuman();
    }
}

// ========== APLIKASI SEKOLAH DIGITAL - LENGKAP ==========

// BAGIAN 1: DATABASE SIMULASI
const data = {
    users: {
        admins: [{ username: "admin", password: "admin123" }],
        gurus: [
            { id: 1, nama: "Budi Santoso", password: "guru1", email: "budi@sekolah.com", jadwal: [] },
            { id: 2, nama: "Anisa Putri", password: "guru2", email: "anisa@sekolah.com", jadwal: [] }
        ],
        siswas: [
            { id: 101, nama: "Agus", password: "siswa1", id_kelas: 1, nis: "2024001" }, 
            { id: 102, nama: "Citra", password: "siswa2", id_kelas: 1, nis: "2024002" },
            { id: 201, nama: "Dewi", password: "siswa3", id_kelas: 2, nis: "2024003" }, 
            { id: 202, nama: "Eko", password: "siswa4", id_kelas: 2, nis: "2024004" }
        ]
    },
    kelas: [
        { id: 1, nama: "Kelas 10A", lokasi: { latitude: -7.983908, longitude: 112.621391 }, jarakMaksimal: 50 },
        { id: 2, nama: "Kelas 11B", lokasi: { latitude: -7.983500, longitude: 112.621800 }, jarakMaksimal: 50 }
    ],
    tugas: [], 
    absensi: [], 
    pengumuman: [], 
    materi: [], 
    notifikasi: [],
    jadwalPelajaran: {},
    catatanPR: [],
    diskusi: []
};

// VARIABEL GLOBAL
let currentUser = null;
let currentRole = null;
let absensiHariIniSelesai = false;

// FUNGSI TOGGLE PASSWORD VISIBILITY
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    
    if (input.type === "password") {
        input.type = "text";
        button.textContent = "🙈";
    } else {
        input.type = "password";
        button.textContent = "👁️";
    }
}

// INISIALISASI
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("kata-harian")) {
        setupHalamanAwal();
    } else if (document.getElementById("app")) {
        showView("view-role-selection");
    }
});

function setupHalamanAwal() {
    const quotes = [
        "Minggu: Istirahat yang berkualitas.", 
        "Senin: Mulai dengan semangat!", 
        "Selasa: Terus bertumbuh dan belajar.", 
        "Rabu: Jangan takut gagal, terus maju!", 
        "Kamis: Tetap optimis!", 
        "Jumat: Selesaikan dengan baik.", 
        "Sabtu: Waktunya refleksi diri."
    ];
    document.getElementById("kata-harian").textContent = quotes[new Date().getDay()];
    document.getElementById("tombol-buka").addEventListener("click", () => {
        window.location.href = "main.html";
    });
}

function showView(viewId) {
    document.querySelectorAll("#app > div").forEach(div => div.classList.add("hidden"));
    document.getElementById(viewId).classList.remove("hidden");
}

// ========== LOGIN & LOGOUT ==========
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
    data.users.gurus.forEach(guru => {
        select.innerHTML += `<option value="${guru.id}">${guru.nama}</option>`;
    });
}

function populateKelasDropdown() {
    const select = document.getElementById("siswa-select-kelas");
    select.innerHTML = '<option value="">-- Pilih Kelas --</option>';
    data.kelas.forEach(k => {
        select.innerHTML += `<option value="${k.id}">${k.nama}</option>`;
    });
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
        user = data.users.admins.find(u => 
            u.username === document.getElementById("admin-user").value && 
            u.password === document.getElementById("admin-pass").value
        );
    } else if (currentRole === "guru") {
        user = data.users.gurus.find(u => 
            u.id == document.getElementById("guru-select-nama").value && 
            u.password === document.getElementById("guru-pass").value
        );
    } else if (currentRole === "siswa") {
        user = data.users.siswas.find(u => 
            u.id == document.getElementById("siswa-select-nama").value && 
            u.password === document.getElementById("siswa-pass").value
        );
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

// ========== PROFIL POPUP ==========
function toggleProfilPopup() {
    const popup = document.getElementById("profil-popup");
    popup.classList.toggle("hidden");
}

function renderProfilPopup() {
    let dataProfil = '';
    if (currentRole === 'admin') {
        dataProfil = `
            <div class="profil-info">
                <p><strong>Username:</strong> ${currentUser.username}</p>
                <p><strong>Role:</strong> Administrator</p>
            </div>`;
    } else if (currentRole === 'guru') {
        const jumlahJadwal = currentUser.jadwal ? currentUser.jadwal.length : 0;
        dataProfil = `
            <div class="profil-info">
                <p><strong>Nama:</strong> ${currentUser.nama}</p>
                <p><strong>Email:</strong> ${currentUser.email || '-'}</p>
                <p><strong>ID Guru:</strong> ${currentUser.id}</p>
                <p><strong>Jadwal Mengajar:</strong> ${jumlahJadwal} sesi</p>
            </div>`;
    } else if (currentRole === 'siswa') {
        const namaKelas = data.kelas.find(k => k.id === currentUser.id_kelas)?.nama || '-';
        dataProfil = `
            <div class="profil-info">
                <p><strong>Nama:</strong> ${currentUser.nama}</p>
                <p><strong>NIS:</strong> ${currentUser.nis || '-'}</p>
                <p><strong>Kelas:</strong> ${namaKelas}</p>
            </div>`;
    }
    
    return `
        <div class="profil-header">
            <div class="profil-avatar">👤</div>
            <h4>${currentUser.nama || currentUser.username}</h4>
        </div>
        ${dataProfil}
        <div class="profil-actions">
            <button class="profil-btn ganti-pass-btn" onclick="showGantiPassword()">🔒 Ganti Password</button>
            <button class="profil-btn logout-btn" onclick="logout()">🚪 Logout</button>
        </div>
        <div id="ganti-password-section" class="hidden">
            <hr>
            <h5>Ganti Password</h5>
            <div class="password-wrapper">
                <input type="password" id="old-pass-popup" placeholder="Password Lama">
                <button type="button" class="toggle-password" onclick="togglePassword('old-pass-popup')">👁️</button>
            </div>
            <div class="password-wrapper">
                <input type="password" id="new-pass-popup" placeholder="Password Baru">
                <button type="button" class="toggle-password" onclick="togglePassword('new-pass-popup')">👁️</button>
            </div>
            <div class="password-wrapper">
                <input type="password" id="confirm-new-pass-popup" placeholder="Konfirmasi Password">
                <button type="button" class="toggle-password" onclick="togglePassword('confirm-new-pass-popup')">👁️</button>
            </div>
            <button onclick="changePasswordFromPopup()">Simpan Password</button>
        </div>`;
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

// ========== DASHBOARD ==========
function showDashboard() {
    showView("view-dashboard");
    const content = document.getElementById("dashboard-content");
    content.innerHTML = "";
    
    document.getElementById('profil-name').textContent = currentUser.nama || currentUser.username;

    if (currentRole === 'admin') {
        document.getElementById('dashboard-title').textContent = "Dashboard Admin";
        content.innerHTML = renderAdminDashboard();
        renderAdminAnalitik();
    } else if (currentRole === 'guru') {
        document.getElementById('dashboard-title').textContent = `Selamat Datang, ${currentUser.nama}`;
        content.innerHTML = renderGuruDashboard();
    } else if (currentRole === 'siswa') {
        document.getElementById('dashboard-title').textContent = `Selamat Datang, ${currentUser.nama}`;
        cekAbsensiSiswaHariIni();
        content.innerHTML = renderSiswaDashboard();
        renderSiswaFeatures();
    }
    
    document.getElementById('profil-popup').innerHTML = renderProfilPopup();
    renderNotificationBell();
}

// ========== ADMIN DASHBOARD ==========
function renderAdminDashboard() {
    return `
        <div class="tabs">
            <button class="tab-link active" onclick="openAdminTab(event, 'Analitik')">📈 Analitik</button>
            <button class="tab-link" onclick="openAdminTab(event, 'Manajemen')">👥 Siswa</button>
            <button class="tab-link" onclick="openAdminTab(event, 'ManajemenGuru')">👨‍🏫 Guru</button>
            <button class="tab-link" onclick="openAdminTab(event, 'ManajemenKelas')">🏫 Kelas</button>
            <button class="tab-link" onclick="openAdminTab(event, 'Absensi')">📊 Absensi</button>
            <button class="tab-link" onclick="openAdminTab(event, 'Pengumuman')">📢 Pengumuman</button>
        </div>
        <div id="Analitik" class="tab-content" style="display:block;"></div>
        <div id="Manajemen" class="tab-content"></div>
        <div id="ManajemenGuru" class="tab-content"></div>
        <div id="ManajemenKelas" class="tab-content"></div>
        <div id="Absensi" class="tab-content"></div>
        <div id="Pengumuman" class="tab-content"></div>
    `;
}

function openAdminTab(evt, tabName) {
    document.querySelectorAll(".tab-content").forEach(tc => tc.style.display = "none");
    document.querySelectorAll(".tab-link").forEach(tl => tl.className = tl.className.replace(" active", ""));
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
    
    if (tabName === 'Analitik') renderAdminAnalitik();
    else if (tabName === 'Manajemen') renderAdminManajemen();
    else if (tabName === 'ManajemenGuru') renderAdminManajemenGuru();
    else if (tabName === 'ManajemenKelas') renderAdminManajemenKelas();
    else if (tabName === 'Absensi') renderAdminAbsensi();
    else if (tabName === 'Pengumuman') renderAdminPengumuman();
}

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
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>${totalSiswa}</h3>
                    <p>Total Siswa</p>
                </div>
                <div class="stat-card">
                    <h3>${totalGuru}</h3>
                    <p>Total Guru</p>
                </div>
                <div class="stat-card">
                    <h3>${totalKelas}</h3>
                    <p>Total Kelas</p>
                </div>
                <div class="stat-card">
                    <h3>${totalTugas}</h3>
                    <p>Total Tugas</p>
                </div>
            </div>
        </div>
        <div class="dashboard-section">
            <h4>📊 Absensi Hari Ini (${today})</h4>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
                <div style="background: #dcfce7; padding: 1.5rem; border-radius: 12px; text-align: center;">
                    <h3 style="color: #16a34a; font-size: 2.5rem; margin: 0;">${hadir}</h3>
                    <p style="margin: 0.5rem 0 0 0; color: #16a34a; font-weight: 600;">Hadir</p>
                </div>
                <div style="background: #fed7aa; padding: 1.5rem; border-radius: 12px; text-align: center;">
                    <h3 style="color: #ea580c; font-size: 2.5rem; margin: 0;">${izin}</h3>
                    <p style="margin: 0.5rem 0 0 0; color: #ea580c; font-weight: 600;">Izin</p>
                </div>
                <div style="background: #dbeafe; padding: 1.5rem; border-radius: 12px; text-align: center;">
                    <h3 style="color: #2563eb; font-size: 2.5rem; margin: 0;">${sakit}</h3>
                    <p style="margin: 0.5rem 0 0 0; color: #2563eb; font-weight: 600;">Sakit</p>
                </div>
            </div>
        </div>
    `;
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
                <select id="new-siswa-kelas">
                    ${data.kelas.map(k => `<option value="${k.id}">${k.nama}</option>`).join("")}
                </select>
                <input type="password" id="new-siswa-pass" placeholder="Password">
                <button onclick="tambahSiswa()">Tambah Siswa</button>
            </div>
            <table>
                <tr><th>ID</th><th>Nama</th><th>NIS</th><th>Kelas</th><th>Aksi</th></tr>
                ${data.users.siswas.map(s => {
                    const namaKelas = data.kelas.find(k => k.id === s.id_kelas)?.nama || "-";
                    return `
                        <tr>
                            <td>${s.id}</td>
                            <td>${s.nama}</td>
                            <td>${s.nis}</td>
                            <td>${namaKelas}</td>
                            <td>
                                <button class="small-btn delete" onclick="hapusSiswa(${s.id})">Hapus</button>
                            </td>
                        </tr>`;
                }).join("")}
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
    
    const newId = Math.max(...data.users.siswas.map(s => s.id), 100) + 1;
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

function renderAdminManajemenGuru() {
    const container = document.getElementById("ManajemenGuru");
    container.innerHTML = `
        <div class="dashboard-section">
            <h4>👨‍🏫 Manajemen Guru</h4>
            <div class="form-container">
                <h5>Tambah Guru Baru</h5>
                <input type="text" id="new-guru-nama" placeholder="Nama Guru">
                <input type="email" id="new-guru-email" placeholder="Email">
                <input type="password" id="new-guru-pass" placeholder="Password">
                <button onclick="tambahGuru()">Tambah Guru</button>
            </div>
            <table>
                <tr><th>ID</th><th>Nama</th><th>Email</th><th>Jadwal</th><th>Aksi</th></tr>
                ${data.users.gurus.map(g => {
                    const jumlahJadwal = g.jadwal ? g.jadwal.length : 0;
                    return `
                        <tr>
                            <td>${g.id}</td>
                            <td>${g.nama}</td>
                            <td>${g.email}</td>
                            <td>${jumlahJadwal} sesi</td>
                            <td>
                                <button class="small-btn delete" onclick="hapusGuru(${g.id})">Hapus</button>
                            </td>
                        </tr>`;
                }).join("")}
            </table>
        </div>
    `;
}

function tambahGuru() {
    const nama = document.getElementById("new-guru-nama").value;
    const email = document.getElementById("new-guru-email").value;
    const password = document.getElementById("new-guru-pass").value;
    
    if (!nama || !email || !password) return alert("Semua field harus diisi!");
    
    const newId = Math.max(...data.users.gurus.map(g => g.id), 0) + 1;
    data.users.gurus.push({ 
        id: newId, 
        nama, 
        email, 
        password, 
        jadwal: [] 
    });
    
    alert("Guru berhasil ditambahkan!");
    renderAdminManajemenGuru();
}

function hapusGuru(id) {
    if (confirm("Yakin ingin menghapus guru ini? Jadwal mengajar akan ikut terhapus.")) {
        data.users.gurus = data.users.gurus.filter(g => g.id !== id);
        alert("Guru berhasil dihapus!");
        renderAdminManajemenGuru();
    }
}

function renderAdminManajemenKelas() {
    const container = document.getElementById("ManajemenKelas");
    
    let html = `
        <div class="dashboard-section">
            <h4>🏫 Manajemen Kelas & Lokasi Absensi</h4>
            <div class="form-container">
                <h5>Tambah Kelas Baru</h5>
                <input type="text" id="new-kelas-nama" placeholder="Nama Kelas (contoh: Kelas 10A)">
                
                <label><strong>📍 Lokasi GPS untuk Absensi:</strong></label>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <input type="number" id="new-kelas-lat" placeholder="Latitude" step="0.000001">
                    <input type="number" id="new-kelas-lng" placeholder="Longitude" step="0.000001">
                </div>
                <button onclick="getMyLocation()" style="background: var(--secondary-color); margin-bottom: 10px;">📍 Gunakan Lokasi Saya</button>
                
                <label><strong>📏 Jarak Maksimal Absensi (meter):</strong></label>
                <input type="number" id="new-kelas-jarak" placeholder="Contoh: 50" value="50" min="1">
                
                <button onclick="tambahKelas()">Tambah Kelas</button>
            </div>
            
            <h5>Daftar Kelas</h5>
            <table>
                <tr>
                    <th>ID</th>
                    <th>Nama Kelas</th>
                    <th>Lokasi GPS</th>
                    <th>Jarak Maks</th>
                    <th>Aksi</th>
                </tr>
    `;
    
    data.kelas.forEach(k => {
        const jarak = k.jarakMaksimal || 50;
        html += `
            <tr>
                <td>${k.id}</td>
                <td>${k.nama}</td>
                <td>${k.lokasi.latitude.toFixed(6)}, ${k.lokasi.longitude.toFixed(6)}</td>
                <td>${jarak}m</td>
                <td>
                    <button class="small-btn" onclick="editKelas(${k.id})" style="background: var(--edit-color);">✏️ Edit</button>
                    <button class="small-btn delete" onclick="hapusKelas(${k.id})">Hapus</button>
                </td>
            </tr>
        `;
    });
    
    html += `
            </table>
        </div>
    `;
    
    container.innerHTML = html;
}

function getMyLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                document.getElementById("new-kelas-lat").value = position.coords.latitude;
                document.getElementById("new-kelas-lng").value = position.coords.longitude;
                alert("Lokasi berhasil diambil!");
            },
            () => {
                alert("Tidak dapat mengakses lokasi.");
            }
        );
    } else {
        alert("Browser tidak mendukung geolokasi.");
    }
}

function tambahKelas() {
    const nama = document.getElementById("new-kelas-nama").value;
    const lat = parseFloat(document.getElementById("new-kelas-lat").value);
    const lng = parseFloat(document.getElementById("new-kelas-lng").value);
    const jarak = parseInt(document.getElementById("new-kelas-jarak").value);
    
    if (!nama) return alert("Nama kelas harus diisi!");
    if (isNaN(lat) || isNaN(lng)) return alert("Koordinat GPS harus diisi dengan benar!");
    if (isNaN(jarak) || jarak < 1) return alert("Jarak maksimal harus lebih dari 0 meter!");
    
    const newId = Math.max(...data.kelas.map(k => k.id), 0) + 1;
    data.kelas.push({
        id: newId,
        nama,
        lokasi: {
            latitude: lat,
            longitude: lng
        },
        jarakMaksimal: jarak
    });
    
    alert("Kelas berhasil ditambahkan!");
    renderAdminManajemenKelas();
}

function editKelas(id) {
    const kelas = data.kelas.find(k => k.id === id);
    if (!kelas) return;
    
    const jarak = kelas.jarakMaksimal || 50;
    
    let html = `
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px;" onclick="this.remove()">
            <div style="background: white; padding: 2rem; border-radius: 16px; max-width: 500px; width: 100%;" onclick="event.stopPropagation()">
                <h4>Edit Kelas - ${kelas.nama}</h4>
                
                <label><strong>Nama Kelas:</strong></label>
                <input type="text" id="edit-kelas-nama" value="${kelas.nama}" style="width: 100%; margin-bottom: 1rem;">
                
                <label><strong>📍 Lokasi GPS:</strong></label>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 1rem;">
                    <input type="number" id="edit-kelas-lat" value="${kelas.lokasi.latitude}" step="0.000001">
                    <input type="number" id="edit-kelas-lng" value="${kelas.lokasi.longitude}" step="0.000001">
                </div>
                
                <label><strong>📏 Jarak Maksimal (meter):</strong></label>
                <input type="number" id="edit-kelas-jarak" value="${jarak}" min="1" style="width: 100%; margin-bottom: 1rem;">
                
                <button onclick="simpanEditKelas(${id})" style="width: 100%; margin-bottom: 0.5rem; background: var(--success-color);">💾 Simpan</button>
                <button onclick="this.closest('div[style*=fixed]').remove()" style="width: 100%;">Batal</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', html);
}

function simpanEditKelas(id) {
    const kelas = data.kelas.find(k => k.id === id);
    if (!kelas) return;
    
    const nama = document.getElementById("edit-kelas-nama").value;
    const lat = parseFloat(document.getElementById("edit-kelas-lat").value);
    const lng = parseFloat(document.getElementById("edit-kelas-lng").value);
    const jarak = parseInt(document.getElementById("edit-kelas-jarak").value);
    
    if (!nama) return alert("Nama kelas harus diisi!");
    if (isNaN(lat) || isNaN(lng)) return alert("Koordinat GPS harus valid!");
    if (isNaN(jarak) || jarak < 1) return alert("Jarak maksimal harus lebih dari 0!");
    
    kelas.nama = nama;
    kelas.lokasi.latitude = lat;
    kelas.lokasi.longitude = lng;
    kelas.jarakMaksimal = jarak;
    
    alert("Kelas berhasil diperbarui!");
    document.querySelector('div[style*="position: fixed"]').remove();
    renderAdminManajemenKelas();
}

function hapusKelas(id) {
    const siswaDiKelas = data.users.siswas.filter(s => s.id_kelas === id).length;
    
    if (siswaDiKelas > 0) {
        return alert(`Tidak dapat menghapus kelas! Masih ada ${siswaDiKelas} siswa di kelas ini. Pindahkan siswa terlebih dahulu.`);
    }
    
    if (confirm("Yakin ingin menghapus kelas ini?")) {
        data.kelas = data.kelas.filter(k => k.id !== id);
        delete data.jadwalPelajaran[id];
        alert("Kelas berhasil dihapus!");
        renderAdminManajemenKelas();
    }
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

// ========== GURU DASHBOARD ==========
function renderGuruDashboard() {
    return `
        <div class="dashboard-section">
            <h4>📚 Dashboard Guru</h4>
            <p>Selamat datang di dashboard guru. Fitur lengkap akan ditambahkan segera.</p>
        </div>
    `;
}

// ========== SISWA DASHBOARD ==========
function renderSiswaDashboard() {
    const locked = absensiHariIniSelesai ? "" : "locked-feature";
    const warning = absensiHariIniSelesai ? "" : '<p style="color: var(--danger-color); font-weight: 600;">🔒 Lakukan absensi untuk membuka fitur lain.</p>';
    
    return `
        <div class="dashboard-section" id="siswa-absen">
            <h4>✅ Absensi Siswa</h4>
            <button id="btn-absen-masuk-siswa" onclick="absen('masuk')">📍 Masuk</button>
            <button onclick="absen('izin')">📝 Izin</button>
            <button onclick="absen('sakit')">🤒 Sakit (Wajib Foto)</button>
        </div>
        <div id="fitur-siswa-wrapper" class="${locked}">
            ${warning}
            <div class="dashboard-section">
                <h4>📢 Pengumuman</h4>
                <div id="pengumuman-container"></div>
            </div>
            <div class="dashboard-section">
                <h4>📚 Tugas Sekolah <span id="notif-tugas" class="notification-badge">0</span></h4>
                <div id="daftar-tugas-container"></div>
            </div>
        </div>
    `;
}

function renderSiswaFeatures() {
    renderPengumumanSiswa();
    renderDaftarTugas();
}

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
        const submissionHTML = submission 
            ? `<div class="submission-status"><p style="color:green;"><strong>✓ Anda sudah mengumpulkan.</strong></p></div>` 
            : `<label>Kirim Jawaban:</label><input type="file" id="submit-file-${t.id}"><button onclick="submitTugas(${t.id})">Kirim</button>`;
        
        html += `<div class="task-card"><div class="task-header"><span><strong>${t.judul}</strong></span><span class="task-deadline">Deadline: ${t.deadline}</span></div><p>${t.deskripsi}</p>${submissionHTML}</div>`;
    });
    container.innerHTML = html;
}

function submitTugas(id_tugas) {
    const file = document.getElementById(`submit-file-${id_tugas}`).files[0];
    if (!file) return alert("Pilih file!");
    
    const tugas = data.tugas.find(t => t.id === id_tugas);
    if (tugas) {
        if (!tugas.submissions) tugas.submissions = [];
        tugas.submissions.push({ 
            id_siswa: currentUser.id, 
            nama_siswa: currentUser.nama, 
            file: file.name, 
            timestamp: new Date().toLocaleString("id-ID")
        });
        
        alert(`Jawaban berhasil dikirim!`);
        renderDaftarTugas();
    }
}

// ========== FUNGSI ABSENSI SISWA ==========
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
                    const kelas = data.kelas.find(k => k.id === currentUser.id_kelas);
                    const lokasi = kelas.lokasi;
                    const jarakMaks = kelas.jarakMaksimal || 50;
                    const jarak = hitungJarak(
                        position.coords.latitude, 
                        position.coords.longitude, 
                        lokasi.latitude, 
                        lokasi.longitude
                    );
                    
                    if (jarak <= jarakMaks) {
                        prosesAbsensi(status);
                    } else {
                        alert(`Anda terlalu jauh dari lokasi kelas (${jarak.toFixed(0)}m). Maksimal ${jarakMaks}m.`);
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

// ========== NOTIFIKASI ==========
function createNotification(id_user, role, message) {
    if (currentUser && currentUser.id === id_user && currentRole === role) return;
    data.notifikasi.push({ 
        id: Date.now(), 
        id_user, 
        role, 
        message, 
        read: false, 
        timestamp: new Date() 
    });
}

function renderNotificationBell() {
    const notifBadge = document.getElementById("notif-badge");
    const unreadNotifs = data.notifikasi.filter(n => 
        (n.id_user === currentUser.id || n.id_user === "semua") && 
        n.role === currentRole && 
        !n.read
    );
    
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
    const userNotifs = data.notifikasi.filter(n => 
        (n.id_user === currentUser.id || n.id_user === "semua") && 
        n.role === currentRole
    );
    
    if (userNotifs.length === 0) { 
        dropdown.innerHTML = '<div class="notif-item">Tidak ada notifikasi.</div>'; 
        return; 
    }
    
    let html = "";
    [...userNotifs].reverse().forEach(n => {
        html += `<div class="notif-item ${n.read ? 'read' : ''}" onclick="markNotifAsRead(${n.id})">
            <p>${n.message}</p>
            <span class="notif-time">${new Date(n.timestamp).toLocaleString("id-ID")}</span>
        </div>`;
    });
    dropdown.innerHTML = html;
}

function markNotifAsRead(notifId) {
    const notif = data.notifikasi.find(n => n.id === notifId);
    if (notif) notif.read = true;
    renderNotificationBell();
    renderNotifList();
}

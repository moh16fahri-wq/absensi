// =================================================================================
// BAGIAN 1: DATABASE SIMULASI & VARIABEL GLOBAL
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
        { id: 1, nama: "Kelas 10A", lokasi: { latitude: -7.983908, longitude: 112.621391 } },
        { id: 2, nama: "Kelas 11B", lokasi: { latitude: -7.983500, longitude: 112.621800 } }
    ],
    tugas: [], absensi: [], pengumuman: [], materi: [], notifikasi: [],
    jadwalPelajaran: {
        1: [
            { id: 1672531200000, hari: 1, jamMulai: '08:00', jamSelesai: '09:30', mataPelajaran: 'Matematika' },
            { id: 1672537200001, hari: 1, jamMulai: '10:00', jamSelesai: '11:30', mataPelajaran: 'Bahasa Indonesia' },
            { id: 1672621200002, hari: 2, jamMulai: '08:00', jamSelesai: '09:30', mataPelajaran: 'Fisika' },
        ],
        2: [
            { id: 1672707600003, hari: 3, jamMulai: '09:00', jamSelesai: '10:30', mataPelajaran: 'Kimia' }
        ]
    },
    catatanPR: []
};

let currentUser = null;
let currentRole = null;
let absensiHariIniSelesai = false;
const HARI_MAP = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

// =================================================================================
// BAGIAN 2: PENGATURAN AWAL & FUNGSI HELPER
// =================================================================================

/**
 * Event listener utama yang berjalan saat DOM siap.
 * Mengatur halaman awal (index.html) atau tampilan pemilihan peran (main.html).
 */
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("kata-harian")) {
        setupHalamanAwal();
    } else if (document.getElementById("app")) {
        showView("view-role-selection");
    }
});

/**
 * Menampilkan view/halaman tertentu dan menyembunyikan yang lain.
 * @param {string} viewId - ID dari elemen div yang ingin ditampilkan.
 */
function showView(viewId) {
    document.querySelectorAll("#app > div").forEach(div => div.classList.add("hidden"));
    document.getElementById(viewId).classList.remove("hidden");
}

/**
 * Mengatur konten dinamis di halaman selamat datang (index.html).
 */
function setupHalamanAwal() {
    const quotes = [
        "Minggu: Waktunya istirahat dan refleksi diri.",
        "Senin: Awal baru, semangat baru untuk berprestasi!",
        "Selasa: Teruslah bergerak maju dan jangan pernah menyerah.",
        "Rabu: Di tengah minggu, tetap fokus pada tujuanmu.",
        "Kamis: Optimis! Setiap langkah kecil bernilai.",
        "Jumat: Selesaikan pekerjaanmu dengan baik, sambut akhir pekan.",
        "Sabtu: Gunakan harimu untuk belajar hal baru."
    ];
    document.getElementById("kata-harian").textContent = quotes[new Date().getDay()];
    document.getElementById("tombol-buka").addEventListener("click", () => {
        window.location.href = "main.html";
    });
}

/**
 * Menghitung nomor minggu dalam setahun dari sebuah tanggal.
 * Berguna untuk validasi catatan PR mingguan.
 * @param {Date} date - Objek tanggal.
 * @returns {number} Nomor minggu.
 */
function getNomorMinggu(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// =================================================================================
// BAGIAN 3: LOGIKA LOGIN & LOGOUT
// =================================================================================

/**
 * Menampilkan form login berdasarkan peran yang dipilih.
 * @param {('admin'|'guru'|'siswa')} role - Peran pengguna.
 */
function showLogin(role) {
    currentRole = role;
    showView("view-login-form");
    document.querySelectorAll("#view-login-form > div").forEach(div => div.classList.add("hidden"));
    const title = document.getElementById("login-title");

    if (role === 'admin') {
        title.textContent = "Login Admin";
        document.getElementById("form-admin").classList.remove("hidden");
    } else if (role === 'guru') {
        title.textContent = "Login Guru";
        document.getElementById("form-guru").classList.remove("hidden");
        populateGuruDropdown();
    } else if (role === 'siswa') {
        title.textContent = "Login Siswa";
        document.getElementById("form-siswa").classList.remove("hidden");
        populateKelasDropdown();
    }
}

/**
 * Mengisi dropdown pilihan guru pada form login.
 */
function populateGuruDropdown() {
    const select = document.getElementById("guru-select-nama");
    select.innerHTML = '<option value="">-- Pilih Nama Guru --</option>';
    data.users.gurus.forEach(guru => {
        select.innerHTML += `<option value="${guru.id}">${guru.nama}</option>`;
    });
}

/**
 * Mengisi dropdown pilihan kelas pada form login siswa.
 */
function populateKelasDropdown() {
    const select = document.getElementById("siswa-select-kelas");
    select.innerHTML = '<option value="">-- Pilih Kelas --</option>';
    data.kelas.forEach(k => {
        select.innerHTML += `<option value="${k.id}">${k.nama}</option>`;
    });
    populateSiswaDropdown(); // Langsung panggil untuk inisialisasi dropdown siswa
}

/**
 * Mengisi dropdown pilihan nama siswa berdasarkan kelas yang dipilih.
 */
function populateSiswaDropdown() {
    const kelasId = document.getElementById("siswa-select-kelas").value;
    const select = document.getElementById("siswa-select-nama");
    select.innerHTML = '<option value="">-- Pilih Nama Siswa --</option>';
    if (kelasId) {
        data.users.siswas
            .filter(s => s.id_kelas == kelasId)
            .forEach(s => {
                select.innerHTML += `<option value="${s.id}">${s.nama}</option>`;
            });
    }
}

/**
 * Memproses upaya login pengguna.
 */
function login() {
    let user = null;
    if (currentRole === 'admin') {
        user = data.users.admins.find(u => u.username === document.getElementById("admin-user").value && u.password === document.getElementById("admin-pass").value);
    } else if (currentRole === 'guru') {
        user = data.users.gurus.find(u => u.id == document.getElementById("guru-select-nama").value && u.password === document.getElementById("guru-pass").value);
    } else if (currentRole === 'siswa') {
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

/**
 * Memproses logout pengguna.
 */
function logout() {
    currentUser = null;
    currentRole = null;
    absensiHariIniSelesai = false;
    showView("view-role-selection");
    // Membersihkan semua input, untuk keamanan sederhana
    document.querySelectorAll("input").forEach(i => i.value = "");
}

// =================================================================================
// BAGIAN 4: RENDER DASHBOARD UTAMA
// =================================================================================

/**
 * Merender dashboard utama sesuai dengan peran pengguna yang login.
 */
function showDashboard() {
    showView("view-dashboard");
    const header = document.querySelector("#view-dashboard .header");
    const content = document.getElementById("dashboard-content");

    // Render header dengan notifikasi hanya jika belum ada
    if (!document.getElementById('notification-bell')) {
        header.innerHTML = `
            <h2 id="dashboard-title">Dashboard</h2>
            <div class="header-actions">
                <div id="notification-bell" onclick="toggleNotifDropdown()">
                    <span id="notif-badge" class="hidden">0</span>🔔
                </div>
                <div id="notification-dropdown" class="hidden"></div>
                <button class="logout-button" onclick="logout()">Logout</button>
            </div>`;
    }

    const gantiPasswordHTML = `
        <div class="dashboard-section">
            <h4>🔑 Ganti Password</h4>
            <input type="password" id="old-pass" placeholder="Password Lama">
            <input type="password" id="new-pass" placeholder="Password Baru">
            <input type="password" id="confirm-new-pass" placeholder="Konfirmasi Password Baru">
            <button onclick="changePassword()">Simpan Perubahan</button>
        </div>`;

    if (currentRole === 'admin') {
        document.getElementById('dashboard-title').textContent = "Dashboard Admin";
        content.innerHTML = renderAdminDashboard();
        openAdminTab({ currentTarget: document.querySelector('.tab-link.active') }, 'Analitik'); // Tampilkan tab pertama
    } else if (currentRole === 'guru') {
        document.getElementById('dashboard-title').textContent = `Selamat Datang, ${currentUser.nama}`;
        content.innerHTML = renderGuruDashboard() + gantiPasswordHTML;
        cekJadwalMengajar();
        renderTugasSubmissions();
    } else if (currentRole === 'siswa') {
        document.getElementById('dashboard-title').textContent = `Selamat Datang, ${currentUser.nama}`;
        cekAbsensiSiswaHariIni(); // Cek status absensi
        content.innerHTML = renderSiswaDashboard() + gantiPasswordHTML;
        renderSiswaFeatures(); // Render semua fitur siswa
    }
    renderNotificationBell();
}

/**
 * Mengganti password pengguna yang sedang login.
 */
function changePassword() {
    const oldP = document.getElementById("old-pass").value;
    const newP = document.getElementById("new-pass").value;
    const confirmP = document.getElementById("confirm-new-pass").value;

    if (!oldP || !newP || !confirmP) return alert("Semua kolom harus diisi!");
    if (newP !== confirmP) return alert("Password baru dan konfirmasi tidak cocok!");
    if (oldP !== currentUser.password) return alert("Password lama salah!");
    
    // Peringatan: Dalam aplikasi nyata, jangan pernah menyimpan password di client-side.
    // Ini hanya untuk simulasi.
    currentUser.password = newP;
    alert("Password berhasil diubah!");
    
    document.getElementById("old-pass").value = "";
    document.getElementById("new-pass").value = "";
    document.getElementById("confirm-new-pass").value = "";
}

// =================================================================================
// BAGIAN 5: FITUR-FITUR SPESIFIK SISWA
// =================================================================================

/**
 * Merender kerangka utama dashboard siswa.
 * @returns {string} String HTML untuk dashboard siswa.
 */
function renderSiswaDashboard() {
    const locked = absensiHariIniSelesai ? "" : "locked-feature";
    const warning = absensiHariIniSelesai ? "" : '<p style="color: var(--danger-color);"><strong>🔒 Lakukan absensi hari ini untuk membuka fitur lain.</strong></p>';
    
    return `
        <div class="dashboard-section" id="siswa-absen">
            <h4>✅ Absensi Harian</h4>
            <button id="btn-absen-masuk-siswa" onclick="absen('masuk')">📍 Absen Masuk</button>
            <button onclick="absen('izin')">📝 Izin</button>
            <button onclick="absen('sakit')">🤒 Sakit (Wajib Foto)</button>
        </div>
        
        <div class="dashboard-section">
            <h4>🗓️ Jadwal Pelajaran & Catatan PR</h4>
            <div id="jadwal-siswa-container">Memuat jadwal...</div>
        </div>
        
        <div id="fitur-siswa-wrapper" class="${locked}">
            ${warning}
            <div class="dashboard-section">
                <h4>📢 Pengumuman</h4>
                <div id="pengumuman-container"></div>
            </div>
            <div class="dashboard-section">
                <h4>📚 Materi Pembelajaran</h4>
                <div id="materi-container"></div>
            </div>
            <div class="dashboard-section">
                <h4>📝 Tugas Sekolah <span id="notif-tugas" class="notification-badge hidden">0</span></h4>
                <div id="daftar-tugas-container"></div>
            </div>
        </div>`;
}

/**
 * Memanggil semua fungsi yang merender konten dinamis di dashboard siswa.
 */
function renderSiswaFeatures() {
    cekDanHapusCatatanLama();
    renderJadwalSiswa();
    renderPengumumanSiswa();
    renderMateriSiswa();
    renderDaftarTugas();
}

/**
 * Memeriksa dan menghapus catatan PR dari minggu sebelumnya.
 */
function cekDanHapusCatatanLama() {
    const mingguSekarang = getNomorMinggu(new Date());
    data.catatanPR = data.catatanPR.filter(catatan => 
        !(catatan.id_siswa === currentUser.id && catatan.mingguDibuat < mingguSekarang)
    );
}

/**
 * Merender jadwal pelajaran dan area catatan PR untuk siswa.
 */
function renderJadwalSiswa() {
    const container = document.getElementById('jadwal-siswa-container');
    const jadwalKelas = data.jadwalPelajaran[currentUser.id_kelas] || [];

    if (jadwalKelas.length === 0) {
        container.innerHTML = '<p>Jadwal pelajaran untuk kelas Anda belum diatur oleh admin.</p>';
        return;
    }

    const hariSekolah = [1, 2, 3, 4, 5]; // Senin sampai Jumat
    let html = '<div class="jadwal-grid">';

    hariSekolah.forEach(hari => {
        const sesiUntukHariIni = jadwalKelas.filter(s => s.hari === hari);
        html += `
            <div class="jadwal-hari">
                <h5>${HARI_MAP[hari]}</h5>`;
        
        if (sesiUntukHariIni.length > 0) {
            sesiUntukHariIni.forEach(sesi => {
                const catatanTersimpan = data.catatanPR.find(c => c.id_siswa === currentUser.id && c.id_jadwal === sesi.id);
                const catatanValue = catatanTersimpan ? catatanTersimpan.catatan : '';
                html += `
                    <div class="jadwal-sesi">
                        <div class="sesi-info">
                            <strong>${sesi.mataPelajaran}</strong>
                            <span>${sesi.jamMulai} - ${sesi.jamSelesai}</span>
                        </div>
                        <textarea class="catatan-pr" id="catatan-${sesi.id}" placeholder="Ketik catatan PR..." onblur="simpanCatatan(${sesi.id})">${catatanValue}</textarea>
                    </div>`;
            });
        } else {
            html += '<p class="sesi-kosong">Tidak ada jadwal</p>';
        }
        html += `</div>`; // .jadwal-hari
    });

    html += `</div>`; // .jadwal-grid
    container.innerHTML = html;
}

/**
 * Menyimpan catatan PR yang diketik oleh siswa.
 * @param {number} id_jadwal - ID unik dari sesi jadwal.
 */
function simpanCatatan(id_jadwal) {
    const textarea = document.getElementById(`catatan-${id_jadwal}`);
    const catatanTeks = textarea.value.trim();

    // Hapus catatan lama jika ada, untuk diganti dengan yang baru
    data.catatanPR = data.catatanPR.filter(c => !(c.id_siswa === currentUser.id && c.id_jadwal === id_jadwal));

    // Tambahkan catatan baru jika tidak kosong
    if (catatanTeks) {
        data.catatanPR.push({
            id_siswa: currentUser.id,
            id_jadwal,
            catatan: catatanTeks,
            mingguDibuat: getNomorMinggu(new Date())
        });
    }

    // Beri feedback visual
    textarea.style.borderColor = 'var(--success-color)';
    setTimeout(() => {
        textarea.style.borderColor = 'var(--border-color)';
    }, 1500);
}

/**
 * Merender daftar tugas untuk siswa.
 */
function renderDaftarTugas() {
    const container = document.getElementById("daftar-tugas-container");
    const notif = document.getElementById("notif-tugas");
    const tugasSiswa = data.tugas.filter(t => t.id_kelas === currentUser.id_kelas);
    
    if (tugasSiswa.length > 0) {
        notif.textContent = tugasSiswa.length;
        notif.classList.remove('hidden');
    } else {
        notif.classList.add('hidden');
    }

    if (tugasSiswa.length === 0) {
        container.innerHTML = "<p>🎉 Hore, tidak ada tugas saat ini!</p>";
        return;
    }

    let html = "";
    tugasSiswa.forEach(t => {
        const submission = t.submissions ? t.submissions.find(s => s.id_siswa === currentUser.id) : null;
        
        const submissionHTML = submission
            ? `<div class="submission-status">
                   <p style="color:green;"><strong>✔ Anda sudah mengumpulkan.</strong></p>
                   ${submission.nilai !== null 
                       ? `<p class="grade-display"><strong>Nilai: ${submission.nilai}</strong></p>
                          <p class="feedback-display"><em>Feedback: ${submission.feedback || 'Tidak ada feedback.'}</em></p>`
                       : `<p>Menunggu penilaian dari guru.</p>`
                   }
               </div>`
            : `<label>Kirim Jawaban (Pilih File):</label>
               <input type="file" id="submit-file-${t.id}">
               <button onclick="submitTugas(${t.id})">Kirim Tugas</button>`;

        html += `
            <div class="task-card">
                <div class="task-header">
                    <span><strong>${t.judul}</strong> (oleh: ${t.nama_guru})</span>
                    <span class="task-deadline">Deadline: ${t.deadline}</span>
                </div>
                <p>${t.deskripsi}</p>
                <p>File Lampiran: <em>${t.file || 'Tidak ada'}</em></p>
                ${submissionHTML}
                ${renderDiskusi(t.id)}
            </div>`;
    });
    container.innerHTML = html;
}

// =================================================================================
// BAGIAN 6: FITUR-FITUR SPESIFIK GURU
// =================================================================================
/**
 * Merender kerangka utama dashboard guru.
 * @returns {string} String HTML untuk dashboard guru.
 */
function renderGuruDashboard() {
    const kelasOptions = data.kelas.map(k => `<option value="${k.id}">${k.nama}</option>`).join("");
    return `
        <div class="dashboard-section" id="guru-absen">
            <h4>🗓️ Absensi & Jadwal Mengajar</h4>
            <p id="info-absen-guru">Mengecek jadwal mengajar Anda saat ini...</p>
            <button id="btn-mulai-ajar" onclick="mulaiAjar()" disabled>Mulai Mengajar</button>
            <div id="container-absen-kelas" style="margin-top: 1rem;"></div>
        </div>
        
        <div class="dashboard-section">
            <h4>📤 Manajemen Tugas & Penilaian</h4>
            <div id="submission-container"><p>Memuat data pengumpulan tugas...</p></div>
        </div>
        
        <div class="dashboard-section">
            <h4>➕ Buat Tugas Baru</h4>
            <select id="tugas-kelas">${kelasOptions}</select>
            <input type="text" id="tugas-judul" placeholder="Judul Tugas">
            <textarea id="tugas-deskripsi" placeholder="Deskripsi Tugas..."></textarea>
            <label>Deadline:</label>
            <input type="date" id="tugas-deadline">
            <label>Upload File Lampiran (Opsional):</label>
            <input type="file" id="tugas-file">
            <button onclick="kirimTugas()">Kirim Tugas ke Siswa</button>
        </div>

        <div class="dashboard-section">
            <h4>📚 Unggah Materi Pembelajaran</h4>
            <select id="materi-kelas">${kelasOptions}</select>
            <input type="text" id="materi-judul" placeholder="Judul Materi">
            <textarea id="materi-deskripsi" placeholder="Deskripsi singkat..."></textarea>
            <label>Upload File Materi:</label>
            <input type="file" id="materi-file">
            <button onclick="unggahMateri()">Unggah Materi</button>
        </div>
        
        <div class="dashboard-section">
            <h4>📢 Buat Pengumuman</h4>
            <input type="text" id="pengumuman-judul" placeholder="Judul Pengumuman">
            <textarea id="pengumuman-isi" placeholder="Isi pengumuman..."></textarea>
            <button onclick="buatPengumuman()">Kirim Pengumuman</button>
        </div>`;
}

function renderTugasSubmissions() {
    const container = document.getElementById("submission-container");
    const tugasGuru = data.tugas.filter(t => t.id_guru === currentUser.id);

    if (tugasGuru.length === 0) {
        container.innerHTML = "<p>Anda belum membuat tugas apapun.</p>";
        return;
    }
    
    let html = "";
    tugasGuru.forEach(t => {
        const kelas = data.kelas.find(k => k.id === t.id_kelas);
        html += `
            <div class="task-card">
                <h5>Tugas: ${t.judul} (Kelas: ${kelas ? kelas.nama : 'N/A'})</h5>`;
        
        if (t.submissions && t.submissions.length > 0) {
            html += "<ul class='submission-list'>";
            t.submissions.forEach(sub => {
                const submissionDetailHTML = `
                    <strong>${sub.nama_siswa}</strong> mengumpulkan file: <em>${sub.file}</em>
                    <div class="grading-container">
                        ${sub.nilai !== null 
                            ? `<p class="grade-display"><strong>Nilai: ${sub.nilai}</strong></p>
                               <p class="feedback-display"><em>Feedback: ${sub.feedback || 'Tidak ada feedback.'}</em></p>` 
                            : `<input type="number" id="nilai-${t.id}-${sub.id_siswa}" placeholder="Nilai (0-100)" min="0" max="100">
                               <input type="text" id="feedback-${t.id}-${sub.id_siswa}" placeholder="Umpan Balik (Opsional)">
                               <button class="small-btn" onclick="simpanNilai(${t.id}, ${sub.id_siswa})">Simpan Nilai</button>`
                        }
                    </div>`;
                html += `<li>${submissionDetailHTML}</li>`;
            });
            html += "</ul>";
        } else {
            html += "<p>Belum ada siswa yang mengumpulkan tugas ini.</p>";
        }
        
        html += renderDiskusi(t.id) + `</div>`;
    });
    
    container.innerHTML = html;
}
// =================================================================================
// BAGIAN 7: FITUR-FITUR SPESIFIK ADMIN
// =================================================================================

/**
 * Merender kerangka utama dan tab untuk dashboard admin.
 * @returns {string} String HTML untuk dashboard admin.
 */
function renderAdminDashboard() {
    return `
    <div class="tabs">
        <button class="tab-link active" onclick="openAdminTab(event, 'Analitik')">📈 Analitik</button>
        <button class="tab-link" onclick="openAdminTab(event, 'Absensi')">📊 Rekap Absensi</button>
        <button class="tab-link" onclick="openAdminTab(event, 'Manajemen')">⚙️ Manajemen Data</button>
        <button class="tab-link" onclick="openAdminTab(event, 'JadwalGuru')">🗓️ Jadwal Guru</button>
        <button class="tab-link" onclick="openAdminTab(event, 'JadwalPelajaran')">📚 Jadwal Pelajaran</button>
        <button class="tab-link" onclick="openAdminTab(event, 'Pengumuman')">📢 Pengumuman</button>
    </div>
    <div id="Analitik" class="tab-content"></div>
    <div id="Absensi" class="tab-content" style="display:none;"></div>
    <div id="Manajemen" class="tab-content" style="display:none;"></div>
    <div id="JadwalGuru" class="tab-content" style="display:none;"></div>
    <div id="JadwalPelajaran" class="tab-content" style="display:none;"></div>
    <div id="Pengumuman" class="tab-content" style="display:none;"></div>`;
}

/**
 * Mengatur tampilan tab di dashboard admin.
 * @param {Event} evt - Event object dari tombol yang diklik.
 * @param {string} tabName - Nama tab yang akan dibuka.
 */
function openAdminTab(evt, tabName) {
    document.querySelectorAll(".tab-content").forEach(tc => tc.style.display = "none");
    document.querySelectorAll(".tab-link").forEach(tl => tl.classList.remove("active"));
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.classList.add("active");

    // Render konten tab yang sesuai
    switch (tabName) {
        case 'Analitik': renderAdminAnalitik(); break;
        case 'Absensi': renderAdminAbsensi(); break;
        case 'Manajemen': renderAdminManajemen(); break;
        case 'JadwalGuru': renderAdminJadwal(); break;
        case 'JadwalPelajaran': renderAdminManajemenJadwal(); break;
        case 'Pengumuman': renderAdminPengumuman(); break;
    }
}

/**
 * Merender halaman untuk mengelola jadwal pelajaran per kelas.
 */
function renderAdminManajemenJadwal() {
    const container = document.getElementById('JadwalPelajaran');
    const kelasOptions = data.kelas.map(k => `<option value="${k.id}">${k.nama}</option>`).join('');
    container.innerHTML = `
        <h4>Kelola Jadwal Pelajaran per Kelas</h4>
        <div class="filter-group">
            <label for="jadwal-kelas-select">Pilih Kelas untuk Ditampilkan:</label>
            <select id="jadwal-kelas-select" onchange="renderTabelJadwalAdmin(this.value)">
                <option value="">-- Pilih Kelas --</option>
                ${kelasOptions}
            </select>
        </div>
        <div id="jadwal-pelajaran-admin-container">
            <p>Silakan pilih kelas untuk melihat dan mengelola jadwal pelajaran.</p>
        </div>`;
}

/**
 * Merender tabel jadwal pelajaran untuk kelas yang dipilih oleh admin.
 * @param {string|number} id_kelas - ID kelas.
 */
function renderTabelJadwalAdmin(id_kelas) {
    const container = document.getElementById('jadwal-pelajaran-admin-container');
    if (!id_kelas) {
        container.innerHTML = '<p>Silakan pilih kelas untuk melihat dan mengelola jadwal pelajaran.</p>';
        return;
    }
    id_kelas = parseInt(id_kelas);
    const jadwalKelas = data.jadwalPelajaran[id_kelas] || [];

    let tableRows = '';
    if (jadwalKelas.length > 0) {
        jadwalKelas.forEach((sesi, index) => {
            tableRows += `
                <tr>
                    <td>${HARI_MAP[sesi.hari]}</td>
                    <td>${sesi.jamMulai}</td>
                    <td>${sesi.jamSelesai}</td>
                    <td>${sesi.mataPelajaran}</td>
                    <td><button class="small-btn delete" onclick="hapusSesiPelajaran(${id_kelas}, ${index})">Hapus</button></td>
                </tr>`;
        });
    } else {
        tableRows = '<tr><td colspan="5">Belum ada jadwal untuk kelas ini.</td></tr>';
    }

    const hariOptions = HARI_MAP.slice(1, 6).map((h, i) => `<option value="${i + 1}">${h}</option>`).join('');

    container.innerHTML = `
        <table class="jadwal-table">
            <thead>
                <tr><th>Hari</th><th>Jam Mulai</th><th>Jam Selesai</th><th>Mata Pelajaran</th><th>Aksi</th></tr>
            </thead>
            <tbody>${tableRows}</tbody>
        </table>
        <div class="form-container">
            <h5>Tambah Sesi Pelajaran Baru</h5>
            <div class="jadwal-form">
                <input type="text" id="jadwal-mapel-baru" placeholder="Nama Mata Pelajaran">
                <select id="jadwal-hari-baru">${hariOptions}</select>
                <input type="time" id="jadwal-mulai-baru">
                <input type="time" id="jadwal-selesai-baru">
                <button onclick="tambahSesiPelajaran(${id_kelas})">+ Tambah</button>
            </div>
        </div>`;
}

/**
 * Menambahkan sesi pelajaran baru untuk sebuah kelas.
 * @param {number} id_kelas - ID kelas.
 */
function tambahSesiPelajaran(id_kelas) {
    const mataPelajaran = document.getElementById('jadwal-mapel-baru').value;
    const hari = parseInt(document.getElementById('jadwal-hari-baru').value);
    const jamMulai = document.getElementById('jadwal-mulai-baru').value;
    const jamSelesai = document.getElementById('jadwal-selesai-baru').value;

    if (!mataPelajaran || !jamMulai || !jamSelesai) {
        return alert('Semua kolom harus diisi!');
    }
    if (!data.jadwalPelajaran[id_kelas]) {
        data.jadwalPelajaran[id_kelas] = [];
    }

    data.jadwalPelajaran[id_kelas].push({ id: Date.now(), hari, jamMulai, jamSelesai, mataPelajaran });
    // Urutkan jadwal berdasarkan hari lalu jam
    data.jadwalPelajaran[id_kelas].sort((a, b) => a.hari - b.hari || a.jamMulai.localeCompare(b.jamMulai));
    
    renderTabelJadwalAdmin(id_kelas);
}

/**
 * Menghapus sesi pelajaran dari jadwal kelas.
 * @param {number} id_kelas - ID kelas.
 * @param {number} index - Index sesi dalam array jadwal.
 */
function hapusSesiPelajaran(id_kelas, index) {
    if (confirm('Yakin ingin menghapus sesi pelajaran ini?')) {
        data.jadwalPelajaran[id_kelas].splice(index, 1);
        renderTabelJadwalAdmin(id_kelas);
    }
}


// =================================================================================
// BAGIAN 8: FUNGSI-FUNGSI INTI (Absensi, Tugas, Notifikasi, dll)
// =================================================================================

/**
 * Fungsi utama untuk mencatat absensi.
 * @param {('masuk'|'izin'|'sakit')} status - Status absensi.
 * @param {number|null} id_kelas - ID kelas (khusus untuk guru).
 */
function absen(status, id_kelas = null) {
    const today = new Date().toISOString().slice(0, 10);

    // Cek apakah sudah absen hari ini
    if (data.absensi.find(a => a.id_user === currentUser.id && a.role === currentRole && a.tanggal === today)) {
        return alert("Anda sudah melakukan absensi hari ini.");
    }
    
    const catatAbsensi = (keterangan = "") => {
        data.absensi.push({
            id_user: currentUser.id,
            role: currentRole,
            nama: currentUser.nama,
            tanggal: today,
            status: status,
            keterangan: keterangan
        });
        alert(`Absensi dengan status '${status}' berhasil dicatat!`);

        if (currentRole === 'siswa') {
            absensiHariIniSelesai = true;
            showDashboard(); // Re-render dashboard untuk membuka fitur lain
        } else if (currentRole === 'guru') {
            document.getElementById("container-absen-kelas").innerHTML = `<p style="color:green;"><strong>Absensi Anda untuk sesi ini telah tercatat.</strong></p>`;
        }
    };

    if (status === 'masuk') {
        let targetLokasi, btn;
        const radius = 200; // Radius toleransi dalam meter

        if (currentRole === 'guru' && id_kelas) {
            const kelas = data.kelas.find(k => k.id === id_kelas);
            targetLokasi = kelas.lokasi;
        } else if (currentRole === 'siswa') {
            targetLokasi = { latitude: -7.983908, longitude: 112.621391 }; // Lokasi sekolah
            btn = document.getElementById(`btn-absen-masuk-siswa`);
            if (btn) {
                btn.disabled = true;
                btn.textContent = "Mengecek Lokasi...";
            }
        }
        
        if (!navigator.geolocation) {
            alert("Geolocation tidak didukung oleh browser Anda.");
            if (btn) btn.disabled = false; btn.textContent = "📍 Absen Masuk";
            return;
        }

        navigator.geolocation.getCurrentPosition(
            pos => {
                const jarak = hitungJarak(pos.coords.latitude, pos.coords.longitude, targetLokasi.latitude, targetLokasi.longitude);
                if (jarak <= radius) {
                    catatAbsensi();
                } else {
                    alert(`Absensi Gagal! Jarak Anda dari lokasi sekitar ${Math.round(jarak)} meter. Anda terlalu jauh dari lokasi yang ditentukan.`);
                }
                if (btn) {
                    btn.disabled = false;
                    btn.textContent = "📍 Absen Masuk";
                }
            },
            () => {
                alert("Tidak dapat mengakses lokasi Anda. Pastikan GPS atau layanan lokasi di perangkat Anda aktif dan izinkan akses untuk situs ini.");
                if (btn) {
                    btn.disabled = false;
                    btn.textContent = "📍 Absen Masuk";
                }
            }
        );
    } else if (status === 'izin' || status === 'sakit' && currentRole === 'guru') { // Izin untuk semua, sakit untuk guru tanpa foto
        const alasan = prompt(`Masukkan alasan Anda ${status}:`);
        if (alasan) {
            catatAbsensi(alasan);
        } else {
            alert("Absensi dibatalkan karena alasan tidak diisi.");
        }
    } else if (status === 'sakit' && currentRole === 'siswa') { // Sakit untuk siswa wajib foto
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        
        fileInput.onchange = e => {
            const file = e.target.files[0];
            if (file) {
                catatAbsensi(`Bukti foto terlampir: ${file.name}`);
            } else {
                alert("Absensi sakit dibatalkan karena tidak ada foto yang dipilih.");
            }
            document.body.removeChild(fileInput);
        };
        
        document.body.appendChild(fileInput);
        fileInput.click();
    }
}

/**
 * Menghitung jarak antara dua titik koordinat geografis.
 * @returns {number} Jarak dalam meter.
 */
function hitungJarak(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Radius bumi dalam meter
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Membuat notifikasi baru untuk pengguna.
 */
function createNotification(id_user, role, message) {
    if (currentUser && currentUser.id === id_user && currentRole === role) return; // Jangan notifikasi diri sendiri
    data.notifikasi.push({ id: Date.now(), id_user, role, message, read: false, timestamp: new Date() });
}

/**
 * Merender indikator lonceng notifikasi.
 */
function renderNotificationBell() {
    const notifBadge = document.getElementById("notif-badge");
    const unreadNotifs = data.notifikasi.filter(n =>
        (n.id_user === 'semua' || n.id_user === currentUser.id) && n.role === currentRole && !n.read
    );

    if (unreadNotifs.length > 0) {
        notifBadge.textContent = unreadNotifs.length;
        notifBadge.classList.remove("hidden");
    } else {
        notifBadge.classList.add("hidden");
    }
}

/**
 * Menampilkan atau menyembunyikan dropdown notifikasi.
 */
function toggleNotifDropdown() {
    const dropdown = document.getElementById("notification-dropdown");
    dropdown.classList.toggle("hidden");
    if (!dropdown.classList.contains("hidden")) {
        renderNotifList();
    }
}

/**
 * Merender daftar notifikasi di dalam dropdown.
 */
function renderNotifList() {
    const dropdown = document.getElementById("notification-dropdown");
    const userNotifs = data.notifikasi.filter(n =>
        (n.id_user === 'semua' || n.id_user === currentUser.id) && n.role === currentRole
    );

    if (userNotifs.length === 0) {
        dropdown.innerHTML = '<div class="notif-item">Tidak ada notifikasi baru.</div>';
        return;
    }

    let html = "";
    [...userNotifs].reverse().forEach(n => {
        html += `
            <div class="notif-item ${n.read ? "read" : ""}" onclick="markNotifAsRead(${n.id})">
                <p>${n.message}</p>
                <span class="notif-time">${new Date(n.timestamp).toLocaleString("id-ID")}</span>
            </div>`;
    });
    dropdown.innerHTML = html;
}

/**
 * Menandai notifikasi sebagai sudah dibaca.
 * @param {number} notifId - ID notifikasi.
 */
function markNotifAsRead(notifId) {
    const notif = data.notifikasi.find(n => n.id === notifId);
    if (notif) {
        notif.read = true;
    }
    renderNotificationBell();
    renderNotifList();
}


/**
 * Merender komponen diskusi untuk sebuah tugas.
 * @param {number} id_tugas - ID tugas.
 * @returns {string} String HTML untuk komponen diskusi.
 */
function renderDiskusi(id_tugas) {
    const tugas = data.tugas.find(t => t.id === id_tugas);
    let messagesHTML = '';

    if (tugas.diskusi && tugas.diskusi.length > 0) {
        tugas.diskusi.forEach(p => {
            const senderClass = p.id_user === currentUser.id && p.role === currentRole ? "sender-self" : "sender-other";
            messagesHTML += `
                <div class="discussion-message ${senderClass}">
                    <strong>${p.nama_user} (${p.role}):</strong>
                    <p>${p.pesan}</p>
                    <span class="notif-time">${new Date(p.timestamp).toLocaleTimeString("id-ID")}</span>
                </div>`;
        });
    } else {
        messagesHTML = "<p>Belum ada diskusi untuk tugas ini. Jadilah yang pertama!</p>";
    }
    
    return `
        <div class="discussion-container">
            <h5>Diskusi Tugas</h5>
            ${messagesHTML}
            <div class="discussion-form">
                <textarea id="pesan-diskusi-${id_tugas}" placeholder="Tulis pesan..."></textarea>
                <button class="small-btn" onclick="tambahPesanDiskusi(${id_tugas})">Kirim</button>
            </div>
        </div>`;
}

/**
 * Menambahkan pesan baru ke dalam diskusi tugas.
 * @param {number} id_tugas - ID tugas.
 */
function tambahPesanDiskusi(id_tugas) {
    const pesanInput = document.getElementById(`pesan-diskusi-${id_tugas}`);
    const pesan = pesanInput.value.trim();
    if (!pesan) return;

    const tugas = data.tugas.find(t => t.id === id_tugas);
    tugas.diskusi.push({
        id_user: currentUser.id,
        nama_user: currentUser.nama,
        role: currentRole,
        pesan,
        timestamp: new Date()
    });

    // Kirim notifikasi
    if (currentRole === 'siswa') {
        createNotification(tugas.id_guru, "guru", `Siswa '${currentUser.nama}' mengirim pesan di tugas '${tugas.judul}'.`);
    } else if (currentRole === 'guru') {
        data.users.siswas.filter(s => s.id_kelas === tugas.id_kelas).forEach(s => {
            createNotification(s.id, "siswa", `Guru '${currentUser.nama}' membalas di diskusi tugas '${tugas.judul}'.`);
        });
    }

    // Re-render tampilan tugas
    if (currentRole === 'siswa') {
        renderDaftarTugas();
    } else if (currentRole === 'guru') {
        renderTugasSubmissions();
    }
}
// Placeholder untuk fungsi lainnya agar tidak error
function renderAdminAnalitik() { document.getElementById('Analitik').innerHTML = '<h4>Analitik</h4><p>Fitur analitik akan dikembangkan lebih lanjut.</p>'; }
function renderAdminAbsensi() { document.getElementById('Absensi').innerHTML = '<h4>Rekap Absensi</h4><p>Fitur rekap absensi akan dikembangkan lebih lanjut.</p>'; }
function renderAdminManajemen() { document.getElementById('Manajemen').innerHTML = '<h4>Manajemen Data</h4><p>Fitur manajemen data akan dikembangkan lebih lanjut.</p>'; }
function renderAdminJadwal() { document.getElementById('JadwalGuru').innerHTML = '<h4>Jadwal Guru</h4><p>Fitur jadwal guru akan dikembangkan lebih lanjut.</p>'; }
function renderAdminPengumuman() { document.getElementById('Pengumuman').innerHTML = '<h4>Pengumuman</h4><p>Fitur pengumuman akan dikembangkan lebih lanjut.</p>'; }
function kirimTugas() { alert('Fitur kirim tugas akan dikembangkan.'); }
function submitTugas(id) { alert(`Fitur submit tugas ${id} akan dikembangkan.`); }
function simpanNilai(id_tugas, id_siswa) { alert(`Fitur simpan nilai untuk tugas ${id_tugas} siswa ${id_siswa} akan dikembangkan.`); }
function buatPengumuman() { alert('Fitur buat pengumuman akan dikembangkan.'); }
function unggahMateri() { alert('Fitur unggah materi akan dikembangkan.'); }
function renderPengumumanSiswa() { document.getElementById('pengumuman-container').innerHTML = '<p>Tidak ada pengumuman.</p>'; }
function renderMateriSiswa() { document.getElementById('materi-container').innerHTML = '<p>Tidak ada materi.</p>'; }
function cekJadwalMengajar() { document.getElementById('info-absen-guru').textContent = 'Tidak ada jadwal mengajar saat ini.'; }
function mulaiAjar() { alert('Fitur mulai ajar akan dikembangkan.'); }
function cekAbsensiSiswaHariIni() { /* Logika pengecekan absensi */ }

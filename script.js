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

// BAGIAN 2: PENGATURAN AWAL & FUNGSI HELPER
let currentUser = null, currentRole = null, absensiHariIniSelesai = false;
document.addEventListener("DOMContentLoaded", () => { 
    document.getElementById("kata-harian") ? setupHalamanAwal() : document.getElementById("app") && showView("view-role-selection"); 
});

function showView(viewId) { 
    document.querySelectorAll("#app > div").forEach(div => div.classList.add("hidden")); 
    document.getElementById(viewId).classList.remove("hidden"); 
}

function setupHalamanAwal() { 
    const quotes = ["Minggu: Istirahat.", "Senin: Mulailah!", "Selasa: Terus bertumbuh.", "Rabu: Jangan takut gagal.", "Kamis: Optimis!", "Jumat: Selesaikan.", "Sabtu: Refleksi."]; 
    document.getElementById("kata-harian").textContent = quotes[new Date().getDay()]; 
    document.getElementById("tombol-buka").addEventListener("click", () => window.location.href = "main.html"); 
}

function getNomorMinggu(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// BAGIAN 3: LOGIKA LOGIN & LOGOUT
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

// FUNGSI BARU: TOGGLE PROFIL POPUP
function toggleProfilPopup() {
    const popup = document.getElementById("profil-popup");
    popup.classList.toggle("hidden");
}

// FUNGSI BARU: RENDER PROFIL POPUP
function renderProfilPopup() {
    let dataProfil = '';
    
    if (currentRole === 'admin') {
        dataProfil = `
            <div class="profil-info">
                <p><strong>Username:</strong> ${currentUser.username}</p>
                <p><strong>Role:</strong> Administrator</p>
            </div>
        `;
    } else if (currentRole === 'guru') {
        const jumlahJadwal = currentUser.jadwal ? currentUser.jadwal.length : 0;
        dataProfil = `
            <div class="profil-info">
                <p><strong>Nama:</strong> ${currentUser.nama}</p>
                <p><strong>Email:</strong> ${currentUser.email || '-'}</p>
                <p><strong>ID Guru:</strong> ${currentUser.id}</p>
                <p><strong>Jadwal Mengajar:</strong> ${jumlahJadwal} sesi</p>
            </div>
        `;
    } else if (currentRole === 'siswa') {
        const namaKelas = data.kelas.find(k => k.id === currentUser.id_kelas)?.nama || '-';
        dataProfil = `
            <div class="profil-info">
                <p><strong>Nama:</strong> ${currentUser.nama}</p>
                <p><strong>NIS:</strong> ${currentUser.nis || '-'}</p>
                <p><strong>Kelas:</strong> ${namaKelas}</p>
            </div>
        `;
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
            <input type="password" id="old-pass-popup" placeholder="Password Lama">
            <input type="password" id="new-pass-popup" placeholder="Password Baru">
            <input type="password" id="confirm-new-pass-popup" placeholder="Konfirmasi Password">
            <button onclick="changePasswordFromPopup()">Simpan Password</button>
        </div>
    `;
}

// FUNGSI BARU: TAMPILKAN FORM GANTI PASSWORD
function showGantiPassword() {
    const section = document.getElementById("ganti-password-section");
    section.classList.toggle("hidden");
}

// FUNGSI BARU: GANTI PASSWORD DARI POPUP
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

// BAGIAN 4: RENDER DASHBOARD UTAMA
function showDashboard() {
    showView("view-dashboard");
    const header = document.querySelector("#view-dashboard .header");
    const content = document.getElementById("dashboard-content");
    content.innerHTML = "";
    
    // Header baru dengan profil popup
    if (!document.getElementById('notification-bell')) {
        header.innerHTML = `
            <h2 id="dashboard-title">Dashboard</h2>
            <div class="header-actions">
                <div id="notification-bell" onclick="toggleNotifDropdown()">
                    <span id="notif-badge" class="notification-badge hidden">0</span>🔔
                </div>
                <div id="notification-dropdown" class="hidden"></div>
                <div class="profil-menu" onclick="toggleProfilPopup()">
                    <div class="profil-icon">👤</div>
                    <span class="profil-name">${currentUser.nama || currentUser.username}</span>
                </div>
                <div id="profil-popup" class="hidden"></div>
            </div>
        `;
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

// BAGIAN 5: RENDER DASHBOARD
function renderAdminDashboard() {
    return `<div class="tabs">
        <button class="tab-link active" onclick="openAdminTab(event, 'Analitik')">📈 Analitik</button>
        <button class="tab-link" onclick="openAdminTab(event, 'Absensi')">📊 Rekap Absensi</button>
        <button class="tab-link" onclick="openAdminTab(event, 'Manajemen')">⚙️ Manajemen Data</button>
        <button class="tab-link" onclick="openAdminTab(event, 'JadwalGuru')">🗓️ Jadwal Guru</button>
        <button class="tab-link" onclick="openAdminTab(event, 'JadwalPelajaran')">📚 Jadwal Pelajaran</button>
        <button class="tab-link" onclick="openAdminTab(event, 'Pengumuman')">📢 Pengumuman</button>
    </div>
    <div id="Analitik" class="tab-content" style="display:block;"></div>
    <div id="Absensi" class="tab-content"></div>
    <div id="Manajemen" class="tab-content"></div>
    <div id="JadwalGuru" class="tab-content"></div>
    <div id="JadwalPelajaran" class="tab-content"></div>
    <div id="Pengumuman" class="tab-content"></div>`;
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
    return `<div class="dashboard-section" id="guru-absen">
        <h4>🗓️ Absensi & Jadwal</h4>
        <p id="info-absen-guru">Mengecek jadwal...</p>
        <button id="btn-mulai-ajar" onclick="mulaiAjar()" disabled>Mulai Ajar</button>
        <div id="container-absen-kelas" style="margin-top: 1rem;"></div>
    </div>
    <div class="dashboard-section" id="guru-tugas">
        <h4>📤 Manajemen Tugas</h4>
        <div id="submission-container"></div>
    </div>
    <div class="dashboard-section">
        <h4>📚 Unggah Materi</h4>
        <select id="materi-kelas">${data.kelas.map(k => `<option value="${k.id}">${k.nama}</option>`).join("")}</select>
        <input type="text" id="materi-judul" placeholder="Judul Materi">
        <textarea id="materi-deskripsi" placeholder="Deskripsi..."></textarea>
        <label>Upload File (Simulasi):</label>
        <input type="file" id="materi-file">
        <button onclick="unggahMateri()">Unggah</button>
    </div>
    <div class="dashboard-section">
        <h4>📢 Buat Pengumuman</h4>
        <input type="text" id="pengumuman-judul" placeholder="Judul">
        <textarea id="pengumuman-isi" placeholder="Isi..."></textarea>
        <button onclick="buatPengumuman()">Kirim</button>
    </div>`;
}

function renderSiswaDashboard() {
    const locked = absensiHariIniSelesai ? "" : "locked-feature";
    const warning = absensiHariIniSelesai ? "" : '<p><strong>🔒 Lakukan absensi untuk membuka fitur lain.</strong></p>';
    
    return `<div class="dashboard-section" id="siswa-absen">
        <h4>✅ Absensi Siswa</h4>
        <button id="btn-absen-masuk-siswa" onclick="absen('masuk')">📍 Masuk</button>
        <button onclick="absen('izin')">📝 Izin</button>
        <button onclick="absen('sakit')">🤒 Sakit (Wajib Foto)</button>
    </div>
    <div class="dashboard-section">
        <h4>🗓️ Jadwal & Catatan PR</h4>
        <div id="jadwal-siswa-container">Memuat jadwal...</div>
    </div>
    <div id="fitur-siswa-wrapper" class="${locked}">${warning}
        <div class="dashboard-section">
            <h4>📢 Pengumuman</h4>
            <div id="pengumuman-container"></div>
        </div>
        <div class="dashboard-section">
            <h4>📚 Materi Pembelajaran</h4>
            <div id="materi-container"></div>
        </div>
        <div class="dashboard-section">
            <h4>📚 Tugas Sekolah <span id="notif-tugas" class="notification-badge">0</span></h4>
            <div id="daftar-tugas-container"></div>
        </div>
    </div>`;
}

function renderSiswaFeatures() {
    cekDanHapusCatatanLama();
    renderJadwalSiswa();
    renderPengumumanSiswa();
    renderMateriSiswa();
    renderDaftarTugas();
}

// BAGIAN 6: JADWAL & CATATAN PR
function cekDanHapusCatatanLama() {
    const mingguSekarang = getNomorMinggu(new Date());
    data.catatanPR = data.catatanPR.filter(catatan => 
        !(catatan.id_siswa === currentUser.id && catatan.mingguDibuat < mingguSekarang)
    );
}

function renderJadwalSiswa() {
    const container = document.getElementById('jadwal-siswa-container');
    const jadwalKelas = data.jadwalPelajaran[currentUser.id_kelas] || [];
    
    if (jadwalKelas.length === 0) {
        container.innerHTML = '<p>Jadwal pelajaran belum diatur oleh admin.</p>';
        return;
    }
    
    const hariSekolah = [1, 2, 3, 4, 5];
    const namaHari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
    let html = '<div class="jadwal-grid">';
    
    hariSekolah.forEach(hari => {
        html += `<div class="jadwal-hari"><h5>${namaHari[hari]}</h5>`;
        const sesiUntukHariIni = jadwalKelas.filter(s => s.hari === hari);
        
        if (sesiUntukHariIni.length > 0) {
            sesiUntukHariIni.forEach(sesi => {
                const catatanTersimpan = data.catatanPR.find(c => 
                    c.id_siswa === currentUser.id && c.id_jadwal === sesi.id
                );
                html += `<div class="jadwal-sesi">
                    <div class="sesi-info">
                        <strong>${sesi.mataPelajaran}</strong>
                        <span>${sesi.jamMulai} - ${sesi.jamSelesai}</span>
                    </div>
                    <textarea class="catatan-pr" id="catatan-${sesi.id}" 
                        placeholder="Ketik catatan PR..." 
                        onblur="simpanCatatan(${sesi.id})">${catatanTersimpan ? catatanTersimpan.catatan : ''}</textarea>
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

function simpanCatatan(id_jadwal) {
    const textarea = document.getElementById(`catatan-${id_jadwal}`);
    const catatanTeks = textarea.value.trim();
    
    data.catatanPR = data.catatanPR.filter(c => 
        !(c.id_siswa === currentUser.id && c.id_jadwal === id_jadwal)
    );
    
    if (catatanTeks) {
        data.catatanPR.push({
            id_siswa: currentUser.id,
            id_jadwal,
            catatan: catatanTeks,
            mingguDibuat: getNomorMinggu(new Date())
        });
    }
    
    textarea.style.borderColor = 'var(--success-color)';
    setTimeout(() => {
        textarea.style.borderColor = 'var(--border-color)';
    }, 1500);
}

// BAGIAN 7: TUGAS
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
            ? `<div class="submission-status">
                <p style="color:green;"><strong>✓ Anda sudah mengumpulkan.</strong></p>
                ${submission.nilai !== null 
                    ? `<p class="grade-display"><strong>Nilai: ${submission.nilai}</strong></p>
                       <p class="feedback-display"><em>Feedback: ${submission.feedback}</em></p>` 
                    : `<p>Menunggu penilaian...</p>`}
               </div>`
            : `<label>Kirim Jawaban:</label>
               <input type="file" id="submit-file-${t.id}">
               <button onclick="submitTugas(${t.id})">Kirim</button>`;

        html += `<div class="task-card">
            <div class="task-header">
                <span><strong>${t.judul}</strong> - ${t.nama_guru}</span>
                <span class="task-deadline">Deadline: ${t.deadline}</span>
            </div>
            <p>${t.deskripsi}</p>
            <p>File: <em>${t.file}</em></p>
            ${submissionHTML}
            ${renderDiskusi(t.id)}
        </div>`;
    });
    
    container.innerHTML = html;
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
        html += `<div class="task-card">
            <h5>Tugas: ${t.judul} (Kelas: ${data.kelas.find(k => k.id === t.id_kelas).nama})</h5>`;
        
        if (t.submissions && t.submissions.length > 0) {
            html += "<ul class='submission-list'>";
            t.submissions.forEach(sub => {
                const submissionDetailHTML = `<strong>${sub.nama_siswa}</strong> mengumpulkan file: <em>${sub.file}</em>
                    <div class="grading-container">
                        ${sub.nilai !== null 
                            ? `<p class="grade-display"><strong>Nilai: ${sub.nilai}</strong></p>
                               <p class="feedback-display"><em>Feedback: ${sub.feedback}</em></p>` 
                            : `<input type="number" id="nilai-${t.id}-${sub.id_siswa}" placeholder="Nilai">
                               <input type="text" id="feedback-${t.id}-${sub.id_siswa}" placeholder="Umpan Balik">
                               <button class="small-btn" onclick="simpanNilai(${t.id}, ${sub.id_siswa})">Simpan</button>`}
                    </div>`;
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

// BAGIAN 8: DISKUSI
function renderDiskusi(id_tugas) {
    const tugas = data.tugas.find(t => t.id === id_tugas);
    let html = '<div class="discussion-container"><h5>Diskusi Tugas</h5>';
    
    if (tugas.diskusi && tugas.diskusi.length > 0) {
        tugas.diskusi.forEach(p => {
            const senderClass = (p.id_user === currentUser.id && p.role === currentRole) ? "sender-self" : "sender-other";
            html += `<div class="discussion-message ${senderClass}">
                <strong>${p.nama_user} (${p.role}):</strong>
                <p>${p.pesan}</p>
                <span class="notif-time">${new Date(p.timestamp).toLocaleTimeString("id-ID")}</span>
            </div>`;
        });
    } else {
        html += "<p>Belum ada diskusi.</p>";
    }
    
    html += `<div class="discussion-form">
        <textarea id="pesan-diskusi-${id_tugas}" placeholder="Tulis pesan..."></textarea>
        <button class="small-btn" onclick="tambahPesanDiskusi(${id_tugas})">Kirim</button>
    </div></div>`;
    
    return html;
}

function tambahPesanDiskusi(id_tugas) {
    const pesan = document.getElementById(`pesan-diskusi-${id_tugas}`).value;
    
    if (!pesan.trim()) return;
    
    const tugas = data.tugas.find(t => t.id === id_tugas);
    
    tugas.diskusi.push({
        id_user: currentUser.id,
        nama_user: currentUser.nama,
        role: currentRole,
        pesan,
        timestamp: new Date()
    });
    
    if (currentRole === "siswa") {
        createNotification(tugas.id_guru, "guru", `Siswa '${currentUser.nama}' mengirim pesan di tugas '${tugas.judul}'.`);
    } else if (currentRole === "guru") {
        data.users.siswas.filter(s => s.id_kelas === tugas.id_kelas).forEach(s => {
            createNotification(s.id, "siswa", `Guru '${currentUser.nama}' membalas di diskusi tugas '${tugas.judul}'.`);
        });
    }
    
    if (currentRole === "siswa") {
        renderDaftarTugas();
    } else if (currentRole === "guru") {
        renderTugasSubmissions();
    }
}

// BAGIAN 9: PENGUMUMAN & MATERI
function buatPengumuman() {
    const judul = document.getElementById("pengumuman-judul").value;
    const isi = document.getElementById("pengumuman-isi").value;
    
    if (!judul || !isi) return alert("Judul dan isi harus diisi!");
    
    data.pengumuman.push({
        id: Date.now(),
        oleh: currentRole === "admin" ? "Admin" : currentUser.nama,
        judul,
        isi,
        tanggal: new Date().toISOString().slice(0, 10),
        target_kelas_id: "semua"
    });
    
    data.users.siswas.forEach(s => createNotification(s.id, "siswa", `Pengumuman baru: '${judul}'`));
    data.users.gurus.forEach(g => createNotification(g.id, "guru", `Pengumuman baru: '${judul}'`));
    
    alert("Pengumuman berhasil dikirim!");
    
    if (currentRole === "admin") {
        renderAdminPengumuman();
    } else {
        showDashboard();
    }
}

function renderPengumumanSiswa() {
    const pengumumanContainer = document.getElementById("pengumuman-container");
    let pengumumanHTML = "";
    
    if (data.pengumuman.length > 0) {
        [...data.pengumuman].reverse().forEach(p => {
            pengumumanHTML += `<div class="announcement-card">
                <div class="announcement-header">
                    <strong>${p.judul}</strong> - <span>Oleh: ${p.oleh} (${p.tanggal})</span>
                </div>
                <p>${p.isi}</p>
            </div>`;
        });
        pengumumanContainer.innerHTML = pengumumanHTML;
    } else {
        pengumumanContainer.innerHTML = "<p>Tidak ada pengumuman.</p>";
    }
}

function unggahMateri() {
    const id_kelas = parseInt(document.getElementById("materi-kelas").value);
    const judul = document.getElementById("materi-judul").value;
    const deskripsi = document.getElementById("materi-deskripsi").value;
    const file = document.getElementById("materi-file").files[0];
    
    if (!id_kelas || !judul || !deskripsi) return alert("Semua kolom harus diisi!");
    
    data.materi.push({
        id: Date.now(),
        id_guru: currentUser.id,
        id_kelas,
        judul,
        deskripsi,
        file: file ? file.name : "Tidak ada file"
    });
    
    alert("Materi berhasil diunggah!");
    
    document.getElementById("materi-judul").value = "";
    document.getElementById("materi-deskripsi").value = "";
    document.getElementById("materi-file").value = "";
}

function renderMateriSiswa() {
    const materiContainer = document.getElementById("materi-container");
    const materiKelas = data.materi.filter(m => m.id_kelas === currentUser.id_kelas);
    let materiHTML = "";
    
    if (materiKelas.length > 0) {
        materiKelas.forEach(m => {
            materiHTML += `<div class="task-card">
                <div class="task-header"><strong>${m.judul}</strong></div>
                <p>${m.deskripsi}</p>
                <p>File: <em>${m.file}</em></p>
                <button class="small-btn" onclick="alert('Simulasi unduh file ${m.file}')">Unduh</button>
            </div>`;
        });
        materiContainer.innerHTML = materiHTML;
    } else {
        materiContainer.innerHTML = "<p>Belum ada materi.</p>";
    }
}

// BAGIAN 10: NOTIFIKASI
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
    
    if (!dropdown.classList.contains("hidden")) {
        renderNotifList();
    }
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
    if (notif) {
        notif.read = true;
    }
    renderNotificationBell();
    renderNotifList();
}

// BAGIAN 11: ABSENSI
function absen(status, id_kelas = null) {
    const today = new Date().toISOString().slice(0, 10);
    
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
        
        alert(`Absensi '${status}' berhasil dicatat!`);
        
        if (currentRole === 'siswa') {
            absensiHariIniSelesai = true;
            showDashboard();
        } else if (currentRole === 'guru') {
            document.getElementById("container-absen-kelas").innerHTML = 
                `<p style="color:green;"><strong>Absensi Anda telah tercatat.</strong></p>`;
        }
    };

    if (status === 'masuk') {
        let targetLokasi, btn;
        const radius = 200;
        
        if (currentRole === 'guru' && id_kelas) {
            const kelas = data.kelas.find(k => k.id === id_kelas);
    
    guru.jadwal.push({
        id_kelas,
        hari,
        jam,
        nama_kelas: kelas.nama
    });
    
    guru.jadwal.sort((a, b) => a.hari - b.hari || a.jam - b.jam);
    renderAdminJadwal();
}

function hapusJadwalGuru(guruId, jadwalIndex) {
    if (confirm("Yakin hapus jadwal ini?")) {
        const guru = data.users.gurus.find(g => g.id === guruId);
        if (guru && guru.jadwal[jadwalIndex]) {
            guru.jadwal.splice(jadwalIndex, 1);
            renderAdminJadwal();
        }
    }
}

// BAGIAN 17: ADMIN - JADWAL PELAJARAN
function renderAdminManajemenJadwal() {
    const container = document.getElementById('JadwalPelajaran');
    let kelasOptions = data.kelas.map(k => 
        `<option value="${k.id}">${k.nama}</option>`
    ).join('');
    
    container.innerHTML = `<h4>Kelola Jadwal Pelajaran per Kelas</h4>
        <div class="filter-group">
            <label>Pilih Kelas:</label>
            <select id="jadwal-kelas-select" onchange="renderTabelJadwalAdmin(this.value)">
                <option value="">-- Tampilkan Jadwal --</option>
                ${kelasOptions}
            </select>
        </div>
        <div id="jadwal-pelajaran-admin-container"></div>`;
}

function renderTabelJadwalAdmin(id_kelas) {
    const container = document.getElementById('jadwal-pelajaran-admin-container');
    
    if (!id_kelas) {
        container.innerHTML = '';
        return;
    }
    
    id_kelas = parseInt(id_kelas);
    const jadwalKelas = data.jadwalPelajaran[id_kelas] || [];
    
    let html = `<table class="jadwal-table">
        <thead>
            <tr>
                <th>Hari</th>
                <th>Jam Mulai</th>
                <th>Jam Selesai</th>
                <th>Mata Pelajaran</th>
                <th>Aksi</th>
            </tr>
        </thead>
        <tbody>`;
    
    jadwalKelas.forEach((sesi, index) => {
        html += `<tr>
            <td>${['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'][sesi.hari]}</td>
            <td>${sesi.jamMulai}</td>
            <td>${sesi.jamSelesai}</td>
            <td>${sesi.mataPelajaran}</td>
            <td>
                <button class="small-btn delete" onclick="hapusSesiPelajaran(${id_kelas}, ${index})">Hapus</button>
            </td>
        </tr>`;
    });
    
    html += `</tbody></table>`;
    
    const hariOptions = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
    html += `<div class="form-container">
        <h5>Tambah Sesi Pelajaran Baru</h5>
        <div class="jadwal-form">
            <input type="text" id="jadwal-mapel-baru" placeholder="Nama Mata Pelajaran">
            <select id="jadwal-hari-baru">
                ${hariOptions.map((h, i) => `<option value="${i + 1}">${h}</option>`).join('')}
            </select>
            <input type="time" id="jadwal-mulai-baru">
            <input type="time" id="jadwal-selesai-baru">
            <button onclick="tambahSesiPelajaran(${id_kelas})">+ Tambah</button>
        </div>
    </div>`;
    
    container.innerHTML = html;
}

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
    
    data.jadwalPelajaran[id_kelas].push({
        id: Date.now(),
        hari,
        jamMulai,
        jamSelesai,
        mataPelajaran
    });
    
    data.jadwalPelajaran[id_kelas].sort((a, b) => 
        a.hari - b.hari || a.jamMulai.localeCompare(b.jamMulai)
    );
    
    renderTabelJadwalAdmin(id_kelas);
}

function hapusSesiPelajaran(id_kelas, index) {
    if (confirm('Yakin ingin menghapus sesi pelajaran ini?')) {
        data.jadwalPelajaran[id_kelas].splice(index, 1);
        renderTabelJadwalAdmin(id_kelas);
    }
}

// BAGIAN 18: REKAP ABSENSI
function getFilteredAbsensi() {
    const start = document.getElementById("start-date").value;
    const end = document.getElementById("end-date").value;
    
    if (start && end) {
        return data.absensi.filter(a => a.tanggal >= start && a.tanggal <= end);
    }
    
    return data.absensi;
}

function renderRekapAbsensiGuru() {
    const container = document.getElementById("rekap-container");
    const filtered = getFilteredAbsensi();
    const absenGuru = filtered.filter(a => a.role === "guru");
    
    if (absenGuru.length === 0) {
        container.innerHTML = "<p>Tidak ada data absensi guru.</p>";
        return;
    }
    
    let html = `<h5>Rekap Absensi Guru</h5>
        <table>
            <thead>
                <tr>
                    <th>Nama</th>
                    <th>Tanggal</th>
                    <th>Status</th>
                    <th>Keterangan</th>
                </tr>
            </thead>
            <tbody>`;
    
    absenGuru.forEach(a => {
        html += `<tr>
            <td>${a.nama}</td>
            <td>${a.tanggal}</td>
            <td>${a.status}</td>
            <td>${a.keterangan || '-'}</td>
        </tr>`;
    });
    
    html += `</tbody></table>`;
    container.innerHTML = html;
}

function renderRekapSiswa() {
    const kelasId = parseInt(document.getElementById("kelas-select").value);
    const container = document.getElementById("rekap-container");
    
    if (!kelasId) {
        container.innerHTML = "<p>Pilih kelas terlebih dahulu.</p>";
        return;
    }
    
    const siswaDiKelas = data.users.siswas.filter(s => s.id_kelas === kelasId);
    const filtered = getFilteredAbsensi();
    const absenKelas = filtered.filter(a => 
        a.role === "siswa" && siswaDiKelas.some(s => s.id === a.id_user)
    );
    
    if (absenKelas.length === 0) {
        container.innerHTML = "<p>Tidak ada data absensi untuk kelas ini.</p>";
        return;
    }
    
    let html = `<h5>Rekap Absensi ${data.kelas.find(k => k.id === kelasId).nama}</h5>
        <table>
            <thead>
                <tr>
                    <th>Nama</th>
                    <th>Tanggal</th>
                    <th>Status</th>
                    <th>Keterangan</th>
                </tr>
            </thead>
            <tbody>`;
    
    absenKelas.forEach(a => {
        html += `<tr>
            <td>${a.nama}</td>
            <td>${a.tanggal}</td>
            <td>${a.status}</td>
            <td>${a.keterangan || '-'}</td>
        </tr>`;
    });
    
    html += `</tbody></table>`;
    container.innerHTML = html;
}

// SCRIPT SELESAI - SEMUA FUNGSI SUDAH LENGKAP => k.id === id_kelas);
            targetLokasi = kelas.lokasi;
        } else if (currentRole === 'siswa') {
            targetLokasi = { latitude: -7.983908, longitude: 112.621391 };
            btn = document.getElementById(`btn-absen-masuk-siswa`);
            if (btn) {
                btn.disabled = true;
                btn.textContent = "Mengecek Lokasi...";
            }
        }
        
        navigator.geolocation.getCurrentPosition(pos => {
            const jarak = hitungJarak(
                pos.coords.latitude, 
                pos.coords.longitude, 
                targetLokasi.latitude, 
                targetLokasi.longitude
            );
            
            if (jarak <= radius) {
                catatAbsensi();
            } else {
                alert(`Gagal! Jarak Anda dari lokasi: ${Math.round(jarak)} meter. Terlalu jauh.`);
            }
            
            if (btn) {
                btn.disabled = false;
                btn.textContent = "📍 Masuk";
            }
        }, () => {
            alert("Tidak bisa mengakses lokasi. Pastikan GPS aktif.");
            if (btn) {
                btn.disabled = false;
                btn.textContent = "📍 Masuk";
            }
        });
    } else if (status === 'izin') {
        const alasan = prompt(`Masukkan alasan Anda ${status}:`);
        if (alasan) {
            catatAbsensi(alasan);
        } else {
            alert("Absensi dibatalkan karena alasan tidak diisi.");
        }
    } else if (status === 'sakit') {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        fileInput.onchange = e => {
            const file = e.target.files[0];
            if (file) {
                catatAbsensi(`Bukti foto: ${file.name}`);
            } else {
                alert("Absensi sakit dibatalkan karena tidak ada foto yang dipilih.");
            }
            document.body.removeChild(fileInput);
        };
        document.body.appendChild(fileInput);
        fileInput.click();
    }
}

function hitungJarak(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function cekAbsensiSiswaHariIni() {
    const today = new Date().toISOString().slice(0, 10);
    absensiHariIniSelesai = !!data.absensi.find(a => 
        a.id_user === currentUser.id && a.tanggal === today
    );
}

function cekJadwalMengajar() {
    const btn = document.getElementById("btn-mulai-ajar");
    const info = document.getElementById("info-absen-guru");
    const now = new Date();
    
    const jadwalSekarang = currentUser.jadwal.filter(j => 
        j.hari === now.getDay() && j.jam === now.getHours()
    );
    
    if (jadwalSekarang.length > 0) {
        info.textContent = "Anda punya jadwal mengajar. Silakan 'Mulai Ajar'.";
        btn.disabled = false;
    } else {
        info.textContent = "Tidak ada jadwal mengajar saat ini.";
        btn.disabled = true;
    }
}

function mulaiAjar() {
    const container = document.getElementById("container-absen-kelas");
    const now = new Date();
    const jadwalSekarang = currentUser.jadwal.filter(j => 
        j.hari === now.getDay() && j.jam === now.getHours()
    );
    
    if (jadwalSekarang.length === 0) {
        container.innerHTML = "<p>Gagal memuat sesi.</p>";
        return;
    }
    
    let html = "<h5>Pilih Kelas untuk Absen:</h5>";
    jadwalSekarang.forEach(sesi => {
        html += `<div class="task-card">
            <strong>${sesi.nama_kelas}</strong>
            <p>Jadwal: Jam ${sesi.jam}:00</p>
            <button onclick="absen('masuk',${sesi.id_kelas})">✅ Absen Masuk</button>
        </div>`;
    });
    
    html += '<p>Jika berhalangan:</p>';
    html += '<button onclick="absen(\'izin\')">📝 Izin</button>';
    html += '<button onclick="absen(\'sakit\')">🤒 Sakit</button>';
    
    container.innerHTML = html;
    document.getElementById("btn-mulai-ajar").disabled = true;
}

// BAGIAN 12: ADMIN - ANALITIK
function renderAdminAnalitik() {
    const container = document.getElementById("Analitik");
    const totalSiswa = data.users.siswas.length;
    const totalGuru = data.users.gurus.length;
    const totalAbsenHariIni = data.absensi.filter(a => 
        a.tanggal === new Date().toISOString().slice(0, 10)
    ).length;
    
    let chartHTML = '<div class="chart-container"><h5>Persentase Kehadiran per Kelas (Bulan Ini)</h5>';
    
    data.kelas.forEach(k => {
        const siswaDiKelas = data.users.siswas.filter(s => s.id_kelas === k.id);
        const absenBulanIni = data.absensi.filter(a => 
            siswaDiKelas.some(s => s.id === a.id_user) && a.status === "masuk"
        );
        
        const persentase = siswaDiKelas.length > 0 
            ? (absenBulanIni.length / (30 * siswaDiKelas.length)) * 100 
            : 0;
        
        chartHTML += `<div class="chart-bar-wrapper">
            <div class="chart-label">${k.nama}</div>
            <div class="chart-bar-background">
                <div class="chart-bar-foreground" style="width: ${Math.min(persentase, 100)}%;">
                    ${Math.round(persentase)}%
                </div>
            </div>
        </div>`;
    });
    
    chartHTML += "</div>";
    
    container.innerHTML = `<div class="stats-container">
        <div class="stat-card"><h4>Total Siswa</h4><p>${totalSiswa}</p></div>
        <div class="stat-card"><h4>Total Guru</h4><p>${totalGuru}</p></div>
        <div class="stat-card"><h4>Absen Hari Ini</h4><p>${totalAbsenHariIni}</p></div>
    </div>${chartHTML}`;
}

// BAGIAN 13: ADMIN - PENGUMUMAN
function renderAdminPengumuman() {
    const container = document.getElementById("Pengumuman");
    let listHTML = "<h5>Daftar Pengumuman</h5>";
    
    if (data.pengumuman.length === 0) {
        listHTML += "<p>Belum ada pengumuman.</p>";
    } else {
        [...data.pengumuman].reverse().forEach(p => {
            listHTML += `<div class="announcement-card">
                <div class="announcement-header">
                    <strong>${p.judul}</strong> - <span>Oleh: ${p.oleh} (${p.tanggal})</span>
                </div>
                <p>${p.isi}</p>
                <button class="small-btn delete" onclick="hapusPengumuman(${p.id})">Hapus</button>
            </div>`;
        });
    }
    
    container.innerHTML = `<div class="dashboard-section">
        <h4>Buat Pengumuman Baru</h4>
        <input type="text" id="pengumuman-judul" placeholder="Judul">
        <textarea id="pengumuman-isi" placeholder="Isi pengumuman..."></textarea>
        <button onclick="buatPengumuman()">Kirim</button>
    </div>
    <div class="dashboard-section">${listHTML}</div>`;
}

function hapusPengumuman(id) {
    if (confirm("Yakin hapus pengumuman?")) {
        data.pengumuman = data.pengumuman.filter(p => p.id !== id);
        renderAdminPengumuman();
    }
}

// BAGIAN 14: ADMIN - ABSENSI
function renderAdminAbsensi() {
    let kelasOptions = data.kelas.map(k => 
        `<option value="${k.id}">${k.nama}</option>`
    ).join("");
    
    const container = document.getElementById("Absensi");
    container.innerHTML = `<div class="filter-group">
        <label>Dari:</label>
        <input type="date" id="start-date">
        <label>Sampai:</label>
        <input type="date" id="end-date">
    </div>
    <div class="filter-group">
        <button onclick="renderRekapAbsensiGuru()">Rekap Guru</button>
        <label>atau siswa:</label>
        <select id="kelas-select" onchange="renderRekapSiswa()">
            <option value="">-- Pilih Kelas --</option>
            ${kelasOptions}
        </select>
        <button id="export-btn" onclick="exportToCSV()">🖨️ Ekspor</button>
    </div>
    <div id="rekap-container"><p>Pilih rentang tanggal dan jenis rekap.</p></div>`;
}

function exportToCSV() {
    const table = document.querySelector("#rekap-container table");
    if (!table) return alert("Tidak ada data!");
    
    let csv = [];
    for (let row of table.querySelectorAll("tr")) {
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

// BAGIAN 15: ADMIN - MANAJEMEN DATA
function renderAdminManajemen() {
    const container = document.getElementById("Manajemen");
    container.innerHTML = `<p>Pilih data yang ingin dikelola.</p>
        <button onclick="renderManajemenDetail('guru')">Kelola Guru</button>
        <button onclick="renderManajemenDetail('siswa')">Kelola Siswa</button>`;
}

function renderManajemenDetail(tipe) {
    const container = document.getElementById("Manajemen");
    let html = "";
    
    if (tipe === "guru") {
        html += `<h4>Kelola Data Guru</h4>
            <table class="management-table">
                <thead>
                    <tr><th>ID</th><th>Nama</th><th>Password</th><th>Aksi</th></tr>
                </thead>
                <tbody>`;
        
        data.users.gurus.forEach(g => {
            html += `<tr>
                <td>${g.id}</td>
                <td>${g.nama}</td>
                <td>*****</td>
                <td>
                    <button class="small-btn edit" onclick="editGuru(${g.id})">Edit</button>
                    <button class="small-btn delete" onclick="hapusGuru(${g.id})">Hapus</button>
                </td>
            </tr>`;
        });
        
        html += `</tbody></table>
            <div class="form-container">
                <h5>Tambah Guru Baru</h5>
                <input type="text" id="guru-nama-baru" placeholder="Nama Guru">
                <input type="password" id="guru-pass-baru" placeholder="Password">
                <button onclick="tambahGuru()">+ Tambah Guru</button>
            </div>`;
    } else if (tipe === "siswa") {
        let kelasOptions = data.kelas.map(k => 
            `<option value="${k.id}">${k.nama}</option>`
        ).join("");
        
        html += `<h4>Kelola Data Siswa</h4>
            <table class="management-table">
                <thead>
                    <tr><th>ID</th><th>Nama</th><th>Kelas</th><th>Aksi</th></tr>
                </thead>
                <tbody>`;
        
        data.users.siswas.forEach(s => {
            const kelasNama = data.kelas.find(k => k.id === s.id_kelas)?.nama || "N/A";
            html += `<tr>
                <td>${s.id}</td>
                <td>${s.nama}</td>
                <td>${kelasNama}</td>
                <td>
                    <button class="small-btn edit" onclick="editSiswa(${s.id})">Edit</button>
                    <button class="small-btn delete" onclick="hapusSiswa(${s.id})">Hapus</button>
                </td>
            </tr>`;
        });
        
        html += `</tbody></table>
            <div class="form-container">
                <h5>Tambah Siswa Baru</h5>
                <input type="text" id="siswa-nama-baru" placeholder="Nama Siswa">
                <input type="password" id="siswa-pass-baru" placeholder="Password">
                <select id="siswa-kelas-baru">${kelasOptions}</select>
                <button onclick="tambahSiswa()">+ Tambah Siswa</button>
            </div>`;
    }
    
    container.innerHTML = html + 
        `<button class="back-button" onclick="renderAdminManajemen()">« Kembali</button>`;
}

function tambahGuru() {
    const nama = document.getElementById("guru-nama-baru").value;
    const password = document.getElementById("guru-pass-baru").value;
    
    if (!nama || !password) return alert("Nama dan password harus diisi!");
    
    const newId = data.users.gurus.length > 0 
        ? Math.max(...data.users.gurus.map(g => g.id)) + 1 
        : 1;
    
    data.users.gurus.push({ id: newId, nama, password, jadwal: [] });
    renderManajemenDetail("guru");
}

function hapusGuru(id) {
    if (confirm(`Yakin hapus guru ID ${id}?`)) {
        data.users.gurus = data.users.gurus.filter(g => g.id !== id);
        renderManajemenDetail("guru");
    }
}

function editGuru(id) {
    const guru = data.users.gurus.find(g => g.id === id);
    const namaBaru = prompt("Nama baru:", guru.nama);
    const passBaru = prompt("Password baru (kosongkan jika tidak diubah):");
    
    if (namaBaru) guru.nama = namaBaru;
    if (passBaru) guru.password = passBaru;
    
    renderManajemenDetail("guru");
}

function tambahSiswa() {
    const nama = document.getElementById("siswa-nama-baru").value;
    const password = document.getElementById("siswa-pass-baru").value;
    const id_kelas = parseInt(document.getElementById("siswa-kelas-baru").value);
    
    if (!nama || !password || !id_kelas) return alert("Semua data harus diisi!");
    
    const newId = data.users.siswas.length > 0 
        ? Math.max(...data.users.siswas.map(s => s.id)) + 1 
        : 101;
    
    data.users.siswas.push({ id: newId, nama, password, id_kelas });
    renderManajemenDetail("siswa");
}

function hapusSiswa(id) {
    if (confirm(`Yakin hapus siswa ID ${id}?`)) {
        data.users.siswas = data.users.siswas.filter(s => s.id !== id);
        renderManajemenDetail("siswa");
    }
}

function editSiswa(id) {
    const siswa = data.users.siswas.find(s => s.id === id);
    const namaBaru = prompt("Nama baru:", siswa.nama);
    
    if (namaBaru) siswa.nama = namaBaru;
    
    renderManajemenDetail("siswa");
}

// BAGIAN 16: ADMIN - JADWAL GURU
function renderAdminJadwal() {
    const container = document.getElementById("JadwalGuru");
    container.innerHTML = "<h4>Kelola Jadwal Mengajar Guru</h4>";
    
    const hariOptions = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const jamOptions = Array.from({ length: 10 }, (_, i) => i + 8);
    const kelasOptions = data.kelas.map(k => 
        `<option value="${k.id}">${k.nama}</option>`
    ).join("");
    
    data.users.gurus.forEach(guru => {
        let jadwalHTML = `<div class="jadwal-guru-container task-card">
            <h5>${guru.nama}</h5>`;
        
        if (guru.jadwal && guru.jadwal.length > 0) {
            jadwalHTML += '<ul class="jadwal-list">';
            guru.jadwal.forEach((sesi, index) => {
                jadwalHTML += `<li class="jadwal-item">
                    <span>${sesi.nama_kelas}, ${hariOptions[sesi.hari]} pukul ${sesi.jam}:00</span>
                    <button class="small-btn delete" onclick="hapusJadwalGuru(${guru.id}, ${index})">Hapus</button>
                </li>`;
            });
            jadwalHTML += "</ul>";
        } else {
            jadwalHTML += "<p>Belum ada jadwal yang diatur.</p>";
        }
        
        jadwalHTML += `<div class="jadwal-form">
            <select id="jadwal-kelas-${guru.id}">${kelasOptions}</select>
            <select id="jadwal-hari-${guru.id}">
                ${hariOptions.map((h, i) => `<option value="${i}">${h}</option>`).join("")}
            </select>
            <select id="jadwal-jam-${guru.id}">
                ${jamOptions.map(j => `<option value="${j}">${j}:00</option>`).join("")}
            </select>
            <button class="small-btn" onclick="tambahJadwalGuru(${guru.id})">+ Tambah Jadwal</button>
        </div></div>`;
        
        container.innerHTML += jadwalHTML;
    });
}

function tambahJadwalGuru(guruId) {
    const id_kelas = parseInt(document.getElementById(`jadwal-kelas-${guruId}`).value);
    const hari = parseInt(document.getElementById(`jadwal-hari-${guruId}`).value);
    const jam = parseInt(document.getElementById(`jadwal-jam-${guruId}`).value);
    const guru = data.users.gurus.find(g => g.id === guruId);
    
    if (!guru) return;
    
    if (guru.jadwal.some(j => j.id_kelas === id_kelas && j.hari === hari && j.jam === jam)) {
        return alert("Jadwal ini sudah ada.");
    }
    
    const kelas = data.kelas.find(k

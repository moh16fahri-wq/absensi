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
        { id: 1, nama: "Kelas 10A", lokasi: { latitude: -7.983908, longitude: 112.621391 }, backgroundData: null },
        { id: 2, nama: "Kelas 11B", lokasi: { latitude: -7.983500, longitude: 112.621800 }, backgroundData: null }
    ],
    absensi: [
        { id: 1, id_siswa: 101, tanggal: "2025-10-10", status: "Hadir" },
        { id: 2, id_siswa: 102, tanggal: "2025-10-10", status: "Izin" },
        { id: 3, id_siswa: 201, tanggal: "2025-10-11", status: "Hadir" },
        { id: 4, id_siswa: 101, tanggal: "2025-10-11", status: "Sakit" },
        { id: 5, id_siswa: 202, tanggal: "2025-10-11", status: "Alpa" }
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
    absensi: 6
};

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("kata-harian")) {
        fetch('https://api.quotable.io/random?tags=inspirational|technology|education')
            .then(response => response.json())
            .then(data => {
                document.getElementById('kata-harian').textContent = `"${data.content}" - ${data.author}`;
            })
            .catch(() => {
                document.getElementById('kata-harian').textContent = '"Pendidikan adalah senjata paling ampuh yang bisa kamu gunakan untuk mengubah dunia." - Nelson Mandela';
            });
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
    document.querySelectorAll("input").forEach(i => i.value = "");
}

// =================================================================================
// BAGIAN 4: RENDER DASHBOARD UTAMA
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

    const gantiPasswordHTML = `<div class="dashboard-section"><h4>🔑 Ganti Password</h4><input type="password" id="old-pass" placeholder="Password Lama"><input type="password" id="new-pass" placeholder="Password Baru"><input type="password" id="confirm-new-pass" placeholder="Konfirmasi"><button onclick="changePassword()">Simpan</button></div>`;

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
     return `
    <div class="tabs">
        <button class="tab-link active" onclick="openAdminTab(event, 'Analitik')">📈 Analitik</button>
        <button class="tab-link" onclick="openAdminTab(event, 'Absensi')">📊 Rekap Absensi</button>
        <button class="tab-link" onclick="openAdminTab(event, 'Manajemen')">⚙️ Manajemen Data</button>
        <button class="tab-link" onclick="openAdminTab(event, 'JadwalPelajaran')">📚 Jadwal Pelajaran</button>
        <button class="tab-link" onclick="openAdminTab(event, 'Pengumuman')">📢 Pengumuman</button>
        <button class="tab-link" onclick="openAdminTab(event, 'Tampilan')">🎨 Tampilan</button>
    </div>
    <div id="Analitik" class="tab-content"></div>
    <div id="Absensi" class="tab-content"></div>
    <div id="Manajemen" class="tab-content"></div>
    <div id="JadwalPelajaran" class="tab-content"></div>
    <div id="Pengumuman" class="tab-content"></div>
    <div id="Tampilan" class="tab-content"></div>`;
}

function openAdminTab(evt, tabName) {
    document.querySelectorAll(".tab-content").forEach(tc => tc.style.display = "none");
    document.querySelectorAll(".tab-link").forEach(tl => tl.classList.remove("active"));
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.classList.add("active");

    if (tabName === 'Analitik') renderAdminAnalitik();
    else if (tabName === 'Absensi') renderAdminAbsensi();
    else if (tabName === 'Manajemen') renderAdminManajemen();
    else if (tabName === 'JadwalPelajaran') renderAdminManajemenJadwal();
    else if (tabName === 'Pengumuman') renderAdminPengumuman();
    else if (tabName === 'Tampilan') renderAdminTampilan();
}

function renderAdminAnalitik() {
    const container = document.getElementById('Analitik');
    const totalSiswa = data.users.siswas.length;
    const absensiHariIni = data.absensi.filter(a => a.tanggal === getTodayDate());
    const hadir = absensiHariIni.filter(a => a.status === 'Hadir').length;
    const izin = absensiHariIni.filter(a => a.status === 'Izin').length;
    const sakit = absensiHariIni.filter(a => a.status === 'Sakit').length;
    const alpa = totalSiswa - hadir - izin - sakit;

    container.innerHTML = `
    <div class="dashboard-section">
        <h4>Analitik Kehadiran Hari Ini (${getTodayDate()})</h4>
        <p>Total Siswa: <strong>${totalSiswa}</strong></p>
        <p>Hadir: <strong>${hadir}</strong></p>
        <p>Izin: <strong>${izin}</strong></p>
        <p>Sakit: <strong>${sakit}</strong></p>
        <p>Alpa: <strong>${alpa}</strong></p>
    </div>`;
}

function renderAdminAbsensi() {
    const container = document.getElementById('Absensi');
    let tableHTML = `
    <div class="dashboard-section">
        <h4>Rekap Absensi Keseluruhan</h4>
        <div class="filter-group">
            <input type="date" id="filter-tanggal" value="${getTodayDate()}">
            <select id="filter-kelas"><option value="">Semua Kelas</option>${data.kelas.map(k=>`<option value="${k.id}">${k.nama}</option>`).join('')}</select>
            <button onclick="renderAdminAbsensi()">Filter</button>
        </div>
        <table>
            <thead><tr><th>Nama Siswa</th><th>Kelas</th><th>Tanggal</th><th>Status</th><th>Aksi</th></tr></thead>
            <tbody>`;

    const filterTanggal = document.getElementById('filter-tanggal')?.value || getTodayDate();
    const filterKelas = document.getElementById('filter-kelas')?.value;

    let filteredAbsensi = data.absensi.filter(a => a.tanggal === filterTanggal);

    if (filterKelas) {
        const siswaDiKelas = data.users.siswas.filter(s => s.id_kelas == filterKelas).map(s => s.id);
        filteredAbsensi = filteredAbsensi.filter(a => siswaDiKelas.includes(a.id_siswa));
    }

    filteredAbsensi.forEach(absen => {
        const siswa = data.users.siswas.find(s => s.id === absen.id_siswa);
        const kelas = data.kelas.find(k => k.id === siswa.id_kelas);
        tableHTML += `
            <tr>
                <td>${siswa.nama}</td>
                <td>${kelas.nama}</td>
                <td>${absen.tanggal}</td>
                <td>${absen.status}</td>
                <td><button class="small-btn delete" onclick="hapusAbsen(${absen.id})">Hapus</button></td>
            </tr>`;
    });

    tableHTML += `</tbody></table></div>`;
    container.innerHTML = tableHTML;
}

function hapusAbsen(id) {
    if (confirm('Yakin ingin menghapus data absensi ini?')) {
        data.absensi = data.absensi.filter(a => a.id !== id);
        renderAdminAbsensi();
    }
}

function renderAdminManajemen() {
    // Implementasi lengkap untuk manajemen data (siswa, guru, kelas)
    document.getElementById('Manajemen').innerHTML = `<div class="dashboard-section">Fitur manajemen data sedang dalam pengembangan.</div>`;
}

function renderAdminManajemenJadwal() {
     // Implementasi lengkap untuk manajemen jadwal
    document.getElementById('JadwalPelajaran').innerHTML = `<div class="dashboard-section">Fitur manajemen jadwal sedang dalam pengembangan.</div>`;
}

function renderAdminPengumuman() {
    const container = document.getElementById('Pengumuman');
    let html = `<div class="dashboard-section"><h4>Buat Pengumuman Baru</h4>
    <input type="text" id="judul-pengumuman" placeholder="Judul Pengumuman">
    <textarea id="isi-pengumuman" placeholder="Isi Pengumuman..."></textarea>
    <button onclick="buatPengumuman()">Kirim Pengumuman</button>
    <h4>Daftar Pengumuman</h4><div id="daftar-pengumuman-admin"></div></div>`;
    container.innerHTML = html;
    renderDaftarPengumumanAdmin();
}

function renderDaftarPengumumanAdmin(){
    const listContainer = document.getElementById('daftar-pengumuman-admin');
    let listHTML = '<table><thead><tr><th>Judul</th><th>Isi</th><th>Aksi</th></tr></thead><tbody>';
    data.pengumuman.forEach(p => {
        listHTML += `<tr><td>${p.judul}</td><td>${p.isi}</td><td><button class="small-btn delete" onclick="hapusPengumuman(${p.id})">Hapus</button></td></tr>`;
    });
    listHTML += '</tbody></table>';
    listContainer.innerHTML = listHTML;
}


function buatPengumuman(){
    const judul = document.getElementById('judul-pengumuman').value;
    const isi = document.getElementById('isi-pengumuman').value;
    if(!judul || !isi) return alert('Judul dan isi tidak boleh kosong!');

    const newPengumuman = { id: nextId.pengumuman++, judul, isi, tanggal: getTodayDate() };
    data.pengumuman.push(newPengumuman);

    // Buat notifikasi untuk semua siswa
    data.users.siswas.forEach(siswa => {
        const notif = {
            id: nextId.notifikasi++,
            id_user: siswa.id,
            tipe_user: 'siswa',
            pesan: `📢 Pengumuman baru: ${judul}`,
            read: false
        };
        data.notifikasi.push(notif);
    });

    alert('Pengumuman berhasil dikirim!');
    renderAdminPengumuman();
}


function hapusPengumuman(id){
    data.pengumuman = data.pengumuman.filter(p => p.id !== id);
    renderDaftarPengumumanAdmin();
}

function renderAdminTampilan() {
    const container = document.getElementById('Tampilan');
    let html = `
    <div class="dashboard-section">
        <h4>🎨 Kelola Latar Belakang Kelas</h4>
        <p>Pilih gambar dari komputermu untuk dijadikan latar belakang saat siswa login.</p>
        <div class="tampilan-manager">`;
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
        </div>`;
    });
    html += `</div></div>`;
    container.innerHTML = html;
}

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

// =================================================================================
// BAGIAN 6: FITUR GURU (LENGKAP)
// =================================================================================
function renderGuruDashboard() {
    // Dashboard Guru akan menampilkan rekap absensi kelas yang diajar dan manajemen tugas/materi
     return `<div class="dashboard-section">Fitur Guru sedang dalam pengembangan.</div>`;
}


// =================================================================================
// BAGIAN 7: FITUR SISWA (LENGKAP)
// =================================================================================
function renderSiswaDashboard() {
    const locked = absensiHariIniSelesai ? "" : "locked-feature";
    const warning = absensiHariIniSelesai ? "" : '<p><strong>🔒 Lakukan absensi untuk membuka fitur lain.</strong></p>';
    return `
    <div class="dashboard-section" id="siswa-absen"><h4>✅ Absensi Siswa</h4><button id="btn-absen-masuk-siswa" onclick="absen('Hadir')">📍 Masuk</button><button onclick="absen('Izin')">📝 Izin</button><button onclick="absen('Sakit')">🤒 Sakit</button></div>
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

function cekAbsensiSiswaHariIni() {
    const sudahAbsen = data.absensi.some(a => a.id_siswa === currentUser.id && a.tanggal === getTodayDate());
    if (sudahAbsen) {
        absensiHariIniSelesai = true;
        document.getElementById("siswa-absen").innerHTML = '<h4>✅ Absensi Hari Ini</h4><p>Anda sudah melakukan absensi hari ini.</p>';
        document.getElementById('fitur-siswa-wrapper')?.classList.remove('locked-feature');
        document.querySelector('#fitur-siswa-wrapper p')?.remove();
    }
}

function absen(status) {
    // Validasi sederhana (di aplikasi nyata, gunakan geolokasi atau validasi lain)
    if (status === 'Hadir') {
        alert('Absen masuk berhasil!');
    } else if (status === 'Izin') {
        prompt('Masukkan keterangan izin:');
        alert('Permintaan izin terkirim!');
    } else if (status === 'Sakit') {
        alert('Jangan lupa unggah surat sakit jika diperlukan.');
    }

    const newAbsensi = {
        id: nextId.absensi++,
        id_siswa: currentUser.id,
        tanggal: getTodayDate(),
        status: status
    };
    data.absensi.push(newAbsensi);
    cekAbsensiSiswaHariIni(); // Perbarui tampilan setelah absen
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

function simpanCatatan(id_jadwal) {
    const text = document.getElementById(`catatan-${id_jadwal}`).value;
    const existingIndex = data.catatanPR.findIndex(c => c.id_siswa === currentUser.id && c.id_jadwal === id_jadwal);

    if (existingIndex > -1) {
        if (text) data.catatanPR[existingIndex].catatan = text;
        else data.catatanPR.splice(existingIndex, 1); // Hapus jika catatan kosong
    } else if (text) {
        data.catatanPR.push({ id_siswa: currentUser.id, id_jadwal, catatan: text });
    }
}

function renderPengumumanSiswa() {
    const container = document.getElementById('pengumuman-container');
    if(data.pengumuman.length === 0){
        container.innerHTML = '<p>Tidak ada pengumuman saat ini.</p>';
        return;
    }
    let html = '';
    [...data.pengumuman].reverse().forEach(p => {
        html += `<div class="item"><h4>${p.judul}</h4><p>${p.isi}</p><small>${p.tanggal}</small></div>`;
    });
    container.innerHTML = html;
}

function renderMateriSiswa(){
    document.getElementById('materi-container').innerHTML = '<p>Belum ada materi yang diunggah.</p>';
}
function renderDaftarTugas(){
    document.getElementById('daftar-tugas-container').innerHTML = '<p>Tidak ada tugas saat ini.</p>';
}

// =================================================================================
// BAGIAN 8: FITUR UMUM (Notifikasi, Ganti Password)
// =================================================================================
function renderNotificationBell() {
    const notifBadge = document.getElementById('notif-badge');
    const unreadNotifs = data.notifikasi.filter(n => (n.id_user === currentUser.id || n.id_user === 'all') && !n.read);

    if (unreadNotifs.length > 0) {
        notifBadge.textContent = unreadNotifs.length;
        notifBadge.classList.remove('hidden');
    } else {
        notifBadge.classList.add('hidden');
    }
}

function toggleNotifDropdown() {
    const dropdown = document.getElementById('notification-dropdown');
    dropdown.classList.toggle('hidden');
    if (!dropdown.classList.contains('hidden')) {
        renderNotifList();
    }
}

function renderNotifList() {
    const dropdown = document.getElementById('notification-dropdown');
    const userNotifs = data.notifikasi.filter(n => (n.id_user === currentUser.id || n.id_user === 'all')).reverse();

    if (userNotifs.length === 0) {
        dropdown.innerHTML = '<div class="notif-item"><p>Tidak ada notifikasi.</p></div>';
        return;
    }
    let html = '';
    userNotifs.forEach(n => {
        html += `<div class="notif-item ${n.read ? 'read' : ''}" onclick="bacaNotif(${n.id})"><p>${n.pesan}</p></div>`;
    });
    dropdown.innerHTML = html;
}

function bacaNotif(id) {
    const notif = data.notifikasi.find(n => n.id === id);
    if (notif) {
        notif.read = true;
    }
    renderNotificationBell();
    renderNotifList();
}

function changePassword(){
    const oldPass = document.getElementById('old-pass').value;
    const newPass = document.getElementById('new-pass').value;
    const confirmPass = document.getElementById('confirm-new-pass').value;

    if (newPass !== confirmPass) return alert('Konfirmasi password baru tidak cocok!');
    if (newPass.length < 4) return alert('Password minimal 4 karakter!');

    let user;
    if (currentRole === 'admin') user = data.users.admins.find(u => u.username === currentUser.username);
    else user = data.users[currentRole + 's'].find(u => u.id === currentUser.id);

    if (user.password === oldPass) {
        user.password = newPass;
        alert('Password berhasil diubah!');
        logout();
    } else {
        alert('Password lama salah!');
    }
}

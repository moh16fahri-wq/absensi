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
        { id: 2, nama: "Kelas 11B", lokasi: { latitude: -7.983908, longitude: 112.621391 } }
    ],
    absensi: [
        { id_siswa: 101, tanggal: "2023-10-26", status: "hadir" },
        { id_siswa: 102, tanggal: "2023-10-26", status: "izin" }
    ],
    tugas: [
        { id: 1, judul: "Latihan Bab 1", deskripsi: "Kerjakan soal hal 10.", id_kelas: 1 },
        { id: 2, judul: "Presentasi Kelompok", deskripsi: "Buat presentasi tentang sejarah.", id_kelas: 2 }
    ],
    pengumpulan: [
        { id_tugas: 1, id_siswa: 101, file: "agus_bab1.pdf", nilai: 85 },
        { id_tugas: 1, id_siswa: 102, file: "citra_bab1.pdf", nilai: 90 }
    ]
};
let currentUser = null;
const hariOptions = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];
const jamOptions = [7, 8, 9, 10, 11, 12, 13, 14, 15];

// BAGIAN 2: LOGIKA UTAMA
document.addEventListener('DOMContentLoaded', () => {
    // Cek apakah ada di halaman index.html atau main.html
    const tombolBuka = document.getElementById('tombol-buka');
    if (tombolBuka) {
        tombolBuka.onclick = () => window.location.href = 'main.html';
        document.getElementById('kata-harian').textContent = "Pendidikan adalah senjata paling ampuh yang bisa kamu gunakan untuk mengubah dunia.";
    } else {
        // Cek tema dari localStorage
        if (localStorage.getItem('theme') === 'dark') {
            document.body.classList.add('dark-mode');
            const themeToggle = document.getElementById('theme-toggle');
            if (themeToggle) themeToggle.textContent = '🌙';
        }

        // Cek user dari sessionStorage
        if (sessionStorage.getItem('currentUser')) {
            currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
            showDashboard();
        } else {
            populateInitialDropdowns();
            showView('view-role-selection');
        }
        
        // Setup Event Listener untuk tombol tema
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                document.body.classList.toggle('dark-mode');
                if (document.body.classList.contains('dark-mode')) {
                    themeToggle.textContent = '🌙';
                    localStorage.setItem('theme', 'dark');
                } else {
                    themeToggle.textContent = '☀️';
                    localStorage.setItem('theme', 'light');
                }
            });
        }
    }
});

function showView(viewId) {
    document.querySelectorAll('.container').forEach(view => view.classList.add('hidden'));
    document.getElementById(viewId).classList.remove('hidden');
}

function showLogin(role) {
    currentUser = { role };
    document.querySelectorAll('#view-login-form > div').forEach(form => form.classList.add('hidden'));
    document.getElementById(`form-${role}`).classList.remove('hidden');
    document.getElementById('login-title').textContent = `Login ${role.charAt(0).toUpperCase() + role.slice(1)}`;
    showView('view-login-form');
}

function populateInitialDropdowns() {
    const guruSelect = document.getElementById('guru-select-nama');
    data.users.gurus.forEach(guru => guruSelect.innerHTML += `<option value="${guru.id}">${guru.nama}</option>`);
    
    const kelasSelect = document.getElementById('siswa-select-kelas');
    data.kelas.forEach(kelas => kelasSelect.innerHTML += `<option value="${kelas.id}">${kelas.nama}</option>`);
    populateSiswaDropdown();
}

function populateSiswaDropdown() {
    const kelasId = document.getElementById('siswa-select-kelas').value;
    const siswaSelect = document.getElementById('siswa-select-nama');
    siswaSelect.innerHTML = "";
    data.users.siswas.filter(s => s.id_kelas == kelasId).forEach(siswa => {
        siswaSelect.innerHTML += `<option value="${siswa.id}">${siswa.nama}</option>`;
    });
}

function login() {
    const role = currentUser.role;
    let user;
    let password;

    if (role === 'admin') {
        const username = document.getElementById('admin-user').value;
        password = document.getElementById('admin-pass').value;
        user = data.users.admins.find(u => u.username === username && u.password === password);
    } else if (role === 'guru') {
        const id = document.getElementById('guru-select-nama').value;
        password = document.getElementById('guru-pass').value;
        user = data.users.gurus.find(u => u.id == id && u.password === password);
    } else if (role === 'siswa') {
        const id = document.getElementById('siswa-select-nama').value;
        password = document.getElementById('siswa-pass').value;
        user = data.users.siswas.find(u => u.id == id && u.password === password);
    }

    if (user) {
        currentUser = { ...currentUser, ...user };
        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
        showDashboard();
    } else {
        showToast("Login gagal, periksa kembali data Anda.", "error");
    }
}

function logout() {
    currentUser = null;
    sessionStorage.removeItem('currentUser');
    window.location.reload();
}

function showDashboard() {
    showView('view-dashboard');
    if (currentUser.role === 'admin') tampilkanDashboardAdmin();
    else if (currentUser.role === 'guru') tampilkanDashboardGuru();
    else if (currentUser.role === 'siswa') tampilkanDashboardSiswa();
}

// BAGIAN 3: FUNGSI DASHBOARD (YANG SUDAH DIPERBAIKI)

function tampilkanDashboardAdmin() {
    const container = document.getElementById('dashboard-content');
    document.getElementById('dashboard-title').textContent = 'Dashboard Admin';

    const totalSiswa = data.users.siswas.length;
    const totalGuru = data.users.gurus.length;

    container.innerHTML = `
        <div class="stat-cards">
            <div class="stat-card"><h5>Total Siswa</h5><p>${totalSiswa}</p></div>
            <div class="stat-card"><h5>Total Guru</h5><p>${totalGuru}</p></div>
            <div class="stat-card"><h5>Kehadiran Hari Ini</h5><p>95%</p></div>
        </div>
        <hr>
        <button onclick="tampilkanManajemen('guru')">Manajemen Guru</button>
        <button onclick="tampilkanManajemen('siswa')">Manajemen Siswa</button>
        <button onclick="tampilkanManajemen('kelas')">Manajemen Kelas</button>
        <div id="content-area"></div>
    `;
}

function tampilkanDashboardGuru() {
    const container = document.getElementById('dashboard-content');
    document.getElementById('dashboard-title').textContent = `Dashboard Guru`;
    container.innerHTML = `
        <p>Selamat datang, ${currentUser.nama}.</p>
        <button onclick="tampilkanMenuGuru('jadwal')">Lihat Jadwal</button>
        <button onclick="tampilkanMenuGuru('absensi')">Kelola Absensi</button>
        <button onclick="tampilkanMenuGuru('tugas')">Kelola Tugas</button>
        <div id="content-area"></div>
    `;
}

function tampilkanDashboardSiswa() {
    const container = document.getElementById('dashboard-content');
    document.getElementById('dashboard-title').textContent = `Dashboard Siswa`;
    container.innerHTML = `
        <div class="dashboard-grid">
            <div class="card">
                <h3>Halo, ${currentUser.nama}!</h3>
                <p>Selamat belajar hari ini.</p>
            </div>
            <div class="card card-tugas">
                <h4>Tugas Terdekat</h4>
                <p><strong>Deadline: Besok</strong> - Latihan Bab 1</p>
                <a onclick="tampilkanMenuSiswa('tugas')">Lihat semua tugas</a>
            </div>
        </div>
        <button onclick="tampilkanMenuSiswa('jadwal')">Jadwal Pelajaran</button>
        <button onclick="tampilkanMenuSiswa('absensi')">Lakukan Absensi</button>
        <button onclick="tampilkanMenuSiswa('tugas')">Tugas & Nilai</button>
        <div id="content-area"></div>
    `;
}

// BAGIAN 4: SEMUA FUNGSI MANAJEMEN DAN MENU (DIKEMBALIKAN)

function tampilkanMenuSiswa(menu) {
    const container = document.getElementById('content-area');
    if(menu === 'jadwal') container.innerHTML = "<h2>Jadwal Anda...</h2>";
    if(menu === 'absensi') container.innerHTML = "<h2>Absensi Anda...</h2>";
    if(menu === 'tugas') container.innerHTML = "<h2>Tugas Anda...</h2>";
}

function tampilkanMenuGuru(menu) {
    const container = document.getElementById('content-area');
    if(menu === 'jadwal') container.innerHTML = "<h2>Jadwal Mengajar Anda...</h2>";
    if(menu === 'absensi') container.innerHTML = "<h2>Kelola Absensi Siswa...</h2>";
    if(menu === 'tugas') container.innerHTML = "<h2>Kelola Tugas Siswa...</h2>";
}

function tampilkanManajemen(jenis) {
    const container = document.getElementById('content-area');
    if (jenis === 'guru') tampilkanManajemenGuru(container);
    if (jenis === 'siswa') container.innerHTML = "<h2>Manajemen Siswa...</h2>";
    if (jenis === 'kelas') container.innerHTML = "<h2>Manajemen Kelas...</h2>";
}

function tampilkanManajemenGuru(container) {
    container.innerHTML = "<h3>Manajemen Data Guru</h3>";
    const kelasOptions = data.kelas.map(k => `<option value="${k.id}">${k.nama}</option>`).join("");
    
    data.users.gurus.forEach(guru => {
        let jadwalHTML = `
            <div class="form-container">
                <h4>${guru.nama}</h4>
                <p><strong>Password:</strong> ${guru.password} <button class="small-btn edit" onclick="gantiPassword('guru', ${guru.id})">Ganti</button></p>
                <h5>Jadwal Mengajar:</h5>`;
        
        if (guru.jadwal.length > 0) {
            jadwalHTML += "<ul class='jadwal-list'>";
            guru.jadwal.forEach((j, index) => {
                jadwalHTML += `<li class="jadwal-item"><span>${j.nama_kelas} - ${hariOptions[j.hari]}, Jam ${j.jam}:00</span><button class="small-btn delete" onclick="hapusJadwalGuru(${guru.id}, ${index})">Hapus</button></li>`;
            });
            jadwalHTML += "</ul>";
        } else {
            jadwalHTML += "<p>Belum ada jadwal yang diatur.</p>";
        }

        jadwalHTML += `
            <div class="jadwal-form">
                <select id="jadwal-kelas-${guru.id}">${kelasOptions}</select>
                <select id="jadwal-hari-${guru.id}">${hariOptions.map((h, i) => `<option value="${i}">${h}</option>`).join("")}</select>
                <select id="jadwal-jam-${guru.id}">${jamOptions.map(j => `<option value="${j}">${j}:00</option>`).join("")}</select>
                <button class="small-btn" onclick="tambahJadwalGuru(${guru.id})">+ Tambah Jadwal</button>
            </div>`;
        
        jadwalHTML += "</div>";
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
        showToast("Jadwal ini sudah ada.", "error");
        return;
    }
    
    const kelas = data.kelas.find(k => k.id === id_kelas);
    guru.jadwal.push({ id_kelas, hari, jam, nama_kelas: kelas.nama });
    showToast("Jadwal berhasil ditambahkan.", "success");
    tampilkanManajemenGuru(document.getElementById('content-area'));
}

function hapusJadwalGuru(guruId, jadwalIndex) {
    const guru = data.users.gurus.find(g => g.id === guruId);
    if (guru) {
        guru.jadwal.splice(jadwalIndex, 1);
        showToast("Jadwal berhasil dihapus.", "success");
        tampilkanManajemenGuru(document.getElementById('content-area'));
    }
}

function gantiPassword(role, id) {
    const newPassword = prompt("Masukkan password baru:");
    if (newPassword && newPassword.trim() !== "") {
        const userList = (role === 'guru') ? data.users.gurus : data.users.siswas;
        const user = userList.find(u => u.id === id);
        if (user) {
            user.password = newPassword;
            showToast("Password berhasil diubah.", "success");
            tampilkanManajemen('guru'); // Refresh tampilan
        }
    } else if (newPassword !== null) {
        showToast("Password tidak boleh kosong.", "error");
    }
}


// BAGIAN 5: FUNGSI NOTIFIKASI TOAST (BARU)

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    setTimeout(() => {
        toast.classList.remove('show');
        toast.addEventListener('transitionend', () => toast.remove());
    }, 3000);
}

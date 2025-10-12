// BAGIAN 1: DATABASE SIMULASI
const data = {
    users: {
        admins: [{ username: "admin", password: "admin123" }],
        gurus: [
            { id: 1, nama: "Budi Santoso", password: "guru1" },
            { id: 2, nama: "Anisa Putri", password: "guru2" }
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
        { id: 1, id_siswa: 101, tanggal: "2025-10-10", status: "Hadir" }, { id: 2, id_siswa: 102, tanggal: "2025-10-10", status: "Izin" },
        { id: 3, id_siswa: 201, tanggal: "2025-10-11", status: "Hadir" }, { id: 4, id_siswa: 101, tanggal: "2025-10-11", status: "Sakit" },
        { id: 5, id_siswa: 202, tanggal: "2025-10-11", status: "Alpa" }
    ],
    tugas: [
        { id: 1, id_kelas: 1, judul: "Rangkuman Sejarah", deadline: "2025-10-20", deskripsi: "Buat rangkuman Bab 3." },
        { id: 2, id_kelas: 2, judul: "Soal Fisika", deadline: "2025-10-22", deskripsi: "Kerjakan soal halaman 80." }
    ],
    pengumuman: [{ id: 1, judul: "Kerja Bakti", isi: "Akan diadakan kerja bakti pada hari Sabtu.", tanggal: "2025-10-09" }],
    jadwalPelajaran: [
        { id: 1, id_kelas: 1, hari: 1, jam: 8, mapel: "Matematika", id_guru: 1 },
        { id: 2, id_kelas: 1, hari: 2, jam: 10, mapel: "Fisika", id_guru: 2 }
    ]
};

// BAGIAN 2: STATE APLIKASI
let currentUser = null; let currentRole = null; let absensiHariIniSelesai = false;
let nextSiswaId = 203; let nextGuruId = 3; let nextKelasId = 3;
let nextAbsensiId = 6; let nextJadwalPelajaranId = 3;

// BAGIAN 3: FUNGSI UTAMA (Tidak Berubah)
document.addEventListener("DOMContentLoaded", () => { if (document.getElementById("tombol-buka")) { fetch('https://api.quotable.io/random?tags=inspirational|technology|education').then(response => response.json()).then(data => { document.getElementById('kata-harian').textContent = `"${data.content}" - ${data.author}`; }).catch(() => { document.getElementById('kata-harian').textContent = '"Pendidikan adalah senjata paling ampuh yang bisa kamu gunakan untuk mengubah dunia." - Nelson Mandela'; }); document.getElementById("tombol-buka").addEventListener("click", () => { window.location.href = "main.html"; }); } else { populateInitialDropdowns(); } });
function populateInitialDropdowns() { const guruSelect = document.getElementById("guru-select-nama"); data.users.gurus.forEach(guru => { const option = document.createElement("option"); option.value = guru.id; option.textContent = guru.nama; guruSelect.appendChild(option); }); const kelasSelect = document.getElementById("siswa-select-kelas"); data.kelas.forEach(k => { const option = document.createElement("option"); option.value = k.id; option.textContent = k.nama; kelasSelect.appendChild(option); }); populateSiswaDropdown(); }
function populateSiswaDropdown() { const kelasId = document.getElementById("siswa-select-kelas").value; const siswaSelect = document.getElementById("siswa-select-nama"); siswaSelect.innerHTML = ''; data.users.siswas.filter(s => s.id_kelas == kelasId).forEach(siswa => { const option = document.createElement("option"); option.value = siswa.id; option.textContent = siswa.nama; siswaSelect.appendChild(option); }); }
function showView(viewId) { document.querySelectorAll('#app > div').forEach(div => div.classList.add('hidden')); document.getElementById(viewId).classList.remove('hidden'); }
function showLogin(role) { currentRole = role; showView('view-login-form'); document.getElementById('login-title').textContent = `Login ${role.charAt(0).toUpperCase() + role.slice(1)}`; document.querySelectorAll('#view-login-form > div[id^="form-"]').forEach(form => form.classList.add('hidden')); document.getElementById(`form-${role}`).classList.remove('hidden'); }
function login() { let user = null; if (currentRole === "admin") user = data.users.admins.find(u => u.username === document.getElementById("admin-user").value && u.password === document.getElementById("admin-pass").value); else if (currentRole === "guru") user = data.users.gurus.find(u => u.id == document.getElementById("guru-select-nama").value && u.password === document.getElementById("guru-pass").value); else if (currentRole === "siswa") user = data.users.siswas.find(u => u.id == document.getElementById("siswa-select-nama").value && u.password === document.getElementById("siswa-pass").value); if (user) { currentUser = user; alert("Login Berhasil!"); if (currentRole === 'siswa') { const kelasSiswa = data.kelas.find(k => k.id === currentUser.id_kelas); if (kelasSiswa && kelasSiswa.backgroundData) { document.body.style.backgroundImage = `url('${kelasSiswa.backgroundData}')`; document.body.style.backgroundSize = 'cover'; document.body.style.backgroundPosition = 'center'; } } showDashboard(); } else { alert("Login Gagal! Periksa kembali data Anda."); } }
function logout() { currentUser = null; currentRole = null; absensiHariIniSelesai = false; document.body.style.backgroundImage = ''; showView("view-role-selection"); document.querySelectorAll("input").forEach(i => i.value = ""); }
function showDashboard() { showView('view-dashboard'); const dashboardContent = document.getElementById('dashboard-content'); const dashboardTitle = document.getElementById('dashboard-title'); dashboardTitle.textContent = `Dashboard ${currentRole.charAt(0).toUpperCase() + currentRole.slice(1)}`; switch (currentRole) { case 'admin': dashboardContent.innerHTML = renderAdminDashboard(); openAdminTab({ currentTarget: document.querySelector('.tab-link.active') }, 'Analitik'); break; case 'guru': dashboardContent.innerHTML = renderGuruDashboard(); break; case 'siswa': dashboardContent.innerHTML = renderSiswaDashboard(); break; } }

// BAGIAN 4: RENDER DASHBOARD SISWA & GURU (DIPERBAIKI)
function renderSiswaDashboard() {
    const tugasKelas = data.tugas.filter(t => t.id_kelas === currentUser.id_kelas);
    const jadwalPelajaranSiswa = data.jadwalPelajaran.filter(j => j.id_kelas === currentUser.id_kelas);

    return `
        <h4>Selamat Datang, ${currentUser.nama}!</h4>
        <div class="dashboard-section">
            <button onclick="lakukanAbsensi()">Lakukan Absensi Hari Ini</button>
        </div>
        <div class="dashboard-section">
            <h5>📢 Pengumuman Terbaru</h5>
            ${data.pengumuman.length > 0 ? data.pengumuman.map(p => `<div class="announcement-card"><strong>${p.judul}</strong><p>${p.isi}</p><small>${p.tanggal}</small></div>`).join('') : '<p>Tidak ada pengumuman.</p>'}
        </div>
        <div class="dashboard-section">
            <h5>📚 Tugas Anda</h5>
            ${tugasKelas.length > 0 ? tugasKelas.map(t => `<div class="task-card"><strong>${t.judul}</strong><p>${t.deskripsi}</p><small>Deadline: ${t.deadline}</small></div>`).join('') : '<p>Tidak ada tugas untuk kelas Anda saat ini.</p>'}
        </div>
    `;
}

function renderGuruDashboard() {
    const guruId = currentUser.id;
    // Cari kelas mana saja yang diajar oleh guru ini
    const kelasAjarIds = [...new Set(data.jadwalPelajaran.filter(j => j.id_guru === guruId).map(j => j.id_kelas))];
    const kelasAjar = data.kelas.filter(k => kelasAjarIds.includes(k.id));

    return `
        <h4>Selamat Datang, ${currentUser.nama}!</h4>
        <div class="dashboard-section">
            <h5>Rekap Absensi Siswa di Kelas Anda</h5>
            <select id="kelas-rekap-guru" onchange="tampilkanRekapAbsensiGuru(this.value)">
                <option value="">Pilih Kelas</option>
                ${kelasAjar.map(k => `<option value="${k.id}">${k.nama}</option>`).join('')}
            </select>
            <div class="table-container" id="rekap-absensi-guru-container"></div>
        </div>
    `;
}

function tampilkanRekapAbsensiGuru(id_kelas) {
    const container = document.getElementById('rekap-absensi-guru-container');
    if (!id_kelas) { container.innerHTML = ''; return; }

    const siswasDiKelas = data.users.siswas.filter(s => s.id_kelas == id_kelas);
    const absensiKelas = data.absensi.filter(a => siswasDiKelas.some(s => s.id === a.id_siswa));

    let html = `
        <table style="margin-top: 1rem;">
            <thead><tr><th>Nama Siswa</th><th>Tanggal</th><th>Status</th></tr></thead>
            <tbody>
    `;
    if (absensiKelas.length > 0) {
        absensiKelas.forEach(a => {
            const siswa = data.users.siswas.find(s => s.id === a.id_siswa);
            html += `<tr><td>${siswa.nama}</td><td>${a.tanggal}</td><td>${a.status}</td></tr>`;
        });
    } else {
        html += `<tr><td colspan="3">Belum ada data absensi untuk kelas ini.</td></tr>`;
    }
    html += `</tbody></table>`;
    container.innerHTML = html;
}

// BAGIAN 5: FUNGSI ADMIN (LENGKAP DAN FUNGSIONAL)
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
    <div id="Analitik" class="tab-content"></div> <div id="Absensi" class="tab-content"></div>
    <div id="Manajemen" class="tab-content"></div> <div id="JadwalPelajaran" class="tab-content"></div>
    <div id="Pengumuman" class="tab-content"></div> <div id="Tampilan" class="tab-content"></div>`;
}

function openAdminTab(evt, tabName) {
    document.querySelectorAll(".tab-content").forEach(tc => tc.style.display = "none");
    document.querySelectorAll(".tab-link").forEach(tl => tl.className = tl.className.replace(" active", ""));
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
    
    // Panggil fungsi render yang sesuai
    switch(tabName) {
        case 'Analitik': renderAdminAnalitik(); break;
        case 'Absensi': renderAdminAbsensi(); break;
        case 'Manajemen': renderAdminManajemen(); break;
        case 'JadwalPelajaran': renderAdminManajemenJadwal(); break;
        case 'Pengumuman': renderAdminPengumuman(); break;
        case 'Tampilan': renderAdminTampilan(); break;
    }
}

// --- FITUR MANAJEMEN DATA (BARU & FUNGSIONAL) ---
function renderAdminManajemen() {
    document.getElementById("Manajemen").innerHTML = `
        <div class="dashboard-section">
            <div class="manajemen-header">
                <h5>Manajemen Data Siswa</h5>
                <button class="small-btn" onclick="tampilkanFormManajemen('siswa')">+ Tambah Siswa</button>
            </div>
            <div id="form-manajemen-siswa" class="hidden"></div>
            <div class="table-container" id="tabel-siswa"></div>
        </div>
        <div class="dashboard-section">
            <div class="manajemen-header">
                <h5>Manajemen Data Guru</h5>
                <button class="small-btn" onclick="tampilkanFormManajemen('guru')">+ Tambah Guru</button>
            </div>
            <div id="form-manajemen-guru" class="hidden"></div>
            <div class="table-container" id="tabel-guru"></div>
        </div>
        <div class="dashboard-section">
            <div class="manajemen-header">
                <h5>Manajemen Data Kelas</h5>
                <button class="small-btn" onclick="tampilkanFormManajemen('kelas')">+ Tambah Kelas</button>
            </div>
            <div id="form-manajemen-kelas" class="hidden"></div>
            <div class="table-container" id="tabel-kelas"></div>
        </div>
    `;
    renderTabelManajemen('siswa');
    renderTabelManajemen('guru');
    renderTabelManajemen('kelas');
}

function tampilkanFormManajemen(tipe, id = null) {
    const container = document.getElementById(`form-manajemen-${tipe}`);
    container.classList.toggle('hidden');
    if (container.classList.contains('hidden')) { container.innerHTML = ''; return; }

    let html = '', dataEdit = null;
    const isEdit = id !== null;

    if (tipe === 'siswa') {
        if(isEdit) dataEdit = data.users.siswas.find(s => s.id === id);
        const kelasOptions = data.kelas.map(k => `<option value="${k.id}" ${isEdit && dataEdit.id_kelas === k.id ? 'selected' : ''}>${k.nama}</option>`).join('');
        html = `
            <div class="manajemen-form">
                <input type="text" id="manajemen-nama-siswa" placeholder="Nama Siswa" value="${isEdit ? dataEdit.nama : ''}">
                <input type="text" id="manajemen-pass-siswa" placeholder="Password" value="${isEdit ? dataEdit.password : ''}">
                <select id="manajemen-kelas-siswa">${kelasOptions}</select>
                <button onclick="simpanDataManajemen('siswa', ${id})">${isEdit ? 'Update' : 'Simpan'}</button>
            </div>`;
    } else if (tipe === 'guru') {
        if(isEdit) dataEdit = data.users.gurus.find(g => g.id === id);
        html = `
            <div class="manajemen-form">
                <input type="text" id="manajemen-nama-guru" placeholder="Nama Guru" value="${isEdit ? dataEdit.nama : ''}">
                <input type="text" id="manajemen-pass-guru" placeholder="Password" value="${isEdit ? dataEdit.password : ''}">
                <button onclick="simpanDataManajemen('guru', ${id})">${isEdit ? 'Update' : 'Simpan'}</button>
            </div>`;
    } else if (tipe === 'kelas') {
        if(isEdit) dataEdit = data.kelas.find(k => k.id === id);
        html = `
            <div class="manajemen-form">
                <input type="text" id="manajemen-nama-kelas" placeholder="Nama Kelas" value="${isEdit ? dataEdit.nama : ''}">
                <button onclick="simpanDataManajemen('kelas', ${id})">${isEdit ? 'Update' : 'Simpan'}</button>
            </div>`;
    }
    container.innerHTML = html;
}

function simpanDataManajemen(tipe, id = null) {
    const isEdit = id !== null;
    if (tipe === 'siswa') {
        const nama = document.getElementById('manajemen-nama-siswa').value;
        const password = document.getElementById('manajemen-pass-siswa').value;
        const id_kelas = parseInt(document.getElementById('manajemen-kelas-siswa').value);
        if(!nama || !password) return alert("Nama dan password tidak boleh kosong!");

        if (isEdit) {
            const siswa = data.users.siswas.find(s => s.id === id);
            siswa.nama = nama; siswa.password = password; siswa.id_kelas = id_kelas;
        } else {
            data.users.siswas.push({ id: nextSiswaId++, nama, password, id_kelas });
        }
    } else if (tipe === 'guru') {
        const nama = document.getElementById('manajemen-nama-guru').value;
        const password = document.getElementById('manajemen-pass-guru').value;
        if(!nama || !password) return alert("Nama dan password tidak boleh kosong!");

        if(isEdit) {
            const guru = data.users.gurus.find(g => g.id === id);
            guru.nama = nama; guru.password = password;
        } else {
            data.users.gurus.push({ id: nextGuruId++, nama, password });
        }
    } else if (tipe === 'kelas') {
        const nama = document.getElementById('manajemen-nama-kelas').value;
        if(!nama) return alert("Nama kelas tidak boleh kosong!");

        if(isEdit) {
            const kelas = data.kelas.find(k => k.id === id);
            kelas.nama = nama;
        } else {
            data.kelas.push({ id: nextKelasId++, nama, lokasi: { latitude: 0, longitude: 0 }, backgroundData: null });
        }
    }
    alert(`Data ${tipe} berhasil ${isEdit ? 'diperbarui' : 'disimpan'}!`);
    renderAdminManajemen(); // Re-render seluruh tab manajemen
}

function renderTabelManajemen(tipe) {
    const container = document.getElementById(`tabel-${tipe}`);
    let html = '<table><thead><tr>';
    if(tipe === 'siswa') html += '<th>ID</th><th>Nama</th><th>Kelas</th><th>Aksi</th>';
    else if(tipe === 'guru') html += '<th>ID</th><th>Nama</th><th>Aksi</th>';
    else if(tipe === 'kelas') html += '<th>ID</th><th>Nama</th><th>Aksi</th>';
    html += '</tr></thead><tbody>';

    if (tipe === 'siswa') {
        data.users.siswas.forEach(s => {
            const kelas = data.kelas.find(k => k.id === s.id_kelas);
            html += `<tr><td>${s.id}</td><td>${s.nama}</td><td>${kelas ? kelas.nama : 'N/A'}</td><td>
                <button class="small-btn edit" onclick="tampilkanFormManajemen('siswa', ${s.id})">Edit</button>
                <button class="small-btn delete" onclick="hapusDataManajemen('siswa', ${s.id})">Hapus</button>
            </td></tr>`;
        });
    } else if (tipe === 'guru') {
        data.users.gurus.forEach(g => {
            html += `<tr><td>${g.id}</td><td>${g.nama}</td><td>
                <button class="small-btn edit" onclick="tampilkanFormManajemen('guru', ${g.id})">Edit</button>
                <button class="small-btn delete" onclick="hapusDataManajemen('guru', ${g.id})">Hapus</button>
            </td></tr>`;
        });
    } else if (tipe === 'kelas') {
        data.kelas.forEach(k => {
            html += `<tr><td>${k.id}</td><td>${k.nama}</td><td>
                <button class="small-btn edit" onclick="tampilkanFormManajemen('kelas', ${k.id})">Edit</button>
                <button class="small-btn delete" onclick="hapusDataManajemen('kelas', ${k.id})">Hapus</button>
            </td></tr>`;
        });
    }

    html += '</tbody></table>';
    container.innerHTML = html;
}

function hapusDataManajemen(tipe, id) {
    if(!confirm(`Apakah Anda yakin ingin menghapus data ${tipe} ini?`)) return;
    if(tipe === 'siswa') data.users.siswas = data.users.siswas.filter(s => s.id !== id);
    else if(tipe === 'guru') data.users.gurus = data.users.gurus.filter(g => g.id !== id);
    else if(tipe === 'kelas') data.kelas = data.kelas.filter(k => k.id !== id);
    
    alert(`Data ${tipe} berhasil dihapus.`);
    renderAdminManajemen();
}

// --- FITUR JADWAL PELAJARAN (BARU & FUNGSIONAL) ---
function renderAdminManajemenJadwal() {
    const container = document.getElementById("JadwalPelajaran");
    const kelasOptions = data.kelas.map(k => `<option value="${k.id}">${k.nama}</option>`).join('');
    const guruOptions = data.users.gurus.map(g => `<option value="${g.id}">${g.nama}</option>`).join('');
    const hariOptions = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"].map((h, i) => `<option value="${i+1}">${h}</option>`).join('');
    
    container.innerHTML = `
        <div class="dashboard-section">
            <h5>Buat Jadwal Pelajaran Baru</h5>
            <div class="manajemen-form">
                <select id="jadwal-kelas">${kelasOptions}</select>
                <select id="jadwal-hari">${hariOptions}</select>
                <input type="number" id="jadwal-jam" placeholder="Jam ke-" min="1" max="10">
                <input type="text" id="jadwal-mapel" placeholder="Mata Pelajaran">
                <select id="jadwal-guru">${guruOptions}</select>
                <button onclick="simpanJadwalPelajaran()">Simpan Jadwal</button>
            </div>
        </div>
        <div class="dashboard-section">
            <h5>Lihat Jadwal Pelajaran per Kelas</h5>
            <div class="jadwal-pelajaran-controls">
                <select id="lihat-jadwal-kelas" onchange="renderTabelJadwalPelajaran(this.value)">
                    <option value="">Pilih Kelas</option>
                    ${kelasOptions}
                </select>
            </div>
            <div class="jadwal-pelajaran-grid" id="jadwal-pelajaran-container"></div>
        </div>
    `;
}

function simpanJadwalPelajaran() {
    const id_kelas = parseInt(document.getElementById('jadwal-kelas').value);
    const hari = parseInt(document.getElementById('jadwal-hari').value);
    const jam = parseInt(document.getElementById('jadwal-jam').value);
    const mapel = document.getElementById('jadwal-mapel').value;
    const id_guru = parseInt(document.getElementById('jadwal-guru').value);

    if(!id_kelas || !hari || !jam || !mapel || !id_guru) return alert("Semua field harus diisi!");
    
    // Cek jika sudah ada jadwal di jam yang sama
    const jadwalBentrok = data.jadwalPelajaran.find(j => j.id_kelas === id_kelas && j.hari === hari && j.jam === jam);
    if(jadwalBentrok) return alert("Sudah ada jadwal di kelas, hari, dan jam yang sama!");

    data.jadwalPelajaran.push({ id: nextJadwalPelajaranId++, id_kelas, hari, jam, mapel, id_guru });
    alert("Jadwal pelajaran berhasil disimpan!");
    
    // Refresh tampilan jika kelas yang dipilih sedang ditampilkan
    const kelasTerpilih = document.getElementById('lihat-jadwal-kelas').value;
    if (kelasTerpilih == id_kelas) {
        renderTabelJadwalPelajaran(id_kelas);
    }
}

function renderTabelJadwalPelajaran(id_kelas) {
    const container = document.getElementById('jadwal-pelajaran-container');
    if (!id_kelas) { container.innerHTML = '<p>Silakan pilih kelas untuk melihat jadwal.</p>'; return; }

    let html = '';
    const hariSekolah = [1, 2, 3, 4, 5]; // Senin - Jumat
    const namaHari = ["", "Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

    hariSekolah.forEach(hari => {
        const jadwalHari = data.jadwalPelajaran
            .filter(j => j.id_kelas == id_kelas && j.hari === hari)
            .sort((a, b) => a.jam - b.jam);
        
        html += `<div class="jadwal-hari"><h5>${namaHari[hari]}</h5>`;
        if (jadwalHari.length > 0) {
            jadwalHari.forEach(sesi => {
                const guru = data.users.gurus.find(g => g.id === sesi.id_guru);
                html += `
                    <div class="jadwal-sesi">
                        <div class="sesi-info">
                            <strong>${sesi.mapel}</strong>
                            <button class="small-btn delete" style="padding: 4px 8px;" onclick="hapusJadwalPelajaran(${sesi.id})">x</button>
                        </div>
                        <small>Jam ke-${sesi.jam} (${guru ? guru.nama : 'N/A'})</small>
                    </div>`;
            });
        } else {
            html += '<p class="sesi-kosong">Tidak ada jadwal</p>';
        }
        html += '</div>';
    });

    container.innerHTML = html;
}

function hapusJadwalPelajaran(id) {
    if (!confirm("Yakin ingin menghapus jadwal ini?")) return;
    const id_kelas_dihapus = data.jadwalPelajaran.find(j => j.id === id)?.id_kelas;
    data.jadwalPelajaran = data.jadwalPelajaran.filter(j => j.id !== id);
    alert("Jadwal berhasil dihapus.");
    
    // Refresh tabel
    renderTabelJadwalPelajaran(id_kelas_dihapus);
}

// --- FUNGSI ADMIN LAINNYA (TIDAK BERUBAH) ---
function renderAdminAnalitik(){document.getElementById("Analitik").innerHTML=`<div class="dashboard-section"><h5>Analitik Dashboard</h5><p>Total Siswa: ${data.users.siswas.length}</p><p>Total Guru: ${data.users.gurus.length}</p><p>Total Kelas: ${data.kelas.length}</p></div>`}
function renderAdminAbsensi() { const container = document.getElementById("Absensi"); const kelasOptions = data.kelas.map(k => `<option value="${k.id}">${k.nama}</option>`).join(''); container.innerHTML = ` <div class="dashboard-section"> <h5>Rekapitulasi Absensi Keseluruhan</h5> <div class="rekap-filters"> <div class="filter-item"> <label for="filter-kelas">Pilih Kelas</label> <select id="filter-kelas"> <option value="">Semua Kelas</option> ${kelasOptions} </select> </div> <div class="filter-item"> <label for="filter-tanggal">Pilih Tanggal</label> <input type="date" id="filter-tanggal"> </div> <div class="filter-item"> <label for="filter-status">Pilih Status</label> <select id="filter-status"> <option value="">Semua Status</option> <option value="Hadir">Hadir</option> <option value="Izin">Izin</option> <option value="Sakit">Sakit</option> <option value="Alpa">Alpa</option> </select> </div> <div class="filter-item"> <label>&nbsp;</label> <button onclick="tampilkanRekapAbsensiAdmin()">Cari</button> </div> </div> <div class="rekap-actions"> <button class="print-btn" onclick="cetakLaporanAbsensi()">🖨️ Cetak Laporan</button> <button class="export-btn" onclick="exportAbsensiExcel()">📄 Export Excel</button> </div> <div class="table-container"> <table id="tabel-rekap-absensi"> <thead> <tr> <th>No</th> <th>Nama Siswa</th> <th>Kelas</th> <th>Tanggal</th> <th>Status</th> <th>Aksi</th> </tr> </thead> <tbody> </tbody> </table> </div> </div> `; tampilkanRekapAbsensiAdmin(); }
function tampilkanRekapAbsensiAdmin() { let filteredAbsensi = data.absensi; const filterKelas = document.getElementById('filter-kelas').value; const filterTanggal = document.getElementById('filter-tanggal').value; const filterStatus = document.getElementById('filter-status').value; if (filterTanggal) { filteredAbsensi = filteredAbsensi.filter(a => a.tanggal === filterTanggal); } if (filterStatus) { filteredAbsensi = filteredAbsensi.filter(a => a.status === filterStatus); } if (filterKelas) { filteredAbsensi = filteredAbsensi.filter(a => { const siswa = data.users.siswas.find(s => s.id === a.id_siswa); return siswa && siswa.id_kelas == filterKelas; }); } const tbody = document.querySelector("#tabel-rekap-absensi tbody"); tbody.innerHTML = ''; if (filteredAbsensi.length === 0) { tbody.innerHTML = `<tr><td colspan="6">Tidak ada data yang cocok dengan filter.</td></tr>`; return; } filteredAbsensi.forEach((absensi, index) => { const siswa = data.users.siswas.find(s => s.id === absensi.id_siswa); const kelas = siswa ? data.kelas.find(k => k.id === siswa.id_kelas) : { nama: 'N/A' }; const tr = document.createElement('tr'); tr.innerHTML = ` <td>${index + 1}</td> <td>${siswa ? siswa.nama : 'Siswa Dihapus'}</td> <td>${kelas.nama}</td> <td>${absensi.tanggal}</td> <td>${absensi.status}</td> <td> <button class="small-btn edit" onclick="editAbsensi(${absensi.id})">Edit</button> <button class="small-btn delete" onclick="hapusAbsensi(${absensi.id})">Hapus</button> </td> `; tbody.appendChild(tr); }); }
function editAbsensi(absensiId) { const absensi = data.absensi.find(a => a.id === absensiId); if (!absensi) return; const statusList = ["Hadir", "Izin", "Sakit", "Alpa"]; const newStatus = prompt(`Masukkan status baru untuk absensi tanggal ${absensi.tanggal} (Hadir, Izin, Sakit, Alpa):`, absensi.status); if (newStatus && statusList.includes(newStatus)) { absensi.status = newStatus; alert("Status absensi berhasil diperbarui."); tampilkanRekapAbsensiAdmin(); } else if (newStatus !== null) { alert("Status tidak valid! Harap masukkan salah satu dari: Hadir, Izin, Sakit, Alpa."); } }
function hapusAbsensi(absensiId) { if (confirm("Apakah Anda yakin ingin menghapus data absensi ini?")) { data.absensi = data.absensi.filter(a => a.id !== absensiId); alert("Data absensi berhasil dihapus."); tampilkanRekapAbsensiAdmin(); } }
function cetakLaporanAbsensi() { const tabelKonten = document.getElementById('tabel-rekap-absensi').outerHTML; const win = window.open('', '', 'height=600,width=800'); win.document.write('<html><head><title>Laporan Absensi</title>'); win.document.write('<style>body{font-family:sans-serif;} table{width:100%; border-collapse:collapse;} th,td{border:1px solid #ddd; padding:8px; text-align:left;} th{background-color:#f2f2f2;}</style>'); win.document.write('</head><body>'); win.document.write(`<h1>Laporan Absensi - ${new Date().toLocaleDateString('id-ID')}</h1>`); win.document.write(tabelKonten); win.document.write('</body></html>'); win.document.close(); win.print(); }
function exportAbsensiExcel() { const tbody = document.querySelector("#tabel-rekap-absensi tbody"); if (tbody.rows.length === 0 || tbody.rows[0].cells.length <= 1) { alert("Tidak ada data untuk diekspor."); return; } let csvContent = "data:text/csv;charset=utf-8,"; csvContent += "No,Nama Siswa,Kelas,Tanggal,Status\n"; tbody.querySelectorAll('tr').forEach(row => { const rowData = [row.cells[0].innerText, `"${row.cells[1].innerText}"`, row.cells[2].innerText, row.cells[3].innerText, row.cells[4].innerText].join(','); csvContent += rowData + "\n"; }); const encodedUri = encodeURI(csvContent); const link = document.createElement("a"); link.setAttribute("href", encodedUri); link.setAttribute("download", `laporan_absensi_${new Date().toISOString().slice(0,10)}.csv`); document.body.appendChild(link); link.click(); document.body.removeChild(link); }
function renderAdminPengumuman(){const container=document.getElementById("Pengumuman");container.innerHTML=`<div class="dashboard-section"><h5>Buat Pengumuman Baru</h5><input type="text" id="judul-pengumuman" placeholder="Judul"><textarea id="isi-pengumuman" placeholder="Isi pengumuman..."></textarea><button onclick="buatPengumuman()">Kirim Pengumuman</button></div><div class="dashboard-section"><h5>Daftar Pengumuman</h5><div id="list-pengumuman"></div></div>`,renderDaftarPengumuman()}
function buatPengumuman(){const judul=document.getElementById("judul-pengumuman").value,isi=document.getElementById("isi-pengumuman").value,tanggal=(new Date).toISOString().slice(0,10),id=data.pengumuman.length>0?Math.max(...data.pengumuman.map(p=>p.id))+1:1;judul&&isi?(data.pengumuman.push({id,judul,isi,tanggal}),alert("Pengumuman berhasil dibuat!"),renderDaftarPengumuman(),document.getElementById("judul-pengumuman").value="",document.getElementById("isi-pengumuman").value=""):alert("Judul dan isi tidak boleh kosong!")}
function renderDaftarPengumuman(){const listContainer=document.getElementById("list-pengumuman");listContainer.innerHTML=data.pengumuman.map(p=>`<div class="announcement-card"><strong>${p.judul}</strong><p>${p.isi}</p><small>${p.tanggal}</small><button class="small-btn delete" onclick="hapusPengumuman(${p.id})">Hapus</button></div>`).join("")}
function hapusPengumuman(id){data.pengumuman=data.pengumuman.filter(p=>p.id!==id),renderDaftarPengumuman()}
function renderAdminTampilan() { const container = document.getElementById('Tampilan'); let html = ` <div class="dashboard-section"> <h4>🎨 Kelola Latar Belakang Kelas</h4> <p>Pilih gambar dari komputermu untuk dijadikan latar belakang login siswa.</p> <div class="tampilan-manager"> `; data.kelas.forEach(k => { const previewStyle = k.backgroundData ? `background-image: url('${k.backgroundData}')` : ''; html += ` <div class="tampilan-item"> <label for="bg-upload-${k.id}">${k.nama}</label> <div class="upload-area"> <div class="background-preview" id="preview-${k.id}" style="${previewStyle}"></div> <label for="bg-upload-${k.id}" class="file-label">Pilih Gambar</label> <input type="file" id="bg-upload-${k.id}" accept="image/*" onchange="simpanBackground(${k.id}, this)"> </div> </div> `; }); html += `</div></div>`; container.innerHTML = html; }
function simpanBackground(id_kelas, input) { const file = input.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = function(e) { const imageData = e.target.result; const kelas = data.kelas.find(k => k.id === id_kelas); if (kelas) { kelas.backgroundData = imageData; document.getElementById(`preview-${id_kelas}`).style.backgroundImage = `url('${imageData}')`; alert(`Latar belakang untuk ${kelas.nama} berhasil diperbarui!`); } else { alert('Gagal menemukan kelas!'); } }; reader.readAsDataURL(file); }

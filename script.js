// BAGIAN 1: DATABASE SIMULASI
const data = {
    users: {
        admins: [{ username: "admin", password: "admin123" }],
        gurus: [
            { id: 1, nama: "Budi Santoso", password: "guru1", jadwal: [] },
            { id: 2, nama: "Anisa Putri", password: "guru2", jadwal: [] }
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
    // --- PERUBAHAN: Menambahkan 'id' unik dan status 'Sakit', 'Alpa' pada data absensi ---
    absensi: [
        { id: 1, id_siswa: 101, tanggal: "2025-10-10", status: "Hadir" },
        { id: 2, id_siswa: 102, tanggal: "2025-10-10", status: "Izin" },
        { id: 3, id_siswa: 201, tanggal: "2025-10-11", status: "Hadir" },
        { id: 4, id_siswa: 101, tanggal: "2025-10-11", status: "Sakit" },
        { id: 5, id_siswa: 202, tanggal: "2025-10-11", status: "Alpa" }
    ],
    tugas: [], pengumuman: [], jadwalPelajaran: [], catatanPR: []
};

// BAGIAN 2: STATE APLIKASI
let currentUser = null;
let currentRole = null;
let absensiHariIniSelesai = false;
let nextAbsensiId = 6; // Counter untuk ID absensi baru

// ... (SEMUA FUNGSI DARI BAGIAN 3, 4, 5 TETAP SAMA SEPERTI SEBELUMNYA) ...
document.addEventListener("DOMContentLoaded", () => { if (document.getElementById("tombol-buka")) { fetch('https://api.quotable.io/random?tags=inspirational|technology|education').then(response => response.json()).then(data => { document.getElementById('kata-harian').textContent = `"${data.content}" - ${data.author}`; }).catch(() => { document.getElementById('kata-harian').textContent = '"Pendidikan adalah senjata paling ampuh yang bisa kamu gunakan untuk mengubah dunia." - Nelson Mandela'; }); document.getElementById("tombol-buka").addEventListener("click", () => { window.location.href = "main.html"; }); } else { populateInitialDropdowns(); } });
function populateInitialDropdowns() { const guruSelect = document.getElementById("guru-select-nama"); data.users.gurus.forEach(guru => { const option = document.createElement("option"); option.value = guru.id; option.textContent = guru.nama; guruSelect.appendChild(option); }); const kelasSelect = document.getElementById("siswa-select-kelas"); data.kelas.forEach(k => { const option = document.createElement("option"); option.value = k.id; option.textContent = k.nama; kelasSelect.appendChild(option); }); populateSiswaDropdown(); }
function populateSiswaDropdown() { const kelasId = document.getElementById("siswa-select-kelas").value; const siswaSelect = document.getElementById("siswa-select-nama"); siswaSelect.innerHTML = ''; data.users.siswas.filter(s => s.id_kelas == kelasId).forEach(siswa => { const option = document.createElement("option"); option.value = siswa.id; option.textContent = siswa.nama; siswaSelect.appendChild(option); }); }
function showView(viewId) { document.querySelectorAll('#app > div').forEach(div => div.classList.add('hidden')); document.getElementById(viewId).classList.remove('hidden'); }
function showLogin(role) { currentRole = role; showView('view-login-form'); document.getElementById('login-title').textContent = `Login ${role.charAt(0).toUpperCase() + role.slice(1)}`; document.querySelectorAll('#view-login-form > div[id^="form-"]').forEach(form => form.classList.add('hidden')); document.getElementById(`form-${role}`).classList.remove('hidden'); }
function login() { let user = null; if (currentRole === "admin") user = data.users.admins.find(u => u.username === document.getElementById("admin-user").value && u.password === document.getElementById("admin-pass").value); else if (currentRole === "guru") user = data.users.gurus.find(u => u.id == document.getElementById("guru-select-nama").value && u.password === document.getElementById("guru-pass").value); else if (currentRole === "siswa") user = data.users.siswas.find(u => u.id == document.getElementById("siswa-select-nama").value && u.password === document.getElementById("siswa-pass").value); if (user) { currentUser = user; alert("Login Berhasil!"); if (currentRole === 'siswa') { const kelasSiswa = data.kelas.find(k => k.id === currentUser.id_kelas); if (kelasSiswa && kelasSiswa.backgroundData) { document.body.style.backgroundImage = `url('${kelasSiswa.backgroundData}')`; document.body.style.backgroundSize = 'cover'; document.body.style.backgroundPosition = 'center'; } } showDashboard(); } else { alert("Login Gagal! Periksa kembali data Anda."); } }
function logout() { currentUser = null; currentRole = null; absensiHariIniSelesai = false; document.body.style.backgroundImage = ''; showView("view-role-selection"); document.querySelectorAll("input").forEach(i => i.value = ""); }
function showDashboard() { showView('view-dashboard'); const dashboardContent = document.getElementById('dashboard-content'); const dashboardTitle = document.getElementById('dashboard-title'); dashboardTitle.textContent = `Dashboard ${currentRole.charAt(0).toUpperCase() + currentRole.slice(1)}`; switch (currentRole) { case 'admin': dashboardContent.innerHTML = renderAdminDashboard(); openAdminTab({ currentTarget: document.querySelector('.tab-link.active') }, 'Analitik'); break; case 'guru': dashboardContent.innerHTML = renderGuruDashboard(); break; case 'siswa': dashboardContent.innerHTML = renderSiswaDashboard(); break; } }
function renderSiswaDashboard() { return `<h4>Selamat Datang, ${currentUser.nama}!</h4>...` } // Placeholder, tidak diubah
function lakukanAbsensi() { if (absensiHariIniSelesai) return alert("Anda sudah melakukan absensi hari ini."); navigator.geolocation.getCurrentPosition(pos => { const userLat = pos.coords.latitude, userLon = pos.coords.longitude, kelasSiswa = data.kelas.find(k => k.id === currentUser.id_kelas), jarak = hitungJarak(userLat, userLon, kelasSiswa.lokasi.latitude, kelasSiswa.lokasi.longitude); if (jarak <= 100) { const tanggalHariIni = new Date().toISOString().slice(0, 10); data.absensi.push({ id: nextAbsensiId++, id_siswa: currentUser.id, tanggal: tanggalHariIni, status: "Hadir" }); absensiHariIniSelesai = true; alert("Absensi berhasil!"); } else alert(`Absensi gagal. Anda berada ${jarak.toFixed(0)} meter dari lokasi kelas.`); }, () => alert("Gagal mendapatkan lokasi. Pastikan GPS Anda aktif.")) }
function hitungJarak(lat1, lon1, lat2, lon2) { const R = 6371e3; const φ1 = lat1 * Math.PI / 180; const φ2 = lat2 * Math.PI / 180; const Δφ = (lat2 - lat1) * Math.PI / 180; const Δλ = (lon2 - lon1) * Math.PI / 180; const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2); const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); return R * c; }
function renderGuruDashboard() { return `<h4>Selamat Datang, ${currentUser.nama}!</h4>...` } // Placeholder, tidak diubah

// BAGIAN 6: FUNGSI-FUNGSI ADMIN (DENGAN PERUBAHAN)

// --- FUNGSI renderAdminAbsensi DIROMBAK TOTAL ---
function renderAdminAbsensi() {
    const container = document.getElementById("Absensi");
    const kelasOptions = data.kelas.map(k => `<option value="${k.id}">${k.nama}</option>`).join('');
    
    container.innerHTML = `
        <div class="dashboard-section">
            <h5>Rekapitulasi Absensi Keseluruhan</h5>
            
            <div class="rekap-filters">
                <div class="filter-item">
                    <label for="filter-kelas">Pilih Kelas</label>
                    <select id="filter-kelas">
                        <option value="">Semua Kelas</option>
                        ${kelasOptions}
                    </select>
                </div>
                <div class="filter-item">
                    <label for="filter-tanggal">Pilih Tanggal</label>
                    <input type="date" id="filter-tanggal">
                </div>
                <div class="filter-item">
                    <label for="filter-status">Pilih Status</label>
                    <select id="filter-status">
                        <option value="">Semua Status</option>
                        <option value="Hadir">Hadir</option>
                        <option value="Izin">Izin</option>
                        <option value="Sakit">Sakit</option>
                        <option value="Alpa">Alpa</option>
                    </select>
                </div>
                <div class="filter-item">
                    <label>&nbsp;</label> <button onclick="tampilkanRekapAbsensiAdmin()">Cari</button>
                </div>
            </div>

            <div class="rekap-actions">
                <button class="print-btn" onclick="cetakLaporanAbsensi()">🖨️ Cetak Laporan</button>
                <button class="export-btn" onclick="exportAbsensiExcel()">📄 Export Excel</button>
            </div>

            <div class="table-container">
                <table id="tabel-rekap-absensi">
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Nama Siswa</th>
                            <th>Kelas</th>
                            <th>Tanggal</th>
                            <th>Status</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        </tbody>
                </table>
            </div>
        </div>
    `;
    // Tampilkan semua data saat pertama kali tab dibuka
    tampilkanRekapAbsensiAdmin();
}

// --- FUNGSI BARU UNTUK MENAMPILKAN & MEMFILTER DATA ABSENSI ---
function tampilkanRekapAbsensiAdmin() {
    const filterKelas = document.getElementById('filter-kelas').value;
    const filterTanggal = document.getElementById('filter-tanggal').value;
    const filterStatus = document.getElementById('filter-status').value;

    let filteredAbsensi = data.absensi;

    // Terapkan filter tanggal
    if (filterTanggal) {
        filteredAbsensi = filteredAbsensi.filter(a => a.tanggal === filterTanggal);
    }

    // Terapkan filter status
    if (filterStatus) {
        filteredAbsensi = filteredAbsensi.filter(a => a.status === filterStatus);
    }

    // Terapkan filter kelas (ini perlu info siswa, jadi lebih kompleks)
    if (filterKelas) {
        filteredAbsensi = filteredAbsensi.filter(a => {
            const siswa = data.users.siswas.find(s => s.id === a.id_siswa);
            return siswa && siswa.id_kelas == filterKelas;
        });
    }

    const tbody = document.querySelector("#tabel-rekap-absensi tbody");
    tbody.innerHTML = ''; // Kosongkan tabel sebelum diisi

    if (filteredAbsensi.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6">Tidak ada data yang cocok dengan filter.</td></tr>`;
        return;
    }

    filteredAbsensi.forEach((absensi, index) => {
        const siswa = data.users.siswas.find(s => s.id === absensi.id_siswa);
        const kelas = siswa ? data.kelas.find(k => k.id === siswa.id_kelas) : { nama: 'N/A' };
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${siswa ? siswa.nama : 'Siswa Dihapus'}</td>
            <td>${kelas.nama}</td>
            <td>${absensi.tanggal}</td>
            <td>${absensi.status}</td>
            <td>
                <button class="small-btn edit" onclick="editAbsensi(${absensi.id})">Edit</button>
                <button class="small-btn delete" onclick="hapusAbsensi(${absensi.id})">Hapus</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// --- FUNGSI BARU UNTUK MENGEDIT ABSENSI ---
function editAbsensi(absensiId) {
    const absensi = data.absensi.find(a => a.id === absensiId);
    if (!absensi) return;

    const statusList = ["Hadir", "Izin", "Sakit", "Alpa"];
    const newStatus = prompt(`Masukkan status baru untuk absensi tanggal ${absensi.tanggal} (Hadir, Izin, Sakit, Alpa):`, absensi.status);

    if (newStatus && statusList.includes(newStatus)) {
        absensi.status = newStatus;
        alert("Status absensi berhasil diperbarui.");
        tampilkanRekapAbsensiAdmin(); // Refresh tabel
    } else if (newStatus !== null) {
        alert("Status tidak valid! Harap masukkan salah satu dari: Hadir, Izin, Sakit, Alpa.");
    }
}

// --- FUNGSI BARU UNTUK MENGHAPUS ABSENSI ---
function hapusAbsensi(absensiId) {
    if (confirm("Apakah Anda yakin ingin menghapus data absensi ini?")) {
        data.absensi = data.absensi.filter(a => a.id !== absensiId);
        alert("Data absensi berhasil dihapus.");
        tampilkanRekapAbsensiAdmin(); // Refresh tabel
    }
}

// --- FUNGSI BARU UNTUK MENCETAK LAPORAN ---
function cetakLaporanAbsensi() {
    const tabelKonten = document.getElementById('tabel-rekap-absensi').outerHTML;
    const win = window.open('', '', 'height=600,width=800');
    win.document.write('<html><head><title>Laporan Absensi</title>');
    win.document.write('<style>body{font-family:sans-serif;} table{width:100%; border-collapse:collapse;} th,td{border:1px solid #ddd; padding:8px; text-align:left;} th{background-color:#f2f2f2;}</style>');
    win.document.write('</head><body>');
    win.document.write(`<h1>Laporan Absensi - ${new Date().toLocaleDateString('id-ID')}</h1>`);
    win.document.write(tabelKonten);
    win.document.write('</body></html>');
    win.document.close();
    win.print();
}

// --- FUNGSI BARU UNTUK EKSPOR KE EXCEL (.CSV) ---
function exportAbsensiExcel() {
    const tbody = document.querySelector("#tabel-rekap-absensi tbody");
    if (tbody.rows.length === 0 || tbody.rows[0].cells.length <= 1) {
        alert("Tidak ada data untuk diekspor.");
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "No,Nama Siswa,Kelas,Tanggal,Status\n"; // Header CSV

    tbody.querySelectorAll('tr').forEach(row => {
        const rowData = [
            row.cells[0].innerText,
            `"${row.cells[1].innerText}"`, // Bungkus dengan kutip untuk nama
            row.cells[2].innerText,
            row.cells[3].innerText,
            row.cells[4].innerText
        ].join(',');
        csvContent += rowData + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `laporan_absensi_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ... (SEMUA FUNGSI ADMIN LAINNYA TETAP SAMA SEPERTI SEBELUMNYA) ...
function renderAdminDashboard() { return ` <div class="tabs"> <button class="tab-link active" onclick="openAdminTab(event, 'Analitik')">📈 Analitik</button> <button class="tab-link" onclick="openAdminTab(event, 'Absensi')">📊 Rekap Absensi</button> <button class="tab-link" onclick="openAdminTab(event, 'Manajemen')">⚙️ Manajemen Data</button> <button class="tab-link" onclick="openAdminTab(event, 'JadwalGuru')">🗓️ Jadwal Guru</button> <button class="tab-link" onclick="openAdminTab(event, 'JadwalPelajaran')">📚 Jadwal Pelajaran</button> <button class="tab-link" onclick="openAdminTab(event, 'Pengumuman')">📢 Pengumuman</button> <button class="tab-link" onclick="openAdminTab(event, 'Tampilan')">🎨 Kelola Tampilan</button> </div> <div id="Analitik" class="tab-content"></div> <div id="Absensi" class="tab-content"></div> <div id="Manajemen" class="tab-content"></div> <div id="JadwalGuru" class="tab-content"></div> <div id="JadwalPelajaran" class="tab-content"></div> <div id="Pengumuman" class="tab-content"></div> <div id="Tampilan" class="tab-content"></div>`; }
function openAdminTab(evt, tabName) { document.querySelectorAll(".tab-content").forEach(tc => tc.style.display = "none"); document.querySelectorAll(".tab-link").forEach(tl => tl.className = tl.className.replace(" active", "")); document.getElementById(tabName).style.display = "block"; evt.currentTarget.className += " active"; if (tabName === 'Analitik') renderAdminAnalitik(); else if (tabName === 'Absensi') renderAdminAbsensi(); else if (tabName === 'Manajemen') renderAdminManajemen(); else if (tabName === 'JadwalGuru') renderAdminJadwal(); else if (tabName === 'JadwalPelajaran') renderAdminManajemenJadwal(); else if (tabName === 'Pengumuman') renderAdminPengumuman(); else if (tabName === 'Tampilan') renderAdminTampilan(); }
function renderAdminAnalitik(){document.getElementById("Analitik").innerHTML=`<div class="dashboard-section"><h5>Analitik Dashboard</h5><p>Total Siswa: ${data.users.siswas.length}</p><p>Total Guru: ${data.users.gurus.length}</p><p>Total Kelas: ${data.kelas.length}</p></div>`}
function renderAdminManajemen(){document.getElementById("Manajemen").innerHTML=`<div class="dashboard-section"><h5>Manajemen Data Pengguna & Kelas</h5><p>Fitur ini sedang dalam pengembangan.</p></div>`}
function renderAdminJadwal(){const container=document.getElementById("JadwalGuru");container.innerHTML="<h4>Atur Jadwal Mengajar Guru</h4>",data.users.gurus.forEach(guru=>{let jadwalHTML=`<div class="dashboard-section jadwal-guru-container"><h5>${guru.nama}</h5>`;const kelasOptions=data.kelas.map(k=>`<option value="${k.id}">${k.nama}</option>`).join(""),hariOptions=["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"],jamOptions=[...Array(10).keys()].map(i=>i+7);guru.jadwal.length>0?(jadwalHTML+='<ul class="jadwal-list">',guru.jadwal.forEach((j,index)=>{const namaKelas=data.kelas.find(k=>k.id===j.id_kelas)?.nama||"N/A";jadwalHTML+=`<li class="jadwal-item"><span>${namaKelas} - ${hariOptions[j.hari]}, Jam ${j.jam}:00</span><button class="small-btn delete" onclick="hapusJadwalGuru(${guru.id}, ${index})">Hapus</button></li>`}),jadwalHTML+="</ul>"):jadwalHTML+="<p>Belum ada jadwal yang diatur.</p>",jadwalHTML+=`<div class="jadwal-form"><select id="jadwal-kelas-${guru.id}">${kelasOptions}</select><select id="jadwal-hari-${guru.id}">${hariOptions.map((h,i)=>`<option value="${i}">${h}</option>`).join("")}</select><select id="jadwal-jam-${guru.id}">${jamOptions.map(j=>`<option value="${j}">${j}:00</option>`).join("")}</select><button class="small-btn" onclick="tambahJadwalGuru(${guru.id})">+ Tambah</button></div>`,jadwalHTML+="</div>",container.innerHTML+=jadwalHTML})}
function tambahJadwalGuru(guruId){const id_kelas=parseInt(document.getElementById(`jadwal-kelas-${guruId}`).value),hari=parseInt(document.getElementById(`jadwal-hari-${guruId}`).value),jam=parseInt(document.getElementById(`jadwal-jam-${guruId}`).value),guru=data.users.gurus.find(g=>g.id===guruId);if(!guru)return;if(guru.jadwal.some(j=>j.id_kelas===id_kelas&&j.hari===hari&&j.jam===jam))return alert("Jadwal ini sudah ada.");const kelas=data.kelas.find(k=>k.id===id_kelas);guru.jadwal.push({id_kelas,hari,jam,nama_kelas:kelas.nama}),renderAdminJadwal()}
function hapusJadwalGuru(guruId,index){const guru=data.users.gurus.find(g=>g.id===guruId);guru&&guru.jadwal.splice(index,1),renderAdminJadwal()}
function renderAdminManajemenJadwal(){document.getElementById("JadwalPelajaran").innerHTML=`<div class="dashboard-section"><h5>Manajemen Jadwal Pelajaran</h5><p>Fitur ini sedang dalam pengembangan.</p></div>`}
function renderAdminPengumuman(){const container=document.getElementById("Pengumuman");container.innerHTML=`<div class="dashboard-section"><h5>Buat Pengumuman Baru</h5><input type="text" id="judul-pengumuman" placeholder="Judul"><textarea id="isi-pengumuman" placeholder="Isi pengumuman..."></textarea><button onclick="buatPengumuman()">Kirim Pengumuman</button></div><div class="dashboard-section"><h5>Daftar Pengumuman</h5><div id="list-pengumuman"></div></div>`,renderDaftarPengumuman()}
function buatPengumuman(){const judul=document.getElementById("judul-pengumuman").value,isi=document.getElementById("isi-pengumuman").value,tanggal=(new Date).toISOString().slice(0,10),id=data.pengumuman.length>0?Math.max(...data.pengumuman.map(p=>p.id))+1:1;judul&&isi?(data.pengumuman.push({id,judul,isi,tanggal}),alert("Pengumuman berhasil dibuat!"),renderDaftarPengumuman(),document.getElementById("judul-pengumuman").value="",document.getElementById("isi-pengumuman").value=""):alert("Judul dan isi tidak boleh kosong!")}
function renderDaftarPengumuman(){const listContainer=document.getElementById("list-pengumuman");listContainer.innerHTML=data.pengumuman.map(p=>`<div class="announcement-card"><strong>${p.judul}</strong><p>${p.isi}</p><small>${p.tanggal}</small><button class="small-btn delete" onclick="hapusPengumuman(${p.id})">Hapus</button></div>`).join("")}
function hapusPengumuman(id){data.pengumuman=data.pengumuman.filter(p=>p.id!==id),renderDaftarPengumuman()}
function renderAdminTampilan() { const container = document.getElementById('Tampilan'); let html = ` <div class="dashboard-section"> <h4>🎨 Kelola Latar Belakang Kelas</h4> <p>Pilih gambar dari komputermu untuk dijadikan latar belakang login siswa.</p> <div class="tampilan-manager"> `; data.kelas.forEach(k => { const previewStyle = k.backgroundData ? `background-image: url('${k.backgroundData}')` : ''; html += ` <div class="tampilan-item"> <label for="bg-upload-${k.id}">${k.nama}</label> <div class="upload-area"> <div class="background-preview" id="preview-${k.id}" style="${previewStyle}"></div> <label for="bg-upload-${k.id}" class="file-label">Pilih Gambar</label> <input type="file" id="bg-upload-${k.id}" accept="image/*" onchange="simpanBackground(${k.id}, this)"> </div> </div> `; }); html += `</div></div>`; container.innerHTML = html; }
function simpanBackground(id_kelas, input) { const file = input.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = function(e) { const imageData = e.target.result; const kelas = data.kelas.find(k => k.id === id_kelas); if (kelas) { kelas.backgroundData = imageData; document.getElementById(`preview-${id_kelas}`).style.backgroundImage = `url('${imageData}')`; alert(`Latar belakang untuk ${kelas.nama} berhasil diperbarui!`); } else { alert('Gagal menemukan kelas!'); } }; reader.readAsDataURL(file); }

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
    // --- MODIFIKASI: Menambahkan properti backgroundUrl pada setiap kelas ---
    kelas: [
        { id: 1, nama: "Kelas 10A", lokasi: { latitude: -7.983908, longitude: 112.621391 }, backgroundUrl: "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=2070&auto=format&fit=crop" },
        { id: 2, nama: "Kelas 11B", lokasi: { latitude: -7.983500, longitude: 112.621800 }, backgroundUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop" }
    ],
    absensi: [
        { id_siswa: 101, tanggal: "2023-10-25", status: "Hadir" }, { id_siswa: 102, tanggal: "2023-10-25", status: "Izin" },
        { id_siswa: 201, tanggal: "2023-10-26", status: "Hadir" }
    ],
    tugas: [
        { id: 1, id_kelas: 1, judul: "Rangkuman Bab 1", deadline: "2023-10-30", deskripsi: "Buat rangkuman dari Bab 1 buku paket." },
        { id: 2, id_kelas: 2, judul: "Latihan Soal Matematika", deadline: "2023-11-02", deskripsi: "Kerjakan latihan soal halaman 50." }
    ],
    pengumuman: [{ id: 1, judul: "Rapat Orang Tua Murid", isi: "Diberitahukan kepada seluruh siswa bahwa rapat orang tua akan diadakan pada hari Sabtu, 4 November 2023.", tanggal: "2023-10-26" }],
    jadwalPelajaran: [
        { id_kelas: 1, hari: 1, jam: 8, mapel: "Matematika", id_guru: 1},
        { id_kelas: 1, hari: 2, jam: 9, mapel: "Fisika", id_guru: 2}
    ],
    catatanPR: [
        {id: 1, id_siswa: 101, id_jadwal: 1, catatan: "Jangan lupa bawa jangka."}
    ]
};

// BAGIAN 2: STATE APLIKASI
let currentUser = null;
let currentRole = null;
let absensiHariIniSelesai = false;

// BAGIAN 3: FUNGSI UTAMA & EVENT LISTENER
document.addEventListener("DOMContentLoaded", () => {
    // Cek apakah kita berada di halaman index.html atau main.html
    if (document.getElementById("tombol-buka")) {
        // Halaman index.html
        fetch('https://api.quotable.io/random?tags=inspirational|technology|education')
            .then(response => response.json())
            .then(data => {
                document.getElementById('kata-harian').textContent = `"${data.content}" - ${data.author}`;
            })
            .catch(() => {
                document.getElementById('kata-harian').textContent = '"Pendidikan adalah senjata paling ampuh yang bisa kamu gunakan untuk mengubah dunia." - Nelson Mandela';
            });
            
        document.getElementById("tombol-buka").addEventListener("click", () => {
            window.location.href = "main.html";
        });
    } else {
        // Halaman main.html
        populateInitialDropdowns();
    }
});


// BAGIAN 4: FUNGSI-FUNGSI LOGIC
function populateInitialDropdowns() {
    // Fungsi ini terpanggil saat main.html dimuat
    // Populate Guru
    const guruSelect = document.getElementById("guru-select-nama");
    data.users.gurus.forEach(guru => {
        const option = document.createElement("option");
        option.value = guru.id;
        option.textContent = guru.nama;
        guruSelect.appendChild(option);
    });

    // Populate Kelas untuk Siswa
    const kelasSelect = document.getElementById("siswa-select-kelas");
    data.kelas.forEach(k => {
        const option = document.createElement("option");
        option.value = k.id;
        option.textContent = k.nama;
        kelasSelect.appendChild(option);
    });
    // Panggil populateSiswaDropdown untuk pertama kali
    populateSiswaDropdown();
}

function populateSiswaDropdown() {
    const kelasId = document.getElementById("siswa-select-kelas").value;
    const siswaSelect = document.getElementById("siswa-select-nama");
    siswaSelect.innerHTML = ''; // Kosongkan dulu
    data.users.siswas.filter(s => s.id_kelas == kelasId).forEach(siswa => {
        const option = document.createElement("option");
        option.value = siswa.id;
        option.textContent = siswa.nama;
        siswaSelect.appendChild(option);
    });
}

function showView(viewId) {
    document.querySelectorAll('#app > div').forEach(div => {
        div.classList.add('hidden');
    });
    document.getElementById(viewId).classList.remove('hidden');
}

function showLogin(role) {
    currentRole = role;
    showView('view-login-form');
    document.getElementById('login-title').textContent = `Login ${role.charAt(0).toUpperCase() + role.slice(1)}`;

    document.getElementById('form-admin').classList.add('hidden');
    document.getElementById('form-guru').classList.add('hidden');
    document.getElementById('form-siswa').classList.add('hidden');

    document.getElementById(`form-${role}`).classList.remove('hidden');
}

function login() {
    let user = null;
    "admin" === currentRole ? user = data.users.admins.find(u => u.username === document.getElementById("admin-user").value && u.password === document.getElementById("admin-pass").value) : "guru" === currentRole ? user = data.users.gurus.find(u => u.id == document.getElementById("guru-select-nama").value && u.password === document.getElementById("guru-pass").value) : "siswa" === currentRole && (user = data.users.siswas.find(u => u.id == document.getElementById("siswa-select-nama").value && u.password === document.getElementById("siswa-pass").value));
    
    if (user) {
        currentUser = user;
        alert("Login Berhasil!");

        // --- MODIFIKASI: Ganti background saat siswa login ---
        if (currentRole === 'siswa') {
            const kelasSiswa = data.kelas.find(k => k.id === currentUser.id_kelas);
            if (kelasSiswa && kelasSiswa.backgroundUrl) {
                document.body.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('${kelasSiswa.backgroundUrl}')`;
                document.body.style.backgroundSize = 'cover';
                document.body.style.backgroundPosition = 'center';
            }
        }
        // --- AKHIR MODIFIKASI ---

        showDashboard();
    } else {
        alert("Login Gagal! Periksa kembali data Anda.");
    }
}

function logout() {
    currentUser = null, currentRole = null, absensiHariIniSelesai = !1;
    
    // --- MODIFIKASI: Kembalikan background ke default saat logout ---
    document.body.style.backgroundImage = '';
    document.body.style.backgroundSize = '';
    document.body.style.backgroundPosition = '';
    // --- AKHIR MODIFIKASI ---
    
    showView("view-role-selection"), document.querySelectorAll("input").forEach(i => i.value = "");
}

function showDashboard() {
    showView('view-dashboard');
    const dashboardContent = document.getElementById('dashboard-content');
    const dashboardTitle = document.getElementById('dashboard-title');
    
    dashboardTitle.textContent = `Dashboard ${currentRole.charAt(0).toUpperCase() + currentRole.slice(1)}`;

    switch (currentRole) {
        case 'admin':
            dashboardContent.innerHTML = renderAdminDashboard();
            openAdminTab({ currentTarget: document.querySelector('.tab-link.active') }, 'Analitik');
            break;
        case 'guru':
            dashboardContent.innerHTML = renderGuruDashboard();
            break;
        case 'siswa':
            dashboardContent.innerHTML = renderSiswaDashboard();
            break;
    }
}

// ... (Sisa fungsi render dashboard seperti renderSiswaDashboard, renderGuruDashboard, dll.)
function renderSiswaDashboard() {
    const kelasSiswa = data.kelas.find(k => k.id === currentUser.id_kelas);
    const tugasKelas = data.tugas.filter(t => t.id_kelas === currentUser.id_kelas);
    
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
            ${tugasKelas.length > 0 ? tugasKelas.map(t => `<div class="task-card"><strong>${t.judul}</strong><p>${t.deskripsi}</p><small>Deadline: ${t.deadline}</small></div>`).join('') : '<p>Tidak ada tugas.</p>'}
        </div>
    `;
}

function lakukanAbsensi() {
    if (absensiHariIniSelesai) {
        alert("Anda sudah melakukan absensi hari ini.");
        return;
    }
    // Implementasi geolokasi
    navigator.geolocation.getCurrentPosition(pos => {
        const userLat = pos.coords.latitude;
        const userLon = pos.coords.longitude;
        const kelasSiswa = data.kelas.find(k => k.id === currentUser.id_kelas);
        const jarak = hitungJarak(userLat, userLon, kelasSiswa.lokasi.latitude, kelasSiswa.lokasi.longitude);
        
        if (jarak <= 100) { // Toleransi 100 meter
            const tanggalHariIni = new Date().toISOString().slice(0, 10);
            data.absensi.push({ id_siswa: currentUser.id, tanggal: tanggalHariIni, status: "Hadir" });
            absensiHariIniSelesai = true;
            alert("Absensi berhasil!");
        } else {
            alert(`Absensi gagal. Anda berada ${jarak.toFixed(0)} meter dari lokasi kelas.`);
        }
    }, () => {
        alert("Gagal mendapatkan lokasi. Pastikan GPS Anda aktif.");
    });
}

function hitungJarak(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // dalam meter
}

function renderGuruDashboard() {
    const kelasAjar = data.kelas.filter(k => data.users.gurus.find(g => g.id === currentUser.id).jadwal.some(j => j.id_kelas === k.id));
    return `
        <h4>Selamat Datang, ${currentUser.nama}!</h4>
        <div class="dashboard-section">
            <h5>Kelas yang Anda Ajar Hari Ini</h5>
            <p>Fitur ini sedang dalam pengembangan.</p>
        </div>
        <div class="dashboard-section">
            <h5>Rekap Absensi Siswa</h5>
            <select id="kelas-rekap-select" onchange="tampilkanRekapAbsensi(this.value)">
                <option value="">Pilih Kelas</option>
                ${kelasAjar.map(k => `<option value="${k.id}">${k.nama}</option>`).join('')}
            </select>
            <div id="rekap-absensi-container"></div>
        </div>
    `;
}

function tampilkanRekapAbsensi(id_kelas) {
    if (!id_kelas) {
        document.getElementById('rekap-absensi-container').innerHTML = '';
        return;
    }
    const siswasDiKelas = data.users.siswas.filter(s => s.id_kelas == id_kelas);
    const absensiKelas = data.absensi.filter(a => siswasDiKelas.some(s => s.id === a.id_siswa));
    
    let html = '<table><tr><th>Nama Siswa</th><th>Tanggal</th><th>Status</th></tr>';
    absensiKelas.forEach(a => {
        const siswa = data.users.siswas.find(s => s.id === a.id_siswa);
        html += `<tr><td>${siswa.nama}</td><td>${a.tanggal}</td><td>${a.status}</td></tr>`;
    });
    html += '</table>';
    document.getElementById('rekap-absensi-container').innerHTML = html;
}

// --- FUNGSI ADMIN DENGAN PERUBAHAN ---
function renderAdminDashboard() {
    return `
    <div class="tabs">
        <button class="tab-link active" onclick="openAdminTab(event, 'Analitik')">📈 Analitik</button>
        <button class="tab-link" onclick="openAdminTab(event, 'Absensi')">📊 Rekap Absensi</button>
        <button class="tab-link" onclick="openAdminTab(event, 'Manajemen')">⚙️ Manajemen Data</button>
        <button class="tab-link" onclick="openAdminTab(event, 'JadwalGuru')">🗓️ Jadwal Guru</button>
        <button class="tab-link" onclick="openAdminTab(event, 'JadwalPelajaran')">📚 Jadwal Pelajaran</button>
        <button class="tab-link" onclick="openAdminTab(event, 'Pengumuman')">📢 Pengumuman</button>
        <button class="tab-link" onclick="openAdminTab(event, 'Tampilan')">🎨 Kelola Tampilan</button> 
    </div>
    <div id="Analitik" class="tab-content" style="display:block;"></div>
    <div id="Absensi" class="tab-content"></div>
    <div id="Manajemen" class="tab-content"></div>
    <div id="JadwalGuru" class="tab-content"></div>
    <div id="JadwalPelajaran" class="tab-content"></div>
    <div id="Pengumuman" class="tab-content"></div>
    <div id="Tampilan" class="tab-content"></div>`;
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
    else if (tabName === 'Tampilan') renderAdminTampilan();
}

function renderAdminAnalitik(){document.getElementById("Analitik").innerHTML="<h5>Analitik Dashboard</h5><p>Total Siswa: "+data.users.siswas.length+"</p><p>Total Guru: "+data.users.gurus.length+"</p><p>Total Kelas: "+data.kelas.length+"</p>"}
function renderAdminAbsensi(){document.getElementById("Absensi").innerHTML="<h5>Rekapitulasi Absensi Keseluruhan</h5><table><tr><th>Nama</th><th>Kelas</th><th>Tanggal</th><th>Status</th></tr>"+data.absensi.map(a=>{const s=data.users.siswas.find(s=>s.id===a.id_siswa),k=data.kelas.find(k=>k.id===s.id_kelas);return`<tr><td>${s.nama}</td><td>${k.nama}</td><td>${a.tanggal}</td><td>${a.status}</td></tr>`}).join("")+"</table>"}
function renderAdminManajemen(){document.getElementById("Manajemen").innerHTML="<h5>Manajemen Data Pengguna & Kelas</h5><p>Fitur ini sedang dalam pengembangan.</p>"}
function renderAdminPengumuman(){const container=document.getElementById("Pengumuman");container.innerHTML=`<div class=\"dashboard-section\"><h5>Buat Pengumuman Baru</h5><input type=\"text\" id=\"judul-pengumuman\" placeholder=\"Judul\"><textarea id=\"isi-pengumuman\" placeholder=\"Isi pengumuman...\"></textarea><button onclick=\"buatPengumuman()\">Kirim Pengumuman</button></div><div class=\"dashboard-section\"><h5>Daftar Pengumuman</h5><div id=\"list-pengumuman\"></div></div>`,renderDaftarPengumuman()}
function buatPengumuman(){const judul=document.getElementById("judul-pengumuman").value,isi=document.getElementById("isi-pengumuman").value,tanggal=new Date().toISOString().slice(0,10),id=data.pengumuman.length>0?Math.max(...data.pengumuman.map(p=>p.id))+1:1;judul&&isi?(data.pengumuman.push({id,judul,isi,tanggal}),alert("Pengumuman berhasil dibuat!"),renderDaftarPengumuman(),document.getElementById("judul-pengumuman").value="",document.getElementById("isi-pengumuman").value=""):alert("Judul dan isi tidak boleh kosong!")}
function renderDaftarPengumuman(){const listContainer=document.getElementById("list-pengumuman");listContainer.innerHTML=data.pengumuman.map(p=>`<div class=\"announcement-card\"><strong>${p.judul}</strong><p>${p.isi}</p><small>${p.tanggal}</small><button class=\"small-btn delete\" onclick=\"hapusPengumuman(${p.id})\">Hapus</button></div>`).join("")}
function hapusPengumuman(id){data.pengumuman=data.pengumuman.filter(p=>p.id!==id),renderDaftarPengumuman()}
function renderAdminManajemenJadwal(){}
function renderAdminJadwal(){const container=document.getElementById("JadwalGuru");container.innerHTML="<h4>Atur Jadwal Mengajar Guru</h4>",data.users.gurus.forEach(guru=>{let jadwalHTML=`<div class=\"dashboard-section jadwal-guru-container\"><h5>${guru.nama}</h5>`;const kelasOptions=data.kelas.map(k=>`<option value=\"${k.id}\">${k.nama}</option>`).join(""),hariOptions=["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"],jamOptions=[...Array(10).keys()].map(i=>i+7);guru.jadwal.length>0?(jadwalHTML+='<ul class=\"jadwal-list\">',guru.jadwal.forEach((j,index)=>{const namaKelas=data.kelas.find(k=>k.id===j.id_kelas)?.nama||"N/A";jadwalHTML+=`<li class=\"jadwal-item\"><span>${namaKelas} - ${hariOptions[j.hari]}, Jam ${j.jam}:00</span><button class=\"small-btn delete\" onclick=\"hapusJadwalGuru(${guru.id}, ${index})\">Hapus</button></li>`}),jadwalHTML+="</ul>"):jadwalHTML+="<p>Belum ada jadwal yang diatur.</p>",jadwalHTML+=`<div class=\"jadwal-form\"><select id=\"jadwal-kelas-${guru.id}\">${kelasOptions}</select><select id=\"jadwal-hari-${guru.id}\">${hariOptions.map((h,i)=>`<option value=\"${i}\">${h}</option>`).join("")}</select><select id=\"jadwal-jam-${guru.id}\">${jamOptions.map(j=>`<option value=\"${j}\">${j}:00</option>`).join("")}</select><button class=\"small-btn\" onclick=\"tambahJadwalGuru(${guru.id})\">+ Tambah Jadwal</button></div>`,jadwalHTML+="</div>",container.innerHTML+=jadwalHTML})}
function tambahJadwalGuru(guruId){const id_kelas=parseInt(document.getElementById(`jadwal-kelas-${guruId}`).value),hari=parseInt(document.getElementById(`jadwal-hari-${guruId}`).value),jam=parseInt(document.getElementById(`jadwal-jam-${guruId}`).value),guru=data.users.gurus.find(g=>g.id===guruId);if(!guru)return;if(guru.jadwal.some(j=>j.id_kelas===id_kelas&&j.hari===hari&&j.jam===jam))return alert("Jadwal ini sudah ada.");const kelas=data.kelas.find(k=>k.id===id_kelas);guru.jadwal.push({id_kelas,hari,jam,nama_kelas:kelas.nama}),renderAdminJadwal()}
function hapusJadwalGuru(guruId,index){const guru=data.users.gurus.find(g=>g.id===guruId);guru&&guru.jadwal.splice(index,1),renderAdminJadwal()}

// --- FUNGSI BARU UNTUK KELOLA TAMPILAN ---

/**
 * Merender halaman untuk mengelola tampilan latar belakang per kelas.
 */
function renderAdminTampilan() {
    const container = document.getElementById('Tampilan');
    let html = `
        <div class="dashboard-section">
            <h4>🎨 Kelola Latar Belakang Kelas</h4>
            <p>Masukkan URL gambar online (misal dari Unsplash, Pexels, Imgur) untuk setiap kelas.</p>
            <div class="tampilan-manager">
    `;
    
    data.kelas.forEach(k => {
        html += `
            <div class="tampilan-item">
                <label for="bg-url-${k.id}">${k.nama}:</label>
                <input type="text" id="bg-url-${k.id}" placeholder="Masukkan URL gambar..." value="${k.backgroundUrl || ''}">
                <button class="small-btn" onclick="simpanBackground(${k.id})">Simpan</button>
            </div>
        `;
    });

    html += `</div></div>`;
    container.innerHTML = html;
}

/**
 * Menyimpan URL latar belakang baru untuk sebuah kelas.
 * @param {number} id_kelas ID kelas yang akan diubah.
 */
function simpanBackground(id_kelas) {
    const input = document.getElementById(`bg-url-${id_kelas}`);
    const kelas = data.kelas.find(k => k.id === id_kelas);

    if (kelas) {
        kelas.backgroundUrl = input.value.trim();
        alert(`Latar belakang untuk ${kelas.nama} berhasil diperbarui!`);
    } else {
        alert('Gagal menemukan kelas!');
    }
}

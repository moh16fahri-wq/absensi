// BAGIAN 1: DATABASE SIMULASI
const data = {
    users: {
        admins: [{ username: "admin", password: "admin123" }],
        gurus: [
            {
                id: 1,
                nama: "Budi Santoso",
                password: "guru1",
                // Jadwal diubah menjadi array untuk mendukung banyak sesi mengajar
                jadwal: [
                    { id_kelas: 1, hari: 4, jam: 9, nama_kelas: "Kelas 10A" }, // Kamis jam 9
                    { id_kelas: 2, hari: 4, jam: 10, nama_kelas: "Kelas 11B" } // Kamis jam 10
                ]
            },
            { id: 2, nama: "Anisa Putri", password: "guru2", jadwal: [{ id_kelas: 2, hari: 2, jam: 10, nama_kelas: "Kelas 11B" }] } // Selasa jam 10
        ],
        siswas: [
            { id: 101, nama: "Agus", password: "siswa1", id_kelas: 1 },
            { id: 102, nama: "Citra", password: "siswa2", id_kelas: 1 },
            { id: 201, nama: "Dewi", password: "siswa3", id_kelas: 2 },
            { id: 202, nama: "Eko", password: "siswa4", id_kelas: 2 }
        ]
    },
    // Menambahkan data lokasi (latitude, longitude) untuk setiap kelas
    kelas: [
        { id: 1, nama: "Kelas 10A", lokasi: { latitude: -7.983908, longitude: 112.621391 } }, // Lokasi default
        { id: 2, nama: "Kelas 11B", lokasi: { latitude: -7.983500, longitude: 112.621800 } }  // Lokasi sedikit berbeda untuk simulasi
    ],
    tugas: [],
    absensi: []
};


// BAGIAN 2: PENGATURAN AWAL
let currentUser = null, currentRole = null, absensiHariIniSelesai = !1;
document.addEventListener("DOMContentLoaded", () => { document.getElementById("kata-harian") ? setupHalamanAwal() : document.getElementById("app") && showView("view-role-selection") });
function setupHalamanAwal() { const e = ["Minggu: Istirahat adalah bagian dari proses.", "Senin: Mulailah minggu dengan energi penuh!", "Selasa: Terus belajar, terus bertumbuh.", "Rabu: Jangan takut gagal, takutlah tidak mencoba.", "Kamis: Optimis melihat masa depan!", "Jumat: Selesaikan apa yang kamu mulai.", "Sabtu: Refleksi dan siapkan hari esok."]; document.getElementById("kata-harian").textContent = e[new Date().getDay()], document.getElementById("tombol-buka").addEventListener("click", () => { window.location.href = "main.html" }) }
function showView(e) { document.querySelectorAll("#app > div").forEach(t => t.classList.add("hidden")), document.getElementById(e).classList.remove("hidden") }

// BAGIAN 3: LOGIKA LOGIN
function showLogin(e) { currentRole = e, showView("view-login-form"), document.querySelectorAll("#view-login-form > div").forEach(e => e.classList.add("hidden")); const t = document.getElementById("login-title"); "admin" === e ? (t.textContent = "Login Admin", document.getElementById("form-admin").classList.remove("hidden")) : "guru" === e ? (t.textContent = "Login Guru", document.getElementById("form-guru").classList.remove("hidden"), populateGuruDropdown()) : "siswa" === e && (t.textContent = "Login Siswa", document.getElementById("form-siswa").classList.remove("hidden"), populateKelasDropdown()) }
function populateGuruDropdown() { const e = document.getElementById("guru-select-nama"); e.innerHTML = '<option value="">-- Pilih Nama Guru --</option>', data.users.gurus.forEach(t => { e.innerHTML += `<option value="${t.id}">${t.nama}</option>` }) }
function populateKelasDropdown() { const e = document.getElementById("siswa-select-kelas"); e.innerHTML = '<option value="">-- Pilih Kelas --</option>', data.kelas.forEach(t => { e.innerHTML += `<option value="${t.id}">${t.nama}</option>` }), populateSiswaDropdown() }
function populateSiswaDropdown() { const e = document.getElementById("siswa-select-kelas").value, t = document.getElementById("siswa-select-nama"); t.innerHTML = '<option value="">-- Pilih Nama Siswa --</option>', e && data.users.siswas.filter(t => t.id_kelas == e).forEach(e => { t.innerHTML += `<option value="${e.id}">${e.nama}</option>` }) }
function login() { let e = null; "admin" === currentRole ? e = data.users.admins.find(e => e.username === document.getElementById("admin-user").value && e.password === document.getElementById("admin-pass").value) : "guru" === currentRole ? e = data.users.gurus.find(e => e.id == document.getElementById("guru-select-nama").value && e.password === document.getElementById("guru-pass").value) : "siswa" === currentRole && (e = data.users.siswas.find(e => e.id == document.getElementById("siswa-select-nama").value && e.password === document.getElementById("siswa-pass").value)), e ? (currentUser = e, alert("Login Berhasil!"), showDashboard()) : alert("Login Gagal! Periksa kembali data Anda.") }
function logout() { currentUser = null, currentRole = null, absensiHariIniSelesai = !1, showView("view-role-selection"), document.querySelectorAll("input").forEach(e => e.value = "") }

// BAGIAN 4: RENDER DASHBOARD
function showDashboard() { showView("view-dashboard"); const e = document.getElementById("dashboard-title"), t = document.getElementById("dashboard-content"); t.innerHTML = ""; const o = '<div class="dashboard-section"><h4>🔑 Ganti Password</h4><input type="password" id="old-pass" placeholder="Password Lama"><input type="password" id="new-pass" placeholder="Password Baru"><input type="password" id="confirm-new-pass" placeholder="Konfirmasi Password Baru"><button onclick="changePassword()">Simpan Password Baru</button></div>'; "admin" === currentRole ? (e.textContent = "Dashboard Admin", t.innerHTML = renderAdminDashboard() + o, renderRekapAbsensiGuru()) : "guru" === currentRole ? (e.textContent = `Selamat Datang, ${currentUser.nama}`, t.innerHTML = renderGuruDashboard() + o, cekJadwalMengajar(), renderTugasSubmissions()) : "siswa" === currentRole && (e.textContent = `Selamat Datang, ${currentUser.nama}`, cekAbsensiSiswaHariIni(), t.innerHTML = renderSiswaDashboard() + o, renderDaftarTugas()) }

// BAGIAN 5: FITUR PERAN (Dengan Modifikasi untuk Guru)
function renderAdminDashboard() { let e = data.kelas.map(e => `<option value="${e.id}">${e.nama}</option>`).join(""); return `\n    <div class="dashboard-section">\n        <h4>📊 Rekap Absensi</h4>\n        <div class="filter-group">\n            <label for="start-date">Dari:</label> <input type="date" id="start-date">\n            <label for="end-date">Sampai:</label> <input type="date" id="end-date">\n            <button onclick="renderRekapAbsensiGuru()">Lihat Rekap Guru</button>\n        </div>\n        <div class="filter-group">\n             <label for="kelas-select">Pilih Kelas:</label>\n             <select id="kelas-select" onchange="renderRekapSiswa()">${e}</select>\n        </div>\n        <div id="rekap-container"></div>\n    </div>` }
function getFilteredAbsensi() { const e = document.getElementById("start-date").value, t = document.getElementById("end-date").value; return e && t ? data.absensi.filter(o => o.tanggal >= e && o.tanggal <= t) : data.absensi }
function renderRekapAbsensiGuru() { const e = document.getElementById("rekap-container"), t = getFilteredAbsensi().filter(e => "guru" === e.role); let o = "<h5>Rekap Absensi Guru</h5>"; 0 === t.length ? o += "<p>Tidak ada data absensi guru pada rentang tanggal ini.</p>" : (o += "<table><thead><tr><th>Nama</th><th>Tanggal</th><th>Status</th><th>Keterangan</th></tr></thead><tbody>", t.forEach(e => { o += `<tr><td>${e.nama}</td><td>${e.tanggal}</td><td>${e.status}</td><td>${e.keterangan || "-"}</td></tr>` }), o += "</tbody></table>"), e.innerHTML = o }
function renderRekapSiswa() { const e = document.getElementById("rekap-container"), t = document.getElementById("kelas-select").value, o = data.users.siswas.filter(e => e.id_kelas == t), n = getFilteredAbsensi(); let l = `<h5>Rekap Absensi ${document.getElementById("kelas-select").options[document.getElementById("kelas-select").selectedIndex].text}</h5>`; l += "<table><thead><tr><th>Nama Siswa</th><th>Masuk</th><th>Izin</th><th>Sakit</th><th>Alfa</th></tr></thead><tbody>", o.forEach(e => { const t = n.filter(t => t.id_user === e.id), o = { masuk: t.filter(e => "masuk" === e.status).length, izin: t.filter(e => "izin" === e.status).length, sakit: t.filter(e => "sakit" === e.status).length, alfa: t.filter(e => "alfa" === e.status).length }; l += `<tr><td>${e.nama}</td><td>${o.masuk}</td><td>${o.izin}</td><td>${o.sakit}</td><td>${o.alfa}</td></tr>` }), l += "</tbody></table>", e.innerHTML = l }

// --- MODIFIKASI DASHBOARD GURU DIMULAI DI SINI ---
function renderGuruDashboard() {
    let kelasOptions = data.kelas.map(k => `<option value="${k.id}">${k.nama}</option>`).join("");
    return `
    <div class="dashboard-section" id="guru-absen">
        <h4>🗓️ Absensi Pengajar</h4>
        <p id="info-absen-guru">Mengecek jadwal mengajar Anda...</p>
        <button id="btn-mulai-ajar" onclick="mulaiAjar()" disabled>Mulai Ajar</button>
        <div id="container-absen-kelas" style="margin-top: 1rem;"></div>
    </div>
    <div class="dashboard-section" id="guru-tugas">
        <h4>📤 Kirim Tugas Baru</h4>
        <select id="tugas-kelas">${kelasOptions}</select>
        <input type="text" id="tugas-judul" placeholder="Judul Tugas"><textarea id="tugas-deskripsi" placeholder="Deskripsi..."></textarea>
        <label>Batas Waktu:</label><input type="date" id="tugas-deadline">
        <label>Upload File:</label><input type="file" id="tugas-file">
        <button onclick="kirimTugas()">Kirim Tugas</button>
    </div>
    <div class="dashboard-section"><h4>👀 Lihat Pengumpulan Tugas</h4><div id="submission-container"></div></div>`;
}

function cekJadwalMengajar() {
    const btnMulaiAjar = document.getElementById("btn-mulai-ajar");
    const infoAbsen = document.getElementById("info-absen-guru");
    const now = new Date();
    const hariIni = now.getDay();
    const jamSekarang = now.getHours();

    const jadwalSekarang = currentUser.jadwal.filter(j => j.hari === hariIni && j.jam === jamSekarang);

    if (jadwalSekarang.length > 0) {
        infoAbsen.textContent = "Anda memiliki jadwal mengajar sekarang. Silakan tekan 'Mulai Ajar'.";
        btnMulaiAjar.disabled = false;
    } else {
        infoAbsen.textContent = "Tidak ada jadwal mengajar pada saat ini.";
        btnMulaiAjar.disabled = true;
    }
}

function mulaiAjar() {
    const container = document.getElementById("container-absen-kelas");
    const now = new Date();
    const hariIni = now.getDay();
    const jamSekarang = now.getHours();

    const jadwalSekarang = currentUser.jadwal.filter(j => j.hari === hariIni && j.jam === jamSekarang);
    let html = "<h5>Pilih Kelas untuk Absen:</h5>";

    if (jadwalSekarang.length === 0) {
        container.innerHTML = "<p>Gagal memuat sesi. Tidak ada jadwal ditemukan.</p>";
        return;
    }

    jadwalSekarang.forEach(sesi => {
        html += `
        <div class="task-card">
            <strong>${sesi.nama_kelas}</strong>
            <p>Jadwal: Hari ${['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][sesi.hari]}, Jam ${sesi.jam}:00</p>
            <button onclick="absen('masuk', ${sesi.id_kelas})">✅ Absen Masuk</button>
        </div>
        `;
    });
    
     html += `
        <p>Jika berhalangan hadir, silakan pilih opsi di bawah:</p>
        <button onclick="absen('izin')">📝 Izin</button> 
        <button onclick="absen('sakit')">🤒 Sakit</button>
    `;

    container.innerHTML = html;
    document.getElementById("btn-mulai-ajar").disabled = true; // Nonaktifkan setelah diklik
}
// --- MODIFIKASI DASHBOARD GURU SELESAI ---

function kirimTugas() { const e = document.getElementById("tugas-kelas").value, t = document.getElementById("tugas-judul").value, o = document.getElementById("tugas-deskripsi").value, n = document.getElementById("tugas-deadline").value, l = document.getElementById("tugas-file").files[0]; if (!e || !t || !o || !n) return alert("Harap lengkapi semua data tugas!"); const a = { id: Date.now(), id_guru: currentUser.id, nama_guru: currentUser.nama, id_kelas: parseInt(e), judul: t, deskripsi: o, deadline: n, file: l ? l.name : "Tidak ada file", submissions: [] }; data.tugas.push(a), alert(`Tugas "${t}" berhasil dikirim!`), showDashboard() }
function renderTugasSubmissions() { const e = document.getElementById("submission-container"), t = data.tugas.filter(e => e.id_guru === currentUser.id); if (0 === t.length) return void (e.innerHTML = "<p>Anda belum mengirim tugas apapun.</p>"); let o = ""; t.forEach(e => { o += `<h5>Tugas: ${e.judul} (Deadline: ${e.deadline})</h5>`, e.submissions.length > 0 ? (o += "<ul>", e.submissions.forEach(e => { o += `<li><strong>${e.nama_siswa}</strong> mengumpulkan file: <em>${e.file}</em> pada ${e.timestamp}</li>` }), o += "</ul>") : o += "<p>Belum ada siswa yang mengumpulkan.</p>" }), e.innerHTML = o }
function renderSiswaDashboard() { const e = absensiHariIniSelesai ? "" : "locked-feature", t = absensiHariIniSelesai ? "" : "<p><strong>🔒 Harap lakukan absensi terlebih dahulu untuk membuka fitur tugas.</strong></p>"; return `\n    <div class="dashboard-section" id="siswa-absen"><h4>✅ Absensi Siswa</h4><button id="btn-absen-masuk-siswa" onclick="absen('masuk')">📍 Masuk</button><button onclick="absen('izin')">📝 Izin</button><button onclick="absen('sakit')">🤒 Sakit</button></div>\n    <div id="tugas-wrapper" class="${e}">${t}<div class="dashboard-section" id="siswa-tugas"><h4>📚 Tugas Sekolah <span id="notif-tugas" class="notification-badge">0</span></h4><div id="daftar-tugas-container"></div></div></div>\n    ` }
function cekAbsensiSiswaHariIni() { const e = (new Date).toISOString().slice(0, 10), t = data.absensi.find(t => t.id_user === currentUser.id && t.tanggal === e); absensiHariIniSelesai = !!t }
function renderDaftarTugas() { const e = document.getElementById("daftar-tugas-container"), t = document.getElementById("notif-tugas"), o = data.tugas.filter(e => e.id_kelas === currentUser.id_kelas); if (t.textContent = o.length, 0 === o.length) return void (e.innerHTML = "<p>🎉 Hore, tidak ada tugas saat ini!</p>"); let n = ""; o.forEach(t => { const o = t.submissions.find(e => e.id_siswa === currentUser.id); n += `<div class="task-card">\n            <div class="task-header"><span><strong>${t.judul}</strong> - dari ${t.nama_guru}</span><span class="task-deadline">Deadline: ${t.deadline}</span></div>\n            <p class="task-body">${t.deskripsi}</p><p>File dari guru: <em>${t.file}</em></p>\n            ${o?`<p style="color:green;"><strong>✔ Anda sudah mengumpulkan tugas ini pada ${o.timestamp}.</strong></p>`:`<label>Kirim Jawaban Anda:</label><input type="file" id="submit-file-${t.id}"><button onclick="submitTugas(${t.id})">Kirim Jawaban</button>`}\n        </div>` }), e.innerHTML = n }
function submitTugas(e) { const t = document.getElementById(`submit-file-${e}`), o = t.files[0]; if (!o) return alert("Pilih file jawaban terlebih dahulu!"); const n = data.tugas.find(t => t.id === e); n && (n.submissions.push({ id_siswa: currentUser.id, nama_siswa: currentUser.nama, file: o.name, timestamp: (new Date).toLocaleString("id-ID") }), alert(`Jawaban untuk tugas "${n.judul}" berhasil dikirim!`), renderDaftarTugas()) }

// BAGIAN 6: FUNGSI UNIVERSAL (Dengan Modifikasi untuk Absen Guru)
function changePassword() { const e = document.getElementById("old-pass").value, t = document.getElementById("new-pass").value, o = document.getElementById("confirm-new-pass").value; if (!e || !t || !o) return alert("Semua kolom harus diisi!"); if (t !== o) return alert("Password baru dan konfirmasi tidak cocok!"); if (t.length < 4) return alert("Password baru minimal harus 4 karakter."); if (e !== currentUser.password) return alert("Password lama yang Anda masukkan salah!"); let n; "admin" === currentRole ? n = data.users.admins.find(e => e.username === currentUser.username) : "guru" === currentRole ? n = data.users.gurus.find(e => e.id === currentUser.id) : "siswa" === currentRole && (n = data.users.siswas.find(e => e.id === currentUser.id)), n && (n.password = t, currentUser.password = t, alert("Password berhasil diubah!"), document.getElementById("old-pass").value = "", document.getElementById("new-pass").value = "", document.getElementById("confirm-new-pass").value = "") }

// --- MODIFIKASI FUNGSI ABSEN DIMULAI DI SINI ---
function absen(status, id_kelas = null) {
    const tanggalHariIni = new Date().toISOString().slice(0, 10);
    const sudahAbsen = data.absensi.find(a => a.id_user === currentUser.id && a.role === currentRole && a.tanggal === tanggalHariIni);

    if (sudahAbsen) {
        return alert(`Anda sudah melakukan absensi hari ini dengan status: ${sudahAbsen.status}`);
    }

    const catatAbsensi = (keterangan = "") => {
        data.absensi.push({
            id_user: currentUser.id,
            role: currentRole,
            nama: currentUser.nama,
            tanggal: tanggalHariIni,
            status: status,
            keterangan: keterangan
        });
        alert(`Absensi '${status}' berhasil dicatat!`);
        if (currentRole === 'siswa') {
            absensiHariIniSelesai = true;
            showDashboard();
        } else if (currentRole === 'guru') {
            document.getElementById("container-absen-kelas").innerHTML = `<p style="color:green;"><strong>Terima kasih, absensi Anda untuk hari ini telah tercatat.</strong></p>`;
        }
    };

    if (status === 'masuk') {
        const tombolAbsenSiswa = document.getElementById(`btn-absen-masuk-siswa`);
        // Menargetkan semua tombol absen masuk guru yang mungkin ada
        const semuaTombolAbsenGuru = document.querySelectorAll('#container-absen-kelas button');

        let targetLokasi, namaLokasi;
        if (currentRole === 'guru' && id_kelas) {
            const kelas = data.kelas.find(k => k.id === id_kelas);
            targetLokasi = kelas.lokasi;
            namaLokasi = kelas.nama;
            semuaTombolAbsenGuru.forEach(btn => btn.disabled = true);
        } else if (currentRole === 'siswa') {
            // Lokasi default sekolah untuk siswa, bisa disesuaikan
            targetLokasi = { latitude: -7.983908, longitude: 112.621391 };
            namaLokasi = "Sekolah";
            if (tombolAbsenSiswa) {
                 tombolAbsenSiswa.disabled = true;
                 tombolAbsenSiswa.textContent = "Mengecek Lokasi...";
            }
        } else {
             return alert("Error: Target lokasi tidak ditemukan.");
        }

        const radiusAbsen = 200; // dalam meter

        navigator.geolocation.getCurrentPosition(
            posisi => {
                const jarak = hitungJarak(posisi.coords.latitude, posisi.coords.longitude, targetLokasi.latitude, targetLokasi.longitude);
                if (jarak <= radiusAbsen) {
                    catatAbsensi();
                } else {
                    alert(`Gagal! Anda berada ${Math.round(jarak)} meter dari ${namaLokasi}. Jarak maksimal adalah ${radiusAbsen} meter.`);
                }
                // Kembalikan kondisi tombol
                if (currentRole === 'siswa' && tombolAbsenSiswa) {
                     tombolAbsenSiswa.disabled = false;
                     tombolAbsenSiswa.textContent = "📍 Masuk";
                } else if (currentRole === 'guru') {
                     // Jika gagal, aktifkan kembali tombol agar bisa coba lagi
                     if(jarak > radiusAbsen) showDashboard();
                }
            },
            () => {
                alert("Tidak bisa mengakses lokasi. Pastikan GPS aktif dan izin lokasi telah diberikan.");
                if (currentRole === 'siswa' && tombolAbsenSiswa) {
                     tombolAbsenSiswa.disabled = false;
                     tombolAbsenSiswa.textContent = "📍 Masuk";
                } else if (currentRole === 'guru') {
                     showDashboard();
                }
            }
        );

    } else { // Untuk Izin dan Sakit
        const alasan = prompt(`Masukkan alasan Anda ${status}:`);
        if (alasan) {
            catatAbsensi(alasan);
        } else {
            alert("Absensi dibatalkan karena alasan tidak diisi.");
        }
    }
}
// --- MODIFIKASI FUNGSI ABSEN SELESAI ---

function hitungJarak(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // meter
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // dalam meter
}

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
        { id: 2, nama: "Kelas 11B", lokasi: { latitude: -7.983500, longitude: 112.621800 } }
    ],
    tugas: [], absensi: [], pengumuman: [], materi: [],
    // DATA BARU UNTUK FITUR INOVATIF
    notifikasi: []
};

// BAGIAN 2: PENGATURAN AWAL & TAMPILAN
let currentUser = null, currentRole = null, absensiHariIniSelesai = false;
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("kata-harian") ? setupHalamanAwal() : document.getElementById("app") && showView("view-role-selection");
});
function showView(viewId) { /* ... (fungsi ini tidak berubah) ... */ }
function setupHalamanAwal() { /* ... (fungsi ini tidak berubah) ... */ }


// BAGIAN 3: LOGIKA LOGIN & LOGOUT
function showLogin(role) { /* ... (fungsi ini tidak berubah) ... */ }
function populateGuruDropdown() { /* ... (fungsi ini tidak berubah) ... */ }
function populateKelasDropdown() { /* ... (fungsi ini tidak berubah) ... */ }
function populateSiswaDropdown() { /* ... (fungsi ini tidak berubah) ... */ }
function login() { /* ... (fungsi ini tidak berubah) ... */ }
function logout() { /* ... (fungsi ini tidak berubah) ... */ }

// BAGIAN 4: RENDER DASHBOARD UTAMA
function showDashboard() {
    showView("view-dashboard");
    const header = document.querySelector("#view-dashboard .header");
    const title = document.getElementById("dashboard-title");
    const content = document.getElementById("dashboard-content");
    content.innerHTML = "";
    
    // INJEKSI NOTIFIKASI BELL SECARA DINAMIS
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
        renderAdminAnalitik();
    } else if (currentRole === 'guru') {
        document.getElementById('dashboard-title').textContent = `Selamat Datang, ${currentUser.nama}`;
        content.innerHTML = renderGuruDashboard() + gantiPasswordHTML;
        cekJadwalMengajar();
        renderTugasSubmissions();
    } else if (currentRole === 'siswa') {
        document.getElementById('dashboard-title').textContent = `Selamat Datang, ${currentUser.nama}`;
        cekAbsensiSiswaHariIni();
        content.innerHTML = renderSiswaDashboard() + gantiPasswordHTML;
        renderSiswaFeatures();
    }
    renderNotificationBell();
}


// =================================================================================
// BAGIAN 5: FITUR-FITUR INOVATIF & INTEGRASINYA
// =================================================================================

// --- FITUR 7: NOTIFIKASI REAL-TIME ---
function createNotification(id_user, role, message) {
    // Hindari notifikasi untuk diri sendiri
    if (currentUser && currentUser.id === id_user && currentRole === role) return;
    
    data.notifikasi.push({
        id: Date.now(),
        id_user, role, message,
        read: false,
        timestamp: new Date()
    });
}

function renderNotificationBell() {
    const notifBadge = document.getElementById('notif-badge');
    const unreadNotifs = data.notifikasi.filter(n => (n.id_user === currentUser.id || n.id_user === 'semua') && n.role === currentRole && !n.read);
    
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
    const userNotifs = data.notifikasi.filter(n => (n.id_user === currentUser.id || n.id_user === 'semua') && n.role === currentRole);
    
    if (userNotifs.length === 0) {
        dropdown.innerHTML = '<div class="notif-item">Tidak ada notifikasi.</div>';
        return;
    }
    
    let html = '';
    [...userNotifs].reverse().forEach(n => {
        html += `<div class="notif-item ${n.read ? 'read' : ''}" onclick="markNotifAsRead(${n.id})">
            <p>${n.message}</p>
            <span class="notif-time">${new Date(n.timestamp).toLocaleString('id-ID')}</span>
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


// --- FITUR 8: FORUM DISKUSI PER TUGAS ---
function renderDiskusi(id_tugas) {
    const tugas = data.tugas.find(t => t.id === id_tugas);
    let html = `<div class="discussion-container"><h5>Diskusi Tugas</h5>`;
    
    // Tampilkan pesan
    if (tugas.diskusi && tugas.diskusi.length > 0) {
        tugas.diskusi.forEach(p => {
            const senderClass = (p.id_user === currentUser.id && p.role === currentRole) ? 'sender-self' : 'sender-other';
            html += `<div class="discussion-message ${senderClass}">
                <strong>${p.nama_user} (${p.role}):</strong>
                <p>${p.pesan}</p>
                <span class="notif-time">${new Date(p.timestamp).toLocaleTimeString('id-ID')}</span>
            </div>`;
        });
    } else {
        html += '<p>Belum ada diskusi untuk tugas ini.</p>';
    }

    // Form input pesan
    html += `<div class="discussion-form">
        <textarea id="pesan-diskusi-${id_tugas}" placeholder="Tulis pesan..."></textarea>
        <button class="small-btn" onclick="tambahPesanDiskusi(${id_tugas})">Kirim</button>
    </div>`;
    
    html += `</div>`;
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

    // Buat notifikasi
    if (currentRole === 'siswa') {
        // Notif untuk guru
        createNotification(tugas.id_guru, 'guru', `Siswa '${currentUser.nama}' mengirim pesan di tugas '${tugas.judul}'.`);
    } else if (currentRole === 'guru') {
        // Notif untuk semua siswa di kelas
        const siswaDiKelas = data.users.siswas.filter(s => s.id_kelas === tugas.id_kelas);
        siswaDiKelas.forEach(s => {
            createNotification(s.id, 'siswa', `Guru '${currentUser.nama}' membalas di diskusi tugas '${tugas.judul}'.`);
        });
    }
    
    // Re-render view terkait
    if (currentRole === 'siswa') renderDaftarTugas();
    else if (currentRole === 'guru') renderTugasSubmissions();
}

// --- INTEGRASI NOTIFIKASI KE FUNGSI YANG ADA ---
function kirimTugas() {
    const id_kelas = parseInt(document.getElementById("tugas-kelas").value), judul = document.getElementById("tugas-judul").value, deskripsi = document.getElementById("tugas-deskripsi").value, deadline = document.getElementById("tugas-deadline").value, file = document.getElementById("tugas-file").files[0];
    if (!id_kelas || !judul || !deskripsi || !deadline) return alert("Harap lengkapi semua data tugas!");
    
    data.tugas.push({
        id: Date.now(), id_guru: currentUser.id, nama_guru: currentUser.nama, id_kelas, judul, deskripsi, deadline,
        file: file ? file.name : "Tidak ada file",
        submissions: [],
        diskusi: [] // Inisialisasi forum diskusi
    });
    
    // NOTIFIKASI: Kirim ke semua siswa di kelas
    const siswaDiKelas = data.users.siswas.filter(s => s.id_kelas === id_kelas);
    siswaDiKelas.forEach(s => createNotification(s.id, 'siswa', `Tugas baru '${judul}' telah ditambahkan.`));
    
    alert(`Tugas "${judul}" berhasil dikirim!`);
    showDashboard();
}
function submitTugas(id_tugas) {
    const file = document.getElementById(`submit-file-${id_tugas}`).files[0];
    if (!file) return alert("Pilih file jawaban terlebih dahulu!");
    const tugas = data.tugas.find(t => t.id === id_tugas);
    if (tugas) {
        tugas.submissions.push({
            id_siswa: currentUser.id, nama_siswa: currentUser.nama, file: file.name,
            timestamp: new Date().toLocaleString("id-ID"), nilai: null, feedback: ""
        });
        
        // NOTIFIKASI: Kirim ke guru
        createNotification(tugas.id_guru, 'guru', `Siswa '${currentUser.nama}' telah mengumpulkan tugas '${tugas.judul}'.`);
        
        alert(`Jawaban berhasil dikirim!`);
        renderDaftarTugas();
    }
}
function simpanNilai(id_tugas, id_siswa) {
    const nilai = document.getElementById(`nilai-${id_tugas}-${id_siswa}`).value, feedback = document.getElementById(`feedback-${id_tugas}-${id_siswa}`).value;
    if (nilai === "" || nilai < 0 || nilai > 100) return alert("Nilai harus diisi antara 0-100.");
    
    const tugas = data.tugas.find(t => t.id === id_tugas);
    const submission = tugas.submissions.find(s => s.id_siswa === id_siswa);
    submission.nilai = parseInt(nilai); submission.feedback = feedback || "Tidak ada feedback.";
    
    // NOTIFIKASI: Kirim ke siswa yang dinilai
    createNotification(id_siswa, 'siswa', `Tugas '${tugas.judul}' Anda telah dinilai.`);
    
    alert("Nilai berhasil disimpan!");
    renderTugasSubmissions();
}
function buatPengumuman() {
    const judul = document.getElementById('pengumuman-judul').value, isi = document.getElementById('pengumuman-isi').value;
    if (!judul || !isi) return alert('Judul dan isi harus diisi!');
    data.pengumuman.push({
        id: Date.now(), oleh: currentRole === 'admin' ? 'Admin' : currentUser.nama, judul, isi,
        tanggal: new Date().toISOString().slice(0, 10), target_kelas_id: 'semua'
    });
    
    // NOTIFIKASI: Kirim ke semua user
    data.users.siswas.forEach(s => createNotification(s.id, 'siswa', `Pengumuman baru: '${judul}'`));
    data.users.gurus.forEach(g => createNotification(g.id, 'guru', `Pengumuman baru: '${judul}'`));
    
    alert('Pengumuman berhasil dikirim!');
    currentRole === 'admin' ? renderAdminPengumuman() : showDashboard();
}

// --- PEMBARUAN TAMPILAN TUGAS UNTUK MENAMPILKAN FORUM DISKUSI ---
function renderDaftarTugas() {
    const container = document.getElementById("daftar-tugas-container");
    const notif = document.getElementById("notif-tugas");
    const tugasSiswa = data.tugas.filter(t => t.id_kelas === currentUser.id_kelas);
    notif.textContent = tugasSiswa.length;
    if (tugasSiswa.length === 0) { container.innerHTML = "<p>🎉 Hore, tidak ada tugas saat ini!</p>"; return; }
    
    let html = "";
    tugasSiswa.forEach(t => {
        const submission = t.submissions ? t.submissions.find(s => s.id_siswa === currentUser.id) : null;
        html += `<div class="task-card">
            <div class="task-header"><span><strong>${t.judul}</strong> - ${t.nama_guru}</span><span class="task-deadline">Deadline: ${t.deadline}</span></div>
            <p>${t.deskripsi}</p><p>File: <em>${t.file}</em></p>
            ${submission ? `... (status pengumpulan & nilai tidak berubah) ...` : `... (form submit tidak berubah) ...`}
            ${renderDiskusi(t.id)}
        </div>`;
         // Helper to keep code clean, replacing parts that did not change.
        const submissionHTML = submission ? `<div class="submission-status"><p style="color:green;"><strong>✔ Anda sudah mengumpulkan.</strong></p>${submission.nilai !== null ? `<p class="grade-display"><strong>Nilai: ${submission.nilai}</strong></p><p class="feedback-display"><em>Feedback: ${submission.feedback}</em></p>` : `<p>Menunggu penilaian...</p>`}</div>` : `<label>Kirim Jawaban:</label><input type="file" id="submit-file-${t.id}"><button onclick="submitTugas(${t.id})">Kirim</button>`;
        html = html.replace('... (status pengumpulan & nilai tidak berubah) ...', submissionHTML.substring(0, submissionHTML.indexOf('</div>')+6));
        html = html.replace('... (form submit tidak berubah) ...', submissionHTML.substring(submissionHTML.indexOf('<label>')));

    });
    container.innerHTML = html;
}

function renderTugasSubmissions() {
    const container = document.getElementById("submission-container");
    const tugasGuru = data.tugas.filter(t => t.id_guru === currentUser.id);
    if (tugasGuru.length === 0) { container.innerHTML = "<p>Anda belum mengirim tugas apapun.</p>"; return; }
    
    let html = "";
    tugasGuru.forEach(t => {
        html += `<div class="task-card"><h5>Tugas: ${t.judul} (Kelas: ${data.kelas.find(k=>k.id===t.id_kelas).nama})</h5>`;
        if (t.submissions && t.submissions.length > 0) {
            html += "<ul class='submission-list'>";
            t.submissions.forEach(sub => {
                html += `<li>... (detail submission tidak berubah) ...</li>`;
                const submissionDetailHTML = `<strong>${sub.nama_siswa}</strong> mengumpulkan file: <em>${sub.file}</em><div class="grading-container">${sub.nilai !== null ? `<p class="grade-display"><strong>Nilai: ${sub.nilai}</strong></p><p class="feedback-display"><em>Feedback: ${sub.feedback}</em></p>` : `<input type="number" id="nilai-${t.id}-${sub.id_siswa}" placeholder="Nilai"><input type="text" id="feedback-${t.id}-${sub.id_siswa}" placeholder="Umpan Balik"><button class="small-btn" onclick="simpanNilai(${t.id}, ${sub.id_siswa})">Simpan</button>`}</div>`;
                html = html.replace('... (detail submission tidak berubah) ...', submissionDetailHTML);
            });
            html += "</ul>";
        } else { html += "<p>Belum ada siswa yang mengumpulkan.</p>"; }
        html += renderDiskusi(t.id) + `</div>`;
    });
    container.innerHTML = html;
}


// =================================================================================
// BAGIAN 6: SEMUA FUNGSI LAINNYA (TIDAK BERUBAH)
// =================================================================================
function showView(viewId){document.querySelectorAll("#app > div").forEach(div=>div.classList.add("hidden")),document.getElementById(viewId).classList.remove("hidden")}
function setupHalamanAwal(){const quotes=["Minggu: Istirahat adalah bagian dari proses.","Senin: Mulailah minggu dengan energi penuh!","Selasa: Terus belajar, terus bertumbuh.","Rabu: Jangan takut gagal, takutlah tidak mencoba.","Kamis: Optimis melihat masa depan!","Jumat: Selesaikan apa yang kamu mulai.","Sabtu: Refleksi dan siapkan hari esok."];document.getElementById("kata-harian").textContent=quotes[new Date().getDay()],document.getElementById("tombol-buka").addEventListener("click",()=>window.location.href="main.html")}
function showLogin(role){currentRole=role,showView("view-login-form"),document.querySelectorAll("#view-login-form > div").forEach(div=>div.classList.add("hidden"));const title=document.getElementById("login-title");"admin"===role?(title.textContent="Login Admin",document.getElementById("form-admin").classList.remove("hidden")):"guru"===role?(title.textContent="Login Guru",document.getElementById("form-guru").classList.remove("hidden"),populateGuruDropdown()):"siswa"===role&&(title.textContent="Login Siswa",document.getElementById("form-siswa").classList.remove("hidden"),populateKelasDropdown())}
function populateGuruDropdown(){const select=document.getElementById("guru-select-nama");select.innerHTML='<option value="">-- Pilih Nama Guru --</option>',data.users.gurus.forEach(guru=>select.innerHTML+=`<option value="${guru.id}">${guru.nama}</option>`)}
function populateKelasDropdown(){const select=document.getElementById("siswa-select-kelas");select.innerHTML='<option value="">-- Pilih Kelas --</option>',data.kelas.forEach(k=>select.innerHTML+=`<option value="${k.id}">${k.nama}</option>`),populateSiswaDropdown()}
function populateSiswaDropdown(){const kelasId=document.getElementById("siswa-select-kelas").value,select=document.getElementById("siswa-select-nama");select.innerHTML='<option value="">-- Pilih Nama Siswa --</option>',kelasId&&data.users.siswas.filter(s=>s.id_kelas==kelasId).forEach(s=>select.innerHTML+=`<option value="${s.id}">${s.nama}</option>`)}
function login(){let user=null;"admin"===currentRole?user=data.users.admins.find(u=>u.username===document.getElementById("admin-user").value&&u.password===document.getElementById("admin-pass").value):"guru"===currentRole?user=data.users.gurus.find(u=>u.id==document.getElementById("guru-select-nama").value&&u.password===document.getElementById("guru-pass").value):"siswa"===currentRole&&(user=data.users.siswas.find(u=>u.id==document.getElementById("siswa-select-nama").value&&u.password===document.getElementById("siswa-pass").value)),user?(currentUser=user,alert("Login Berhasil!"),showDashboard()):alert("Login Gagal! Periksa kembali data Anda.")}
function logout(){currentUser=null,currentRole=null,absensiHariIniSelesai=!1,showView("view-role-selection"),document.querySelectorAll("input").forEach(i=>i.value="")}
function renderAdminDashboard(){return`<div class="tabs"><button class="tab-link active" onclick="openAdminTab(event, 'Analitik')">📈 Analitik</button><button class="tab-link" onclick="openAdminTab(event, 'Absensi')">📊 Rekap Absensi</button><button class="tab-link" onclick="openAdminTab(event, 'Manajemen')">⚙️ Manajemen Data</button><button class="tab-link" onclick="openAdminTab(event, 'Pengumuman')">📢 Pengumuman</button></div><div id="Analitik" class="tab-content" style="display:block;"></div><div id="Absensi" class="tab-content"></div><div id="Manajemen" class="tab-content"></div><div id="Pengumuman" class="tab-content"></div>`}
function openAdminTab(evt,tabName){document.querySelectorAll(".tab-content").forEach(tc=>tc.style.display="none"),document.querySelectorAll(".tab-link").forEach(tl=>tl.className=tl.className.replace(" active","")),document.getElementById(tabName).style.display="block",evt.currentTarget.className+=" active","Analitik"===tabName?renderAdminAnalitik():"Absensi"===tabName?renderAdminAbsensi():"Manajemen"===tabName?renderAdminManajemen():"Pengumuman"===tabName&&renderAdminPengumuman()}
function renderAdminAnalitik(){const container=document.getElementById("Analitik"),totalSiswa=data.users.siswas.length,totalGuru=data.users.gurus.length,totalAbsenHariIni=data.absensi.filter(a=>a.tanggal===(new Date).toISOString().slice(0,10)).length;let chartHTML='<div class="chart-container"><h5>Persentase Kehadiran per Kelas (Bulan Ini)</h5>';data.kelas.forEach(k=>{const siswaDiKelas=data.users.siswas.filter(s=>s.id_kelas===k.id),absenBulanIni=data.absensi.filter(a=>siswaDiKelas.some(s=>s.id===a.id_user)&&"masuk"===a.status),persentase=siswaDiKelas.length>0?absenBulanIni.length/(30*siswaDiKelas.length)*100:0;chartHTML+=`<div class="chart-bar-wrapper"><div class="chart-label">${k.nama}</div><div class="chart-bar-background"><div class="chart-bar-foreground" style="width: ${Math.min(persentase,100)}%;">${Math.round(persentase)}%</div></div></div>`}),chartHTML+="</div>",container.innerHTML=`<div class="stats-container"><div class="stat-card"><h4>Total Siswa</h4><p>${totalSiswa}</p></div><div class="stat-card"><h4>Total Guru</h4><p>${totalGuru}</p></div><div class="stat-card"><h4>Absen Hari Ini</h4><p>${totalAbsenHariIni}</p></div></div> ${chartHTML}`}
function renderAdminPengumuman(){const container=document.getElementById("Pengumuman");let listHTML="<h5>Daftar Pengumuman</h5>";0===data.pengumuman.length?listHTML+="<p>Belum ada pengumuman.</p>":[...data.pengumuman].reverse().forEach(p=>{listHTML+=`<div class="announcement-card"><div class="announcement-header"><strong>${p.judul}</strong> - <span>Oleh: ${p.oleh} (${p.tanggal})</span></div><p>${p.isi}</p><button class="small-btn delete" onclick="hapusPengumuman(${p.id})">Hapus</button></div>`}),container.innerHTML=`<div class="dashboard-section"><h4>Buat Pengumuman Baru</h4><input type="text" id="pengumuman-judul" placeholder="Judul Pengumuman"><textarea id="pengumuman-isi" placeholder="Isi pengumuman..."></textarea><button onclick="buatPengumuman()">Kirim Pengumuman</button></div><div class="dashboard-section">${listHTML}</div>`}
function hapusPengumuman(id){confirm("Yakin ingin menghapus pengumuman ini?")&&(data.pengumuman=data.pengumuman.filter(p=>p.id!==id),renderAdminPengumuman())}
function renderGuruDashboard(){return`<div class="dashboard-section" id="guru-absen"><h4>🗓️ Absensi & Jadwal</h4><p id="info-absen-guru">Mengecek jadwal...</p><button id="btn-mulai-ajar" onclick="mulaiAjar()" disabled>Mulai Ajar</button><div id="container-absen-kelas" style="margin-top: 1rem;"></div></div><div class="dashboard-section" id="guru-tugas"><h4>📤 Manajemen Tugas</h4><select id="tugas-kelas">${data.kelas.map(k=>`<option value="${k.id}">${k.nama}</option>`).join("")}</select><input type="text" id="tugas-judul" placeholder="Judul Tugas"><textarea id="tugas-deskripsi" placeholder="Deskripsi..."></textarea><label>Batas Waktu:</label><input type="date" id="tugas-deadline"><label>Upload File:</label><input type="file" id="tugas-file"><button onclick="kirimTugas()">Kirim Tugas</button><div id="submission-container" style="margin-top: 1rem;"></div></div><div class="dashboard-section"><h4>📚 Unggah Materi Pembelajaran</h4><select id="materi-kelas">${data.kelas.map(k=>`<option value="${k.id}">${k.nama}</option>`).join("")}</select><input type="text" id="materi-judul" placeholder="Judul Materi"><textarea id="materi-deskripsi" placeholder="Deskripsi singkat..."></textarea><label>Upload File (Simulasi):</label><input type="file" id="materi-file"><button onclick="unggahMateri()">Unggah Materi</button></div><div class="dashboard-section"><h4>📢 Buat Pengumuman</h4><input type="text" id="pengumuman-judul" placeholder="Judul Pengumuman"><textarea id="pengumuman-isi" placeholder="Isi pengumuman..."></textarea><button onclick="buatPengumuman()">Kirim</button></div>`}
function unggahMateri(){const id_kelas=parseInt(document.getElementById("materi-kelas").value),judul=document.getElementById("materi-judul").value,deskripsi=document.getElementById("materi-deskripsi").value,file=document.getElementById("materi-file").files[0];if(!id_kelas||!judul||!deskripsi)return alert("Semua kolom harus diisi!");data.materi.push({id:Date.now(),id_guru:currentUser.id,id_kelas,judul,deskripsi,file:file?file.name:"Tidak ada file"}),alert("Materi berhasil diunggah!"),document.getElementById("materi-judul").value="",document.getElementById("materi-deskripsi").value="",document.getElementById("materi-file").value=""}
function renderSiswaDashboard(){const locked=absensiHariIniSelesai?"":"locked-feature",warning=absensiHariIniSelesai?"":'<p><strong>🔒 Lakukan absensi untuk membuka fitur lain.</strong></p>';return`<div class="dashboard-section" id="siswa-absen"><h4>✅ Absensi Siswa</h4><button id="btn-absen-masuk-siswa" onclick="absen('masuk')">📍 Masuk</button><button onclick="absen('izin')">📝 Izin</button><button onclick="absen('sakit')">🤒 Sakit</button></div><div id="fitur-siswa-wrapper" class="${locked}">${warning}<div class="dashboard-section"><h4>📢 Pengumuman</h4><div id="pengumuman-container"></div></div><div class="dashboard-section"><h4>📚 Materi Pembelajaran</h4><div id="materi-container"></div></div><div class="dashboard-section"><h4>📚 Tugas Sekolah <span id="notif-tugas" class="notification-badge">0</span></h4><div id="daftar-tugas-container"></div></div></div>`}
function renderSiswaFeatures(){const pengumumanContainer=document.getElementById("pengumuman-container");let pengumumanHTML="";data.pengumuman.length>0?([...data.pengumuman].reverse().forEach(p=>{pengumumanHTML+=`<div class="announcement-card"><div class="announcement-header"><strong>${p.judul}</strong> - <span>Oleh: ${p.oleh} (${p.tanggal})</span></div><p>${p.isi}</p></div>`}),pengumumanContainer.innerHTML=pengumumanHTML):pengumumanContainer.innerHTML="<p>Tidak ada pengumuman baru.</p>";const materiContainer=document.getElementById("materi-container"),materiKelas=data.materi.filter(m=>m.id_kelas===currentUser.id_kelas);let materiHTML="";materiKelas.length>0?(materiKelas.forEach(m=>{materiHTML+=`<div class="task-card"><div class="task-header"><strong>${m.judul}</strong></div><p>${m.deskripsi}</p><p>File: <em>${m.file}</em></p><button class="small-btn" onclick="alert('Simulasi mengunduh file ${m.file}')">Unduh</button></div>`}),materiContainer.innerHTML=materiHTML):materiContainer.innerHTML="<p>Belum ada materi yang diunggah untuk kelas ini.</p>",renderDaftarTugas()}
function renderAdminAbsensi(){let kelasOptions=data.kelas.map(k=>`<option value="${k.id}">${k.nama}</option>`).join("");const container=document.getElementById("Absensi");container.innerHTML=`<div class="filter-group"><label>Dari:</label><input type="date" id="start-date"><label>Sampai:</label><input type="date" id="end-date"></div><div class="filter-group"><button onclick="renderRekapAbsensiGuru()">Rekap Guru</button><label>atau rekap siswa:</label><select id="kelas-select" onchange="renderRekapSiswa()"><option value="">-- Pilih Kelas --</option>${kelasOptions}</select><button id="export-btn" onclick="exportToCSV()">🖨️ Ekspor ke CSV</button></div><div id="rekap-container"><p>Pilih rentang tanggal dan jenis rekap.</p></div>`}
function renderAdminManajemen(){const container=document.getElementById("Manajemen");container.innerHTML=`<p>Pilih data yang ingin Anda kelola.</p><button onclick="renderManajemenDetail('guru')">Kelola Guru</button><button onclick="renderManajemenDetail('siswa')">Kelola Siswa</button>`}
function getFilteredAbsensi(){const start=document.getElementById("start-date").value,end=document.getElementById("end-date").value;return start&&end?data.absensi.filter(a=>a.tanggal>=start&&a.tanggal<=end):data.absensi}
function renderRekapAbsensiGuru(){const container=document.getElementById("rekap-container"),absensiFiltered=getFilteredAbsensi().filter(a=>"guru"===a.role);let html="<h5>Rekap Absensi Guru</h5>";0===absensiFiltered.length?html+="<p>Tidak ada data absensi guru.</p>":(html+="<table><thead><tr><th>Nama</th><th>Tanggal</th><th>Status</th><th>Keterangan</th></tr></thead><tbody>",absensiFiltered.forEach(a=>{html+=`<tr><td>${a.nama}</td><td>${a.tanggal}</td><td>${a.status}</td><td>${a.keterangan||"-"}</td></tr>`}),html+="</tbody></table>"),container.innerHTML=html}
function renderRekapSiswa(){const container=document.getElementById("rekap-container"),kelasId=document.getElementById("kelas-select").value;if(!kelasId)return void(container.innerHTML="<p>Silakan pilih kelas.</p>");const siswaDiKelas=data.users.siswas.filter(s=>s.id_kelas==kelasId),absensiFiltered=getFilteredAbsensi();let html=`<h5>Rekap Absensi ${document.getElementById("kelas-select").options[document.getElementById("kelas-select").selectedIndex].text}</h5>`;html+="<table><thead><tr><th>Nama Siswa</th><th>Masuk</th><th>Izin</th><th>Sakit</th><th>Alfa</th></tr></thead><tbody>",siswaDiKelas.forEach(siswa=>{const absensiSiswa=absensiFiltered.filter(a=>a.id_user===siswa.id),rekap={masuk:absensiSiswa.filter(a=>"masuk"===a.status).length,izin:absensiSiswa.filter(a=>"izin"===a.status).length,sakit:absensiSiswa.filter(a=>"sakit"===a.status).length,alfa:absensiSiswa.filter(a=>"alfa"===a.status).length};html+=`<tr><td>${siswa.nama}</td><td>${rekap.masuk}</td><td>${rekap.izin}</td><td>${rekap.sakit}</td><td>${rekap.alfa}</td></tr>`}),html+="</tbody></table>",container.innerHTML=html}
function absen(status,id_kelas=null){const today=(new Date).toISOString().slice(0,10);if(data.absensi.find(a=>a.id_user===currentUser.id&&a.role===currentRole&&a.tanggal===today))return alert("Anda sudah absen hari ini.");const catatAbsensi=keterangan=>{data.absensi.push({id_user:currentUser.id,role:currentRole,nama:currentUser.nama,tanggal:today,status,keterangan}),alert(`Absensi '${status}' berhasil!`),"siswa"===currentRole?(absensiHariIniSelesai=!0,showDashboard()):"guru"===currentRole&&(document.getElementById("container-absen-kelas").innerHTML='<p style="color:green;"><strong>Absensi Anda telah tercatat.</strong></p>')};if("masuk"===status){let targetLokasi,btn;const radius=200;if("guru"===currentRole&&id_kelas){const kelas=data.kelas.find(k=>k.id===id_kelas);targetLokasi=kelas.lokasi}else"siswa"===currentRole&&(targetLokasi={latitude:-7.983908,longitude:112.621391},btn=document.getElementById("btn-absen-masuk-siswa"),btn.disabled=!0,btn.textContent="Mengecek Lokasi...");navigator.geolocation.getCurrentPosition(pos=>{const jarak=hitungJarak(pos.coords.latitude,pos.coords.longitude,targetLokasi.latitude,targetLokasi.longitude);jarak<=radius?catatAbsensi(""):alert(`Gagal! Jarak Anda dari lokasi: ${Math.round(jarak)} meter.`),btn&&(btn.disabled=!1,btn.textContent="📍 Masuk")},()=>{alert("Tidak bisa mengakses lokasi."),btn&&(btn.disabled=!1,btn.textContent="📍 Masuk")})}else{const alasan=prompt(`Masukkan alasan Anda ${status}:`);alasan?catatAbsensi(alasan):alert("Absensi dibatalkan.")}}
function changePassword(){const oldP=document.getElementById("old-pass").value,newP=document.getElementById("new-pass").value,confirmP=document.getElementById("confirm-new-pass").value;if(!oldP||!newP||!confirmP)return alert("Semua kolom harus diisi!");if(newP!==confirmP)return alert("Password baru tidak cocok!");if(oldP!==currentUser.password)return alert("Password lama salah!");currentUser.password=newP,alert("Password berhasil diubah!"),document.getElementById("old-pass").value="",document.getElementById("new-pass").value="",document.getElementById("confirm-new-pass").value=""}

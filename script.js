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
    tugas: [], absensi: [], pengumuman: [], materi: [], notifikasi: [],
    jadwalPelajaran: {
        1: [
            { id: 1672531200000, hari: 1, jamMulai: '08:00', jamSelesai: '09:30', mataPelajaran: 'Matematika' },
            { id: 1672621200002, hari: 2, jamMulai: '08:00', jamSelesai: '09:30', mataPelajaran: 'Fisika' },
        ],
        2: [ { id: 1672707600003, hari: 3, jamMulai: '09:00', jamSelesai: '10:30', mataPelajaran: 'Kimia' } ]
    },
    catatanPR: []
};

// BAGIAN 2: PENGATURAN AWAL & FUNGSI HELPER
let currentUser = null, currentRole = null, absensiHariIniSelesai = false;
document.addEventListener("DOMContentLoaded", () => { document.getElementById("kata-harian") ? setupHalamanAwal() : document.getElementById("app") && showView("view-role-selection"); });
function showView(viewId) { document.querySelectorAll("#app > div").forEach(div => div.classList.add("hidden")); document.getElementById(viewId).classList.remove("hidden"); }
function setupHalamanAwal() { const quotes = ["Minggu: Istirahat.", "Senin: Mulailah!", "Selasa: Terus bertumbuh.", "Rabu: Jangan takut gagal.", "Kamis: Optimis!", "Jumat: Selesaikan.", "Sabtu: Refleksi."]; document.getElementById("kata-harian").textContent = quotes[new Date().getDay()]; document.getElementById("tombol-buka").addEventListener("click", () => window.location.href = "main.html"); }
function getNomorMinggu(date) { const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())); const dayNum = d.getUTCDay() || 7; d.setUTCDate(d.getUTCDate() + 4 - dayNum); const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1)); return Math.ceil((((d - yearStart) / 86400000) + 1) / 7); }

// BAGIAN 3: LOGIKA LOGIN & LOGOUT
function showLogin(role){currentRole=role,showView("view-login-form"),document.querySelectorAll("#view-login-form > div").forEach(div=>div.classList.add("hidden"));const title=document.getElementById("login-title");"admin"===role?(title.textContent="Login Admin",document.getElementById("form-admin").classList.remove("hidden")):"guru"===role?(title.textContent="Login Guru",document.getElementById("form-guru").classList.remove("hidden"),populateGuruDropdown()):"siswa"===role&&(title.textContent="Login Siswa",document.getElementById("form-siswa").classList.remove("hidden"),populateKelasDropdown())}
function populateGuruDropdown(){const select=document.getElementById("guru-select-nama");select.innerHTML='<option value="">-- Pilih Nama Guru --</option>',data.users.gurus.forEach(guru=>select.innerHTML+=`<option value="${guru.id}">${guru.nama}</option>`)}
function populateKelasDropdown(){const select=document.getElementById("siswa-select-kelas");select.innerHTML='<option value="">-- Pilih Kelas --</option>',data.kelas.forEach(k=>select.innerHTML+=`<option value="${k.id}">${k.nama}</option>`),populateSiswaDropdown()}
function populateSiswaDropdown(){const kelasId=document.getElementById("siswa-select-kelas").value,select=document.getElementById("siswa-select-nama");select.innerHTML='<option value="">-- Pilih Nama Siswa --</option>',kelasId&&data.users.siswas.filter(s=>s.id_kelas==kelasId).forEach(s=>select.innerHTML+=`<option value="${s.id}">${s.nama}</option>`)}
function login(){let user=null;"admin"===currentRole?user=data.users.admins.find(u=>u.username===document.getElementById("admin-user").value&&u.password===document.getElementById("admin-pass").value):"guru"===currentRole?user=data.users.gurus.find(u=>u.id==document.getElementById("guru-select-nama").value&&u.password===document.getElementById("guru-pass").value):"siswa"===currentRole&&(user=data.users.siswas.find(u=>u.id==document.getElementById("siswa-select-nama").value&&u.password===document.getElementById("siswa-pass").value)),user?(currentUser=user,alert("Login Berhasil!"),showDashboard()):alert("Login Gagal! Periksa kembali data Anda.")}
function logout(){currentUser=null,currentRole=null,absensiHariIniSelesai=!1,showView("view-role-selection"),document.querySelectorAll("input").forEach(i=>i.value="")}

// BAGIAN 4: RENDER DASHBOARD UTAMA
function showDashboard() {
    showView("view-dashboard");
    const header = document.querySelector("#view-dashboard .header");
    const content = document.getElementById("dashboard-content");
    content.innerHTML = "";
    if (!document.getElementById('notification-bell')) { header.innerHTML = `<h2 id="dashboard-title">Dashboard</h2><div class="header-actions"><div id="notification-bell" onclick="toggleNotifDropdown()"><span id="notif-badge" class="notification-badge hidden">0</span>🔔</div><div id="notification-dropdown" class="hidden"></div><button class="logout-button" onclick="logout()">Logout</button></div>`; }
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
// BAGIAN 5: FITUR-FITUR INTI DAN PERBAIKANNYA
// =================================================================================

function renderAdminDashboard() {
    return `
    <div class="tabs">
        <button class="tab-link active" onclick="openAdminTab(event, 'Analitik')">📈 Analitik</button>
        <button class="tab-link" onclick="openAdminTab(event, 'Persetujuan')">✅ Persetujuan Absen</button>
        <button class="tab-link" onclick="openAdminTab(event, 'Absensi')">📊 Rekap Absensi</button>
        <button class="tab-link" onclick="openAdminTab(event, 'Manajemen')">⚙️ Manajemen Data</button>
        <button class="tab-link" onclick="openAdminTab(event, 'JadwalGuru')">🗓️ Jadwal Guru</button>
        <button class="tab-link" onclick="openAdminTab(event, 'JadwalPelajaran')">📚 Jadwal Pelajaran</button>
        <button class="tab-link" onclick="openAdminTab(event, 'Pengumuman')">📢 Pengumuman</button>
    </div>
    <div id="Analitik" class="tab-content" style="display:block;"></div>
    <div id="Persetujuan" class="tab-content"></div>
    <div id="Absensi" class="tab-content"></div><div id="Manajemen" class="tab-content"></div>
    <div id="JadwalGuru" class="tab-content"></div><div id="JadwalPelajaran" class="tab-content"></div><div id="Pengumuman" class="tab-content"></div>`;
}

function openAdminTab(evt, tabName) {
    document.querySelectorAll(".tab-content").forEach(tc => tc.style.display = "none");
    document.querySelectorAll(".tab-link").forEach(tl => tl.className = tl.className.replace(" active", ""));
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
    if (tabName === 'Analitik') renderAdminAnalitik();
    else if (tabName === 'Persetujuan') renderAdminPersetujuan();
    else if (tabName === 'Absensi') renderAdminAbsensi();
    else if (tabName === 'Manajemen') renderAdminManajemen();
    else if (tabName === 'JadwalGuru') renderAdminJadwal();
    else if (tabName === 'JadwalPelajaran') renderAdminManajemenJadwal();
    else if (tabName === 'Pengumuman') renderAdminPengumuman();
}

function renderAdminPersetujuan() {
    const container = document.getElementById('Persetujuan');
    const permintaan = data.absensi.filter(a => (a.status === 'izin' || a.status === 'sakit') && a.disetujui === false);
    let html = '<h4>Permintaan Absen Izin & Sakit</h4>';
    if(permintaan.length === 0) {
        html += '<p>Tidak ada permintaan saat ini.</p>';
        container.innerHTML = html;
        return;
    }
    permintaan.forEach(p => {
        html += `<div class="task-card"><div class="task-header"><strong>${p.nama} (${p.role})</strong> - <span>${p.tanggal}</span></div><p><strong>Status:</strong> ${p.status}</p><p><strong>Keterangan:</strong> ${p.keterangan}</p><div class="approval-buttons"><button class="small-btn success" onclick="setujuiAbsen(${p.id_user}, '${p.tanggal}', true)">Setujui</button><button class="small-btn delete" onclick="setujuiAbsen(${p.id_user}, '${p.tanggal}', false)">Tolak</button></div></div>`;
    });
    container.innerHTML = html;
}

function setujuiAbsen(id_user, tanggal, disetujui) {
    const absen = data.absensi.find(a => a.id_user === id_user && a.tanggal === tanggal);
    if(absen) {
        if(disetujui) {
            absen.disetujui = true;
        } else {
            const index = data.absensi.findIndex(a => a.id_user === id_user && a.tanggal === tanggal);
            if (index > -1) { data.absensi.splice(index, 1); }
        }
        createNotification(id_user, absen.role, `Pengajuan absen ${absen.status} Anda pada tanggal ${tanggal} telah ${disetujui ? 'disetujui' : 'ditolak'}.`);
        renderAdminPersetujuan();
        renderNotificationBell();
    }
}

function absen(status, id_kelas = null) {
    const today = new Date().toISOString().slice(0, 10);
    if (data.absensi.find(a => a.id_user === currentUser.id && a.role === currentRole && a.tanggal === today)) {
        return alert("Anda sudah mengajukan absensi hari ini.");
    }
    const catatAbsensi = (keterangan = "", disetujui = true) => {
        data.absensi.push({ id_user: currentUser.id, role: currentRole, nama: currentUser.nama, tanggal: today, status, keterangan, disetujui });
        if(status === 'izin' || status === 'sakit') {
            alert(`Pengajuan absen '${status}' berhasil dikirim dan menunggu persetujuan admin.`);
            data.users.admins.forEach(admin => createNotification(admin.username, 'admin', `Permintaan absen ${status} dari ${currentUser.nama}.`));
        } else {
             alert(`Absensi '${status}' berhasil!`);
        }
       
        if (currentRole === 'siswa') { absensiHariIniSelesai = true; showDashboard(); }
        else if (currentRole === 'guru') { document.getElementById("container-absen-kelas").innerHTML = '<p style="color:green;"><strong>Absensi Anda telah tercatat.</strong></p>'; }
    };

    if (status === 'masuk') {
        let targetLokasi, btn;
        const radius = 200;
        if (currentRole === 'guru' && id_kelas) {
            const kelas = data.kelas.find(k => k.id === id_kelas); targetLokasi = kelas.lokasi;
        } else if (currentRole === 'siswa') {
            targetLokasi = { latitude: -7.983908, longitude: 112.621391 };
            btn = document.getElementById("btn-absen-masuk-siswa"); if(btn) { btn.disabled = true; btn.textContent = "Mengecek Lokasi..."; }
        }
        navigator.geolocation.getCurrentPosition(pos => {
            const jarak = hitungJarak(pos.coords.latitude, pos.coords.longitude, targetLokasi.latitude, targetLokasi.longitude);
            jarak <= radius ? catatAbsensi() : alert(`Gagal! Jarak Anda: ${Math.round(jarak)} meter.`);
            if (btn) { btn.disabled = false; btn.textContent = "📍 Masuk"; }
        }, () => { alert("Tidak bisa mengakses lokasi."); if (btn) { btn.disabled = false; btn.textContent = "📍 Masuk"; } });
    } else if (status === 'izin') {
        const alasan = prompt("Masukkan alasan Anda izin:");
        if (alasan) catatAbsensi(alasan, false);
        else alert("Absensi dibatalkan.");
    } else if (status === 'sakit') {
        const fileInput = document.createElement('input');
        fileInput.type = 'file'; fileInput.accept = 'image/*'; fileInput.style.display = 'none';
        fileInput.onchange = e => {
            const file = e.target.files[0];
            if (file) catatAbsensi(`Bukti foto: ${file.name}`, false);
            else alert("Absensi sakit dibatalkan.");
            document.body.removeChild(fileInput);
        };
        document.body.appendChild(fileInput);
        fileInput.click();
    }
}

function renderRekapSiswa() {
    const container = document.getElementById("rekap-container");
    const kelasId = document.getElementById("kelas-select").value;
    if (!kelasId) { container.innerHTML = `<p>Silakan pilih kelas.</p>`; return; }
    const siswaDiKelas = data.users.siswas.filter(s => s.id_kelas == kelasId);
    const absensiFiltered = getFilteredAbsensi().filter(a => a.status === 'masuk' || a.disetujui === true);
    let html = `<h5>Rekap Absensi ${document.getElementById("kelas-select").options[document.getElementById("kelas-select").selectedIndex].text}</h5>`;
    html += "<table><thead><tr><th>Nama Siswa</th><th>Masuk</th><th>Izin</th><th>Sakit</th></tr></thead><tbody>";
    siswaDiKelas.forEach(siswa => {
        const absensiSiswa = absensiFiltered.filter(a => a.id_user === siswa.id);
        const rekap = {
            masuk: absensiSiswa.filter(a => a.status === 'masuk').length,
            izin: absensiSiswa.filter(a => a.status === 'izin').length,
            sakit: absensiSiswa.filter(a => a.status === 'sakit').length,
        };
        html += `<tr><td>${siswa.nama}</td><td>${rekap.masuk}</td><td>${rekap.izin}</td><td>${rekap.sakit}</td></tr>`;
    });
    html += "</tbody></table>";
    container.innerHTML = html;
}

// --- FUNGSI TUGAS DENGAN PERBAIKAN ---
function renderDaftarTugas() {
    const container = document.getElementById("daftar-tugas-container");
    const notif = document.getElementById("notif-tugas");
    const tugasSiswa = data.tugas.filter(t => t.id_kelas === currentUser.id_kelas);
    notif.textContent = tugasSiswa.length;
    if (tugasSiswa.length === 0) { container.innerHTML = "<p>🎉 Hore, tidak ada tugas saat ini!</p>"; return; }
    
    let html = "";
    tugasSiswa.forEach(t => {
        const submission = t.submissions ? t.submissions.find(s => s.id_siswa === currentUser.id) : null;
        const submissionHTML = submission 
            ? `<div class="submission-status"><p style="color:green;"><strong>✔ Anda sudah mengumpulkan.</strong></p>${submission.nilai !== null ? `<p class="grade-display"><strong>Nilai: ${submission.nilai}</strong></p><p class="feedback-display"><em>Feedback: ${submission.feedback}</em></p>` : `<p>Menunggu penilaian...</p>`}</div>`
            : `<label>Kirim Jawaban:</label><input type="file" id="submit-file-${t.id}"><button onclick="submitTugas(${t.id})">Kirim</button>`;

        html += `<div class="task-card"><div class="task-header"><span><strong>${t.judul}</strong> - ${t.nama_guru}</span><span class="task-deadline">Deadline: ${t.deadline}</span></div><p>${t.deskripsi}</p><p>File: <em>${t.file}</em></p>${submissionHTML}${renderDiskusi(t.id)}</div>`;
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
                const submissionDetailHTML = `<strong>${sub.nama_siswa}</strong> mengumpulkan file: <em>${sub.file}</em><div class="grading-container">${sub.nilai !== null ? `<p class="grade-display"><strong>Nilai: ${sub.nilai}</strong></p><p class="feedback-display"><em>Feedback: ${sub.feedback}</em></p>` : `<input type="number" id="nilai-${t.id}-${sub.id_siswa}" placeholder="Nilai"><input type="text" id="feedback-${t.id}-${sub.id_siswa}" placeholder="Umpan Balik"><button class="small-btn" onclick="simpanNilai(${t.id},${sub.id_siswa})">Simpan</button>`}</div>`;
                html += `<li>${submissionDetailHTML}</li>`;
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
function createNotification(id_user,role,message){if(currentUser&&(currentUser.id===id_user||currentUser.username===id_user)&&currentRole===role)return;data.notifikasi.push({id:Date.now(),id_user,role,message,read:!1,timestamp:new Date})}
function renderNotificationBell(){const notifBadge=document.getElementById("notif-badge"),unreadNotifs=data.notifikasi.filter(n=>(n.id_user===currentUser.id||n.id_user===currentUser.username||"semua"===n.id_user)&&n.role===currentRole&&!n.read);unreadNotifs.length>0?(notifBadge.textContent=unreadNotifs.length,notifBadge.classList.remove("hidden")):notifBadge.classList.add("hidden")}
function toggleNotifDropdown(){const dropdown=document.getElementById("notification-dropdown");dropdown.classList.toggle("hidden"),dropdown.classList.contains("hidden")||renderNotifList()}
function renderNotifList(){const dropdown=document.getElementById("notification-dropdown"),userNotifs=data.notifikasi.filter(n=>(n.id_user===currentUser.id||n.id_user===currentUser.username||"semua"===n.id_user)&&n.role===currentRole);if(0===userNotifs.length)return void(dropdown.innerHTML='<div class="notif-item">Tidak ada notifikasi.</div>');let html="";[...userNotifs].reverse().forEach(n=>{html+=`<div class="notif-item ${n.read?"read":""}" onclick="markNotifAsRead(${n.id})"><p>${n.message}</p><span class="notif-time">${new Date(n.timestamp).toLocaleString("id-ID")}</span></div>`}),dropdown.innerHTML=html}
function markNotifAsRead(notifId){const notif=data.notifikasi.find(n=>n.id===notifId);notif&&(notif.read=!0),renderNotificationBell(),renderNotifList()}
function renderDiskusi(id_tugas){const tugas=data.tugas.find(t=>t.id===id_tugas);let html='<div class="discussion-container"><h5>Diskusi Tugas</h5>';return tugas.diskusi&&tugas.diskusi.length>0?tugas.diskusi.forEach(p=>{const senderClass=p.id_user===currentUser.id&&p.role===currentRole?"sender-self":"sender-other";html+=`<div class="discussion-message ${senderClass}"><strong>${p.nama_user} (${p.role}):</strong><p>${p.pesan}</p><span class="notif-time">${new Date(p.timestamp).toLocaleTimeString("id-ID")}</span></div>`}):html+="<p>Belum ada diskusi.</p>",html+=`<div class="discussion-form"><textarea id="pesan-diskusi-${id_tugas}" placeholder="Tulis pesan..."></textarea><button class="small-btn" onclick="tambahPesanDiskusi(${id_tugas})">Kirim</button></div></div>`}
function tambahPesanDiskusi(id_tugas){const pesan=document.getElementById(`pesan-diskusi-${id_tugas}`).value;if(!pesan.trim())return;const tugas=data.tugas.find(t=>t.id===id_tugas);tugas.diskusi.push({id_user:currentUser.id,nama_user:currentUser.nama,role:currentRole,pesan,timestamp:new Date}),"siswa"===currentRole?createNotification(tugas.id_guru,"guru",`Siswa '${currentUser.nama}' mengirim pesan di tugas '${tugas.judul}'.`):"guru"===currentRole&&data.users.siswas.filter(s=>s.id_kelas===tugas.id_kelas).forEach(s=>{createNotification(s.id,"siswa",`Guru '${currentUser.nama}' membalas di diskusi tugas '${tugas.judul}'.`)}),"siswa"===currentRole?renderDaftarTugas():"guru"===currentRole&&renderTugasSubmissions()}
function kirimTugas(){const id_kelas=parseInt(document.getElementById("tugas-kelas").value),judul=document.getElementById("tugas-judul").value,deskripsi=document.getElementById("tugas-deskripsi").value,deadline=document.getElementById("tugas-deadline").value,file=document.getElementById("tugas-file").files[0];if(!id_kelas||!judul||!deskripsi||!deadline)return alert("Lengkapi semua data!");data.tugas.push({id:Date.now(),id_guru:currentUser.id,nama_guru:currentUser.nama,id_kelas,judul,deskripsi,deadline,file:file?file.name:"Tidak ada file",submissions:[],diskusi:[]});const siswaDiKelas=data.users.siswas.filter(s=>s.id_kelas===id_kelas);siswaDiKelas.forEach(s=>createNotification(s.id,"siswa",`Tugas baru '${judul}' telah ditambahkan.`)),alert(`Tugas "${judul}" berhasil dikirim!`),showDashboard()}
function submitTugas(id_tugas){const file=document.getElementById(`submit-file-${id_tugas}`).files[0];if(!file)return alert("Pilih file!");const tugas=data.tugas.find(t=>t.id===id_tugas);tugas&&(tugas.submissions.push({id_siswa:currentUser.id,nama_siswa:currentUser.nama,file:file.name,timestamp:(new Date).toLocaleString("id-ID"),nilai:null,feedback:""}),createNotification(tugas.id_guru,"guru",`Siswa '${currentUser.nama}' mengumpulkan tugas '${tugas.judul}'.`),alert(`Jawaban berhasil dikirim!`),renderDaftarTugas())}
function simpanNilai(id_tugas,id_siswa){const nilai=document.getElementById(`nilai-${id_tugas}-${id_siswa}`).value,feedback=document.getElementById(`feedback-${id_tugas}-${id_siswa}`).value;if(""===nilai||nilai<0||nilai>100)return alert("Nilai harus 0-100.");const tugas=data.tugas.find(t=>t.id===id_tugas),submission=tugas.submissions.find(s=>s.id_siswa===id_siswa);submission.nilai=parseInt(nilai),submission.feedback=feedback||"Tidak ada feedback.",createNotification(id_siswa,"siswa",`Tugas '${tugas.judul}' Anda telah dinilai.`),alert("Nilai berhasil disimpan!"),renderTugasSubmissions()}
function buatPengumuman(){const judul=document.getElementById("pengumuman-judul").value,isi=document.getElementById("pengumuman-isi").value;if(!judul||!isi)return alert("Judul dan isi harus diisi!");data.pengumuman.push({id:Date.now(),oleh:"admin"===currentRole?"Admin":currentUser.nama,judul,isi,tanggal:(new Date).toISOString().slice(0,10),target_kelas_id:"semua"}),data.users.siswas.forEach(s=>createNotification(s.id,"siswa",`Pengumuman baru: '${judul}'`)),data.users.gurus.forEach(g=>createNotification(g.id,"guru",`Pengumuman baru: '${judul}'`)),alert("Pengumuman berhasil dikirim!"),"admin"===currentRole?renderAdminPengumuman():showDashboard()}
function renderAdminAnalitik(){const container=document.getElementById("Analitik"),totalSiswa=data.users.siswas.length,totalGuru=data.users.gurus.length,totalAbsenHariIni=data.absensi.filter(a=>a.tanggal===(new Date).toISOString().slice(0,10)).length;let chartHTML='<div class="chart-container"><h5>Persentase Kehadiran per Kelas (Bulan Ini)</h5>';data.kelas.forEach(k=>{const siswaDiKelas=data.users.siswas.filter(s=>s.id_kelas===k.id),absenBulanIni=data.absensi.filter(a=>siswaDiKelas.some(s=>s.id===a.id_user)&&"masuk"===a.status),persentase=siswaDiKelas.length>0?absenBulanIni.length/(30*siswaDiKelas.length)*100:0;chartHTML+=`<div class="chart-bar-wrapper"><div class="chart-label">${k.nama}</div><div class="chart-bar-background"><div class="chart-bar-foreground" style="width: ${Math.min(persentase,100)}%;">${Math.round(persentase)}%</div></div></div>`}),chartHTML+="</div>",container.innerHTML=`<div class="stats-container"><div class="stat-card"><h4>Total Siswa</h4><p>${totalSiswa}</p></div><div class="stat-card"><h4>Total Guru</h4><p>${totalGuru}</p></div><div class="stat-card"><h4>Absen Hari Ini</h4><p>${totalAbsenHariIni}</p></div></div> ${chartHTML}`}
function renderAdminPengumuman(){const container=document.getElementById("Pengumuman");let listHTML="<h5>Daftar Pengumuman</h5>";0===data.pengumuman.length?listHTML+="<p>Belum ada pengumuman.</p>":[...data.pengumuman].reverse().forEach(p=>{listHTML+=`<div class="announcement-card"><div class="announcement-header"><strong>${p.judul}</strong> - <span>Oleh: ${p.oleh} (${p.tanggal})</span></div><p>${p.isi}</p><button class="small-btn delete" onclick="hapusPengumuman(${p.id})">Hapus</button></div>`}),container.innerHTML=`<div class="dashboard-section"><h4>Buat Pengumuman Baru</h4><input type="text" id="pengumuman-judul" placeholder="Judul"><textarea id="pengumuman-isi" placeholder="Isi pengumuman..."></textarea><button onclick="buatPengumuman()">Kirim</button></div><div class="dashboard-section">${listHTML}</div>`}
function hapusPengumuman(id){confirm("Yakin hapus pengumuman?")&&(data.pengumuman=data.pengumuman.filter(p=>p.id!==id),renderAdminPengumuman())}
function renderGuruDashboard(){return`<div class="dashboard-section" id="guru-absen"><h4>🗓️ Absensi & Jadwal</h4><p id="info-absen-guru">Mengecek jadwal...</p><button id="btn-mulai-ajar" onclick="mulaiAjar()" disabled>Mulai Ajar</button><div id="container-absen-kelas" style="margin-top: 1rem;"></div></div><div class="dashboard-section" id="guru-tugas"><h4>📤 Manajemen Tugas</h4><div id="submission-container"></div></div><div class="dashboard-section"><h4>📚 Unggah Materi</h4><select id="materi-kelas">${data.kelas.map(k=>`<option value="${k.id}">${k.nama}</option>`).join("")}</select><input type="text" id="materi-judul" placeholder="Judul Materi"><textarea id="materi-deskripsi" placeholder="Deskripsi..."></textarea><label>Upload File (Simulasi):</label><input type="file" id="materi-file"><button onclick="unggahMateri()">Unggah</button></div><div class="dashboard-section"><h4>📢 Buat Pengumuman</h4><input type="text" id="pengumuman-judul" placeholder="Judul"><textarea id="pengumuman-isi" placeholder="Isi..."></textarea><button onclick="buatPengumuman()">Kirim</button></div>`}
function unggahMateri(){const id_kelas=parseInt(document.getElementById("materi-kelas").value),judul=document.getElementById("materi-judul").value,deskripsi=document.getElementById("materi-deskripsi").value,file=document.getElementById("materi-file").files[0];if(!id_kelas||!judul||!deskripsi)return alert("Semua kolom harus diisi!");data.materi.push({id:Date.now(),id_guru:currentUser.id,id_kelas,judul,deskripsi,file:file?file.name:"Tidak ada file"}),alert("Materi berhasil diunggah!"),document.getElementById("materi-judul").value="",document.getElementById("materi-deskripsi").value="",document.getElementById("materi-file").value=""}
function renderPengumumanSiswa(){const pengumumanContainer=document.getElementById("pengumuman-container");let pengumumanHTML="";data.pengumuman.length>0?([...data.pengumuman].reverse().forEach(p=>{pengumumanHTML+=`<div class="announcement-card"><div class="announcement-header"><strong>${p.judul}</strong> - <span>Oleh: ${p.oleh} (${p.tanggal})</span></div><p>${p.isi}</p></div>`}),pengumumanContainer.innerHTML=pengumumanHTML):pengumumanContainer.innerHTML="<p>Tidak ada pengumuman.</p>"}
function renderMateriSiswa(){const materiContainer=document.getElementById("materi-container"),materiKelas=data.materi.filter(m=>m.id_kelas===currentUser.id_kelas);let materiHTML="";materiKelas.length>0?(materiKelas.forEach(m=>{materiHTML+=`<div class="task-card"><div class="task-header"><strong>${m.judul}</strong></div><p>${m.deskripsi}</p><p>File: <em>${m.file}</em></p><button class="small-btn" onclick="alert('Simulasi unduh file ${m.file}')">Unduh</button></div>`}),materiContainer.innerHTML=materiHTML):materiContainer.innerHTML="<p>Belum ada materi.</p>"}
function renderAdminAbsensi(){let kelasOptions=data.kelas.map(k=>`<option value="${k.id}">${k.nama}</option>`).join("");const container=document.getElementById("Absensi");container.innerHTML=`<div class="filter-group"><label>Dari:</label><input type="date" id="start-date"><label>Sampai:</label><input type="date" id="end-date"></div><div class="filter-group"><button onclick="renderRekapAbsensiGuru()">Rekap Guru</button><label>atau siswa:</label><select id="kelas-select" onchange="renderRekapSiswa()"><option value="">-- Pilih Kelas --</option>${kelasOptions}</select><button id="export-btn" onclick="exportToCSV()">🖨️ Ekspor</button></div><div id="rekap-container"><p>Pilih rentang tanggal dan jenis rekap.</p></div>`}
function renderAdminManajemen(){const container=document.getElementById("Manajemen");container.innerHTML=`<p>Pilih data yang ingin dikelola.</p><button onclick="renderManajemenDetail('guru')">Kelola Guru</button><button onclick="renderManajemenDetail('siswa')">Kelola Siswa</button>`}
function renderManajemenDetail(tipe){const container=document.getElementById("Manajemen");let html="";if("guru"===tipe){html+=`<h4>Kelola Data Guru</h4><table class="management-table"><thead><tr><th>ID</th><th>Nama</th><th>Password</th><th>Aksi</th></tr></thead><tbody>`,data.users.gurus.forEach(g=>{html+=`<tr><td>${g.id}</td><td>${g.nama}</td><td>*****</td><td><button class="small-btn edit" onclick="editGuru(${g.id})">Edit</button><button class="small-btn delete" onclick="hapusGuru(${g.id})">Hapus</button></td></tr>`}),html+=`</tbody></table><div class="form-container"><h5>Tambah Guru Baru</h5><input type="text" id="guru-nama-baru" placeholder="Nama Guru"><input type="password" id="guru-pass-baru" placeholder="Password"><button onclick="tambahGuru()">+ Tambah Guru</button></div>`}else if("siswa"===tipe){let kelasOptions=data.kelas.map(k=>`<option value="${k.id}">${k.nama}</option>`).join("");html+=`<h4>Kelola Data Siswa</h4><table class="management-table"><thead><tr><th>ID</th><th>Nama</th><th>Kelas</th><th>Aksi</th></tr></thead><tbody>`,data.users.siswas.forEach(s=>{const kelasNama=data.kelas.find(k=>k.id===s.id_kelas)?.nama||"N/A";html+=`<tr><td>${s.id}</td><td>${s.nama}</td><td>${kelasNama}</td><td><button class="small-btn edit" onclick="editSiswa(${s.id})">Edit</button><button class="small-btn delete" onclick="hapusSiswa(${s.id})">Hapus</button></td></tr>`}),html+=`</tbody></table><div class="form-container"><h5>Tambah Siswa Baru</h5><input type="text" id="siswa-nama-baru" placeholder="Nama Siswa"><input type="password" id="siswa-pass-baru" placeholder="Password"><select id="siswa-kelas-baru">${kelasOptions}</select><button onclick="tambahSiswa()">+ Tambah Siswa</button></div>`}container.innerHTML=html+`<button class="back-button" onclick="renderAdminManajemen()">« Kembali</button>`}
function tambahGuru(){const nama=document.getElementById("guru-nama-baru").value,password=document.getElementById("guru-pass-baru").value;if(!nama||!password)return alert("Nama dan password harus diisi!");const newId=data.users.gurus.length>0?Math.max(...data.users.gurus.map(g=>g.id))+1:1;data.users.gurus.push({id:newId,nama,password,jadwal:[]}),renderManajemenDetail("guru")}
function hapusGuru(id){if(confirm(`Yakin hapus guru ID ${id}?`))data.users.gurus=data.users.gurus.filter(g=>g.id!==id),renderManajemenDetail("guru")}
function editGuru(id){const guru=data.users.gurus.find(g=>g.id===id),namaBaru=prompt("Nama baru:",guru.nama),passBaru=prompt("Password baru (kosongkan jika tidak diubah):");namaBaru&&(guru.nama=namaBaru),passBaru&&(guru.password=passBaru),renderManajemenDetail("guru")}
function tambahSiswa(){const nama=document.getElementById("siswa-nama-baru").value,password=document.getElementById("siswa-pass-baru").value,id_kelas=parseInt(document.getElementById("siswa-kelas-baru").value);if(!nama||!password||!id_kelas)return alert("Semua data harus diisi!");const newId=data.users.siswas.length>0?Math.max(...data.users.siswas.map(s=>s.id))+1:101;data.users.siswas.push({id:newId,nama,password,id_kelas}),renderManajemenDetail("siswa")}
function hapusSiswa(id){if(confirm(`Yakin hapus siswa ID ${id}?`))data.users.siswas=data.users.siswas.filter(s=>s.id!==id),renderManajemenDetail("siswa")}
function editSiswa(id){const siswa=data.users.siswas.find(s=>s.id===id),namaBaru=prompt("Nama baru:",siswa.nama);namaBaru&&(siswa.nama=namaBaru),renderManajemenDetail("siswa")}
function exportToCSV(){const table=document.querySelector("#rekap-container table");if(!table)return alert("Tidak ada data!");let csv=[];for(let row of table.querySelectorAll("tr")){let cols=row.querySelectorAll("th, td"),rowData=Array.from(cols).map(col=>`"${col.innerText.replace(/"/g,'""')}"`);csv.push(rowData.join(","))}const csvContent="data:text/csv;charset=utf-8,"+csv.join("\n"),encodedUri=encodeURI(csvContent),link=document.createElement("a");link.setAttribute("href",encodedUri),link.setAttribute("download","rekap_absensi.csv"),document.body.appendChild(link),link.click(),document.body.removeChild(link)}
function cekJadwalMengajar(){const btn=document.getElementById("btn-mulai-ajar"),info=document.getElementById("info-absen-guru"),now=new Date,jadwalSekarang=currentUser.jadwal.filter(j=>j.hari===now.getDay()&&j.jam===now.getHours());jadwalSekarang.length>0?(info.textContent="Anda punya jadwal mengajar. Silakan 'Mulai Ajar'.",btn.disabled=!1):(info.textContent="Tidak ada jadwal mengajar saat ini.",btn.disabled=!0)}
function mulaiAjar(){const container=document.getElementById("container-absen-kelas"),now=new Date,jadwalSekarang=currentUser.jadwal.filter(j=>j.hari===now.getDay()&&j.jam===now.getHours());if(0===jadwalSekarang.length)return void(container.innerHTML="<p>Gagal memuat sesi.</p>");let html="<h5>Pilih Kelas untuk Absen:</h5>";jadwalSekarang.forEach(sesi=>{html+=`<div class="task-card"><strong>${sesi.nama_kelas}</strong><p>Jadwal: Jam ${sesi.jam}:00</p><button onclick="absen('masuk',${sesi.id_kelas})">✅ Absen Masuk</button></div>`}),html+='<p>Jika berhalangan:</p><button onclick="absen(\'izin\')">📝 Izin</button><button onclick="absen(\'sakit\')">🤒 Sakit</button>',container.innerHTML=html,document.getElementById("btn-mulai-ajar").disabled=!0}
function cekAbsensiSiswaHariIni(){const today=(new Date).toISOString().slice(0,10);absensiHariIniSelesai=!!data.absensi.find(a=>a.id_user===currentUser.id&&a.tanggal===today)}
function getFilteredAbsensi(){const start=document.getElementById("start-date").value,end=document.getElementById("end-date").value;return start&&end?data.absensi.filter(a=>a.tanggal>=start&&a.tanggal<=end):data.absensi}
function hitungJarak(lat1,lon1,lat2,lon2){const R=6371e3,φ1=lat1*Math.PI/180,φ2=lat2*Math.PI/180,Δφ=(lat2-lat1)*Math.PI/180,Δλ=(lon2-lon1)*Math.PI/180,a=Math.sin(Δφ/2)*Math.sin(Δφ/2)+Math.cos(φ1)*Math.cos(φ2)*Math.sin(Δλ/2)*Math.sin(Δλ/2);return R*(2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a)))}
function changePassword(){const oldP=document.getElementById("old-pass").value,newP=document.getElementById("new-pass").value,confirmP=document.getElementById("confirm-new-pass").value;if(!oldP||!newP||!confirmP)return alert("Semua kolom harus diisi!");if(newP!==confirmP)return alert("Password baru tidak cocok!");if(oldP!==currentUser.password)return alert("Password lama salah!");currentUser.password=newP,alert("Password berhasil diubah!"),document.getElementById("old-pass").value="",document.getElementById("new-pass").value="",document.getElementById("confirm-new-pass").value=""}
function renderAdminJadwal(){const container=document.getElementById("JadwalGuru");container.innerHTML="<h4>Kelola Jadwal Mengajar Guru</h4>";const hariOptions=["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"],jamOptions=Array.from({length:10},(_,i)=>i+8),kelasOptions=data.kelas.map(k=>`<option value="${k.id}">${k.nama}</option>`).join("");data.users.gurus.forEach(guru=>{let jadwalHTML=`<div class="jadwal-guru-container task-card"><h5>${guru.nama}</h5>`;guru.jadwal&&guru.jadwal.length>0?(jadwalHTML+='<ul class="jadwal-list">',guru.jadwal.forEach((sesi,index)=>{jadwalHTML+=`<li class="jadwal-item"><span>${sesi.nama_kelas}, ${hariOptions[sesi.hari]} pukul ${sesi.jam}:00</span><button class="small-btn delete" onclick="hapusJadwalGuru(${guru.id}, ${index})">Hapus</button></li>`}),jadwalHTML+="</ul>"):jadwalHTML+="<p>Belum ada jadwal yang diatur.</p>",jadwalHTML+=`<div class="jadwal-form"><select id="jadwal-kelas-${guru.id}">${kelasOptions}</select><select id="jadwal-hari-${guru.id}">${hariOptions.map((h,i)=>`<option value="${i}">${h}</option>`).join("")}</select><select id="jadwal-jam-${guru.id}">${jamOptions.map(j=>`<option value="${j}">${j}:00</option>`).join("")}</select><button class="small-btn" onclick="tambahJadwalGuru(${guru.id})">+ Tambah Jadwal</button></div>`,jadwalHTML+="</div>",container.innerHTML+=jadwalHTML})}
function tambahJadwalGuru(guruId){const id_kelas=parseInt(document.getElementById(`jadwal-kelas-${guruId}`).value),hari=parseInt(document.getElementById(`jadwal-hari-${guruId}`).value),jam=parseInt(document.getElementById(`jadwal-jam-${guruId}`).value),guru=data.users.gurus.find(g=>g.id===guruId);if(!guru)return;if(guru.jadwal.some(j=>j.id_kelas===id_kelas&&j.hari===hari&&j.jam===jam))return alert("Jadwal ini sudah ada.");const kelas=data.kelas.find(k=>k.id===id_kelas);guru.jadwal.push({id_kelas,hari,jam,nama_kelas:kelas.nama}),guru.jadwal.sort((a,b)=>a.hari-b.hari||a.jam-b.jam),renderAdminJadwal()}
function hapusJadwalGuru(guruId,jadwalIndex){if(confirm("Yakin hapus jadwal ini?")){const guru=data.users.gurus.find(g=>g.id===guruId);guru&&guru.jadwal[jadwalIndex]&&(guru.jadwal.splice(jadwalIndex,1),renderAdminJadwal())}}

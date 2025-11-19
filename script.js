/* =============================
   STYLE.CSS - SMKN 1 GONDANG
   ============================= */

/* RESET SEDERHANA */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* BODY */
body {
  font-family: 'Arial', sans-serif;
  background-color: #f4f4f4;
  color: #333;
}

/* NAVBAR */
header {
  background: #ffffff;
  border-bottom: 1px solid #e2e2e2;
}

header nav a {
  font-weight: 500;
  transition: 0.3s;
}

header nav a:hover {
  color: #2563eb; /* biru */
}

/* HERO */
.hero-custom {
  background-image: url('https://source.unsplash.com/1600x900/?school,building');
  background-size: cover;
  background-position: center;
  height: 380px;
  display: flex;
  align-items: center;
  color: white;
  padding: 20px;
}

.hero-overlay {
  background: rgba(0, 0, 0, 0.45);
  padding: 20px;
  border-radius: 10px;
  max-width: 600px;
}

/* CARD */
.card {
  background: white;
  padding: 16px;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

/* GALERI */
.gallery-img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
}

/* FOOTER */
footer {
  background: #111827;
  padding: 20px;
  text-align: center;
  color: #ccc;
  margin-top: 40px;
}
    const jamMulai = document.getElementById("btn-mulai-ajar").getAttribute('data-jam-mulai');
    const jamSelesai = document.getElementById("btn-mulai-ajar").getAttribute('data-jam-selesai');
    const kelas = data.kelas.find(k => k.id === kelasId);
    const today = new Date().toLocaleDateString("id-ID");
    
    // Buat jurnal baru
    const jurnalId = Date.now();
    const siswaDiKelas = data.users.siswas.filter(s => s.id_kelas === kelasId);
    
    // Ambil data absensi siswa hari ini
    const daftarAbsensi = siswaDiKelas.map(siswa => {
        const absensi = data.absensi.find(a => a.id_siswa === siswa.id && a.tanggal === today);
        return {
            id_siswa: siswa.id,
            nama_siswa: siswa.nama,
            status: absensi ? absensi.status : 'alpha',
            statusApproval: 'pending',
            approvedAt: null,
            approvedBy: null,
            keterangan: ''
        };
    });
    
    const jurnal = {
        id: jurnalId,
        id_guru: currentUser.id,
        nama_guru: currentUser.nama,
        id_kelas: kelasId,
        nama_kelas: kelas.nama,
        tanggal: today,
        jamMulai: jamMulai,
        jamSelesai: jamSelesai,
        materiAjar: '',
        kendala: '',
        catatan: '',
        status: 'aktif',
        createdAt: new Date().toLocaleString("id-ID"),
        selesaiAt: null,
        daftarAbsensi: daftarAbsensi
    };
    
    data.jurnal.push(jurnal);
    activeJurnalId = jurnalId;
    
    alert(`Jurnal mengajar ${kelas.nama} telah dimulai!`);
    showDashboard();
}

function renderJurnalAktif() {
    const container = document.getElementById("container-jurnal-kelas");
    const jurnal = data.jurnal.find(j => j.id === activeJurnalId);
    
    if (!jurnal) {
        container.innerHTML = '';
        return;
    }
    
    let html = `
        <div class="form-container">
            <h5>ðŸ“ Jurnal Mengajar - ${jurnal.nama_kelas}</h5>
            <p><strong>Tanggal:</strong> ${jurnal.tanggal} | <strong>Waktu:</strong> ${jurnal.jamMulai} - ${jurnal.jamSelesai}</p>
            
            <label><strong>Materi yang Diajarkan:</strong></label>
            <textarea id="jurnal-materi" placeholder="Isi materi yang diajarkan...">${jurnal.materiAjar}</textarea>
            
            <label><strong>Kendala (Opsional):</strong></label>
            <textarea id="jurnal-kendala" placeholder="Tuliskan kendala jika ada...">${jurnal.kendala}</textarea>
            
            <label><strong>Catatan Tambahan (Opsional):</strong></label>
            <textarea id="jurnal-catatan" placeholder="Catatan tambahan...">${jurnal.catatan}</textarea>
            
            <button onclick="simpanJurnal()">ðŸ’¾ Simpan Jurnal</button>
        </div>
        
        <div class="dashboard-section" style="margin-top: 1rem;">
            <h5>âœ… Daftar Absensi Siswa - Approval</h5>
            <table>
                <tr>
                    <th>No</th>
                    <th>Nama</th>
                    <th>Status</th>
                    <th>Approval</th>
                    <th>Aksi</th>
                </tr>
    `;
    
    jurnal.daftarAbsensi.forEach((absen, index) => {
        const statusColor = absen.status === 'masuk' ? 'green' : absen.status === 'izin' ? 'orange' : absen.status === 'sakit' ? 'blue' : 'red';
        const approvalBadge = absen.statusApproval === 'approved' 
            ? `<span style="color: green; font-weight: 600;">âœ“ Disetujui</span>` 
            : `<span style="color: orange; font-weight: 600;">â³ Pending</span>`;
        
        const aksiBtn = absen.statusApproval === 'pending' 
            ? `<button class="small-btn" onclick="approveAbsensi(${index})">âœ“ Approve</button>
               <button class="small-btn delete" onclick="rejectAbsensi(${index})">âœ— Alpha</button>`
            : `<span style="color: var(--text-secondary); font-size: 0.85rem;">${absen.approvedAt}</span>`;
        
        html += `
            <tr>
                <td>${index + 1}</td>
                <td>${absen.nama_siswa}</td>
                <td><strong style="color: ${statusColor};">${absen.status.toUpperCase()}</strong></td>
                <td>${approvalBadge}</td>
                <td>${aksiBtn}</td>
            </tr>
        `;
    });
    
    html += `
            </table>
            <button onclick="selesaiMengajar()" style="margin-top: 1rem; background: var(--success-color);">âœ“ Selesai Mengajar</button>
        </div>
    `;
    
    container.innerHTML = html;
}

function simpanJurnal() {
    const jurnal = data.jurnal.find(j => j.id === activeJurnalId);
    if (!jurnal) return;
    
    jurnal.materiAjar = document.getElementById('jurnal-materi').value;
    jurnal.kendala = document.getElementById('jurnal-kendala').value;
    jurnal.catatan = document.getElementById('jurnal-catatan').value;
    
    alert('Jurnal berhasil disimpan!');
}

function approveAbsensi(index) {
    const jurnal = data.jurnal.find(j => j.id === activeJurnalId);
    if (!jurnal) return;
    
    jurnal.daftarAbsensi[index].statusApproval = 'approved';
    jurnal.daftarAbsensi[index].approvedAt = new Date().toLocaleString("id-ID");
    jurnal.daftarAbsensi[index].approvedBy = currentUser.nama;
    
    renderJurnalAktif();
}

function rejectAbsensi(index) {
    const jurnal = data.jurnal.find(j => j.id === activeJurnalId);
    if (!jurnal) return;
    
    if (confirm('Yakin menolak dan mengubah status menjadi ALPHA?')) {
        jurnal.daftarAbsensi[index].status = 'alpha';
        jurnal.daftarAbsensi[index].statusApproval = 'approved';
        jurnal.daftarAbsensi[index].approvedAt = new Date().toLocaleString("id-ID");
        jurnal.daftarAbsensi[index].approvedBy = currentUser.nama;
        jurnal.daftarAbsensi[index].keterangan = 'Ditolak oleh guru';
        
        renderJurnalAktif();
    }
}

function selesaiMengajar() {
    const jurnal = data.jurnal.find(j => j.id === activeJurnalId);
    if (!jurnal) return;
    
    if (!jurnal.materiAjar.trim()) {
        return alert('Materi ajar harus diisi sebelum menyelesaikan jurnal!');
    }
    
    // Auto-approve semua yang masih pending
    jurnal.daftarAbsensi.forEach(absen => {
        if (absen.statusApproval === 'pending') {
            absen.statusApproval = 'approved';
            absen.approvedAt = new Date().toLocaleString("id-ID");
            absen.approvedBy = currentUser.nama;
        }
    });
    
    jurnal.status = 'selesai';
    jurnal.selesaiAt = new Date().toLocaleString("id-ID");
    activeJurnalId = null;
    
    alert('Jurnal mengajar telah selesai dan disimpan!');
    showDashboard();
}

// ========== ADMIN JURNAL ==========

function renderAdminJurnal() {
    const container = document.getElementById("Jurnal");
    const jurnalList = [...data.jurnal].reverse();
    
    let html = `
        <div class="dashboard-section">
            <h4>ðŸ“ Daftar Jurnal Mengajar</h4>
    `;
    
    if (jurnalList.length === 0) {
        html += '<p>Belum ada jurnal mengajar.</p>';
    } else {
        jurnalList.forEach(jurnal => {
            const statusBadge = jurnal.status === 'aktif' 
                ? '<span style="background: var(--warning-color); color: white; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.85rem;">âš¡ Sedang Berlangsung</span>'
                : '<span style="background: var(--success-color); color: white; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.85rem;">âœ“ Selesai</span>';
            
            const hadir = jurnal.daftarAbsensi.filter(a => a.status === 'masuk' && a.statusApproval === 'approved').length;
            const izin = jurnal.daftarAbsensi.filter(a => a.status === 'izin' && a.statusApproval === 'approved').length;
            const sakit = jurnal.daftarAbsensi.filter(a => a.status === 'sakit' && a.statusApproval === 'approved').length;
            const alpha = jurnal.daftarAbsensi.filter(a => a.status === 'alpha').length;
            
            html += `
                <div class="task-card">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <div>
                            <h5 style="margin: 0;">${jurnal.nama_kelas} - ${jurnal.nama_guru}</h5>
                            <small style="color: var(--text-secondary);">${jurnal.tanggal} | ${jurnal.jamMulai} - ${jurnal.jamSelesai}</small>
                        </div>
                        ${statusBadge}
                    </div>
                    
                    <div style="background: var(--light-bg); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                        <p><strong>Materi:</strong> ${jurnal.materiAjar || '<em>Belum diisi</em>'}</p>
                        ${jurnal.kendala ? `<p><strong>Kendala:</strong> ${jurnal.kendala}</p>` : ''}
                        ${jurnal.catatan ? `<p><strong>Catatan:</strong> ${jurnal.catatan}</p>` : ''}
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; margin-bottom: 1rem;">
                        <div style="text-align: center; background: #dcfce7; padding: 0.5rem; border-radius: 6px;">
                            <strong style="color: #16a34a; font-size: 1.5rem;">${hadir}</strong>
                            <p style="margin: 0; font-size: 0.85rem; color: #16a34a;">Hadir</p>
                        </div>
                        <div style="text-align: center; background: #fed7aa; padding: 0.5rem; border-radius: 6px;">
                            <strong style="color: #ea580c; font-size: 1.5rem;">${izin}</strong>
                            <p style="margin: 0; font-size: 0.85rem; color: #ea580c;">Izin</p>
                        </div>
                        <div style="text-align: center; background: #dbeafe; padding: 0.5rem; border-radius: 6px;">
                            <strong style="color: #2563eb; font-size: 1.5rem;">${sakit}</strong>
                            <p style="margin: 0; font-size: 0.85rem; color: #2563eb;">Sakit</p>
                        </div>
                        <div style="text-align: center; background: #fee2e2; padding: 0.5rem; border-radius: 6px;">
                            <strong style="color: #dc2626; font-size: 1.5rem;">${alpha}</strong>
                            <p style="margin: 0; font-size: 0.85rem; color: #dc2626;">Alpha</p>
                        </div>
                    </div>
                    
                    <button class="small-btn" onclick="lihatDetailJurnal(${jurnal.id})">ðŸ‘ï¸ Detail</button>
                    <button class="small-btn" onclick="editJurnalAdmin(${jurnal.id})" style="background: var(--edit-color);">âœï¸ Edit</button>
                </div>
            `;
        });
    }
    
    html += '</div>';
    container.innerHTML = html;
}

function lihatDetailJurnal(jurnalId) {
    const jurnal = data.jurnal.find(j => j.id === jurnalId);
    if (!jurnal) return;
    
    let html = `
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px;" onclick="this.remove()">
            <div style="background: white; padding: 2rem; border-radius: 16px; max-width: 800px; width: 100%; max-height: 90vh; overflow-y: auto;" onclick="event.stopPropagation()">
                <h4>Detail Jurnal - ${jurnal.nama_kelas}</h4>
                <p><strong>Guru:</strong> ${jurnal.nama_guru}</p>
                <p><strong>Tanggal:</strong> ${jurnal.tanggal} | <strong>Waktu:</strong> ${jurnal.jamMulai} - ${jurnal.jamSelesai}</p>
                <p><strong>Status:</strong> ${jurnal.status === 'aktif' ? 'âš¡ Berlangsung' : 'âœ“ Selesai'}</p>
                
                <div style="background: var(--light-bg); padding: 1rem; border-radius: 8px; margin: 1rem 0;">
                    <p><strong>Materi:</strong> ${jurnal.materiAjar}</p>
                    ${jurnal.kendala ? `<p><strong>Kendala:</strong> ${jurnal.kendala}</p>` : ''}
                    ${jurnal.catatan ? `<p><strong>Catatan:</strong> ${jurnal.catatan}</p>` : ''}
                </div>
                
                <h5>Daftar Absensi:</h5>
                <table style="width: 100%;">
                    <tr>
                        <th>No</th>
                        <th>Nama</th>
                        <th>Status</th>
                        <th>Approval</th>
                    </tr>
    `;
    
    jurnal.daftarAbsensi.forEach((absen, index) => {
        const statusColor = absen.status === 'masuk' ? 'green' : absen.status === 'izin' ? 'orange' : absen.status === 'sakit' ? 'blue' : 'red';
        html += `
            <tr>
                <td>${index + 1}</td>
                <td>${absen.nama_siswa}</td>
                <td style="color: ${statusColor}; font-weight: 600;">${absen.status.toUpperCase()}</td>
                <td>${absen.statusApproval === 'approved' ? 'âœ“' : 'â³'}</td>
            </tr>
        `;
    });
    
    html += `
                </table>
                <button onclick="this.closest('div[style*=fixed]').remove()" style="margin-top: 1rem; width: 100%;">Tutup</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', html);
}

function editJurnalAdmin(jurnalId) {
    const jurnal = data.jurnal.find(j => j.id === jurnalId);
    if (!jurnal) return;
    
    let html = `
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px;" onclick="this.remove()">
            <div style="background: white; padding: 2rem; border-radius: 16px; max-width: 800px; width: 100%; max-height: 90vh; overflow-y: auto;" onclick="event.stopPropagation()">
                <h4>Edit Jurnal - ${jurnal.nama_kelas}</h4>
                <p><strong>Guru:</strong> ${jurnal.nama_guru} | <strong>Tanggal:</strong> ${jurnal.tanggal}</p>
                
                <label><strong>Materi:</strong></label>
                <textarea id="edit-materi" style="width: 100%; min-height: 100px; margin-bottom: 1rem;">${jurnal.materiAjar}</textarea>
                
                <label><strong>Kendala:</strong></label>
                <textarea id="edit-kendala" style="width: 100%; min-height: 80px; margin-bottom: 1rem;">${jurnal.kendala}</textarea>
                
                <label><strong>Catatan:</strong></label>
                <textarea id="edit-catatan" style="width: 100%; min-height: 80px; margin-bottom: 1rem;">${jurnal.catatan}</textarea>
                
                <h5>Edit Absensi:</h5>
                <table style="width: 100%; margin-bottom: 1rem;">
                    <tr>
                        <th>Nama</th>
                        <th>Status</th>
                        <th>Approval</th>
                    </tr>
    `;
    
    jurnal.daftarAbsensi.forEach((absen, index) => {
        html += `
            <tr>
                <td>${absen.nama_siswa}</td>
                <td>
                    <select id="edit-status-${index}" style="width: 100%;">
                        <option value="masuk" ${absen.status === 'masuk' ? 'selected' : ''}>Masuk</option>
                        <option value="izin" ${absen.status === 'izin' ? 'selected' : ''}>Izin</option>
                        <option value="sakit" ${absen.status === 'sakit' ? 'selected' : ''}>Sakit</option>
                        <option value="alpha" ${absen.status === 'alpha' ? 'selected' : ''}>Alpha</option>
                    </select>
                </td>
                <td>
                    <select id="edit-approval-${index}" style="width: 100%;">
                        <option value="approved" ${absen.statusApproval === 'approved' ? 'selected' : ''}>Approved</option>
                        <option value="pending" ${absen.statusApproval === 'pending' ? 'selected' : ''}>Pending</option>
                    </select>
                </td>
            </tr>
        `;
    });
    
    html += `
                </table>
                <button onclick="simpanEditJurnal(${jurnalId})" style="width: 100%; margin-bottom: 0.5rem; background: var(--success-color);">ðŸ’¾ Simpan Perubahan</button>
                <button onclick="this.closest('div[style*=fixed]').remove()" style="width: 100%;">Batal</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', html);
}

function simpanEditJurnal(jurnalId) {
    const jurnal = data.jurnal.find(j => j.id === jurnalId);
    if (!jurnal) return;
    
    jurnal.materiAjar = document.getElementById('edit-materi').value;
    jurnal.kendala = document.getElementById('edit-kendala').value;
    jurnal.catatan = document.getElementById('edit-catatan').value;
    
    jurnal.daftarAbsensi.forEach((absen, index) => {
        const newStatus = document.getElementById(`edit-status-${index}`).value;
        const newApproval = document.getElementById(`edit-approval-${index}`).value;
        
        absen.status = newStatus;
        absen.statusApproval = newApproval;
        
        if (newApproval === 'approved' && !absen.approvedAt) {
            absen.approvedAt = new Date().toLocaleString("id-ID");
            absen.approvedBy = 'Admin';
        }
    });
    
    alert('Jurnal berhasil diperbarui!');
    document.querySelector('div[style*="position: fixed"]').remove();
    renderAdminJurnal();
}

// NOTIFIKASI
function createNotification(id_user, role, message) {
    if (currentUser && currentUser.id === id_user && currentRole === role) return;
    data.notifikasi.push({ id: Date.now(), id_user, role, message, read: false, timestamp: new Date() });
}

function renderNotificationBell() {
    const notifBadge = document.getElementById("notif-badge");
    const unreadNotifs = data.notifikasi.filter(n => (n.id_user === currentUser.id || n.id_user === "semua") && n.role === currentRole && !n.read);
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
    if (!dropdown.classList.contains("hidden")) renderNotifList();
}

function renderNotifList() {
    const dropdown = document.getElementById("notification-dropdown");
    const userNotifs = data.notifikasi.filter(n => (n.id_user === currentUser.id || n.id_user === "semua") && n.role === currentRole);
    if (userNotifs.length === 0) { dropdown.innerHTML = '<div class="notif-item">Tidak ada notifikasi.</div>'; return; }
    let html = "";
    [...userNotifs].reverse().forEach(n => {
        html += `<div class="notif-item ${n.read ? 'read' : ''}" onclick="markNotifAsRead(${n.id})"><p>${n.message}</p><span class="notif-time">${new Date(n.timestamp).toLocaleString("id-ID")}</span></div>`;
    });
    dropdown.innerHTML = html;
}

function markNotifAsRead(notifId) {
    const notif = data.notifikasi.find(n => n.id === notifId);
    if (notif) notif.read = true;
    renderNotificationBell();
    renderNotifList();
}

// PENGUMUMAN
function renderPengumumanSiswa() {
    const container = document.getElementById("pengumuman-container");
    if (data.pengumuman.length === 0) {
        container.innerHTML = "<p>Belum ada pengumuman.</p>";
        return;
    }
    let html = "";
    [...data.pengumuman].reverse().forEach(p => {
        html += `<div class="announcement-card"><h5>${p.judul}</h5><p>${p.isi}</p><small>oleh ${p.nama_guru} - ${p.tanggal}</small></div>`;
    });
    container.innerHTML = html;
}

// MATERI
function renderMateriSiswa() {
    const container = document.getElementById("materi-container");
    const materiKelas = data.materi.filter(m => m.id_kelas === currentUser.id_kelas);
    if (materiKelas.length === 0) {
        container.innerHTML = "<p>Belum ada materi.</p>";
        return;
    }
    let html = "";
    [...materiKelas].reverse().forEach(m => {
        html += `<div class="task-card"><h5>${m.judul}</h5><p>${m.deskripsi}</p><p>File: <em>${m.file}</em></p><small>oleh ${m.nama_guru} - ${m.tanggal}</small></div>`;
    });
    container.innerHTML = html;
}

function unggahMateri() {
    const id_kelas = parseInt(document.getElementById("materi-kelas").value);
    const judul = document.getElementById("materi-judul").value;
    const deskripsi = document.getElementById("materi-deskripsi").value;
    const file = document.getElementById("materi-file").files[0];
    
    if (!judul || !deskripsi) return alert("Judul dan deskripsi harus diisi!");
    
    data.materi.push({
        id: Date.now(),
        id_kelas,
        judul,
        deskripsi,
        file: file ? file.name : "Tidak ada file",
        nama_guru: currentUser.nama,
        tanggal: new Date().toLocaleDateString("id-ID")
    });
    
    const namaKelas = data.kelas.find(k => k.id === id_kelas).nama;
    data.users.siswas.filter(s => s.id_kelas === id_kelas).forEach(siswa => {
        createNotification(siswa.id, "siswa", `Materi baru: ${judul} (${namaKelas})`);
    });
    
    alert("Materi berhasil diunggah!");
    document.getElementById("materi-judul").value = "";
    document.getElementById("materi-deskripsi").value = "";
    document.getElementById("materi-file").value = "";
}

// TUGAS
function renderDaftarTugas() {
    const container = document.getElementById("daftar-tugas-container");
    const notif = document.getElementById("notif-tugas");
    const tugasSiswa = data.tugas.filter(t => t.id_kelas === currentUser.id_kelas);
    notif.textContent = tugasSiswa.length;
    if (tugasSiswa.length === 0) { 
        container.innerHTML = "<p>ðŸŽ‰ Hore, tidak ada tugas saat ini!</p>"; 
        return; 
    }
    let html = "";
    tugasSiswa.forEach(t => {
        const submission = t.submissions ? t.submissions.find(s => s.id_siswa === currentUser.id) : null;
        const submissionHTML = submission ? `<div class="submission-status"><p style="color:green;"><strong>âœ“ Anda sudah mengumpulkan.</strong></p>${submission.nilai !== null ? `<p class="grade-display"><strong>Nilai: ${submission.nilai}</strong></p><p class="feedback-display"><em>Feedback: ${submission.feedback}</em></p>` : `<p>Menunggu penilaian...</p>`}</div>` : `<label>Kirim Jawaban:</label><input type="file" id="submit-file-${t.id}"><button onclick="submitTugas(${t.id})">Kirim</button>`;
        html += `<div class="task-card"><div class="task-header"><span><strong>${t.judul}</strong> - ${t.nama_guru}</span><span class="task-deadline">Deadline: ${t.deadline}</span></div><p>${t.deskripsi}</p><p>File: <em>${t.file}</em></p>${submissionHTML}${renderDiskusi(t.id)}</div>`;
    });
    container.innerHTML = html;
}

function buatTugas() {
    const id_kelas = parseInt(document.getElementById("tugas-kelas").value);
    const judul = document.getElementById("tugas-judul").value;
    const deskripsi = document.getElementById("tugas-deskripsi").value;
    const deadline = document.getElementById("tugas-deadline").value;
    const file = document.getElementById("tugas-file").files[0];
    
    if (!judul || !deskripsi || !deadline) return alert("Semua field harus diisi!");
    
    const tugas = {
        id: Date.now(),
        id_kelas,
        id_guru: currentUser.id,
        nama_guru: currentUser.nama,
        judul,
        deskripsi,
        deadline: new Date(deadline).toLocaleDateString("id-ID"),
        file: file ? file.name : "Tidak ada file",
        submissions: [] 
    };
    
    data.tugas.push(tugas);
    
    const namaKelas = data.kelas.find(k => k.id === id_kelas).nama;
    data.users.siswas.filter(s => s.id_kelas === id_kelas).forEach(siswa => {
        createNotification(siswa.id, "siswa", `Tugas baru: ${judul} (${namaKelas})`);
    });
    
    alert("Tugas berhasil dibuat!");
    document.getElementById("tugas-judul").value = "";
    document.getElementById("tugas-deskripsi").value = "";
    document.getElementById("tugas-deadline").value = "";
    document.getElementById("tugas-file").value = "";
    renderTugasSubmissions();
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
        renderNotificationBell();
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
        html += `<div class="task-card"><h5>Tugas: ${t.judul} (Kelas: ${data.kelas.find(k => k.id === t.id_kelas).nama})</h5>`;
        if (t.submissions && t.submissions.length > 0) {
            html += "<ul class='submission-list'>";
            t.submissions.forEach(sub => {
                const submissionDetailHTML = `<strong>${sub.nama_siswa}</strong> mengumpulkan file: <em>${sub.file}</em><div class="grading-container">${sub.nilai !== null ? `<p class="grade-display"><strong>Nilai: ${sub.nilai}</strong></p><p class="feedback-display"><em>Feedback: ${sub.feedback}</em></p>` : `<input type="number" id="nilai-${t.id}-${sub.id_siswa}" placeholder="Nilai (0-100)"><input type="text" id="feedback-${t.id}-${sub.id_siswa}" placeholder="Umpan Balik"><button class="small-btn" onclick="simpanNilai(${t.id}, ${sub.id_siswa})">Simpan</button>`}</div>`;
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

// DISKUSI
function renderDiskusi(id_tugas) {
    const diskusiTugas = data.diskusi.filter(d => d.id_tugas === id_tugas);
    let html = '<div class="discussion-container"><h5>ðŸ’¬ Diskusi</h5>';
    if (diskusiTugas.length > 0) {
        html += '<div class="discussion-messages">';
        diskusiTugas.forEach(d => {
            html += `<div class="discussion-message"><strong>${d.nama}:</strong> ${d.pesan}<br><small>${d.timestamp}</small></div>`;
        });
        html += '</div>';
    }
    html += `<div class="discussion-form"><textarea id="diskusi-${id_tugas}" placeholder="Tulis komentar..."></textarea><button onclick="kirimDiskusi(${id_tugas})">Kirim</button></div></div>`;
    return html;
}

function kirimDiskusi(id_tugas) {
    const textarea = document.getElementById(`diskusi-${id_tugas}`);
    const pesan = textarea.value.trim();
    if (!pesan) return alert("Pesan tidak boleh kosong!");
    
    data.diskusi.push({
        id: Date.now(),
        id_tugas,
        nama: currentUser.nama,
        role: currentRole,
        pesan,
        timestamp: new Date().toLocaleString("id-ID")
    });
    
    textarea.value = "";
    
    if (currentRole === 'siswa') {
        renderDaftarTugas();
    } else if (currentRole === 'guru') {
        renderTugasSubmissions();
    }
}

// ADMIN FUNCTIONS
function renderAdminAnalitik() {
    const container = document.getElementById("Analitik");
    const totalSiswa = data.users.siswas.length;
    const totalGuru = data.users.gurus.length;
    const totalKelas = data.kelas.length;
    const totalTugas = data.tugas.length;
    
    const today = new Date().toLocaleDateString("id-ID");
    const absenHariIni = data.absensi.filter(a => a.tanggal === today);
    const hadir = absenHariIni.filter(a => a.status === "masuk").length;
    const izin = absenHariIni.filter(a => a.status === "izin").length;
    const sakit = absenHariIni.filter(a => a.status === "sakit").length;
    
    container.innerHTML = `
        <div class="dashboard-section">
            <h4>ðŸ“Š Statistik Umum</h4>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem;">
                <div style="background: white; padding: 1rem; border-radius: 8px; text-align: center;">
                    <h3>${totalSiswa}</h3>
                    <p>Siswa</p>
                </div>
                <div style="background: white; padding: 1rem; border-radius: 8px; text-align: center;">
                    <h3>${totalGuru}</h3>
                    <p>Guru</p>
                </div>
                <div style="background: white; padding: 1rem; border-radius: 8px; text-align: center;">
                    <h3>${totalKelas}</h3>
                    <p>Kelas</p>
                </div>
                <div style="background: white; padding: 1rem; border-radius: 8px; text-align: center;">
                    <h3>${totalTugas}</h3>
                    <p>Tugas</p>
                </div>
            </div>
        </div>
        <div class="dashboard-section">
            <h4>ðŸ“Š Absensi Hari Ini (${today})</h4>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
                <div style="background: white; padding: 1rem; border-radius: 8px; text-align: center;">
                    <h3 style="color: green;">${hadir}</h3>
                    <p>Hadir</p>
                </div>
                <div style="background: white; padding: 1rem; border-radius: 8px; text-align: center;">
                    <h3 style="color: orange;">${izin}</h3>
                    <p>Izin</p>
                </div>
                <div style="background: white; padding: 1rem; border-radius: 8px; text-align: center;">
                    <h3 style="color: red;">${sakit}</h3>
                    <p>Sakit</p>
                </div>
            </div>
        </div>
    `;
}

function renderAdminAbsensi() {
    const container = document.getElementById("Absensi");
    
    let html = `<div class="dashboard-section"><h4>ðŸ“Š Rekap Absensi</h4>`;
    
    if (data.absensi.length === 0) {
        html += "<p>Belum ada data absensi.</p>";
    } else {
        html += `<table><tr><th>Tanggal</th><th>Nama</th><th>Kelas</th><th>Status</th><th>Waktu</th></tr>`;
        [...data.absensi].reverse().forEach(a => {
            const namaKelas = data.kelas.find(k => k.id === a.id_kelas)?.nama || "-";
            html += `<tr><td>${a.tanggal}</td><td>${a.nama_siswa}</td><td>${namaKelas}</td><td>${a.status}</td><td>${a.waktu}</td></tr>`;
        });
        html += "</table>";
    }
    
    html += "</div>";
    container.innerHTML = html;
}

function renderAdminManajemen() {
    const container = document.getElementById("Manajemen");
    container.innerHTML = `
        <div class="dashboard-section">
            <h4>ðŸ‘¥ Manajemen Siswa</h4>
            <div class="form-container">
                <h5>Tambah Siswa Baru</h5>
                <input type="text" id="new-siswa-nama" placeholder="Nama Siswa">
                <input type="text" id="new-siswa-nis" placeholder="NIS">
                <select id="new-siswa-kelas">${data.kelas.map(k => `<option value="${k.id}">${k.nama}</option>`).join("")}</select>
                <input type="password" id="new-siswa-pass" placeholder="Password">
                <button onclick="tambahSiswa()">Tambah Siswa</button>
            </div>
            <table>
                <tr><th>ID</th><th>Nama</th><th>NIS</th><th>Kelas</th><th>Aksi</th></tr>
                ${data.users.siswas.map(s => {
                    const namaKelas = data.kelas.find(k => k.id === s.id_kelas)?.nama || "-";
                    return `<tr><td>${s.id}</td><td>${s.nama}</td><td>${s.nis}</td><td>${namaKelas}</td><td><button class="small-btn delete" onclick="hapusSiswa(${s.id})">Hapus</button></td></tr>`;
                }).join("")}
            </table>
        </div>
        <div class="dashboard-section">
            <h4>ðŸ‘¨â€ðŸ« Manajemen Guru</h4>
            <table>
                <tr><th>ID</th><th>Nama</th><th>Email</th></tr>
                ${data.users.gurus.map(g => `<tr><td>${g.id}</td><td>${g.nama}</td><td>${g.email}</td></tr>`).join("")}
            </table>
        </div>
    `;
}

function tambahSiswa() {
    const nama = document.getElementById("new-siswa-nama").value;
    const nis = document.getElementById("new-siswa-nis").value;
    const id_kelas = parseInt(document.getElementById("new-siswa-kelas").value);
    const password = document.getElementById("new-siswa-pass").value;
    
    if (!nama || !nis || !password) return alert("Semua field harus diisi!");
    
    const newId = Math.max(...data.users.siswas.map(s => s.id)) + 1;
    data.users.siswas.push({ id: newId, nama, nis, id_kelas, password });
    
    alert("Siswa berhasil ditambahkan!");
    renderAdminManajemen();
}

function hapusSiswa(id) {
    if (confirm("Yakin ingin menghapus siswa ini?")) {
        data.users.siswas = data.users.siswas.filter(s => s.id !== id);
        alert("Siswa berhasil dihapus!");
        renderAdminManajemen();
    }
}

function renderAdminJadwal() {
    const container = document.getElementById("JadwalGuru");
    let html = '<div class="dashboard-section"><h4>ðŸ—“ï¸ Jadwal Mengajar Guru</h4>';
    
    data.users.gurus.forEach(guru => {
        html += `<div class="jadwal-guru-container"><h5>${guru.nama}</h5>`;
        if (guru.jadwal && guru.jadwal.length > 0) {
            html += '<ul class="jadwal-list">';
            guru.jadwal.forEach((j, index) => {
                const namaHari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
                html += `<li class="jadwal-item"><span>${namaHari[j.hari]} - Jam ${j.jam}:00 - ${j.nama_kelas}</span><button class="small-btn delete" onclick="hapusJadwalGuru(${guru.id}, ${index})">Hapus</button></li>`;
            });
            html += '</ul>';
        } else {
            html += '<p>Belum ada jadwal.</p>';
        }
        html += `<div class="jadwal-form">
            <select id="jadwal-kelas-${guru.id}">${data.kelas.map(k => `<option value="${k.id}">${k.nama}</option>`).join("")}</select>
            <select id="jadwal-hari-${guru.id}">
                <option value="1">Senin</option>
                <option value="2">Selasa</option>
                <option value="3">Rabu</option>
                <option value="4">Kamis</option>
                <option value="5">Jumat</option>
            </select>
            <input type="number" id="jadwal-jam-${guru.id}" placeholder="Jam (0-23)" min="0" max="23">
            <button onclick="tambahJadwalGuru(${guru.id})">Tambah</button>
        </div></div>`;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

function tambahJadwalGuru(id_guru) {
    const id_kelas = parseInt(document.getElementById(`jadwal-kelas-${id_guru}`).value);
    const hari = parseInt(document.getElementById(`jadwal-hari-${id_guru}`).value);
    const jam = parseInt(document.getElementById(`jadwal-jam-${id_guru}`).value);
    
    if (isNaN(jam) || jam < 0 || jam > 23) return alert("Jam harus antara 0-23!");
    
    const guru = data.users.gurus.find(g => g.id === id_guru);
    const kelas = data.kelas.find(k => k.id === id_kelas);
    
    if (!guru.jadwal) guru.jadwal = [];
    guru.jadwal.push({ id_kelas, hari, jam, nama_kelas: kelas.nama });
    
    alert("Jadwal berhasil ditambahkan!");
    renderAdminJadwal();
}

function hapusJadwalGuru(id_guru, index) {
    const guru = data.users.gurus.find(g => g.id === id_guru);
    guru.jadwal.splice(index, 1);
    alert("Jadwal berhasil dihapus!");
    renderAdminJadwal();
}

function renderAdminManajemenJadwal() {
    const container = document.getElementById("JadwalPelajaran");
    let html = '<div class="dashboard-section"><h4>ðŸ“š Jadwal Pelajaran Per Kelas</h4>';
    
    data.kelas.forEach(kelas => {
        const jadwal = data.jadwalPelajaran[kelas.id] || [];
        html += `<div class="form-container"><h5>${kelas.nama}</h5>`;
        
        if (jadwal.length > 0) {
            const namaHari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
            html += '<table><tr><th>Hari</th><th>Jam</th><th>Mata Pelajaran</th><th>Aksi</th></tr>';
            jadwal.forEach((j, index) => {
                html += `<tr><td>${namaHari[j.hari]}</td><td>${j.jamMulai} - ${j.jamSelesai}</td><td>${j.mataPelajaran}</td><td><button class="small-btn delete" onclick="hapusJadwalPelajaran(${kelas.id}, ${index})">Hapus</button></td></tr>`;
            });
            html += '</table>';
        } else {
            html += '<p>Belum ada jadwal pelajaran.</p>';
        }
        
        html += `<h6>Tambah Jadwal Baru</h6>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
            <select id="jp-hari-${kelas.id}">
                <option value="1">Senin</option>
                <option value="2">Selasa</option>
                <option value="3">Rabu</option>
                <option value="4">Kamis</option>
                <option value="5">Jumat</option>
            </select>
            <input type="text" id="jp-mapel-${kelas.id}" placeholder="Mata Pelajaran">
            <input type="time" id="jp-mulai-${kelas.id}">
            <input type="time" id="jp-selesai-${kelas.id}">
        </div>
        <button onclick="tambahJadwalPelajaran(${kelas.id})" style="margin-top: 10px;">Tambah Jadwal</button>
        </div>`;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

function tambahJadwalPelajaran(id_kelas) {
    const hari = parseInt(document.getElementById(`jp-hari-${id_kelas}`).value);
    const mataPelajaran = document.getElementById(`jp-mapel-${id_kelas}`).value;
    const jamMulai = document.getElementById(`jp-mulai-${id_kelas}`).value;
    const jamSelesai = document.getElementById(`jp-selesai-${id_kelas}`).value;
    
    if (!mataPelajaran || !jamMulai || !jamSelesai) return alert("Semua field harus diisi!");
    
    if (!data.jadwalPelajaran[id_kelas]) data.jadwalPelajaran[id_kelas] = [];
    
    data.jadwalPelajaran[id_kelas].push({
        id: Date.now(),
        hari,
        jamMulai,
        jamSelesai,
        mataPelajaran
    });
    
    alert("Jadwal pelajaran berhasil ditambahkan!");
    renderAdminManajemenJadwal();
}

function hapusJadwalPelajaran(id_kelas, index) {
    data.jadwalPelajaran[id_kelas].splice(index, 1);
    alert("Jadwal berhasil dihapus!");
    renderAdminManajemenJadwal();
}

function renderAdminPengumuman() {
    const container = document.getElementById("Pengumuman");
    let html = `<div class="dashboard-section"><h4>ðŸ“¢ Kelola Pengumuman</h4>
    <div class="form-container">
        <h5>Buat Pengumuman Baru</h5>
        <input type="text" id="admin-pengumuman-judul" placeholder="Judul Pengumuman">
        <textarea id="admin-pengumuman-isi" placeholder="Isi pengumuman..."></textarea>
        <button onclick="buatPengumumanAdmin()">Kirim Pengumuman</button>
    </div>`;
    
    if (data.pengumuman.length > 0) {
        html += '<h5>Daftar Pengumuman</h5>';
        [...data.pengumuman].reverse().forEach((p, index) => {
            html += `<div class="announcement-card">
                <h5>${p.judul}</h5>
                <p>${p.isi}</p>
                <small>oleh ${p.nama_guru} - ${p.tanggal}</small>
                <button class="small-btn delete" onclick="hapusPengumuman(${data.pengumuman.length - 1 - index})">Hapus</button>
            </div>`;
        });
    } else {
        html += '<p>Belum ada pengumuman.</p>';
    }
    
    html += '</div>';
    container.innerHTML = html;
}

function buatPengumumanAdmin() {
    const judul = document.getElementById("admin-pengumuman-judul").value;
    const isi = document.getElementById("admin-pengumuman-isi").value;
    
    if (!judul || !isi) return alert("Judul dan isi harus diisi!");
    
    data.pengumuman.push({
        id: Date.now(),
        judul,
        isi,
        nama_guru: "Admin",
        tanggal: new Date().toLocaleDateString("id-ID")
    });
    
    createNotification("semua", "siswa", `Pengumuman baru: ${judul}`);
    createNotification("semua", "guru", `Pengumuman baru: ${judul}`);
    
    alert("Pengumuman berhasil dibuat!");
    document.getElementById("admin-pengumuman-judul").value = "";
    document.getElementById("admin-pengumuman-isi").value = "";
    renderAdminPengumuman();
}

function hapusPengumuman(index) {
    if (confirm("Yakin ingin menghapus pengumuman ini?")) {
        data.pengumuman.splice(index, 1);
        alert("Pengumuman berhasil dihapus!");
        renderAdminPengumuman();
    }
}

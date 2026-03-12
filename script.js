// ========== SMKN 1 GONDANG NGANJUK - UPDATED JAVASCRIPT ==========

// Data Testimoni Awal
let testimoniData = JSON.parse(localStorage.getItem('testimoniSMKN1')) || [
    {
        nama: 'Budi Santoso',
        kategori: 'Alumni TKJ 2020',
        pesan: 'Setelah lulus dari SMKN 1 Gondang jurusan TKJ, saya langsung diterima bekerja di perusahaan IT ternama.',
        tanggal: '2024-01-15'
    },
    {
        nama: 'Siti Aminah',
        kategori: 'Alumni Akuntansi 2019',
        pesan: 'Guru-guru di SMKN 1 Gondang sangat kompeten dan peduli dengan masa depan siswa.',
        tanggal: '2024-01-10'
    },
    {
        nama: 'Ahmad Rizki',
        kategori: 'Alumni Multimedia 2021',
        pesan: 'Fasilitas lab multimedia yang lengkap membantu saya mengembangkan skill desain.',
        tanggal: '2024-01-05'
    }
];

// Inisialisasi saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    renderTestimoni();
});

// ==================== NAVIGATION (FIXED) ====================
function toggleMenu() {
    const navMenu = document.getElementById('navMenu');
    const menuToggle = document.querySelector('.menu-toggle');
    navMenu.classList.toggle('active');
    menuToggle.classList.toggle('active');
}

function scrollToSection(id) {
    const element = document.getElementById(id);
    if (!element) return;

    const offset = 80;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });

    // Tutup menu otomatis setelah klik (untuk mobile)
    document.getElementById('navMenu').classList.remove('active');
    document.querySelector('.menu-toggle').classList.remove('active');
}

// ==================== TESTIMONI (FIXED) ====================
function renderTestimoni() {
    const container = document.querySelector('.testimonial-grid');
    if (!container) return;

    // Ambil 3 data terbaru
    const latestTestimoni = [...testimoniData].reverse().slice(0, 3);

    container.innerHTML = latestTestimoni.map(t => `
        <div class="testimonial-card" style="animation: fadeIn 0.5s ease forwards;">
            <div class="testimonial-header">
                <div class="testimonial-avatar">${t.nama.charAt(0).toUpperCase()}</div>
                <div class="testimonial-info">
                    <h4>${t.nama}</h4>
                    <p>${t.kategori}</p>
                </div>
            </div>
            <p class="testimonial-text">"${t.pesan}"</p>
            <div class="rating">⭐⭐⭐⭐⭐</div>
        </div>
    `).join('');
}

// ==================== CONTACT FORM -> TESTIMONI (FIXED) ====================
function handleSubmit(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const message = document.getElementById('message').value;

    // Masukkan ke data testimoni
    const newTestimoni = {
        nama: name,
        kategori: 'Pengunjung / Calon Siswa',
        pesan: message,
        tanggal: new Date().toISOString().split('T')[0]
    };

    testimoniData.push(newTestimoni);
    localStorage.setItem('testimoniSMKN1', JSON.stringify(testimoniData));
    
    // Update tampilan testimoni secara real-time
    renderTestimoni();

    // Tampilkan notifikasi sukses
    alert(`Terima kasih ${name}! Pesan Anda telah kami terima dan ditampilkan di bagian testimoni.`);
    event.target.reset();
    
    // Scroll ke testimoni untuk melihat hasilnya
    document.querySelector('.testimonials').scrollIntoView({ behavior: 'smooth' });
}

// ==================== PROGRAM DETAIL (FIXED) ====================
function showProgramDetail(program) {
    const programDetails = {
        'TKJ': {
            title: 'Teknik Komputer & Jaringan',
            icon: '💻',
            description: 'Fokus pada instalasi, konfigurasi, dan pemeliharaan sistem jaringan.',
            skills: ['Mikrotik & Cisco', 'Linux Server', 'Cyber Security'],
            career: ['IT Support', 'Network Engineer'],
            certification: ['CCNA', 'BNSP']
        },
        'TSM': {
            title: 'Teknik Sepeda Motor',
            icon: '🏍️',
            description: 'Menguasai teknologi motor injeksi dan manajemen bengkel.',
            skills: ['Engine Tune Up', 'Sistem Injeksi', 'Chassis'],
            career: ['Mekanik Profesional', 'Wirausaha Bengkel'],
            certification: ['Sertifikat Honda/AHASS']
        },
        // ... (data lainnya tetap sama seperti sebelumnya)
    };

    const detail = programDetails[program];
    if (!detail) return;

    const modal = document.createElement('div');
    modal.className = 'program-modal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.85); display: flex; align-items: center;
        justify-content: center; z-index: 10000; padding: 20px;
    `;

    modal.innerHTML = `
        <div style="background: white; border-radius: 20px; max-width: 600px; width: 100%; padding: 2rem; position: relative;">
            <button id="closeModal" style="position: absolute; right: 20px; top: 20px; font-size: 2rem; border: none; background: none; cursor: pointer;">&times;</button>
            <div style="font-size: 3rem; margin-bottom: 1rem;">${detail.icon}</div>
            <h2 style="color: #0f766e; margin-bottom: 1rem;">${detail.title}</h2>
            <p style="color: #64748b; margin-bottom: 1.5rem;">${detail.description}</p>
            <h4 style="margin-bottom: 0.5rem;">Kompetensi Utama:</h4>
            <ul style="margin-bottom: 1.5rem; padding-left: 20px;">
                ${detail.skills.map(s => `<li>${s}</li>`).join('')}
            </ul>
            <button onclick="this.parentElement.parentElement.remove()" class="btn btn-primary" style="width:100%">Tutup</button>
        </div>
    `;

    document.body.appendChild(modal);
    document.getElementById('closeModal').onclick = () => modal.remove();
    }

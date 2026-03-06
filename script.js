// ========== SMKN 1 GONDANG NGANJUK - MAIN JAVASCRIPT ==========

// Data Testimoni
let testimoniData = JSON.parse(localStorage.getItem('testimoniSMKN1')) || [
    {
        nama: 'Budi Santoso',
        kategori: 'Alumni TKJ 2020',
        pesan: 'Setelah lulus dari SMKN 1 Gondang jurusan TKJ, saya langsung diterima bekerja di perusahaan IT ternama. Ilmu yang didapat sangat aplikatif dan sesuai kebutuhan industri.',
        tanggal: '2024-01-15'
    },
    {
        nama: 'Siti Aminah',
        kategori: 'Alumni Akuntansi 2019',
        pesan: 'Guru-guru di SMKN 1 Gondang sangat kompeten dan peduli dengan masa depan siswa. Berkat bimbingan mereka, saya sekarang menjadi staff accounting di perusahaan multinasional.',
        tanggal: '2024-01-10'
    },
    {
        nama: 'Ahmad Rizki',
        kategori: 'Alumni Multimedia 2021',
        pesan: 'Fasilitas lab multimedia yang lengkap membuat saya bisa mengembangkan skill desain dan video editing. Sekarang saya bekerja sebagai freelance designer dengan penghasilan yang baik.',
        tanggal: '2024-01-05'
    }
];

// ==================== NAVIGATION ====================

function toggleMenu() {
    const navMenu = document.getElementById('navMenu');
    const menuToggle = document.querySelector('.menu-toggle');
    if (navMenu && menuToggle) {
        navMenu.classList.toggle('active');
        menuToggle.classList.toggle('active');
    }
}

function scrollToSection(id) {
    const element = document.getElementById(id);
    if (!element) return;

    const offset = 80;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });

    const navMenu = document.getElementById('navMenu');
    const menuToggle = document.querySelector('.menu-toggle');
    if (navMenu) navMenu.classList.remove('active');
    if (menuToggle) menuToggle.classList.remove('active');
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.addEventListener('scroll', function () {
    const scrollTop = document.getElementById('scrollTop');
    if (scrollTop) {
        scrollTop.classList.toggle('visible', window.pageYOffset > 300);
    }
});

// ==================== TESTIMONI ====================

function renderTestimoni() {
    const container = document.querySelector('.testimonial-grid');
    if (!container) return;

    const latestTestimoni = testimoniData.slice(-3).reverse();

    container.innerHTML = latestTestimoni.map(t => `
        <div class="testimonial-card">
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

// ==================== PROGRAM DETAIL MODAL ====================

function showProgramDetail(program) {
    const programDetails = {
        'TKJ': {
            title: 'Teknik Komputer & Jaringan',
            icon: '💻',
            description: 'Program keahlian yang fokus pada instalasi, konfigurasi, dan pemeliharaan sistem komputer dan jaringan.',
            skills: ['Instalasi dan Konfigurasi Jaringan', 'Linux System Administration', 'Windows Server Administration', 'Cisco CCNA', 'Network Security', 'Troubleshooting Hardware & Software', 'Web Development', 'Cloud Computing'],
            career: ['Network Administrator', 'System Administrator', 'IT Support', 'Network Engineer', 'Web Developer', 'Database Administrator'],
            certification: ['CCNA (Cisco Certified Network Associate)', 'CompTIA A+', 'Microsoft Certified', 'Linux Professional Institute']
        },
        'TSM': {
            title: 'Teknik Sepeda Motor',
            icon: '🏍️',
            description: 'Program keahlian yang mempelajari perawatan, perbaikan, dan modifikasi sepeda motor dengan teknologi terkini.',
            skills: ['Engine Sepeda Motor', 'Sistem Kelistrikan Motor', 'Sistem Bahan Bakar Injeksi', 'Tune Up & Balancing', 'Transmisi Manual & Otomatis', 'Sistem Rem & Suspensi', 'Diagnosa Motor Injeksi', 'Custom & Modifikasi Motor'],
            career: ['Mekanik Sepeda Motor', 'Teknisi AHASS', 'Service Advisor', 'Spare Part Specialist', 'Quality Control Motor', 'Wirausaha Bengkel Motor'],
            certification: ['Sertifikat Kompetensi Mekanik Motor', 'Sertifikat AHASS', 'Sertifikat K3 (Keselamatan Kerja)']
        },
        'TKR': {
            title: 'Teknik Kendaraan Ringan',
            icon: '🚗',
            description: 'Program keahlian yang mempelajari perawatan, perbaikan, dan modifikasi kendaraan bermotor roda empat.',
            skills: ['Engine Overhauling', 'Sistem Kelistrikan Otomotif', 'Sistem Chasis', 'Sistem Pemindah Tenaga', 'AC Mobil', 'Tune Up & Balancing', 'Diagnosa Kendaraan', 'Body Repair & Painting'],
            career: ['Mekanik Kendaraan', 'Teknisi Bengkel', 'Quality Control Otomotif', 'Service Advisor', 'Part Specialist', 'Teknisi Dealer Mobil'],
            certification: ['Sertifikat Kompetensi Mekanik', 'Sertifikat K3 (Keselamatan Kerja)', 'Sertifikat ATPM']
        },
        'APHP': {
            title: 'Agribisnis Pengolahan Pangan Hasil Pertanian',
            icon: '🍞',
            description: 'Program keahlian yang mempelajari pengolahan hasil pertanian menjadi produk pangan bernilai ekonomis tinggi.',
            skills: ['Teknologi Pengolahan Pangan', 'Pengawetan & Penyimpanan', 'Quality Control Produk Pangan', 'Food Safety & Hygiene', 'Packaging & Labeling', 'Marketing Produk Pangan', 'Analisis Mutu Pangan', 'Kewirausahaan Pangan'],
            career: ['Supervisor Produksi Pangan', 'Quality Control', 'Food Safety Officer', 'Wirausaha Produk Olahan', 'R&D Food Industry', 'Packaging Designer'],
            certification: ['Sertifikat Pengolahan Pangan', 'Sertifikat HACCP', 'Sertifikat Halal']
        },
        'ATU': {
            title: 'Agribisnis Ternak Unggas',
            icon: '🐔',
            description: 'Program keahlian yang mengelola peternakan unggas modern dengan teknologi dan manajemen terkini.',
            skills: ['Budidaya Ayam Pedaging', 'Budidaya Ayam Petelur', 'Kesehatan & Vaksinasi Ternak', 'Pakan & Nutrisi Unggas', 'Manajemen Kandang Modern', 'Biosecurity & Sanitasi', 'Pengolahan Produk Unggas', 'Agribisnis Peternakan'],
            career: ['Manager Peternakan Unggas', 'Supervisor Kandang', 'Technical Service', 'Quality Control Produk Unggas', 'Wirausaha Peternakan', 'Konsultan Peternakan'],
            certification: ['Sertifikat Budidaya Unggas', 'Sertifikat Kesehatan Ternak', 'Sertifikat Biosecurity']
        },
        'ATPH': {
            title: 'Agribisnis Tanaman Pangan & Hortikultura',
            icon: '🌾',
            description: 'Program keahlian budidaya tanaman pangan dan hortikultura dengan teknik modern dan berkelanjutan.',
            skills: ['Budidaya Tanaman Padi', 'Budidaya Hortikultura', 'Hidroponik & Vertikultur', 'Pertanian Organik', 'Integrated Pest Management', 'Pasca Panen & Penyimpanan', 'Agribisnis & Marketing', 'Smart Farming Technology'],
            career: ['Supervisor Pertanian', 'Farm Manager', 'Konsultan Pertanian', 'Quality Control Produk Pertanian', 'Wirausaha Agribisnis', 'Extension Officer'],
            certification: ['Sertifikat Budidaya Tanaman', 'Sertifikat Pertanian Organik', 'Sertifikat Good Agricultural Practices']
        }
    };

    const detail = programDetails[program];
    if (!detail) return;

    const modal = document.createElement('div');
    modal.className = 'program-modal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.8); display: flex; align-items: center;
        justify-content: center; z-index: 9999; padding: 20px; animation: fadeIn 0.3s ease;
    `;

    modal.innerHTML = `
        <div style="background: white; border-radius: 20px; max-width: 800px; width: 100%; max-height: 90vh; overflow-y: auto; padding: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #0f766e, #0891b2); border-radius: 15px; display: flex; align-items: center; justify-content: center; font-size: 2rem;">${detail.icon}</div>
                    <h2 style="font-size: 1.75rem; color: #0f172a; margin: 0;">${detail.title}</h2>
                </div>
                <button class="modal-close-btn" style="background: transparent; border: none; font-size: 2rem; cursor: pointer; color: #64748b; padding: 0.5rem; line-height: 1;">×</button>
            </div>
            <p style="color: #64748b; font-size: 1.125rem; margin-bottom: 2rem; line-height: 1.8;">${detail.description}</p>
            <div style="margin-bottom: 2rem;">
                <h3 style="color: #0f766e; margin-bottom: 1rem;">📚 Kompetensi yang Dipelajari</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem;">
                    ${detail.skills.map(skill => `
                        <div style="background: #f8fafc; padding: 0.75rem 1rem; border-radius: 10px; border-left: 3px solid #0f766e;">
                            <span style="color: #0f172a;">✓ ${skill}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div style="margin-bottom: 2rem;">
                <h3 style="color: #0f766e; margin-bottom: 1rem;">💼 Prospek Karir</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem;">
                    ${detail.career.map(job => `
                        <div style="background: linear-gradient(135deg, #0f766e, #0891b2); color: white; padding: 0.75rem 1rem; border-radius: 10px; text-align: center; font-weight: 600;">${job}</div>
                    `).join('')}
                </div>
            </div>
            <div>
                <h3 style="color: #0f766e; margin-bottom: 1rem;">🎓 Sertifikasi</h3>
                <ul style="list-style: none; padding: 0;">
                    ${detail.certification.map(cert => `
                        <li style="padding: 0.5rem 0; color: #64748b; display: flex; align-items: center; gap: 0.5rem;">
                            <span style="color: #f59e0b;">🏆</span> ${cert}
                        </li>
                    `).join('')}
                </ul>
            </div>
            <div style="margin-top: 2rem; padding-top: 2rem; border-top: 2px solid #f8fafc; text-align: center;">
                <button class="modal-contact-btn btn btn-primary" style="padding: 1rem 2rem;">Daftar Sekarang</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('.modal-close-btn').onclick = () => modal.remove();
    modal.querySelector('.modal-contact-btn').onclick = () => {
        modal.remove();
        document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    };
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
}

// ==================== GALLERY MODAL ====================

function showGalleryModal(index) {
    const galleryImages = [
        { title: 'Kegiatan Praktek TKJ', desc: 'Siswa sedang praktek instalasi jaringan komputer' },
        { title: 'Lab Komputer', desc: 'Fasilitas lab komputer dengan perangkat modern' },
        { title: 'Workshop Otomotif', desc: 'Praktek perbaikan mesin kendaraan' },
        { title: 'Kegiatan Multimedia', desc: 'Siswa belajar video editing dan desain grafis' },
        { title: 'Kegiatan Olahraga', desc: 'Turnamen futsal antar kelas' },
        { title: 'Upacara Bendera', desc: 'Upacara bendera setiap hari Senin' }
    ];

    const image = galleryImages[index];
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.95); display: flex; align-items: center;
        justify-content: center; z-index: 9999; padding: 20px; animation: fadeIn 0.3s ease;
    `;

    modal.innerHTML = `
        <div style="max-width: 900px; width: 100%; text-align: center;">
            <div style="background: linear-gradient(135deg, #e2e8f0, #cbd5e1); aspect-ratio: 16/9; border-radius: 20px; margin-bottom: 2rem; display: flex; align-items: center; justify-content: center; font-size: 8rem;">🖼️</div>
            <h2 style="color: white; font-size: 2rem; margin-bottom: 1rem;">${image.title}</h2>
            <p style="color: rgba(255,255,255,0.8); font-size: 1.125rem; margin-bottom: 2rem;">${image.desc}</p>
            <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                <button class="btn btn-outline gallery-prev" style="width: auto;">← Previous</button>
                <button class="btn btn-primary gallery-close" style="width: auto;">Tutup</button>
                <button class="btn btn-outline gallery-next" style="width: auto;">Next →</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('.gallery-prev').onclick = () => { modal.remove(); showGalleryModal(index > 0 ? index - 1 : galleryImages.length - 1); };
    modal.querySelector('.gallery-next').onclick = () => { modal.remove(); showGalleryModal(index < galleryImages.length - 1 ? index + 1 : 0); };
    modal.querySelector('.gallery-close').onclick = () => modal.remove();
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
}

// ==================== CONTACT FORM ====================

function handleSubmit(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const message = document.getElementById('message').value;

    testimoniData.push({
        nama: name,
        kategori: 'Pengunjung / Calon Siswa',
        pesan: message,
        tanggal: new Date().toISOString().split('T')[0]
    });
    localStorage.setItem('testimoniSMKN1', JSON.stringify(testimoniData));
    renderTestimoni();

    const successModal = document.createElement('div');
    successModal.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.8); display: flex; align-items: center;
        justify-content: center; z-index: 9999; animation: fadeIn 0.3s ease;
    `;
    successModal.innerHTML = `
        <div style="background: white; border-radius: 20px; padding: 3rem; text-align: center; max-width: 500px; margin: 20px;">
            <div style="font-size: 4rem; margin-bottom: 1rem;">✅</div>
            <h2 style="color: #0f766e; margin-bottom: 1rem;">Pesan Terkirim!</h2>
            <p style="color: #64748b; margin-bottom: 2rem;">Terima kasih <strong>${name}</strong>, pesan Anda telah kami terima dan ditambahkan ke testimoni. Tim kami akan segera menghubungi Anda.</p>
            <button class="btn btn-primary success-close-btn">Tutup</button>
        </div>
    `;
    document.body.appendChild(successModal);

    successModal.querySelector('.success-close-btn').onclick = () => successModal.remove();
    event.target.reset();

    setTimeout(() => {
        successModal.remove();
        document.querySelector('.testimonials')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 3000);
}

// ==================== PPDB MODAL ====================

function showPPDB() {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.8); display: flex; align-items: center;
        justify-content: center; z-index: 9999; padding: 20px; animation: fadeIn 0.3s ease;
    `;

    modal.innerHTML = `
        <div style="background: white; border-radius: 20px; max-width: 700px; width: 100%; max-height: 90vh; overflow-y: auto; padding: 2rem;">
            <div style="text-align: center; margin-bottom: 2rem;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">🎓</div>
                <h2 style="font-size: 2rem; color: #0f766e;">Penerimaan Peserta Didik Baru</h2>
                <p style="color: #64748b;">Tahun Pelajaran 2025/2026</p>
            </div>

            <div style="background: #f8fafc; padding: 1.5rem; border-radius: 15px; margin-bottom: 2rem;">
                <h3 style="color: #0f766e; margin-bottom: 1rem;">📅 Jadwal PPDB</h3>
                <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                    <div style="display: flex; justify-content: space-between; padding: 0.75rem; background: white; border-radius: 10px;">
                        <strong>Pendaftaran Online:</strong><span>1 - 30 Juni 2025</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 0.75rem; background: white; border-radius: 10px;">
                        <strong>Seleksi Administrasi:</strong><span>1 - 5 Juli 2025</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 0.75rem; background: white; border-radius: 10px;">
                        <strong>Pengumuman:</strong><span>10 Juli 2025</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 0.75rem; background: white; border-radius: 10px;">
                        <strong>Daftar Ulang:</strong><span>11 - 15 Juli 2025</span>
                    </div>
                </div>
            </div>

            <div style="background: #f8fafc; padding: 1.5rem; border-radius: 15px; margin-bottom: 2rem;">
                <h3 style="color: #0f766e; margin-bottom: 1rem;">📝 Persyaratan</h3>
                <ul style="list-style: none; padding: 0;">
                    ${['Lulus SMP/MTs sederajat', 'Fotocopy Ijazah/SKHUN yang dilegalisir (2 lembar)', 'Fotocopy KK (Kartu Keluarga) 1 lembar', 'Fotocopy Akta Kelahiran 1 lembar', 'Pas foto 3x4 (5 lembar) dan 4x6 (2 lembar)', 'Surat keterangan sehat dari dokter'].map(item => `
                        <li style="padding: 0.5rem 0; display: flex; gap: 0.5rem; align-items: start;">
                            <span style="color: #0f766e; font-size: 1.25rem; flex-shrink: 0;">✓</span>
                            <span>${item}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>

            <div style="background: linear-gradient(135deg, #0f766e, #0891b2); color: white; padding: 1.5rem; border-radius: 15px; margin-bottom: 2rem; text-align: center;">
                <h3 style="margin-bottom: 1rem; color: white;">💰 Biaya Pendaftaran</h3>
                <div style="font-size: 2.5rem; font-weight: bold; margin-bottom: 0.5rem;">GRATIS</div>
                <p style="opacity: 0.9;">Tidak dipungut biaya pendaftaran</p>
            </div>

            <div style="display: flex; flex-direction: column; gap: 1rem;">
                <button class="btn btn-primary ppdb-daftar-btn" style="width: 100%;">Daftar Sekarang</button>
                <button class="btn btn-outline ppdb-close-btn" style="width: 100%; color: #0f766e; border-color: #0f766e;">Tutup</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('.ppdb-daftar-btn').onclick = () => {
        modal.remove();
        document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    };
    modal.querySelector('.ppdb-close-btn').onclick = () => m

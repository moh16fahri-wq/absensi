// ========== SMKN 1 GONDANG NGANJUK - MAIN JAVASCRIPT ==========

// Toggle Mobile Menu
function toggleMenu() {
    const navMenu = document.getElementById('navMenu');
    navMenu.classList.toggle('active');
}

// Smooth Scroll to Section
function scrollToSection(id) {
    const element = document.getElementById(id);
    const offset = 80;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
    });

    // Close mobile menu if open
    const navMenu = document.getElementById('navMenu');
    navMenu.classList.remove('active');
}

// Scroll to Top
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Show/Hide Scroll to Top Button
window.addEventListener('scroll', function() {
    const scrollTop = document.getElementById('scrollTop');
    if (window.pageYOffset > 300) {
        scrollTop.classList.add('visible');
    } else {
        scrollTop.classList.remove('visible');
    }
});

// Program Detail Modal
function showProgramDetail(program) {
    const programDetails = {
        'TKJ': {
            title: 'Teknik Komputer & Jaringan',
            icon: '💻',
            description: 'Program keahlian yang fokus pada instalasi, konfigurasi, dan pemeliharaan sistem komputer dan jaringan.',
            skills: [
                'Instalasi dan Konfigurasi Jaringan',
                'Linux System Administration',
                'Windows Server Administration',
                'Cisco CCNA',
                'Network Security',
                'Troubleshooting Hardware & Software',
                'Web Development',
                'Cloud Computing'
            ],
            career: [
                'Network Administrator',
                'System Administrator',
                'IT Support',
                'Network Engineer',
                'Web Developer',
                'Database Administrator'
            ],
            certification: [
                'CCNA (Cisco Certified Network Associate)',
                'CompTIA A+',
                'Microsoft Certified',
                'Linux Professional Institute'
            ]
        },
        'AK': {
            title: 'Akuntansi & Keuangan',
            icon: '📊',
            description: 'Program keahlian yang mempelajari pencatatan, pengelolaan, dan pelaporan keuangan perusahaan.',
            skills: [
                'Akuntansi Dasar hingga Lanjutan',
                'Perpajakan',
                'Aplikasi MYOB & Accurate',
                'Microsoft Excel Advanced',
                'Analisis Laporan Keuangan',
                'Administrasi Perkantoran',
                'Perbankan',
                'Kewirausahaan'
            ],
            career: [
                'Staff Accounting',
                'Kasir',
                'Admin Keuangan',
                'Tax Staff',
                'Auditor Junior',
                'Teller Bank'
            ],
            certification: [
                'Sertifikat Komputer Akuntansi',
                'Sertifikat Perpajakan Brevet A & B',
                'Microsoft Office Specialist'
            ]
        },
        'MM': {
            title: 'Multimedia',
            icon: '🎨',
            description: 'Program keahlian yang mengembangkan kreativitas dalam desain grafis, video, animasi, dan konten digital.',
            skills: [
                'Desain Grafis (Photoshop, Illustrator)',
                'Video Editing (Premiere, After Effects)',
                'Animasi 2D & 3D (Blender)',
                'Web Design',
                'Fotografi & Videografi',
                'Motion Graphics',
                'UI/UX Design',
                'Digital Marketing'
            ],
            career: [
                'Graphic Designer',
                'Video Editor',
                'Content Creator',
                'Animator',
                'Fotografer/Videografer',
                'Social Media Specialist',
                'UI/UX Designer'
            ],
            certification: [
                'Adobe Certified Professional',
                'Sertifikat Desain Grafis',
                'Sertifikat Multimedia'
            ]
        },
        'TKR': {
            title: 'Teknik Kendaraan Ringan',
            icon: '🚗',
            description: 'Program keahlian yang mempelajari perawatan, perbaikan, dan modifikasi kendaraan bermotor roda empat.',
            skills: [
                'Engine Overhauling',
                'Sistem Kelistrikan Otomotif',
                'Sistem Chasis',
                'Sistem Pemindah Tenaga',
                'AC Mobil',
                'Tune Up & Balancing',
                'Diagnosa Kendaraan',
                'Body Repair & Painting'
            ],
            career: [
                'Mekanik Kendaraan',
                'Teknisi Bengkel',
                'Quality Control Otomotif',
                'Service Advisor',
                'Part Specialist',
                'Teknisi Dealer Mobil'
            ],
            certification: [
                'Sertifikat Kompetensi Mekanik',
                'Sertifikat K3 (Keselamatan Kerja)',
                'Sertifikat ATPM'
            ]
        }
    };

    const detail = programDetails[program];
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        padding: 20px;
        animation: fadeIn 0.3s ease;
    `;

    modal.innerHTML = `
        <div style="background: white; border-radius: 20px; max-width: 800px; width: 100%; max-height: 90vh; overflow-y: auto; padding: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="width: 60px; height: 60px; background: linear-gradient(135deg, var(--primary), var(--secondary)); border-radius: 15px; display: flex; align-items: center; justify-content: center; font-size: 2rem;">${detail.icon}</div>
                    <h2 style="font-size: 1.75rem; color: var(--dark); margin: 0;">${detail.title}</h2>
                </div>
                <button onclick="this.closest('div[style*=fixed]').remove()" style="background: transparent; border: none; font-size: 2rem; cursor: pointer; color: #64748b;">×</button>
            </div>
            
            <p style="color: #64748b; font-size: 1.125rem; margin-bottom: 2rem; line-height: 1.8;">${detail.description}</p>
            
            <div style="margin-bottom: 2rem;">
                <h3 style="color: var(--primary); margin-bottom: 1rem;">📚 Kompetensi yang Dipelajari</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem;">
                    ${detail.skills.map(skill => `
                        <div style="background: var(--light); padding: 0.75rem 1rem; border-radius: 10px; border-left: 3px solid var(--primary);">
                            <span style="color: var(--dark);">✓ ${skill}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div style="margin-bottom: 2rem;">
                <h3 style="color: var(--primary); margin-bottom: 1rem;">💼 Prospek Karir</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem;">
                    ${detail.career.map(job => `
                        <div style="background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white; padding: 0.75rem 1rem; border-radius: 10px; text-align: center; font-weight: 600;">
                            ${job}
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div>
                <h3 style="color: var(--primary); margin-bottom: 1rem;">🎓 Sertifikasi</h3>
                <ul style="list-style: none; padding: 0;">
                    ${detail.certification.map(cert => `
                        <li style="padding: 0.5rem 0; color: #64748b; display: flex; align-items: center; gap: 0.5rem;">
                            <span style="color: var(--accent);">🏆</span> ${cert}
                        </li>
                    `).join('')}
                </ul>
            </div>
            
            <div style="margin-top: 2rem; padding-top: 2rem; border-top: 2px solid var(--light); text-align: center;">
                <a onclick="scrollToSection('contact'); this.closest('div[style*=fixed]').remove();" class="btn btn-primary" style="padding: 1rem 2rem;">Daftar Sekarang</a>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.onclick = function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    };
}

// Gallery Modal
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
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.95);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        padding: 20px;
        animation: fadeIn 0.3s ease;
    `;

    modal.innerHTML = `
        <div style="max-width: 900px; width: 100%; text-align: center;">
            <div style="background: linear-gradient(135deg, #e2e8f0, #cbd5e1); aspect-ratio: 16/9; border-radius: 20px; margin-bottom: 2rem; display: flex; align-items: center; justify-content: center; font-size: 8rem;">
                🖼️
            </div>
            <h2 style="color: white; font-size: 2rem; margin-bottom: 1rem;">${image.title}</h2>
            <p style="color: rgba(255,255,255,0.8); font-size: 1.125rem; margin-bottom: 2rem;">${image.desc}</p>
            <div style="display: flex; gap: 1rem; justify-content: center;">
                <button onclick="showGalleryModal(${index > 0 ? index - 1 : galleryImages.length - 1})" class="btn btn-outline" style="width: auto;">← Previous</button>
                <button onclick="this.closest('div[style*=fixed]').remove()" class="btn btn-primary" style="width: auto;">Tutup</button>
                <button onclick="showGalleryModal(${index < galleryImages.length - 1 ? index + 1 : 0})" class="btn btn-outline" style="width: auto;">Next →</button>
            </div>
        </div>
    `;

    // Remove existing modal if any
    const existingModal = document.querySelector('div[style*="position: fixed"][style*="z-index: 9999"]');
    if (existingModal && existingModal.querySelector('div[style*="aspect-ratio"]')) {
        existingModal.remove();
    }

    document.body.appendChild(modal);
    modal.onclick = function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    };
}

// Handle Form Submit
function handleSubmit(event) {
    event.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const message = document.getElementById('message').value;

    // Show success message
    const successModal = document.createElement('div');
    successModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        animation: fadeIn 0.3s ease;
    `;

    successModal.innerHTML = `
        <div style="background: white; border-radius: 20px; padding: 3rem; text-align: center; max-width: 500px;">
            <div style="font-size: 4rem; margin-bottom: 1rem;">✅</div>
            <h2 style="color: var(--primary); margin-bottom: 1rem;">Pesan Terkirim!</h2>
            <p style="color: #64748b; margin-bottom: 2rem;">Terima kasih ${name}, pesan Anda telah kami terima. Tim kami akan segera menghubungi Anda.</p>
            <button onclick="this.closest('div').remove()" class="btn btn-primary">Tutup</button>
        </div>
    `;

    document.body.appendChild(successModal);

    // Reset form
    event.target.reset();
}

// PPDB Modal
function showPPDB() {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        padding: 20px;
        animation: fadeIn 0.3s ease;
    `;

    modal.innerHTML = `
        <div style="background: white; border-radius: 20px; max-width: 700px; width: 100%; max-height: 90vh; overflow-y: auto; padding: 2rem;">
            <div style="text-align: center; margin-bottom: 2rem;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">📋</div>
                <h2 style="font-size: 2rem; color: var(--primary); margin-bottom: 0.5rem;">Penerimaan Peserta Didik Baru</h2>
                <p style="color: #64748b;">Tahun Ajaran 2025/2026</p>
            </div>

            <div style="background: var(--light); padding: 1.5rem; border-radius: 15px; margin-bottom: 2rem;">
                <h3 style="color: var(--primary); margin-bottom: 1rem;">📅 Jadwal Pendaftaran</h3>
                <div style="display: grid; gap: 1rem;">
                    <div style="display: flex; justify-content: space-between; padding: 0.75rem; background: white; border-radius: 10px;">
                        <strong>Pendaftaran Online:</strong>
                        <span>1 Mei - 30 Juni 2025</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 0.75rem; background: white; border-radius: 10px;">
                        <strong>Tes Masuk:</strong>
                        <span>1 - 5 Juli 2025</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 0.75rem; background: white; border-radius: 10px;">
                        <strong>Pengumuman:</strong>
                        <span>10 Juli 2025</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 0.75rem; background: white; border-radius: 10px;">
                        <strong>Daftar Ulang:</strong>
                        <span>11 - 15 Juli 2025</span>
                    </div>
                </div>
            </div>

            <div style="background: var(--light); padding: 1.5rem; border-radius: 15px; margin-bottom: 2rem;">
                <h3 style="color: var(--primary); margin-bottom: 1rem;">📝 Persyaratan</h3>
                <ul style="list-style: none; padding: 0;">
                    <li style="padding: 0.5rem 0; display: flex; gap: 0.5rem; align-items: start;">
                        <span style="color: var(--primary); font-size: 1.25rem;">✓</span>
                        <span>Lulus SMP/MTs sederajat</span>
                    </li>
                    <li style="padding: 0.5rem 0; display: flex; gap: 0.5rem; align-items: start;">
                        <span style="color: var(--primary); font-size: 1.25rem;">✓</span>
                        <span>Fotocopy Ijazah/SKHUN yang dilegalisir (2 lembar)</span>
                    </li>
                    <li style="padding: 0.5rem 0; display: flex; gap: 0.5rem; align-items: start;">
                        <span style="color: var(--primary); font-size: 1.25rem;">✓</span>
                        <span>Fotocopy KK (Kartu Keluarga) 1 lembar</span>
                    </li>
                    <li style="padding: 0.5rem 0; display: flex; gap: 0.5rem; align-items: start;">
                        <span style="color: var(--primary); font-size: 1.25rem;">✓</span>
                        <span>Fotocopy Akta Kelahiran 1 lembar</span>
                    </li>
                    <li style="padding: 0.5rem 0; display: flex; gap: 0.5rem; align-items: start;">
                        <span style="color: var(--primary); font-size: 1.25rem;">✓</span>
                        <span>Pas foto 3x4 (5 lembar) dan 4x6 (2 lembar)</span>
                    </li>
                    <li style="padding: 0.5rem 0; display: flex; gap: 0.5rem; align-items: start;">
                        <span style="color: var(--primary); font-size: 1.25rem;">✓</span>
                        <span>Surat keterangan sehat dari dokter</span>
                    </li>
                </ul>
            </div>

            <div style="background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white; padding: 1.5rem; border-radius: 15px; margin-bottom: 2rem; text-align: center;">
                <h3 style="margin-bottom: 1rem; color: white;">💰 Biaya Pendaftaran</h3>
                <div style="font-size: 2.5rem; font-weight: bold; margin-bottom: 0.5rem;">GRATIS</div>
                <p style="opacity: 0.9;">Tidak dipungut biaya pendaftaran</p>
            </div>

            <div style="text-align: center;">
                <button onclick="scrollToSection('contact'); this.closest('div[style*=fixed]').remove();" class="btn btn-primary" style="margin-bottom: 1rem; width: 100%;">Daftar Sekarang</button>
                <button onclick="this.closest('div[style*=fixed]').remove()" class="btn btn-outline" style="width: 100%;">Tutup</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.onclick = function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    };
}

// News Modal
function showNews() {
    const news = [
        {
            title: 'SMKN 1 Gondang Raih Juara 1 LKS Tingkat Provinsi',
            date: '15 November 2024',
            category: 'Prestasi',
            content: 'Tim siswa TKJ SMKN 1 Gondang berhasil meraih juara 1 dalam Lomba Kompetensi Siswa (LKS) bidang Network Support tingkat Provinsi Jawa Timur.'
        },
        {
            title: 'Kerjasama dengan 10 Perusahaan untuk Program Prakerin',
            date: '10 November 2024',
            category: 'Kemitraan',
            content: 'SMKN 1 Gondang menjalin kerjasama dengan 10 perusahaan terkemuka untuk program Praktek Kerja Industri (Prakerin) siswa kelas XI.'
        },
        {
            title: 'Workshop Digital Marketing untuk Siswa Multimedia',
            date: '5 November 2024',
            category: 'Kegiatan',
            content: 'Jurusan Multimedia mengadakan workshop Digital Marketing dengan menghadirkan praktisi profesional dari industri kreatif.'
        },
        {
            title: 'Upgrade Fasilitas Lab Komputer dengan 50 Unit PC Baru',
            date: '1 November 2024',
            category: 'Fasilitas',
            content: 'Sekolah melakukan upgrade fasilitas lab komputer dengan menambah

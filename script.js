// ==========================================
// SMKN 1 GONDANG - ADVANCED SCRIPT.JS
// ==========================================

// ========== NAVBAR STICKY ==========
window.addEventListener("scroll", function () {
    const navbar = document.querySelector(".navbar");
    navbar.classList.toggle("sticky", window.scrollY > 50);
});

// ========== MOBILE MENU ==========
function toggleMenu() {
    const navLinks = document.querySelector(".nav-links");
    const body = document.body;
    navLinks.classList.toggle("active");
    body.classList.toggle("no-scroll");
}

// Tutup menu jika klik di luar
document.addEventListener("click", function (e) {
    const nav = document.querySelector(".nav-links");
    const hamb = document.querySelector(".hamburger");

    if (!nav.contains(e.target) && !hamb.contains(e.target)) {
        nav.classList.remove("active");
        document.body.classList.remove("no-scroll");
    }
});

// ========== SMOOTH SCROLL ==========
document.querySelectorAll("a[href^='#']").forEach(link => {
    link.addEventListener("click", function (e) {
        const target = document.querySelector(this.getAttribute("href"));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    });
});

// ========== SCROLL ANIMATION ==========
const animatedElements = document.querySelectorAll(".animate");

function scrollAnimation() {
    animatedElements.forEach(el => {
        const rect = el.getBoundingClientRect().top;
        if (rect < window.innerHeight - 120) {
            el.classList.add("visible");
        }
    });
}

window.addEventListener("scroll", scrollAnimation);
scrollAnimation();

// ========== DARK MODE ==========
const darkToggle = document.createElement("div");
darkToggle.className = "dark-toggle";
darkToggle.innerHTML = "🌙";
document.body.appendChild(darkToggle);

darkToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    darkToggle.innerHTML = document.body.classList.contains("dark") ? "☀️" : "🌙";

    localStorage.setItem("darkMode", document.body.classList.contains("dark"));
});

// Load tema sebelumnya
if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark");
    darkToggle.innerHTML = "☀️";
}

// ========== IMAGE SLIDER (Galeri) ==========
const slider = document.querySelector(".slider");
let slideIndex = 0;

if (slider) {
    const slides = slider.querySelectorAll("img");

    function showSlide() {
        slides.forEach(img => img.classList.remove("active"));
        slides[slideIndex].classList.add("active");
        slideIndex = (slideIndex + 1) % slides.length;
    }

    setInterval(showSlide, 3000);
    showSlide();
}

// ========== FORM VALIDATION (Kontak) ==========
const form = document.querySelector(".form-kontak");

if (form) {
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const nama = form.querySelector("input[type='text']");
        const email = form.querySelector("input[type='email']");
        const pesan = form.querySelector("textarea");

        if (nama.value.trim() === "" || email.value.trim() === "" || pesan.value.trim() === "") {
            alert("Isi semua data sebelum mengirim!");
            return;
        }

        alert("Pesan berhasil dikirim! Terima kasih 👍");
        form.reset();
    });
}

// ========== LOADING SCREEN ==========
window.addEventListener("load", () => {
    const loader = document.querySelector(".loading-screen");
    if (loader) {
        loader.classList.add("hide");
    }
});

// ========== FLOATING WHATSAPP BUTTON ==========
const waBtn = document.createElement("a");
waBtn.href = "https://wa.me/6281234567890";
waBtn.className = "wa-float";
waBtn.innerHTML = "💬";
waBtn.target = "_blank";
document.body.appendChild(waBtn);

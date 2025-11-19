// ================================
//  MOBILE NAVIGATION (HAMBURGER)
// ================================
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('open');
        hamburger.classList.toggle('active');
    });
}

// Menutup menu setelah klik link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        hamburger.classList.remove('active');
    });
});


// ==========================
//  CLICK NEON EFFECT
// ==========================
document.addEventListener('click', function(e){
    const eff = document.createElement("div");
    eff.className = "click-effect";
    eff.style.left = e.pageX + "px";
    eff.style.top = e.pageY + "px";
    document.body.appendChild(eff);

    setTimeout(()=> eff.remove(), 500);
});


// ==========================
//  FADE IN WHEN SCROLLING
// ==========================
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting){
            entry.target.classList.add('visible');
        }
    });
}, {
    threshold: 0.2
});

document.querySelectorAll('.fade-in-up').forEach(sec => {
    observer.observe(sec);
});


// ==========================
//  PAGE TRANSITION EFFECT
// ==========================
document.querySelectorAll("a").forEach(a => {
    if (a.getAttribute("href")) {
        a.addEventListener("click", e => {
            const link = a.getAttribute("href");

            if (link.includes(".html")) {
                e.preventDefault();
                document.body.classList.add("page-fade-out");

                setTimeout(() => {
                    window.location.href = link;
                }, 250);
            }
        });
    }
});


// ==========================
//  OPTIONAL: AUTO GLOW ON NAV SCROLL
// ==========================
window.addEventListener("scroll", () => {
    const nav = document.querySelector("nav");
    if (window.scrollY > 10) {
        nav.style.boxShadow = "0 0 22px rgba(51,176,255,0.12)";
    } else {
        nav.style.boxShadow = "none";
    }
});

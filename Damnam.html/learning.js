/* =========================
   CACHE ELEMENTS (IMPORTANT)
========================= */

const searchInput = document.getElementById("searchInput");
const learningCards = document.querySelectorAll(".learning-card");
const videoCards = document.querySelectorAll(".video-card");
const categoryButtons = document.querySelectorAll(".category-buttons button");

/* =========================
   LANGUAGE SWITCH
========================= */

function applyLang() {

    const lang = document.getElementById("langSwitch").value;

    document.querySelectorAll("[data-en]").forEach(el => {
        el.innerText = lang === "kh" ? el.dataset.kh : el.dataset.en;
    });

    document.querySelectorAll("[data-en-placeholder]").forEach(el => {
        el.placeholder = lang === "kh"
            ? el.dataset.khPlaceholder
            : el.dataset.enPlaceholder;
    });

    document.body.style.fontFamily =
        lang === "kh"
            ? "'Noto Sans Khmer', sans-serif"
            : "'Poppins', sans-serif";
}

document.getElementById("langSwitch").addEventListener("change", applyLang);
applyLang();

/* =========================
   FILTER STATE (IMPORTANT FIX)
========================= */

let activeCategory = "all";
let searchValue = "";

/* =========================
   MAIN FILTER FUNCTION
========================= */

function filterContent() {

    const filterText = searchValue.toLowerCase();

    /* FILTER LEARNING CARDS */
    learningCards.forEach(card => {

        const text = card.innerText.toLowerCase();

        const matchSearch = text.includes(filterText);
        const matchCategory =
            activeCategory === "all" ||
            text.includes(activeCategory);

        card.style.display =
            (matchSearch && matchCategory)
                ? "flex"
                : "none";
    });

    /* FILTER VIDEO CARDS */
    videoCards.forEach(card => {

        const text = card.innerText.toLowerCase();

        const matchSearch = text.includes(filterText);
        const matchCategory =
            activeCategory === "all" ||
            text.includes(activeCategory);

        card.style.display =
            (matchSearch && matchCategory)
                ? "block"
                : "none";
    });
}

/* =========================
   SEARCH (FIXED)
========================= */

searchInput.addEventListener("input", (e) => {
    searchValue = e.target.value;
    filterContent();
});

/* =========================
   CATEGORY FILTER (FIXED)
========================= */

categoryButtons.forEach(button => {

    button.addEventListener("click", () => {

        categoryButtons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");

        // FIX: use text content instead of dataset.en
        activeCategory = button.innerText.trim().toLowerCase();

        filterContent();
    });

});

/* =========================
   SMOOTH SCROLL (SAFE FIX)
========================= */

document.querySelectorAll('a[href^="#"]').forEach(anchor => {

    anchor.addEventListener("click", function (e) {

        const target = document.querySelector(this.getAttribute("href"));

        if (!target) return;

        e.preventDefault();

        target.scrollIntoView({ behavior: "smooth" });
    });

});

/* =========================
   SCROLL ANIMATION (FIXED)
========================= */

const animatedCards =
    document.querySelectorAll(".learning-card, .video-card, .tip-card");

/* initial state */
animatedCards.forEach(card => {
    card.style.opacity = "0";
    card.style.transform = "translateY(30px)";
    card.style.transition = "0.6s ease";
});

window.addEventListener("scroll", () => {

    const windowHeight = window.innerHeight;

    animatedCards.forEach(card => {

        const top = card.getBoundingClientRect().top;

        if (top < windowHeight - 80) {
            card.style.opacity = "1";
            card.style.transform = "translateY(0)";
        }

    });

});
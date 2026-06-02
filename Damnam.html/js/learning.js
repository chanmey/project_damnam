// learning.js

import { initializeApp }
    from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getFirestore,
    collection,
    getDocs
}
    from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   FIREBASE
========================= */

const firebaseConfig = {

    apiKey: "AIzaSyAHRAnMG3Tuyav5cbZKWUgfSHwzk0b4iyg",

    authDomain: "my-damnam.firebaseapp.com",

    projectId: "my-damnam",

    storageBucket: "my-damnam.firebasestorage.app",

    messagingSenderId: "652366628351",

    appId: "1:652366628351:web:6a0541388eec8a33a193ca",

    measurementId: "G-G41K4XYMCR"

};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

/* =========================
   ELEMENTS
========================= */

const articleContainer =
    document.getElementById("articleContainer");

const videoContainer =
    document.getElementById("videoContainer");

const searchInput =
    document.getElementById("searchInput");

const categoryButtons =
    document.querySelectorAll(".category-buttons button");

/* =========================
   GLOBAL
========================= */

let currentLang = "en";

let allCards = [];

let activeCategory = "all";

/* =========================
   LOAD LEARNING
========================= */

async function loadLearning() {

    articleContainer.innerHTML = "";

    videoContainer.innerHTML = "";

    const snapshot =
        await getDocs(collection(db, "learning"));

    snapshot.forEach((doc) => {

        const data = doc.data();

        /* =========================
           ARTICLE
        ========================= */

        if (data.type === "article") {

            articleContainer.innerHTML += `

            <div class="learning-card"
                data-category="${data.category.toLowerCase()}">

                <div class="learning-image">

                    <img src="${data.image}"
                        alt="${data.title_en}"
                        onerror="this.src='https://via.placeholder.com/500x300'">

                </div>

                <div class="learning-content">

                    <span class="learning-category"
                        data-en="${data.category}"
                        data-kh="${data.category_kh || data.category}">

                        ${data.category}

                    </span>

                    <h3
                        data-en="${data.title_en}"
                        data-kh="${data.title_kh || data.title_en}">

                        ${data.title_en}

                    </h3>

                    <p
                        data-en="${data.desc_en}"
                        data-kh="${data.desc_kh || data.desc_en}">

                        ${data.desc_en}

                    </p>

                    <button class="read-btn"
                        onclick="openArticle(
                            \`${data.title_en}\`,
                            \`${data.title_kh || data.title_en}\`,
                            \`${data.content_en}\`,
                            \`${data.content_kh || data.content_en}\`
                        )"
                        data-en="Read More"
                        data-kh="អានបន្ថែម">

                        Read More

                    </button>

                </div>

            </div>

            `;

        }

        /* =========================
           VIDEO
        ========================= */

        else {

            videoContainer.innerHTML += `

            <div class="video-card"
                data-category="videos">

                <div class="video-thumbnail">

                    <img src="${data.image}"
                        alt="${data.title_en}"
                        onerror="this.src='https://via.placeholder.com/500x300'">

                </div>

                <div class="video-content">

                    <span class="video-category"
                        data-en="${data.category}"
                        data-kh="${data.category_kh || data.category}">

                        ${data.category}

                    </span>

                    <h3
                        data-en="${data.title_en}"
                        data-kh="${data.title_kh || data.title_en}">

                        ${data.title_en}

                    </h3>

                    <button class="watch-btn"
                        onclick="openVideo('${data.video}')"
                        data-en="Watch Video"
                        data-kh="មើលវីដេអូ">

                        Watch Video

                    </button>

                </div>

            </div>

            `;

        }

    });

    applyLanguage();

    setupSearch();

    setupCategory();

}

/* =========================
   LANGUAGE
========================= */

function applyLanguage() {

    currentLang =
        document.getElementById("langSwitch").value;

    document.querySelectorAll("[data-en]").forEach(el => {

        el.innerText =
            currentLang === "kh"
                ? el.dataset.kh
                : el.dataset.en;

    });

    document.querySelectorAll("[data-en-placeholder]").forEach(el => {

        el.placeholder =
            currentLang === "kh"
                ? el.dataset.khPlaceholder
                : el.dataset.enPlaceholder;

    });

    document.body.style.fontFamily =

        currentLang === "kh"

            ? "'Noto Sans Khmer', sans-serif"

            : "'Poppins', sans-serif";

}

/* =========================
   LANGUAGE SWITCH
========================= */

document.getElementById("langSwitch")
    .addEventListener("change", applyLanguage);

/* =========================
   SEARCH
========================= */

function setupSearch() {

    allCards =
        document.querySelectorAll(
            ".learning-card, .video-card"
        );

    searchInput.addEventListener("keyup", filterCards);

}

/* =========================
   CATEGORY
========================= */

function setupCategory() {

    categoryButtons.forEach(button => {

        button.addEventListener("click", () => {

            categoryButtons.forEach(btn =>
                btn.classList.remove("active"));

            button.classList.add("active");

            activeCategory =
                button.dataset.en.toLowerCase();

            filterCards();

        });

    });

}

/* =========================
   FILTER
========================= */

function filterCards() {

    const value =
        searchInput.value.toLowerCase();

    allCards.forEach(card => {

        const text =
            card.innerText.toLowerCase();

        const category =
            card.dataset.category;

        const matchSearch =
            text.includes(value);

        const matchCategory =

            activeCategory === "all"

            ||

            category.includes(activeCategory)

            ||

            text.includes(activeCategory);

        card.style.display =

            (matchSearch && matchCategory)

                ? "block"

                : "none";

    });

}

/* =========================
   ARTICLE MODAL
========================= */

window.openArticle = function (

    titleEn,
    titleKh,
    contentEn,
    contentKh

) {

    document.getElementById("articleModal")
        .style.display = "flex";

    document.getElementById("articleTitle")
        .innerText =

        currentLang === "kh"

            ? titleKh
            : titleEn;

    document.getElementById("articleText")
        .innerText =

        currentLang === "kh"

            ? contentKh
            : contentEn;

};

window.closeArticle = function () {

    document.getElementById("articleModal")
        .style.display = "none";

};

/* =========================
   VIDEO MODAL
========================= */

window.openVideo = function (url) {

    let videoId = "";

    if (url.includes("watch?v=")) {

        videoId =
            url.split("watch?v=")[1].split("&")[0];

    }

    else if (url.includes("youtu.be/")) {

        videoId =
            url.split("youtu.be/")[1];

    }

    else {

        videoId = url;

    }

    document.getElementById("videoFrame").src =

        `https://www.youtube.com/embed/${videoId}?autoplay=1`;

    document.getElementById("videoModal")
        .style.display = "flex";

};

window.closeVideo = function () {

    document.getElementById("videoModal")
        .style.display = "none";

    document.getElementById("videoFrame")
        .src = "";

};

document.getElementById("closeArticleBtn")
    .addEventListener("click", closeArticle);

document.getElementById("closeVideoBtn")
    .addEventListener("click", closeVideo);

/* =========================
   CLOSE MODAL CLICK
========================= */

window.onclick = function (e) {

    const articleModal =
        document.getElementById("articleModal");

    const videoModal =
        document.getElementById("videoModal");

    if (e.target === articleModal) {

        closeArticle();

    }

    if (e.target === videoModal) {

        closeVideo();

    }

};

/* =========================
   START
========================= */

loadLearning();

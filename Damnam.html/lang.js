const langSwitch = document.getElementById("langSwitch");

/* LOAD SAVED LANGUAGE */
const savedLang = localStorage.getItem("language") || "en";
langSwitch.value = savedLang;
changeLanguage(savedLang);

/* CHANGE LANGUAGE */
langSwitch.addEventListener("change", function () {
    const lang = this.value;
    localStorage.setItem("language", lang);
    changeLanguage(lang);
});

/* FUNCTION */
function changeLanguage(lang) {

    document.querySelectorAll("[data-en]").forEach(el => {

        if (el.dataset.en && el.dataset.kh) {
            el.textContent = lang === "kh" ? el.dataset.kh : el.dataset.en;
        }

    });

    /* FONT SWITCH */
    document.body.style.fontFamily =
        lang === "kh"
            ? "'Noto Sans Khmer', 'Poppins', sans-serif"
            : "'Poppins', sans-serif";
}
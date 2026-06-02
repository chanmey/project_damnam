const searchInput =
    document.getElementById("searchInput");

const cropCards =
    document.querySelectorAll(".crop-card");

searchInput.addEventListener("keyup", function () {

    const value =
        this.value.toLowerCase();

    cropCards.forEach(card => {

        const title =
            card.querySelector("h3")
                .textContent
                .toLowerCase();

        if (title.includes(value)) {

            card.style.display = "block";

        } else {

            card.style.display = "none";

        }

    });

});
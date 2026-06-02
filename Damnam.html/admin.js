// admin/admin.js

import { initializeApp }

    from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {

    getFirestore,

    collection,

    addDoc,

    getDocs,

    deleteDoc,

    doc

}

    from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* FIREBASE CONFIG */

const firebaseConfig = {

    apiKey: "AIzaSyAHRAnMG3Tuyav5cbZKWUgfSHwzk0b4iyg",

    authDomain: "my-damnam.firebaseapp.com",

    projectId: "my-damnam",

    storageBucket: "my-damnam.firebasestorage.app",

    messagingSenderId: "652366628351",

    appId: "1:652366628351:web:6a0541388eec8a33a193ca",

    measurementId: "G-G41K4XYMCR"

};

/* INIT */

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

/* ELEMENTS */

const cropTable =
    document.getElementById("cropTable");

const totalCrops =
    document.getElementById("totalCrops");

/* CONNECT BUTTON */

document
    .getElementById("saveBtn")
    .addEventListener("click", saveCrop);

/* SAVE CROP */

async function saveCrop() {

    const name_en =
        document.getElementById("name_en").value;

    const name_kh =
        document.getElementById("name_kh").value;

    const price =
        document.getElementById("price").value;

    const stock =
        document.getElementById("stock").value;

    const category =
        document.getElementById("category").value;

    const image =
        document.getElementById("image").value;

    /* NEW */

    const isNew =
        document.getElementById("isNew").checked;

    /* DISCOUNT */

    const isDiscount =
        document.getElementById("isDiscount").checked;

    if (
        !name_en ||
        !name_kh ||
        !price ||
        !stock ||
        !image
    ) {

        alert("Please fill all fields");

        return;

    }

    try {

        await addDoc(collection(db, "crops"), {

            name_en: name_en,

            name_kh: name_kh,

            price: Number(price),

            stock: Number(stock),

            category: category,

            image: image,

            /* BADGE */

            new: isNew,

            discount: isDiscount

        });

        alert("Crop Saved Successfully ✅");

        /* CLEAR */

        document.getElementById("name_en").value = "";

        document.getElementById("name_kh").value = "";

        document.getElementById("price").value = "";

        document.getElementById("stock").value = "";

        document.getElementById("image").value = "";

        document.getElementById("isNew").checked = false;

        document.getElementById("isDiscount").checked = false;

        loadCrops();

    }

    catch (error) {

        console.log(error);

        alert("Error Saving Crop ❌");

    }

}

/* LEARNING SAVE */

document
    .getElementById("saveLearningBtn")
    .addEventListener("click", saveLearning);

async function saveLearning() {

    const title_en =
        document.getElementById("title_en").value;

    const title_kh =
        document.getElementById("title_kh").value;

    const desc_en =
        document.getElementById("desc_en").value;

    const desc_kh =
        document.getElementById("desc_kh").value;

    const video =
        document.getElementById("video").value;

    const image =
        document.getElementById("learningImage").value;

    const category =
        document.getElementById("learningCategory").value;

    if (
        !title_en ||
        !title_kh ||
        !video
    ) {

        alert("Please fill all fields");

        return;

    }

    try {

        await addDoc(collection(db, "learning"), {

            title_en,
            title_kh,
            desc_en,
            desc_kh,
            video,
            image,
            category

        });

        alert("Learning Saved ✅");

        document.getElementById("title_en").value = "";

        document.getElementById("title_kh").value = "";

        document.getElementById("desc_en").value = "";

        document.getElementById("desc_kh").value = "";

        document.getElementById("video").value = "";

        document.getElementById("learningImage").value = "";

        loadLearning();

    }

    catch (error) {

        console.log(error);

        alert("Error Saving Learning ❌");

    }

}

/* LOAD LEARNING */

const learningTable =
    document.getElementById("learningTable");

window.loadLearning = async function () {

    learningTable.innerHTML = "";

    const snapshot =
        await getDocs(collection(db, "learning"));

    snapshot.forEach((item) => {

        const data = item.data();

        learningTable.innerHTML += `

        <tr>

            <td>

                <img src="${data.image}"
                    onerror="this.src='https://via.placeholder.com/70'">

            </td>

            <td>${data.title_en}</td>

            <td>${data.category}</td>

            <td>

                <a href="${data.video}"
                    target="_blank">

                    Watch

                </a>

            </td>

            <td>

                <button
                    class="delete-btn"
                    onclick="deleteLearning('${item.id}')">

                    Delete

                </button>

            </td>

        </tr>

        `;

    });

};

/* DELETE LEARNING */

window.deleteLearning = async function (id) {

    await deleteDoc(doc(db, "learning", id));

    loadLearning();

};

/* LOAD CROPS */

window.loadCrops = async function () {

    cropTable.innerHTML = "";

    const snapshot =
        await getDocs(collection(db, "crops"));

    totalCrops.innerText =
        snapshot.size;

    let stockTotal = 0;

    snapshot.forEach((item) => {

        const crop =
            item.data();

        stockTotal += Number(crop.stock || 0);

        cropTable.innerHTML += `

        <tr>

            <td>

                <img src="${crop.image}"
                    onerror="this.src='https://via.placeholder.com/70'">

            </td>

            <td>${crop.name_en}</td>

            <td>${crop.name_kh}</td>

            <td>$${crop.price}</td>

            <td>${crop.stock || 0} Kg</td>

            <td>

                ${crop.category}

                <br><br>

                ${crop.new
                ? '<span style="color:#00bcd4;font-weight:700;">NEW</span>'
                : ''}

                ${crop.discount
                ? '<span style="color:#e91e63;font-weight:700;">DISCOUNT</span>'
                : ''}

            </td>

            <td>

                <button
                    class="delete-btn"
                    onclick="deleteCrop('${item.id}')">

                    Delete

                </button>

            </td>

        </tr>

        `;

    });

    document.getElementById("totalStock")
        .innerText = stockTotal + " Kg";

};

/* DELETE CROP */

window.deleteCrop = async function (id) {

    await deleteDoc(doc(db, "crops", id));

    loadCrops();

};

/* START */

loadCrops();

loadLearning();
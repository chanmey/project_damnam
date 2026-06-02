// =========================================
// FIREBASE IMPORT
// =========================================

import { initializeApp }
    from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    query,
    where,
    setDoc,
    doc,
    getDoc,
    updateDoc,
    deleteDoc
}
    from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    getAuth,
    onAuthStateChanged,
    signOut
}
    from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// =========================================
// FIREBASE CONFIG
// =========================================

const firebaseConfig = {

    apiKey: "AIzaSyAHRAnMG3Tuyav5cbZKWUgfSHwzk0b4iyg",

    authDomain: "my-damnam.firebaseapp.com",

    projectId: "my-damnam",

    storageBucket: "my-damnam.firebasestorage.app",

    messagingSenderId: "652366628351",

    appId: "1:652366628351:web:6a0541388eec8a33a193ca"

};


// =========================================
// INIT FIREBASE
// =========================================

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app);


// =========================================
// STATE
// =========================================

let currentUser = null;

let currentEditCropId = null;

let currentCropFilter = "all";


// =========================================
// HELPERS
// =========================================

function getValue(id) {

    return document.getElementById(id).value.trim();

}

function clearCropForm() {

    document.getElementById("name_en").value = "";
    document.getElementById("name_kh").value = "";
    document.getElementById("price").value = "";
    document.getElementById("stock").value = "";
    document.getElementById("image").value = "";
    document.getElementById("category").value = "grains";
    document.getElementById("saveCropBtn").innerText = "Save Crop";

    currentEditCropId = null;

}

function applyLang() {

    const lang =
        document.getElementById("langSwitch").value;

    document.querySelectorAll("[data-en]")
        .forEach(el => {

            el.innerText =
                lang === "kh"
                    ? el.dataset.kh
                    : el.dataset.en;

        });

    document.querySelectorAll("[data-en-placeholder]")
        .forEach(el => {

            el.placeholder =
                lang === "kh"
                    ? el.dataset.khPlaceholder
                    : el.dataset.enPlaceholder;

        });

    document.body.style.fontFamily =
        lang === "kh"
            ? "'Noto Sans Khmer', sans-serif"
            : "'Poppins', sans-serif";

}


// =========================================
// CHECK LOGIN
// =========================================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "login.html";

        return;

    }

    currentUser = user;

    try {

        const userSnap =
            await getDoc(doc(db, "users", user.uid));

        if (
            !userSnap.exists() ||
            userSnap.data().role !== "seller"
        ) {

            alert("Access denied");

            await signOut(auth);

            window.location.href = "login.html";

            return;

        }

        await loadMyCrops();

        await loadSoldCrops();

        await loadProfile();

        applyLang();

    }

    catch (error) {

        console.log(error);

        alert("Authentication error");

    }

});


// =========================================
// SAVE SELLER CROP
// =========================================

document.getElementById("saveCropBtn")
    .addEventListener("click", saveCrop);

async function saveCrop() {

    const name_en =
        getValue("name_en");

    const name_kh =
        getValue("name_kh");

    const price =
        getValue("price");

    const stock =
        getValue("stock");

    const image =
        getValue("image");

    const category =
        document.getElementById("category").value;

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

    if (Number(price) <= 0 || Number(stock) < 0) {

        alert("Please enter valid price and stock");

        return;

    }

    const cropData = {

        name_en,
        name_kh,
        price: Number(price),
        stock: Number(stock),
        image,
        category,
        sellerEmail: currentUser.email,
        sellerId: currentUser.uid,
        status: "pending"

    };

    try {

        if (currentEditCropId) {

            await updateDoc(
                doc(db, "crops", currentEditCropId),
                {
                    ...cropData,
                    updatedAt: Date.now()
                }
            );

            alert("Crop updated and sent for approval");

        }

        else {

            await addDoc(
                collection(db, "crops"),
                {
                    ...cropData,
                    createdAt: Date.now()
                }
            );

            alert("Crop submitted successfully");

        }

        clearCropForm();

        loadMyCrops();

    }

    catch (error) {

        console.log(error);

        alert("Error saving crop");

    }

}


// =========================================
// LOAD MY CROPS
// =========================================

async function loadMyCrops() {

    const cropTable =
        document.getElementById("sellerCropTable");

    cropTable.innerHTML = "";

    try {

        const q = query(
            collection(db, "crops"),
            where("sellerId", "==", currentUser.uid)
        );

        const snapshot =
            await getDocs(q);

        let total = 0;

        let pending = 0;

        let approved = 0;

        let shown = 0;

        snapshot.forEach((docItem) => {

            const crop =
                docItem.data();

            total++;

            if (crop.status === "pending") {

                pending++;

            }

            if (crop.status === "approved") {

                approved++;

            }

            if (
                currentCropFilter !== "all" &&
                crop.status !== currentCropFilter
            ) {

                return;

            }

            shown++;

            const statusClass =
                crop.status === "approved"
                    ? "status approved"
                    : "status pending";

            cropTable.innerHTML += `

            <tr>

                <td>
                    <img
                        src="${crop.image}"
                        class="table-img"
                        onerror="this.src='https://via.placeholder.com/80'">
                </td>

                <td>
                    ${crop.name_en}
                    <br>
                    <small>${crop.name_kh}</small>
                </td>

                <td>$${crop.price}</td>

                <td>${crop.stock} Kg</td>

                <td>
                    <span class="${statusClass}">
                        ${crop.status || "pending"}
                    </span>
                    <br>
                    <small>${crop.category || "-"}</small>
                </td>

                <td>
                    <button
                        class="action-btn edit-btn"
                        onclick="editCrop('${docItem.id}')">
                        Edit
                    </button>

                    <button
                        class="action-btn delete-btn"
                        onclick="deleteCrop('${docItem.id}')">
                        Delete
                    </button>
                </td>

            </tr>

            `;

        });

        if (shown === 0) {

            cropTable.innerHTML = `

            <tr>
                <td colspan="6"
                    style="text-align:center;padding:20px;">
                    No crops found
                </td>
            </tr>

            `;

        }

        document.getElementById("totalCrop").innerText =
            total;

        document.getElementById("pendingCrop").innerText =
            pending;

        document.getElementById("approvedCrop").innerText =
            approved;

    }

    catch (error) {

        console.log(error);

        alert("Error loading crops");

    }

}


// =========================================
// EDIT / DELETE CROP
// =========================================

window.editCrop = async function (id) {

    const cropSnap =
        await getDoc(doc(db, "crops", id));

    if (!cropSnap.exists()) {

        alert("Crop not found");

        return;

    }

    const crop =
        cropSnap.data();

    if (crop.sellerId !== currentUser.uid) {

        alert("You can only edit your own crops");

        return;

    }

    currentEditCropId = id;

    document.getElementById("name_en").value =
        crop.name_en || "";

    document.getElementById("name_kh").value =
        crop.name_kh || "";

    document.getElementById("price").value =
        crop.price || "";

    document.getElementById("stock").value =
        crop.stock || "";

    document.getElementById("category").value =
        crop.category || "grains";

    document.getElementById("image").value =
        crop.image || "";

    document.getElementById("saveCropBtn").innerText =
        "Update Crop";

    document.querySelector(".form-box")
        .scrollIntoView({ behavior: "smooth" });

};

window.deleteCrop = async function (id) {

    const confirmDelete =
        confirm("Delete this crop?");

    if (!confirmDelete) return;

    const cropSnap =
        await getDoc(doc(db, "crops", id));

    if (!cropSnap.exists()) {

        alert("Crop not found");

        return;

    }

    if (cropSnap.data().sellerId !== currentUser.uid) {

        alert("You can only delete your own crops");

        return;

    }

    await deleteDoc(doc(db, "crops", id));

    alert("Crop deleted");

    loadMyCrops();

};


// =========================================
// LOAD SOLD CROPS
// =========================================

async function loadSoldCrops() {

    const soldTable =
        document.getElementById("soldCropsTable");

    if (!soldTable) return;

    soldTable.innerHTML = "";

    try {

        const q = query(
            collection(db, "soldCrops"),
            where("sellerId", "==", currentUser.uid)
        );

        const snapshot =
            await getDocs(q);

        const soldItems = [];

        snapshot.forEach(item => {

            soldItems.push({
                id: item.id,
                ...item.data()
            });

        });

        soldItems.sort((a, b) =>
            Number(b.createdAt || 0) - Number(a.createdAt || 0));

        if (soldItems.length === 0) {

            soldTable.innerHTML = `

            <tr>
                <td colspan="6"
                    style="text-align:center;padding:20px;">
                    No sold crops yet
                </td>
            </tr>

            `;

            return;

        }

        soldItems.forEach(item => {

            const date =
                item.createdAt
                    ? new Date(item.createdAt).toLocaleString()
                    : "-";

            const mapLink =
                item.customerMapUrl
                    ? `<br><a class="map-link" href="${item.customerMapUrl}" target="_blank">Open Map</a>`
                    : "";

            soldTable.innerHTML += `

            <tr>

                <td>
                    <img
                        src="${item.image || "https://via.placeholder.com/80"}"
                        class="table-img"
                        onerror="this.src='https://via.placeholder.com/80'">
                </td>

                <td>
                    ${item.cropName || "-"}
                    <br>
                    <small>${item.cropNameKh || ""}</small>
                </td>

                <td>
                    ${item.customerPhone || "-"}
                    <br>
                    <small>${item.customerLocation || "-"}</small>
                    ${mapLink}
                </td>

                <td>${item.quantity || 0} Kg</td>

                <td>$${Number(item.total || 0).toFixed(2)}</td>

                <td>${date}</td>

            </tr>

            `;

        });

    }

    catch (error) {

        console.log(error);

        alert("Error loading sold crops");

    }

}


// =========================================
// SAVE PROFILE
// =========================================

document.getElementById("saveProfileBtn")
    .addEventListener("click", saveProfile);

async function saveProfile() {

    const name =
        getValue("sellerName");

    const phone =
        getValue("sellerPhone");

    const address =
        getValue("sellerAddress");

    const image =
        getValue("sellerImage");

    const about =
        getValue("sellerAbout");

    if (!name || !phone) {

        alert("Please fill name and phone");

        return;

    }

    try {

        await setDoc(
            doc(db, "sellerProfiles", currentUser.uid),
            {
                uid: currentUser.uid,
                email: currentUser.email,
                name,
                phone,
                address,
                image,
                about,
                updatedAt: Date.now()
            }
        );

        alert("Profile saved");

        loadProfile();

    }

    catch (error) {

        console.log(error);

        alert("Save failed");

    }

}


// =========================================
// LOAD PROFILE
// =========================================

async function loadProfile() {

    try {

        const profileSnap =
            await getDoc(doc(db, "sellerProfiles", currentUser.uid));

        if (!profileSnap.exists()) {

            return;

        }

        const data =
            profileSnap.data();

        document.getElementById("sellerName").value =
            data.name || "";

        document.getElementById("sellerPhone").value =
            data.phone || "";

        document.getElementById("sellerAddress").value =
            data.address || "";

        document.getElementById("sellerImage").value =
            data.image || "";

        document.getElementById("sellerAbout").value =
            data.about || "";

        document.getElementById("profilePreview").src =
            data.image || "https://via.placeholder.com/140";

    }

    catch (error) {

        console.log(error);

    }

}


// =========================================
// UI EVENTS
// =========================================

document.getElementById("sellerImage")
    .addEventListener("input", () => {

        const imageUrl =
            getValue("sellerImage");

        document.getElementById("profilePreview").src =
            imageUrl || "https://via.placeholder.com/140";

    });

document.getElementById("langSwitch")
    .addEventListener("change", applyLang);

document.querySelectorAll(".menu-item")
    .forEach(item => {

        item.addEventListener("click", () => {

            document.querySelectorAll(".menu-item")
                .forEach(menu => menu.classList.remove("active"));

            item.classList.add("active");

            currentCropFilter =
                item.dataset.filter || "all";

            loadMyCrops();

            loadSoldCrops();

            document.querySelector(item.dataset.scroll || ".table-box")
                .scrollIntoView({ behavior: "smooth" });

        });

    });

document.querySelector(".menu-toggle")
    .addEventListener("click", () => {

        document.querySelector(".sidebar")
            .classList.toggle("hidden-sidebar");

        document.querySelector(".main")
            .classList.toggle("full-main");

    });


// =========================================
// LOGOUT
// =========================================

document.getElementById("logoutBtn")
    .addEventListener("click", async () => {

        try {

            await signOut(auth);

            window.location.href = "login.html";

        }

        catch (error) {

            console.log(error);

        }

    });

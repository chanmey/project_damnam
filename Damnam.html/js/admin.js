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
    deleteDoc,
    doc,
    getDoc,
    updateDoc,
    query,
    where,
    orderBy
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

    appId: "1:652366628351:web:6a0541388eec8a33a193ca",

    measurementId: "G-G41K4XYMCR"

};


// =========================================
// INIT FIREBASE
// =========================================

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app);


// =========================================
// ELEMENTS
// =========================================

const cropTable =
    document.getElementById("cropTable");

const pendingTable =
    document.getElementById("pendingTable");

const learningTable =
    document.getElementById("learningTable");

const contactTable =
    document.getElementById("contactTable");

const ordersTable =
    document.getElementById("ordersTable");


// =========================================
// AUTH CHECK
// =========================================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "login.html";

        return;

    }

    try {

        const userRef =
            doc(db, "users", user.uid);

        const userSnap =
            await getDoc(userRef);

        if (!userSnap.exists()) {

            alert("User not found");

            window.location.href = "login.html";

            return;

        }

        const userData =
            userSnap.data();

        if (userData.role !== "admin") {

            alert("Access denied");

            await signOut(auth);

            window.location.href = "login.html";

            return;

        }

        loadDashboard();
        loadCrops();
        loadPendingCrops();
        loadLearning();
        loadContacts();
        loadOrders();

    }

    catch (error) {

        console.log(error);

        alert("Authentication error");

    }

});


// =========================================
// DASHBOARD
// =========================================

async function loadDashboard() {

    try {

        const cropSnapshot =
            await getDocs(collection(db, "crops"));

        document.getElementById("totalCrops")
            .innerText = cropSnapshot.size;


        const pendingQuery =
            query(
                collection(db, "crops"),
                where("status", "==", "pending")
            );

        const pendingSnapshot =
            await getDocs(pendingQuery);

        document.getElementById("totalPending")
            .innerText = pendingSnapshot.size;


        const learningSnapshot =
            await getDocs(collection(db, "learning"));

        document.getElementById("totalLearning")
            .innerText = learningSnapshot.size;


        const sellerQuery =
            query(
                collection(db, "users"),
                where("role", "==", "seller")
            );

        const sellerSnapshot =
            await getDocs(sellerQuery);

        document.getElementById("totalSellers")
            .innerText = sellerSnapshot.size;

    }

    catch (error) {

        console.log(error);

    }

}


// =========================================
// SAVE CROP
// =========================================

document.getElementById("saveBtn")
    .addEventListener("click", saveCrop);

async function saveCrop() {

    const name_en =
        document.getElementById("name_en").value.trim();

    const name_kh =
        document.getElementById("name_kh").value.trim();

    const price =
        document.getElementById("price").value;

    const stock =
        document.getElementById("stock").value;

    const category =
        document.getElementById("category").value;

    const image =
        document.getElementById("image").value.trim();

    const isNew =
        document.getElementById("isNew").checked;

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

            name_en,
            name_kh,

            price: Number(price),

            stock: Number(stock),

            category,

            image,

            new: isNew,

            discount: isDiscount,

            status: "approved",

            sellerName: "Admin",

            createdAt: Date.now()

        });

        alert("Crop saved ✔");

        document.getElementById("name_en").value = "";
        document.getElementById("name_kh").value = "";
        document.getElementById("price").value = "";
        document.getElementById("stock").value = "";
        document.getElementById("image").value = "";

        loadDashboard();
        loadCrops();

    }

    catch (error) {

        console.log(error);

        alert("Error saving crop");

    }

}


// =========================================
// LOAD CROPS
// =========================================

window.loadCrops = async function () {

    cropTable.innerHTML = "";

    const q =
        query(
            collection(db, "crops"),
            where("status", "==", "approved")
        );

    const snapshot =
        await getDocs(q);

    snapshot.forEach((item) => {

        const crop = item.data();

        cropTable.innerHTML += `

        <tr>

            <td>
                <img src="${crop.image}"
                onerror="this.src='https://via.placeholder.com/70'">
            </td>

            <td>${crop.name_en}</td>

            <td>${crop.name_kh}</td>

            <td>$${crop.price}</td>

            <td>${crop.stock} Kg</td>

            <td>${crop.status}</td>

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

};


// =========================================
// PENDING CROPS
// =========================================

window.loadPendingCrops = async function () {

    pendingTable.innerHTML = "";

    const q =
        query(
            collection(db, "crops"),
            where("status", "==", "pending")
        );

    const snapshot =
        await getDocs(q);

    if (snapshot.empty) {

        pendingTable.innerHTML = `

        <tr>
            <td colspan="7">
                No pending crops
            </td>
        </tr>

        `;

        return;

    }

    snapshot.forEach((item) => {

        const crop = item.data();

        pendingTable.innerHTML += `

        <tr>

            <td>
                <img src="${crop.image}"
                onerror="this.src='https://via.placeholder.com/70'">
            </td>

            <td>${crop.sellerEmail || "-"}</td>

            <td>${crop.name_en}</td>

            <td>$${crop.price}</td>

            <td>${crop.stock} Kg</td>

            <td>${crop.status}</td>

            <td>

                <button
                    class="approve-btn"
                    onclick="approveCrop('${item.id}')">

                    Approve

                </button>

                <button
                    class="delete-btn"
                    onclick="deleteCrop('${item.id}')">

                    Delete

                </button>

            </td>

        </tr>

        `;

    });

};


// =========================================
// APPROVE CROP
// =========================================

window.approveCrop = async function (id) {

    await updateDoc(doc(db, "crops", id), {

        status: "approved"

    });

    alert("Crop approved ✔");

    loadDashboard();
    loadCrops();
    loadPendingCrops();

};


// =========================================
// DELETE CROP
// =========================================

window.deleteCrop = async function (id) {

    const confirmDelete =
        confirm("Delete crop?");

    if (!confirmDelete) return;

    await deleteDoc(doc(db, "crops", id));

    alert("Crop deleted ✔");

    loadDashboard();
    loadCrops();
    loadPendingCrops();

};


// =========================================
// SAVE LEARNING
// =========================================

document.getElementById("saveLearningBtn")
    .addEventListener("click", saveLearning);

async function saveLearning() {

    const title_en =
        document.getElementById("title_en").value.trim();

    const title_kh =
        document.getElementById("title_kh").value.trim();

    const desc_en =
        document.getElementById("desc_en").value.trim();

    const desc_kh =
        document.getElementById("desc_kh").value.trim();

    const content_en =
        document.getElementById("content_en").value.trim();

    const content_kh =
        document.getElementById("content_kh").value.trim();

    const type =
        document.getElementById("learningType").value;

    const video =
        document.getElementById("video").value.trim();

    const image =
        document.getElementById("learningImage").value.trim();

    const category =
        document.getElementById("learningCategory").value;

    if (
        !title_en ||
        !title_kh ||
        !desc_en ||
        !desc_kh ||
        !image
    ) {

        alert("Please fill title, description, and image");

        return;

    }

    if (type === "article" && (!content_en || !content_kh)) {

        alert("Please fill article content");

        return;

    }

    if (type === "video" && !video) {

        alert("Please fill YouTube video URL");

        return;

    }

    try {

        await addDoc(collection(db, "learning"), {

            title_en,
            title_kh,

            desc_en,
            desc_kh,

            content_en,
            content_kh,

            type,
            video,
            image,
            category,

            createdAt: Date.now()

        });

    alert("Learning saved ✔");

        document.getElementById("title_en").value = "";
        document.getElementById("title_kh").value = "";
        document.getElementById("desc_en").value = "";
        document.getElementById("desc_kh").value = "";
        document.getElementById("content_en").value = "";
        document.getElementById("content_kh").value = "";
        document.getElementById("video").value = "";
        document.getElementById("learningImage").value = "";

        loadDashboard();
        loadLearning();

    }

    catch (error) {

        console.log(error);

        alert("Error saving learning content");

    }

}


// =========================================
// LOAD LEARNING
// =========================================

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

            <td>${data.type}</td>

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


// =========================================
// DELETE LEARNING
// =========================================

window.deleteLearning = async function (id) {

    await deleteDoc(doc(db, "learning", id));

    loadDashboard();

    loadLearning();

};


// =========================================
// CONTACTS
// =========================================

window.loadContacts = async function () {

    contactTable.innerHTML = "";

    const snapshot =
        await getDocs(collection(db, "contacts"));

    snapshot.forEach((item) => {

        const data = item.data();

        contactTable.innerHTML += `

        <tr>

            <td>${data.name || "-"}</td>

            <td>${data.email || "-"}</td>

            <td>${data.message || "-"}</td>

            <td>

                <button
                    class="delete-btn"
                    onclick="deleteContact('${item.id}')">

                    Delete

                </button>

            </td>

        </tr>

        `;

    });

};


// =========================================
// DELETE CONTACT
// =========================================

window.deleteContact = async function (id) {

    await deleteDoc(doc(db, "contacts", id));

    loadContacts();

};


// =========================================
// LOAD ORDERS
// =========================================

window.loadOrders = async function () {

    ordersTable.innerHTML = "";

    const q =
        query(
            collection(db, "orders"),
            orderBy("createdAt", "desc")
        );

    const snapshot =
        await getDocs(q);

    snapshot.forEach((item) => {

        const o = item.data();

        ordersTable.innerHTML += `

        <tr>

            <td>${o.location || "-"}</td>

            <td>${o.phone || "-"}</td>

            <td>${o.items?.map(i => i.name).join(", ") || "-"}</td>

            <td>${o.items?.map(i => i.qty).join(", ") || "-"}</td>

            <td>$${o.total || 0}</td>

            <td>

                <span class="status-badge ${o.status}">

                    ${o.status}

                </span>

            </td>

            <td>

                <button
                    class="confirm-btn"
                    onclick="updateStatus('${item.id}','confirmed')">

                    Confirm

                </button>

                <button
                    class="shipping-btn"
                    onclick="updateStatus('${item.id}','shipping')">

                    Shipping

                </button>

                <button
                    class="delivered-btn"
                    onclick="updateStatus('${item.id}','delivered')">

                    Delivered

                </button>

                <button
                    class="cancel-btn"
                    onclick="updateStatus('${item.id}','cancelled')">

                    Cancel

                </button>

            </td>

        </tr>

        `;

    });

};


// =========================================
// UPDATE ORDER STATUS
// =========================================

window.updateStatus = async function (id, status) {

    await updateDoc(doc(db, "orders", id), {

        status: status

    });

    alert("Order updated ✔");

    loadOrders();

};


// =========================================
// LOGOUT
// =========================================

document.getElementById("logoutBtn")
    .addEventListener("click", async () => {

        await signOut(auth);

        window.location.href = "login.html";

    });

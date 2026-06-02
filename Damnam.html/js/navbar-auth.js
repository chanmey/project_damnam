// =========================================
// NAVBAR AUTH SYSTEM
// =========================================

import {
    auth,
    db
}
    from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
}
    from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    doc,
    getDoc
}
    from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// =========================================
// ELEMENTS
// =========================================

const guestMenu =
    document.getElementById("guestMenu");

const userMenu =
    document.getElementById("userMenu");

const userBtn =
    document.getElementById("userBtn");

const dropdownMenu =
    document.getElementById("dropdownMenu");

const userName =
    document.getElementById("userName");

const dashboardLink =
    document.getElementById("dashboardLink");

const logoutBtn =
    document.getElementById("logoutBtn");


// =========================================
// USER BUTTON TOGGLE
// =========================================

if (userBtn) {

    userBtn.addEventListener(
        "click",
        () => {

            dropdownMenu.classList.toggle(
                "show"
            );

        }
    );

}


// =========================================
// AUTH STATE
// =========================================

onAuthStateChanged(
    auth,
    async (user) => {

        // NOT LOGIN

        if (!user) {

            guestMenu?.classList.remove(
                "hidden"
            );

            userMenu?.classList.add(
                "hidden"
            );

            return;

        }

        // LOGIN

        guestMenu?.classList.add(
            "hidden"
        );

        userMenu?.classList.remove(
            "hidden"
        );

        try {

            const userRef =
                doc(db, "users", user.uid);

            const userSnap =
                await getDoc(userRef);

            if (!userSnap.exists()) {

                return;

            }

            const data =
                userSnap.data();

            // USER NAME

            userName.innerText =
                data.name || "User";

            // ROLE REDIRECT

            if (data.role === "admin") {

                dashboardLink.href =
                    "admin.html";

            }

            else if (
                data.role === "seller"
            ) {

                dashboardLink.href =
                    "seller.html";

            }

            else {

                dashboardLink.href =
                    "profile.html";

            }

        }

        catch (error) {

            console.log(error);

        }

    }
);


// =========================================
// LOGOUT
// =========================================

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async () => {

            try {

                await signOut(auth);

                window.location.href =
                    "login.html";

            }

            catch (error) {

                console.log(error);

            }

        }
    );

}
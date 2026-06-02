// =========================================
// AUTH SYSTEM
// =========================================

import {
    auth,
    db
}
    from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
}
    from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    doc,
    setDoc,
    getDoc
}
    from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// =========================================
// REGISTER
// =========================================

const registerForm =
    document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();

            const name =
                document.getElementById("name").value.trim();

            const email =
                document.getElementById("email").value.trim();

            const password =
                document.getElementById("password").value.trim();

            const role =
                document.getElementById("role").value;

            if (
                !name ||
                !email ||
                !password
            ) {

                alert("Please fill all fields");
                return;

            }

            try {

                const userCredential =
                    await createUserWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );

                const user =
                    userCredential.user;

                await setDoc(
                    doc(db, "users", user.uid),
                    {
                        name: name,
                        email: email,
                        role: role,
                        createdAt: Date.now()
                    }
                );

                alert("Register success ✔");

                window.location.href =
                    "login.html";

            }

            catch (error) {

                console.log(error);

                alert(error.message);

            }

        }
    );

}

// =========================================
// LOGIN
// =========================================

const loginForm =
    document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();

            const email =
                document.getElementById("email").value;

            const password =
                document.getElementById("password").value;

            try {

                const userCredential =
                    await signInWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );

                const user =
                    userCredential.user;

                const userRef =
                    doc(db, "users", user.uid);

                const userSnap =
                    await getDoc(userRef);

                if (!userSnap.exists()) {

                    alert("User data not found");

                    return;

                }

                const userData =
                    userSnap.data();

                console.log(
                    "User Data:",
                    userData
                );

                alert(
                    "Login Success ✔\n\n" +
                    "Email: " + userData.email +
                    "\nRole: " + userData.role
                );

                // ROLE REDIRECT

                if (
                    userData.role &&
                    userData.role.toLowerCase() === "admin"
                ) {

                    window.location.href =
                        "admin.html";

                }

                else if (
                    userData.role &&
                    userData.role.toLowerCase() === "seller"
                ) {

                    window.location.href =
                        "seller.html";

                }

                else {

                    alert(
                        "Unknown role: " +
                        userData.role
                    );

                    window.location.href =
                        "index.html";

                }

            }

            catch (error) {

                console.log(error);

                alert(error.message);

            }

        }
    );

}

// =========================================
// LOGOUT
// =========================================

window.logoutUser = async function () {

    try {

        await signOut(auth);

        window.location.href =
            "login.html";

    }

    catch (error) {

        console.log(error);

    }

};

// =========================================
// AUTH CHECK
// =========================================

window.checkAuth = function () {

    onAuthStateChanged(
        auth,
        (user) => {

            if (!user) {

                window.location.href =
                    "login.html";

            }

        }
    );

};
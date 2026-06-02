import { initializeApp }
    from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getFirestore
}
    from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    getAuth
}
    from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {

    apiKey: "AIzaSyAHRAnMG3Tuyav5cbZKWUgfSHwzk0b4iyg",

    authDomain: "my-damnam.firebaseapp.com",

    projectId: "my-damnam",

    storageBucket: "my-damnam.firebasestorage.app",

    messagingSenderId: "652366628351",

    appId: "1:652366628351:web:6a0541388eec8a33a193ca"

};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app);

export { db, auth };
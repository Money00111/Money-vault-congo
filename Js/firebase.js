// ======================================
// FIREBASE CONFIG
// Money Vault Pro
// NEW FIREBASE PROJECT
// ======================================

// ======================================
// FIREBASE APP
// ======================================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";


// ======================================
// FIREBASE AUTH
// ======================================

import {
    getAuth,
    setPersistence,
    browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";


// ======================================
// FIREBASE REALTIME DATABASE
// ======================================

import {
    getDatabase
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";


// ======================================
// FIREBASE STORAGE
// ======================================

import {
    getStorage
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-storage.js";


// ======================================
// FIREBASE CONFIG
// ======================================

const firebaseConfig = {

    apiKey:
        "AIzaSyBGbXTjk6G4CWsftXWXMA2CZBdh6UpT1WQ",

    authDomain:
        "money-vault-8be97.firebaseapp.com",

    databaseURL:
        "https://money-vault-8be97-default-rtdb.firebaseio.com",

    projectId:
        "money-vault-8be97",

    storageBucket:
        "money-vault-8be97.firebasestorage.app",

    messagingSenderId:
        "599834913553",

    appId:
        "1:599834913553:web:e642a7c35485373ba8bab0",

    measurementId:
        "G-R0R10N6RW9"

};


// ======================================
// INITIALIZE FIREBASE
// ======================================

const app =
    initializeApp(firebaseConfig);


// ======================================
// FIREBASE SERVICES
// ======================================

const auth =
    getAuth(app);

const db =
    getDatabase(app);

const storage =
    getStorage(app);


// ======================================
// AUTH PERSISTENCE
// ======================================

const authReady =
    setPersistence(
        auth,
        browserLocalPersistence
    )
    .then(() => {

        console.log(
            "Firebase Auth persistence enabled"
        );

        return true;

    })
    .catch((error) => {

        console.error(
            "Firebase Auth persistence error:",
            error
        );

        return false;

    });


// ======================================
// EXPORTS
// ======================================

export {

    app,
    auth,
    db,
    storage,
    authReady

};

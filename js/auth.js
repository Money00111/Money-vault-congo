// ======================================
// AUTH.JS - MONEY VAULT
// REGISTER • LOGIN • LOGOUT • RESET
// AUTH STATE • REFERRAL
// FRONTEND ONLY
// ======================================

import {
    auth,
    db,
    authReady
} from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {
    ref,
    get,
    update
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";


// ======================================
// CONSTANTS
// ======================================

// $1 registration bonus
const REGISTRATION_BONUS = 1;


// ======================================
// REGISTER USER
// ======================================

export async function registerUser(
    fullName,
    phone,
    email,
    password,
    referralCode
) {

    try {

        await authReady;

        const cleanFullName =
            String(fullName || "").trim();

        const cleanPhone =
            String(phone || "").trim();

        const cleanEmail =
            String(email || "")
                .trim()
                .toLowerCase();

        const cleanPassword =
            String(password || "");

        const cleanReferralCode =
            String(referralCode || "")
                .trim()
                .toUpperCase();


        if (!cleanFullName) {
            alert("Please enter your full name.");
            return false;
        }

        if (!cleanPhone) {
            alert("Please enter your phone number.");
            return false;
        }

        if (!cleanEmail) {
            alert("Please enter your email.");
            return false;
        }

        if (!cleanPassword) {
            alert("Please enter your password.");
            return false;
        }


        // ==================================
        // CREATE FIREBASE AUTH ACCOUNT
        // ==================================

        const userCredential =
            await createUserWithEmailAndPassword(
                auth,
                cleanEmail,
                cleanPassword
            );

        const user =
            userCredential.user;


        // ==================================
        // REFERRER VARIABLES
        // ==================================

        let referrerUid = "";
        let referralCodeUsed = "";


        // ==================================
        // FIND REFERRER
        // ==================================

        if (cleanReferralCode !== "") {

            try {

                const referralSnapshot =
                    await get(
                        ref(
                            db,
                            "referralCodes/" +
                            cleanReferralCode
                        )
                    );


                if (referralSnapshot.exists()) {

                    const referralData =
                        referralSnapshot.val() || {};

                    const foundUid =
                        String(
                            referralData.uid || ""
                        ).trim();


                    // DO NOT ALLOW SELF REFERRAL

                    if (
                        foundUid &&
                        foundUid !== user.uid
                    ) {

                        referrerUid =
                            foundUid;

                        referralCodeUsed =
                            cleanReferralCode;

                    }

                }

            }

            catch (referralError) {

                console.error(
                    "REFERRAL LOOKUP ERROR:",
                    referralError
                );

                referrerUid = "";
                referralCodeUsed = "";

            }

        }


        // ==================================
        // GENERATE MY REFERRAL CODE
        // ==================================

        let myReferralCode =
            "MV" +
            user.uid
                .substring(0, 6)
                .toUpperCase();


        // ==================================
        // CHECK REFERRAL CODE COLLISION
        // ==================================

        try {

            const existingCodeSnapshot =
                await get(
                    ref(
                        db,
                        "referralCodes/" +
                        myReferralCode
                    )
                );


            if (
                existingCodeSnapshot.exists()
            ) {

                myReferralCode =
                    "MV" +
                    user.uid
                        .substring(0, 10)
                        .toUpperCase();

            }

        }

        catch (codeError) {

            console.warn(
                "REFERRAL CODE CHECK ERROR:",
                codeError
            );

        }


        // ==================================
        // USER DATA
        // ==================================

        const userData = {

            uid:
                user.uid,

            fullName:
                cleanFullName,

            phone:
                cleanPhone,

            email:
                cleanEmail,


            // ==================================
            // REGISTRATION BONUS
            // $1 USD
            // ==================================

            balance:
                REGISTRATION_BONUS,

            bonus:
                REGISTRATION_BONUS,

            referralBonus:
                0,

            referralEarnings:
                0,

            totalDeposit:
                0,

            totalWithdraw:
                0,

            totalTransactions:
                0,

            totalEarnings:
                REGISTRATION_BONUS,


            // ==================================
            // VIP
            // ==================================

            vip:
                "VIP 0",

            vipActive:
                false,


            // ==================================
            // MY REFERRAL CODE
            // ==================================

            referralCode:
                myReferralCode,


            // ==================================
            // REFERRAL RELATION
            // ==================================

            referredBy:
                referrerUid,

            referralCodeUsed:
                referralCodeUsed,

            referralCount:
                0,

            referralBonusGiven:
                false,


            // ==================================
            // PROFILE
            // RDC VERSION
            // ==================================

            country:
                "RDC",

            address:
                "",

            photoURL:
                "",

            createdAt:
                Date.now()

        };


// ======================================
// SAVE USER DATA
// ======================================

const userRef = ref(
    db,
    "users/" + user.uid
);

await update(
    userRef,
    userData
);


// ======================================
// SAVE MY REFERRAL CODE
// ======================================

try {

    await update(
        ref(
            db,
            "referralCodes/" + myReferralCode
        ),
        {
            uid: user.uid,
            createdAt: Date.now()
        }
    );

}
catch (referralError) {

    console.warn(
        "Referral code could not be saved:",
        referralError
    );

}


// ======================================
// SUCCESS
// ======================================

console.log("REGISTRATION SUCCESSFUL");

console.log("UID:", user.uid);

console.log(
    "MY REFERRAL CODE:",
    myReferralCode
);

return true;


        // ==================================
        // SUCCESS
        // ==================================

        console.log(
            "REGISTRATION SUCCESSFUL"
        );

        console.log(
            "UID:",
            user.uid
        );

        console.log(
            "MY REFERRAL CODE:",
            myReferralCode
        );

        console.log(
            "REGISTRATION BONUS: $1"
        );

        console.log(
            "COUNTRY: RDC"
        );


        return true;


    }

    catch (error) {

        console.error(
            "REGISTRATION ERROR:",
            error
        );

        console.error(
            "ERROR CODE:",
            error.code
        );


        if (
            error.code ===
            "auth/email-already-in-use"
        ) {

            alert(
                "This email is already registered."
            );

        }

        else if (
            error.code ===
            "auth/invalid-email"
        ) {

            alert(
                "Please enter a valid email address."
            );

        }

        else if (
            error.code ===
            "auth/weak-password"
        ) {

            alert(
                "Password is too weak."
            );

        }

        else if (
            error.code ===
            "auth/network-request-failed"
        ) {

            alert(
                "Network error. Please check your internet connection."
            );

        }

        else if (
            error.code ===
            "PERMISSION_DENIED"
            ||
            error.message?.includes(
                "Permission denied"
            )
        ) {

            alert(
                "Registration database permission denied. Please check Firebase Rules."
            );

        }

        else {

            alert(
                error.message ||
                "Registration failed."
            );

        }


        return false;

    }

}



// ======================================
// LOGIN USER
// ======================================

export async function loginUser(
    email,
    password
) {

    try {

        await authReady;

        const cleanEmail =
            String(email || "")
                .trim()
                .toLowerCase();

        const cleanPassword =
            String(password || "");


        if (!cleanEmail) {

            alert(
                "Please enter your email."
            );

            return false;

        }


        if (!cleanPassword) {

            alert(
                "Please enter your password."
            );

            return false;

        }


        const credential =
            await signInWithEmailAndPassword(
                auth,
                cleanEmail,
                cleanPassword
            );


        const user =
            credential.user;


        const userRef =
            ref(
                db,
                "users/" +
                user.uid
            );


        const snapshot =
            await get(userRef);


        if (!snapshot.exists()) {

            alert(
                "Your login is correct, but your Money Vault account data was not found."
            );


            try {

                await signOut(auth);

            }

            catch (signOutError) {

                console.error(
                    "SIGNOUT ERROR:",
                    signOutError
                );

            }


            return false;

        }


        window.location.href =
            "./dashboard.html";


        return true;


    }

    catch (error) {

        console.error(
            "LOGIN ERROR:",
            error
        );


        if (
            error.code ===
            "auth/invalid-credential"
        ) {

            alert(
                "Email or password is incorrect."
            );

        }

        else if (
            error.code ===
            "auth/user-not-found"
        ) {

            alert(
                "No account was found with this email."
            );

        }

        else if (
            error.code ===
            "auth/wrong-password"
        ) {

            alert(
                "Email or password is incorrect."
            );

        }

        else if (
            error.code ===
            "auth/too-many-requests"
        ) {

            alert(
                "Too many login attempts. Please try again later."
            );

        }

        else if (
            error.code ===
            "auth/network-request-failed"
        ) {

            alert(
                "Network error. Please check your internet connection."
            );

        }

        else if (
            error.code ===
            "PERMISSION_DENIED"
            ||
            error.message?.includes(
                "Permission denied"
            )
        ) {

            alert(
                "Permission denied while reading your account data."
            );

        }

        else {

            alert(
                error.message ||
                "Login failed."
            );

        }


        return false;

    }

}



// ======================================
// LOGOUT USER
// ======================================

export async function logoutUser() {

    try {

        await authReady;

        await signOut(auth);

        window.location.href =
            "./login.html";

    }

    catch (error) {

        console.error(
            "LOGOUT ERROR:",
            error
        );

        alert(
            error.message ||
            "Logout failed."
        );

    }

}



// ======================================
// RESET PASSWORD
// ======================================

export async function resetPassword(
    email
) {

    try {

        await authReady;

        const cleanEmail =
            String(email || "")
                .trim()
                .toLowerCase();


        if (!cleanEmail) {

            alert(
                "Please enter your email."
            );

            return false;

        }


        await sendPasswordResetEmail(
            auth,
            cleanEmail
        );


        alert(
            "Password reset email sent."
        );


        return true;

    }

    catch (error) {

        console.error(
            "PASSWORD RESET ERROR:",
            error
        );


        if (
            error.code ===
            "auth/user-not-found"
        ) {

            alert(
                "No account was found with this email."
            );

        }

        else if (
            error.code ===
            "auth/invalid-email"
        ) {

            alert(
                "Please enter a valid email address."
            );

        }

        else {

            alert(
                error.message ||
                "Password reset failed."
            );

        }


        return false;

    }

}



// ======================================
// GET CURRENT USER
// ======================================

export function getCurrentUser() {

    return auth.currentUser;

}



// ======================================
// CHECK AUTH
// ======================================

export function checkAuth(
    callback
) {

    return onAuthStateChanged(
        auth,
        (user) => {

            if (user) {

                callback(user);

            }

            else {

                window.location.href =
                    "./login.html";

            }

        }
    );

}



// ======================================
// REQUIRE LOGIN
// ======================================

export function requireLogin() {

    return onAuthStateChanged(
        auth,
        (user) => {

            if (!user) {

                window.location.href =
                    "./login.html";

            }

        }
    );

}



// ======================================
// CHECK LOGIN STATUS
// ======================================

export function isLoggedIn() {

    return auth.currentUser !== null;

}



// ======================================
// AUTH READY
// ======================================

console.log(
    "Money Vault Auth.js Loaded"
);

console.log(
    "Registration Bonus: $1"
);

console.log(
    "Country: RDC"
);

console.log(
    "Referral System Ready"
);

console.log(
    "Login Ready"
);

console.log(
    "Logout Ready"
);

console.log(
    "Password Reset Ready"
);

// ======================================
// REFERRAL SYSTEM PART 7
// Money Vault - Version Française
// ======================================

import { auth, db } from "./firebase.js";

import {
    ref,
    onValue
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";


const referralCode =
document.getElementById("referralCode");

const referralLink =
document.getElementById("referralLink");

const referralCount =
document.getElementById("referralCount");

const referralEarnings =
document.getElementById("referralEarnings");

const copyBtn =
document.getElementById("copyReferralBtn");


let currentUser = null;


// ======================================
// AUTHENTIFICATION
// ======================================

auth.onAuthStateChanged((user) => {

    if (!user) {
        return;
    }

    currentUser = user;

    loadReferralData();

});


// ======================================
// CHARGER LES DONNÉES DE PARRAINAGE
// ======================================

function loadReferralData() {

    const userRef =
    ref(db, "users/" + currentUser.uid);


    onValue(userRef, (snapshot) => {

        if (!snapshot.exists()) {
            return;
        }


        const user =
        snapshot.val();


        // ==================================
        // CODE DE PARRAINAGE
        // ==================================

        const code =
        user.referralCode ||
        currentUser.uid.substring(0, 8);


        referralCode.textContent =
        code;


        // ==================================
        // LIEN DE PARRAINAGE
        // ==================================

        referralLink.value =
        window.location.origin +
        "/register.html?ref=" +
        code;


        // ==================================
        // NOMBRE DE FILLEULS
        // ==================================

        const count =
        user.referrals
        ?
        Object.keys(user.referrals).length
        :
        0;


        referralCount.textContent =
        count;


        // ==================================
        // GAINS DE PARRAINAGE
        // ==================================

        referralEarnings.textContent =
        Number(
            user.referralEarnings || 0
        )
        .toLocaleString()
        +
        " RWF";

    });

}


// ======================================
// COPIER LE LIEN
// ======================================

copyBtn?.addEventListener("click", async () => {

    try {

        await navigator.clipboard.writeText(
            referralLink.value
        );


        alert(
            "Lien de parrainage copié avec succès."
        );

    }

    catch (error) {

        console.error(error);

        alert(
            "Impossible de copier le lien."
        );

    }

});

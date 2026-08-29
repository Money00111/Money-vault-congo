// ======================================
// PROFILE.JS - COMPLETE VERSION
// MONEY VAULT PRO
// LANGUE : FRANÇAIS
// DEVISE : USD ($)
// ======================================

import { auth, db, storage } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {
    ref,
    get,
    update
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";

import {
    ref as storageRef,
    uploadBytesResumable,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-storage.js";


// ======================================
// ELEMENTS
// ======================================

const sidebar = document.getElementById("sidebar");
const menuBtn = document.getElementById("menuBtn");
const logoutBtn = document.getElementById("logoutBtn");
const loadingScreen = document.getElementById("loadingScreen");

const profilePhoto = document.getElementById("profilePhoto");
const photoInput = document.getElementById("photoInput");

const fullName = document.getElementById("fullName");
const userEmail = document.getElementById("userEmail");

const balance = document.getElementById("balance");
const bonus = document.getElementById("bonus");
const referralBonus = document.getElementById("referralBonus");

const vipLevel = document.getElementById("vipLevel");
const vipCard = document.getElementById("vipCard");

const totalDeposit = document.getElementById("totalDeposit");
const totalWithdraw = document.getElementById("totalWithdraw");
const totalTransactions = document.getElementById("totalTransactions");

const accountId = document.getElementById("accountId");
const joinDate = document.getElementById("joinDate");

const nameInput = document.getElementById("name");
const phoneInput = document.getElementById("phone");
const emailInput = document.getElementById("email");
const countryInput = document.getElementById("country");
const addressInput = document.getElementById("address");

const profileForm = document.getElementById("profileForm");
const darkModeToggle = document.getElementById("darkMode");

const referralCode = document.getElementById("referralCode");
const referralLink = document.getElementById("referralLink");
const copyReferralBtn = document.getElementById("copyReferralBtn");
const totalReferrals = document.getElementById("totalReferrals");
const shareWhatsappBtn = document.getElementById("shareWhatsappBtn");

const scrollBtn = document.getElementById("scrollTopBtn");


// ======================================
// USER
// ======================================

let currentUser = null;
let userData = {};


// ======================================
// FORMAT USD
// ======================================

function formatUSD(value) {

    const number = Number(value || 0);

    return "$" + number.toLocaleString(
        "en-US",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );

}


// ======================================
// SIDEBAR
// ======================================

menuBtn?.addEventListener("click", () => {

    sidebar?.classList.toggle("active");

});


// ======================================
// LOGOUT
// ======================================

logoutBtn?.addEventListener("click", async (e) => {

    e.preventDefault();

    const confirmation = confirm(
        "Voulez-vous vraiment vous déconnecter de Money Vault ?"
    );

    if (!confirmation) return;

    try {

        await signOut(auth);

        window.location.href = "login.html";

    } catch (error) {

        console.error(
            "ERREUR DÉCONNEXION :",
            error
        );

        alert(
            error?.message ||
            "La déconnexion a échoué."
        );

    }

});


// ======================================
// AUTHENTIFICATION
// ======================================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "login.html";

        return;

    }

    currentUser = user;

    try {

        await loadProfile(user);

        loadReferralData();

    } catch (error) {

        console.error(
            "ERREUR PROFIL :",
            error
        );

        alert(
            error?.message ||
            "Impossible de charger votre profil."
        );

    } finally {

        if (loadingScreen) {

            loadingScreen.style.display = "none";

        }

    }

});


// ======================================
// LOAD PROFILE
// ======================================

async function loadProfile(user) {

    const userRef = ref(
        db,
        "users/" + user.uid
    );

    const snapshot = await get(userRef);


    if (!snapshot.exists()) {

        if (loadingScreen) {

            loadingScreen.style.display = "none";

        }

        alert(
            "Profil utilisateur introuvable."
        );

        return;

    }


    userData = snapshot.val();


    // ==================================
    // HEADER
    // ==================================

    if (fullName) {

        fullName.textContent =
            userData.fullName ||
            "Utilisateur Money Vault";

    }


    if (userEmail) {

        userEmail.textContent =
            user.email || "";

    }


    // ==================================
    // WALLET
    // ==================================

    if (balance) {

        balance.textContent =
            formatUSD(userData.balance);

    }


    if (bonus) {

        bonus.textContent =
            formatUSD(userData.bonus);

    }


    if (referralBonus) {

        referralBonus.textContent =
            formatUSD(
                userData.referralBonus ??
                userData.referralEarnings ??
                0
            );

    }


    // ==================================
    // VIP
    // ==================================

    const vip =
        userData.vip ||
        "VIP 0";


    if (vipLevel) {

        vipLevel.textContent =
            vip;

    }


    if (vipCard) {

        vipCard.textContent =
            vip;

    }


    // ==================================
    // STATISTIQUES
    // ==================================

    if (totalDeposit) {

        totalDeposit.textContent =
            formatUSD(
                userData.totalDeposit
            );

    }


    if (totalWithdraw) {

        totalWithdraw.textContent =
            formatUSD(
                userData.totalWithdraw
            );

    }


    if (totalTransactions) {

        totalTransactions.textContent =
            Number(
                userData.totalTransactions || 0
            ).toLocaleString("fr-FR");

    }


    // ==================================
    // INFORMATIONS COMPTE
    // ==================================

    if (accountId) {

        accountId.textContent =
            user.uid.substring(0, 12);

    }


    if (joinDate) {

        const creationTime =
            user.metadata?.creationTime;

        if (creationTime) {

            joinDate.textContent =
                new Date(
                    creationTime
                ).toLocaleDateString(
                    "fr-FR"
                );

        } else {

            joinDate.textContent =
                "-";

        }

    }


    // ==================================
    // FORMULAIRE
    // ==================================

    if (nameInput) {

        nameInput.value =
            userData.fullName || "";

    }


    if (phoneInput) {

        phoneInput.value =
            userData.phone || "";

    }


    if (emailInput) {

        emailInput.value =
            user.email || "";

    }


    if (countryInput) {

        countryInput.value =
            userData.country ||
            "🇷🇼 Rwanda";

    }


    if (addressInput) {

        addressInput.value =
            userData.address || "";

    }


    // ==================================
    // PHOTO DE PROFIL
    // ==================================

    if (
        profilePhoto &&
        userData.photoURL
    ) {

        profilePhoto.src =
            userData.photoURL;

    }

}


// ======================================
// SAVE PROFILE
// ======================================

profileForm?.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();


        if (!currentUser) {

            alert(
                "Utilisateur non connecté."
            );

            return;

        }


        const fullNameValue =
            nameInput?.value?.trim() || "";

        const phoneValue =
            phoneInput?.value?.trim() || "";

        const countryValue =
            countryInput?.value || "🇷🇼 Rwanda";

        const addressValue =
            addressInput?.value?.trim() || "";


        // ==================================
        // VALIDATION NOM
        // ==================================

        if (
            fullNameValue.length < 3
        ) {

            alert(
                "Veuillez entrer votre nom complet."
            );

            return;

        }


        try {

            await update(
                ref(
                    db,
                    "users/" +
                    currentUser.uid
                ),
                {

                    fullName:
                        fullNameValue,

                    phone:
                        phoneValue,

                    country:
                        countryValue,

                    address:
                        addressValue,

                    updatedAt:
                        Date.now()

                }
            );


            userData.fullName =
                fullNameValue;

            userData.phone =
                phoneValue;

            userData.country =
                countryValue;

            userData.address =
                addressValue;


            if (fullName) {

                fullName.textContent =
                    fullNameValue;

            }


            alert(
                "Votre profil a été mis à jour avec succès."
            );


        } catch (error) {

            console.error(
                "ERREUR MISE À JOUR PROFIL :",
                error
            );

            alert(
                error?.message ||
                "Impossible de mettre à jour le profil."
            );

        }

    }
);


// ======================================
// PROFILE PHOTO
// ======================================

photoInput?.addEventListener(
    "change",
    (e) => {

        const file =
            e.target.files?.[0];


        if (!file) return;


        if (!currentUser) {

            alert(
                "Utilisateur non connecté."
            );

            return;

        }


        // ==================================
        // LIMIT SIZE
        // ==================================

        if (
            file.size >
            5 * 1024 * 1024
        ) {

            alert(
                "La photo ne doit pas dépasser 5 Mo."
            );

            photoInput.value = "";

            return;

        }


        // ==================================
        // CHECK IMAGE
        // ==================================

        if (
            !file.type.startsWith(
                "image/"
            )
        ) {

            alert(
                "Veuillez sélectionner une image valide."
            );

            photoInput.value = "";

            return;

        }


        const fileRef =
            storageRef(
                storage,
                "profilePhotos/" +
                currentUser.uid
            );


        const uploadTask =
            uploadBytesResumable(
                fileRef,
                file
            );


        uploadTask.on(

            "state_changed",

            (snapshot) => {

                const progress =
                    (
                        snapshot.bytesTransferred /
                        snapshot.totalBytes
                    ) * 100;

                console.log(
                    "Upload : " +
                    progress.toFixed(0) +
                    "%"
                );

            },

            (error) => {

                console.error(
                    "ERREUR PHOTO :",
                    error
                );

                alert(
                    "Échec du téléchargement de la photo."
                );

            },

            async () => {

                try {

                    const url =
                        await getDownloadURL(
                            uploadTask.snapshot.ref
                        );


                    await update(
                        ref(
                            db,
                            "users/" +
                            currentUser.uid
                        ),
                        {

                            photoURL:
                                url

                        }
                    );


                    userData.photoURL =
                        url;


                    if (profilePhoto) {

                        profilePhoto.src =
                            url;

                    }


                    alert(
                        "Votre photo de profil a été mise à jour."
                    );


                } catch (error) {

                    console.error(
                        "ERREUR ENREGISTREMENT PHOTO :",
                        error
                    );

                    alert(
                        "Impossible d'enregistrer la photo."
                    );

                }

            }

        );

    }
);


// ======================================
// DARK MODE
// ======================================

if (
    localStorage.getItem(
        "darkMode"
    ) === "true"
) {

    document.body.classList.add(
        "dark"
    );


    if (darkModeToggle) {

        darkModeToggle.checked =
            true;

    }

}


darkModeToggle?.addEventListener(
    "change",
    () => {

        const enabled =
            darkModeToggle.checked;


        document.body.classList.toggle(
            "dark",
            enabled
        );


        localStorage.setItem(
            "darkMode",
            enabled
        );

    }
);


// ======================================
// EDIT PROFILE
// ======================================

document
    .getElementById("editProfileBtn")
    ?.addEventListener(
        "click",
        () => {

            nameInput?.focus();

        }
    );


// ======================================
// CANCEL
// ======================================

document
    .querySelector(".cancel-btn")
    ?.addEventListener(
        "click",
        async () => {

            if (!currentUser) return;

            try {

                await loadProfile(
                    currentUser
                );

            } catch (error) {

                console.error(
                    error
                );

            }

        }
    );


// ======================================
// SCROLL TO TOP
// ======================================

window.addEventListener(
    "scroll",
    () => {

        if (!scrollBtn) return;


        if (
            window.scrollY > 300
        ) {

            scrollBtn.style.display =
                "flex";

        } else {

            scrollBtn.style.display =
                "none";

        }

    }
);


scrollBtn?.addEventListener(
    "click",
    () => {

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    }
);


// ======================================
// REFERRAL DATA
// ======================================

function loadReferralData() {

    if (!userData) return;


    const code =
        userData.referralCode || "";


    if (referralCode) {

        referralCode.textContent =
            code || "-";

    }


    if (referralLink) {

        if (code) {

            referralLink.value =
                window.location.origin +
                "/register.html?ref=" +
                encodeURIComponent(code);

        } else {

            referralLink.value =
                "";

        }

    }


    if (totalReferrals) {

        totalReferrals.textContent =
            Number(
                userData.referralCount || 0
            ).toLocaleString(
                "fr-FR"
            );

    }

}


// ======================================
// COPY REFERRAL LINK
// ======================================

copyReferralBtn?.addEventListener(
    "click",
    async () => {

        if (!referralLink?.value) {

            alert(
                "Votre lien de parrainage n'est pas disponible."
            );

            return;

        }


        try {

            if (
                navigator.clipboard &&
                window.isSecureContext
            ) {

                await navigator.clipboard.writeText(
                    referralLink.value
                );

            } else {

                referralLink.select();

                document.execCommand(
                    "copy"
                );

            }


            alert(
                "Lien de parrainage copié avec succès."
            );


        } catch (error) {

            console.error(
                "ERREUR COPIE :",
                error
            );

            alert(
                "Échec de la copie du lien."
            );

        }

    }
);


// ======================================
// SHARE WHATSAPP
// ======================================

shareWhatsappBtn?.addEventListener(
    "click",
    () => {

        if (!referralLink?.value) {

            alert(
                "Votre lien de parrainage n'est pas disponible."
            );

            return;

        }


        const text =
`Rejoignez Money Vault avec mon lien de parrainage :

${referralLink.value}

Inscrivez-vous avec mon lien de parrainage.`;

        const whatsappURL =
            "https://wa.me/?text=" +
            encodeURIComponent(
                text
            );


        window.open(
            whatsappURL,
            "_blank"
        );

    }
);


// ======================================
// CONSOLE
// ======================================

console.log(
    "=================================="
);

console.log(
    " Money Vault - Profil"
);

console.log(
    " Langue : Français"
);

console.log(
    " Devise : USD ($)"
);

console.log(
    " Profil : OK"
);

console.log(
    " Referral : OK"
);

console.log(
    " Photo : OK"
);

console.log(
    " Dark Mode : OK"
);

console.log(
    "=================================="
);

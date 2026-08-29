// ======================================
// dashboard.js
// VERSION FRANÇAISE - RDC
// MONEY VAULT PRO
// ======================================

import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {
    ref,
    onValue,
    query,
    limitToLast
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";


// ======================================
// ELEMENTS
// ======================================

const loadingScreen =
    document.getElementById("loadingScreen");

const menuBtn =
    document.getElementById("menuBtn");

const sidebar =
    document.getElementById("sidebar");

const logoutBtn =
    document.getElementById("logoutBtn");

const userName =
    document.getElementById("userName");

const balance =
    document.getElementById("balance");

const summaryBalance =
    document.getElementById("summaryBalance");

const bonus =
    document.getElementById("bonus");

const referralBonus =
    document.getElementById("referralBonus");

const currentVip =
    document.getElementById("currentVip");

const currentVipStatus =
    document.getElementById("currentVipStatus");


// ======================================
// SIDEBAR MENU
// ======================================

menuBtn?.addEventListener("click", () => {

    sidebar.classList.toggle("active");

});


// ======================================
// LOGOUT
// ======================================

logoutBtn?.addEventListener("click", async (e) => {

    e.preventDefault();

    const ok =
        confirm("Voulez-vous vous déconnecter de Money Vault ?");

    if (!ok) return;

    try {

        await signOut(auth);

        location.href = "login.html";

    } catch (error) {

        alert(error.message);

    }

});


// ======================================
// AUTH CHECK
// ======================================

let dashboardAuthChecked = false;

onAuthStateChanged(auth, (user) => {

    console.log(
        "ÉTAT AUTHENTIFICATION DASHBOARD:",
        user ? user.uid : "AUCUN UTILISATEUR"
    );


    if (!dashboardAuthChecked) {

        dashboardAuthChecked = true;

    }


    // ==================================
    // AUCUN UTILISATEUR
    // ==================================

    if (!user) {

        console.log(
            "Dashboard : utilisateur non connecté"
        );

        if (loadingScreen) {

            loadingScreen.style.display =
                "none";

        }

        return;

    }


    // ==================================
    // UTILISATEUR TROUVÉ
    // ==================================

    console.log(
        "Utilisateur Dashboard:",
        user.uid
    );


    // ==================================
    // CHARGER LE DASHBOARD
    // ==================================

    loadUser(user);

    loadTransactions(user);

    loadNotifications();

});


// ======================================
// LOAD USER
// ======================================

function loadUser(user) {

    const userRef =
        ref(
            db,
            "users/" + user.uid
        );


    onValue(userRef, (snapshot) => {

        if (loadingScreen) {

            loadingScreen.style.display =
                "none";

        }


        if (!snapshot.exists()) {

            console.log(
                "Données utilisateur introuvables"
            );

            return;

        }


        const data =
            snapshot.val();


        console.log(
            "DONNÉES UTILISATEUR:",
            data
        );


        createReferral(data);


        userName.textContent =
            data.fullName ||
            data.name ||
            "Utilisateur Money Vault";


        // ==================================
        // BALANCE - USD
        // ==================================

        balance.textContent =
            "$" +
            Number(
                data.balance || 0
            ).toLocaleString(
                "en-US",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            );


        summaryBalance.textContent =
            "$" +
            Number(
                data.balance || 0
            ).toLocaleString(
                "en-US",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            );


        // ==================================
        // BONUS - USD
        // ==================================

        bonus.textContent =
            "$" +
            Number(
                data.bonus || 0
            ).toLocaleString(
                "en-US",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            );


        // ==================================
        // REFERRAL BONUS - USD
        // ==================================

        referralBonus.textContent =
            "$" +
            Number(
                data.referralEarnings ??
                data.referralBonus ??
                0
            ).toLocaleString(
                "en-US",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            );


        // ==================================
        // VIP
        // ==================================

        currentVip.textContent =
            data.vip ||
            "VIP 0";


        if (currentVipStatus) {

            currentVipStatus.textContent =
                (
                    data.vip ||
                    "VIP 0"
                ) +
                " Membre";

        }

    }, (error) => {

        console.error(
            "Erreur de chargement utilisateur:",
            error
        );


        if (loadingScreen) {

            loadingScreen.style.display =
                "none";

        }

    });

}


console.log(
    "Dashboard Partie 1 prête"
);


// ======================================
// PARTIE 2
// TRANSACTIONS + PARRAINAGE + NOTIFICATIONS
// ======================================


// ======================================
// ELEMENTS
// ======================================

const recentTransactions =
    document.getElementById(
        "recentTransactions"
    );

const referralCodeElement =
    document.getElementById(
        "referralCode"
    );

const referralLink =
    document.getElementById(
        "referralLink"
    );

const referralCountElement =
    document.getElementById(
        "referralCount"
    );

const referralEarningsElement =
    document.getElementById(
        "referralEarnings"
    );

const copyReferral =
    document.getElementById(
        "copyReferralBtn"
    );

const notificationList =
    document.getElementById(
        "notificationList"
    );


// ======================================
// LOAD TRANSACTIONS
// ======================================

function loadTransactions(user) {

    const transactionRef =
        query(

            ref(
                db,
                "transactions"
            ),

            limitToLast(100)

        );


    onValue(
        transactionRef,
        (snapshot) => {

            recentTransactions.innerHTML =
                "";


            if (!snapshot.exists()) {

                recentTransactions.innerHTML = `

                <div class="transaction-card">

                    <div>

                        <h4>Aucune transaction</h4>

                        <p>
                        Vos transactions apparaîtront ici.
                        </p>

                    </div>

                    <span>$0.00</span>

                </div>

                `;

                return;

            }


            const list = [];


            snapshot.forEach((item) => {

                const tx =
                    item.val();


                if (
                    tx.uid === user.uid
                ) {

                    list.unshift(tx);

                }

            });


            if (list.length === 0) {

                recentTransactions.innerHTML = `

                <div class="transaction-card">

                    <div>

                        <h4>Aucune transaction</h4>

                        <p>
                        Vos transactions apparaîtront ici.
                        </p>

                    </div>

                    <span>$0.00</span>

                </div>

                `;

                return;

            }


            list.forEach((tx) => {

                recentTransactions.innerHTML += `

                <div class="transaction-card">

                    <div>

                        <h4>
                        ${tx.type || "Transaction"}
                        </h4>

                        <p>
                        ${new Date(
                            tx.createdAt ||
                            Date.now()
                        ).toLocaleString("fr-FR")}
                        </p>

                    </div>

                    <span>

                    $${Number(
                        tx.amount || 0
                    ).toLocaleString(
                        "en-US",
                        {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        }
                    )}

                    </span>

                </div>

                `;

            });

        }

    );

}


// ======================================
// SYSTEME DE PARRAINAGE
// ======================================

function createReferral(data) {

    // ==================================
    // CODE DE PARRAINAGE
    // ==================================

    const code =
        String(
            data.referralCode || ""
        ).trim();


    if (referralCodeElement) {

        referralCodeElement.textContent =
            code ||
            "Aucun code de parrainage";

    }


    // ==================================
    // LIEN DE PARRAINAGE
    // ==================================

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


    // ==================================
    // UTILISATEURS INVITÉS
    // ==================================

    const count =
        Number(
            data.referralCount || 0
        );


    if (referralCountElement) {

        referralCountElement.textContent =
            count.toLocaleString(
                "fr-FR"
            );

    }


    // ==================================
    // GAINS DE PARRAINAGE
    // ==================================

    const earnings =
        Number(
            data.referralEarnings ??
            data.referralBonus ??
            0
        );


    if (referralEarningsElement) {

        referralEarningsElement.textContent =
            "$" +
            earnings.toLocaleString(
                "en-US",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            );

    }

}


// ======================================
// NOTIFICATIONS
// ======================================

function loadNotifications() {

    const notifyRef =
        ref(
            db,
            "announcements"
        );


    onValue(
        notifyRef,
        (snapshot) => {

            notificationList.innerHTML =
                "";


            if (!snapshot.exists()) {

                notificationList.innerHTML = `

                <div class="notification-card">

                    <h3>Bienvenue</h3>

                    <p>
                    Bienvenue sur Money Vault.
                    </p>

                </div>

                `;

                return;

            }


            snapshot.forEach((item) => {

                const data =
                    item.val();


                notificationList.innerHTML += `

                <div class="notification-card">

                    <h3>
                    ${data.title || "Notification"}
                    </h3>

                    <p>
                    ${data.message || ""}
                    </p>

                </div>

                `;

            });

        }

    );

}


// ======================================
// TOAST MESSAGE
// ======================================

function showToast(message) {

    let toast =
        document.querySelector(
            ".toast"
        );


    if (!toast) {

        toast =
            document.createElement(
                "div"
            );

        toast.className =
            "toast";

        document.body.appendChild(
            toast
        );

    }


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    setTimeout(() => {

        toast.classList.remove(
            "show"
        );

    }, 3000);

}


// ======================================
// COPY REFERRAL LINK
// MOBILE FIX
// ======================================

const copyReferralBtn =
    document.getElementById(
        "copyReferralBtn"
    );

const referralLinkInput =
    document.getElementById(
        "referralLink"
    );


copyReferralBtn?.addEventListener(
    "click",
    async () => {

        const link =
            referralLinkInput?.value?.trim();


        if (!link) {

            showToast(
                "Le lien de parrainage n'est pas encore prêt."
            );

            return;

        }


        // ==================================
        // CLIPBOARD API
        // ==================================

        try {

            if (
                navigator.clipboard &&
                window.isSecureContext
            ) {

                await navigator.clipboard.writeText(
                    link
                );


                showToast(
                    "Lien de parrainage copié !"
                );


                return;

            }

        } catch (error) {

            console.log(
                "Clipboard API échouée:",
                error
            );

        }


        // ==================================
        // MOBILE FALLBACK
        // ==================================

        try {

            const textarea =
                document.createElement(
                    "textarea"
                );


            textarea.value =
                link;


            textarea.style.position =
                "fixed";

            textarea.style.left =
                "-9999px";

            textarea.style.top =
                "0";

            textarea.style.opacity =
                "0";


            document.body.appendChild(
                textarea
            );


            textarea.focus();

            textarea.select();

            textarea.setSelectionRange(
                0,
                textarea.value.length
            );


            const copied =
                document.execCommand(
                    "copy"
                );


            document.body.removeChild(
                textarea
            );


            if (copied) {

                showToast(
                    "Lien de parrainage copié !"
                );

            } else {

                throw new Error(
                    "Échec de la copie"
                );

            }

        } catch (error) {

            console.error(
                "Échec de la copie:",
                error
            );


            if (referralLinkInput) {

                referralLinkInput.focus();

                referralLinkInput.select();

                referralLinkInput.setSelectionRange(
                    0,
                    referralLinkInput.value.length
                );

            }


            showToast(
                "Maintenez le lien et sélectionnez Copier."
            );

        }

    }
);


// ======================================
// SUPPORT
// ======================================

const supportBtn =
    document.querySelector(
        ".support-btn"
    );


supportBtn?.addEventListener(
    "click",
    (e) => {

        e.preventDefault();


        window.open(
            "https://wa.me/250788846187",
            "_blank"
        );

    }
);


// ======================================
// HIDE LOADING
// ======================================

window.addEventListener(
    "load",
    () => {

        setTimeout(() => {

            if (loadingScreen) {

                loadingScreen.style.display =
                    "none";

            }

        }, 1000);

    }
);


// ======================================
// GLOBAL ERROR HANDLER
// ======================================

window.addEventListener(
    "error",
    (event) => {

        console.error(
            event.error
        );


        if (loadingScreen) {

            loadingScreen.style.display =
                "none";

        }

    }
);


// ======================================
// GLOBAL COPY REFERRAL FUNCTION
// ======================================

window.copyReferralLink =
async function () {

    const input =
        document.getElementById(
            "referralLink"
        );


    if (!input) {

        alert(
            "Champ du lien de parrainage introuvable."
        );

        return;

    }


    const link =
        input.value.trim();


    if (!link) {

        alert(
            "Le lien de parrainage est vide."
        );

        return;

    }


    console.log(
        "COPIE DU LIEN:",
        link
    );


    // ==================================
    // METHOD 1
    // ==================================

    try {

        await navigator.clipboard.writeText(
            link
        );


        alert(
            "Lien de parrainage copié avec succès !"
        );


        return;

    } catch (error) {

        console.log(
            "Clipboard API échouée:",
            error
        );

    }


    // ==================================
    // METHOD 2
    // ==================================

    try {

        const textarea =
            document.createElement(
                "textarea"
            );


        textarea.value =
            link;


        textarea.style.position =
            "fixed";

        textarea.style.left =
            "-9999px";

        textarea.style.top =
            "0";


        document.body.appendChild(
            textarea
        );


        textarea.focus();

        textarea.select();

        textarea.setSelectionRange(
            0,
            textarea.value.length
        );


        const success =
            document.execCommand(
                "copy"
            );


        document.body.removeChild(
            textarea
        );


        if (success) {

            alert(
                "Lien de parrainage copié avec succès !"
            );

            return;

        }

    } catch (error) {

        console.error(
            "Erreur de copie:",
            error
        );

    }


    // ==================================
    // FINAL MOBILE OPTION
    // ==================================

    input.focus();

    input.select();

    input.setSelectionRange(
        0,
        input.value.length
    );


    alert(
        "Lien sélectionné. Maintenez-le et choisissez Copier."
    );

};


// ======================================
// READY
// ======================================

console.log(
    "=================================="
);

console.log(
    " Money Vault Dashboard - Français "
);

console.log(
    " Firebase Connecté "
);

console.log(
    " Authentification Prête "
);

console.log(
    " Base de données en temps réel Prête "
);

console.log(
    " Dashboard Chargé avec succès "
);

console.log(
    " Devise: USD ($) "
);

console.log(
    " Pays: RDC "
);

console.log(
    "=================================="
);

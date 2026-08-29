// ======================================
// DEPOSIT.JS - VERSION FRANÇAISE
// MONEY VAULT PRO - USD
// MINIMUM: $1
// MAXIMUM: $10,000
// ======================================

// ======================================
// IMPORTS
// ======================================

import { auth, db } from "./firebase.js";

import {
onAuthStateChanged,
signOut
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {
ref,
push,
set,
get,
query,
orderByChild,
equalTo
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";

// ======================================
// ELEMENTS
// ======================================

const depositForm =
document.getElementById("depositForm");

const amount =
document.getElementById("amount");

const paymentMethod =
document.getElementById("paymentMethod");

const senderPhone =
document.getElementById("senderPhone");

const transactionId =
document.getElementById("transactionId");

const paymentDate =
document.getElementById("paymentDate");

const note =
document.getElementById("note");

const submitBtn =
document.getElementById("submitBtn");

const depositStatus =
document.getElementById("depositStatus");

const historyList =
document.getElementById("historyList");

const loadingScreen =
document.getElementById("loadingScreen");

const logoutBtn =
document.getElementById("logoutBtn");

const menuBtn =
document.getElementById("menuBtn");

const sidebar =
document.getElementById("sidebar");

// ======================================
// DEPOSIT LIMITS
// ======================================

const MIN_DEPOSIT = 1;

const MAX_DEPOSIT = 10000;

// ======================================
// CURRENT USER
// ======================================

let currentUser = null;

// ======================================
// AUTH CHECK
// ======================================

onAuthStateChanged(auth, async (user) => {

if (!user) {

    window.location.href =
        "login.html";

    return;

}

currentUser = user;

if (loadingScreen) {

    loadingScreen.style.display =
        "none";

}

await loadDepositHistory();

});

// ======================================
// SIDEBAR
// ======================================

menuBtn?.addEventListener(
"click",
() => {

    sidebar?.classList.toggle(
        "active"
    );

}

);

// ======================================
// COPY PAYMENT NUMBERS
// ======================================

const mtnNumber =
document.getElementById("mtnNumber");

const airtelNumber =
document.getElementById("airtelNumber");

const copyMTN =
document.getElementById("copyMTN");

const copyAirtel =
document.getElementById("copyAirtel");

copyMTN?.addEventListener(
"click",
async () => {

    try {

        await navigator.clipboard.writeText(
            mtnNumber.textContent.trim()
        );

        alert(
            "Numéro MTN copié avec succès."
        );

    } catch (error) {

        console.error(error);

        alert(
            "Impossible de copier le numéro MTN."
        );

    }

}

);

copyAirtel?.addEventListener(
"click",
async () => {

    try {

        await navigator.clipboard.writeText(
            airtelNumber.textContent.trim()
        );

        alert(
            "Numéro Airtel copié avec succès."
        );

    } catch (error) {

        console.error(error);

        alert(
            "Impossible de copier le numéro Airtel."
        );

    }

}

);

// ======================================
// LOGOUT
// ======================================

logoutBtn?.addEventListener(
"click",
async (e) => {

    e.preventDefault();

    const ok =
        confirm(
            "Voulez-vous vraiment vous déconnecter ?"
        );

    if (!ok) return;

    try {

        await signOut(auth);

        window.location.href =
            "login.html";

    } catch (error) {

        console.error(error);

        alert(
            error.message ||
            "La déconnexion a échoué."
        );

    }

}

);

// ======================================
// DEFAULT PAYMENT DATE
// ======================================

const now =
new Date();

const offset =
now.getTimezoneOffset();

const local =
new Date(
now.getTime() -
(offset * 60000)
);

if (paymentDate) {

paymentDate.value =
    local
        .toISOString()
        .slice(0, 16);

}

// ======================================
// SUBMIT DEPOSIT
// ======================================

depositForm?.addEventListener(
"submit",
async (e) => {

    e.preventDefault();


    // ==================================
    // CHECK USER
    // ==================================

    if (!currentUser) {

        alert(
            "Veuillez d'abord vous connecter."
        );

        return;

    }


    // ==================================
    // GET AMOUNT
    // ==================================

    const depositAmount =
        Number(amount.value);


    // ==================================
    // VALIDATE AMOUNT
    // ==================================

    if (
        !Number.isFinite(
            depositAmount
        )
    ) {

        alert(
            "Veuillez entrer un montant valide."
        );

        return;

    }


    if (
        depositAmount < MIN_DEPOSIT
    ) {

        alert(
            "Le dépôt minimum est de $1."
        );

        return;

    }


    if (
        depositAmount > MAX_DEPOSIT
    ) {

        alert(
            "Le dépôt maximum est de $10,000."
        );

        return;

    }


    // ==================================
    // DISABLE BUTTON
    // ==================================

    submitBtn.disabled = true;

    submitBtn.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin"></i> Envoi en cours...';


    try {


        // ==================================
        // GET TRANSACTION ID
        // ==================================

        const enteredTransactionId =
            transactionId.value.trim();


        if (!enteredTransactionId) {

            alert(
                "Veuillez entrer l'ID de transaction."
            );

            return;

        }


        // ======================================
        // GET USER'S OWN DEPOSITS ONLY
        // ======================================

        const userDepositsQuery =
            query(

                ref(
                    db,
                    "depositRequests"
                ),

                orderByChild("uid"),

                equalTo(
                    currentUser.uid
                )

            );


        const depositsSnapshot =
            await get(
                userDepositsQuery
            );


        // ======================================
        // CHECK DUPLICATE TRANSACTION ID
        // ======================================

        let transactionIdExists =
            false;


        if (
            depositsSnapshot.exists()
        ) {

            depositsSnapshot.forEach(
                (child) => {

                    const deposit =
                        child.val();


                    const existingId =
                        String(
                            deposit.transactionId ||
                            ""
                        )
                        .trim()
                        .toLowerCase();


                    const newId =
                        enteredTransactionId
                            .trim()
                            .toLowerCase();


                    if (
                        existingId &&
                        existingId === newId
                    ) {

                        transactionIdExists =
                            true;

                    }

                }
            );

        }


        // ======================================
        // DUPLICATE FOUND
        // ======================================

        if (
            transactionIdExists
        ) {

            alert(
                "Cet ID de transaction a déjà été utilisé. Veuillez entrer un nouvel ID de transaction."
            );

            return;

        }


        // ======================================
        // CREATE DEPOSIT DATA
        // ======================================

        const depositData = {

            uid:
                currentUser.uid,

            email:
                currentUser.email || "",

            // ==============================
            // USD AMOUNT
            // ==============================

            amount:
                depositAmount,

            currency:
                "USD",

            paymentMethod:
                paymentMethod.value,

            senderPhone:
                senderPhone.value.trim(),

            transactionId:
                enteredTransactionId,

            paymentDate:
                paymentDate.value,

            note:
                note.value.trim(),

            status:
                "pending",

            createdAt:
                Date.now()

        };


        // ======================================
        // CREATE NEW DEPOSIT
        // ======================================

        const depositRef =
            push(
                ref(
                    db,
                    "depositRequests"
                )
            );


        await set(
            depositRef,
            depositData
        );


        // ======================================
        // REFRESH PAGE
        // ======================================

        await refreshDepositPage();


        // ======================================
        // SUCCESS STATUS
        // ======================================

        if (depositStatus) {

            depositStatus.textContent =
                "En attente d'approbation";

            depositStatus.style.color =
                "#f59e0b";

        }


        alert(
            "Votre demande de dépôt a été envoyée avec succès."
        );


        // ======================================
        // RESET FORM
        // ======================================

        depositForm.reset();


        // Restore payment date

        if (paymentDate) {

            const resetNow =
                new Date();

            const resetOffset =
                resetNow.getTimezoneOffset();

            const resetLocal =
                new Date(
                    resetNow.getTime() -
                    (
                        resetOffset *
                        60000
                    )
                );

            paymentDate.value =
                resetLocal
                    .toISOString()
                    .slice(0, 16);

        }


    } catch (error) {

        console.error(
            "ERREUR ENVOI DÉPÔT:",
            error
        );


        if (
            error?.code ===
            "PERMISSION_DENIED"
        ) {

            alert(
                "Permission refusée. Vérifiez les règles de votre base de données Firebase."
            );

        } else {

            alert(
                error.message ||
                "Impossible d'envoyer la demande de dépôt."
            );

        }

    } finally {

        submitBtn.disabled =
            false;

        submitBtn.innerHTML =
            '<i class="fa-solid fa-paper-plane"></i> Soumettre la demande de dépôt';

    }

}

);

// ======================================
// LOAD DEPOSIT HISTORY
// ======================================

async function loadDepositHistory() {

if (!currentUser) return;


try {


    // ======================================
    // GET CURRENT USER DEPOSITS ONLY
    // ======================================

    const userDepositsQuery =
        query(

            ref(
                db,
                "depositRequests"
            ),

            orderByChild("uid"),

            equalTo(
                currentUser.uid
            )

        );


    const snapshot =
        await get(
            userDepositsQuery
        );


    if (historyList) {

        historyList.innerHTML =
            "";

    }


    // ======================================
    // NO DEPOSITS
    // ======================================

    if (!snapshot.exists()) {

        historyList.innerHTML = `

            <div class="empty-history">

                <i class="fa-solid fa-wallet"></i>

                <h3>Aucun historique de dépôt</h3>

                <p>
                    Vos dépôts apparaîtront ici.
                </p>

            </div>

        `;

        return;

    }


    let found =
        false;


    // ======================================
    // DISPLAY USER'S DEPOSITS
    // ======================================

    snapshot.forEach(
        (child) => {

            const deposit =
                child.val();


            // Extra security check

            if (
                deposit.uid !==
                currentUser.uid
            ) {

                return;

            }


            found =
                true;


            const safeAmount =
                Number(
                    deposit.amount || 0
                )
                .toLocaleString(
                    "en-US",
                    {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }
                );


            historyList.innerHTML += `

                <div class="history-card">

                    <div class="history-info">

                        <h3>
                            $${safeAmount}
                        </h3>

                        <p>
                            <strong>Méthode :</strong>
                            ${deposit.paymentMethod || "-"}
                        </p>

                        <p>
                            <strong>Téléphone :</strong>
                            ${deposit.senderPhone || "-"}
                        </p>

                        <p>
                            <strong>ID de transaction :</strong>
                            ${deposit.transactionId || "-"}
                        </p>

                        <p>
                            <strong>Date :</strong>
                            ${deposit.paymentDate || "-"}
                        </p>

                    </div>

                    <span class="status ${deposit.status || "pending"}">

                        ${formatStatus(
                            deposit.status
                        )}

                    </span>

                </div>

            `;

        }
    );


    // ======================================
    // NOTHING FOUND
    // ======================================

    if (!found) {

        historyList.innerHTML = `

            <div class="empty-history">

                <i class="fa-solid fa-wallet"></i>

                <h3>Aucun historique de dépôt</h3>

                <p>
                    Vous n'avez encore soumis aucun dépôt.
                </p>

            </div>

        `;

    }


} catch (error) {

    console.error(
        "ERREUR HISTORIQUE DÉPÔT:",
        error
    );


    if (
        error?.code ===
        "PERMISSION_DENIED"
    ) {

        historyList.innerHTML = `

            <div class="empty-history">

                <i class="fa-solid fa-lock"></i>

                <h3>Permission refusée</h3>

                <p>
                    Impossible de charger l'historique des dépôts.
                </p>

            </div>

        `;

    }

}

}

// ======================================
// REFRESH AFTER SUBMIT
// ======================================

async function refreshDepositPage() {

if (depositStatus) {

    depositStatus.textContent =
        "En attente d'approbation";

    depositStatus.style.color =
        "#f59e0b";

}


await loadDepositHistory();

}

// ======================================
// FORMAT STATUS
// ======================================

function formatStatus(status) {

if (!status) {

    return "En attente";

}


switch (
    String(status).toLowerCase()
) {

    case "approved":

        return "Approuvé";


    case "rejected":

        return "Rejeté";


    case "pending":

        return "En attente";


    default:

        return "En attente";

}

}

// ======================================
// FORMAT DATE
// ======================================

function formatDate(timestamp) {

if (!timestamp) {

    return "-";

}


return new Date(timestamp)
    .toLocaleString(
        "fr-FR"
    );

}

// ======================================
// READY
// ======================================

console.log(
"=================================="
);

console.log(
" Money Vault Deposit - Français "
);

console.log(
" Devise: USD ($) "
);

console.log(
" Minimum: $1 "
);

console.log(
" Maximum: $10,000 "
);

console.log(
" Firebase connecté "
);

console.log(
" Système de dépôt prêt "
);

console.log(
"=================================="
);

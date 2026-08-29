// ======================================
// DEPOSIT.JS - VERSION FRANÇAISE
// MONEY VAULT PRO - USD
// MINIMUM : 1$
// MAXIMUM : 10$
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
// CONFIGURATION
// ======================================

const MIN_DEPOSIT = 1;
const MAX_DEPOSIT = 10;


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
// NUMÉROS DE PAIEMENT
// ======================================

const mtnNumber =
    document.getElementById("mtnNumber");

const airtelNumber =
    document.getElementById("airtelNumber");

const copyMTN =
    document.getElementById("copyMTN");

const copyAirtel =
    document.getElementById("copyAirtel");


// ======================================
// UTILISATEUR ACTUEL
// ======================================

let currentUser = null;


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

        await loadDepositHistory();

    } catch (error) {

        console.error(
            "ERREUR CHARGEMENT INITIAL :",
            error
        );

    } finally {

        if (loadingScreen) {

            loadingScreen.style.display = "none";

        }

    }

});


// ======================================
// MENU LATÉRAL
// ======================================

menuBtn?.addEventListener("click", () => {

    sidebar?.classList.toggle("active");

});


// ======================================
// COPIER UN TEXTE
// ======================================

async function copyText(
    text,
    successMessage
) {

    if (!text) {

        alert(
            "Le numéro n'est pas disponible."
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
                text
            );

            alert(successMessage);

            return;

        }

    } catch (error) {

        console.log(
            "Échec de Clipboard API :",
            error
        );

    }


    // ==================================
    // SOLUTION MOBILE
    // ==================================

    try {

        const textarea =
            document.createElement(
                "textarea"
            );

        textarea.value = text;

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

        const copied =
            document.execCommand(
                "copy"
            );

        document.body.removeChild(
            textarea
        );

        if (copied) {

            alert(successMessage);

            return;

        }

    } catch (error) {

        console.error(
            "Échec de la copie mobile :",
            error
        );

    }

    alert(
        "La copie automatique a échoué. Veuillez copier le numéro manuellement."
    );

}


// ======================================
// COPIER NUMÉRO MTN
// ======================================

copyMTN?.addEventListener(
    "click",
    () => {

        const number =
            mtnNumber?.textContent?.trim();

        copyText(
            number,
            "Numéro MTN copié avec succès."
        );

    }
);


// ======================================
// COPIER NUMÉRO AIRTEL
// ======================================

copyAirtel?.addEventListener(
    "click",
    () => {

        const number =
            airtelNumber?.textContent?.trim();

        copyText(
            number,
            "Numéro Airtel copié avec succès."
        );

    }
);


// ======================================
// DÉCONNEXION
// ======================================

logoutBtn?.addEventListener(
    "click",
    async (e) => {

        e.preventDefault();

        const confirmation =
            confirm(
                "Voulez-vous vraiment vous déconnecter de Money Vault ?"
            );

        if (!confirmation) return;

        try {

            await signOut(auth);

            window.location.href =
                "login.html";

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

    }
);


// ======================================
// DATE ET HEURE PAR DÉFAUT
// ======================================

function setCurrentDateTime() {

    if (!paymentDate) return;

    const now =
        new Date();

    const offset =
        now.getTimezoneOffset();

    const local =
        new Date(
            now.getTime() -
            offset * 60000
        );

    paymentDate.value =
        local
            .toISOString()
            .slice(0, 16);

}

setCurrentDateTime();


// ======================================
// PROTECTION DU CHAMP MONTANT
// ======================================

amount?.addEventListener(
    "input",
    () => {

        const value =
            Number(
                amount.value
            );

        if (!Number.isFinite(value)) {

            return;

        }

        if (
            value >
            MAX_DEPOSIT
        ) {

            amount.value =
                MAX_DEPOSIT;

        }

    }
);


// ======================================
// ENVOYER UNE DEMANDE DE DÉPÔT
// ======================================

depositForm?.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();


        // ==================================
        // VÉRIFIER UTILISATEUR
        // ==================================

        if (!currentUser) {

            alert(
                "Veuillez vous connecter avant de faire un dépôt."
            );

            return;

        }


        // ==================================
        // MONTANT
        // ==================================

        const depositAmount =
            Number(
                amount?.value
            );


        // ==================================
        // VÉRIFICATION DU MONTANT
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
            depositAmount <
            MIN_DEPOSIT
        ) {

            alert(
                "Le dépôt minimum est de 1$."
            );

            return;

        }


        if (
            depositAmount >
            MAX_DEPOSIT
        ) {

            alert(
                "Le dépôt maximum est de 10$."
            );

            return;

        }


        // ==================================
        // MÉTHODE DE PAIEMENT
        // ==================================

        if (
            !paymentMethod?.value
        ) {

            alert(
                "Veuillez sélectionner une méthode de paiement."
            );

            return;

        }


        // ==================================
        // NUMÉRO DE TÉLÉPHONE
        // ==================================

        const phone =
            senderPhone?.value?.trim();


        if (!phone) {

            alert(
                "Veuillez entrer le numéro de téléphone utilisé pour le paiement."
            );

            return;

        }


        // ==================================
        // ID DE TRANSACTION
        // ==================================

        const enteredTransactionId =
            transactionId?.value?.trim();


        if (!enteredTransactionId) {

            alert(
                "Veuillez entrer l'identifiant de transaction."
            );

            return;

        }


        // ==================================
        // DATE DE PAIEMENT
        // ==================================

        if (!paymentDate?.value) {

            alert(
                "Veuillez sélectionner la date et l'heure du paiement."
            );

            return;

        }


        // ==================================
        // DÉSACTIVER LE BOUTON
        // ==================================

        if (submitBtn) {

            submitBtn.disabled =
                true;

            submitBtn.innerHTML =
                '<i class="fa-solid fa-spinner fa-spin"></i> Envoi en cours...';

        }


        try {


            // ==================================
            // RECHERCHER LES DÉPÔTS DE L'UTILISATEUR
            // ==================================

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


            // ==================================
            // VÉRIFIER ID DE TRANSACTION DUPLIQUÉ
            // ==================================

            let transactionIdExists =
                false;


            const newTransactionId =
                enteredTransactionId
                    .trim()
                    .toLowerCase();


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


                        if (
                            existingId &&
                            existingId ===
                            newTransactionId
                        ) {

                            transactionIdExists =
                                true;

                        }

                    }
                );

            }


            // ==================================
            // ID DÉJÀ UTILISÉ
            // ==================================

            if (
                transactionIdExists
            ) {

                alert(
                    "Cet identifiant de transaction a déjà été utilisé. Veuillez entrer un nouvel identifiant."
                );

                return;

            }


            // ==================================
            // DONNÉES DU DÉPÔT
            // ==================================

            const depositData = {

                uid:
                    currentUser.uid,

                email:
                    currentUser.email || "",

                amount:
                    Number(
                        depositAmount.toFixed(2)
                    ),

                currency:
                    "USD",

                paymentMethod:
                    paymentMethod.value,

                senderPhone:
                    phone,

                transactionId:
                    enteredTransactionId,

                paymentDate:
                    paymentDate.value,

                note:
                    note?.value?.trim() || "",

                status:
                    "pending",

                createdAt:
                    Date.now()

            };


            // ==================================
            // CRÉER RÉFÉRENCE DÉPÔT
            // ==================================

            const depositRef =
                push(
                    ref(
                        db,
                        "depositRequests"
                    )
                );


            // ==================================
            // ENREGISTRER LE DÉPÔT
            // ==================================

            await set(
                depositRef,
                depositData
            );


            // ==================================
            // METTRE À JOUR LE STATUT
            // ==================================

            if (depositStatus) {

                depositStatus.textContent =
                    "En attente d'approbation";

                depositStatus.style.color =
                    "#f59e0b";

            }


            // ==================================
            // ACTUALISER L'HISTORIQUE
            // ==================================

            await loadDepositHistory();


            // ==================================
            // MESSAGE DE SUCCÈS
            // ==================================

            alert(
                "Votre demande de dépôt a été envoyée avec succès. Veuillez attendre l'approbation de l'administrateur."
            );


            // ==================================
            // RÉINITIALISER FORMULAIRE
            // ==================================

            depositForm.reset();

            setCurrentDateTime();


        } catch (error) {

            console.error(
                "ERREUR ENVOI DÉPÔT :",
                error
            );


            if (
                error?.code ===
                "PERMISSION_DENIED"
            ) {

                alert(
                    "Permission refusée. Veuillez vérifier les règles de votre base de données Firebase."
                );

            } else {

                alert(
                    error?.message ||
                    "Impossible d'envoyer la demande de dépôt."
                );

            }

        } finally {

            // ==================================
            // RÉACTIVER BOUTON
            // ==================================

            if (submitBtn) {

                submitBtn.disabled =
                    false;

                submitBtn.innerHTML =
                    '<i class="fa-solid fa-paper-plane"></i> Envoyer la demande de dépôt';

            }

        }

    }
);


// ======================================
// CHARGER HISTORIQUE DES DÉPÔTS
// ======================================

async function loadDepositHistory() {

    if (!currentUser) return;


    try {


        // ==================================
        // REQUÊTE UTILISATEUR UNIQUEMENT
        // ==================================

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


        if (!historyList) return;


        historyList.innerHTML =
            "";


        // ==================================
        // AUCUN HISTORIQUE
        // ==================================

        if (
            !snapshot.exists()
        ) {

            historyList.innerHTML = `

                <div class="empty-history">

                    <i class="fa-solid fa-clock-rotate-left"></i>

                    <h3>Aucun historique de dépôt</h3>

                    <p>
                        Vos dépôts apparaîtront ici.
                    </p>

                </div>

            `;

            if (depositStatus) {

                depositStatus.textContent =
                    "Aucune demande de dépôt";

            }

            return;

        }


        const deposits = [];


        // ==================================
        // RÉCUPÉRER LES DÉPÔTS
        // ==================================

        snapshot.forEach(
            (child) => {

                const deposit =
                    child.val();


                if (
                    deposit?.uid !==
                    currentUser.uid
                ) {

                    return;

                }


                deposits.push({

                    id:
                        child.key,

                    ...deposit

                });

            }
        );


        // ==================================
        // PLUS RÉCENT EN PREMIER
        // ==================================

        deposits.sort(
            (a, b) =>
                Number(
                    b.createdAt || 0
                ) -
                Number(
                    a.createdAt || 0
                )
        );


        // ==================================
        // STATUT ACTUEL
        // ==================================

        if (
            deposits.length > 0 &&
            depositStatus
        ) {

            const latest =
                deposits[0];

            depositStatus.textContent =
                formatStatus(
                    latest.status
                );

            applyStatusColor(
                latest.status
            );

        }


        // ==================================
        // AFFICHER HISTORIQUE
        // ==================================

        deposits.forEach(
            (deposit) => {

                const safeAmount =
                    formatUSD(
                        deposit.amount
                    );


                const status =
                    String(
                        deposit.status ||
                        "pending"
                    )
                    .toLowerCase();


                const historyCard =
                    document.createElement(
                        "div"
                    );

                historyCard.className =
                    "history-card";


                historyCard.innerHTML = `

                    <div class="history-info">

                        <h3>
                            ${safeAmount}
                        </h3>

                        <p>
                            <strong>Méthode :</strong>
                            ${escapeHTML(
                                deposit.paymentMethod ||
                                "-"
                            )}
                        </p>

                        <p>
                            <strong>Téléphone :</strong>
                            ${escapeHTML(
                                deposit.senderPhone ||
                                "-"
                            )}
                        </p>

                        <p>
                            <strong>ID de transaction :</strong>
                            ${escapeHTML(
                                deposit.transactionId ||
                                "-"
                            )}
                        </p>

                        <p>
                            <strong>Date du paiement :</strong>
                            ${escapeHTML(
                                deposit.paymentDate ||
                                "-"
                            )}
                        </p>

                        <p>
                            <strong>Envoyé le :</strong>
                            ${formatDate(
                                deposit.createdAt
                            )}
                        </p>

                    </div>

                    <span class="status ${escapeHTML(status)}">

                        ${formatStatus(status)}

                    </span>

                `;


                historyList.appendChild(
                    historyCard
                );

            }
        );


    } catch (error) {

        console.error(
            "ERREUR HISTORIQUE DÉPÔT :",
            error
        );


        if (!historyList) return;


        if (
            error?.code ===
            "PERMISSION_DENIED"
        ) {

            historyList.innerHTML = `

                <div class="empty-history">

                    <i class="fa-solid fa-lock"></i>

                    <h3>Permission refusée</h3>

                    <p>
                        Impossible de charger votre historique de dépôts.
                    </p>

                </div>

            `;

        } else {

            historyList.innerHTML = `

                <div class="empty-history">

                    <i class="fa-solid fa-triangle-exclamation"></i>

                    <h3>Erreur de chargement</h3>

                    <p>
                        Impossible de charger votre historique. Veuillez réessayer plus tard.
                    </p>

                </div>

            `;

        }

    }

}


// ======================================
// FORMAT USD
// ======================================

function formatUSD(value) {

    const number =
        Number(value || 0);


    return "$" +
        number.toLocaleString(
            "en-US",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );

}


// ======================================
// FORMAT STATUT
// ======================================

function formatStatus(status) {

    switch (
        String(
            status || "pending"
        ).toLowerCase()
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
// COULEUR DU STATUT
// ======================================

function applyStatusColor(status) {

    if (!depositStatus) return;


    switch (
        String(
            status || "pending"
        ).toLowerCase()
    ) {

        case "approved":

            depositStatus.style.color =
                "#16a34a";

            break;


        case "rejected":

            depositStatus.style.color =
                "#dc2626";

            break;


        case "pending":

        default:

            depositStatus.style.color =
                "#f59e0b";

            break;

    }

}


// ======================================
// FORMAT DATE
// ======================================

function formatDate(timestamp) {

    if (!timestamp) {

        return "-";

    }


    const date =
        new Date(timestamp);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "-";

    }


    return date.toLocaleString(
        "fr-FR"
    );

}


// ======================================
// PROTECTION HTML
// ======================================

function escapeHTML(value) {

    return String(value ?? "")
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


// ======================================
// READY
// ======================================

console.log(
    "=================================="
);

console.log(
    " Money Vault - Système de dépôt"
);

console.log(
    " Langue : Français"
);

console.log(
    " Devise : USD ($)"
);

console.log(
    " Dépôt minimum : 1$"
);

console.log(
    " Dépôt maximum : 10$"
);

console.log(
    " Firebase connecté"
);

console.log(
    " Protection contre les doublons"
);

console.log(
    " Requête limitée à l'utilisateur"
);

console.log(
    "=================================="
);

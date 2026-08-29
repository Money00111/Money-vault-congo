// ======================================
// WITHDRAW.JS
// Money Vault
// USD VERSION
// Minimum: $10
// Maximum: $1,000
// Withdraw Fee: 5%
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
    get,
    push,
    set,
    onValue
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";


// ======================================
// CONFIGURATION
// ======================================

const MIN_WITHDRAW = 10;
const MAX_WITHDRAW = 1000;
const WITHDRAW_FEE_RATE = 0.05;


// ======================================
// HTML ELEMENTS
// ======================================

const menuBtn =
    document.getElementById("menuBtn");

const sidebar =
    document.getElementById("sidebar");

const logoutBtn =
    document.getElementById("logoutBtn");

const loadingScreen =
    document.getElementById("loadingScreen");

const withdrawForm =
    document.getElementById("withdrawForm");

const availableBalance =
    document.getElementById("availableBalance");

const vipStatus =
    document.getElementById("vipStatus");

const withdrawAmount =
    document.getElementById("withdrawAmount");

const paymentMethod =
    document.getElementById("paymentMethod");

const receiverPhone =
    document.getElementById("receiverPhone");

const accountName =
    document.getElementById("accountName");

const withdrawReason =
    document.getElementById("withdrawReason");

const confirmWithdraw =
    document.getElementById("confirmWithdraw");

const submitBtn =
    document.querySelector(".submit-btn");


// ======================================
// CALCULATOR ELEMENTS
// ======================================

const enteredAmount =
    document.getElementById("enteredAmount");

const withdrawFee =
    document.getElementById("withdrawFee");

const receiveAmount =
    document.getElementById("receiveAmount");

const summaryAmount =
    document.getElementById("summaryAmount");

const summaryFee =
    document.getElementById("summaryFee");

const summaryReceive =
    document.getElementById("summaryReceive");


// ======================================
// STATUS / HISTORY
// ======================================

const historyList =
    document.getElementById("historyList");

const withdrawStatus =
    document.getElementById("withdrawStatus");


// ======================================
// CURRENT USER
// ======================================

let currentUser = null;

let userBalance = 0;

let withdrawHistory = {};


// ======================================
// USD FORMATTER
// ======================================

function formatUSD(value) {

    const number =
        Number(value || 0);

    return "$" +
        number.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

}


// ======================================
// AUTHENTICATION
// ======================================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href =
            "login.html";

        return;

    }

    currentUser = user;

    try {

        await loadUserData();

        startBalanceListener();

        loadWithdrawHistory();

    } catch (error) {

        console.error(
            "AUTH / LOAD ERROR:",
            error
        );

    } finally {

        if (loadingScreen) {

            loadingScreen.style.display =
                "none";

        }

    }

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
// LOGOUT
// ======================================

logoutBtn?.addEventListener(
    "click",
    async (e) => {

        e.preventDefault();

        const ok =
            confirm(
                "Voulez-vous vraiment vous déconnecter de Money Vault ?"
            );

        if (!ok) return;

        try {

            await signOut(auth);

            window.location.href =
                "login.html";

        } catch (error) {

            console.error(
                "LOGOUT ERROR:",
                error
            );

            alert(
                error.message ||
                "La déconnexion a échoué."
            );

        }

    }
);


// ======================================
// LOAD USER DATA
// ======================================

async function loadUserData() {

    if (!currentUser) return;

    try {

        const userRef =
            ref(
                db,
                "users/" +
                currentUser.uid
            );

        const snapshot =
            await get(userRef);

        if (!snapshot.exists()) {

            userBalance = 0;

            if (availableBalance) {

                availableBalance.textContent =
                    formatUSD(0);

            }

            if (vipStatus) {

                vipStatus.textContent =
                    "VIP 0";

            }

            return;

        }

        const user =
            snapshot.val();

        userBalance =
            Number(
                user.balance || 0
            );

        if (availableBalance) {

            availableBalance.textContent =
                formatUSD(userBalance);

        }

        if (vipStatus) {

            vipStatus.textContent =
                user.vipPlan ||
                user.vip ||
                "VIP 0";

        }

        updateWithdrawCalculator();

    } catch (error) {

        console.error(
            "LOAD USER ERROR:",
            error
        );

        alert(
            "Impossible de charger les informations du compte."
        );

    }

}


// ======================================
// LIVE BALANCE LISTENER
// ======================================

function startBalanceListener() {

    if (!currentUser) return;

    const userRef =
        ref(
            db,
            "users/" +
            currentUser.uid
        );

    onValue(
        userRef,
        (snapshot) => {

            if (!snapshot.exists()) return;

            const user =
                snapshot.val();

            userBalance =
                Number(
                    user.balance || 0
                );

            if (availableBalance) {

                availableBalance.textContent =
                    formatUSD(userBalance);

            }

            if (vipStatus) {

                vipStatus.textContent =
                    user.vipPlan ||
                    user.vip ||
                    "VIP 0";

            }

            updateWithdrawCalculator();

        },
        (error) => {

            console.error(
                "BALANCE LISTENER ERROR:",
                error
            );

        }
    );

}


// ======================================
// WITHDRAW CALCULATOR
// ======================================

function updateWithdrawCalculator() {

    const amount =
        Number(
            withdrawAmount?.value || 0
        );

    const fee =
        Math.round(
            amount *
            WITHDRAW_FEE_RATE *
            100
        ) / 100;

    const receive =
        Math.max(
            0,
            amount - fee
        );


    if (enteredAmount) {

        enteredAmount.textContent =
            formatUSD(amount);

    }

    if (withdrawFee) {

        withdrawFee.textContent =
            formatUSD(fee);

    }

    if (receiveAmount) {

        receiveAmount.textContent =
            formatUSD(receive);

    }

    if (summaryAmount) {

        summaryAmount.textContent =
            formatUSD(amount);

    }

    if (summaryFee) {

        summaryFee.textContent =
            formatUSD(fee);

    }

    if (summaryReceive) {

        summaryReceive.textContent =
            formatUSD(receive);

    }


    // ==================================
    // VALIDATION
    // ==================================

    if (!submitBtn) return;

    if (amount <= 0) {

        submitBtn.disabled = true;

        return;

    }

    if (amount < MIN_WITHDRAW) {

        submitBtn.disabled = true;

        return;

    }

    if (amount > MAX_WITHDRAW) {

        submitBtn.disabled = true;

        return;

    }

    if (amount > userBalance) {

        submitBtn.disabled = true;

        return;

    }

    submitBtn.disabled = false;

}


// ======================================
// LIVE AMOUNT INPUT
// ======================================

withdrawAmount?.addEventListener(
    "input",
    () => {

        updateWithdrawCalculator();

    }
);


// ======================================
// RESET CALCULATOR
// ======================================

function resetCalculator() {

    if (withdrawAmount) {

        withdrawAmount.value = "";

    }

    if (enteredAmount) {

        enteredAmount.textContent =
            formatUSD(0);

    }

    if (withdrawFee) {

        withdrawFee.textContent =
            formatUSD(0);

    }

    if (receiveAmount) {

        receiveAmount.textContent =
            formatUSD(0);

    }

    if (summaryAmount) {

        summaryAmount.textContent =
            formatUSD(0);

    }

    if (summaryFee) {

        summaryFee.textContent =
            formatUSD(0);

    }

    if (summaryReceive) {

        summaryReceive.textContent =
            formatUSD(0);

    }

    if (submitBtn) {

        submitBtn.disabled = true;

    }

}


// ======================================
// SUBMIT WITHDRAW REQUEST
// ======================================

withdrawForm?.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();


        // ==================================
        // CHECK USER
        // ==================================

        if (!currentUser) {

            alert(
                "Veuillez vous connecter avant de demander un retrait."
            );

            return;

        }


        // ==================================
        // CONFIRMATION
        // ==================================

        if (
            !confirmWithdraw?.checked
        ) {

            alert(
                "Veuillez confirmer que les informations sont correctes."
            );

            return;

        }


        // ==================================
        // AMOUNT
        // ==================================

        const amount =
            Number(
                withdrawAmount?.value
            );


        if (!Number.isFinite(amount)) {

            alert(
                "Veuillez entrer un montant valide."
            );

            return;

        }


        // ==================================
        // MINIMUM
        // ==================================

        if (
            amount <
            MIN_WITHDRAW
        ) {

            alert(
                "Le retrait minimum est de $10."
            );

            return;

        }


        // ==================================
        // MAXIMUM
        // ==================================

        if (
            amount >
            MAX_WITHDRAW
        ) {

            alert(
                "Le retrait maximum est de $1,000."
            );

            return;

        }


        // ==================================
        // BALANCE
        // ==================================

        if (
            amount >
            userBalance
        ) {

            alert(
                "Solde insuffisant."
            );

            return;

        }


        // ==================================
        // PAYMENT METHOD
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
        // PHONE
        // ==================================

        const phone =
            receiverPhone?.value?.trim();

        if (!phone) {

            alert(
                "Veuillez entrer le numéro de téléphone du destinataire."
            );

            return;

        }


        // ==================================
        // ACCOUNT NAME
        // ==================================

        const receiverName =
            accountName?.value?.trim();

        if (!receiverName) {

            alert(
                "Veuillez entrer le nom du titulaire du compte."
            );

            return;

        }


        // ==================================
        // FEE
        // ==================================

        const fee =
            Math.round(
                amount *
                WITHDRAW_FEE_RATE *
                100
            ) / 100;


        const receive =
            Math.round(
                (amount - fee) *
                100
            ) / 100;


        // ==================================
        // DISABLE BUTTON
        // ==================================

        if (submitBtn) {

            submitBtn.disabled = true;

            submitBtn.innerHTML =
                '<i class="fa-solid fa-spinner fa-spin"></i> Traitement...';

        }


        try {

            // ==================================
            // RECHECK USER BALANCE
            // ==================================

            const userRef =
                ref(
                    db,
                    "users/" +
                    currentUser.uid
                );

            const latestSnapshot =
                await get(userRef);

            if (
                !latestSnapshot.exists()
            ) {

                throw new Error(
                    "Compte utilisateur introuvable."
                );

            }

            const latestUser =
                latestSnapshot.val();

            const latestBalance =
                Number(
                    latestUser.balance || 0
                );


            // ==================================
            // IMPORTANT BALANCE CHECK
            // ==================================

            if (
                amount >
                latestBalance
            ) {

                alert(
                    "Solde insuffisant. Votre solde actuel est " +
                    formatUSD(latestBalance) +
                    "."
                );

                userBalance =
                    latestBalance;

                updateWithdrawCalculator();

                return;

            }


            // ==================================
            // WITHDRAW DATA
            // ==================================

            const withdrawData = {

                uid:
                    currentUser.uid,

                email:
                    currentUser.email || "",

                amount:
                    Number(
                        amount.toFixed(2)
                    ),

                currency:
                    "USD",

                fee:
                    Number(
                        fee.toFixed(2)
                    ),

                receive:
                    Number(
                        receive.toFixed(2)
                    ),

                paymentMethod:
                    paymentMethod.value,

                phone:
                    phone,

                accountName:
                    receiverName,

                reason:
                    withdrawReason?.value?.trim() || "",

                status:
                    "pending",

                createdAt:
                    Date.now()

            };


            // ==================================
            // CREATE REQUEST
            // ==================================

            const withdrawRef =
                push(
                    ref(
                        db,
                        "withdrawRequests"
                    )
                );


            await set(
                withdrawRef,
                withdrawData
            );


            // ==================================
            // SUCCESS
            // ==================================

            alert(
                "Votre demande de retrait a été envoyée avec succès. Elle est maintenant en attente d'approbation."
            );


            // ==================================
            // RESET FORM
            // ==================================

            withdrawForm.reset();

            resetCalculator();


            // ==================================
            // STATUS
            // ==================================

            if (withdrawStatus) {

                withdrawStatus.textContent =
                    "En attente d'approbation";

                withdrawStatus.classList.remove(
                    "pending",
                    "approved",
                    "rejected"
                );

                withdrawStatus.classList.add(
                    "pending"
                );

            }


            // ==================================
            // REFRESH
            // ==================================

            await loadUserData();

        } catch (error) {

            console.error(
                "WITHDRAW SUBMIT ERROR:",
                error
            );

            if (
                error?.code ===
                "PERMISSION_DENIED"
            ) {

                alert(
                    "Permission refusée. Vérifiez les règles Firebase."
                );

            } else {

                alert(
                    error?.message ||
                    "Impossible d'envoyer la demande de retrait."
                );

            }

        } finally {

            if (submitBtn) {

                submitBtn.innerHTML =
                    '<i class="fa-solid fa-paper-plane"></i> Submit Withdraw Request';

                updateWithdrawCalculator();

            }

        }

    }
);


// ======================================
// LOAD WITHDRAW HISTORY
// ======================================

function loadWithdrawHistory() {

    if (!currentUser) return;

    const withdrawRef =
        ref(
            db,
            "withdrawRequests"
        );


    onValue(
        withdrawRef,
        (snapshot) => {

            withdrawHistory = {};

            if (historyList) {

                historyList.innerHTML = "";

            }


            if (!snapshot.exists()) {

                if (historyList) {

                    historyList.innerHTML = `

                        <div class="history-card empty">

                            <i class="fa-solid fa-wallet"></i>

                            <h3>Aucun retrait</h3>

                            <p>
                                Vos demandes de retrait apparaîtront ici.
                            </p>

                        </div>

                    `;

                }

                if (withdrawStatus) {

                    withdrawStatus.textContent =
                        "Aucune demande de retrait";

                    withdrawStatus.className =
                        "status";

                }

                return;

            }


            snapshot.forEach(
                (child) => {

                    const id =
                        child.key;

                    const data =
                        child.val();


                    if (
                        data.uid !==
                        currentUser.uid
                    ) {

                        return;

                    }


                    withdrawHistory[id] =
                        data;

                }
            );


            renderWithdrawHistory(
                withdrawHistory
            );

            updateWithdrawStatus();

        },
        (error) => {

            console.error(
                "WITHDRAW HISTORY ERROR:",
                error
            );

            if (historyList) {

                historyList.innerHTML = `

                    <div class="history-card empty">

                        <i class="fa-solid fa-lock"></i>

                        <h3>Erreur de chargement</h3>

                        <p>
                            Impossible de charger l'historique.
                        </p>

                    </div>

                `;

            }

        }
    );

}


// ======================================
// RENDER HISTORY
// ======================================

function renderWithdrawHistory(data) {

    if (!historyList) return;

    historyList.innerHTML = "";


    const requests =
        Object.entries(data);


    if (requests.length === 0) {

        historyList.innerHTML = `

            <div class="history-card empty">

                <i class="fa-solid fa-money-bill-transfer"></i>

                <h3>Aucun historique de retrait</h3>

                <p>
                    Vous n'avez encore soumis aucune demande.
                </p>

            </div>

        `;

        return;

    }


    // ==================================
    // NEWEST FIRST
    // ==================================

    requests.sort(
        (a, b) => {

            return (
                Number(
                    b[1].createdAt || 0
                ) -
                Number(
                    a[1].createdAt || 0
                )
            );

        }
    );


    requests.forEach(
        ([id, withdraw]) => {

            const status =
                String(
                    withdraw.status ||
                    "pending"
                ).toLowerCase();


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "history-card";


            card.innerHTML = `

                <div class="history-info">

                    <h3>
                        ${formatUSD(
                            withdraw.amount
                        )}
                    </h3>

                    <p>
                        <strong>Vous recevez :</strong>
                        ${formatUSD(
                            withdraw.receive
                        )}
                    </p>

                    <p>
                        <strong>Frais :</strong>
                        ${formatUSD(
                            withdraw.fee
                        )}
                    </p>

                    <p>
                        <strong>Méthode :</strong>
                        ${escapeHTML(
                            withdraw.paymentMethod ||
                            "-"
                        )}
                    </p>

                    <p>
                        <strong>Téléphone :</strong>
                        ${escapeHTML(
                            withdraw.phone ||
                            "-"
                        )}
                    </p>

                    <p>
                        <strong>Nom du compte :</strong>
                        ${escapeHTML(
                            withdraw.accountName ||
                            "-"
                        )}
                    </p>

                    <p>
                        <strong>Motif :</strong>
                        ${escapeHTML(
                            withdraw.reason ||
                            "-"
                        )}
                    </p>

                    <p>
                        <strong>Date :</strong>
                        ${formatWithdrawDate(
                            withdraw.createdAt
                        )}
                    </p>

                </div>

                <span class="status ${escapeHTML(status)}">

                    ${formatWithdrawStatus(
                        status
                    )}

                </span>

            `;


            historyList.appendChild(
                card
            );

        }
    );

}


// ======================================
// UPDATE CURRENT STATUS
// ======================================

function updateWithdrawStatus() {

    if (!withdrawStatus) return;


    const requests =
        Object.values(
            withdrawHistory
        );


    if (
        requests.length === 0
    ) {

        withdrawStatus.textContent =
            "Aucune demande de retrait";

        withdrawStatus.className =
            "status";

        return;

    }


    requests.sort(
        (a, b) => {

            return (
                Number(
                    b.createdAt || 0
                ) -
                Number(
                    a.createdAt || 0
                )
            );

        }
    );


    const latest =
        requests[0];


    const status =
        String(
            latest.status ||
            "pending"
        ).toLowerCase();


    withdrawStatus.textContent =
        formatWithdrawStatus(
            status
        );


    withdrawStatus.classList.remove(
        "pending",
        "approved",
        "rejected"
    );


    withdrawStatus.classList.add(
        status
    );


    switch (status) {

        case "approved":

            withdrawStatus.style.color =
                "#16a34a";

            break;

        case "rejected":

            withdrawStatus.style.color =
                "#dc2626";

            break;

        default:

            withdrawStatus.style.color =
                "#f59e0b";

            break;

    }

}


// ======================================
// FORMAT STATUS
// ======================================

function formatWithdrawStatus(
    status
) {

    switch (
        String(
            status ||
            "pending"
        ).toLowerCase()
    ) {

        case "approved":

            return "Approuvé";

        case "rejected":

            return "Rejeté";

        case "pending":

        default:

            return "En attente";

    }

}


// ======================================
// FORMAT DATE
// ======================================

function formatWithdrawDate(
    timestamp
) {

    if (!timestamp) return "-";


    try {

        return new Date(
            timestamp
        ).toLocaleString(
            "fr-FR",
            {
                year: "numeric",
                month: "short",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    } catch (error) {

        return "-";

    }

}


// ======================================
// HTML ESCAPE
// ======================================

function escapeHTML(value) {

    return String(
        value ?? ""
    )
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
// INITIAL RESET
// ======================================

resetCalculator();


// ======================================
// READY
// ======================================

console.log(
    "=================================="
);

console.log(
    " Money Vault Withdraw System"
);

console.log(
    " Currency: USD"
);

console.log(
    " Minimum Withdraw: $10"
);

console.log(
    " Maximum Withdraw: $1,000"
);

console.log(
    " Withdraw Fee: 5%"
);

console.log(
    " Firebase Connected"
);

console.log(
    "=================================="
);

// ======================================
// TRANSACTIONS.JS
// MONEY VAULT PRO
// Langue : Français
// Devise : USD ($)
// Firebase Realtime Database
// ======================================

import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {
    ref,
    onValue,
    query,
    orderByChild,
    equalTo
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";


// ======================================
// ELEMENTS
// ======================================

const loadingScreen =
    document.getElementById("loadingScreen");

const transactionList =
    document.getElementById("transactionList");

const balanceElement =
    document.getElementById("balance");

const totalDepositElement =
    document.getElementById("totalDeposit");

const totalWithdrawElement =
    document.getElementById("totalWithdraw");

const bonusElement =
    document.getElementById("bonus");

const searchInput =
    document.getElementById("searchInput");

const filterButtons =
    document.querySelectorAll(".filter-btn");

const menuBtn =
    document.getElementById("menuBtn");

const sidebar =
    document.getElementById("sidebar");

const logoutBtn =
    document.getElementById("logoutBtn");


// ======================================
// VARIABLES
// ======================================

let allTransactions = [];

let currentFilter = "all";

let currentSearch = "";


// ======================================
// MENU
// ======================================

menuBtn?.addEventListener("click", () => {

    sidebar?.classList.toggle("active");

});


// ======================================
// LOGOUT
// ======================================

logoutBtn?.addEventListener("click", async (e) => {

    e.preventDefault();

    try {

        const {
            signOut
        } = await import(
            "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js"
        );

        if (
            !confirm(
                "Voulez-vous vraiment vous déconnecter ?"
            )
        ) {

            return;

        }

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

});


// ======================================
// AUTHENTIFICATION
// ======================================

onAuthStateChanged(
    auth,
    (user) => {

        if (!user) {

            window.location.href =
                "login.html";

            return;

        }

        loadUserData(user.uid);

        loadTransactions(user.uid);

    }
);


// ======================================
// LOAD USER DATA
// ======================================

function loadUserData(uid) {

    const userRef =
        ref(
            db,
            "users/" + uid
        );

    onValue(
        userRef,
        (snapshot) => {

            if (!snapshot.exists()) {

                return;

            }

            const user =
                snapshot.val();


            // ==================================
            // BALANCE
            // ==================================

            if (balanceElement) {

                balanceElement.textContent =
                    formatUSD(
                        user.balance
                    );

            }


            // ==================================
            // TOTAL DEPOSIT
            // ==================================

            if (totalDepositElement) {

                totalDepositElement.textContent =
                    formatUSD(
                        user.totalDeposit
                    );

            }


            // ==================================
            // TOTAL WITHDRAW
            // ==================================

            if (totalWithdrawElement) {

                totalWithdrawElement.textContent =
                    formatUSD(
                        user.totalWithdraw
                    );

            }


            // ==================================
            // BONUS
            // ==================================

            if (bonusElement) {

                bonusElement.textContent =
                    formatUSD(
                        user.bonus
                    );

            }

        },

        (error) => {

            console.error(
                "ERREUR USER DATA :",
                error
            );

        }
    );

}


// ======================================
// LOAD TRANSACTIONS
// ======================================

function loadTransactions(uid) {

    const txQuery =
        query(

            ref(
                db,
                "transactions"
            ),

            orderByChild("uid"),

            equalTo(uid)

        );


    onValue(

        txQuery,

        (snapshot) => {

            // ==================================
            // STOP LOADING
            // ==================================

            if (loadingScreen) {

                loadingScreen.style.display =
                    "none";

            }


            allTransactions = [];


            // ==================================
            // NO TRANSACTIONS
            // ==================================

            if (!snapshot.exists()) {

                renderTransactions();

                return;

            }


            // ==================================
            // READ TRANSACTIONS
            // ==================================

            snapshot.forEach(
                (item) => {

                    const tx =
                        item.val();


                    // SECURITY CHECK

                    if (
                        tx?.uid !== uid
                    ) {

                        return;

                    }


                    allTransactions.push({

                        id:
                            item.key,

                        ...tx

                    });

                }
            );


            // ==================================
            // NEWEST FIRST
            // ==================================

            allTransactions.sort(
                (a, b) => {

                    return Number(
                        b.createdAt || 0
                    ) -
                    Number(
                        a.createdAt || 0
                    );

                }
            );


            // ==================================
            // DISPLAY
            // ==================================

            renderTransactions();

        },

        (error) => {

            if (loadingScreen) {

                loadingScreen.style.display =
                    "none";

            }


            console.error(
                "TRANSACTIONS ERROR :",
                error
            );


            if (transactionList) {

                transactionList.innerHTML = `

                    <div class="empty">

                        <i class="fa-solid fa-triangle-exclamation"></i>

                        <h3>
                            Impossible de charger les transactions
                        </h3>

                        <p>
                            Une erreur s'est produite lors du chargement.
                        </p>

                    </div>

                `;

            }

        }

    );

}


// ======================================
// RENDER TRANSACTIONS
// ======================================

function renderTransactions() {

    if (!transactionList) {

        return;

    }


    transactionList.innerHTML = "";


    // ==================================
    // FILTER
    // ==================================

    let filtered =
        [...allTransactions];


    // ==================================
    // TYPE FILTER
    // ==================================

    if (
        currentFilter !==
        "all"
    ) {

        filtered =
            filtered.filter(
                (tx) => {

                    const type =
                        normalizeType(
                            tx.type
                        );

                    return (
                        type ===
                        currentFilter
                    );

                }
            );

    }


    // ==================================
    // SEARCH FILTER
    // ==================================

    if (currentSearch) {

        filtered =
            filtered.filter(
                (tx) => {

                    const text = (

                        String(
                            tx.type || ""
                        ) +

                        " " +

                        String(
                            tx.paymentMethod ||
                            tx.method ||
                            ""
                        ) +

                        " " +

                        String(
                            tx.status ||
                            ""
                        ) +

                        " " +

                        String(
                            tx.transactionId ||
                            ""
                        )

                    ).toLowerCase();


                    return text.includes(
                        currentSearch
                    );

                }
            );

    }


    // ==================================
    // EMPTY
    // ==================================

    if (
        filtered.length === 0
    ) {

        transactionList.innerHTML = `

            <div class="empty">

                <i class="fa-solid fa-receipt"></i>

                <h3>
                    Aucune transaction
                </h3>

                <p>
                    Aucune transaction ne correspond à votre recherche.
                </p>

            </div>

        `;

        return;

    }


    // ==================================
    // DISPLAY
    // ==================================

    filtered.forEach(
        (tx) => {

            const type =
                normalizeType(
                    tx.type
                );


            const status =
                normalizeStatus(
                    tx.status
                );


            const method =
                tx.paymentMethod ||
                tx.method ||
                "-";


            const amount =
                Number(
                    tx.amount || 0
                );


            const date =
                formatDate(
                    tx.createdAt
                );


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "transaction-card";


            // ==================================
            // TYPE
            // ==================================

            let typeLabel =
                "Transaction";


            if (
                type ===
                "deposit"
            ) {

                typeLabel =
                    "Dépôt";

            }

            else if (
                type ===
                "withdraw"
            ) {

                typeLabel =
                    "Retrait";

            }

            else if (
                type ===
                "bonus"
            ) {

                typeLabel =
                    "Bonus";

            }


            // ==================================
            // ICON
            // ==================================

            let icon =
                "fa-receipt";


            if (
                type ===
                "deposit"
            ) {

                icon =
                    "fa-arrow-down";

            }

            else if (
                type ===
                "withdraw"
            ) {

                icon =
                    "fa-arrow-up";

            }

            else if (
                type ===
                "bonus"
            ) {

                icon =
                    "fa-gift";

            }


            // ==================================
            // CARD HTML
            // ==================================

            card.innerHTML = `

                <div class="left">

                    <div class="transaction-icon">

                        <i class="fa-solid ${icon}"></i>

                    </div>


                    <div>

                        <h3>
                            ${escapeHTML(
                                typeLabel
                            )}
                        </h3>

                        <p>
                            ${escapeHTML(
                                method
                            )}
                        </p>

                        <small>
                            ${escapeHTML(
                                date
                            )}
                        </small>

                    </div>

                </div>


                <div class="right">

                    <h2>
                        ${formatUSD(
                            amount
                        )}
                    </h2>

                    <span class="${status.className}">

                        ${status.label}

                    </span>

                </div>

            `;


            transactionList.appendChild(
                card
            );

        }
    );

}


// ======================================
// FILTER BUTTONS
// ======================================

filterButtons.forEach(
    (button) => {

        button.addEventListener(
            "click",
            () => {

                filterButtons.forEach(
                    (btn) => {

                        btn.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add(
                    "active"
                );


                currentFilter =
                    button.dataset.filter ||
                    "all";


                renderTransactions();

            }
        );

    }
);


// ======================================
// SEARCH
// ======================================

searchInput?.addEventListener(
    "input",
    () => {

        currentSearch =
            searchInput.value
                .trim()
                .toLowerCase();


        renderTransactions();

    }
);


// ======================================
// NORMALIZE TYPE
// ======================================

function normalizeType(type) {

    const value =
        String(
            type || ""
        )
        .toLowerCase()
        .trim();


    if (
        value.includes("deposit") ||
        value.includes("dépôt")
    ) {

        return "deposit";

    }


    if (
        value.includes("withdraw") ||
        value.includes("retrait")
    ) {

        return "withdraw";

    }


    if (
        value.includes("bonus") ||
        value.includes("referral")
    ) {

        return "bonus";

    }


    return value || "transaction";

}


// ======================================
// NORMALIZE STATUS
// ======================================

function normalizeStatus(status) {

    const value =
        String(
            status || "pending"
        )
        .toLowerCase()
        .trim();


    switch (value) {

        case "approved":

            return {

                className:
                    "approved",

                label:
                    "Approuvé"

            };


        case "rejected":

            return {

                className:
                    "rejected",

                label:
                    "Rejeté"

            };


        case "completed":

            return {

                className:
                    "approved",

                label:
                    "Terminé"

            };


        case "pending":

        default:

            return {

                className:
                    "pending",

                label:
                    "En attente"

            };

    }

}


// ======================================
// FORMAT USD
// ======================================

function formatUSD(value) {

    const number =
        Number(
            value || 0
        );


    if (
        !Number.isFinite(
            number
        )
    ) {

        return "$0.00";

    }


    return "$" +
        number.toLocaleString(
            "en-US",
            {
                minimumFractionDigits:
                    2,

                maximumFractionDigits:
                    2
            }
        );

}


// ======================================
// FORMAT DATE
// ======================================

function formatDate(timestamp) {

    if (!timestamp) {

        return "-";

    }


    const date =
        new Date(
            Number(timestamp)
        );


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
// ESCAPE HTML
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
// READY
// ======================================

console.log(
    "===================================="
);

console.log(
    " Money Vault Transactions"
);

console.log(
    " Langue : Français"
);

console.log(
    " Devise : USD ($)"
);

console.log(
    " Recherche activée"
);

console.log(
    " Filtres activés"
);

console.log(
    " Firebase connecté"
);

console.log(
    "===================================="
);

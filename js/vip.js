// ======================================
// VIP.JS
// Money Vault Pro VIP System
// French User Interface
// ======================================

import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {
    ref,
    onValue,
    get,
    push,
    set,
    update,
    runTransaction
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";


// ======================================
// DOM ELEMENTS
// ======================================

const loadingScreen = document.getElementById("loadingScreen");
const sidebar = document.getElementById("sidebar");
const menuBtn = document.getElementById("menuBtn");
const logoutBtn = document.getElementById("logoutBtn");

const balance = document.getElementById("balance");
const currentVip = document.getElementById("currentVip");
const dailyIncome = document.getElementById("dailyIncome");
const totalProfit = document.getElementById("totalProfit");

const ownedVipList = document.getElementById("ownedVipList");
const vipGrid = document.getElementById("vipGrid");


// ======================================
// VARIABLES
// ======================================

let currentUser = null;
let userData = {};
let vipPlans = {};


// ======================================
// SIDEBAR
// ======================================

menuBtn?.addEventListener("click", () => {

    sidebar.classList.toggle("active");

});


// ======================================
// LOGOUT
// ======================================

logoutBtn?.addEventListener("click", async () => {

    if (!confirm("Voulez-vous vous déconnecter ?")) return;

    await signOut(auth);

    location.href = "login.html";

});


// ======================================
// AUTH
// ======================================

onAuthStateChanged(auth, (user) => {

    if (!user) {

        location.href = "login.html";
        return;

    }

    currentUser = user;

    loadUserData();
    loadVipPackages();
    loadUserVipPlans();

});


// ======================================
// LOAD USER DATA
// ======================================

function loadUserData() {

    const userRef =
        ref(db, "users/" + currentUser.uid);

    onValue(userRef, (snapshot) => {

        if (loadingScreen) {

            loadingScreen.style.display = "none";

        }

        if (!snapshot.exists()) {

            console.log("User data not found");

            return;

        }

        userData = snapshot.val();

        vipPlans =
            userData.vipPlans || {};

        balance.textContent =
            Number(
                userData.balance || 0
            ).toLocaleString() + " RWF";

    });

}

console.log("VIP SYSTEM READY");


// ======================================
// GET VIP COLOR CLASS
// ======================================

function getVipColorClass(name, index) {

    const value =
        String(name || "")
        .toLowerCase()
        .trim();

    if (value.includes("bronze"))
        return "bronze";

    if (value.includes("starter"))
        return "starter";

    if (value.includes("silver"))
        return "silver";

    if (value.includes("gold"))
        return "gold";

    if (value.includes("platinum"))
        return "platinum";

    if (value.includes("diamond"))
        return "diamond";

    if (value.includes("premium"))
        return "premium";

    if (value.includes("elite"))
        return "elite";

    if (value.includes("royal"))
        return "royal";

    if (value.includes("ultimate"))
        return "ultimate";

    const colors = [
        "bronze",
        "starter",
        "silver",
        "gold",
        "platinum",
        "diamond",
        "premium",
        "elite",
        "royal",
        "ultimate"
    ];

    return colors[index] || "bronze";

}


// ======================================
// GET VIP NUMBER
// ======================================

function getVipNumber(vip, key) {

    const name =
        String(vip?.name || "").trim();

    let match =
        name.match(/vip\s*[-_#:]?\s*(\d+)/i);

    if (match) {

        return Number(match[1]);

    }

    const firebaseKey =
        String(key || "").trim();

    match =
        firebaseKey.match(/vip\s*[-_#:]?\s*(\d+)/i);

    if (match) {

        return Number(match[1]);

    }

    match =
        name.match(/\d+/);

    if (match) {

        return Number(match[0]);

    }

    return 999999;

}


// ======================================
// LOAD VIP PLANS
// ======================================

function loadVipPackages() {

    const vipRef =
        ref(db, "vipPlans");

    onValue(vipRef, (snapshot) => {

        if (!vipGrid) {

            console.log("vipGrid not found");

            return;

        }

        vipGrid.innerHTML = "";

        // ==================================
        // NO VIP PLANS
        // ==================================

        if (!snapshot.exists()) {

            vipGrid.innerHTML = `

                <div class="emptyVip">

                    Aucun plan VIP disponible

                </div>

            `;

            return;

        }

        // ==================================
        // GET ALL PLANS
        // ==================================

        const plans = [];

        snapshot.forEach((child) => {

            plans.push({

                key: child.key,

                data: child.val()

            });

        });

        // ==================================
        // SORT VIP
        // ==================================

        plans.sort((a, b) => {

            const numberA =
                getVipNumber(
                    a.data,
                    a.key
                );

            const numberB =
                getVipNumber(
                    b.data,
                    b.key
                );

            return numberA - numberB;

        });

        // ==================================
        // DISPLAY PLANS
        // ==================================

        plans.forEach((item, index) => {

            const vip =
                item.data;

            const name =
                vip.name || "Plan VIP";

            const price =
                Number(vip.price ?? 0);

            const dailyIncome =
                Number(vip.dailyIncome ?? 0);

            const duration =
                Number(vip.duration ?? 0);

            const totalProfit =
                vip.totalProfit != null
                ? Number(vip.totalProfit)
                : dailyIncome * duration;

            const colorClass =
                getVipColorClass(
                    name,
                    index
                );

            const card =
                document.createElement("div");

            card.className =
                "vip-card " +
                colorClass;

            card.innerHTML = `

                <div class="vip-badge">

                    ${name}

                </div>

                <i class="fas fa-gem vip-icon"></i>

                <h2>

                    ${name}

                </h2>

                <h1>

                    ${price.toLocaleString()} RWF

                </h1>

                <p>

                    Revenu quotidien :

                    <b>

                        ${dailyIncome.toLocaleString()} RWF

                    </b>

                </p>

                <p>

                    Durée :

                    <b>

                        ${duration} jours

                    </b>

                </p>

                <p>

                    Bénéfice total :

                    <b>

                        ${totalProfit.toLocaleString()} RWF

                    </b>

                </p>

                <button

                    class="buyVipBtn"

                    data-vip="${name}"

                    data-price="${price}"

                    data-daily="${dailyIncome}"

                    data-profit="${totalProfit}"

                    data-days="${duration}"

                >

                    <i class="fas fa-cart-shopping"></i>

                    Acheter

                </button>

            `;

            vipGrid.appendChild(card);

        });

        registerVipButtons();

        updateVipButtons();

    }, (error) => {

        console.error(
            "VIP LOAD ERROR:",
            error
        );

    });

}


// ======================================
// REGISTER BUY BUTTONS
// ======================================

function registerVipButtons() {

    const buttons =
        document.querySelectorAll(".buyVipBtn");

    buttons.forEach((button) => {

        button.addEventListener(
            "click",
            () => buyVip(button)
        );

    });

}


// ======================================
// BUY VIP PLAN REQUEST
// ======================================

async function buyVip(button) {

    if (!currentUser) return;

    const vipName =
        button.dataset.vip;

    const price =
        Number(button.dataset.price);

    const daily =
        Number(button.dataset.daily);

    const profit =
        Number(button.dataset.profit);

    const days =
        Number(button.dataset.days);

    const ok = confirm(
        `Voulez-vous acheter ${vipName} pour ${price.toLocaleString()} RWF ?`
    );

    if (!ok) return;

    try {

        const userRef =
            ref(
                db,
                "users/" +
                currentUser.uid
            );

        const snap =
            await get(userRef);

        if (!snap.exists()) {

            alert("Utilisateur introuvable.");

            return;

        }

        const user =
            snap.val();

        const balanceNow =
            Number(user.balance || 0);

        if (balanceNow < price) {

            alert(
                "Solde insuffisant."
            );

            return;

        }

        // ==================================
        // CREATE VIP REQUEST
        // ==================================

        const requestRef =
            push(
                ref(
                    db,
                    "vipPurchaseRequests"
                )
            );

        await set(
            requestRef,
            {

                uid:
                    currentUser.uid,

                email:
                    user.email ||
                    currentUser.email,

                vipName:
                    vipName,

                price:
                    price,

                dailyIncome:
                    daily,

                totalProfit:
                    profit,

                totalDays:
                    days,

                status:
                    "pending",

                createdAt:
                    Date.now()

            }
        );

        alert(
            "Votre demande d'achat VIP a été envoyée avec succès. Veuillez attendre l'approbation de l'administrateur."
        );

    }

    catch (error) {

        console.error(error);

        alert(
            error.message ||
            "Une erreur est survenue."
        );

    }

}


// ======================================
// LOAD USER VIP PLANS
// ======================================

function loadUserVipPlans() {

    if (!currentUser) return;

    const vipRef =
        ref(
            db,
            "users/" +
            currentUser.uid +
            "/vipPlans"
        );

    onValue(vipRef, (snapshot) => {

        ownedVipList.innerHTML = "";

        let activeCount = 0;
        let totalDaily = 0;
        let totalProfitAmount = 0;

        if (!snapshot.exists()) {

            ownedVipList.innerHTML = `

                <div class="emptyVip">

                    Aucun VIP acheté

                </div>

            `;

            currentVip.textContent =
                "VIP 0";

            dailyIncome.textContent =
                "0 RWF";

            totalProfit.textContent =
                "0 RWF";

            return;

        }

        snapshot.forEach((child) => {

            const vip =
                child.val();

            if (vip.status === "active") {

                activeCount++;

                totalDaily +=
                    Number(
                        vip.dailyIncome || 0
                    );

                totalProfitAmount +=
                    Number(
                        vip.totalProfit || 0
                    );

            }

            const statusText =
                getFrenchStatus(
                    vip.status
                );

            ownedVipList.innerHTML += `

                <div class="owned-vip-card">

                    <h3>
                        ${vip.vipName}
                    </h3>

                    <p>

                        Revenu quotidien :

                        <b>
                            ${Number(
                                vip.dailyIncome || 0
                            ).toLocaleString()} RWF
                        </b>

                    </p>

                    <p>

                        Jours restants :

                        <b>
                            ${vip.remainingDays || 0}
                        </b>

                    </p>

                    <p>

                        Statut :

                        <span class="vip-status">
                            ${statusText}
                        </span>

                    </p>

                </div>

            `;

        });

        currentVip.textContent =
            activeCount +
            " VIP actif(s)";

        dailyIncome.textContent =
            totalDaily.toLocaleString() +
            " RWF";

        totalProfit.textContent =
            totalProfitAmount.toLocaleString() +
            " RWF";

        updateVipButtons();

    });

}


// ======================================
// FRENCH STATUS
// ======================================

function getFrenchStatus(status) {

    switch (
        String(status || "")
        .toLowerCase()
    ) {

        case "active":
            return "Actif";

        case "expired":
            return "Expiré";

        case "pending":
            return "En attente";

        case "approved":
            return "Approuvé";

        case "rejected":
            return "Rejeté";

        default:
            return status || "Inconnu";

    }

}


// ======================================
// UPDATE VIP BUTTONS
// ======================================

function updateVipButtons() {

    const buyButtons =
        document.querySelectorAll(
            ".buyVipBtn"
        );

    buyButtons.forEach((button) => {

        const vipName =
            button.dataset.vip;

        const purchased =
            Object.values(vipPlans).some(
                plan =>
                    (plan.vipName || plan.name) ===
                    vipName &&
                    plan.status === "active"
            );

        if (purchased) {

            button.innerHTML = `

                <i class="fas fa-check-circle"></i>

                Acheté

            `;

            button.disabled = true;

            button.classList.add(
                "purchased"
            );

        } else {

            button.innerHTML = `

                <i class="fas fa-cart-shopping"></i>

                Acheter

            `;

            button.disabled = false;

            button.classList.remove(
                "purchased"
            );

        }

    });

}


// ======================================
// DAILY CLAIM
// ======================================

const claimIncomeBtn =
    document.getElementById(
        "claimIncomeBtn"
    );

const claimTimer =
    document.getElementById(
        "claimTimer"
    );

const ONE_DAY =
    24 * 60 * 60 * 1000;


// ======================================
// CLAIM BUTTON
// ======================================

claimIncomeBtn?.addEventListener(
    "click",
    claimDailyIncome
);


// ======================================
// CLAIM DAILY INCOME
// ======================================

async function claimDailyIncome() {

    if (!currentUser) {

        alert(
            "Utilisateur non connecté."
        );

        return;

    }

    try {

        const userRef =
            ref(
                db,
                "users/" +
                currentUser.uid
            );

        const now =
            Date.now();

        let totalIncome = 0;
        let claimedPlans = 0;

        const result =
            await runTransaction(
                userRef,
                current => {

                    if (!current) {

                        return;

                    }

                    const user =
                        current;

                    const plans =
                        user.vipPlans || {};

                    let changed = false;
                    let income = 0;
                    let planCount = 0;

                    for (
                        const key in plans
                    ) {

                        const vip =
                            plans[key];

                        if (
                            String(
                                vip.status || ""
                            ).toLowerCase()
                            !== "active"
                        ) {

                            continue;

                        }

                        const endDate =
                            Number(
                                vip.endDate || 0
                            );

                        if (
                            endDate > 0 &&
                            now >= endDate
                        ) {

                            continue;

                        }

                        const daily =
                            Number(
                                vip.dailyIncome || 0
                            );

                        if (
                            !Number.isFinite(
                                daily
                            ) ||
                            daily <= 0
                        ) {

                            continue;

                        }

                        const lastClaim =
                            Number(
                                vip.lastClaim ||
                                vip.lastClaimTime ||
                                vip.lastProfitTime ||
                                0
                            );

                        if (
                            lastClaim > 0 &&
                            now - lastClaim < ONE_DAY
                        ) {

                            continue;

                        }

                        income += daily;

                        planCount++;

                        plans[key] = {

                            ...vip,

                            lastClaim:
                                now,

                            lastClaimTime:
                                now,

                            lastProfitTime:
                                now,

                            totalEarned:
                                Number(
                                    vip.totalEarned || 0
                                ) + daily,

                            earned:
                                Number(
                                    vip.earned || 0
                                ) + daily

                        };

                        changed = true;

                    }

                    if (!changed) {

                        return;

                    }

                    const oldBalance =
                        Number(
                            user.balance || 0
                        );

                    if (
                        !Number.isFinite(
                            oldBalance
                        )
                    ) {

                        return;

                    }

                    const newBalance =
                        oldBalance +
                        income;

                    if (
                        !Number.isFinite(
                            newBalance
                        )
                    ) {

                        return;

                    }

                    totalIncome =
                        income;

                    claimedPlans =
                        planCount;

                    return {

                        ...user,

                        balance:
                            newBalance,

                        vipPlans:
                            plans

                    };

                }
            );


        // ==================================
        // NOT AVAILABLE
        // ==================================

        if (
            !result.committed ||
            totalIncome <= 0
        ) {

            alert(
                "Le revenu quotidien n'est pas encore disponible. Veuillez attendre 24 heures."
            );

            return;

        }


        // ==================================
        // TRANSACTION HISTORY
        // ==================================

        const txRef =
            push(
                ref(
                    db,
                    "transactions"
                )
            );

        await set(
            txRef,
            {

                uid:
                    currentUser.uid,

                email:
                    currentUser.email || "",

                type:
                    "dailyIncome",

                amount:
                    totalIncome,

                status:
                    "completed",

                vipPlansClaimed:
                    claimedPlans,

                createdAt:
                    now

            }
        );


        // ==================================
        // SUCCESS
        // ==================================

        alert(
            totalIncome.toLocaleString() +
            " RWF ont été réclamés avec succès."
        );

    }

    catch (error) {

        console.error(
            "Claim Error:",
            error
        );

        alert(
            "Échec de la réclamation : " +
            (
                error?.message ||
                "Erreur inconnue"
            )
        );

    }

}


// ======================================
// VIP EXPIRATION
// ======================================

checkVipExpiration();

setInterval(
    checkVipExpiration,
    60000
);


async function checkVipExpiration() {

    if (!currentUser) return;

    try {

        const vipRef =
            ref(
                db,
                "users/" +
                currentUser.uid +
                "/vipPlans"
            );

        const snap =
            await get(vipRef);

        if (!snap.exists())
            return;

        const vipPlans =
            snap.val();

        const now =
            Date.now();

        let changed = false;

        for (
            const key in vipPlans
        ) {

            const vip =
                vipPlans[key];

            if (
                vip.status !== "active"
            )
                continue;

            const totalDays =
                Number(
                    vip.totalDays || 0
                );

            const purchasedAt =
                Number(
                    vip.purchasedAt || 0
                );

            const daysPassed =
                Math.floor(
                    (
                        now -
                        purchasedAt
                    ) /
                    86400000
                );

            const remaining =
                totalDays -
                daysPassed;

            vip.remainingDays =
                remaining > 0
                ? remaining
                : 0;

            if (
                remaining <= 0
            ) {

                vip.status =
                    "expired";

            }

            changed = true;

        }

        if (changed) {

            await update(
                vipRef,
                vipPlans
            );

        }

    }

    catch (error) {

        console.error(error);

    }

}


// ======================================
// CLAIM COUNTDOWN TIMER
// ======================================

startClaimTimer();

setInterval(
    startClaimTimer,
    1000
);


async function startClaimTimer() {

    if (!currentUser) return;

    try {

        const vipRef =
            ref(
                db,
                "users/" +
                currentUser.uid +
                "/vipPlans"
            );

        const snap =
            await get(vipRef);

        if (!snap.exists()) {

            if (claimTimer) {

                claimTimer.textContent =
                    "Aucun VIP actif";

            }

            if (claimIncomeBtn) {

                claimIncomeBtn.disabled =
                    true;

            }

            return;

        }

        const vipPlans =
            snap.val();

        const now =
            Date.now();

        let nextClaim = 0;
        let hasActiveVip = false;

        for (
            const key in vipPlans
        ) {

            const vip =
                vipPlans[key];

            if (
                vip.status !== "active"
            ) {

                continue;

            }

            hasActiveVip = true;

            const claimTime =
                Number(
                    vip.lastClaim || 0
                ) +
                ONE_DAY;

            if (
                nextClaim === 0 ||
                claimTime < nextClaim
            ) {

                nextClaim =
                    claimTime;

            }

        }


        // ==================================
        // NO ACTIVE VIP
        // ==================================

        if (!hasActiveVip) {

            if (claimTimer) {

                claimTimer.textContent =
                    "Aucun VIP actif";

            }

            if (claimIncomeBtn) {

                claimIncomeBtn.disabled =
                    true;

            }

            return;

        }


        // ==================================
        // READY TO CLAIM
        // ==================================

        if (
            now >= nextClaim
        ) {

            if (claimTimer) {

                claimTimer.textContent =
                    "Prêt à réclamer";

            }

            if (claimIncomeBtn) {

                claimIncomeBtn.disabled =
                    false;

            }

            return;

        }


        // ==================================
        // COUNTDOWN
        // ==================================

        const diff =
            nextClaim - now;

        const hours =
            Math.floor(
                diff / 3600000
            );

        const minutes =
            Math.floor(
                (
                    diff % 3600000
                ) / 60000
            );

        const seconds =
            Math.floor(
                (
                    diff % 60000
                ) / 1000
            );

        if (claimTimer) {

            claimTimer.textContent =

                hours
                .toString()
                .padStart(2, "0")

                + ":" +

                minutes
                .toString()
                .padStart(2, "0")

                + ":" +

                seconds
                .toString()
                .padStart(2, "0");

        }

        if (claimIncomeBtn) {

            claimIncomeBtn.disabled =
                true;

        }

    }

    catch (error) {

        console.error(
            "Claim Timer Error:",
            error
        );

    }

}

console.log(
    "VIP French UI READY"
);

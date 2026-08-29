// ======================================
// VIP.JS
// MONEY VAULT - VERSION FRANÇAISE
// USD VERSION
// Compatible avec admin.js + Firebase
// ======================================


import {
    auth,
    db
} from "./firebase.js";


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
    runTransaction
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";


// ======================================
// DOM
// ======================================

const loadingScreen =
    document.getElementById("loadingScreen");

const sidebar =
    document.getElementById("sidebar");

const menuBtn =
    document.getElementById("menuBtn");

const logoutBtn =
    document.getElementById("logoutBtn");


const balance =
    document.getElementById("balance");

const currentVip =
    document.getElementById("currentVip");

const dailyIncome =
    document.getElementById("dailyIncome");

const totalProfit =
    document.getElementById("totalProfit");


const ownedVipList =
    document.getElementById("ownedVipList");

const vipGrid =
    document.getElementById("vipGrid");


const claimIncomeBtn =
    document.getElementById("claimIncomeBtn");

const claimTimer =
    document.getElementById("claimTimer");


// ======================================
// VARIABLES
// ======================================

let currentUser = null;

let userData = {};

let vipPlans = {};


// ======================================
// TIME
// ======================================

const ONE_DAY =
    24 * 60 * 60 * 1000;


// ======================================
// USD FORMAT
// ======================================

function formatUSD(amount) {

    const value =
        Number(amount || 0);

    if (!Number.isFinite(value)) {

        return "$0.00";

    }

    return value.toLocaleString(
        "en-US",
        {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );

}


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
    async () => {

        if (
            !confirm(
                "Voulez-vous vraiment vous déconnecter ?"
            )
        ) {

            return;

        }


        try {

            await signOut(auth);

            location.href =
                "login.html";

        }

        catch (error) {

            console.error(
                "LOGOUT ERROR:",
                error
            );

            alert(
                "Échec de la déconnexion."
            );

        }

    }
);


// ======================================
// AUTH
// ======================================

onAuthStateChanged(
    auth,
    (user) => {

        if (!user) {

            location.href =
                "login.html";

            return;

        }


        currentUser =
            user;


        loadUserData();

        loadVipPackages();

        loadUserVipPlans();

        checkVipExpiration();

        startClaimTimer();

    }
);


// ======================================
// LOAD USER DATA
// ======================================

function loadUserData() {

    if (!currentUser)
        return;


    const userRef =
        ref(
            db,
            "users/" +
            currentUser.uid
        );


    onValue(
        userRef,
        (snapshot) => {

            if (loadingScreen) {

                loadingScreen.style.display =
                    "none";

            }


            if (!snapshot.exists()) {

                console.log(
                    "Données utilisateur introuvables."
                );

                return;

            }


            userData =
                snapshot.val() || {};


            vipPlans =
                userData.vipPlans || {};


            const userBalance =
                Number(
                    userData.balance || 0
                );


            if (balance) {

                balance.textContent =
                    formatUSD(
                        userBalance
                    );

            }

        },

        (error) => {

            console.error(
                "Erreur utilisateur :",
                error
            );

        }
    );

}


// ======================================
// VIP COLOR
// ======================================

function getVipColorClass(
    name,
    index
) {

    const value =
        String(
            name || ""
        )
        .toLowerCase()
        .trim();


    if (
        value.includes("bronze")
    )
        return "bronze";


    if (
        value.includes("starter")
    )
        return "starter";


    if (
        value.includes("silver")
    )
        return "silver";


    if (
        value.includes("gold")
    )
        return "gold";


    if (
        value.includes("platinum")
    )
        return "platinum";


    if (
        value.includes("diamond")
    )
        return "diamond";


    if (
        value.includes("premium")
    )
        return "premium";


    if (
        value.includes("elite")
    )
        return "elite";


    if (
        value.includes("royal")
    )
        return "royal";


    if (
        value.includes("ultimate")
    )
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


    return (
        colors[index] ||
        "bronze"
    );

}


// ======================================
// GET VIP NUMBER
// ======================================

function getVipNumber(
    vip,
    key
) {

    const name =
        String(
            vip?.name || ""
        ).trim();


    let match =
        name.match(
            /vip\s*[-_#:]?\s*(\d+)/i
        );


    if (match)
        return Number(
            match[1]
        );


    const firebaseKey =
        String(
            key || ""
        ).trim();


    match =
        firebaseKey.match(
            /vip\s*[-_#:]?\s*(\d+)/i
        );


    if (match)
        return Number(
            match[1]
        );


    match =
        name.match(
            /\d+/
        );


    if (match)
        return Number(
            match[0]
        );


    return 999999;

}


// ======================================
// LOAD VIP PACKAGES
// ======================================

function loadVipPackages() {

    const vipRef =
        ref(
            db,
            "vipPlans"
        );


    onValue(
        vipRef,
        (snapshot) => {

            if (!vipGrid)
                return;


            vipGrid.innerHTML =
                "";


            if (!snapshot.exists()) {

                vipGrid.innerHTML = `

                    <div class="emptyVip">

                        Aucun plan VIP disponible.

                    </div>

                `;

                return;

            }


            const plans = [];


            snapshot.forEach(
                (child) => {

                    plans.push({

                        key:
                            child.key,

                        data:
                            child.val() || {}

                    });

                }
            );


            // ==================================
            // SORT VIP
            // ==================================

            plans.sort(
                (a, b) => {

                    return (

                        getVipNumber(
                            a.data,
                            a.key
                        )

                        -

                        getVipNumber(
                            b.data,
                            b.key
                        )

                    );

                }
            );


            // ==================================
            // DISPLAY
            // ==================================

            plans.forEach(
                (item, index) => {

                    const vip =
                        item.data;


                    const name =
                        vip.name ||
                        vip.vipName ||
                        "Plan VIP";


                    const price =
                        Number(
                            vip.price ??
                            vip.vipPrice ??
                            0
                        );


                    const daily =
                        Number(
                            vip.dailyIncome ??
                            vip.daily ??
                            0
                        );


                    const duration =
                        Number(
                            vip.duration ??
                            vip.days ??
                            vip.totalDays ??
                            0
                        );


                    const profit =
                        vip.totalProfit != null

                            ?

                        Number(
                            vip.totalProfit
                        )

                            :

                        daily * duration;


                    const colorClass =
                        getVipColorClass(
                            name,
                            index
                        );


                    const card =
                        document.createElement(
                            "div"
                        );


                    card.className =
                        "vip-card " +
                        colorClass;


                    card.innerHTML = `

                        <div class="vip-badge">

                            ${name}

                        </div>


                        <i
                            class="fas fa-gem vip-icon"
                        ></i>


                        <h2>

                            ${name}

                        </h2>


                        <h1>

                            ${formatUSD(price)}

                        </h1>


                        <p>

                            Revenu quotidien :

                            <b>

                                ${formatUSD(daily)}

                            </b>

                        </p>


                        <p>

                            Durée :

                            <b>

                                ${duration} jours

                            </b>

                        </p>


                        <p>

                            Profit total :

                            <b>

                                ${formatUSD(profit)}

                            </b>

                        </p>


                        <button

                            class="buyVipBtn"

                            data-vip="${name}"

                            data-price="${price}"

                            data-daily="${daily}"

                            data-profit="${profit}"

                            data-days="${duration}"

                        >

                            <i
                                class="fas fa-cart-shopping"
                            ></i>

                            Acheter maintenant

                        </button>

                    `;


                    vipGrid.appendChild(
                        card
                    );

                }
            );


            registerVipButtons();

            updateVipButtons();

        },

        (error) => {

            console.error(
                "Erreur chargement VIP :",
                error
            );

        }
    );

}


// ======================================
// REGISTER VIP BUTTONS
// ======================================

function registerVipButtons() {

    const buttons =
        document.querySelectorAll(
            ".buyVipBtn"
        );


    buttons.forEach(
        (button) => {

            button.addEventListener(
                "click",
                () => {

                    buyVip(
                        button
                    );

                }
            );

        }
    );

}


// ======================================
// BUY VIP
// ======================================

async function buyVip(
    button
) {

    if (!currentUser) {

        alert(
            "Veuillez vous connecter."
        );

        return;

    }


    const vipName =
        button.dataset.vip;


    const price =
        Number(
            button.dataset.price
        );


    const daily =
        Number(
            button.dataset.daily
        );


    const profit =
        Number(
            button.dataset.profit
        );


    const days =
        Number(
            button.dataset.days
        );


    if (
        !Number.isFinite(price) ||
        price <= 0
    ) {

        alert(
            "Le prix de ce plan VIP est invalide."
        );

        return;

    }


    const confirmation =
        confirm(

            `Voulez-vous acheter ${vipName} pour ${formatUSD(price)} ?`

        );


    if (!confirmation)
        return;


    button.disabled =
        true;


    try {

        const userRef =
            ref(
                db,
                "users/" +
                currentUser.uid
            );


        const snapshot =
            await get(
                userRef
            );


        if (!snapshot.exists()) {

            alert(
                "Compte utilisateur introuvable."
            );

            return;

        }


        const user =
            snapshot.val() || {};


        const balanceNow =
            Number(
                user.balance || 0
            );


        if (
            !Number.isFinite(
                balanceNow
            )
        ) {

            alert(
                "Votre solde est invalide."
            );

            return;

        }


        if (
            balanceNow < price
        ) {

            alert(
                "Solde insuffisant pour acheter ce plan VIP."
            );

            return;

        }


        // ==================================
        // CHECK EXISTING ACTIVE VIP
        // ==================================

        const existingPlans =
            user.vipPlans || {};


        const alreadyOwned =
            Object.values(
                existingPlans
            ).some(
                (plan) => {

                    return (

                        (
                            plan.vipName ||
                            plan.name
                        ) === vipName

                        &&

                        String(
                            plan.status || ""
                        ).toLowerCase()
                        ===
                        "active"

                    );

                }
            );


        if (alreadyOwned) {

            alert(
                "Vous possédez déjà ce plan VIP."
            );

            return;

        }


        // ==================================
        // CREATE PURCHASE REQUEST
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
                    currentUser.email ||
                    "",

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

            "Votre demande VIP a été envoyée. Veuillez attendre l'approbation de l'administrateur."

        );

    }

    catch (error) {

        console.error(
            "Erreur achat VIP :",
            error
        );


        alert(

            "Échec de l'achat : " +

            (
                error?.message ||
                "Erreur inconnue."
            )

        );

    }

    finally {

        button.disabled =
            false;

    }

}


// ======================================
// LOAD USER VIP PLANS
// ======================================

function loadUserVipPlans() {

    if (!currentUser)
        return;


    const vipRef =
        ref(
            db,
            "users/" +
            currentUser.uid +
            "/vipPlans"
        );


    onValue(
        vipRef,
        (snapshot) => {

            if (!ownedVipList)
                return;


            ownedVipList.innerHTML =
                "";


            let activeCount =
                0;


            let totalDaily =
                0;


            let totalProfitAmount =
                0;


            if (!snapshot.exists()) {

                ownedVipList.innerHTML = `

                    <div class="emptyVip">

                        Aucun VIP acheté.

                    </div>

                `;


                if (currentVip)
                    currentVip.textContent =
                        "VIP 0";


                if (dailyIncome)
                    dailyIncome.textContent =
                        formatUSD(0);


                if (totalProfit)
                    totalProfit.textContent =
                        formatUSD(0);


                vipPlans = {};


                return;

            }


            snapshot.forEach(
                (child) => {

                    const vip =
                        child.val() || {};


                    const status =
                        String(
                            vip.status || ""
                        )
                        .toLowerCase();


                    if (
                        status ===
                        "active"
                    ) {

                        activeCount++;


                        totalDaily +=
                            Number(
                                vip.dailyIncome ||
                                vip.daily ||
                                0
                            );


                        totalProfitAmount +=
                            Number(
                                vip.totalProfit ||
                                0
                            );

                    }


                    const statusText =

                        status ===
                        "active"

                            ?

                        "Actif"

                            :

                        status ===
                        "expired"

                            ?

                        "Expiré"

                            :

                        "En attente";


                    ownedVipList.innerHTML += `

                        <div
                            class="owned-vip-card"
                        >

                            <h3>

                                ${
                                    vip.vipName ||
                                    vip.name ||
                                    "VIP"
                                }

                            </h3>


                            <p>

                                Revenu quotidien :

                                <b>

                                    ${
                                        formatUSD(
                                            Number(
                                                vip.dailyIncome ||
                                                vip.daily ||
                                                0
                                            )
                                        )
                                    }

                                </b>

                            </p>


                            <p>

                                Jours restants :

                                <b>

                                    ${
                                        Number(
                                            vip.remainingDays ||
                                            0
                                        )
                                    }

                                </b>

                            </p>


                            <p>

                                Statut :

                                <span
                                    class="vip-status"
                                >

                                    ${statusText}

                                </span>

                            </p>

                        </div>

                    `;

                }
            );


            if (currentVip) {

                currentVip.textContent =

                    activeCount +

                    (
                        activeCount > 1

                            ?

                        " VIP actifs"

                            :

                        " VIP actif"

                    );

            }


            if (dailyIncome) {

                dailyIncome.textContent =
                    formatUSD(
                        totalDaily
                    );

            }


            if (totalProfit) {

                totalProfit.textContent =
                    formatUSD(
                        totalProfitAmount
                    );

            }


            vipPlans =
                snapshot.val() || {};


            updateVipButtons();

        },

        (error) => {

            console.error(
                "Erreur VIP utilisateur :",
                error
            );

        }
    );

}


// ======================================
// UPDATE BUY BUTTONS
// ======================================

function updateVipButtons() {

    const buttons =
        document.querySelectorAll(
            ".buyVipBtn"
        );


    buttons.forEach(
        (button) => {

            const vipName =
                button.dataset.vip;


            const purchased =
                Object.values(
                    vipPlans
                ).some(
                    (plan) => {

                        return (

                            (
                                plan.vipName ||
                                plan.name
                            ) === vipName

                            &&

                            String(
                                plan.status || ""
                            ).toLowerCase()
                            ===
                            "active"

                        );

                    }
                );


            if (purchased) {

                button.innerHTML = `

                    <i
                        class="fas fa-check-circle"
                    ></i>

                    Déjà acheté

                `;


                button.disabled =
                    true;


                button.classList.add(
                    "purchased"
                );

            }

            else {

                button.innerHTML = `

                    <i
                        class="fas fa-cart-shopping"
                    ></i>

                    Acheter maintenant

                `;


                button.disabled =
                    false;


                button.classList.remove(
                    "purchased"
                );

            }

        }
    );

}


// ======================================
// CLAIM DAILY INCOME
// ======================================

claimIncomeBtn?.addEventListener(
    "click",
    claimDailyIncome
);


async function claimDailyIncome() {

    if (!currentUser) {

        alert(
            "Veuillez vous connecter."
        );

        return;

    }


    if (claimIncomeBtn) {

        claimIncomeBtn.disabled =
            true;

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


        let totalIncome =
            0;


        let claimedPlans =
            0;


        const result =
            await runTransaction(
                userRef,
                (current) => {

                    if (!current)
                        return;


                    const user =
                        current;


                    const plans =
                        user.vipPlans ||
                        {};


                    let changed =
                        false;


                    let income =
                        0;


                    let planCount =
                        0;


                    for (
                        const key in plans
                    ) {

                        const vip =
                            plans[key];


                        if (
                            String(
                                vip.status || ""
                            ).toLowerCase()
                            !==
                            "active"
                        ) {

                            continue;

                        }


                        const endDate =
                            Number(
                                vip.endDate ||
                                0
                            );


                        if (
                            endDate > 0 &&
                            now >= endDate
                        ) {

                            continue;

                        }


                        const daily =
                            Number(
                                vip.dailyIncome ||
                                vip.daily ||
                                0
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


                        // ==================================
                        // 24 HOURS
                        // ==================================

                        if (

                            lastClaim > 0 &&

                            (
                                now -
                                lastClaim
                            ) < ONE_DAY

                        ) {

                            continue;

                        }


                        income +=
                            daily;


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
                                    vip.totalEarned ||
                                    0
                                ) +

                                daily,


                            earned:

                                Number(
                                    vip.earned ||
                                    0
                                ) +

                                daily

                        };


                        changed =
                            true;

                    }


                    if (!changed)
                        return;


                    const oldBalance =
                        Number(
                            user.balance ||
                            0
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
        // CLAIM FAILED
        // ==================================

        if (

            !result.committed ||

            totalIncome <= 0

        ) {

            alert(

                "Votre revenu quotidien n'est pas encore disponible. Veuillez attendre 24 heures."

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
                    currentUser.email ||
                    "",

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


        alert(

            formatUSD(
                totalIncome
            ) +

            " ont été ajoutés à votre solde."

        );

    }

    catch (error) {

        console.error(
            "Erreur réclamation :",
            error
        );


        alert(

            "Échec de la réclamation : " +

            (
                error?.message ||
                "Erreur inconnue."
            )

        );

    }

    finally {

        if (claimIncomeBtn) {

            claimIncomeBtn.disabled =
                false;

        }


        startClaimTimer();

    }

}


// ======================================
// VIP EXPIRATION
// ======================================

async function checkVipExpiration() {

    if (!currentUser)
        return;


    try {

        const vipRef =
            ref(
                db,
                "users/" +
                currentUser.uid +
                "/vipPlans"
            );


        const snap =
            await get(
                vipRef
            );


        if (!snap.exists())
            return;


        const plans =
            snap.val() || {};


        const now =
            Date.now();


        let changed =
            false;


        for (
            const key in plans
        ) {

            const vip =
                plans[key];


            if (
                String(
                    vip.status || ""
                ).toLowerCase()
                !==
                "active"
            ) {

                continue;

            }


            const totalDays =
                Number(
                    vip.totalDays ||
                    vip.duration ||
                    vip.days ||
                    0
                );


            const purchasedAt =
                Number(
                    vip.purchasedAt ||
                    vip.createdAt ||
                    0
                );


            if (

                totalDays <= 0 ||

                purchasedAt <= 0

            ) {

                continue;

            }


            const daysPassed =
                Math.floor(

                    (
                        now -
                        purchasedAt
                    )

                    /

                    ONE_DAY

                );


            const remaining =
                totalDays -
                daysPassed;


            plans[key].remainingDays =

                remaining > 0

                    ?

                remaining

                    :

                0;


            if (
                remaining <= 0
            ) {

                plans[key].status =
                    "expired";

            }


            changed =
                true;

        }


        if (changed) {

            // NOTE:
            // This requires the Firebase rules
            // to allow the authenticated user
            // to update his own vipPlans.

            const updateRef =
                ref(
                    db,
                    "users/" +
                    currentUser.uid +
                    "/vipPlans"
                );


            await set(
                updateRef,
                plans
            );

        }

    }

    catch (error) {

        console.error(
            "Erreur expiration VIP :",
            error
        );

    }

}


// ======================================
// CHECK EXPIRATION EVERY 60 SECONDS
// ======================================

setInterval(
    checkVipExpiration,
    60000
);


// ======================================
// CLAIM COUNTDOWN
// ======================================

async function startClaimTimer() {

    if (!currentUser)
        return;


    try {

        const vipRef =
            ref(
                db,
                "users/" +
                currentUser.uid +
                "/vipPlans"
            );


        const snap =
            await get(
                vipRef
            );


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


        const plans =
            snap.val() || {};


        const now =
            Date.now();


        let nextClaim =
            0;


        let hasActiveVip =
            false;


        for (
            const key in plans
        ) {

            const vip =
                plans[key];


            if (
                String(
                    vip.status || ""
                ).toLowerCase()
                !==
                "active"
            ) {

                continue;

            }


            const endDate =
                Number(
                    vip.endDate ||
                    0
                );


            if (
                endDate > 0 &&
                now >= endDate
            ) {

                continue;

            }


            hasActiveVip =
                true;


            const lastClaim =
                Number(
                    vip.lastClaim ||
                    vip.lastClaimTime ||
                    vip.lastProfitTime ||
                    0
                );


            const claimTime =

                lastClaim > 0

                    ?

                lastClaim +
                ONE_DAY

                    :

                now;


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
        // READY
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
            nextClaim -
            now;


        const hours =
            Math.floor(
                diff /
                3600000
            );


        const minutes =
            Math.floor(

                (
                    diff %
                    3600000
                )

                /

                60000

            );


        const seconds =
            Math.floor(

                (
                    diff %
                    60000
                )

                /

                1000

            );


        if (claimTimer) {

            claimTimer.textContent =

                "Disponible dans " +

                hours
                    .toString()
                    .padStart(
                        2,
                        "0"
                    ) +

                ":" +

                minutes
                    .toString()
                    .padStart(
                        2,
                        "0"
                    ) +

                ":" +

                seconds
                    .toString()
                    .padStart(
                        2,
                        "0"
                    );

        }


        if (claimIncomeBtn) {

            claimIncomeBtn.disabled =
                true;

        }

    }

    catch (error) {

        console.error(
            "Erreur compteur :",
            error
        );

    }

}


// ======================================
// UPDATE COUNTDOWN EVERY SECOND
// ======================================

setInterval(
    startClaimTimer,
    1000
);


// ======================================
// READY
// ======================================

console.log(
    "Money Vault VIP.js chargé."
);

console.log(
    "Currency: USD"
);

console.log(
    "VIP System: Ready"
);

console.log(
    "Daily Claim: 24 Hours"
);

console.log(
    "French Version: Ready"
);

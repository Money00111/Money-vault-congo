// ======================================
// NOTIFICATIONS.JS - PART 11B
// Money Vault - Notifications Françaises
// ======================================

import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {
    ref,
    onValue,
    update
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";


// ======================================
// ELEMENTS
// ======================================

const notificationList =
document.getElementById("notificationList");

const notificationCount =
document.getElementById("notificationCount");


// ======================================
// AUTHENTIFICATION
// ======================================

onAuthStateChanged(auth, (user) => {

    if (!user) {

        window.location.href = "login.html";

        return;

    }

    loadNotifications(user.uid);

});


// ======================================
// CHARGER LES NOTIFICATIONS
// ======================================

function loadNotifications(uid) {

    const notifyRef =
    ref(db, "notifications/" + uid);


    onValue(notifyRef, (snapshot) => {

        notificationList.innerHTML = "";

        let count = 0;


        // ==================================
        // AUCUNE NOTIFICATION
        // ==================================

        if (!snapshot.exists()) {

            notificationList.innerHTML = `

                <div class="empty-card">

                    Aucune notification

                </div>

            `;

            notificationCount.textContent = "0";

            return;

        }


        // ==================================
        // RECUPERER LES NOTIFICATIONS
        // ==================================

        const notifications = [];


        snapshot.forEach((child) => {

            notifications.push({

                id: child.key,

                ...child.val()

            });

        });


        // ==================================
        // TRIER : PLUS RÉCENT → PLUS ANCIEN
        // ==================================

        notifications.sort((a, b) =>

            (b.createdAt || 0) -
            (a.createdAt || 0)

        );


        // ==================================
        // AFFICHER
        // ==================================

        notifications.forEach((data) => {

            count++;


            notificationList.innerHTML += `

                <div
                    class="notification-card"
                    onclick="markAsRead('${uid}','${data.id}')"
                >

                    <h3>
                        ${data.title || "Notification"}
                    </h3>

                    <p>
                        ${data.message || ""}
                    </p>

                    <small>
                        ${formatNotificationDate(data.createdAt)}
                    </small>

                </div>

            `;

        });


        notificationCount.textContent =
        count;

    });

}


// ======================================
// FORMAT DATE
// ======================================

function formatNotificationDate(timestamp) {

    if (!timestamp) return "-";

    try {

        return new Date(timestamp).toLocaleString(
            "fr-FR"
        );

    }

    catch (error) {

        return "-";

    }

}


console.log(
    "Notifications chargées avec succès"
);


// ======================================
// NOTIFICATIONS.JS - PART 13
// MARQUER COMME LUE
// ======================================

async function markAsRead(
    uid,
    notificationId
) {

    try {

        await update(

            ref(
                db,
                "notifications/" +
                uid +
                "/" +
                notificationId
            ),

            {
                read: true
            }

        );

    }

    catch (error) {

        console.error(
            "Erreur notification:",
            error
        );

    }

}


// ======================================
// DISPONIBLE POUR onclick DANS HTML
// ======================================

window.markAsRead = markAsRead;

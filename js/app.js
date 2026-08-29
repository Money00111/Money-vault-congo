import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {
  ref,
  set
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";

import { db } from "./firebase.js";


// ======================================
// FIREBASE AUTH
// ======================================

const auth = getAuth();


// ======================================
// REGISTRATION BONUS
// $1 USD
// ======================================

const REGISTRATION_BONUS = 1;


// ======================================
// TABS
// ======================================

const loginTab =
  document.getElementById("loginTab");

const registerTab =
  document.getElementById("registerTab");

const loginForm =
  document.getElementById("loginForm");

const registerForm =
  document.getElementById("registerForm");

const message =
  document.getElementById("message");


// ======================================
// SWITCH TO LOGIN
// ======================================

loginTab.onclick = () => {

  loginTab.classList.add("active");

  registerTab.classList.remove("active");

  loginForm.classList.remove("hidden");

  registerForm.classList.add("hidden");

};


// ======================================
// SWITCH TO REGISTER
// ======================================

registerTab.onclick = () => {

  registerTab.classList.add("active");

  loginTab.classList.remove("active");

  registerForm.classList.remove("hidden");

  loginForm.classList.add("hidden");

};


// ======================================
// REGISTER
// ======================================

document.getElementById("registerBtn").onclick =
async () => {

  const name =
    document.getElementById("registerName").value.trim();

  const email =
    document.getElementById("registerEmail").value.trim();

  const password =
    document.getElementById("registerPassword").value;


  if (!name) {

    message.innerText =
      "Please enter your name.";

    return;

  }


  if (!email) {

    message.innerText =
      "Please enter your email.";

    return;

  }


  if (!password) {

    message.innerText =
      "Please enter your password.";

    return;

  }


  try {

    // ==================================
    // CREATE AUTH ACCOUNT
    // ==================================

    const userCredential =
      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );


    const user =
      userCredential.user;


    // ==================================
    // SAVE DISPLAY NAME
    // ==================================

    await updateProfile(
      user,
      {
        displayName: name
      }
    );


    // ==================================
    // GENERATE REFERRAL CODE
    // ==================================

    const referralCode =
      Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();


    // ==================================
    // SAVE USER DATA
    // ==================================

    await set(
      ref(
        db,
        "users/" + user.uid
      ),
      {

        uid:
          user.uid,

        name:
          name,

        email:
          email,

        country:
          "RDC",


        // ==================================
        // $1 REGISTRATION BONUS
        // ==================================

        balance:
          REGISTRATION_BONUS,

        bonus:
          REGISTRATION_BONUS,

        totalEarnings:
          REGISTRATION_BONUS,


        totalDeposits:
          0,

        totalWithdrawals:
          0,


        // ==================================
        // REFERRAL
        // ==================================

        referralCode:
          referralCode,

        referralCount:
          0,

        referralEarnings:
          0,


        // ==================================
        // VIP
        // ==================================

        vip: {

          plan:
            "None",

          dailyIncome:
            0,

          daysLeft:
            0

        },


        // ==================================
        // ACCOUNT
        // ==================================

        createdAt:
          Date.now()

      }
    );


    // ==================================
    // SUCCESS
    // ==================================

    message.innerText =
      "Account created successfully ✅";


    console.log(
      "Account created:",
      user.uid
    );

    console.log(
      "Registration bonus: $1"
    );

    console.log(
      "Country: RDC"
    );


  }

  catch (error) {

    console.error(
      "Registration error:",
      error
    );


    message.innerText =
      error.message;

  }

};


// ======================================
// LOGIN
// ======================================

document.getElementById("loginBtn").onclick =
async () => {

  const email =
    document.getElementById("loginEmail").value.trim();

  const password =
    document.getElementById("loginPassword").value;


  if (!email) {

    message.innerText =
      "Please enter your email.";

    return;

  }


  if (!password) {

    message.innerText =
      "Please enter your password.";

    return;

  }


  try {

    await signInWithEmailAndPassword(
      auth,
      email,
      password
    );


    window.location.href =
      "dashboard.html";


  }

  catch (error) {

    console.error(
      "Login error:",
      error
    );


    message.innerText =
      error.message;

  }

};


// ======================================
// AUTO LOGIN CHECK
// ======================================

onAuthStateChanged(
  auth,
  (user) => {

    if (user) {

      console.log(
        "Logged in:",
        user.email
      );

    }

  }
);

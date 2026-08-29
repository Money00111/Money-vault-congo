<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><meta name="viewport"
content="width=device-width, initial-scale=1.0">

<title>Transactions | Money Vault</title><link rel="stylesheet"
href="css/transactions.css"><link rel="stylesheet"
href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"></head><body><!-- ===========================
SIDEBAR
=========================== --><div id="sidebar" class="sidebar"><div class="logo">

    <h2>💰 Money Vault</h2>

</div>


<ul>

    <li>

        <a href="dashboard.html">

            <i class="fa fa-house"></i>

            Tableau de bord

        </a>

    </li>


    <li>

        <a href="deposit.html">

            <i class="fa fa-wallet"></i>

            Dépôt

        </a>

    </li>


    <li>

        <a href="withdraw.html">

            <i class="fa fa-money-bill-transfer"></i>

            Retrait

        </a>

    </li>


    <li>

        <a href="transactions.html"
           class="active">

            <i class="fa fa-clock-rotate-left"></i>

            Transactions

        </a>

    </li>


    <li>

        <a href="profile.html">

            <i class="fa fa-user"></i>

            Profil

        </a>

    </li>


    <li>

        <a href="#"
           id="logoutBtn">

            <i class="fa fa-right-from-bracket"></i>

            Déconnexion

        </a>

    </li>

</ul>

</div><!-- ===========================
MAIN
=========================== --><div class="main"><header><button id="menuBtn">

    <i class="fa fa-bars"></i>

</button>


<h2>Historique des transactions</h2>


<i class="fa fa-bell notification"></i>

</header><!-- ===========================
STATS
=========================== --><section class="stats"><div class="stat-card">

    <h3>💰 Solde</h3>

    <h1 id="balance">
        $0.00
    </h1>

</div>


<div class="stat-card">

    <h3>📥 Dépôts</h3>

    <h1 id="totalDeposit">
        $0.00
    </h1>

</div>


<div class="stat-card">

    <h3>📤 Retraits</h3>

    <h1 id="totalWithdraw">
        $0.00
    </h1>

</div>


<div class="stat-card">

    <h3>🎁 Bonus</h3>

    <h1 id="bonus">
        $0.00
    </h1>

</div>

</section><!-- ===========================
RECHERCHE
=========================== --><section class="search-box"><input
    type="text"
    id="searchInput"
    placeholder="Rechercher une transaction...">

</section><!-- ===========================
FILTRES
=========================== --><section class="filter-box"><button
    class="filter-btn active"
    data-filter="all">

    Toutes

</button>


<button
    class="filter-btn"
    data-filter="deposit">

    Dépôts

</button>


<button
    class="filter-btn"
    data-filter="withdraw">

    Retraits

</button>


<button
    class="filter-btn"
    data-filter="bonus">

    Bonus

</button>

</section><!-- ===========================
TRANSACTION HISTORY
=========================== --><section class="transaction-section"><h2>

    <i class="fas fa-clock"></i>

    Historique des transactions

</h2>


<div id="transactionList">

    <p>

        Chargement des transactions...

    </p>

</div>

</section><!-- ===========================
SECURITY
=========================== --><section class="security"><div class="security-card">


    <h2>

        🛡️ Avis de sécurité

    </h2>


    <p>

        Toutes vos transactions sont
        enregistrées de manière sécurisée.

        Ne partagez jamais votre mot de passe
        ou votre code OTP avec quelqu'un.

    </p>


</div>

</section><!-- ===========================
SUPPORT
=========================== --><section class="support"><div class="support-card">


    <h2>

        📞 Service client

    </h2>


    <div class="support-buttons">


        <a
            href="tel:+250788846187"
            class="call-btn">

            <i class="fa fa-phone"></i>

            Appeler

        </a>


        <a
            href="https://wa.me/250788846187"
            target="_blank"
            class="whatsapp-btn">

            <i class="fa-brands fa-whatsapp"></i>

            WhatsApp

        </a>


    </div>


</div>

</section><!-- ===========================
BOTTOM NAVIGATION
=========================== --><nav class="bottom-nav"><a href="dashboard.html">

    <i class="fa fa-house"></i>

    <span>Accueil</span>

</a>


<a href="deposit.html">

    <i class="fa fa-wallet"></i>

    <span>Dépôt</span>

</a>


<a href="withdraw.html">

    <i class="fa fa-money-bill-transfer"></i>

    <span>Retrait</span>

</a>


<a
    href="transactions.html"
    class="active">

    <i class="fa fa-clock-rotate-left"></i>

    <span>Historique</span>

</a>


<a href="profile.html">

    <i class="fa fa-user"></i>

    <span>Profil</span>

</a>

</nav><!-- ===========================
LOADING SCREEN
=========================== --><div
    id="loadingScreen"
    class="loading-screen"><div class="loader"></div>


<h3>

    Chargement des transactions...

</h3>

</div><!-- ===========================
SCRIPT
=========================== --><script
    type="module"
    src="js/transactions.js">
</script></div>
      
      </body>
      
      </html>

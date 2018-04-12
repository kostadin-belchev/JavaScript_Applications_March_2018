define(['jquery'], function ($) {
    function showView(viewName) {
        $('main > section').hide(); // Hide all views
        $('#' + viewName).show(); // Show the selected view only
    }

    function showHomeView() {
        showView('viewHome');
    }

    function showLoginView() {
        $('#formLogin').trigger('reset');
        showView('viewLogin');
    }

    function showRegisterView() {
        $('#formRegister').trigger('reset');
        showView('viewRegister');
    }

    function showCreateAdView() {
        $('#formCreateAd').trigger('reset');
        showView('viewCreateAd');
    }

    function showHideMenuLinks() {
        $("#linkHome").show();
        if (sessionStorage.getItem('authToken') === null) { // No logged in user
            $("#linkLogin").show();
            $("#linkRegister").show();
            $("#linkListAds").hide();
            $("#linkCreateAd").hide();
            $("#linkLogout").hide();
            $('#loggedInUser').text('');
        } else { // We have logged in user
            $("#linkLogin").hide();
            $("#linkRegister").hide();
            $("#linkListAds").show();
            $("#linkCreateAd").show();
            $("#linkLogout").show();
            $('#loggedInUser').text("Welcome, " + sessionStorage.getItem('username') + "!");
        }
    }

    function showError(errorMsg) {
        let errorBox = $('#errorBox');
        errorBox.text("Error: " + errorMsg);
        errorBox.show();
    }

    function showInfo(message) {
        let infoBox = $('#infoBox');
        infoBox.text(message);
        infoBox.show();
        setTimeout(function() {
            $('#infoBox').fadeOut()
        }, 3000);
    }

    return {
        showView,
        showHideMenuLinks,
        showError,
        showHomeView,
        showLoginView,
        showRegisterView,
        showCreateAdView,
        showInfo
    }
});

function showView(viewName) {
    $('main > section').hide() // Hide all views
    $('#' + viewName).show() // Show the selected view only
}

function showHideMenuLinks() {
    $('#linkHome').show();
    if (sessionStorage.getItem('authToken') === null) { // no logged in user
        $('#linkLogin').show();
        $('#linkRegister').show();
        $('#linkListAds').hide();
        $('#linkCreateAd').hide();
        $('#linkLogout').hide();
        $('#loggedInUser').text('');
    } else { // logged in user
        $('#linkLogin').hide();
        $('#linkRegister').hide();
        $('#linkListAds').show();
        $('#linkCreateAd').show();
        $('#linkLogout').show();
        $('#loggedInUser').show();
        $('#loggedInUser').text("Welcome, " + sessionStorage.getItem('username') + "!");
    }
}

function showInfo(message) {
    let infoBox = $('#infoBox');
    infoBox.text(message);
    infoBox.show();
    setTimeout(function() {
        $('#infoBox').fadeOut()
    }, 2000);
}

function showError(errorMsg) {
    let errorBox = $('#errorBox');
    errorBox.text("Error: " + errorMsg);
    errorBox.show();
}

function showHomeView() {
    showView('viewHome');
}

function showLoginView() {
    // clear form of previous inputs
    //$('#formLogin').trigger('reset');
    showView('viewLogin');
}

function showRegisterView() {
    // clear form of previous inputs
    //$('#formRegister').trigger('reset');
    showView('viewRegister');
}

function showCreateAdView() {
    // clear form of previous inputs
    //$('#formCreateAd').trigger('reset');
    showView('viewCreateAd');
}


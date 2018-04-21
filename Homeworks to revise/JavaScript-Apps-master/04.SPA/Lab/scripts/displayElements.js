function showView(viewName) {
    $('main > section').hide() // Hide all views
    $('#' + viewName).show() // Show the selected view only
}

function showHideMenuLinks() {
    $("#linkHome").show()
    if (sessionStorage.getItem('authToken') === null) { // No logged in user
        $("#linkLogin").show()
        $("#linkRegister").show()
        $("#linkListBooks").hide()
        $("#linkCreateBook").hide()
        $("#linkLogout").hide()
        $('#loggedInUser').text("");
    } else { // We have logged in user
        $("#linkLogin").hide()
        $("#linkRegister").hide()
        $("#linkListBooks").show()
        $("#linkCreateBook").show()
        $("#linkLogout").show()
        $('#loggedInUser').text("Welcome, " + sessionStorage.getItem('username') + "!")
    }
}



function showHomeView() {
    showView('viewHome')
}

function showLoginView() {
    showView('viewLogin')
    $('#formLogin').trigger('reset')
}

function showRegisterView() {
    $('#formRegister').trigger('reset')
    showView('viewRegister')
}

function showCreateBookView() {
    $('#formCreateBook').trigger('reset')
    showView('viewCreateBook')
}
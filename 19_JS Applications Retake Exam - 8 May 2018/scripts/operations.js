// constants of the application
const BASE_URL = `https://baas.kinvey.com/`;
const APP_KEY = '';
const APP_SECRET = '';
const AUTH_HEADERS = {
    'Authorization': 'Basic ' + btoa(APP_KEY + ':' + APP_SECRET)
};

// Session functionality (logout, login, register, etc.)
// Session operations --- START -----------------------------------------------
function registerUser(event) {
    $('#errorBox').hide();
    event.preventDefault(); // not sure if needed, just in case
    let usernameBox = $('#formRegister input[name=username]');
    let passwordBox = $('#formRegister input[name=password]');
    let repeatPassBox = $('#formRegister input[name=repeatPass]');

    //•	You need to validate the input.  
    // A username should be a string with at least 5 characters long.
    // Passwords input fields shouldn’t be empty. 
    // Both passwords should match. 
    // TO DO
    if (usernameBox.val() === '' || passwordBox.val() === '' || repeatPassBox.val() === '') {
        showError("Username and passwords cannot be empty. Please fill out all fields.");
        return;
    }

    if (!validCredentials(usernameBox.val(), passwordBox.val())) {
        showError(`Invalid username or password format. 
        A username should be at least 5 characters long.
        Password fields cannot be empty.`);
        return;
    }

    if (passwordBox.val() !== repeatPassBox.val()) {
        showError("Passwords should match.");
        return;
    }

    let userData = {
        username: escapeHtml(usernameBox.val()),
        password: passwordBox.val(),
        subscriptions: []
    }

    let request = {
        method: 'POST',
        url: BASE_URL + 'user/' + APP_KEY + '/',
        headers: AUTH_HEADERS,
        data: userData,
        success: registerUserSuccess,
        error: handleAjaxError
    }

    $.ajax(request);

    function registerUserSuccess(userInfo) { // the response from registering a user
        // is the user itself that we just registered
        $('#errorBox').hide();
        saveAuthInSession(userInfo);
        showInfo('User registration successful.');
        //loadFeed();
        // clear form for next user
        $('#formRegister').trigger('reset');
    }
}


function logoutUser() {
    //The “logout” REST service at the back-end should be obligatory called at logout.
    $.ajax({
        method: 'POST',
        url: BASE_URL + 'user/' + APP_KEY + '/_logout',
        headers: {
            'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
        },
        success: logoutUserSuccess,
        error: handleAjaxError
    });

    function logoutUserSuccess() {
        sessionStorage.clear();
        showInfo('Logout successful.');
        //loadHome();
    }
}

function loginUser(event) {
    $('#errorBox').hide();
    event.preventDefault(); // not needed just in case
    let username = $('#formLogin input[name=username]');
    let password = $('#formLogin input[name=password]');

    // validation
    if (username.val() === '' || password.val() === '') {
        showError("Username and password cannot be empty. Please fill out both fields.");
        return;
    }

    if (!validCredentials(username.val(), password.val())) {
        showError(`Invalid username or password format. 
        A username should be at least 5 characters long.
        Password fields cannot be empty.`);
        return;
    }

    let userData = {
        username: username.val(),
        password: password.val()
    }

    let request = {
        method: 'POST',
        url: BASE_URL + 'user/' + APP_KEY + '/login',
        headers: AUTH_HEADERS,
        data: userData,
        success: loginUserSuccess,
        error: handleAjaxError
    }

    $.ajax(request);

    function loginUserSuccess(userInfo) { // the response from loggin in a user
        // is the user itself that we just logged in with
        $('#errorBox').hide();
        saveAuthInSession(userInfo);
        loadFeed();
        showInfo('Login successful.');
        // clear form for next user
        $('#formLogin').trigger('reset');
    }
}
// Session operations --- END -----------------------------------------------

// GRUD operations --- START ----------------------------------

// GRUD operations with messages --- END -------------------------------------
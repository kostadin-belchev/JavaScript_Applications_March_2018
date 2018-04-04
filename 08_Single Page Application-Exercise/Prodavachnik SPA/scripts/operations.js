// constants of the application
const BASE_URL = `https://baas.kinvey.com/`;
const APP_KEY = 'kid_SJL641Giz';
const APP_SECRET = '8b67885659bc4ac5a83733484305c14b';

// Session functionality (logout, login, register, etc.)
function registerUser() {
    let userData = {
        username: $('#formRegister input[name=username]').val(),
        password: $('#formRegister input[name=passwd]').val()
    }

    let request = {
        method: 'POST',
        url: BASE_URL + 'user/' + APP_KEY + '/',
        headers: {
            'Authorization': 'Basic ' + btoa(APP_KEY + ':' + APP_SECRET)
        },
        data: userData,
        success: registerUserSuccess,
        error: handleAjaxError
    }

    $.ajax(request);

    function registerUserSuccess(userInfo) { // the response from registering a user
        // is the user itself that we just registered
        saveAuthInSession(userInfo);
        showHideMenuLinks();
        listAds();
        showInfo('User registered successfully.');
    }
}

function loginUser() {
    let userData = {
        username: $('#formLogin input[name=username]').val(),
        password: $('#formLogin input[name=passwd]').val()
    }

    let request = {
        method: 'POST',
        url: BASE_URL + 'user/' + APP_KEY + '/login',
        headers: {
            'Authorization': 'Basic ' + btoa(APP_KEY + ':' + APP_SECRET)
        },
        data: userData,
        success: loginUserSuccess,
        error: handleAjaxError
    }

    $.ajax(request);

    function loginUserSuccess(userInfo) { // the response from loggin in a user
        // is the user itself that we just logged in with
        saveAuthInSession(userInfo);
        showHideMenuLinks();
        listAds();
        showInfo('User log in successful.');
    }
}

function logoutUser() {
    sessionStorage.clear();
    showHideMenuLinks();
    showHomeView();
    showInfo('User log out successful.');
}


// GRUD functionality for the ads
function listAds() {
    showView('viewAds');
    let ads = $('#ads');
    $.ajax({
        
    })    
}

function createAdvert() {
     // TO DO
}

function editAdvert() {
     // TO DO
}

// auxiliary functions
function saveAuthInSession(userInfo) {
    // saves authtoken, user id and username to sessionStorage
    sessionStorage.setItem('username', userInfo.username);
    sessionStorage.setItem('authToken', userInfo._kmd.authtoken);
    sessionStorage.setItem('userId', userInfo._id);
}

function handleAjaxError(response) {
    let errorMsg = JSON.stringify(response)
    if (response.readyState === 0)
        errorMsg = "Cannot connect due to network error."
    if (response.responseJSON && response.responseJSON.description)
        errorMsg = response.responseJSON.description
    showError(errorMsg)
}


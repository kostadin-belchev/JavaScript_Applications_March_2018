// constants of the application
const BASE_URL = `https://baas.kinvey.com/`;
const APP_KEY = 'kid_SJL641Giz';
const APP_SECRET = '8b67885659bc4ac5a83733484305c14b';

// Session functionality (logout, login, register, etc.)
function registerUser() {
    console.log('attemping to register user');
    
    let userData = {
        username: $('#formRegister input[name=username]').val(),
        password: $('#formRegister input[name=passwd]').val()
    }

    let request = {
        method: 'POST',
        url: BASE_URL + 'user/' + APP_KEY + '/',
        headers: getKinveyUserHeaders,
        data: userData,
        success: registerUserSuccess,
        error: handleAjaxError
    }

    $.ajax(request);

    function registerUserSuccess(userInfo) { // the response from registering a user
        // is the user itself that we just registered
        saveAuthInSession(userInfo);
        showHideMenuLinks();
        listBooks();
        showInfo('User registered successfully.');
    }
}

function loginUser() {
    
}

function logoutUser() {
    // TO DO
}


// GRUD functionality for the ads
function listAds() {
    showView('viewAds');

}

function createAdvert() {
     // TO DO
}

function editAdvert() {
     // TO DO
}

// auxiliary functions
function getKinveyUserHeaders() {
    return {
        'Authorization': 'Basic ' + btoa(APP_KEY + ':' + APP_SECRET)
    }
}

function handleAjaxError(response) {
    let errorMsg = JSON.stringify(response)
    if (response.readyState === 0)
        errorMsg = "Cannot connect due to network error."
    if (response.responseJSON && response.responseJSON.description)
        errorMsg = response.responseJSON.description
    showError(errorMsg)
}


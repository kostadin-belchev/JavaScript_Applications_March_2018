// constants of the application
const BASE_URL = `https://baas.kinvey.com/`;
const APP_KEY = 'kid_SJ87Y2KnM';
const APP_SECRET = '1a500685e543479bb57324fedafff533';
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
        loadFeed();
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
        loadHome();
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

// GRUD operations with products --- START ----------------------------------
async function loadFeed() {
    // console.log('loadFeed() TO DO');
    // The feed screen contains all chirps from subscriptions or 
    // people that the user is following (sorted by time posted in 
    // descending). It also contains the create a chirp form.
    // GET https://baas.kinvey.com/appdata/app_key/chirps?query={"author":"username"}&sort={"_kmd.ect": 1}
    let username = sessionStorage.getItem('username');
    $.ajax({
        url: `https://baas.kinvey.com/appdata/${APP_KEY}/chirps?query={"author":"${username}"}&sort={"_kmd.ect": 1}`,
        headers: {
            'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken'),
        },
        success: chirpsLoadedSuccess,
        error: handleAjaxError
    });

    async function chirpsLoadedSuccess(chirps) {
        //console.log(chirps);
        for (const chirp of chirps) {
            chirp.date = calcTime(chirp._kmd.ect );
        }

        // Get the stats with 3 requests
        let chirpsCount = 0;
        let followingCount = 0;
        let followersCount = 0;

        await $.ajax({
            url: `https://baas.kinvey.com/appdata/${APP_KEY}/chirps?query={"author":"${username}"}`,
            headers: {
                'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken'),
            }
        }).then(function (chirpsArray) {chirpsCount = chirpsArray.length}).catch(handleAjaxError);

        await $.ajax({
            url: `https://baas.kinvey.com/user/${APP_KEY}/?query={"username":"${username}"}`,
            headers: {
                'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken'),
            }
        }).then(function (user) {
            // console.log('user data: ');
            // console.log(user);
            if (user[0].subscriptions === undefined) {
                user[0].subscriptions = [];
            }
            followingCount = user[0].subscriptions.length
            }).catch(handleAjaxError);

        await $.ajax({
            url: `https://baas.kinvey.com/user/${APP_KEY}/?query={"subscriptions":"${username}"}`,
            headers: {
                'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken'),
            }
        }).then(function (usersSubscribedToUsername) {followersCount = usersSubscribedToUsername.length}).catch(handleAjaxError);

        let context = {
            user: {
                isAuthenticated: sessionStorage.getItem('authToken') !== null,
                username: sessionStorage.getItem('username')
            },
            chirps,
            chirpsCount,
            followingCount,
            followersCount
        };
        await containerFiller(context, './templates/feed.hbs', '#main');
    }
}

function postChirp(event) {
    event.preventDefault();
    //console.log('postChirp() TO DO');
    // POST https://baas.kinvey.com/appdata/app_key/chirps
    let username = sessionStorage.getItem('username');
    let textAreaBox = $($('.chirp-input')[0]);
    //A chirp text shouldn’t be empty and shouldn’t contain more than 150 symbols.
    if (!validChirp(textAreaBox.val())) {
         showError(`Invalid chirp format. 
        A chirp should no more than 150 characters long.
        A chirp cannot be empty.`);
        return;
    }

    let chirpData = {
        "text": escapeHtml(textAreaBox.val()),
        "author": username
    };
    //console.log(chirpData);
    
    $.ajax({
        method: 'POST',
        url: `https://baas.kinvey.com/appdata/${APP_KEY}/chirps`,
        headers: {
            'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken'),
        },
        data: chirpData,
        success: createChirpSuccess,
        error: handleAjaxError
    });

    async function createChirpSuccess(response) {
        showInfo('Chirp published.');
        loadMe();
        // Clear the create chirp input field after successful creation.
        textAreaBox.val('');
    }
}

function loadMe() {
    console.log('loadMe TO DO')
    
}

// function discardProduct(product_id) {
//     //console.log('discardProduct TO DO')
//     // Successfully logged in users should be able to discard the products they purchased 
//     // by clicking on the [Discard] button in the table of product in the Cart view.
//     // The Deletion, should delete the whole product, regardless of its quantity.
//      // Step 1, get user cart
//     let userId = sessionStorage.getItem('userId');
//     $.ajax({
//         url: `https://baas.kinvey.com/user/${APP_KEY}/${userId}`,
//         headers: {
//             'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken'),
//         },
//         success: getUserSuccess,
//         error: handleAjaxError
//     });

//     async function getUserSuccess(user) {
//         //console.log(user);
//         // Step 2, update by deleting element from cart and submit user to datebase again
//         // console.log('product_id:');
//         // console.log(product_id);
//         let newCart = user.cart;
//         delete newCart[product_id];
//         // console.log('newCart:');
//         // console.log(newCart);
//         user.cart = newCart;
//         let updatedUserData = user;

//         $.ajax({
//             method: 'PUT',
//             url: `https://baas.kinvey.com/user/${APP_KEY}/${user._id}`,
//             headers: {
//             'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken'),
//             },
//             data: updatedUserData,
//             success: updatedUserWithNewCartSuccess,
//             error: handleAjaxError
//         });

//         function updatedUserWithNewCartSuccess(res) {
//             // After successful product discard a notification message “Product discarded.” should be shown.
//             showInfo('Product discarded.');
//             loadCart();
//         }
//     }
// }
// GRUD operations with messages --- END -------------------------------------

// Helper functions --- START -----------------------------------------------
function saveAuthInSession(userInfo) {
    // saves authtoken, user id and username to sessionStorage
    sessionStorage.setItem('username', userInfo.username);
    sessionStorage.setItem('authToken', userInfo._kmd.authtoken);
    sessionStorage.setItem('userId', userInfo._id);
    sessionStorage.setItem('subscriptionsArray', JSON.stringify(userInfo.subscriptions));
}

function showInfo(message) {
    let infoBox = $('#infoBox');
    infoBox.find('span').text(message);
    infoBox.show();
    setTimeout(function () {
        $('#infoBox').fadeOut()
    }, 3000)
}

function showError(errorMsg) {
    let errorBox = $('#errorBox');
    errorBox.find('span').text("Error: " + errorMsg);
    errorBox.show();
}

function handleAjaxError(response) {
    let errorMsg = JSON.stringify(response)
    if (response.readyState === 0)
        errorMsg = "Cannot connect due to network error."
    if (response.responseJSON && response.responseJSON.description)
        errorMsg = response.responseJSON.description
    showError(errorMsg)
}

// HTML escaping
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function validCredentials(username, password) {
    const regexUsername = /^[a-zA-Z0-9_]{5,}$/gm;
    const regexPasword = /^[a-zA-Z0-9_]{1,}$/gm;
    if (!regexUsername.test(username)) {
        //console.log('before returning false 1');
        return false;
    } else if (!regexPasword.test(password)) {
        //console.log('before returning false 2');
        return false;
    }
    //console.log('before returning true');
    return true;
}

function validChirp(chirpText) {
    if (chirpText.length < 1 || chirpText.length > 150) {
        return false;
    }
    return true;
}

function calcTime(dateIsoFormat) {
    let diff = new Date - (new Date(dateIsoFormat));
    diff = Math.floor(diff / 60000);
    if (diff < 1) return 'less than a minute';
    if (diff < 60) return diff + ' minute' + pluralize(diff);
    diff = Math.floor(diff / 60);
    if (diff < 24) return diff + ' hour' + pluralize(diff);
    diff = Math.floor(diff / 24);
    if (diff < 30) return diff + ' day' + pluralize(diff);
    diff = Math.floor(diff / 30);
    if (diff < 12) return diff + ' month' + pluralize(diff);
    diff = Math.floor(diff / 12);
    return diff + ' year' + pluralize(diff);
    function pluralize(value) {
        if (value !== 1) return 's';
        else return '';
    }
}
// Helper functions --- END -----------------------------------------------
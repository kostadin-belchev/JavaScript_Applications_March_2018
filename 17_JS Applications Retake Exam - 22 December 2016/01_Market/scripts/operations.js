// constants of the application
const BASE_URL = `https://baas.kinvey.com/`;
const APP_KEY = 'kid_HJKboP_3G';
const APP_SECRET = 'bee136a084d048b6b39bd2fc8c1ba412';
const AUTH_HEADERS = {
    'Authorization': 'Basic ' + btoa(APP_KEY + ':' + APP_SECRET)
};

// Session functionality (logout, login, register, etc.)
// Session operations --- START -----------------------------------------------
function registerUser(event) {
    $('#errorBox').hide();
    event.preventDefault(); // not needed just in case
    let username = $('#registerUsername');
    let password = $('#registerPasswd');
    let registerName = $('#registerName');

    //Form validation is already implemented in the HTML, so you don’t need to add it.


    let userData = {
        username: escapeHtml(username.val()),
        password: password.val(),
        name: registerName.val(),
        cart: {}
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
        loadHomeLogged();
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
    let username = $('#loginUsername');
    let password = $('#loginPasswd');
    // Form validation is already implemented in the HTML, so you don’t need to add it.
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
        loadHomeLogged();
        showInfo('Login successful.');
        // clear form for next user
        $('#formLogin').trigger('reset');
    }
}
// Session operations --- END -----------------------------------------------

// GRUD operations with products --- START ----------------------------------
async function loadShop() {
    //Successfully logged users after clicking the [Shop] link should be able to view all products
    // GET https://baas.kinvey.com/appdata/app_id/products
    $.ajax({
        url: `https://baas.kinvey.com/appdata/${APP_KEY}/products`,
        headers: {
            'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken'),
        },
        success: productsLoadedSuccess,
        error: handleAjaxError
    });

    async function productsLoadedSuccess(products) {
        //console.log(products);
        // All prices should be rounded, the default way (0.505 == 0.51, 0.504 == 0.50)
        // to the second digit after the decimal point, 
        // and printed the same way. 
        for (const product of products) {
            product.price = Number(product.price).toFixed(2);
        }
        let context = {
            user: {
                isAuthenticated: sessionStorage.getItem('authToken') !== null,
                username: sessionStorage.getItem('username')
            },
            products
        };
        await containerFiller(context, './templates/shop.hbs', '#app');
    }
}

function loadCart() {
    // GET https://baas.kinvey.com/user/app_id/user_Id
    let userId = sessionStorage.getItem('userId');
    $.ajax({
        url: `https://baas.kinvey.com/user/${APP_KEY}/${userId}`,
        headers: {
            'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken'),
        },
        success: getUserDataSuccess,
        error: handleAjaxError
    });

    async function getUserDataSuccess(userData) {
        //console.log(userData);
        let cartObject = userData.cart;
        //console.log(cartObject);
        let cartProducts = [];
        for (const key in cartObject) {
            if (cartObject.hasOwnProperty(key)) {
                const cartItem = cartObject[key];
                let data = {};
                data.id = key;
                data.qty = Number(cartItem.quantity);
                        data.price = Number(cartItem.product.price);
                        data.name = cartItem.product.name;
                        data.description = cartItem.product.description;
                //console.log(data);
                data.totalPrice = (data.qty * data.price).toFixed(2);
                cartProducts.push(data);
            }
        }
        //console.log(cartProducts);
        
        let context = {
            user: {
                isAuthenticated: sessionStorage.getItem('authToken') !== null,
                username: sessionStorage.getItem('username')
            },
            cartProducts
        };

        await containerFiller(context, './templates/cart.hbs', '#app');
    }
}

function purchaseProduct(product_id) {
    console.log('purchase TO DO')
    // $.ajax({
    //     method: 'DELETE',
    //     url: `https://baas.kinvey.com/appdata/${APP_KEY}/messages/${msg_id}`,
    //     headers: {
    //         'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken'),
    //     },
    //     success: deleteMessageSuccess,
    //     error: handleAjaxError
    // });

    // function deleteMessageSuccess(res) {
    //     showInfo('Message deleted.');
    //     loadArchive();
    // }
}

function discardProduct(prod_id) {
    console.log('discardProduct TO DO')
    
}
// GRUD operations with messages --- END -------------------------------------

// Helper functions --- START -----------------------------------------------
function saveAuthInSession(userInfo) {
    // saves authtoken, user id and username to sessionStorage
    sessionStorage.setItem('username', userInfo.username);
    sessionStorage.setItem('authToken', userInfo._kmd.authtoken);
    sessionStorage.setItem('userId', userInfo._id);
    sessionStorage.setItem('name', userInfo.name);
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

function formatDate(dateISO8601) {
    let date = new Date(dateISO8601);
    if (Number.isNaN(date.getDate()))
        return '';
    return date.getDate() + '.' + padZeros(date.getMonth() + 1) +
        "." + date.getFullYear() + ' ' + date.getHours() + ':' +
        padZeros(date.getMinutes()) + ':' + padZeros(date.getSeconds());

    function padZeros(num) {
        return ('0' + num).slice(-2);
    }
}
// Helper functions --- END -----------------------------------------------
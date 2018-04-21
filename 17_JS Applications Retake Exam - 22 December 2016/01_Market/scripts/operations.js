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
    //console.log('purchase TO DO')
    // Step 1, get user cart
    let userId = sessionStorage.getItem('userId');
    $.ajax({
        url: `https://baas.kinvey.com/user/${APP_KEY}/${userId}`,
        headers: {
            'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken'),
        },
        success: getUserSuccess,
        error: handleAjaxError
    });

    async function getUserSuccess(user) {
        //console.log(user)
        if (user.cart === undefined) {
            user.cart = {};
        }
        let itemIds = Object.keys(user.cart);
        //console.log(itemIds);
        let newCart = user.cart;
        //console.log('product_id:');
        //console.log(product_id);
        if (!itemIds.includes(product_id)) {
            // Step 1.5, get the product to update cart
            $.ajax({
                url: `https://baas.kinvey.com/appdata/${APP_KEY}/products/${product_id}`,
                headers: {
                    'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken'),
                },
                success: gotProductSuccess,
                error: handleAjaxError
            });
            function gotProductSuccess(product) {
                //console.log(product);
                let itemToAdd = {
                    "quantity": "1",
                    "product": {
                        "name": product.name,
                        "description": product.description,
                        "price": product.price
                    }
                }
                //console.log('itemToAdd:');
                //console.log(itemToAdd);
                newCart[product_id] = itemToAdd;
                // Step 2, update cart and submit user to datebase again
                user.cart = newCart;
                let updatedUserData = user;

                $.ajax({
                    method: 'PUT',
                    url: `https://baas.kinvey.com/user/${APP_KEY}/${user._id}`,
                    headers: {
                    'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken'),
                    },
                    data: updatedUserData,
                    success: updatedUserWithNewCartSuccess,
                    error: handleAjaxError
                });

                function updatedUserWithNewCartSuccess(res) {
                    showInfo('Product purchased.');
                }
            }
            
        } else {
            // console.log('user.cart[product_id].quantity:');
            // console.log(newCart[product_id].quantity);
            // console.log('user.cart.product_id.quantity:')
            // console.log(newCart.product_id.quantity);
            //newCart.product_id.quantity++;
            newCart[product_id].quantity++;
            //Step 2, update cart and submit user to datebase again
            user.cart = newCart;
            let updatedUserData = user;

            $.ajax({
                method: 'PUT',
                url: `https://baas.kinvey.com/user/${APP_KEY}/${user._id}`,
                headers: {
                'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken'),
                },
                data: updatedUserData,
                success: updatedUserWithNewCartSuccess,
                error: handleAjaxError
            });

            function updatedUserWithNewCartSuccess(res) {
                showInfo('Product quantity increased by 1. See Cart for more details.');
            }
        }
    }
}

function discardProduct(product_id) {
    //console.log('discardProduct TO DO')
    // Successfully logged in users should be able to discard the products they purchased 
    // by clicking on the [Discard] button in the table of product in the Cart view.
    // The Deletion, should delete the whole product, regardless of its quantity.
     // Step 1, get user cart
    let userId = sessionStorage.getItem('userId');
    $.ajax({
        url: `https://baas.kinvey.com/user/${APP_KEY}/${userId}`,
        headers: {
            'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken'),
        },
        success: getUserSuccess,
        error: handleAjaxError
    });

    async function getUserSuccess(user) {
        //console.log(user);
        // Step 2, update by deleting element from cart and submit user to datebase again
        // console.log('product_id:');
        // console.log(product_id);
        let newCart = user.cart;
        delete newCart[product_id];
        // console.log('newCart:');
        // console.log(newCart);
        user.cart = newCart;
        let updatedUserData = user;

        $.ajax({
            method: 'PUT',
            url: `https://baas.kinvey.com/user/${APP_KEY}/${user._id}`,
            headers: {
            'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken'),
            },
            data: updatedUserData,
            success: updatedUserWithNewCartSuccess,
            error: handleAjaxError
        });

        function updatedUserWithNewCartSuccess(res) {
            // After successful product discard a notification message “Product discarded.” should be shown.
            showInfo('Product discarded.');
            loadCart();
        }
    }
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
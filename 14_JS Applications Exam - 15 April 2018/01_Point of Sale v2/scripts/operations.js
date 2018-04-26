// constants of the application
const BASE_URL = `https://baas.kinvey.com/`;
const APP_KEY = 'kid_HJlVnRl3z';
const APP_SECRET = 'f79816c8aef64aa3922cb112a8ad852b';
const AUTH_HEADERS = {
    'Authorization': 'Basic ' + btoa(APP_KEY + ':' + APP_SECRET)
};

// Session functionality (logout, login, register, etc.)
function registerUser(event) {
    $('#errorBox').hide();
    event.preventDefault(); // not needed just in case
    let username = $('#username-register');
    let password = $('#password-register');
    let repeatPassword = $('#password-register-check');
    // Validate the input
    // A username should be at least 3 characters long and should contain only 
    // english alphabet letters. A user‘s password should be at least 6 characters long 
    // and should contain only english alphabet letters and digits. 
    // Both passwords should match. 
    if (username.val() === '' || password.val() === '' || repeatPassword.val() === '') {
        showError("Username and passwords cannot be empty. Please fill out all fields.");
        return;
    }

    if (!validCredentials(username.val(), password.val())) {
        showError(`Invalid username or password format. 
        A username should be at least 5 characters long.
        Password fields cannot be empty.`);
        return;
    }

    if (password.val() !== repeatPassword.val()) {
        showError("Passwords should match.");
        return;
    }

    let userData = {
        username: username.val(),
        password: password.val()
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
        createActiveReceipt();
        showInfo('User registration successful.');
        // clear form for next user
        $('#register-form').trigger('reset');
    }
}

function createActiveReceipt() {
    $.ajax({
        method: 'POST',
        url: BASE_URL + 'appdata/' + APP_KEY + '/receipts',
        headers: {
            'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken'),
            'Content-Type': 'application/json'
        },
        data: JSON.stringify({
            'active': true,
            'productCount': 0,
            'total': 0
        })
    }).then(async function (resp) {
        //showInfo("Active receipt created!");
        loadEditor();
    })
    .catch(handleAjaxError)
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
    let username = $('#username-login');
    let password = $('#password-login');

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
        showInfo('Login successful.');
        // clear form for next user
        $('#login-form').trigger('reset');
        loadEditor();
    }
}

function loadEditor() {
    //Get Active Receipt
    // https://baas.kinvey.com/appdata/app_key/receipts?query={"_acl.creator":"userId","active":true}
    // GET -> BASE_URL + 'appdata/' + APP_KEY + '/receipts'
    let userId = sessionStorage.getItem('userId');
    // let entriesForReceipt;

    $.ajax({
        url: BASE_URL + 'appdata/' + APP_KEY + `/receipts?query={"_acl.creator":"${userId}","active":true}`,
        headers: {
            'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
        },
        success: loadActiveReceiptSuccess,
        error: handleAjaxError
    });

    //async function loadReceiptsSuccess(receipts) {
    async function loadActiveReceiptSuccess(activeReceiptArray) {
        //console.log(activeReceiptArray);
        if (activeReceiptArray.length === 0) {
            // means that there is no active receipt currently in the database, then we create it
            //console.log('No active receipt present in database.');
            showInfo('No active receipt present in database. We created one for you.');
            createActiveReceipt();
            return;
            // after this we should be able to pass this if
        }

        loadEntries();
        // do a request to get all entries with the receiptId we have
        //GET https://baas.kinvey.com/appdata/app_key/entries?query={"receiptId":"receiptId"}
        async function loadEntries() {
            let activeReceipt = activeReceiptArray[0];
            // console.log('activeReceipt:');
            // console.log(activeReceipt);
            $.ajax({
                url: BASE_URL + 'appdata/' + APP_KEY + `/entries?query={"receiptId":"${activeReceipt._id}"}`,
                headers: {
                    'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
                },
                success: getEntriesByReceiptId,
                error: handleAjaxError
            });

            async function getEntriesByReceiptId(entries) {
                // console.log('entries:');
                // console.log(entries);
                let totalForReceipt = 0;
                let products = 0;
                for (const key in entries) {
                    if (entries.hasOwnProperty(key)) {
                        const entry = entries[key];
                        entry.subTotal = ((entry.qty * entry.price).toFixed(2));
                        products += Number(entry.qty);
                        totalForReceipt += Number(entry.subTotal);
                    }
                }
               
                //console.log(totalForReceipt);
                activeReceipt.total = totalForReceipt.toFixed(2);
                activeReceipt.productCount = products;
                let context = {
                    entries,
                    activeReceipt,
                    user: {
                        isAuthenticated: sessionStorage.getItem('authToken') !== null,
                        username: sessionStorage.getItem('username')
                    }
                };
                // console.log('context:');
                // console.log(context);
                //console.log(activeReceipt._id);
                await containerFiller(context, './templates/create-receipt.hbs', '#container');
            }
        }
    }
}

function addEntry(event) {
    event.preventDefault();
    //console.log('starting to add entry');

    let typeBox = $('#create-entry-form input[name=type]');
    let qtyBox = $('#create-entry-form input[name=qty]');
    let priceBox = $('#create-entry-form input[name=price]');
    let receiptId = $('#create-receipt-form input[name=receiptId]').val();
    //!!!!!!!!!!!!! TO DO validate further!!!!!!!!!!!!!!!!!!!!!!!!!!
    if (typeBox.val() === '') {
        showError('Product name must be a non-empty string');
        return;
    }
    // also Quantity must be a number and price must be a number
    if (isNaN(Number(qtyBox.val())) || isNaN(Number(priceBox.val())) || qtyBox.val() === '' || priceBox.val() === '' || !Number.isInteger(Number(qtyBox.val()))) {
        showError('Quantity must be a non-empty integer number. Price must be a non-empty number.');
        return;
    }

    // Update the value of Sub-total and Total in real time, whenever the user changes Quantity or Price to a valid value. 
    // TO DO

    let entryData = JSON.stringify({
        receiptId: receiptId,
        price: Number(Number(priceBox.val()).toFixed(2)),
        qty: Number(qtyBox.val()),
        type: typeBox.val(),
    });
    //console.log(entryData);
    // save post in database
    // POST -> BASE_URL + 'appdata/' + APP_KEY + '/entries'
    $.ajax({
        method: 'POST',
        url: BASE_URL + 'appdata/' + APP_KEY + '/entries',
        headers: {
            'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken'),
            'Content-Type': 'application/json'
        },
        data: entryData,
        success: createEntrySuccess,
        error: handleAjaxError
    });

    function createEntrySuccess(response) {
        $('#errorBox').hide();
        //$('#submitForm').trigger('clear');
        // clear all input values
        $('#create-entry-form').trigger('reset');
        showInfo('Entry added');
        loadEditor();
    }
}

function removeEntry(entryIdToDelete) {
    // DELETE -> BASE_URL + 'appdata/' + APP_KEY + '/entries/' + entryIdToDelete
    $.ajax({
        method: 'DELETE',
        url: BASE_URL + 'appdata/' + APP_KEY + '/entries/' + entryIdToDelete,
        headers: {
            'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
        },
        success: deleteEntrySuccess,
        error: handleAjaxError
    });

    function deleteEntrySuccess(response) {
        loadEditor();
        showInfo('Entry removed');
    }
}

function checkOut(event) {
    event.preventDefault();
    // Before carrying out any actions, make sure the receipt contains at least one entry
    // – the user should not be able to checkout an empty receipt!
    let activeEntriesDiv = $('#active-entries');
    //console.log($(activeEntriesDiv).children());
    if ($(activeEntriesDiv).children().length === 0) {
        showError('Cannot checkout an empty receipt.')
        return;
    }

    let receiptIdBox = $('#create-receipt-form input[name=receiptId]');
    let productCountBox = $('#create-receipt-form input[name=productCount]');
    let totalBox = $('#create-receipt-form input[name=total]');
    // PUT  https://baas.kinvey.com/appdata/app_key/receipts/receipt_id
    let receiptData = {
        active: false,
        productCount: Number(productCountBox.val()),
        total: Number(totalBox.val()),
    };

    $.ajax({
        method: 'PUT',
        url: BASE_URL + 'appdata/' + APP_KEY + '/receipts/' + receiptIdBox.val(),
        headers: {
            'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken'),
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(receiptData),
        success: commitReceiptSuccess,
        error: handleAjaxError
    });

    function commitReceiptSuccess(response) {
        // Prepare the editor for a new receipt by creating it in the database
        // and clearing the screen of any old information.
        showInfo('Receipt checked out');
        createActiveReceipt();
    }
}

function loadAllMyReceipts() {
    // Display a list of all receipts that the user has created.
    // Use the stored user ID to retrieve only the relevant records. 
    //Every receipt must have a link that leads to its details.
    // The user should see only his or her receipts.
    // GET https://baas.kinvey.com/appdata/app_key/receipts?query={"_acl.creator":"userId","active":"false"}
    $.ajax({
        url: BASE_URL + 'appdata/' + APP_KEY + `/receipts?query={"_acl.creator":"${sessionStorage.getItem('userId')}","active":false}`,
        headers: {
            'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken'),
        },
        success: loadAllMyReceiptsSuccess,
        error: handleAjaxError
    });

    async function loadAllMyReceiptsSuccess(allMyReceipts) {
        //console.log(allMyReceipts);
        let grandTotal = 0;
        for (const key in allMyReceipts) {
            if (allMyReceipts.hasOwnProperty(key)) {
                const receipt = allMyReceipts[key];
                grandTotal += Number(receipt.total);
                receipt.date = formatDate(receipt._kmd.ect)
            }
        }
        let context = {
            allMyReceipts,
            grandTotal,
            user: {
                isAuthenticated: sessionStorage.getItem('authToken') !== null,
                username: sessionStorage.getItem('username')
            }
        }
        await containerFiller(context, './templates/overview.hbs', '#container');
    }
}

function seeDetailsOfReceipt(idOfReceiptToView) {
    // GET https://baas.kinvey.com/appdata/app_key/receipts/receipt_id
    $.ajax({
        url: `https://baas.kinvey.com/appdata/${APP_KEY}/receipts/${idOfReceiptToView}`,
        headers: {
            'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken'),
        },
        success: seeDetailsOfReceiptSuccess,
        error: handleAjaxError
    });
    async function seeDetailsOfReceiptSuccess(receiptToView) {
        //console.log(receiptToView);
        let receipId = receiptToView._id;
        //console.log(receipId);
        let entriesForReceipt;
        //https://baas.kinvey.com/appdata/app_key/entries?query={"receiptId":"receiptId"}
        $.ajax({
            url: `https://baas.kinvey.com/appdata/${APP_KEY}/entries?query={"receiptId":"${receipId}"}`,
            headers: {
                'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken'),
            },
            success: atSuccess,
            error: handleAjaxError
        });
        async function atSuccess(res) {
            //console.log(res);
            entriesForReceipt = res;
            //if (sessionStorage.getItem('userId') === receiptToView._acl.creator) {
                for (const entry of entriesForReceipt) {
                    entry.subTotal = (entry.qty * entry.price).toFixed(2);
                }
                let context = {
                    receiptToView,
                    entriesForReceipt,
                    user: {
                        isAuthenticated: sessionStorage.getItem('authToken') !== null,
                        username: sessionStorage.getItem('username')
                    }
                };
    
                await containerFiller(context, './templates/receiptDetails.hbs', '#container');
            // } else {
            //     showError('Can view only your receipts.')
            //     return;
            // }
        }
    }
}

// helper functions ------------------------------------------------------------
function saveAuthInSession(userInfo) {
    // saves authtoken, user id and username to sessionStorage
    sessionStorage.setItem('username', userInfo.username);
    sessionStorage.setItem('authToken', userInfo._kmd.authtoken);
    sessionStorage.setItem('userId', userInfo._id);
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

function formatSender(name, username) {
    if (!name)
        return username;
    else
        return username + ' (' + name + ')';
}


function precisionRound(number, precision) {
    var factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
  }
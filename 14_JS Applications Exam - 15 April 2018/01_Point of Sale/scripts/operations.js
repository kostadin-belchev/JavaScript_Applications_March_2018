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
        $('#username-register').val('');
        $('#password-register').val('');
        $('#password-register-check').val('');
    }
}

function createActiveReceipt() {
    $.ajax({
        method: 'POST',
        url: BASE_URL + 'appdata/' + APP_KEY + '/receipts',
        headers: {
            'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
        },
        data: {
            'active': true,
            'productCount': 0,
            'total': 0
        }
    }).then(async function (resp) {

        showInfo("Active receipt created!");
        let context = {
            resp,
            user: {
                isAuthenticated: sessionStorage.getItem('authToken') !== null,
                username: sessionStorage.getItem('username')
            }
        }
        // let headerpartial = await $.get('./templates/headerpartial.hbs');
        // Handlebars.registerPartial('headerpartial', headerpartial);
        containerFiller(context, './templates/create-receipt.hbs', '#container')
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
        loadHome();
        showInfo('Logout successful.');
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
        loadHome();
        showInfo('Login successful.');
        // clear form for next user
        $('#username-login').val('');
        $('#password-login').val('');
    }
}

function loadEditor() {
    //Get Active Receipt
    // https://baas.kinvey.com/appdata/app_key/receipts?query={"_acl.creator":"userId","active":true}
    // GET -> BASE_URL + 'appdata/' + APP_KEY + '/receipts'
    let userId = sessionStorage.getItem('userId');
    let activeReceipt;
    let entriesForReceipt;

    $.ajax({
        url: BASE_URL + 'appdata/' + APP_KEY + `/receipts`,
        headers: {
            'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
        },
    }).then(loadReceiptsSuccess).catch(handleAjaxError);

    // $.ajax({
    //     url: BASE_URL + 'appdata/' + APP_KEY + `/receipts?query={"_acl.creator":"${userId}","active":"true"}`,
    //     headers: {
    //         'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
    //     },
    //     success: loadActiveReceiptSuccess,
    //     error: handleAjaxError
    // });

    async function loadReceiptsSuccess(receipts) {
        // console.log(typeof receipts);
        // console.log(receipts);
        for (const key in receipts) {
            if (receipts.hasOwnProperty(key)) {
                const receipt = receipts[key];
                // console.log(receipt);
                if (receipt.active === true || receipt.active === 'true') {
                    activeReceipt = receipt;
                }
                receipt.isEditableReceipt = false;
                if (receipt._acl.creator === sessionStorage.getItem('userId')) {
                    // Bind the event handler with the current post
                    receipt.isEditableReceipt = true;
                }
            }
        }

        loadEntries();
        // do a request to get all entries with the receiptId we have
        //GET https://baas.kinvey.com/appdata/app_key/entries?query={"receiptId":"receiptId"}
        async function loadEntries() {
            await $.ajax({
                url: BASE_URL + 'appdata/' + APP_KEY + `/entries?query={"receiptId":"${activeReceipt._id}"}`,
                headers: {
                    'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
                },
                success: getEntriesByReceiptId,
                error: handleAjaxError
            });

            async function getEntriesByReceiptId(entries) {
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
                entriesForReceipt = entries;
                // console.log("EntriesForReceipt: ");
                // console.log(entriesForReceipt);
                //console.log(totalForReceipt);
                activeReceipt.total = totalForReceipt.toFixed(2);
                activeReceipt.productCount = products;
                let context = {
                    entriesForReceipt,
                    activeReceipt,
                    user: {
                        isAuthenticated: sessionStorage.getItem('authToken') !== null,
                        username: sessionStorage.getItem('username')
                    }
                };
                //console.log('Before request to get partial source');
                // BE CAREFUL TO NOT HAVE AD BLOCK ON BROWSER OTHERWISE WILL GET BLOCKED BY CLIENT ERROR
                // let sourceEntry = await $.get('./templates/entry-partial.hbs');
                // Handlebars.registerPartial('receiptEntry', sourceEntry);
                //console.log(activeReceipt._id);
                await containerFiller(context, './templates/create-receipt.hbs', '#container');
            }
        }
    }
}

function addEntry(event) {
    event.preventDefault();
    console.log('starting to add entry');

    let typeBox = $('#create-entry-form input[name=type]');
    let qtyBox = $('#create-entry-form input[name=qty]');
    let priceBox = $('#create-entry-form input[name=price]');
    let receiptId = $('#create-receipt-form input[name=receiptId]').val();
    // if we do not have description or imageURL we allow the add to be generated, but not without the other
    //!!!!!!!!!!!!! TO DO validate furhter!!!!!!!!!!!!!!!!!!!!!!!!!!
    if (typeBox.val() === '') {
        showError('Product name must be a non-empty string');
        return;
    }
    // also Quantity must be a number and price must be a number
    // TO DO

    // Update the value of Sub-total and Total in real time, whenever the user changes Quantity or Price to a valid value. 
    // TO DO

    let entryData = {
        receiptId,
        price: priceBox.val(),
        qty: qtyBox.val(),
        type: typeBox.val(),
    };
    // save post in database
    // POST -> BASE_URL + 'appdata/' + APP_KEY + '/entries'
    $.ajax({
        method: 'POST',
        url: BASE_URL + 'appdata/' + APP_KEY + '/entries',
        headers: {
            'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
        },
        data: entryData,
        success: createEntrySuccess,
        error: handleAjaxError
    });

    function createEntrySuccess(response) {
        $('#errorBox').hide();
        //$('#submitForm').trigger('clear');
        // clear all input values
        typeBox = $('#create-entry-form input[name=type]').val('');
        qtyBox = $('#create-entry-form input[name=qty]').val('');
        priceBox = $('#create-entry-form input[name=price]').val('');
        loadEditor();
        showInfo('Entry added');
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
    if (activeEntriesDiv.length === 0) {
        showError('Cannot checkout an empty receipt.')
        return;
    }

    let receiptIdBox = $('#create-receipt-form input[name=receiptId]');
    let productCountBox = $('#create-receipt-form input[name=productCount]');
    let totalBox = $('#create-receipt-form input[name=total]');
    // PUT  https://baas.kinvey.com/appdata/app_key/receipts/receipt_id
    // console.log('productCountBox.val() -> ');
    // console.log(productCountBox.val());
    // console.log('Number(productCountBox.val()) -> ');
    // console.log(Number(productCountBox.val()));
    
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
        // POST https://baas.kinvey.com/appdata/app_key/receipts
        let newlyCreatedReceiptData = {
            active: true,
            productCount: 0,
            total: 0
        }

        $.ajax({
            method: 'POST',
            url: `https://baas.kinvey.com/appdata/${APP_KEY}/receipts`,
            headers: {
                'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken'),
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(newlyCreatedReceiptData),
            success: newlyCreatedReceiptSuccess,
            error: handleAjaxError
        });
        function newlyCreatedReceiptSuccess(params) {
            // clear editor of old data
            loadEditor();
            showInfo('Receipt checked out')
        }
        // showInfo('Receipt checked out')
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
            if (sessionStorage.getItem('userId') === receiptToView._acl.creator) {
                let context = {
                    receiptToView,
                    entriesForReceipt,
                    user: {
                        isAuthenticated: sessionStorage.getItem('authToken') !== null,
                        username: sessionStorage.getItem('username')
                    }
                };
    
                await containerFiller(context, './templates/receiptDetails.hbs', '#container');
            } else {
                showError('Can view only your receipts.')
                return;
            }
        }
        
    }
    
}

// async function editPost(idOfPostToEdit) {
//     // Step 1. GET -> BASE_URL + 'appdata/' + APP_KEY + '/posts/' + postIdToEdit lets an app retrieve 
//     // a previously created entity.
//     //console.log(idOfPostToEdit);
//     await loadEditPost();
//     // Step 1
//     $.ajax({
//         url: BASE_URL + 'appdata/' + APP_KEY + '/posts/' + idOfPostToEdit,
//         headers: {
//             'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
//         },
//         success: retrievePostToEditSuccess,
//         error: handleAjaxError
//     });

//     async function retrievePostToEditSuccess(post) {
//         //console.log(post);
//         let url = $('#submitForm input[name=url]');
//         let title = $('#submitForm input[name=title]');
//         let imageUrl = $('#submitForm input[name=image]');
//         let description = $('#submitForm textarea[name=comment]');
//         $('#submitForm').attr('postId', post._id);
//         $('#submitForm').attr('author', post.author);
//         url.val(post.url);
//         title.val(post.title);
//         imageUrl.val(post.imageUrl);
//         description.val(post.description);
//         // when we click on EDIT POST we have already atteched a click event to EDIT POST button so we will
//         // be redirected to below function editAdvert()
//     }
// }

// // we only get the ID so fist we get the post by it's ID and then we fill out the form 
// // with the data then we modify the add and then save again to database
// // Step 2. PUT -> BASE_URL + 'appdata/' + APP_KEY + '/posts/' + postIdToEdit
// function uploadEditedPost(event) {
//     event.preventDefault();
//     let url = $('#submitForm input[name=url]');
//     let title = $('#submitForm input[name=title]');
//     let imageUrl = $('#submitForm input[name=image]');
//     let description = $('#submitForm textarea[name=comment]');
//     let postId = $('#submitForm').attr('postId');
//     let author = $('#submitForm').attr('author');
//     // console.log(postId);
//     // console.log(author);

//     // if we do not have description or imageURL we allow the add to be generated, but not without the other
//     if (!title.val() || !url.val()) {
//         showError('Cannot create post without URL and title.');
//         return;
//     }
//     // also link url should always start with “http”. 
//     // TO DO

//     $('#errorBox').hide();
//     let postData = {
//         author: author,
//         url: url.val(),
//         title: title.val(),
//         imageUrl: imageUrl.val(),
//         description: description.val(),
//     };
//     $.ajax({
//         method: 'PUT',
//         url: BASE_URL + 'appdata/' + APP_KEY + '/posts/' + postId /*$('#formEditAd input[name=id]').val()*/ ,
//         headers: {
//             'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken'),
//             //'Content-Type': 'application/json'
//         },
//         data: postData,
//         success: editPostSuccess,
//         error: handleAjaxError
//     });

//     function editPostSuccess(response) {
//         listPosts();
//         showInfo('Post edited.')
//     }
// }

function listMyPosts() {

}

//CRUD operations with comments
function listCommentsForPost(postId) {

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

// // HTML escaping
// function escapeHtml(unsafe) {
//     return unsafe
//         .replace(/&/g, "&amp;")
//         .replace(/</g, "&lt;")
//         .replace(/>/g, "&gt;")
//         .replace(/"/g, "&quot;")
//         .replace(/'/g, "&#039;");
// }

function precisionRound(number, precision) {
    var factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
  }
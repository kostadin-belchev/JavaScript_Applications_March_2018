// constants of the application
const BASE_URL = `https://baas.kinvey.com/`;
const APP_KEY = 'kid_rkHbssrhM';
const APP_SECRET = '1b8913c295cd47c3928f34d2e8f1de07';
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
        username: username.val(),
        password: password.val(),
        name: registerName.val()
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

// GRUD operations with messages --- START ----------------------------------
function myMessages() {
    // GET https://baas.kinvey.com/appdata/app_id/messages?query={"recipient_username":"username"}
    let username = sessionStorage.getItem('username');
    $.ajax({
        url: `https://baas.kinvey.com/appdata/${APP_KEY}/messages?query={"recipient_username":"${username}"}`,
        headers: {
            'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken'),
        },
        success: getMyMessagesSuccess,
        error: handleAjaxError
    });

    async function getMyMessagesSuccess(messages) {
        //console.log(messages);
        for (const message of messages) {
            message.sender = formatSender(message.sender_name, message.sender_username);
            message.date = formatDate(message._kmd.lmt);
        }
        let context = {
            user: {
                isAuthenticated: sessionStorage.getItem('authToken') !== null,
                username: sessionStorage.getItem('username')
            },
            messages
        };

        await containerFiller(context, './templates/my-messages.hbs', '#app');
    }
}

function loadArchive() {
    // GET https://baas.kinvey.com/appdata/app_id/messages?query={"sender_username":"username"}
    let username = sessionStorage.getItem('username');
    $.ajax({
        url: `https://baas.kinvey.com/appdata/${APP_KEY}/messages?query={"sender_username":"${username}"}`,
        headers: {
            'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken'),
        },
        success: getSentMessagesSuccess,
        error: handleAjaxError
    });

    async function getSentMessagesSuccess(sentMessages) {
        //console.log(sentMessages);
        for (const message of sentMessages) {
            message.date = formatDate(message._kmd.lmt);
        }
        let context = {
            user: {
                isAuthenticated: sessionStorage.getItem('authToken') !== null,
                username: sessionStorage.getItem('username')
            },
            sentMessages
        };

        await containerFiller(context, './templates/sent-archive.hbs', '#app');
    }
}

function deleteMessage(msg_id) {
    // DELETE https://baas.kinvey.com/appdata/app_id/messages/msg_id;
    $.ajax({
        method: 'DELETE',
        url: `https://baas.kinvey.com/appdata/${APP_KEY}/messages/${msg_id}`,
        headers: {
            'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken'),
        },
        success: deleteMessageSuccess,
        error: handleAjaxError
    });

    function deleteMessageSuccess(res) {
        showInfo('Message deleted.');
        loadArchive();
    }
}

function sendMessage(event) {
    event.preventDefault();
    if (sessionStorage.getItem('name') === undefined) {
        sessionStorage.setItem('name', null);
    }
    //console.log('message to be sent')
    // POST https://baas.kinvey.com/appdata/app_id/messages
    let messageData = {
        "sender_username": sessionStorage.getItem('username'),
        "sender_name": sessionStorage.getItem('name'),
        "recipient_username": $('#msgRecipientUsername').find(':selected')[0].value,
        "text": $('#msgText').val()
    }
    //console.log('message to be sent 2')
    //console.log(messageData)
    $.ajax({
        method: 'POST',
        url: `https://baas.kinvey.com/appdata/${APP_KEY}/messages`,
        headers: {
            'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken'),
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(messageData),
        success: sendMessageSuccess,
        error: handleAjaxError
    });

    function sendMessageSuccess(res) {
        showInfo('Message sent.');
        loadArchive();
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

function formatSender(name, username) {
    if (!name)
        return username;
    else
        return username + ' (' + name + ')';
}

// Helper functions --- END -----------------------------------------------
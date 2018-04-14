// constants of the application
const BASE_URL = `https://baas.kinvey.com/`;
const APP_KEY = 'kid_HyehbpTiM';
const APP_SECRET = 'bf5896bb7d974f368218c9f435581a92';
const AUTH_HEADERS = {
    'Authorization': 'Basic ' + btoa(APP_KEY + ':' + APP_SECRET)
};

// Session functionality (logout, login, register, etc.)
function registerUser(event) {
    $('#errorBox').hide();
    event.preventDefault();
    let username = $('#registerForm input[name=username]');
    let password = $('#registerForm input[name=password]');
    let repeatPassword = $('#registerForm input[name=repeatPass]');
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
        A username should be at least 3 characters long and should contain only english alphabet letters. 
        A user‘s password should be at least 6 characters long 
        and should contain only english alphabet letters and digits. `);
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
        loadHeader();
        listPosts();
        showInfo('User registration successful.');
        // clear form for next user
        $('#registerForm input[name=username]').val('');
        $('#registerForm input[name=password]').val('');
        $('#registerForm input[name=repeatPass]').val('');
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
        loadHeader();
        loadHome();
        showInfo('User log out successful.');
    }
}

function loginUser(event) {
    $('#errorBox').hide();
    event.preventDefault();
    let username = $('#loginForm input[name=username]');
    let password = $('#loginForm input[name=password]');

    // validation
    if (username.val() === '' || password.val() === '') {
        showError("Username and password cannot be empty. Please fill out both fields.");
        return;
    }

    if (!validCredentials(username.val(), password.val())) {
        showError(`Invalid username or password. 
        A username is at least 3 characters long and should contain only english alphabet letters. 
        A user‘s password is at least 6 characters long 
        and contains only english alphabet letters and digits. `);
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
        loadHeader();
        listPosts();
        showInfo('User log in successful.');
        // clear form for next user
        $('#loginForm input[name=username]').val('');
        $('#loginForm input[name=password]').val('');
    }
}

function listPosts() {
    // GET -> BASE_URL + 'appdata/' + APP_KEY + '/posts'
    $.ajax({
        url: BASE_URL + 'appdata/' + APP_KEY + '/posts',
        headers: {
            'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
        },
        success: loadPostsSuccess,
        error: handleAjaxError
    });

    async function loadPostsSuccess(posts) {
        //showInfo('Posts loaded.');
        //posts.length = 0; // just to test the else in the posts-list template
        let counter = 0;
        for (const post of posts) {
            post.rank = ++counter;
            post.time = calcTime(post._kmd.ect);
            post.isEditablePost = false;
            if (post._acl.creator == sessionStorage.getItem('userId')) {
                // Bind the event handler with the current post
                post.isEditablePost = true;
            }
        }
        let context = {
            posts,
            user: {
                isAuthenticated: sessionStorage.getItem('authToken') !== null
            }
        };
        //console.log('Before request to get partial source');
        // BE CAREFUL TO NOT HAVE AD BLOCK ON BROWSER OTHERWISE WILL GET BLOCKED BY CLIENT ERROR
        let sourcePost = await $.get('./templates/post-partial.hbs');
        Handlebars.registerPartial('post', sourcePost);
        await containerFiller(context, './templates/posts-list.hbs', '.content');
    }
}

function createPost(event) {
    event.preventDefault();
    const kinveyUserUrl = `${BASE_URL}user/${APP_KEY}/${sessionStorage.getItem('userId')}`;
    // When create an advertisement the current logged user should be it’s publisher. 
    // We can do it by making one request to the database (by user’s “_id” property)
    // and retrieve the whole user information
    $.ajax({
        url: kinveyUserUrl,
        headers: {
            'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
        },
        success: afterPublisherRequest,
        error: handleAjaxError
    });

    function afterPublisherRequest(publisher) {
        // parsing the information from the form and sending another request
        // – this time to save our post in database. (below)
        
        let url = $('#submitForm input[name=url]');
        let title = $('#submitForm input[name=title]');
        let imageUrl = $('#submitForm input[name=image]');
        let description = $('#submitForm textarea[name=comment]');
        // if we do not have description or imageURL we allow the add to be generated, but not without the other
        if (!title.val() || !url.val()) {
            showError('Cannot create post without URL and title.');
            return;
        }
        // also link url should always start with “http”. 
        // TO DO

        let postData = {
            author: publisher.username,
            url: url.val(),
            title: title.val(),
            imageUrl: imageUrl.val(),
            description: description.val(),
        };
        // save post in database
        // POST -> BASE_URL + 'appdata/' + APP_KEY + '/posts'
        $.ajax({
            method: 'POST',
            url: BASE_URL + 'appdata/' + APP_KEY + '/posts',
            headers: {
                'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
            },
            data: postData,
            success: createPostSuccess,
            error: handleAjaxError
        });

        function createPostSuccess(response) {
            $('#errorBox').hide();
            //$('#submitForm').trigger('clear');
            listPosts(); //or leave it commented so user can add yet another ad
            showInfo('Post created.');
        }
    }
}

async function editPost(idOfPostToEdit) {
    // Step 1. GET -> BASE_URL + 'appdata/' + APP_KEY + '/posts/' + postIdToEdit lets an app retrieve 
    // a previously created entity.
    //console.log(idOfPostToEdit);
    await loadEditPost();
     // Step 1
     $.ajax({
        url:  BASE_URL + 'appdata/' + APP_KEY + '/posts/' + idOfPostToEdit,
        headers: {
            'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
        },
        success: retrievePostToEditSuccess,
        error: handleAjaxError
    });

    async function retrievePostToEditSuccess(post) {
        //console.log(post);
        let url = $('#submitForm input[name=url]');
        let title = $('#submitForm input[name=title]');
        let imageUrl = $('#submitForm input[name=image]');
        let description = $('#submitForm textarea[name=comment]');
        $('#submitForm').attr('postId', post._id);
        $('#submitForm').attr('author', post.author);
        url.val(post.url);
        title.val(post.title);
        imageUrl.val(post.imageUrl);
        description.val(post.description);
        // when we click on EDIT POST we have already atteched a click event to EDIT POST button so we will
        // be redirected to below function editAdvert()
    }
}

// we only get the ID so fist we get the post by it's ID and then we fill out the form 
// with the data then we modify the add and then save again to database
// Step 2. PUT -> BASE_URL + 'appdata/' + APP_KEY + '/posts/' + postIdToEdit
function uploadEditedPost(event) {
    event.preventDefault();
    let url = $('#submitForm input[name=url]');
    let title = $('#submitForm input[name=title]');
    let imageUrl = $('#submitForm input[name=image]');
    let description = $('#submitForm textarea[name=comment]');
    let postId = $('#submitForm').attr('postId');
    let author = $('#submitForm').attr('author');
    // console.log(postId);
    // console.log(author);
    
    // if we do not have description or imageURL we allow the add to be generated, but not without the other
    if (!title.val() || !url.val()) {
        showError('Cannot create post without URL and title.');
        return;
    }
    // also link url should always start with “http”. 
    // TO DO

    $('#errorBox').hide();
    let postData = {
        author: author,
        url: url.val(),
        title: title.val(),
        imageUrl: imageUrl.val(),
        description: description.val(),
    };
    $.ajax({
        method: 'PUT',
        url: BASE_URL + 'appdata/' + APP_KEY + '/posts/' + postId /*$('#formEditAd input[name=id]').val()*/,
        headers: {
            'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken'),
            //'Content-Type': 'application/json'
        },
        data: postData,
        success: editPostSuccess,
        error: handleAjaxError
    });

    function editPostSuccess(response) {
        listPosts();
        showInfo('Post edited.')
    }
}

function deletePost(postIdToDelete) {
    // DELETE -> BASE_URL + 'appdata/' + APP_KEY + '/posts/' + postIdToDelete
    $.ajax({
        method: 'DELETE',
        url: BASE_URL + 'appdata/' + APP_KEY + '/posts/' + postIdToDelete,
        headers: {
            'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
        },
        success: deletePostSuccess,
        error: handleAjaxError
    });

    function deletePostSuccess(response) {
        listPosts();
        showInfo('Post deleted.');
    }
}

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
    setTimeout(function() {
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
    const regexUsername = /^[a-zA-Z]{3,}$/gm;
    const regexPasword = /^[a-zA-Z0-9]{6,}$/gm;
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

// HTML escaping
function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}
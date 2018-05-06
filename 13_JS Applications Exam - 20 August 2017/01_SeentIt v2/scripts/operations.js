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
    event.preventDefault(); // not needed just in case
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
        showInfo('User registration successful.');
        listPosts();
        // clear form for next user
        $('#registerForm').trigger('reset');
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
        showInfo('User log in successful.');
        listPosts();
        // clear form for next user
        $('#loginForm').trigger('reset');
    }
}

function listPosts() {
    // List all Posts (Catalog – sorted by post time, descending)
    // GET https://baas.kinvey.com/appdata/app_id/posts?query={}&sort={"_kmd.ect": -1}
    $.ajax({
        url: `https://baas.kinvey.com/appdata/${APP_KEY}/posts?query={}&sort={"_kmd.ect": -1}`,
        headers: {
            'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
        },
        success: loadPostsSuccess,
        error: handleAjaxError
    });

    async function loadPostsSuccess(postsArray) {
        //console.log(postsArray);
        let posts = postsArray;
        for (let i = 0; i < postsArray.length; i++) {
            const post = postsArray[i];
            post.rank = i + 1;
            post.timeSinceSubmit = calcTime(post._kmd.ect);
            post.isEditable = false;
            if (post._acl.creator === sessionStorage.getItem('userId')) {
                post.isEditable = true;
            }
        }
        let context = {
            user: {
                isAuthenticated: sessionStorage.getItem('authToken') !== null,
                username: sessionStorage.getItem('username')
            },
            posts
        };
        await containerFiller(context, './templates/catalogue.hbs', '#container')
    }
}

function createPost(event) {
    event.preventDefault();
    //console.log('createPost() TO DO');
    let urlBox = $('#submitForm').find('input[name=url]');
    let titleBox = $('#submitForm').find('input[name=title]');
    let imageUrlBox = $('#submitForm').find('input[name=image]');
    let commentTextAreaBox = $('#submitForm').find('textarea[name=comment]');
    // if we do not have description or imageURL we allow the post to be generated, but not without the other fields
        if (!titleBox.val() || !urlBox.val()) {
            showError('Cannot create post without URL and title.');
            return;
        }

        if (urlBox.val() === '' || urlBox.val() === '') {
            showError('Cannot create post with empty URL and/or title.');
            return;
        }

        // also link url should always start with “http”.
        const regex = /^http.*$/;
        if (!regex.test(urlBox.val())) {
            showError('Link URL should always start with “http”.')
            return;
        }

        let postData = {
            "author": sessionStorage.getItem('username'),
            "title": escapeHtml(titleBox.val()),
            "description": escapeHtml(commentTextAreaBox.val()),
            "url": urlBox.val(),
            "imageUrl": imageUrlBox.val()
        }
        // console.log('postData');
        // console.log(postData);

        // POST https://baas.kinvey.com/appdata/app_id/posts
        $.ajax({
            method: 'POST',
            url: `https://baas.kinvey.com/appdata/${APP_KEY}/posts`,
            headers: {
                'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken'),
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(postData),
            success: createPostSuccess,
            error: handleAjaxError
        });

        function createPostSuccess(response) {
            showInfo('Post created.');
            listPosts();
            // Clear all input fields after successful creation.
            $('#submitForm').trigger('reset');
        }
}

function editPost(event) {
    event.preventDefault();
    //console.log('createPost() TO DO');
    let urlBox = $('#editPostForm').find('input[name=url]');
    let titleBox = $('#editPostForm').find('input[name=title]');
    let imageUrlBox = $('#editPostForm').find('input[name=image]');
    let commentTextAreaBox = $('#editPostForm').find('textarea[name=description]');
    // if we do not have description or imageURL we allow the post to be generated, but not without the other fields
    if (!titleBox.val() || !urlBox.val()) {
        showError('Cannot create post without URL and title.');
        return;
    }

    if (urlBox.val() === '' || urlBox.val() === '') {
        showError('Cannot create post with empty URL and/or title.');
        return;
    }

    // also link url should always start with “http”.
    const regex = /^http.*$/;
    if (!regex.test(urlBox.val())) {
        showError('Link URL should always start with “http”.')
        return;
    }

    let postData = {
        "author": sessionStorage.getItem('username'),
        "title": escapeHtml(titleBox.val()),
        "description": escapeHtml(commentTextAreaBox.val()),
        "url": urlBox.val(),
        "imageUrl": imageUrlBox.val()
    }
    // console.log('postData');
    // console.log(postData);

    // PUT https://baas.kinvey.com/appdata/app_id/posts/post_id
    let postId = $('#editPostForm').attr('data-id');
    // console.log('postId >> ');
    // console.log(postId);
    
    $.ajax({
        method: 'PUT',
        url: `https://baas.kinvey.com/appdata/${APP_KEY}/posts/${postId}`,
        headers: {
            'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken'),
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(postData),
        success: updatePostSuccess,
        error: handleAjaxError
    });

    function updatePostSuccess(response) {
        // console.log('response:');
        // console.log(response);
        showInfo(`Post ${response.title} updated.`);
        listPosts();
        // Clear all input fields after successful update.
        $('#editPostForm').trigger('reset');
    }
}

function deletePost(postIdToDelete) {
    //DELETE https://baas.kinvey.com/appdata/app_id/posts/post_id 
    $.ajax({
        method: 'DELETE',
        url: `https://baas.kinvey.com/appdata/${APP_KEY}/posts/${postIdToDelete}`,
        headers: {
            'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken'),
        },
        success: deletePostSuccess,
        error: handleAjaxError
    });

    function deletePostSuccess(response) {
        showInfo('Post deleted.');
        listPosts();
    }
}

function addComment(event) { // FOR SOME REASON YET UNKNOWN TO ME FOR SURE, WHEN I USE createComment
// for this function's name it does not work, it brakes the program
    //console.log('stage 1');
    event.preventDefault();
    //console.log('stage 2');
    let currentlyLoggedInUser = sessionStorage.getItem('username');

    let commentBox = $('#commentForm').find('textarea[name=content]');

    if (commentBox.val() === '') {
        showError('Cannot create an empty comment.');
        return;
    }

    let commentForm = $('#commentForm');

    let commentData = {
        "postId": commentForm.attr('data-id'),
        "content": escapeHtml(commentBox.val()),
        "author": currentlyLoggedInUser
    };

    // POST https://baas.kinvey.com/appdata/app_id/comments
    $.ajax({
        method: 'POST',
        url: `https://baas.kinvey.com/appdata/${APP_KEY}/comments`,
         headers: {
            'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken'),
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(commentData),
        success: createCommentSuccess,
        error: handleAjaxError
    });

    function createCommentSuccess(response) {
        showInfo('Comment created.');
        loadDetailsOfPost(commentForm.attr('data-id'));
        // Clear the input field after successful creation.
        commentForm.trigger('reset');
    }
}

function deleteComment(commentIdToDelete) {
    //console.log('deleteComment() TO DO');
    // DELETE https://baas.kinvey.com/appdata/app_id/comments/comment_id
    $.ajax({
        method: 'DELETE',
        url: `https://baas.kinvey.com/appdata/${APP_KEY}/comments/${commentIdToDelete}`,
         headers: {
            'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken'),
        },
        success: deleteCommentSuccess,
        error: handleAjaxError
    });

    function deleteCommentSuccess(response) {
        showInfo('Comment deleted.');
        loadDetailsOfPost($('#commentForm').attr('data-id'));
    }
}
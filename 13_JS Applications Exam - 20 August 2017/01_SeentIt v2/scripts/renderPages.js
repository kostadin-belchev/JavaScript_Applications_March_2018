async function containerFiller(context, templateURL, container) {
    let source = await $.get(templateURL);
    let compiled = Handlebars.compile(source);
    let template = compiled(context);
    //console.log(template);
    $(container).html(template);
}

async function loadHome() {
    let context = {
        user: {
            isAuthenticated: sessionStorage.getItem('authToken') !== null,
            username: sessionStorage.getItem('username')
        }
    };
    let sourceHeader = await $.get('./templates/header-partial.hbs');
    Handlebars.registerPartial('header', sourceHeader);
    let sourceFooter = await $.get('./templates/footer-partial.hbs');
    Handlebars.registerPartial('footer', sourceFooter);
    let sourceNavigation = await $.get('./templates/navigation-partial.hbs');
    Handlebars.registerPartial('navigation', sourceNavigation);
    let sourcePost = await $.get('./templates/post-partial.hbs');
    Handlebars.registerPartial('post', sourcePost);
    await containerFiller(context, './templates/login-register-home.hbs', '#container');
}

async function loadCreatePost() {
    let context = {
        user: {
            isAuthenticated: sessionStorage.getItem('authToken') !== null,
            username: sessionStorage.getItem('username')
        }
    };
    await containerFiller(context, './templates/create-post.hbs', '#container');
}

function loadEditPost(idOfPostToEdit) {
    // console.log('idOfPostToEdit:');
    // console.log(idOfPostToEdit);
    // GET https://baas.kinvey.com/appdata/app_id/posts/post_id
     $.ajax({
        method: 'GET',
        url: `https://baas.kinvey.com/appdata/${APP_KEY}/posts/${idOfPostToEdit}`,
        headers: {
            'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken'),
        },
        success: loadPostToEditSuccess,
        error: handleAjaxError
    });

    async function loadPostToEditSuccess(post) {
        // console.log('post:');
        // console.log(post);
        let context = {
            user: {
                isAuthenticated: sessionStorage.getItem('authToken') !== null,
                username: sessionStorage.getItem('username')
            },
            post
        };
        await containerFiller(context, './templates/edit-post.hbs', '#container');
    }
}

function loadMyPosts() {
    // GET https://baas.kinvey.com/appdata/app_id/posts?query={"author":"username"}&sort={"_kmd.ect": -1}
    let currentlyLoggedInUser = sessionStorage.getItem('username');
    $.ajax({
        method: 'GET',
        url: `https://baas.kinvey.com/appdata/${APP_KEY}/posts?query={"author":"${currentlyLoggedInUser}"}&sort={"_kmd.ect": -1}`,
        headers: {
            'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken'),
        },
        success: loadMyPostsSuccess,
        error: handleAjaxError
    });

    async function loadMyPostsSuccess(postsArray) {
        let posts = postsArray;
        for (const post of posts) { // this is so we can use the post partial already created
            post.isEditable = true;
        }
        let context = {
            user: {
                isAuthenticated: sessionStorage.getItem('authToken') !== null,
                username: sessionStorage.getItem('username')
            },
            posts
        };
        await containerFiller(context, './templates/my-posts.hbs', '#container');
    }
}

function loadDetailsOfPost(postIdToLoadDetailsOf) {
    // GET https://baas.kinvey.com/appdata/app_id/posts/post_id
     $.ajax({
        method: 'GET',
        url: `https://baas.kinvey.com/appdata/${APP_KEY}/posts/${postIdToLoadDetailsOf}`,
        headers: {
            'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken'),
        },
        success: loadPostDetailsSuccess,
        error: handleAjaxError
    });

    async function loadPostDetailsSuccess(post) {
        // Get comments or the given post
        // GET https://baas.kinvey.com/appdata/app_id/comments?query={"postId":"post_id"}&sort={"_kmd.ect": -1}
        $.ajax({
            url: `https://baas.kinvey.com/appdata/${APP_KEY}/comments?query={"postId":"${post._id}"}&sort={"_kmd.ect": -1}`,
            headers: {
                'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken'),
            },
            success: loadPostCommentsSuccess,
            error: handleAjaxError
        });

        async function loadPostCommentsSuccess(comments) {
            for (const comment of comments) {
                comment.timeSinceSubmit = calcTime(comment._kmd.ect);
                comment.isDeletable = false;
                if (comment._acl.creator === sessionStorage.getItem('userId')) {
                    comment.isDeletable = true;
                }
            }
            post.timeSinceSubmit = calcTime(post._kmd.ect);
            post.isEditable = false;
            if (post._acl.creator === sessionStorage.getItem('userId')) {
                post.isEditable = true;
            }
            let context = {
                user: {
                    isAuthenticated: sessionStorage.getItem('authToken') !== null,
                    username: sessionStorage.getItem('username')
                },
                post,
                comments
            };
            let commentSource = await $.get('./templates/comment-partial.hbs');
            Handlebars.registerPartial('comment', commentSource);
            await containerFiller(context, './templates/view-details.hbs', '#container');
        }
    }
}
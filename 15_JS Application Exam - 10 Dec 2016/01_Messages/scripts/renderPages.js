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
    let sourceNotifications = await $.get('./templates/notifications-partial.hbs');
    Handlebars.registerPartial('notifications', sourceNotifications);
    let sourceFooter = await $.get('./templates/footer-partial.hbs');
    Handlebars.registerPartial('footer', sourceFooter);
    await containerFiller(context, './templates/home.hbs', '#app')
}

async function loadRegister() {
    let context = {
        user: {
            isAuthenticated: sessionStorage.getItem('authToken') !== null,
            username: sessionStorage.getItem('username')
        }
    };
    await containerFiller(context, './templates/register.hbs', '#app');
}

async function loadLoginUser() {
    let context = {
        user: {
            isAuthenticated: sessionStorage.getItem('authToken') !== null,
            username: sessionStorage.getItem('username')
        }
    };
    await containerFiller(context, './templates/login.hbs', '#app');
}

async function loadHomeLogged() {
    let context = {
        // Ensure you handle properly all HTML special characters, e.g. the username could be "<peter><br>".
        user: {
            isAuthenticated: sessionStorage.getItem('authToken') !== null,
            username: sessionStorage.getItem('username')
        }
    };
    await containerFiller(context, './templates/home-logged.hbs', '#app');
}

async function loadSendMessage() {
    // Before the “send message” form is shown, it should first load all users
    // from the back-end and display them into the drop-down list of recipients.
    // GET https://baas.kinvey.com/user/app_id/
    $.ajax({
        url: `https://baas.kinvey.com/user/${APP_KEY}/`,
        headers: {
            'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken'),
        },
        success: usersLoadedSuccess,
        error: handleAjaxError
    });

    async function usersLoadedSuccess(users) {
        //console.log(users);
        for (const user of users) {
            user.formattedName = formatSender(user.name, user.username)
        }
        let context = {
            user: {
                isAuthenticated: sessionStorage.getItem('authToken') !== null,
                username: sessionStorage.getItem('username')
            },
            users
        };
        await containerFiller(context, './templates/send-message.hbs', '#app');
    }
}
async function containerFiller(context, templateURL, container) {
    let source = await $.get(templateURL);
    let compiled = Handlebars.compile(source);
    let template = compiled(context);
    //console.log(template);
    $(container).html(template);
}

async function loadHeader() {
    let context = {
        user: {
            isAuthenticated: sessionStorage.getItem('authToken') !== null,
            username: sessionStorage.getItem('username')
        }
    };
    await containerFiller(context, './templates/header.hbs', 'header')
}

async function loadHome() {
    let context = {
        user: {
            isAuthenticated: sessionStorage.getItem('authToken') !== null,
        }
    };
    let source = await $.get('./templates/navigation-partial.hbs');
    Handlebars.registerPartial('navigationBar', source);
    await containerFiller(context, './templates/home.hbs', '.content');
}

async function loadCreatePost() {
    let context = {
        formHeading:'Submit Link Post',
        functionToExec:'createPost',
        buttonText: 'Submit'
    };
    await containerFiller(context, './templates/create-edit-post.hbs', '.content');
}

async function loadEditPost() {
    let context = {
        formHeading:'Edit Link Post',
        functionToExec:'uploadEditedPost',
        buttonText: 'Edit Post'
    };
    await containerFiller(context, './templates/create-edit-post.hbs', '.content');
}
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
    await containerFiller(context, './templates/login-register-home.hbs', '#container')
}

// async function loadEditor() {
//     let context = {
//         user: {
//             isAuthenticated: sessionStorage.getItem('authToken') !== null,
//             username: sessionStorage.getItem('username')
//         }
//     };
//     // let source = await $.get('./templates/navigation-partial.hbs');
//     // Handlebars.registerPartial('navigationBar', source);
//     await containerFiller(context, './templates/create-receipt.hbs', '#container');
//     await loadCurrentActiveReceipt();
// }

// async function loadCreatePost() {
//     let context = {
//         formHeading:'Submit Link Post',
//         functionToExec:'createPost',
//         buttonText: 'Submit'
//     };
//     await containerFiller(context, './templates/create-edit-post.hbs', '.content');
// }

// async function loadEditPost() {
//     let context = {
//         formHeading:'Edit Link Post',
//         functionToExec:'uploadEditedPost',
//         buttonText: 'Edit Post'
//     };
//     await containerFiller(context, './templates/create-edit-post.hbs', '.content');
// }